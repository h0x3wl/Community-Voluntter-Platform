# Hope Foundation API Reference (v1)

Base URL: `/v1` (the application already prefixes routes with `/api`; full prefix is `/api/v1`).

All responses use:

```json
{ "data": ..., "meta": ... }
```

## Request headers

Send JSON requests with:

```
Accept: application/json
Content-Type: application/json
```

For `multipart/form-data` uploads (avatar/image endpoints), omit `Content-Type` and let your HTTP client set the boundary automatically.

### Auth header (required for protected routes)

```
Authorization: Bearer <token>
```

#### Where to get the token

Use the `token` returned from the **POST /auth/register** or **POST /auth/login** response payloads (see Auth section below). Store it client-side and include it on every authenticated request.

### Stripe webhook signature header

The webhook endpoint expects the Stripe signature header:

```
Stripe-Signature: t=...,v1=...
```

#### Where to get the Stripe signature

Stripe sends the `Stripe-Signature` header automatically when it calls your webhook. For local testing, retrieve the signing secret from the Stripe Dashboard (Developers → Webhooks) or from the Stripe CLI output when forwarding events.

## Error responses

Errors are returned as JSON with a `data.message` field. Validation errors also include `data.errors`.

```json
{
  "data": {
    "message": "Validation failed.",
    "errors": {
      "field": ["The field is required."]
    }
  },
  "meta": {}
}
```

## Auth

### POST /auth/register
**Frontend flow:** Use for new user sign-up; on success store the returned token for authenticated requests and hydrate the user profile in state.
**Request**
```json
{
  "first_name": "Jane",
  "last_name": "Doe",
  "email": "jane@example.com",
  "password": "password123",
  "password_confirmation": "password123",
  "account_type": "user"
}
```

**Response**
```json
{
  "data": {
    "user": {
      "public_id": "b8b56b15-4a02-4f5f-9c5f-6dfc2c4fb0a0",
      "first_name": "Jane",
      "last_name": "Doe",
      "email": "jane@example.com",
      "role": "user",
      "phone": null,
      "address_line": null,
      "avatar_url": null,
      "points_balance": 0,
      "last_login_at": null
    },
    "token": "plain-text-token"
  },
  "meta": {}
}
```

### POST /auth/login
**Frontend flow:** Use for existing users to sign in; store the returned token and user profile for subsequent authenticated calls.
**Request**
```json
{ "email": "jane@example.com", "password": "password123" }
```

**Response**
```json
{
  "data": {
    "user": { "public_id": "...", "email": "jane@example.com", "role": "user" },
    "token": "plain-text-token"
  },
  "meta": {}
}
```

### POST /auth/logout
**Auth:** Required. Include `Authorization: Bearer <token>` from /auth/login or /auth/register.

**Frontend flow:** Call when a user signs out; clear stored auth token and cached user data on success.
**Response**
```json
{ "data": { "message": "Logged out." }, "meta": {} }
```

### POST /auth/password/forgot
**Frontend flow:** Use on "Forgot password" submit; always show a success toast regardless of account existence.
**Request**
```json
{ "email": "jane@example.com" }
```

**Response**
```json
{ "data": { "message": "Reset link sent." }, "meta": {} }
```

### POST /auth/password/reset
**Frontend flow:** Use after the user clicks the reset link and enters a new password; redirect to login on success.
**Request**
```json
{
  "email": "jane@example.com",
  "token": "reset-token",
  "password": "newpassword123",
  "password_confirmation": "newpassword123"
}
```

**Response**
```json
{ "data": { "message": "Password reset successfully." }, "meta": {} }
```

## User

### GET /me
**Auth:** Required. Include `Authorization: Bearer <token>` from /auth/login or /auth/register.
**Frontend flow:** Fetch on app load after login to hydrate the current user profile and role-based UI.
**Response**
```json
{ "data": { "public_id": "...", "email": "jane@example.com" }, "meta": {} }
```

### PUT /me
**Auth:** Required. Include `Authorization: Bearer <token>` from /auth/login or /auth/register.
**Frontend flow:** Use from profile settings forms; update local user state with the response.
**Request**
```json
{ "first_name": "Jane", "last_name": "Doe", "phone": "555-555-5555" }
```

