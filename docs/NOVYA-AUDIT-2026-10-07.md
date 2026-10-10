# Admin dashboard audit — 2026-10-07

Workspace and App are excluded. The design contains **126 in-scope screens/states**, references **1–96 and 310–339**. These include tabs, drawers, dialogs and execution states rather than 126 separate pages.

## Image-by-image reinspection

All 126 in-scope reference images were re-inspected from the numbered contact sheets. The [image layout checklist](NOVYA-IMAGE-LAYOUT-CHECKLIST.md) records the required panels, fields, controls and interaction states for each individual reference, followed by confirmed layout/data-contract gaps. The remaining work includes implementation gaps, not only a lack of populated test records.

This continuation added dedicated folder cards/conversation lists, the Kora recent sidebar and move-folder dialog, a reusable Kora orb and compact voice composer, a reference-style anchored Create launcher, Day/Week/Month calendar and mini-calendar controls, channel summary/attention/readiness panels and Settings overview metric cards. Customer editing now has the customer record behind the modal, and nested table fields resolve property paths.

The changed Kora/folder/calendar states, eight Settings section summaries, channel overview and launcher were checked at mobile/tablet sizes: 32 focused state measurements, with no document-level horizontal overflow. The move-folder and populated folder-detail states could not be observed because the audited database had no conversation/folder records. Temporary viewport overrides were reset. Frontend TypeScript, scoped ESLint and production build passed after these changes; backend code was unchanged in this image-layout continuation.

## Verified

- All 126 references have a registered route/state. Route checks additionally accept 33 resource tabs and 26 create/edit routes, and reject Workspace, App and malformed routes.
- Authenticated Chrome audit completed for the available top-level pages, Settings sections, create forms, six customer tabs, Inbox modes, channel pages and shared dialogs.
- **93 unique page/form URLs** were measured at **390 × 844** and **768 × 1024**. No document-level horizontal overflow remains in the checked states. Tables/calendar grids may scroll inside their containers. This measurement does not certify pixel fidelity, every dialog size, or every populated record layout.
- All four API key wizard steps were separately measured at both widths. Scope validation and review navigation were exercised; no key was issued.
- Launcher, Ask Kora voice dialog, Chat Kora drawer, provider configuration dialog and Calendar creation form opened successfully. Microphone access, messages, provider saves and calendar creation were not invoked.
- Existing customer overview, appointments, payments, notes, documents and edit pages were opened. Private tabs displayed the access prerequisite for a customer without a linked organization; an approved tenant-content view was not exercised.
- Production build, TypeScript, scoped ESLint and backend router imports passed. This continuation passed **14 backend tests**: 10 task/calendar/approval/permission/access contracts, 2 machine API tests and 2 channel tests. Five document parser tests passed in the preceding continuation and were not rerun because the parser was unchanged.

## Corrections made during this audit

| Area | Correction |
| --- | --- |
| Route handling | Shared validator and coverage check for every reference/tab/form; invalid and excluded routes return not found. |
| Team | Dedicated department members/context, performance review/goals/feedback and overview, absence calendar, onboarding attention queue and role-member views. Staff invite and candidate evaluation fields corrected. |
| Customer privacy | Notes/documents requests wait for a valid purpose-bound grant. Missing organization/grant displays an access prerequisite instead of issuing an unauthorized request. |
| Management / Settings | Health-risk rows open canonical organization records; privacy and organization filters use actual backend statuses. Provider setup has a first-record entry point and remains disconnected until verified. |
| Live channels | All six supported channels remain discoverable with zero traffic. Unavailable rates remain unavailable; invalid channels are rejected. |
| Approvals | An unavailable average response time displays an unavailable value rather than a fabricated zero. |
| API key creation | Reference 328 now has Ownership, Scopes, Guardrails and Create steps, summary panels and validation. Scopes are restricted in the UI to the two implemented read APIs. |
| Responsive tables | Approvals, Customers and Users overflow fixed by containing the visually hidden table header within the table scroll wrapper. |
| Sidebar | Replaced placeholder submenu symbols with page-specific icons. Closed mobile navigation is hidden from focus/accessibility as well as moved off screen. |
| UI text | Broken separator characters corrected in Tasks and permission policy. |

