# Wayfinder + Inertia Patterns Refactor — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Migrate all frontend routing from Ziggy global `route()` to Wayfinder generated imports (`@/actions/...`). Enforce strict Inertia conventions (Links for nav, useForm for forms).

**Architecture:** Replace `route('name', param)` with named imports from `@/actions/App/Http/Controllers/Web/*`. Regenerate Wayfinder files after any route change. No UI changes, no backend changes.

**Tech Stack:** Laravel Wayfinder, Inertia.js React, TypeScript

---

### Task 1: Generate fresh Wayfinder files

**Files:**
- Generate: `resources/js/actions/`
- Generate: `resources/js/routes/`

- [ ] **Step 1: Run generator**

```bash
php artisan wayfinder:generate
```

Expected: "Generated actions in .../resources/js/actions" + "Generated routes in .../resources/js/routes"

---

### Task 2: Refactor AuthenticatedLayout.jsx

**Files:**
- Modify: `resources/js/Layouts/AuthenticatedLayout.jsx`

- [ ] **Step 1: Add Wayfinder imports**

Add at top of file, after existing imports:
```jsx
import { dashboard } from '@/routes';
import { index as flowsIndex } from '@/routes/flows';
import { index as callsIndex } from '@/routes/calls';
import { index as apiTokensIndex } from '@/routes/api-tokens';
import { edit as profileEdit } from '@/routes/profile';
import { index as teamIndex } from '@/routes/team';
import { tenant as settingsTenant } from '@/routes/settings';
import { logout } from '@/routes';
```

- [ ] **Step 2: Replace desktop nav links**

Replace `href={route('dashboard')}` with `href={dashboard().url}` etc.

Pattern:
```jsx
// Before:
<NavLink href={route('dashboard')} active={route().current('dashboard')}>
// After:
<NavLink href={dashboard().url} active={route().current('dashboard')}>
```
Keep `route().current()` for active detection (no Wayfinder equivalent).

Replace all 8 `route('name')` in nav + mobile nav + dropdown.

---

### Task 3: Refactor Flows/ pages

**Files:**
- Modify: `resources/js/Pages/Flows/Index.jsx`
- Modify: `resources/js/Pages/Flows/Create.jsx`
- Modify: `resources/js/Pages/Flows/Edit.jsx`

- [ ] **Step 1: Index.jsx — replace routes**

Import:
```jsx
import { index, create, edit, update, destroy } from '@/actions/App/Http/Controllers/Web/FlowController';
```

Replace:
- `router.patch(route('flows.update', flow.id), ...)` → `router.patch(update({flow: flow.id}).url, ...)`
- `router.delete(route('flows.destroy', flow.id))` → `router.delete(destroy({flow: flow.id}).url)`
- `href={route('flows.create')}` → `href={create().url}`
- `href={route('flows.edit', flow.id)}` → `href={edit({flow: flow.id}).url}`

- [ ] **Step 2: Create.jsx — replace routes**

Import:
```jsx
import { store, index } from '@/actions/App/Http/Controllers/Web/FlowController';
```

Replace:
- `post(route('flows.store'))` → `post(store().url)`
- `route('flows.index')` → `index().url`

- [ ] **Step 3: Edit.jsx — replace routes**

Import:
```jsx
import { update, index } from '@/actions/App/Http/Controllers/Web/FlowController';
```

Replace:
- `patch(route('flows.update', flow.id))` → `patch(update({flow: flow.id}).url)`
- `route('flows.index')` → `index().url`

---

### Task 4: Refactor Calls/ pages

**Files:**
- Modify: `resources/js/Pages/Calls/Index.jsx`
- Modify: `resources/js/Pages/Calls/Show.jsx`

- [ ] **Step 1: Index.jsx**

Import:
```jsx
import { index, show } from '@/actions/App/Http/Controllers/Web/CallController';
```

Replace:
- `router.get(route('calls.index'), ...)` → `router.get(index().url, ...)`
- `href={route('calls.show', call.id)}` → `href={show({call: call.id}).url}`

- [ ] **Step 2: Show.jsx**

Import:
```jsx
import { index } from '@/actions/App/Http/Controllers/Web/CallController';
```

Replace:
- `route('calls.index')` → `index().url`

---

### Task 5: Refactor ApiTokens/Index.jsx

**Files:**
- Modify: `resources/js/Pages/ApiTokens/Index.jsx`

- [ ] **Step 1: Import + replace**

Import:
```jsx
import { index, store, destroy } from '@/actions/App/Http/Controllers/Web/ApiTokenController';
```

Replace:
- `post(route('api-tokens.store'), ...)` → `post(store().url, ...)`
- `router.delete(route('api-tokens.destroy', id))` → `router.delete(destroy({token: id}).url)`

---

### Task 6: Refactor Settings/Tenant.jsx

**Files:**
- Modify: `resources/js/Pages/Settings/Tenant.jsx`

- [ ] **Step 1: Import + replace**

Import:
```jsx
import { edit, update } from '@/actions/App/Http/Controllers/Web/TenantSettingsController';
import { dashboard } from '@/routes';
```

Replace:
- `patch(route('settings.tenant.update'))` → `patch(update().url)`
- `route('dashboard')` → `dashboard().url`

---

### Task 7: Refactor Team/Index.jsx

**Files:**
- Modify: `resources/js/Pages/Team/Index.jsx`

- [ ] **Step 1: Import + replace**

Import:
```jsx
import { index, invite, update, destroy } from '@/actions/App/Http/Controllers/Web/TeamMemberController';
```

Replace:
- `post(route('team.invite'), ...)` → `post(invite().url, ...)`
- `router.patch(route('team.update', userId), ...)` → `router.patch(update({user: userId}).url, ...)`
- `router.delete(route('team.destroy', userId), ...)` → both `router.delete(destroy({user: userId}).url, ...)`

---

### Task 8: Refactor Profile/ partials

**Files:**
- Modify: `resources/js/Pages/Profile/Partials/UpdateProfileInformationForm.jsx`
- Modify: `resources/js/Pages/Profile/Partials/UpdatePasswordForm.jsx`
- Modify: `resources/js/Pages/Profile/Partials/DeleteUserForm.jsx`

- [ ] **Step 1: UpdateProfileInformationForm.jsx**

Import:
```jsx
import { update } from '@/actions/App/Http/Controllers/ProfileController';
import { send } from '@/routes/verification';
```

Replace:
- `patch(route('profile.update'))` → `patch(update().url)`
- `route('verification.send')` → `send().url`

- [ ] **Step 2: UpdatePasswordForm.jsx**

Import:
```jsx
import { update } from '@/routes/password';
```

Replace:
- `put(route('password.update'), ...)` → `put(update().url, ...)`

- [ ] **Step 3: DeleteUserForm.jsx**

Import:
```jsx
import { destroy } from '@/actions/App/Http/Controllers/ProfileController';
```

Replace:
- `destroy(route('profile.destroy'), ...)` → `destroy(destroy().url, ...)`

---

### Task 9: Build + Test

- [ ] **Step 1: Run Vite build**

```bash
php artisan wayfinder:generate && pnpm run build
```

Expected: No TypeScript errors, build succeeds.

- [ ] **Step 2: Run tests**

```bash
php artisan test
```

Expected: 167 passed.

- [ ] **Step 3: Run PHPStan + Pint**

```bash
php artisan phpstan && php artisan pint --test
```

Expected: 0 errors.
