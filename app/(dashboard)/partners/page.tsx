/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { partnersApi } from "@/lib/api";
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
import { formatCurrency, getInitials } from "@/lib/utils";
import { toast } from "sonner";
import {
  Award,
  ChevronLeft,
  ChevronRight,
  MoreHorizontal,
  Plus,
  Search,
  TrendingUp,
  UserCheck,
  Users,
} from "lucide-react";
import { PartnerFormDialog } from "@/components/partner-form-dialog";
import { PartnerDetailsDialog } from "@/components/partner-details-dialog";

const STATUS_OPTIONS = [
  { value: "all", label: "All status" },
  { value: "active", label: "Active" },
  { value: "inactive", label: "Inactive" },
  { value: "suspended", label: "Suspended" },
];

const TIER_OPTIONS = [
  { value: "all", label: "All tiers" },
  { value: "basic", label: "Basic" },
  { value: "standard", label: "Standard" },
  { value: "premium", label: "Premium" },
  { value: "elite", label: "Elite" },
];

const TIER_COLORS: Record<string, string> = {
  elite: "text-emerald-400 bg-emerald-600/20",
  premium: "text-blue-400 bg-blue-600/20",
  standard: "text-purple-400 bg-purple-600/20",
  basic: "text-amber-400 bg-amber-600/20",
};

const STATUS_BADGE: Record<string, "success" | "destructive" | "secondary"> = {
  active: "success",
  inactive: "secondary",
  suspended: "destructive",
};

