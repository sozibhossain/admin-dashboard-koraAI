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

const {SettingsPage}=require('../components/novya/settings.tsx');
const config={general:{platformName:'NOVYA',defaultLanguage:'en',timezone:'Europe/Berlin',dateFormat:'DD.MM.YYYY',currency:'EUR',maintenanceMode:false,announcements:true},company:{legalName:'Example Company',vatId:'DE123',address:'Berlin',country:'DE',contacts:[{label:'Legal',name:'Alex',email:'alex@example.test',phone:''}]},branding:{logo:{url:'',public_id:''},primaryColor:'#4F46E5',accentColor:'#8B5CF6',domains:[{_id:'domain-a',domain:'admin.example.test',verified:false,dnsRecords:[{type:'TXT',host:'_novya.admin.example.test',value:'novya-verify-fixture'}]}]},security:{mfaRequired:true,sessionTimeoutMinutes:60,passwordMinLength:10,ipAllowlist:[],emergencyAccess:{enabled:false,contacts:[]},loginAlerts:true},notifications:{channels:{email:true,push:true,slack:false,sms:false},alertPolicy:[{key:'security',label:'Security',severity:'critical',channels:['email'],enabled:true}]},kora:{assistantName:'Kora',tone:'Professional',language:'en',monthlyBudgetEur:3200,modelRoutes:[],policies:{perRequestBudgetEur:.6,fallbackEnabled:true,providerLogging:false},approval:{requireApprovalFor:['refund'],autoExecuteLowRisk:false},dataPolicy:{trainOnData:false,retainConversationsDays:365}},data:{retention:[{kind:'messages',days:365}],residency:'EU'},advanced:{featureFlags:[{key:'assistant',label:'Assistant rollout',enabled:false,rolloutPercent:25,environment:'development'}],resourceLimits:{storageGb:100}}};
const roles=[{_id:'role-a',name:'Operations Admin',description:'Admin access',isSystem:true,members:2,permissions:['team.read','settings.read']}];
const audit=[{_id:'audit-a',action:'Settings updated: general',actorName:'Alex Morgan',category:'config',entityName:'general',createdAt:'2026-10-11T08:00:00Z',before:{platformName:'Old name'},after:{platformName:'NOVYA'}}];
const provider={_id:'provider-a',provider:'whatsapp',name:'WhatsApp Business',status:'disconnected',category:'messaging',region:'EU',config:{capabilities:['messaging']},health:{latencyMs:20},failover:{enabled:false},connectedAt:null,lastSyncAt:null};
const request={_id:'privacy-a',request_code:'DSR-001',kind:'export',subjectName:'Sam Taylor',subjectRef:'customer-a',status:'received',dueAt:'2026-11-01T08:00:00Z',note:'Verify identity'};
function client(empty=false,error=false){const q=new QueryClient({defaultOptions:{queries:{staleTime:Infinity,retry:false,retryOnMount:false}}});const set=(key,data,meta)=>q.setQueryData(key,{data:empty&&Array.isArray(data)?[]:data,meta});
set(['novya','settings','all'],config);for(const section of Object.keys(config))set(['novya','settings',section],config[section]);
set(['novya','settings-roles'],roles,{total:1});set(['novya','team','roles','policy'],roles);
set(['novya','integrations',undefined],[provider]);set(['novya','integrations','whatsapp'],provider);
set(['novya','api-keys'],[{_id:'key-a',name:'Reporting key',prefix:'nvk_test',scopes:['overview.read'],status:'active'}],{total:1});set(['novya','webhooks'],[{_id:'hook-a',name:'Audit delivery',url:'https://example.test/events',events:['settings.updated'],status:'active'}],{total:1});
set(['novya','model-routing'],{routes:[{_id:'route-a',workload:'general_chat',route:'provider-route',model:'configured-model',region:'EU',status:'healthy'}],policies:config.kora.policies,budget:{monthlyEur:3200,estimatedUsedEur:2,usedPct:1,estimate:true}});
set(['novya','settings-privacy-list','','',1],[request],{total:1,pages:1});set(['novya','settings-privacy','privacy-a'],request);
set(['novya','settings','compliance'],{privacy:{open:1,overdue:0},controls:{activeApiKeys:1,mfaRequired:true},auditEvents30d:[{_id:'config',n:1}]});
set(['novya','settings-audit',undefined,'','',1],audit,{total:1,pages:1});set(['novya','settings-audit','audit-a','','',1],audit[0]);
set(['novya','settings-plans'],{plans:empty?[]:[{_id:'plan-a',name:'Starter',slug:'starter',monthlyPrice:25,currency:'EUR',orgs:1,limits:{storageGb:10},features:['assistant']}],upcomingRenewals:[]});
if(error){const query=q.getQueryCache().find({queryKey:['novya','settings','general']});query.setState({status:'error',error:new Error('Fixture failure'),data:undefined});}
return q;}
function render(parts,options={}){const q=client(options.empty,options.error);try{return renderToStaticMarkup(React.createElement(QueryClientProvider,{client:q},React.createElement(SettingsPage,{parts})));}finally{q.clear();}}
const screens=[
[310,[],'Admin Settings'],[311,['general'],'General'],[312,['general','defaults'],'Platform Defaults'],[313,['company'],'Company'],[314,['company','legal-contacts'],'Legal & Contacts'],[315,['branding'],'Branding & Domains'],[316,['branding','identity'],'Brand Identity'],[317,['branding','domains'],'Domain Verification'],[318,['roles'],'Roles & Access'],[319,['roles','policies'],'Permission Policies'],[320,['security'],'Platform Security'],[321,['security','authentication'],'Authentication & SSO'],[322,['security','emergency'],'Emergency & Network Access'],[323,['notifications'],'Notifications'],[324,['notifications','alert-policy'],'Alert Policy'],[325,['integrations'],'Integrations & API'],[326,['integrations','whatsapp'],'WhatsApp Business'],[327,['integrations','api-keys'],'API Keys & Webhooks'],[328,['integrations','api-keys','create'],'Create API Key'],[329,['kora'],'Kora & AI Defaults'],[330,['kora','routing'],'Model Routing & Budgets'],[331,['kora','approval-policy'],'Approval & Data Policy'],[332,['data'],'Data & Privacy'],[333,['data','retention'],'Retention & Residency'],[334,['data','privacy-requests'],'Privacy Requests'],[335,['audit'],'Audit & Compliance'],[336,['audit','changes'],'Configuration Changes'],[337,['advanced'],'Advanced'],[338,['advanced','plans'],'Plans & Feature Access'],[339,['advanced','feature-flags'],'Feature Flags & Rollouts']];
for(const [ref,parts,title] of screens){const html=render(parts);assert.ok(html.includes(title.replaceAll('&','&amp;')),ref+': title missing');assert.ok(html.includes('st-page'));assert.ok(!html.includes('Unable to load this page'),ref+': query failure');assert.ok(!html.includes('Loading current data'),ref+': fixture/query mismatch');console.log('PASS '+ref+' '+parts.join('/'));}
let html=render(['branding','domains']);assert.ok(html.includes('_novya.admin.example.test'));assert.ok(html.includes('Check DNS'));assert.ok(html.includes('Remove domain'));
html=render(['audit','changes']);assert.ok(html.includes('Alex Morgan'));assert.ok(html.includes('Old name'));assert.ok(html.includes('Previous configuration'));
html=render(['data','privacy-requests','privacy-a']);assert.ok(html.includes('Save decision'));assert.ok(html.includes('Verify identity'));
html=render(['kora','approval-policy']);assert.match(html,/disabled=""[^>]*aria-label="Train on customer data"|aria-label="Train on customer data"[^>]*disabled=""/);
html=render(['advanced','feature-flags']);assert.ok(html.includes('max="100"'));assert.ok(html.includes('value="25"'));
for(const parts of [['integrations'],['roles'],['audit','changes'],['advanced','plans']])assert.ok(render(parts,{empty:true}).includes('No '));
assert.ok(render(['general'],{error:true}).includes('Fixture failure'));
const originalState=React.useState;let first=true;React.useState=(initial)=>{if(first&&initial===0){first=false;return originalState(1);}return originalState(initial);};try{html=render(['integrations','api-keys','create']);assert.ok(html.includes('Choose Scopes'));assert.ok(html.includes('Read platform overview'));}finally{React.useState=originalState;}
console.log('PASS all 30 Settings references, API wizard scopes, data, permissions, DNS, audit evidence, empty and error states. No database writes.');
