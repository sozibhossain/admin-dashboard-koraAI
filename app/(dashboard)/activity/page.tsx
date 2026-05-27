/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { activityApi } from "@/lib/api";
import { Header } from "@/components/layout/header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { getInitials, timeAgo } from "@/lib/utils";
import { toast } from "sonner";
import {
  Activity as ActivityIcon,
  ChevronLeft,
  ChevronRight,
  Download,
  Settings,
  Shield,
  Users,
  Zap,
} from "lucide-react";

const TABS = [
  { key: "today", label: "Today" },
  { key: "yesterday", label: "Yesterday" },
  { key: "week", label: "This Week" },
  { key: "month", label: "This Month" },
  { key: "all", label: "All time" },
];

const TYPE_OPTIONS = [
  { value: "all", label: "All Types" },
  { value: "user_action", label: "User Actions" },
  { value: "system_event", label: "System Events" },
  { value: "automation", label: "Automations" },
  { value: "security_event", label: "Security Events" },
];

const TYPE_META: Record<string, { icon: any; color: string; badgeColor: string; label: string }> = {
  user_action: {
    icon: Users,
    color: "text-blue-400",
    badgeColor: "bg-blue-600/20 text-blue-400",
    label: "User Action",
  },
  system_event: {
    icon: Settings,
    color: "text-amber-400",
    badgeColor: "bg-amber-600/20 text-amber-400",
    label: "System Event",
  },
  automation: {
    icon: Zap,
    color: "text-purple-400",
    badgeColor: "bg-purple-600/20 text-purple-400",
    label: "Automation",
  },
  security_event: {
    icon: Shield,
    color: "text-red-400",
    badgeColor: "bg-red-600/20 text-red-400",
    label: "Security Event",
  },
};

const buildDateRange = (key: string) => {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  switch (key) {
    case "today":
      return { startDate: today.toISOString(), endDate: now.toISOString() };
    case "yesterday": {
      const start = new Date(today);
      start.setDate(start.getDate() - 1);
      const end = new Date(today);
      end.setMilliseconds(end.getMilliseconds() - 1);
      return { startDate: start.toISOString(), endDate: end.toISOString() };
    }
    case "week": {
      const start = new Date(today);
      start.setDate(start.getDate() - 6);
      return { startDate: start.toISOString(), endDate: now.toISOString() };
    }
    case "month": {
      const start = new Date(today.getFullYear(), today.getMonth(), 1);
      return { startDate: start.toISOString(), endDate: now.toISOString() };
    }
    default:
      return {};
  }
};

const typeMeta = (type: string) =>
  TYPE_META[type] || {
    icon: ActivityIcon,
    color: "text-gray-400",
    badgeColor: "bg-gray-600/20 text-gray-400",
    label: type || "Event",
  };

