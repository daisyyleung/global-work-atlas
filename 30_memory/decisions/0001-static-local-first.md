---
title: Decision 0001 — static local-first application
status: active
owner: DaisYY Leung
updated: 2026-08-15
source_of_truth: true
supersedes: []
tags: [decision, architecture, local-first]
---

# Decision

Use standards-based HTML, CSS, and browser ES modules with versioned local storage. Use Node.js built-ins only for local tooling and tests.

## Rationale

The five dashboard workflows do not require a server. This boundary removes account, credential, provider, telemetry, database, deployment, and dependency supply-chain surfaces while keeping the template portable.

## Revisit when

Revisit only if approved scope adds authenticated collaboration, shared cloud state, or a required server integration.
