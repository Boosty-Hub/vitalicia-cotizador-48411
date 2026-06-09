# Archive Report: inventario-duplicados-popup

change: inventario-duplicados-popup
phase: archive
status: done
updated: "2026-06-09"

---

## Change Summary

**Shipped feature**: Proactive duplicate-detection popup on inventory page load (BERA and EMPIRE variants).

**Files delivered:**
1. `src/components/admin/DuplicateWarningDialog.tsx` — NEW shared read-only dialog component
2. `src/pages/admin/AdminInventarioBeraPage.tsx` — MODIFIED with mount-time duplicate check + dialog wiring
3. `src/pages/admin/AdminInventarioEmpirePage.tsx` — MODIFIED with mirror EMPIRE-schema duplicate check + dialog wiring

**Core spec**: When a staff member opens either inventory page and the table (`bd_bera` or `bd_empire`) contains rows where `es_duplicado = true`, a modal dialog automatically appears. The dialog displays a read-only list (capped at 50 rows), with "hay N más" legend when count exceeds 50. Two action buttons: "Ver duplicados" (applies the filter, closes dialog) and "Entendido" (dismisses without filter). Session-suppressed per page using `sessionStorage` keys (`dup-warning-bera` / `dup-warning-empire`).

---

## Verification Status

**Verdict:** PASS WITH WARNINGS → UPGRADED TO PASS (WARNING-1 FIXED)

### Spec Compliance

All 10 functional requirements satisfied:

| Requirement | Status |
|---|---|
| Popup on mount if duplicates exist | PASS |
| Read-only list, max 50, overflow legend | PASS |
| Per-brand column sets, no drift | PASS |
| "Ver duplicados" filters + closes | PASS |
| "Entendido" dismisses without side effect | PASS |
| Session suppression per-page key | PASS |
| Variant-driven, no hardcoded columns | PASS (WARNING-1 FIXED) |
| Spanish UI copy throughout | PASS |
| No upload RPC calls (direct table query) | PASS |
| Build and lint pass, no new errors | PASS |

### Warning Resolution

**WARNING-1 (Post-Verify Fix)**: Shared dialog initially leaked brand column literal `"anio_modelo"` in year-label logic.

**Fix Applied:**
- Added `yearLabel: string` field to `DuplicateColumnsConfig` interface
- BERA page config: `yearLabel: "Año modelo"`
- EMPIRE page config: `yearLabel: "Año"`
- Dialog now renders `{columns.yearLabel}` instead of hardcoded comparison

**Result**: DuplicateWarningDialog.tsx now contains ZERO brand-specific column names. Fully variant-driven, fully schema-agnostic. Build passed (✓ 11.18s) post-fix. Component is ready for production.

### Build / Lint Evidence

- `npm run build`: exit 0, 3534 modules transformed
- `npm run lint`: no new errors in the three changed files
- DuplicateWarningDialog.tsx: zero warnings

---

## Two-Factory Parity Confirmed

| Brand | Year column | Serial column | Table | Suppression key |
|---|---|---|---|---|
| BERA | `anio_modelo` | `serial_chasis` | `bd_bera` | `dup-warning-bera` |
| EMPIRE | `anio` | `serial_carroceria` | `bd_empire` | `dup-warning-empire` |

**Parity check:** DuplicateWarningDialog.tsx contains no references to either brand's columns or table names. All column mapping lives in each page's `DUP_COLUMNS` config. Independent suppression keys prevent cross-brand interference.

---

## Specs Synced to Main

**Domain:** `duplicate-warning-dialog`

**Action:** New spec created (no existing main spec to merge)

**Delta spec location:** `openspec/changes/inventario-duplicados-popup/specs/duplicate-warning-dialog/spec.md`

**Main spec location:** `openspec/specs/duplicate-warning-dialog/spec.md`

**Content:** Full specification covering all 10 requirements with Given/When/Then scenarios.

---

## Archive Contents

All artifacts archived to `openspec/changes/archive/2026-06-09-inventario-duplicados-popup/`:

- `proposal.md` — business intent, scope, approach
- `explore.md` — key findings and UX decisions
- `specs/duplicate-warning-dialog/spec.md` — full spec with 10 requirements
- `design.md` — technical architecture, data flow, interfaces, contracts
- `tasks.md` — 4 ordered tasks with dependency graph
- `apply-progress.md` — proof of completion (all 4 tasks marked done)
- `verify-report.md` — PASS WITH WARNINGS upgraded to PASS (WARNING-1 FIXED)
- `state.yaml` — SDD phase state
- `archive-report.md` — this file

**Location:** `openspec/changes/archive/2026-06-09-inventario-duplicados-popup/`

---

## SDD Cycle Complete

- **Phase 1 (Proposal)**: Scope, approach, rollback plan ✓
- **Phase 2 (Spec)**: 10 functional requirements, Given/When/Then scenarios ✓
- **Phase 3 (Design)**: Architecture decisions, data flow, interfaces, file changes ✓
- **Phase 4 (Tasks)**: 4 ordered tasks, dependency graph, workload forecast ✓
- **Phase 5 (Apply)**: All 4 tasks implemented, no new errors, lint + build pass ✓
- **Phase 6 (Verify)**: PASS WITH WARNINGS → upgraded to PASS (WARNING-1 architectural fix applied post-verify) ✓
- **Phase 7 (Archive)**: Delta spec merged to main, change folder archived with date prefix, report generated ✓

---

## Delivered Value

Staff at Vitalicia will now receive a proactive, clear alert when they open the BERA or EMPIRE inventory pages and duplicate records exist. The alert is:
- **Informative**: Lists duplicates clearly in a read-only table with the columns that matter for each brand
- **Actionable**: One button click to apply the duplicates filter and review the marked records
- **Non-intrusive**: Dismissible; shown once per session
- **Safe**: No destructive actions; reads data only
- **Maintainable**: Shared component, variant-driven, zero brand literals in the dialog itself

---

## Next Steps

None. Change is complete and closed. Ready for production deployment.
