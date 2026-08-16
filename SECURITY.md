# Security boundary

This is an account-free static application. The intended threat boundary excludes authentication, collaboration, provider APIs, deployment state, telemetry, and remote assets.

The JSON workspace contract rejects unknown fields, unsupported schema versions, invalid dates, duplicate identifiers, malformed priorities, oversized collections, and payloads over 2 MiB. Imports are reconstructed from explicit allowlists before they can replace local state.

Local storage is unencrypted and vulnerable to browser-profile access or malicious local extensions. Do not enter secrets, personal identifiers, regulated records, or credentials. Activity history is local editable state and is expressly not tamper-evident audit evidence.

Report a security concern privately to the project owner before publishing a reproduction containing any real personal or confidential data.
