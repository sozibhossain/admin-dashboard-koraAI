const fs = require('node:fs');
const path = require('node:path');
const root = path.resolve(__dirname, '..');
const references = path.join(root, 'New Admin Dashboard', 'New Admin Dashboard');
const entries = [];
function add(start, lines) {
  lines.trim().split('\n').forEach((line, index) => {
    const [name, route, state = 'page'] = line.split('|');
    entries.push({ reference: start + index, name, route, state });
  });
}
add(1, `Command Center|/dashboard
Kora new chat|/kora
Kora working conversation|/kora/conversations/:id|working
Kora action preview|/kora/conversations/:id|action preview
Kora action result|/kora/conversations/:id|action result
Folders|/kora/folders
Conversation context|/kora/conversations/:id
Folder detail|/kora/folders/:id
Create folder|/kora/folders/create|modal
Move conversation|/kora/conversations/:id|folder selector
Investigations|/kora/investigations
Investigation detail|/kora/investigations/:id
Cases|/kora/cases
Actions|/kora/actions
Kora Brain|/kora/brain
Knowledge|/kora/knowledge
Knowledge detail|/kora/knowledge/:id
Add knowledge|/kora/knowledge/create|drawer
Import source|/kora/sources
History|/kora/history
Live overview|/live-view
All conversations|/live-view/conversations
Conversation detail|/live-view/conversations/:id
Channel overview|/live-view/channels
Channel detail|/live-view/channels/whatsapp
Live call|/live-view/conversations/:id|call
Intervention|/live-view/conversations/:id|review and confirm
Organization locations|/live-view/organizations/:id
Approvals overview|/approvals
All approvals|/approvals/all
Approval detail|/approvals/:id
Create approval|/approvals/create
Approval result|/approvals/:id|execution result
Create launcher|/approvals|plus launcher
Ask Kora voice|/approvals|voice dialog
Chat Kora|/approvals|chat drawer
My tasks|/tasks
Task detail|/tasks/:id
Create and assign|/tasks/create
Team tasks|/tasks/team
Team day detail|/tasks/team|day selection
Internal chat|/inbox|chat tab
Email|/inbox|email tab
Calendar week|/calendar
Create launcher|/calendar|plus launcher
Ask Kora voice|/calendar|voice dialog
Chat Kora|/calendar|chat drawer
Management overview|/management
Organizations|/management/organizations
Organization record|/management/organizations/:id
Create organization|/management/organizations/create|five steps
Edit organization|/management/organizations/:id/edit
Organization members|/management/organizations/:id/members
Organization billing|/management/organizations/:id/plan-billing
Organization integrations|/management/organizations/:id/integrations
Organization health|/management/organizations/:id/health
Organization contracts|/management/organizations/:id/contracts
Customers|/management/customers
Customer record|/management/customers/:id
Add customer|/management/customers/create|modal
Customer appointments|/management/customers/:id/appointments
Customer documents|/management/customers/:id/documents
Customer payments|/management/customers/:id/payments
Customer notes|/management/customers/:id/notes
Edit customer|/management/customers/:id/edit|modal
Health and risk|/management/health-risk
Plans and billing|/management/plans-billing
Management activity|/management/activity
Team overview|/team
Members|/team/members
Member record|/team/members/:id
Employment|/team/members/:id/employment
Team and role|/team/members/:id/team-role
Member access|/team/members/:id/access
Member absence|/team/members/:id/time-absence
Member performance|/team/members/:id/performance
Compensation|/team/members/:id/compensation
Member documents|/team/members/:id/documents
Member activity|/team/members/:id/activity
Invite member|/team/members/create|modal
Departments|/team/departments
Department detail|/team/departments/:id
Recruiting|/team/recruiting
Candidate detail|/team/candidates/:id
On and offboarding|/team/onboarding
Lifecycle journey|/team/onboarding/:id
Time and absence|/team/time-absence
Record absence|/team/time-absence/create|modal
Performance|/team/performance
Performance review|/team/performance/:id
Roles and access|/team/roles
Role detail|/team/roles/:id
System health|/system-health
Workflow library|/workflows
Workflow runner|/workflows/suspend_organization|details and impact
Workflow result|/workflows/runs/:id|execution result`);
add(310, `Settings overview|/settings
General|/settings/general
Platform defaults|/settings/general/defaults
Company|/settings/company
Legal and contacts|/settings/company/legal-contacts
Branding and domains|/settings/branding
Brand identity|/settings/branding/identity
Domain verification|/settings/branding/domains
Roles and access|/settings/roles
Permission policy|/settings/roles/policies
Platform security|/settings/security
Authentication and SSO|/settings/security/authentication
Emergency and network access|/settings/security/emergency
Notifications|/settings/notifications
Alert policy|/settings/notifications/alert-policy
Integrations and API|/settings/integrations
Provider detail|/settings/integrations/:provider
API keys and webhooks|/settings/integrations/api-keys
Create API key|/settings/integrations/api-keys/create
Kora defaults|/settings/kora
Model routing and budgets|/settings/kora/routing
Approval and data policy|/settings/kora/approval-policy
Data and privacy|/settings/data
Retention and residency|/settings/data/retention
Privacy requests|/settings/data/privacy-requests
Audit and compliance|/settings/audit
Configuration changes|/settings/audit/changes
Advanced|/settings/advanced
Plans and feature access|/settings/advanced/plans
Feature flags and rollouts|/settings/advanced/feature-flags`);
const expected = [...Array.from({ length: 96 }, (_, i) => i + 1), ...Array.from({ length: 30 }, (_, i) => i + 310)];
if (entries.length !== 126 || entries.some((e, i) => e.reference !== expected[i])) throw new Error('Reference mapping must cover exactly 1–96 and 310–339.');
const missing = entries.filter(e => !fs.existsSync(path.join(references, `${e.reference}.png`)));
if (missing.length) throw new Error(`Missing design files: ${missing.map(e => e.reference).join(', ')}`);
fs.mkdirSync(path.join(root, 'docs'), { recursive: true });
fs.writeFileSync(path.join(root, 'docs', 'novya-design-coverage.json'), JSON.stringify(entries, null, 2) + '\n');
const lines = ['# NOVYA admin design coverage', '', 'Scope: references **1–96 and 310–339 (126 screens/states)**. Workspace (97–309) and App are excluded. Record routes use actual database IDs.', '', 'This is a route/state inventory, not a claim of pixel-perfect completion. Authenticated browser and responsive checks are recorded in [the dated audit](NOVYA-AUDIT-2026-10-07.md). Populated-state visual acceptance and live action integration QA remain outstanding. Some operational workflows create approved operator tasks rather than performing external provider changes. SSO configuration is not an installed SSO provider; Scoped API keys authenticate the read-only overview and system-health machine API. External provider automation still requires integration setup.', '', '| Reference | Screen | Route | State |', '| --- | --- | --- | --- |', ...entries.map(e => `| ${e.reference}.png | ${e.name} | \`${e.route}\` | ${e.state} |`), '', 'Additional PDF scope: `/management/users`, `/profile`, read-only system service/incident records, internal Calendar API and independent approval enforcement.', ''];
fs.writeFileSync(path.join(root, 'docs', 'NOVYA-DESIGN-COVERAGE.md'), lines.join('\n'));
console.log(`Verified ${entries.length} reference files and wrote the route/state inventory.`);
