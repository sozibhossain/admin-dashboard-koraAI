"use client";
import Link from "next/link";
import { useMutation,useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { novya,RecordData,rowsOf,display,errorMessage } from "@/lib/novya";
import { Panel } from "./primitives";
export function OrganizationActions({id,record}:{id:string;record:RecordData}){
  const cache=useQueryClient();
  const update=useMutation({mutationFn:(task:RecordData)=>novya.patch(`/management/organizations/${id}/onboarding/${task.key}`,{done:!task.done}),onSuccess:()=>{cache.invalidateQueries({queryKey:["novya"]});toast.success("Setup checklist updated");}});
  const tasks=rowsOf((record.onboarding as RecordData|undefined)?.tasks);
  return <><Panel title="Organization actions" subtitle="Plan and access changes require review and independent approval."><div className="nv-stack"><Link className="nv-button" href="/workflows/change_plan">Review plan change</Link><Link className="nv-button" href={record.status==="suspended"?"/workflows/reactivate_organization":"/workflows/suspend_organization"}>{record.status==="suspended"?"Review reactivation":"Review suspension"}</Link></div></Panel>{tasks.length>0&&<Panel title="Setup checklist" subtitle="Record completed setup work"><div className="nv-stack">{tasks.map(task=><label className="nv-switch-row" key={String(task.key)}><strong>{display(task.label)}</strong><input type="checkbox" checked={!!task.done} disabled={update.isPending} onChange={()=>update.mutate(task)}/></label>)}</div>{update.error&&<p className="nv-error-text">{errorMessage(update.error)}</p>}</Panel>}</>;
}
