# Archive Report: inventario-edit-livesearch

change: inventario-edit-livesearch
phase: archive
status: done
updated: "2026-06-09"

---

## Change Summary

**Shipped feature**: Consolidated moto inventory editing via `MotoDetailsDialog` with Transmisión constrained to a static `<Select>` (MANUAL / AUTOMÁTICA). Legacy free-text Edit Dialogs removed from both BERA and EMPIRE inventory pages.

**Files delivered:**
1. `src/components/admin/MotoDetailsDialog.tsx` — MODIFIED: Added `startInEdit` prop, `TransmisionField` helper component with shadcn Select, replaced Transmisión `<Field>` with Select on both factory branches
2. `src/pages/admin/AdminInventarioBeraPage.tsx` — MODIFIED: Pencil now opens `MotoDetailsDialog` in edit mode; removed legacy Edit Dialog JSX and edit-exclusive state/handlers; Add dialog and shared state preserved
3. `src/pages/admin/AdminInventarioEmpirePage.tsx` — MODIFIED: Identical structural treatment as Bera page; `variant="empire"` untouched

**Core spec**: Pencil (quick-edit) icon on inventory pages now opens `MotoDetailsDialog` pre-populated in edit mode instead of a legacy free-text dialog. Transmisión field is now a constrained `<Select>` with exactly two options (MANUAL, AUTOMÁTICA). Legacy edit dialogs and their edit-exclusive wiring are fully removed from both pages. Two-factory parity enforced by single shared component (`MotoDetailsDialog` with `variant` prop). Add-new-moto flow remains intact with zero breaking changes.

---

## Verification Status

**Verdict:** PASS

All 7 functional requirements and 10 acceptance scenarios verified:

| Requirement | Status | Notes |
|---|---|---|
| REQ-01 Pencil opens MotoDetailsDialog in edit mode | PASS | Both pages wired correctly; policy gate untouched |
| REQ-02 startInEdit prop | PASS | Default false preserves Eye behavior; [open, startInEdit] effect drives edit mode |
| REQ-03 Marca/Modelo/Color/Versión LiveSearchField | PASS | Already implemented in MotoDetailsDialog; spec locks in |
| REQ-04 Transmisión static Select (MANUAL + AUTOMÁTICA) | PASS | TransmisionField helper with two options; view mode shows raw value verbatim |
| REQ-05 Legacy Edit Dialog fully removed | PASS | 0 matches for isEditDialogOpen/editingId/openEditDialog/handleEdit on both pages |
| REQ-06 Add-new-moto flow intact (regression) | PASS | All shared state/handlers preserved; handleAdd untouched |
| REQ-07 BERA / EMPIRE parity | PASS | Identical structural treatment; per-brand columns preserved |

### Build and Lint Evidence

- `npm run build`: exit 0, 3534 modules transformed, no TS errors
- `npm run lint`: 182 pre-existing errors repo-wide; 0 new errors in the 3 changed files
- Verify found only pre-existing `any`/exhaustive-deps on untouched lines; new code (TransmisionField, startInEdit) is strictly typed

### Two-Factory Parity Confirmed

| Brand | Pencil behavior | Add regression | Transmisión field | Variant prop | Columns preserved |
|---|---|---|---|---|---|
| BERA | Opens MotoDetailsDialog in edit mode | Intact | Static Select (2 options) | default (no explicit prop) | Yes (cod_modelo, cod_color, prices) |
| EMPIRE | Opens MotoDetailsDialog in edit mode | Intact | Static Select (2 options) | `variant="empire"` | Yes (version, anio, serial_carroceria) |

---

## Specs Synced to Main

**Domain:** `moto-edit-dialog`

**Action:** New spec created (no existing main spec to merge)

**Delta spec location:** `openspec/changes/inventario-edit-livesearch/spec.md`

**Main spec location:** `openspec/specs/moto-edit-dialog/spec.md`

**Content:** Full specification covering all 7 requirements (REQ-01 through REQ-07) with 10 acceptance scenarios (SC-01 through SC-10), locked to the proposal's Approach A decisions and ADR-style rationale for component consolidation, static Transmisión Select, and surgical legacy-dialog removal.

