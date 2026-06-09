# Tasks: inventario-duplicados-popup

change: inventario-duplicados-popup
phase: tasks
status: done
updated: "2026-06-09"

---

## Ordered Task Checklist

Tasks are listed in dependency order. Tasks with no dependency on each other at the same
sequence level can run in parallel.

---

### [x] T-01 — Create `DuplicateWarningDialog` shared component

**Sequence:** 1 (no upstream dep — first to be written)
**Parallel with:** nothing; T-02 and T-03 depend on this file existing
**File:** `src/components/admin/DuplicateWarningDialog.tsx` (NEW)

**What to implement:**
- Export `DuplicateRow`, `DuplicateColumnsConfig`, `DuplicateWarningDialogProps` interfaces
  exactly as specified in `design.md § Interfaces / Contracts`.
- Render a Radix/shadcn `Dialog` with title "Duplicados detectados" (or semantic equivalent).
- Body: a read-only list of `rows` (max 50 entries). Columns rendered per the generic keys
  from the passed `columns` config: `placa`, `columns.modelOf(row)`, year via
  `row[columns.yearKey]`, serial via `row[columns.serialKey]`. Column headers in Spanish
  per spec (Placa, Modelo, Año/Año modelo, Serial Chasis/Serial Carrocería).
- When `totalCount > rows.length`, render "hay N más" legend where
  `N = totalCount - rows.length`.
- Footer: primary button "Ver duplicados" → calls `onViewDuplicates()`; secondary button
  "Entendido" → calls `onOpenChange(false)`.
- NO Supabase import, NO brand-specific column names inside this file.
- NO delete/merge/edit actions anywhere in the component.

**Spec requirements satisfied:**
- "Dialog is read-only and lists up to 50 rows"
- "Per-brand column sets — no drift between BERA and EMPIRE"
- "Ver duplicados applies the existing filter and closes the dialog"
- "Entendido dismisses the dialog"
- "Spanish UI copy throughout"
- "Component is variant-driven with no hardcoded columns"

---

### [x] T-02 — Wire BERA inventory page

**Sequence:** 2 (after T-01)
**Parallel with:** T-03 (can be done simultaneously with T-03 once T-01 is done)
**File:** `src/pages/admin/AdminInventarioBeraPage.tsx` (MODIFY)

**What to implement:**

1. Add state at top of component (after existing `useState` lines):
   ```ts
   const [dupRows, setDupRows]   = useState<DuplicateRow[]>([]);
   const [dupCount, setDupCount] = useState(0);
   const [dupOpen, setDupOpen]   = useState(false);
   ```

2. Define the BERA column config (module-level const, above component):
   ```ts
   const DUP_KEY = "dup-warning-bera";
   const DUP_COLUMNS: DuplicateColumnsConfig = {
     yearKey: "anio_modelo",
     serialKey: "serial_chasis",
     serialLabel: "Serial Chasis",
     modelOf: (r) => String(r.modelo ?? "—"),
   };
   ```

3. Add mount-only effect (deps: `[]`, independent of `fetchData`):
   - Guard: if `sessionStorage.getItem(DUP_KEY)` is set, return early — skip the query.
   - Query: `supabase.from("bd_bera").select("id,placa,marca,modelo,anio_modelo,serial_chasis", { count: "exact" }).eq("es_duplicado", true).limit(50)`
   - On result: call `setDupRows`, `setDupCount`, `setDupOpen(true)`,
     `sessionStorage.setItem(DUP_KEY, "1")` — only if `count > 0`.
   - Use a `cancelled` flag for cleanup (avoid state update on unmounted component).

4. Render `<DuplicateWarningDialog>` in JSX (near bottom of return, alongside other dialogs):
   ```tsx
   <DuplicateWarningDialog
     variant="bera"
     open={dupOpen}
     onOpenChange={setDupOpen}
     rows={dupRows}
     totalCount={dupCount}
     columns={DUP_COLUMNS}
     onViewDuplicates={() => {
       setFilterDuplicados("duplicados");
       setCurrentPage(1);
       setDupOpen(false);
     }}
   />
   ```

**Spec requirements satisfied:**
- "Popup appears on mount if and only if duplicates exist"
- "Popup is suppressed for the rest of the browser session after first display"
  (BERA key: `dup-warning-bera`)
