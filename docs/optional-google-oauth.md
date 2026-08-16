---
title: Optional Google OAuth extension
status: active
owner: DaisYY Leung
updated: 2026-08-16
source_of_truth: true
supersedes: []
tags: [docs, oauth, google, optional-extension]
---

# Optional Google OAuth extension

This guide explains how to design a future Google sign-in variant without placing credentials or personal Google account information in this public template. It does not add authentication to the included application.

## Current boundary

Global-Work-Atlas currently has no production server, account system, database, OAuth client, environment loader, or deployment configuration. Its Content Security Policy blocks external connections, and workspace data remains in unencrypted browser `localStorage`.

Do not add a client secret, session secret, authorization code, access token, refresh token, ID token, private key, real allowlisted email, or Google subject identifier to the repository. Do not store tokens in `localStorage`. A Google login button alone neither protects nor synchronizes the existing workspace.

## 1. Choose the server architecture first

Use a maintained OpenID Connect library for the selected server framework. The server must own the authorization-code exchange, signed session, account authorization, and every protected data read or write. A future architecture decision must define:

- the exact development and production origins;
- the exact callback route produced by the chosen library;
- encrypted server-side secret storage;
- the session and cookie design;
- whether access is public, organization-restricted, or allowlisted; and
- the authorized database or storage layer, if cross-device synchronization is required.

Keep the current static application unchanged until that design, privacy boundary, threat review, and deployment target are approved. Do not broadly loosen the CSP in anticipation of a provider; allow only endpoints required by the implemented flow.

## 2. Use identity-only configuration

For sign-in only, request the minimum OpenID Connect scopes:

- `openid`
- `email`
- `profile`

Google login is identity authentication. Reading Google Drive, Sheets, Gmail, Calendar, or other Google data is a separate authorization design and requires its own least-privilege scopes, consent, storage, and review.

## 3. Configure Google Auth Platform

In the intended Google Cloud project:

1. Configure **Google Auth Platform → Branding** with the deployment's real app name, homepage, support contact, and privacy-policy URL.
2. Configure **Audience** as Workspace-internal or External. For an External app in Testing, add only the intended test users.
3. Configure **Data Access** with only the identity scopes above.
4. Create a **Web application** client.
5. Add each authorized JavaScript origin as scheme, hostname, and optional port only. An origin must not contain a path.
6. Add the server library's exact full callback URL under authorized redirect URIs. Scheme, hostname, port, path, case, and trailing slash must match the application exactly.
7. Store the client secret directly in the encrypted server environment. Never paste it into an issue, commit, screenshot, log, chat, or browser bundle.

Illustrative values—not configuration for this repository—would pair an origin such as `http://localhost:3000` with the exact callback implemented by the server, such as `http://localhost:3000/auth/callback/google`. Do not copy that callback path unless the selected library actually uses it.

Review Google's current [Auth Platform setup](https://support.google.com/cloud/answer/15544987), [OpenID Connect guidance](https://developers.google.com/identity/openid-connect/openid-connect), [web-server OAuth flow](https://developers.google.com/identity/protocols/oauth2/web-server), and [verification guidance](https://support.google.com/cloud/answer/13463073) before configuring a live client.

## 4. Keep deployment values outside Git

The eventual server will commonly need configuration names like these, but this template intentionally supplies no values or environment file:

- `APP_ORIGIN`
- `GOOGLE_CLIENT_ID`
- `GOOGLE_CLIENT_SECRET`
- `SESSION_SECRET`
- optional private access-policy values for approved email addresses or Google subject identifiers

The client ID identifies a deployment rather than acting as a password, but a reusable public template should still avoid shipping one person's real project configuration. The client secret and session secret must remain server-only.

## 5. Enforce identity and authorization on the server

The implementation must:

- generate and verify anti-forgery `state` and replay-resistant `nonce` values;
- exchange the single-use authorization code on the server over HTTPS;
- validate the ID token's signature, issuer, audience, expiry, and nonce with the library;
- require `email_verified` when email is used for an access decision;
- use Google's stable `sub` claim as the account identifier;
- for a high-value owner allowlist, match both the normalized verified email and the expected `sub`;
- restrict post-login redirects to same-origin relative or explicitly approved URLs;
- issue secure, HTTP-only session cookies with an appropriate SameSite policy; and
- recheck authorization on every protected read and write rather than relying on hidden UI controls.

Missing configuration must fail closed. Do not ship a preview bypass, browser-only role check, or demo account as production authentication.

## 6. Decide what login protects

The current workspace is local browser data. Adding identity does not move that data to a server and does not make `localStorage` confidential. If an authenticated variant should support shared or cross-device projects, design an authorized server-side data model with tenant boundaries, validation, audit expectations, backup, retention, and deletion behavior before migration.

Avoid automatically uploading an existing local workspace immediately after first sign-in. Show the destination and account, validate the payload, and obtain explicit user confirmation before any transfer.

## 7. Validate before claiming support

Use separate development and production clients or Cloud projects when practical. Verify all of the following in the deployed environment:

1. An approved account can sign in and reaches the intended page.
2. A disallowed account is denied when the deployment is restricted.
3. Signed-out protected reads and writes return `401` or redirect to sign-in.
4. Direct requests cannot bypass the server authorization check.
5. Refresh, expiry, sign-out, and session revocation behave as designed.
6. Redirects cannot escape to an unapproved origin.
7. No secret, token, authorization code, private identifier, or full profile response appears in browser bundles, URLs, logs, exports, or repository history.
8. The live origin and callback exactly match the Google client configuration.
9. The privacy policy, security documentation, CSP, and data-handling description match the implemented behavior.

Treat local configuration shape, Google-side configuration, and a live successful sign-in as separate evidence. Do not claim the extension works until all three are verified.
