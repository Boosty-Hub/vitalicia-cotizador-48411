# Design — inventario-edit-livesearch

Architecture-level HOW for consolidating moto inventory editing onto `MotoDetailsDialog`,
constraining Transmisión to a static `<Select>`, and surgically removing the legacy free-text
Edit Dialog from both factory pages. This is design, not tasks — it fixes contracts, boundaries,
and exact symbol-level surgery; the tasks phase will sequence the edits.

## Architecture approach

**Pattern: consolidate-to-shared-component (Approach A, locked).** Editing already lives in one
shared, variant-aware component (`MotoDetailsDialog`) that uses `LiveSearchField` for
Marca/Modelo/Color/Versión and handles Bera vs Empire column differences via the `variant`/`table`
props. The two page-level legacy Edit Dialogs are duplicated free-text debt that bypass live-search
and re-implement the update payload per page (a two-factory drift surface).

The design removes the second copy of the edit form entirely and routes the Pencil (quick-edit)
action into the existing `MotoDetailsDialog`, which gains a single new entry-in-edit flag.

**Layering / boundaries (unchanged by this change):**
- Page (`AdminInventario{Bera,Empire}Page`) owns: data fetch, table, filters, pagination, the
  Add dialog, the Delete dialog, the policy/duplicate dialogs, and the selected-row + open state
  for `MotoDetailsDialog`. After this change the page no longer owns any edit form or edit payload.
- Component (`MotoDetailsDialog`) owns: view + edit of a single moto, the per-variant update
  payload (already present in `handleSave`), live-search field wiring, and now the Transmisión
  `<Select>`. It is the single source of truth for editing a moto on both factories.
- The DB write contract for edit is ALREADY in `MotoDetailsDialog.handleSave` (per-variant payload,
  `supabase.from(table).update(payload).eq("id", moto.id)`). This change deletes the page-level
  duplicate of that contract (`handleEdit` / `openEditDialog`), it does not add a new one.

## Component changes

### 1. `MotoDetailsDialog` — open-in-edit prop

**New optional prop: `startInEdit?: boolean`** (default `false`, so the Eye / view-mode entry is
unchanged).

Add to the `Props` interface:

```ts
interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  moto: MotoBera | null;
  table?: "bd_bera" | "bd_empire";
  variant?: "bera" | "empire";
  onUpdated?: () => void;
  startInEdit?: boolean; // NEW — when opened from the Pencil, land directly on the editable form
}
```

Destructure it in the component signature with a default:

```ts
export function MotoDetailsDialog({ open, onOpenChange, moto, table = "bd_bera", variant = "bera", onUpdated, startInEdit = false }: Props) {
```

**Wiring the flag into the existing `editing` state.** The component already drives edit mode via
the internal `editing` boolean and resets it in two effects. Edit-on-open must be applied when the
dialog transitions to open (and when the row changes while open), and MUST NOT fight the existing
"reset on close" behavior. Concretely:

- The effect keyed on `[moto?.id]` (currently `setDraft(moto); setEditing(false); setMarcaCode(null); ...`)
  changes its `setEditing(false)` to `setEditing(open && startInEdit)`. It already runs `setDraft(moto)`,
  which is exactly what the legacy `openEditDialog` did (seed the draft from the row).
- The effect keyed on `[open]` currently does `if (!open) { setTab("datos"); setEditing(false); }`.
  Extend it so that on OPEN it honors the flag: `if (!open) { setTab("datos"); setEditing(false); }
  else if (startInEdit) { setEditing(true); setTab("datos"); }`. This guarantees that re-opening the
  same row id (where the `[moto?.id]` effect does not re-fire) still lands in edit mode.

  Rationale: `[moto?.id]` covers "open a different row in edit"; `[open]` covers "re-open the same
  row in edit". Both paths must set `editing = true` only when `startInEdit` is true, so the Eye path
  (which passes `startInEdit` falsy/omitted) keeps opening in view mode.

