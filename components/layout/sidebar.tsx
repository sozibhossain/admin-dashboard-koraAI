"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard, Sparkles, Calendar, Mail, Users, UserCheck,
  MapPin, BarChart3, GitBranch, CheckSquare, Activity,
  HeadphonesIcon, Settings, LogOut, ChevronLeft, ChevronRight,
  X, Zap, Target, Scissors, CreditCard
} from "lucide-react";
import { signOut, useSession } from "next-auth/react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { getInitials } from "@/lib/utils";
import { useMobileNav } from "@/components/layout/mobile-nav-context";
import { approvalsApi, inboxApi, leadsApi, userApi } from "@/lib/api";
import { useSocketEvent } from "@/lib/socket";

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/assistant", label: "Assistant", icon: Sparkles },
  { href: "/calendar", label: "Calendar", icon: Calendar },
  { href: "/inbox", label: "Inbox", icon: Mail, badgeKey: "inbox" as const },
  { href: "/leads", label: "Leads", icon: Target, badgeKey: "leads" as const },
  { href: "/lead-generator", label: "Lead Generator", icon: Zap },
  { href: "/customers", label: "Bussinesses Owners", icon: Users },
  { href: "/services", label: "Services", icon: Scissors },
  { href: "/partners", label: "Partners", icon: UserCheck },
  { href: "/territories", label: "Territories", icon: MapPin },
  { href: "/analytics", label: "Sales Analytics", icon: BarChart3 },
  { href: "/workflows", label: "Workflows", icon: GitBranch },
  { href: "/subscription", label: "Subscription", icon: CreditCard },
  { href: "/approvals", label: "Approvals", icon: CheckSquare, badgeKey: "approvals" as const },
  { href: "/activity", label: "Activity", icon: Activity },
  { href: "/support", label: "Support", icon: HeadphonesIcon },
  { href: "/settings", label: "Settings", icon: Settings },
];

function formatBadge(count: number | undefined) {
  if (!count || count <= 0) return null;
  return count > 99 ? "99+" : String(count);
}

