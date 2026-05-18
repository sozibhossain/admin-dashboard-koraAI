"use client";
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { approvalsApi } from "@/lib/api";
import { Header } from "@/components/layout/header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { getInitials, formatDate, timeAgo } from "@/lib/utils";
import { toast } from "sonner";
import {
  CheckSquare, Clock, Check, X, Filter, ChevronLeft, ChevronRight
} from "lucide-react";

const defaultApprovals = [
  { _id: "1", title: "Partner Plan Upgrade", type: "Plan Change", entity: "Digital Boost Agency", requestedBy: { name: "Sarah Johnson", role: "Partner Admin" }, priority: "High", requestedAt: new Date(Date.now() - 3600000), status: "pending" },
  { _id: "2", title: "Customer Account Unlock", type: "Account", entity: "StarBarbers", requestedBy: { name: "Alan Thompson", role: "Partner Admin" }, priority: "Medium", requestedAt: new Date(Date.now() - 7200000), status: "pending" },
  { _id: "3", title: "Refund Request", type: "Billing", entity: "Urban Cuts", requestedBy: { name: "Lisa Brown", role: "Customer Admin" }, priority: "High", requestedAt: new Date(Date.now() - 10800000), status: "pending" },
  { _id: "4", title: "Impersonation Access", type: "Access", entity: "Fresh Fader", requestedBy: { name: "Alex Barber", role: "Customer" }, priority: "Critical", requestedAt: new Date(Date.now() - 14400000), status: "pending" },
  { _id: "5", title: "Trial Extension", type: "Trial", entity: "Sharp Styles", requestedBy: { name: "Emma Wilson", role: "Partner Admin" }, priority: "Low", requestedAt: new Date(Date.now() - 86400000), status: "approved" },
];

const priorityColors: Record<string, string> = {
  Critical: "destructive",
  High: "destructive",
  Medium: "warning",
  Low: "secondary",
};

const typeColors: Record<string, string> = {
  "Plan Change": "default",
  Account: "purple",
  Billing: "warning",
  Access: "destructive",
  Trial: "secondary",
};

