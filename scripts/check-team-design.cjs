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
const React=require('react');
const load=Module._load;
let searchParams=new URLSearchParams();
Module._load=function(request,...args) {
  if(request==='next/navigation')return {useRouter:()=>({push(){},replace(){},refresh(){}}),useSearchParams:()=>searchParams,usePathname:()=>'/team'};
  if(request==='next-auth/react')return {useSession:()=>({data:{user:{_id:'account-a',name:'Alex'}}}),getSession:async()=>null};
  return load.call(this,request,...args);
};
const {renderToStaticMarkup}=require('react-dom/server');
const {QueryClient,QueryClientProvider}=require('@tanstack/react-query');
const {TeamWorkspace}=require('../components/novya/team-workspace.tsx');
const {TeamFormBody,absenceBody}=require('../components/novya/team-forms.tsx');
const {MemberPanels}=require('../components/novya/team-member-record.tsx');
const {teamPercent}=require('../components/novya/team-ui.tsx');
const member={_id:'member-a',name:'Alex Morgan',email:'alex@example.test',title:'Operations Admin',member_code:'NOV-001',status:'active',user_id:'account-a',department_id:{_id:'dept-a',name:'Operations'},role_id:{_id:'role-a',name:'Support Lead',permissions:['team.read','tasks.write']},manager_id:{_id:'member-b',name:'Nora'},employment:{startDate:'2026-08-01',contractType:'permanent',weeklyHours:40,workModel:'Remote',location:'Berlin',nextReviewAt:'2026-12-01',history:[{title:'Promotion',date:'2026-09-01'}]},compensation:{salary:58000,currency:'EUR',bonusTarget:10,payFrequency:'monthly',history:[{reason:'Annual adjustment',from:'2026-09-01'}]},access:{systems:['Inbox','Calendar'],twoFactor:true},documents:[{name:'Employment agreement',type:'employment',url:'https://example.test/contract.pdf',status:'signed'}],equipment:[{item:'Laptop',serial:'L-001'}],skills:['Operations'],lifecycle:[{stage:'Invited',date:'2026-08-01'},{stage:'Role updated',date:'2026-09-01'}],recentTimeOff:[{_id:'absence-a',type:'vacation',startDate:'2027-01-01',endDate:'2027-01-03',days:3,status:'approved'}],recentReviews:[{_id:'review-a',period:'Q3 2026',rating:4.4,status:'draft',goals:[{title:'Reduce onboarding time',progress:80,status:'on_track'}],feedback:[{from:'Nora',text:'Strong delivery',at:'2026-08-19'}]}]};
const dept={_id:'dept-a',name:'Operations',description:'Customer operations',members:1,lead_id:{_id:'member-a',name:'Alex Morgan'},budget:20000};
const role={_id:'role-a',name:'Support Lead',description:'Support ownership',permissions:['team.read','tasks.write'],members:1,isSystem:true,level:2};
const job={_id:'job-a',title:'Platform Engineer',department_id:dept,status:'open',location:'Remote'};
const candidate={_id:'candidate-a',name:'Emilia Hartmann',email:'emilia@example.test',job_id:job,stage:'screen',score:4,source:'Referral',aiSummary:'Strong systems profile',interviews:[{interviewer:'Nora',kind:'Technical',at:'2026-08-19',feedback:'Clear reasoning',score:4}],notes:[{by:'Alex',text:'Proceed to interview',at:'2026-08-19'}]};
const journey={_id:'journey-a',member_id:member,kind:'onboarding',status:'in_progress',progress:50,tasks:[{_id:'step-a',label:'Employment record',owner:'HR',done:true},{_id:'step-b',label:'Set up accounts',owner:'IT',done:false,dueDate:'2027-01-01'}]};
const review={...member.recentReviews[0],member_id:member,strengths:'Strong ownership',improvements:'Delegate follow-ups'};
function client(empty=false) {
 const q=new QueryClient({defaultOptions:{queries:{staleTime:Infinity,retry:false}}});
 const set=(endpoint,params,data,meta)=>q.setQueryData(['novya','team-design',endpoint,params],{data:empty&&Array.isArray(data)?[]:data,meta});
 const meta={total:1,pages:1};
 set('/team/overview',{}, {headcount:{active:1,invited:1,on_leave:0},openRoles:1,candidatesInPipeline:1,pendingTimeOff:0,reviewsDueIn30Days:1});
 set('/team/departments',{},[dept]);set('/team/roles',{},[role]);
 set('/team/members',{limit:100},[member]);
 set('/team/members',{q:'',department_id:undefined,status:undefined,page:1,limit:20,sortBy:'createdAt',sortDir:'desc'},[member],meta);
 set('/team/members',{q:'',department_id:'dept-a',status:undefined,page:1,limit:20,sortBy:'createdAt',sortDir:'desc'},[member],meta);
 set('/team/members',{status:'invited',limit:10},[{...member,_id:'invited-a',name:'Sophie Wagner',status:'invited'}],meta);
 set('/team/jobs',{status:'open',limit:100},[job],meta);
 set('/team/recruiting/board',{job_id:undefined},{applied:[],screen:[candidate],interview:[],offer:[],hired:[],rejected:[]});
 set('/team/onboarding/overview',{}, {onboarding:1,offboarding:0,completed:0,overdueSteps:0,attention:[]});
 set('/team/onboarding',{kind:undefined,page:1,limit:20},[journey],meta);
 set('/team/members',{q:'',department_id:undefined,page:1,limit:20},[member],meta);
 const now=new Date(),from=new Date(now.getFullYear(),now.getMonth(),1).toISOString(),to=new Date(now.getFullYear(),now.getMonth()+1,0,23,59,59).toISOString();
 set('/team/time-off/calendar',{from,to},[{...member.recentTimeOff[0],member_id:member}],meta);
 set('/team/performance',{}, {averageRating:4.4,distribution:[{_id:4,n:1}],reviewsDue:[member]});
 set('/team/reviews',{status:undefined,page:1,limit:20},[review],meta);
 for(const [endpoint,value] of [['departments/dept-a',dept],['candidates/candidate-a',candidate],['onboarding/journey-a',journey],['reviews/review-a',review],['roles/role-a',role]])set('/team/'+endpoint,{},value);
 q.setQueryData(['novya','team-design','member','member-a'],{data:member});
 q.setQueryData(['novya','team-design','department-members','dept-a',1],{data:empty?[]:[member],meta});
 q.setQueryData(['novya','team-design','role-members','role-a'],{data:empty?[]:[member]});
 for(const [endpoint,value] of [['/team/members',[member]],['/team/departments',[dept]],['/team/roles',[role]]])q.setQueryData(['novya',endpoint,'lookup'],{data:value});
 return q;
}
function render(element,empty=false) {const q=client(empty);try{return renderToStaticMarkup(React.createElement(QueryClientProvider,{client:q},element));}finally{q.clear();}}
let total=0;
function screen(number,parts,expected) {const html=render(React.createElement(TeamWorkspace,{parts}));for(const value of expected)assert.ok(html.includes(value),number+': missing '+value);assert.ok(!html.includes('Unable to load this page'));console.log('PASS '+number+' '+parts.join('/'));total++;return html;}
screen(69,[],['Organization map','People movement','Team focus','Operations']);
screen(70,['members'],['Team directory','Pending invitations','Alex Morgan','Sophie Wagner']);
const tabs=['overview','employment','team-role','access','time-absence','performance','compensation','documents','activity'];
const titles=['Employment','Employment details','Current assignment','Access summary','Leave overview','Review cycle','Compensation summary','Document overview','Activity summary'];
for(let i=0;i<tabs.length;i++){const html=screen(71+i,['members','member-a',tabs[i]],[titles[i],'Alex Morgan']);assert.equal((html.match(/aria-current="page"/g)||[]).length,1,'Exactly one member tab must be selected');}
function form(number,kind,expected) {const html=render(React.createElement(TeamFormBody,{kind,onClose(){}}));for(const value of expected)assert.ok(html.includes(value));console.log('PASS '+number+' '+kind+' popup form');total++;}
form(80,'invite',['Full name','Work email','Initial access','Send invitation']);
screen(81,['departments'],['Organization Structure','Teams &amp; ownership','Ownership &amp; Changes']);
screen(82,['departments','dept-a'],['Department overview','Teams &amp; ownership','20,000']);
screen(83,['recruiting'],['Hiring Pipeline','Open Roles','Hiring Attention','Screening']);
screen(84,['candidates','candidate-a'],['Candidate profile','Contact','Evaluation &amp; interview plan','Strong systems profile']);
screen(85,['onboarding'],['Lifecycle status','Active journeys','Journey attention']);
const journeyHtml=screen(86,['onboarding','journey-a'],['Journey checklist','Journey details','Set up accounts']);
assert.equal((journeyHtml.match(/type="checkbox"/g)||[]).length,2);
screen(87,['time-absence'],['Team calendar','Availability','Upcoming absences']);
form(88,'absence',['Member','Absence type','Record as approved absence','Save absence']);
screen(89,['performance'],['Active Reviews','Review Queue','Review Progress','Goals &amp; Development']);
screen(90,['performance','review-a'],['Review summary','Goals &amp; outcomes','Feedback &amp; decision','Submit review']);
screen(91,['roles'],['Role Directory','Access Review','Access Posture','Security &amp; Audit']);
screen(92,['roles','role-a'],['Role posture','Permissions','Assignments','tasks.write']);
assert.equal(total,24);
const restricted={...member};delete restricted.compensation;
let html=render(React.createElement(MemberPanels,{id:'member-a',tab:'compensation',record:restricted}));
assert.ok(html.includes('Compensation access is restricted'));assert.ok(!html.includes('58,000'));console.log('PASS restricted compensation has no salary');
assert.throws(()=>absenceBody({member_id:'member-a',startDate:'2026-08-20',endDate:'2026-08-19'}));
assert.throws(()=>absenceBody({member_id:'member-a',startDate:'bad',endDate:'bad'}));
assert.equal(absenceBody({member_id:'member-a',startDate:'2026-08-19',endDate:'2026-08-19'}).record,true);
assert.equal(absenceBody({member_id:'member-a',startDate:'2026-08-19',endDate:'2026-08-19',record:false}).record,false);
assert.equal(teamPercent(300),100);assert.equal(teamPercent(-5),0);assert.equal(teamPercent('bad'),0);
console.log('PASS absence date validation, approval flag and progress clamping');
searchParams=new URLSearchParams('department=dept-a');html=render(React.createElement(TeamWorkspace,{parts:['members']}));assert.ok(html.includes('Alex Morgan'));console.log('PASS department-linked Members query');searchParams=new URLSearchParams();
for(const parts of [['members'],['departments'],['roles']]) {html=render(React.createElement(TeamWorkspace,{parts}),true);assert.ok(html.includes('No matching records')||html.includes('No departments created')||html.includes('No access roles'));}
console.log('PASS empty directories');
for(const tab of ['interviews','evaluation','documents','activity']) {html=render(React.createElement(TeamWorkspace,{parts:['candidates','candidate-a',tab]}));assert.ok(html.includes('Emilia Hartmann'));assert.equal((html.match(/aria-current="page"/g)||[]).length,1);}
console.log('PASS all Candidate tab routes');
console.log('All 24 Team reference screens passed offline render checks. Browser visual QA is separate.');
