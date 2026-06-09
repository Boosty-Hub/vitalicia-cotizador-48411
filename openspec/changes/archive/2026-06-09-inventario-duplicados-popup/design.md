# Design: Popup proactivo de duplicados en inventario BERA/EMPIRE

## Technical Approach

One shared, presentational `DuplicateWarningDialog` (variant-driven, same pattern as `MotoDetailsDialog`). It receives already-fetched rows plus a per-variant column map — it never queries Supabase and never hardcodes brand columns. Each inventory page owns: a mount-time count/list query against its own table, the `sessionStorage` suppression gate, the `open` state, and the wiring of "Ver duplicados" into its existing `filterDuplicados` state. Parity is enforced by a single `DUP_COLUMNS` config object per page that maps the three diverging fields.

## Architecture Decisions

| Decision | Choice | Alternatives rejected | Rationale |
|---|---|---|---|
| Column drift handling | Caller passes a `columns` config object; dialog maps generic keys (`year`, `serial`, `model`) | `variant` switch inside dialog (like MotoDetailsDialog); duplicate dialog per brand | Config object keeps ONE component with ZERO brand knowledge — the diverging columns live next to each page's real schema, eliminating the "wrong table's column" bug. A `variant` switch would re-import both schemas into the shared file. |
| Data source | Direct `.select(..,{count:'exact'}).eq('es_duplicado',true).limit(50)` on the page | Reuse `check_*_duplicates` RPC; reuse `DuplicatePlatesHandler` | RPCs answer "which of THESE plates exist" for the upload flow — wrong question here. `DuplicatePlatesHandler` is upload-specific. |
| Null safety | `.eq('es_duplicado', true)` only | `.neq('es_duplicado', false)` | Column is nullable; `.neq(false)` silently drops NULL rows and miscounts. |
| Fetch isolation | New dedicated effect + helper, NOT folded into `fetchData` | Add dup-count into existing `fetchData` | `fetchData` re-runs on every page/search/filter change; the warning must fire once on mount only. Keeping it separate avoids re-triggering the popup and avoids touching pagination logic. |
| Suppression | `sessionStorage` per-page key, set on first show | `localStorage` (permanent); show every mount | Once-per-session matches the proposal; survives in-app navigation, resets on a fresh tab/session so staff are re-reminded. |
| Open trigger | Open only if `count > 0` AND key not set | Always render, gate by count | Avoids mounting Radix portal when there is nothing to show. |

## Data Flow

    Page mount
       │  effect (deps: []) — runs once
       ▼
    sessionStorage[KEY]? ──yes──► do nothing
       │ no
       ▼
    supabase.from(TABLE).select('id,placa,marca,...cols',{count:'exact'})
            .eq('es_duplicado', true).limit(50)
       │
       ▼
    setDupRows(rows) · setDupCount(count) · setDupOpen(count>0)
       │  (on open) sessionStorage[KEY]='1'
       ▼
    <DuplicateWarningDialog variant rows count columns
        onViewDuplicates={() => { setFilterDuplicados('duplicados'); setCurrentPage(1); setDupOpen(false); }}
        onOpenChange={setDupOpen} />
       │
       └─ existing fetchData effect reacts to filterDuplicados → table shows duplicates

## File Changes

| File | Action | Description |
|---|---|---|
| `src/components/admin/DuplicateWarningDialog.tsx` | Create | Shared read-only dialog. Renders count, list, "hay N más", footer buttons. No Supabase, no brand columns. |
| `src/pages/admin/AdminInventarioBeraPage.tsx` | Modify | Add `dupRows/dupCount/dupOpen` state, mount effect, `DUP_COLUMNS` (BERA), render dialog, wire `onViewDuplicates` to `setFilterDuplicados`. |
| `src/pages/admin/AdminInventarioEmpirePage.tsx` | Modify | Mirror with EMPIRE `DUP_COLUMNS`. |

## Interfaces / Contracts

```ts
// DuplicateWarningDialog.tsx
export interface DuplicateRow {
  id: string;
  placa: string | null;
  marca: string | null;
  [key: string]: unknown; // brand columns read via columns map
}

export interface DuplicateColumnsConfig {
  yearKey: string;   // BERA: "anio_modelo"      EMPIRE: "anio"
  serialKey: string; // BERA: "serial_chasis"    EMPIRE: "serial_carroceria"
  serialLabel: string; // "Serial Chasis" | "Serial Carrocería"
  modelOf: (row: DuplicateRow) => string; // BERA: modelo  EMPIRE: `${modelo} ${version}`
}

export interface DuplicateWarningDialogProps {
  variant: "bera" | "empire";
  open: boolean;
  onOpenChange: (open: boolean) => void;
  rows: DuplicateRow[];
  totalCount: number;       // exact count; if > rows.length show "hay N más"
  columns: DuplicateColumnsConfig;
  onViewDuplicates: () => void; // applies filter + closes (page-owned)
}
```

Per-page config (lives in each page, next to its real schema):

```ts
// BERA
const DUP_COLUMNS = { yearKey:"anio_modelo", serialKey:"serial_chasis",
  serialLabel:"Serial Chasis", modelOf:(r)=>String(r.modelo ?? "—") };
// EMPIRE
const DUP_COLUMNS = { yearKey:"anio", serialKey:"serial_carroceria",
  serialLabel:"Serial Carrocería", modelOf:(r)=>[r.modelo,r.version].filter(Boolean).join(" ") || "—" };
```

Mount effect (per page; select only needed cols, not `*`):

```ts
const DUP_KEY = "dup-warning-bera"; // EMPIRE: "dup-warning-empire"
useEffect(() => {
  if (sessionStorage.getItem(DUP_KEY)) return;
  let cancelled = false;
  (async () => {
    const { data, count } = await supabase
      .from("bd_bera") // EMPIRE: "bd_empire"
      .select("id,placa,marca,modelo,anio_modelo,serial_chasis", { count: "exact" })
      .eq("es_duplicado", true)
      .limit(50);
    if (cancelled || !count) return;
    setDupRows(data ?? []); setDupCount(count); setDupOpen(true);
    sessionStorage.setItem(DUP_KEY, "1");
  })();
  return () => { cancelled = true; };
}, []); // mount only — independent of fetchData deps
```

## Testing Strategy

No test framework configured (`npm test` does not exist). Manual verification.

| Layer | What to Test | Approach |
|---|---|---|
| Manual | Popup once per session when duplicates exist; "Ver duplicados" filters; "Entendido" closes; no popup when count 0; "hay N más" when count > 50 | Run dev server, both pages |
| Parity | BERA shows `anio_modelo`/`serial_chasis`; EMPIRE shows `anio`/`serial_carroceria`+`version`; no cross-table column | `/check-twofactory` then `npm run lint` + `npm run build` |

## Migration / Rollout

No migration required. `es_duplicado` exists in both tables; front-end only, no persistent state beyond `sessionStorage`.

## Open Questions

- None blocking. (`limit(50)` list cap and once-per-session suppression are fixed by the proposal.)
