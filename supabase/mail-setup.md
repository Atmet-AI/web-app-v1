# Atmet Supabase Mail Setup

Supabase sends Auth emails from your Supabase project, not from the Next.js server. The app routes in this repo call Supabase Auth APIs; delivery goes through the SMTP provider you configure in Supabase.

## 1. Configure Custom SMTP

In Supabase:

1. Open your project.
2. Go to `Authentication` -> `Emails` -> `SMTP Settings`.
3. Enable custom SMTP.
4. Add your SMTP host, port, username, password, sender name, and sender email.
5. Save and send a test email.

Recommended sender:

```txt
Sender name: Atmet
Sender email: no-reply@atmetai.com
Reply-to: team@atmetai.com
```

Also make sure your domain has SPF, DKIM, and DMARC configured with your SMTP provider.

## 2. Redirect URLs

Add these in `Authentication` -> `URL Configuration`:

```txt
Site URL:
https://app.atmetai.com

Redirect URLs:
http://localhost:3000/**
http://localhost:3001/**
http://localhost:3002/**
https://app.atmetai.com/**
```

The app callback route is:

```txt
/auth/confirm
```

Production env:

```txt
NEXT_PUBLIC_APP_URL=https://app.atmetai.com
```

## 3. Auth Routes Added

```txt
POST /api/auth/magic-link
POST /api/auth/otp
POST /api/auth/verify-otp
GET  /auth/confirm
POST /api/auth/reset-password
PATCH /api/admin/requests/:requestId
POST /api/workspaces/:workspaceId/members
```

## 4. How Emails Are Triggered

Magic link sign in:

```ts
await fetch("/api/auth/magic-link", {
  method: "POST",
  body: JSON.stringify({ email, next: "/" }),
});
```

OTP sign in:

```ts
await fetch("/api/auth/otp", {
  method: "POST",
  body: JSON.stringify({ email }),
});
```

Verify OTP:

```ts
await fetch("/api/auth/verify-otp", {
  method: "POST",
  body: JSON.stringify({ email, token, type: "email" }),
});
```

Approve waitlist request:

```ts
await fetch(`/api/admin/requests/${requestId}`, {
  method: "PATCH",
  body: JSON.stringify({ status: "approved" }),
});
```

Invite workspace member:

```ts
await fetch(`/api/workspaces/${workspaceId}/members`, {
  method: "POST",
  body: JSON.stringify({ email, role: "member" }),
});
```

## 5. Template Redirect Pattern

For server-side auth cookies, use `TokenHash` links that hit Atmet first:

```html
<a href="{{ .SiteURL }}/auth/confirm?token_hash={{ .TokenHash }}&type=invite&redirect_to={{ .RedirectTo }}">
  Continue to Atmet
</a>
```

The app passes `redirectTo`, and `/auth/confirm` verifies the token with Supabase before redirecting the user into the right flow.
