# Tasks and Inbox reference audit

Reference folder: `../New Admin Dashboard/New Admin Dashboard`

## Screen-by-screen changes

| Reference | Screen | Implementation |
| --- | --- | --- |
| 37.png | My Tasks | Four summary cards, My Tasks/Team switch, circular create action, Today/Upcoming/All/Completed filters, search, grouped task rows, focus/progress and sources panels. |
| 38.png | Task Detail | Summary banner, description/checklist/activity panel, assignment/status panel, recurrence context and linked documents. Existing completion, checklist and comment mutations retained. |
| 39.png | Create & Assign | Full-width title/description, two-column fields, editable checklist, attachment links, Kora assistance and live preview. Confirmation appears in a review dialog. |
| 40.png | Team Tasks | Seven-day workload grid with member cards and task totals, week navigation, role/department filtering and assignment link. |
| 41.png | Team Day Detail | Full page at `/tasks/team/:memberId/:yyyy-mm-dd`. Filters, task rows, completion progress and source counts use only the selected member's tasks for that day. |
| 42.png | Inbox Conversations | Heading-level Inbox/Email switch; independently bordered conversation, thread and contact panels; charcoal surfaces; blue message bubbles; multiline composer and retained attachment/emoji actions. |
| 43.png | Email | Folder sidebar, searchable/paginated mail list and independent reading pane with sender, body, attachments, Kora assistance and reply/forward actions. |

Tasks keeps the main dashboard navigation. Module styles are scoped under `.tk-page` / `.tk-shell` and `.ib-page` / `.ib-shell`. Both layouts contain responsive breakpoints; the team grid scrolls horizontally when needed.

## API behavior

- Task CRUD, completion, comments, checklist changes and team filters use existing NOVYA endpoints.
- Email folders supported by the backend are Inbox, Starred, Sent and Drafts.
- Reply and Forward use the existing `POST /mail/:id/action` endpoint rather than sending an unrelated new message.
- Reference-only features without backend support remain unavailable: task repeat schedules, task templates/dependencies, automatic Kora task suggestions, email snooze/scheduled delivery/trash recovery, email category classification and generated email summaries. No fixture values are rendered by the production pages.
- Inbox pin persistence now hydrates through an external storage subscription without overwriting saved pins on mount.

## Verification

- `node scripts/check-task-inbox-design.cjs`: offline renders pass for all seven reference screens, the invalid-date state, seven clickable cells per team member and isolation of another member's tasks.
- `node node_modules/typescript/bin/tsc --noEmit`: passed.
- Targeted ESLint: zero errors; one existing `no-img-element` warning for chat attachment previews.
- `node node_modules/next/dist/bin/next build`: passed.
- Scoped `git diff --check`: passed.

Live browser screenshot comparison and interaction with a signed-in session were not available: the browser inventory was empty and the Windows computer-use native pipe was unavailable. Consequently, pixel-perfect equivalence and live backend interaction have not been verified. The offline checks do not send messages, create tasks, or change backend records. No additional development server was started.