## Acceptance still needed

**This audit does not establish 100% design or functional acceptance.** Route registration, successful builds and overflow measurements are separate from screenshot-by-screenshot visual acceptance.

| References | Remaining evidence / implementation boundary |
| --- | --- |
| 3–5, 7–8, 10, 12, 17 | Populated Kora conversation/action, folder, investigation and knowledge-detail states. The audited database had no representative NOVYA records. |
| 23, 26–28 | Active call, transcript, intervention and organization location states need a live session, linked organization and independently approved, expiring access grant. |
| 31, 33 | Approval decision/execution results need separate requester and approver accounts and a representative pending request. Unit contracts cover independence and competing decisions, not live execution. |
| 38, 40–41 | Populated task detail and team/day assignment layout needs actual staff/tasks. Empty lists and create forms were checked. |
| 50, 52–57 | Organization detail, edit and member/billing/integration/health/contract tabs need a linked NOVYA organization. All routes exist; populated rendering was not observed. |
| 62, 64 | Approved customer documents/notes need a customer linked to an organization, a valid access grant and private records. Unauthorized states were checked. |
| 71–79, 82, 84, 86, 90, 92 | Staff, department, candidate, lifecycle, performance and role record states need representative records. Dedicated views were implemented but their populated visual acceptance remains pending. |
| 95–96 | Workflow preview/execution needs representative targets. Some approved workflows create operator tasks and return `externalChangeExecuted:false`; provider execution needs its integration. |
| 321–322, 324, 330–333 | Configuration pages render/save policy records; SSO installation, network/emergency enforcement, provider model routing, retention/residency processing and alert delivery require separate runtime integrations. Configuration storage alone does not implement enforcement. |
| 326 | Provider detail needs a saved provider record. The unconfigured record returns not found; setup dialog was verified without saving. |
| 328 | The four-step layout is implemented. Reference permissions for support logs, user/customer records, diagnostic runs and credential rotation are beyond the currently implemented overview/system-health read APIs. These are not advertised as working scopes. |
| Every in-scope reference | Exact spacing, typography, icons, charts and populated table density still require individual visual acceptance against the PNG. Shared layouts are not certified as a 100% pixel match. |

The per-reference inventory below distinguishes observed UI states from registered routes. No artificial production records were inserted, no consequential action was executed, and no user development server was started/stopped. Temporary viewport overrides were reset.