export default function ActivityPage() {
  const [page, setPage] = useState(1);
  const [tab, setTab] = useState("today");
  const [typeFilter, setTypeFilter] = useState("all");
  const limit = 10;

  const dateRange = useMemo(() => buildDateRange(tab), [tab]);

  const { data: feedResponse, isLoading } = useQuery({
    queryKey: ["activity", page, typeFilter, tab],
    queryFn: () =>
      activityApi
        .getAll({
          page,
          limit,
          type: typeFilter === "all" ? undefined : typeFilter,
          ...dateRange,
        })
        .then((response) => response.data),
  });

  const { data: statsResponse } = useQuery({
    queryKey: ["activity-stats"],
    queryFn: () => activityApi.getStats().then((response) => response.data?.data),
  });

  const activities: any[] = feedResponse?.data || [];
  const meta = feedResponse?.meta || { total: 0, page: 1 };
  const totalPages = Math.max(1, Math.ceil((meta.total || 0) / limit));

  const byTypeCounts: Record<string, number> = useMemo(() => {
    const out: Record<string, number> = {};
    (statsResponse?.byType || []).forEach((entry: any) => {
      out[entry._id] = entry.count;
    });
    return out;
  }, [statsResponse]);

  const totalCount = useMemo(
    () => Object.values(byTypeCounts).reduce((sum, count) => sum + count, 0),
    [byTypeCounts]
  );

  const overview = useMemo(
    () => [
      { key: "user_action", color: "bg-blue-500" },
      { key: "system_event", color: "bg-amber-500" },
      { key: "automation", color: "bg-purple-500" },
      { key: "security_event", color: "bg-red-500" },
    ].map((item) => {
      const count = byTypeCounts[item.key] || 0;
      const pct = totalCount > 0 ? Math.round((count / totalCount) * 100) : 0;
      const meta = typeMeta(item.key);
      return { ...item, label: meta.label, value: count, pct };
    }),
    [byTypeCounts, totalCount]
  );

  const stats = [
    {
      label: "Total Activities",
      value: totalCount,
      icon: ActivityIcon,
      color: "bg-blue-600",
    },
    {
      label: "Today",
      value: statsResponse?.todayTotal ?? "—",
      icon: Zap,
      color: "bg-emerald-600",
    },
    {
      label: "Active Users (today)",
      value: statsResponse?.activeUsers ?? "—",
      icon: Users,
      color: "bg-purple-600",
    },
    {
      label: "User Actions",
      value: byTypeCounts.user_action || 0,
      icon: Users,
      color: "bg-amber-600",
    },
  ];

  const handleExport = async () => {
    try {
      const response = await activityApi.export();
      const url = URL.createObjectURL(response.data);
      const link = document.createElement("a");
      link.href = url;
      link.download = `activity-log-${new Date().toISOString().slice(0, 10)}.csv`;
      link.click();
      URL.revokeObjectURL(url);
      toast.success("Activity log exported");
    } catch (error: any) {
      toast.error(error?.message || "Failed to export");
    }
  };

  return (
    <div>
      <Header
        title="Activity"
        subtitle="Monitor all platform activity and stay updated in real-time."
        action={
          <Button size="sm" variant="outline" onClick={handleExport}>
            <Download className="mr-1 h-3.5 w-3.5" />
            Export CSV
          </Button>
        }
      />
      <div className="space-y-5 p-3 sm:p-4 lg:p-6">
        <div className="flex flex-wrap gap-1 rounded-lg bg-[#0d1a2d] p-1">
          {TABS.map((option) => (
            <button
              key={option.key}
              onClick={() => {
                setTab(option.key);
                setPage(1);
              }}
              className={`rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${
                tab === option.key
                  ? "bg-blue-600 text-white"
                  : "text-gray-400 hover:text-gray-200"
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
          {stats.map((stat) => (
            <Card key={stat.label}>
              <CardContent className="pt-4">
                <div className="flex items-center gap-3">
                  <div
                    className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${stat.color}`}
                  >
                    <stat.icon className="h-4 w-4 text-white" />
                  </div>
                  <div>
                    <p className="text-lg font-bold text-white">{stat.value}</p>
                    <p className="text-[10px] text-gray-400">{stat.label}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
          <Card className="lg:col-span-2">
            <CardHeader>
              <div className="flex flex-col items-start justify-between gap-3 sm:flex-row sm:items-center">
                <CardTitle className="text-sm">All Activities</CardTitle>
                <Select
                  value={typeFilter}
                  onValueChange={(value) => {
                    setTypeFilter(value);
                    setPage(1);
                  }}
                >
                  <SelectTrigger className="h-8 w-44 text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {TYPE_OPTIONS.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-[#1e2d40]">
                      {["Activity", "User", "Entity", "Type", "Time"].map((heading) => (
                        <th
                          key={heading}
                          className="whitespace-nowrap px-4 py-3 text-left text-xs font-medium text-gray-500"
                        >
                          {heading}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {isLoading ? (
                      Array.from({ length: 6 }).map((_, rowIndex) => (
                        <tr key={rowIndex} className="border-b border-[#1e2d40]">
                          {Array.from({ length: 5 }).map((_, cellIndex) => (
                            <td key={cellIndex} className="px-4 py-3">
                              <Skeleton className="h-4 w-20" />
                            </td>
                          ))}
                        </tr>
                      ))
                    ) : activities.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="px-4 py-10 text-center text-sm text-gray-500">
                          No activity recorded for this period.
                        </td>
                      </tr>
                    ) : (
                      activities.map((activity) => {
                        const meta = typeMeta(activity.type);
                        const Icon = meta.icon;
                        return (
                          <tr
                            key={activity._id}
                            className="border-b border-[#1e2d40] transition-colors hover:bg-[#0d1a2d]"
                          >
                            <td className="px-4 py-3">
                              <div className="flex items-start gap-2">
                                <div className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-[#1e2d40]">
                                  <Icon className={`h-3.5 w-3.5 ${meta.color}`} />
                                </div>
                                <div className="min-w-0">
                                  <p className="text-xs font-medium text-gray-200">
                                    {activity.action}
                                  </p>
                                  {activity.description ? (
                                    <p className="max-w-[260px] truncate text-[10px] text-gray-500">
                                      {activity.description}
                                    </p>
                                  ) : null}
                                </div>
                              </div>
                            </td>
                            <td className="px-4 py-3">
                              <div className="flex items-center gap-1.5">
                                <Avatar className="h-6 w-6">
                                  {activity.user_id?.profileImage?.url ? (
                                    <AvatarImage
                                      src={activity.user_id.profileImage.url}
                                      alt={activity.user_id?.name}
                                    />
                                  ) : (
                                    <AvatarFallback className="text-[9px]">
                                      {getInitials(activity.user_id?.name || "System")}
                                    </AvatarFallback>
                                  )}
                                </Avatar>
                                <span className="text-xs text-gray-400">
                                  {activity.user_id?.name || "System"}
                                </span>
                              </div>
                            </td>
                            <td className="px-4 py-3">
                              <div>
                                <p className="text-xs text-gray-300">
                                  {activity.entity?.entityName || "—"}
                                </p>
                                {activity.entity?.entityType ? (
                                  <span className="rounded bg-[#1e2d40] px-1.5 py-0.5 text-[10px] text-gray-400">
                                    {activity.entity.entityType}
                                  </span>
                                ) : null}
                              </div>
                            </td>
                            <td className="px-4 py-3">
                              <span
                                className={`rounded-full px-2 py-0.5 text-[10px] ${meta.badgeColor}`}
                              >
                                {meta.label}
                              </span>
                            </td>
                            <td className="whitespace-nowrap px-4 py-3 text-xs text-gray-500">
                              {timeAgo(activity.timestamp || activity.createdAt)}
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>

              <div className="flex items-center justify-between border-t border-[#1e2d40] px-4 py-3">
                <p className="text-xs text-gray-500">
                  {meta.total > 0
                    ? `${(page - 1) * limit + 1}–${Math.min(
                        page * limit,
                        meta.total
                      )} of ${meta.total} activities`
                    : "0 activities"}
                </p>
                <div className="flex items-center gap-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7"
                    onClick={() => setPage((current) => Math.max(1, current - 1))}
                    disabled={page === 1}
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <span className="px-2 text-xs text-gray-300">
                    Page {page} of {totalPages}
                  </span>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7"
                    onClick={() => setPage((current) => current + 1)}
                    disabled={page >= totalPages}
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Activity Overview</CardTitle>
              </CardHeader>
              <CardContent>
                {overview.map((item) => (
                  <div key={item.key} className="flex items-center gap-2 py-1.5">
                    <div className={`h-2 w-2 shrink-0 rounded-full ${item.color}`} />
                    <span className="flex-1 text-xs text-gray-400">{item.label}</span>
                    <span className="text-xs text-gray-300">{item.value}</span>
                    <span className="w-10 text-right text-xs text-gray-500">{item.pct}%</span>
                  </div>
                ))}
                <div className="mt-3 space-y-1 border-t border-[#1e2d40] pt-3">
                  <div className="flex justify-between text-xs">
                    <span className="text-gray-400">Today's events</span>
                    <span className="text-gray-200">{statsResponse?.todayTotal ?? "—"}</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-gray-400">Active users today</span>
                    <span className="text-gray-200">{statsResponse?.activeUsers ?? "—"}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Live Feed</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {activities.slice(0, 6).length === 0 ? (
                    <p className="text-xs text-gray-500">No recent activity.</p>
                  ) : (
                    activities.slice(0, 6).map((activity) => {
                      const meta = typeMeta(activity.type);
                      return (
                        <div key={activity._id} className="flex items-start gap-2">
                          <div
                            className={`mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full ${meta.badgeColor.split(" ")[0].replace("/20", "")}`}
                          />
                          <div className="min-w-0 flex-1">
                            <p className="truncate text-xs text-gray-300">{activity.action}</p>
                            <p className="text-[10px] text-gray-500">
                              {timeAgo(activity.timestamp || activity.createdAt)}
                            </p>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
