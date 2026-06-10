# Explore — inventario-edit-livesearch

## Key finding: mostly already built via MotoDetailsDialog
`src/components/admin/MotoDetailsDialog.tsx` (added in pull a47ddc1) ALREADY uses
`LiveSearchField` for **Marca, Modelo, Color, Versión** on BOTH bera/empire — shows description,
stores code. The description-not-code requirement is already met there.

## What's actually missing
1. **Transmisión** is still a plain text `<Input>` in `MotoDetailsDialog` (and the legacy dialog).
   There is NO `board_cod_transmision` table — it's free text from XLSX. Should become a static-options
   `<Select>` (e.g. MANUAL / AUTOMATICA / ...). No migration.
2. **Legacy Edit Dialog** (Pencil icon) in both page files (`AdminInventarioBeraPage.tsx` ~899-930,
   `AdminInventarioEmpirePage.tsx` ~826-852): all free-text `<Input>`, bypasses LiveSearchField.
   This is the surface the request targets. Pencil only shows when the row has no policy.

## Lookup tables (code col / desc col / filter)
| Field | Table | code | desc | filter |
|---|---|---|---|---|
| Marca | board_cod_marca | cd_marca | descripcion | — |
| Modelo | board_cod_modelo | cd_modelo | descripcion | cd_marca (req) |
| Color | board_cod_color | **cd_valdet** | descripcion | — |
| Versión | board_cod_version_moto | cd_version | descripcion | cd_marca, cd_modelo |
| Transmisión | NONE (static enum) | — | — | — |

`LiveSearchField.table` is a typed literal union — extending tables touches its interface.

## Two-factory differences
- BERA: `modelo`+`cod_modelo`, `color`+`cod_color` (two columns each). EMPIRE: `modelo`/`color`/`version`
  description-only (codes resolved at activation). Transmisión free text in both.

## Approaches
- **A (recommended): consolidate.** Pencil opens `MotoDetailsDialog` in edit mode; delete the legacy
  free-text Edit Dialog from both pages; add Transmisión `<Select>` to MotoDetailsDialog. ~30 lines,
  removes duplication, parity already handled by the `variant` prop. UX change: no more separate quick-edit.
- **B: upgrade legacy dialogs in-place** with LiveSearchField + transmisión Select. ~150 lines, duplicates
  logic across 2 pages (two-factory trap), keeps the Pencil quick-edit flow.

## Open decisions (for the user)
1. Approach A vs B.
2. Transmisión canonical options (seed has MANUAL, AUTOMATICA; SEMI-AUTOMATICA unconfirmed).
3. Does the "Add new moto" dialog also get live-search, or EDIT only (request says edit)?
