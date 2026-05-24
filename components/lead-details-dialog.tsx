/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { leadsApi } from "@/lib/api";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { formatCurrency, formatDate } from "@/lib/utils";
import { Mail, MapPin, Phone, Star, UserCheck } from "lucide-react";

const STATUS_OPTIONS = [
  "new",
  "contacted",
  "qualified",
  "proposal",
  "won",
  "lost",
];

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  leadId: string | null;
  onEdit?: () => void;
};

export function LeadDetailsDialog({ open, onOpenChange, leadId, onEdit }: Props) {
  const queryClient = useQueryClient();

  const { data: leadResponse, isLoading } = useQuery({
    queryKey: ["lead-detail", leadId],
    queryFn: () =>
      leadsApi.getById(String(leadId)).then((response) => response.data?.data),
    enabled: Boolean(leadId) && open,
  });

  const lead: any = leadResponse;

  const statusMutation = useMutation({
    mutationFn: (status: string) =>
      leadsApi.changeStatus(String(leadId), { status }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["lead-detail", leadId] });
      queryClient.invalidateQueries({ queryKey: ["leads"] });
      toast.success("Status updated");
    },
    onError: (error: any) =>
      toast.error(error?.response?.data?.message || "Failed to update status"),
  });

  const convertMutation = useMutation({
    mutationFn: () => leadsApi.convertToCustomer(String(leadId)),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["lead-detail", leadId] });
      queryClient.invalidateQueries({ queryKey: ["leads"] });
      queryClient.invalidateQueries({ queryKey: ["customers"] });
      toast.success("Lead converted to customer");
    },
    onError: (error: any) =>
      toast.error(error?.response?.data?.message || "Failed to convert lead"),
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Lead Details</DialogTitle>
        </DialogHeader>

        {isLoading || !lead ? (
          <Skeleton className="h-40 w-full" />
        ) : (
          <div className="space-y-4">
            <div className="rounded-xl border border-[#1e2d40] bg-[#0d1526] p-4">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-base font-semibold text-gray-100">{lead.name}</p>
                  <p className="text-xs text-gray-400">{lead.company || "—"}</p>
                </div>
                <div className="flex items-center gap-1 text-xs text-amber-400">
                  <Star className="h-3 w-3 fill-amber-400" />
                  {lead.score || 0}
                </div>
              </div>
              <div className="mt-3 grid grid-cols-2 gap-3 text-xs">
                <Row icon={<Mail className="h-3 w-3 text-gray-500" />} label="Email">
                  {lead.email || "—"}
                </Row>
                <Row icon={<Phone className="h-3 w-3 text-gray-500" />} label="Phone">
                  {lead.phone || "—"}
                </Row>
                <Row icon={<MapPin className="h-3 w-3 text-gray-500" />} label="Address">
                  {lead.address || "—"}
                </Row>
                <Row icon={<UserCheck className="h-3 w-3 text-gray-500" />} label="Owner">
                  {lead.owner_id?.name || "—"}
                </Row>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <Card label="Source">{lead.source || "—"}</Card>
              <Card label="Territory">{lead.territory_id?.name || "—"}</Card>
              <Card label="Estimated value">
                {formatCurrency(lead.estimatedValue || 0)}
              </Card>
              <Card label="Created">{lead.createdAt ? formatDate(lead.createdAt) : "—"}</Card>
            </div>

            <div className="rounded-xl border border-[#1e2d40] bg-[#0d1526] p-3">
              <p className="mb-2 text-[11px] uppercase tracking-wide text-gray-500">
                Status
              </p>
              <Select
                value={lead.status}
                onValueChange={(value) => statusMutation.mutate(value)}
                disabled={statusMutation.isPending}
              >
                <SelectTrigger className="h-9 w-44 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {STATUS_OPTIONS.map((option) => (
                    <SelectItem key={option} value={option}>
                      {option}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {lead.notes ? (
              <div>
                <p className="mb-1 text-[11px] uppercase tracking-wide text-gray-500">Notes</p>
                <div className="whitespace-pre-wrap rounded-lg border border-[#1e2d40] bg-[#0d1526] p-3 text-xs text-gray-200">
                  {lead.notes}
                </div>
              </div>
            ) : null}

            {lead.converted_to_customer_id ? (
              <div className="rounded-lg border border-emerald-600/30 bg-emerald-600/10 p-3 text-xs text-emerald-300">
                Converted to customer:{" "}
                {lead.converted_to_customer_id?.name || lead.converted_to_customer_id}
              </div>
            ) : null}
          </div>
        )}

        <div className="mt-2 flex flex-wrap justify-end gap-2 border-t border-[#1e2d40] pt-3">
          {lead && !lead.converted_to_customer_id &&
          (lead.status === "won" || lead.status === "qualified") ? (
            <Button
              variant="outline"
              onClick={() => convertMutation.mutate()}
              disabled={convertMutation.isPending}
            >
              {convertMutation.isPending ? "Converting..." : "Convert to Customer"}
            </Button>
          ) : null}
          {onEdit ? (
            <Button variant="outline" onClick={onEdit}>
              Edit Lead
            </Button>
          ) : null}
          <Button onClick={() => onOpenChange(false)}>Close</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function Row({
  icon,
  label,
  children,
}: {
  icon: React.ReactNode;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-center gap-2">
      {icon}
      <span className="text-gray-500">{label}:</span>
      <span className="truncate text-gray-200">{children}</span>
    </div>
  );
}

function Card({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="rounded-xl border border-[#1e2d40] bg-[#0d1526] p-3">
      <p className="text-[10px] uppercase tracking-wide text-gray-500">{label}</p>
      <p className="text-sm text-gray-200">{children}</p>
    </div>
  );
}
