"use client";
import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { novya,errorMessage } from "@/lib/novya";
import { Panel } from "./primitives";
export function ApprovalHelp({id}:{id:string}){
  const [question,setQuestion]=useState("Summarize the risk and impact of this request.");
  const ask=useMutation({mutationFn:()=>novya.post(`/approvals/${id}/ask-kora`,{question})});
  return <Panel title="Ask Kora about this request" subtitle="Kora explains the request; an administrator makes the decision."><form className="nv-stack" onSubmit={e=>{e.preventDefault();ask.mutate();}}><textarea aria-label="Approval question" className="nv-input" rows={3} required value={question} onChange={e=>setQuestion(e.target.value)}/><button className="nv-button" disabled={ask.isPending}>{ask.isPending?"Reviewing…":"Explain impact"}</button></form>{ask.data&&<p className="text-xs text-slate-300 whitespace-pre-wrap mt-4">{String(ask.data.data.answer??"")}</p>}{ask.error&&<p className="nv-error-text">{errorMessage(ask.error)}</p>}</Panel>;
}
