# Live View design audit

References: `New Admin Dashboard/New Admin Dashboard/21.png` through `28.png`.

| Reference | Screen | Implementation |
| --- | --- | --- |
| 21 | Live View overview | `/live-view`; filtered activity feed, operational KPIs, active organizations, Kora sessions |
| 22 | All conversations | `/live-view/conversations`; live/AI/human/attention filters, channel filter, search, ordering, server pagination |
| 23 | Conversation detail | `/live-view/conversations/:id`; transcript, ownership, customer context, agent transcript entries, access requests |
| 24 | Channel overview | `/live-view/channels`; channel table, health bars, attention, provider configuration link |
| 25 | WhatsApp / channel detail | `/live-view/channels/:channel`; recent sessions, AI events, activity, monthly session health, attention |
| 26 | Live call detail | Conversation detail automatically uses call layout for `channel=phone`; recorded transcript, caller context, intent, notes, intervention |
| 27 | Intervention & incident | `/live-view/conversations/:id/intervention`; request context, recorded flow timeline, reviewed intervention, linked incident |
| 28 | Organization location view | `/live-view/organizations/:id`; location filter, recorded sessions, configured locations, permitted team context, attention |

All Live View styling is scoped through `lv-shell` / `lv-page`. The main admin navigation remains visible, and Live View sections have their own header tabs, including mobile access. Organization selection also has a dedicated directory page.

## Backend changes

- Public session list supports combined text, live, handler, channel and attention filters and paginates on the server.
- Channel KPIs count ongoing sessions even when started in a prior month. Recorded duration averages use completed monthly sessions only; missing samples return null.
- Channel detail includes metrics, recorded events and attention sessions.
- New organization live-context endpoint validates location ownership, filters sessions to the organization/location, and gates team context behind an unexpired tenant grant.
- Session model accepts optional location ID, intent and AI notes. Private notes are stripped from responses without a tenant grant.
- Intervention rejects closed/failed sessions, validates purpose length and updates escalation state and event status correctly.
- Transcript entries reject spoofed customer/Kora speakers and closed-session writes. Admin entries record an agent transcript entry; this endpoint does not deliver messages through providers.

## Verification and limits

- Targeted ESLint passed.
- `node --test tests/novya-live.test.js tests/novya-contract.test.js`: 17 passed.
- TypeScript and production build passed (`npm run build`).
- No enabled browser surface is available in this environment. Visual desktop/mobile verification and a pixel-perfect claim remain pending.
- References contain illustrative booking counts, delivered-message statistics, occupancy, chair assignments, staff attendance, audio monitoring and booking-policy exception decisions. The current live session data model does not provide those integrations. Implemented screens use actual available session/location data, explicit missing-data states and recorded admin interventions; they do not invent those values or claim provider delivery/audio/booking execution.

