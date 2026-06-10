/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useEffect, useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { subscriptionApi } from "@/lib/api";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const ICON_OPTIONS = [
  { value: "send", label: "Send (Starter)" },
  { value: "zap", label: "Zap (Pro)" },
  { value: "bar-chart", label: "Bar Chart (Scale)" },
  { value: "crown", label: "Crown (Enterprise)" },
];

const CURRENCY_OPTIONS = [
  { value: "eur", label: "EUR (€)" },
  { value: "usd", label: "USD ($)" },
  { value: "gbp", label: "GBP (£)" },
];

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  plan?: any | null;
};

function ToggleRow({
  label,
  hint,
  checked,
  onChange,
}: {
  label: string;
  hint?: string;
  checked: boolean;
  onChange: (value: boolean) => void;
}) {
  return (
    <button
      type="button"
      onClick={() => onChange(!checked)}
      className="flex w-full items-center justify-between rounded-lg border border-[#2a3547] bg-[#0d1526] px-3 py-2 text-left"
    >
      <span>
        <span className="text-sm text-gray-200">{label}</span>
        {hint ? <span className="block text-[11px] text-gray-500">{hint}</span> : null}
      </span>
      <span
        className={`relative h-5 w-9 rounded-full transition-colors ${checked ? "bg-blue-600" : "bg-[#2a3547]"}`}
      >
        <span
          className={`absolute top-0.5 h-4 w-4 rounded-full bg-white transition-all ${checked ? "left-[18px]" : "left-0.5"}`}
        />
      </span>
    </button>
  );
}

