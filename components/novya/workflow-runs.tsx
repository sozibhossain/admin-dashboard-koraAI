"use client";
import { DashboardSelect } from "@/components/ui/dashboard-select";
import { useState } from "react";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { novya,rowsOf,errorMessage,display } from "@/lib/novya";
import { PageHeading,Panel,Metric,QueryState,DataTable } from "./primitives";
export function WorkflowRuns(){
  const [page,setPage]=useState(1),[status,setStatus]=useState("");
  const q=useQuery({queryKey:["novya","workflows","runs",page,status],queryFn:()=>novya.get("/workflows/runs",{page,limit:20,status:status||undefined}),refetchInterval:15000});
  const insights=useQuery({queryKey:["novya","workflows","insights"],queryFn:()=>novya.get("/workflows/insights"),refetchInterval:30000});
  const values=insights.data?.data;
  return <><PageHeading title="Workflow Runs" subtitle="Reviewed procedures, approval status and recorded outcomes." action={<Link className="nv-button" href="/workflows">Workflow library</Link>}/><QueryState loading={insights.isPending} error={insights.error?errorMessage(insights.error):undefined} retry={()=>insights.refetch()}/>{values&&<div className="nv-metrics"><Metric label="Started today" value={display(values.startedToday)}/><Metric label="Pending approvals" value={display(values.pendingApprovals)}/><Metric label="Success · last 30 days" value={values.successRatePct==null?"No completed runs":`${values.successRatePct}%`}/><Metric label="Average completion" value={values.avgCompletionSec==null?"—":`${values.avgCompletionSec}s`}/></div>}<Panel title="Run history" action={<DashboardSelect className="nv-filter" aria-label="Filter workflow runs" value={status} onChange={e=>{setStatus(e.target.value);setPage(1);}}><option value="">All statuses</option>{["review","awaiting_approval","running","completed","failed","cancelled"].map(value=><option key={value} value={value}>{display(value)}</option>)}</DashboardSelect>}><QueryState loading={q.isPending} error={q.error?errorMessage(q.error):undefined} retry={()=>q.refetch()}/>{q.isSuccess&&<DataTable rows={rowsOf(q.data?.data)} columns={[{key:"name",label:"Workflow"},{key:"run_code",label:"Run"},{key:"status",label:"Status"},{key:"createdAt",label:"Started"},{key:"completedAt",label:"Completed"}]} href={row=>`/workflows/runs/${row._id}`}/>}<div className="nv-form-footer"><span className="nv-data-source">Page {page} of {q.data?.meta?.pages??1}</span><button className="nv-button" disabled={page===1} onClick={()=>setPage(page-1)}>Previous</button><button className="nv-button" disabled={page>=(q.data?.meta?.pages??1)} onClick={()=>setPage(page+1)}>Next</button></div></Panel></>;
}
