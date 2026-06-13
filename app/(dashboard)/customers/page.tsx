/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { adminApi } from "@/lib/api";
import { Header } from "@/components/layout/header";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
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
import {
  Building2,
  ChevronLeft,
  ChevronRight,
  MoreHorizontal,
  Plus,
  Search,
  ShieldCheck,
  UserCheck,
  Users,
} from "lucide-react";
import { BusinessOwnerFormDialog } from "@/components/business-owner-form-dialog";
import { BusinessOwnerDetailsDialog } from "@/components/business-owner-details-dialog";

const STATUS_FILTER_OPTIONS = [
  { value: "all", label: "All status" },
  { value: "active", label: "Active" },
  { value: "blocked", label: "Blocked" },
  { value: "unverified", label: "Unverified" },
];

type BusinessOwner = {
  _id: string;
  name?: string;
  email?: string;
  phoneNumber?: string;
  role?: string;
  isBlocked?: boolean;
  verificationInfo?: { verified?: boolean };
  addedBy?: string | null;
  createdAt?: string;
};

const getOwnerStatus = (owner: BusinessOwner) => {
  if (owner.isBlocked) return "blocked";
  if (!owner.verificationInfo?.verified) return "unverified";
  return "active";
};

const STATUS_BADGE: Record<string, "success" | "destructive" | "secondary"> = {
  active: "success",
  blocked: "destructive",
  unverified: "secondary",
};

