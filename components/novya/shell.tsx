"use client";
import "@/app/kora.css";
import "@/app/live-view.css";
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator } from "@/components/ui/dropdown-menu";
import { ConnectionStatus } from "./connection-status";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import { LayoutDashboard, Sparkles, Radio, ShieldCheck, CheckSquare, Inbox, CalendarDays, Building2, Users, Activity, Workflow, Settings, Menu, X, Search, ChevronRight, ChevronLeft, ArrowUp, LogOut, UserRound } from "lucide-react";
import { Folder, FileSearch, Briefcase, Zap, Brain, BookOpen, Upload, History, MessageSquare, Network, CreditCard, UserPlus, LogIn, Clock, ChartNoAxesCombined, LockKeyhole, Palette, Plug, Database, SlidersHorizontal, Bell, Globe, type LucideIcon } from "lucide-react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { KoraRecentConversations } from "./kora-folders";
import { CreateLauncher } from "./create-launcher";
import { KoraOrb } from "./kora-orb";
import { VoiceInput } from "./voice-input";
import { novya, errorMessage } from "@/lib/novya";
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { NotificationBell } from "@/components/notification-bell";
export const navigation = [
    { label: "Overview", href: "/dashboard", icon: LayoutDashboard }, { label: "Kora", href: "/kora", icon: Sparkles },
    { label: "Live View", href: "/live-view", icon: Radio }, { label: "Approvals", href: "/approvals", icon: ShieldCheck },
    { label: "Tasks", href: "/tasks", icon: CheckSquare }, { label: "Inbox", href: "/inbox", icon: Inbox },
    { label: "Calendar", href: "/calendar", icon: CalendarDays }, { label: "Management", href: "/management", icon: Building2 },
    { label: "Team", href: "/team", icon: Users }, { label: "System Health", href: "/system-health", icon: Activity },
    { label: "Workflows", href: "/workflows", icon: Workflow },
];
export const subnavigation: Record<string, [
    string,
    string
][]> = {
    management: [["Overview", "/management"], ["Organizations", "/management/organizations"], ["Customers", "/management/customers"], ["Users", "/management/users"], ["Health & Risk", "/management/health-risk"], ["Plans & Billing", "/management/plans-billing"], ["Activity", "/management/activity"]],
    team: [["Overview", "/team"], ["Members", "/team/members"], ["Departments & Teams", "/team/departments"], ["Recruiting", "/team/recruiting"], ["On / Offboarding", "/team/onboarding"], ["Time & Absence", "/team/time-absence"], ["Performance", "/team/performance"], ["Roles & Access", "/team/roles"]],
    kora: [["New Chat", "/kora"], ["Folders", "/kora/folders"], ["Investigations", "/kora/investigations"], ["Cases", "/kora/cases"], ["Actions", "/kora/actions"], ["Kora Brain", "/kora/brain"], ["Knowledge", "/kora/knowledge"], ["Sources", "/kora/sources"], ["History", "/kora/history"]],
    "live-view": [["Overview", "/live-view"], ["All Conversations", "/live-view/conversations"], ["Channels", "/live-view/channels"], ["Organizations", "/live-view/organizations"]],
    tasks: [["My Tasks", "/tasks"], ["Team Tasks", "/tasks/team"]],
    settings: [["Overview", "/settings"], ["General", "/settings/general"], ["Company", "/settings/company"], ["Branding & Domains", "/settings/branding"], ["Roles & Access", "/settings/roles"], ["Security", "/settings/security"], ["Notifications", "/settings/notifications"], ["Integrations & API", "/settings/integrations"], ["Kora AI", "/settings/kora"], ["Data & Privacy", "/settings/data"], ["Audit & Compliance", "/settings/audit"], ["Advanced", "/settings/advanced"]],
};
const subnavIcons: Record<string, LucideIcon> = {
    "/management": LayoutDashboard, "/management/organizations": Building2, "/management/customers": Users, "/management/users": UserRound,
    "/management/health-risk": Activity, "/management/plans-billing": CreditCard, "/management/activity": History,
    "/team": LayoutDashboard, "/team/members": Users, "/team/departments": Network, "/team/recruiting": UserPlus,
    "/team/onboarding": LogIn, "/team/time-absence": CalendarDays, "/team/performance": ChartNoAxesCombined, "/team/roles": LockKeyhole,
    "/kora": MessageSquare, "/kora/folders": Folder, "/kora/investigations": FileSearch, "/kora/cases": Briefcase,
    "/kora/actions": Zap, "/kora/brain": Brain, "/kora/knowledge": BookOpen, "/kora/sources": Upload, "/kora/history": History,
    "/live-view": Radio, "/live-view/conversations": MessageSquare, "/live-view/channels": Globe, "/live-view/organizations": Building2,
    "/tasks": CheckSquare, "/tasks/team": Users,
    "/settings": LayoutDashboard, "/settings/general": Settings, "/settings/company": Building2, "/settings/branding": Palette,
    "/settings/roles": Users, "/settings/security": ShieldCheck, "/settings/notifications": Bell, "/settings/integrations": Plug,
    "/settings/kora": Sparkles, "/settings/data": Database, "/settings/audit": ShieldCheck, "/settings/advanced": SlidersHorizontal,
};
function SubnavIcon({ href }: { href: string }) { const Icon = subnavIcons[href] ?? Clock; return <Icon size={16} aria-hidden="true"/>; }
export function NovyaShell({ children }: {
    children: React.ReactNode;
}) {
    const context=useQuery({queryKey:["novya","context"],queryFn:()=>novya.get<{role:string;scope:string;environment:string}>("/context"),staleTime:60000});
    const path = usePathname();
    const router = useRouter();
    const { data: session } = useSession();
    const [mobile, setMobile] = useState(false), [chat, setChat] = useState(false), [chatMode,setChatMode]=useState<"voice"|"chat">("voice"), [prompt, setPrompt] = useState(""), [search, setSearch] = useState("");
    const root = path.split("/")[1];
    const [koraSearch, setKoraSearch] = useState(false);
    const koraSection = path.split("/")[2];
    const teamTitle = koraSection === "members" && path.split("/")[3] ? "Member Record" : subnavigation.team.find(([,href])=>href === `/team/${koraSection}`)?.[0] ?? "Team";
    const koraTitle = ["knowledge", "brain", "sources"].includes(koraSection) ? "Kora \u00b7 Brain" : koraSection && koraSection !== "conversations" ? `Kora \u00b7 ${subnavigation.kora.find(([, href]) => href === `/kora/${koraSection}`)?.[0] ?? "Kora"}` : "Kora";
    const group = ["live-view", "tasks", "inbox"].includes(root) ? undefined : subnavigation[root];
    const ask = useMutation({ mutationFn: () => novya.post<{
            conversation: {
                _id: string;
            };
        }>("/kora/chat", { message: prompt }), onSuccess: r => { setChat(false); setPrompt(""); router.push(`/kora/conversations/${r.data.conversation._id}`); } });
    const current = navigation.find(n => path === n.href || path.startsWith(n.href + "/"));
    return <div className={`nv-shell ${root === "team" ? "tm-shell" : root === "calendar" ? "cl-shell" : root === "tasks" ? "tk-shell" : root === "inbox" ? "ib-shell" : root === "kora" ? "kr-shell" : root === "live-view" ? "lv-shell" : path === "/dashboard" ? "ov-shell" : ""}`}>
    {mobile && <button className="nv-mobile-backdrop" aria-label="Close navigation" onClick={() => setMobile(false)}/>}
    <aside className={`nv-sidebar ${mobile ? "nv-sidebar-open" : ""}`}><Link className="nv-brand" href="/dashboard" onClick={() => setMobile(false)}><span className="nv-brand-mark">N</span>NOVYA</Link><button className="nv-mobile-close" aria-label="Close menu" onClick={() => setMobile(false)}><X size={20}/></button>
      {group && <Link href="/dashboard" className="nv-back-admin flex items-center gap-2" onClick={() => setMobile(false)}><ChevronLeft size={14} aria-hidden="true"/><span>Back to Admin</span></Link>}
      <nav aria-label={group ? `${root} navigation` : "Main navigation"}>{group ? group.filter(([, href]) => root !== "kora" || !["/kora/knowledge", "/kora/sources"].includes(href)).map(([label, href]) => <Link key={href} href={href} onClick={() => setMobile(false)} className={path === href || (href !== `/${root}` && path.startsWith(href + "/")) || (href === "/kora/brain" && ["knowledge", "sources"].includes(koraSection)) ? "nv-nav-active" : ""}><SubnavIcon href={href}/><span>{label}</span></Link>) : navigation.map(n => <Link key={n.href} href={n.href} onClick={() => setMobile(false)} className={current?.href === n.href ? "nv-nav-active" : ""}><n.icon size={17}/><span>{n.label}</span></Link>)}</nav>
      {root==="kora"&&<KoraRecentConversations onNavigate={()=>setMobile(false)}/>}
      <Link className={`nv-settings-link ${root === "settings" ? "nv-nav-active" : ""}`} href="/settings" onClick={() => setMobile(false)}><Settings size={17}/>Settings</Link>
      <div className="nv-sidebar-footer"><span className="nv-status-dot"/>Admin platform</div>
    </aside>
    <div className="nv-main"><header className="nv-topbar"><button className="nv-menu-button" aria-label="Open navigation" onClick={() => setMobile(true)}><Menu size={20}/></button><div className="nv-breadcrumb">{root === "kora" ? <span className="kr-topbar-title">{koraTitle}</span> : <>Admin <ChevronRight size={13}/></>}{root !== "kora" && <strong>{root === "team" ? teamTitle : root === "settings" ? "Settings" : current?.label ?? "Profile"}</strong>}</div>{root === "live-view" && <nav className="lv-top-tabs" aria-label="Live View sections">{subnavigation["live-view"].map(([label, href]) => <Link href={href} key={href} className={path === href || (href !== "/live-view" && path.startsWith(href + "/")) ? "selected" : ""}>{label === "All Conversations" ? "Conversations" : label === "Organizations" ? "All orgs" : label}</Link>)}</nav>}<form className={`nv-global-search ${root === "kora" && koraSearch ? "kr-search-open" : ""}`} onSubmit={e => { e.preventDefault(); if (search.trim())
        router.push(`/management/organizations?q=${encodeURIComponent(search.trim())}`); }}><Search size={14}/><input aria-label="Search organizations" placeholder="Search organizations..." value={search} onChange={e => setSearch(e.target.value)}/></form>{root === "kora" && <button className="kr-topbar-search" aria-label="Toggle organization search" aria-expanded={koraSearch} onClick={() => setKoraSearch(!koraSearch)}><Search size={16}/></button>}<span className="nv-scope" title={context.data?.data.role}>{context.data?.data.role??"Admin"}{ "\u00b7" } {context.data?.data.environment??"Context loading"}</span>{root !== "calendar" && <CreateLauncher ask={mode=>{setChatMode(mode);setChat(true);}}/>}<NotificationBell /><DropdownMenu modal={false}><DropdownMenuTrigger asChild><button type="button" className="nv-account-trigger" aria-label="Account menu"><span className="nv-avatar">{session?.user?.name?.slice(0, 1) ?? "A"}</span>{["kora", "live-view"].includes(root) && <><span>{session?.user?.name?.split(" ")[0] ?? "Admin"}</span><ChevronRight size={11}/></>}</button></DropdownMenuTrigger><DropdownMenuContent align="end" sideOffset={10} collisionPadding={12}><DropdownMenuLabel>{session?.user?.name ?? "Administrator"}</DropdownMenuLabel><DropdownMenuSeparator/><DropdownMenuItem asChild><Link href="/profile"><UserRound size={14}/>My profile</Link></DropdownMenuItem><DropdownMenuItem onSelect={() => signOut({ callbackUrl: "/login" })}><LogOut size={14}/>Sign out</DropdownMenuItem></DropdownMenuContent></DropdownMenu></header>
      <div className="nv-body"><main className="nv-content"><ConnectionStatus/>{children}</main></div>
    </div>
    <Dialog open={chat} onOpenChange={setChat}>
      <DialogContent overlayClassName="nv-kora-backdrop" className={`nv-dialog nv-kora-dialog ${chatMode === "chat" ? "nv-drawer" : ""}`}>
        <div className="nv-kora-dialog-header">
          <span className="nv-kora-dialog-label"><Sparkles size={14}/>NOVYA ASSISTANT</span>
          <DialogTitle>{chatMode === "chat" ? "Chat with Kora" : "Ask Kora"}</DialogTitle>
          <DialogDescription>Ask a question about your platform. Consequential actions require review.</DialogDescription>
        </div>
        <div className="nv-kora-dialog-welcome">
          <KoraOrb/>
          <h2>How can I help you today?</h2>
          <p>Investigate an issue, find insights, or prepare your next action.</p>
          {chatMode === "voice" && <VoiceInput onTranscript={setPrompt}/>}
        </div>
        <form className="nv-kora-dialog-compose" onSubmit={e => { e.preventDefault(); if (prompt.trim()) ask.mutate(); }}>
          <label htmlFor="kora-launcher-message">Your message</label>
          <textarea id="kora-launcher-message" className="nv-input" placeholder="Ask Kora about the platform..." rows={4} value={prompt} onChange={e => setPrompt(e.target.value)}/>
          {ask.error && <p className="nv-error-text" role="alert">{errorMessage(ask.error)}</p>}
          <div className="nv-kora-dialog-actions"><span>Review your message before sending.</span><button className="nv-button nv-button-primary" disabled={!prompt.trim() || ask.isPending}><ArrowUp size={16}/>{ask.isPending ? "Thinking..." : "Send message"}</button></div>
        </form>
      </DialogContent>
    </Dialog>
  </div>;
}
