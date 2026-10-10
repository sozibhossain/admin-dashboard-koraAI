"use client";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { novya, rowsOf, display, errorMessage } from "@/lib/novya";
import { resources } from "@/lib/novya-pages";
import { ResourceList } from "./resource";
import { Panel, Metric, DataTable, QueryState, Empty } from "./primitives";

export function PerformancePage() {
  const query = useQuery({ queryKey: ["novya", "performance-overview"], queryFn: () => novya.get("/team/performance") });
  const data = query.data?.data;
  return <><ResourceList resource={resources["team/performance"]} base="team/performance"/><QueryState loading={query.isPending} error={query.error ? errorMessage(query.error) : undefined} retry={() => query.refetch()}/>{data && <div className="nv-two-column mt-5"><Panel title="Review progress"><div className="nv-record-metrics"><Metric label="Average submitted rating" value={data.averageRating == null ? "—" : `${data.averageRating} / 5`}/><Metric label="Reviews due" value={rowsOf(data.reviewsDue).length}/></div><DataTable rows={rowsOf(data.distribution)} columns={[{key:"_id",label:"Rating"},{key:"n",label:"Submitted reviews"}]}/></Panel><Panel title="Review queue"><DataTable rows={rowsOf(data.reviewsDue)} columns={[{key:"name",label:"Member"},{key:"title",label:"Role"},{key:"employment.nextReviewAt",label:"Due"}]} href={row=>`/team/members/${row._id}/performance`}/></Panel></div>}</>;
}

export function AbsencePage() {
  const query = useQuery({ queryKey: ["novya", "absence-calendar"], queryFn: () => novya.get("/team/time-off/calendar") });
  return <><ResourceList resource={resources["team/time-absence"]} base="team/time-absence"/><Panel title="Team calendar" subtitle="Approved absences overlapping the next 30 days" className="mt-5"><QueryState loading={query.isPending} error={query.error ? errorMessage(query.error) : undefined} retry={() => query.refetch()}/><DataTable rows={rowsOf(query.data?.data)} columns={[{key:"member_id",label:"Member"},{key:"type",label:"Absence"},{key:"startDate",label:"From"},{key:"endDate",label:"To"},{key:"days",label:"Days"}]} href={row=>`/team/time-absence/${row._id}`}/></Panel></>;
}

export function OnboardingPage() {
  const query = useQuery({ queryKey: ["novya", "journey-overview"], queryFn: () => novya.get("/team/onboarding/overview") });
  const data = query.data?.data;
  return <><ResourceList resource={resources["team/onboarding"]} base="team/onboarding"/><QueryState loading={query.isPending} error={query.error ? errorMessage(query.error) : undefined} retry={() => query.refetch()}/>{data && <div className="nv-stack mt-5"><div className="nv-metrics"><Metric label="Onboarding" value={display(data.onboarding)}/><Metric label="Offboarding" value={display(data.offboarding)}/><Metric label="Completed journeys" value={display(data.completed)}/><Metric label="Overdue checklist steps" value={display(data.overdueSteps)}/></div><Panel title="Journey attention" subtitle="Incomplete checklist steps past their due date">{rowsOf(data.attention).map(row=><Link className="nv-list-item" href={`/team/onboarding/${row._id}`} key={String(row._id)}><div className="flex-1"><strong>{display(row.member_id)}</strong><p>{display(row.kind)}</p></div><span>{display(row.overdueSteps)} overdue steps</span></Link>)}{!rowsOf(data.attention).length&&<Empty title="No overdue journey steps"/>}</Panel></div>}</>;
}