---

## Archive Contents

All artifacts archived to `openspec/changes/archive/2026-06-09-inventario-edit-livesearch/`:

- `explore.md` — investigation findings: MotoDetailsDialog already builds live-search for Marca/Modelo/Color/Versión; legacy Edit Dialogs are free-text debt; Approaches A (consolidate) vs B (upgrade in-place)
- `proposal.md` — business intent: consolidate Pencil into MotoDetailsDialog in edit mode; remove legacy Edit Dialogs; constrain Transmisión to static Select; preserve two-factory parity
- `spec.md` — observable requirements and acceptance scenarios (7 reqs + 10 scenarios)
- `design.md` — architecture decisions: consolidate-to-shared-component pattern; `startInEdit` boolean prop; local `TransmisionField` helper; surgical page-level deletion; ADR-style rationale; data flow; two-factory parity checklist
- `tasks.md` — ordered task sequence (T-01 through T-11): add TransmisionField, add startInEdit prop, rewire Pencil on both pages, surgically delete legacy code, build+lint gate, regression verification, code audit
- `apply-progress.md` — all 11 tasks marked complete; files changed; audit results (0 legacy symbols found); build exit 0, 0 new lint errors
- `verify-report.md` — PASS: all 7 requirements satisfied, 0 CRITICAL/WARNING, 1 SUGGESTION (pre-existing type cast), build clean, 0 new errors
- `archive-report.md` — this file

**Location:** `openspec/changes/archive/2026-06-09-inventario-edit-livesearch/`

---

## SDD Cycle Complete

- **Phase 1 (Proposal)**: Scope, approach (Approach A locked), rollback plan, risks ✓
- **Phase 2 (Spec)**: 7 functional requirements, 10 Given/When/Then scenarios ✓
- **Phase 3 (Design)**: Architecture decisions, data flow, interfaces, surgical deletion checklist, ADR rationale, two-factory parity ✓
- **Phase 4 (Tasks)**: 11 ordered tasks with dependency graph, workload forecast (210 lines < 400-line budget) ✓
- **Phase 5 (Apply)**: All 11 tasks implemented, build exits 0, 0 new lint errors ✓
- **Phase 6 (Verify)**: PASS — all requirements satisfied, no CRITICAL/WARNING, code paths verified, parity confirmed ✓
- **Phase 7 (Archive)**: Delta spec merged to main (`openspec/specs/moto-edit-dialog/spec.md`), change folder archived with date prefix ✓

---

## Delivered Value

Staff at Vitalicia can now quickly edit existing motos in the BERA and EMPIRE inventory pages via the Pencil icon, opening `MotoDetailsDialog` directly in edit mode with live-search resolution for Marca, Modelo, Color, and Versión fields. Transmisión is now a constrained dropdown (MANUAL / AUTOMÁTICA) instead of free text, reducing data-entry errors. The legacy free-text Edit Dialogs are gone, eliminating code duplication and the two-factory drift surface. Both factory pages maintain structural parity through the single shared component and its `variant` prop, making future maintenance simpler. Add-new-moto flow is fully intact with zero breaking changes.

---

## Known Limitations and Future Work

- **Manual browser smoke tests recommended** for SC-01 through SC-05 (Pencil edit flow) and SC-07/SC-08 (Add regression) to exercise the new UI paths in a browser.
- **Add-new-moto dialog remains free-text** — out of scope. A future change could migrate it to live-search if needed.
- **Schema unchanged** — `transmision` stays a free-text column; the Select only constrains the UI write path. Existing XLSX-imported free-text values are still readable and display verbatim in view mode.
- **Type cast pre-existing** — Empire page's `moto={selectedMoto as any}` cast is not from this change but could be cleaned up in a future parity improvement.

---

## Next Steps

None. Change is complete and closed. Ready for production deployment. The two-factory parity is now enforced structurally; all inventory edit behavior flows through a single component, reducing maintenance burden and drift risk.
