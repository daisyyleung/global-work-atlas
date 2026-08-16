# Signal Atlas Public Template

This repository is a self-contained, public-safe project. Use `00_system/INDEX.md` as the knowledge map before changing source.

## Project rules

- Keep the application local-first, account-free, and zero-runtime-dependency unless an accepted decision record changes that boundary.
- Never copy private project records, names, screenshots, assets, configuration, environment files, hosting state, archives, or Git history into this repository.
- Use only clearly labelled fictional sample data. Do not add emails, tokens, credentials, personal identifiers, private paths, or organization-specific records.
- Do not add network requests, analytics, remote fonts, CDNs, authentication, cloud storage, or provider integrations without an explicit approved scope change and threat review.
- Validate untrusted imports strictly and render user-entered text as text, never HTML.
- Preserve user work. Never delete, reset, clean, rewrite, or overwrite user content without explicit permission for the exact target.
- Keep authored source files below 500 physical lines where practical. Files at or above 500 lines require cohesion review; 800 lines or 50 KiB blocks release without a recorded exception.
- Use Node.js built-ins only for local tooling. Do not install dependencies unless the project decision record and lockfile policy are updated first.
- Run `npm run validate` after source changes and complete the browser acceptance protocol before release.
- Keep `README.md`, privacy/security documentation, and the implemented capability aligned.
- Include the site-wide copyright notice required by the current licence policy in the shared application shell.

## Knowledge routing

1. Read `00_system/INDEX.md`.
2. Follow only the indexes relevant to the task.
3. Treat active, source-of-truth documents as authoritative over drafts, telemetry, or historical notes.
4. Update the applicable index when a knowledge document is added, renamed, moved, superseded, archived, or materially changed.

## Validation evidence

Keep source, local, browser-preview, and live evidence separate. A local check does not prove a hosted deployment. Do not commit imported workspaces, generated logs, screenshots containing user data, or local validation output.
