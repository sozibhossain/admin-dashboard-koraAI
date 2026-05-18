"use client";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { analyticsApi } from "@/lib/api";
import { Header } from "@/components/layout/header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { getInitials, formatCurrency } from "@/lib/utils";
import {
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, LineChart, Line
} from "recharts";
import { TrendingUp, DollarSign, Users, Target, Download } from "lucide-react";

const revenueData = [
  { date: "May 1", revenue: 32000, leads: 120, conversions: 24 },
  { date: "May 8", revenue: 45000, leads: 156, conversions: 31 },
  { date: "May 13", revenue: 58401, leads: 189, conversions: 38 },
  { date: "May 15", revenue: 48000, leads: 145, conversions: 29 },
  { date: "May 22", revenue: 72000, leads: 210, conversions: 46 },
  { date: "May 29", revenue: 78245, leads: 234, conversions: 52 },
];

const partners = [
  { name: "James Anderson", leads: 662, deals: 154, revenue: 78490, convRate: 18.5 },
  { name: "Michael Brown", leads: 415, deals: 75, revenue: 54280, convRate: 18.3 },
  { name: "Sarah Mitchell", leads: 578, deals: 80, revenue: 43685, convRate: 19.7 },
  { name: "David Wilson", leads: 625, deals: 76, revenue: 36320, convRate: 19.4 },
  { name: "Lisa Martinez", leads: 398, deals: 44, revenue: 28970, convRate: 14.7 },
];

const territories = [
  { name: "Hamburg Center", leads: 846, convRate: 18.5, revenue: 78490, color: "bg-blue-500" },
  { name: "West District", leads: 410, convRate: 14.3, revenue: 54280, color: "bg-emerald-500" },
  { name: "East District", leads: 378, convRate: 14.2, revenue: 45480, color: "bg-purple-500" },
  { name: "North Zone", leads: 625, convRate: 17.2, revenue: 38100, color: "bg-amber-500" },
  { name: "South West", leads: 348, convRate: 14.7, revenue: 28970, color: "bg-cyan-500" },
  { name: "South East", leads: 340, convRate: 14.3, revenue: 28580, color: "bg-red-500" },
];