**Response**
```json
{ "data": { "public_id": "...", "phone": "555-555-5555" }, "meta": {} }
```

### PUT /me/password
**Auth:** Required. Include `Authorization: Bearer <token>` from /auth/login or /auth/register.
**Frontend flow:** Use in account security settings; prompt user for current password before updating.
**Request**
```json
{ "current_password": "password123", "new_password": "newpass123", "new_password_confirmation": "newpass123" }
```

**Response**
```json
{ "data": { "message": "Password updated." }, "meta": {} }
```

### PUT /me/notification-preferences
**Auth:** Required. Include `Authorization: Bearer <token>` from /auth/login or /auth/register.
**Frontend flow:** Use for notification settings toggles; persist immediately when switches change.
**Request**
```json
{ "email_notifications": true, "sms_alerts": false, "push_notifications": true }
```

**Response**
```json
{ "data": { "message": "Notification preferences updated." }, "meta": {} }
```

### POST /me/avatar
`multipart/form-data` with `avatar` file.
**Auth:** Required. Include `Authorization: Bearer <token>` from /auth/login or /auth/register.

**Frontend flow:** Use in profile avatar uploader; update local avatar URL using returned user resource.
**Response**
```json
{ "data": { "public_id": "...", "avatar_url": "https://.../storage/avatars/abc.png" }, "meta": {} }
```

### DELETE /me/avatar
**Auth:** Required. Include `Authorization: Bearer <token>` from /auth/login or /auth/register.
**Frontend flow:** Use when user removes their avatar; clear avatar URL in client state.
**Response**
```json
{ "data": { "message": "Avatar removed." }, "meta": {} }
```

### GET /me/donations
**Auth:** Required. Include `Authorization: Bearer <token>` from /auth/login or /auth/register.
**Frontend flow:** Use for "My donations" history list with pagination.
**Response**
```json
{
  "data": [
    { "public_id": "...", "amount_cents": 2500, "status": "succeeded" }
  ],
  "meta": { "pagination": { "current_page": 1, "last_page": 1, "total": 1 } }
}
```

### GET /me/applications
**Auth:** Required. Include `Authorization: Bearer <token>` from /auth/login or /auth/register.
**Frontend flow:** Use for "My volunteer applications" list and statuses.
**Response**
```json
{
  "data": [
    { "public_id": "...", "status": "pending" }
  ],
  "meta": { "pagination": { "current_page": 1, "last_page": 1, "total": 1 } }
}
```

### GET /me/items
**Auth:** Required. Include `Authorization: Bearer <token>` from /auth/login or /auth/register.
**Frontend flow:** Use for "My donated items" list with current review status.
**Response**
```json
{
  "data": [
    { "public_id": "...", "title": "Winter Coats", "status": "pending_review" }
  ],
  "meta": { "pagination": { "current_page": 1, "last_page": 1, "total": 1 } }
}
```

### PUT /me/items/{public_id}
**Auth:** Required. Include `Authorization: Bearer <token>` from /auth/login or /auth/register.
**Frontend flow:** Use to edit an existing donated item; reflect updates in list detail view.
**Request**
```json
{ "title": "Updated title" }
```

**Response**
```json
{ "data": { "public_id": "...", "title": "Updated title" }, "meta": {} }
```

## Campaigns

### GET /campaigns
Filters: `q`, `category`, `status`, `sort`

**Frontend flow:** Use for campaign listing pages with search/filter/sort controls and pagination.
**Response**
```json
{
  "data": [
    {
      "public_id": "...",
      "share_slug": "relief-fund-123",
      "title": "Relief Fund",
      "status": "active",
      "goal_cents": 100000,
      "raised_cents": 25000,
      "donors_count": 12,
      "days_left": 20
    }
  ],
  "meta": {
    "pagination": { "current_page": 1, "last_page": 1, "total": 1 }
  }
}
```

### GET /campaigns/{share_slug}
**Frontend flow:** Use for campaign detail pages; pass `share_slug` from the route.
**Response**
```json
{ "data": { "public_id": "...", "title": "Relief Fund" }, "meta": {} }
```

## Donations

