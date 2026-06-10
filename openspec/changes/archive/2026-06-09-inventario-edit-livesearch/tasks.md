# Tasks — inventario-edit-livesearch

_Ordered, dependency-aware implementation checklist. Execute sequentially unless marked parallel-safe._

---

## Review Workload Forecast

| Metric | Estimate |
|---|---|
| Files touched | 3 |
| `MotoDetailsDialog.tsx` (~810 lines) — net add | ~45 lines |
| `AdminInventarioBeraPage.tsx` (~964 lines) — net delete | ~80 lines removed, ~5 added |
| `AdminInventarioEmpirePage.tsx` (~887 lines) — net delete | ~75 lines removed, ~5 added |
| **Total changed lines (adds + deletes)** | **~210 lines** |
| Exceeds 400-line budget? | **No** |
| Chained PRs recommended? | **No** |
| Decision needed before apply? | **No** |

Delivery strategy `ask-on-risk`: budget is well under 400. All work ships in a single PR.

---

## Task Sequence

### [x] T-01 — Add `TransmisionField` local helper to `MotoDetailsDialog`

**File:** `src/components/admin/MotoDetailsDialog.tsx`
**Satisfies:** REQ-04 (SC-04, SC-05)
**Depends on:** nothing (self-contained addition, no call sites yet)
**Parallel-safe:** Yes — can be done alongside T-02; both touch `MotoDetailsDialog` but at
non-overlapping locations. Do T-01 and T-02 as a single commit in this file.

Steps:
1. Add import at top of file:
   `import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";`
2. Define the constant and helper component (before the main `MotoDetailsDialog` function):
   ```tsx
   const TRANSMISION_OPTIONS = ["MANUAL", "AUTOMÁTICA"] as const;

   function TransmisionField({ value, editing, onChange }: {
     value?: string | null;
     editing?: boolean;
     onChange: (v: string) => void;
   }) {
     // same outer wrapper structure as the generic Field: motion.div + label row (Gauge icon + "Transmisión")
     // editing branch: <Select value={value ?? undefined} onValueChange={onChange}>
     //   two <SelectItem> with value="MANUAL" and value="AUTOMÁTICA"
     // view branch: <p> showing value or "Sin dato" — verbatim, including legacy free-text from XLSX
   }
   ```
3. Do NOT touch any existing `Field` component or its call sites yet.

Verification: file compiles in isolation (no TS error, no missing import).

---

### [x] T-02 — Replace Transmisión `<Field>` call sites with `<TransmisionField>`

**File:** `src/components/admin/MotoDetailsDialog.tsx`
**Satisfies:** REQ-04 (SC-04, SC-05)
**Depends on:** T-01 (helper must exist first)
**Parallel-safe:** Combine with T-01 into one atomic commit on this file.

Steps:
1. Locate the Transmisión `<Field>` in the **Empire branch** (~line 565):
   `<Field icon={<Gauge .../>} label="Transmisión" value={view.transmision} editable editing={editing} onChange={(v) => setField("transmision", v)} />`
   Replace with:
   `<TransmisionField value={view.transmision} editing={editing} onChange={(v) => setField("transmision", v)} />`
2. Locate the identical `<Field>` in the **Bera branch** (~line 616). Apply the same replacement.
3. Confirm exactly two call sites replaced, no other Transmisión fields altered.

Verification: both branches compile; the existing `transmision` payload in `handleSave` is
unchanged (no payload edit needed per design).

---

### [x] T-03 — Add `startInEdit` prop to `MotoDetailsDialog` and wire into effects

**File:** `src/components/admin/MotoDetailsDialog.tsx`
**Satisfies:** REQ-02 (SC-09)
**Depends on:** T-01/T-02 complete (same file — combine all three into one commit or at minimum
finish T-01+T-02 before this to keep a clean edit history)
**Parallel-safe:** No — must be the final edit to `MotoDetailsDialog` before moving to page files.

Steps:
1. Add to the `Props` interface:
   `startInEdit?: boolean;`
2. Destructure with default in the component signature:
   `{ ..., startInEdit = false }: Props`
3. Find the effect keyed on `[open]` (currently: `if (!open) { setTab("datos"); setEditing(false); }`).
   Extend it to handle the open branch:
   ```ts
   if (!open) {
     setTab("datos");
     setEditing(false);
   } else if (startInEdit) {
     setEditing(true);
     setTab("datos");
   }
   ```
   Update the dependency array to `[open, startInEdit]`.
4. The effect keyed on `[moto?.id]` currently calls `setEditing(false)`. Leave it as-is — the
   `[open, startInEdit]` effect is the single authority for edit-mode on open. Do NOT also change
   `setEditing` in the `[moto?.id]` effect (avoid double-set, per design note).
5. The existing in-dialog Pencil/Editar button is NOT changed — it continues to set `editing = true`
   for users who enter via the Eye/view path.

Verification: Eye path (`startInEdit` omitted/false) still opens view mode; Pencil path (next tasks)
will confirm edit mode.

---

### [x] T-04 — Add edit-intent state on `AdminInventarioBeraPage` and rewire Pencil button

