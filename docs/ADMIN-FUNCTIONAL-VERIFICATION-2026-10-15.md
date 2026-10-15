# Admin functionality verification — 15 October 2026

The complete dashboard is **not yet certified as fully functional**. Compilation, selected API/action contracts and account access are verified. Browser interaction coverage remains pending because the browser tool reports no connected Chrome/Edge browser. The user chose to connect a browser rather than authorize an alternative browser runner.

## Scope inventory

- 126 design references/states, 22 resource families and 33 resource tabs.
- 26 declared create/edit routes pass the route inventory checks.
- Current source inventory: 148 TypeScript/TSX files, 473 interactive controls, 165 NOVYA API call sites. These are inventory counts, not passing test counts.
- Preserve pre-existing Settings changes and the user's development server.

## Changes made

- Added MFA-code forwarding and actionable MFA/blocked-account login errors. Removed the hardcoded example credentials from the login form.
- Removed the newly introduced frontend requirement that a staff mapping must exist before credentials can create a session. Backend authorization remains unchanged. Signed-in accounts without administrator permissions get an explicit access-state screen; their personal profile remains available.
- Added backend logout revocation through the NextAuth sign-out event and handling of all protected API 401 responses, including fresh-auth and revoked-session errors.
- Authenticated the Inbox/notification Socket.IO handshake with the current access token. Reconnect on token change and disconnect when the last subscription leaves.
- Added narrowly scoped, transactional account provisioning and legacy-admin migration scripts, with regression tests. Neither script runs automatically on login.

## User-authorized account provisioning

- Created only the requested new `admin123@gmail.com` account after the user explicitly selected full Platform Admin access and supplied its credentials.
- Login category: `User.role = "admin"`.
- Staff authority: `NvTeamMember` links to `NvRole.slug = "platform_admin"`, with wildcard platform permissions.
- Credentials are hashed in the database; no password or access token is included in this report or verification artifacts.
- Actual configured backend verification: login, `/novya/context`, `/novya/overview`, `/novya/team/members`, `/novya/settings` all returned HTTP 200.
- The earlier attempt to restore the existing `admin@gmail.com` mapping was rejected by automatic approval review because it would create persistent wildcard authority without exact authorization. The user then declined that database change. That old account's permission mapping was not changed. The later authorization applies specifically to the new account.

## Evidence

Artifacts are in `output/admin-functionality/` at the workspace root:

| Check | Result | Evidence |
|---|---|---|
| Production build | Passed, isolated source copy, Next.js 16.2.6 with webpack | `production-build.log` |
| TypeScript | Passed | `npx tsc --noEmit` |
| Changed auth/session/socket/access files | ESLint passed | Targeted ESLint run |
| Existing repository-wide lint | Not passing; baseline contains legacy effect/typing and CJS tooling findings | `tmp/admin-functionality/eslint-baseline.json` |
| Full backend suite | 78 passed, 0 failed, 0 skipped | `backend-tests.log` |
| New frontend auth/realtime tests | 5 passed | `tests/auth-realtime.test.cjs` |
| Read API contracts | 87/87 passed against real routers in a disposable database | `api-contract-results.json` |
| Mutation contracts | 9/9 flows passed, 40 requests, with persisted-result assertions | `action-contract-results.json` |
| New account on configured backend | 5 successful requests including login | `new-admin-verification.json` |
| Browser tests | Pending; no connected browser | Browser inventory returned empty |

Mutation flows cover folders, departments, unassigned role definitions, task assignment/edit/comment, Calendar create/reschedule/delete, recruiting position/candidate creation/edit, absence decisions, independent approval and API-key authorization/revocation. All these mutations used disposable synthetic records, not the user's application database.

Read contracts derive literal API paths from the source inventory and include representative record/tab/lookup routes. They do not prove every dynamic combination, validation error, business policy or visible control.

## Remaining work before a full-functionality claim

1. Use a connected browser to walk every route and populated record/tab; verify actual buttons, field validation, submissions, pagination, search, loading/error states and responsive interactions.
2. Extend representative action contracts to every action family and failure/recovery path, including grants, staff documents, compensation proposals, invitations, integrations and workflow retries.
3. Verify permission-limited users, cross-tenant denial, two-account approval and stale/revoked session behavior in the browser.
4. Resolve existing repository-wide lint findings without hiding application errors.
5. Check externally configured capabilities individually. SMTP, storage, Kora models, calendar/provider sync, payments, CI and other integrations cannot be declared working from a settings record or compilation alone. No external messages/payments/deployments were performed during this check.
6. The broader backend gaps in `output/audit/NOVYA_Backend_A_to_Z_Audit_Bangla.md` remain relevant; these frontend changes do not finish those business workflows.

## Development server handling

An initial test Next.js server on port 3400 conflicted with the user's project-wide dev lock. That server and its lock were removed and port 3400 was verified not listening. No user server was stopped. Production compilation subsequently used a separate source copy under `tmp/admin-functionality/`, with its own build output and test environment values, leaving the user's `.env` files and running development server unchanged.

The Next package did not contain the `node_modules/next/dist/docs/` guides referenced by AGENTS.md. Framework conventions were checked against the official [layouts/pages](https://nextjs.org/docs/app/getting-started/layouts-and-pages) and [Proxy](https://nextjs.org/docs/app/api-reference/file-conventions/proxy) documentation.
