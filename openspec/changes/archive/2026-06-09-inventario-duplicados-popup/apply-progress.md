# Apply Progress: inventario-duplicados-popup

status: done
updated: "2026-06-09"

---

## Completed Tasks

- [x] T-01 — Created `src/components/admin/DuplicateWarningDialog.tsx`
  - Exports `DuplicateRow`, `DuplicateColumnsConfig`, `DuplicateWarningDialogProps`
  - Renders shadcn Dialog with title "Duplicados detectados", AlertTriangle icon
  - Read-only table: Placa, Marca, Modelo, Año (label varies by yearKey), Serial (label from config)
  - Shows "hay N más" when totalCount > rows.length
  - Footer: "Entendido" (closes) + "Ver duplicados" (calls onViewDuplicates)
  - Zero brand knowledge — all column keys come from the caller's DuplicateColumnsConfig

- [x] T-02 — Modified `src/pages/admin/AdminInventarioBeraPage.tsx`
  - Added import for DuplicateWarningDialog, DuplicateRow, DuplicateColumnsConfig
  - Added DUP_KEY = "dup-warning-bera" and DUP_COLUMNS (yearKey: anio_modelo, serialKey: serial_chasis)
  - Added dupRows/dupCount/dupOpen state vars
  - Added mount-only useEffect with sessionStorage guard, bd_bera query (.eq("es_duplicado", true))
  - Rendered <DuplicateWarningDialog variant="bera"> wired to setFilterDuplicados("duplicados")

- [x] T-03 — Modified `src/pages/admin/AdminInventarioEmpirePage.tsx`
  - Mirror of T-02 using EMPIRE schema
  - DUP_KEY = "dup-warning-empire", DUP_COLUMNS (yearKey: anio, serialKey: serial_carroceria, version in modelOf)
  - Query from bd_empire, selects id,placa,marca,modelo,version,anio,serial_carroceria
  - No BERA columns (no anio_modelo, no serial_chasis)

- [x] T-04 — Verification gate
  - npm run lint: exits with pre-existing errors only; no new errors in the three changed files
  - npm run build: exits code 0, 3534 modules transformed, no TypeScript errors
  - Two-factory parity confirmed: DuplicateWarningDialog.tsx contains none of the brand-specific
    column names (anio_modelo, serial_chasis, anio, serial_carroceria, version, bd_bera, bd_empire)

---

## Lint output for changed files (no new errors)

AdminInventarioBeraPage.tsx — pre-existing only:
  - line 78: policyData: any (pre-existing)
  - line 123: any in fetchPoliciesForPlates (pre-existing)
  - line 258: fetchData missing from useEffect deps (pre-existing, that existing effect)

AdminInventarioEmpirePage.tsx — pre-existing only:
  - lines 72, 112, 864: any (pre-existing)
  - line 247: fetchData missing from useEffect deps (pre-existing)

DuplicateWarningDialog.tsx — zero errors or warnings
