"use client";
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supportApi } from "@/lib/api";
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
  Search, Plus, Send, ChevronLeft, ChevronRight,
  HeadphonesIcon, CheckCircle, Clock, XCircle, AlertCircle, Download
} from "lucide-react";

const mockTickets = [
  { _id: "1", subject: "Michael Brown", category: "Account", priority: "High", status: "open", entity: "Alma Cuts", requestedBy: { name: "Michael Brown", role: "Customer - Alma Cuts" }, createdAt: new Date(Date.now() - 180000), lastMessage: "Unable to access my account. Although my credentials..." },
  { _id: "2", subject: "Sarah Mitchell", category: "Billing", priority: "Medium", status: "in_progress", entity: "Sarah Mitchell", requestedBy: { name: "Sarah Mitchell", role: "Partner" }, createdAt: new Date(Date.now() - 7200000), lastMessage: "Professional appearance issue" },
  { _id: "3", subject: "Urban Cuts", category: "Technical", priority: "High", status: "open", entity: "Urban Cuts", requestedBy: { name: "Urban Cuts", role: "Partner" }, createdAt: new Date(Date.now() - 10800000), lastMessage: "Unable to add new team member" },
  { _id: "4", subject: "David Wilson", category: "Billing", priority: "Low", status: "pending_approval", entity: "David Wilson", requestedBy: { name: "David Wilson", role: "Customer" }, createdAt: new Date(Date.now() - 86400000), lastMessage: "Refund/revert payment request" },
  { _id: "5", subject: "Ellis Barbers", category: "Technical", priority: "High", status: "in_progress", entity: "Ellis Barbers", requestedBy: { name: "Ellis Barbers", role: "Partner" }, createdAt: new Date(Date.now() - 172800000), lastMessage: "Issue not showing in dashboard" },
];

const mockMessages = [
  { id: "1", sender: "customer", name: "Michael Brown", content: "Unable to access my account. Although trying multiple times with the correct credentials and password, I run into the same issue.", time: "10:15 AM" },
  { id: "2", sender: "kora", name: "Kora AI Assistant", content: "I can help you with that. Let me check your account status.", time: "10:15 AM" },
  { id: "3", sender: "admin", name: "Admin User", content: "I've checked your account and blocked it due to suspicious login attempts. I can unblock it for you.", time: "10:17 AM" },
  { id: "4", sender: "customer", name: "Michael Brown", content: "Thank you! That would be great!", time: "10:18 AM" },
];

const priorityColors: Record<string, string> = { High: "destructive", Medium: "warning", Low: "secondary", Critical: "destructive" };
const statusColors: Record<string, string> = { open: "default", in_progress: "warning", pending_approval: "purple", resolved: "success", closed: "secondary" };
const statusLabels: Record<string, string> = { open: "Open", in_progress: "In Progress", pending_approval: "Pending Approval", resolved: "Resolved", closed: "Closed" };