### POST /donations/intent
**Frontend flow:** Use when user confirms a donation amount; pass response `client_secret` to Stripe.js to complete payment.
**Request**
```json
{ "amount_cents": 2500, "currency": "USD", "campaign_id": "uuid-or-null" }
```

**Response**
```json
{
  "data": {
    "donation": {
      "public_id": "...",
      "amount_cents": 2500,
      "currency": "USD",
      "status": "processing",
      "confirmation_id": "pi_123"
    },
    "client_secret": "pi_123_secret_..."
  },
  "meta": {}
}
```

### GET /donations/{public_id}
Receipt details (auth required if donor).
**Auth:** Required if the donation has a donor user attached. Include `Authorization: Bearer <token>` from /auth/login or /auth/register.

**Frontend flow:** Use for a donation receipt screen or post-checkout confirmation page.
**Response**
```json
{
  "data": {
    "public_id": "...",
    "amount_cents": 2500,
    "currency": "USD",
    "status": "succeeded",
    "paid_at": "2024-05-01T10:20:30Z",
    "confirmation_id": "pi_123",
    "campaign": { "public_id": "...", "title": "Relief Fund" }
  },
  "meta": {}
}
```

### POST /stripe/webhook
Stripe webhook endpoint. Uses Stripe signature header.

**Frontend flow:** No direct frontend usage; Stripe calls this endpoint server-to-server.
**Response**
```json
{ "data": { "received": true }, "meta": {} }
```

## Opportunities

### GET /opportunities
**Frontend flow:** Use for volunteer opportunity listings with pagination and filters.
**Response**
```json
{
  "data": [
    {
      "public_id": "...",
      "title": "Community Cleanup",
      "location_type": "onsite",
      "status": "active"
    }
  ],
  "meta": { "pagination": { "current_page": 1, "last_page": 1, "total": 1 } }
}
```

### GET /opportunities/{public_id}
**Frontend flow:** Use for opportunity detail pages; `public_id` comes from list response.
**Response**
```json
{
  "data": {
    "public_id": "...",
    "title": "Community Cleanup",
    "description": "Help us restore the park.",
    "required_skills": ["coordination", "lifting"],
    "location_type": "onsite",
    "start_date": "2024-05-10",
    "end_date": "2024-05-15"
  },
  "meta": {}
}
```

### POST /opportunities/{public_id}/apply
**Auth:** Required. Include `Authorization: Bearer <token>` from /auth/login or /auth/register.
**Frontend flow:** Use for application form submission; show pending status afterward.
**Request**
```json
{ "full_name": "Jane Doe", "email": "jane@example.com" }
```

**Response**
```json
{ "data": { "public_id": "...", "status": "pending" }, "meta": {} }
```

## Items

### GET /items
**Frontend flow:** Use for item listings; show availability and status.
**Response**
```json
{
  "data": [
    { "public_id": "...", "title": "Winter Coats", "condition": "good", "status": "active" }
  ],
  "meta": { "pagination": { "current_page": 1, "last_page": 1, "total": 1 } }
}
```

### GET /items/{public_id}
**Frontend flow:** Use for item detail pages; `public_id` from list response.
**Response**
```json
{
  "data": {
    "public_id": "...",
    "title": "Winter Coats",
    "description": "Gently used coats.",
    "condition": "good",
    "location_text": "Chicago, IL",
    "status": "active"
  },
  "meta": {}
}
```

### POST /items
**Auth:** Required. Include `Authorization: Bearer <token>` from /auth/login or /auth/register.
**Frontend flow:** Use for donors to create a new item listing; redirect to upload images on success.
**Request**
```json
{ "title": "Winter Coats", "description": "Gently used", "condition": "good" }
```

**Response**
```json
{ "data": { "public_id": "...", "status": "pending_review" }, "meta": {} }
```

### POST /items/{public_id}/images
`multipart/form-data` with `image` file.
**Auth:** Required. Include `Authorization: Bearer <token>` from /auth/login or /auth/register.

**Frontend flow:** Use after creating an item to upload images; update item gallery using response.
**Response**
```json
{ "data": { "public_id": "...", "images": [{ "url": "https://.../item.png", "sort_order": 0 }] }, "meta": {} }
```

### POST /items/{public_id}/request
**Auth:** Required. Include `Authorization: Bearer <token>` from /auth/login or /auth/register.
**Frontend flow:** Use for orgs to request an item; show pending request status.
**Request**
```json
{ "organization_public_id": "..." }
```

