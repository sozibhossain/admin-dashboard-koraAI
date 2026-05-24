/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { customersApi } from "@/lib/api";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { formatCurrency, formatDate, getInitials, timeAgo } from "@/lib/utils";
import { Calendar, DollarSign, Mail, Phone, Tag, User } from "lucide-react";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  customerId: string | null;
  onEdit?: () => void;
};

export function CustomerDetailsDialog({ open, onOpenChange, customerId, onEdit }: Props) {
  const { data: customerResponse, isLoading: customerLoading } = useQuery({
    queryKey: ["customer", customerId],
    queryFn: () =>
      customersApi.getById(String(customerId)).then((response) => response.data?.data),
    enabled: Boolean(customerId) && open,
  });

  const { data: historyResponse, isLoading: historyLoading } = useQuery({
    queryKey: ["customer-history", customerId],
    queryFn: () =>
      customersApi.getHistory(String(customerId)).then((response) => response.data?.data),
    enabled: Boolean(customerId) && open,
  });

  const customer: any = customerResponse;
  const appointments: any[] = useMemo(
    () => historyResponse?.appointments?.items || [],
    [historyResponse]
  );
  const invoices: any[] = useMemo(
    () => historyResponse?.invoices?.items || [],
    [historyResponse]
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>Customer Details</DialogTitle>
        </DialogHeader>

        {customerLoading || !customer ? (
          <div className="space-y-3">
            <Skeleton className="h-20 w-full" />
            <Skeleton className="h-40 w-full" />
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="space-y-4">
              <div className="flex items-center gap-3 rounded-xl border border-[#1e2d40] bg-[#0d1526] p-4">
                <Avatar className="h-14 w-14">
                  <AvatarFallback>{getInitials(customer.name)}</AvatarFallback>
                </Avatar>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-base font-semibold text-gray-100">
                    {customer.name}
                  </p>
                  <span className="mt-0.5 inline-block rounded-full bg-[#1e2d40] px-2 py-0.5 text-[10px] uppercase text-gray-300">
                    {customer.status || "active"}
                  </span>
                </div>
              </div>

              <div className="space-y-2 rounded-xl border border-[#1e2d40] bg-[#0d1526] p-4 text-xs">
                <DetailRow icon={<Mail className="h-3.5 w-3.5 text-gray-500" />} label="Email">
                  {customer.email || "—"}
                </DetailRow>
                <DetailRow icon={<Phone className="h-3.5 w-3.5 text-gray-500" />} label="Phone">
                  {customer.phone || "—"}
                </DetailRow>
                <DetailRow icon={<DollarSign className="h-3.5 w-3.5 text-gray-500" />} label="Total spend">
                  {formatCurrency(customer.totalSpend || 0)}
                </DetailRow>
                <DetailRow icon={<Calendar className="h-3.5 w-3.5 text-gray-500" />} label="Last appointment">
                  {customer.lastAppointment
                    ? `${formatDate(customer.lastAppointment)} (${timeAgo(customer.lastAppointment)})`
                    : "—"}
                </DetailRow>
                <DetailRow icon={<User className="h-3.5 w-3.5 text-gray-500" />} label="Customer since">
                  {customer.createdAt ? formatDate(customer.createdAt) : "—"}
                </DetailRow>
              </div>

              {customer.tags?.length > 0 ? (
                <div className="space-y-1.5">
                  <p className="flex items-center gap-1.5 text-[11px] uppercase tracking-wide text-gray-500">
                    <Tag className="h-3 w-3" />
                    Tags
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {customer.tags.map((tag: string) => (
                      <span
                        key={tag}
                        className="rounded-full bg-blue-600/20 px-2 py-0.5 text-[11px] text-blue-300"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              ) : null}

              {customer.notes ? (
                <div className="space-y-1.5">
                  <p className="text-[11px] uppercase tracking-wide text-gray-500">Notes</p>
                  <div className="whitespace-pre-wrap rounded-lg border border-[#1e2d40] bg-[#0d1526] px-3 py-2 text-xs text-gray-200">
                    {customer.notes}
                  </div>
                </div>
              ) : null}
            </div>

            <div className="space-y-4">
              <div>
                <p className="mb-2 text-xs font-medium text-gray-300">Recent Appointments</p>
                <div className="space-y-1 rounded-xl border border-[#1e2d40] bg-[#0d1526] p-3">
                  {historyLoading ? (
                    <Skeleton className="h-10 w-full" />
                  ) : appointments.length === 0 ? (
                    <p className="text-xs text-gray-500">No appointments yet.</p>
                  ) : (
                    appointments.slice(0, 6).map((appointment: any) => (
                      <div
                        key={appointment._id}
                        className="flex items-center justify-between border-b border-[#1e2d40] py-1.5 text-xs last:border-0"
                      >
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-gray-200">
                            {appointment.service || appointment.title || "Appointment"}
                          </p>
                          <p className="text-[10px] text-gray-500">
                            {appointment.appointmentDate
                              ? formatDate(appointment.appointmentDate)
                              : ""}
                          </p>
                        </div>
                        <span
                          className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] ${
                            appointment.status === "completed"
                              ? "bg-emerald-600/20 text-emerald-400"
                              : appointment.status === "cancelled"
                              ? "bg-red-600/20 text-red-400"
                              : "bg-blue-600/20 text-blue-400"
                          }`}
                        >
                          {appointment.status || "upcoming"}
                        </span>
                      </div>
                    ))
                  )}
                </div>
              </div>

              <div>
                <p className="mb-2 text-xs font-medium text-gray-300">Recent Invoices</p>
                <div className="space-y-1 rounded-xl border border-[#1e2d40] bg-[#0d1526] p-3">
                  {historyLoading ? (
                    <Skeleton className="h-10 w-full" />
                  ) : invoices.length === 0 ? (
                    <p className="text-xs text-gray-500">No invoices yet.</p>
                  ) : (
                    invoices.slice(0, 6).map((invoice: any) => (
                      <div
                        key={invoice._id}
                        className="flex items-center justify-between border-b border-[#1e2d40] py-1.5 text-xs last:border-0"
                      >
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-gray-200">
                            {invoice.invoiceNumber || invoice._id?.slice(-6)}
                          </p>
                          <p className="text-[10px] text-gray-500">
                            {invoice.createdAt ? formatDate(invoice.createdAt) : ""}
                          </p>
                        </div>
                        <span className="text-xs text-gray-200">
                          {formatCurrency(invoice.amount || invoice.total || 0)}
                        </span>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="mt-2 flex flex-wrap justify-end gap-2 border-t border-[#1e2d40] pt-3">
          {onEdit ? (
            <Button variant="outline" onClick={onEdit}>
              Edit Customer
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
