"use client";
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { partnersApi } from "@/lib/api";
import { Header } from "@/components/layout/header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { formatCurrency, getInitials, formatDate } from "@/lib/utils";
import { toast } from "sonner";
import {
  Plus, Search, Users, UserCheck, TrendingUp, Award,
  MoreHorizontal, ChevronLeft, ChevronRight
} from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";

const defaultPartners = [
  { _id: "1", name: "James Anderson", email: "james@email.com", territory: "Hamburg Center", tier: "Elite", status: "active", leads: 845, conversionRate: 18.5, revenue: 78490, customers: 156 },
  { _id: "2", name: "Michael Brown", email: "michael@email.com", territory: "West District", tier: "Premium", status: "active", leads: 410, conversionRate: 14.3, revenue: 54280, customers: 112 },
  { _id: "3", name: "David Wilson", email: "david@email.com", territory: "East District", tier: "Standard", status: "active", leads: 376, conversionRate: 14.2, revenue: 45480, customers: 80 },
  { _id: "4", name: "North Zone", email: "north@email.com", territory: "North Zone", tier: "Basic", status: "active", leads: 625, conversionRate: 17.1, revenue: 38100, customers: 56 },
  { _id: "5", name: "South West", email: "sw@email.com", territory: "South West", tier: "Basic", status: "inactive", leads: 348, conversionRate: 14.7, revenue: 28970, customers: 44 },
];

