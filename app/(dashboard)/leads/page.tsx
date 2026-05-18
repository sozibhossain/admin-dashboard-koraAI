"use client";
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { leadsApi } from "@/lib/api";
import { Header } from "@/components/layout/header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { getInitials, formatCurrency, formatDate } from "@/lib/utils";
import { toast } from "sonner";
import {
  Plus, Search, Filter, Target, TrendingUp, Users, Star,
  MoreHorizontal, ChevronLeft, ChevronRight
} from "lucide-react";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";

const statusColors: Record<string, string> = {
  new: "default",
  contacted: "purple",
  qualified: "success",
  proposal: "warning",
  won: "success",
  lost: "destructive",
};

const leadSources = ["Website", "Referral", "Ad Campaign", "Partner", "Other"];

export default function LeadsPage() {
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const limit = 10;

  const { data, isLoading } = useQuery({
    queryKey: ["leads", page, search, statusFilter],
    queryFn: () => leadsApi.getAll({
      page,
      limit,
      search: search || undefined,
      status: statusFilter !== "all" ? statusFilter : undefined
    }).then((r) => r.data),
  });

  const leads = data?.data || [];
  const meta = data?.meta || { total: 0, page: 1, limit };
  const totalPages = Math.ceil(meta.total / limit);

  const deleteMutation = useMutation({
    mutationFn: (id: string) => leadsApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["leads"] });
      toast.success("Lead deleted");
    },
    onError: () => toast.error("Failed to delete lead"),
  });

  const statusMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) =>
      leadsApi.changeStatus(id, { status }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["leads"] });
      toast.success("Status updated");
    },
  });

  const stats = [
    { label: "All Leads", value: meta.total || "1,245", color: "text-white" },
    { label: "New", value: "270", color: "text-blue-400" },
    { label: "Contacted", value: "432", color: "text-purple-400" },
    { label: "Qualified", value: "286", color: "text-emerald-400" },
    { label: "Proposal", value: "148", color: "text-amber-400" },
    { label: "Won", value: "90", color: "text-emerald-400" },
    { label: "Lost", value: "20", color: "text-red-400" },
  ];

  return (
    <div>
      <Header title="Leads" subtitle="Manage and track all leads across the platform." />
      <div className="p-6 space-y-5">
        {/* Status Tabs */}
        <div className="flex flex-wrap gap-2">
          {stats.map((s) => (
            <button
              key={s.label}
              onClick={() => setStatusFilter(s.label === "All Leads" ? "all" : s.label.toLowerCase())}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                (statusFilter === "all" && s.label === "All Leads") ||
                statusFilter === s.label.toLowerCase()
                  ? "bg-blue-600 text-white"
                  : "bg-[#1e2d40] text-gray-400 hover:text-gray-200"
              }`}
            >
              {s.label} <span className={s.color}>{s.value}</span>
            </button>
          ))}
        </div>

        {/* Controls */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
            <Input
              placeholder="Search leads..."
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              className="pl-9"
            />
          </div>
          <Select>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="All Territories" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Territories</SelectItem>
            </SelectContent>
          </Select>
          <Select>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="All Sources" />
            </SelectTrigger>
            <SelectContent>
              {leadSources.map((s) => (
                <SelectItem key={s} value={s.toLowerCase()}>{s}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button>
            <Plus className="w-4 h-4" />
            Add Lead
          </Button>
        </div>

        {/* Two-column layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          {/* Leads Table */}
          <Card className="lg:col-span-2">
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-[#1e2d40]">
                      {["Lead", "Company", "Source", "Owner", "Status", "Score", "Created", "Actions"].map((h) => (
                        <th key={h} className="px-4 py-3 text-left text-xs font-medium text-gray-500 whitespace-nowrap">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {isLoading
                      ? Array(8).fill(0).map((_, i) => (
                        <tr key={i} className="border-b border-[#1e2d40]">
                          {Array(8).fill(0).map((_, j) => (
                            <td key={j} className="px-4 py-3"><Skeleton className="h-4 w-20" /></td>
                          ))}
                        </tr>
                      ))
                      : (leads.length > 0 ? leads : defaultLeads).map((lead: any) => (
                        <tr key={lead._id || lead.id} className="border-b border-[#1e2d40] hover:bg-[#0d1a2d] transition-colors">
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-2">
                              <Avatar className="w-7 h-7 flex-shrink-0">
                                <AvatarFallback className="text-[10px]">
                                  {getInitials(lead.name || lead.contactName)}
                                </AvatarFallback>
                              </Avatar>
                              <div>
                                <p className="text-xs font-medium text-gray-200 whitespace-nowrap">{lead.name || lead.contactName}</p>
                                <p className="text-[10px] text-gray-500">{lead.email}</p>
                              </div>
                            </div>
                          </td>
                          <td className="px-4 py-3 text-xs text-gray-400">{lead.company}</td>
                          <td className="px-4 py-3">
                            <span className="text-xs px-2 py-0.5 rounded-full bg-[#1e2d40] text-gray-300">{lead.source}</span>
                          </td>
                          <td className="px-4 py-3">
                            <Avatar className="w-6 h-6">
                              <AvatarFallback className="text-[9px]">{getInitials(lead.owner || "MR")}</AvatarFallback>
                            </Avatar>
                          </td>
                          <td className="px-4 py-3">
                            <Badge variant={statusColors[lead.status] as any || "default"}>
                              {lead.status}
                            </Badge>
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-1">
                              <span className="text-xs text-gray-300">{lead.score || 48}</span>
                              <Star className="w-3 h-3 text-amber-400 fill-amber-400" />
                            </div>
                          </td>
                          <td className="px-4 py-3 text-xs text-gray-500 whitespace-nowrap">
                            {formatDate(lead.createdAt || new Date())}
                          </td>
                          <td className="px-4 py-3">
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon" className="h-7 w-7">
                                  <MoreHorizontal className="w-4 h-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem>View</DropdownMenuItem>
                                <DropdownMenuItem>Edit</DropdownMenuItem>
                                <DropdownMenuItem onClick={() => statusMutation.mutate({ id: lead._id, status: "contacted" })}>
                                  Mark Contacted
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  className="text-red-400"
                                  onClick={() => deleteMutation.mutate(lead._id)}
                                >
                                  Delete
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </td>
                        </tr>
                      ))
                    }
                  </tbody>
                </table>
              </div>
              {/* Pagination */}
              <div className="flex items-center justify-between px-4 py-3 border-t border-[#1e2d40]">
                <p className="text-xs text-gray-500">
                  {(page - 1) * limit + 1}–{Math.min(page * limit, meta.total || 1245)} of {meta.total || 1245} leads
                </p>
                <div className="flex items-center gap-1">
                  <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}>
                    <ChevronLeft className="w-4 h-4" />
                  </Button>
                  {[1, 2, 3].map((p) => (
                    <button key={p} onClick={() => setPage(p)}
                      className={`w-7 h-7 rounded text-xs ${page === p ? "bg-blue-600 text-white" : "text-gray-400 hover:text-gray-200"}`}>
                      {p}
                    </button>
                  ))}
                  <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setPage(p => Math.min(totalPages || 3, p + 1))}>
                    <ChevronRight className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Right Panel */}
          <div className="space-y-4">
            {/* Lead Overview Donut */}
            <Card>
              <CardHeader><CardTitle className="text-sm">Lead Overview</CardTitle></CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {[
                    { label: "New", value: 270, total: 1245, color: "bg-blue-500" },
                    { label: "Contacted", value: 432, total: 1245, color: "bg-purple-500" },
                    { label: "Qualified", value: 286, total: 1245, color: "bg-emerald-500" },
                    { label: "Proposal", value: 148, total: 1245, color: "bg-amber-500" },
                    { label: "Won", value: 90, total: 1245, color: "bg-cyan-500" },
                    { label: "Lost", value: 20, total: 1245, color: "bg-red-500" },
                  ].map((item) => (
                    <div key={item.label} className="flex items-center gap-2">
                      <div className={`w-2 h-2 rounded-full ${item.color} flex-shrink-0`} />
                      <span className="text-xs text-gray-400 flex-1">{item.label}</span>
                      <span className="text-xs text-gray-300">{item.value}</span>
                      <span className="text-xs text-gray-500">{((item.value / item.total) * 100).toFixed(1)}%</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Lead Sources */}
            <Card>
              <CardHeader><CardTitle className="text-sm">Lead Sources</CardTitle></CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {[
                    { source: "Website", pct: 38, color: "bg-blue-500" },
                    { source: "Referral", pct: 25, color: "bg-emerald-500" },
                    { source: "Ad Campaign", pct: 20, color: "bg-purple-500" },
                    { source: "Partner", pct: 11, color: "bg-amber-500" },
                    { source: "Other", pct: 6, color: "bg-gray-500" },
                  ].map((s) => (
                    <div key={s.source} className="space-y-1">
                      <div className="flex justify-between text-xs">
                        <span className="text-gray-400">{s.source}</span>
                        <span className="text-gray-300">{s.pct}%</span>
                      </div>
                      <div className="h-1.5 bg-[#1e2d40] rounded-full">
                        <div className={`h-full ${s.color} rounded-full`} style={{ width: `${s.pct}%` }} />
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Top Owners */}
            <Card>
              <CardHeader>
                <div className="flex justify-between">
                  <CardTitle className="text-sm">Top Owners</CardTitle>
                  <button className="text-xs text-blue-400">View all</button>
                </div>
              </CardHeader>
              <CardContent>
                {["Max Mustermann", "Anna Schneider", "Thomas Weber", "Laura Hoffmann", "Felix Bauer"].map((n, i) => (
                  <div key={n} className="flex items-center gap-2 py-1.5">
                    <span className="text-xs text-gray-500 w-3">{i + 1}</span>
                    <Avatar className="w-6 h-6"><AvatarFallback className="text-[9px]">{getInitials(n)}</AvatarFallback></Avatar>
                    <span className="text-xs text-gray-300 flex-1">{n}</span>
                    <span className="text-xs text-gray-400">{[345, 198, 178, 120, 98][i]}</span>
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

const defaultLeads = [
  { id: "1", name: "Emily Thompson", email: "emily@gmail.com", company: "Fruits Studio", source: "Website", status: "new", owner: "MR", score: 48, createdAt: new Date() },
  { id: "2", name: "James Wilson", email: "james@gmail.com", company: "IronZone Gym", source: "Referral", status: "contacted", owner: "AS", score: 72, createdAt: new Date() },
  { id: "3", name: "Laura Schmidt", email: "laura@gmail.com", company: "PowerMax", source: "Ad Campaign", status: "qualified", owner: "TW", score: 85, createdAt: new Date() },
  { id: "4", name: "Michael Ross", email: "michael@gmail.com", company: "BodyLab Fitness", source: "Website", status: "proposal", owner: "LH", score: 31, createdAt: new Date() },
  { id: "5", name: "Sophia Adams", email: "sophia@gmail.com", company: "ProFlex", source: "Referral", status: "qualified", owner: "FB", score: 65, createdAt: new Date() },
];