export function Sidebar() {
  const pathname = usePathname();
  const { data: session } = useSession();
  const { isOpen, setIsOpen } = useMobileNav();
  const [collapsed, setCollapsed] = useState(false);

  const { data: profileResponse } = useQuery({
    queryKey: ["user-profile"],
    queryFn: () => userApi.getProfile().then((r) => r.data),
    staleTime: 5 * 60 * 1000,
  });

  const profileData = profileResponse?.data;
  const sessionUser = session?.user as
    | { name?: string; role?: string; profileImage?: { url?: string } }
    | undefined;

  const displayName = profileData?.name || sessionUser?.name || "Admin User";
  const displayImage = profileData?.profileImage?.url || sessionUser?.profileImage?.url || "";
  const displayRole = profileData?.role || sessionUser?.role || "admin";
  const roleLabel =
    displayRole === "admin"
      ? "System Administrator"
      : String(displayRole).replace(/_/g, " ");

  useEffect(() => {
    setIsOpen(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname]);

  const { data: inboxData, refetch: refetchInbox } = useQuery({
    queryKey: ["sidebar-inbox-summary"],
    queryFn: () => inboxApi.getChats().then((response) => response.data),
    refetchInterval: 60000,
    refetchOnWindowFocus: true,
  });

  const { data: leadsData } = useQuery({
    queryKey: ["sidebar-leads-new"],
    queryFn: () =>
      leadsApi.getAll({ status: "new", limit: 1 }).then((response) => response.data),
    refetchInterval: 120000,
    refetchOnWindowFocus: true,
  });

  const { data: approvalsData } = useQuery({
    queryKey: ["sidebar-approvals-pending"],
    queryFn: () =>
      approvalsApi.getAll({ limit: 1 }).then((response) => response.data),
    refetchInterval: 120000,
    refetchOnWindowFocus: true,
  });

  useSocketEvent("inbox:new-message", () => refetchInbox());
  useSocketEvent("inbox:read", () => refetchInbox());

  const inboxUnread: number = inboxData?.meta?.summary?.unreadTotal ?? 0;
  const newLeads: number = leadsData?.meta?.total ?? 0;
  const pendingApprovals: number = approvalsData?.meta?.total ?? 0;

  const badgeFor = (key?: "inbox" | "leads" | "approvals") => {
    if (key === "inbox") return formatBadge(inboxUnread);
    if (key === "leads") return formatBadge(newLeads);
    if (key === "approvals") return formatBadge(pendingApprovals);
    return null;
  };

  return (
    <>
      {isOpen ? (
        <div
          className="fixed inset-0 z-40 bg-black/60 lg:hidden"
          onClick={() => setIsOpen(false)}
          aria-hidden
        />
      ) : null}

      <aside
        className={cn(
          "z-50 flex h-screen flex-col border-r border-[#1e2d40] bg-[#070f1c] transition-[transform,width] duration-300",
          collapsed ? "w-16" : "w-60",
          "fixed inset-y-0 left-0 lg:relative lg:translate-x-0",
          isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        )}
      >
        <div className={cn("flex items-center gap-2 border-b border-[#1e2d40] px-4 py-5", collapsed && "justify-center px-2")}>
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-blue-600">
            <Sparkles className="h-4 w-4 text-white" />
          </div>
          {!collapsed && (
            <div>
              <span className="text-sm font-bold text-white">KoraAI</span>
              <p className="text-[10px] text-gray-500">Admin Dashboard</p>
            </div>
          )}
          <button
            onClick={() => setIsOpen(false)}
            className={cn("ml-auto text-gray-500 hover:text-gray-300 lg:hidden", collapsed && "ml-0")}
            aria-label="Close menu"
          >
            <X className="h-4 w-4" />
          </button>
          <button
            onClick={() => setCollapsed(!collapsed)}
            className={cn("ml-auto hidden text-gray-500 transition-colors hover:text-gray-300 lg:inline-flex", collapsed && "ml-0")}
            aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
          </button>
        </div>

        <nav className="scrollbar-none flex-1 overflow-y-auto py-3">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = pathname === item.href || pathname.startsWith(item.href + "/");
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "mx-2 mb-0.5 flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-all",
                  active
                    ? "border border-blue-600/20 bg-blue-600/20 text-blue-400"
                    : "text-gray-500 hover:bg-[#1e2d40] hover:text-gray-200",
                  collapsed && "justify-center px-2"
                )}
                title={collapsed ? item.label : undefined}
              >
                <Icon className="h-4 w-4 shrink-0" />
                {!collapsed && <span className="flex-1 truncate">{item.label}</span>}
                {!collapsed && badgeFor("badgeKey" in item ? item.badgeKey : undefined) && (
                  <span className="rounded-full bg-blue-600/30 px-1.5 py-0.5 text-[10px] font-semibold text-blue-400">
                    {badgeFor("badgeKey" in item ? item.badgeKey : undefined)}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        <div className="border-t border-[#1e2d40] p-3">
          <div className={cn("flex items-center gap-2 rounded-lg p-2", collapsed && "justify-center")}>
            <Avatar className="h-8 w-8 shrink-0">
              {displayImage ? (
                <AvatarImage src={displayImage} alt={displayName} />
              ) : null}
              <AvatarFallback>{getInitials(displayName)}</AvatarFallback>
            </Avatar>
            {!collapsed && (
              <div className="min-w-0 flex-1">
                <p className="truncate text-xs font-medium text-gray-200">{displayName}</p>
                <p className="truncate text-[10px] capitalize text-gray-500">{roleLabel}</p>
              </div>
            )}
            {!collapsed && (
              <button
                onClick={() => signOut({ callbackUrl: "/login" })}
                className="text-gray-500 transition-colors hover:text-red-400"
                title="Logout"
              >
                <LogOut className="h-4 w-4" />
              </button>
            )}
          </div>
        </div>
      </aside>
    </>
  );
}
