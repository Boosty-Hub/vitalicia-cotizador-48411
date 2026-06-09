# duplicate-warning-dialog Specification

## Purpose

Governs the shared `DuplicateWarningDialog` component and the on-mount duplicate-alert
behavior added to both inventory pages. Describes WHAT the feature must do; does not
prescribe implementation details beyond what is required by testable observable behavior.

---

## Requirements

### Requirement: Popup appears on mount if and only if duplicates exist

When a staff member opens an inventory page, the duplicate-warning dialog MUST appear
automatically if the corresponding table (`bd_bera` or `bd_empire`) contains at least one
row where `es_duplicado = true`. If no such rows exist, the dialog MUST NOT appear.

The query that drives this check MUST use `.eq('es_duplicado', true)` — never
`.neq('es_duplicado', false)` — because the column is nullable and `neq(false)` would
incorrectly include `NULL` rows.

#### Scenario: Page mounts with duplicate rows present

- GIVEN the inventory page mounts
- AND `bd_bera` (or `bd_empire`) contains one or more rows where `es_duplicado = true`
- AND the session-suppression key for this page is NOT set in `sessionStorage`
- WHEN the on-mount effect completes its query
- THEN the `DuplicateWarningDialog` renders in open state

#### Scenario: Page mounts with no duplicate rows

- GIVEN the inventory page mounts
- AND no rows with `es_duplicado = true` exist in the relevant table
- WHEN the on-mount effect completes its query
- THEN the `DuplicateWarningDialog` does NOT render (or renders with `open={false}`)

#### Scenario: Nullable es_duplicado — NULLs not counted as duplicates

- GIVEN some rows have `es_duplicado = NULL`
- WHEN the on-mount effect queries for duplicates
- THEN those rows are NOT included in the count or the list

---

### Requirement: Dialog is read-only and lists up to 50 rows

The dialog MUST display a read-only list of duplicate rows. It MUST NOT expose any action
that modifies, deletes, or merges records. The list MUST be capped at 50 entries. When the
total count exceeds 50, the dialog MUST display a legend of the form "hay N más" where N
is the difference between the exact total count and 50.

The query MUST request `count: 'exact'` alongside `.limit(50)` so the exact total is
known even when more than 50 rows exist.

#### Scenario: 10 duplicate rows — full list, no overflow legend

- GIVEN there are 10 rows with `es_duplicado = true`
- WHEN the dialog opens
- THEN all 10 rows are shown in the list
- AND no "hay N más" legend is displayed

#### Scenario: 75 duplicate rows — capped list plus overflow legend

- GIVEN there are 75 rows with `es_duplicado = true`
- WHEN the dialog opens
- THEN exactly 50 rows are shown in the list
- AND a legend "hay 25 más" is visible in the dialog

#### Scenario: No destructive actions present

- GIVEN the dialog is open showing one or more duplicate rows
- THEN there is no delete button, merge button, or any other action that modifies data
- AND the list is visually presented as informational only

---

### Requirement: Per-brand column sets — no drift between BERA and EMPIRE

The dialog MUST display the correct identifying columns for each brand. Using a column from
the wrong table is a data error. The component MUST be parameterized by `variant` and the
calling page MUST map its own table's fields.

| Field purpose     | BERA column    | EMPIRE column       |
|-------------------|----------------|---------------------|
| Year / model year | `anio_modelo`  | `anio`              |
| Chassis serial    | `serial_chasis`| `serial_carroceria` |
| Model             | `modelo`       | `modelo`            |
| Variant           | (none)         | `version`           |
| Plate             | `placa`        | `placa`             |

For BERA: the dialog list MUST show `placa`, `modelo`, `anio_modelo`, and `serial_chasis`.
For EMPIRE: the dialog list MUST show `placa`, `modelo`, `version`, `anio`, and
`serial_carroceria`.

No price columns (`precio_*`) MAY appear in the dialog list — they are not relevant to
duplicate identification.

#### Scenario: BERA dialog shows BERA columns

- GIVEN the BERA inventory page opens the dialog
- WHEN the dialog renders the duplicate list
- THEN each row displays values from `placa`, `modelo`, `anio_modelo`, and `serial_chasis`
- AND does NOT display `anio`, `serial_carroceria`, or `version`

#### Scenario: EMPIRE dialog shows EMPIRE columns

- GIVEN the EMPIRE inventory page opens the dialog
- WHEN the dialog renders the duplicate list
- THEN each row displays values from `placa`, `modelo`, `version`, `anio`, and
  `serial_carroceria`
- AND does NOT display `anio_modelo` or `serial_chasis`

---

### Requirement: "Ver duplicados" applies the existing filter and closes the dialog

The dialog MUST include a primary action button labelled "Ver duplicados". Activating it
MUST apply the duplicates filter on the inventory page (equivalent to the user selecting
"Duplicados" in the filter toolbar) and close the dialog. It MUST NOT navigate away from
the page.

#### Scenario: User clicks "Ver duplicados"

- GIVEN the dialog is open
- WHEN the user clicks "Ver duplicados"
- THEN the inventory page's `filterDuplicados` state is set to `"duplicados"`
- AND the dialog closes (is no longer visible)
- AND the inventory list now shows only rows where `es_duplicado = true`