- `startInEdit` should be added to the dependency array of the `[open]` effect (becomes
  `[open, startInEdit]`) so a stale closure does not read an old flag value. The `[moto?.id]` effect
  reads `open`/`startInEdit` too; include them in its dependency array as well, OR (preferred, lower
  risk) keep that effect keyed on `[moto?.id]` and rely on the `[open]` effect for the edit-mode
  decision so the seed-draft logic stays exactly as-is. Tasks should pick the single-effect approach
  (drive edit-mode only from the `[open, startInEdit]` effect) to avoid double-setting `editing`.

**No change** to the in-dialog Pencil/Editar button (lines ~426-437) — it still flips `editing`
to true for the view-mode entry path. `startInEdit` only changes the INITIAL state on open.

**Behavioral contract after change:**
- Eye button → `MotoDetailsDialog` opens in VIEW mode (unchanged).
- Pencil button → `MotoDetailsDialog` opens in EDIT mode (new).
- Closing and re-opening via Eye → view mode (the reset-on-close clears `editing`).

### 2. `MotoDetailsDialog` — Transmisión as static `<Select>`

Replace the plain Transmisión `<Field>` in BOTH variant branches with a constrained shadcn
`<Select>` bound to the `transmision` draft field. Two static options only: `MANUAL`, `AUTOMÁTICA`.

**Current locations to replace (both render the same Field):**
- Empire branch: line ~565
  `<Field icon={<Gauge .../>} label="Transmisión" value={view.transmision} editable editing={editing} onChange={(v) => setField("transmision", v)} />`
- Bera branch: line ~616 (identical Field).

**Approach: a small local `TransmisionField` helper inside `MotoDetailsDialog`** (not a change to
the generic `Field` leaf). Reason: `Field` is a tight, reused leaf (used by ~20 call sites and the
RMS tab); adding a `select` mode + options prop there would bloat a shared primitive for one field.
A dedicated local component keeps the change contained and preserves the exact `Field` visual shell
(border, label row, icon, editing ring) by reusing the same wrapper markup.

`TransmisionField` contract:

```tsx
const TRANSMISION_OPTIONS = ["MANUAL", "AUTOMÁTICA"] as const;

function TransmisionField({ value, editing, onChange }: {
  value?: string | null;
  editing?: boolean;
  onChange: (v: string) => void;
}) {
  // same outer <motion.div> wrapper + label row as Field (icon = Gauge, label = "Transmisión")
  // editing ? <Select> with the two SelectItems : <p> showing value or "Sin dato"
}
```

- In EDIT mode: render shadcn `Select` (`Select`, `SelectTrigger` + `SelectValue`, `SelectContent`,
  two `SelectItem` with values `"MANUAL"` and `"AUTOMÁTICA"`), bound `value={value ?? undefined}`,
  `onValueChange={onChange}`. Wire to draft via the existing `setField("transmision", v)`.
- In VIEW mode: render the same `<p>` empty/value display as `Field` (so a stored value that is not
  one of the two options — common from XLSX upload — still DISPLAYS verbatim; it just cannot be
  re-selected from the dropdown). This avoids hiding legacy free-text values.
- Import: add `Select, SelectContent, SelectItem, SelectTrigger, SelectValue` from
  `@/components/ui/select` at the top of `MotoDetailsDialog.tsx` (currently not imported there).

**Both branches** call `<TransmisionField value={view.transmision} editing={editing} onChange={(v) => setField("transmision", v)} />`. Parity is automatic — one component, two call sites that are identical.

**DB note (no migration):** `transmision` stays a free-text column on both `bd_bera` and `bd_empire`.
The Select only constrains what the EDIT UI can WRITE going forward; existing values are untouched
and still readable. `handleSave` already includes `transmision` in both payloads — no payload change.

**Label casing:** options are `MANUAL` and `AUTOMÁTICA` (accented), written verbatim to the column.
This matches the seed values noted in explore (MANUAL, AUTOMATICA) modulo the accent; the accent is
a display/value choice locked by the proposal. SEMI-AUTOMÁTICA is intentionally excluded (unconfirmed).

