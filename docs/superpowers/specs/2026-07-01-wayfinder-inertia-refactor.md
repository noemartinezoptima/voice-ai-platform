# Wayfinder + Inertia Patterns Refactor

## Objective
Migrate all frontend routing from Ziggy global `route()` to Wayfinder generated imports (`@/actions/...`). Enforce strict Inertia conventions. No UI changes.

## Scope
12 files, ~60 `route()` calls to replace:

| File | Changes |
|------|---------|
| `Layouts/AuthenticatedLayout.jsx` | Nav links: `route('dashboard')` → `dashboard()` imports. Mobile nav same. Profile/logout dropdown. |
| `Pages/Flows/Index.jsx` | `route('flows.create')` → `create()`, `route('flows.edit', id)` → `edit({flow: id})`, `router.patch(route('flows.update', id))` → `update({flow: id})`, `router.delete(route('flows.destroy', id))` → `destroy({flow: id})` |
| `Pages/Flows/Create.jsx` | `route('flows.store')` → `store()`, `route('flows.index')` → `index()` |
| `Pages/Flows/Edit.jsx` | `route('flows.update', id)` → `update({flow: id})`, `route('flows.index')` → `index()` |
| `Pages/Calls/Index.jsx` | `route('calls.index')` → `index()`, `route('calls.show', id)` → `show({call: id})` |
| `Pages/Calls/Show.jsx` | `route('calls.index')` → `index()` |
| `Pages/ApiTokens/Index.jsx` | `route('api-tokens.index')` → `index()`, `route('api-tokens.store')` → `store()`, `route('api-tokens.destroy', id)` → `destroy({token: id})` |
| `Pages/Settings/Tenant.jsx` | `route('settings.tenant.update')` → `update()`, `route('dashboard')` → `dashboard()` |
| `Pages/Team/Index.jsx` | `route('team.invite')` → `invite()`, `route('team.update', id)` → `update({user: id})`, `route('team.destroy', id)` → `destroy({user: id})`, `route('team.index')` → `index()` |
| `Pages/Welcome.jsx` | Hardcoded `/login` → `login()`, `/register` → `register()` |
| `Layouts/GuestLayout.jsx` | Hardcoded `/` → conditional check |
| `Pages/Profile/Edit.jsx` | `route('profile.edit')` → profile action imports |

## Wayfinder Rules

1. Always import named exports from `@/actions/...` (tree-shakable)
2. Use `.url` property for `<Link href={...}>`
3. Use `.url` for Inertia `router.get/post/patch/delete`
4. Run `php artisan wayfinder:generate` after any route change
5. Never use `route('...')` global helper

## Inertia Conventions

1. `<Link href={...}>` for navigation (not `<a>` except external)
2. `useForm({...})` for forms with `data`, `setData`, `post`, `patch`, `errors`, `processing`
3. Validation errors from `errors` prop (Inertia shared)
4. No manual `fetch`/`axios` — use Inertia `router` for GET, `form.post/patch/delete` for mutations

## Execution

1. Generate Wayfinder files once
2. Create `@/` alias imports in all files (batch edit)
3. Refactor file-by-file, compile after each batch
4. Run `php artisan wayfinder:generate`, build, test
