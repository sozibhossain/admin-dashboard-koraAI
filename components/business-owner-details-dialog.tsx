/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useQuery } from "@tanstack/react-query";
import { Mail, Phone, ShieldCheck, User, UserRoundX } from "lucide-react";
import { adminApi } from "@/lib/api";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { formatDate, getInitials } from "@/lib/utils";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  ownerId: string | null;
  onEdit?: () => void;
};

const getOwnerStatus = (owner: any) => {
  if (owner?.isBlocked) return "Blocked";
  if (!owner?.verificationInfo?.verified) return "Unverified";
  return "Active";
};

export function BusinessOwnerDetailsDialog({ open, onOpenChange, ownerId, onEdit }: Props) {
  const { data: owner, isLoading } = useQuery({
    queryKey: ["business-owner", ownerId],
    queryFn: () => adminApi.getUserById(String(ownerId)).then((response) => response.data?.data),
    enabled: Boolean(ownerId) && open,
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Business Owner Profile</DialogTitle>
        </DialogHeader>

        {isLoading || !owner ? (
          <div className="space-y-3">
            <Skeleton className="h-20 w-full" />
            <Skeleton className="h-40 w-full" />
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center gap-3 rounded-xl border border-[#1e2d40] bg-[#0d1526] p-4">
              <Avatar className="h-14 w-14">
                <AvatarFallback>{getInitials(owner.name || "BO")}</AvatarFallback>
              </Avatar>
              <div className="min-w-0 flex-1">
                <p className="truncate text-base font-semibold text-gray-100">
                  {owner.name || "Unnamed owner"}
                </p>
                <p className="truncate text-xs text-gray-400">{owner.email || "—"}</p>
                <span className="mt-1 inline-block rounded-full bg-[#1e2d40] px-2 py-0.5 text-[10px] uppercase text-gray-300">
                  {owner.role?.replace(/_/g, " ") || "business owner"}
                </span>
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2 rounded-xl border border-[#1e2d40] bg-[#0d1526] p-4 text-xs">
                <DetailRow icon={<Mail className="h-3.5 w-3.5 text-gray-500" />} label="Email">
                  {owner.email || "—"}
                </DetailRow>
                <DetailRow icon={<Phone className="h-3.5 w-3.5 text-gray-500" />} label="Phone">
                  {owner.phoneNumber || "—"}
                </DetailRow>
                <DetailRow icon={<User className="h-3.5 w-3.5 text-gray-500" />} label="Joined">
                  {owner.createdAt ? formatDate(owner.createdAt) : "—"}
                </DetailRow>
              </div>

              <div className="space-y-2 rounded-xl border border-[#1e2d40] bg-[#0d1526] p-4 text-xs">
                <DetailRow
                  icon={<ShieldCheck className="h-3.5 w-3.5 text-gray-500" />}
                  label="Verification"
                >
                  {owner.verificationInfo?.verified ? "Verified" : "Pending"}
                </DetailRow>
                <DetailRow
                  icon={<UserRoundX className="h-3.5 w-3.5 text-gray-500" />}
                  label="Status"
                >
                  {getOwnerStatus(owner)}
                </DetailRow>
                <DetailRow icon={<User className="h-3.5 w-3.5 text-gray-500" />} label="Source">
                  {owner.addedBy ? "Sales partner" : "Direct signup"}
                </DetailRow>
              </div>
            </div>
          </div>
        )}

        <div className="mt-2 flex justify-end gap-2 border-t border-[#1e2d40] pt-3">
          {onEdit ? (
            <Button variant="outline" onClick={onEdit}>
              Edit
            </Button>
          ) : null}
          <Button onClick={() => onOpenChange(false)}>Close</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function DetailRow({
  icon,
  label,
  children,
}: {
  icon: React.ReactNode;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-center justify-between gap-3 border-b border-[#1e2d40] py-1.5 last:border-0">
      <span className="flex items-center gap-1.5 text-gray-500">
        {icon}
        {label}
      </span>
      <span className="text-right text-gray-200">{children}</span>
    </div>
  );
}
