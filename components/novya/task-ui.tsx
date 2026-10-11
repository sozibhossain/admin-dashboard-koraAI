"use client";

import Link from "next/link";
import { Check, MoreHorizontal, Plus, Search } from "lucide-react";
import { RecordData, display } from "@/lib/novya";

export function dateKey(value: unknown) {
  if (!value) return "";
  const date = new Date(String(value));
  if (!Number.isFinite(date.getTime())) return "";
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}
export function taskDate(value: unknown, time = false) {
  if (!dateKey(value)) return "No due date";
  return new Date(String(value)).toLocaleString("en", time
    ? { weekday: "short", month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" }
    : { weekday: "short", month: "short", day: "numeric" });
}
export function taskPerson(value: unknown) {
  return value && typeof value === "object" ? display((value as RecordData).name) : "Unassigned";
}
export function TaskNavigation({ team = false }: { team?: boolean }) {
  return <div className="tk-navigation"><div className="tk-segment"><Link href="/tasks" className={!team ? "selected" : ""}>My Tasks</Link><Link href="/tasks/team" className={team ? "selected" : ""}>Team</Link></div><Link className="tk-create" href="/tasks/create" aria-label="Create and assign task"><Plus size={18}/></Link></div>;
}
export function TaskMetrics({ metrics }: { metrics: { label: string; value: React.ReactNode; note: string; tone?: string }[] }) {
  return <div className="tk-metrics">{metrics.map(m => <section className="tk-metric" key={m.label}><h2>{m.label}</h2><strong>{m.value}</strong><p className={m.tone ?? ""}>{m.note}</p></section>)}</div>;
}
export function TaskSearch({ value, change, placeholder = "Search tasks or linked records" }: { value: string; change: (v: string) => void; placeholder?: string }) {
  return <label className="tk-search"><Search size={13}/><input aria-label={placeholder} placeholder={placeholder} value={value} onChange={e => change(e.target.value)}/></label>;
}
export function TaskRows({ tasks, toggle, pending }: { tasks: RecordData[]; toggle: (t: RecordData) => void; pending: boolean }) {
  return <div className="tk-list">{tasks.map(t => <div className="tk-row" key={String(t._id)}><button className={`tk-check ${t.status === "done" ? "done" : ""}`} disabled={pending} aria-label={`${t.status === "done" ? "Reopen" : "Complete"} ${display(t.title)}`} onClick={() => toggle(t)}>{t.status === "done" && <Check size={11}/>}</button><div><Link className="tk-task-title" href={`/tasks/${t._id}`}>{display(t.title)}</Link><p>{taskDate(t.dueDate, true)} · {display(t.source ?? "manual")}</p></div><span className={`tk-pill ${t.status === "done" ? "green" : t.priority === "urgent" || t.status === "blocked" ? "red" : t.priority === "high" ? "amber" : "blue"}`}>{t.status === "done" ? "Completed" : t.priority === "high" || t.priority === "urgent" ? display(t.priority) : display(t.status)}</span><Link className="tk-row-menu" href={`/tasks/${t._id}/edit`} aria-label={`Edit ${display(t.title)}`}><MoreHorizontal size={15}/></Link></div>)}</div>;
}
export function TaskProgress({ tasks }: { tasks: RecordData[] }) {
  const done = tasks.filter(t => t.status === "done").length;
  return <><p className="tk-muted">{done} of {tasks.length} tasks completed</p><div className="tk-progress" role="progressbar" aria-label="Task completion" aria-valuemin={0} aria-valuemax={100} aria-valuenow={tasks.length ? Math.round(done / tasks.length * 100) : 0}><span style={{ width: `${tasks.length ? done / tasks.length * 100 : 0}%` }}/></div></>;
}
