/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supportApi } from "@/lib/api";
import { Header } from "@/components/layout/header";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { getInitials, timeAgo } from "@/lib/utils";
import { toast } from "sonner";
import {
  ArrowRight,
  BarChart3,
  BookOpen,
  Bot,
  CalendarDays,
  CheckCircle,
  ChevronLeft,
  ChevronRight,
  Clock,
  Code2,
  CreditCard,
  Download,
  FileText,
  Filter,
  Lock,
  MoreHorizontal,
  Plus,
  Search,
  Send,
  Shield,
  UserRound,
  Users,
  XCircle,
} from "lucide-react";

type SupportMode = "help" | "requests";

const STATUS_TABS = [
  { value: "all", label: "All Requests" },
  { value: "open", label: "Open" },
  { value: "in_progress", label: "In Progress" },
  { value: "pending_approval", label: "Pending Approval" },
  { value: "resolved", label: "Resolved" },
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

const TYPE_LABELS: Record<string, string> = {
  technical_issue: "Technical Issue",
  account_access: "Access Issue",
  billing: "Billing",
  data_reports: "Data / Reports",
  integration: "Integration",
  other: "Other",
};

const HELP_TOPICS = [
  {
    title: "Account & Login",
    description: "Login issues, password reset, 2FA, account access and security.",
    articles: 8,
    icon: UserRound,
    tone: "bg-blue-600/20 text-blue-300",
  },
  {
    title: "Calendar & Appointments",
    description: "Sync issues, calendar settings, booking problems and fixes.",
    articles: 12,
    icon: CalendarDays,
    tone: "bg-emerald-600/20 text-emerald-300",
  },
  {
    title: "Leads & Customers",
    description: "Managing leads, customer profiles, notes and activities.",
    articles: 10,
    icon: Users,
    tone: "bg-purple-600/20 text-purple-300",
  },
  {
    title: "Billing & Earnings",
    description: "Payments, invoices, subscriptions and earnings questions.",
    articles: 7,
    icon: CreditCard,
    tone: "bg-amber-600/20 text-amber-300",
  },
  {
    title: "Technical Issues",
    description: "Bug reports, application errors, performance and system issues.",
    articles: 9,
    icon: Code2,
    tone: "bg-indigo-600/20 text-indigo-300",
  },
  {
    title: "Security & Privacy",
    description: "Data protection, privacy settings, permissions and compliance.",
    articles: 6,
    icon: Shield,
    tone: "bg-emerald-600/20 text-emerald-300",
  },
];

const POPULAR_ARTICLES = [
  { title: "How to reset a customer password", category: "Account & Login" },
  { title: "Fix calendar sync issues", category: "Calendar & Appointments" },
  { title: "How to add a new customer", category: "Leads & Customers" },
  { title: "Understanding partner commissions", category: "Billing & Earnings" },
  { title: "Enable two-factor authentication (2FA)", category: "Account & Login" },
];

const ARTICLE_METRICS = [
  { label: "Published Articles", value: "124", icon: BookOpen },
  { label: "Draft Articles", value: "18", icon: FileText },
  { label: "Search Success", value: "87%", icon: BarChart3 },
  { label: "Helpful Rating", value: "94%", icon: CheckCircle },
];

export default function SupportPage() {
  const queryClient = useQueryClient();
  const [mode, setMode] = useState<SupportMode>("requests");
  const [tab, setTab] = useState("all");
  const [search, setSearch] = useState("");
  const [articleSearch, setArticleSearch] = useState("");
  const [page, setPage] = useState(1);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [replyText, setReplyText] = useState("");
  const [isInternal, setIsInternal] = useState(false);
  const [addArticleOpen, setAddArticleOpen] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const limit = 10;

  const { data: listResponse, isLoading: listLoading } = useQuery({
    queryKey: ["support-tickets", page, tab],
    queryFn: () =>
      supportApi
        .getAll({ page, limit, status: tab === "all" ? undefined : tab })
        .then((response) => response.data),
  });

  const tickets: any[] = useMemo(() => listResponse?.data || [], [listResponse?.data]);
  const meta = listResponse?.meta || { total: 0 };
  const totalPages = Math.max(1, Math.ceil((meta.total || 0) / limit));

  const filteredTickets = useMemo(() => {
    if (!search.trim()) return tickets;
    const term = search.toLowerCase();
    return tickets.filter((ticket) => {
      const author = ticketAuthor(ticket);
      return (
        ticket.subject?.toLowerCase().includes(term) ||
        ticket.ticket_id?.toLowerCase().includes(term) ||
        author.name?.toLowerCase().includes(term)
      );
    });
  }, [tickets, search]);

  const filteredTopics = useMemo(() => {
    if (!articleSearch.trim()) return HELP_TOPICS;
    const term = articleSearch.toLowerCase();
    return HELP_TOPICS.filter(
      (topic) =>
        topic.title.toLowerCase().includes(term) ||
        topic.description.toLowerCase().includes(term)
    );
  }, [articleSearch]);

  const filteredArticles = useMemo(() => {
    if (!articleSearch.trim()) return POPULAR_ARTICLES;
    const term = articleSearch.toLowerCase();
    return POPULAR_ARTICLES.filter(
      (article) =>
        article.title.toLowerCase().includes(term) ||
        article.category.toLowerCase().includes(term)
    );
  }, [articleSearch]);

  useEffect(() => {
    if (!selectedId && tickets.length > 0) {
      const timer = window.setTimeout(() => setSelectedId(tickets[0]._id), 0);
      return () => window.clearTimeout(timer);
    }
  }, [selectedId, tickets]);

  const { data: detailResponse, isLoading: detailLoading } = useQuery({
    queryKey: ["support-ticket", selectedId],
    queryFn: () =>
      supportApi.getById(String(selectedId)).then((response) => response.data?.data),
    enabled: Boolean(selectedId),
  });

  const selected: any = detailResponse || tickets.find((ticket) => ticket._id === selectedId);

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
    mutationFn: (status: string) => supportApi.update(String(selectedId), { status }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["support-ticket", selectedId] });
      queryClient.invalidateQueries({ queryKey: ["support-tickets"] });
      queryClient.invalidateQueries({ queryKey: ["support-stats"] });
      toast.success("Ticket status updated");
    },
    onError: (error: any) =>
      toast.error(error?.response?.data?.message || "Failed to update status"),
  });

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [selected?.replies?.length]);

  const handleReply = () => {
    if (!replyText.trim() || !selectedId) return;
    replyMutation.mutate();
  };

  const headerAction =
    mode === "help" ? (
      <Button size="sm" onClick={() => setAddArticleOpen(true)}>
        <Plus className="mr-1 h-4 w-4" />
        Add Article
      </Button>
    ) : (
      <div className="flex items-center gap-2">
        <Button size="sm">
          <Plus className="mr-1 h-4 w-4" />
          Create Ticket
        </Button>
        <Button size="sm" variant="outline">
          <Download className="mr-1 h-4 w-4" />
          Export
        </Button>
      </div>
    );

  return (
    <div>
      <Header
        title="Support"
        subtitle={
          mode === "help"
            ? "Get help, solve issues or contact support."
            : "Manage and resolve support requests from partners and customers."
        }
        action={headerAction}
      />
      <div className="p-3 sm:p-4 lg:p-6">
        <div className="mb-4 flex flex-wrap gap-2">
          <button
            onClick={() => setMode("requests")}
            className={`rounded-lg border px-4 py-2 text-sm ${
              mode === "requests"
                ? "border-blue-500 bg-blue-600/20 text-blue-300"
                : "border-[#1e2d40] text-gray-400 hover:text-gray-200"
            }`}
          >
            Support Tickets
          </button>
          <button
            onClick={() => setMode("help")}
            className={`rounded-lg border px-4 py-2 text-sm ${
              mode === "help"
                ? "border-blue-500 bg-blue-600/20 text-blue-300"
                : "border-[#1e2d40] text-gray-400 hover:text-gray-200"
            }`}
          >
            Help Center
          </button>
        </div>

        {mode === "help" ? (
          <HelpCenterView
            articleSearch={articleSearch}
            setArticleSearch={setArticleSearch}
            topics={filteredTopics}
            articles={filteredArticles}
            onAddArticle={() => setAddArticleOpen(true)}
          />
        ) : (
          <TicketConsole
            tab={tab}
            setTab={setTab}
            page={page}
            setPage={setPage}
            totalPages={totalPages}
            search={search}
            setSearch={setSearch}
            tickets={filteredTickets}
            selected={selected}
            selectedId={selectedId}
            setSelectedId={setSelectedId}
            listLoading={listLoading}
            detailLoading={detailLoading}
            totalTickets={totalTickets}
            statusCounts={statusCounts}
            metaTotal={meta.total || 0}
            replyText={replyText}
            setReplyText={setReplyText}
            isInternal={isInternal}
            setIsInternal={setIsInternal}
            onReply={handleReply}
            replying={replyMutation.isPending}
            onStatusChange={(value: string) => statusMutation.mutate(value)}
            statusUpdating={statusMutation.isPending}
            messagesEndRef={messagesEndRef}
          />
        )}
      </div>

      <AddArticleDialog open={addArticleOpen} onOpenChange={setAddArticleOpen} />
    </div>
  );
}

