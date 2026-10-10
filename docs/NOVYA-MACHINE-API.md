# NOVYA machine API

The backend now consumes managed API keys on two read-only endpoints. Create a key in Settings → Integrations & API → API Keys and copy it once. Never put a key in a URL or client-side source.

| GET endpoint | Required key scope | Required key owner's role permission |
| --- | --- | --- |
| `/api/v1/novya/external/overview` | `overview.read` | `management.read` |
| `/api/v1/novya/external/system-health` | `system-health.read` | `devops.read` |

Supply `Authorization: Bearer <key>` over HTTPS outside localhost. Key hash, active status and expiry are checked on every request, as are the creator's administrator status and current staff permissions. Offboarded users cannot keep using their keys. Revocation takes effect on the next request.

This gateway has no mutation endpoints and does not expose private tenant transcripts, customer documents or HR records. Other API key scope names do not create additional endpoints. Existing JWT authentication remains in use for the admin dashboard.
