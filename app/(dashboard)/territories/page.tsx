/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { territoriesApi } from "@/lib/api";
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { formatCurrency, getInitials, formatDate } from "@/lib/utils";
import { toast } from "sonner";
import {
  ChevronLeft,
  ChevronRight,
  DollarSign,
  MapPin,
  MoreHorizontal,
  Plus,
  Search,
  Target,
  Users,
} from "lucide-react";
import { TerritoryFormDialog } from "@/components/territory-form-dialog";

const STATUS_OPTIONS = [
  { value: "all", label: "All status" },
  { value: "active", label: "Active" },
  { value: "unassigned", label: "Unassigned" },
  { value: "inactive", label: "Inactive" },
];

const STATUS_BADGE: Record<string, "success" | "secondary" | "destructive"> = {
  active: "success",
  unassigned: "secondary",
  inactive: "destructive",
};

const TERRITORY_COLORS = [
  "#3b82f6",
  "#22c55e",
  "#a855f7",
  "#f59e0b",
  "#14b8a6",
  "#ef4444",
  "#ec4899",
  "#06b6d4",
];

export default function TerritoriesPage() {
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<any>(null);
  const limit = 10;

  const { data: territoriesResponse, isLoading } = useQuery({
    queryKey: ["territories", page, search, statusFilter],
    queryFn: () =>
      territoriesApi
        .getAll({
          page,
          limit,
          search: search || undefined,
          status: statusFilter === "all" ? undefined : statusFilter,
        })
        .then((response) => response.data),
  });

  const territories: any[] = territoriesResponse?.data || [];
  const meta = territoriesResponse?.meta || {
    total: 0,
    totalPages: 1,
    summary: null,
  };
  const summary = meta.summary || {
    totalTerritories: 0,
    activeTerritories: 0,
    unassignedTerritories: 0,
    assignedPartners: 0,
  };
  const totalPages = meta.totalPages || 1;

  const selected = useMemo(
    () => territories.find((territory) => territory._id === selectedId) || territories[0] || null,
    [territories, selectedId]
  );

  const { data: detailResponse } = useQuery({
    queryKey: ["territory-detail", selected?._id],
    queryFn: () =>
      territoriesApi.getById(String(selected?._id)).then((response) => response.data?.data),
    enabled: Boolean(selected?._id),
  });

  const detail: any = detailResponse;

  const totalLeads = useMemo(
    () => territories.reduce((sum, territory) => sum + (territory.stats?.totalLeads || 0), 0),
    [territories]
  );

  const totalRevenue = useMemo(
    () => territories.reduce((sum, territory) => sum + (territory.totalRevenue || 0), 0),
    [territories]
  );

  const stats = [
    {
      label: "Total Territories",
      value: summary.totalTerritories,
      icon: MapPin,
      color: "bg-blue-600",
    },
    {
      label: "Active",
      value: summary.activeTerritories,
      icon: Users,
      color: "bg-emerald-600",
    },
    {
      label: "Total Leads",
      value: totalLeads,
      icon: Target,
      color: "bg-purple-600",
    },
    {
      label: "Total Revenue",
      value: formatCurrency(totalRevenue),
      icon: DollarSign,
      color: "bg-amber-600",
    },
  ];

  const deleteMutation = useMutation({
    mutationFn: (id: string) => territoriesApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["territories"] });
      toast.success("Territory deleted");
    },
    onError: (error: any) =>
      toast.error(
        error?.response?.data?.message || error?.message || "Failed to delete"
      ),
  });

  const unassignMutation = useMutation({
    mutationFn: (id: string) => territoriesApi.unassignPartner(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["territories"] });
      queryClient.invalidateQueries({ queryKey: ["territory-detail"] });
      toast.success("Partner unassigned");
    },
    onError: (error: any) =>
      toast.error(error?.response?.data?.message || "Failed to unassign"),
  });

  const handleEdit = (territory: any) => {
    setEditing(territory);
    setFormOpen(true);
  };

  return (
    <div>
      <Header
        title="Territories"
        subtitle="Create, manage and assign territories to your partners."
        action={
          <Button
            size="sm"
            onClick={() => {
              setEditing(null);
              setFormOpen(true);
            }}
          >
            <Plus className="mr-1 h-4 w-4" />
            Create Territory
          </Button>
        }
      />

      <div className="space-y-5 p-3 sm:p-4 lg:p-6">
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
                    <p className="text-base font-bold text-white">{stat.value}</p>
                    <p className="text-[10px] text-gray-400">{stat.label}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
          <div className="space-y-4 lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Territories Map</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="relative h-64 overflow-hidden rounded-xl border border-[#1e2d40] bg-[#0d1a2d]">
                  <div className="absolute inset-0">
                    {Array.from({ length: 8 }).map((_, index) => (
                      <div
                        key={`h${index}`}
                        className="absolute h-px w-full bg-[#1e2d40] opacity-40"
                        style={{ top: `${(index + 1) * 12}%` }}
                      />
                    ))}
                    {Array.from({ length: 8 }).map((_, index) => (
                      <div
                        key={`v${index}`}
                        className="absolute h-full w-px bg-[#1e2d40] opacity-40"
                        style={{ left: `${(index + 1) * 12}%` }}
                      />
                    ))}
                  </div>
                  {territories.length === 0 ? (
                    <div className="absolute inset-0 flex items-center justify-center text-xs text-gray-500">
                      No territories yet
                    </div>
                  ) : (
                    territories.slice(0, 8).map((territory, index) => {
                      const color = TERRITORY_COLORS[index % TERRITORY_COLORS.length];
                      const positions = [
                        { left: "10%", top: "12%" },
                        { left: "55%", top: "18%" },
                        { left: "30%", top: "40%" },
                        { left: "65%", top: "45%" },
                        { left: "15%", top: "65%" },
                        { left: "50%", top: "70%" },
                        { left: "78%", top: "30%" },
                        { left: "78%", top: "60%" },
                      ];
                      const pos = positions[index];
                      return (
                        <button
                          key={territory._id}
                          onClick={() => setSelectedId(territory._id)}
                          className="absolute flex items-center justify-center rounded-full text-[10px] font-medium text-white transition-transform hover:scale-110"
                          style={{
                            width: "90px",
                            height: "55px",
                            background: `${color}40`,
                            border: `1.5px solid ${color}`,
                            ...pos,
                          }}
                        >
                          {territory.name}
                        </button>
                      );
                    })
                  )}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <div className="flex gap-3">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-gray-500" />
                    <Input
                      placeholder="Search territories..."
                      value={search}
                      onChange={(event) => {
                        setSearch(event.target.value);
                        setPage(1);
                      }}
                      className="h-8 pl-8 text-xs"
                    />
                  </div>
                  <Select
                    value={statusFilter}
                    onValueChange={(value) => {
                      setStatusFilter(value);
                      setPage(1);
                    }}
                  >
                    <SelectTrigger className="h-8 w-32 text-xs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {STATUS_OPTIONS.map((option) => (
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
                        {[
                          "Territory",
                          "Partner",
                          "Region",
                          "Leads",
                          "Revenue",
                          "Status",
                          "",
                        ].map((heading) => (
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
                        Array.from({ length: 5 }).map((_, rowIndex) => (
                          <tr key={rowIndex} className="border-b border-[#1e2d40]">
                            {Array.from({ length: 7 }).map((_, cellIndex) => (
                              <td key={cellIndex} className="px-4 py-3">
                                <Skeleton className="h-4 w-16" />
                              </td>
                            ))}
                          </tr>
                        ))
                      ) : territories.length === 0 ? (
                        <tr>
                          <td colSpan={7} className="px-4 py-10 text-center text-sm text-gray-500">
                            No territories yet.
                          </td>
                        </tr>
                      ) : (
                        territories.map((territory, index) => {
                          const color = TERRITORY_COLORS[index % TERRITORY_COLORS.length];
                          return (
                            <tr
                              key={territory._id}
                              onClick={() => setSelectedId(territory._id)}
                              className={`cursor-pointer border-b border-[#1e2d40] transition-colors ${
                                selected?._id === territory._id
                                  ? "bg-blue-600/10"
                                  : "hover:bg-[#0d1a2d]"
                              }`}
                            >
                              <td className="px-4 py-3">
                                <div className="flex items-center gap-2">
                                  <div
                                    className="h-3 w-3 shrink-0 rounded-full"
                                    style={{ background: color }}
                                  />
                                  <span className="text-xs font-medium text-gray-200">
                                    {territory.name}
                                  </span>
                                </div>
                              </td>
                              <td className="px-4 py-3">
                                {territory.assigned_partner_id ? (
                                  <div className="flex items-center gap-1.5">
                                    <Avatar className="h-5 w-5">
                                      {territory.assigned_partner_id?.profileImage?.url ? (
                                        <AvatarImage
                                          src={territory.assigned_partner_id.profileImage.url}
                                          alt={territory.assigned_partner_id?.name}
                                        />
                                      ) : (
                                        <AvatarFallback className="text-[8px]">
                                          {getInitials(territory.assigned_partner_id?.name || "P")}
                                        </AvatarFallback>
                                      )}
                                    </Avatar>
                                    <span className="text-xs text-gray-400">
                                      {territory.assigned_partner_id?.name || "—"}
                                    </span>
                                  </div>
                                ) : (
                                  <span className="text-xs text-gray-500">Unassigned</span>
                                )}
                              </td>
                              <td className="px-4 py-3 text-xs text-gray-400">
                                {territory.region || "—"}
                              </td>
                              <td className="px-4 py-3 text-xs text-gray-300">
                                {territory.stats?.totalLeads || 0}
                              </td>
                              <td className="px-4 py-3 text-xs font-medium text-gray-200">
                                {formatCurrency(territory.totalRevenue || 0)}
                              </td>
                              <td className="px-4 py-3">
                                <Badge
                                  variant={STATUS_BADGE[territory.status] || "secondary"}
                                  className="text-[10px]"
                                >
                                  {territory.status}
                                </Badge>
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
                                    <DropdownMenuItem onClick={() => handleEdit(territory)}>
                                      Edit
                                    </DropdownMenuItem>
                                    {territory.assigned_partner_id ? (
                                      <DropdownMenuItem
                                        onClick={() => unassignMutation.mutate(territory._id)}
                                      >
                                        Unassign Partner
                                      </DropdownMenuItem>
                                    ) : null}
                                    <DropdownMenuItem
                                      className="text-red-400"
                                      onClick={() => {
                                        if (
                                          confirm(`Delete territory "${territory.name}"?`)
                                        ) {
                                          deleteMutation.mutate(territory._id);
                                        }
                                      }}
                                    >
                                      Delete
                                    </DropdownMenuItem>
                                  </DropdownMenuContent>
                                </DropdownMenu>
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
                        )} of ${meta.total}`
                      : "0 territories"}
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
          </div>

          <div className="space-y-4">
            {selected ? (
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-sm">{selected.name}</CardTitle>
                    <Badge
                      variant={STATUS_BADGE[selected.status] || "secondary"}
                      className="text-[10px]"
                    >
                      {selected.status}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  {selected.assigned_partner_id ? (
                    <div className="mb-4 flex items-center gap-2 text-xs">
                      <Avatar className="h-6 w-6">
                        {selected.assigned_partner_id?.profileImage?.url ? (
                          <AvatarImage
                            src={selected.assigned_partner_id.profileImage.url}
                            alt={selected.assigned_partner_id?.name}
                          />
                        ) : (
                          <AvatarFallback className="text-[9px]">
                            {getInitials(selected.assigned_partner_id?.name || "P")}
                          </AvatarFallback>
                        )}
                      </Avatar>
                      <span className="text-gray-300">
                        {selected.assigned_partner_id?.name}
                      </span>
                    </div>
                  ) : (
                    <p className="mb-4 text-xs text-gray-500">No partner assigned</p>
                  )}

                  <div className="mb-4 grid grid-cols-2 gap-3">
                    {[
                      { label: "Leads", value: selected.stats?.totalLeads || 0 },
                      { label: "Active Leads", value: selected.stats?.activeLeads || 0 },
                      {
                        label: "Revenue",
                        value: formatCurrency(selected.totalRevenue || 0),
                      },
                      {
                        label: "Potential",
                        value: formatCurrency(detail?.stats?.potentialValue || 0),
                      },
                    ].map((item) => (
                      <div
                        key={item.label}
                        className="rounded-lg bg-[#1e2d40] p-2.5 text-center"
                      >
                        <p className="text-sm font-bold text-white">{item.value}</p>
                        <p className="text-[10px] text-gray-400">{item.label}</p>
                      </div>
                    ))}
                  </div>

                  <div className="space-y-1.5 text-xs">
                    <div className="flex justify-between border-b border-[#1e2d40] py-1">
                      <span className="text-gray-500">Region</span>
                      <span className="text-gray-200">{selected.region || "—"}</span>
                    </div>
                    <div className="flex justify-between border-b border-[#1e2d40] py-1">
                      <span className="text-gray-500">Zip codes</span>
                      <span className="text-gray-200">
                        {(selected.zipCodes || []).length}
                      </span>
                    </div>
                    <div className="flex justify-between border-b border-[#1e2d40] py-1">
                      <span className="text-gray-500">Created</span>
                      <span className="text-gray-200">
                        {selected.createdAt ? formatDate(selected.createdAt) : "—"}
                      </span>
                    </div>
                    <div className="flex justify-between py-1">
                      <span className="text-gray-500">Last updated</span>
                      <span className="text-gray-200">
                        {selected.updatedAt ? formatDate(selected.updatedAt) : "—"}
                      </span>
                    </div>
                  </div>

                  {selected.description ? (
                    <p className="mt-3 rounded-lg bg-[#1e2d40] p-2 text-[11px] text-gray-300">
                      {selected.description}
                    </p>
                  ) : null}

                  <div className="mt-4 flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1 text-xs"
                      onClick={() => handleEdit(selected)}
                    >
                      Edit
                    </Button>
                    {selected.assigned_partner_id ? (
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex-1 text-xs"
                        onClick={() => unassignMutation.mutate(selected._id)}
                        disabled={unassignMutation.isPending}
                      >
                        Unassign
                      </Button>
                    ) : null}
                  </div>
                </CardContent>
              </Card>
            ) : null}

            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Territory Insights</CardTitle>
              </CardHeader>
              <CardContent>
                {[
                  {
                    label: "Active",
                    value: summary.activeTerritories || 0,
                    color: "bg-emerald-500",
                  },
                  {
                    label: "Unassigned",
                    value: summary.unassignedTerritories || 0,
                    color: "bg-amber-500",
                  },
                  {
                    label: "Assigned partners",
                    value: summary.assignedPartners || 0,
                    color: "bg-blue-500",
                  },
                ].map((item) => (
                  <div key={item.label} className="flex items-center gap-2 py-1">
                    <div className={`h-2 w-2 rounded-full ${item.color}`} />
                    <span className="flex-1 text-xs text-gray-400">{item.label}</span>
                    <span className="text-xs text-gray-300">{item.value}</span>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      <TerritoryFormDialog
        open={formOpen}
        onOpenChange={setFormOpen}
        territory={editing}
      />
    </div>
  );
}