function ticketAuthor(ticket: any) {
  return ticket?.created_by_partner_id || ticket?.created_by_employee_id || {};
}

function HelpCenterView({
  articleSearch,
  setArticleSearch,
  topics,
  articles,
  onAddArticle,
}: {
  articleSearch: string;
  setArticleSearch: (value: string) => void;
  topics: typeof HELP_TOPICS;
  articles: typeof POPULAR_ARTICLES;
  onAddArticle: () => void;
}) {
  return (
    <div className="grid grid-cols-1 gap-4 xl:grid-cols-[220px_minmax(0,1fr)_390px]">
      <aside className="space-y-4">
        <Card>
          <CardContent className="space-y-2 p-2">
            <SupportNav active icon={BookOpen} title="Help Center" sub="Browse articles and guides" />
            <SupportNav icon={FileText} title="My Requests" sub="View and track your requests" />
            <SupportNav icon={Send} title="Contact Support" sub="Get help from our team" disabled />
          </CardContent>
        </Card>
        <SystemStatus compact />
      </aside>

      <main>
        <Card>
          <CardContent className="p-4">
            <div className="mb-4 flex items-start justify-between gap-3">
              <div>
                <h2 className="text-lg font-semibold text-white">Help Center</h2>
                <p className="mt-1 text-sm text-gray-400">Find answers, guides and solutions for common topics.</p>
              </div>
              <Button size="sm" onClick={onAddArticle}>
                <Plus className="mr-1 h-4 w-4" />
                Add Article
              </Button>
            </div>
            <div className="mb-5 flex flex-col gap-3 sm:flex-row">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" />
                <Input
                  placeholder="Search for help articles..."
                  value={articleSearch}
                  onChange={(event) => setArticleSearch(event.target.value)}
                  className="h-10 pl-10"
                />
              </div>
              <Select defaultValue="popular">
                <SelectTrigger className="h-10 w-full sm:w-48">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="popular">Popular topics</SelectItem>
                  <SelectItem value="recent">Recently updated</SelectItem>
                  <SelectItem value="drafts">Draft articles</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-3 md:grid-cols-2 2xl:grid-cols-3">
              {topics.map((topic) => {
                const Icon = topic.icon;
                return (
                  <button
                    key={topic.title}
                    className="min-h-[210px] rounded-lg border border-[#1e2d40] bg-[radial-gradient(circle_at_0%_0%,rgba(37,99,235,0.14),transparent_36%),#091526] p-4 text-left transition-colors hover:border-blue-500/50"
                  >
                    <span className={`mb-4 flex h-12 w-12 items-center justify-center rounded-lg ${topic.tone}`}>
                      <Icon className="h-5 w-5" />
                    </span>
                    <p className="text-sm font-semibold text-white">{topic.title}</p>
                    <p className="mt-2 min-h-16 text-sm leading-6 text-gray-400">{topic.description}</p>
                    <p className="mt-4 text-xs text-gray-500">{topic.articles} articles</p>
                  </button>
                );
              })}
            </div>
            <div className="mt-5 border-t border-[#1e2d40] pt-4">
              <div className="mb-3 flex items-center justify-between">
                <h3 className="text-base font-semibold text-white">Popular Articles</h3>
                <button className="inline-flex items-center gap-2 text-xs text-blue-400 hover:text-blue-300">
                  View all articles <ArrowRight className="h-3.5 w-3.5" />
                </button>
              </div>
              <div className="overflow-hidden rounded-lg border border-[#1e2d40]">
                {(articles.length ? articles : POPULAR_ARTICLES).map((article) => (
                  <button
                    key={article.title}
                    className="flex w-full items-center justify-between gap-3 border-b border-[#1e2d40] px-4 py-3 text-left last:border-0 hover:bg-[#0d1a2d]"
                  >
                    <span className="flex min-w-0 items-center gap-3">
                      <FileText className="h-4 w-4 shrink-0 text-gray-400" />
                      <span className="truncate text-sm text-gray-200">{article.title}</span>
                    </span>
                    <Badge variant="secondary" className="shrink-0 text-[10px]">
                      {article.category}
                    </Badge>
                  </button>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
        <div className="mt-4 grid gap-3 md:grid-cols-4">
          {ARTICLE_METRICS.map((metric) => (
            <Card key={metric.label}>
              <CardContent className="p-4">
                <metric.icon className="mb-2 h-4 w-4 text-blue-400" />
                <p className="text-xl font-bold text-white">{metric.value}</p>
                <p className="text-xs text-gray-500">{metric.label}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </main>

      <aside className="space-y-4">
        <KoraAssistantPanel />
        <SystemStatus />
      </aside>
    </div>
  );
}

function TicketConsole(props: any) {
  const {
    tab,
    setTab,
    page,
    setPage,
    totalPages,
    search,
    setSearch,
    tickets,
    selected,
    selectedId,
    setSelectedId,
    listLoading,
    detailLoading,
    totalTickets,
    statusCounts,
    metaTotal,
    replyText,
    setReplyText,
    isInternal,
    setIsInternal,
    onReply,
    replying,
    onStatusChange,
    statusUpdating,
    messagesEndRef,
  } = props;

  const stats = [
    { label: "Open Tickets", value: statusCounts.open || 0, icon: Lock, color: "text-blue-400" },
    { label: "In Progress", value: statusCounts.in_progress || 0, icon: Clock, color: "text-amber-400" },
    { label: "Pending Approval", value: statusCounts.pending_approval || 0, icon: Users, color: "text-purple-400" },
    { label: "Avg. Response Time", value: "1h 24m", icon: CheckCircle, color: "text-emerald-400" },
    { label: "SLA Breaches", value: "2", icon: XCircle, color: "text-red-400" },
  ];

  return (
    <>
      <div className="mb-4 flex flex-wrap gap-1 rounded-lg bg-[#0d1a2d] p-1">
        {STATUS_TABS.map((option) => (
          <button
            key={option.value}
            onClick={() => {
              setTab(option.value);
              setPage(1);
            }}
            className={`flex items-center gap-2 rounded-md px-4 py-2 text-xs font-medium transition-colors ${
              tab === option.value ? "bg-blue-600 text-white" : "text-gray-400 hover:text-gray-200"
            }`}
          >
            {option.label}
            <span className="rounded-full bg-white/10 px-1.5 py-0.5 text-[10px]">
              {option.value === "all" ? totalTickets : statusCounts[option.value] || 0}
            </span>
          </button>
        ))}
      </div>
      <div className="mb-4 grid gap-3 md:grid-cols-[1fr_150px_150px_150px_150px_auto]">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-gray-500" />
          <Input placeholder="Search requests..." value={search} onChange={(event) => setSearch(event.target.value)} className="h-9 pl-8" />
        </div>
        {["All Partners", "All Customers", "All Types", "All Priorities"].map((label) => (
          <Select key={label} defaultValue={label}>
            <SelectTrigger className="h-9">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={label}>{label}</SelectItem>
            </SelectContent>
          </Select>
        ))}
        <Button variant="outline" className="h-9">
          <Filter className="mr-1 h-4 w-4" />
          Filters
        </Button>
      </div>
      <div className="grid grid-cols-1 gap-4 xl:grid-cols-[370px_minmax(0,1fr)_260px]">
        <TicketList
          tickets={tickets}
          selectedId={selectedId}
          setSelectedId={setSelectedId}
          loading={listLoading}
          page={page}
          totalPages={totalPages}
          setPage={setPage}
          metaTotal={metaTotal}
        />
        <TicketThread
          selected={selected}
          loading={detailLoading}
          replyText={replyText}
          setReplyText={setReplyText}
          isInternal={isInternal}
          setIsInternal={setIsInternal}
          onReply={onReply}
          replying={replying}
          onStatusChange={onStatusChange}
          statusUpdating={statusUpdating}
          messagesEndRef={messagesEndRef}
        />
        <ContextPanel selected={selected} />
      </div>
      <div className="mt-4 grid grid-cols-2 gap-3 md:grid-cols-5">
        {stats.map((stat) => (
          <Card key={stat.label}>
            <CardContent className="p-4">
              <stat.icon className={`mb-2 h-5 w-5 ${stat.color}`} />
              <p className="text-2xl font-bold text-white">{stat.value}</p>
              <p className="text-xs text-gray-500">{stat.label}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </>
  );
}

function TicketList({ tickets, selectedId, setSelectedId, loading, page, totalPages, setPage, metaTotal }: any) {
  return (
    <Card>
      <CardContent className="p-0">
        <div className="flex items-center justify-between border-b border-[#1e2d40] px-4 py-3">
          <span className="text-xs text-gray-400">Showing {tickets.length} of {metaTotal} requests</span>
          <Button size="sm" variant="outline" className="h-7 text-xs">Newest</Button>
        </div>
        {loading ? (
          <div className="space-y-2 p-3">
            {Array.from({ length: 6 }).map((_, index) => <Skeleton key={index} className="h-16 w-full" />)}
          </div>
        ) : tickets.length === 0 ? (
          <p className="p-8 text-center text-sm text-gray-500">No support tickets yet.</p>
        ) : (
          tickets.map((ticket: any) => {
            const author = ticketAuthor(ticket);
            return (
              <button
                key={ticket._id}
                onClick={() => setSelectedId(ticket._id)}
                className={`flex w-full items-start gap-3 border-b border-[#1e2d40] p-4 text-left last:border-0 hover:bg-[#0d1a2d] ${
                  selectedId === ticket._id ? "bg-blue-600/10 ring-1 ring-inset ring-blue-500" : ""
                }`}
              >
                <Avatar className="h-10 w-10 shrink-0">
                  {author.profileImage?.url ? <AvatarImage src={author.profileImage.url} alt={author.name} /> : <AvatarFallback>{getInitials(author.name || "T")}</AvatarFallback>}
                </Avatar>
                <span className="min-w-0 flex-1">
                  <span className="flex items-start justify-between gap-2">
                    <span className="truncate text-sm font-semibold text-gray-100">{author.name || "Unknown"}</span>
                    <span className="flex items-center gap-1 text-[10px] capitalize text-gray-300">
                      <span className={`h-1.5 w-1.5 rounded-full ${ticket.priority === "high" || ticket.priority === "urgent" ? "bg-red-400" : ticket.priority === "medium" ? "bg-orange-400" : "bg-emerald-400"}`} />
                      {ticket.priority || "Low"}
                    </span>
                  </span>
                  <span className="mt-1 block truncate text-xs text-gray-400">{ticket.subject}</span>
                  <span className="mt-1 flex items-center justify-between">
                    <span className="text-[10px] text-gray-500">{TYPE_LABELS[ticket.type] || ticket.type}</span>
                    <Badge variant={STATUS_BADGE[ticket.status] || "default"} className="text-[9px]">{STATUS_LABELS[ticket.status] || ticket.status}</Badge>
                  </span>
                </span>
              </button>
            );
          })
        )}
        <div className="flex items-center justify-center gap-2 border-t border-[#1e2d40] p-3">
          <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setPage((current: number) => Math.max(1, current - 1))} disabled={page === 1}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <span className="rounded bg-blue-600 px-2 py-1 text-xs text-white">{page}</span>
          <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setPage((current: number) => current + 1)} disabled={page >= totalPages}>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

function TicketThread({ selected, loading, replyText, setReplyText, isInternal, setIsInternal, onReply, replying, onStatusChange, statusUpdating, messagesEndRef }: any) {
  if (loading) {
    return <Card><CardContent className="space-y-3 p-4"><Skeleton className="h-16 w-full" /><Skeleton className="h-96 w-full" /></CardContent></Card>;
  }
  if (!selected) {
    return <Card><CardContent className="flex min-h-[520px] items-center justify-center text-sm text-gray-500">Select a ticket to view conversation</CardContent></Card>;
  }
  const author = ticketAuthor(selected);
  return (
    <Card>
      <CardContent className="flex min-h-[620px] flex-col p-0">
        <div className="flex items-center justify-between border-b border-[#1e2d40] p-4">
          <div className="flex min-w-0 items-center gap-3">
            <Avatar className="h-10 w-10">
              {author.profileImage?.url ? <AvatarImage src={author.profileImage.url} alt={author.name} /> : <AvatarFallback>{getInitials(author.name || "T")}</AvatarFallback>}
            </Avatar>
            <div>
              <p className="text-lg font-semibold text-white">{author.name || "Unknown"}</p>
              <p className="text-xs text-gray-500">{selected.ticket_id} - {TYPE_LABELS[selected.type] || selected.type}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Select value={selected.status} onValueChange={onStatusChange} disabled={statusUpdating}>
              <SelectTrigger className="h-8 w-36 text-xs"><SelectValue /></SelectTrigger>
              <SelectContent>
                {Object.entries(STATUS_LABELS).map(([value, label]) => <SelectItem key={value} value={value}>{label}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
        </div>
        <div className="flex-1 space-y-4 overflow-y-auto p-4">
          <div className="rounded-lg border border-[#1e2d40] bg-[#07111f] p-3 text-xs text-gray-300">
            <p className="font-medium text-gray-100">{selected.subject}</p>
            <p className="mt-2 leading-5">{selected.description || "No description provided."}</p>
          </div>
          {(selected.replies || []).map((reply: any, index: number) => {
            const sender = reply.sender_id || {};
            const isAdmin = sender.role === "admin";
            return (
              <div key={reply._id || index} className={`flex ${isAdmin ? "justify-end" : "items-start gap-2"}`}>
                {!isAdmin ? <Avatar className="h-7 w-7"><AvatarFallback>{getInitials(sender.name || "?")}</AvatarFallback></Avatar> : null}
                <div className={`max-w-[82%] rounded-xl px-3 py-2 text-xs ${isAdmin ? "bg-blue-600 text-white" : reply.isInternal ? "border border-amber-500/30 bg-amber-500/10 text-gray-200" : "bg-[#1e2d40] text-gray-200"}`}>
                  {!isAdmin ? <p className="mb-1 text-[10px] text-gray-400">{sender.name || "User"} {reply.isInternal ? <span className="text-amber-400">(internal)</span> : null}</p> : null}
                  <p className="whitespace-pre-wrap">{reply.message}</p>
                  <p className={`mt-1 text-[10px] ${isAdmin ? "text-blue-200" : "text-gray-500"}`}>{timeAgo(reply.createdAt)}</p>
                </div>
              </div>
            );
          })}
          <div ref={messagesEndRef} />
        </div>
        <div className="border-t border-[#1e2d40] p-4">
          <div className="mb-2 flex gap-2">
            <button onClick={() => setIsInternal(false)} className={`rounded px-3 py-1 text-xs ${!isInternal ? "bg-blue-600 text-white" : "text-gray-400"}`}>Reply</button>
            <button onClick={() => setIsInternal(true)} className={`rounded px-3 py-1 text-xs ${isInternal ? "bg-amber-600 text-white" : "text-gray-400"}`}>Internal Note</button>
          </div>
          <div className="flex gap-2">
            <Input placeholder={isInternal ? "Internal note..." : "Type your message..."} value={replyText} onChange={(event) => setReplyText(event.target.value)} className="flex-1" />
            <Button size="sm" onClick={onReply} disabled={!replyText.trim() || replying}>
              <Send className="mr-1 h-3.5 w-3.5" /> Send
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function ContextPanel({ selected }: { selected: any }) {
  const author = ticketAuthor(selected);
  return (
    <aside className="space-y-4">
      <Card>
        <CardContent className="p-4">
          <p className="mb-4 text-sm font-semibold text-white">Context</p>
          <div className="mb-4 flex items-center gap-3">
            <Avatar><AvatarFallback>{getInitials(author.name || "U")}</AvatarFallback></Avatar>
            <div>
              <p className="text-sm font-medium text-gray-100">{author.name || "No customer selected"}</p>
              <p className="text-xs text-gray-500">{author.email || "No email"}</p>
            </div>
          </div>
          <div className="space-y-3 border-t border-[#1e2d40] pt-4 text-xs">
            <ContextRow label="Plan" value="Premium" />
            <ContextRow label="Monthly Revenue" value="€249" />
            <ContextRow label="Open Tickets" value="2" />
          </div>
          <Button className="mt-5 w-full">View Full Profile</Button>
        </CardContent>
      </Card>
      <Card>
        <CardContent className="p-4">
          <p className="mb-3 text-sm font-semibold text-white">Kora Assistant</p>
          <p className="rounded-lg bg-[#0d1a2d] p-3 text-xs leading-5 text-gray-300">This looks like an access issue caused by failed login attempts.</p>
          <div className="mt-4 space-y-2">
            {["Unlock Account", "Reset Password", "Check login history"].map((action) => (
              <button key={action} className="flex w-full items-center justify-between rounded-lg border border-[#1e2d40] px-3 py-2 text-left text-xs text-gray-200 hover:bg-[#0d1a2d]">
                {action}<ChevronRight className="h-3.5 w-3.5 text-gray-500" />
              </button>
            ))}
          </div>
        </CardContent>
      </Card>
    </aside>
  );
}

function KoraAssistantPanel() {
  return (
    <Card>
      <CardContent className="p-4">
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="h-2.5 w-2.5 rounded-full bg-emerald-400" />
            <p className="text-sm font-semibold text-white">Kora Assistant</p>
            <span className="text-xs text-emerald-400">Online</span>
          </div>
          <MoreHorizontal className="h-4 w-4 text-gray-500" />
        </div>
        <div className="mb-5 flex items-center gap-4">
          <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-full border border-cyan-400 bg-cyan-500/10 shadow-[0_0_28px_rgba(34,211,238,0.35)]">
            <Bot className="h-10 w-10 text-cyan-300" />
          </div>
          <div className="rounded-lg border border-[#1e2d40] bg-[#0d1a2d] p-3 text-sm text-gray-200">
            <p>Hi Admin!</p>
            <p className="mt-1 text-gray-300">I can help troubleshoot issues and recommend articles.</p>
          </div>
        </div>
        <div className="space-y-2">
          {["My calendar is not syncing", "Customer can't log in", "How do partner commissions work?", "See more suggestions"].map((item) => (
            <button key={item} className="flex w-full items-center justify-between rounded-lg border border-[#1e2d40] bg-[#0d1a2d] px-3 py-3 text-left text-sm text-gray-200 hover:bg-[#12213a]">
              {item}<ChevronRight className="h-4 w-4 text-gray-500" />
            </button>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

function SystemStatus({ compact = false }: { compact?: boolean }) {
  return (
    <Card className="bg-[radial-gradient(circle_at_100%_50%,rgba(34,197,94,0.12),transparent_34%),#091526]">
      <CardContent className="p-4">
        <div className="mb-3 flex items-center gap-2">
          <span className="h-2.5 w-2.5 rounded-full bg-emerald-400" />
          <p className="text-sm font-semibold text-white">System Status</p>
        </div>
        <p className="flex items-center gap-2 text-xs text-gray-300">
          <CheckCircle className="h-3.5 w-3.5 text-emerald-400" />
          All systems operational
        </p>
        {!compact ? <p className="mt-1 text-xs text-gray-500">Everything is running smoothly.</p> : null}
        <button className="mt-5 inline-flex items-center gap-2 text-xs text-blue-400 hover:text-blue-300">
          View status page <ArrowRight className="h-3.5 w-3.5" />
        </button>
      </CardContent>
    </Card>
  );
}

function SupportNav({ active, icon: Icon, title, sub, disabled }: any) {
  return (
    <button
      disabled={disabled}
      className={`flex w-full items-center gap-3 rounded-lg border px-3 py-3 text-left ${
        active ? "border-blue-500 bg-blue-600/20 text-white" : "border-transparent text-gray-300"
      }`}
    >
      <Icon className={active ? "h-5 w-5 text-blue-300" : "h-5 w-5 text-gray-400"} />
      <span>
        <span className="block text-sm font-medium">{title}</span>
        <span className="block text-[11px] text-gray-500">{sub}</span>
      </span>
    </button>
  );
}

function ContextRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-gray-500">{label}</span>
      <span className="text-gray-200">{value}</span>
    </div>
  );
}

function AddArticleDialog({ open, onOpenChange }: { open: boolean; onOpenChange: (open: boolean) => void }) {
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("Account & Login");
  const [status, setStatus] = useState("draft");
  const [visibility, setVisibility] = useState("public");

  const reset = () => {
    setTitle("");
    setCategory("Account & Login");
    setStatus("draft");
    setVisibility("public");
  };

  const submit = (event: React.FormEvent) => {
    event.preventDefault();
    if (!title.trim()) {
      toast.error("Article title is required");
      return;
    }
    toast.success(status === "published" ? "Article published" : "Article draft saved");
    reset();
    onOpenChange(false);
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        if (!next) reset();
        onOpenChange(next);
      }}
    >
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Add Article</DialogTitle>
        </DialogHeader>
        <form onSubmit={submit} className="space-y-4">
          <div className="space-y-1.5">
            <Label>Title</Label>
            <Input value={title} onChange={(event) => setTitle(event.target.value)} placeholder="Article title" />
          </div>
          <div className="grid gap-3 sm:grid-cols-3">
            <div className="space-y-1.5">
              <Label>Category</Label>
              <Select value={category} onValueChange={setCategory}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {HELP_TOPICS.map((topic) => <SelectItem key={topic.title} value={topic.title}>{topic.title}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Visibility</Label>
              <Select value={visibility} onValueChange={setVisibility}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="public">Public</SelectItem>
                  <SelectItem value="admins">Admins only</SelectItem>
                  <SelectItem value="partners">Partners</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Status</Label>
              <Select value={status} onValueChange={setStatus}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="draft">Draft</SelectItem>
                  <SelectItem value="published">Published</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="space-y-1.5">
            <Label>Tags</Label>
            <Input placeholder="login, password, customer access" />
          </div>
          <div className="space-y-1.5">
            <Label>Content</Label>
            <textarea
              rows={8}
              placeholder="Write the troubleshooting guide or help article..."
              className="w-full rounded-lg border border-[#2a3547] bg-[#0d1526] px-3 py-2 text-sm text-gray-200 placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div className="flex justify-end gap-2 border-t border-[#1e2d40] pt-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
            <Button type="submit">{status === "published" ? "Publish Article" : "Save Draft"}</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
