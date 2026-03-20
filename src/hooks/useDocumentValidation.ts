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
  docLicenciaConducir: "licencia_conducir",
  docCertificadoMedico: "certificado_medico",
  docRIF: "rif",
};

// Documents that require cross-validation with form data
const CRITICAL_DOCUMENTS = ["docIdentidad", "docOrigenVehiculo", "docFacturaCompra"];

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

export function useDocumentValidation() {
  const [validations, setValidations] = useState<Record<string, ValidationResult>>({});

  const validateDocument = useCallback(
    async (docKey: string, file: File, formData: FormDataForValidation) => {
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

      // For non-critical documents, still validate document type but skip form data cross-check
      const isCritical = CRITICAL_DOCUMENTS.includes(docKey);

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
    return CRITICAL_DOCUMENTS.every((key) => {
      const v = validations[key];
      return v && v.status === "valid";
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
    docLicenciaConducir: "una licencia de conducir",
    docCertificadoMedico: "un certificado médico",
    docRIF: "un RIF",
  };
  return labels[docKey] || "el documento esperado";
}
