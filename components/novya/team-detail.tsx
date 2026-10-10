"use client";
import { useState } from "react";
import Link from "next/link";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { novya, RecordData, display, rowsOf, errorMessage } from "@/lib/novya";
import { Panel, Metric, DataTable, QueryState, Badge } from "./primitives";
import { DataSections } from "./resource";

export function DepartmentDetail({ id, record }: { id: string; record: RecordData }) {
  const [page, setPage] = useState(1);
  const members = useQuery({ queryKey: ["novya", "department-members", id, page], queryFn: () => novya.get("/team/members", { department_id: id, page, limit: 20 }) });
  return <div className="nv-stack"><div className="nv-record-metrics"><Metric label="Members" value={members.data?.meta?.total ?? "—"}/><Metric label="Department lead" value={display(record.lead_id)}/><Metric label="Annual budget" value={display(record.budget)}/></div><Panel title="Department overview"><DataSections value={{ description: record.description, parent: record.parent_id }}/></Panel><Panel title="Teams & ownership"><QueryState loading={members.isPending} error={members.error ? errorMessage(members.error) : undefined} retry={() => members.refetch()}/><DataTable rows={rowsOf(members.data?.data)} columns={[{ key: "name", label: "Member" }, { key: "title", label: "Role" }, { key: "email", label: "Email" }, { key: "status", label: "Status" }]} href={member => `/team/members/${member._id}`}/><div className="nv-form-footer"><span>Page {page} of {members.data?.meta?.pages ?? 1}</span><button className="nv-button" disabled={page === 1} onClick={() => setPage(page - 1)}>Previous</button><button className="nv-button" disabled={page >= (members.data?.meta?.pages ?? 1)} onClick={() => setPage(page + 1)}>Next</button></div></Panel></div>;
}

export function PerformanceDetail({ id, record }: { id: string; record: RecordData }) {
  const cache = useQueryClient();
  const [review, setReview] = useState<string | null>(null);
  const save = useMutation({ mutationFn: () => novya.patch(`/team/reviews/${id}`, { status: review }), onSuccess: () => { cache.invalidateQueries({ queryKey: ["novya"] }); setReview(null); } });
  const member = record.member_id as RecordData | undefined;
  return <div className="nv-stack"><div className="nv-record-metrics"><Metric label="Review cycle" value={display(record.period)}/><Metric label="Rating" value={`${display(record.rating)} / 5`}/><Metric label="Status" value={display(record.status)}/></div><Panel title="Review cycle" action={member?._id ? <Link className="nv-button" href={`/team/members/${member._id}/performance`}>Open member</Link> : undefined}><DataSections value={{ member, submittedAt: record.submittedAt }}/></Panel><Panel title="Goals & outcomes"><DataTable rows={rowsOf(record.goals)} columns={[{ key: "title", label: "Goal" }, { key: "progress", label: "Progress (%)" }, { key: "status", label: "Status" }]}/></Panel><Panel title="Strengths & development"><DataSections value={{ strengths: record.strengths, improvements: record.improvements }}/></Panel><Panel title="Feedback & check-ins"><DataTable rows={rowsOf(record.feedback)} columns={[{ key: "from", label: "From" }, { key: "text", label: "Feedback" }, { key: "at", label: "Date" }]}/></Panel><Panel title="Review status" subtitle="Record the review outcome after the review has taken place."><Badge>{display(record.status)}</Badge><div className="nv-form-footer">{review ? <><span>Confirm {display(review)} for {display(record.period)}?</span><button className="nv-button" disabled={save.isPending} onClick={() => setReview(null)}>Cancel</button><button className="nv-button nv-button-primary" disabled={save.isPending} onClick={() => save.mutate()}>Confirm status</button></> : <>{record.status === "draft" && <button className="nv-button" onClick={() => setReview("submitted")}>Review submission</button>}{record.status === "submitted" && <button className="nv-button" onClick={() => setReview("acknowledged")}>Review acknowledgement</button>}</>}</div>{save.error && <p className="nv-error-text">{errorMessage(save.error)}</p>}</Panel></div>;
}
