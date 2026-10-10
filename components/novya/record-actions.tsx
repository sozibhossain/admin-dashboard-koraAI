"use client";
import { DashboardSelect } from "@/components/ui/dashboard-select";
import { useState } from "react";
import Link from "next/link";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { novya, RecordData, display, errorMessage } from "@/lib/novya";
import { Panel } from "./primitives";

const linkedId = (value: unknown) => String(value && typeof value === "object" ? (value as RecordData)._id ?? "" : value ?? "");
export function RecordActions({base,id,record}:{base:string;id:string;record:RecordData}) {
  const cache=useQueryClient();
  const [status,setStatus]=useState<string|null>(null),[note,setNote]=useState("");
  const mutation=useMutation({mutationFn:({path,body,method="post"}:{path:string;body:RecordData;method?:"post"|"patch"})=>novya[method](path,body),onSuccess:r=>{cache.invalidateQueries({queryKey:["novya"]});setStatus(null);setNote("");toast.success(r.message??"Record updated");}});
  const error=mutation.error&&<p className="nv-error-text">{errorMessage(mutation.error)}</p>;
  if(base==="settings/data/privacy-requests")return <Panel title="Request handling" subtitle="Track fulfillment after the requested work has been verified."><form onSubmit={e=>{e.preventDefault();mutation.mutate({path:`/settings/privacy-requests/${id}`,method:"patch",body:{status:status??record.status,note:note||record.note||""}});}}><label className="nv-field"><span>Request status</span><DashboardSelect className="nv-input" value={status??String(record.status)} onChange={e=>setStatus(e.target.value)}>{["received","in_progress","completed","rejected"].map(s=><option key={s} value={s}>{display(s)}</option>)}</DashboardSelect></label><label className="nv-field mt-4"><span>Handling note</span><textarea className="nv-input" value={note} placeholder={String(record.note??"")} onChange={e=>setNote(e.target.value)}/></label>{error}<button className="nv-button nv-button-primary mt-4" disabled={mutation.isPending}>Save request status</button></form></Panel>;
  if(base==="team/candidates")return <Panel title="Hiring actions"><form onSubmit={e=>{e.preventDefault();mutation.mutate({path:`/team/candidates/${id}/move`,body:{stage:status??record.stage}});}}><label className="nv-field"><span>Hiring stage</span><DashboardSelect className="nv-input" value={status??String(record.stage)} onChange={e=>setStatus(e.target.value)}>{["applied","screen","interview","offer","hired","rejected"].map(s=><option key={s} value={s}>{display(s)}</option>)}</DashboardSelect></label><button className="nv-button mt-4" disabled={mutation.isPending||!status}>Confirm stage</button></form><form className="nv-stack mt-5" onSubmit={e=>{e.preventDefault();mutation.mutate({path:`/team/candidates/${id}/notes`,body:{text:note}});}}><label className="nv-field"><span>Hiring note</span><textarea className="nv-input" value={note} onChange={e=>setNote(e.target.value)} required/></label><button className="nv-button" disabled={mutation.isPending}>Add note</button></form>{error}</Panel>;
  if(base==="kora/actions"&&record.approval_id)return <Panel title="Approval required" subtitle="Review impact and decide through the approval record."><Link className="nv-button" href={`/approvals/${linkedId(record.approval_id)}`}>Open linked approval</Link></Panel>;
  if(base==="kora/investigations")return <Panel title="Investigation actions"><div className="nv-stack">{!!record.conversation_id&&<Link className="nv-button" href={`/kora/conversations/${linkedId(record.conversation_id)}`}>Continue investigation chat</Link>}{record.case_id?<Link className="nv-button" href={`/kora/cases/${linkedId(record.case_id)}`}>Open completed case</Link>:<><button className="nv-button" disabled={mutation.isPending} onClick={()=>mutation.mutate({path:`/kora/investigations/${id}/watch`,body:{}})}>Toggle watching</button><button className="nv-button nv-button-primary" disabled={mutation.isPending} onClick={()=>mutation.mutate({path:`/kora/investigations/${id}/complete`,body:{}})}>Complete and create case</button></>}{error}</div></Panel>;
  return null;
}