**Response**
```json
{ "data": { "public_id": "...", "status": "pending" }, "meta": {} }
```

## Leaderboard

### GET /leaderboard?range=weekly|monthly|all_time
**Auth:** Required. Include `Authorization: Bearer <token>` from /auth/login or /auth/register.
**Frontend flow:** Use for leaderboard screens; pass the selected range from UI tabs.
**Response**
```json
{
  "data": {
    "leaders": [
      { "user_public_id": "...", "name": "Jane Doe", "points": 120, "rank": 1 }
    ],
    "current_user_rank": 4
  },
  "meta": {}
}
```

## Impact Tracker

### GET /me/impact?month=YYYY-MM
**Auth:** Required. Include `Authorization: Bearer <token>` from /auth/login or /auth/register.
**Frontend flow:** Use for impact dashboard; set `month` based on the selected calendar period.
**Response**
```json
{
  "data": {
    "lives_impacted": 2,
    "volunteer_hours": 4,
    "trees_planted": 5,
    "monthly_goal_progress": { "goal_cents": 10000, "current_cents": 5000, "progress_ratio": 0.5 },
    "milestones": [
      { "label": "Bronze Helper", "threshold_cents": 2500, "achieved": true }
    ],
    "highlights": [
      { "message": "Thank you for supporting a campaign this month!", "date": "2024-05-01" }
    ]
  },
  "meta": {}
}
```

## Organization

### POST /orgs
**Auth:** Required. Include `Authorization: Bearer <token>` from /auth/login or /auth/register.
**Frontend flow:** Use when a user creates a new organization profile; show "pending approval" state.
**Request**
```json
{ "name": "Hope Org", "slug": "hope-org" }
```

**Response**
```json
{ "data": { "public_id": "...", "name": "Hope Org", "status": "pending" }, "meta": {} }
```

### GET /orgs/{org_public_id}
**Auth:** Required. Include `Authorization: Bearer <token>` from /auth/login or /auth/register.
**Frontend flow:** Use for org profile or settings pages; `org_public_id` comes from org membership data.
**Response**
```json
{
  "data": {
    "public_id": "...",
    "name": "Hope Org",
    "slug": "hope-org",
    "status": "approved"
  },
  "meta": {}
}
```

### PUT /orgs/{org_public_id}
**Auth:** Required. Include `Authorization: Bearer <token>` from /auth/login or /auth/register.
**Frontend flow:** Use in org settings forms to update description, website, etc.
**Request**
```json
{ "description": "Helping communities with supplies.", "website": "https://hope.org" }
```

**Response**
```json
{ "data": { "public_id": "...", "description": "Helping communities with supplies." }, "meta": {} }
```

### GET /orgs/{org_public_id}/dashboard/overview
**Auth:** Required. Include `Authorization: Bearer <token>` from /auth/login or /auth/register.
**Frontend flow:** Use for the org dashboard overview widgets (summary KPIs).
**Response**
```json
{
  "data": {
    "total_active_campaigns": 3,
    "funds_raised_month": 250000,
    "active_donors": 12,
    "funds_delta_percent": 15.2
  },
  "meta": {}
}
```

### GET /orgs/{org_public_id}/dashboard/finance
**Auth:** Required. Include `Authorization: Bearer <token>` from /auth/login or /auth/register.
**Frontend flow:** Use for finance charts and top campaign panels.
**Response**
```json
{
  "data": {
    "monthly_totals": [
      { "month": "2024-04", "amount_cents": 150000 },
      { "month": "2024-05", "amount_cents": 250000 }
    ],
    "top_campaigns": [
      { "public_id": "...", "title": "Relief Fund", "raised_cents": 120000 }
    ]
  },
  "meta": {}
}
```

### GET /orgs/{org_public_id}/dashboard/donors
**Auth:** Required. Include `Authorization: Bearer <token>` from /auth/login or /auth/register.
**Frontend flow:** Use for donor analytics tables.
**Response**
```json
{
  "data": {
    "recent_donors": [
      { "name": "Jane Doe", "amount_cents": 5000, "donated_at": "2024-05-01T10:20:30Z" }
    ],
    "recurring_donors": 4
  },
  "meta": {}
}
```

