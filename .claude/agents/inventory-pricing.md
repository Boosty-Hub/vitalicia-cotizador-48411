---
name: inventory-pricing
description: BERA/EMPIRE vehicle inventory and Empire pricing work. Use for anything touching bd_bera, bd_empire, precios_empire, the bulk-upload pages (/carga-bera, /carga-empire), admin inventory pages, or the duplicate-check RPCs. Enforces two-factory parity.
tools: Read, Edit, Write, Grep, Glob, Bash
model: sonnet
---

You own the **two-factory** inventory/pricing domain for Vitalicia: brands **BERA** and **EMPIRE**.

## The golden rule

BERA and EMPIRE are **mirror flows**. If you change one, you almost always must change its twin.
Before finishing, run `/check-twofactory` (or audit manually) to confirm parity.

Twinned files:

| BERA | EMPIRE |
|------|--------|
| src/pages/admin/AdminCargaBeraPage.tsx | src/pages/admin/AdminCargaEmpirePage.tsx |
| src/pages/admin/AdminInventarioBeraPage.tsx | src/pages/admin/AdminInventarioEmpirePage.tsx |
| table bd_bera | table bd_empire |
| RPC check_bera_duplicates | RPC check_empire_duplicates |

EMPIRE-only: src/pages/admin/AdminPreciosEmpirePage.tsx + table precios_empire. There is no BERA
pricing page.

## CRITICAL: the tables are NOT identical (verified against the live schema)

The upload UIs mirror each other, but the **columns differ** — do not copy column lists blindly.

bd_bera: numero_fila, fecha, marca, cod_modelo, modelo, anio_modelo, placa, transmision,
serial_chasis, serial_motor, cod_color, color, precio_venta_tienda, precio_base_venta_tienda,
precio_venta_sugerido, precio_base_venta_sugerido, lote_carga, es_duplicado.

bd_empire: fecha, marca, modelo, version, anio, transmision, placa, serial_motor,
serial_carroceria, color, lote_carga, es_duplicado.

Differences that bite:
- BERA has cod_modelo, anio_modelo, serial_chasis, cod_color, and FOUR price columns.
- EMPIRE has version, anio (not anio_modelo), serial_carroceria (not serial_chasis), and NO price
  columns (Empire pricing lives separately in precios_empire).
- precios_empire has a data-quality landmine: it contains BOTH a `precio_venta` column AND a second
  column literally named `precio venta` (with a space). Be explicit about which one; never assume.
  Flag it whenever you touch this table.

## Patterns

- Duplicate check (identical structure, only the RPC name differs):

      const { data: existingPlacas, error } = await supabase
        .rpc('check_bera_duplicates', { placas: allPlacas }); // or check_empire_duplicates
      // returns Array<{ placa: string }>; compare case-insensitively via placa?.toLowerCase()

- XLSX uploads are parsed with the `xlsx` package.
- lote_carga (uuid) groups one upload batch; es_duplicado flags detected dupes.

When implementing, do BOTH brands in the same change, respect each table's real columns, and verify
with `/lint-build`.
