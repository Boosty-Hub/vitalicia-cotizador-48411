# Proposal — inventario-edit-livesearch

## Intent

**Problem.** Editing an existing moto in admin inventory still goes through a legacy free-text
Edit Dialog (the Pencil icon) on both `AdminInventarioBeraPage.tsx` and
`AdminInventarioEmpirePage.tsx`. Every field — Marca, Modelo, Color, Versión — is a raw
`<Input>` that bypasses `LiveSearchField`. The admin types descriptions by hand, codes are not
resolved, and the two pages duplicate the same form logic (a classic two-factory drift trap).

**Why now.** The hard part is already built. `MotoDetailsDialog` (added in a47ddc1) already does
live-search-by-description-store-code for Marca/Modelo/Color/Versión on BOTH factories via its
`variant` prop. The legacy Edit Dialog is now pure duplicated debt that contradicts the
component that replaced it. Keeping both means every future inventory field change must be made
in three places.

**Success looks like.**
- The Pencil (quick-edit) action opens `MotoDetailsDialog` in edit mode on both pages.
- The legacy free-text Edit Dialog is gone from both page files.
- Transmisión is a constrained `<Select>` (MANUAL / AUTOMÁTICA), not free text.
- The "Add new moto" flow keeps working exactly as before.
- Bera and Empire stay in parity (handled by the existing `variant` prop — no duplicated edit logic).

## Scope

### In scope
- **Consolidate edit onto `MotoDetailsDialog`** (Approach A, locked). Wire the Pencil action so it
  opens `MotoDetailsDialog` in edit mode instead of the legacy dialog.
- **Open-in-edit affordance for `MotoDetailsDialog`.** It currently opens in view mode; edit must be
  the entry state when launched from the Pencil (e.g. an `initialEditing` / `startInEdit` prop).
- **Transmisión `<Select>`** inside `MotoDetailsDialog` with EXACTLY two static options: `MANUAL`
  and `AUTOMÁTICA`. No DB table, no migration, no `LiveSearchField` table-union change.
- **Delete the legacy Edit Dialog** JSX and its now-orphaned edit-only wiring from BOTH
  `AdminInventarioBeraPage.tsx` and `AdminInventarioEmpirePage.tsx`.
- **Two-factory parity** for all of the above.

### Out of scope (explicit)
- **The "Add new moto" dialog stays free-text** for now. It is NOT migrated to live-search in this
  change. BUT its functionality MUST NOT break when the legacy Edit Dialog is removed — see Risks.
- No schema/migration work. Transmisión stays free-text in the DB; only the edit UI constrains it.
- No change to `LiveSearchField`'s table union, lookup tables, or the activation-time code resolution.
- No change to the XLSX bulk-upload (`/carga-bera`, `/carga-empire`) or pricing pages.
- No change to delete, policy-details, or duplicate-warning flows.

## Affected files
- `src/components/admin/MotoDetailsDialog.tsx` — add open-in-edit prop; replace Transmisión `<Input>`
  with a 2-option static `<Select>`. (Parity is automatic — single shared component, `variant` prop.)
- `src/pages/admin/AdminInventarioBeraPage.tsx` — Pencil → `MotoDetailsDialog` (edit mode); remove
  legacy Edit Dialog JSX (~899–930) and orphaned edit-only state/handlers.
- `src/pages/admin/AdminInventarioEmpirePage.tsx` — twin of the above (legacy Edit Dialog ~825–852).

## Approach (per locked decisions)

1. **Approach A — consolidate.** The Pencil reuses `MotoDetailsDialog` (already mounted on both
   pages) instead of the legacy dialog. `MotoDetailsDialog` gains an entry-in-edit flag so the
   Pencil lands directly on the editable form. This deletes ~30 lines per page of duplicated
   free-text form and removes the two-factory edit-drift surface entirely.

2. **Transmisión as static `<Select>`.** Two options only — `MANUAL`, `AUTOMÁTICA`. No
   `board_cod_transmision` table exists and none is created; this is a hardcoded enum in the
   component, consistent for both factories.

3. **Edit only.** The Add path is untouched in behavior. Because the Add dialog and the legacy Edit
   dialog SHARE state (`formData`, `initialFormData`, `handleAdd`, and the `Input`/`Label`/`Dialog`
   imports), the deletion of the Edit dialog must be surgical: remove only the edit-exclusive
   pieces (`isEditDialogOpen`, `editingId`, `openEditDialog`, `handleEdit`, the Edit `<Dialog>` JSX)
   and KEEP everything the Add dialog still consumes.

### Parity note
Two-factory parity is the existing component's responsibility: `MotoDetailsDialog` already handles
Bera vs Empire field differences (Bera carries `modelo`+`cod_modelo`/`color`+`cod_color`; Empire is
description-only with `version`) through the `variant`/`table` props. By routing edit through this
one component, parity is enforced structurally — there is no second copy of the form to drift.
The change must still be applied to BOTH page files (Pencil rewire + legacy-dialog deletion), per the
two-factories checklist.

## Risks
- **REAL RISK — deleting the legacy Edit Dialog can break "Add new moto."** Verified in code: Add
  (`isAddDialogOpen` / `handleAdd` / "Agregar Moto") is a SEPARATE dialog, but it shares
  `formData` + `initialFormData` state and the `Input`/`Label`/`Dialog` imports with the Edit
  dialog on both pages. A naive "delete the Edit block" that also strips shared state/imports or
  `handleAdd` will silently break Add. **Design must preserve the Add dialog and its shared
  dependencies**, removing only edit-exclusive symbols. This is the one item the design phase must
  call out explicitly and the verify phase must regression-check.
- Minor: confirm the on-screen Transmisión label casing/accent (`AUTOMÁTICA`) matches what the rest
  of the admin UI and any downstream consumers expect; values are written to the existing free-text
  `transmision` column unchanged.