| Reference | State | Route check | Browser evidence | Exact visual acceptance |
| --- | --- | --- | --- | --- |
| 1.png | Command Center | Pass | Page opened; current data/empty state | Pending |
| 2.png | Kora new chat | Pass | Page opened; current data/empty state | Pending |
| 3.png | Kora working conversation | Pass | Needs representative record | Pending |
| 4.png | Kora action preview | Pass | Needs representative record | Pending |
| 5.png | Kora action result | Pass | Needs representative record | Pending |
| 6.png | Folders | Pass | Page opened; current data/empty state | Pending |
| 7.png | Conversation context | Pass | Needs representative record | Pending |
| 8.png | Folder detail | Pass | Needs representative record | Pending |
| 9.png | Create folder | Pass | Form opened; submission not exercised | Pending |
| 10.png | Move conversation | Pass | Needs representative record | Pending |
| 11.png | Investigations | Pass | Page opened; current data/empty state | Pending |
| 12.png | Investigation detail | Pass | Needs representative record | Pending |
| 13.png | Cases | Pass | Page opened; current data/empty state | Pending |
| 14.png | Actions | Pass | Page opened; current data/empty state | Pending |
| 15.png | Kora Brain | Pass | Page opened; current data/empty state | Pending |
| 16.png | Knowledge | Pass | Page opened; current data/empty state | Pending |
| 17.png | Knowledge detail | Pass | Needs representative record | Pending |
| 18.png | Add knowledge | Pass | Form opened; submission not exercised | Pending |
| 19.png | Import source | Pass | Page opened; current data/empty state | Pending |
| 20.png | History | Pass | Page opened; current data/empty state | Pending |
| 21.png | Live overview | Pass | Page opened; current data/empty state | Pending |
| 22.png | All conversations | Pass | Page opened; current data/empty state | Pending |
| 23.png | Conversation detail | Pass | Needs representative record | Pending |
| 24.png | Channel overview | Pass | Page opened; current data/empty state | Pending |
| 25.png | Channel detail | Pass | Page opened; current data/empty state | Pending |
| 26.png | Live call | Pass | Needs representative record | Pending |
| 27.png | Intervention | Pass | Needs representative record | Pending |
| 28.png | Organization locations | Pass | Needs representative record | Pending |
| 29.png | Approvals overview | Pass | Page opened; current data/empty state | Pending |
| 30.png | All approvals | Pass | Page opened; current data/empty state | Pending |
| 31.png | Approval detail | Pass | Needs representative record | Pending |
| 32.png | Create approval | Pass | Form opened; submission not exercised | Pending |
| 33.png | Approval result | Pass | Needs representative record | Pending |
| 34.png | Create launcher | Pass | Shared dialog opened; no message or microphone | Pending |
| 35.png | Ask Kora voice | Pass | Shared dialog opened; no message or microphone | Pending |
| 36.png | Chat Kora | Pass | Shared dialog opened; no message or microphone | Pending |
| 37.png | My tasks | Pass | Page opened; current data/empty state | Pending |
| 38.png | Task detail | Pass | Needs representative record | Pending |
| 39.png | Create and assign | Pass | Form opened; submission not exercised | Pending |
| 40.png | Team tasks | Pass | Page opened; current data/empty state | Pending |
| 41.png | Team day detail | Pass | Page opened; current data/empty state | Pending |
| 42.png | Internal chat | Pass | Page opened; current data/empty state | Pending |
| 43.png | Email | Pass | Page opened; current data/empty state | Pending |
| 44.png | Calendar week | Pass | Page opened; current data/empty state | Pending |
| 45.png | Create launcher | Pass | Shared dialog opened; no message or microphone | Pending |
| 46.png | Ask Kora voice | Pass | Shared dialog opened; no message or microphone | Pending |
| 47.png | Chat Kora | Pass | Shared dialog opened; no message or microphone | Pending |
| 48.png | Management overview | Pass | Page opened; current data/empty state | Pending |
| 49.png | Organizations | Pass | Page opened; current data/empty state | Pending |
| 50.png | Organization record | Pass | Needs representative record | Pending |
| 51.png | Create organization | Pass | Five-step form inspected; not submitted | Pending |
| 52.png | Edit organization | Pass | Needs representative record | Pending |
| 53.png | Organization members | Pass | Needs representative record | Pending |
| 54.png | Organization billing | Pass | Needs representative record | Pending |
| 55.png | Organization integrations | Pass | Needs representative record | Pending |
| 56.png | Organization health | Pass | Needs representative record | Pending |
| 57.png | Organization contracts | Pass | Needs representative record | Pending |
| 58.png | Customers | Pass | Page opened; current data/empty state | Pending |
| 59.png | Customer record | Pass | Page opened; current data/empty state | Pending |
| 60.png | Add customer | Pass | Form opened; submission not exercised | Pending |
| 61.png | Customer appointments | Pass | Page opened; current data/empty state | Pending |
| 62.png | Customer documents | Pass | Access prerequisite observed; approved content pending | Pending |
| 63.png | Customer payments | Pass | Page opened; current data/empty state | Pending |
| 64.png | Customer notes | Pass | Access prerequisite observed; approved content pending | Pending |
| 65.png | Edit customer | Pass | Form opened; submission not exercised | Pending |
| 66.png | Health and risk | Pass | Page opened; current data/empty state | Pending |
| 67.png | Plans and billing | Pass | Page opened; current data/empty state | Pending |
| 68.png | Management activity | Pass | Page opened; current data/empty state | Pending |
| 69.png | Team overview | Pass | Page opened; current data/empty state | Pending |
| 70.png | Members | Pass | Page opened; current data/empty state | Pending |
| 71.png | Member record | Pass | Needs representative record | Pending |
| 72.png | Employment | Pass | Needs representative record | Pending |
| 73.png | Team and role | Pass | Needs representative record | Pending |
| 74.png | Member access | Pass | Needs representative record | Pending |
| 75.png | Member absence | Pass | Needs representative record | Pending |
| 76.png | Member performance | Pass | Needs representative record | Pending |
| 77.png | Compensation | Pass | Needs representative record | Pending |
| 78.png | Member documents | Pass | Needs representative record | Pending |
| 79.png | Member activity | Pass | Needs representative record | Pending |
| 80.png | Invite member | Pass | Form opened; submission not exercised | Pending |
| 81.png | Departments | Pass | Page opened; current data/empty state | Pending |
| 82.png | Department detail | Pass | Needs representative record | Pending |
| 83.png | Recruiting | Pass | Page opened; current data/empty state | Pending |
| 84.png | Candidate detail | Pass | Needs representative record | Pending |
| 85.png | On and offboarding | Pass | Page opened; current data/empty state | Pending |
| 86.png | Lifecycle journey | Pass | Needs representative record | Pending |
| 87.png | Time and absence | Pass | Page opened; current data/empty state | Pending |
| 88.png | Record absence | Pass | Form opened; submission not exercised | Pending |
| 89.png | Performance | Pass | Page opened; current data/empty state | Pending |
| 90.png | Performance review | Pass | Needs representative record | Pending |
| 91.png | Roles and access | Pass | Page opened; current data/empty state | Pending |
| 92.png | Role detail | Pass | Needs representative record | Pending |
| 93.png | System health | Pass | Page opened; current data/empty state | Pending |
| 94.png | Workflow library | Pass | Page opened; current data/empty state | Pending |
| 95.png | Workflow runner | Pass | Needs target / run record | Pending |
| 96.png | Workflow result | Pass | Needs target / run record | Pending |
| 310.png | Settings overview | Pass | Page opened; current data/empty state | Pending |
| 311.png | General | Pass | Page opened; current data/empty state | Pending |
| 312.png | Platform defaults | Pass | Page opened; current data/empty state | Pending |
| 313.png | Company | Pass | Page opened; current data/empty state | Pending |
| 314.png | Legal and contacts | Pass | Page opened; current data/empty state | Pending |
| 315.png | Branding and domains | Pass | Page opened; current data/empty state | Pending |
| 316.png | Brand identity | Pass | Page opened; current data/empty state | Pending |
| 317.png | Domain verification | Pass | Page opened; current data/empty state | Pending |
| 318.png | Roles and access | Pass | Page opened; current data/empty state | Pending |
| 319.png | Permission policy | Pass | Page opened; current data/empty state | Pending |
| 320.png | Platform security | Pass | Page opened; current data/empty state | Pending |
| 321.png | Authentication and SSO | Pass | Page opened; current data/empty state | Pending |
| 322.png | Emergency and network access | Pass | Page opened; current data/empty state | Pending |
| 323.png | Notifications | Pass | Page opened; current data/empty state | Pending |
| 324.png | Alert policy | Pass | Page opened; current data/empty state | Pending |
| 325.png | Integrations and API | Pass | Page opened; current data/empty state | Pending |
| 326.png | Provider detail | Pass | No configured provider; setup opened | Pending |
| 327.png | API keys and webhooks | Pass | Page opened; current data/empty state | Pending |
| 328.png | Create API key | Pass | Four steps and validation exercised; no key issued | Pending |
| 329.png | Kora defaults | Pass | Page opened; current data/empty state | Pending |
| 330.png | Model routing and budgets | Pass | Page opened; current data/empty state | Pending |
| 331.png | Approval and data policy | Pass | Page opened; current data/empty state | Pending |
| 332.png | Data and privacy | Pass | Page opened; current data/empty state | Pending |
| 333.png | Retention and residency | Pass | Page opened; current data/empty state | Pending |
| 334.png | Privacy requests | Pass | Page opened; current data/empty state | Pending |
| 335.png | Audit and compliance | Pass | Page opened; current data/empty state | Pending |
| 336.png | Configuration changes | Pass | Page opened; current data/empty state | Pending |
| 337.png | Advanced | Pass | Page opened; current data/empty state | Pending |
| 338.png | Plans and feature access | Pass | Page opened; current data/empty state | Pending |
| 339.png | Feature flags and rollouts | Pass | Page opened; current data/empty state | Pending |
