/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { approvalsApi } from "@/lib/api";
import { Header } from "@/components/layout/header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
import { getInitials, formatDate, timeAgo } from "@/lib/utils";
import { toast } from "sonner";
import { Check, ChevronLeft, ChevronRight, Search, X } from "lucide-react";

const TABS = [
  { value: "pending", label: "Pending", color: "text-amber-400" },
  { value: "approved", label: "Approved", color: "text-emerald-400" },
  { value: "rejected", label: "Rejected", color: "text-red-400" },
];

const TYPE_OPTIONS = [
  { value: "all", label: "All Types" },
  { value: "plan_change", label: "Plan Change" },
  { value: "account_action", label: "Account Action" },
  { value: "billing_refund", label: "Billing / Refund" },
  { value: "access_request", label: "Access Request" },
  { value: "data_request", label: "Data Request" },
  { value: "trial_extension", label: "Trial Extension" },
  { value: "other", label: "Other" },
];

const PRIORITY_BADGE: Record<string, any> = {
  high: "destructive",
  medium: "warning",
  low: "secondary",
};

const TYPE_BADGE_COLOR: Record<string, string> = {
  plan_change: "bg-blue-600/20 text-blue-400",
  account_action: "bg-purple-600/20 text-purple-400",
  billing_refund: "bg-amber-600/20 text-amber-400",
  access_request: "bg-red-600/20 text-red-400",
  data_request: "bg-cyan-600/20 text-cyan-400",
  trial_extension: "bg-emerald-600/20 text-emerald-400",
  other: "bg-gray-600/20 text-gray-300",
};

