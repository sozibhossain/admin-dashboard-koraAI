/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useMemo } from "react";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { workflowsApi } from "@/lib/api";
import { Header } from "@/components/layout/header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { timeAgo } from "@/lib/utils";
import {
  Briefcase,
  CheckSquare,
  Download,
  GitBranch,
  Lock,
  MapPin,
  RefreshCw,
  Settings,
  TrendingUp,
  Users,
  XCircle,
  Zap,
} from "lucide-react";

const WORKFLOW_GROUPS = [
  {
    title: "Partner Management",
    items: [
      { icon: Users, color: "bg-blue-600", title: "Create Partner", desc: "Add a new partner to the system", action: { type: "navigate" as const, href: "/partners" } },
      { icon: MapPin, color: "bg-green-600", title: "Assign Territory", desc: "Assign territory to a partner", action: { type: "navigate" as const, href: "/territories" }, tag: "Popular" },
      { icon: RefreshCw, color: "bg-orange-600", title: "Reassign Partner", desc: "Move partner to another setup", action: { type: "navigate" as const, href: "/partners" }, tag: "Popular" },
      { icon: TrendingUp, color: "bg-red-600", title: "Change Commission", desc: "Update partner commission rates", action: { type: "navigate" as const, href: "/partners" } },
      { icon: Users, color: "bg-purple-600", title: "View Partner Dashboard", desc: "Open partner performance", action: { type: "navigate" as const, href: "/partners" } },
    ],
  },
  {
    title: "Customer Management",
    items: [
      { icon: Users, color: "bg-blue-600", title: "Create Customer", desc: "Add a new customer", action: { type: "navigate" as const, href: "/customers" } },
      { icon: Settings, color: "bg-purple-600", title: "Edit Customer Data", desc: "Update customer information", action: { type: "navigate" as const, href: "/customers" } },
      { icon: Lock, color: "bg-amber-600", title: "Reset Password", desc: "Reset a customer's password", action: { type: "execute" as const, workflowType: "reset_password" }, tag: "Popular" },
      { icon: XCircle, color: "bg-red-600", title: "Cancel Subscription", desc: "Cancel customer subscription", action: { type: "execute" as const, workflowType: "cancel_subscription" } },
      { icon: Users, color: "bg-emerald-600", title: "Unlock Account", desc: "Unlock a blocked account", action: { type: "execute" as const, workflowType: "unlock_account" }, tag: "Popular" },
    ],
  },
  {
    title: "Sales Control",
    items: [
      { icon: GitBranch, color: "bg-blue-600", title: "Reassign Leads", desc: "Move leads to another partner", action: { type: "execute" as const, workflowType: "reassign_leads" }, tag: "Popular" },
      { icon: GitBranch, color: "bg-purple-600", title: "Bulk Assign Leads", desc: "Assign multiple leads at once", action: { type: "execute" as const, workflowType: "bulk_assign_leads" } },
      { icon: Settings, color: "bg-amber-600", title: "Change Lead Status", desc: "Update status of leads", action: { type: "navigate" as const, href: "/leads" } },
      { icon: Download, color: "bg-cyan-600", title: "Import Leads", desc: "Import leads from CSV", action: { type: "navigate" as const, href: "/leads" } },
      { icon: GitBranch, color: "bg-green-600", title: "View Leads", desc: "Open the leads table", action: { type: "navigate" as const, href: "/leads" } },
    ],
  },
  {
    title: "Territory Control",
    items: [
      { icon: MapPin, color: "bg-blue-600", title: "Create Territory", desc: "Define a new territory", action: { type: "navigate" as const, href: "/territories" }, tag: "Popular" },
      { icon: Settings, color: "bg-amber-600", title: "Edit Territory", desc: "Modify territory details", action: { type: "navigate" as const, href: "/territories" } },
      { icon: Users, color: "bg-green-600", title: "Assign Territory", desc: "Assign territory to partner", action: { type: "execute" as const, workflowType: "assign_territory" } },
      { icon: XCircle, color: "bg-red-600", title: "Remove Territory", desc: "Delete territory from system", action: { type: "navigate" as const, href: "/territories" } },
    ],
  },
  {
    title: "System Operations",
    items: [
      { icon: RefreshCw, color: "bg-blue-600", title: "Resync Data", desc: "Re-sync data across all systems", action: { type: "execute" as const, workflowType: "resync_data" } },
      { icon: TrendingUp, color: "bg-green-600", title: "Recalculate Metrics", desc: "Rebuild dashboards", action: { type: "execute" as const, workflowType: "recalculate_metrics" } },
      { icon: Briefcase, color: "bg-purple-600", title: "View Activity Log", desc: "Open audit/activity log", action: { type: "navigate" as const, href: "/activity" } },
      { icon: CheckSquare, color: "bg-amber-600", title: "Pending Approvals", desc: "Review pending requests", action: { type: "navigate" as const, href: "/approvals" } },
    ],
  },
  {
    title: "Support Actions",
    items: [
      { icon: Lock, color: "bg-red-600", title: "Unlock Account", desc: "Unlock a customer account", action: { type: "execute" as const, workflowType: "unlock_account" } },
      { icon: RefreshCw, color: "bg-green-600", title: "Process Refund", desc: "Refund a customer", action: { type: "execute" as const, workflowType: "process_refund" } },
      { icon: Settings, color: "bg-purple-600", title: "Open Support Inbox", desc: "View support tickets", action: { type: "navigate" as const, href: "/support" } },
      { icon: Zap, color: "bg-amber-600", title: "Quick Fix", desc: "Apply manual data fix", action: { type: "execute" as const, workflowType: "manual_fix" } },
    ],
  },
];

