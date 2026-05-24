/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supportApi } from "@/lib/api";
import { Header } from "@/components/layout/header";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
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
import {
  AlertCircle,
  CheckCircle,
  ChevronLeft,
  ChevronRight,
  Clock,
  Search,
  Send,
  XCircle,
} from "lucide-react";

const STATUS_TABS = [
  { value: "all", label: "All" },
  { value: "open", label: "Open" },
  { value: "in_progress", label: "In Progress" },
  { value: "pending_approval", label: "Pending Approval" },
  { value: "resolved", label: "Resolved" },
  { value: "closed", label: "Closed" },
];

const STATUS_LABELS: Record<string, string> = {
  open: "Open",
  in_progress: "In Progress",
  pending_approval: "Pending Approval",
  resolved: "Resolved",
  closed: "Closed",
};

const STATUS_BADGE: Record<string, any> = {
  open: "default",
  in_progress: "warning",
  pending_approval: "secondary",
  resolved: "success",
  closed: "secondary",
};

const PRIORITY_BADGE: Record<string, any> = {
  low: "secondary",
  medium: "warning",
  high: "destructive",
  urgent: "destructive",
};

const TYPE_LABELS: Record<string, string> = {
  technical_issue: "Technical Issue",
  account_access: "Account Access",
  billing: "Billing",
  data_reports: "Data / Reports",
  integration: "Integration",
  other: "Other",
};

