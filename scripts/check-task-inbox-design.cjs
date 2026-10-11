/* eslint-disable @typescript-eslint/no-require-imports -- This offline CommonJS harness installs a TypeScript require hook. */
/* Offline render checks: fixtures never contact the backend or change user data. */
const fs = require('node:fs');
const path = require('node:path');
const Module = require('node:module');
const assert = require('node:assert/strict');
const ts = require('typescript');
const root = path.resolve(__dirname, '..');
const resolve = Module._resolveFilename;
Module._resolveFilename = function (request, parent, ...rest) {
  return resolve.call(this, request.startsWith('@/') ? path.join(root, request.slice(2)) : request, parent, ...rest);
};
for (const extension of ['.ts', '.tsx']) {
  Module._extensions[extension] = (module, filename) => {
    const output = ts.transpileModule(fs.readFileSync(filename, 'utf8'), {
      compilerOptions: { module: ts.ModuleKind.CommonJS, jsx: ts.JsxEmit.ReactJSX, target: ts.ScriptTarget.ES2020, esModuleInterop: true },
      fileName: filename,
    });
    module._compile(output.outputText, filename);
  };
}
Module._extensions['.css'] = () => {};
let currentPath = '/tasks';
let renderEmail = false;
const React = require('react');
const load = Module._load;
Module._load = function (request, ...args) {
  if (request === 'next/navigation') return {
    useRouter: () => ({ push() {}, replace() {}, refresh() {} }),
    usePathname: () => currentPath,
    useSearchParams: () => new URLSearchParams(),
  };
  if (request === 'next-auth/react') return {
    useSession: () => ({ data: { user: { _id: 'member-a', name: 'Alex', email: 'alex@example.test' } }, status: 'authenticated' }),
    getSession: async () => null,
  };
  if (request === 'react' && renderEmail) return { ...React, useState: initial => React.useState(initial === 'chat' ? 'email' : initial) };
  return load.call(this, request, ...args);
};
const { renderToStaticMarkup } = require('react-dom/server');
const { QueryClient, QueryClientProvider } = require('@tanstack/react-query');
const { TasksPage } = require('../components/novya/tasks.tsx');
const { InboxWorkspace } = require('../components/inbox-workspace.tsx');
const { dateKey } = require('../components/novya/task-ui.tsx');
const day = dateKey(new Date().toISOString());
const dueDate = new Date(`${day}T12:00:00`).toISOString();
const task = { _id: 'task-a', title: 'Review platform billing', description: 'Review this month’s usage.', status: 'in_progress', priority: 'high', source: 'manual', dueDate, assignee_id: { _id: 'member-a', name: 'Alex', email: 'alex@example.test' }, subtasks: [{ title: 'Check usage', done: false }], links: [{ ref: 'https://example.test/document.pdf', label: 'Billing document' }], comments: [] };
const team = { byAssignee: { 'member-a': [task], 'member-b': [{ ...task, _id: 'task-b', title: 'Other member task' }] }, members: [{ user_id: 'member-a', name: 'Alex', title: 'Team lead' }, { user_id: 'member-b', name: 'Morgan', title: 'Team lead' }], workload: [] };
function client() {
  const q = new QueryClient({ defaultOptions: { queries: { staleTime: Infinity, retry: false } } });
  q.setQueryData(['novya', 'tasks', 'mine', 1, 'Today'], { data: [task], meta: { counts: { in_progress: 1 }, dueToday: 1, overdue: 0, pages: 1 } });
  q.setQueryData(['novya', 'tasks', 'task-a'], { data: task });
  q.setQueryData(['novya', 'tasks', 'team', 0, 'leaders', ''], { data: team });
  q.setQueryData(['novya', 'tasks', 'team', 'day', 'member-a', day], { data: team });
  q.setQueryData(['novya', 'team', 'departments', 'task-filter'], { data: [] });
  q.setQueryData(['novya', '/team/assignees', 'lookup'], { data: [{ _id: 'member-a', name: 'Alex' }] });
  q.setQueryData(['inbox-conversations'], { data: [{ _id: 'chat-a', participants: [{ _id: 'member-a', name: 'Alex' }, { _id: 'member-b', name: 'Morgan', email: 'morgan@example.test' }], lastMessage: 'Ready for review' }] });
  q.setQueryData(['inbox-conversation', 'chat-a'], { data: { messages: [{ _id: 'message-a', content: 'Ready for review', sender_id: 'member-b', sentAt: dueDate, isRead: true }] } });
  q.setQueryData(['mail-list', 'inbox', '', 1], { data: { mails: [{ _id: 'mail-a', subject: 'Enterprise onboarding documents', body: 'Please review the onboarding documents.', from: { name: 'Morgan', email: 'morgan@example.test' }, toEmails: ['alex@example.test'], createdAt: dueDate, attachments: [{ fileName: 'Implementation.pdf', url: 'https://example.test/document.pdf' }] }], pagination: { total: 1, totalPages: 1 } } });
  return q;
}
function render(element) {
  const q = client();
  try { return renderToStaticMarkup(React.createElement(QueryClientProvider, { client: q }, element)); }
  finally { q.clear(); }
}
function check(label, parts, expected) {
  currentPath = '/tasks/' + parts.join('/');
  const html = render(React.createElement(TasksPage, { parts }));
  for (const text of expected) assert.ok(html.includes(text), `${label}: missing ${text}`);
  console.log(`PASS ${label}`);
  return html;
}
check('37 My Tasks: task, filters and Kora sidebar', [], ['My Tasks', 'Review platform billing', 'Upcoming', 'Completed', 'Task sources']);
check('38 Task Detail: checklist and attachment link', ['task-a'], ['Task Detail', 'Check usage', 'Billing document', 'Mark complete']);
check('39 Create task: editable form and preview', ['create'], ['Create &amp; assign task', 'Task Preview', 'Add checklist item', 'Create with Kora']);
const grid = check('40 Team Tasks: seven day grid', ['team'], ['Team Tasks', 'Alex', 'Morgan', 'Department filter']);
assert.equal((grid.match(/class="tk-day-cell /g) || []).length, 14, 'Both members must have seven clickable day cells');
const detail = check('41 Team Day Detail: isolates selected member', ['team', 'member-a', day], ['Alex', 'Review platform billing', 'Leader &amp; day']);
assert.ok(!detail.includes('Other member task'), 'Member day must not expose another member’s task');
check('Invalid team day: safe empty state', ['team', 'member-a', 'invalid'], ['Invalid task date']);
const props = { dashboardKey: 'design-check', subtitle: 'Internal team conversations', recipientSearchPlaceholder: 'Search team members', emptyConversationText: 'No conversations', taskHref: '/tasks/create' };
currentPath = '/inbox';
let html = render(React.createElement(InboxWorkspace, props));
for (const text of ['ib-conversations', 'ib-thread', 'ib-contact', 'Ready for review', 'Message']) assert.ok(html.includes(text), `Chat: missing ${text}`);
console.log('PASS 42 Inbox: three independent panels and message composer');
renderEmail = true;
// Recompile the component with the email initial-state fixture.
delete require.cache[require.resolve('../components/inbox-workspace.tsx')];
const { InboxWorkspace: EmailWorkspace } = require('../components/inbox-workspace.tsx');
html = render(React.createElement(EmailWorkspace, props));
for (const text of ['ib-mail-folders', 'ib-mail-list', 'ib-mail-reader', 'Enterprise onboarding documents', 'Implementation.pdf', 'Forward']) assert.ok(html.includes(text), `Email: missing ${text}`);
console.log('PASS 43 Email: folders, list, reader, attachments and reply actions');
console.log('All seven reference screens passed offline render checks. Browser visual QA is separate.');
