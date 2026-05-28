
# Análisis del renderizado del PDF del carnet

Revisé `handleDownloadDocument` en `src/components/admin/PolicyDetailsDialog.tsx` (líneas 392–669), específicamente la rama `isCarnet`. El flujo actual es: iframe oculto → inyección de `pdfSafeStyle` → clonado de estilos al `<head>` padre → wrapper a 794px → `html2canvas` (scale 3) → paginado manual por slices de píxeles → `jsPDF` con JPEG 0.95.

## Problemas detectados (de mayor a menor impacto)

### 1. Paginación corta tarjetas por la mitad ⚠️ (crítico)
El loop `while (renderedHeight < canvas.height)` corta el canvas en bloques de A4 sin respetar dónde terminan las tarjetas frente/dorso. `page-break-inside: avoid` solo aplica al motor de impresión nativo — `html2canvas` lo ignora porque solo rasteriza. Si el frente queda a ~580px y el dorso a ~1160px, el segundo se parte entre página 1 y página 2.

**Fix**: medir las posiciones reales de cada `.card-wrap` dentro del wrapper (`getBoundingClientRect`) y cortar el canvas exactamente entre tarjetas, no por A4 fijo. Si una tarjeta no cabe en lo que queda de página → empezar página nueva.

### 2. Compresión JPEG degrada texto y gradientes
`toDataURL('image/jpeg', 0.95)` introduce halos sutiles alrededor del texto blanco/dorado sobre navy y banding en gradientes. Para un carnet (poca superficie, fondos planos) PNG pesa similar y queda nítido.

**Fix**: usar `image/png` para carnet (mantener JPEG para factura, que tiene más superficie blanca).

### 3. `scale: 3` × 540px = canvas innecesariamente pesado
Renderiza a 1620×~3500 px cuando luego se baja a 210mm A4 (~794px @96dpi en PDF). Para impresión a 300dpi basta con `scale: 2.5`. Scale 3 multiplica memoria 1.44× y tiempo ~1.5× sin ganancia visible. En equipos con poca RAM puede tirar `Out of memory` en html2canvas.

**Fix**: bajar a `scale: 2.5` (o calcular dinámicamente para apuntar a ~300dpi: `scale = (210mm * 300/25.4) / 794 ≈ 3.12` — entonces dejar 2.5 es suficiente para impresión hogareña).

### 4. Mutación del iframe en lugar de `onclone` de html2canvas
Hoy inyectamos `pdfSafeStyle` directamente en `iframeDoc.head`, clonamos `<style>`/`<link>` al `<head>` padre, y construimos un `wrapper` separado con `bodyHtml` extraído. Eso provoca:
- Posible doble carga de fuentes (iframe + parent).
- Race conditions con `document.fonts.ready` (la fuente puede registrarse después del check).
- `injectedNodes` contamina el `<head>` global durante la generación → cualquier estilo con selectores genéricos puede afectar al diálogo abierto detrás.

**Fix**: usar la opción `onclone` de `html2canvas` directamente sobre el iframe (sin wrapper, sin clonar al head padre). Eso aísla los estilos al documento clonado interno y elimina los efectos colaterales.

### 5. `transform: none !important` puede romper diseño intencional
La regla aplasta todas las transformaciones del carnet (ej. badges girados, sellos). Si el template usa `transform: rotate()` para un sello o etiqueta lateral, quedará desalineado en el PDF pero correcto en pantalla.

**Fix**: restringir el reset a `letter-spacing`/`scale` solo donde realmente causa el corte (los `.field .val`), no a `*` descendientes.

### 6. `naturalHeight + 28` padding mágico
Suma 28px arbitrarios al alto para "no cortar la última línea". Sintomático de que el cálculo de alto pierde algo (probablemente `margin-bottom` colapsado del último hijo o padding del wrapper).

**Fix**: medir con `getBoundingClientRect()` del último hijo + offset al wrapper, o forzar `padding-bottom` real en el wrapper.

### 7. Imágenes cross-origin sin CORS → canvas tainted
`useCORS: true` pide CORS, pero si el logo o foto del asegurado vienen de un bucket sin header `Access-Control-Allow-Origin`, `html2canvas` mancha el canvas y `toDataURL` lanza `SecurityError`. El catch hace fallback a abrir en pestaña — el usuario nunca recibe el PDF.

**Fix**: verificar headers de los buckets de Supabase (deberían estar OK por default) y agregar `allowTaint: false` explícito + `crossOrigin="anonymous"` a las `<img>` al clonarlas.

### 8. Espera de fuentes no garantizada
`document.fonts.ready` resuelve cuando las fuentes registradas terminaron, pero si el `<link>` se acaba de inyectar y aún no parseó el CSS, `fonts` puede no contenerlas todavía y resolver inmediato → captura con fallback `sans-serif`.

**Fix**: tras `await linkLoadPromises`, hacer un `document.fonts.load('700 14px "NombreFuente"')` explícito por cada familia usada en el carnet antes del `html2canvas`.

## Mejoras propuestas (ordenadas por ROI)

| # | Mejora | Impacto | Esfuerzo |
|---|--------|---------|----------|
| 1 | Paginación por tarjeta (no cortar `.card-wrap`) | Alto | Medio |
| 2 | PNG en vez de JPEG solo para carnet | Alto | Trivial |
| 3 | Usar `onclone` y eliminar wrapper + inyección al head padre | Alto | Medio |
| 4 | `scale: 2.5` y fuentes con `fonts.load()` explícito | Medio | Bajo |
| 5 | Restringir `transform: none` a `.field .val` | Medio | Trivial |
| 6 | Quitar el `+28` mágico midiendo bien | Bajo | Bajo |
| 7 | Validar CORS de imágenes y cross-origin explícito | Bajo | Bajo |

## Alternativa de fondo (opcional, fuera de este plan)
Renderizar el PDF en una edge function con Puppeteer/Playwright usando `page.pdf()`: salida vectorial real (texto seleccionable, sin rasterizar, sin html2canvas, sin paginación manual). Es el cambio que más eleva la calidad pero implica nueva función serverless y costos de cold-start.

## Recomendación
Implementar las mejoras 1, 2, 3 y 4 juntas en `handleDownloadDocument` (rama `isCarnet`). Eso resuelve el corte de tarjetas, mejora la nitidez y elimina los efectos colaterales del head global, sin tocar el template del edge function.

¿Avanzo con 1+2+3+4, o preferís evaluar primero la alternativa server-side con Puppeteer?
