---
title: Telemetry and evidence index
status: active
owner: DaisYY Leung
updated: 2026-08-15
source_of_truth: true
supersedes: []
tags: [telemetry, index, evidence]
---

# Telemetry index

## Purpose

Define handling for non-authoritative validation evidence. This folder must not contain imported workspaces, private records, browser profiles, screenshots with user data, secrets, or generated runtime logs.

## Read when

Read before retaining test, browser, privacy-scan, or release evidence.

## Inventory and authority

- No run artefacts are committed by default.
- Current commands and gates are authoritative in `../20_protocols/validation-and-release.md`.
- Product state is authoritative in `../00_system/project-state.md`; telemetry never overrides it.

If future evidence is intentionally retained, add a metadata-bearing index entry that states source binding, evidence tier, privacy disposition, and supersession status.
