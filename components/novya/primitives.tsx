"use client";
import Link from "next/link";
import { ArrowUpRight, RefreshCw, Search, AlertCircle } from "lucide-react";
import { display, recordValue, RecordData } from "@/lib/novya";
export function Panel({ title, subtitle, action, children, className = "" }: {
    title?: string;
    subtitle?: string;
    action?: React.ReactNode;
    children: React.ReactNode;
    className?: string;
}) {
    return <section className={`nv-panel ${className}`}>{(title || action) && <div className="nv-panel-head"><div><h2>{title}</h2>{subtitle && <p>{subtitle}</p>}</div>{action}</div>}{children}</section>;
}
export function PageHeading({ title, subtitle, action }: {
    title: string;
    subtitle?: string;
    action?: React.ReactNode;
}) { return <div className="nv-page-heading"><div><h1>{title}</h1>{subtitle && <p>{subtitle}</p>}</div><div className="nv-heading-actions">{action}</div></div>; }
export function Badge({ children }: {
    children: React.ReactNode;
}) { const text = String(children ?? ""); return <span className={`nv-badge ${/\b(active|approved|completed|healthy|operational|connected|paid|done)\b/i.test(text) ? "nv-green" : /pending|review|trial|progress|warning/i.test(text) ? "nv-amber" : /failed|error|critical|suspended|rejected|blocked/i.test(text) ? "nv-red" : ""}`}>{children}</span>; }
export function Metric({ label, value, note, icon, trend }: {
    label: string;
    value: React.ReactNode;
    note?: string;
    icon?: React.ReactNode;
    trend?: number[];
}) { const max = Math.max(...(trend ?? [1]), 1); return <Panel className="nv-metric"><div className="nv-metric-label">{label}{icon}</div><div className="nv-metric-value">{value}{trend && <svg viewBox="0 0 100 35" aria-label={`${label} trend`}><polyline points={trend.map((v, i) => `${i * 100 / Math.max(trend.length - 1, 1)},${32 - v / max * 28}`).join(" ")} fill="none" stroke="currentColor" strokeWidth="2"/></svg>}</div>{note && <p>{note}</p>}</Panel>; }
export function Empty({ title = "No records yet", description = "Records will appear here when they are available." }: {
    title?: string;
    description?: string;
}) { return <div className="nv-empty"><div className="nv-empty-mark">◇</div><strong>{title}</strong><p>{description}</p></div>; }
export function QueryState({ loading, error, retry }: {
    loading: boolean;
    error?: string;
    retry?: () => void;
}) { if (loading)
    return <div className="nv-loading" role="status"><RefreshCw className="animate-spin" size={18}/> Loading current data…</div>; if (error)
    return <div className="nv-error" role="alert"><AlertCircle size={20}/><div><strong>Unable to load this page</strong><p>{error}</p>{retry && <button className="nv-button" onClick={retry}>Try again</button>}</div></div>; return null; }
export function SearchField({ value, onChange, placeholder = "Search…" }: {
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
}) { return <label className="nv-search"><Search size={15}/><input aria-label={placeholder} placeholder={placeholder} value={value} onChange={e => onChange(e.target.value)}/></label>; }
export function DataTable({ rows, columns, href }: {
    rows: RecordData[];
    columns: {
        key: string;
        label: string;
    }[];
    href?: (row: RecordData) => string;
}) { return <div className="nv-table-wrap"><table className="nv-table"><thead><tr>{columns.map(c => <th key={c.key}>{c.label}</th>)}{href && <th><span className="sr-only">Open record</span></th>}</tr></thead><tbody>{rows.map((row, i) => <tr key={String(row._id ?? i)}>{columns.map((c, j) => <td key={c.key}>{/status|priority|state|severity/.test(c.key) ? <Badge>{display(recordValue(row,c.key))}</Badge> : j === 0 && href ? <Link className="nv-record-link" href={href(row)}>{display(recordValue(row,c.key))}</Link> : display(recordValue(row,c.key))}</td>)}{href && <td><Link aria-label="Open record" href={href(row)}><ArrowUpRight size={15}/></Link></td>}</tr>)}</tbody></table>{rows.length === 0 && <Empty />}</div>; }