export default function SupportPage() {
  const queryClient = useQueryClient();
  const [selected, setSelected] = useState<any>(mockTickets[0]);
  const [search, setSearch] = useState("");
  const [activeTab, setActiveTab] = useState("All Requests");
  const [replyText, setReplyText] = useState("");
  const [page, setPage] = useState(1);

  const { data, isLoading } = useQuery({
    queryKey: ["support", page, activeTab],
    queryFn: () => supportApi.getAll({ page, limit: 10, status: activeTab !== "All Requests" ? activeTab.toLowerCase().replace(" ", "_") : undefined }).then(r => r.data),
  });

  const tickets = data?.data?.length ? data.data : mockTickets;
  const tabs = [
    { label: "All Requests", count: 91 },
    { label: "Open", count: 18, color: "text-blue-400" },
    { label: "In Progress", count: 7, color: "text-amber-400" },
    { label: "Pending Approval", count: 36, color: "text-purple-400" },
    { label: "Resolved", count: 104, color: "text-emerald-400" },
  ];

  function handleReply() {
    if (!replyText.trim()) return;
    toast.success("Reply sent");
    setReplyText("");
  }

  return (
    <div>
      <Header title="Support" subtitle="Manage and resolve support requests from partners and customers." />
      <div className="p-6">
        {/* Tabs */}
        <div className="flex flex-wrap gap-1 bg-[#0d1a2d] p-1 rounded-lg w-fit mb-5">
          {tabs.map((t) => (
            <button key={t.label} onClick={() => setActiveTab(t.label)}
              className={`px-3 py-1.5 rounded-md text-xs font-medium flex items-center gap-1 transition-colors ${activeTab === t.label ? "bg-blue-600 text-white" : "text-gray-400 hover:text-gray-200"}`}>
              {t.label}
              <span className={`text-[10px] ${activeTab === t.label ? "text-white/70" : (t.color || "text-gray-500")}`}>{t.count}</span>
            </button>
          ))}
          <div className="flex gap-2 ml-2">
            <Button variant="outline" size="sm" className="h-7 text-xs"><Plus className="w-3 h-3" />Create Ticket</Button>
            <Button variant="outline" size="sm" className="h-7 text-xs"><Download className="w-3 h-3" />Export</Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
          {/* Ticket List */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-500" />
                  <Input placeholder="Search requests..." value={search} onChange={e => setSearch(e.target.value)} className="pl-8 h-8 text-xs" />
                </div>
                <Select><SelectTrigger className="w-28 h-8 text-xs"><SelectValue placeholder="All Partners" /></SelectTrigger>
                  <SelectContent><SelectItem value="all">All Partners</SelectItem></SelectContent>
                </Select>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <div className="text-xs text-gray-500 px-4 py-1 border-b border-[#1e2d40]">
                Showing {tickets.length} of 91 requests
              </div>
              {tickets.filter((t: any) => !search || t.subject?.toLowerCase().includes(search.toLowerCase())).map((ticket: any) => (
                <div key={ticket._id} onClick={() => setSelected(ticket)}
                  className={`flex items-start gap-3 p-4 border-b border-[#1e2d40] cursor-pointer transition-colors ${selected?._id === ticket._id ? "bg-blue-600/10 border-l-2 border-l-blue-500" : "hover:bg-[#0d1a2d]"}`}>
                  <Avatar className="w-8 h-8 flex-shrink-0">
                    <AvatarFallback className="text-xs">{getInitials(ticket.requestedBy?.name || ticket.subject)}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-start">
                      <p className="text-xs font-medium text-gray-200 truncate">{ticket.requestedBy?.name || ticket.subject}</p>
                      <Badge variant={priorityColors[ticket.priority] as any} className="text-[9px] ml-1 flex-shrink-0">↑ {ticket.priority}</Badge>
                    </div>
                    <p className="text-[10px] text-gray-500">{ticket.requestedBy?.role}</p>
                    <p className="text-xs text-gray-400 truncate mt-1">{ticket.lastMessage}</p>
                    <div className="flex items-center justify-between mt-1">
                      <Badge variant={statusColors[ticket.status] as any} className="text-[9px]">{statusLabels[ticket.status]}</Badge>
                      <span className="text-[10px] text-gray-500">{timeAgo(ticket.createdAt)}</span>
                    </div>
                  </div>
                </div>
              ))}
              <div className="flex items-center justify-between px-4 py-2 border-t border-[#1e2d40]">
                <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setPage(p => Math.max(1, p-1))} disabled={page === 1}><ChevronLeft className="w-4 h-4" /></Button>
                {[1,2,3].map(p => <button key={p} onClick={() => setPage(p)} className={`w-6 h-6 rounded text-xs ${page === p ? "bg-blue-600 text-white" : "text-gray-400"}`}>{p}</button>)}
                <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setPage(p => p+1)}><ChevronRight className="w-4 h-4" /></Button>
              </div>
            </CardContent>
          </Card>

          {/* Chat Panel */}
          <Card className="lg:col-span-2">
            {selected ? (
              <CardContent className="p-0 flex flex-col h-[calc(100vh-260px)]">
                {/* Header */}
                <div className="flex items-center justify-between px-4 py-3 border-b border-[#1e2d40]">
                  <div className="flex items-center gap-2">
                    <Avatar className="w-8 h-8"><AvatarFallback className="text-xs">{getInitials(selected.requestedBy?.name || selected.subject)}</AvatarFallback></Avatar>
                    <div>
                      <p className="text-xs font-medium text-gray-200">{selected.requestedBy?.name || selected.subject}</p>
                      <p className="text-[10px] text-gray-500">{selected.requestedBy?.role}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant={statusColors[selected.status] as any} className="text-[10px]">{statusLabels[selected.status]}</Badge>
                    <Button variant="outline" size="sm" className="h-7 text-xs">
                      {statusLabels[selected.status]} ▾
                    </Button>
                  </div>
                </div>

                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-4 space-y-3">
                  <div className="text-center text-[10px] text-gray-500 py-2">{formatDate(selected.createdAt)} · {timeAgo(selected.createdAt)} · ◷ Issue from {selected.entity}</div>
                  {mockMessages.map((msg) => (
                    <div key={msg.id} className={`flex ${msg.sender === "admin" ? "justify-end" : "items-start gap-2"}`}>
                      {msg.sender !== "admin" && (
                        <Avatar className="w-7 h-7 flex-shrink-0">
                          <AvatarFallback className="text-[9px]">{msg.sender === "kora" ? "🤖" : getInitials(msg.name)}</AvatarFallback>
                        </Avatar>
                      )}
                      <div className={`max-w-[80%] rounded-xl px-3 py-2 ${msg.sender === "admin" ? "bg-blue-600 text-white" : "bg-[#1e2d40] text-gray-200"}`}>
                        {msg.sender !== "admin" && <p className="text-[10px] font-medium mb-0.5 text-gray-400">{msg.name}</p>}
                        <p className="text-xs">{msg.content}</p>
                        <p className={`text-[10px] mt-1 ${msg.sender === "admin" ? "text-blue-200" : "text-gray-500"}`}>{msg.time}</p>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Reply Input */}
                <div className="p-3 border-t border-[#1e2d40]">
                  <div className="flex gap-2 mb-2">
                    {["Reply", "Internal Note"].map((t) => (
                      <button key={t} className="text-xs text-gray-400 hover:text-gray-200 px-2 py-1 rounded">{t}</button>
                    ))}
                  </div>
                  <Input placeholder="Type your message..." value={replyText} onChange={e => setReplyText(e.target.value)}
                    onKeyDown={e => e.key === "Enter" && handleReply()} className="mb-2" />
                  <div className="flex items-center justify-between">
                    <div className="flex gap-2">
                      {["🔗","📎","😊"].map(e => <button key={e} className="text-gray-500 hover:text-gray-300">{e}</button>)}
                    </div>
                    <Button size="sm" onClick={handleReply} className="h-7"><Send className="w-3 h-3 mr-1" />Send</Button>
                  </div>
                </div>

                {/* Quick Actions */}
                <div className="flex flex-wrap gap-2 px-4 pb-3">
                  {["Reset Password", "Unlock Account", "Refund Request", "Impersonate Customer", "Reassign User"].map((a) => (
                    <button key={a} onClick={() => toast.info(a)}
                      className="text-[10px] px-2 py-1 rounded-lg bg-[#1e2d40] text-gray-300 hover:bg-[#2a3547] transition-colors">{a}</button>
                  ))}
                </div>
              </CardContent>
            ) : (
              <CardContent className="flex items-center justify-center h-full">
                <p className="text-sm text-gray-500">Select a ticket to view details</p>
              </CardContent>
            )}
          </Card>

          {/* Right Detail Panel */}
          <Card className="lg:col-span-1">
            {selected && (
              <CardContent className="pt-4 space-y-4">
                <div>
                  <p className="text-xs text-gray-500 mb-1">Contact</p>
                  <div className="flex items-center gap-2">
                    <Avatar className="w-8 h-8"><AvatarFallback className="text-xs">{getInitials(selected.requestedBy?.name || "?")}</AvatarFallback></Avatar>
                    <div>
                      <p className="text-xs font-medium text-gray-200">{selected.requestedBy?.name}</p>
                      <p className="text-[10px] text-blue-400 truncate">{selected.requestedBy?.role?.includes("Customer") ? "customer@email.com" : "partner@email.com"}</p>
                    </div>
                  </div>
                </div>

                <div className="space-y-2 text-xs">
                  <div className="flex justify-between py-1.5 border-b border-[#1e2d40]">
                    <span className="text-gray-500">Partner</span>
                    <span className="text-gray-300">{selected.entity}</span>
                  </div>
                  <div className="flex justify-between py-1.5 border-b border-[#1e2d40]">
                    <span className="text-gray-500">Plan</span>
                    <span className="text-gray-300">Business</span>
                  </div>
                  <div className="flex justify-between py-1.5 border-b border-[#1e2d40]">
                    <span className="text-gray-500">Monthly Revenue</span>
                    <span className="text-gray-300">€487</span>
                  </div>
                  <div className="flex justify-between py-1.5 border-b border-[#1e2d40]">
                    <span className="text-gray-500">Total Revenue</span>
                    <span className="text-gray-300">€2,847</span>
                  </div>
                  <div className="flex justify-between py-1.5">
                    <span className="text-gray-500">Open Tickets</span>
                    <span className="text-gray-300">3</span>
                  </div>
                </div>

                <Button variant="outline" size="sm" className="w-full text-xs">View Full Profile</Button>

                {/* Kora Assistant */}
                <div className="bg-[#0d1a2d] border border-blue-600/20 rounded-lg p-3">
                  <div className="flex items-center gap-2 mb-2">
                    <span>🤖</span>
                    <p className="text-xs font-medium text-white">Kora Assistant</p>
                  </div>
                  <p className="text-xs text-gray-400 mb-2">This looks like a blocked account issue caused by failed login attempts.</p>
                  <div className="space-y-1">
                    <p className="text-[10px] text-blue-400">→ Unlock account</p>
                    <p className="text-[10px] text-blue-400">→ Reset password</p>
                  </div>
                </div>

                {/* Actions */}
                <div className="space-y-2">
                  {["Resolve Issue", "Escalate Issue", "Reassign Ticket"].map((a) => (
                    <Button key={a} variant="secondary" size="sm" className="w-full text-xs" onClick={() => toast.info(a)}>{a}</Button>
                  ))}
                </div>
              </CardContent>
            )}
          </Card>
        </div>

        {/* Stats Footer */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mt-5">
          {[
            { label: "Open Tickets", value: "18", icon: AlertCircle, color: "text-blue-400" },
            { label: "In Progress", value: "7", icon: Clock, color: "text-amber-400" },
            { label: "Pending Approval", value: "5", icon: Clock, color: "text-purple-400" },
            { label: "Avg. Response Time", value: "1h 24m", icon: Clock, color: "text-gray-400" },
            { label: "SLA Breaches", value: "2", icon: XCircle, color: "text-red-400" },
          ].map((s) => (
            <Card key={s.label}>
              <CardContent className="pt-3 pb-3">
                <div className="flex items-center gap-2">
                  <s.icon className={`w-4 h-4 ${s.color}`} />
                  <div>
                    <p className="text-base font-bold text-white">{s.value}</p>
                    <p className="text-[10px] text-gray-400">{s.label}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