const STATUS_COLOR: Record<string, string> = {
  completed: "text-emerald-400",
  in_progress: "text-amber-400",
  pending: "text-blue-400",
  failed: "text-red-400",
};

export default function WorkflowsPage() {
  const router = useRouter();

  const { data: historyResponse } = useQuery({
    queryKey: ["workflow-history"],
    queryFn: () =>
      workflowsApi.getHistory({ limit: 8 }).then((response) => response.data?.data),
  });

  const { data: statsResponse } = useQuery({
    queryKey: ["workflow-stats"],
    queryFn: () => workflowsApi.getStats().then((response) => response.data?.data),
  });

  const history: any[] = historyResponse || [];

  const statusCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    (statsResponse?.byStatus || []).forEach((entry: any) => {
      counts[entry._id] = entry.count;
    });
    return counts;
  }, [statsResponse]);

  const totalRuns = Object.values(statusCounts).reduce((sum, count) => sum + count, 0);
  const completed = statusCounts.completed || 0;
  const successRate = totalRuns > 0 ? Math.round((completed / totalRuns) * 100) : 0;

  const handleAction = (item: (typeof WORKFLOW_GROUPS)[number]["items"][number]) => {
    if (item.action.type === "navigate") {
      router.push(item.action.href);
    } else {
      toast.info(
        `Workflow "${item.title}" requires inputs. Open the related page to configure.`
      );
    }
  };

  return (
    <div>
      <Header
        title="Workflows"
        subtitle="Execute powerful actions and manage system workflows."
      />
      <div className="p-3 sm:p-4 lg:p-6">
        <div className="grid grid-cols-1 gap-5 lg:grid-cols-4">
          <div className="space-y-6 lg:col-span-3">
            {WORKFLOW_GROUPS.map((group) => (
              <div key={group.title}>
                <div className="mb-3 flex items-center justify-between">
                  <h3 className="text-sm font-semibold text-gray-200">{group.title}</h3>
                </div>
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
                  {group.items.map((item) => {
                    const Icon = item.icon;
                    return (
                      <Card
                        key={item.title}
                        onClick={() => handleAction(item)}
                        className="group cursor-pointer transition-colors hover:border-blue-600/40"
                      >
                        <CardContent className="p-3">
                          <div className="mb-2 flex items-start justify-between">
                            <div
                              className={`flex h-8 w-8 items-center justify-center rounded-lg ${item.color}`}
                            >
                              <Icon className="h-4 w-4 text-white" />
                            </div>
                            {item.tag ? (
                              <span className="rounded-full bg-blue-600/20 px-1.5 py-0.5 text-[9px] text-blue-400">
                                {item.tag}
                              </span>
                            ) : null}
                          </div>
                          <p className="mb-1 text-xs font-medium text-gray-200">
                            {item.title}
                          </p>
                          <p className="text-[10px] leading-relaxed text-gray-500">
                            {item.desc}
                          </p>
                          <p className="mt-2 text-[10px] text-blue-400 opacity-0 transition-opacity group-hover:opacity-100">
                            {item.action.type === "navigate" ? "Open →" : "Run →"}
                          </p>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>

          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Workflow Activity</CardTitle>
              </CardHeader>
              <CardContent>
                {history.length === 0 ? (
                  <p className="text-xs text-gray-500">No workflows run yet.</p>
                ) : (
                  <div className="space-y-3">
                    {history.map((entry: any) => (
                      <div key={entry._id} className="flex items-start gap-2">
                        <div
                          className={`mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full ${
                            entry.status === "completed"
                              ? "bg-emerald-500"
                              : entry.status === "failed"
                              ? "bg-red-500"
                              : entry.status === "in_progress"
                              ? "bg-amber-500"
                              : "bg-blue-500"
                          }`}
                        />
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-xs text-gray-300">{entry.name}</p>
                          <div className="mt-0.5 flex items-center gap-2">
                            <span
                              className={`text-[10px] font-medium ${
                                STATUS_COLOR[entry.status] || "text-gray-400"
                              }`}
                            >
                              {entry.status.replace("_", " ")}
                            </span>
                            <span className="text-[10px] text-gray-500">
                              {timeAgo(entry.executedAt || entry.createdAt)}
                            </span>
                          </div>
                          {entry.executedBy?.name ? (
                            <p className="text-[10px] text-gray-500">
                              by {entry.executedBy.name}
                            </p>
                          ) : null}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Workflow Insights</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <Row
                    label="Workflows Executed Today"
                    value={String(statsResponse?.executedToday ?? 0)}
                  />
                  <Row
                    label="Pending"
                    value={String(statsResponse?.pendingApprovals ?? 0)}
                  />
                  <Row
                    label="Completed"
                    value={String(completed)}
                    color="text-emerald-400"
                  />
                  <Row
                    label="Failed"
                    value={String(statusCounts.failed || 0)}
                    color="text-red-400"
                  />
                  <Row
                    label="Success Rate"
                    value={`${successRate}%`}
                    color={successRate >= 90 ? "text-emerald-400" : "text-amber-400"}
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

function Row({
  label,
  value,
  color = "text-gray-200",
}: {
  label: string;
  value: string;
  color?: string;
}) {
  return (
    <div className="flex justify-between border-b border-[#1e2d40] py-1.5 last:border-0">
      <span className="text-xs text-gray-400">{label}</span>
      <span className={`text-xs font-medium ${color}`}>{value}</span>
    </div>
  );
}
