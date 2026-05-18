"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard, Sparkles, Calendar, Mail, Users, UserCheck,
  MapPin, BarChart3, GitBranch, CheckSquare, Activity,
  HeadphonesIcon, Settings, LogOut, ChevronLeft, ChevronRight,
  Zap, Target
} from "lucide-react";
import { signOut, useSession } from "next-auth/react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { getInitials } from "@/lib/utils";

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/assistant", label: "Assistant", icon: Sparkles },
  { href: "/calendar", label: "Calendar", icon: Calendar },
  { href: "/inbox", label: "Inbox", icon: Mail, badge: "12" },
  { href: "/leads", label: "Leads", icon: Target, badge: "24" },
  { href: "/lead-generator", label: "Lead Generator", icon: Zap },
  { href: "/customers", label: "Customers", icon: Users },
  { href: "/partners", label: "Partners", icon: UserCheck },
  { href: "/territories", label: "Territories", icon: MapPin },
  { href: "/analytics", label: "Sales Analytics", icon: BarChart3 },
  { href: "/workflows", label: "Workflows", icon: GitBranch },
  { href: "/approvals", label: "Approvals", icon: CheckSquare, badge: "18" },
  { href: "/activity", label: "Activity", icon: Activity },
  { href: "/support", label: "Support", icon: HeadphonesIcon },
  { href: "/settings", label: "Settings", icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();
  const { data: session } = useSession();
  const [collapsed, setCollapsed] = useState(false);

  return (
    <aside
      className={cn(
        "flex flex-col h-screen bg-[#070f1c] border-r border-[#1e2d40] transition-all duration-300 z-40",
        collapsed ? "w-16" : "w-60"
      )}
    >
      {/* Logo */}
      <div className={cn("flex items-center gap-2 px-4 py-5 border-b border-[#1e2d40]", collapsed && "justify-center px-2")}>
        <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center flex-shrink-0">
          <Sparkles className="w-4 h-4 text-white" />
        </div>
        {!collapsed && (
          <div>
            <span className="font-bold text-white text-sm">KoraAI</span>
            <p className="text-[10px] text-gray-500">Admin Dashboard</p>
          </div>
        )}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className={cn("ml-auto text-gray-500 hover:text-gray-300 transition-colors", collapsed && "ml-0")}
        >
          {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </button>
      </div>

      {/* Nav */}
      <nav className="flex-1 py-3 overflow-y-auto scrollbar-none">
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = pathname === item.href || pathname.startsWith(item.href + "/");
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 mx-2 px-3 py-2.5 rounded-lg text-sm transition-all mb-0.5",
                active
                  ? "bg-blue-600/20 text-blue-400 border border-blue-600/20"
                  : "text-gray-500 hover:text-gray-200 hover:bg-[#1e2d40]",
                collapsed && "justify-center px-2"
              )}
              title={collapsed ? item.label : undefined}
            >
              <Icon className="w-4 h-4 flex-shrink-0" />
              {!collapsed && (
                <span className="flex-1 truncate">{item.label}</span>
              )}
              {!collapsed && item.badge && (
                <span className="text-[10px] bg-blue-600/30 text-blue-400 px-1.5 py-0.5 rounded-full font-semibold">
                  {item.badge}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* User */}
      <div className="border-t border-[#1e2d40] p-3">
        <div className={cn("flex items-center gap-2 rounded-lg p-2", collapsed && "justify-center")}>
          <Avatar className="w-8 h-8 flex-shrink-0">
            <AvatarFallback>{getInitials(session?.user?.name || "Admin")}</AvatarFallback>
          </Avatar>
          {!collapsed && (
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium text-gray-200 truncate">{session?.user?.name || "Admin User"}</p>
              <p className="text-[10px] text-gray-500 truncate">System Administrator</p>
            </div>
          )}
          {!collapsed && (
            <button
              onClick={() => signOut({ callbackUrl: "/login" })}
              className="text-gray-500 hover:text-red-400 transition-colors"
              title="Logout"
            >
              <LogOut className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </aside>
  );
}
