# Spec — inventario-edit-livesearch

_What MUST be true after this change is applied. No implementation details — observable
outcomes only._

---

## REQ-01 — Pencil opens MotoDetailsDialog in edit mode

**Scope:** `AdminInventarioBeraPage`, `AdminInventarioEmpirePage`.

After the change:

- Clicking the Pencil (quick-edit) icon on any moto row with no active policy opens
  `MotoDetailsDialog` pre-populated with that row's current values AND immediately in editing
  state (fields are editable without requiring a secondary "Edit" button click).
- The legacy free-text Edit Dialog is NOT rendered on either page (no JSX, no
  import-only-used-by-it code).
- The Pencil icon's visibility rule is unchanged: it appears only on rows where no active policy
  is linked.

---

## REQ-02 — MotoDetailsDialog gains an open-in-edit prop

After the change:

- `MotoDetailsDialog` accepts a prop (name chosen by design, e.g. `startInEdit`) that, when
  truthy, causes the dialog to open with its internal editing state already active.
- When the prop is falsy or absent the dialog opens in view mode, preserving existing behavior
  (opened from row-click / policy details).
- The prop has no effect on the save/cancel/close contract — those behave identically regardless
  of how editing was entered.

---

## REQ-03 — Marca, Modelo, Color, Versión use LiveSearchField inside the edit form

After the change (noting this is already implemented in MotoDetailsDialog — spec locks it in):

- In edit mode, Marca, Modelo, Color, and Versión are rendered as live-search inputs that accept
  a description as the visible text and store/save the corresponding code to the database.
- No free-text raw `<Input>` for these four fields remains on any edit path.
- BERA stores `cod_modelo` + `modelo` and `cod_color` + `color`. EMPIRE stores description-only
  (`modelo`, `color`, `version`). Both resolve through the same `MotoDetailsDialog` component
  using its existing `variant` prop.

---

## REQ-04 — Transmisión is a static Select with exactly two options

After the change:

- In edit mode, the Transmisión field is a `<Select>` (shadcn/ui) containing exactly two options:
  `MANUAL` and `AUTOMÁTICA` (with accent on the A).
- No other transmisión values are presentable via the UI dropdown.
- The selected value is written as-is to the `transmision` column (free-text column, unchanged
  schema) on save.
- Transmisión is NOT a LiveSearchField — no lookup table, no code/description pair.
- The existing free-text `<Input>` for Transmisión in `MotoDetailsDialog` is removed.

---

## REQ-05 — Legacy Edit Dialog is fully removed from both page files

After the change:

- `AdminInventarioBeraPage.tsx` contains no JSX block that was the legacy Edit Dialog (~lines
  899–930 at time of proposal).
- `AdminInventarioEmpirePage.tsx` contains no JSX block that was the legacy Edit Dialog (~lines
  825–852 at time of proposal).
- Symbols that were EXCLUSIVELY used by the legacy Edit Dialog (e.g. `isEditDialogOpen`,
  `editingId`, `openEditDialog`, `handleEdit`) are removed.
- Symbols shared with the Add dialog (`formData`, `initialFormData`, `handleAdd`,
  `Input`/`Label`/`Dialog` imports) are RETAINED.
- `npm run build` and `npm run lint` pass with no errors referencing these removals.

---

## REQ-06 — Add-new-moto flow continues to work on both pages (regression)

After the change:

- The "Agregar Moto" button on both pages opens the Add dialog with an empty form.
- Filling in all fields and submitting creates a new row in `bd_bera` / `bd_empire` respectively.
- Cancelling the Add dialog leaves the table unchanged.
- No console errors or runtime crashes occur during the Add flow.

---

## REQ-07 — BERA and EMPIRE parity

After the change:

- Every observable edit behavior described in REQ-01 through REQ-06 applies identically to both
  `AdminInventarioBeraPage` and `AdminInventarioEmpirePage`.
- No edit-related state, handler, or JSX block differs between the two pages in a way that would
  cause behavioral drift (structural differences due to schema — e.g. BERA code columns — are
  acceptable and are handled inside `MotoDetailsDialog` via the `variant` prop).

---

## Acceptance Scenarios