### Org Campaigns

#### GET /orgs/{org_public_id}/campaigns
**Auth:** Required. Include `Authorization: Bearer <token>` from /auth/login or /auth/register.
**Frontend flow:** Use for org campaign management list.
**Response**
```json
{
  "data": [
    { "public_id": "...", "title": "Relief Fund", "status": "active" }
  ],
  "meta": { "pagination": { "current_page": 1, "last_page": 1, "total": 1 } }
}
```

#### POST /orgs/{org_public_id}/campaigns
**Auth:** Required. Include `Authorization: Bearer <token>` from /auth/login or /auth/register.
**Frontend flow:** Use to create a new campaign; redirect to edit/detail view on success.
**Request**
```json
{ "title": "Relief Fund", "description": "Support families", "goal_cents": 100000 }
```

**Response**
```json
{ "data": { "public_id": "...", "status": "pending_review" }, "meta": {} }
```

#### PUT /orgs/{org_public_id}/campaigns/{campaign_public_id}
**Auth:** Required. Include `Authorization: Bearer <token>` from /auth/login or /auth/register.
**Frontend flow:** Use for editing campaign details from org dashboard.
**Request**
```json
{ "title": "Updated title", "goal_cents": 120000 }
```

**Response**
```json
{ "data": { "public_id": "...", "title": "Updated title" }, "meta": {} }
```

#### POST /orgs/{org_public_id}/campaigns/{campaign_public_id}/images
`multipart/form-data` with `image` file.
**Auth:** Required. Include `Authorization: Bearer <token>` from /auth/login or /auth/register.

**Frontend flow:** Use for campaign image uploads; update gallery with response data.
**Response**
```json
{ "data": { "public_id": "...", "images": [{ "url": "https://.../campaign.png", "sort_order": 0 }] }, "meta": {} }
```

#### POST /orgs/{org_public_id}/campaigns/{campaign_public_id}/pause
**Auth:** Required. Include `Authorization: Bearer <token>` from /auth/login or /auth/register.
**Frontend flow:** Use for pause action buttons; update local campaign status to paused.
**Response**
```json
{ "data": { "public_id": "...", "status": "paused" }, "meta": {} }
```

#### POST /orgs/{org_public_id}/campaigns/{campaign_public_id}/activate
**Auth:** Required. Include `Authorization: Bearer <token>` from /auth/login or /auth/register.
**Frontend flow:** Use for activate action buttons; update local campaign status to active.
**Response**
```json
{ "data": { "public_id": "...", "status": "active" }, "meta": {} }
```

#### POST /orgs/{org_public_id}/campaigns/{campaign_public_id}/complete
**Auth:** Required. Include `Authorization: Bearer <token>` from /auth/login or /auth/register.
**Frontend flow:** Use when marking a campaign completed; update status to completed in UI.
**Response**
```json
{ "data": { "public_id": "...", "status": "completed" }, "meta": {} }
```

### Org Team

#### GET /orgs/{org_public_id}/members
**Auth:** Required. Include `Authorization: Bearer <token>` from /auth/login or /auth/register.
**Frontend flow:** Use to list team members in org settings.
**Response**
```json
{
  "data": [
    { "id": 10, "user_public_id": "...", "role": "manager" }
  ],
  "meta": {}
}
```

#### POST /orgs/{org_public_id}/members/invite
**Auth:** Required. Include `Authorization: Bearer <token>` from /auth/login or /auth/register.
**Frontend flow:** Use for invite modal; show success toast on response.
**Request**
```json
{ "email": "teammate@example.com", "role": "editor" }
```

**Response**
```json
{ "data": { "message": "Invitation sent." }, "meta": {} }
```

#### PUT /orgs/{org_public_id}/members/{member_id}
**Auth:** Required. Include `Authorization: Bearer <token>` from /auth/login or /auth/register.
**Frontend flow:** Use to update a member role from team management UI.
**Request**
```json
{ "role": "manager" }
```

**Response**
```json
{ "data": { "id": 10, "role": "manager" }, "meta": {} }
```

