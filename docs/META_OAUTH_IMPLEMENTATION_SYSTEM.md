# Meta OAuth Implementation System Guide (v25.0)

This document provides a comprehensive overview of the Meta (Facebook) integration within LeadBajar. It covers the complete lifecycle from initial OAuth connection to ad publishing and real-time lead reception.

---

## 🏗️ System Architecture

The integration follows a standard **Client-Server-Provider** architecture:
- **Frontend**: Next.js (React) - Handles user interaction and OAuth initiation.
- **Backend**: Laravel (PHP 8.2+) - Handles token exchange, asset management, and webhook processing.
- **Provider**: Meta Graph API v25.0 - The source of truth for ads and leads.

---

## 🛠️ Step 1: Connecting Facebook (OAuth 2.0 Flow)

### 1.1 Initiation
The user clicks "Connect Facebook" in the `FacebookDashboard`. The frontend calls the backend to get a secure authorization URL.

- **Scopes Requested**: 
  - `ads_management`, `ads_read` (Ads Manager access)
  - `leads_retrieval` (Fetching lead data)
  - `pages_read_engagement`, `pages_show_list` (Page access)
  - `business_management` (Business Manager access)
- **State Handling**: The backend generates a base64 encoded JSON string containing `user_id` and a `nonce` to prevent CSRF and maintain state after redirect.

### 1.2 Callback Handling
Meta redirects the user back to the system with an authorization `code`.
1. **Code Exchange**: Backend exchanges `code` for a **Short-Lived Access Token** (valid for ~2 hours).
2. **Token Upgrade**: Backend exchanges the short-lived token for a **Long-Lived Access Token** (valid for 60 days).
3. **Identity Verification**: Fetches user details (`/me`) to confirm account ownership.
4. **Initial Asset Discovery**: Fetches managed pages (`/me/accounts`) to verify permissions.

### 1.3 Storage
Tokens are stored in the `integrations` table with:
- `user_id`: Owner of the integration.
- `type`: `meta_oauth`.
- `config`: Encrypted access token and metadata.
- `is_active`: Set to `true` upon successful connection.

---

## 🔄 Step 2: Asset Synchronization

Once connected, the system automatically performs a **Minimal Sync**:
1. **Fetch Pages**: Retrieves all Facebook Pages where the user has tasks.
2. **Fetch Ad Accounts**: Retrieves all Ad Accounts linked to the user's profile.
3. **Database Mapping**: Stores pages in `meta_pages` and ad accounts in the system for quick access in the dashboard.

---

## 📢 Step 3: Publishing Ads & Form Management

### 3.1 Lead Gen Form Creation
LeadBajar allows creating forms directly from the dashboard:
- **API Endpoint**: `POST /{page-id}/leadgen_forms`
- **Configuration**: Includes standard fields (Full Name, Email, Phone) and a Privacy Policy URL.
- **Verification**: The form must be set to `ACTIVE` on Meta to receive leads.

### 3.2 Campaign & Ad Set Creation
1. **Campaign**: Created with `objective: OUTCOME_LEADS` and status `PAUSED`.
2. **Ad Set**: Configured with targeting, budget, and linking to the campaign.
3. **Ad Creative**: The visual component (image/video + copy).
4. **Ad**: The final object linking the Creative, Ad Set, and Lead Form.

### 3.3 Templates
The system supports **Campaign Templates** (stored in `meta_campaign_templates`). This allows users to launch pre-configured "High Performing" campaigns with a single click.

---

## 🔗 Step 4: Real-time Lead Reception (Webhooks)

### 4.1 Webhook Subscription
To receive leads in real-time, the application must be subscribed to the Facebook Page:
- **Subscription API**: `POST /{page-id}/subscribed_apps`
- **Field**: `subscribed_fields = leadgen`
- **Verification**: Meta sends a `hub.challenge` to `api/meta/webhook/verify` to confirm endpoint ownership.

### 4.2 Lead Event Processing
When a lead is submitted:
1. Meta sends a POST request to the webhook endpoint.
2. **Payload Extraction**: Extract `leadgen_id`, `form_id`, and `page_id`.
3. **Fetch Lead Details**: The system calls `GET /{leadgen-id}` using the stored Page/User access token.
4. **Data Normalization**: Fields like `full_name`, `email`, and `phone` are extracted and formatted (e.g., adding '91' prefix to Indian numbers).

---

## 📥 Step 5: CRM Integration & Lead Storage

### 5.1 Lead Saving
Leads are saved in the central `leads` table with:
- `fb_lead_id`: The unique ID from Meta (used for deduplication).
- `source`: `meta_leadgen`.
- `fb_form_id`: Helps track which form generated the lead.
- `field_data`: Stored as JSON for future reference.

### 5.2 Automated Actions
Once a lead is saved, the system can trigger:
- **WhatsApp Welcome Messages**: Automated via the associated WhatsApp integration.
- **NLP Processing**: If configured, the lead details are analyzed.
- **Notification**: Alerts sent to the user via Push/Email.

---

## 🔍 Maintenance & Monitoring

### Historical Retrieval
If a webhook is missed (rare but possible), the "Sync History" feature in the dashboard allows pulling historical leads directly from the API for the last 90 days.

### Token Maintenance
Access tokens expire every 60 days. The system provides a "Refresh Token" button in the UI and can be configured to alert users when a token is nearing expiry.

### Deep Sync
For performance analysis, the "Deep Sync" feature pulls:
- **Insights**: CPM, CTR, Spend, and Reach.
- **Campaign History**: Full list of active and paused ads.

---

> [!IMPORTANT]
> Always ensure that the `redirect_uri` configured in the Meta App Dashboard exactly matches the backend callback URL defined in the `.env` file (`META_REDIRECT_URI`).
