---
name: two-factories
description: The BERA and EMPIRE two-factory pattern for Vitalicia vehicle inventory and pricing. Load when touching bd_bera, bd_empire, precios_empire, the carga/inventario pages, or the duplicate-check RPCs. Explains the mirror flows and the column differences that cause bugs.
---

# Two factories: BERA and EMPIRE

Auto inventory and pricing are split across two brands. They are **mirror flows** — change one,
change the twin. Drift between them is a recurring bug source.

## Twinned files

| BERA | EMPIRE |
|------|--------|
| src/pages/admin/AdminCargaBeraPage.tsx | src/pages/admin/AdminCargaEmpirePage.tsx |
| src/pages/admin/AdminInventarioBeraPage.tsx | src/pages/admin/AdminInventarioEmpirePage.tsx |
| table bd_bera | table bd_empire |
| RPC check_bera_duplicates | RPC check_empire_duplicates |

EMPIRE-only: `src/pages/admin/AdminPreciosEmpirePage.tsx` + table `precios_empire`. No BERA pricing page.
Public upload routes: `/carga-bera`, `/carga-empire`. XLSX parsed with the `xlsx` package.

## The trap: tables are NOT identical

The UIs mirror each other but the schemas DO NOT. Never copy a column list from one to the other.

- **bd_bera**: numero_fila, fecha, marca, cod_modelo, modelo, anio_modelo, placa, transmision,
  serial_chasis, serial_motor, cod_color, color, precio_venta_tienda, precio_base_venta_tienda,
  precio_venta_sugerido, precio_base_venta_sugerido, lote_carga, es_duplicado.
- **bd_empire**: fecha, marca, modelo, version, anio, transmision, placa, serial_motor,
  serial_carroceria, color, lote_carga, es_duplicado.

Key differences:
- BERA-only: cod_modelo, anio_modelo, serial_chasis, cod_color, and FOUR price columns.
- EMPIRE-only: version, anio (vs BERA's anio_modelo), serial_carroceria (vs BERA's serial_chasis).
- EMPIRE has no price columns — Empire pricing lives in `precios_empire`.
- `precios_empire` landmine: it has BOTH `precio_venta` and a column literally named `precio venta`
  (with a space). Be explicit about which; flag ambiguity.

## Duplicate-check pattern (structurally identical, only the RPC name differs)

    const { data: existingPlacas, error } = await supabase
      .rpc('check_bera_duplicates', { placas: allPlacas }); // EMPIRE: check_empire_duplicates

    // returns Array<{ placa: string }>
    const existing = new Set((existingPlacas ?? []).map(r => r.placa?.toLowerCase()));
    const dbDuplicates = uniqueInBatch.filter(i => existing.has(i.placa?.toLowerCase()));

`lote_carga` (uuid) groups an upload batch; `es_duplicado` flags detected duplicates.

## Checklist before finishing any inventory change

1. Did you update BOTH brands (unless the change is genuinely brand-specific)?
2. Did you use each table's REAL columns, not the twin's?
3. Run `/check-twofactory` to confirm parity, then `/lint-build`.
