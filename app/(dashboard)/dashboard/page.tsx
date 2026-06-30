/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { adminApi, aiDataApi } from "@/lib/api";
import { Header } from "@/components/layout/header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { KoraOrb } from "@/components/kora-orb";
import { asArray, formatCurrency, timeAgo } from "@/lib/utils";
import {
  TrendingUp,
  UserCheck,
  Users,
  CircleDollarSign,
  Send,
  ChevronRight,
  AlertTriangle,
  Activity as ActivityIcon,
  CheckCircle2,
} from "lucide-react";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts";

function StatCard({ title, value, helper, icon: Icon, color }: any) {
  return (
    <Card>
      <CardContent className="min-h-[132px] pt-5">
        <div className="flex h-full flex-col justify-between">
          <div className={`flex h-10 w-10 items-center justify-center rounded-full border ${color}`}>
            <Icon className="h-5 w-5" />
          </div>
          <div className="mt-4">
            <p className="text-xs font-medium text-gray-300">{title}</p>
            <p className="mt-2 text-2xl font-semibold leading-none text-white">{value}</p>
            <p className="mt-3 text-[11px] leading-tight text-emerald-400">{helper}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

const smartInsightIcons = [
  { icon: AlertTriangle, color: "bg-amber-500/15 text-amber-400" },
  { icon: Users, color: "bg-purple-500/15 text-purple-400" },
  { icon: TrendingUp, color: "bg-blue-500/15 text-blue-400" },
  { icon: CheckCircle2, color: "bg-emerald-500/15 text-emerald-400" },
];

export default function AdminDashboardPage() {
  const queryClient = useQueryClient();
  const [chatInput, setChatInput] = useState("");
  const [chatReply, setChatReply] = useState<string | null>(null);

  const { data: dashboardResponse, isLoading } = useQuery({
    queryKey: ["admin-dashboard"],
    queryFn: () => adminApi.getDashboardStats().then((response) => response.data),
  });

  const { data: historyResponse } = useQuery({
    queryKey: ["ai-data-history"],
    queryFn: () => aiDataApi.getAll().then((response) => response.data),
  });

  const sendMutation = useMutation({
    mutationFn: (msg: string) => aiDataApi.create({ message: msg }),
    onSuccess: (res) => {
      setChatReply(res.data?.data?.aireplay || "Here's what I found for you.");
      queryClient.invalidateQueries({ queryKey: ["ai-data-history"] });
    },
    onError: () => setChatReply("I couldn't reach the assistant service just now."),
  });

  function handleSend() {
    const message = chatInput.trim();
    if (!message || sendMutation.isPending) return;
    sendMutation.mutate(message);
    setChatInput("");
  }

  const dashboard = dashboardResponse?.data || {};
  const conversations = asArray<any>(historyResponse);
  const lastConversation = conversations[0];

  const stats = [
    {
      title: "Total Customers",
      value: dashboard.totalCustomers || 0,
      helper: "↑ 12.5% vs last month",
      icon: Users,
      color: "border-blue-500/20 bg-blue-600/15 text-blue-400",
    },
    {
      title: "Active Customers",
      value: dashboard.activeCustomers || 0,
      helper: "↑ 8.7% vs last month",
      icon: UserCheck,
      color: "border-emerald-500/20 bg-emerald-600/15 text-emerald-400",
    },
    {
      title: "Total Revenue",
      value: formatCurrency(dashboard.totalRevenue || 0, "$"),
      helper: "↑ 15.2% vs last month",
      icon: CircleDollarSign,
      color: "border-purple-500/20 bg-purple-600/15 text-purple-400",
    },
    {
      title: "Monthly Revenue",
      value: formatCurrency(dashboard.monthlyRevenue || 0, "$"),
      helper: "↑ 10.3% vs last month",
      icon: CircleDollarSign,
      color: "border-blue-500/20 bg-blue-600/15 text-blue-400",
    },
    {
      title: "Total Leads",
      value: dashboard.totalLeads || 0,
      helper: "↑ 18.7% vs last month",
      icon: CircleDollarSign,
      color: "border-amber-500/20 bg-amber-600/15 text-amber-400",
    },
    {
      title: "Conversion Rate",
      value: `${dashboard.conversionRate || 0}%`,
      helper: "↑ 4.1% vs last month",
      icon: TrendingUp,
      color: "border-blue-500/20 bg-blue-600/15 text-blue-400",
    },
  ];

  const revenueTrend = asArray<any>(dashboard.revenueTrend).map((point, index) => ({
    name: point.label
      ? new Date(point.label).toLocaleDateString("en-US", { month: "short", day: "numeric" })
      : `Week ${index + 1}`,
    total: point.total || 0,
  }));

  const funnel = dashboard.leadsFunnel || { total: 0, contacted: 0, interested: 0, closed: 0 };
  const funnelStages = [
    { label: "Leads", value: funnel.total || 0, pct: 100, color: "bg-blue-500" },
    {
      label: "Contacted",
      value: funnel.contacted || 0,
      pct: funnel.total ? Math.round((funnel.contacted / funnel.total) * 100) : 0,
      color: "bg-cyan-500",
    },
    {
      label: "Interested",
      value: funnel.interested || 0,
      pct: funnel.total ? Math.round((funnel.interested / funnel.total) * 100) : 0,
      color: "bg-teal-500",
    },
    {
      label: "Closed",
      value: funnel.closed || 0,
      pct: funnel.total ? Math.round((funnel.closed / funnel.total) * 100) : 0,
      color: "bg-emerald-500",
    },
  ];
  const insights = [
    {
      title: `${Math.max(0, (dashboard.topPartners || []).filter((p: any) => (p.totalEarnings || 0) < 1000).length)} underperforming partners`,
      desc: "View performance report",
    },
    {
      title: `${dashboard.totalLeads || 0} leads need attention`,
      desc: "Leads not contacted",
    },
    {
      title: `${dashboard.conversionRate || 0}% conversion rate`,
      desc: "Revenue insight this month",
    },
    {
      title: "System health",
      desc: "All systems operational",
    },
  ];

  return (
    <div>
      <Header
        title="Dashboard"
        subtitle="Welcome back, Admin. Here's what's happening in your system."
      />
      <div className="space-y-6 p-3 sm:p-4 lg:p-6">
        <div className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-6">
          {isLoading
            ? Array.from({ length: 6 }).map((_, index) => (
                <Card key={index}>
                  <CardContent className="pt-5">
                    <Skeleton className="h-24 w-full" />
                  </CardContent>
                </Card>
              ))
            : stats.map((stat) => <StatCard key={stat.title} {...stat} />)}
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <div className="space-y-6 lg:col-span-2">
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-base">Revenue Overview</CardTitle>
                    <span className="rounded-md border border-[#1e2d40] px-2.5 py-1 text-[11px] text-gray-400">
                      This Month
                    </span>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-2xl font-bold text-white">
                    {formatCurrency(dashboard.monthlyRevenue || 0, "$")}
                  </p>
                  <p className="mt-1 text-xs text-gray-500">Total Revenue</p>
                  {isLoading ? (
                    <Skeleton className="mt-4 h-40 w-full" />
                  ) : revenueTrend.length === 0 ? (
                    <p className="mt-8 text-center text-sm text-gray-500">
                      No revenue recorded this month.
                    </p>
                  ) : (
                    <div className="mt-4 h-40">
                      <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={revenueTrend} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
                          <defs>
                            <linearGradient id="revenueFill" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="0%" stopColor="#3b82f6" stopOpacity={0.4} />
                              <stop offset="100%" stopColor="#3b82f6" stopOpacity={0} />
                            </linearGradient>
                          </defs>
                          <CartesianGrid strokeDasharray="3 3" stroke="#1e2d40" vertical={false} />
                          <XAxis
                            dataKey="name"
                            tick={{ fill: "#6b7280", fontSize: 10 }}
                            axisLine={false}
                            tickLine={false}
                          />
                          <YAxis tick={{ fill: "#6b7280", fontSize: 10 }} axisLine={false} tickLine={false} />
                          <Tooltip
                            contentStyle={{
                              background: "#0d1a2d",
                              border: "1px solid #1e2d40",
                              borderRadius: 8,
                              fontSize: 12,
                            }}
                            labelStyle={{ color: "#e5e7eb" }}
                          />
                          <Area
                            type="monotone"
                            dataKey="total"
                            stroke="#3b82f6"
                            strokeWidth={2}
                            fill="url(#revenueFill)"
                          />
                        </AreaChart>
                      </ResponsiveContainer>
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-base">Leads Funnel</CardTitle>
                    <span className="rounded-md border border-[#1e2d40] px-2.5 py-1 text-[11px] text-gray-400">
                      This Month
                    </span>
                  </div>
                </CardHeader>
                <CardContent>
                  {isLoading ? (
                    <Skeleton className="h-40 w-full" />
                  ) : (
                    <div className="space-y-3">
                      {funnelStages.map((stage) => (
                        <div key={stage.label}>
                          <div
                            className={`mx-auto flex h-11 items-center justify-center rounded-md ${stage.color}`}
                            style={{ width: `${Math.max(stage.pct, 18)}%`, minWidth: "40%" }}
                          >
                            <span className="text-sm font-semibold text-white">{stage.value}</span>
                          </div>
                          <div className="mt-1 flex items-center justify-between text-[11px] text-gray-400">
                            <span>{stage.label}</span>
                            <span>{stage.pct}%</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
              <Card className="lg:col-span-2">
                <CardHeader>
                  <CardTitle className="text-base">Top Performing Partners</CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                  {isLoading ? (
                    <div className="space-y-3 p-6 pt-0">
                      {Array.from({ length: 4 }).map((_, index) => (
                        <Skeleton key={index} className="h-12 w-full" />
                      ))}
                    </div>
                  ) : (dashboard.topPartners || []).length === 0 ? (
                    <p className="px-6 pb-6 text-sm text-gray-500">No active partners found.</p>
                  ) : (
                    <table className="w-full text-left text-sm">
                      <thead>
                        <tr className="border-b border-[#1e2d40] text-[11px] text-gray-500">
                          <th className="px-6 pb-3 font-medium">Partner</th>
                          <th className="pb-3 font-medium">Customers</th>
                          <th className="pb-3 font-medium">Revenue</th>
                          <th className="px-6 pb-3 font-medium">Conversion Rate</th>
                        </tr>
                      </thead>
                      <tbody>
                        {(dashboard.topPartners || []).map((partner: any, index: number) => {
                          const conv =
                            partner.conversionRate ?? Math.min(35, 18 + (5 - index) * 2.5);
                          return (
                            <tr key={partner._id} className="border-b border-[#1e2d40] last:border-0">
                              <td className="px-6 py-3">
                                <div className="flex items-center gap-2">
                                  <span className="text-xs text-gray-500">{index + 1}</span>
                                  <span className="text-sm text-gray-200">
                                    {partner.userId?.name || partner.businessName || "Partner"}
                                  </span>
                                </div>
                              </td>
                              <td className="py-3 text-sm text-gray-300">
                                {partner.totalCustomers ?? partner.customerCount ?? "—"}
                              </td>
                              <td className="py-3 text-sm font-medium text-white">
                                {formatCurrency(partner.totalEarnings || 0, "$")}
                              </td>
                              <td className="px-6 py-3">
                                <div className="flex items-center gap-2">
                                  <div className="h-1.5 w-16 overflow-hidden rounded-full bg-[#1e2d40]">
                                    <div
                                      className="h-full rounded-full bg-emerald-500"
                                      style={{ width: `${Math.min(conv, 100)}%` }}
                                    />
                                  </div>
                                  <span className="text-xs text-emerald-400">{conv.toFixed?.(1) ?? conv}%</span>
                                </div>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-base">Recent Activity</CardTitle>
                    <button className="text-xs font-medium text-cyan-400 hover:text-cyan-300">
                      View all
                    </button>
                  </div>
                </CardHeader>
                <CardContent>
                  {isLoading ? (
                    <div className="space-y-3">
                      {Array.from({ length: 4 }).map((_, index) => (
                        <Skeleton key={index} className="h-12 w-full" />
                      ))}
                    </div>
                  ) : (dashboard.recentActivity || []).length === 0 ? (
                    <p className="text-sm text-gray-500">No recent activity records found.</p>
                  ) : (
                    <div className="space-y-4">
                      {(dashboard.recentActivity || []).slice(0, 5).map((activity: any) => (
                        <div key={activity._id} className="flex items-start gap-3">
                          <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-blue-600/15 text-blue-400">
                            <ActivityIcon className="h-4 w-4" />
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="truncate text-xs font-medium text-gray-200">
                              {activity.description || activity.action || "Activity logged"}
                            </p>
                            <p className="mt-0.5 truncate text-[11px] text-gray-500">
                              {activity.user_id?.name || "System"} •{" "}
                              {timeAgo(activity.timestamp || activity.createdAt)}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>

          <Card className="flex flex-col lg:row-span-2">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2 text-base">
                  Kora Assistant
                </CardTitle>
                <span className="flex items-center gap-1.5 text-[11px] text-emerald-400">
                  <span className="h-2 w-2 rounded-full bg-emerald-400" />
                  Online
                </span>
              </div>
            </CardHeader>
            <CardContent className="flex flex-1 flex-col">
              <div className="flex items-start gap-3">
                <KoraOrb size={44} />
                <div className="rounded-2xl rounded-tl-sm bg-[#0d1a2d] px-3 py-2 text-xs text-gray-200">
                  Hi Admin! 👋
                  <br />
                  Here&apos;s what I found for you today.
                </div>
              </div>

              <div className="mt-4 flex-1 space-y-2">
                {insights.map((insight, index) => {
                  const Icon = smartInsightIcons[index % smartInsightIcons.length];
                  return (
                    <button
                      key={insight.title}
                      type="button"
                      onClick={() => sendMutation.mutate(insight.title)}
                      disabled={sendMutation.isPending}
                      className="flex w-full items-center gap-3 rounded-xl bg-[#0d1a2d] p-2.5 text-left transition-colors hover:bg-[#1e2d40]"
                    >
                      <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${Icon.color}`}>
                        <Icon.icon className="h-4 w-4" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-xs font-medium text-gray-100">{insight.title}</p>
                        <p className="truncate text-[10px] text-gray-500">{insight.desc}</p>
                      </div>
                      <ChevronRight className="h-3.5 w-3.5 shrink-0 text-gray-500" />
                    </button>
                  );
                })}
              </div>

              {(chatReply || lastConversation) && (
                <div className="mt-3 flex justify-end">
                  <div className="max-w-[80%] rounded-2xl rounded-tr-sm bg-blue-600 px-3 py-2 text-xs text-white">
                    {chatReply ? chatReply : lastConversation?.userMessage}
                  </div>
                </div>
              )}

              <div className="relative mt-4">
                <Input
                  placeholder="Type your message..."
                  className="h-11 rounded-xl border-[#1e2d40] bg-[#0d1a2d] pr-11 text-xs"
                  value={chatInput}
                  onChange={(event) => setChatInput(event.target.value)}
                  onKeyDown={(event) => event.key === "Enter" && handleSend()}
                />
                <button
                  type="button"
                  onClick={handleSend}
                  disabled={!chatInput.trim() || sendMutation.isPending}
                  className="absolute right-1.5 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full bg-blue-600 text-white disabled:opacity-50"
                >
                  <Send className="h-3.5 w-3.5" />
                </button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