export default function ApprovalsPage() {
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [activeTab, setActiveTab] = useState("Pending");
  const [typeFilter, setTypeFilter] = useState("all");
  const limit = 10;

  const { data, isLoading } = useQuery({
    queryKey: ["approvals", page, activeTab, typeFilter],
    queryFn: () => approvalsApi.getAll({ page, limit, status: activeTab !== "All" ? activeTab.toLowerCase() : undefined }).then((r) => r.data),
  });

  const approvals = data?.data?.length ? data.data : defaultApprovals;
  const meta = data?.meta || { total: 55, page: 1, limit };

  const approveMutation = useMutation({
    mutationFn: (id: string) => approvalsApi.approve(id),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["approvals"] }); toast.success("Approved"); },
    onError: () => toast.error("Failed to approve"),
  });

  const rejectMutation = useMutation({
    mutationFn: (id: string) => approvalsApi.reject(id),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["approvals"] }); toast.success("Rejected"); },
    onError: () => toast.error("Failed to reject"),
  });

  const tabs = [
    { label: "Pending", count: 18, color: "text-amber-400" },
    { label: "Approved", count: 198, color: "text-emerald-400" },
    { label: "Rejected", count: 44, color: "text-red-400" },
  ];

  return (
    <div>
      <Header title="Approvals" subtitle="Review and manage all pending requests that require your approval." />
      <div className="p-6 space-y-5">
        {/* Tabs */}
        <div className="flex gap-1 bg-[#0d1a2d] p-1 rounded-lg w-fit">
          {tabs.map((t) => (
            <button key={t.label} onClick={() => setActiveTab(t.label)}
              className={`px-4 py-1.5 rounded-md text-xs font-medium transition-colors flex items-center gap-1.5 ${activeTab === t.label ? "bg-blue-600 text-white" : "text-gray-400 hover:text-gray-200"}`}>
              {t.label}
              <span className={`text-[10px] ${activeTab === t.label ? "text-white/70" : t.color}`}>{t.count}</span>
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          {/* Table */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <div className="flex flex-col sm:flex-row gap-3">
                <div className="flex-1 flex gap-2">
                  <Input placeholder="Search requests..." className="h-8 text-xs flex-1" />
                  <Select value={typeFilter} onValueChange={setTypeFilter}>
                    <SelectTrigger className="w-32 h-8 text-xs"><SelectValue placeholder="All Types" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Types</SelectItem>
                      <SelectItem value="plan_change">Plan Change</SelectItem>
                      <SelectItem value="account">Account</SelectItem>
                      <SelectItem value="billing">Billing</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-[#1e2d40]">
                    {["Request", "Type", "Entity", "Requested By", "Priority", "Requested On", "Actions"].map((h) => (
                      <th key={h} className="px-4 py-3 text-left text-xs font-medium text-gray-500 whitespace-nowrap">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {isLoading ? Array(5).fill(0).map((_, i) => (
                    <tr key={i} className="border-b border-[#1e2d40]">
                      {Array(7).fill(0).map((_, j) => <td key={j} className="px-4 py-3"><Skeleton className="h-4 w-16" /></td>)}
                    </tr>
                  )) : approvals.map((a: any) => (
                    <tr key={a._id} className="border-b border-[#1e2d40] hover:bg-[#0d1a2d] transition-colors">
                      <td className="px-4 py-3">
                        <p className="text-xs font-medium text-gray-200">{a.title}</p>
                        <p className="text-[10px] text-gray-500 truncate max-w-[160px]">{a.description}</p>
                      </td>
                      <td className="px-4 py-3">
                        <Badge variant={typeColors[a.type] as any || "default"} className="text-[10px]">{a.type}</Badge>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1.5">
                          <Avatar className="w-5 h-5"><AvatarFallback className="text-[8px]">{getInitials(a.entity || "EN")}</AvatarFallback></Avatar>
                          <span className="text-xs text-gray-300 whitespace-nowrap">{a.entity}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1.5">
                          <Avatar className="w-5 h-5"><AvatarFallback className="text-[8px]">{getInitials(a.requestedBy?.name || "RB")}</AvatarFallback></Avatar>
                          <div>
                            <p className="text-xs text-gray-300">{a.requestedBy?.name}</p>
                            <p className="text-[10px] text-gray-500">{a.requestedBy?.role}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <Badge variant={priorityColors[a.priority] as any || "default"} className="text-[10px]">
                          {a.priority === "Critical" || a.priority === "High" ? "↑" : "→"} {a.priority}
                        </Badge>
                      </td>
                      <td className="px-4 py-3 text-xs text-gray-500 whitespace-nowrap">
                        {formatDate(a.requestedAt || new Date())}
                      </td>
                      <td className="px-4 py-3">
                        {a.status === "pending" ? (
                          <div className="flex gap-1">
                            <Button size="sm" variant="success" className="h-7 px-2 text-[10px]"
                              onClick={() => approveMutation.mutate(a._id)}>
                              <Check className="w-3 h-3" />
                            </Button>
                            <Button size="sm" variant="destructive" className="h-7 px-2 text-[10px]"
                              onClick={() => rejectMutation.mutate(a._id)}>
                              <X className="w-3 h-3" />
                            </Button>
                          </div>
                        ) : (
                          <Badge variant={a.status === "approved" ? "success" : "destructive"} className="text-[10px]">
                            {a.status}
                          </Badge>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <div className="flex items-center justify-between px-4 py-3 border-t border-[#1e2d40]">
                <p className="text-xs text-gray-500">1–{approvals.length} of {meta.total || 55} requests</p>
                <div className="flex items-center gap-1">
                  <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}>
                    <ChevronLeft className="w-4 h-4" />
                  </Button>
                  {[1, 2, 3].map((p) => (
                    <button key={p} onClick={() => setPage(p)}
                      className={`w-7 h-7 rounded text-xs ${page === p ? "bg-blue-600 text-white" : "text-gray-400"}`}>{p}</button>
                  ))}
                  <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setPage(p => p + 1)}>
                    <ChevronRight className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Right Panel */}
          <div className="space-y-4">
            {/* Approval Overview */}
            <Card>
              <CardHeader><CardTitle className="text-sm">Approval Overview</CardTitle></CardHeader>
              <CardContent>
                <div className="flex items-center gap-3 mb-4">
                  <div className="relative w-20 h-20 flex-shrink-0">
                    <svg viewBox="0 0 36 36" className="w-full h-full -rotate-90">
                      <circle cx="18" cy="18" r="15.9" fill="none" stroke="#1e2d40" strokeWidth="3" />
                      <circle cx="18" cy="18" r="15.9" fill="none" stroke="#f59e0b" strokeWidth="3"
                        strokeDasharray="35 65" />
                      <circle cx="18" cy="18" r="15.9" fill="none" stroke="#22c55e" strokeWidth="3"
                        strokeDasharray="52 48" strokeDashoffset="-35" />
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                      <span className="text-base font-bold text-white">18</span>
                      <span className="text-[8px] text-gray-500">Pending</span>
                    </div>
                  </div>
                  <div className="space-y-1">
                    {[
                      { label: "High Priority", value: "5 (27%)", color: "bg-red-500" },
                      { label: "Medium Priority", value: "9 (50%)", color: "bg-amber-500" },
                      { label: "Low Priority", value: "4 (22%)", color: "bg-blue-500" },
                    ].map((p) => (
                      <div key={p.label} className="flex items-center gap-1.5">
                        <div className={`w-2 h-2 rounded-full ${p.color} flex-shrink-0`} />
                        <span className="text-[10px] text-gray-400">{p.label}</span>
                        <span className="text-[10px] text-gray-300 ml-auto">{p.value}</span>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="space-y-1 pt-3 border-t border-[#1e2d40]">
                  {[
                    { label: "Avg. Response Time", value: "06h 42m" },
                    { label: "Approval Rate", value: "94.2%" },
                    { label: "Requests Today", value: "3" },
                  ].map((s) => (
                    <div key={s.label} className="flex justify-between py-1 text-xs">
                      <span className="text-gray-400">{s.label}</span>
                      <span className="text-gray-200">{s.value}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Quick Filters */}
            <Card>
              <CardHeader><div className="flex justify-between"><CardTitle className="text-sm">Quick Filters</CardTitle><button className="text-xs text-blue-400">Clear all</button></div></CardHeader>
              <CardContent>
                {["Plan Changes", "Account Actions", "Billing & Refunds", "Access Requests", "Data Requests"].map((f, i) => (
                  <div key={f} className="flex justify-between items-center py-1.5 text-xs border-b border-[#1e2d40] last:border-0">
                    <span className="text-gray-400">{f}</span>
                    <span className="text-gray-300">{[5, 3, 3, 2, 2][i]} &gt;</span>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Recent Activity */}
            <Card>
              <CardHeader>
                <div className="flex justify-between"><CardTitle className="text-sm">Recent Activity</CardTitle><button className="text-xs text-blue-400">View all</button></div>
              </CardHeader>
              <CardContent>
                {[
                  { text: "Approved plan upgrade for Digital Boost", color: "bg-emerald-500", time: "20m ago" },
                  { text: "Approved account unlock for Ella Barbers", color: "bg-emerald-500", time: "1h ago" },
                  { text: "Payout received", color: "bg-blue-500", time: "2h ago" },
                  { text: "Scheduler initiated free settings", color: "bg-purple-500", time: "Yesterday" },
                ].map((a, i) => (
                  <div key={i} className="flex items-start gap-2 py-1.5">
                    <div className={`w-1.5 h-1.5 rounded-full ${a.color} mt-1.5 flex-shrink-0`} />
                    <div className="flex-1">
                      <p className="text-xs text-gray-300">{a.text}</p>
                      <p className="text-[10px] text-gray-500">{a.time}</p>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
