# Privacy

Signal Atlas is designed for local-first use:

- It has no account, analytics, provider integration, remote font, CDN, database, cloud storage, service worker, or network request.
- The Content Security Policy uses `connect-src 'none'` and the source scanner rejects external URLs.
- Workspace state is kept in the browser's unencrypted `localStorage` profile. Anyone with access to that profile may read it.
- JSON export leaves the browser only when the user explicitly downloads it. Import is strict, size-limited, allowlisted, rebuilt, previewed, and confirmed before replacement.
- User and imported strings are rendered as text. CSV export uses RFC 4180 quoting and protects formula-leading values.
- Reset and activity clearing require confirmation. An invalid import leaves the existing state unchanged.

Use fictional or non-confidential data in this public template. It is not a secure vault, records system, or compliance audit tool.
