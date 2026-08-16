---
title: Browser acceptance protocol
status: active
owner: DaisYY Leung
updated: 2026-08-15
source_of_truth: true
supersedes: []
tags: [protocol, browser, accessibility]
---

# Browser acceptance

After the last source change, serve the real local application on a verified free port and record source state, URL, timestamp, and viewport.

Check 360×800, 768×1024, and 1440×900. Exercise all five views, add/edit/archive/restore, filters and four Work Index layouts, keyboard priority ordering, date-range analytics and CSV export, valid JSON backup/import, invalid import recovery, confirmed reset, and reload persistence.

Confirm meaningful empty/error states, visible focus, labelled controls, dialog Escape/focus return, skip link, contained overflow, reduced-motion support, no console error or CSP violation, and no request to an external origin. Do not use confidential data for acceptance.
