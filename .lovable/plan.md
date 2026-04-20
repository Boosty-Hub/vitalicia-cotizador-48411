

# Plan: Descarga Masiva de Documentos de Pólizas

## Objetivo

Permitir a los administradores descargar la documentación completa de los usuarios, organizada por póliza, con seguimiento individual por admin de qué se ha descargado. Incluye:
- Acceso rápido desde la tabla de Pólizas
- Página dedicada `/admin/descargas` con vista avanzada
- Soporte completo para los 13 documentos del formulario jurídico (no solo 6)

---

## 1. Cambios en Base de Datos

### 1.1 Agregar columnas faltantes a `polizas_activas`
Nuevas columnas (todas `text` nullable) para los 7 documentos jurídicos:
- `acta_asamblea_url`
- `acta_constitutiva_url`
- `declaracion_islr_url`
- `referencia_bancaria_url`
- `cedula_accionistas_url`
- `rif_accionistas_url`
- `rif_empresa_url`

### 1.2 Nueva tabla `admin_document_downloads` (tracking por admin)
```text
id              uuid PK
admin_user_id   uuid (auth.users.id)
poliza_id       uuid (polizas_activas.id)
document_type   text  -- ej: 'cedula_identidad', 'rif', 'all_zip'
downloaded_at   timestamptz default now()
```
Índices: `(admin_user_id, poliza_id)`, `(admin_user_id, downloaded_at)`.

**RLS**: solo admins (`has_role(auth.uid(),'admin')`) pueden hacer SELECT/INSERT, y cada admin solo ve sus propios registros (`admin_user_id = auth.uid()`).

---

## 2. Actualizar `ActivarPolizaJuridicaPage.tsx`

Subir y guardar los 7 documentos extra:
- Extender `Promise.all` con uploads para `docActaAsamblea`, `docActaConstitutiva`, `docDeclaracionISLR`, `docReferenciaBancaria`, `docCedulaAccionistas`, `docRIFAccionistas`, `docRIFEmpresa`.
- Mapear cada URL al campo correspondiente en el `insert` a `polizas_activas`.

---

## 3. Edge Function: `download-poliza-documents`

Nueva función que recibe `{ polizaIds: string[], onlyNotDownloaded?: boolean }` y:
1. Valida JWT y rol admin.
2. Si `onlyNotDownloaded=true`, filtra documentos ya registrados en `admin_document_downloads` para ese admin.
3. Lee las URLs de documentos de cada póliza, descarga cada archivo desde el bucket `poliza-documentos` usando service role.
4. Construye un ZIP con esta estructura:
   ```text
   descargas-YYYY-MM-DD.zip
   ├── 12345678 - Carlos Gonzalez - AB123CD/
   │   ├── 01-cedula-identidad.pdf
   │   ├── 02-licencia-conducir.jpg
   │   ├── 03-certificado-origen.pdf
   │   └── ...
   ├── J-12345678-9 - Empresa XYZ - XY789ZW/
   │   ├── 01-cedula-identidad.pdf
   │   ├── 07-acta-asamblea.pdf
   │   └── ...
   └── _resumen.csv  (titular, documento, placa, póliza, archivos incluidos)
   ```
5. Registra cada documento descargado en `admin_document_downloads`.
6. Devuelve el ZIP como stream (`application/zip`).

**Librería ZIP**: `jsr:@zip-js/zip-js` (compatible con Deno, streaming).

---

## 4. UI: Acceso rápido en `/admin/polizas`

Modificar `AdminPolizasPage.tsx`:
- Agregar columna de checkbox al inicio de la tabla + checkbox "seleccionar todo" en header.
- Barra de acciones masivas que aparece cuando hay selecciones:
  - Botón **"Descargar seleccionadas (N)"** → invoca edge function con esos IDs.
  - Toggle **"Solo no descargados"** → marca el flag.
- En la columna de acciones de cada fila, un nuevo botón ⬇ "Descargar documentos de esta póliza".
- Indicador visual (punto verde pequeño) en filas cuyas pólizas el admin actual ya descargó completamente.

---

## 5. UI: Nueva página `/admin/descargas`

Nueva entrada en `AdminSidebar` ("Descarga de Documentos", icono `FolderDown`).

Página con tres secciones:

### 5.1 Filtros superiores
- Rango de fechas (creación de póliza)
- Tipo: Natural / Jurídico / Todos
- Estado descarga: Todos / No descargados por mí / Descargados por mí
- Buscador (nombre, cédula, placa)

### 5.2 Vista de tarjetas/tabla
Cada póliza muestra:
- Titular, documento, placa
- Mini-grid de chips por tipo de documento (verde si existe + descargado por mí, azul si existe + no descargado, gris si falta)
- Checkbox de selección
- Botón "Descargar esta"

### 5.3 Barra inferior fija
- "X pólizas seleccionadas · Y documentos · ~Z MB estimados"
- Botones: **"Descargar todo (ZIP)"** y **"Descargar solo nuevos (ZIP)"**
- Historial colapsable: últimas 10 descargas hechas por el admin actual con fecha y conteo.

---

## 6. Detalles técnicos

| Archivo | Acción |
|---|---|
| `supabase/migrations/*` | Agregar 7 columnas + crear tabla `admin_document_downloads` con RLS |
| `supabase/functions/download-poliza-documents/index.ts` | Crear edge function (descarga + ZIP + tracking) |
| `supabase/config.toml` | Registrar nueva función |
| `src/pages/ActivarPolizaJuridicaPage.tsx` | Subir y guardar 7 documentos extra |
| `src/components/admin/PolicyDetailsDialog.tsx` | Mostrar 7 documentos extra en sección documentos |
| `src/pages/admin/AdminPolizasPage.tsx` | Checkboxes, selección masiva, botón descarga por fila |
| `src/pages/admin/AdminDescargasPage.tsx` | Crear página dedicada |
| `src/components/admin/AdminSidebar.tsx` | Agregar entrada "Descargas" |
| `src/App.tsx` | Registrar ruta `/admin/descargas` |
| `src/integrations/supabase/types.ts` | Se regenera automático tras migración |

### Mapeo de tipos de documento (centralizado)
```text
cedula_identidad, licencia_conducir, certificado_medico,
certificado_origen, factura_compra, rif,
acta_asamblea, acta_constitutiva, declaracion_islr,
referencia_bancaria, cedula_accionistas, rif_accionistas, rif_empresa
```

### Manejo de errores
- Si un archivo no se puede descargar del bucket, se incluye un `_errores.txt` dentro del ZIP listando los faltantes; el resto se entrega igual.
- Límite por descarga: 100 pólizas por ZIP (para evitar timeouts). Si hay más seleccionadas, se avisa al usuario y se sugiere lotes.

---

## 7. Flujo de uso final

1. Admin entra a `/admin/polizas` → ve indicadores de descarga, marca varias pólizas → click "Descargar seleccionadas" → recibe `descargas-2026-04-20.zip`.
2. Admin entra a `/admin/descargas` → filtra "No descargados por mí, últimos 30 días, jurídicos" → click "Descargar solo nuevos" → recibe ZIP organizado y queda registrado.
3. Próxima vez que entra, las pólizas ya descargadas aparecen marcadas y puede pedir solo las nuevas.

