# Webhook Deliveries UI — Implementation Spec

## 1. Problem

BUG-001: The `WebhookDeliveryController@index` method cloned a query builder that carried `ORDER BY created_at DESC` into an aggregate `SELECT COUNT/SUM` query. PostgreSQL requires `GROUP BY` when `ORDER BY` references non-aggregate columns. The clone approach was fragile and relied on MySQL's lenient `ONLY_FULL_GROUP_BY` being off.

Beyond the bug, the page lacked:
- Destination, search, and date range filters
- Success rate KPI
- Retry action for failed deliveries
- Loading/empty/error states
- Detail slide-out drawer (used a modal dialog instead)
- `data-testid` attributes for UI automation (Stitch MCP)

## 2. Goals

- Fix PostgreSQL compatibility of the stats query
- Expand filtering to cover all delivery dimensions
- Add retry workflow
- Redesign as an operational dashboard with drawer detail view
- Make all states explicit (empty, loading, error, filtered empty)
- Add automation hooks via `data-testid`

## 3. Scope

- `app/Http/Controllers/Web/WebhookDeliveryController.php` — backend fix + new filters + retry
- `routes/web.php` — retry endpoint
- `resources/js/Components/MetricCard.jsx` — shared KPI card component
- `resources/js/Components/WebhookDeliveryDrawer.jsx` — detail drawer component
- `resources/js/Pages/WebhookDeliveries/Index.jsx` — full redesign
- `tests/Feature/Web/WebhookDeliveryTest.php` — expanded test suite
- `docs/specs/webhook-deliveries-ui.md` — this file

No database migrations. No new models. No dependency changes.

## 4. Backend Changes

### Controller `WebhookDeliveryController.php`

**Bug fix**: Stats query uses a fresh builder (`WebhookDeliveryModel::whereHas(...)`) instead of cloning the listing query. Eliminates inherited `ORDER BY`.

**New filters**:
- `destination_id` — UUID of a specific webhook destination
- `search` — LIKE match on event name or destination URL

**New fields**:
- `successRate` — computed as `round((successful / total) * 100, 1)`, null when no deliveries

**New action**:
- `retry(Request, id)` — validates delivery belongs to tenant, checks status is `failed`, dispatches `DispatchWebhookJob` with same destination/payload/event

### Routes `web.php`

```php
Route::post('/settings/webhooks/deliveries/{id}/retry', [WebhookDeliveryController::class, 'retry'])
    ->name('settings.webhooks.deliveries.retry');
```

## 5. Frontend Changes

### New: `MetricCard.jsx`

Props: `label`, `value`, `icon`, `color`, `trend`, `subtitle`, `testid`

Reusable KPI card with color zones (emerald/red/amber/zinc/indigo), icon badge, optional trend indicator.

### New: `WebhookDeliveryDrawer.jsx`

Right-side slide-out panel (not a modal). Fixed position, full-height with scrollable body. Features:
- Delivery metadata (event, status, attempt, response code)
- Destination URL
- Next attempt timestamp (if pending)
- Retry CTA for failed deliveries with inline failure context
- Payload JSON viewer
- Response body viewer
- Close on Escape key or backdrop click

### Redesigned: `WebhookDeliveries/Index.jsx`

Layout (top to bottom):
1. **Page header** — title, description, View Failed shortcut, Destinations link
2. **KPI row** (5 x MetricCard) — Total, Successful, Failed, Pending, Success Rate
3. **Filter bar** (form, inline) — search input, status select, event select, destination select, Clear button
4. **Table** — Time, Event, Destination (truncated), Status (badge), Response (code), Attempts, Actions (Retry)
5. **Pagination** — Catalyst `<Pagination>` component (replaced manual link list)
6. **Empty state** — different messaging for no data vs. filtered empty; primary CTA to configure webhooks
7. **Drawer** — `<WebhookDeliveryDrawer>` on row click

## 6. Components

