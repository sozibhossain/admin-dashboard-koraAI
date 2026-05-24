/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useQuery } from "@tanstack/react-query";
import { partnersApi } from "@/lib/api";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { formatCurrency, formatDate, getInitials } from "@/lib/utils";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  partnerId: string | null;
  onEdit?: () => void;
};

export function PartnerDetailsDialog({ open, onOpenChange, partnerId, onEdit }: Props) {
  const { data: partnerResponse, isLoading } = useQuery({
    queryKey: ["partner-detail", partnerId],
    queryFn: () =>
      partnersApi.getById(String(partnerId)).then((response) => response.data?.data),
    enabled: Boolean(partnerId) && open,
  });

  const { data: perfResponse } = useQuery({
    queryKey: ["partner-perf", partnerId],
    queryFn: () =>
      partnersApi.getPerformance(String(partnerId)).then((response) => response.data?.data),
    enabled: Boolean(partnerId) && open,
  });

  const partner: any = partnerResponse;
  const perf: any = perfResponse;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>Partner Details</DialogTitle>
        </DialogHeader>

        {isLoading || !partner ? (
          <div className="space-y-3">
            <Skeleton className="h-20 w-full" />
            <Skeleton className="h-40 w-full" />
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="space-y-3">
              <div className="flex items-center gap-3 rounded-xl border border-[#1e2d40] bg-[#0d1526] p-4">
                <Avatar className="h-14 w-14">
                  {partner.userId?.profileImage?.url ? (
                    <AvatarImage src={partner.userId.profileImage.url} alt={partner.userId?.name} />
                  ) : (
                    <AvatarFallback>{getInitials(partner.userId?.name || partner.businessName || "P")}</AvatarFallback>
                  )}
                </Avatar>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-base font-semibold text-gray-100">
                    {partner.userId?.name || "—"}
                  </p>
                  <p className="truncate text-xs text-gray-400">
                    {partner.businessName}
                  </p>
                  <p className="truncate text-[11px] text-gray-500">
                    {partner.userId?.email}
                  </p>
                </div>
              </div>

              <div className="space-y-2 rounded-xl border border-[#1e2d40] bg-[#0d1526] p-3 text-xs">
                <Row label="Tier">
                  <span className="rounded-full bg-blue-600/20 px-2 py-0.5 text-blue-300">
                    {partner.tier}
                  </span>
                </Row>
                <Row label="Status">
                  <span
                    className={`rounded-full px-2 py-0.5 ${
                      partner.status === "active"
                        ? "bg-emerald-600/20 text-emerald-400"
                        : partner.status === "suspended"
                        ? "bg-red-600/20 text-red-400"
                        : "bg-gray-600/20 text-gray-300"
                    }`}
                  >
                    {partner.status}
                  </span>
                </Row>
                <Row label="Commission rate">{partner.commissionRate}%</Row>
                <Row label="Territory">{partner.territory_id?.name || "Unassigned"}</Row>
                <Row label="Phone">{partner.userId?.phoneNumber || "—"}</Row>
                <Row label="Joined">
                  {partner.userId?.createdAt
                    ? formatDate(partner.userId.createdAt)
                    : "—"}
                </Row>
                <Row label="Created by">
                  {partner.created_by_admin_id?.name || "—"}
                </Row>
              </div>
            </div>

            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-2">
                <StatTile label="Total Customers" value={partner.stats?.totalCustomers ?? 0} />
                <StatTile label="Total Leads" value={partner.stats?.totalLeads ?? 0} />
                <StatTile label="Won Deals" value={partner.stats?.totalDeals ?? 0} />
                <StatTile
                  label="Total Earnings"
                  value={formatCurrency(partner.stats?.totalEarnings || 0)}
                />
              </div>

              {perf ? (
                <div className="space-y-2 rounded-xl border border-[#1e2d40] bg-[#0d1526] p-3 text-xs">
                  <p className="mb-1 text-[11px] uppercase tracking-wide text-gray-500">
                    This month
                  </p>
                  <Row label="Commissions">
                    {formatCurrency(perf.monthlyPerformance?.commissions || 0)}
                  </Row>
                  <Row label="Deals closed">{perf.monthlyPerformance?.dealsClosed || 0}</Row>
                  <Row label="Growth">
                    <span
                      className={
                        (perf.monthlyPerformance?.earningsGrowth || 0) >= 0
                          ? "text-emerald-400"
                          : "text-red-400"
                      }
                    >
                      {perf.monthlyPerformance?.earningsGrowth || 0}%
                    </span>
                  </Row>
                </div>
              ) : null}

              {perf?.topCustomers?.length ? (
                <div>
                  <p className="mb-2 text-xs font-medium text-gray-300">Top Customers</p>
                  <div className="space-y-1 rounded-xl border border-[#1e2d40] bg-[#0d1526] p-3">
                    {perf.topCustomers.map((customer: any) => (
                      <div
                        key={customer._id}
                        className="flex items-center justify-between border-b border-[#1e2d40] py-1.5 text-xs last:border-0"
                      >
                        <span className="truncate text-gray-200">{customer.name}</span>
                        <span className="shrink-0 text-gray-400">
                          {formatCurrency(customer.totalSpend || 0)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              ) : null}
            </div>
          </div>
        )}

        <div className="mt-2 flex justify-end gap-2 border-t border-[#1e2d40] pt-3">
          {onEdit ? (
            <Button variant="outline" onClick={onEdit}>
              Edit Partner
            </Button>
          ) : null}
          <Button onClick={() => onOpenChange(false)}>Close</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-3 border-b border-[#1e2d40] py-1.5 last:border-0">
      <span className="text-gray-500">{label}</span>
      <span className="text-right text-gray-200">{children}</span>
    </div>
  );
}

function StatTile({ label, value }: { label: string; value: any }) {
  return (
    <div className="rounded-xl border border-[#1e2d40] bg-[#0d1526] p-3">
      <p className="text-lg font-bold text-white">{value}</p>
      <p className="text-[10px] text-gray-400">{label}</p>
    </div>
  );
}
