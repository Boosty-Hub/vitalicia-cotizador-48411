---
description: Audit BERA/EMPIRE parity — ensures the two vehicle factories stayed in sync.
allowed-tools: Read, Grep, Glob, Bash
---

Audit parity between the two vehicle factories, **BERA** and **EMPIRE**. They are mirror flows;
drift between them is a recurring bug source.

Compare these twins and report any asymmetry:

| BERA | EMPIRE |
|------|--------|
| src/pages/admin/AdminCargaBeraPage.tsx | src/pages/admin/AdminCargaEmpirePage.tsx |
| src/pages/admin/AdminInventarioBeraPage.tsx | src/pages/admin/AdminInventarioEmpirePage.tsx |
| RPC check_bera_duplicates | RPC check_empire_duplicates |

Check, specifically:
1. Does every feature/handler present in a BERA page have its EMPIRE counterpart, and vice versa?
2. Are both `check_bera_duplicates` and `check_empire_duplicates` invoked symmetrically?
3. Remember the tables are NOT identical: bd_bera has cod_modelo/anio_modelo/serial_chasis/cod_color
   + price columns; bd_empire has version/anio/serial_carroceria and no price columns. Flag code
   that assumes identical columns.
4. precios_empire (Empire-only) has BOTH `precio_venta` and `precio venta` (with a space) — flag any
   ambiguous access.

If `$ARGUMENTS` names a specific feature, focus the audit there. Output a parity table: feature →
BERA status → EMPIRE status → verdict (in sync / DRIFT).
