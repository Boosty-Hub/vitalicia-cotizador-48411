## Objetivo
Usar el logo "Seguros La Vitalicia — Vital para ti" subido en lugar del actual, tanto en la factura como en el carnet generados.

## Cambios
1. **Reemplazar el asset público**
   - Sustituir `public/logo-vitalicia.png` por la imagen subida (`logo vitalicai.jpg`) → guardada como `public/logo-vitalicia.png` para conservar la ruta usada por el resto del sitio.

2. **Embeber el logo como base64 en las edge functions**
   - Actualmente `supabase/functions/generate-factura-poliza/index.ts` y `supabase/functions/generate-carnet-poliza/index.ts` apuntan a `https://seguroslavitalicia.com/logo-vitalicia.png`. Esa URL depende del dominio publicado y puede no reflejar el logo nuevo de inmediato (caché/CDN) o fallar si el dominio cambia.
   - Convertir la imagen a `data:image/png;base64,...` y reemplazar la constante `LOGO_URL` en ambos archivos. Así el logo viaja dentro del HTML generado y se ve siempre, incluso fuera de línea o en preview.

3. **Redesplegar las edge functions**
   - `generate-factura-poliza` y `generate-carnet-poliza`.

## Validación
- Regenerar factura y carnet de la póliza de prueba (`6804b8fa…`) y confirmar visualmente que el nuevo logo aparece en el encabezado y en el área de firma.

## Fuera de alcance
- No se cambia la maquetación ni los colores; solo el logo.