export default function AnalyticsPage() {
  const [period, setPeriod] = useState("30d");
  const [chartView, setChartView] = useState("Revenue");

  const { data, isLoading } = useQuery({
    queryKey: ["analytics", period],
    queryFn: () => analyticsApi.getSalesAnalytics({ period }).then((r) => r.data.data),
  });

  return (
    <div>
      <Header title="Sales Analytics" subtitle="Track performance, analyze trends and make data-driven decisions." />
      <div className="p-6 space-y-5">
        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
          <div className="flex gap-2 flex-wrap">
            {["May 1–May 31, 2025", "All Partners", "All Territories", "All Lead Sources"].map((f) => (
              <button key={f} className="flex items-center gap-1.5 text-xs px-3 py-1.5 bg-[#1e2d40] rounded-lg text-gray-300 border border-[#2a3547] hover:border-[#3a4557]">
                {f} ▾
              </button>
            ))}
          </div>
          <Button variant="outline" size="sm"><Download className="w-4 h-4" />Export</Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: "Total Revenue", value: "€286,450", change: "+20%", icon: DollarSign, color: "bg-amber-600" },
            { label: "Conversion Rate", value: "18.5%", change: "+3.4%", icon: TrendingUp, color: "bg-blue-600" },
            { label: "Leads → Customers", value: "3,348 → 601", change: "+16%", icon: Users, color: "bg-purple-600" },
            { label: "Avg Deal Value", value: "€477", change: "+4%", icon: Target, color: "bg-emerald-600" },
          ].map((s) => (
            <Card key={s.label}>
              <CardContent className="pt-4">
                <div className="flex items-center gap-3">
                  <div className={`w-9 h-9 rounded-lg ${s.color} flex items-center justify-center flex-shrink-0`}>
                    <s.icon className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <p className="text-base font-bold text-white">{s.value}</p>
                    <p className="text-[10px] text-gray-400">{s.label}</p>
                    <p className="text-[10px] text-emerald-400">{s.change} vs last 30 days</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Chart */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm">Performance Over Time</CardTitle>
              <div className="flex gap-1">
                {["Revenue", "Leads", "Conversions"].map((v) => (
                  <button key={v} onClick={() => setChartView(v)}
                    className={`px-2.5 py-1 text-xs rounded-lg transition-colors ${chartView === v ? "bg-blue-600 text-white" : "text-gray-400 hover:text-gray-200"}`}>
                    {v}
                  </button>
                ))}
                <select className="text-xs bg-[#1e2d40] text-gray-300 border border-[#2a3547] rounded-lg px-2 py-1 ml-2">
                  <option>Custom</option>
                </select>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={220}>
              <AreaChart data={revenueData}>
                <defs>
                  <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="date" tick={{ fontSize: 10, fill: "#64748b" }} axisLine={false} tickLine={false} />
                <YAxis hide />
                <Tooltip contentStyle={{ background: "#0d1a2d", border: "1px solid #1e2d40", borderRadius: "8px", fontSize: "11px" }} />
                <Area type="monotone" dataKey={chartView.toLowerCase()} stroke="#3b82f6" fill="url(#areaGrad)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Bottom Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          {/* Performance by Partner */}
          <Card>
            <CardHeader>
              <div className="flex justify-between"><CardTitle className="text-sm">Performance by Partner</CardTitle><button className="text-xs text-blue-400">View All</button></div>
            </CardHeader>
            <CardContent>
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b border-[#1e2d40]">
                    {["Partner", "Leads", "Deals", "Revenue", "Conv."].map((h) => (
                      <th key={h} className="py-2 text-left text-gray-500 font-medium">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {partners.map((p) => (
                    <tr key={p.name} className="border-b border-[#1e2d40]">
                      <td className="py-2">
                        <div className="flex items-center gap-1.5">
                          <Avatar className="w-5 h-5"><AvatarFallback className="text-[8px]">{getInitials(p.name)}</AvatarFallback></Avatar>
                          <span className="text-gray-300 truncate max-w-[80px]">{p.name.split(" ")[0]}</span>
                        </div>
                      </td>
                      <td className="py-2 text-gray-400">{p.leads}</td>
                      <td className="py-2 text-gray-400">{p.deals}</td>
                      <td className="py-2 text-gray-200">{formatCurrency(p.revenue)}</td>
                      <td className="py-2">
                        <div className="flex items-center gap-1">
                          <div className="w-10 h-1.5 bg-[#1e2d40] rounded-full">
                            <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${p.convRate * 3}%` }} />
                          </div>
                          <span className="text-emerald-400">{p.convRate}%</span>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <button className="text-xs text-blue-400 mt-3 hover:text-blue-300">View all partners →</button>
            </CardContent>
          </Card>

          {/* Performance by Territory */}
          <Card>
            <CardHeader>
              <div className="flex justify-between"><CardTitle className="text-sm">Performance by Territory</CardTitle><button className="text-xs text-blue-400">View All</button></div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {territories.map((t) => (
                  <div key={t.name}>
                    <div className="flex justify-between text-xs mb-1">
                      <div className="flex items-center gap-1.5">
                        <div className={`w-2 h-2 rounded-full ${t.color}`} />
                        <span className="text-gray-300">{t.name}</span>
                      </div>
                      <div className="flex gap-3 text-gray-400">
                        <span>{t.leads} leads</span>
                        <span className="text-emerald-400">{t.convRate}%</span>
                      </div>
                    </div>
                    <div className="h-1.5 bg-[#1e2d40] rounded-full">
                      <div className={`h-full ${t.color} rounded-full`} style={{ width: `${(t.revenue / 78490) * 100}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Sales Funnel + Performance Highlights */}
          <div className="space-y-4">
            <Card>
              <CardHeader><CardTitle className="text-sm">Sales Funnel</CardTitle></CardHeader>
              <CardContent>
                {[
                  { stage: "Leads", count: 3348, pct: 100, color: "bg-blue-500" },
                  { stage: "Contacted", count: 2182, pct: 65, color: "bg-blue-400" },
                  { stage: "Qualified", count: 1605, pct: 48, color: "bg-purple-500" },
                  { stage: "Proposal", count: 963, pct: 29, color: "bg-amber-500" },
                  { stage: "Closed", count: 601, pct: 18, color: "bg-emerald-500" },
                ].map((s) => (
                  <div key={s.stage} className="mb-2">
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-gray-400">{s.stage}</span>
                      <span className="text-gray-300">{s.count.toLocaleString()} <span className="text-gray-500">{s.pct}%</span></span>
                    </div>
                    <div className="h-2 bg-[#1e2d40] rounded-full">
                      <div className={`h-full ${s.color} rounded-full`} style={{ width: `${s.pct}%` }} />
                    </div>
                  </div>
                ))}
                <p className="text-xs text-gray-500 mt-2">Conversion Rate: 18.5% <span className="text-amber-400">+4.5% vs last 30 days</span></p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader><CardTitle className="text-sm">Performance Highlights</CardTitle></CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { label: "Best Day", value: "May 28, 2025", sub: "€73,400 in revenue", color: "bg-emerald-600/20" },
                    { label: "Best Partner", value: "James Anderson", sub: "€78,450 in revenue", color: "bg-blue-600/20" },
                    { label: "Best Territory", value: "Hamburg Center", sub: "€78,450 in revenue", color: "bg-purple-600/20" },
                    { label: "Biggest Deal", value: "May 12, 2025", sub: "100% vs previous day", color: "bg-amber-600/20" },
                  ].map((h) => (
                    <div key={h.label} className={`${h.color} rounded-lg p-2.5`}>
                      <p className="text-[10px] text-gray-400 mb-1">{h.label}</p>
                      <p className="text-xs font-semibold text-gray-100">{h.value}</p>
                      <p className="text-[10px] text-gray-400">{h.sub}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