- "No Supabase query is made for the upload-flow RPCs"
- "Ver duplicados applies the existing filter" → wired to `setFilterDuplicados("duplicados")`
- "Per-brand column sets — BERA shows `anio_modelo` / `serial_chasis`"

---

### [x] T-03 — Wire EMPIRE inventory page

**Sequence:** 2 (after T-01, parallel with T-02)
**Parallel with:** T-02
**File:** `src/pages/admin/AdminInventarioEmpirePage.tsx` (MODIFY)

**What to implement** (exact mirror of T-02 with EMPIRE schema):

1. Same three state vars (`dupRows`, `dupCount`, `dupOpen`).

2. EMPIRE column config:
   ```ts
   const DUP_KEY = "dup-warning-empire";
   const DUP_COLUMNS: DuplicateColumnsConfig = {
     yearKey: "anio",
     serialKey: "serial_carroceria",
     serialLabel: "Serial Carrocería",
     modelOf: (r) => [r.modelo, r.version].filter(Boolean).join(" ") || "—",
   };
   ```

3. Mount-only effect with `sessionStorage` guard; query from `"bd_empire"`, select
   `"id,placa,marca,modelo,version,anio,serial_carroceria"` — NOT `anio_modelo` or
   `serial_chasis`.

4. Render `<DuplicateWarningDialog variant="empire" ... />` with EMPIRE config.

**Spec requirements satisfied:**
- All mounting / suppression requirements (EMPIRE key: `dup-warning-empire`)
- "Per-brand column sets — EMPIRE shows `anio` / `serial_carroceria` / `version`"
- "BERA suppression does not affect EMPIRE" (independent key)
- Two-factory parity: EMPIRE wiring mirrors BERA structurally, uses only EMPIRE columns

**Two-factory trap check:** `anio_modelo` → `anio`, `serial_chasis` → `serial_carroceria`,
`version` is EMPIRE-only (added to select and to `modelOf`). No BERA columns appear here.

---

### [x] T-04 — Verification gate

**Sequence:** 3 (after T-02 and T-03)
**Parallel with:** nothing; final gate
**Files:** none created — run commands and do mental check

**Steps:**

1. Set PATH: `export PATH="/c/Program Files/nodejs:$PATH"`
2. `npm run lint` — must exit with no new errors in the three changed files.
3. `npm run build` — must exit with code 0, no TypeScript errors.
4. `/check-twofactory` mental check:
   - BERA page uses only: `anio_modelo`, `serial_chasis`, `"bd_bera"`, `"dup-warning-bera"`
   - EMPIRE page uses only: `anio`, `serial_carroceria`, `version`, `"bd_empire"`, `"dup-warning-empire"`
   - `DuplicateWarningDialog.tsx` contains none of: `anio_modelo`, `serial_chasis`, `anio`,
     `serial_carroceria`, `version`, `bd_bera`, `bd_empire` — it is column-agnostic.
5. Manual smoke note (dev server):
   - Open BERA inventory — popup appears if duplicates exist; "Ver duplicados" filters;
     "Entendido" closes; reloading same page does NOT re-show popup (sessionStorage gate).
   - Open EMPIRE inventory — same checks, independent suppression key.
   - Confirm no popup when count = 0.
   - Confirm "hay N más" legend appears when count > 50 (requires test data or mocked).

**Spec requirements satisfied:**
- "Build and lint pass with no new errors"
- Two-factory parity enforced

---

## Dependency Graph

```
T-01 (DuplicateWarningDialog)
  ├── T-02 (BERA page)  ──┐
  └── T-03 (EMPIRE page) ─┴─► T-04 (Verification)
```

T-02 and T-03 can be implemented in parallel once T-01 is done.

---

## Review Workload Forecast

| Metric | Estimate |
|---|---|
| New file: `DuplicateWarningDialog.tsx` | ~90–110 lines |
| Modified: `AdminInventarioBeraPage.tsx` | +40–50 lines (state + effect + dialog mount) |
| Modified: `AdminInventarioEmpirePage.tsx` | +40–50 lines (same pattern) |
| **Total estimated changed lines** | **~170–210 lines** |
| Exceeds 400-line budget? | **No** |
| Chained PRs recommended? | **No** — fits comfortably in a single PR |
| Decision needed before apply? | **No** |

All changes are front-end only. No migration, no new Supabase RPC, no new npm dependency.
The three files are loosely coupled: `DuplicateWarningDialog` is presentational, each page
integration is isolated to its own file. Single PR is the right delivery unit.
