---
title: Privacy and threat boundary
status: active
owner: DaisYY Leung
updated: 2026-08-15
source_of_truth: true
supersedes: []
tags: [protocol, privacy, security]
---

# Privacy boundary

The application makes no external requests and uses no account, provider, analytics, remote asset, or cloud-storage integration. A restrictive Content Security Policy must block connections.

Imports are limited, strictly reconstructed from allowlisted fields, and rendered as text. CSV export must protect formula-leading cells. JSON replacement and reset require a preview and confirmation; invalid input leaves saved state unchanged.

Local storage is unencrypted and visible to the browser profile. The interface and documentation must warn users not to enter confidential information. Activity history is editable local state, not compliance evidence.

The public payload must not contain environment files, credentials, emails, private paths, private names or records, source archives, private screenshots/assets, hosting state, generated deployment output, or copied private Git history.
