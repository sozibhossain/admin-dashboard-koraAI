"use client";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { ArrowUpRight } from "lucide-react";
import { DashboardSelect } from "@/components/ui/dashboard-select";
import { novya, RecordData, display, ApiResult } from "@/lib/novya";

export const knowledgeDomains = [
  ["organizations", "Organizations", "Company records, plans, locations and governance."],
  ["systems", "Systems & Services", "Providers, infrastructure, status and dependencies."],
  ["finance", "Finance", "Revenue, transactions, plans and billing rules."],
  ["governance", "Governance", "Permissions, security, privacy and internal policies."],
  ["people", "People", "Customers, contacts, teams and access relationships."],
  ["operations", "Operations", "Workflows, support processes and operating routines."],
  ["product", "Product & Brand", "Product behavior, brand system and public content."],
  ["risk", "Risk & Compliance", "Risks, incidents, controls and escalation logic."],
];
export const linkedId = (value: unknown) => String(value && typeof value === "object" ? (value as RecordData)._id ?? "" : value ?? "");
export function dateLabel(value: unknown, time = false) {
  if (!value) return "—";
  const date = new Date(String(value));
  return Number.isNaN(date.getTime()) ? "—" : time ? date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : date.toLocaleDateString([], { month: "short", day: "numeric" });
}
export function KoraFilters({ options, value, onChange }: { options: [string, string][]; value: string; onChange: (value: string) => void }) {
  return <div className="kr-filters" role="group" aria-label="Filter records">{options.map(([key, label]) => <button type="button" aria-pressed={value === key} className={value === key ? "active" : ""} key={key} onClick={() => onChange(key)}>{label}</button>)}</div>;
}
export function KoraSort({ value, onChange }: { value: string; onChange: (value: string) => void }) {
  return <DashboardSelect aria-label="Sort records" className="nv-filter kr-sort" value={value} onChange={event => onChange(event.target.value)}><option value="desc">Recent</option><option value="asc">Oldest first</option></DashboardSelect>;
}
export function KoraPagination({ result, page, onChange }: { result?: ApiResult; page: number; onChange: (page: number) => void }) {
  const pages = result?.meta?.pages ?? 1;
  if (pages <= 1) return null;
  return <div className="kr-pagination"><span>Page {page} of {pages} · {result?.meta?.total ?? 0} records</span><button className="nv-button" disabled={page <= 1} onClick={() => onChange(page - 1)}>Previous</button><button className="nv-button" disabled={page >= pages} onClick={() => onChange(page + 1)}>Next</button></div>;
}
export function useKoraSummary() { return useQuery({ queryKey: ["novya", "kora", "summary"], queryFn: () => novya.get("/kora/summary") }); }
export function KoraRecordCard({ row, href, code, description }: { row: RecordData; href: string; code?: string; description?: string }) {
  return <Link className="kr-record-card" href={href}><span className="kr-record-dot"/><div className="kr-record-main"><strong>{code && <small>{code} </small>}{display(row.title)}</strong><p>{display(row.subjectType ?? row.kind ?? "Platform")} {row.subjectName ? `· ${display(row.subjectName)}` : ""}</p>{description && <p>{description}</p>}</div><div className="kr-record-meta"><span>{row.owner_id ? display(row.owner_id) : display(row.executionLevel ?? row.status)}</span><span>{display(row.status)}</span><small>{dateLabel(row.updatedAt ?? row.createdAt)}</small></div><ArrowUpRight className="kr-card-arrow" size={14}/></Link>;
}
export function KoraGraph({ compact = false, children }: { compact?: boolean; children?: React.ReactNode }) {
  // Fixed geometry keeps the graph stable while the live domain counts load.
  const points = Array.from({ length: 110 }, (_, index) => {
    const angle = index * 2.39996323, radius = 14 + Math.sqrt(index / 110) * 91;
    return { x: 150 + Math.cos(angle) * radius, y: 150 + Math.sin(angle) * radius, r: index % 13 === 0 ? 2.2 : .8 + (index % 3) * .35 };
  });
  return <div className={`kr-graph ${compact ? "kr-graph-compact" : ""}`}><svg viewBox="0 0 300 300" aria-label="Knowledge graph visualization" role="img"><defs><radialGradient id={compact ? "kr-small-glow" : "kr-glow"}><stop stopColor="#96c5ed" stopOpacity=".18"/><stop offset="1" stopColor="#96c5ed" stopOpacity="0"/></radialGradient></defs><circle cx="150" cy="150" r="148" fill={`url(#${compact ? "kr-small-glow" : "kr-glow"})`}/>{[75, 108, 140].map(r => <circle key={r} cx="150" cy="150" r={r} fill="none" stroke="#26323b" strokeWidth=".5"/>)}{points.map((point, index) => <g key={index}>{index % 4 === 0 && <line x1="150" y1="150" x2={point.x} y2={point.y} stroke="#638399" strokeWidth=".35" opacity=".2"/>}<circle cx={point.x} cy={point.y} r={point.r} fill="#d7eaff" opacity={.3 + (index % 6) * .12}/></g>)}<circle cx="150" cy="150" r="8" fill="#eef6ff"/><circle cx="150" cy="150" r="15" fill="#b6ddff" opacity=".13"/></svg>{children}</div>;
}
