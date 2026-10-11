"use client";
import { useState } from "react";
import Link from "next/link";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Dialog,DialogContent,DialogTitle,DialogDescription } from "@/components/ui/dialog";
import { novya,RecordData,errorMessage } from "@/lib/novya";
import { Field, resources } from "@/lib/novya-pages";
import { FormField } from "./resource";
export function absenceBody(values:RecordData) {
  const start=new Date(String(values.startDate)),end=new Date(String(values.endDate));
  if(!values.member_id||!Number.isFinite(start.getTime())||!Number.isFinite(end.getTime())||end<start)throw new Error("Choose a member and an end date on or after the start date.");
  return {...values,record:values.record!==false};
}
export function TeamFormBody({kind,onClose,onBusyChange}:{kind:"invite"|"absence";onClose:()=>void;onBusyChange?:(busy:boolean)=>void}) {
  const cache=useQueryClient();const [values,setValues]=useState<RecordData>(kind==="absence"?{type:"vacation",record:true}:{}),[receipt,setReceipt]=useState<RecordData|null>(null);
  const fields:Field[]=kind === "invite"?resources["team/members"].fields!: [...resources["team/time-absence"].fields!,{key:"record",label:"Record as approved absence",type:"boolean"}];
  const save=useMutation({onMutate:()=>onBusyChange?.(true),onSettled:()=>onBusyChange?.(false),mutationFn:()=>novya.post(kind === "invite"?"/team/members/invite":"/team/time-off",kind === "absence"?absenceBody(values):Object.fromEntries(Object.entries(values).filter(([,v])=>v!==""))),onSuccess:result=>{cache.invalidateQueries({queryKey:["novya"]});if(kind==="invite"){setReceipt(result.data);}else onClose();}});
  if(receipt)return <div className="tm-receipt"><h3>Member invited</h3><p>{String((receipt.member as RecordData)?.name??"Member")} is ready for onboarding.</p>{!!receipt.tempPassword&&<><p>Copy this temporary password and deliver it securely. It is shown only once.</p><code>{String(receipt.tempPassword)}</code></>}<Link className="nv-button" href={`/team/members/${String((receipt.member as RecordData)._id)}`}>Open member record</Link></div>;
  return <form className="tm-form" onSubmit={e=>{e.preventDefault();save.mutate();}}><fieldset disabled={save.isPending} className="nv-form-grid">{fields.map(field=><FormField key={field.key} field={field} value={values[field.key]} onChange={value=>setValues(previous=>({...previous,[field.key]:value}))}/>)}</fieldset>{kind === "invite"&&<div className="tm-form-note"><h3>Initial access</h3><p>The selected role defines this member&apos;s platform permissions.</p></div>}{save.error&&<p className="nv-error-text" role="alert">{errorMessage(save.error)}</p>}<div className="nv-form-footer"><button className="nv-button" type="button" disabled={save.isPending} onClick={onClose}>Cancel</button><button className="nv-button nv-button-primary" disabled={save.isPending}>{save.isPending?"Saving...":kind==="invite"?"Send invitation":"Save absence"}</button></div></form>;
}
export function TeamModal({kind,close}:{kind:"invite"|"absence";close:()=>void}) {const [busy,setBusy]=useState(false);return <Dialog open onOpenChange={open=>{if(!open&&!busy)close();}}><DialogContent className="nv-dialog tm-dialog sm:max-w-xl"><DialogTitle>{kind==="invite"?"Invite member":"Record absence"}</DialogTitle><DialogDescription>{kind==="invite"?"Create the NOVYA account and assign the initial team access.":"Add an absence to the member record and team calendar."}</DialogDescription><TeamFormBody kind={kind} onClose={close} onBusyChange={setBusy}/></DialogContent></Dialog>;}
