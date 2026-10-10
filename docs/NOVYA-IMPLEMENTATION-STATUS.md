# NOVYA admin implementation status

Workspace and App navigation are excluded as requested. References 1?96 and 310?339 cover 126 screens and interaction states, including dialogs and tabs; this is not a count of unique routes.

## Implemented

- NOVYA black dashboard shell, module navigation, mobile navigation, launcher, voice input, chat drawer and personal Profile. Previous dashboard modules redirect to the new modules.
- Overview; Kora chat, folders, investigations, cases, actions, Brain graph, knowledge, source import and history; Live View; Approvals; Tasks; internal Inbox and Calendar; Management; Team; System Health; Workflows; Settings.
- Organization creation/editing and dedicated billing, members, agents, usage, contracts, integrations, health and activity tabs. Canonical customer/user records and customer document/note/payment views.
- Task creation/editing with staff assignment, checklist and attachment URLs; personal due/overdue counts, pagination, team-leader/all-staff weekly views, comments and task status.
- Approval status tabs, bulk review with per-record outcomes, Kora explanation and independent approval. Workflow history, preview and confirmation use atomic claims to prevent duplicate confirmation; failed approval creation records a failed run.
- Staff invitation, HR documents upload, interview recording, employment/access/compensation editing, absence and performance records, onboarding checklists, login revocation/restoration and reviewed offboarding. Staff records are archived instead of deleted so inactive staff cannot regain bootstrap admin permissions.
- Purpose-bound tenant access requests for Live transcripts/interventions and customer notes/documents: independent approval, actor and organization binding, scope, expiry, revocation and access audit. Expired cached private content is hidden. Live lists/realtime payloads contain session metadata; Kora retrieval uses support counts rather than private conversation text.
- Online/offline and failed-refresh-with-cached-data banners. Missing telemetry remains unavailable rather than fabricated successful health.
- Manual source content and TXT/Markdown/CSV/JSON/PDF/DOCX knowledge import. PDF/DOCX parsing runs in a bounded worker, rejects blank/corrupt files and limits pages/text. Scanned documents require OCR before import. Cloudinary configuration is required for document storage.
- Settings forms, provider configuration records, permission policy, API key lifecycle, webhook configuration/testing, privacy handling and audit export. Scoped API keys now authenticate the read-only overview/system-health machine API; see [machine API instructions](NOVYA-MACHINE-API.md).

## Verification

- Production build passed; TypeScript and ESLint passed for NOVYA components, data helpers and catch-all route.
- Backend router imports passed. The latest continuation passed 14 backend tests (10 contracts, 2 machine API and 2 channel checks), plus route checks for 126 references, 33 tabs and 26 create/edit routes.
- 17 backend tests passed: 10 calendar/task/approval/permission/tenant-access contracts, 5 document parser tests, 2 machine API authentication tests. Document worker tests require normal Windows process permissions and passed outside the restricted tool sandbox.
- All 126 in-scope design reference files were checked by the [route/state inventory](NOVYA-DESIGN-COVERAGE.md). Inventory coverage is not visual acceptance.

## Image layout reinspection

- Every in-scope image has an explicit panel/field/control checklist in [the image layout requirements](NOVYA-IMAGE-LAYOUT-CHECKLIST.md). This identifies code/layout gaps as well as populated-state verification gaps. Folder cards, recent conversations, the move dialog, Calendar modes/mini-calendar/filter, channel summary panels, launcher popover, Kora orb/voice composer and Settings overview metrics were refined.

## Outstanding acceptance and external setup

- Authenticated browser audit and 93-URL mobile/tablet overflow checks completed; see [dated audit and remaining acceptance](NOVYA-AUDIT-2026-10-07.md). Every populated screen/dialog/tab still needs individual comparison against its reference; pixel-perfect fidelity is not certified.
- Run authenticated integration scenarios with representative database records and two separate requester/approver accounts. Tests use fixtures/mocked boundaries and do not certify the deployed database or provider services.
- Select and configure an SSO provider before runtime SSO enforcement. Existing normal login remains the working authentication flow. Provider records, model-routing policy, retention settings and emergency/network policy forms do not alone install or enforce those external/runtime capabilities.
- Some approved workflows create operator tasks and explicitly return externalChangeExecuted:false. Provider-specific execution needs the corresponding provider integration and credentials.
- Private uploaded-file delivery/migration, derived historical tenant content and any additional tenant-content endpoints need a complete private-storage/purpose audit before claiming platform-wide tenant isolation. The new grants cover the listed endpoints, not every legacy backend endpoint.
- Organization owner transfer requires a canonical customer/employee/appointment ownership migration, not just changing an organization pointer.

No development server was started or stopped during this continuation. No production deployment, commit or push was performed. Existing environment and frontend package/configuration edits were preserved. Backend package files now include the PDF and DOCX parser dependencies.

Parser implementation references: [pdf-parse](https://github.com/mehmet-kozan/pdf-parse), [Mammoth](https://github.com/mwilliamson/mammoth.js).