**File:** `src/pages/admin/AdminInventarioBeraPage.tsx`
**Satisfies:** REQ-01 (SC-01), REQ-07
**Depends on:** T-03 complete (prop must exist before it is consumed)
**Parallel-safe:** No dependency with T-05, but keep sequential to audit each page individually.

Steps:
1. Add state declaration near the existing `isMotoDialogOpen` state:
   `const [motoStartInEdit, setMotoStartInEdit] = useState(false);`
2. Locate the Eye (view) button handler. If it sets `setIsMotoDialogOpen(true)` / `setSelectedMoto(item)`,
   add `setMotoStartInEdit(false)` before it opens the dialog (or ensure it is already false).
3. Locate the Pencil button (`onClick={() => openEditDialog(item)}`, ~line 820). Replace with:
   ```tsx
   onClick={() => {
     setSelectedMoto(item);
     setMotoStartInEdit(true);
     setIsMotoDialogOpen(true);
   }}
   ```
4. Find the `<MotoDetailsDialog ... />` render (~lines 940–946). Add the prop:
   `startInEdit={motoStartInEdit}`
5. On the dialog's `onOpenChange` handler, reset the flag on close:
   ```tsx
   onOpenChange={(v) => {
     setIsMotoDialogOpen(v);
     if (!v) setMotoStartInEdit(false);
   }}
   ```
   (or inline — match existing style).

Verification: Pencil handler no longer references `openEditDialog`; TSC accepts the new prop.

---

### [x] T-05 — Add edit-intent state on `AdminInventarioEmpirePage` and rewire Pencil button

**File:** `src/pages/admin/AdminInventarioEmpirePage.tsx`
**Satisfies:** REQ-01 (SC-02), REQ-07
**Depends on:** T-03 complete
**Parallel-safe:** T-04 and T-05 touch different files — they CAN run in parallel, but sequential
is safer for review. Do T-05 immediately after T-04 using the identical pattern.

Steps (identical structure to T-04, Empire-specific details):
1. Add `const [motoStartInEdit, setMotoStartInEdit] = useState(false);` near `isMotoDialogOpen`.
2. Eye handler: ensure `setMotoStartInEdit(false)` on view-open.
3. Pencil button (~line 747): replace `onClick={() => openEditDialog(item)}` with same three-line block.
4. `<MotoDetailsDialog ... variant="empire" ... />` (~lines 862–869): add `startInEdit={motoStartInEdit}`.
5. `onOpenChange`: reset flag on close.

Note: Empire passes `variant="empire"` explicitly; Bera relies on the default. Do NOT add or remove
the `variant` prop — match what already exists per the design's Bera-specific note.

Verification: Pencil handler no longer references `openEditDialog`; prop accepted; variant untouched.

---

### [x] T-06 — Delete legacy Edit Dialog and edit-exclusive symbols from `AdminInventarioBeraPage`

**File:** `src/pages/admin/AdminInventarioBeraPage.tsx`
**Satisfies:** REQ-05, REQ-06 (regression prevention via careful scoping), REQ-07 (SC-06)
**Depends on:** T-04 complete (Pencil must already NOT reference `openEditDialog` before we delete it)
**Parallel-safe:** No — T-04 must be committed and verified first.

Remove exactly these five categories of symbols (in order, bottom-up to avoid dangling refs):

1. **Legacy Edit Dialog JSX** (`{/* Edit Dialog */}` block, ~lines 898–930) — the entire `<Dialog>` element
   and its contents. This is the first removal because deleting JSX top-down leaves the handlers
   temporarily dangling.
2. **`handleEdit` function** (~lines 326–364) — entire block.
3. **`openEditDialog` function** (~lines 304–324) — entire block.
4. **`const [editingId, setEditingId]` state** (line ~118).
5. **`const [isEditDialogOpen, setIsEditDialogOpen]` state** (line ~117).

Explicit KEEP checklist — confirm each still exists after the edit:
- [ ] `formData` / `setFormData` state
- [ ] `initialFormData` const
- [ ] `handleAdd` function
- [ ] `isAddDialogOpen` / `setIsAddDialogOpen` state
- [ ] `saving` / `setSaving` state (critical — shared with `handleAdd`)
- [ ] All `Dialog*`, `Input`, `Label` imports
- [ ] `Pencil` import (icon still used in the button)

Verification: `npm run build` shows no TS error for this file; Add dialog JSX still in DOM.

---

### [x] T-07 — Delete legacy Edit Dialog and edit-exclusive symbols from `AdminInventarioEmpirePage`

**File:** `src/pages/admin/AdminInventarioEmpirePage.tsx`
**Satisfies:** REQ-05, REQ-06, REQ-07 (SC-06)
**Depends on:** T-05 complete (same rationale as T-06/T-04)
**Parallel-safe:** T-06 and T-07 touch different files — CAN run in parallel after their respective
rewire tasks (T-04/T-05) are done. Sequential is still recommended for easier bisect.

Remove exactly these five categories (Empire-specific line numbers, same structure as T-06):
1. Legacy Edit Dialog JSX (`{/* Edit Dialog */}`, ~lines 825–852).
2. `handleEdit` function (~lines 305–338).
3. `openEditDialog` function (~lines 288–303).
4. `const [editingId, setEditingId]` state (line ~107).
5. `const [isEditDialogOpen, setIsEditDialogOpen]` state (line ~106).

