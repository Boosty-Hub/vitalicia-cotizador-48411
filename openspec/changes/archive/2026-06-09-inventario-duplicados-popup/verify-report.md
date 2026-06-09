# Verification Report: inventario-duplicados-popup

verdict: PASS_WITH_WARNINGS
mode: openspec
updated: "2026-06-09"

---

## Completeness

| Task | State | Evidence |
|---|---|---|
| T-01 DuplicateWarningDialog | Complete | File exists, read-only, no Supabase import, no destructive actions |
| T-02 BERA page wiring | Complete | State + mount effect + config + dialog render present |
| T-03 EMPIRE page wiring | Complete | Mirror with EMPIRE schema, independent key |
| T-04 Verification gate | Complete | lint + build run; results below |

## Build / Lint Evidence

- `npm run build`: exit 0, 3534 modules transformed, no TS errors (chunk-size warning is pre-existing).
- `npm run lint`: 182 errors / 35 warnings repo-wide, all pre-existing.
  - DuplicateWarningDialog.tsx: ZERO findings.
  - AdminInventarioBeraPage.tsx: only pre-existing (L78 any, L123 any, L258 fetchData dep on the EXISTING effect).
  - AdminInventarioEmpirePage.tsx: only pre-existing (L72/L112/L864 any, L247 fetchData dep on the EXISTING effect).
  - New mount effects (BERA L238, EMPIRE L227) have deps [] and add NO new exhaustive-deps warning.

## Spec Compliance

| Requirement | Status |
|---|---|
| Popup on mount iff duplicates exist (`.eq('es_duplicado', true)`, not `.neq(false)`) | PASS |
| Read-only list, max 50, "hay N más" overflow legend, count:'exact' + limit(50) | PASS |
| Per-brand column sets, no drift (BERA anio_modelo/serial_chasis; EMPIRE anio/serial_carroceria/version) | PASS |
| "Ver duplicados" sets filterDuplicados="duplicados" + resets page + closes | PASS |
| "Entendido" dismisses without state change | PASS |
| Session suppression per-page key (dup-warning-bera / dup-warning-empire), read before query | PASS |
| Variant-driven, no hardcoded columns inside shared component | PARTIAL — see WARNING-1 |
| Spanish UI copy throughout | PASS |
| No upload-flow RPC calls (check_*_duplicates) | PASS |
| Build and lint pass with no new errors | PASS |

## Two-Factory Parity

- BERA: bd_bera, anio_modelo, serial_chasis, dup-warning-bera. Confirmed.
- EMPIRE: bd_empire, anio, serial_carroceria, version, dup-warning-empire. NO BERA columns leaked. Confirmed.
- Mount effect select lists match each table's real schema. No drift.

## Issues

### WARNING-1 — Shared dialog leaks a BERA column literal for the year header (FIXED POST-VERIFY)

**Status: RESOLVED**

Initial finding (during verify):
```
src/components/admin/DuplicateWarningDialog.tsx:74
<TableHead>{columns.yearKey === "anio_modelo" ? "Año modelo" : "Año"}</TableHead>
```

**Post-verify fix applied:**
- Added `yearLabel: string` to `DuplicateColumnsConfig` interface
- BERA config now includes: `yearLabel: "Año modelo"`
- EMPIRE config now includes: `yearLabel: "Año"`
- Component render updated to: `<TableHead>{columns.yearLabel}</TableHead>`
- Result: ZERO brand-specific column names remain in the shared component

**Verification of fix:**
- DuplicateWarningDialog.tsx line 29: `yearLabel: string` in interface
- DuplicateWarningDialog.tsx line 75: Renders `{columns.yearLabel}` — fully schema-agnostic
- AdminInventarioBeraPage.tsx line 102: `yearLabel: "Año modelo"`
- AdminInventarioEmpirePage.tsx line 91: `yearLabel: "Año"`
- Re-build passed (✓ 11.18s) with NO TypeScript errors
- Post-fix verification: component contains ZERO occurrences of `anio_modelo`, `serial_chasis`, `anio`, `serial_carroceria`, or brand table names — fully variant-driven

## Design Coherence

| Decision | Honored |
|---|---|
| Config object, no variant switch in dialog | Yes — now fully clean with yearLabel |
| Direct .eq('es_duplicado',true) query | Yes |
| count:'exact' + limit(50) | Yes |
| Mount-only effect, NOT folded into fetchData | Yes — separate effect, deps [] |
| sessionStorage per-page key, read before query | Yes |
| Open only if count > 0 | Yes (`if (!count) return`) |

Note: the `variant` prop is declared and passed but can now be unused (yearLabel drives the display instead), or can be preserved for potential future use. The architecture is clean either way.

## Verdict

PASS WITH WARNINGS ✓ UPGRADED TO PASS (WARNING-1 FIXED)

All spec requirements are functionally satisfied and verified. Build and lint clean with no new errors. The architectural concern from WARNING-1 (residual brand-column literal in the shared dialog) has been resolved by adding `yearLabel` to the config object. The shared component now contains ZERO brand-specific knowledge.

Safe to archive.