---

### Requirement: "Entendido" dismisses the dialog

The dialog MUST include a secondary dismiss button labelled "Entendido". Activating it
MUST close the dialog without applying any filter or modifying any state beyond the dialog's
own open state.

#### Scenario: User clicks "Entendido"

- GIVEN the dialog is open
- WHEN the user clicks "Entendido"
- THEN the dialog closes
- AND `filterDuplicados` remains unchanged
- AND the inventory list is not affected

---

### Requirement: Popup is suppressed for the rest of the browser session after first display

Once the dialog has been shown for a given inventory page in a browser session, it MUST NOT
appear again when the user revisits the same page within the same session (tab or browser
session — `sessionStorage` scope). Each inventory page has an independent suppression key.

- BERA suppression key: `dup-warning-bera`
- EMPIRE suppression key: `dup-warning-empire`

The suppression key MUST be written to `sessionStorage` as soon as the dialog is shown
(before or at the moment `open` becomes `true`). It MUST be read before making the
Supabase query so the query is skipped entirely when suppression is active, not merely
the display.

#### Scenario: First visit — duplicates present, dialog shown and suppression set

- GIVEN the staff member opens the BERA inventory page for the first time in this session
- AND `sessionStorage` does NOT contain `dup-warning-bera`
- AND duplicates exist
- WHEN the on-mount effect runs
- THEN the dialog opens
- AND `dup-warning-bera` is written to `sessionStorage`

#### Scenario: Second visit within same session — dialog suppressed

- GIVEN `sessionStorage` contains `dup-warning-bera`
- WHEN the BERA inventory page mounts (even if duplicates still exist)
- THEN the on-mount effect skips the Supabase query
- AND the dialog does NOT open

#### Scenario: BERA suppression does not affect EMPIRE

- GIVEN `dup-warning-bera` is set in `sessionStorage`
- AND `dup-warning-empire` is NOT set
- WHEN the EMPIRE inventory page mounts with duplicates present
- THEN the EMPIRE dialog opens normally

#### Scenario: Suppression resets across browser sessions

- GIVEN a staff member closed and reopened the browser (new session)
- AND duplicates still exist
- WHEN the inventory page mounts
- THEN `sessionStorage` does not contain the suppression key
- AND the dialog opens again

---

### Requirement: Component is variant-driven with no hardcoded columns

`DuplicateWarningDialog` MUST accept a `variant: "bera" | "empire"` prop (or equivalent
parameterization). Column display logic MUST be driven by that variant — no inline
column list for a specific table is acceptable inside the shared component itself. Column
mapping belongs in each inventory page.

#### Scenario: Single component serves both brands without code duplication

- GIVEN the component is rendered with `variant="bera"`
- THEN it renders the BERA column set
- GIVEN the component is rendered with `variant="empire"`
- THEN it renders the EMPIRE column set
- AND there is exactly one `DuplicateWarningDialog` component file (no per-brand copies)

---

### Requirement: Spanish UI copy throughout

All visible text in the dialog MUST be in Spanish. This includes the dialog title, column
headers, action buttons, the overflow legend, and any empty/loading states.

Required strings (exact or semantically equivalent):

| Element            | Required copy (or equivalent)             |
|--------------------|-------------------------------------------|
| Dialog title       | "Duplicados detectados" (or similar)      |
| Overflow legend    | "hay N más" where N is the surplus count  |
| Primary action     | "Ver duplicados"                          |
| Dismiss action     | "Entendido"                               |
| Column: plate      | "Placa"                                   |
| Column: model      | "Modelo"                                  |
| Column: year (BERA)| "Año modelo"                              |
| Column: year (EMP) | "Año"                                     |
| Column: chassis (B)| "Serial chasis"                           |
| Column: body (EMP) | "Serial carrocería"                       |
| Column: variant(E) | "Versión"                                 |

#### Scenario: Dialog copy is in Spanish

- GIVEN the dialog is open on either inventory page
- THEN all text rendered inside the dialog is in Spanish
- AND no English string appears in dialog UI text

---

### Requirement: No Supabase query is made for the upload-flow RPCs

The on-mount duplicate check MUST query the table directly (`bd_bera` / `bd_empire` with
`.eq('es_duplicado', true)`). It MUST NOT call `check_bera_duplicates` or
`check_empire_duplicates` — those RPCs exist for the upload flow and require a list of
plates as input; they are not suitable for the inventory alert use case.

#### Scenario: On-mount check does not invoke upload RPCs

- GIVEN the inventory page mounts
- WHEN the on-mount duplicate check fires
- THEN no call to `supabase.rpc('check_bera_duplicates', ...)` or
  `supabase.rpc('check_empire_duplicates', ...)` is made
- AND the check uses a direct table select with `.eq('es_duplicado', true)`

---

### Requirement: Build and lint pass with no new errors

Because the project has no test runner, acceptance at the tooling level is: `npm run build`
completes without error and `npm run lint` reports no new errors introduced by this change.

#### Scenario: Clean build and lint

- GIVEN the implementation is complete
- WHEN `npm run build` is run
- THEN the build exits with code 0
- AND no TypeScript type errors are emitted

- WHEN `npm run lint` is run
- THEN it exits with no new errors attributable to the changed files
