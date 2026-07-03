---
type: page
route: /integrations/webhooks
file: src/app/(dashboard)/integrations/webhooks/page.tsx
feature: integrations
auth: protected
---
# Page: /integrations/webhooks

## Purpose
Standalone list/CRUD page for generic webhook integrations (both incoming lead receivers and outgoing lead dispatchers). Functionally a near-duplicate of the "Webhooks" tab embedded in the main `/integrations` hub page — same state shape, same handlers, same `WebhookConfigDialog`.

## Components used
- `WebhookConfigDialog` (`@/components/integrations/WebhookConfigDialog`) — create/edit modal (incoming URL + field mapping, or outgoing URL + HMAC secret).
- No `RoleGuard` wrapper.

## Data/API calls
- `integrationApi.getConnectedIntegrations()` filtered to `type === 'webhook'`.
- `integrationApi.saveIntegration({ type: 'webhook', ... })` — create.
- `(integrationApi as any).updateIntegration(id, config)` — update.
- `(integrationApi as any).updateIntegrationStatus(id, isActive)` — toggle.
- `(integrationApi as any).deleteIntegration(id)` — delete (native `confirm()`).
- `integrationApi.getLatestLog(id)` — polled every 3s (up to 2 min) for the "Auto-Detect Fields" listening flow, identical to the hub page's implementation.

## Notable behavior
- Contains its own copy of `flattenPayload()` (dot-notation JSON flattener) duplicated verbatim from `integrations/page.tsx` — a candidate for extraction into a shared util.
- This page and the hub's "Webhooks" tab are functionally redundant; both are reachable (hub via tab, this page via the sidebar's direct "Webhooks" link) and both fully implement create/edit/delete/listen independently against the same backend rows.
