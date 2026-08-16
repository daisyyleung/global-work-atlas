---
title: Static local-first architecture
status: active
owner: DaisYY Leung
updated: 2026-08-15
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
