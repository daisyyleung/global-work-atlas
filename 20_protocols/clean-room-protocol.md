---
title: Clean-room implementation protocol
status: active
owner: DaisYY Leung
updated: 2026-08-15
source_of_truth: true
supersedes: []
tags: [protocol, clean-room, public]
---

# Clean-room protocol

1. Implement only inside this public project root.
2. Recreate behavior from the approved product contract; do not copy private records, prose, binary assets, configuration, artifacts, or Git history.
3. Author sample data from scratch and validate it against `sample-data-provenance.md`.
4. Keep account, provider, network, and deployment concerns outside the runtime.
5. Run the privacy scanner after each material source slice.
6. Review the exact outgoing payload and full new history before publication.
