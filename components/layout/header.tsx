"use client";
import { Menu, Search } from "lucide-react";
import { signOut, useSession } from "next-auth/react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { getInitials } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import Link from "next/link";
import { useMobileNav } from "@/components/layout/mobile-nav-context";
import { NotificationBell } from "@/components/notification-bell";

interface HeaderProps {
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
}

export function Header({ title, subtitle, action }: HeaderProps) {
  const { data: session } = useSession();
  const { setIsOpen } = useMobileNav();

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center gap-2 border-b border-[#1e2d40] bg-[#070f1c] px-3 sm:gap-4 sm:px-6">
      {/* Hamburger (mobile only) */}
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className="-ml-1 rounded-lg p-2 text-gray-300 hover:bg-[#1e2d40] lg:hidden"
        aria-label="Open menu"
      >
        <Menu className="h-5 w-5" />
      </button>

      {/* Title */}
      <div className="min-w-0 flex-1">
        <h1 className="truncate text-base font-semibold text-white sm:text-lg">{title}</h1>
        {subtitle ? (
          <p className="hidden truncate text-xs text-gray-500 sm:block">{subtitle}</p>
        ) : null}
      </div>

      {action ? <div className="shrink-0">{action}</div> : null}

      {/* Search — tablet+ */}
      <div className="hidden w-48 items-center md:flex">
        <div className="relative w-full">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" />
          <Input
            placeholder="Search anything..."
            className="h-8 border-[#1e2d40] bg-[#0d1526] pl-9 text-xs"
          />
          <kbd className="absolute right-2 top-1/2 hidden -translate-y-1/2 items-center gap-1 rounded border border-[#2a3547] px-1.5 py-0.5 text-[10px] text-gray-500 sm:inline-flex">
            ⌘K
          </kbd>
        </div>
      </div>

      {/* Notifications */}
      <NotificationBell />

      {/* User menu */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button className="flex shrink-0 items-center gap-2 rounded-lg px-2 py-1.5 transition-colors hover:bg-[#1e2d40]">
            <Avatar className="h-8 w-8">
              <AvatarFallback className="text-xs">
                {getInitials(session?.user?.name || "Admin")}
              </AvatarFallback>
            </Avatar>
            <div className="hidden text-left sm:block">
              <p className="max-w-[100px] truncate text-xs font-medium text-gray-200">
                {session?.user?.name || "Admin User"}
              </p>
              <p className="text-[10px] text-gray-500">System Administrator</p>
            </div>
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-48">
          <DropdownMenuLabel>My Account</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem asChild>
            <Link href="/settings">Profile</Link>
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
            <Link href="/settings">Subscription</Link>
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            className="text-red-400 focus:text-red-400"
            onClick={() => signOut({ callbackUrl: "/login" })}
          >
            Logout
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </header>
  );
}
