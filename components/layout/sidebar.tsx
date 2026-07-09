"use client";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard, Sparkles, Calendar, Mail, Users, UserCheck,
  MapPin, BarChart3, GitBranch,
  HeadphonesIcon, Settings, LogOut, ChevronLeft, ChevronRight,
  X, Zap, Target
} from "lucide-react";
import { signOut } from "next-auth/react";
import { useMobileNav } from "@/components/layout/mobile-nav-context";
import { inboxApi, leadsApi } from "@/lib/api";
import { useSocketEvent } from "@/lib/socket";

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/assistant", label: "Assistant", icon: Sparkles },
  { href: "/calendar", label: "Calendar", icon: Calendar },
  { href: "/inbox", label: "Inbox", icon: Mail, badgeKey: "inbox" as const },
  { href: "/leads", label: "Leads", icon: Target, badgeKey: "leads" as const },
  { href: "/lead-generator", label: "Lead Generator", icon: Zap },
  { href: "/customers", label: "Customers", icon: Users },
  { href: "/partners", label: "Partners", icon: UserCheck },
  { href: "/territories", label: "Territories", icon: MapPin },
  { href: "/analytics", label: "Sales Analytics", icon: BarChart3 },
  { href: "/workflows", label: "Workflows", icon: GitBranch },
  { href: "/support", label: "Support", icon: HeadphonesIcon },
  { href: "/settings", label: "Settings", icon: Settings },
];

function formatBadge(count: number | undefined) {
  if (!count || count <= 0) return null;
  return count > 99 ? "99+" : String(count);
}

export function Sidebar() {
  const pathname = usePathname();
  const { isOpen, setIsOpen } = useMobileNav();
  const [collapsed, setCollapsed] = useState(false);

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

  useSocketEvent("inbox:new-message", () => refetchInbox());
  useSocketEvent("inbox:read", () => refetchInbox());

  const inboxUnread: number = inboxData?.meta?.summary?.unreadTotal ?? 0;
  const newLeads: number = leadsData?.meta?.total ?? 0;

  const badgeFor = (key?: "inbox" | "leads") => {
    if (key === "inbox") return formatBadge(inboxUnread);
    if (key === "leads") return formatBadge(newLeads);
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
          "z-50 flex h-dvh flex-col border-r border-[#14304c] bg-[#061326] transition-[transform,width] duration-300",
          collapsed ? "w-16" : "w-[264px]",
          "fixed inset-y-0 left-0 lg:relative lg:translate-x-0",
          isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        )}
      >
        <div className={cn("flex items-center gap-3 px-6 py-[clamp(0.75rem,2.4dvh,1.5rem)]", collapsed && "justify-center px-2")}>
          <div className="relative flex h-[clamp(2rem,4dvh,2.5rem)] w-[clamp(2rem,4dvh,2.5rem)] shrink-0 items-center justify-center overflow-hidden rounded-xl bg-[#071321] shadow-[0_0_18px_rgba(0,183,255,0.35)] ring-1 ring-cyan-400/25">
            <Image
              src="/kora-logo.png"
              alt="KoraAI"
              width={40}
              height={40}
              className="h-full w-full object-cover"
              priority
            />
          </div>
          {!collapsed && (
            <div>
              <span className="text-[clamp(1.1rem,2.6dvh,1.75rem)] font-semibold leading-none text-white">KoraAI</span>
              <p className="mt-1 text-[14px] text-[#a8b5c6]">Admin Dashboard</p>
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
            className={cn("ml-auto hidden h-8 w-8 items-center justify-center rounded-full border border-[#14304c] text-[#8fa0b6] transition-colors hover:text-gray-300 lg:inline-flex", collapsed && "ml-0")}
            aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
          </button>
        </div>

        <nav className="scrollbar-none min-h-0 flex-1 overflow-y-auto px-3 py-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = pathname === item.href || pathname.startsWith(item.href + "/");
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "mx-2 mb-0.5 flex items-center gap-3 rounded-lg px-3 py-[clamp(0.45rem,1.25dvh,0.625rem)] text-[clamp(0.75rem,1.45dvh,0.875rem)] transition-all",
                  active
                    ? "border border-[#126dff] bg-[#07337a] text-[#d9ecff] shadow-[inset_0_0_24px_rgba(17,104,255,0.22)]"
                    : "text-[#c4ccda] hover:bg-[#0b1e36] hover:text-gray-100",
                  collapsed && "justify-center px-2"
                )}
                title={collapsed ? item.label : undefined}
              >
                <Icon className="h-[clamp(1rem,2.2dvh,1.5rem)] w-[clamp(1rem,2.2dvh,1.5rem)] shrink-0" />
                {!collapsed && <span className="flex-1 truncate text-[clamp(0.82rem,1.55dvh,1rem)]">{item.label}</span>}
                {!collapsed && badgeFor("badgeKey" in item ? item.badgeKey : undefined) && (
                  <span className="rounded-full bg-blue-600/30 px-1.5 py-0.5 text-[10px] font-semibold text-blue-400">
                    {badgeFor("badgeKey" in item ? item.badgeKey : undefined)}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        <div className="p-[clamp(0.75rem,2.4dvh,1.5rem)]">
          <button
            onClick={() => signOut({ callbackUrl: "/login" })}
            className={cn(
              "flex items-center gap-4 rounded-lg text-[#c7d0df] transition-colors hover:text-red-300",
              collapsed && "justify-center"
            )}
            title="Logout"
          >
            <LogOut className="h-6 w-6" />
            {!collapsed && <span className="text-[clamp(0.82rem,1.55dvh,1rem)]">Logout</span>}
          </button>
        </div>
      </aside>
    </>
  );
}
