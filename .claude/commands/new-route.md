---
description: Add a new route to src/App.tsx following project conventions.
argument-hint: <path> <PageComponent> [public|admin]
allowed-tools: Read, Edit, Glob
---

Add a new route to `src/App.tsx`. Routes live in one flat `<Routes>` table.

Request: `$ARGUMENTS` (e.g. `/mascotas CotizarMascotasPage public`).

Rules:
- **Public route**: add a flat line in the public block, ABOVE the admin section:
  `<Route path="/$1" element={<$2 />} />`
- **Admin route**: add it INSIDE the `<Route path="/admin" ...>` block (wrapped by
  ProtectedAdminRoute + AdminLayout), using a RELATIVE path:
  `<Route path="sub-path" element={<$2 />} />` — it renders at `/admin/sub-path`.
- ALWAYS keep `<Route path="*" element={<NotFound />} />` as the LAST route. Never add below it.
- Add the matching `import` for the page component at the top of App.tsx (match the existing import
  style and the `@/pages/...` alias).
- If the page component file does not exist yet, create a minimal Spanish-UI stub under
  `src/pages/` (or `src/pages/admin/` for admin) consistent with sibling pages.

After editing, run `/lint-build` to confirm it compiles.
