# Kora design implementation — 2026-10-10

Scope: admin dashboard Kora workspace and its backend endpoints only.
References: `New Admin Dashboard/New Admin Dashboard/2.png` through `20.png`.

## Reference mapping

| Screens | View | Implementation |
| --- | --- | --- |
| 2 | New chat | `components/novya/kora.tsx`: original Kora bitmap, centered composer, suggestions |
| 3–5 | Conversation, working, action preview/result | `kora.tsx`: message workbench, context sidebar, move/share, pin/archive, recorded action result |
| 6 | Folders | `kora-folders.tsx`: folder cards and recent conversation cards |
| 7 | Conversation inside folder | Conversation view with populated folder context |
| 8 | Folder details | `kora-folders.tsx`: searchable conversations scoped to folder |
| 9 | Create folder | `kora-folder-dialog.tsx`: create/edit modal; direct form routes retained |
| 10 | Move to folder | `move-conversation.tsx`: folder picker, removal, nested creation |
| 11 | Investigations | `kora-records.tsx`: metrics, search/status filters, incident signal sidebar |
| 12 | Investigation detail | Message workbench, evidence, hypotheses, watching, completion, timeline |
| 13 | Cases | Outcome cards, search/status filters, evidence and linked action detail |
| 14 | Actions | Metric cards, search/status filters, review queue, impact detail and confirmed decision |
| 15 | Brain | `kora-brain.tsx`: constellation, domain labels/counts, navigation, recent knowledge, metrics |
| 16 | Knowledge list | `kora-knowledge.tsx`: domain cards, coverage, import panel and learning status |
| 17 | Domain knowledge | Topic navigation, paginated knowledge items and domain intelligence panel |
| 18 | Add knowledge | `kora-knowledge-dialog.tsx`: drawer, domain/topic mapping, manual/document/URL paths and suggestion review |
| 19 | Connect source | `kora-sources.tsx`: drawer, manual/document/public HTTPS import, source mapping |
| 20 | History | `kora-records.tsx`: grouped activity, type filters/counts, pagination and complete filtered JSON export |

## Backend changes

- Independent investigation/action totals, pending approval queue and permission-filtered incident signals at `/novya/kora/summary`.
- Conversation previews, ownership-checked folder assignment, administrator-only sharing and read-only shared conversations.
- Investigation detail includes conversation messages only for its owner/shared readers; completion retains evidence in a case.
- Knowledge topic grouping, per-domain suggestion counts and source search/domain filters.
- Public HTTPS source import pins validated public DNS addresses, rejects private/reserved addresses and redirects, and bounds response size/time.
- History includes conversations, investigations, cases, actions and knowledge with correct destination URLs and cross-type pagination. It lists each record's latest update, not an immutable audit-event stream.
- PDF/DOCX parsing moved to a bounded child process after reproducing a Windows worker-thread native crash. Parser failures do not crash the API host.
- User screenshots exposed a cropped Add Knowledge drawer. Kora drawers now opt into right-aligned positioning at the dialog primitive, reset Tailwind's individual `translate` property, and keep their headers/actions outside the scrolling form body. Other dialogs retain their default centered positioning.

## Validation

- TypeScript check and targeted ESLint: pass.
- Production Next.js build: pass with sandbox worker execution approved.
- Existing route coverage: 126 references, 33 resource tabs and 26 form routes pass.
- Kora, document parser and approval contract suites: 21 tests pass, including PDF/DOCX, corrupt PDFs, URL validation, privacy, folder ownership, administrator-only sharing and History pagination.

## Remaining verification

The available computer-use runtime has no connected browser: both in-app browser and Chrome return `Browser is not available`. No live authenticated API/database workflow or browser screenshot comparison was performed. Pixel-perfect equivalence is therefore **not verified**.

User-supplied Brain/drawer screenshots were reviewed. The reported `M_ID` runtime errors originate in a `chrome-extension://…/executors/200.js` stack; application code does not appear in that supplied stack. The drawer fix still needs a refreshed browser screenshot to verify its final rendered position.

The design uses illustrative counts and labels. This implementation uses saved records and supported backend states instead: watching/approved/failed where appropriate, indexed knowledge topics, and imported source coverage. Source import currently runs once; periodic provider synchronization is not implemented. The knowledge graph is a navigable domain visualization rather than a queryable entity-relation graph. Source and Kora choices in the knowledge drawer open the corresponding source/suggestion workflows.
