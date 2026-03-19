

# Plan: Validacion de Documentos con IA - Bloqueo Obligatorio

## Objetivo

Al subir cada documento en el paso de "Carga de Documentos", validar automaticamente con IA (Gemini Vision) que:
1. El documento sea del tipo correcto (cedula, certificado de origen, factura, etc.)
2. La cedula de identidad coincida con el numero de cedula ingresado en el formulario
3. El certificado de origen contenga la placa que se esta validando
4. La factura de compra corresponda a la misma persona/placa

El boton de enviar queda bloqueado hasta que TODOS los documentos pasen la validacion.

---

## Arquitectura

```text
Usuario sube documento
     ↓
Frontend convierte imagen a base64
     ↓
Llama Edge Function "validate-document"
     ↓
Edge Function envia imagen a Lovable AI Gateway (Gemini Vision)
con prompt especializado + datos del formulario (cedula, placa, nombre)
     ↓
Retorna JSON estructurado via tool calling:
  - is_valid: boolean
  - document_type_detected: string
  - extracted_data: { nombre, cedula, placa }
  - matches_form_data: boolean
  - observations: string[]
     ↓
Frontend muestra check verde o error rojo
Si falla: no permite continuar
```

---

## Cambios a Implementar

### 1. Edge Function `validate-document`

Crear `supabase/functions/validate-document/index.ts`:

- Recibe: `{ image_base64, document_type, form_data: { cedula, placa, nombre, apellido } }`
- Envia a Lovable AI Gateway con `google/gemini-2.5-flash` (soporta vision)
- Prompt especializado por tipo de documento:
  - **Cedula de Identidad**: extraer numero de cedula, nombre completo. Comparar con `form_data.cedula` y `form_data.nombre`
  - **Certificado de Origen**: extraer placa del vehiculo. Comparar con `form_data.placa`
  - **Factura de Compra**: extraer nombre del comprador y/o placa. Comparar con datos del formulario
  - **Licencia, Certificado Medico, RIF**: validar que sea un documento del tipo correcto
- Usa tool calling para obtener respuesta estructurada
- Retorna resultado al frontend
- Maneja errores 429/402 del gateway

### 2. Componente `FileUploader` mejorado

Modificar `src/components/ui/file-uploader.tsx`:

- Agregar props opcionales: `validationStatus` (`'idle' | 'validating' | 'valid' | 'invalid'`), `validationMessage`, `validationObservations`
- Estados visuales:
  - **validating**: spinner amarillo con "Validando documento..."
  - **valid**: check verde con "Documento validado correctamente"
  - **invalid**: icono rojo con mensaje de error especifico (ej: "La cedula no coincide con el numero ingresado")
- No cambia la funcionalidad base del componente

### 3. Hook `useDocumentValidation`

Crear `src/hooks/useDocumentValidation.ts`:

- Funcion `validateDocument(file, documentType, formData)`:
  - Convierte File a base64 (con redimension a max 1024px para optimizar)
  - Llama a la edge function via `supabase.functions.invoke`
  - Retorna resultado de validacion
- Estado por documento: `Map<string, ValidationResult>`
- Funcion `allDocumentsValid()` para verificar si todos pasaron
- Funcion `getValidationStatus(docType)` para obtener estado individual

### 4. Integracion en paginas de activacion

Modificar `ActivarPolizaNaturalPage.tsx` y `ActivarPolizaJuridicaPage.tsx`:

- Al subir cada documento, disparar validacion automatica
- Pasar `validationStatus` y `validationMessage` a cada `FileUploader`
- Boton "Activar Poliza" bloqueado si algun documento tiene status `invalid` o `validating`
- Si un documento falla, el usuario puede quitarlo y subir uno nuevo (re-valida automaticamente)
- Datos que se cruzan:
  - `docIdentidad` → compara cedula extraida vs `formData.numeroCedula`
  - `docOrigenVehiculo` → compara placa extraida vs `placa` (la placa validada en paso 1)
  - `docFacturaCompra` → compara nombre/cedula del comprador vs datos del titular

### 5. Config y Deploy

- Agregar `[functions.validate-document]` con `verify_jwt = false` en `supabase/config.toml`
- `LOVABLE_API_KEY` ya esta disponible en secrets

---

## Detalle tecnico

- **Modelo**: `google/gemini-2.5-flash` (vision, rapido, economico)
- **Redimension de imagen**: canvas API en frontend, max 1024px lado mayor, calidad 0.8 JPEG
- **Tool calling schema** para respuesta estructurada (no JSON libre):

```json
{
  "name": "validate_document",
  "parameters": {
    "properties": {
      "is_valid": { "type": "boolean" },
      "document_type_detected": { "type": "string" },
      "extracted_cedula": { "type": "string" },
      "extracted_placa": { "type": "string" },
      "extracted_nombre": { "type": "string" },
      "matches_form_data": { "type": "boolean" },
      "observations": { "type": "array", "items": { "type": "string" } }
    }
  }
}
```

---

## Archivos a crear/modificar

| Archivo | Accion |
|---------|--------|
| `supabase/functions/validate-document/index.ts` | Crear |
| `supabase/config.toml` | Agregar funcion |
| `src/hooks/useDocumentValidation.ts` | Crear |
| `src/components/ui/file-uploader.tsx` | Modificar (agregar estados de validacion) |
| `src/pages/ActivarPolizaNaturalPage.tsx` | Modificar (integrar validacion) |
| `src/pages/ActivarPolizaJuridicaPage.tsx` | Modificar (integrar validacion) |

