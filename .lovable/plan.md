## Agregar sello "PAGADO" en la factura

**Objetivo:** Mostrar la imagen del sello PAGADO debajo de la columna "BANCO" en la tabla de cobro de la factura generada.

### Pasos

1. **Guardar imagen**: copiar `user-uploads://image-removebg-preview.png` a `public/sello-pagado.png` (para referencia/futuro uso).
2. **Embeber en edge function**: convertir la imagen a base64 (data URL PNG) e inyectarla como constante `PAGADO_STAMP` en `supabase/functions/generate-factura-poliza/index.ts` (mismo patrón que `LOGO_URL`).
3. **Insertar en el HTML**: justo debajo de la tabla `.cobro` (línea ~245), agregar un contenedor alineado a la derecha con `<img src="${PAGADO_STAMP}" />` en tamaño pequeño (~110px de ancho, rotación ligera opcional para look de sello), posicionado bajo la columna BANCO.
4. **Desplegar** `generate-factura-poliza` y **regenerar** la factura de la póliza de prueba (`6804b8fa…`) para verificar visualmente que el sello aparece bajo BANCO en tamaño pequeño y no rompe el layout.

### Notas técnicas
- No se toca el carnet, solo factura.
- El sello se renderiza siempre (la factura solo se genera para pólizas activas/cobradas, por lo que "PAGADO" aplica).
