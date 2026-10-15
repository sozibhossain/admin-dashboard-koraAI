"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { novya, errorMessage } from "@/lib/novya";
import { Panel, QueryState } from "./primitives";

export function AdminAccess({ children, personalAccount }: { children: ReactNode; personalAccount: boolean }) {
  const context = useQuery({
    queryKey: ["novya", "context"],
    queryFn: () => novya.get("/context"),
    staleTime: 60_000,
    retry: (count, error) => {
      const status = (error as { response?: { status?: number } }).response?.status;
      return status !== 401 && status !== 403 && count < 2;
    },
  });
  if (personalAccount) return children;
  if (context.isPending) return <QueryState loading />;
  if (context.isError) {
    const denied = (context.error as { response?: { status?: number } }).response?.status === 403;
    return <Panel title={denied ? "Administrator access is not configured" : "Unable to verify administrator access"}>
      <p className="text-sm text-slate-300" role="alert">{denied
        ? "You are signed in. This account does not currently have the staff permissions required for platform administration. An authorized administrator must configure access before these pages can load."
        : errorMessage(context.error)}</p>
      <div className="nv-form-footer"><button type="button" className="nv-button" onClick={() => context.refetch()}>Check access again</button><Link className="nv-button" href="/profile">My account</Link></div>
    </Panel>;
  }
  return children;
}
