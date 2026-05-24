/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { leadsApi, territoriesApi } from "@/lib/api";
import { Header } from "@/components/layout/header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { formatDate, getInitials } from "@/lib/utils";
import { toast } from "sonner";
import {
  ChevronLeft,
  ChevronRight,
  MoreHorizontal,
  Plus,
  Search,
  Star,
} from "lucide-react";
import { LeadFormDialog } from "@/components/lead-form-dialog";
import { LeadDetailsDialog } from "@/components/lead-details-dialog";

const STATUS_TABS = [
  { value: "all", label: "All", color: "text-white" },
  { value: "new", label: "New", color: "text-blue-400" },
  { value: "contacted", label: "Contacted", color: "text-purple-400" },
  { value: "qualified", label: "Qualified", color: "text-emerald-400" },
  { value: "proposal", label: "Proposal", color: "text-amber-400" },
  { value: "won", label: "Won", color: "text-emerald-400" },
  { value: "lost", label: "Lost", color: "text-red-400" },
];

const STATUS_BADGE_VARIANT: Record<string, any> = {
  new: "default",
  contacted: "secondary",
  qualified: "success",
  proposal: "warning",
  won: "success",
  lost: "destructive",
};

const SOURCE_OPTIONS = [
  { value: "all", label: "All sources" },
  { value: "website", label: "Website" },
  { value: "referral", label: "Referral" },
  { value: "ad_campaign", label: "Ad campaign" },
  { value: "partner", label: "Partner" },
  { value: "manual", label: "Manual" },
  { value: "lead_generator", label: "Lead generator" },
  { value: "other", label: "Other" },
];

const SOURCE_COLORS: Record<string, string> = {
  website: "bg-blue-500",
  referral: "bg-emerald-500",
  ad_campaign: "bg-purple-500",
  partner: "bg-amber-500",
  manual: "bg-cyan-500",
  lead_generator: "bg-pink-500",
  other: "bg-gray-500",
};

