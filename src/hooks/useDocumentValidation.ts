import { useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";

export type ValidationStatus = "idle" | "validating" | "valid" | "invalid";

export interface ValidationResult {
  status: ValidationStatus;
  message: string;
  observations: string[];
  extractedData?: {
    cedula: string;
    placa: string;
    nombre: string;
  };
}

interface FormDataForValidation {
  cedula?: string;
  nombre?: string;
  apellido?: string;
  placa?: string;
  razon_social?: string;
}

const DOCUMENT_TYPE_MAP: Record<string, string> = {
  docIdentidad: "cedula_identidad",
  docOrigenVehiculo: "certificado_origen",
  docFacturaCompra: "factura_compra",
  docTituloPropiedad: "titulo_propiedad",
  docLicenciaConducir: "licencia_conducir",
  docCertificadoMedico: "certificado_medico",
  docRIF: "rif",
  // Juridical company documents
  docActaAsamblea: "acta_asamblea",
  docActaConstitutiva: "acta_constitutiva",
  docDeclaracionISLR: "declaracion_islr",
  docReferenciaBancaria: "referencia_bancaria",
  docCedulaAccionistas: "cedula_accionistas",
  docRIFAccionistas: "rif_accionistas",
  docRIFEmpresa: "rif_empresa",
};

// Documents that require cross-validation with form data when present
const CROSS_VALIDATED_DOCUMENTS = [
  "docIdentidad",
  "docOrigenVehiculo",
  "docFacturaCompra",
  "docTituloPropiedad",
  "docRIFEmpresa",
  "docDeclaracionISLR",
  "docReferenciaBancaria",
];

async function resizeImageToBase64(file: File, maxSize = 1024): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;

      // For PDFs, just return the base64 without resize
      if (file.type === "application/pdf") {
        const base64 = result.split(",")[1];
        resolve(base64);
        return;
      }

      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement("canvas");
        let { width, height } = img;

        if (width > maxSize || height > maxSize) {
          if (width > height) {
            height = (height / width) * maxSize;
            width = maxSize;
          } else {
            width = (width / height) * maxSize;
            height = maxSize;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d")!;
        ctx.drawImage(img, 0, 0, width, height);
        const dataUrl = canvas.toDataURL("image/jpeg", 0.8);
        const base64 = dataUrl.split(",")[1];
        resolve(base64);
      };
      img.onerror = reject;
      img.src = result;
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

/**
 * Decide si OMITIR la validación de documentos con IA, según admin_settings:
 * - "produccion": NUNCA se omite (siempre valida).
 * - "desarrollo": se omite por defecto, SALVO que `validar_docs_ia_dev` = "true"
 *   (para poder testear el flujo completo con validación a propósito).
 * Ante cualquier error de lectura, NO se omite (valida = lo seguro).
 */
async function shouldSkipDocValidation(): Promise<boolean> {
  try {
    const { data } = await supabase
      .from("admin_settings")
      .select("key, value")
      .in("key", ["modo_sistema", "validar_docs_ia_dev"]);
    const map: Record<string, string> = {};
    for (const r of data ?? []) map[r.key] = (r.value ?? "").toLowerCase();
    const modo = map["modo_sistema"] || "produccion";
    if (modo !== "desarrollo") return false; // producción: siempre valida
    return map["validar_docs_ia_dev"] !== "true"; // desarrollo: omite salvo que se active
  } catch {
    return false;
  }
}

export function useDocumentValidation() {
  const [validations, setValidations] = useState<Record<string, ValidationResult>>({});

  const validateDocument = useCallback(
    async (docKey: string, file: File, formData: FormDataForValidation) => {
      // Modo desarrollo (sin validación IA activada): aceptar cualquier documento.
      if (await shouldSkipDocValidation()) {
        setValidations((prev) => ({
          ...prev,
          [docKey]: {
            status: "valid",
            message: "Validación omitida (modo desarrollo)",
            observations: [],
          },
        }));
        return;
      }

      const documentType = DOCUMENT_TYPE_MAP[docKey];
      if (!documentType) {
        // For documents without AI validation (empresa docs), mark as valid
        setValidations((prev) => ({
          ...prev,
          [docKey]: {
            status: "valid",
            message: "Documento cargado",
            observations: [],
          },
        }));
        return;
      }

      // For documents in the cross-validated list, also check form data match
      const isCritical = CROSS_VALIDATED_DOCUMENTS.includes(docKey);

      setValidations((prev) => ({
        ...prev,
        [docKey]: {
          status: "validating",
          message: "Validando documento...",
          observations: [],
        },
      }));

      try {
        const base64 = await resizeImageToBase64(file);

        const { data, error } = await supabase.functions.invoke("validate-document", {
          body: {
            image_base64: base64,
            document_type: documentType,
            form_data: isCritical ? formData : undefined,
          },
        });

        if (error) {
          console.error("Validation error:", error);
          setValidations((prev) => ({
            ...prev,
            [docKey]: {
              status: "invalid",
              message: "Error al validar el documento. Intente de nuevo.",
              observations: [error.message || "Error de conexión"],
            },
          }));
          return;
        }

        if (data?.error) {
          setValidations((prev) => ({
            ...prev,
            [docKey]: {
              status: "invalid",
              message: data.error,
              observations: [],
            },
          }));
          return;
        }

        const isValid = isCritical
          ? data.is_valid_document && data.matches_form_data
          : data.is_valid_document;

        let message = "";
        if (!data.is_valid_document) {
          message = `El documento cargado no corresponde a ${getDocumentLabel(docKey)}`;
        } else if (isCritical && !data.matches_form_data) {
          message = "Los datos del documento no coinciden con la información ingresada";
        } else {
          message = "Documento verificado correctamente ✓";
        }

        setValidations((prev) => ({
          ...prev,
          [docKey]: {
            status: isValid ? "valid" : "invalid",
            message,
            observations: data.observations || [],
            extractedData: {
              cedula: data.extracted_cedula || "",
              placa: data.extracted_placa || "",
              nombre: data.extracted_nombre || "",
            },
          },
        }));
      } catch (err) {
        console.error("Document validation error:", err);
        setValidations((prev) => ({
          ...prev,
          [docKey]: {
            status: "invalid",
            message: "Error inesperado al validar. Intente de nuevo.",
            observations: [],
          },
        }));
      }
    },
    []
  );

  const clearValidation = useCallback((docKey: string) => {
    setValidations((prev) => {
      const next = { ...prev };
      delete next[docKey];
      return next;
    });
  }, []);

  const getValidation = useCallback(
    (docKey: string): ValidationResult => {
      return (
        validations[docKey] || {
          status: "idle",
          message: "",
          observations: [],
        }
      );
    },
    [validations]
  );

  const allCriticalDocsValid = useCallback((): boolean => {
    // All cross-validated documents that were actually uploaded must be valid
    return CROSS_VALIDATED_DOCUMENTS.every((key) => {
      const v = validations[key];
      // If not uploaded (no validation entry), skip; if uploaded, must be valid
      return !v || v.status === "valid";
    });
  }, [validations]);

  const hasAnyValidating = useCallback((): boolean => {
    return Object.values(validations).some((v) => v.status === "validating");
  }, [validations]);

  const hasAnyInvalid = useCallback((): boolean => {
    return Object.values(validations).some((v) => v.status === "invalid");
  }, [validations]);

  return {
    validateDocument,
    clearValidation,
    getValidation,
    allCriticalDocsValid,
    hasAnyValidating,
    hasAnyInvalid,
    validations,
  };
}

function getDocumentLabel(docKey: string): string {
  const labels: Record<string, string> = {
    docIdentidad: "una cédula de identidad",
    docOrigenVehiculo: "un certificado de origen de vehículo",
    docFacturaCompra: "una factura de compra",
    docTituloPropiedad: "un título de propiedad de vehículo",
    docLicenciaConducir: "una licencia de conducir",
    docCertificadoMedico: "un certificado médico",
    docRIF: "un RIF",
    docActaAsamblea: "un acta de asamblea",
    docActaConstitutiva: "un acta constitutiva o registro mercantil",
    docDeclaracionISLR: "una declaración de ISLR",
    docReferenciaBancaria: "una referencia bancaria",
    docCedulaAccionistas: "una cédula de accionistas",
    docRIFAccionistas: "un RIF de accionistas",
    docRIFEmpresa: "un RIF de empresa",
  };
  return labels[docKey] || "el documento esperado";
}
