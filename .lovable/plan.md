## Plan

Corregiré el solapamiento del anverso del carnet ajustando la estructura, no solo el padding.

### Cambios propuestos

1. **Plantilla del carnet**
   - Reducir la altura visual ocupada por los campos superiores del anverso.
   - Reservar espacio real para el bloque de **Vigencia** usando layout con filas controladas.
   - Cambiar el campo **Serial de Carrocería** para que no invada el bloque inferior aunque el serial sea largo.

2. **Captura/descarga desde Detalle de Póliza**
   - Actualizar el CSS seguro que se inyecta al descargar el carnet para que no revierta el arreglo.
   - Mantener tamaño final del carnet en `540x340` para no afectar el formato actual.

3. **Despliegue**
   - Desplegar la función `generate-carnet-poliza` para que el botón **Regenerar carnet** genere el HTML corregido.

### Nota

Las pólizas ya generadas conservarán el HTML viejo hasta pulsar **Regenerar carnet** en el popup **Detalle de Póliza**.