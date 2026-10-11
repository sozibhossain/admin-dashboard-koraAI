"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, Sparkles, Plus } from "lucide-react";
import { novya, RecordData, rowsOf, errorMessage, display } from "@/lib/novya";
import { Field } from "@/lib/novya-pages";
import { FormField } from "./resource";
import { PageHeading, Panel, QueryState } from "./primitives";
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { taskDate, taskPerson } from "./task-ui";

const fields: Field[] = [
  { key: "title", label: "Title", required: true },
  { key: "description", label: "Description", type: "textarea" },
  { key: "assignee_id", label: "Assignee", endpoint: "/team/assignees" },
  { key: "priority", label: "Priority", type: "select", options: ["low", "medium", "high", "urgent"] },
  { key: "dueDate", label: "Due date & time", type: "datetime-local" },
  { key: "labels", label: "Labels (one per line)", type: "lines" },
];
export function TaskForm({ id }: { id?: string }) {
  const router = useRouter(), cache = useQueryClient();
  const [draft, setDraft] = useState<RecordData>({}), [review, setReview] = useState(false), [checklist, setChecklist] = useState<string[] | null>(null), [attachments, setAttachments] = useState<string | null>(null);
  const query = useQuery({ queryKey: ["novya", "tasks", id], queryFn: () => novya.get(`/tasks/${id}`), enabled: !!id });
  const assignees = useQuery({ queryKey: ["novya", "/team/assignees", "lookup"], queryFn: () => novya.get("/team/assignees", { limit: 200 }) });
  const values: RecordData = { priority: "medium", ...query.data?.data, ...draft };
  const selectedAssignee = rowsOf(assignees.data?.data).find(person => String(person._id) === String(values.assignee_id));
  const items = checklist ?? rowsOf(query.data?.data.subtasks).map(item => String(item.title));
  const links = attachments ?? rowsOf(query.data?.data.links).map(item => String(item.ref)).join("\n");
  const body = {
    ...Object.fromEntries(fields.filter(f => values[f.key] !== undefined).map(f => [f.key, f.endpoint && values[f.key] && typeof values[f.key] === "object" ? (values[f.key] as RecordData)._id : values[f.key]])),
    subtasks: items.map(title => title.trim()).filter(Boolean).map(title => ({ title, done: rowsOf(query.data?.data.subtasks).find(item => item.title === title)?.done ?? false })),
    links: links.split("\n").map(ref => ref.trim()).filter(Boolean).map(ref => ({ type: "attachment", ref, label: rowsOf(query.data?.data.links).find(link => link.ref === ref)?.label ?? ref })),
  };
  const save = useMutation({ mutationFn: () => id ? novya.patch(`/tasks/${id}`, body) : novya.post("/tasks", body), onSuccess: result => { cache.invalidateQueries({ queryKey: ["novya", "tasks"] }); router.push(`/tasks/${result.data._id}`); } });
  return <><Link className="tk-back" href={id ? `/tasks/${id}` : "/tasks"}><ArrowLeft size={12}/>Tasks</Link><PageHeading title={id ? "Edit task" : "Create & assign task"} subtitle="Create a task for yourself or assign it to an internal team member."/>{id && <QueryState loading={query.isPending} error={query.error ? errorMessage(query.error) : undefined} retry={() => query.refetch()}/>}<div className="tk-columns"><Panel title="Task Details"><form onSubmit={e => { e.preventDefault(); setReview(true); }}><div className="tk-form-grid">{fields.map(field => <FormField key={field.key} field={field} value={values[field.key]} onChange={value => setDraft(previous => ({ ...previous, [field.key]: value }))}/>)}</div><div className="tk-form-checklist"><h3>Checklist</h3>{items.map((title, index) => <div className="tk-inline-form" key={index}><span className="tk-check" aria-hidden="true"/><input className="nv-input" aria-label={`Checklist item ${index + 1}`} placeholder="Checklist item" value={title} onChange={e => setChecklist(items.map((t, i) => i === index ? e.target.value : t))}/><button type="button" className="nv-button" aria-label={`Remove checklist item ${index + 1}`} onClick={() => setChecklist(items.filter((_, i) => i !== index))}>Remove</button></div>)}<button type="button" className="tk-add-item" onClick={() => setChecklist([...items, ""])}><Plus size={12}/>Add checklist item</button></div><label className="nv-field tk-attachment-field"><span>Attachment links</span><textarea className="nv-input" rows={2} placeholder="One http/https URL per line" value={links} onChange={e => setAttachments(e.target.value)}/></label><div className="nv-form-footer"><Link className="nv-button" href={id ? `/tasks/${id}` : "/tasks"}>Cancel</Link><button className="nv-button nv-button-primary" disabled={save.isPending || (!!id && !query.isSuccess)}>{id ? "Review changes" : "Create & assign"}</button></div></form></Panel><div className="tk-side"><Panel title="Create with Kora"><div className="tk-kora-help"><Sparkles size={15}/><p>Ask Kora to help plan your work, prepare a checklist and review your task priorities.</p></div><Link href="/kora" className="nv-button tk-wide">Open Kora</Link></Panel><Panel title="Task Preview"><span className={`tk-pill ${values.priority === "high" || values.priority === "urgent" ? "amber" : "blue"}`}>{display(values.priority)} priority</span><h3 className="tk-preview-title">{display(values.title || "Your task title")}</h3><div className="tk-key-value"><span>Assignee</span><strong>{values.assignee_id ? selectedAssignee ? display(selectedAssignee.name) : taskPerson(values.assignee_id) === "Unassigned" ? "Selected team member" : taskPerson(values.assignee_id) : "Yourself"}</strong></div><div className="tk-key-value"><span>Due</span><strong>{taskDate(values.dueDate, true)}</strong></div><div className="tk-key-value"><span>Repeats</span><strong>One-time task</strong></div><div className="tk-key-value"><span>Checklist</span><strong>{body.subtasks.length} items</strong></div><div className="tk-key-value"><span>Documents</span><strong>{body.links.length} linked</strong></div><p className="tk-muted">Review the assignment and deadline before creating your task.</p></Panel></div></div><Dialog open={review} onOpenChange={setReview}><DialogContent className="nv-dialog tk-review"><DialogTitle>{id ? "Review task changes" : "Review task assignment"}</DialogTitle><DialogDescription>Confirm the details before saving.</DialogDescription><h3>{display(values.title)}</h3><p className="tk-body whitespace-pre-wrap">{display(values.description || "No description provided.")}</p><div className="tk-key-value"><span>Due</span><strong>{taskDate(values.dueDate, true)}</strong></div><div className="tk-key-value"><span>Priority</span><strong>{display(values.priority)}</strong></div><div className="tk-key-value"><span>Checklist</span><strong>{body.subtasks.length} items</strong></div><div className="tk-key-value"><span>Documents</span><strong>{body.links.length} linked</strong></div>{save.error && <p className="nv-error-text" role="alert">{errorMessage(save.error)}</p>}<div className="nv-form-footer"><button className="nv-button" onClick={() => setReview(false)}>Edit details</button><button className="nv-button nv-button-primary" disabled={save.isPending} onClick={() => save.mutate()}>{save.isPending ? "Saving…" : id ? "Save changes" : "Confirm & assign"}</button></div></DialogContent></Dialog></>;
}
