import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

// Each document type defines its prompt AND which fields to validate
const DOCUMENT_CONFIG: Record<string, { prompt: string; validFields: string[] }> = {
  cedula_identidad: {
    prompt: `Analiza esta imagen de un documento de identidad venezolano (cédula de identidad).
Extrae el número de cédula (solo dígitos, sin prefijo V- o E-) y el nombre completo de la persona.
Si NO es una cédula de identidad válida, indica que no es válida.`,
    validFields: ["cedula", "nombre"],
  },
  certificado_origen: {
    prompt: `Analiza esta imagen de un Certificado de Origen de un vehículo venezolano (emitido por el INTT o similar).
Extrae la placa del vehículo que aparece en el documento y el nombre del propietario/comprador.
Si NO es un certificado de origen de vehículo, indica que no es válido.`,
    validFields: ["placa", "nombre"],
  },
  factura_compra: {
    prompt: `Analiza esta imagen de una factura de compra de un vehículo.
Extrae el nombre del comprador, su número de cédula (solo dígitos) y la placa del vehículo si aparece.
Si NO es una factura de compra, indica que no es válida.`,
    validFields: ["cedula", "nombre", "placa"],
  },
  titulo_propiedad: {
    prompt: `Analiza esta imagen de un Título de Propiedad de un vehículo venezolano (emitido por el INTT).
Extrae la placa del vehículo y el nombre del propietario, así como su número de cédula o RIF (solo dígitos, sin prefijo) si aparece.
Si NO es un Título de Propiedad de vehículo, indica que no es válido.`,
    validFields: ["cedula", "nombre", "placa"],
  },
  licencia_conducir: {
    prompt: `Analiza esta imagen. Determina si es una licencia de conducir válida venezolana.
Si NO es una licencia de conducir, indica que no es válida.`,
    validFields: [],
  },
  certificado_medico: {
    prompt: `Analiza esta imagen. Determina si es un certificado médico válido.
Si NO es un certificado médico o documento médico, indica que no es válido.`,
    validFields: [],
  },
  rif: {
    prompt: `Analiza esta imagen. Determina si es un RIF (Registro de Información Fiscal) venezolano válido.
Si NO es un RIF, indica que no es válido.`,
    validFields: [],
  },
  acta_asamblea: {
    prompt: `Analiza esta imagen. Determina si es un Acta de Asamblea de una empresa.
Si NO es un acta de asamblea o documento societario, indica que no es válido.`,
    validFields: [],
  },
  acta_constitutiva: {
    prompt: `Analiza esta imagen. Determina si es un Acta Constitutiva o Registro Mercantil de una empresa.
Si NO es un acta constitutiva o registro mercantil, indica que no es válido.`,
    validFields: [],
  },
  declaracion_islr: {
    prompt: `Analiza esta imagen. Determina si es una Declaración de Impuesto Sobre la Renta (ISLR) o su certificado/planilla.
Si NO es una declaración de ISLR o documento fiscal relacionado, indica que no es válido.`,
    validFields: [],
  },
  referencia_bancaria: {
    prompt: `Analiza esta imagen. Determina si es una Referencia Bancaria emitida por una institución financiera.
Si NO es una referencia bancaria, indica que no es válida.`,
    validFields: [],
  },
  cedula_accionistas: {
    prompt: `Analiza esta imagen. Determina si es una cédula de identidad venezolana (puede ser de un accionista).
Si NO es una cédula de identidad válida, indica que no es válida.`,
    validFields: [],
  },
  rif_accionistas: {
    prompt: `Analiza esta imagen. Determina si es un RIF (Registro de Información Fiscal) venezolano válido.
Si NO es un RIF, indica que no es válido.`,
    validFields: [],
  },
  rif_empresa: {
    prompt: `Analiza esta imagen. Determina si es un RIF (Registro de Información Fiscal) de una empresa venezolana.
Si NO es un RIF empresarial, indica que no es válido.`,
    validFields: [],
  },
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { image_base64, document_type, form_data } = await req.json();

    if (!image_base64 || !document_type) {
      return new Response(
        JSON.stringify({ error: "image_base64 and document_type are required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      return new Response(
        JSON.stringify({ error: "LOVABLE_API_KEY not configured" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const config = DOCUMENT_CONFIG[document_type];
    const basePrompt = config?.prompt || "Analiza este documento e identifica su tipo y contenido.";
    const validFields = config?.validFields || [];

    let contextPrompt = "";
    if (form_data) {
      if (form_data.cedula && validFields.includes("cedula")) {
        contextPrompt += `\nDatos del formulario - Cédula del titular: ${form_data.cedula}`;
      }
      if (form_data.nombre && validFields.includes("nombre")) {
        contextPrompt += `\nDatos del formulario - Nombre del titular: ${form_data.nombre}`;
      }
      if (form_data.apellido && validFields.includes("nombre")) {
        contextPrompt += `\nDatos del formulario - Apellido del titular: ${form_data.apellido}`;
      }
      if (form_data.placa && validFields.includes("placa")) {
        contextPrompt += `\nDatos del formulario - Placa del vehículo: ${form_data.placa}`;
      }
      if (form_data.razon_social && validFields.includes("razon_social")) {
        contextPrompt += `\nDatos del formulario - Razón social: ${form_data.razon_social}`;
      }
    }

    const fieldsToValidate = validFields.join(", ");
    const hasFormData = form_data && Object.keys(form_data).length > 0;

    const systemPrompt = hasFormData
      ? `Eres un validador de documentos venezolanos especializado en seguros de vehículos.
Tu trabajo es analizar imágenes de documentos y verificar que la información coincida con los datos del formulario.
Sé preciso al verificar números de cédula y placas. Ignora prefijos como V-, E-, J-, G- al comparar cédulas - compara solo los dígitos.
Para placas, ignora diferencias de mayúsculas/minúsculas.
Para nombres, sé flexible con acentos y mayúsculas/minúsculas, pero verifica que sea sustancialmente la misma persona.

IMPORTANTE: Para este tipo de documento, SOLO debes validar estos campos: ${fieldsToValidate}.
NO generes observaciones sobre campos que NO corresponden a este documento.

IMPORTANTE SOBRE LAS OBSERVACIONES: Las observaciones serán mostradas al usuario final. NO uses palabras técnicas como "extraída", "extraído", "detectado". Redacta las observaciones de forma amigable. Ejemplos:
- "La cédula del documento (27700707) no coincide con la ingresada en el formulario (12345678)"
- "El nombre en el documento (JUAN PÉREZ) no coincide con el ingresado (CARLOS LÓPEZ)"
- "La placa en el documento (AB123CD) no coincide con la registrada (XY789ZW)"
Nunca menciones IA, extracción, ni procesamiento automático.`
      : `Eres un validador de documentos venezolanos.
Tu trabajo es verificar que la imagen corresponde al tipo de documento esperado.
Determina si el documento es válido y del tipo correcto. Si la imagen está en blanco, es ilegible, o no corresponde al tipo de documento esperado, indica que no es válido.
NO uses palabras técnicas. Redacta observaciones de forma amigable para el usuario.
Nunca menciones IA, extracción, ni procesamiento automático.`;

    const userPrompt = hasFormData
      ? `${basePrompt}${contextPrompt}

IMPORTANTE: Compara ÚNICAMENTE los siguientes campos: ${fieldsToValidate}.
- Para cédulas: compara SOLO los dígitos numéricos (ignora prefijos V-, E-, etc.)
- Para placas: ignora mayúsculas/minúsculas
- Para nombres: sé flexible con acentos pero verifica que coincida sustancialmente
- NO agregues observaciones sobre campos que no aplican a este tipo de documento
- Las observaciones deben ser claras y amigables para el usuario, sin jerga técnica`
      : `${basePrompt}

Verifica ÚNICAMENTE si la imagen corresponde al tipo de documento esperado.
- Si es una imagen en blanco, ilegible, o de otro tipo de documento, indica que NO es válido.
- Si es el tipo de documento correcto, indica que ES válido.
- Marca matches_form_data como true si el documento es del tipo correcto.
- Las observaciones deben ser claras y amigables.`;

    // Determine mime type from base64
    let mimeType = "image/jpeg";
    if (image_base64.startsWith("/9j/")) mimeType = "image/jpeg";
    else if (image_base64.startsWith("iVBOR")) mimeType = "image/png";
    else if (image_base64.startsWith("JVBER")) mimeType = "application/pdf";

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: systemPrompt },
          {
            role: "user",
            content: [
              { type: "text", text: userPrompt },
              {
                type: "image_url",
                image_url: { url: `data:${mimeType};base64,${image_base64}` },
              },
            ],
          },
        ],
        tools: [
          {
            type: "function",
            function: {
              name: "validate_document",
              description: "Retorna el resultado de la validación del documento",
              parameters: {
                type: "object",
                properties: {
                  is_valid_document: {
                    type: "boolean",
                    description: "Si el documento es del tipo esperado (ej: es realmente una cédula si se pidió cédula)",
                  },
                  document_type_detected: {
                    type: "string",
                    description: "Tipo de documento detectado en la imagen",
                  },
                  extracted_cedula: {
                    type: "string",
                    description: "Número de cédula extraído del documento (solo dígitos, sin prefijo). Vacío si no aplica.",
                  },
                  extracted_placa: {
                    type: "string",
                    description: "Placa del vehículo extraída del documento. Vacío si no aplica.",
                  },
                  extracted_nombre: {
                    type: "string",
                    description: "Nombre completo extraído del documento. Vacío si no es legible.",
                  },
                  matches_form_data: {
                    type: "boolean",
                    description: "Si los datos del documento coinciden con los datos del formulario proporcionados",
                  },
                  observations: {
                    type: "array",
                    items: { type: "string" },
                    description: "Lista de observaciones amigables para el usuario. NO uses palabras como 'extraída' o 'extraído'. Usa formato: 'La cédula del documento (X) no coincide con la ingresada (Y)'",
                  },
                },
                required: [
                  "is_valid_document",
                  "document_type_detected",
                  "extracted_cedula",
                  "extracted_placa",
                  "extracted_nombre",
                  "matches_form_data",
                  "observations",
                ],
                additionalProperties: false,
              },
            },
          },
        ],
        tool_choice: { type: "function", function: { name: "validate_document" } },
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("AI Gateway error:", response.status, errorText);

      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Demasiadas solicitudes. Intente de nuevo en unos segundos." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "Créditos de IA agotados." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      return new Response(
        JSON.stringify({ error: "Error al procesar el documento con IA" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const aiResponse = await response.json();
    const toolCall = aiResponse.choices?.[0]?.message?.tool_calls?.[0];

    if (!toolCall?.function?.arguments) {
      console.error("No tool call in AI response:", JSON.stringify(aiResponse));
      return new Response(
        JSON.stringify({
          is_valid_document: false,
          document_type_detected: "desconocido",
          extracted_cedula: "",
          extracted_placa: "",
          extracted_nombre: "",
          matches_form_data: false,
          observations: ["No se pudo analizar el documento. Intente con una imagen más clara."],
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const result = JSON.parse(toolCall.function.arguments);
    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("validate-document error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Error desconocido" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
