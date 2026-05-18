"use client";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { activityApi } from "@/lib/api";
import { Header } from "@/components/layout/header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { getInitials, timeAgo } from "@/lib/utils";
import {
  Activity, Users, Settings, Zap, Shield,
  ChevronLeft, ChevronRight, Filter
} from "lucide-react";

const mockActivities = [
  { _id: "1", description: "New partner registered", detail: "A new partner 'Sharp Styles' has been registered", user_id: { name: "Mike Thompson", role: "admin" }, entity: "Sharp Styles", entityType: "Partner", type: "User Action", createdAt: new Date(Date.now() - 120000) },
  { _id: "2", description: "Lead assigned", detail: "Lead 'Elite Barbershop' has been assigned to Partner One.", user_id: { name: "Sarah Johnson", role: "admin" }, entity: "Elite Barbershop", entityType: "Lead", type: "User Action", createdAt: new Date(Date.now() - 480000) },
  { _id: "3", description: "Workflow executed", detail: "Workflow 'New Customer Onboarding' executed successfully.", user_id: { name: "System", role: "system" }, entity: "New Customer Onboarding", entityType: "Workflow", type: "Automation", createdAt: new Date(Date.now() - 900000) },
  { _id: "4", description: "Plan upgraded", detail: "Urban Cuts upgraded from Pro Plan to Enterprise Plan.", user_id: { name: "Alex Barber", role: "admin" }, entity: "Urban Cuts", entityType: "Customer", type: "User Action", createdAt: new Date(Date.now() - 1320000) },
  { _id: "5", description: "Login failed", detail: "Failed login attempt detected for user james@sharpstyles.com", user_id: { name: "System", role: "system" }, entity: "Sharp Styles", entityType: "Partner", type: "Security Event", createdAt: new Date(Date.now() - 1620000) },
  { _id: "6", description: "New message received", detail: "New message from 'Elite Barbershop' via WhatsApp.", user_id: { name: "Lisa Brown", role: "admin" }, entity: "Elite Barbershop", entityType: "Customer", type: "User Action", createdAt: new Date(Date.now() - 2100000) },
  { _id: "7", description: "Payout processed", detail: "Payout of €2,450 has been processed to Partner Two.", user_id: { name: "David Clark", role: "admin" }, entity: "Partner Two", entityType: "Partner", type: "System Event", createdAt: new Date(Date.now() - 2520000) },
  { _id: "8", description: "Appointment booked", detail: "New appointment booked with 'Fresh Fades'", user_id: { name: "Emma Wilson", role: "admin" }, entity: "Fresh Fades", entityType: "Customer", type: "User Action", createdAt: new Date(Date.now() - 3000000) },
];

const typeColors: Record<string, string> = {
  "User Action": "default",
  "System Event": "warning",
  "Automation": "purple",
  "Security Event": "destructive",
};

const typeIcons: Record<string, any> = {
  "User Action": Users,
  "System Event": Settings,
  "Automation": Zap,
  "Security Event": Shield,
};

