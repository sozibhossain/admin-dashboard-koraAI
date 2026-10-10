"use client";
import { DashboardSelect } from "@/components/ui/dashboard-select";
import { Suspense, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus, ArrowLeft, ArrowUpRight, Check, Sparkles, ShieldCheck } from "lucide-react";
import { toast } from "sonner";
import { novya, display, rowsOf, errorMessage, RecordData } from "@/lib/novya";
import { Field, Resource } from "@/lib/novya-pages";
import { PageHeading, Panel, DataTable, SearchField, QueryState, Badge, Empty } from "./primitives";
import { RecordSummary, RecordContext } from "./record-summary";
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { CustomerDocumentUpload } from "./document-upload";
import { RecordSectionEditor } from "./record-section-editor";
import { DepartmentDetail,PerformanceDetail } from "./team-detail";
import { StaffActions } from "./staff-actions";
import { RecordActions } from "./record-actions";
import { OrganizationActions } from "./organization-actions";
import { ApprovalHelp } from "./approval-help";
import { StaffRecordTab,CandidateInterviews } from "./team-record-panels";
import { OrganizationSection } from "./organization-section";
import { TenantAccessPanel } from "./tenant-access";
import { KoraFolders } from "./kora-folders";
import { useGrantValidity } from "./use-grant-validity";
function LookupField({ field, value, onChange }: {
    field: Field;
    value: unknown;
    onChange: (v: unknown) => void;
}) {
    const query = useQuery({ queryKey: ["novya", field.endpoint, "lookup"], queryFn: () => novya.get(field.endpoint!, { limit: 200 }) });
    return <label className="nv-field"><span>{field.label}{field.required ? " *" : ""}</span><DashboardSelect className="nv-input" required={field.required} value={String(value && typeof value==="object"?(value as RecordData)._id:value??"")} onChange={e => onChange(e.target.value)}><option value="">{query.isPending ? "Loading…" : "Select…"}</option>{rowsOf(query.data?.data).map(r => <option key={String(r._id)} value={String(r._id)}>{display(r.name ?? r.title)}{r.email ? ` · ${r.email}` : ""}</option>)}</DashboardSelect>{query.error && <small className="nv-error-text">{errorMessage(query.error)}</small>}</label>;
}
export function FormField({ field, value, onChange }: {
    field: Field;
    value: unknown;
    onChange: (v: unknown) => void;
}) {
    if (field.endpoint)
        return <LookupField field={field} value={value} onChange={onChange}/>;
    if (field.type === "boolean") return <label className="nv-switch-row"><div><strong>{field.label}</strong></div><input type="checkbox" checked={!!value} onChange={e=>onChange(e.target.checked)}/></label>;
    const props = { className: "nv-input", required: field.required, value: field.type==="date" && value ? String(value).slice(0,10) : field.type==="datetime-local" && value ? String(value).slice(0,16) : Array.isArray(value) ? value.join("\n") : String(value ?? ""), onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => onChange(field.type === "number" ? (e.target.value === "" ? "" : Number(e.target.value)) : field.type === "lines" ? e.target.value.split("\n").filter(Boolean) : e.target.value) };
    return <label className="nv-field"><span>{field.label}{field.required ? " *" : ""}</span>{field.type === "textarea" || field.type === "lines" ? <textarea {...props} rows={4}/> : field.type === "select" ? <DashboardSelect {...props}><option value="">Select…</option>{field.options?.map(o => <option key={o} value={o}>{display(o)}</option>)}</DashboardSelect> : <input {...props} type={field.type ?? "text"}/>}</label>;
}
export function ResourceList({ resource, base }: {
    resource: Resource;
    base: string;
}) {
    return <Suspense fallback={<QueryState loading/>}><ResourceListContent resource={resource} base={base}/></Suspense>;
}
function ResourceListContent({ resource, base }: { resource: Resource; base: string }) {
    const params = useSearchParams();
    const [search, setQ] = useState<string | null>(null), [page, setPage] = useState(1), [status, setStatus] = useState("");
    const q = search ?? params.get("q") ?? "",domain=params.get("domain")??"";
    const query = useQuery({ queryKey: ["novya", resource.endpoint, q, page, status,domain], queryFn: () => novya.get(resource.endpoint, { q, page, status: status || undefined,domain:domain||undefined,limit:20 }) });
    const data = query.data?.data;
    const rows = rowsOf(Array.isArray(data) ? data : data?.items ?? data?.channels ?? data?.conversations ?? data?.events);
    return <><PageHeading title={resource.title} subtitle={resource.subtitle} action={resource.fields && <Link className="nv-button nv-button-primary" href={`/${base}/create`}><Plus size={14}/>{resource.createLabel ?? "Create"}</Link>}/><Panel title={`${resource.title} directory`} subtitle={`${query.data?.meta?.total ?? rows.length} records`}><div className="nv-toolbar"><SearchField value={q} onChange={s => { setQ(s); setPage(1); }} placeholder={`Search ${resource.title.toLowerCase()}…`}/>{resource.columns.some(c => c.key === "status") && <DashboardSelect aria-label="Filter by status" className="nv-filter" value={status} onChange={e => { setStatus(e.target.value); setPage(1); }}><option value="">All statuses</option>{(resource.fields?.find(field=>field.key==="status")?.options??({"settings/data/privacy-requests":["received","in_progress","completed","rejected"],"live-view/organizations":["active","trial","onboarding"],"team/members":["active","invited","on_leave","offboarding","offboarded"],"team/time-absence":["pending","approved","rejected","cancelled"],"team/onboarding":["in_progress","completed","cancelled"],"team/performance":["draft","submitted","acknowledged"],"kora/knowledge":["live","suggested","rejected","archived"],"kora/investigations":["active","watching","completed","archived"],"kora/actions":["pending_approval","approved","executed","rejected","failed"],"kora/cases":["open","monitoring","resolved"],"management/organizations":["onboarding","trial","active","suspended","churned"],"live-view/conversations":["active","handoff","completed","needs_review","failed"]} as Record<string,string[]>)[base]??["active","pending","completed"]).map(s => <option key={s} value={s}>{display(s)}</option>)}</DashboardSelect>}</div><QueryState loading={query.isPending} error={query.error ? errorMessage(query.error) : undefined} retry={() => query.refetch()}/>{query.isSuccess && <DataTable rows={rows} columns={resource.columns} href={r => base==="kora/history" ? `/kora/${r.type==="action"?"actions":r.type==="investigation"?"investigations":"conversations"}/${r._id}` : `/${base==="management/health-risk"?"management/organizations":base}/${r._id ?? r.channel}`}/>}<div className="nv-form-footer"><span className="nv-data-source">Page {page} of {query.data?.meta?.pages ?? 1}</span><button className="nv-button" disabled={page === 1} onClick={() => setPage(page - 1)}>Previous</button><button className="nv-button" disabled={page >= (query.data?.meta?.pages ?? 1)} onClick={() => setPage(page + 1)}>Next</button></div></Panel><div className="nv-data-source"><span>Source: NOVYA {resource.endpoint}</span>{query.isSuccess && <span>Updated {new Date(query.dataUpdatedAt).toLocaleTimeString()}</span>}</div></>;
}
export function ResourceForm({ resource, base, id }: {
    resource: Resource;
    base: string;
    id?: string;
}) {
    const router = useRouter();
    const modal = ["kora/folders", "kora/knowledge", "management/customers", "team/members", "team/time-absence"].includes(base) && (!id || base === "management/customers");
    if (!modal) return <ResourceFormBody resource={resource} base={base} id={id}/>;
    return <>{id&&base==="management/customers"?<ResourceDetail resource={resource} base={base} id={id}/>:base==="kora/folders"?<KoraFolders/>:<ResourceList resource={resource} base={base}/>}<Dialog open onOpenChange={open=>{if(!open)router.push(`/${base}`);}}><DialogContent className={`nv-dialog nv-modal-form sm:max-w-xl ${base==="kora/knowledge"?"nv-drawer":""}`}><DialogTitle>{id?"Edit customer":resource.createLabel}</DialogTitle><DialogDescription>Enter the details and review before confirming.</DialogDescription><ResourceFormBody resource={resource} base={base} id={id}/></DialogContent></Dialog></>;
}
function ResourceFormBody({ resource, base, id }: {
    resource: Resource;
    base: string;
    id?: string;
}) {
    const router = useRouter(), cache = useQueryClient();
    const [values, setValues] = useState<RecordData>({});
    const [step, setStep] = useState(1);
    const [receipt,setReceipt]=useState<RecordData|null>(null);
    const existing = useQuery({ queryKey: ["novya", resource.endpoint, id], queryFn: () => novya.get(`${resource.endpoint}/${id}`), enabled: !!id });
    const raw = existing.data?.data;
    const record = resource.detailKey ? (raw?.[resource.detailKey] ?? raw) as RecordData : raw;
    const merged = { ...record, ...values };
    const formFields=id?(resource.editFields??resource.fields):resource.fields;
    const body = Object.fromEntries((formFields??[]).filter(f=>merged[f.key]!==undefined).map(f=>[f.key,f.endpoint&&merged[f.key]&&typeof merged[f.key]==="object"?(merged[f.key] as RecordData)._id:merged[f.key]]));
    const save = useMutation({ mutationFn: () => id ? novya.patch(`${resource.endpoint}/${id}`, body) : novya.post(resource.createEndpoint ?? resource.endpoint, body), onSuccess: r => { cache.invalidateQueries({ queryKey: ["novya"] }); toast.success(id ? "Changes saved" : "Record created"); const result = r.data; if(result.tempPassword){setReceipt(result);return;}const created = resource.detailKey ? (result?.[resource.detailKey] ?? result) as RecordData : result; router.push(created?._id ? `/${base}/${created._id}` : `/${base}`); } });
    const title = id ? `Edit ${resource.title.replace(/s$/, "")}` : resource.createLabel ?? `Create ${resource.title}`;
    if(receipt)return <Panel title="Member invited"><p className="text-xs text-slate-300">Copy this temporary password now and deliver it securely. It will not be returned again.</p><code className="block bg-black p-4 mt-4 rounded break-all select-all">{String(receipt.tempPassword)}</code><button className="nv-button nv-button-primary mt-4" onClick={()=>router.push(`/${base}/${(receipt.member as RecordData)._id}`)}>Open member record</button></Panel>;
    return <><PageHeading title={title} subtitle="Review details before saving changes." action={<Link className="nv-button" href={`/${base}`}><ArrowLeft size={14}/>Back</Link>}/>{id && <QueryState loading={existing.isPending} error={existing.error ? errorMessage(existing.error) : undefined} retry={() => existing.refetch()}/>}<div className="nv-two-column"><Panel title={step === 1 ? "Details" : "Review & confirm"} subtitle="Fields marked * are required"><form onSubmit={e => { e.preventDefault(); if (step === 1 && !id)
        setStep(2);
    else
        save.mutate(); }}>{step === 1 ? <div className="nv-form-grid">{formFields?.map(field => <FormField key={field.key} field={field} value={merged[field.key]} onChange={v => setValues(prev => ({ ...prev, [field.key]: v }))}/>)}</div> : <DataSections value={values}/>} {save.error && <p className="nv-error-text" role="alert">{errorMessage(save.error)}</p>}<div className="nv-form-footer">{step === 2 && <button type="button" className="nv-button" onClick={() => setStep(1)}>Back</button>}<Link className="nv-button" href={`/${base}`}>Cancel</Link><button className="nv-button nv-button-primary" disabled={save.isPending}>{save.isPending ? "Saving…" : step === 1 && !id ? "Review details" : "Save & confirm"}</button></div></form></Panel><div className="nv-stack"><Panel title="Kora can help" subtitle="Prepare complete and accurate records"><Sparkles size={20} className="text-blue-300"/><p className="mt-4 text-xs text-slate-400">Check the target record and access scope before confirming. Your changes are recorded in the audit trail.</p><Link href="/kora" className="nv-button mt-5">Ask Kora<ArrowUpRight size={12}/></Link></Panel><Panel title="Preview"><DataSections value={merged}/></Panel></div></div></>;
}
export function DataSections({ value, depth = 0 }: {
    value: unknown;
    depth?: number;
}) {
    if (value == null)
        return <Empty title="No information available"/>;
    if (Array.isArray(value)) {
        if (!value.length)
            return <Empty />;
        return <div>{value.map((row, i) => <div className="nv-list-item" key={i}><div className="min-w-0 flex-1">{typeof row === "object" ? <DataSections value={row} depth={depth + 1}/> : display(row)}</div></div>)}</div>;
    }
    if (typeof value !== "object")
        return <p className="whitespace-pre-wrap text-xs text-slate-300">{display(value)}</p>;
    return <div>{Object.entries(value as RecordData).filter(([key, v]) => v != null && !/^_|password|secret|token|hash/i.test(key)).map(([key, v]) => typeof v === "object" && depth < 3 ? <div key={key} className="mt-4"><h3 className="text-xs font-medium text-slate-300 mb-2 capitalize">{key.replace(/([A-Z])/g, " $1").replace(/_/g, " ")}</h3><DataSections value={v} depth={depth + 1}/></div> : <div key={key} className="nv-key-value"><span className="capitalize">{key.replace(/([A-Z])/g, " $1").replace(/_/g, " ")}</span><span className="text-right break-words max-w-[65%]">{/^https?:\/\//i.test(String(v)) ? <a href={String(v)} target="_blank" rel="noopener noreferrer" className="text-blue-300 underline">Open file ↗</a> : display(v)}</span></div>)}</div>;
}
export function ResourceDetail({ resource, base, id, tab = "overview" }: {
    resource: Resource;
    base: string;
    id: string;
    tab?: string;
}) {
    const cache = useQueryClient();
    const [note, setNote] = useState("");
    let endpoint = `${resource.endpoint}/${id}`;
    if (base === "management/organizations")
        endpoint += tab === "overview" || tab === "plan-billing" ? "/record" : ["usage", "agents", "members", "integrations", "health", "activity"].includes(tab) ? `/${tab}` : "/record";
    if (base === "management/customers" && ["appointments", "notes", "documents", "payments"].includes(tab))
        endpoint += `/${tab}`;
    if (base === "team/roles" && tab === "members") endpoint += "/members";
    if (base === "kora/knowledge")
        endpoint = `/kora/brain/knowledge/${id}`;
    const rootQuery=useQuery({queryKey:["novya",resource.endpoint,id,"context"],queryFn:()=>novya.get(`${resource.endpoint}/${id}${base==="management/organizations"?"/record":""}`),enabled:tab!=="overview"&&["management/organizations","management/customers","team/roles"].includes(base)});
    const privateTab=base==="management/customers"&&["notes","documents"].includes(tab);
    const rootAccess=useGrantValidity(rootQuery.data?.data.tenantAccess as RecordData|undefined);
    const query = useQuery({ queryKey: ["novya", endpoint, id], queryFn: () => novya.get(endpoint),enabled:!privateTab||rootAccess });
    const raw = query.data?.data;
    const data = Array.isArray(raw) ? {items:raw} : raw;
    const rootData=rootQuery.data?.data??data;
    const privateAccess=useGrantValidity(rootData?.tenantAccess as RecordData|undefined);
    const record = (resource.detailKey && rootData?.[resource.detailKey] || rootData) as RecordData | undefined;
    const action = useMutation({ mutationFn: ({ path, body }: {
            path: string;
            body: RecordData;
        }) => novya.post(path, body), onSuccess: () => { cache.invalidateQueries({ queryKey: ["novya"] }); toast.success("Action recorded"); setNote(""); } });
    let content: unknown = data?.items??data;
    if (base === "management/organizations" && tab === "plan-billing")
        content = data?.billing;
    if (base === "management/organizations" && tab === "contracts")
        content = data?.contract;
    if (base === "team/members" && tab !== "overview")
        content = tab === "team-role" ? { department: record?.department_id, role: record?.role_id, manager: record?.manager_id } : tab === "time-absence" ? record?.recentTimeOff : tab === "performance" ? record?.recentReviews : tab === "activity" ? record?.lifecycle : record?.[tab];
    if (base === "team/candidates" && tab !== "overview")
        content = tab === "evaluation" ? { score: record?.score, summary: record?.aiSummary } : tab === "documents" ? record?.resume : tab === "activity" ? record?.notes : record?.[tab];
    if (base === "team/roles" && tab === "permissions")
        content = record?.permissions;
    return <><PageHeading title={display(record?.name ?? record?.title ?? record?.channel ?? resource.title)} subtitle={resource.subtitle} action={<><Link href={`/${base}`} className="nv-button"><ArrowLeft size={14}/>Back</Link>{resource.fields && !["approvals/all","settings/data/privacy-requests"].includes(base) && <Link href={`/${base}/${id}/edit`} className="nv-button">Edit details</Link>}</>}/>{resource.tabs && <nav className="nv-tabs">{resource.tabs.map(([label, key]) => <Link key={key} className={key === tab ? "active" : ""} href={`/${base}/${id}${key === "overview" ? "" : `/${key}`}`}>{label}</Link>)}</nav>}{base==="management/customers"&&!!rootData?.organization&&<TenantAccessPanel domain="customer" orgId={String((rootData.organization as RecordData)._id??"")}/>}<QueryState loading={(query.isPending&&!privateTab)||rootQuery.isFetching} error={query.error||rootQuery.error ? errorMessage(query.error||rootQuery.error) : undefined} retry={() => {query.refetch();rootQuery.refetch();}}/>{(query.isSuccess||(privateTab&&rootQuery.isSuccess)) && <div className="nv-two-column"><Panel title={resource.tabs?.find(t => t[1] === tab)?.[0] ?? "Record details"}>{tab === "overview" && record && data && ["management/organizations", "management/customers", "team/members"].includes(base) ? <RecordSummary base={base} record={record} data={data} id={id}/> : base==="team/departments"&&record ? <DepartmentDetail id={id} record={record}/> : base==="team/performance"&&record ? <PerformanceDetail id={id} record={record}/> : base==="team/roles"&&tab==="members" ? <DataTable rows={rowsOf(data?.items)} columns={[{key:"name",label:"Member"},{key:"email",label:"Email"},{key:"title",label:"Title"},{key:"status",label:"Status"}]} href={row=>`/team/members/${row._id}`}/> : base==="team/members"&&record ? <StaffRecordTab id={id} tab={tab} record={record}/> : base==="team/candidates"&&tab==="interviews"&&record ? <CandidateInterviews id={id} record={record}/> : base==="kora/folders" ? <DataTable rows={rowsOf(data?.conversations)} columns={[{key:"title",label:"Conversation"},{key:"kind",label:"Type"},{key:"status",label:"Status"},{key:"lastMessageAt",label:"Updated"}]} href={row=>`/kora/conversations/${row._id}`}/> : base==="management/organizations"&&record&&data ? <OrganizationSection id={id} tab={tab} record={record} data={data} context={rootData??data}/> : base==="management/customers"&&["notes","documents"].includes(tab)&&!privateAccess ? <Empty title="Private content access is not active" description={rootData?.organization?"Request or renew purpose-bound access for this organization.":"This customer owner has no linked NOVYA organization. Create or link the organization before requesting private content access."}/> : <DataSections value={content}/>}{record && <RecordSectionEditor base={base} id={id} tab={tab} record={record}/>} {base === "management/customers" && privateAccess && tab === "documents" && <CustomerDocumentUpload id={id}/>} {base === "management/customers" && privateAccess && tab === "notes" && <form className="nv-form-footer" onSubmit={e => { e.preventDefault(); action.mutate({ path: `/management/customers/${id}/notes`, body: { text: note } }); }}><input className="nv-input" aria-label="New note" value={note} onChange={e => setNote(e.target.value)} required/><button className="nv-button">Add note</button></form>}</Panel><div className="nv-stack"> {record && data && ["management/organizations", "management/customers", "team/members"].includes(base) && <RecordContext base={base} record={record} data={rootData??data}/>}<Panel title="Record context"><div className="nv-key-value"><span>Status</span><Badge>{display(record?.status ?? record?.stage)}</Badge></div><div className="nv-key-value"><span>Scope</span><span>Admin · Platform</span></div><div className="nv-key-value"><span>Record ID</span><span className="break-all">{id}</span></div><Link href="/kora" className="nv-button mt-5"><Sparkles size={14}/>Ask Kora</Link></Panel>
      {base==="approvals/all"&&<ApprovalHelp id={id}/>} {base === "approvals/all" && <Panel title="Decision" subtitle="Review impact before confirming"><label className="nv-field"><span>Decision note</span><textarea className="nv-input" value={note} onChange={e => setNote(e.target.value)} rows={3}/></label><div className="nv-heading-actions mt-4"><button disabled={action.isPending || record?.status !== "pending"} className="nv-button nv-button-primary" onClick={() => action.mutate({ path: `/approvals/${id}/decision`, body: { decision: "approve", note } })}><ShieldCheck size={14}/>Approve</button><button disabled={action.isPending || record?.status !== "pending"} className="nv-button nv-button-danger" onClick={() => action.mutate({ path: `/approvals/${id}/decision`, body: { decision: "reject", note } })}>Reject</button></div>{!!record?.execution && <DataSections value={record.execution}/>}</Panel>}
      {base === "team/time-absence" && <Panel title="Request decision"><div className="nv-heading-actions">{["approve", "reject"].map(decision => <button key={decision} disabled={action.isPending || record?.status !== "pending"} className="nv-button" onClick={() => action.mutate({ path: `/team/time-off/${id}/decision`, body: { decision } })}>{display(decision)}</button>)}</div></Panel>}
      {base === "team/onboarding" && <Panel title="Journey checklist">{rowsOf(record?.tasks).map(task => <button className="nv-list-item w-full text-left" key={String(task._id)} onClick={() => novya.patch(`/team/onboarding/${id}/tasks/${task._id}`, { done: !task.done }).then(() => cache.invalidateQueries({ queryKey: ["novya"] })).catch(e => toast.error(errorMessage(e)))}><Check size={15} className={task.done ? "text-emerald-300" : "text-slate-600"}/>{display(task.label)}</button>)}</Panel>}
      {record && base==="management/organizations" && tab==="overview" && <OrganizationActions id={id} record={record}/>} {record && base==="team/members" && ["overview","access"].includes(tab) && <StaffActions id={id} record={record}/>} {record && <RecordActions base={base} id={id} record={record}/>}{action.error && <p className="nv-error-text">{errorMessage(action.error)}</p>}</div></div>}</>;
}