#### DELETE /orgs/{org_public_id}/members/{member_id}
**Auth:** Required. Include `Authorization: Bearer <token>` from /auth/login or /auth/register.
**Frontend flow:** Use for remove member action; remove row locally after success.
**Response**
```json
{ "data": { "message": "Member removed." }, "meta": {} }
```

### Org Volunteer

#### POST /orgs/{org_public_id}/opportunities
**Auth:** Required. Include `Authorization: Bearer <token>` from /auth/login or /auth/register.
**Frontend flow:** Use to create new org volunteer opportunity; redirect to detail on success.
**Request**
```json
{ "title": "Community Cleanup", "description": "Help restore the park.", "location_type": "onsite" }
```

**Response**
```json
{ "data": { "public_id": "...", "status": "pending_review" }, "meta": {} }
```

#### GET /orgs/{org_public_id}/opportunities
**Auth:** Required. Include `Authorization: Bearer <token>` from /auth/login or /auth/register.
**Frontend flow:** Use for org volunteer opportunity management list.
**Response**
```json
{
  "data": [
    { "public_id": "...", "title": "Community Cleanup", "status": "active" }
  ],
  "meta": { "pagination": { "current_page": 1, "last_page": 1, "total": 1 } }
}
```

#### GET /orgs/{org_public_id}/opportunities/{public_id}/applications
**Auth:** Required. Include `Authorization: Bearer <token>` from /auth/login or /auth/register.
**Frontend flow:** Use for reviewing applicants for a specific opportunity.
**Response**
```json
{
  "data": [
    { "public_id": "...", "status": "pending" }
  ],
  "meta": { "pagination": { "current_page": 1, "last_page": 1, "total": 1 } }
}
```

#### POST /orgs/{org_public_id}/applications/{application_public_id}/accept
**Auth:** Required. Include `Authorization: Bearer <token>` from /auth/login or /auth/register.
**Frontend flow:** Use for approve action buttons on applications; update status to accepted.
**Response**
```json
{ "data": { "public_id": "...", "status": "accepted" }, "meta": {} }
```

#### POST /orgs/{org_public_id}/applications/{application_public_id}/reject
**Auth:** Required. Include `Authorization: Bearer <token>` from /auth/login or /auth/register.
**Frontend flow:** Use for reject action buttons on applications; update status to rejected.
**Response**
```json
{ "data": { "public_id": "...", "status": "rejected" }, "meta": {} }
```

#### POST /orgs/{org_public_id}/applications/{application_public_id}/complete
**Auth:** Required. Include `Authorization: Bearer <token>` from /auth/login or /auth/register.
**Frontend flow:** Use to mark an application completed; update status to completed.
**Response**
```json
{ "data": { "public_id": "...", "status": "completed" }, "meta": {} }
```

### Org Items

#### GET /orgs/{org_public_id}/item-requests
**Auth:** Required. Include `Authorization: Bearer <token>` from /auth/login or /auth/register.
**Frontend flow:** Use to list item requests for the org.
**Response**
```json
{
  "data": [
    { "public_id": "...", "status": "pending", "item": { "public_id": "...", "title": "Winter Coats" } }
  ],
  "meta": { "pagination": { "current_page": 1, "last_page": 1, "total": 1 } }
}
```

#### POST /orgs/{org_public_id}/item-requests/{request_public_id}/accept
**Auth:** Required. Include `Authorization: Bearer <token>` from /auth/login or /auth/register.
**Frontend flow:** Use to accept a requested item; update status to accepted.
**Response**
```json
{ "data": { "public_id": "...", "status": "accepted" }, "meta": {} }
```

#### POST /orgs/{org_public_id}/item-requests/{request_public_id}/reject
**Auth:** Required. Include `Authorization: Bearer <token>` from /auth/login or /auth/register.
**Frontend flow:** Use to reject a requested item; update status to rejected.
**Response**
```json
{ "data": { "public_id": "...", "status": "rejected" }, "meta": {} }
```

#### POST /orgs/{org_public_id}/item-requests/{request_public_id}/mark-delivered
**Auth:** Required. Include `Authorization: Bearer <token>` from /auth/login or /auth/register.
**Frontend flow:** Use to mark the item delivered; update status to delivered.
**Response**
```json
{ "data": { "public_id": "...", "status": "delivered" }, "meta": {} }
```
