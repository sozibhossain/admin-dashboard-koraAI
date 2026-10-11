# Team design audit

Reference folder: `New Admin Dashboard/New Admin Dashboard`.

| Reference | Page or state |
| --- | --- |
| 69 | Team overview: organization map, people movement, team focus |
| 70 | Members: directory and pending invitations |
| 71-79 | Member Record: Overview, Employment, Team & Role, Access, Time & Absence, Performance, Compensation, Documents, Activity |
| 80 | Invite member popup |
| 81 | Departments & Teams |
| 82 | Department detail |
| 83 | Recruiting |
| 84 | Candidate detail and its section navigation |
| 85 | Onboarding & Offboarding |
| 86 | Lifecycle journey and interactive checklist |
| 87 | Time & Absence |
| 88 | Record absence popup |
| 89 | Performance |
| 90 | Performance review |
| 91 | Roles & Access |
| 92 | Role detail |

All Team routes now enter `TeamWorkspace`. Module-specific layouts replace generic record wrappers for the reference screens. Additional job, candidate and review create/edit routes continue to use existing forms, styled within Team. The sidebar keeps Team navigation; the header shows the current Team section. Team styles are scoped to `.tm-page`, `.tm-shell` and Team dialog classes.

Member sections have independent card layouts. Existing employment/assignment/access/compensation editors, staff access actions, document upload, candidate notes and interview actions remain available. Department and role details link to actual member records. The Members directory supports department and status filters, search, pagination, and recent/name sorting. Department links preserve the department filter.

Invite uses the existing account/HR creation endpoint and displays the one-time temporary-password receipt when returned. The endpoint does not provide outbound email delivery. Absence forms validate dates and explicitly send the existing `record` flag for an approved entry; it can be turned off for a pending request. Modal dismissal is blocked during submission. Journey checklist updates and review status changes use the existing endpoints and invalidate Team queries.

Data boundaries: no sample employee names, salaries, session counts, department capacity, hiring targets, leave allowance, payroll bank account, identity-provider status, document compliance, or generated Kora replies are inserted. The Team API has no separate sub-team, attendance/timesheet, access-review queue or live-session data. Reference structures are populated with supported HR data. Unavailable balances and metrics have truthful empty states or notes. Compensation stays absent when the backend strips it. Member history uses the returned lifecycle events. Recent absence/review lists follow the backend limits (five absences, three reviews). Absence-type filtering applies to the current page of the Members directory.

Verification: `scripts/check-team-design.cjs` renders all 24 reference screens with offline fixtures, plus candidate tab routes, empty directories, restricted compensation, date validation, approval flags, department-linked search and progress clamping. It does not contact the backend or mutate user data. TypeScript and targeted ESLint pass. Production build result is recorded in the task response. Tasks/Inbox/Calendar regression render checks are also run after shared router and shell changes.

No browser surface was connected, so live screenshots, responsive visual inspection, and live backend mutation verification could not be performed. Offline rendering is not a pixel-perfect visual assertion.