Same KEEP checklist as T-06 applies.

Verification: `npm run build` no error; Add dialog intact.

---

### [x] T-08 — Build and lint gate

**Files:** all changed files
**Satisfies:** REQ-05 (SC-10), REQ-07
**Depends on:** T-01 through T-07 complete
**Parallel-safe:** Terminal step — run after all edits.

```sh
export PATH="/c/Program Files/nodejs:$PATH"
npm run lint
npm run build
```

Both must exit 0 with no new errors. Fix any surfaced issues before marking done.

---

### [x] T-09 — Verify regression: Add-new-moto flow (both factories)

**Satisfies:** REQ-06 (SC-07, SC-08)
**Depends on:** T-08 passing
**Parallel-safe:** Verification step — runs after gate.

Manual browser check on the running dev server:

**BERA:**
1. Open Admin Inventario Bera.
2. Click "Agregar Moto" → Add dialog opens with empty fields.
3. Fill all required fields and click Guardar → new row appears in `bd_bera`; toast shown; dialog closes.
4. Click Cancel on a fresh open → table unchanged; no console errors.

**EMPIRE:**
1. Open Admin Inventario Empire.
2. Click "Agregar Moto" → Add dialog opens with empty fields including Versión.
3. Fill all required fields and submit → new row in `bd_empire`; toast; dialog closes.
4. Cancel → table unchanged.

This is the highest-risk regression (T-06/T-07 delete symbols near shared Add state). If any failure
occurs, check `saving`, `formData`, `handleAdd`, and `Dialog*` imports per the design keep-list.

---

### [x] T-10 — Verify parity: Pencil edit flow (both factories)

**Satisfies:** REQ-01, REQ-02, REQ-03, REQ-04 (SC-01 through SC-05)
**Depends on:** T-08 passing
**Parallel-safe:** Can run in parallel with T-09.

Manual browser check:

**BERA (SC-01):**
1. Click Pencil on a row with no active policy → `MotoDetailsDialog` opens immediately in edit mode
   (no secondary click needed).
2. Fields Marca, Modelo, Color are live-search inputs; Transmisión shows a `<Select>` with exactly
   two options (MANUAL, AUTOMÁTICA).
3. Change Transmisión and save → DB row updated; table refreshed.

**EMPIRE (SC-02):**
1. Click Pencil → dialog opens in edit mode; Versión live-search visible.
2. Same Transmisión `<Select>` with two options.
3. Save → DB updated.

**View-mode regression (SC-09):**
1. Click the Eye (row-click or Eye button) → dialog opens in VIEW mode (read-only).
2. Editing only activates via the in-dialog Editar button.

**Two-factory parity check:**
- Confirm identical Pencil behavior on both pages.
- Confirm MotoDetailsDialog `variant="empire"` is still present on Empire; Bera still uses default.

---

### [x] T-11 — Code audit: no legacy dialog artifacts remain (sdd-verify gate)

**Satisfies:** REQ-05, REQ-07 (SC-06, SC-10)
**Depends on:** T-08 passing
**Parallel-safe:** Can run alongside T-09/T-10.

Automated search (run from repo root):

```sh
# Must return 0 matches in the two inventory pages
rg "isEditDialogOpen|editingId|openEditDialog|handleEdit" \
  src/pages/admin/AdminInventarioBeraPage.tsx \
  src/pages/admin/AdminInventarioEmpirePage.tsx

# Must confirm startInEdit prop present in both pages
rg "startInEdit" \
  src/pages/admin/AdminInventarioBeraPage.tsx \
  src/pages/admin/AdminInventarioEmpirePage.tsx

# Must confirm TransmisionField defined once in MotoDetailsDialog
rg "TransmisionField" src/components/admin/MotoDetailsDialog.tsx
```

All three checks must pass before declaring the change complete.

---

## Task Dependency Summary

```
T-01 ──┐
T-02 ──┤ (same file, one commit)
T-03 ──┘
         └──> T-04 ──> T-06 ──┐
         └──> T-05 ──> T-07 ──┤
                               └──> T-08 ──> T-09
                                          └──> T-10
                                          └──> T-11
```

Sequential chain: T-01/02/03 → T-04 → T-05 → T-06 → T-07 → T-08 → T-09/T-10/T-11  
T-09, T-10, T-11 can run in parallel after T-08.  
T-04 and T-05 can run in parallel after T-03 (different files), but sequential is recommended for
easier diff review.

---

## Two-Factory Parity Checklist (from two-factories skill)

Before marking the change done:
- [x] BOTH AdminInventarioBeraPage AND AdminInventarioEmpirePage have been updated (T-04–T-07)
- [x] Each page keeps its REAL column set — no column names copied across schemas
- [x] `MotoDetailsDialog` change is ONE component serving both variants (no per-page Transmisión change)
- [x] Empire still passes `variant="empire"` explicitly; Bera still uses default
- [x] Lint and build pass (`/lint-build` equivalent = T-08)
