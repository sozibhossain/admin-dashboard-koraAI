"use client";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { territoriesApi } from "@/lib/api";
import { Header } from "@/components/layout/header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { getInitials, formatCurrency } from "@/lib/utils";
import { toast } from "sonner";
import { Plus, Search, MapPin, Users, Target, DollarSign, ChevronLeft, ChevronRight, MoreHorizontal } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";

const mockTerritories = [
  { _id: "1", name: "Hamburg Center", partner: "James Anderson", region: "Hamburg, Germany", leads: 845, customers: 156, revenue: 78490, status: "active", area: "128.4km²", color: "#3b82f6" },
  { _id: "2", name: "West District", partner: "Michael Brown", region: "Flensburg, Germany", leads: 410, customers: 112, revenue: 54280, status: "active", area: "94.2km²", color: "#22c55e" },
  { _id: "3", name: "East District", partner: "Sarah Mitchell", region: "Nuremberg, Germany", leads: 378, customers: 80, revenue: 45480, status: "active", area: "87.6km²", color: "#a855f7" },
  { _id: "4", name: "North Zone", partner: "David Clark", region: "Neubrandenburg, Germany", leads: 625, customers: 56, revenue: 38100, status: "active", area: "156.3km²", color: "#f59e0b" },
  { _id: "5", name: "South West", partner: "Lisa Martinez", region: "Konstanz, Germany", leads: 348, customers: 44, revenue: 28970, status: "active", area: "72.1km²", color: "#14b8a6" },
  { _id: "6", name: "South East", partner: "Robert Taylor", region: "Konstanz, Germany", leads: 340, customers: 44, revenue: 28580, status: "active", area: "68.9km²", color: "#ef4444" },
];

