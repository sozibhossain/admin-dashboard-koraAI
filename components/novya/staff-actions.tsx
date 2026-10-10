"use client";
import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { novya, RecordData, display, errorMessage } from "@/lib/novya";
import { Panel } from "./primitives";
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog";

export function StaffActions({ id, record }: { id: string; record: RecordData }) {
  const cache = useQueryClient();
  const [kind, setKind] = useState<string | null>(null);
  const [reason, setReason] = useState("");
  const [endDate, setEndDate] = useState("");
  const save = useMutation({
    mutationFn: () => novya.post(`/team/members/${id}/${kind === "offboard" ? "offboard" : "access"}`, kind === "offboard" ? { reason, endDate: endDate || undefined } : { blocked: kind === "revoke", reason }),
    onSuccess: result => { cache.invalidateQueries({ queryKey: ["novya"] }); setKind(null); setReason(""); toast.success(result.message ?? "Staff access updated"); },
  });
  const label = kind === "offboard" ? "Start offboarding" : kind === "revoke" ? "Revoke login access" : "Restore login access";
  return <><Panel title="Staff actions" subtitle="Review account access and employment changes."><div className="nv-stack"><button className="nv-button" onClick={() => { save.reset(); setKind("revoke"); }}>Revoke login access</button><button className="nv-button" onClick={() => { save.reset(); setKind("restore"); }}>Restore login access</button><button className="nv-button nv-button-danger" disabled={["offboarding", "offboarded"].includes(String(record.status))} onClick={() => { save.reset(); setKind("offboard"); }}>Start offboarding</button></div></Panel><Dialog open={!!kind} onOpenChange={open => { if (!open && !save.isPending) setKind(null); }}><DialogContent className="nv-dialog"><DialogTitle>{label}</DialogTitle><DialogDescription>Review the effect for {display(record.name)} before confirming.</DialogDescription><p className="text-sm text-slate-300">{kind === "offboard" ? "Starts the offboarding checklist and removes active staff access immediately." : kind === "revoke" ? "Blocks this member’s linked login." : "Unblocks the linked login. The HR record must still have an active, invited or on-leave status to access the dashboard."}</p><form className="nv-stack" onSubmit={event => { event.preventDefault(); save.mutate(); }}><label className="nv-field"><span>Reason *</span><textarea className="nv-input" required minLength={10} value={reason} onChange={event => setReason(event.target.value)} /></label>{kind === "offboard" && <label className="nv-field"><span>Employment end date</span><input className="nv-input" type="date" value={endDate} onChange={event => setEndDate(event.target.value)} /></label>}{save.error && <p className="nv-error-text">{errorMessage(save.error)}</p>}<div className="nv-form-footer"><button className="nv-button" type="button" disabled={save.isPending} onClick={() => setKind(null)}>Cancel</button><button className="nv-button nv-button-danger" disabled={save.isPending}>Confirm {label.toLowerCase()}</button></div></form></DialogContent></Dialog></>;
}