export function SubscriptionPlanDialog({ open, onOpenChange, plan }: Props) {
  const queryClient = useQueryClient();
  const isEdit = Boolean(plan?._id);

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [icon, setIcon] = useState("zap");
  const [currency, setCurrency] = useState("eur");
  const [monthlyPrice, setMonthlyPrice] = useState("0");
  const [annualPrice, setAnnualPrice] = useState("0");
  const [partnerCommission, setPartnerCommission] = useState("0");
  const [sortOrder, setSortOrder] = useState("0");
  const [featuresText, setFeaturesText] = useState("");
  const [limits, setLimits] = useState({
    employees: "0",
    customers: "0",
    storageGb: "0",
    aiCredits: "0",
    automations: "0",
    supportRequests: "0",
  });
  const [highlight, setHighlight] = useState(false);
  const [isCustom, setIsCustom] = useState(false);
  const [isActive, setIsActive] = useState(true);

  // Seed the controlled fields from the selected plan each time the dialog opens.
  /* eslint-disable react-hooks/set-state-in-effect */
  useEffect(() => {
    if (!open) return;
    setName(plan?.name || "");
    setDescription(plan?.description || "");
    setIcon(plan?.icon || "zap");
    setCurrency(plan?.currency || "eur");
    setMonthlyPrice(String(plan?.monthlyPrice ?? 0));
    setAnnualPrice(String(plan?.annualPrice ?? 0));
    setPartnerCommission(String(plan?.partnerCommission ?? 0));
    setSortOrder(String(plan?.sortOrder ?? 0));
    setFeaturesText((plan?.features || []).join("\n"));
    setLimits({
      employees: String(plan?.limits?.employees ?? 0),
      customers: String(plan?.limits?.customers ?? 0),
      storageGb: String(plan?.limits?.storageGb ?? 0),
      aiCredits: String(plan?.limits?.aiCredits ?? 0),
      automations: String(plan?.limits?.automations ?? 0),
      supportRequests: String(plan?.limits?.supportRequests ?? 0),
    });
    setHighlight(Boolean(plan?.highlight));
    setIsCustom(Boolean(plan?.isCustom));
    setIsActive(plan?.isActive === undefined ? true : Boolean(plan.isActive));
  }, [open, plan]);
  /* eslint-enable react-hooks/set-state-in-effect */

  const mutation = useMutation({
    mutationFn: async () => {
      const payload = {
        name: name.trim(),
        description: description.trim(),
        icon,
        currency,
        monthlyPrice: Number(monthlyPrice) || 0,
        annualPrice: Number(annualPrice) || 0,
        partnerCommission: Number(partnerCommission) || 0,
        sortOrder: Number(sortOrder) || 0,
        features: featuresText
          .split("\n")
          .map((line) => line.trim())
          .filter(Boolean),
        limits: {
          employees: Number(limits.employees) || 0,
          customers: Number(limits.customers) || 0,
          storageGb: Number(limits.storageGb) || 0,
          aiCredits: Number(limits.aiCredits) || 0,
          automations: Number(limits.automations) || 0,
          supportRequests: Number(limits.supportRequests) || 0,
        },
        highlight,
        isCustom,
        isActive,
      };
      const response = isEdit
        ? await subscriptionApi.updatePlan(plan._id, payload)
        : await subscriptionApi.createPlan(payload);
      return response.data?.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-plans"] });
      toast.success(isEdit ? "Plan updated" : "Plan created");
      onOpenChange(false);
    },
    onError: (error: any) =>
      toast.error(
        error?.response?.data?.message ||
          error?.message ||
          (isEdit ? "Failed to update plan" : "Failed to create plan")
      ),
  });

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    if (!name.trim()) {
      toast.error("Plan name is required");
      return;
    }
    mutation.mutate();
  };

  const setLimit = (key: keyof typeof limits, value: string) =>
    setLimits((current) => ({ ...current, [key]: value }));

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{isEdit ? "Edit Plan" : "Create Plan"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid gap-3 md:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="plan-name">Name</Label>
              <Input
                id="plan-name"
                value={name}
                onChange={(event) => setName(event.target.value)}
                placeholder="e.g. Pro"
                required
              />
            </div>
            <div className="space-y-1.5">
              <Label>Icon</Label>
              <Select value={icon} onValueChange={setIcon}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {ICON_OPTIONS.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="plan-description">Description</Label>
            <Input
              id="plan-description"
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              placeholder="Perfect for small teams getting started."
            />
          </div>

          <div className="grid gap-3 md:grid-cols-4">
            <div className="space-y-1.5">
              <Label htmlFor="plan-monthly">Monthly ({currency.toUpperCase()})</Label>
              <Input
                id="plan-monthly"
                type="number"
                min="0"
                value={monthlyPrice}
                onChange={(event) => setMonthlyPrice(event.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="plan-annual">Annual ({currency.toUpperCase()})</Label>
              <Input
                id="plan-annual"
                type="number"
                min="0"
                value={annualPrice}
                onChange={(event) => setAnnualPrice(event.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="plan-commission">Partner €/cycle</Label>
              <Input
                id="plan-commission"
                type="number"
                min="0"
                value={partnerCommission}
                onChange={(event) => setPartnerCommission(event.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <Label>Currency</Label>
              <Select value={currency} onValueChange={setCurrency}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {CURRENCY_OPTIONS.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="plan-features">Features (one per line)</Label>
            <textarea
              id="plan-features"
              value={featuresText}
              onChange={(event) => setFeaturesText(event.target.value)}
              rows={5}
              placeholder={"Up to 25 Employees\nUp to 250 Customers\n100 GB Storage"}
              className="w-full rounded-lg border border-[#2a3547] bg-[#0d1526] px-3 py-2 text-sm text-gray-200 placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="space-y-1.5">
            <Label>Plan limits</Label>
            <p className="text-[11px] text-gray-500">Use -1 for unlimited.</p>
            <div className="grid gap-3 md:grid-cols-3">
              {(
                [
                  ["employees", "Employees"],
                  ["customers", "Customers"],
                  ["storageGb", "Storage (GB)"],
                  ["aiCredits", "AI Credits"],
                  ["automations", "Automations"],
                  ["supportRequests", "Support Requests"],
                ] as Array<[keyof typeof limits, string]>
              ).map(([key, label]) => (
                <div key={key} className="space-y-1.5">
                  <Label htmlFor={`limit-${key}`} className="text-[11px] text-gray-400">
                    {label}
                  </Label>
                  <Input
                    id={`limit-${key}`}
                    type="number"
                    value={limits[key]}
                    onChange={(event) => setLimit(key, event.target.value)}
                  />
                </div>
              ))}
            </div>
          </div>

          <div className="grid gap-3 md:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="plan-sort">Sort order</Label>
              <Input
                id="plan-sort"
                type="number"
                value={sortOrder}
                onChange={(event) => setSortOrder(event.target.value)}
              />
            </div>
          </div>

          <div className="grid gap-2 md:grid-cols-3">
            <ToggleRow label="Active" checked={isActive} onChange={setIsActive} />
            <ToggleRow label="Highlight" hint="Featured card" checked={highlight} onChange={setHighlight} />
            <ToggleRow
              label="Custom"
              hint="Contact Us / no checkout"
              checked={isCustom}
              onChange={setIsCustom}
            />
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
              {mutation.isPending ? "Saving..." : isEdit ? "Save changes" : "Create plan"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
