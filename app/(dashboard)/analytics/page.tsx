/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { analyticsApi } from "@/lib/api";
import { Header } from "@/components/layout/header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { formatCurrency, getInitials } from "@/lib/utils";
import { toast } from "sonner";
import {
  Area,
  AreaChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { DollarSign, Download, Target, TrendingUp, Users } from "lucide-react";

const PERIOD_OPTIONS = [
  { value: "7d", label: "Last 7 days" },
  { value: "30d", label: "Last 30 days" },
  { value: "90d", label: "Last 90 days" },
];

const FUNNEL_ORDER = ["new", "contacted", "qualified", "proposal", "won", "lost"];
const FUNNEL_COLORS: Record<string, string> = {
  new: "bg-blue-500",
  contacted: "bg-blue-400",
  qualified: "bg-purple-500",
  proposal: "bg-amber-500",
  won: "bg-emerald-500",
  lost: "bg-red-500",
};

const TERRITORY_COLORS = [
  "bg-blue-500",
  "bg-emerald-500",
  "bg-purple-500",
  "bg-amber-500",
  "bg-cyan-500",
  "bg-red-500",
  "bg-pink-500",
];

export default function AnalyticsPage() {
  const [period, setPeriod] = useState("30d");
  const [chartView, setChartView] = useState<"revenue" | "deals">("revenue");

  const { data: dashboardResponse, isLoading: dashboardLoading } = useQuery({
    queryKey: ["analytics-dashboard"],
    queryFn: () => analyticsApi.getDashboard().then((response) => response.data?.data),
  });

  const { data: revenueResponse } = useQuery({
    queryKey: ["analytics-revenue", period],
    queryFn: () =>
      analyticsApi.getRevenue({ period }).then((response) => response.data?.data),
  });

  const { data: partnersResponse } = useQuery({
    queryKey: ["analytics-partners"],
    queryFn: () => analyticsApi.getPartners().then((response) => response.data?.data),
  });

  const { data: territoriesResponse } = useQuery({
    queryKey: ["analytics-territories"],
    queryFn: () => analyticsApi.getTerritories().then((response) => response.data?.data),
  });

  const { data: funnelResponse } = useQuery({
    queryKey: ["analytics-funnel"],
    queryFn: () => analyticsApi.getFunnel().then((response) => response.data?.data),
  });

  const dashboard: any = dashboardResponse || {};
  const partners: any[] = partnersResponse || [];
  const territories: any[] = territoriesResponse || [];
  const funnel: any[] = funnelResponse || [];

  const chartData = useMemo(() => {
    return (revenueResponse || []).map((entry: any) => {
      const date = new Date(entry._id.year, entry._id.month - 1, entry._id.day);
      return {
        date: date.toLocaleDateString("en-US", { month: "short", day: "numeric" }),
        revenue: entry.revenue || 0,
        deals: entry.deals || 0,
      };
    });
  }, [revenueResponse]);

  const totalLeads = useMemo(
    () => funnel.reduce((sum, entry: any) => sum + (entry.count || 0), 0),
    [funnel]
  );

  const totalConverted = useMemo(
    () => funnel.find((entry: any) => entry.status === "won")?.count || 0,
    [funnel]
  );

  const topPartner = partners[0];
  const topTerritory = useMemo(
    () => [...territories].sort((a, b) => (b.revenue || 0) - (a.revenue || 0))[0],
    [territories]
  );

  const maxTerritoryRevenue = Math.max(
    1,
    ...territories.map((territory) => territory.revenue || 0)
  );

  const stats = [
    {
      label: "Total Revenue",
      value: formatCurrency(dashboard.totalRevenue || 0),
      icon: DollarSign,
      color: "bg-amber-600",
    },
    {
      label: "Conversion Rate",
      value: `${dashboard.conversionRate ?? 0}%`,
      icon: TrendingUp,
      color: "bg-blue-600",
    },
    {
      label: "Leads → Customers",
      value: `${totalLeads.toLocaleString()} → ${totalConverted.toLocaleString()}`,
      icon: Users,
      color: "bg-purple-600",
    },
    {
      label: "Avg Deal Value",
      value: formatCurrency(dashboard.avgDealValue || 0),
      icon: Target,
      color: "bg-emerald-600",
    },
  ];

  const handleExport = async () => {
    try {
      const response = await analyticsApi.export();
      const url = URL.createObjectURL(response.data);
      const link = document.createElement("a");
      link.href = url;
      link.download = `analytics-report-${new Date().toISOString().slice(0, 10)}.csv`;
      link.click();
      URL.revokeObjectURL(url);
      toast.success("Report exported");
    } catch (error: any) {
      toast.error(error?.message || "Export failed");
    }
  };

  return (
    <div>
      <Header
        title="Sales Analytics"
        subtitle="Track performance, analyze trends and make data-driven decisions."
        action={
          <Button size="sm" variant="outline" onClick={handleExport}>
            <Download className="mr-1 h-3.5 w-3.5" />
            Export
          </Button>
        }
      />

      <div className="space-y-5 p-3 sm:p-4 lg:p-6">
        <div className="flex flex-col items-start justify-between gap-3 sm:flex-row sm:items-center">
          <div className="flex flex-wrap gap-1 rounded-lg bg-[#0d1a2d] p-1">
            {PERIOD_OPTIONS.map((option) => (
              <button
                key={option.value}
                onClick={() => setPeriod(option.value)}
                className={`rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${
                  period === option.value
                    ? "bg-blue-600 text-white"
                    : "text-gray-400 hover:text-gray-200"
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
          {dashboardLoading
            ? Array.from({ length: 4 }).map((_, index) => (
                <Card key={index}>
                  <CardContent className="pt-4">
                    <Skeleton className="h-12 w-full" />
                  </CardContent>
                </Card>
              ))
            : stats.map((stat) => (
                <Card key={stat.label}>
                  <CardContent className="pt-4">
                    <div className="flex items-center gap-3">
                      <div
                        className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${stat.color}`}
                      >
                        <stat.icon className="h-4 w-4 text-white" />
                      </div>
                      <div>
                        <p className="text-base font-bold text-white">{stat.value}</p>
                        <p className="text-[10px] text-gray-400">{stat.label}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
        </div>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm">Performance Over Time</CardTitle>
              <div className="flex gap-1">
                {(["revenue", "deals"] as const).map((value) => (
                  <button
                    key={value}
                    onClick={() => setChartView(value)}
                    className={`rounded-lg px-2.5 py-1 text-xs transition-colors ${
                      chartView === value
                        ? "bg-blue-600 text-white"
                        : "text-gray-400 hover:text-gray-200"
                    }`}
                  >
                    {value === "revenue" ? "Revenue" : "Deals"}
                  </button>
                ))}
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {chartData.length === 0 ? (
              <p className="py-10 text-center text-xs text-gray-500">
                No revenue data for this period.
              </p>
            ) : (
              <ResponsiveContainer width="100%" height={220}>
                <AreaChart data={chartData}>
                  <defs>
                    <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <XAxis
                    dataKey="date"
                    tick={{ fontSize: 10, fill: "#64748b" }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis hide />
                  <Tooltip
                    contentStyle={{
                      background: "#0d1a2d",
                      border: "1px solid #1e2d40",
                      borderRadius: "8px",
                      fontSize: "11px",
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey={chartView}
                    stroke="#3b82f6"
                    fill="url(#areaGrad)"
                    strokeWidth={2}
                  />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Performance by Partner</CardTitle>
            </CardHeader>
            <CardContent className="overflow-x-auto">
              {partners.length === 0 ? (
                <p className="text-xs text-gray-500">No partner data yet.</p>
              ) : (
                <table className="w-full text-xs">
                  <thead>
                    <tr className="border-b border-[#1e2d40]">
                      {["Partner", "Leads", "Deals", "Revenue", "Conv."].map((heading) => (
                        <th
                          key={heading}
                          className="py-2 text-left font-medium text-gray-500"
                        >
                          {heading}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {partners.slice(0, 8).map((row: any, index) => (
                      <tr
                        key={row.partner?._id || index}
                        className="border-b border-[#1e2d40] last:border-0"
                      >
                        <td className="py-2">
                          <div className="flex items-center gap-1.5">
                            <Avatar className="h-5 w-5">
                              {row.partner?.userId?.profileImage?.url ? (
                                <AvatarImage
                                  src={row.partner.userId.profileImage.url}
                                  alt={row.partner.userId?.name}
                                />
                              ) : (
                                <AvatarFallback className="text-[8px]">
                                  {getInitials(
                                    row.partner?.userId?.name || row.partner?.businessName || "P"
                                  )}
                                </AvatarFallback>
                              )}
                            </Avatar>
                            <span className="max-w-[100px] truncate text-gray-300">
                              {row.partner?.userId?.name || row.partner?.businessName}
                            </span>
                          </div>
                        </td>
                        <td className="py-2 text-gray-400">{row.leads}</td>
                        <td className="py-2 text-gray-400">{row.dealsWon}</td>
                        <td className="py-2 text-gray-200">
                          {formatCurrency(row.revenue)}
                        </td>
                        <td className="py-2">
                          <div className="flex items-center gap-1">
                            <div className="h-1.5 w-10 rounded-full bg-[#1e2d40]">
                              <div
                                className="h-full rounded-full bg-emerald-500"
                                style={{
                                  width: `${Math.min(100, row.conversionRate * 3)}%`,
                                }}
                              />
                            </div>
                            <span className="text-emerald-400">{row.conversionRate}%</span>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Performance by Territory</CardTitle>
            </CardHeader>
            <CardContent>
              {territories.length === 0 ? (
                <p className="text-xs text-gray-500">No territory data yet.</p>
              ) : (
                <div className="space-y-3">
                  {territories.slice(0, 8).map((entry: any, index) => {
                    const color = TERRITORY_COLORS[index % TERRITORY_COLORS.length];
                    const pct = (entry.revenue / maxTerritoryRevenue) * 100;
                    return (
                      <div key={entry.territory?._id || index}>
                        <div className="mb-1 flex justify-between text-xs">
                          <div className="flex items-center gap-1.5">
                            <div className={`h-2 w-2 rounded-full ${color}`} />
                            <span className="text-gray-300">{entry.territory?.name}</span>
                          </div>
                          <div className="flex gap-3 text-gray-400">
                            <span>{entry.leads} leads</span>
                            <span className="text-gray-200">
                              {formatCurrency(entry.revenue || 0)}
                            </span>
                          </div>
                        </div>
                        <div className="h-1.5 rounded-full bg-[#1e2d40]">
                          <div
                            className={`h-full rounded-full ${color}`}
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>

          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Sales Funnel</CardTitle>
              </CardHeader>
              <CardContent>
                {funnel.length === 0 ? (
                  <p className="text-xs text-gray-500">No lead data yet.</p>
                ) : (
                  FUNNEL_ORDER.filter((status) => status !== "lost").map((status) => {
                    const entry = funnel.find((item: any) => item.status === status);
                    const count = entry?.count || 0;
                    const pct = totalLeads > 0 ? Math.round((count / totalLeads) * 100) : 0;
                    return (
                      <div key={status} className="mb-2">
                        <div className="mb-1 flex justify-between text-xs">
                          <span className="capitalize text-gray-400">{status}</span>
                          <span className="text-gray-300">
                            {count.toLocaleString()}{" "}
                            <span className="text-gray-500">{pct}%</span>
                          </span>
                        </div>
                        <div className="h-2 rounded-full bg-[#1e2d40]">
                          <div
                            className={`h-full rounded-full ${FUNNEL_COLORS[status]}`}
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                      </div>
                    );
                  })
                )}
                <p className="mt-2 text-xs text-gray-500">
                  Conversion rate:{" "}
                  <span className="text-emerald-400">{dashboard.conversionRate ?? 0}%</span>
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Highlights</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-2">
                  <Highlight
                    label="Best Partner"
                    value={topPartner?.partner?.userId?.name || "—"}
                    sub={
                      topPartner
                        ? `${formatCurrency(topPartner.revenue || 0)} revenue`
                        : ""
                    }
                    color="bg-blue-600/20"
                  />
                  <Highlight
                    label="Best Territory"
                    value={topTerritory?.territory?.name || "—"}
                    sub={
                      topTerritory
                        ? `${formatCurrency(topTerritory.revenue || 0)} revenue`
                        : ""
                    }
                    color="bg-purple-600/20"
                  />
                  <Highlight
                    label="Total Deals Won"
                    value={(dashboard.leadsFunnel?.find((entry: any) => entry._id === "won")?.count || 0).toLocaleString()}
                    sub="across all partners"
                    color="bg-emerald-600/20"
                  />
                  <Highlight
                    label="Avg Deal Value"
                    value={formatCurrency(dashboard.avgDealValue || 0)}
                    sub="per won deal"
                    color="bg-amber-600/20"
                  />
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}

function Highlight({
  label,
  value,
  sub,
  color,
}: {
  label: string;
  value: string;
  sub?: string;
  color: string;
}) {
  return (
    <div className={`rounded-lg p-2.5 ${color}`}>
      <p className="mb-1 text-[10px] text-gray-400">{label}</p>
      <p className="truncate text-xs font-semibold text-gray-100">{value}</p>
      {sub ? <p className="text-[10px] text-gray-400">{sub}</p> : null}
    </div>
  );
}
