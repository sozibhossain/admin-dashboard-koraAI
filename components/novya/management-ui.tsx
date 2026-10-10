"use client";
import type {ReactNode} from "react";
import Link from "next/link";
import {Check,MoreHorizontal,Plus} from "lucide-react";
import {display,type RecordData} from "@/lib/novya";
import {DropdownMenu,DropdownMenuTrigger,DropdownMenuContent,DropdownMenuItem} from "@/components/ui/dropdown-menu";
export const obj=(v:unknown):RecordData=>v&&typeof v==="object"?v as RecordData:{};
export const str=(v:unknown)=>v==null?"":String(v);
export const fmtDate=(v:unknown,options?:Intl.DateTimeFormatOptions)=>v&&!Number.isNaN(new Date(str(v)).getTime())?new Date(str(v)).toLocaleDateString("en-GB",options):"—";
export function cash(v:unknown,currency:unknown="EUR"){try{return new Intl.NumberFormat("en-IE",{style:"currency",currency:str(currency).toUpperCase()||"EUR",maximumFractionDigits:0}).format(Number(v||0));}catch{return `${v||0} ${currency}`;}}
export function MAvatar({name,index=0}:{name:unknown;index?:number}){return <span className={`nc-avatar nc-color-${index%5}`}>{str(name).split(/\s+/).filter(Boolean).slice(0,2).map(s=>s[0]).join("").toUpperCase()}</span>;}
export function MStatus({value}:{value:unknown}){return <span className={`nc-status nc-status-${str(value)}`}>{display(value)}</span>;}
export function MCard({title,children,action,className=""}:{title:string;children:ReactNode;action?:ReactNode;className?:string}){return <section className={`nc-card ${className}`}><header><h2>{title}</h2>{action}</header>{children}</section>;}
export function MMetric({label,value,hint,icon}:{label:string;value:ReactNode;hint?:ReactNode;icon?:ReactNode}){return <div className="nc-metric mg-metric"><span>{label}{icon&&<i>{icon}</i>}</span><strong>{value}</strong><small>{hint}</small></div>;}
export function MPairs({values}:{values:[string,unknown][]}){return <dl className="nc-pairs">{values.map(([label,value])=><div key={label}><dt>{label}</dt><dd>{display(value)}</dd></div>)}</dl>;}
export function MBlock({title,children,className=""}:{title:string;children:ReactNode;className?:string}){return <section className={`nc-detail-block ${className}`}><h3>{title}</h3>{children}</section>;}
export function MChips({values}:{values:unknown[]}){return <div className="nc-chips">{values.filter(Boolean).map((value,i)=><span key={i} className={`nc-color-${i%3}`}>{display(value)}</span>)}</div>;}
export function MTimeline({rows}:{rows:RecordData[]}){return <div className="nc-timeline">{rows.map((row,i)=><div className="nc-timeline-row" key={str(row._id)||i}><span className={`nc-timeline-icon nc-color-${i%5}`}><Check size={12}/></span><div className="nc-timeline-content"><strong>{display(row.title||row.invoice_no||row.name)}</strong><p>{display(row.detail||row.description||row.actorName)}</p></div><time>{fmtDate(row.createdAt||row.issuedAt||row.signedAt)}</time><div className="nc-timeline-result">{display(row.status||obj(row.meta).status||row.actorName||row.type)}</div></div>)}{!rows.length&&<div className="mg-empty">No recorded activity.</div>}</div>;}
export function MRowMenu({id}:{id:unknown}){return <DropdownMenu modal={false}><DropdownMenuTrigger asChild><button className="nc-row-menu-trigger" aria-label="Organization actions"><MoreHorizontal size={16}/></button></DropdownMenuTrigger><DropdownMenuContent align="end" collisionPadding={12}>{[["Open organization",""],["Edit organization","/edit"],["Plan & Billing","/plan-billing"],["Health & Risk","/health"]].map(([label,suffix])=><DropdownMenuItem key={label} asChild><Link href={`/management/organizations/${id}${suffix}`}>{label}</Link></DropdownMenuItem>)}</DropdownMenuContent></DropdownMenu>;}
export function MHeading({title,subtitle,add=true}:{title:string;subtitle:string;add?:boolean}){return <div className="nc-page-heading"><div><h1>{title}</h1><p>{subtitle}</p></div>{add&&<Link className="nc-add" href="/management/organizations/create" aria-label="Create organization"><Plus size={20}/></Link>}</div>;}
