/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useEffect, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { partnersApi, territoriesApi } from "@/lib/api";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const TIER_OPTIONS = [
  { value: "basic", label: "Basic" },
  { value: "standard", label: "Standard" },
  { value: "premium", label: "Premium" },
  { value: "elite", label: "Elite" },
];

const STATUS_OPTIONS = [
  { value: "active", label: "Active" },
  { value: "inactive", label: "Inactive" },
  { value: "suspended", label: "Suspended" },
];

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  partner?: any | null;
};

export function PartnerFormDialog({ open, onOpenChange, partner }: Props) {
  const queryClient = useQueryClient();
  const isEdit = Boolean(partner?._id);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [businessName, setBusinessName] = useState("");
  const [commissionRate, setCommissionRate] = useState(20);
  const [territoryId, setTerritoryId] = useState<string>("");
  const [tier, setTier] = useState("basic");
  const [status, setStatus] = useState("active");

  const { data: territoriesResponse } = useQuery({
    queryKey: ["partner-form-territories"],
    queryFn: () => territoriesApi.getAll({ limit: 100 }).then((response) => response.data),
    enabled: open,
  });

  const territories: any[] = territoriesResponse?.data || [];

  useEffect(() => {
    if (!open) return;
    if (partner) {
      setName(partner.userId?.name || "");
      setEmail(partner.userId?.email || "");
      setPassword("");
      setPhoneNumber(partner.userId?.phoneNumber || "");
      setBusinessName(partner.businessName || "");
      setCommissionRate(partner.commissionRate ?? 20);
      setTerritoryId(partner.territory_id?._id || partner.territory_id || "");
      setTier(partner.tier || "basic");
      setStatus(partner.status || "active");
    } else {
      setName("");
      setEmail("");
      setPassword("");
      setPhoneNumber("");
      setBusinessName("");
      setCommissionRate(20);
      setTerritoryId("");
      setTier("basic");
      setStatus("active");
    }
  }, [open, partner]);

  const mutation = useMutation({
    mutationFn: async () => {
      if (isEdit) {
        const payload: any = {
          businessName,
          commissionRate,
          tier,
          status,
        };
        if (territoryId) payload.territory_id = territoryId;
        const response = await partnersApi.update(partner._id, payload);
        return response.data?.data;
      }

      const createPayload: any = {
        name,
        email,
        password,
        phoneNumber,
        businessName,
        commissionRate,
      };
      if (territoryId) createPayload.territory_id = territoryId;
      const response = await partnersApi.create(createPayload);
      return response.data?.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["partners"] });
      toast.success(isEdit ? "Partner updated" : "Partner created");
      onOpenChange(false);
    },
    onError: (error: any) =>
      toast.error(
        error?.response?.data?.message ||
          error?.message ||
          (isEdit ? "Failed to update partner" : "Failed to create partner")
      ),
  });

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    if (!isEdit) {
      if (!name.trim() || !email.trim() || !password.trim() || !businessName.trim()) {
        toast.error("Name, email, password, and business name are required");
        return;
      }
    } else {
      if (!businessName.trim()) {
        toast.error("Business name is required");
        return;
      }
    }
    mutation.mutate();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xl">
        <DialogHeader>
          <DialogTitle>{isEdit ? "Edit Partner" : "Add Sales Partner"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          {!isEdit ? (
            <>
              <div className="grid gap-3 md:grid-cols-2">
                <div className="space-y-1.5">
                  <Label htmlFor="partner-name">Full name</Label>
                  <Input
                    id="partner-name"
                    value={name}
                    onChange={(event) => setName(event.target.value)}
                    required
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="partner-email">Email</Label>
                  <Input
                    id="partner-email"
                    type="email"
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    required
                  />
                </div>
              </div>
              <div className="grid gap-3 md:grid-cols-2">
                <div className="space-y-1.5">
                  <Label htmlFor="partner-password">Temporary password</Label>
                  <Input
                    id="partner-password"
                    type="password"
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    required
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="partner-phone">Phone</Label>
                  <Input
                    id="partner-phone"
                    value={phoneNumber}
                    onChange={(event) => setPhoneNumber(event.target.value)}
                  />
                </div>
              </div>
            </>
          ) : null}

          <div className="grid gap-3 md:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="partner-business">Business name</Label>
              <Input
                id="partner-business"
                value={businessName}
                onChange={(event) => setBusinessName(event.target.value)}
                required
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="partner-commission">Commission rate (%)</Label>
              <Input
                id="partner-commission"
                type="number"
                min={0}
                max={100}
                value={commissionRate}
                onChange={(event) => setCommissionRate(Number(event.target.value))}
              />
            </div>
          </div>

          <div className="grid gap-3 md:grid-cols-3">
            <div className="space-y-1.5">
              <Label>Territory</Label>
              <Select
                value={territoryId || "none"}
                onValueChange={(value) => setTerritoryId(value === "none" ? "" : value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Unassigned</SelectItem>
                  {territories.map((territory: any) => (
                    <SelectItem key={territory._id} value={territory._id}>
                      {territory.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            {isEdit ? (
              <>
                <div className="space-y-1.5">
                  <Label>Tier</Label>
                  <Select value={tier} onValueChange={setTier}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {TIER_OPTIONS.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label>Status</Label>
                  <Select value={status} onValueChange={setStatus}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {STATUS_OPTIONS.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </>
            ) : null}
          </div>

          <div className="flex justify-end gap-2 border-t border-[#1e2d40] pt-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={mutation.isPending}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={mutation.isPending}>
              {mutation.isPending
                ? "Saving..."
                : isEdit
                ? "Save changes"
                : "Create partner"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
