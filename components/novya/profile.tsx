"use client";
import { useState } from "react";
import { useQuery,useMutation } from "@tanstack/react-query";
import { userApi } from "@/lib/api";
import { RecordData,errorMessage } from "@/lib/novya";
import { PageHeading,Panel,QueryState } from "./primitives";
import { FormField,DataSections } from "./resource";
import { toast } from "sonner";
export function ProfilePage(){
 const [draft,setDraft]=useState<RecordData>({}),[password,setPassword]=useState({currentPassword:"",newPassword:"",confirmNewPassword:""});
 const q=useQuery({queryKey:["user-profile"],queryFn:()=>userApi.getProfile().then(r=>r.data.data as RecordData)});
 const save=useMutation({mutationFn:()=>{const form=new FormData();Object.entries(draft).forEach(([k,v])=>form.append(k,String(v)));return userApi.updateProfile(form);},onSuccess:()=>{q.refetch();setDraft({});toast.success("Profile saved");}});
 const change=useMutation({mutationFn:()=>userApi.changePassword(password),onSuccess:()=>{setPassword({currentPassword:"",newPassword:"",confirmNewPassword:""});toast.success("Password updated");}});
 return <><PageHeading title="My Profile" subtitle="Your personal account, preferences and security."/><QueryState loading={q.isPending} error={q.error?errorMessage(q.error):undefined} retry={()=>q.refetch()}/>{q.data&&<div className="nv-two-column"><div className="nv-stack"><Panel title="Personal information"><form onSubmit={e=>{e.preventDefault();save.mutate();}}><div className="nv-form-grid">{[{key:"name",label:"Full name",required:true},{key:"phoneNumber",label:"Phone number",type:"tel"},{key:"jobTitle",label:"Job title"},{key:"timezone",label:"Timezone"},{key:"bio",label:"About me",type:"textarea"}].map(f=><FormField key={f.key} field={f} value={draft[f.key]??q.data[f.key]} onChange={v=>setDraft(prev=>({...prev,[f.key]:v}))}/>)}</div><div className="nv-form-footer"><button className="nv-button nv-button-primary" disabled={save.isPending||!Object.keys(draft).length}>Save profile</button></div>{save.error&&<p className="nv-error-text">{errorMessage(save.error)}</p>}</form></Panel><Panel title="Account security"><form onSubmit={e=>{e.preventDefault();if(password.newPassword!==password.confirmNewPassword){toast.error("New passwords must match");return;}change.mutate();}}><div className="nv-stack">{([['currentPassword','Current password'],['newPassword','New password'],['confirmNewPassword','Confirm new password']] as const).map(([key,label])=><label className="nv-field" key={key}><span>{label}</span><input className="nv-input" type="password" autoComplete={key==="currentPassword"?"current-password":"new-password"} required value={password[key]} onChange={e=>setPassword(prev=>({...prev,[key]:e.target.value}))}/></label>)}</div><div className="nv-form-footer"><button className="nv-button" disabled={change.isPending}>Update password</button></div>{change.error&&<p className="nv-error-text">{errorMessage(change.error)}</p>}</form></Panel></div><Panel title="Account context"><DataSections value={{email:q.data.email,role:q.data.role,created:q.data.createdAt}}/><p className="text-xs text-slate-400 mt-4">Platform-wide policies are managed separately in Settings.</p></Panel></div>}</>;
}