export default function SupportPage() {
  const queryClient = useQueryClient();
  const [tab, setTab] = useState("all");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [replyText, setReplyText] = useState("");
  const [isInternal, setIsInternal] = useState(false);
  const [mobileView, setMobileView] = useState<"list" | "thread">("list");
  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const limit = 10;

  const { data: listResponse, isLoading: listLoading } = useQuery({
    queryKey: ["support-tickets", page, tab],
    queryFn: () =>
      supportApi
        .getAll({
          page,
          limit,
          status: tab === "all" ? undefined : tab,
        })
        .then((response) => response.data),
  });

  const tickets: any[] = listResponse?.data || [];
  const meta = listResponse?.meta || { total: 0 };
  const totalPages = Math.max(1, Math.ceil((meta.total || 0) / limit));

  const filteredTickets = useMemo(() => {
    if (!search.trim()) return tickets;
    const term = search.toLowerCase();
    return tickets.filter((ticket) => {
      const partnerName = ticket.created_by_partner_id?.name?.toLowerCase() || "";
      const employeeName = ticket.created_by_employee_id?.name?.toLowerCase() || "";
      return (
        ticket.subject?.toLowerCase().includes(term) ||
        ticket.ticket_id?.toLowerCase().includes(term) ||
        partnerName.includes(term) ||
        employeeName.includes(term)
      );
    });
  }, [tickets, search]);

  useEffect(() => {
    if (!selectedId && tickets.length > 0) {
      setSelectedId(tickets[0]._id);
    }
  }, [selectedId, tickets]);

  const { data: detailResponse, isLoading: detailLoading } = useQuery({
    queryKey: ["support-ticket", selectedId],
    queryFn: () =>
      supportApi.getById(String(selectedId)).then((response) => response.data?.data),
    enabled: Boolean(selectedId),
  });

  const selected: any = detailResponse;

  const { data: statsResponse } = useQuery({
    queryKey: ["support-stats"],
    queryFn: () => supportApi.getStats().then((response) => response.data?.data),
  });

  const statusCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    (statsResponse?.byStatus || []).forEach((entry: any) => {
      counts[entry._id] = entry.count;
    });
    return counts;
  }, [statsResponse]);

  const totalTickets = Object.values(statusCounts).reduce((sum, count) => sum + count, 0);

  const replyMutation = useMutation({
    mutationFn: () =>
      supportApi.reply(String(selectedId), { message: replyText, isInternal }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["support-ticket", selectedId] });
      queryClient.invalidateQueries({ queryKey: ["support-tickets"] });
      setReplyText("");
      toast.success("Reply sent");
    },
    onError: (error: any) =>
      toast.error(error?.response?.data?.message || "Failed to send reply"),
  });

  const statusMutation = useMutation({
    mutationFn: (status: string) =>
      supportApi.update(String(selectedId), { status }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["support-ticket", selectedId] });
      queryClient.invalidateQueries({ queryKey: ["support-tickets"] });
      queryClient.invalidateQueries({ queryKey: ["support-stats"] });
      toast.success("Ticket status updated");
    },
    onError: (error: any) =>
      toast.error(error?.response?.data?.message || "Failed to update status"),
  });

  const closeMutation = useMutation({
    mutationFn: () => supportApi.close(String(selectedId)),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["support-ticket", selectedId] });
      queryClient.invalidateQueries({ queryKey: ["support-tickets"] });
      queryClient.invalidateQueries({ queryKey: ["support-stats"] });
      toast.success("Ticket closed");
    },
    onError: (error: any) =>
      toast.error(error?.response?.data?.message || "Failed to close ticket"),
  });

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [selected?.replies?.length]);

  const handleReply = () => {
    if (!replyText.trim() || !selectedId) return;
    replyMutation.mutate();
  };

  const ticketAuthor = (ticket: any) =>
    ticket.created_by_partner_id || ticket.created_by_employee_id || {};

  const stats = [
    {
      label: "Open Tickets",
      value: statusCounts.open || 0,
      icon: AlertCircle,
      color: "text-blue-400",
    },
    {
      label: "In Progress",
      value: statusCounts.in_progress || 0,
      icon: Clock,
      color: "text-amber-400",
    },
    {
      label: "Pending Approval",
      value: statusCounts.pending_approval || 0,
      icon: Clock,
      color: "text-purple-400",
    },
    {
      label: "Resolved",
      value: statusCounts.resolved || 0,
      icon: CheckCircle,
      color: "text-emerald-400",
    },
    {
      label: "Closed",
      value: statusCounts.closed || 0,
      icon: XCircle,
      color: "text-gray-400",
    },
  ];

  return (
    <div>
      <Header
        title="Support"
        subtitle="Manage and resolve support requests from partners and customers."
      />
      <div className="p-3 sm:p-4 lg:p-6">
        <div className="mb-5 flex w-fit flex-wrap gap-1 rounded-lg bg-[#0d1a2d] p-1">
          {STATUS_TABS.map((option) => (
            <button
              key={option.value}
              onClick={() => {
                setTab(option.value);
                setPage(1);
              }}
              className={`flex items-center gap-1 rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${
                tab === option.value
                  ? "bg-blue-600 text-white"
                  : "text-gray-400 hover:text-gray-200"
              }`}
            >
              {option.label}
              <span
                className={`text-[10px] ${
                  tab === option.value ? "text-white/70" : "text-gray-500"
                }`}
              >
                {option.value === "all" ? totalTickets : statusCounts[option.value] || 0}
              </span>
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 gap-4 lg:grid-cols-5">
          <Card className={`${mobileView === "list" ? "flex" : "hidden"} flex-col lg:flex lg:col-span-2`}>
            <CardHeader>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-gray-500" />
                <Input
                  placeholder="Search requests..."
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  className="h-8 pl-8 text-xs"
                />
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <div className="border-b border-[#1e2d40] px-4 py-1 text-xs text-gray-500">
                {meta.total > 0
                  ? `${filteredTickets.length} of ${meta.total} requests`
                  : "0 requests"}
              </div>
              {listLoading ? (
                <div className="space-y-2 p-3">
                  {Array.from({ length: 4 }).map((_, index) => (
                    <Skeleton key={index} className="h-16 w-full" />
                  ))}
                </div>
              ) : filteredTickets.length === 0 ? (
                <p className="p-6 text-center text-xs text-gray-500">
                  No support tickets yet.
                </p>
              ) : (
                filteredTickets.map((ticket) => {
                  const author = ticketAuthor(ticket);
                  const lastReply = ticket.replies?.[ticket.replies.length - 1];
                  return (
                    <div
                      key={ticket._id}
                      onClick={() => {
                        setSelectedId(ticket._id);
                        setMobileView("thread");
                      }}
                      className={`flex cursor-pointer items-start gap-3 border-b border-[#1e2d40] p-4 transition-colors ${
                        selected?._id === ticket._id
                          ? "border-l-2 border-l-blue-500 bg-blue-600/10"
                          : "hover:bg-[#0d1a2d]"
                      }`}
                    >
                      <Avatar className="h-8 w-8 shrink-0">
                        {author.profileImage?.url ? (
                          <AvatarImage src={author.profileImage.url} alt={author.name} />
                        ) : (
                          <AvatarFallback className="text-xs">
                            {getInitials(author.name || ticket.subject || "T")}
                          </AvatarFallback>
                        )}
                      </Avatar>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-start justify-between">
                          <p className="truncate text-xs font-medium text-gray-200">
                            {author.name || "Unknown"}
                          </p>
                          <Badge
                            variant={PRIORITY_BADGE[ticket.priority] || "secondary"}
                            className="ml-1 shrink-0 text-[9px]"
                          >
                            {ticket.priority}
                          </Badge>
                        </div>
                        <p className="text-[10px] text-gray-500">
                          {ticket.ticket_id} · {TYPE_LABELS[ticket.type] || ticket.type}
                        </p>
                        <p className="mt-1 truncate text-xs text-gray-400">
                          {ticket.subject}
                        </p>
                        <div className="mt-1 flex items-center justify-between">
                          <Badge
                            variant={STATUS_BADGE[ticket.status] || "default"}
                            className="text-[9px]"
                          >
                            {STATUS_LABELS[ticket.status] || ticket.status}
                          </Badge>
                          <span className="text-[10px] text-gray-500">
                            {timeAgo(lastReply?.createdAt || ticket.updatedAt || ticket.createdAt)}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
              <div className="flex items-center justify-between border-t border-[#1e2d40] px-4 py-2">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7"
                  onClick={() => setPage((current) => Math.max(1, current - 1))}
                  disabled={page === 1}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <span className="text-xs text-gray-500">
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
            </CardContent>
          </Card>

          <Card className={`${mobileView === "thread" ? "flex" : "hidden"} flex-col lg:flex lg:col-span-3`}>
            {!selectedId ? (
              <CardContent className="flex h-[calc(100vh-260px)] items-center justify-center">
                <p className="text-sm text-gray-500">Select a ticket to view conversation</p>
              </CardContent>
            ) : detailLoading || !selected ? (
              <CardContent className="space-y-3 p-4">
                <Skeleton className="h-12 w-full" />
                <Skeleton className="h-40 w-full" />
              </CardContent>
            ) : (
              <CardContent className="flex h-[calc(100vh-240px)] flex-col p-0">
                <div className="flex items-center justify-between border-b border-[#1e2d40] px-3 py-3 sm:px-4">
                  <div className="flex min-w-0 items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setMobileView("list")}
                      className="-ml-1 rounded-lg p-1.5 text-gray-300 hover:bg-[#1e2d40] lg:hidden"
                      aria-label="Back"
                    >
                      <ChevronLeft className="h-5 w-5" />
                    </button>
                    <Avatar className="h-8 w-8 shrink-0">
                      {ticketAuthor(selected).profileImage?.url ? (
                        <AvatarImage
                          src={ticketAuthor(selected).profileImage.url}
                          alt={ticketAuthor(selected).name}
                        />
                      ) : (
                        <AvatarFallback className="text-xs">
                          {getInitials(ticketAuthor(selected).name || "T")}
                        </AvatarFallback>
                      )}
                    </Avatar>
                    <div className="min-w-0">
                      <p className="truncate text-xs font-medium text-gray-200">
                        {ticketAuthor(selected).name || "Unknown"}
                      </p>
                      <p className="truncate text-[10px] text-gray-500">
                        {selected.ticket_id} · {TYPE_LABELS[selected.type] || selected.type}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Select
                      value={selected.status}
                      onValueChange={(value) => statusMutation.mutate(value)}
                      disabled={statusMutation.isPending}
                    >
                      <SelectTrigger className="h-7 w-36 text-xs">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.entries(STATUS_LABELS).map(([value, label]) => (
                          <SelectItem key={value} value={value}>
                            {label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {selected.status !== "closed" ? (
                      <Button
                        size="sm"
                        variant="outline"
                        className="h-7 text-xs"
                        onClick={() => closeMutation.mutate()}
                        disabled={closeMutation.isPending}
                      >
                        Close
                      </Button>
                    ) : null}
                  </div>
                </div>

                <div className="flex-1 space-y-3 overflow-y-auto p-4">
                  <div className="py-2 text-center text-[10px] text-gray-500">
                    {formatDate(selected.createdAt)} · {selected.subject}
                  </div>
                  {(selected.replies || []).length === 0 ? (
                    <p className="text-center text-xs text-gray-500">No messages yet.</p>
                  ) : (
                    (selected.replies || []).map((reply: any, index: number) => {
                      const sender = reply.sender_id || {};
                      const isAdmin = sender.role === "admin";
                      return (
                        <div
                          key={reply._id || index}
                          className={`flex ${isAdmin ? "justify-end" : "items-start gap-2"}`}
                        >
                          {!isAdmin ? (
                            <Avatar className="h-7 w-7 shrink-0">
                              {sender.profileImage?.url ? (
                                <AvatarImage src={sender.profileImage.url} alt={sender.name} />
                              ) : (
                                <AvatarFallback className="text-[9px]">
                                  {getInitials(sender.name || "?")}
                                </AvatarFallback>
                              )}
                            </Avatar>
                          ) : null}
                          <div
                            className={`max-w-[80%] rounded-xl px-3 py-2 ${
                              isAdmin
                                ? "bg-blue-600 text-white"
                                : reply.isInternal
                                ? "border border-amber-500/30 bg-amber-500/10 text-gray-200"
                                : "bg-[#1e2d40] text-gray-200"
                            }`}
                          >
                            {!isAdmin ? (
                              <p className="mb-0.5 text-[10px] font-medium text-gray-400">
                                {sender.name || "—"}
                                {reply.isInternal ? (
                                  <span className="ml-1 text-amber-400">(internal)</span>
                                ) : null}
                              </p>
                            ) : null}
                            <p className="whitespace-pre-wrap text-xs">{reply.message}</p>
                            <p
                              className={`mt-1 text-[10px] ${
                                isAdmin ? "text-blue-200" : "text-gray-500"
                              }`}
                            >
                              {timeAgo(reply.createdAt)}
                            </p>
                          </div>
                        </div>
                      );
                    })
                  )}
                  <div ref={messagesEndRef} />
                </div>

                <div className="border-t border-[#1e2d40] p-3">
                  <div className="mb-2 flex gap-2">
                    <button
                      onClick={() => setIsInternal(false)}
                      className={`rounded px-2 py-1 text-xs ${
                        !isInternal
                          ? "bg-blue-600 text-white"
                          : "text-gray-400 hover:text-gray-200"
                      }`}
                    >
                      Reply
                    </button>
                    <button
                      onClick={() => setIsInternal(true)}
                      className={`rounded px-2 py-1 text-xs ${
                        isInternal
                          ? "bg-amber-600 text-white"
                          : "text-gray-400 hover:text-gray-200"
                      }`}
                    >
                      Internal Note
                    </button>
                  </div>
                  <div className="flex gap-2">
                    <Input
                      placeholder={isInternal ? "Internal note..." : "Type your reply..."}
                      value={replyText}
                      onChange={(event) => setReplyText(event.target.value)}
                      onKeyDown={(event) => {
                        if (event.key === "Enter" && !event.shiftKey) {
                          event.preventDefault();
                          handleReply();
                        }
                      }}
                      className="flex-1"
                    />
                    <Button
                      size="sm"
                      onClick={handleReply}
                      disabled={!replyText.trim() || replyMutation.isPending}
                    >
                      <Send className="mr-1 h-3 w-3" />
                      Send
                    </Button>
                  </div>
                </div>
              </CardContent>
            )}
          </Card>
        </div>

        <div className="mt-5 grid grid-cols-2 gap-4 md:grid-cols-5">
          {stats.map((stat) => (
            <Card key={stat.label}>
              <CardContent className="pt-3 pb-3">
                <div className="flex items-center gap-2">
                  <stat.icon className={`h-4 w-4 ${stat.color}`} />
                  <div>
                    <p className="text-base font-bold text-white">{stat.value}</p>
                    <p className="text-[10px] text-gray-400">{stat.label}</p>
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
