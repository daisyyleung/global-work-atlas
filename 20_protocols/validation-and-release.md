---
title: Validation and release protocol
status: active
owner: DaisYY Leung
updated: 2026-08-15
source_of_truth: true
supersedes: []
tags: [protocol, validation, release]
---

# Validation and release

Run `npm run validate` serially after the last source change. Then complete browser acceptance and rerun the project preflight immediately before any public handoff.

Keep source, local, preview, and live evidence separate. Review every outgoing path, source size, privacy finding, author identity, licence/copyright wording, and Git history. Staging, commit, repository creation, remote changes, and push are separate explicit approval boundaries. Push only through the guarded, full-SHA workflow and verify the remote branch afterwards.

No hosted deployment is authorized by repository publication.