export default function PartnersPage() {
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [tierFilter, setTierFilter] = useState("all");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<any>(null);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const limit = 10;

  const { data: partnersResponse, isLoading } = useQuery({
    queryKey: ["partners", page, search, statusFilter, tierFilter],
    queryFn: () =>
      partnersApi
        .getAll({
          page,
          limit,
          search: search || undefined,
          status: statusFilter === "all" ? undefined : statusFilter,
          tier: tierFilter === "all" ? undefined : tierFilter,
        })
        .then((response) => response.data),
  });

  const partners: any[] = partnersResponse?.data || [];
  const meta = partnersResponse?.meta || { total: 0, page: 1, totalPages: 1, summary: null };
  const summary = meta.summary || { totalPartners: 0, activePartners: 0, totalEarnings: 0, byTier: {} };
  const totalPages = meta.totalPages || 1;

  const selectedPartner = useMemo(
    () => partners.find((partner) => partner._id === selectedId) || partners[0] || null,
    [partners, selectedId]
  );

  const topPartner = useMemo(() => {
    const sorted = [...partners].sort(
      (a, b) => (b.totalEarnings || 0) - (a.totalEarnings || 0)
    );
    return sorted[0];
  }, [partners]);

  const tierBreakdown = useMemo(() => {
    const total = summary.totalPartners || 1;
    return [
      { key: "elite", label: "Elite", count: summary.byTier?.elite || 0, color: "bg-emerald-500" },
      { key: "premium", label: "Premium", count: summary.byTier?.premium || 0, color: "bg-blue-500" },
      { key: "standard", label: "Standard", count: summary.byTier?.standard || 0, color: "bg-purple-500" },
      { key: "basic", label: "Basic", count: summary.byTier?.basic || 0, color: "bg-amber-500" },
    ].map((item) => ({ ...item, pct: total > 0 ? ((item.count / total) * 100).toFixed(1) : "0.0" }));
  }, [summary]);

  const topPartners = useMemo(
    () =>
      [...partners]
        .sort((a, b) => (b.totalEarnings || 0) - (a.totalEarnings || 0))
        .slice(0, 5),
    [partners]
  );

  const stats = [
    { label: "Total Partners", value: summary.totalPartners, icon: Users, color: "bg-blue-600" },
    { label: "Active Partners", value: summary.activePartners, icon: UserCheck, color: "bg-emerald-600" },
    {
      label: "Top Performer",
      value: topPartner?.userId?.name || "—",
      sub: topPartner ? formatCurrency(topPartner.totalEarnings || 0) : "",
      icon: Award,
      color: "bg-amber-600",
    },
    {
      label: "Total Earnings",
      value: formatCurrency(summary.totalEarnings || 0),
      icon: TrendingUp,
      color: "bg-purple-600",
    },
  ];

  const deleteMutation = useMutation({
    mutationFn: (id: string) => partnersApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["partners"] });
      toast.success("Partner removed");
    },
    onError: (error: any) =>
      toast.error(
        error?.response?.data?.message || error?.message || "Failed to remove partner"
      ),
  });

  const handleEdit = (partner: any) => {
    setEditing(partner);
    setFormOpen(true);
  };

  const handleView = (partner: any) => {
    setSelectedId(partner._id);
    setDetailsOpen(true);
  };

  return (
    <div>
      <Header
        title="Partners"
        subtitle="Manage your sales partners and track their performance."
        action={
          <Button
            size="sm"
            onClick={() => {
              setEditing(null);
              setFormOpen(true);
            }}
          >
            <Plus className="mr-1 h-4 w-4" />
            Add Partner
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
                  <div className="min-w-0">
                    <p className="truncate text-base font-bold text-white">{stat.value}</p>
                    <p className="text-[10px] text-gray-400">{stat.label}</p>
                    {stat.sub ? (
                      <p className="text-[10px] text-emerald-400">{stat.sub}</p>
                    ) : null}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
          <Card className="lg:col-span-2">
            <CardHeader>
              <div className="flex flex-col gap-3 sm:flex-row">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" />
                  <Input
                    placeholder="Search partners..."
                    value={search}
                    onChange={(event) => {
                      setSearch(event.target.value);
                      setPage(1);
                    }}
                    className="pl-9"
                  />
                </div>
                <Select
                  value={statusFilter}
                  onValueChange={(value) => {
                    setStatusFilter(value);
                    setPage(1);
                  }}
                >
                  <SelectTrigger className="w-32">
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
                <Select
                  value={tierFilter}
                  onValueChange={(value) => {
                    setTierFilter(value);
                    setPage(1);
                  }}
                >
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {TIER_OPTIONS.map((option) => (
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
                      {["Partner", "Territory", "Tier", "Status", "Earnings", "Customers", "Leads", ""].map(
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
                              <Skeleton className="h-4 w-16" />
                            </td>
                          ))}
                        </tr>
                      ))
                    ) : partners.length === 0 ? (
                      <tr>
                        <td colSpan={8} className="px-4 py-10 text-center text-sm text-gray-500">
                          No partners found.
                        </td>
                      </tr>
                    ) : (
                      partners.map((partner) => (
                        <tr
                          key={partner._id}
                          onClick={() => setSelectedId(partner._id)}
                          className={`cursor-pointer border-b border-[#1e2d40] transition-colors ${
                            selectedPartner?._id === partner._id
                              ? "bg-blue-600/10"
                              : "hover:bg-[#0d1a2d]"
                          }`}
                        >
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-2">
                              <Avatar className="h-7 w-7">
                                {partner.userId?.profileImage?.url ? (
                                  <AvatarImage
                                    src={partner.userId.profileImage.url}
                                    alt={partner.userId.name}
                                  />
                                ) : (
                                  <AvatarFallback className="text-[10px]">
                                    {getInitials(partner.userId?.name || partner.businessName || "P")}
                                  </AvatarFallback>
                                )}
                              </Avatar>
                              <div className="min-w-0">
                                <p className="truncate text-xs font-medium text-gray-200">
                                  {partner.userId?.name || partner.businessName}
                                </p>
                                <p className="truncate text-[10px] text-gray-500">
                                  {partner.userId?.email}
                                </p>
                              </div>
                            </div>
                          </td>
                          <td className="px-4 py-3 text-xs text-gray-400">
                            {partner.territory_id?.name || "—"}
                          </td>
                          <td className="px-4 py-3">
                            <span
                              className={`rounded-full px-2 py-0.5 text-[10px] ${
                                TIER_COLORS[partner.tier] || "bg-gray-600/20 text-gray-300"
                              }`}
                            >
                              {partner.tier}
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            <Badge variant={STATUS_BADGE[partner.status] || "secondary"} className="text-[10px]">
                              {partner.status}
                            </Badge>
                          </td>
                          <td className="px-4 py-3 text-xs font-medium text-gray-200">
                            {formatCurrency(partner.totalEarnings || 0)}
                          </td>
                          <td className="px-4 py-3 text-xs text-gray-400">
                            {partner.totalCustomers || 0}
                          </td>
                          <td className="px-4 py-3 text-xs text-gray-400">
                            {partner.totalLeads || 0}
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
                                <DropdownMenuItem onClick={() => handleView(partner)}>
                                  View Details
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => handleEdit(partner)}>
                                  Edit
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  className="text-red-400"
                                  onClick={() => {
                                    if (
                                      confirm(
                                        `Remove ${
                                          partner.userId?.name || partner.businessName
                                        }? This cannot be undone.`
                                      )
                                    ) {
                                      deleteMutation.mutate(partner._id);
                                    }
                                  }}
                                >
                                  Remove
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
                      )} of ${meta.total} partners`
                    : "0 partners"}
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
                    Page {page} of {totalPages || 1}
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
                <CardTitle className="text-sm">Partner Overview</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="mb-4 flex items-center justify-center">
                  <div className="relative h-24 w-24">
                    <svg viewBox="0 0 36 36" className="h-full w-full -rotate-90">
                      <circle cx="18" cy="18" r="15.9" fill="none" stroke="#1e2d40" strokeWidth="3" />
                      <circle
                        cx="18"
                        cy="18"
                        r="15.9"
                        fill="none"
                        stroke="#3b82f6"
                        strokeWidth="3"
                        strokeDasharray={`${
                          (summary.activePartners / Math.max(summary.totalPartners, 1)) * 100
                        } 100`}
                      />
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                      <span className="text-lg font-bold text-white">{summary.totalPartners}</span>
                      <span className="text-[9px] text-gray-500">Total</span>
                    </div>
                  </div>
                </div>
                {tierBreakdown.map((tier) => (
                  <div key={tier.key} className="flex items-center gap-2 py-1">
                    <div className={`h-2 w-2 shrink-0 rounded-full ${tier.color}`} />
                    <span className="flex-1 text-xs text-gray-400">{tier.label}</span>
                    <span className="text-xs text-gray-300">{tier.count}</span>
                    <span className="w-12 text-right text-xs text-gray-500">{tier.pct}%</span>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <div className="flex justify-between">
                  <CardTitle className="text-sm">Top Partners</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                {topPartners.length === 0 ? (
                  <p className="text-xs text-gray-500">No data yet.</p>
                ) : (
                  topPartners.map((partner, index) => (
                    <div
                      key={partner._id}
                      onClick={() => handleView(partner)}
                      className="flex cursor-pointer items-center gap-2 rounded py-1.5 hover:bg-[#0d1a2d]"
                    >
                      <span className="w-3 text-xs text-gray-500">{index + 1}</span>
                      <Avatar className="h-6 w-6">
                        <AvatarFallback className="text-[9px]">
                          {getInitials(partner.userId?.name || partner.businessName || "P")}
                        </AvatarFallback>
                      </Avatar>
                      <span className="flex-1 truncate text-xs text-gray-300">
                        {partner.userId?.name || partner.businessName}
                      </span>
                      <span className="text-xs text-gray-400">
                        {formatCurrency(partner.totalEarnings || 0)}
                      </span>
                    </div>
                  ))
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      <PartnerFormDialog open={formOpen} onOpenChange={setFormOpen} partner={editing} />
      <PartnerDetailsDialog
        open={detailsOpen}
        onOpenChange={setDetailsOpen}
        partnerId={selectedPartner?._id || null}
        onEdit={() => {
          setDetailsOpen(false);
          setEditing(selectedPartner);
          setFormOpen(true);
        }}
      />
    </div>
  );
}