## Page changes — Pencil rewire + surgical legacy-dialog deletion

This is the #1 risk: the Add dialog and the legacy Edit dialog SHARE `formData`, `initialFormData`,
`handleAdd`, and the `Input`/`Label`/`Dialog`/`DialogFooter` imports. The deletion MUST remove only
edit-exclusive symbols and keep everything Add still consumes.

### Pencil onClick change (both pages)

The Pencil currently calls `onClick={() => openEditDialog(item)}` (Bera line ~820, Empire line ~747).
Change it to open `MotoDetailsDialog` in edit mode against that row, mirroring the Eye handler but
flagging edit:

```tsx
onClick={() => {
  setSelectedMoto(item);
  setIsMotoDialogOpen(true);
}}
```

…and pass `startInEdit` to the rendered `MotoDetailsDialog`. Because a single `MotoDetailsDialog`
instance serves BOTH Eye and Pencil, the dialog needs to know which intent opened it. Two acceptable
options; tasks pick ONE and apply it to both pages identically:

- **Option 1 (recommended): an `editIntent` state flag on the page.** Add
  `const [motoStartInEdit, setMotoStartInEdit] = useState(false);`. Eye handler sets it `false`;
  Pencil handler sets it `true`. Render `<MotoDetailsDialog ... startInEdit={motoStartInEdit} />`.
  Reset is not strictly required (the dialog's own reset-on-close clears `editing`), but for hygiene
  the dialog `onOpenChange` can set it back to `false` on close.
- **Option 2: keep edit/view as separate state by reusing `selectedMoto` + a dedicated boolean.**
  Functionally identical to Option 1; Option 1 is the minimal addition.

Net: Pencil no longer references `openEditDialog`; it sets `selectedMoto`, the edit-intent flag, and
opens `isMotoDialogOpen`.

### Symbols SAFE TO REMOVE (edit-exclusive) — per page

These exist ONLY to serve the legacy Edit dialog. After the Pencil rewire, all become orphaned and
must be deleted to keep the build clean (eslint unused-vars is off, but dead state/handlers are debt
and the proposal requires the legacy dialog gone):

**`AdminInventarioBeraPage.tsx`:**
1. State `const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);` (line 117).
2. State `const [editingId, setEditingId] = useState<string | null>(null);` (line 118).
3. Function `openEditDialog` (lines 304-324) — entire block.
4. Function `handleEdit` (lines 326-364) — entire block.
5. The legacy Edit `<Dialog>` JSX block, `{/* Edit Dialog */}` through its closing `</Dialog>`
   (lines 898-930).

**`AdminInventarioEmpirePage.tsx`:**
1. State `const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);` (line 106).
2. State `const [editingId, setEditingId] = useState<string | null>(null);` (line 107).
3. Function `openEditDialog` (lines 288-303) — entire block.
4. Function `handleEdit` (lines 305-338) — entire block.
5. The legacy Edit `<Dialog>` JSX block, `{/* Edit Dialog */}` through its closing `</Dialog>`
   (lines 825-852).

### Symbols that MUST BE KEPT (shared with Add) — do NOT remove

These are consumed by the Add dialog (`isAddDialogOpen` / `handleAdd` / "Agregar Moto") and would
silently break Add if stripped:

| Symbol | Why it must stay |
|---|---|
| `formData` / `setFormData` state | Add dialog inputs are bound to `formData`; `handleAdd` reads it. |
| `initialFormData` const | `handleAdd` resets via `setFormData(initialFormData)` after insert; also the `useState` initializer. |
| `handleAdd` | The Add dialog's Guardar button. |
| `isAddDialogOpen` / `setIsAddDialogOpen` | Add dialog open state + DialogTrigger. |
| `saving` / `setSaving` | Used by BOTH `handleAdd` and `handleSave`-in-dialog… **note:** `saving` is also used by the now-deleted `handleEdit`; it is STILL used by `handleAdd`, so KEEP it. |
| `Input` import | Add dialog inputs + the search box + (Bera) price inputs. Also used by the page search field. KEEP. |
| `Label` import | Add dialog field labels. KEEP. |
| `Dialog`, `DialogContent`, `DialogDescription`, `DialogFooter`, `DialogHeader`, `DialogTitle`, `DialogTrigger` imports | The Add dialog uses all of these. KEEP the whole import group. |
| `Pencil` import (lucide) | Still rendered as the Pencil button icon (now opens MotoDetailsDialog). KEEP. |
| `Plus`, `Loader2`, etc. | Add dialog / table. KEEP. |

**Critical gotcha for the deleter:** `saving` and `setSaving` look edit-related but are SHARED —
`handleAdd` uses them. Removing `handleEdit` must NOT remove the `saving` state. Likewise, do NOT
remove any `Dialog*` import: the Add dialog is ALSO a `<Dialog>` and reuses the identical import set.
The only JSX `<Dialog>` removed is the one under the `{/* Edit Dialog */}` comment, NOT the one under
`<DialogTrigger>` (Add) at the top of the page.

### What stays untouched on the page
- Add dialog (entire `{/* DialogTrigger ... Agregar Moto */}` block).
- Delete `AlertDialog`, `PolicyDetailsDialog`, `DuplicateWarningDialog`.
- `MotoDetailsDialog` render — only gains `startInEdit={...}` prop (Option 1).
- Eye button handler — unchanged (opens view mode; sets edit-intent flag to false in Option 1).
- `fetchData`, filters, pagination, CSV export.

### Bera-specific note (variant prop)
The Bera page renders `<MotoDetailsDialog ... table="bd_bera" onUpdated={fetchData} />` WITHOUT an
explicit `variant` prop (line 940-946), relying on the component default `variant="bera"`. This is
correct and stays. Empire passes `variant="empire"` explicitly (line 862-869). No change needed to
these except adding `startInEdit`.

## Data flow (edit, after change)

```
[Pencil click on row]
   -> page: setSelectedMoto(row); setMotoStartInEdit(true); setIsMotoDialogOpen(true)
   -> <MotoDetailsDialog open moto=row startInEdit table/variant onUpdated=fetchData>
        -> effect on [open, startInEdit]: setEditing(true), setDraft(moto)
        -> user edits via LiveSearchField (marca/modelo/color/version) + TransmisionField + Field inputs
        -> Guardar -> handleSave(): per-variant payload -> supabase.from(table).update(payload).eq(id)
        -> toast + setEditing(false) + onUpdated() (= fetchData)
```

The Eye flow is identical except `startInEdit` is false → opens in view mode → user may still click
the in-dialog Editar button.

## ADR-style decisions

### ADR-1: Reuse `MotoDetailsDialog` for edit instead of upgrading the legacy dialogs
- **Decision:** Route the Pencil into the existing `MotoDetailsDialog` with a new `startInEdit` flag;
  delete the legacy free-text Edit dialogs.
- **Rationale:** The component already implements live-search + per-variant payload + parity via
  `variant`. Upgrading the two legacy dialogs in place would re-add ~150 lines across two files and
  recreate the two-factory drift trap. Consolidation removes the second copy entirely.
- **Rejected — Approach B (upgrade legacy dialogs in place):** more code, duplicated logic across
  two pages, keeps a separate quick-edit surface that must be maintained in parallel. Locked out by
  the proposal.

### ADR-2: `startInEdit` boolean prop (not an `initialMode: "view" | "edit"` enum)
- **Decision:** Add a single `startInEdit?: boolean` defaulting to `false`.
- **Rationale:** There are exactly two states (view/edit) and the component already models edit as a
  boolean (`editing`). A boolean maps 1:1 to the existing internal state with zero translation; the
  default keeps the Eye path byte-for-byte unchanged. An enum would add ceremony for no gain.
- **Rejected:** `initialMode` enum (over-engineered for a binary); auto-detect edit from "row has no
  policy" (couples the dialog to policy state and breaks the explicit Eye-vs-Pencil intent).

### ADR-3: Transmisión as a local `TransmisionField`, not a new mode on the shared `Field`
- **Decision:** Add a small local `TransmisionField` in `MotoDetailsDialog`; do not add a `select`
  mode to the generic `Field` leaf.
- **Rationale:** `Field` is reused by ~20 call sites including the RMS tab; widening its prop surface
  with `options`/`as="select"` bloats a shared primitive for a single field. A local component keeps
  the blast radius to this file and preserves the `Field` visual shell by reusing its wrapper markup.
- **Rejected:** add `type="select"` + `options` to `Field` (pollutes a shared leaf); a brand-new
  generic `SelectField` in `components/ui` (premature abstraction for one two-option field).

### ADR-4: View mode renders the raw stored transmision value, edit mode constrains to two options
- **Decision:** In view mode show whatever is stored (verbatim, incl. legacy free-text from XLSX);
  in edit mode offer only MANUAL / AUTOMÁTICA.
- **Rationale:** Existing rows may hold arbitrary XLSX-imported strings. Hiding non-matching values
  in view mode would look like data loss. Constraining only the WRITE path is the minimal, safe change
  and aligns with "no migration".
- **Rejected:** force-mapping legacy values to the nearest option (silent data mutation); making the
  Select free-text-combobox (defeats the constraint the proposal asked for).

### ADR-5: Keep `saving` state on the page after deleting `handleEdit`
- **Decision:** Treat `saving`/`setSaving` as SHARED; keep them when removing `handleEdit`.
- **Rationale:** `handleAdd` reads/writes `saving`. This is the single most likely regression: a
  naive "delete everything `handleEdit` touched" would strip `saving` and break the Add button's
  spinner/disabled state (and throw on `setSaving` reference removal). Explicitly fenced here.
- **Rejected:** removing `saving` with the edit handler (breaks Add).

## Two-factory parity confirmation
- Both pages get the IDENTICAL treatment: Pencil rewire (set `selectedMoto` + edit-intent +
  open `isMotoDialogOpen`), deletion of the same five edit-exclusive symbols, and the
  `startInEdit` prop on `MotoDetailsDialog`.
- The Transmisión `<Select>` is added ONCE in the shared `MotoDetailsDialog` and serves both
  variants via the two identical call sites — there is no per-page Transmisión change.
- Column differences are already absorbed by `MotoDetailsDialog` (`variant`/`table`): Bera carries
  `modelo`+`cod_modelo`/`color`+`cod_color`/4 prices; Empire is `modelo`/`version`/`color`
  description-only with `anio`/`serial_carroceria`. This change does not touch those payloads.
- Parity checklist (from the two-factories skill): BOTH brands updated; each page keeps its REAL
  columns (no copy across); run `/check-twofactory` then `/lint-build` after apply.

## Risks / assumptions for downstream phases
- **REGRESSION RISK (highest): breaking Add when deleting the legacy Edit dialog.** Mitigated by the
  explicit keep/remove tables above. Verify phase MUST regression-check: open "Agregar Moto" on both
  pages, fill fields, save, confirm insert + toast + dialog close + list refresh.
- **Re-open-same-row edit:** if edit-mode were driven only off `[moto?.id]`, re-opening the SAME row
  via Pencil after viewing it would not re-enter edit mode (id unchanged → effect skips). The design
  drives edit-mode off `[open, startInEdit]` to cover this. Tasks must implement that single-effect
  decision, not the id-only effect.
- **Transmisión legacy values:** view mode must show non-option values verbatim (ADR-4). Assumption:
  no downstream consumer requires the exact previous casing of newly-edited values; new writes use
  `MANUAL` / `AUTOMÁTICA`.
- **Unused-import lint:** project eslint has unused-vars OFF and TS non-strict, so leftover unused
  symbols would not fail the build — but the proposal requires the legacy dialog and its wiring GONE,
  so removal is mandatory for cleanliness, not just lint.
- **No schema/migration, no `LiveSearchField` table-union change, no Add-dialog live-search** — all
  out of scope per proposal.