export default function CustomersPage() {
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [editing, setEditing] = useState<BusinessOwner | null>(null);
  const limit = 10;

  const { data: ownersResponse, isLoading } = useQuery({
    queryKey: ["business-owners-directory"],
    queryFn: () =>
      adminApi
        .getAllUsers({ role: "business_owner", page: 1, limit: 500 })
        .then((response) => response.data),
  });

  const owners = useMemo<BusinessOwner[]>(
    () =>
      (ownersResponse?.data || []).filter(
        (user: BusinessOwner) => user.role === "business_owner"
      ),
    [ownersResponse]
  );

  const filteredOwners = useMemo(() => {
    const query = search.trim().toLowerCase();
    return owners.filter((owner) => {
      const matchesSearch =
        !query ||
        owner.name?.toLowerCase().includes(query) ||
        owner.email?.toLowerCase().includes(query) ||
        owner.phoneNumber?.toLowerCase().includes(query);

      const status = getOwnerStatus(owner);
      const matchesStatus = statusFilter === "all" || status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [owners, search, statusFilter]);

  const totalPages = Math.max(1, Math.ceil(filteredOwners.length / limit));

  const paginatedOwners = useMemo(() => {
    const start = (page - 1) * limit;
    return filteredOwners.slice(start, start + limit);
  }, [filteredOwners, page]);

  const selectedOwner = useMemo(
    () =>
      filteredOwners.find((owner) => owner._id === selectedId) ||
      paginatedOwners[0] ||
      null,
    [filteredOwners, paginatedOwners, selectedId]
  );

  const stats = useMemo(
    () => [
      {
        label: "Total Owners",
        value: owners.length,
        icon: Users,
        color: "bg-blue-600",
      },
      {
        label: "Verified Owners",
        value: owners.filter((owner) => owner.verificationInfo?.verified).length,
        icon: ShieldCheck,
        color: "bg-emerald-600",
      },
      {
        label: "Active Owners",
        value: owners.filter((owner) => getOwnerStatus(owner) === "active").length,
        icon: UserCheck,
        color: "bg-purple-600",
      },
      {
        label: "Partner Added",
        value: owners.filter((owner) => owner.addedBy).length,
        icon: Building2,
        color: "bg-amber-600",
      },
    ],
    [owners]
  );

  const deleteMutation = useMutation({
    mutationFn: (id: string) => adminApi.deleteUser(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["business-owners-directory"] });
      toast.success("Business owner deleted");
      setDetailsOpen(false);
      setEditing(null);
      setSelectedId(null);
    },
    onError: (error: any) =>
      toast.error(
        error?.response?.data?.message || error?.message || "Failed to delete business owner"
      ),
  });

  const handleView = (owner: BusinessOwner) => {
    setSelectedId(owner._id);
    setDetailsOpen(true);
  };

  const handleEdit = (owner: BusinessOwner) => {
    setEditing(owner);
    setFormOpen(true);
  };

  const handleDelete = (owner: BusinessOwner) => {
    if (!confirm(`Delete ${owner.name || "this business owner"}? This cannot be undone.`)) {
      return;
    }
    deleteMutation.mutate(owner._id);
  };

  return (
    <div>
      <Header
        title="Business Owners"
        subtitle="Manage all registered business owners across the platform."
        action={
          <Button
            size="sm"
            onClick={() => {
              setEditing(null);
              setFormOpen(true);
            }}
          >
            <Plus className="mr-1 h-4 w-4" />
            Add Business Owner
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
              <div className="flex flex-col gap-3 sm:flex-row">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" />
                  <Input
                    placeholder="Search business owners..."
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
                  <SelectTrigger className="w-full sm:w-40">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {STATUS_FILTER_OPTIONS.map((option) => (
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
                      {["Owner", "Status", "Phone", "Source", "Joined", ""].map((heading) => (
                        <th
                          key={heading}
                          className="px-4 py-3 text-left text-xs font-medium text-gray-500"
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
                          {Array.from({ length: 6 }).map((_, cellIndex) => (
                            <td key={cellIndex} className="px-4 py-3">
                              <Skeleton className="h-4 w-20" />
                            </td>
                          ))}
                        </tr>
                      ))
                    ) : paginatedOwners.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="px-4 py-10 text-center text-sm text-gray-500">
                          No business owners match your filters.
                        </td>
                      </tr>
                    ) : (
                      paginatedOwners.map((owner) => {
                        const status = getOwnerStatus(owner);
                        return (
                          <tr
                            key={owner._id}
                            className={`cursor-pointer border-b border-[#1e2d40] transition-colors ${
                              selectedOwner?._id === owner._id
                                ? "bg-blue-600/10"
                                : "hover:bg-[#0d1a2d]"
                            }`}
                            onClick={() => setSelectedId(owner._id)}
                          >
                            <td className="px-4 py-3">
                              <div className="flex items-center gap-2">
                                <Avatar className="h-8 w-8">
                                  <AvatarFallback className="text-xs">
                                    {getInitials(owner.name || "BO")}
                                  </AvatarFallback>
                                </Avatar>
                                <div>
                                  <p className="text-xs font-medium text-gray-200">
                                    {owner.name || "Unnamed owner"}
                                  </p>
                                  <p className="text-[10px] text-gray-500">
                                    {owner.email || "No email"}
                                  </p>
                                </div>
                              </div>
                            </td>
                            <td className="px-4 py-3">
                              <Badge variant={STATUS_BADGE[status] || "secondary"}>
                                {status}
                              </Badge>
                            </td>
                            <td className="px-4 py-3 text-xs text-gray-400">
                              {owner.phoneNumber || "—"}
                            </td>
                            <td className="px-4 py-3 text-xs text-gray-400">
                              {owner.addedBy ? "Sales partner" : "Direct signup"}
                            </td>
                            <td className="px-4 py-3 text-xs text-gray-400">
                              {owner.createdAt ? formatDate(owner.createdAt) : "—"}
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
                                  <DropdownMenuItem onClick={() => handleView(owner)}>
                                    View Profile
                                  </DropdownMenuItem>
                                  <DropdownMenuItem onClick={() => handleEdit(owner)}>
                                    Edit
                                  </DropdownMenuItem>
                                  <DropdownMenuItem
                                    className="text-red-400"
                                    onClick={() => handleDelete(owner)}
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
                  {filteredOwners.length > 0
                    ? `${(page - 1) * limit + 1}-${Math.min(
                        page * limit,
                        filteredOwners.length
                      )} of ${filteredOwners.length} business owners`
                    : "0 business owners"}
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
                    onClick={() => setPage((current) => Math.min(totalPages, current + 1))}
                    disabled={page >= totalPages}
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="space-y-4">
            {selectedOwner ? (
              <Card>
                <CardContent className="pt-4">
                  <div className="mb-4 flex items-start gap-3">
                    <Avatar className="h-12 w-12">
                      <AvatarFallback>{getInitials(selectedOwner.name || "BO")}</AvatarFallback>
                    </Avatar>
                    <div className="min-w-0 flex-1">
                      <p className="truncate font-semibold text-gray-100">
                        {selectedOwner.name || "Unnamed owner"}
                      </p>
                      <p className="truncate text-xs text-gray-400">
                        {selectedOwner.email || "—"}
                      </p>
                      <p className="truncate text-[11px] text-gray-500">
                        {selectedOwner.phoneNumber || "—"}
                      </p>
                    </div>
                  </div>

                  <div className="space-y-2 text-xs">
                    <div className="flex justify-between border-b border-[#1e2d40] py-1.5">
                      <span className="text-gray-500">Role</span>
                      <span className="text-gray-200">
                        {selectedOwner.role?.replace(/_/g, " ") || "—"}
                      </span>
                    </div>
                    <div className="flex justify-between border-b border-[#1e2d40] py-1.5">
                      <span className="text-gray-500">Status</span>
                      <span className="text-gray-200 capitalize">
                        {getOwnerStatus(selectedOwner)}
                      </span>
                    </div>
                    <div className="flex justify-between border-b border-[#1e2d40] py-1.5">
                      <span className="text-gray-500">Source</span>
                      <span className="text-gray-200">
                        {selectedOwner.addedBy ? "Sales partner" : "Direct signup"}
                      </span>
                    </div>
                    <div className="flex justify-between py-1.5">
                      <span className="text-gray-500">Joined</span>
                      <span className="text-gray-200">
                        {selectedOwner.createdAt ? formatDate(selectedOwner.createdAt) : "—"}
                      </span>
                    </div>
                  </div>

                  <div className="mt-4 grid grid-cols-2 gap-2">
                    <Button size="sm" variant="outline" onClick={() => handleView(selectedOwner)}>
                      View Profile
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => handleEdit(selectedOwner)}>
                      Edit
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ) : null}
          </div>
        </div>
      </div>

      <BusinessOwnerFormDialog
        open={formOpen}
        onOpenChange={setFormOpen}
        owner={editing}
      />

      <BusinessOwnerDetailsDialog
        open={detailsOpen}
        onOpenChange={setDetailsOpen}
        ownerId={selectedOwner?._id || null}
        onEdit={() => {
          setDetailsOpen(false);
          setEditing(selectedOwner);
          setFormOpen(true);
        }}
      />
    </div>
  );
}
