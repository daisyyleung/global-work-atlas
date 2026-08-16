---
title: Static local-first architecture
status: active
owner: DaisYY Leung
updated: 2026-08-16
source_of_truth: true
supersedes: []
tags: [architecture, privacy, local-first]
---

# Architecture

Signal Atlas is a static browser application built with HTML, CSS, and ES modules. It has no production server, account system, database, analytics, or external requests.

The runtime chain is:

`user action → validated command → pure state transition → whole-state validation → localStorage save → render`

Five distinct views consume the same versioned workspace contract: Overview, Analytics, Work Index, Priorities, and Activity. JSON is the round-trip backup format; CSV is a one-way report export. Development checks and the local server use Node.js built-ins only.

User-entered data remains in the browser profile unless the user explicitly downloads an export. Local storage is unencrypted and is not suitable for confidential material.

The optional Google OAuth guide is documentation for a possible future extension; it is not part of this runtime. A functional authenticated variant requires a separate approved architecture with a production server, server-side sessions and authorization, an authorized data store if synchronization is needed, and updated CSP, privacy, threat, and validation boundaries.
