---
type: feature
slug: dashboard
name: Dashboard (Company Overview)
status: active
roles: [Super Admin, Admin, Manager, Agent]
userTypes: []
planFeatureKey: dashboard
routes: ["/dashboard"]
relatedDocs:
  pages: [pages/dashboard.md]
  components: [components/ui-primitives.md]
  api: [api/auth.md]
  flows: []
---

# Feature: Dashboard

## Summary
Landing page after login. Shows aggregate performance stats (leads, meetings, conversion, response time), a monthly overview chart, lead pipeline funnel, recent activity feed, and the current user's account card. Also carries an Android app download promo banner and a "become a beta tester" request form. Available to every role (`Super Admin`, `Admin`, `Manager`, `Agent`) with no plan/type restriction — it's the universal home route gated only by `feature: 'dashboard'` in the sidebar nav.

## Access control
Sidebar entry: `roles: ['Super Admin', 'Admin', 'Manager', 'Agent']`, no `types`/`plans` restriction, `feature: 'dashboard'`. The page itself has no `RoleGuard` wrapper — access control is enforced only by the sidebar link being hidden/shown and by the general `(dashboard)/layout.tsx` protection (`UserProvider` + `SubscriptionGuard`, which redirects unauthenticated users and blocks expired/suspended companies except on `/settings`).

## Key files
- `src/app/(dashboard)/dashboard/page.tsx` — the entire page; no sub-components extracted besides `Overview` (chart) and shadcn primitives.
- `src/lib/api.ts` — `getDashboardStats()` (`GET /dashboard/stats`), `submitTesterRequest()` (`POST /tester-requests`).
- `src/components/overview.tsx` — chart component rendering `monthly_overview` (not read in this cluster; owned by another doc slice if it exists).

## Notes
- **Demo-data fallback**: if `getDashboardStats()` returns empty/zeroed stats (new account) or throws, the page silently substitutes hard-coded `demoDashboardData` and sets `isDemo = true` — worth checking `isDemo` state if debugging "wrong numbers on dashboard" reports, since the UI doesn't visibly label the demo banner differently in the code shown.
- Uses the legacy `useToast` (`@/components/ui/use-toast`) for the tester-request submission — this **contradicts** the repo-wide rule (`context/ai-context.md`) to use `sonner` exclusively. Flag if asked to modernize this page.
- Persists "banner minimized" UI state to `localStorage` (`lb_dashboard_banner_minimized`) — unrelated to auth session storage.
- Dynamic Lucide icon rendering via `(LucideIcons as any)[name]` for `recent_activity.icon_name` — if the backend sends an icon name that doesn't exist in `lucide-react`, it falls back to `Zap`.
- Analytics (`/analytics`, `getAnalyticsData()`) is a **separate feature** owned by another doc cluster — not covered here.
