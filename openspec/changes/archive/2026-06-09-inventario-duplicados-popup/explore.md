# Explore — inventario-duplicados-popup

## Key finding
Duplicate detection is ALREADY largely built in both `AdminInventarioBeraPage.tsx` and
`AdminInventarioEmpirePage.tsx`: rows with `es_duplicado = true` get a yellow highlight + a
"Duplicado" badge, and the filter toolbar has a "Duplicados" view. **What's missing is only the
proactive popup on page entry.** Scope is smaller than it sounded.

## Data / RPC notes
- Both pages load via raw `useState` + `useEffect` `fetchData()` (NOT TanStack Query); paginated
  query against `bd_bera` / `bd_empire` with `count: "exact"`. Effect deps: `[currentPage, search, filterDuplicados, filterPoliza]`.
- The RPCs `check_bera_duplicates(placas text[])` / `check_empire_duplicates(...)` return the subset
  of a passed plate array already in the DB — **built for the UPLOAD flow, NOT useful here.**
- For the popup, query the table directly: `select(..., { count: 'exact' }).eq('es_duplicado', true).limit(50)`.
  Use `.eq('es_duplicado', true)` (the column is nullable — do NOT use `.neq(false)`).

## Two-factory parity (mandatory — top bug risk)
| Popup field | BERA | EMPIRE |
|---|---|---|
| Year | `anio_modelo` | `anio` |
| Chassis/body serial | `serial_chasis` | `serial_carroceria` |
| Model variant | `modelo` | `modelo` + `version` |
Component must take a `variant: "bera" | "empire"` prop (same pattern as `MotoDetailsDialog`), no hardcoded columns.

## Reuse
- shadcn `Dialog` (`src/components/ui/dialog.tsx`), controlled by `open` state (no `DialogTrigger` needed).
- `DuplicatePlatesHandler.tsx` is upload-flow specific — do NOT reuse; create a lightweight `DuplicateWarningDialog`.

## Resolved UX decisions (defaults, automatic mode)
1. Show on mount if duplicates exist. "Ver duplicados" button applies `filterDuplicados="duplicados"` + closes; plus an "Entendido" dismiss.
2. Suppress per session via `sessionStorage` key per page (`dup-warning-bera` / `dup-warning-empire`) — show once per session.
3. Read-only list, `.limit(50)`, show "hay N más" when count > 50. No destructive delete action.

## Affected files
- `src/pages/admin/AdminInventarioBeraPage.tsx` — add dup-count effect + dialog (mirror)
- `src/pages/admin/AdminInventarioEmpirePage.tsx` — mirror change
- `src/components/admin/DuplicateWarningDialog.tsx` — NEW shared component (variant-driven)
- No migration (`es_duplicado` already exists in both tables).