export default function PartnersPage() {
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<any>(defaultPartners[0]);
  const limit = 10;

  const { data, isLoading } = useQuery({
    queryKey: ["partners", page, search],
    queryFn: () => partnersApi.getAll({ page, limit, search: search || undefined }).then((r) => r.data),
  });

  const partners = data?.data?.length ? data.data : defaultPartners;
  const meta = data?.meta || { total: 24, page: 1, limit };

  const deleteMutation = useMutation({
    mutationFn: (id: string) => partnersApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["partners"] });
      toast.success("Partner deleted");
    },
  });

  const tierColors: Record<string, string> = {
    Elite: "success",
    Premium: "default",
    Standard: "warning",
    Basic: "secondary",
  };

  return (
    <div>
      <Header title="Partners" subtitle="Manage your partners and track their performance." />
      <div className="p-6 space-y-5">
        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: "Total Partners", value: "24", change: "+14%", icon: Users, color: "bg-blue-600" },
            { label: "Active Partners", value: "18", change: "75%", icon: UserCheck, color: "bg-emerald-600" },
            { label: "Top Performing", value: "James Anderson", change: "€78,490", icon: Award, color: "bg-amber-600" },
            { label: "Total Revenue", value: "€86,450", change: "+18%", icon: TrendingUp, color: "bg-purple-600" },
          ].map((s) => (
            <Card key={s.label}>
              <CardContent className="pt-4">
                <div className="flex items-center gap-3">
                  <div className={`w-9 h-9 rounded-lg ${s.color} flex items-center justify-center flex-shrink-0`}>
                    <s.icon className="w-4 h-4 text-white" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-base font-bold text-white truncate">{s.value}</p>
                    <p className="text-[10px] text-gray-400">{s.label}</p>
                    <p className="text-[10px] text-emerald-400">{s.change}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          {/* Table */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <div className="flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                  <Input placeholder="Search partners..." value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }} className="pl-9" />
                </div>
                <Select><SelectTrigger className="w-32"><SelectValue placeholder="Status All" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All</SelectItem>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                  </SelectContent>
                </Select>
                <Button onClick={() => toast.info("Add partner form coming soon")}><Plus className="w-4 h-4" />Add Partner</Button>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-[#1e2d40]">
                    {["Partner", "Territory", "Tier", "Status", "Revenue", "Customers", "Conv. Rate", "Actions"].map((h) => (
                      <th key={h} className="px-4 py-3 text-left text-xs font-medium text-gray-500 whitespace-nowrap">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {isLoading ? Array(5).fill(0).map((_, i) => (
                    <tr key={i} className="border-b border-[#1e2d40]">
                      {Array(8).fill(0).map((_, j) => <td key={j} className="px-4 py-3"><Skeleton className="h-4 w-16" /></td>)}
                    </tr>
                  )) : partners.map((p: any) => (
                    <tr key={p._id} onClick={() => setSelected(p)}
                      className={`border-b border-[#1e2d40] cursor-pointer transition-colors ${selected?._id === p._id ? "bg-blue-600/10" : "hover:bg-[#0d1a2d]"}`}>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <Avatar className="w-7 h-7"><AvatarFallback className="text-[10px]">{getInitials(p.name)}</AvatarFallback></Avatar>
                          <div>
                            <p className="text-xs font-medium text-gray-200">{p.name}</p>
                            <p className="text-[10px] text-gray-500">{p.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-xs text-gray-400">{p.territory}</td>
                      <td className="px-4 py-3"><Badge variant={tierColors[p.tier] as any || "default"} className="text-[10px]">{p.tier}</Badge></td>
                      <td className="px-4 py-3"><Badge variant={p.status === "active" ? "success" : "destructive"} className="text-[10px]">{p.status}</Badge></td>
                      <td className="px-4 py-3 text-xs text-gray-200 font-medium">{formatCurrency(p.revenue || 0)}</td>
                      <td className="px-4 py-3 text-xs text-gray-400">{p.customers}</td>
                      <td className="px-4 py-3 text-xs text-gray-400">{p.conversionRate}%</td>
                      <td className="px-4 py-3">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-7 w-7" onClick={(e) => e.stopPropagation()}>
                              <MoreHorizontal className="w-4 h-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem>View Details</DropdownMenuItem>
                            <DropdownMenuItem>Edit</DropdownMenuItem>
                            <DropdownMenuItem>Assign Territory</DropdownMenuItem>
                            <DropdownMenuItem className="text-red-400" onClick={() => deleteMutation.mutate(p._id)}>Remove</DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <div className="flex items-center justify-between px-4 py-3 border-t border-[#1e2d40]">
                <p className="text-xs text-gray-500">Showing {partners.length} of {meta.total || 24} partners</p>
                <div className="flex items-center gap-1">
                  <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}>
                    <ChevronLeft className="w-4 h-4" />
                  </Button>
                  <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setPage(p => p + 1)}>
                    <ChevronRight className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Right Panel */}
          <div className="space-y-4">
            {/* Partner Overview Donut */}
            <Card>
              <CardHeader><CardTitle className="text-sm">Partner Overview</CardTitle></CardHeader>
              <CardContent>
                <div className="flex items-center justify-center mb-4">
                  <div className="relative w-24 h-24">
                    <svg viewBox="0 0 36 36" className="w-full h-full -rotate-90">
                      <circle cx="18" cy="18" r="15.9" fill="none" stroke="#1e2d40" strokeWidth="3" />
                      <circle cx="18" cy="18" r="15.9" fill="none" stroke="#3b82f6" strokeWidth="3"
                        strokeDasharray="50 50" strokeDashoffset="0" />
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                      <span className="text-lg font-bold text-white">24</span>
                      <span className="text-[9px] text-gray-500">Total</span>
                    </div>
                  </div>
                </div>
                {[
                  { label: "Elite", value: 1, pct: "2.0%", color: "bg-emerald-500" },
                  { label: "Premium", value: 4, pct: "17.7%", color: "bg-blue-500" },
                  { label: "Standard", value: 6, pct: "25.0%", color: "bg-purple-500" },
                  { label: "Basic", value: 10, pct: "41.7%", color: "bg-amber-500" },
                  { label: "Inactive", value: 3, pct: "12.5%", color: "bg-gray-500" },
                ].map((t) => (
                  <div key={t.label} className="flex items-center gap-2 py-1">
                    <div className={`w-2 h-2 rounded-full ${t.color} flex-shrink-0`} />
                    <span className="text-xs text-gray-400 flex-1">{t.label}</span>
                    <span className="text-xs text-gray-300">{t.value}</span>
                    <span className="text-xs text-gray-500">{t.pct}</span>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Top Partners */}
            <Card>
              <CardHeader>
                <div className="flex justify-between">
                  <CardTitle className="text-sm">Top Partners</CardTitle>
                  <button className="text-xs text-blue-400">View all</button>
                </div>
              </CardHeader>
              <CardContent>
                {["James Anderson", "Michael Brown", "David Wilson", "Anna Schmidt", "Robert Taylor"].map((n, i) => (
                  <div key={n} className="flex items-center gap-2 py-1.5">
                    <span className="text-xs text-gray-500 w-3">{i + 1}</span>
                    <Avatar className="w-6 h-6"><AvatarFallback className="text-[9px]">{getInitials(n)}</AvatarFallback></Avatar>
                    <span className="text-xs text-gray-300 flex-1">{n}</span>
                    <span className="text-xs text-gray-400">{["€34,880", "€15,640", "€13,680", "€8,750", "€6,280"][i]}</span>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card>
              <CardHeader><CardTitle className="text-sm">Quick Actions</CardTitle></CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-2">
                  {["Add Partner", "Import Partners", "Partner Tiers", "Send Announcement"].map((a) => (
                    <Button key={a} variant="secondary" size="sm" className="text-[10px] h-8">{a}</Button>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
