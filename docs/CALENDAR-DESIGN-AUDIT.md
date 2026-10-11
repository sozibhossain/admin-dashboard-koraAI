# Calendar design audit

Reference folder: `New Admin Dashboard/New Admin Dashboard`.

| Reference | Implemented state |
| --- | --- |
| 44.png | Calendar weekly timeline, calendar scopes, Upcoming, mini calendar and sync status |
| 45.png | Page create launcher with Ask Kora, Chat and Create |
| 46.png | Centered Ask Kora popup with voice input and page context |
| 47.png | Right Kora chat drawer with actual replies and quick prompt actions |

Calendar keeps the existing NOVYA sidebar and uses scoped charcoal styling. Day and Month views remain available. Event blocks use their start time and duration; overlapping events get separate columns, and overnight events clip to each day. Navigation uses local calendar dates. Empty/loading/error states and responsive layouts are included.

Existing internal Calendar API handles create, edit and delete. Owner restrictions remain in place. Forms validate the date range before submitting. Kora uses the existing chat endpoint and conversation ID; visible event context is included in the request. Voice input uses existing browser speech recognition, with a typed-message fallback. Quick actions fill the composer for review.

The current internal calendar schema has no department calendar groups or Google sync connection endpoint. Scope chips therefore show All, Me, Team and Private; Google sync is shown as not connected. Reference sample events, connections and assistant replies are not fabricated.

Validation: TypeScript, targeted ESLint and `scripts/check-calendar-design.cjs` cover page render, all three views, overlap columns, midnight clipping, invalid dates, owner lookup, mini calendar selection, and assistant content. Tasks/Inbox offline render checks also pass after the shared shell change. Production build verification is recorded in the task response.

Live browser screenshot and interaction verification was unavailable because no browser surface was connected. The offline checks do not establish pixel-perfect appearance or verify live backend mutations.
