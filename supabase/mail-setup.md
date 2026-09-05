# Atmet Email Setup

Atmet has two email delivery paths. Both should use `Atmet <team@atmet.pro>`:

1. Supabase sends Auth-managed emails through the SMTP provider configured in the Supabase dashboard.
2. The Next.js server sends app-owned transactional emails through the Resend API when `RESEND_API_KEY` and `RESEND_FROM` are configured.

Complete the Resend domain setup before changing either sender. Otherwise sends from `@atmet.pro` will be rejected.

No Supabase SQL migration and no Auth user update are required for a sender-address change.

## 1. Verify `atmet.pro` in Resend

1. Open `Resend` -> `Domains` and add `atmet.pro`.
2. Copy every DNS record Resend generates into the DNS provider for `atmet.pro`. Do not copy example values from this document; use the exact values shown in Resend.
3. Wait until the domain is `Verified`. Resend requires its SPF and DKIM records. Add a DMARC TXT record as well, starting with a monitoring policy (`p=none`) if the domain does not already have one.
4. Do not replace the root MX records used by the mailbox that receives mail for `team@atmet.pro`. Resend's sending/return-path records and the mailbox provider's inbound MX records serve different purposes.
5. Confirm that `team@atmet.pro` can receive mail if customers should be able to reply. Resend can send from an address on a verified domain, but it does not create the inbox.

## 2. Configure Supabase Auth SMTP with Resend

In Supabase:

1. Open your project.
2. Go to `Authentication` -> `Emails` -> `SMTP Settings`.
3. Enable custom SMTP.
4. Enter:

```txt
Sender name: Atmet
Sender email: team@atmet.pro
Host: smtp.resend.com
Port: 465
Username: resend
Password: <a Resend API key>
```

5. Save the settings.
6. Send a Supabase Auth test email and confirm that it arrives from `Atmet <team@atmet.pro>`.

Use a Resend API key that is authorized to send from `atmet.pro`. A separate key for Supabase SMTP and the app API is preferable because either integration can then be rotated or revoked independently. Store keys only in Supabase and your deployment secrets; never commit them.

## 3. Configure App Transactional Email

Add these server-only variables to every deployed environment that sends real email (for example, Production and Preview in the hosting dashboard):

```txt
RESEND_API_KEY=re_...
RESEND_FROM="Atmet <team@atmet.pro>"
```

They are intentionally not prefixed with `NEXT_PUBLIC_`, so they stay on the server. Restart or redeploy after changing them.

The repository's `.env.example` contains the same variable names with no secret value. For local testing, put real values in `.env.local`, which must remain uncommitted.

When both Resend and generic SMTP variables exist, the app prefers `RESEND_API_KEY` plus `RESEND_FROM`.

## 4. Redirect URLs

Changing the sender does not change authentication redirect URLs. Keep these aligned with the actual deployed application domain.

In Supabase, open `Authentication` -> `URL Configuration` and verify:

```txt
Site URL:
https://app.atmet.pro

Redirect URLs:
http://localhost:3000/**
http://localhost:3001/**
http://localhost:3002/**
https://app.atmet.pro/**
```

The app callback route is:

```txt
/auth/confirm
```

Production env:

```txt
NEXT_PUBLIC_APP_URL=https://app.atmet.pro
```

## 5. Test Every Email Path

After deploying, test all of these separately because they do not all use the same delivery path:

1. Magic-link or OTP sign-in (Supabase SMTP).
2. Any Supabase-generated confirmation/invite fallback (Supabase SMTP).
3. Password reset (Resend API when configured).
4. Waitlist approval (Resend API when configured).
5. Workspace member invite (Resend API when configured).
6. The dashboard contact link opens `team@atmet.pro`.

For at least one delivered message, inspect the message headers and confirm SPF, DKIM, and DMARC pass. Also reply to it and confirm the response reaches the `team@atmet.pro` inbox.

## 6. Rollout Checklist

1. Verify `atmet.pro` in Resend before switching production.
2. Update Supabase custom SMTP sender and credentials.
3. Set `RESEND_API_KEY` and `RESEND_FROM` in the hosting provider.
4. Redeploy the app.
5. Run the tests above.
6. Keep the old domain configuration active briefly if previously sent magic links or emails still need to work; removing it is a separate cleanup step.

## 7. Auth Routes

```txt
POST /api/auth/magic-link
POST /api/auth/otp
POST /api/auth/verify-otp
GET  /auth/confirm
POST /api/auth/reset-password
PATCH /api/admin/requests/:requestId
POST /api/workspaces/:workspaceId/members
```

## 8. Template Redirect Pattern

For server-side auth cookies, use `TokenHash` links that hit Atmet first:

```html
<a href="{{ .SiteURL }}/auth/confirm?token_hash={{ .TokenHash }}&type=invite&redirect_to={{ .RedirectTo }}">
  Continue to Atmet
</a>
```

The app passes `redirectTo`, and `/auth/confirm` verifies the token with Supabase before redirecting the user into the right flow.
