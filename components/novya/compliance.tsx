"use client";
import Link from "next/link";
import { useQuery, useMutation } from "@tanstack/react-query";
import api from "@/lib/axios";
import { novya, RecordData, rowsOf, display, errorMessage } from "@/lib/novya";
import { PageHeading, Panel, Metric, QueryState, Badge } from "./primitives";
import { DataSections } from "./resource";

export function AuditExportButton(){
  const exportFile=useMutation({mutationFn:async()=>{
    const response=await api.get("/novya/settings/audit/export",{responseType:"blob"});
    const url=URL.createObjectURL(response.data);const link=document.createElement("a");link.href=url;link.download=`novya-audit-${new Date().toISOString().slice(0,10)}.csv`;link.click();URL.revokeObjectURL(url);
  }});
  return <><button className="nv-button" disabled={exportFile.isPending} onClick={()=>exportFile.mutate()}>{exportFile.isPending?"Preparing export…":"Export audit CSV"}</button>{exportFile.error&&<p className="nv-error-text">{errorMessage(exportFile.error)}</p>}</>;
}
export function CompliancePage(){
  const q=useQuery({queryKey:["novya","settings","compliance"],queryFn:()=>novya.get("/settings/compliance")});
  const privacy=q.data?.data.privacy as RecordData|undefined,controls=q.data?.data.controls as RecordData|undefined;
  const total=rowsOf(q.data?.data.auditEvents30d).reduce((n,row)=>n+Number(row.n??0),0);
  return <><PageHeading title="Audit & Compliance" subtitle="Recorded platform activity, privacy deadlines and configured controls." action={<AuditExportButton/>}/><QueryState loading={q.isPending} error={q.error?errorMessage(q.error):undefined} retry={()=>q.refetch()}/>{q.data&&<><div className="nv-metrics"><Metric label="Audit events · 30 days" value={String(total)}/><Metric label="Open privacy requests" value={display(privacy?.open)}/><Metric label="Overdue privacy requests" value={display(privacy?.overdue)}/><Metric label="Active API keys" value={display(controls?.activeApiKeys)}/></div><div className="nv-two-column"><Panel title="Recorded activity" action={<Link className="nv-button" href="/settings/audit/changes">Configuration changes</Link>}>{rowsOf(q.data.data.auditEvents30d).map(row=><div key={String(row._id)} className="nv-key-value"><span className="capitalize">{display(row._id)}</span><Badge>{display(row.n)}</Badge></div>)}{!total&&<p className="text-xs text-slate-400">No audit events recorded in the last 30 days.</p>}</Panel><Panel title="Configured controls" subtitle="Configuration values; review enforcement and evidence separately."><DataSections value={controls}/><Link className="nv-button mt-4" href="/settings/data/privacy-requests">Privacy requests</Link></Panel></div><div className="nv-data-source">Source: platform audit records · Updated {new Date(q.dataUpdatedAt).toLocaleTimeString()}</div></>}</>;
}
