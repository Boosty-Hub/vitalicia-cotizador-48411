

# Plan de Mejoras del Sistema - Analisis Documento vs Implementacion Actual

## Resumen General

Despues de analizar el documento de requerimientos contra el codigo actual, se identificaron problemas en 4 areas principales: carga de Excel, configuraciones/precios, formularios de activacion de polizas, y datos corruptos en la base de datos. Se organizan en fases priorizadas por impacto.

---

## FASE 1: Datos Corruptos en Base de Datos (Critico)

**Problema:** El documento reporta que en el selector de estados aparece "Zuliaq" (con una "q" al final), y en ciudades hay registros con formato "C_Ciudad Bolivia", "C_Ciudad De Nutrias", etc. Esto fue confirmado en la base de datos.

**Solucion:**
- Ejecutar una migracion SQL para corregir "Zuliaq" a "Zulia" en `board_cod_estado`
- Ejecutar una migracion SQL para limpiar el prefijo "C_" de las ciudades en `board_cod_ciudad` (ej: "C_Ciudad Bolivia" -> "Ciudad Bolivia")

---

## FASE 2: Validaciones de Formularios de Activacion (Natural y Juridica)

El documento reporta multiples problemas de validacion que aplican tanto al formulario natural como al juridico.

### 2.1 - Cedula: minimo 7 digitos
**Problema:** No hay validacion de longitud minima en cedulas. Se pueden poner numeros de 1 digito.
**Solucion:** Agregar validacion `minLength(7)` en los campos de cedula del titular, beneficiario, representante legal y conductor. Mostrar mensaje "La cedula debe tener al menos 7 digitos".
**Archivos:** `ActivarPolizaNaturalPage.tsx`, `ActivarPolizaJuridicaPage.tsx`

### 2.2 - Telefono: rango de longitud
**Problema:** El numero telefonico acepta cualquier cantidad de caracteres.
**Solucion:** Limitar el campo de telefono a exactamente 7 digitos (formato venezolano sin codigo de area). Agregar `maxLength={7}` y `minLength={7}` con validacion.
**Archivos:** `ActivarPolizaNaturalPage.tsx`, `ActivarPolizaJuridicaPage.tsx`

### 2.3 - Nombres, apellidos y direcciones: minimo de caracteres
**Problema:** Se puede registrar con una sola letra en nombres, apellidos y direcciones.
**Solucion:** Agregar validacion `minLength(2)` para nombres y apellidos, `minLength(5)` para direcciones y razon social. Deshabilitar el boton "Siguiente" si no cumplen.
**Archivos:** `ActivarPolizaNaturalPage.tsx`, `ActivarPolizaJuridicaPage.tsx`

### 2.4 - Serial de carroceria: no debe ser editable libremente
**Problema:** El usuario puede cambiar el serial de carroceria por cualquier valor, cuando deberia venir precargado del inventario y no poder modificarse arbitrariamente.
**Solucion:** Hacer el campo de serial de carroceria de solo lectura (`readOnly`) con fondo gris, ya que el valor viene de la base de datos (bd_bera o bd_empire). El valor se precarga al validar la placa.
**Archivos:** `ActivarPolizaNaturalPage.tsx`, `ActivarPolizaJuridicaPage.tsx`

---

## FASE 3: Formulario Juridico - Documentos de Empresa Adicionales

**Problema:** El documento indica que en la activacion juridica se deberia solicitar documentos adicionales de la empresa que actualmente no se piden:
- Acta de asamblea
- Acta constitutiva o registro mercantil
- Declaracion de impuesto sobre la renta (planilla o certificado)
- Referencia bancaria no mayor a 3 meses
- Cedula de accionistas
- RIF de los accionistas actualizados
- RIF de la empresa

**Solucion:** Agregar un paso adicional (o extender el paso de documentos existente) en el formulario juridico con estos 7 campos de subida de archivo usando el componente `FileUploader` existente. Los URLs se guardaran en nuevas columnas o como JSON en `polizas_activas`.
**Archivos:** `ActivarPolizaJuridicaPage.tsx`

---

## FASE 4: Carga Excel - Bloqueo por formato incorrecto

**Problema:** El documento menciona que "si el archivo de la carga no tiene la misma estructura que la plantilla, el sistema se va quedar bloqueado y no realizara las cargas". Actualmente el codigo SI valida las columnas, pero hay que verificar que la UI no se quede en un estado inconsistente.

**Solucion:** Revisar y asegurar que:
- Al detectar formato incorrecto, se resetee completamente el estado del formulario (file, data, loading)
- Se muestre un mensaje claro indicando exactamente que columnas faltan o sobran
- Se ofrezca un boton para descargar la plantilla correcta junto al mensaje de error

Esto ya esta parcialmente implementado, pero se reforzara el reset del estado y se mejorara el UX del mensaje de error.
**Archivos:** `AdminCargaEmpirePage.tsx`, `AdminCargaBeraPage.tsx`

---

## FASE 5: Precios Empire - Permitir eliminar modelos sin motos asociadas

**Problema:** El documento indica que hay modelos mal cargados en precios_empire que no se pueden eliminar. El sistema deberia permitir eliminarlos siempre que no tengan motos asociadas en `bd_empire` o `bd_bera`.

**Solucion:** Agregar un boton de eliminar en cada modelo del `AdminPreciosEmpirePage`. Al hacer clic:
1. Verificar si existen registros en `bd_empire` o `bd_bera` con ese modelo
2. Si tiene motos asociadas, mostrar error: "No se puede eliminar, tiene X motos asociadas"
3. Si no tiene motos, eliminar todos los registros de precio de ese modelo en `precios_empire`

**Archivos:** `AdminPreciosEmpirePage.tsx`

---

## FASE 6: Duplicados en reemplazo (Bug reportado)

**Problema:** El documento indica que "al momento de reemplazar aunque el sistema indique que se generaran duplicados, no los termina generando". Esto sugiere un bug en la logica de reemplazo.

**Solucion:** Revisar la logica en `handleUpload` de ambas paginas de carga. Cuando se reemplaza, asegurar que:
- Se elimine correctamente el registro anterior usando la placa exacta (case-insensitive)
- El nuevo registro se inserte con `es_duplicado: false` (ya que reemplaza al anterior)
- Se manejen correctamente los casos donde la placa en BD tiene distinta capitalizacion

**Archivos:** `AdminCargaEmpirePage.tsx`, `AdminCargaBeraPage.tsx`

---

## Resumen de Archivos a Modificar

| Fase | Archivos | Tipo |
|------|---------|------|
| 1 | Migracion SQL | Correccion de datos |
| 2 | `ActivarPolizaNaturalPage.tsx`, `ActivarPolizaJuridicaPage.tsx` | Validaciones |
| 3 | `ActivarPolizaJuridicaPage.tsx` | Nuevo paso de documentos |
| 4 | `AdminCargaEmpirePage.tsx`, `AdminCargaBeraPage.tsx` | UX mejoras |
| 5 | `AdminPreciosEmpirePage.tsx` | Nueva funcionalidad |
| 6 | `AdminCargaEmpirePage.tsx`, `AdminCargaBeraPage.tsx` | Bug fix |

