# Settings reference audit

Reference folder: `New Admin Dashboard/New Admin Dashboard`, screenshots 310–339.
Scope: 30 screens, comprising 12 section pages and 18 detail/configuration screens.

| Reference | Route below `/settings` | Implementation |
| --- | --- | --- |
| 310 | Overview | Platform summary, eight grouped cards, links to all sections |
| 311–312 | `general`, `general/defaults` | Identity, locale, four metrics, save/discard footer |
| 313–314 | `company`, `company/legal-contacts` | Legal entity and editable contact records |
| 315–317 | `branding`, `branding/identity`, `branding/domains` | Identity, logo/color preview, real DNS TXT verification, remove/add/check controls |
| 318–319 | `roles`, `roles/policies` | Role directory and enforced capability matrix |
| 320–322 | `security`, `security/authentication`, `security/emergency` | Saved authentication/network baseline, explicit MFA disabling confirmation |
| 323–324 | `notifications`, `notifications/alert-policy` | Channel controls and editable alert delivery table |
| 325–326 | `integrations`, `integrations/:provider` | Provider metrics/cards and six detail tabs |
| 327–328 | `integrations/api-keys`, `integrations/api-keys/create` | Credential/webhook columns and four-step key wizard |
| 329–331 | `kora`, `kora/routing`, `kora/approval-policy` | Assistant defaults, recorded routes/estimated budget, approval matrix, locked training policy |
| 332–334 | `data`, `data/retention`, `data/privacy-requests` | Retention table, residency, searchable paginated request queue and handling detail |
| 335–336 | `audit`, `audit/changes` | Compliance counts, filtered audit table, before/after evidence |
| 337–339 | `advanced`, `advanced/plans`, `advanced/feature-flags` | Resource limits, real plan entitlements, editable rollout table |

## Shared appearance

`settings.css` scopes the charcoal surfaces, NOVYA brand mark, sidebar, purple actions, bordered status pills, compact four-card metrics and two-column panels to Settings. Configuration pages include save/discard state, errors and audit links. Layout collapses for narrow screens; wide tables scroll inside their panels. Portalled provider, route and webhook dialogs use a matching dark surface.

## Backend corrections

- Partial nested edits merge instead of replacing sibling settings. Empty arrays, false and zero remain intentional values.
- Invalid configuration ranges, malformed arrays, unsafe keys and string representations of protected booleans fail before saving.
- Reset uses actual model defaults, preserves DNS ownership records and requires confirmation when disabling required MFA.
- Privacy requests support subject/code/reference search. Creation fixes the initial state, authenticated handler and 30-day deadline, and records audit evidence. Status updates invalidate the queue and compliance queries.
- DNS host/token and API key prefixes display literal underscores.

No live database records, credentials, provider connections or webhook deliveries were changed during verification. Existing model schema and permission checks remain the source of truth.

## Validation

- `node scripts/check-settings-design.cjs`: all 30 reference routes, wizard scopes step, literal DNS record, audit evidence, request handling, empty/error states and disabled customer-data training.
- Targeted ESLint and TypeScript checks pass.
- `node tests/novya-settings.test.js` in the backend: five tests covering nested save/reset, validation, MFA confirmation, training restrictions and privacy ownership/audit behavior. Tests mock persistence and do not connect to MongoDB.
- Existing backend contract suite and Tasks/Inbox, Calendar and Team render regression checks pass.
- Next.js production build passes.

## Verification limits

Offline rendering verifies markup and data branches, not browser geometry or interactive clicks. Live browser visual QA is still required before claiming a pixel-perfect match.

The reference contains illustrative operational controls beyond the implemented services: SSO enrollment, policy enforcement for every saved setting, retention cleanup/recovery jobs, production feature targeting, provider usage billing and plan publication approvals. This change does not fabricate those systems. Security and retention screens edit stored policy; rollout flags store configuration. Plans show the real subscription catalog and link to billing management. Model spending remains explicitly estimated. API key creation offers the two machine API scopes currently supported by the backend; secrets are returned once.