export default function LeadsPage() {
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [sourceFilter, setSourceFilter] = useState("all");
  const [territoryFilter, setTerritoryFilter] = useState("all");
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<any>(null);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [detailsId, setDetailsId] = useState<string | null>(null);
  const limit = 10;

  const { data: leadsResponse, isLoading } = useQuery({
    queryKey: ["leads", page, search, statusFilter, sourceFilter, territoryFilter],
    queryFn: () =>
      leadsApi
        .getAll({
          page,
          limit,
          search: search || undefined,
          status: statusFilter === "all" ? undefined : statusFilter,
          source: sourceFilter === "all" ? undefined : sourceFilter,
          territory_id: territoryFilter === "all" ? undefined : territoryFilter,
        })
        .then((response) => response.data),
  });

  const { data: analyticsResponse } = useQuery({
    queryKey: ["lead-analytics"],
    queryFn: () => leadsApi.getAnalytics().then((response) => response.data?.data),
  });

  const { data: territoriesResponse } = useQuery({
    queryKey: ["lead-page-territories"],
    queryFn: () => territoriesApi.getAll({ limit: 100 }).then((response) => response.data),
  });

  const leads: any[] = leadsResponse?.data || [];
  const meta = leadsResponse?.meta || { total: 0, totalPages: 1, overview: null };
  const overview = meta.overview || {
    byStatus: [],
    totalEstimatedValue: 0,
    averageScore: 0,
    totalLeads: 0,
  };
  const territories: any[] = territoriesResponse?.data || [];

  const statusCounts = useMemo(() => {
    const map: Record<string, number> = {};
    overview.byStatus?.forEach((entry: any) => {
      map[entry._id] = entry.count;
    });
    return map;
  }, [overview]);

  const sourceCounts = useMemo(() => {
    const map: Record<string, number> = {};
    analyticsResponse?.leadBySource?.forEach((entry: any) => {
      map[entry._id] = entry.count;
    });
    const total = Object.values(map).reduce((sum, count) => sum + count, 0);
    return SOURCE_OPTIONS.filter((option) => option.value !== "all").map((option) => ({
      ...option,
      count: map[option.value] || 0,
      pct: total > 0 ? Math.round(((map[option.value] || 0) / total) * 100) : 0,
    }));
  }, [analyticsResponse]);

  const topOwners = useMemo(() => {
    const map = new Map<string, { name: string; count: number }>();
    leads.forEach((lead) => {
      const ownerId = lead.owner_id?._id;
      if (!ownerId) return;
      const existing = map.get(ownerId);
      if (existing) {
        existing.count += 1;
      } else {
        map.set(ownerId, { name: lead.owner_id?.name || "Owner", count: 1 });
      }
    });
    return Array.from(map.values())
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);
  }, [leads]);

  const deleteMutation = useMutation({
    mutationFn: (id: string) => leadsApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["leads"] });
      queryClient.invalidateQueries({ queryKey: ["lead-analytics"] });
      toast.success("Lead deleted");
    },
    onError: (error: any) =>
      toast.error(
        error?.response?.data?.message || error?.message || "Failed to delete lead"
      ),
  });

  const statusMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) =>
      leadsApi.changeStatus(id, { status }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["leads"] });
      toast.success("Status updated");
    },
    onError: (error: any) =>
      toast.error(error?.response?.data?.message || "Failed to update status"),
  });

  const handleEdit = (lead: any) => {
    setEditing(lead);
    setFormOpen(true);
  };

  const handleView = (lead: any) => {
    setDetailsId(lead._id);
    setDetailsOpen(true);
  };

  const totalLeadsCount = overview.totalLeads || 0;

  return (
    <div>
      <Header
        title="Leads"
        subtitle="Manage and track all leads across the platform."
        action={
          <Button
            size="sm"
            onClick={() => {
              setEditing(null);
              setFormOpen(true);
            }}
          >
            <Plus className="mr-1 h-4 w-4" />
            Add Lead
          </Button>
        }
      />
      <div className="space-y-5 p-3 sm:p-4 lg:p-6">
        <div className="flex flex-wrap gap-2">
          {STATUS_TABS.map((tab) => {
            const count = tab.value === "all" ? totalLeadsCount : statusCounts[tab.value] || 0;
            const active = statusFilter === tab.value;
            return (
              <button
                key={tab.value}
                onClick={() => {
                  setStatusFilter(tab.value);
                  setPage(1);
                }}
                className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${
                  active
                    ? "bg-blue-600 text-white"
                    : "bg-[#1e2d40] text-gray-400 hover:text-gray-200"
                }`}
              >
                {tab.label} <span className={active ? "text-white" : tab.color}>{count}</span>
              </button>
            );
          })}
        </div>

        <div className="flex flex-col gap-3 sm:flex-row">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" />
            <Input
              placeholder="Search leads..."
              value={search}
              onChange={(event) => {
                setSearch(event.target.value);
                setPage(1);
              }}
              className="pl-9"
            />
          </div>
          <Select
            value={territoryFilter}
            onValueChange={(value) => {
              setTerritoryFilter(value);
              setPage(1);
            }}
          >
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All territories</SelectItem>
              {territories.map((territory: any) => (
                <SelectItem key={territory._id} value={territory._id}>
                  {territory.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select
            value={sourceFilter}
            onValueChange={(value) => {
              setSourceFilter(value);
              setPage(1);
            }}
          >
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {SOURCE_OPTIONS.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
          <Card className="lg:col-span-2">
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-[#1e2d40]">
                      {["Lead", "Company", "Source", "Owner", "Status", "Score", "Created", ""].map(
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
                          {Array.from({ length: 8 }).map((_, cellIndex) => (
                            <td key={cellIndex} className="px-4 py-3">
                              <Skeleton className="h-4 w-20" />
                            </td>
                          ))}
                        </tr>
                      ))
                    ) : leads.length === 0 ? (
                      <tr>
                        <td colSpan={8} className="px-4 py-10 text-center text-sm text-gray-500">
                          No leads match your filters.
                        </td>
                      </tr>
                    ) : (
                      leads.map((lead) => (
                        <tr
                          key={lead._id}
                          onClick={() => handleView(lead)}
                          className="cursor-pointer border-b border-[#1e2d40] transition-colors hover:bg-[#0d1a2d]"
                        >
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-2">
                              <Avatar className="h-7 w-7">
                                <AvatarFallback className="text-[10px]">
                                  {getInitials(lead.name)}
                                </AvatarFallback>
                              </Avatar>
                              <div>
                                <p className="whitespace-nowrap text-xs font-medium text-gray-200">
                                  {lead.name}
                                </p>
                                <p className="text-[10px] text-gray-500">{lead.email}</p>
                              </div>
                            </div>
                          </td>
                          <td className="px-4 py-3 text-xs text-gray-400">
                            {lead.company || "—"}
                          </td>
                          <td className="px-4 py-3">
                            <span className="rounded-full bg-[#1e2d40] px-2 py-0.5 text-xs text-gray-300">
                              {lead.source}
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-1.5">
                              <Avatar className="h-6 w-6">
                                <AvatarFallback className="text-[9px]">
                                  {getInitials(lead.owner_id?.name || "—")}
                                </AvatarFallback>
                              </Avatar>
                              <span className="text-[11px] text-gray-400">
                                {lead.owner_id?.name || "—"}
                              </span>
                            </div>
                          </td>
                          <td className="px-4 py-3">
                            <Badge variant={STATUS_BADGE_VARIANT[lead.status] || "default"}>
                              {lead.status}
                            </Badge>
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-1">
                              <span className="text-xs text-gray-300">{lead.score || 0}</span>
                              <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
                            </div>
                          </td>
                          <td className="whitespace-nowrap px-4 py-3 text-xs text-gray-500">
                            {formatDate(lead.createdAt)}
                          </td>
                          <td className="px-4 py-3">
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-7 w-7"
                                  onClick={(event) => event.stopPropagation()}
                                >
                                  <MoreHorizontal className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem onClick={() => handleView(lead)}>
                                  View
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => handleEdit(lead)}>
                                  Edit
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  onClick={() =>
                                    statusMutation.mutate({
                                      id: lead._id,
                                      status: "contacted",
                                    })
                                  }
                                >
                                  Mark Contacted
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  className="text-red-400"
                                  onClick={() => {
                                    if (confirm(`Delete ${lead.name}?`)) {
                                      deleteMutation.mutate(lead._id);
                                    }
                                  }}
                                >
                                  Delete
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
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
                      )} of ${meta.total} leads`
                    : "0 leads"}
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
                    Page {page} of {meta.totalPages || 1}
                  </span>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7"
                    onClick={() => setPage((current) => current + 1)}
                    disabled={page >= (meta.totalPages || 1)}
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
                <CardTitle className="text-sm">Lead Overview</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {STATUS_TABS.filter((tab) => tab.value !== "all").map((tab) => {
                    const count = statusCounts[tab.value] || 0;
                    const pct = totalLeadsCount > 0
                      ? ((count / totalLeadsCount) * 100).toFixed(1)
                      : "0.0";
                    const color =
                      tab.value === "new"
                        ? "bg-blue-500"
                        : tab.value === "contacted"
                        ? "bg-purple-500"
                        : tab.value === "qualified"
                        ? "bg-emerald-500"
                        : tab.value === "proposal"
                        ? "bg-amber-500"
                        : tab.value === "won"
                        ? "bg-cyan-500"
                        : "bg-red-500";
                    return (
                      <div key={tab.value} className="flex items-center gap-2">
                        <div className={`h-2 w-2 shrink-0 rounded-full ${color}`} />
                        <span className="flex-1 text-xs text-gray-400">{tab.label}</span>
                        <span className="text-xs text-gray-300">{count}</span>
                        <span className="w-12 text-right text-xs text-gray-500">{pct}%</span>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Lead Sources</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {sourceCounts.length === 0 ? (
                    <p className="text-xs text-gray-500">No data yet.</p>
                  ) : (
                    sourceCounts.map((source) => (
                      <div key={source.value} className="space-y-1">
                        <div className="flex justify-between text-xs">
                          <span className="text-gray-400">{source.label}</span>
                          <span className="text-gray-300">{source.count}</span>
                        </div>
                        <div className="h-1.5 rounded-full bg-[#1e2d40]">
                          <div
                            className={`h-full rounded-full ${SOURCE_COLORS[source.value] || "bg-gray-500"}`}
                            style={{ width: `${source.pct}%` }}
                          />
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Top Owners (current page)</CardTitle>
              </CardHeader>
              <CardContent>
                {topOwners.length === 0 ? (
                  <p className="text-xs text-gray-500">No data yet.</p>
                ) : (
                  topOwners.map((owner, index) => (
                    <div key={`${owner.name}-${index}`} className="flex items-center gap-2 py-1.5">
                      <span className="w-3 text-xs text-gray-500">{index + 1}</span>
                      <Avatar className="h-6 w-6">
                        <AvatarFallback className="text-[9px]">
                          {getInitials(owner.name)}
                        </AvatarFallback>
                      </Avatar>
                      <span className="flex-1 truncate text-xs text-gray-300">{owner.name}</span>
                      <span className="text-xs text-gray-400">{owner.count}</span>
                    </div>
                  ))
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      <LeadFormDialog open={formOpen} onOpenChange={setFormOpen} lead={editing} />
      <LeadDetailsDialog
        open={detailsOpen}
        onOpenChange={setDetailsOpen}
        leadId={detailsId}
        onEdit={() => {
          const found = leads.find((lead) => lead._id === detailsId);
          setDetailsOpen(false);
          setEditing(found || null);
          setFormOpen(true);
        }}
      />
    </div>
  );
}
