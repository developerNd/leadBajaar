# Meta Pixel & Conversion API (CAPI) — Full Implementation Guide

> **Created:** 2026-03-10 | **Last Updated:** 2026-03-11  
> **Author:** LeadBajaar Engineering  
> **Status:** ✅ All Phases Complete — Production Hardened (v3 — Pixel Creation Flow)

---

## Table of Contents

1. [Architecture Overview](#architecture-overview)
2. [Pixel Creation Flow](#pixel-creation-flow) ✨
3. [Database Schema](#database-schema)
4. [Backend Implementation](#backend-implementation)
5. [Frontend Implementation](#frontend-implementation)
6. [How Tracking Works (Flow)](#how-tracking-works-flow)
7. [Tracking Script Reference](#tracking-script-reference)
8. [Testing Guide](#testing-guide)
9. [Phase Roadmap](#phase-roadmap)
10. [Troubleshooting](#troubleshooting)
11. [Security & Privacy](#security--privacy)

---

## Architecture Overview

LeadBajaar acts as an intelligent bridge between your client's website and Meta's advertising platform, enabling **Hybrid Tracking** — the most accurate method recommended by Meta.

```
Client Website
    │
    ├── Browser Pixel Event (fbq)
    │       │
    │       └──→ Meta Events Manager (direct)
    │
    └── LeadBajaar CAPI Bridge (lbTrack)
            │
            ↓
    POST /api/tracking/event
            │
            ↓
    LeadBajaar CRM Backend
            │
            ├── Hashes PII immediately (SHA-256) — raw data never stored
            ├── Stores hashed event in meta_events table
            └── Forwards to Meta Conversion API v21.0 (CAPI)
                        │
                        ↓
               Meta Events Manager
               (deduplicates via event_id)
```

### Why Hybrid Tracking?

| Method | Accuracy | Ad Blockers | Server Load |
|--------|----------|-------------|-------------|
| Browser Pixel only | ~60-70% | ❌ Blocked | Low |
| CAPI only | ~85-90% | ✅ Immune | Medium |
| **Hybrid (LB approach)** | **~95-98%** | ✅ Immune | Medium |

Meta deduplicates using the shared `event_id` — so you never double-count, only improve accuracy.

---

## Pixel Creation Flow

Pixels live inside an Ad Account. LeadBajaar follows the correct Meta hierarchy to create them.

```
Business Manager
      ↓
  Ad Account
      ↓
    Pixel     ← Created via LeadBajaar
      ↓
  Install Script
      ↓
  Enable CAPI
```

### Recommended User Flow (CRM UI)

```
Connect Facebook (OAuth)
      ↓
Sync Ad Accounts       ← automatic on first load
      ↓
Pixels / CAPI tab
      ↓
Click “Create Pixel”  ← opens 3-step wizard
      ↓
Step 1: Select Ad Account from dropdown
      ↓
Step 2: Enter Pixel Name  → Click "Create"
      ↓
Step 3: Copy Install Script  → Paste in <head>
      ↓
Enable CAPI   ← lbTrack() bridge is already in the script
```

### Meta API Call

```
POST https://graph.facebook.com/v21.0/act_{AD_ACCOUNT_ID}/adspixels

Body:
  name         = "LeadBajaar Main Pixel"
  access_token = USER_ACCESS_TOKEN

Response:
  { "id": "1234567890123" }   ← This is the Pixel ID
```

### Required OAuth Permissions

| Permission | Purpose |
|------------|--------|
| `ads_management` | Create pixels, manage ad accounts |
| `ads_read` | Read pixel list, stats |
| `business_management` | Access Business Manager assets |

> The user must have **Ad Account Admin** access. Pixel creation will fail with a `Permissions error` if they are only an analyst.

### Common Errors

| Error | Cause | Fix |
|-------|-------|-----|
| `Permissions error` | Not Ad Account Admin | Ask account owner to upgrade your role |
| `Invalid ad account` | Wrong account ID format | LeadBajaar strips `act_` prefix automatically |
| `Expired token` | OAuth token timed out | Re-connect Meta integration |
| `Ad account disabled` | Account inactive | Check in Business Manager |

---

## Database Schema

### New Tables (Migrations in `database/migrations/2026_03_10_*`)

#### `meta_pixels`
Stores all Meta pixels connected to a user's account.

```sql
CREATE TABLE meta_pixels (
    id              BIGINT PRIMARY KEY AUTO_INCREMENT,
    user_id         BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    pixel_id        VARCHAR(255) UNIQUE NOT NULL,   -- Meta Pixel ID (e.g. "123456789")
    ad_account_id   VARCHAR(255) NULLABLE,
    name            VARCHAR(255) NULLABLE,
    is_active       BOOLEAN DEFAULT TRUE,
    created_at      TIMESTAMP,
    updated_at      TIMESTAMP
);
```

#### `meta_events`
Full audit log of every event sent to Meta CAPI.

```sql
CREATE TABLE meta_events (
    id               BIGINT PRIMARY KEY AUTO_INCREMENT,
    user_id          BIGINT NOT NULL REFERENCES users(id),
    pixel_id         VARCHAR(255) NOT NULL,
    event_name       VARCHAR(255) NOT NULL,      -- 'Lead', 'Purchase', 'PageView', etc.
    event_id         VARCHAR(255) NULLABLE,      -- Shared browser+server dedup key
    user_data        JSON NULLABLE,             -- Hashed (SHA-256) PII
    custom_data      JSON NULLABLE,             -- Value, currency, content_name, etc.
    status           VARCHAR(50) DEFAULT 'pending',  -- pending | sent | failed
    response_payload JSON NULLABLE,             -- Meta API response
    created_at       TIMESTAMP,
    updated_at       TIMESTAMP
);
```

#### `meta_conversions`
Links conversions to CRM leads for revenue attribution.

```sql
CREATE TABLE meta_conversions (
    id          BIGINT PRIMARY KEY AUTO_INCREMENT,
    lead_id     BIGINT NOT NULL REFERENCES leads(id) ON DELETE CASCADE,
    pixel_id    VARCHAR(255) NOT NULL,
    event_name  VARCHAR(255) NOT NULL,
    event_id    VARCHAR(255) NULLABLE,
    status      VARCHAR(50) DEFAULT 'captured',
    value       DECIMAL(12,2) NULLABLE,   -- Monetary value of conversion
    currency    VARCHAR(10) NULLABLE,     -- 'INR', 'USD', etc.
    created_at  TIMESTAMP,
    updated_at  TIMESTAMP
);
```

#### Updated `leads` table (Migration `2026_03_10_170407_*`)
```sql
ALTER TABLE leads ADD COLUMN pixel_id     VARCHAR(255) NULLABLE;
ALTER TABLE leads ADD COLUMN utm_source   VARCHAR(255) NULLABLE;
ALTER TABLE leads ADD COLUMN utm_medium   VARCHAR(255) NULLABLE;
ALTER TABLE leads ADD COLUMN utm_campaign VARCHAR(255) NULLABLE;
ALTER TABLE leads ADD COLUMN utm_content  VARCHAR(255) NULLABLE;
ALTER TABLE leads ADD COLUMN utm_term     VARCHAR(255) NULLABLE;
ALTER TABLE leads ADD COLUMN fbcl_id      VARCHAR(255) NULLABLE;  -- Facebook Click ID (_fbc cookie)
```

### Running Migrations

```bash
# On your production server:
php artisan migrate --path=database/migrations/2026_03_10_170300_create_meta_pixels_table_v2.php
php artisan migrate --path=database/migrations/2026_03_10_170311_create_meta_events_table.php
php artisan migrate --path=database/migrations/2026_03_10_170333_create_meta_conversions_table.php
php artisan migrate --path=database/migrations/2026_03_10_170407_add_utm_and_pixel_to_leads_table.php

# Or all at once:
php artisan migrate
```

---

## Backend Implementation

### File Structure

```
app/
├── Http/
│   └── Controllers/
│       ├── Meta/
│       │   ├── MetaPixelController.php         ← Pixel CRUD + create via Meta API ✨
│       │   └── ConversionDashboardController.php ← ROI metrics API
│       └── TrackingController.php              ← Public event ingestion endpoint
│
├── Models/
│   ├── MetaPixel.php       ← ORM for meta_pixels
│   ├── MetaEvent.php       ← ORM for meta_events
│   ├── MetaConversion.php  ← ORM for meta_conversions
│   └── Lead.php            ← Updated with pixel/UTM fillable fields
│
├── Observers/
│   ├── LeadObserver.php    ← Auto-fires CAPI on Lead stage changes
│   └── UserObserver.php    ← Auto-fires CompleteRegistration on signup
│
├── Providers/
│   └── AppServiceProvider.php  ← Registers LeadObserver + UserObserver
│
└── Services/
    ├── FacebookConversionApiService.php  ← Core CAPI logic (hashing, sending) — v21.0
    └── FacebookApiService.php            ← Graph API: getUserPixels(), createPixel() ✨ — v21.0
```

### Key Controllers

#### `MetaPixelController` — `/api/meta/pixels`

| Method | Route | Description |
|--------|-------|-------------|
| GET | `/api/meta/pixels` | List all pixels for the authenticated user |
| POST | `/api/meta/pixels/sync` | Sync pixels from Meta Graph API |
| **POST** | **`/api/meta/pixels/create`** | **Create new pixel in Meta + store locally** ✨ |
| GET | `/api/meta/pixels/roi-summary` | ROI analytics summary |
| PATCH | `/api/meta/pixels/{id}` | Update pixel (toggle `is_active`, rename) |
| DELETE | `/api/meta/pixels/{id}` | Remove pixel from local DB |

##### `create` endpoint detail

```
POST /api/meta/pixels/create   (auth:sanctum required)
```

**Request Body:**
```json
{
  "name":          "My Tracking Pixel",
  "ad_account_id": "act_1234567890"   // or just "1234567890" — prefix stripped automatically
}
```

**Success Response (201):**
```json
{
  "status":  "success",
  "message": "Pixel \"My Tracking Pixel\" created successfully.",
  "pixel":   { "id": 1, "pixel_id": "1234567890123", "name": "My Tracking Pixel", ... }
}
```

**Error Response (422):**
```json
{
  "status":  "error",
  "message": "Permissions error",
  "details": { "code": 200, "type": "OAuthException" }
}
```

#### `TrackingController` — Public Endpoint

```
POST /api/tracking/event
```

**Request Body:**
```json
{
    "pixel_id":    "1234567890",
    "event_name":  "Lead",
    "event_id":    "lb_abc123_1710083200000",
    "user_data":   { "email": "user@email.com", "phone": "+919876543210" },
    "custom_data": { "value": 999, "currency": "INR" },
    "source_url":  "https://yourclient.com/landing-page"
}
```

**What it does:**
1. Validates input
2. **Hashes PII immediately** via `hashUserData()` — raw data never stored anywhere
3. Stores the hashed event in `meta_events` (status: `pending`)
4. Sends to Meta CAPI v21.0
5. Updates event status to `sent` or `failed` with Meta's response

> ⚡ **Rate Limited:** `throttle:120,1` — 120 requests per minute per IP

#### `LeadObserver` — Automatic CAPI

Attached in `AppServiceProvider::boot()`. Fires automatically:

| Trigger | Event Fired | Stages |
|---------|------------|--------|
| `Lead::created` (with `pixel_id` or `fbcl_id`) | `Lead` | Any |
| `Lead::updated` stage → won/converted/closed | `Purchase` | won, converted, closed |
| `Lead::updated` stage → qualified/hot/etc | `LeadQualified` ✨ | qualified, hot, interested, demo, proposal |

#### `UserObserver` — Automatic Registration Tracking ✨ NEW

Attached in `AppServiceProvider::boot()`. Fires automatically:

- `User::created` → Sends `CompleteRegistration` CAPI event using the user's first active pixel

### `FacebookConversionApiService` — Core Service

**Key public methods:**

```php
// Send an event to Meta CAPI
$service->sendConversionEvent(array $eventData, string $pixelId, string $accessToken): array

// Hash user data (SHA-256) for GDPR/privacy compliance
$service->hashUserData(array $userData): array
// Input:  ['email' => 'user@email.com', 'phone' => '+91...', 'first_name' => 'Raj']
// Output: ['em' => 'abc123...', 'ph' => 'def456...', 'fn' => 'xyz789...']

// Create a Lead event payload
$service->createLeadEvent(array $leadData, array $userData): array

// Create a custom event payload
$service->createCustomEvent(string $eventName, array $customData, array $userData): array
```

### Routes Summary (`routes/api.php`)

```php
// PUBLIC — rate limited (120/min per IP), no auth required
Route::middleware(['throttle:120,1'])->post('/tracking/event', [TrackingController::class, 'track']);

// PROTECTED — requires sanctum auth
Route::middleware('auth:sanctum')->prefix('meta')->group(function () {
    Route::prefix('pixels')->group(function () {
        Route::get('/',              [MetaPixelController::class, 'index']);
        Route::post('/sync',         [MetaPixelController::class, 'sync']);
        Route::post('/create',       [MetaPixelController::class, 'create']); // ✨ Create new pixel
        Route::get('/roi-summary',   [ConversionDashboardController::class, 'summary']);
        Route::patch('/{id}',        [MetaPixelController::class, 'update']);
        Route::delete('/{id}',       [MetaPixelController::class, 'destroy']);
    });
});
```

> **Route ordering:** `/create` and `/roi-summary` are declared **before** `/{id}` to prevent the parameterized route swallowing them.

---

## Frontend Implementation

### File Structure

```
src/
├── lib/
│   └── api.ts                          ← All API client calls
│
└── components/
    └── facebook-oauth/
        ├── FacebookDashboard.tsx        ← Main 6-tab Meta dashboard
        ├── PixelTestConsole.tsx         ← Pixel Manager header + Test Console + Script Generator
        ├── CreatePixelModal.tsx         ← ✨ NEW: 3-step pixel creation wizard
        └── RoiDashboard.tsx             ← ROI analytics cards + chart
```

### `api.ts` — Integration API Methods

```typescript
// Pixel Management
integrationApi.getMetaPixels()                             // GET  /meta/pixels
integrationApi.syncMetaPixels()                            // POST /meta/pixels/sync
integrationApi.createMetaPixel({ name, ad_account_id })    // POST /meta/pixels/create  ✨
integrationApi.updateMetaPixel(id, { is_active })          // PATCH /meta/pixels/{id}
integrationApi.deleteMetaPixel(id)                         // DELETE /meta/pixels/{id}
integrationApi.getMetaPixelRoiSummary(days?: number)       // GET /meta/pixels/roi-summary

// CAPI Testing
integrationApi.sendTestConversionEvent({
    pixel_id, test_event_code, event_name,
    event_data, user_data
})
```

### `FacebookDashboard.tsx` — Tab Structure

| Tab | Value | Component/Content |
|-----|-------|-------------------|
| Pages & Leads | `pages` | Pages list + Lead Forms |
| Ads Manager | `ads` | Campaigns, Ad Sets, Ads |
| Ad Creatives | `creatives` | Creative library |
| Ad Templates | `templates` | Template launcher |
| **Pixels / CAPI** | `pixels` | Pixel table + **PixelTestConsole** (with Create button) |
| **ROI Analytics** | `roi` | **RoiDashboard** |

### `PixelTestConsole.tsx` Props

```typescript
interface PixelTestConsoleProps {
    pixels: Pixel[]            // Array of synced pixels
    adAccounts: AdAccount[]    // ✨ For the Create Pixel wizard
    onRefreshPixels: () => void // Callback to re-sync pixels
    isSyncingPixels: boolean   // Loading state
}
```

**Features:**
- **Top action bar**: pixel count badge, **Sync from Meta** button, **Create Pixel** button ✨
- **Test Console tab**: fire CAPI events with real-time terminal log
- **Get Script tab**: syntax-highlighted tracking script generator with copy button

### `CreatePixelModal.tsx` ✨ NEW

3-step wizard dialog triggered by the **Create Pixel** button in `PixelTestConsole`.

| Step | UI | What happens |
|------|----|-------------|
| 1 — Select Ad Account | Scrollable list of connected ad accounts | User picks where pixel will live |
| 2 — Name Pixel | Text input + live hierarchy preview | Calls `POST /meta/pixels/create` on submit |
| 3 — Install Script | Green success banner + copy-ready script | Shows complete tracking script with CAPI bridge |

**Props:**
```typescript
interface CreatePixelModalProps {
    open: boolean
    onClose: () => void
    adAccounts: { id: string; name: string; account_id: string }[]
    onPixelCreated: (pixel: CreatedPixel) => void  // refreshes pixel list
}
```

### `RoiDashboard.tsx`

Standalone component. Fetches `/meta/pixels/roi-summary?days=30` on mount.

**Renders:**
- 3 KPI cards (Total Events, Conversions, Revenue)
- Custom bar chart (daily event counts)
- Event type breakdown with animated progress bars
- Empty state / live tracking banner

---

## How Tracking Works (Flow)

### Website Visitor Flow

```
1. Visitor lands on landing page
        ↓
2. Browser loads Meta Pixel (fbq init + PageView)
        ↓
3. Visitor fills form → clicks Submit
        ↓
4. JS calls: lbTrack('Lead', { email: '...' }, { value: 999 })
        ↓
5a. BROWSER: fbq('track', 'Lead', { event_id: 'lb_abc123' })
                        │
                        └──→ Meta (direct browser hit)

5b. SERVER: fetch('/api/tracking/event', { pixel_id, event_id: 'lb_abc123', ... })
                        │
                        └──→ LeadBajaar Backend
                                    │
                                    ├── Saves to meta_events
                                    ├── Hashes PII
                                    └──→ Meta CAPI
                                                │
                                                └── Meta merges 5a + 5b
                                                    via shared event_id
                                                    (deduplication ✓)
```

### CRM Lead & User Flow (Automatic)

```
─────────── NEW LEAD ───────────
LeadBajaar receives new Lead
        ↓
Lead::created → LeadObserver::created()
        ↓
Has pixel_id or fbcl_id? → YES → Send CAPI 'Lead' event

─────────── LEAD QUALIFIED ─────
Lead stage → qualified/hot/interested/demo/proposal
        ↓
Lead::updated → LeadObserver::updated()
        ↓
Send CAPI 'LeadQualified' custom event  ✨ NEW

─────────── DEAL WON ───────────
Lead stage → Won / Converted / Closed
        ↓
Lead::updated → LeadObserver::updated()
        ↓
Send CAPI 'Purchase' event with deal_value

─────────── USER SIGNUP ────────
New user registers in LeadBajaar
        ↓
User::created → UserObserver::created()  ✨ NEW
        ↓
Finds user's first active pixel
        ↓
Send CAPI 'CompleteRegistration' event
```

---

## Tracking Script Reference

### Installation (Paste in `<head>`)

```html
<!-- LeadBajaar Meta Pixel + CAPI Bridge for: [PIXEL NAME] -->
<script>
  !function(f,b,e,v,n,t,s)
  {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
  n.callMethod.apply(n,arguments):n.queue.push(arguments)};
  if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
  n.queue=[];t=b.createElement(e);t.async=!0;
  t.src=v;s=b.getElementsByTagName(e)[0];
  s.parentNode.insertBefore(t,s)}(window, document,'script',
  'https://connect.facebook.net/en_US/fbevents.js');

  fbq('init', 'YOUR_PIXEL_ID');
  fbq('track', 'PageView');

  window.lbTrack = function(eventName, userData, customData) {
    userData = userData || {};
    customData = customData || {};
    var eventId = 'lb_' + Math.random().toString(36).substr(2,9) + '_' + Date.now();
    
    // Browser Pixel
    fbq('track', eventName, Object.assign({}, customData, { event_id: eventId }));
    
    // Server-side CAPI via LeadBajaar
    fetch('https://api.leadbajaar.com/api/tracking/event', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        pixel_id: 'YOUR_PIXEL_ID',
        event_name: eventName,
        event_id: eventId,
        user_data: userData,
        custom_data: customData,
        source_url: window.location.href
      })
    }).catch(function(e) { console.warn('LB CAPI:', e); });
    
    return eventId;
  };
</script>
<noscript>
  <img height="1" width="1" style="display:none" 
    src="https://www.facebook.com/tr?id=YOUR_PIXEL_ID&ev=PageView&noscript=1"/>
</noscript>
```

### Usage Examples

```javascript
// Track a Lead (form submission)
document.getElementById('lead-form').addEventListener('submit', function(e) {
    e.preventDefault();
    var email = document.getElementById('email').value;
    var phone = document.getElementById('phone').value;
    
    lbTrack('Lead', {
        email: email,
        phone: phone
    }, {
        content_name: 'Homepage Lead Form',
        value: 0,
        currency: 'INR'
    });
    
    // Then submit form...
});

// Track a Purchase
lbTrack('Purchase', { email: 'user@example.com' }, {
    value: 4999,
    currency: 'INR',
    content_name: 'Premium Plan'
});

// Track a Page View (automatic, no need to call manually)
// Already fires on page load via fbq('track', 'PageView')

// Track Registration
lbTrack('CompleteRegistration', {
    email: 'newuser@example.com',
    first_name: 'Rahul'
});
```

---

## Testing Guide

### Flow 1: Create a Pixel (New Feature ✨)

1. Open LeadBajaar → **Meta Business Suite** → **Pixels / CAPI** tab
2. Click **"Create Pixel"** (top-right button)
3. **Step 1** — Select your Ad Account from the list
4. **Step 2** — Enter a name (e.g. "My Website Pixel") → click **"Create Pixel"**
5. **Step 3** — Copy the install script → paste inside `<head>` of your website
6. Enable the CAPI bridge by calling `lbTrack()` on form submissions

### Flow 2: Sync Existing Pixels

1. Open **Pixels / CAPI** tab
2. Click **"Sync from Meta"**
3. All pixels from all connected ad accounts will appear in the table

### Flow 3: Test Events

### Step 1: Get Your Test Event Code

1. Go to [Meta Events Manager](https://business.facebook.com/events_manager/)
2. Select your Pixel → **Test Events** tab
3. Copy the `TEST12345`-style code shown

### Step 2: Use the In-App Test Console

1. Open LeadBajaar → **Meta Business Suite** → **Pixels / CAPI** tab
2. Sync or create a pixel first
3. Switch to **Test Console** tab in the `PixelTestConsole` panel
4. Select your pixel, choose event type, fill in user data
5. Paste your **Test Event Code**
6. Click **"Fire Test Event"**
7. Watch the **Live Log Console** for real-time results

### Step 3: Verify in Meta Events Manager

- Events appear in the **Test Events** tab within ~30 seconds
- You'll see both the browser pixel event and the CAPI event
- They'll be deduplicated and shown as one unified event

### Step 4: Go Live

Once verified, remove the `test_event_code` from production requests.

```env
# .env — for testing
FACEBOOK_TEST_EVENT_CODE=TEST12345

# .env — for production (leave blank or remove)
FACEBOOK_TEST_EVENT_CODE=
```

---

## Phase Roadmap

### ✅ Phase 1 — Database & Models
- [x] `meta_pixels`, `meta_events`, `meta_conversions` migrations
- [x] Updated `leads` table (UTM + pixel attribution fields)
- [x] Eloquent models for all new tables
- [x] Updated `Lead` model fillable fields

### ✅ Phase 2 — Backend Services & API
- [x] `MetaPixelController` (sync, CRUD)
- [x] `MetaPixelController::create()` — creates pixel in Meta via Graph API ✨
- [x] `FacebookApiService::createPixel()` — POSTs to `/act_{id}/adspixels` ✨
- [x] `TrackingController` (public event ingestion, rate-limited)
- [x] `ConversionDashboardController` (ROI metrics)
- [x] `LeadObserver` (Lead, LeadQualified, Purchase CAPI events)
- [x] `UserObserver` (CompleteRegistration CAPI on signup)
- [x] `FacebookConversionApiService::hashUserData()` — PII hashed before DB storage
- [x] Meta Graph API v21.0
- [x] `getUserPixels()` via correct `/adspixels` endpoint
- [x] Routes registered with correct ordering + rate limiting

### ✅ Phase 2 — Frontend UI
- [x] `integrationApi.createMetaPixel()` API method ✨
- [x] `CreatePixelModal` — 3-step wizard (Ad Account → Name → Install Script) ✨
- [x] `PixelTestConsole` — Create Pixel button + Sync button in top action bar ✨
- [x] `Pixels / CAPI` tab in `FacebookDashboard`
- [x] `RoiDashboard` component (metrics + chart + breakdown)
- [x] `ROI Analytics` tab in `FacebookDashboard`

### 🔜 Phase 3 — Advanced Features (Future)
- [ ] **Lead Attribution Report** — Table of leads grouped by `fb_campaign_id`
- [ ] **UTM Dashboard** — Group leads by `utm_source`, `utm_campaign`
- [ ] **Cost Per Lead** — Join ad spend data from Meta Insights API
- [ ] **Pixel Health Monitor** — Alert if no events fire for 24h (`last_fired_time`)
- [ ] **Custom Audience Sync** — Push CRM leads to Meta Custom Audiences
- [ ] **Lookalike Audience** — Auto-generate LAL from top-value leads

---

## Troubleshooting

### Events Not Appearing in Meta Events Manager

| Symptom | Cause | Fix |
|---------|-------|-----|
| Events not shown | Wrong `access_token` | Re-connect Meta integration in LeadBajaar |
| "Invalid pixel ID" | Wrong pixel ID | Use "Sync from Meta" to auto-populate |
| Events shown in browser, not CAPI | Server can't reach Meta | Check server firewall / outbound HTTPS |
| Duplicate events (2x count) | Missing `event_id` | Ensure the script always generates and passes `event_id` |
| Events show as test only | `TEST_EVENT_CODE` set in prod | Remove from `.env` or set to empty |
| **Pixel creation fails** | **No Ad Account Admin role** | **Ask account owner to upgrade your permissions** |
| **Pixel creation fails** | **Token expired** | **Re-connect Meta integration (OAuth again)** |

### Backend: Check Event Status

```bash
# See recent events and their status
php artisan tinker
>>> App\Models\MetaEvent::latest()->take(10)->get(['event_name', 'status', 'response_payload', 'created_at'])
```

### Backend: Manual CAPI Test

```bash
curl -X POST https://api.leadbajaar.com/api/tracking/event \
  -H "Content-Type: application/json" \
  -d '{
    "pixel_id": "YOUR_PIXEL_ID",
    "event_name": "Lead",
    "event_id": "manual_test_001",
    "user_data": { "email": "test@example.com" },
    "custom_data": { "value": 0, "currency": "INR" },
    "source_url": "https://test.example.com"
  }'
```

---

## Security & Privacy

### PII Hashing

All Personally Identifiable Information is **SHA-256 hashed** before leaving LeadBajaar's server. Nothing is stored or transmitted in plain text.

| Field | Hashed | Meta Field |
|-------|--------|------------|
| Email | ✅ SHA-256, lowercase | `em` |
| Phone | ✅ SHA-256, digits only | `ph` |
| First Name | ✅ SHA-256, lowercase | `fn` |
| Last Name | ✅ SHA-256, lowercase | `ln` |
| City | ✅ SHA-256, lowercase | `ct` |
| State | ✅ SHA-256, lowercase | `st` |

### GDPR / Data Handling

- Raw PII is **hashed immediately on receipt** — it never touches the database or log files
- `meta_events.user_data` stores only SHA-256 hashes (`em`, `ph`, `fn`, etc.)
- Leads can be deleted from the CRM, which cascades to remove their `meta_conversions`
- The public `/api/tracking/event` endpoint is **rate-limited** to 120 req/min per IP ✅

```php
// Already applied in routes/api.php:
Route::middleware(['throttle:120,1'])->post('/tracking/event', [TrackingController::class, 'track']);
```

### Access Token Storage

Meta access tokens are stored in the `integrations` table under the user's account. They are:
- Scoped per user (no cross-user access)
- Used only server-side for CAPI calls
- Never exposed to the browser/frontend

---

## Key Files Quick Reference

| Layer | File | Purpose |
|-------|------|---------|
| **Frontend** | `src/lib/api.ts` | All `integrationApi.*` pixel & CAPI methods |
| **Frontend** | `src/components/facebook-oauth/FacebookDashboard.tsx` | Main dashboard with 6 tabs |
| **Frontend** | `src/components/facebook-oauth/PixelTestConsole.tsx` | Pixel Manager, Test Console, Script Generator |
| **Frontend** | `src/components/facebook-oauth/CreatePixelModal.tsx` ✨ | 3-step pixel creation wizard |
| **Frontend** | `src/components/facebook-oauth/RoiDashboard.tsx` | ROI metrics, bar chart, event breakdown |
| **Backend** | `app/Http/Controllers/Meta/MetaPixelController.php` | Pixel sync, create in Meta, CRUD |
| **Backend** | `app/Http/Controllers/TrackingController.php` | Public event ingestion (rate-limited) |
| **Backend** | `app/Http/Controllers/Meta/ConversionDashboardController.php` | ROI summary API |
| **Backend** | `app/Observers/LeadObserver.php` | Lead → Lead, LeadQualified, Purchase events |
| **Backend** | `app/Observers/UserObserver.php` | User signup → CompleteRegistration event |
| **Backend** | `app/Services/FacebookConversionApiService.php` | Core CAPI logic + SHA-256 hashing (v21.0) |
| **Backend** | `app/Services/FacebookApiService.php` | `getUserPixels()`, `createPixel()` via v21.0 API |
| **Backend** | `routes/api.php` | Route definitions |
| **DB** | `database/migrations/2026_03_10_*` | All 4 new migration files |

---

*Last Updated: 2026-03-11 (v3 — Pixel Creation Flow) by LeadBajaar Engineering*
