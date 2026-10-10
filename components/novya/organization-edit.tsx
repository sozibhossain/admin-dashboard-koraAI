"use client";
import { useState } from "react";
import Link from "next/link";
import { useQuery,useMutation,useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { novya,RecordData,errorMessage } from "@/lib/novya";
import { resources } from "@/lib/novya-pages";
import { Panel,QueryState } from "./primitives";
import { FormField,DataSections } from "./resource";
import {OrganizationEditorLayout} from "./organization-editor-layout";
const tabs=["General","Owner & Access","Plan & Billing","Services","Security"];
export function OrganizationEdit({id}:{id:string}){
  const cache=useQueryClient();const [tab,setTab]=useState("General"),[draft,setDraft]=useState<RecordData>({});
  const q=useQuery({queryKey:["novya","management","organizations",id,"edit"],queryFn:()=>novya.get(`/management/organizations/${id}`)});
  const save=useMutation({mutationFn:()=>novya.patch(`/management/organizations/${id}`,draft),onSuccess:()=>{cache.invalidateQueries({queryKey:["novya"]});setDraft({});toast.success("Organization details saved");},onError:error=>toast.error(errorMessage(error))});
  const record=q.data?.data,values={...record,...draft};
  return <><QueryState loading={q.isPending} error={q.error?errorMessage(q.error):undefined} retry={()=>q.refetch()}/>{record&&<OrganizationEditorLayout mode="edit" organization={values} tab={tab} tabs={tabs} onTab={setTab} onSave={()=>save.mutate()} pending={save.isPending}><Panel title={tab}>{tab==="General"?<form onSubmit={e=>{e.preventDefault();save.mutate();}}><div className="nv-form-grid">{resources["management/organizations"].fields?.map(field=><FormField key={field.key} field={field} value={values[field.key]} onChange={v=>setDraft(prev=>({...prev,[field.key]:v}))}/>)}</div><button className="nv-button mt-4" disabled={!Object.keys(draft).length||save.isPending}>Save company details</button></form>:tab==="Owner & Access"?<><DataSections value={record.owner_id}/><p className="text-xs text-slate-400 mt-4">This canonical business owner owns the linked customers, employees and appointments. Owner transfer requires migrating those records together.</p></>:tab==="Plan & Billing"?<><DataSections value={{plan:record.planSlug,billingCycle:record.billingCycle,mrr:record.mrr,renewalDate:record.renewalDate,autoRenew:record.autoRenew,billingStatus:record.billingStatus}}/><Link className="nv-button mt-4" href="/workflows/change_plan">Review plan change</Link></>:tab==="Services"?<><DataSections value={record.aiAgents}/><Link className="nv-button mt-4" href={`/management/organizations/${id}/agents`}>Open AI agents</Link><Link className="nv-button mt-4" href={`/management/organizations/${id}/integrations`}>Open integrations</Link></>:<><DataSections value={{status:record.status,suspension:record.suspension}}/><Link className="nv-button mt-4" href={record.status==="suspended"?"/workflows/reactivate_organization":"/workflows/suspend_organization"}>Review access change</Link></>}{save.error&&<p className="nv-error-text">{errorMessage(save.error)}</p>}</Panel></OrganizationEditorLayout>}</>;
}
