# NOVYA admin design coverage

Scope: references **1–96 and 310–339 (126 screens/states)**. Workspace (97–309) and App are excluded. Record routes use actual database IDs.

This is a route/state inventory, not a claim of pixel-perfect completion. Authenticated browser and responsive checks are recorded in [the dated audit](NOVYA-AUDIT-2026-10-07.md). Populated-state visual acceptance and live action integration QA remain outstanding. Some operational workflows create approved operator tasks rather than performing external provider changes. SSO configuration is not an installed SSO provider; Scoped API keys authenticate the read-only overview and system-health machine API. External provider automation still requires integration setup.

| Reference | Screen | Route | State |
| --- | --- | --- | --- |
| 1.png | Command Center | `/dashboard` | page |
| 2.png | Kora new chat | `/kora` | page |
| 3.png | Kora working conversation | `/kora/conversations/:id` | working |
| 4.png | Kora action preview | `/kora/conversations/:id` | action preview |
| 5.png | Kora action result | `/kora/conversations/:id` | action result |
| 6.png | Folders | `/kora/folders` | page |
| 7.png | Conversation context | `/kora/conversations/:id` | page |
| 8.png | Folder detail | `/kora/folders/:id` | page |
| 9.png | Create folder | `/kora/folders/create` | modal |
| 10.png | Move conversation | `/kora/conversations/:id` | folder selector |
| 11.png | Investigations | `/kora/investigations` | page |
| 12.png | Investigation detail | `/kora/investigations/:id` | page |
| 13.png | Cases | `/kora/cases` | page |
| 14.png | Actions | `/kora/actions` | page |
| 15.png | Kora Brain | `/kora/brain` | page |
| 16.png | Knowledge | `/kora/knowledge` | page |
| 17.png | Knowledge detail | `/kora/knowledge/:id` | page |
| 18.png | Add knowledge | `/kora/knowledge/create` | drawer |
| 19.png | Import source | `/kora/sources` | page |
| 20.png | History | `/kora/history` | page |
| 21.png | Live overview | `/live-view` | page |
| 22.png | All conversations | `/live-view/conversations` | page |
| 23.png | Conversation detail | `/live-view/conversations/:id` | page |
| 24.png | Channel overview | `/live-view/channels` | page |
| 25.png | Channel detail | `/live-view/channels/whatsapp` | page |
| 26.png | Live call | `/live-view/conversations/:id` | call |
| 27.png | Intervention | `/live-view/conversations/:id` | review and confirm |
| 28.png | Organization locations | `/live-view/organizations/:id` | page |
| 29.png | Approvals overview | `/approvals` | page |
| 30.png | All approvals | `/approvals/all` | page |
| 31.png | Approval detail | `/approvals/:id` | page |
| 32.png | Create approval | `/approvals/create` | page |
| 33.png | Approval result | `/approvals/:id` | execution result |
| 34.png | Create launcher | `/approvals` | plus launcher |
| 35.png | Ask Kora voice | `/approvals` | voice dialog |
| 36.png | Chat Kora | `/approvals` | chat drawer |
| 37.png | My tasks | `/tasks` | page |
| 38.png | Task detail | `/tasks/:id` | page |
| 39.png | Create and assign | `/tasks/create` | page |
| 40.png | Team tasks | `/tasks/team` | page |
| 41.png | Team day detail | `/tasks/team` | day selection |
| 42.png | Internal chat | `/inbox` | chat tab |
| 43.png | Email | `/inbox` | email tab |
| 44.png | Calendar week | `/calendar` | page |
| 45.png | Create launcher | `/calendar` | plus launcher |
| 46.png | Ask Kora voice | `/calendar` | voice dialog |
| 47.png | Chat Kora | `/calendar` | chat drawer |
| 48.png | Management overview | `/management` | page |
| 49.png | Organizations | `/management/organizations` | page |
| 50.png | Organization record | `/management/organizations/:id` | page |
| 51.png | Create organization | `/management/organizations/create` | five steps |
| 52.png | Edit organization | `/management/organizations/:id/edit` | page |
| 53.png | Organization members | `/management/organizations/:id/members` | page |
| 54.png | Organization billing | `/management/organizations/:id/plan-billing` | page |
| 55.png | Organization integrations | `/management/organizations/:id/integrations` | page |
| 56.png | Organization health | `/management/organizations/:id/health` | page |
| 57.png | Organization contracts | `/management/organizations/:id/contracts` | page |
| 58.png | Customers | `/management/customers` | page |
| 59.png | Customer record | `/management/customers/:id` | page |
| 60.png | Add customer | `/management/customers/create` | modal |
| 61.png | Customer appointments | `/management/customers/:id/appointments` | page |
| 62.png | Customer documents | `/management/customers/:id/documents` | page |
| 63.png | Customer payments | `/management/customers/:id/payments` | page |
| 64.png | Customer notes | `/management/customers/:id/notes` | page |
| 65.png | Edit customer | `/management/customers/:id/edit` | modal |
| 66.png | Health and risk | `/management/health-risk` | page |
| 67.png | Plans and billing | `/management/plans-billing` | page |
| 68.png | Management activity | `/management/activity` | page |
| 69.png | Team overview | `/team` | page |
| 70.png | Members | `/team/members` | page |
| 71.png | Member record | `/team/members/:id` | page |
| 72.png | Employment | `/team/members/:id/employment` | page |
| 73.png | Team and role | `/team/members/:id/team-role` | page |
| 74.png | Member access | `/team/members/:id/access` | page |
| 75.png | Member absence | `/team/members/:id/time-absence` | page |
| 76.png | Member performance | `/team/members/:id/performance` | page |
| 77.png | Compensation | `/team/members/:id/compensation` | page |
| 78.png | Member documents | `/team/members/:id/documents` | page |
| 79.png | Member activity | `/team/members/:id/activity` | page |
| 80.png | Invite member | `/team/members/create` | modal |
| 81.png | Departments | `/team/departments` | page |
| 82.png | Department detail | `/team/departments/:id` | page |
| 83.png | Recruiting | `/team/recruiting` | page |
| 84.png | Candidate detail | `/team/candidates/:id` | page |
| 85.png | On and offboarding | `/team/onboarding` | page |
| 86.png | Lifecycle journey | `/team/onboarding/:id` | page |
| 87.png | Time and absence | `/team/time-absence` | page |
| 88.png | Record absence | `/team/time-absence/create` | modal |
| 89.png | Performance | `/team/performance` | page |
| 90.png | Performance review | `/team/performance/:id` | page |
| 91.png | Roles and access | `/team/roles` | page |
| 92.png | Role detail | `/team/roles/:id` | page |
| 93.png | System health | `/system-health` | page |
| 94.png | Workflow library | `/workflows` | page |
| 95.png | Workflow runner | `/workflows/suspend_organization` | details and impact |
| 96.png | Workflow result | `/workflows/runs/:id` | execution result |
| 310.png | Settings overview | `/settings` | page |
| 311.png | General | `/settings/general` | page |
| 312.png | Platform defaults | `/settings/general/defaults` | page |
| 313.png | Company | `/settings/company` | page |
| 314.png | Legal and contacts | `/settings/company/legal-contacts` | page |
| 315.png | Branding and domains | `/settings/branding` | page |
| 316.png | Brand identity | `/settings/branding/identity` | page |
| 317.png | Domain verification | `/settings/branding/domains` | page |
| 318.png | Roles and access | `/settings/roles` | page |
| 319.png | Permission policy | `/settings/roles/policies` | page |
| 320.png | Platform security | `/settings/security` | page |
| 321.png | Authentication and SSO | `/settings/security/authentication` | page |
| 322.png | Emergency and network access | `/settings/security/emergency` | page |
| 323.png | Notifications | `/settings/notifications` | page |
| 324.png | Alert policy | `/settings/notifications/alert-policy` | page |
| 325.png | Integrations and API | `/settings/integrations` | page |
| 326.png | Provider detail | `/settings/integrations/:provider` | page |
| 327.png | API keys and webhooks | `/settings/integrations/api-keys` | page |
| 328.png | Create API key | `/settings/integrations/api-keys/create` | page |
| 329.png | Kora defaults | `/settings/kora` | page |
| 330.png | Model routing and budgets | `/settings/kora/routing` | page |
| 331.png | Approval and data policy | `/settings/kora/approval-policy` | page |
| 332.png | Data and privacy | `/settings/data` | page |
| 333.png | Retention and residency | `/settings/data/retention` | page |
| 334.png | Privacy requests | `/settings/data/privacy-requests` | page |
| 335.png | Audit and compliance | `/settings/audit` | page |
| 336.png | Configuration changes | `/settings/audit/changes` | page |
| 337.png | Advanced | `/settings/advanced` | page |
| 338.png | Plans and feature access | `/settings/advanced/plans` | page |
| 339.png | Feature flags and rollouts | `/settings/advanced/feature-flags` | page |

Additional PDF scope: `/management/users`, `/profile`, read-only system service/incident records, internal Calendar API and independent approval enforcement.
