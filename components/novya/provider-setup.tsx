"use client";
import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { novya, errorMessage, RecordData } from "@/lib/novya";
import { FormField } from "./resource";
import { Field } from "@/lib/novya-pages";
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog";
const fields: Field[] = [{key:"provider",label:"Provider key",required:true},{key:"name",label:"Connection name",required:true},{key:"category",label:"Category",type:"select",options:["voice","messaging","ai","payments","email","calendar","analytics","storage","other"],required:true},{key:"region",label:"Region"},{key:"secretRef",label:"Credential reference (environment variable or vault entry)"}];
export function ProviderSetup({ provider }: { provider?: string }) {
  const [open,setOpen] = useState(false), [draft,setDraft] = useState<RecordData>({provider:provider??"",category:"other"});
  const router=useRouter(),cache=useQueryClient();
  const save=useMutation({mutationFn:()=>novya.put(`/settings/integrations/${encodeURIComponent(String(draft.provider))}`,{name:draft.name,category:draft.category,region:draft.region,secretRef:draft.secretRef,status:"disconnected"}),onSuccess:()=>{cache.invalidateQueries({queryKey:["novya","integrations"]});setOpen(false);router.push(`/settings/integrations/${encodeURIComponent(String(draft.provider))}`);}});
  return <><button className="nv-button nv-button-primary" onClick={()=>{save.reset();setDraft({provider:provider??"",category:"other"});setOpen(true);}}>Add provider configuration</button><Dialog open={open} onOpenChange={setOpen}><DialogContent className="nv-dialog"><DialogTitle>Provider configuration</DialogTitle><DialogDescription>Save the provider identity and credential reference. The connection stays disconnected until its integration is configured and verified.</DialogDescription><form className="nv-stack" onSubmit={event=>{event.preventDefault();save.mutate();}}>{fields.map(field=><FormField key={field.key} field={field} value={draft[field.key]} onChange={value=>setDraft(prev=>({...prev,[field.key]:value}))}/>)}{save.error&&<p className="nv-error-text">{errorMessage(save.error)}</p>}<div className="nv-form-footer"><button className="nv-button" type="button" onClick={()=>setOpen(false)}>Cancel</button><button className="nv-button nv-button-primary" disabled={save.isPending}>Save configuration</button></div></form></DialogContent></Dialog></>;
}