### SC-01 — Pencil opens edit form pre-populated (BERA)

**Given** I am on the Admin Inventario Bera page  
**And** a row exists for a moto with no linked active policy  
**When** I click the Pencil icon on that row  
**Then** MotoDetailsDialog opens  
**And** the dialog shows that moto's current Marca, Modelo, Color, and Transmisión values  
**And** the form fields are immediately editable (no secondary "Edit" click required)

### SC-02 — Pencil opens edit form pre-populated (EMPIRE, parity)

**Given** I am on the Admin Inventario Empire page  
**And** a row exists for a moto with no linked active policy  
**When** I click the Pencil icon on that row  
**Then** MotoDetailsDialog opens in edit mode with that moto's values pre-populated  
**And** the Versión live-search field is visible and editable (EMPIRE-only field)

### SC-03 — Marca live-search in edit mode resolves code

**Given** MotoDetailsDialog is open in edit mode  
**When** I type a partial marca description into the Marca field  
**Then** a dropdown shows matching descripcion values from `board_cod_marca`  
**When** I select one  
**Then** the visible label shows the description  
**And** on save, `marca` (BERA: also `cod_modelo` where applicable) is written with the resolved code

### SC-04 — Transmisión shows exactly two options

**Given** MotoDetailsDialog is open in edit mode  
**When** I open the Transmisión select  
**Then** exactly two options are visible: "MANUAL" and "AUTOMÁTICA"  
**And** no other option or free-text input is available for this field

### SC-05 — Transmisión value is persisted correctly

**Given** a moto currently has transmisión value "MANUAL"  
**When** I open it via Pencil, change Transmisión to "AUTOMÁTICA", and save  
**Then** the `transmision` column in the database is updated to "AUTOMÁTICA"  
**And** the table row reflects the new value after the dialog closes

### SC-06 — Legacy Edit Dialog is absent from the DOM

**Given** both inventory pages are loaded  
**When** I inspect the page DOM or source  
**Then** no dialog element associated with the legacy free-text edit form is present  
**And** no state variables `isEditDialogOpen` or `editingId` exist in page scope

### SC-07 — Add-new-moto flow is unbroken (BERA regression)

**Given** I am on the Admin Inventario Bera page  
**When** I click "Agregar Moto"  
**Then** the Add dialog opens with empty fields  
**When** I fill in all required fields and submit  
**Then** a new row appears in the `bd_bera` table  
**And** no console errors occur

### SC-08 — Add-new-moto flow is unbroken (EMPIRE regression)

**Given** I am on the Admin Inventario Empire page  
**When** I click "Agregar Moto"  
**Then** the Add dialog opens with empty fields  
**When** I fill in all required fields (including Versión) and submit  
**Then** a new row appears in the `bd_empire` table  
**And** no console errors occur

### SC-09 — MotoDetailsDialog view-mode unaffected

**Given** MotoDetailsDialog is opened from a row click (not the Pencil)  
**Then** it opens in view mode (fields are read-only by default)  
**And** editing is only activated by an explicit in-dialog action  
**And** no regressions in view-mode behavior are present

### SC-10 — Build and lint pass

**Given** all changes are applied  
**When** `npm run build` is executed  
**Then** it exits with code 0 and no TypeScript or module-resolution errors  
**When** `npm run lint` is executed  
**Then** it exits with code 0 and no new lint errors relative to the baseline

---

## Out-of-scope (locked)

- Add-new-moto live-search migration
- Schema / migration changes (transmisión stays free-text in DB)
- LiveSearchField table union extension
- XLSX bulk-upload pages (`/carga-bera`, `/carga-empire`)
- Pricing pages (`AdminPreciosEmpirePage`)
- Delete, policy-details, or duplicate-warning flows
- BERA-only price columns

---

## Verification method

No automated test runner is configured. Acceptance is:

1. **Observable behavior** — all SC-01–SC-09 can be manually exercised via browser.
2. **Build gate** — SC-10: `npm run build` and `npm run lint` pass clean.
3. **Code audit** — `sdd-verify` confirms REQ-05 (no legacy dialog JSX remains) and REQ-07
   (parity) by inspecting both page files and `MotoDetailsDialog`.