| Component | File | Purpose |
|-----------|------|---------|
| MetricCard | `Components/MetricCard.jsx` | KPI stat card with label, value, icon, color, trend |
| WebhookDeliveryDrawer | `Components/WebhookDeliveryDrawer.jsx` | Right-side detail panel |
| Badge | `catalyst/badge` | Status badge (emerald/red/amber) |
| Button | `catalyst/button` | Primary/outline CTAs |
| Pagination | `catalyst/pagination` | Page navigation |

No new third-party dependencies. Charts use no external libs for this page.

## 7. States and Edge Cases

| State | Behavior |
|-------|----------|
| **Empty (no deliveries)** | Dashed border empty state with "Configure Webhook" CTA |
| **Filtered empty** | Different message: "No deliveries match your filters" |
| **Loading** | Not applicable (server-rendered Inertia page) |
| **Failed delivery** | Red-tinted row, Retry button in Actions column |
| **Pending delivery** | Amber badge, next_attempt_at shown with asterisk |
| **Success Rate = null** | Shows "—" in KPI when no deliveries exist |
| **Retry on non-failed** | Server returns error flash; no job dispatched |
| **Retry cross-tenant** | 404, scoped via `whereHas('webhookDestination', tenant_id)` |
| **Detail drawer open** | Background scroll locked, Escape closes |
| **Long response bodies** | Capped at 5000 chars in `DispatchWebhookJob`, scrollable pre block |

## 8. Acceptance Criteria

- [ ] `GET /settings/webhooks/deliveries` returns 200 with correct Inertia component
- [ ] Stats show correct counts across statuses
- [ ] Success rate is computed correctly (3/4 = 75)
- [ ] Filters (status, event, destination_id, search) all narrow results correctly
- [ ] All data is tenant-scoped (both listing and stats)
- [ ] `POST .../deliveries/{id}/retry` dispatches `DispatchWebhookJob` only for failed deliveries
- [ ] Retry on non-failed status returns error flash
- [ ] Retry on other tenant's delivery returns 404
- [ ] KPI row shows 5 cards with `data-testid` attributes
- [ ] Filter bar has search, 3 selects, and clear button
- [ ] Table cells are clickable and open the drawer
- [ ] Drawer shows payload JSON, response body, and retry CTA for failed
- [ ] Pagination uses Catalyst `<Pagination>` component
- [ ] Empty state shows "Configure Webhook" link

## 9. Test Plan

### Existing (carried forward)
- `test_index_requires_authentication`
- `test_index_renders_empty_state`
- `test_index_lists_deliveries`
- `test_index_scoped_to_tenant`
- `test_filters_by_status`
- `test_filters_by_event`
- `test_show_returns_delivery_json`
- `test_show_scoped_to_tenant`
- `test_index_shows_stats`

### New
- `test_filters_by_destination` — destination_id param filters correctly
- `test_filters_by_search` — search term filters by event name
- `test_success_rate_calculated_correctly` — 3 success / 4 total = 75
- `test_stats_scoped_to_tenant` — other tenant's deliveries not counted
- `test_retry_dispatches_job_for_failed_delivery` — Queue fake, assert pushed
- `test_retry_rejects_non_failed_delivery` — success delivery, assert not pushed + error
- `test_retry_scoped_to_tenant` — other tenant's delivery returns 404
- `test_retry_requires_authentication` — unauthenticated returns 302

Run: `php artisan test --compact tests/Feature/Web/WebhookDeliveryTest.php`

## 10. P0 / P1 Follow-ups

| Priority | Item |
|----------|------|
| P0 | None. Bug is fixed, page is operational. |
| P1 | Add `duration_ms` column to `webhook_deliveries` to track latency |
| P1 | Add `response_headers` column for debugging |
| P2 | Bulk retry (select multiple failed deliveries) |
| P2 | Webhook delivery alerting when failure rate exceeds threshold |
| P3 | Real-time delivery status via Laravel Reverb |