export default function ApprovalsPage() {
  const queryClient = useQueryClient();
  const [tab, setTab] = useState("pending");
  const [page, setPage] = useState(1);
  const [typeFilter, setTypeFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const limit = 10;

  const { data: listResponse, isLoading } = useQuery({
    queryKey: ["approvals", tab, page, typeFilter],
    queryFn: () => {
      const params: any = { page, limit };
      if (typeFilter !== "all") params.type = typeFilter;
      if (tab === "pending") {
        return approvalsApi.getAll(params).then((response) => response.data);
      }
      return approvalsApi.getHistory(params).then((response) => response.data);
    },
  });

  const allApprovals: any[] = listResponse?.data || [];
  const meta = listResponse?.meta || { total: 0 };
  const totalPages = Math.max(1, Math.ceil((meta.total || 0) / limit));

  const approvals = useMemo(() => {
    let result = allApprovals;
    if (tab !== "pending") {
      result = result.filter((approval: any) => approval.status === tab);
    }
    if (search.trim()) {
      const term = search.toLowerCase();
      result = result.filter((approval: any) => {
        return (
          approval.description?.toLowerCase().includes(term) ||
          approval.requester_id?.name?.toLowerCase().includes(term) ||
          approval.approval_id?.toLowerCase().includes(term) ||
          approval.type?.toLowerCase().includes(term)
        );
      });
    }
    return result;
  }, [allApprovals, tab, search]);

  const { data: statsResponse } = useQuery({
    queryKey: ["approval-stats"],
    queryFn: () => approvalsApi.getStats().then((response) => response.data?.data),
  });

  const statusCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    (statsResponse?.byStatus || []).forEach((entry: any) => {
      counts[entry._id] = entry.count;
    });
    return counts;
  }, [statsResponse]);

  const priorityCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    (statsResponse?.byPriority || []).forEach((entry: any) => {
      counts[entry._id] = entry.count;
    });
    return counts;
  }, [statsResponse]);

  const typeCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    (statsResponse?.byType || []).forEach((entry: any) => {
      counts[entry._id] = entry.count;
    });
    return counts;
  }, [statsResponse]);

  const totalPending = statusCounts.pending || 0;

  const approveMutation = useMutation({
    mutationFn: (id: string) => approvalsApi.approve(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["approvals"] });
      queryClient.invalidateQueries({ queryKey: ["approval-stats"] });
      toast.success("Request approved");
    },
    onError: (error: any) =>
      toast.error(error?.response?.data?.message || "Failed to approve"),
  });

  const rejectMutation = useMutation({
    mutationFn: ({ id, note }: { id: string; note?: string }) =>
      approvalsApi.reject(id, { adminNote: note }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["approvals"] });
      queryClient.invalidateQueries({ queryKey: ["approval-stats"] });
      toast.success("Request rejected");
    },
    onError: (error: any) =>
      toast.error(error?.response?.data?.message || "Failed to reject"),
  });

  const bulkMutation = useMutation({
    mutationFn: () => approvalsApi.bulkApprove({ approvalIds: Array.from(selectedIds) }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["approvals"] });
      queryClient.invalidateQueries({ queryKey: ["approval-stats"] });
      setSelectedIds(new Set());
      toast.success("Bulk approval completed");
    },
    onError: (error: any) =>
      toast.error(error?.response?.data?.message || "Bulk approval failed"),
  });

  const toggleSelect = (id: string) => {
    setSelectedIds((current) => {
      const next = new Set(current);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  return (
    <div>
      <Header
        title="Approvals"
        subtitle="Review and manage all pending requests that require your approval."
        action={
          tab === "pending" && selectedIds.size > 0 ? (
            <Button
              size="sm"
              onClick={() => bulkMutation.mutate()}
              disabled={bulkMutation.isPending}
            >
              <Check className="mr-1 h-3.5 w-3.5" />
              Approve {selectedIds.size} selected
            </Button>
          ) : null
        }
      />

      <div className="space-y-5 p-3 sm:p-4 lg:p-6">
        <div className="flex w-fit gap-1 rounded-lg bg-[#0d1a2d] p-1">
          {TABS.map((tabOption) => (
            <button
              key={tabOption.value}
              onClick={() => {
                setTab(tabOption.value);
                setPage(1);
                setSelectedIds(new Set());
              }}
              className={`flex items-center gap-1.5 rounded-md px-4 py-1.5 text-xs font-medium transition-colors ${
                tab === tabOption.value
                  ? "bg-blue-600 text-white"
                  : "text-gray-400 hover:text-gray-200"
              }`}
            >
              {tabOption.label}
              <span
                className={`text-[10px] ${
                  tab === tabOption.value ? "text-white/70" : tabOption.color
                }`}
              >
                {statusCounts[tabOption.value] || 0}
              </span>
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
          <Card className="lg:col-span-2">
            <CardHeader>
              <div className="flex flex-col gap-3 sm:flex-row">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-gray-500" />
                  <Input
                    placeholder="Search requests..."
                    value={search}
                    onChange={(event) => setSearch(event.target.value)}
                    className="h-8 pl-8 text-xs"
                  />
                </div>
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
                      {tab === "pending" ? (
                        <th className="w-10 px-4 py-3" />
                      ) : null}
                      {["Request", "Type", "Requester", "Priority", "Date", "Actions"].map(
                        (heading) => (
                          <th
                            key={heading}
                            className="whitespace-nowrap px-4 py-3 text-left text-xs font-medium text-gray-500"
                          >
                            {heading}
                          </th>
                        )
                      )}
                    </tr>
                  </thead>
                  <tbody>
                    {isLoading ? (
                      Array.from({ length: 6 }).map((_, rowIndex) => (
                        <tr key={rowIndex} className="border-b border-[#1e2d40]">
                          {Array.from({ length: tab === "pending" ? 7 : 6 }).map(
                            (_, cellIndex) => (
                              <td key={cellIndex} className="px-4 py-3">
                                <Skeleton className="h-4 w-16" />
                              </td>
                            )
                          )}
                        </tr>
                      ))
                    ) : approvals.length === 0 ? (
                      <tr>
                        <td
                          colSpan={tab === "pending" ? 7 : 6}
                          className="px-4 py-10 text-center text-sm text-gray-500"
                        >
                          No {tab} requests.
                        </td>
                      </tr>
                    ) : (
                      approvals.map((approval: any) => (
                        <tr
                          key={approval._id}
                          className="border-b border-[#1e2d40] transition-colors hover:bg-[#0d1a2d]"
                        >
                          {tab === "pending" ? (
                            <td className="px-4 py-3">
                              <input
                                type="checkbox"
                                checked={selectedIds.has(approval._id)}
                                onChange={() => toggleSelect(approval._id)}
                                className="h-3.5 w-3.5 rounded border-[#2a3547] bg-[#0d1526]"
                              />
                            </td>
                          ) : null}
                          <td className="px-4 py-3">
                            <p className="text-xs font-medium text-gray-200">
                              {approval.approval_id}
                            </p>
                            <p className="max-w-[260px] truncate text-[10px] text-gray-500">
                              {approval.description || "—"}
                            </p>
                          </td>
                          <td className="px-4 py-3">
                            <span
                              className={`whitespace-nowrap rounded-full px-2 py-0.5 text-[10px] ${
                                TYPE_BADGE_COLOR[approval.type] ||
                                "bg-gray-600/20 text-gray-300"
                              }`}
                            >
                              {approval.type?.replace("_", " ")}
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-1.5">
                              <Avatar className="h-5 w-5">
                                {approval.requester_id?.profileImage?.url ? (
                                  <AvatarImage
                                    src={approval.requester_id.profileImage.url}
                                    alt={approval.requester_id?.name}
                                  />
                                ) : (
                                  <AvatarFallback className="text-[8px]">
                                    {getInitials(approval.requester_id?.name || "?")}
                                  </AvatarFallback>
                                )}
                              </Avatar>
                              <div className="min-w-0">
                                <p className="truncate text-xs text-gray-300">
                                  {approval.requester_id?.name || "—"}
                                </p>
                                <p className="text-[10px] text-gray-500">
                                  {approval.requester_id?.role || "—"}
                                </p>
                              </div>
                            </div>
                          </td>
                          <td className="px-4 py-3">
                            <Badge
                              variant={PRIORITY_BADGE[approval.priority] || "default"}
                              className="text-[10px]"
                            >
                              {approval.priority}
                            </Badge>
                          </td>
                          <td className="whitespace-nowrap px-4 py-3 text-xs text-gray-500">
                            {timeAgo(approval.createdAt)}
                          </td>
                          <td className="px-4 py-3">
                            {approval.status === "pending" ? (
                              <div className="flex gap-1">
                                <Button
                                  size="sm"
                                  variant="success"
                                  className="h-7 px-2 text-[10px]"
                                  onClick={() => approveMutation.mutate(approval._id)}
                                  disabled={approveMutation.isPending}
                                >
                                  <Check className="h-3 w-3" />
                                </Button>
                                <Button
                                  size="sm"
                                  variant="destructive"
                                  className="h-7 px-2 text-[10px]"
                                  onClick={() => {
                                    const note = prompt("Reason for rejection (optional)") ?? "";
                                    rejectMutation.mutate({ id: approval._id, note });
                                  }}
                                  disabled={rejectMutation.isPending}
                                >
                                  <X className="h-3 w-3" />
                                </Button>
                              </div>
                            ) : (
                              <Badge
                                variant={
                                  approval.status === "approved" ? "success" : "destructive"
                                }
                                className="text-[10px]"
                              >
                                {approval.status}
                              </Badge>
                            )}
                          </td>
                        </tr>
                      ))
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
                      )} of ${meta.total}`
                    : "0 requests"}
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
                <CardTitle className="text-sm">Approval Overview</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="mb-4 flex items-center gap-3">
                  <div className="relative h-20 w-20 shrink-0">
                    <svg viewBox="0 0 36 36" className="h-full w-full -rotate-90">
                      <circle cx="18" cy="18" r="15.9" fill="none" stroke="#1e2d40" strokeWidth="3" />
                      <circle
                        cx="18"
                        cy="18"
                        r="15.9"
                        fill="none"
                        stroke="#f59e0b"
                        strokeWidth="3"
                        strokeDasharray={`${
                          totalPending > 0
                            ? (totalPending /
                                (Object.values(statusCounts).reduce(
                                  (sum, count) => sum + count,
                                  0
                                ) || 1)) *
                              100
                            : 0
                        } 100`}
                      />
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                      <span className="text-base font-bold text-white">{totalPending}</span>
                      <span className="text-[8px] text-gray-500">Pending</span>
                    </div>
                  </div>
                  <div className="space-y-1">
                    {[
                      { key: "high", label: "High", color: "bg-red-500" },
                      { key: "medium", label: "Medium", color: "bg-amber-500" },
                      { key: "low", label: "Low", color: "bg-blue-500" },
                    ].map((priority) => (
                      <div key={priority.key} className="flex items-center gap-1.5">
                        <div className={`h-2 w-2 shrink-0 rounded-full ${priority.color}`} />
                        <span className="text-[10px] text-gray-400">{priority.label}</span>
                        <span className="ml-auto text-[10px] text-gray-300">
                          {priorityCounts[priority.key] || 0}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="space-y-1 border-t border-[#1e2d40] pt-3">
                  <div className="flex justify-between py-1 text-xs">
                    <span className="text-gray-400">Today's requests</span>
                    <span className="text-gray-200">{statsResponse?.todayCount ?? 0}</span>
                  </div>
                  <div className="flex justify-between py-1 text-xs">
                    <span className="text-gray-400">Approval rate</span>
                    <span className="text-gray-200">
                      {(() => {
                        const approved = statusCounts.approved || 0;
                        const total =
                          approved + (statusCounts.rejected || 0);
                        return total > 0
                          ? `${Math.round((approved / total) * 100)}%`
                          : "—";
                      })()}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-sm">By Type</CardTitle>
              </CardHeader>
              <CardContent>
                {Object.keys(typeCounts).length === 0 ? (
                  <p className="text-xs text-gray-500">No data yet.</p>
                ) : (
                  TYPE_OPTIONS.filter((option) => option.value !== "all").map((option) => {
                    const count = typeCounts[option.value] || 0;
                    return (
                      <button
                        key={option.value}
                        onClick={() => {
                          setTypeFilter(option.value);
                          setPage(1);
                        }}
                        className="flex w-full items-center justify-between border-b border-[#1e2d40] py-1.5 text-xs last:border-0 hover:text-gray-200"
                      >
                        <span className="text-gray-400">{option.label}</span>
                        <span className="text-gray-300">{count}</span>
                      </button>
                    );
                  })
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
