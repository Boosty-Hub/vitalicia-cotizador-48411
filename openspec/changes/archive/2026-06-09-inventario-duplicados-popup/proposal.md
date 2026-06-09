# Proposal: Popup proactivo de duplicados en inventario BERA/EMPIRE

## Intent

Hoy los duplicados (`es_duplicado = true`) solo se notan si el staff abre el filtro "Duplicados" o repara en el highlight de fila. Es pasivo: pueden pasar inadvertidos. Necesitamos avisar de forma proactiva al entrar a `/admin/inventario-bera` y `/admin/inventario-empire`, mostrando cuántos hay y listándolos, para que el staff los revise antes de operar sobre el inventario.

## Scope

### In Scope
- Componente compartido `DuplicateWarningDialog` (shadcn `Dialog`, controlado por `open`), driven por `variant: "bera" | "empire"`.
- Al montar cada página de inventario: contar/listar duplicados (`es_duplicado = true`, `count: 'exact'`, `.limit(50)`) y mostrar el popup si hay alguno.
- Botón "Ver duplicados" → aplica `filterDuplicados="duplicados"` + cierra; botón "Entendido" → cierra.
- Lista de solo lectura; si `count > 50`, leyenda "hay N más".
- Supresión por sesión vía `sessionStorage` (`dup-warning-bera` / `dup-warning-empire`): una vez por sesión.

### Out of Scope
- Acciones destructivas (borrar/mergear duplicados desde el popup).
- Cambios al flujo de carga (`/carga-bera`, `/carga-empire`) y a las RPC `check_*_duplicates`.
- Migraciones de esquema (`es_duplicado` ya existe en ambas tablas).
- Reusar `DuplicatePlatesHandler` (es específico del upload).

## Capabilities

### New Capabilities
- `inventory-duplicate-alert`: aviso proactivo on-mount de registros duplicados en las páginas de inventario, con listado de solo lectura y atajo al filtro existente.

### Modified Capabilities
- None.

## Approach

Crear `src/components/admin/DuplicateWarningDialog.tsx` parametrizado por `variant`. El componente recibe count, lista de filas y callbacks (`onVerDuplicados`, `onClose`); NO hardcodea columnas — el llamador mapea los campos según la tabla. Cada página agrega un `useEffect` on-mount que consulta su tabla, respeta `sessionStorage`, y controla el `open`. Mismo patrón variant-driven que `MotoDetailsDialog`. Query directa a la tabla (las RPC son para el upload).

## Affected Areas

| Area | Impact | Description |
|------|--------|-------------|
| `src/components/admin/DuplicateWarningDialog.tsx` | New | Dialog compartido variant-driven (lista solo lectura). |
| `src/pages/admin/AdminInventarioBeraPage.tsx` | Modified | Effect on-mount + dialog; campos BERA (`anio_modelo`, `serial_chasis`, `modelo`). |
| `src/pages/admin/AdminInventarioEmpirePage.tsx` | Modified | Mirror; campos EMPIRE (`anio`, `serial_carroceria`, `modelo`+`version`). |

## Risks

| Risk | Likelihood | Mitigation |
|------|------------|------------|
| Drift BERA/EMPIRE: usar columnas de una tabla en la otra | High | Componente variant-driven, mapeo de columnas en cada página; `/check-twofactory` antes de cerrar. |
| `es_duplicado` es nullable → conteo erróneo | Med | Usar `.eq('es_duplicado', true)`, nunca `.neq(false)`. |
| Popup molesto al recargar | Med | Supresión por sesión vía `sessionStorage` por página. |

## Rollback Plan

Revertir el commit: borrar `DuplicateWarningDialog.tsx` y quitar el effect/dialog de ambas páginas. Sin migraciones ni cambios de datos, el rollback es puramente de front-end y sin estado persistente que limpiar.

## Dependencies

- Ninguna nueva. Reusa shadcn `Dialog` y el cliente Supabase existente.

## Success Criteria

- [ ] Al entrar con duplicados presentes, el popup aparece una vez por sesión en ambas páginas.
- [ ] "Ver duplicados" aplica el filtro y cierra; "Entendido" cierra.
- [ ] BERA y EMPIRE muestran sus columnas reales sin drift (`/check-twofactory` limpio).
- [ ] Sin duplicados, el popup no aparece; `count > 50` muestra "hay N más".