export default function TerritoriesPage() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<any>(mockTerritories[0]);

  const { data, isLoading } = useQuery({
    queryKey: ["territories", page, search],
    queryFn: () => territoriesApi.getAll({ page, limit: 10, search: search || undefined }).then(r => r.data),
  });

  const territories = data?.data?.length ? data.data : mockTerritories;

  return (
    <div>
      <Header title="Territories" subtitle="Create, manage and assign territories to your partners." />
      <div className="p-6 space-y-5">
        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: "Total Territories", value: "14", change: "+15% vs last month", icon: MapPin, color: "bg-blue-600" },
            { label: "Assigned Territories", value: "12", change: "86% of total territories", icon: Users, color: "bg-emerald-600" },
            { label: "Total Leads", value: "3,248", change: "+18% vs last month", icon: Target, color: "bg-purple-600" },
            { label: "Total Revenue", value: "€286,450", change: "+23% vs last month", icon: DollarSign, color: "bg-amber-600" },
          ].map((s) => (
            <Card key={s.label}>
              <CardContent className="pt-4">
                <div className="flex items-center gap-3">
                  <div className={`w-9 h-9 rounded-lg ${s.color} flex items-center justify-center flex-shrink-0`}>
                    <s.icon className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <p className="text-base font-bold text-white">{s.value}</p>
                    <p className="text-[10px] text-gray-400">{s.label}</p>
                    <p className="text-[10px] text-emerald-400">{s.change}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          {/* Map + Table */}
          <div className="lg:col-span-2 space-y-4">
            {/* Map Placeholder */}
            <Card>
              <CardHeader>
                <div className="flex flex-wrap gap-2 items-center justify-between">
                  <div className="flex gap-1 flex-wrap">
                    {["Select", "Draw Polygon", "Draw Radius", "Edit", "Delete", "Assign Partner", "Filters"].map((t) => (
                      <button key={t} className="text-xs px-2.5 py-1 bg-[#1e2d40] text-gray-300 rounded-lg hover:bg-[#2a3547] transition-colors">{t}</button>
                    ))}
                  </div>
                  <div className="flex gap-2">
                    <Select><SelectTrigger className="w-24 h-7 text-xs"><SelectValue placeholder="Map Style" /></SelectTrigger>
                      <SelectContent><SelectItem value="dark">Dark</SelectItem></SelectContent>
                    </Select>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {/* Map Visual Representation */}
                <div className="relative h-64 bg-[#0d1a2d] rounded-xl overflow-hidden border border-[#1e2d40]">
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="relative w-full h-full">
                      {/* Grid lines */}
                      {[...Array(8)].map((_, i) => (
                        <div key={i} className="absolute w-full h-px bg-[#1e2d40] opacity-40" style={{ top: `${(i+1) * 12}%` }} />
                      ))}
                      {[...Array(8)].map((_, i) => (
                        <div key={i} className="absolute h-full w-px bg-[#1e2d40] opacity-40" style={{ left: `${(i+1) * 12}%` }} />
                      ))}
                      {/* Territory regions */}
                      {mockTerritories.map((t, i) => (
                        <div key={t._id}
                          onClick={() => setSelected(t)}
                          className="absolute cursor-pointer flex items-center justify-center rounded-full text-[10px] font-medium text-white transition-transform hover:scale-105"
                          style={{
                            width: "80px", height: "50px",
                            background: t.color + "40",
                            border: `1.5px solid ${t.color}`,
                            left: `${[15, 10, 55, 40, 20, 65][i]}%`,
                            top: `${[10, 45, 35, 65, 72, 65][i]}%`,
                          }}>
                          {t.name.split(" ").slice(-1)[0]}
                        </div>
                      ))}
                      {/* Hamburg label */}
                      <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-xs text-gray-400 font-medium pointer-events-none">Hamburg</div>
                    </div>
                  </div>
                  {/* Controls */}
                  <div className="absolute left-3 bottom-3 flex flex-col gap-1">
                    {["+", "−", "⊞"].map((b) => (
                      <button key={b} className="w-7 h-7 bg-[#1e2d40] border border-[#2a3547] rounded text-gray-300 text-sm hover:bg-[#2a3547]">{b}</button>
                    ))}
                  </div>
                  <div className="absolute right-3 bottom-3">
                    <select className="text-[10px] bg-[#1e2d40] border border-[#2a3547] text-gray-300 rounded px-1.5 py-0.5">
                      <option>Map Style ▾</option>
                    </select>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Table */}
            <Card>
              <CardHeader>
                <div className="flex gap-3">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-500" />
                    <Input placeholder="Search territories..." value={search} onChange={e => setSearch(e.target.value)} className="pl-8 h-8 text-xs" />
                  </div>
                  <Select><SelectTrigger className="w-28 h-8 text-xs"><SelectValue placeholder="Status All" /></SelectTrigger>
                    <SelectContent><SelectItem value="all">All</SelectItem></SelectContent>
                  </Select>
                  <Button size="sm" className="h-8 text-xs"><Plus className="w-3 h-3" />Create Territory</Button>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-[#1e2d40]">
                      {["Territory Name", "Partner", "Region", "Leads", "Customers", "Revenue", "Status", ""].map(h => (
                        <th key={h} className="px-4 py-3 text-left text-xs font-medium text-gray-500 whitespace-nowrap">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {territories.map((t: any) => (
                      <tr key={t._id} onClick={() => setSelected(t)}
                        className={`border-b border-[#1e2d40] cursor-pointer transition-colors ${selected?._id === t._id ? "bg-blue-600/10" : "hover:bg-[#0d1a2d]"}`}>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ background: t.color }} />
                            <span className="text-xs font-medium text-gray-200">{t.name}</span>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-1.5">
                            <Avatar className="w-5 h-5"><AvatarFallback className="text-[8px]">{getInitials(t.partner)}</AvatarFallback></Avatar>
                            <span className="text-xs text-gray-400">{t.partner}</span>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-xs text-gray-400">{t.region}</td>
                        <td className="px-4 py-3 text-xs text-gray-300">{t.leads}</td>
                        <td className="px-4 py-3 text-xs text-gray-300">{t.customers}</td>
                        <td className="px-4 py-3 text-xs text-gray-200 font-medium">{formatCurrency(t.revenue)}</td>
                        <td className="px-4 py-3"><Badge variant="success" className="text-[10px]">Active</Badge></td>
                        <td className="px-4 py-3">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon" className="h-7 w-7" onClick={e => e.stopPropagation()}>
                                <MoreHorizontal className="w-4 h-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem>Edit Boundary</DropdownMenuItem>
                              <DropdownMenuItem>Reassign Partner</DropdownMenuItem>
                              <DropdownMenuItem className="text-red-400">Delete Territory</DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                <div className="flex items-center justify-between px-4 py-3 border-t border-[#1e2d40]">
                  <p className="text-xs text-gray-500">Showing 1 to 6 of 14 territories</p>
                  <div className="flex items-center gap-1">
                    <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setPage(p => Math.max(1, p-1))} disabled={page === 1}><ChevronLeft className="w-4 h-4" /></Button>
                    {[1,2,3].map(p => <button key={p} onClick={() => setPage(p)} className={`w-7 h-7 rounded text-xs ${page === p ? "bg-blue-600 text-white" : "text-gray-400"}`}>{p}</button>)}
                    <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setPage(p => p+1)}><ChevronRight className="w-4 h-4" /></Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Detail Panel */}
          {selected && (
            <div className="space-y-4">
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full" style={{ background: selected.color }} />
                      <CardTitle className="text-sm">{selected.name}</CardTitle>
                    </div>
                    <Badge variant="success" className="text-[10px]">Active</Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-1.5 text-xs mb-4">
                    <div className="flex items-center gap-2">
                      <Avatar className="w-6 h-6"><AvatarFallback className="text-[9px]">{getInitials(selected.partner)}</AvatarFallback></Avatar>
                      <span className="text-gray-300">{selected.partner}</span>
                      <span className="text-[10px] text-blue-400">✎</span>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3 mb-4">
                    {[
                      { label: "Leads", value: selected.leads },
                      { label: "Customers", value: selected.customers },
                      { label: "Revenue", value: formatCurrency(selected.revenue) },
                      { label: "Conv. Rate", value: "18.5%" },
                    ].map((s) => (
                      <div key={s.label} className="bg-[#1e2d40] rounded-lg p-2.5 text-center">
                        <p className="text-sm font-bold text-white">{s.value}</p>
                        <p className="text-[10px] text-gray-400">{s.label}</p>
                      </div>
                    ))}
                  </div>
                  <div className="space-y-1.5 text-xs">
                    {[
                      { label: "Region", value: selected.region },
                      { label: "Created", value: "May 18, 2025" },
                      { label: "Last Updated", value: "May 23, 2025" },
                      { label: "Area", value: selected.area },
                    ].map((d) => (
                      <div key={d.label} className="flex justify-between py-1 border-b border-[#1e2d40] last:border-0">
                        <span className="text-gray-500">{d.label}</span>
                        <span className="text-gray-200">{d.value}</span>
                      </div>
                    ))}
                  </div>
                  <div className="flex gap-2 mt-4">
                    <Button variant="outline" size="sm" className="flex-1 text-xs" onClick={() => toast.info("Edit boundary")}>✎ Edit boundary</Button>
                    <Button variant="outline" size="sm" className="flex-1 text-xs" onClick={() => toast.info("Reassign")}>↻ Reassign</Button>
                  </div>
                  <Button variant="destructive" size="sm" className="w-full mt-2 text-xs" onClick={() => toast.error("Delete territory requires confirmation")}>🗑 Delete Territory</Button>
                </CardContent>
              </Card>

              {/* Territory Insights */}
              <Card>
                <CardHeader><CardTitle className="text-sm">Territory Insights</CardTitle></CardHeader>
                <CardContent>
                  <div className="flex items-center justify-center mb-3">
                    <div className="relative w-20 h-20">
                      <svg viewBox="0 0 36 36" className="w-full h-full -rotate-90">
                        <circle cx="18" cy="18" r="15.9" fill="none" stroke="#1e2d40" strokeWidth="3" />
                        <circle cx="18" cy="18" r="15.9" fill="none" stroke="#3b82f6" strokeWidth="3" strokeDasharray="78 22" />
                      </svg>
                      <div className="absolute inset-0 flex flex-col items-center justify-center">
                        <span className="text-sm font-bold text-white">14</span>
                        <span className="text-[9px] text-gray-500">Total</span>
                      </div>
                    </div>
                  </div>
                  {[{ label: "Active", value: 12, pct: "85.7%", color: "bg-blue-500" },
                    { label: "Inactive", value: 2, pct: "14.3%", color: "bg-gray-500" },
                    { label: "Unassigned", value: 2, pct: "14.3%", color: "bg-amber-500" }
                  ].map(i => (
                    <div key={i.label} className="flex items-center gap-2 py-1">
                      <div className={`w-2 h-2 rounded-full ${i.color}`} />
                      <span className="text-xs text-gray-400 flex-1">{i.label}</span>
                      <span className="text-xs text-gray-300">{i.value}</span>
                      <span className="text-xs text-gray-500">{i.pct}</span>
                    </div>
                  ))}
                </CardContent>
              </Card>

              <div className="flex gap-2">
                <Button variant="secondary" size="sm" className="flex-1 text-xs" onClick={() => toast.info("Auto-suggest territories")}>Auto-Suggest Territories</Button>
                <Button size="sm" className="flex-1 text-xs" onClick={() => toast.info("Create new territory")}><Plus className="w-3 h-3" />Create Territory</Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
