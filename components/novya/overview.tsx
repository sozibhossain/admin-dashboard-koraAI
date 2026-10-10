"use client";

import "@/app/overview.css";
import { useState, type ReactNode } from "react";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { ArrowUpRight, Building2, Euro, Activity, AlertTriangle, Sparkles, ShieldCheck, Rocket, CircleCheck } from "lucide-react";
import { novya, errorMessage } from "@/lib/novya";
import { PageHeading, Panel, QueryState } from "./primitives";

type Revenue = { month: string; key: string; total: number; subscription: number; usage: number; services: number };
type OverviewData = {
    kpis: {
        monthlyRevenue: { value: number; changePct: number };
        activeOrganizations: { value: number; onboarding: number };
        platformHealth: { uptimePct: number | null; status: string };
        openEscalations: { value: number; critical: number };
    };
    revenueGrowth: { series: Revenue[] };
    criticalActivity: { type: string; title: string; subtitle: string; at: string }[];
    insights: { type: string; title: string; subtitle: string; detail?: string; action: string; route: string }[];
};
const money = (n: number) => new Intl.NumberFormat("en-DE", { style: "currency", currency: "EUR", maximumFractionDigits: 0 }).format(n);
const categories = [["Subscription revenue", "subscription"], ["Usage & add-ons", "usage"], ["Setup & services", "services"]] as const;

function OverviewMetric({ label, value, note, icon, badge, tone = "neutral", trend }: {
    label: string; value: ReactNode; note: string; icon: ReactNode; badge?: string;
    tone?: "neutral" | "positive" | "warning"; trend?: number[];
}) {
    const max = Math.max(...(trend ?? []), 1);
    return <div className={`ov-metric ov-tone-${tone}`}>
        <div className="ov-metric-top"><h2>{label}</h2><span className="ov-icon">{icon}</span></div>
        <div className="ov-metric-value"><strong>{value}</strong>{badge && <span className="ov-chip">{badge}</span>}
            {trend && trend.length > 1 && <svg viewBox="0 0 100 32" role="img" aria-label="Paid revenue trend over the displayed months"><polyline points={trend.map((v, i) => `${i * 100 / (trend.length - 1)},${28 - v / max * 24}`).join(" ")} fill="none" stroke="currentColor" strokeWidth="1.6"/></svg>}
        </div><p>{note}</p>
    </div>;
}

