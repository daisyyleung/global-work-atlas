# Global-Work-Atlas Public Template

Global-Work-Atlas is a static, local-first project dashboard for people who want a clear view of work without an account or network service. It is a reusable template with five workflows:

- **Overview** — derived active, complete, at-risk, waiting, region, status, work-type, priority, and due-soon summaries.
- **Analytics** — 30-day, 90-day, year, all-time, or custom inclusive ranges with text-backed daily charts and UTF-8 CSV export.
- **Work Index** — add, edit, archive, restore, search, filter, and inspect work in cards, table, status board, or hierarchical-list views.
- **Priorities** — order up to five active tasks with keyboard-accessible controls and confirmed, activity-recorded saves.
- **Activity** — searchable reverse-chronological local change history with title snapshots.

Everything runs in the browser. JSON backup/import and reset are explicit replacement flows. Saved data uses unencrypted `localStorage`; do not enter confidential, regulated, or secret information. Activity is editable context, not tamper-evident audit evidence.

## Run locally

Node.js 20+ is sufficient. There are no dependencies and no lockfile.

```sh
npm run dev
```

Open the printed local URL. The server is a development convenience only; the application itself is static and makes no external requests. `npm run validate` runs source/privacy checks and the built-in tests serially. `npm run build` is a read-only import-graph contract check; it does not generate output.

The bundled workspace is clearly marked fictional (`meta.sampleData: true`) and can be replaced with a JSON backup or a blank workspace.

## Optional Google sign-in extension

The included application does **not** implement Google sign-in. It remains account-free, keeps data in browser `localStorage`, and makes no external requests.

For teams that want to build an authenticated variant, [the optional Google OAuth guide](docs/optional-google-oauth.md) explains the required server boundary, Google Auth Platform configuration, non-secret configuration names, access checks, and validation matrix. The guide contains no credentials or personal Google account information. Adding login alone does not synchronize or protect workspace data; that requires an authorized server-side data layer.

## Licence

Copyright © 2026 DaisYY Leung. This project is available under the [MIT License](LICENSE).