export default function ActivityPage() {
  const [page, setPage] = useState(1);
  const [activeTab, setActiveTab] = useState("Today");
  const [typeFilter, setTypeFilter] = useState("all");
  const limit = 10;

  const { data, isLoading } = useQuery({
    queryKey: ["activity", page, typeFilter],
    queryFn: () => activityApi.getAll({ page, limit, type: typeFilter !== "all" ? typeFilter : undefined }).then((r) => r.data),
  });

  const activities = data?.data?.length ? data.data : mockActivities;
  const meta = data?.meta || { total: 248, page: 1, limit };

  const tabs = ["Today", "Yesterday", "This Week", "This Month", "Custom"];
  const stats = [
    { label: "Total Activities", value: "248", change: "+18.5%", icon: Activity, color: "bg-blue-600" },
    { label: "User Actions", value: "142", change: "+22.1%", icon: Users, color: "bg-emerald-600" },
    { label: "System Events", value: "68", change: "+12.7%", icon: Settings, color: "bg-purple-600" },
    { label: "Automations", value: "38", change: "+8.9%", icon: Zap, color: "bg-amber-600" },
  ];

  return (
    <div>
      <Header title="Activity" subtitle="Monitor all platform activity and stay updated in real-time." />
      <div className="p-6 space-y-5">
        {/* Tabs */}
        <div className="flex gap-1 bg-[#0d1a2d] p-1 rounded-lg w-fit">
          {tabs.map((t) => (
            <button key={t} onClick={() => setActiveTab(t)}
              className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${activeTab === t ? "bg-blue-600 text-white" : "text-gray-400 hover:text-gray-200"}`}>
              {t}
            </button>
          ))}
          <Button variant="ghost" size="sm" className="h-7 text-xs"><Filter className="w-3 h-3" />Filters</Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {stats.map((s) => (
            <Card key={s.label}>
              <CardContent className="pt-4">
                <div className="flex items-center gap-3">
                  <div className={`w-9 h-9 rounded-lg ${s.color} flex items-center justify-center flex-shrink-0`}>
                    <s.icon className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <p className="text-lg font-bold text-white">{s.value}</p>
                    <p className="text-[10px] text-gray-400">{s.label}</p>
                    <p className="text-[10px] text-emerald-400">{s.change} vs yesterday</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          {/* Activity Table */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
                <CardTitle className="text-sm">All Activities</CardTitle>
                <div className="flex gap-2">
                  <Select value={typeFilter} onValueChange={setTypeFilter}>
                    <SelectTrigger className="w-36 h-8 text-xs"><SelectValue placeholder="All Types" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Types</SelectItem>
                      <SelectItem value="User Action">User Actions</SelectItem>
                      <SelectItem value="System Event">System Events</SelectItem>
                      <SelectItem value="Automation">Automations</SelectItem>
                      <SelectItem value="Security Event">Security Events</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-[#1e2d40]">
                    {["Activity", "User", "Entity", "Type", "Time", ""].map((h) => (
                      <th key={h} className="px-4 py-3 text-left text-xs font-medium text-gray-500 whitespace-nowrap">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {isLoading ? Array(8).fill(0).map((_, i) => (
                    <tr key={i} className="border-b border-[#1e2d40]">
                      {Array(6).fill(0).map((_, j) => <td key={j} className="px-4 py-3"><Skeleton className="h-4 w-20" /></td>)}
                    </tr>
                  )) : activities.map((a: any) => {
                    const TypeIcon = typeIcons[a.type] || Activity;
                    return (
                      <tr key={a._id} className="border-b border-[#1e2d40] hover:bg-[#0d1a2d] transition-colors">
                        <td className="px-4 py-3">
                          <div className="flex items-start gap-2">
                            <div className="w-7 h-7 rounded-lg bg-[#1e2d40] flex items-center justify-center flex-shrink-0 mt-0.5">
                              <TypeIcon className="w-3.5 h-3.5 text-blue-400" />
                            </div>
                            <div>
                              <p className="text-xs font-medium text-gray-200">{a.description}</p>
                              <p className="text-[10px] text-gray-500 truncate max-w-[200px]">{a.detail}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-1.5">
                            <Avatar className="w-6 h-6"><AvatarFallback className="text-[9px]">{getInitials(a.user_id?.name || "SY")}</AvatarFallback></Avatar>
                            <span className="text-xs text-gray-400">{a.user_id?.name}</span>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <div>
                            <p className="text-xs text-gray-300">{a.entity}</p>
                            <span className="text-[10px] px-1.5 py-0.5 rounded bg-[#1e2d40] text-gray-400">{a.entityType}</span>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <Badge variant={typeColors[a.type] as any || "default"} className="text-[10px]">{a.type}</Badge>
                        </td>
                        <td className="px-4 py-3 text-xs text-gray-500 whitespace-nowrap">{timeAgo(a.createdAt)}</td>
                        <td className="px-4 py-3">
                          <Button variant="ghost" size="icon" className="h-7 w-7"><span className="text-gray-400">···</span></Button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
              <div className="flex items-center justify-between px-4 py-3 border-t border-[#1e2d40]">
                <p className="text-xs text-gray-500">1–{Math.min(limit, activities.length)} of {meta.total || 248} activities</p>
                <div className="flex items-center gap-1">
                  <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}>
                    <ChevronLeft className="w-4 h-4" />
                  </Button>
                  {[1, 2, 3, 4, 5].map((p) => (
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
            {/* Activity Overview */}
            <Card>
              <CardHeader><CardTitle className="text-sm">Activity Overview</CardTitle></CardHeader>
              <CardContent>
                {[
                  { label: "User Actions", value: 142, pct: 57, color: "bg-blue-500" },
                  { label: "System Events", value: 68, pct: 27, color: "bg-emerald-500" },
                  { label: "Automations", value: 38, pct: 15, color: "bg-purple-500" },
                  { label: "Security Events", value: 18, pct: 7, color: "bg-red-500" },
                ].map((item) => (
                  <div key={item.label} className="flex items-center gap-2 py-1.5">
                    <div className={`w-2 h-2 rounded-full ${item.color} flex-shrink-0`} />
                    <span className="text-xs text-gray-400 flex-1">{item.label}</span>
                    <span className="text-xs text-gray-300">{item.value}</span>
                    <span className="text-xs text-gray-500">{item.pct}%</span>
                  </div>
                ))}
                <div className="mt-3 pt-3 border-t border-[#1e2d40] space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="text-gray-400">Most Active Time</span>
                    <span className="text-gray-200">10 AM–12 PM</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-gray-400">Active Users</span>
                    <span className="text-gray-200">24</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Live Activity Feed */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm">Live Activity Feed</CardTitle>
                  <button className="text-xs text-blue-400">View all</button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {[
                    { text: "New lead 'Top Grooms' created", color: "bg-blue-500", time: "10:24 AM" },
                    { text: "Partner One updated company details", color: "bg-emerald-500", time: "10:22 AM" },
                    { text: "Workflow 'Lead Follow-up' executed", color: "bg-purple-500", time: "10:21 AM" },
                    { text: "Customer 'Elite Barbershop' logged in", color: "bg-amber-500", time: "10:19 AM" },
                    { text: "New message from 'Urban Cuts'", color: "bg-cyan-500", time: "10:18 AM" },
                  ].map((item, i) => (
                    <div key={i} className="flex items-start gap-2">
                      <div className={`w-1.5 h-1.5 rounded-full ${item.color} mt-1.5 flex-shrink-0`} />
                      <div className="flex-1">
                        <p className="text-xs text-gray-300">{item.text}</p>
                        <p className="text-[10px] text-gray-500">{item.time}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Top Actions */}
            <Card>
              <CardHeader>
                <div className="flex justify-between">
                  <CardTitle className="text-sm">Top Actions</CardTitle>
                  <button className="text-xs text-blue-400">View all</button>
                </div>
              </CardHeader>
              <CardContent>
                {[
                  { action: "Leads Created", count: 45 },
                  { action: "Messages Received", count: 38 },
                  { action: "Appointments Booked", count: 32 },
                  { action: "Logins", count: 27 },
                  { action: "Plan Upgrades", count: 18 },
                ].map((a) => (
                  <div key={a.action} className="flex justify-between py-1.5 text-xs border-b border-[#1e2d40] last:border-0">
                    <span className="text-gray-400">{a.action}</span>
                    <span className="text-gray-200 font-medium">{a.count}</span>
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