export function OverviewPage() {
    const query = useQuery({ queryKey: ["novya", "overview"], queryFn: () => novya.get<OverviewData>("/overview"), refetchInterval: 60000 });
    const [month, setMonth] = useState<string>();
    const data = query.data?.data;
    const series = data?.revenueGrowth.series ?? [];
    const selected = series.find(m => m.key === month) ?? series.at(-1);
    const revenue = selected?.total ?? 0;
    const period = series.length ? `${series[0].month} – ${series.at(-1)?.month} ${series.at(-1)?.key.slice(0, 4)}` : "Paid invoice revenue by month";
    return <div className="ov-page">
        <PageHeading title="NOVYA Command Center" subtitle="Platform performance, risk and team operations at a glance." action={<Link href="/kora" className="nv-button"><Sparkles size={14}/>Ask Kora</Link>}/>
        <QueryState loading={query.isPending} error={query.error ? errorMessage(query.error) : undefined} retry={() => query.refetch()}/>
        {data && <>
            <div className="ov-metrics">
                <OverviewMetric label="Monthly Revenue" icon={<Euro size={16}/>} value={money(data.kpis.monthlyRevenue.value)} badge={`${data.kpis.monthlyRevenue.changePct > 0 ? "+" : ""}${data.kpis.monthlyRevenue.changePct}%`} tone={data.kpis.monthlyRevenue.changePct > 0 ? "positive" : data.kpis.monthlyRevenue.changePct < 0 ? "warning" : "neutral"} note="Current recurring revenue · paid revenue change" trend={series.map(m => m.total)}/>
                <OverviewMetric label="Active Organizations" icon={<Building2 size={16}/>} value={data.kpis.activeOrganizations.value.toLocaleString()} note={`${data.kpis.activeOrganizations.onboarding} organizations onboarding`}/>
                <OverviewMetric label="Platform Health" icon={<Activity size={16}/>} value={data.kpis.platformHealth.uptimePct == null ? "—" : `${data.kpis.platformHealth.uptimePct}%`} badge={data.kpis.platformHealth.uptimePct == null ? undefined : data.kpis.platformHealth.status} tone={data.kpis.platformHealth.uptimePct == null ? "neutral" : /healthy|operational/i.test(data.kpis.platformHealth.status) ? "positive" : "warning"} note={data.kpis.platformHealth.uptimePct == null ? "No telemetry available" : "Reported platform uptime"}/>
                <OverviewMetric label="Open Escalations" icon={<AlertTriangle size={16}/>} value={data.kpis.openEscalations.value.toLocaleString()} badge={`${data.kpis.openEscalations.critical} critical`} tone={data.kpis.openEscalations.critical > 0 ? "warning" : "neutral"} note={data.kpis.openEscalations.value ? "Needs admin attention" : "No open escalations"}/>
            </div>
            <div className="ov-main-grid">
                <Panel className="ov-revenue" title="Revenue & Growth" subtitle={period} action={<span className="ov-period">Monthly · EUR</span>}>
                    {series.length ? <div className="ov-months" aria-label="Revenue month">{series.map(m => <button type="button" key={m.key} aria-pressed={selected?.key === m.key} className={`ov-month ${selected?.key === m.key ? "is-selected" : ""}`} onClick={() => setMonth(m.key)}><span>{m.month}</span><strong>{money(m.total)}</strong></button>)}</div> : <p className="ov-no-months">No paid invoice history yet.</p>}
                    <div className="ov-revenue-categories">{categories.map(([label, key]) => {
                        const amount = selected?.[key] ?? 0;
                        const share = revenue > 0 ? amount / revenue * 100 : 0;
                        return <div className="ov-revenue-category" key={key}><strong>{money(amount)}</strong><div><h3>{label}</h3><p>{revenue > 0 ? `${share.toFixed(1)}% of ${selected?.month} paid revenue` : "No paid revenue recorded"}</p></div><span className="ov-chip">{share.toFixed(1)}%</span></div>;
                    })}</div><p className="ov-source-note">Based on paid invoices for {selected?.month ?? "the selected month"}.</p>
                </Panel>
                <Panel className="ov-activity" title="Critical Activity" subtitle="Latest incidents, alerts and deployments" action={<Link className="ov-text-link" href="/system-health">View all<ArrowUpRight size={12}/></Link>}>
                    {data.criticalActivity.length ? <div className="ov-activity-list">{data.criticalActivity.map((a, index) => {
                        const Icon = a.type === "deployment" ? Rocket : a.type === "incident" ? ShieldCheck : AlertTriangle;
                        return <Link key={`${a.type}-${a.at}-${index}`} href={a.type === "incident" || a.type === "deployment" ? "/system-health" : "/live-view"} className="ov-activity-item"><span className="ov-icon"><Icon size={16}/></span><div><strong>{a.title}</strong><p>{a.subtitle}</p><time dateTime={a.at}>{new Date(a.at).toLocaleString("en-GB", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}</time></div><ArrowUpRight size={13}/></Link>;
                    })}</div> : <div className="ov-activity-empty"><span className="ov-empty-icon"><CircleCheck size={25}/></span><strong>No critical activity</strong><p>No open incidents or recent alerts.</p><Link className="ov-text-link" href="/system-health">View system health<ArrowUpRight size={12}/></Link></div>}
                </Panel>
            </div>
            <section className="ov-insights" aria-labelledby="overview-insights-title"><div className="ov-section-heading"><h2 id="overview-insights-title">Admin insights</h2><p>Signals from your platform records</p></div>
                {data.insights.length ? <div className="ov-insight-grid">{data.insights.map(i => <article className="ov-insight" key={i.type}><div className="ov-insight-top"><div><h3>{i.title}</h3><p>{i.subtitle}</p></div><span className="ov-icon"><Sparkles size={16}/></span></div>{i.detail && <p className="ov-insight-detail">{i.detail}</p>}<Link className="nv-button" href={i.route.startsWith("/sales") ? "/management/activity" : i.route}>{i.action}<ArrowUpRight size={12}/></Link></article>)}</div> : <div className="ov-insight-empty"><span className="ov-icon"><Sparkles size={18}/></span><div><strong>No new insights</strong><p>Insights appear when platform records show actionable changes.</p></div></div>}
            </section><div className="ov-data-footer"><span>Source: NOVYA overview API</span><span>Updated {new Date(query.dataUpdatedAt).toLocaleTimeString("en-GB")}</span></div>
        </>}
    </div>;
}

