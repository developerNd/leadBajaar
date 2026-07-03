---
type: index
generatedAt: 2026-07-04
---

# ai-context/ — LeadBajaar Frontend AI Context

Start here. This folder is generated documentation for AI coding agents working in `f:/LeadBajar/leadbajaar1.0`, a Next.js 15 (App Router, TypeScript) multi-tenant CRM/lead-management frontend. It was produced by reading the actual routes, components, contexts, and API layer — not hand-maintained, and not a copy of marketing feature lists.

## How this folder is organized

| Folder | Contents |
|---|---|
| [`features/`](features/) | One file per product feature (e.g. `leads.md`, `chatbot.md`) — what it does, who can access it, which pages/components/API/flows implement it |
| [`pages/`](pages/) | One file per route (or per closely related route group) — purpose, components used, API calls, notable behavior |
| [`components/`](components/) | One file per `src/components/<group>` directory — purpose of each component file |
| [`api/`](api/) | One file per logical group of API functions (mostly `src/lib/api.ts` export groups, plus dedicated service files) — endpoint tables |
| [`flows/`](flows/) | End-to-end, cross-feature user/system flows |
| [`state/`](state/) | React Context providers (`UserContext`, `ErrorContext`, `WhatsAppContext`) |
| [`hooks/`](hooks/) | Custom hooks in `src/hooks/` |
| [`context-packs/`](context-packs/) | Reserved for future curated bundles of docs for specific tasks — empty for now |

Every file in `features/`, `pages/`, `components/`, `api/`, `flows/`, and `state/` starts with YAML frontmatter (`type`, `slug`/`route`/`group`, `status`, etc.). That's deliberate — an agent (or a script) can rebuild [`manifest.json`](manifest.json) by scanning frontmatter instead of re-reading the whole app.

## Where to go first, by task

- **"What does feature X do / can user Y see it?"** → [feature-map.md](feature-map.md) for the human overview, or the specific `features/<slug>.md`.
- **"What renders at route /foo?"** → `pages/<route-slug>.md`.
- **"What does this component do?"** → `components/<group>.md` (grouped by `src/components/<dir>`).
- **"What API calls exist for X, and what backend endpoint do they hit?"** → `api/<group>.md`.
- **"How does X actually work end-to-end?"** → `flows/<flow>.md`.
- **Machine-readable lookup / scripting** → [manifest.json](manifest.json).
- **Known bugs/gotchas found while writing these docs** → bottom of [feature-map.md](feature-map.md) and `manifest.json`'s `knownIssues`.
- **Keeping this folder in sync as the app changes** → [ai-rules.md](ai-rules.md).

## Repo-wide facts worth knowing before you dive in

- **Multi-tenancy / access control**: every UI surface is gated on up to three independent axes — `role` (Super Admin/Admin/Manager/Agent), `user_type` (individual/agency/super_admin), and subscription `plan` feature keys — all exposed via `useUser()` in `src/contexts/UserContext.tsx`. Super Admin bypasses plan gating entirely. The canonical route→access mapping lives in `src/components/sidebar.tsx`.
- **API calls** should only ever be made through `src/lib/api.ts` (or the dedicated files in `src/services/` / `src/lib/services/`) — never raw `axios`/`fetch` in a page component. Several pages violate this; it's flagged where found.
- **Notifications**: use `sonner` (`toast.success()` / `toast.error()`). The legacy shadcn `useToast` hook still exists and several pages still use it inconsistently — flagged where found.
- **`user.company` is a full object**, not a string — rendering it directly as a React child crashes in production. Always access `user.company?.name` / `user.company?.plan`.
- There are two independent WhatsApp automation systems in this app (the Cloud API/Evolution chatbot flow builder under `/chatbot` and `/evolution/chatbot`, and a separate `/whatsapp-bot` multi-session broadcast tool) — don't assume they share code, they mostly don't.
- A deeper pre-existing architecture writeup lives at `f:/LeadBajar/leadbajaar1.0/context/ai-context.md` — this `ai-context/` folder is the feature-level companion to it, not a replacement.

## Coverage

20 features · 47 pages · 13 component groups · 14 API groups · 14 flows · 3 state contexts · 1 hooks doc. See `manifest.json.stats` for the current count as this folder evolves.
