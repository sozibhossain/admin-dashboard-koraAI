# Management design audit

Scope: numbered PNG references 48–68 in `New Admin Dashboard/New Admin Dashboard` (21 designs). Existing Users navigation remains available as requested.

The references were inspected and the implementation structure was compared against them. **Live browser screenshots and pixel comparisons are pending**: the computer-use surface reports no enabled browsers. This is not a pixel-perfect certification.

| Reference | Screen | Implementation |
| --- | --- | --- |
| 48 | Management overview | `management-pages.tsx`: four KPIs, filter toolbar, portfolio table and four summary cards |
| 49 | Organizations | `management-pages.tsx`: avatars, status, plan, dates, MRR, usage, health, actions and pagination |
| 50 | Organization record | `organization-record.tsx`: header, nine tabs, metrics, subscription, timeline and five detail blocks |
| 51 | Create organization | `organization-editor-layout.tsx` and `organization-form.tsx`: draft page, setup metrics, checklist, summary and field dialogs |
| 52 | Edit organization | `organization-editor-layout.tsx` and `organization-edit.tsx`: record header, configuration tabs, profile and summary |
| 53 | Members & roles | `organization-record.tsx`: membership metrics and role management |
| 54 | Organization billing | `organization-record.tsx`: subscription metrics, billing timeline, invoices and commercial terms |
| 55 | Integrations | `organization-record.tsx`: connection metrics, primary connection and configuration editor |
| 56 | Organization health | `organization-record.tsx`: evaluated health, risk metrics and investigation actions |
| 57 | Contracts | `organization-record.tsx`: contract metrics, agreement, history and file actions |
| 58 | Customers | `customer-pages.tsx`: filters, directory, row menus and pagination |
| 59 | Customer record | `customer-pages.tsx`: metrics, appointment, timeline and detail blocks |
| 60 | Add customer | `customer-pages.tsx`: styled form dialog |
| 61 | Customer appointments | `customer-pages.tsx`: appointment metrics, history and rescheduling |
| 62 | Customer documents | `customer-pages.tsx`: document metrics and file actions, subject to tenant access |
| 63 | Customer payments | `customer-pages.tsx`: payment metrics, history and receipt dialog |
| 64 | Customer notes | `customer-pages.tsx`: categories, timeline, pinning and editor, subject to tenant access |
| 65 | Edit customer | `customer-pages.tsx`: styled form dialog |
| 66 | Health & Risk | `management-pages.tsx`: health KPIs, risk filters, queue and summary cards |
| 67 | Plans & Billing | `management-pages.tsx`: billing KPIs, plan filters, subscriptions and renewal summaries |
| 68 | Management activity | `management-pages.tsx`: activity KPIs, actor/type filters, feed and summaries |

Shared styling lives in `app/customer.css`, `app/management.css` and `app/dropdown.css`. Menus use Radix portals to avoid table clipping and multiple open row menus. Breakpoints adapt the cards, record columns and filters to smaller screens; wide tables retain horizontal scrolling.

Data comes from existing collections rather than reference fixture values. Missing metering and unevaluated health are shown explicitly. Private customer records retain tenant access checks. Plan and access changes retain the reviewed workflow path.

Verification:

- TypeScript check passes.
- ESLint for the changed Management components passes. Repository-wide ESLint still reports 40 errors in other files and scripts.
- Production build passes.
- Three management calculation tests pass.
- `backendKoraAi/scripts/verifyNovyaManagement.js` verifies real database overview totals, organization lists, member/usage metrics, risk-driver filtering, record response and activity pagination without database writes.

Remaining visual verification: capture every reference state at the matching viewport, compare spacing, typography, borders and gradients, and exercise menus/dialogs at desktop and mobile widths in a connected browser.
