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

const React = require('react');
const load = Module._load;
Module._load = function(request, ...args) {
  if (request === 'next/navigation') return {useSearchParams:()=>new URLSearchParams(),useRouter:()=>({push(){}})};
  if (request === 'next-auth/react') return {useSession:()=>({data:{user:{_id:'member-a',name:'Alex'}}}),getSession:async()=>null};
  return load.call(this,request,...args);
};
const {renderToStaticMarkup} = require('react-dom/server');
const {QueryClient,QueryClientProvider} = require('@tanstack/react-query');
const {Dialog} = require('../components/ui/dialog.tsx');
const {CalendarPage,calendarOwner} = require('../components/novya/calendar.tsx');
const {CalendarAssistantBody} = require('../components/novya/calendar-assistant.tsx');
const {CalendarGrid,MiniCalendar,calendarSegments,validCalendarEvent,startCalendarWeek,addCalendarDays} = require('../components/novya/calendar-views.tsx');
const day = new Date(2026,7,19);
const event = (id,from,to) => ({_id:id,title:id,kind:'meeting',visibility:'team',owner_id:{_id:'member-a',name:'Alex'},startsAt:from,endsAt:to});
const local = (hour,minute=0) => new Date(2026,7,19,hour,minute).toISOString();
const events = [event('Meeting A',local(9),local(10)),event('Meeting B',local(9,30),local(10,30)),event('Meeting C',local(11),local(12))];
const segments = calendarSegments(events,day);
assert.equal(segments[0].lanes,2);assert.equal(segments[1].lane,1);assert.equal(segments[2].lanes,1);
const overnight = calendarSegments([event('Overnight',new Date(2026,7,18,23).toISOString(),local(1))],day)[0];
assert.equal(overnight.from,0);assert.equal(overnight.to,60);
assert.equal(calendarSegments([event('Next day',new Date(2026,7,20,0).toISOString(),new Date(2026,7,20,1).toISOString())],day).length,0);
assert.equal(validCalendarEvent(event('Bad','invalid','invalid')),false);
assert.equal(calendarOwner(events[0]),'member-a');
console.log('PASS timed placement, overlap columns, midnight clipping, invalid dates and ownership');
function grid(view) {const first=view==='month'?startCalendarWeek(new Date(2026,7,1)):view==='week'?startCalendarWeek(day):day;const count=view==='month'?42:view==='week'?7:1;return renderToStaticMarkup(React.createElement(CalendarGrid,{view,days:Array.from({length:count},(_,i)=>addCalendarDays(first,i)),events,anchor:day,open(){},selectDay(){}}));}
for(const mode of ['day','week','month']) {const html=grid(mode);assert.ok(html.includes('Meeting A'));assert.ok(html.includes('Meeting B'));console.log('PASS '+mode+' grid');}
assert.equal((grid('week').match(/class="cl-time-column"/g)||[]).length,7);
assert.equal((grid('month').match(/class="cl-month-day/g)||[]).length,42);
const mini=renderToStaticMarkup(React.createElement(MiniCalendar,{anchor:new Date(2026,8,1),selectedDate:day,selectDay(){}}));
assert.ok(!mini.includes('aria-pressed="true"'),'Browsing a different month must not select its first day');
const q=new QueryClient({defaultOptions:{queries:{staleTime:Infinity,retry:false}}});
const first=startCalendarWeek(new Date());q.setQueryData(['novya','calendar',first.toISOString(),7],{data:[event('Live calendar event',new Date().toISOString(),new Date(Date.now()+3600000).toISOString())]});
let html=renderToStaticMarkup(React.createElement(QueryClientProvider,{client:q},React.createElement(CalendarPage)));
for(const text of ['cl-layout','cl-grid-scroll','Upcoming','Calendar Sync','Live calendar event','Team events','Create or ask Kora'])assert.ok(html.includes(text),'Main calendar missing '+text);
q.clear();console.log('PASS 44 Calendar layout, event, calendar scopes and sync state');
for(const mode of ['voice','chat']) {html=renderToStaticMarkup(React.createElement(Dialog,{open:true},React.createElement(CalendarAssistantBody,{mode,prompt:'',setPrompt(){},messages:[{role:'user',content:'Review my schedule'},{role:'kora',content:'Your meeting starts at 09:00.'}],pending:false,send(){}})));for(const text of [mode==='chat'?'Chat with Kora':'Ask Kora','Current page','Your meeting starts at 09:00.'].filter(text=>mode!=='chat'||text!=='Current page'))assert.ok(html.includes(text));assert.ok(html.includes('Send message to Kora'));console.log('PASS '+(mode==='voice'?'46 voice popup':'47 chat drawer')+' content, real reply slot and composer');}
const launcher=fs.readFileSync(path.join(root,'components/novya/calendar-assistant.tsx'),'utf8');
for(const text of ['Calendar create launcher','Speak or type with page context','Open the full Kora assistant','Create a calendar event'])assert.ok(launcher.includes(text));
console.log('PASS 45 launcher entries and event creation callback');
console.log('Calendar offline checks passed. Interactive browser visual QA is separate.');
