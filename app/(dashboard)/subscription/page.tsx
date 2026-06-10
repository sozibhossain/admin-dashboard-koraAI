/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { subscriptionApi } from "@/lib/api";
import { Header } from "@/components/layout/header";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { SubscriptionPlanDialog } from "@/components/subscription-plan-dialog";
import {
  Send,
  Zap,
  BarChart3,
  Crown,
  Plus,
  Pencil,
  Trash2,
  Check,
  Star,
  CreditCard,
} from "lucide-react";

const ICONS: Record<string, any> = {
  send: Send,
  zap: Zap,
  "bar-chart": BarChart3,
  crown: Crown,
};

const CURRENCY_SYMBOL: Record<string, string> = { eur: "€", usd: "$", gbp: "£" };

function priceLabel(amount: number, currency: string) {
  return `${CURRENCY_SYMBOL[currency] || "€"}${Number(amount || 0).toLocaleString()}`;
}

export default function AdminSubscriptionPage() {
  const queryClient = useQueryClient();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingPlan, setEditingPlan] = useState<any | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<any | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ["admin-plans"],
    queryFn: () => subscriptionApi.getAllPlans().then((response) => response.data),
  });

  const plans = (data?.data || []) as any[];

  const deleteMutation = useMutation({
    mutationFn: (id: string) => subscriptionApi.deletePlan(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-plans"] });
      toast.success("Plan deleted");
      setDeleteTarget(null);
    },
    onError: (error: any) =>
      toast.error(error?.response?.data?.message || "Failed to delete plan"),
  });

  const openCreate = () => {
    setEditingPlan(null);
    setDialogOpen(true);
  };

  const openEdit = (plan: any) => {
    setEditingPlan(plan);
    setDialogOpen(true);
  };

  return (
    <div>
      <Header
        title="Subscription Plans"
        subtitle="Create and manage the plans business owners can subscribe to."
        action={
          <Button onClick={openCreate} className="gap-1.5">
            <Plus className="h-4 w-4" />
            New Plan
          </Button>
        }
      />

      <div className="space-y-4 p-3 sm:p-4 lg:p-6">
        {isLoading ? (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
            {Array.from({ length: 4 }).map((_, index) => (
              <Card key={index}>
                <CardContent className="pt-5">
                  <Skeleton className="h-64 w-full" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : plans.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center gap-3 py-16 text-center">
              <CreditCard className="h-10 w-10 text-gray-600" />
              <p className="text-sm text-gray-400">No subscription plans yet.</p>
              <Button onClick={openCreate} className="gap-1.5">
                <Plus className="h-4 w-4" />
                Create your first plan
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
            {plans.map((plan) => {
              const Icon = ICONS[plan.icon] || Zap;
              const stripeSynced = Boolean(plan.stripeProductId);
              return (
                <Card
                  key={plan._id}
                  className={plan.highlight ? "border-blue-600/50" : undefined}
                >
                  <CardContent className="flex h-full flex-col pt-5">
                    <div className="mb-3 flex items-start justify-between">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-600/15 text-blue-400">
                        <Icon className="h-5 w-5" />
                      </div>
                      <div className="flex items-center gap-1">
                        {plan.highlight ? (
                          <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
                        ) : null}
                        <Badge
                          variant={plan.isActive ? "success" : "secondary"}
                          className="text-[10px]"
                        >
                          {plan.isActive ? "Active" : "Inactive"}
                        </Badge>
                      </div>
                    </div>

                    <p className="text-base font-semibold text-white">{plan.name}</p>
                    {plan.description ? (
                      <p className="mt-0.5 text-[11px] text-gray-500">{plan.description}</p>
                    ) : null}

                    <div className="mt-3">
                      {plan.isCustom ? (
                        <p className="text-2xl font-bold text-white">Custom</p>
                      ) : (
                        <p className="text-2xl font-bold text-white">
                          {priceLabel(plan.monthlyPrice, plan.currency)}
                          <span className="text-xs font-normal text-gray-500">/mo</span>
                        </p>
                      )}
                      {!plan.isCustom ? (
                        <p className="text-[11px] text-gray-500">
                          {priceLabel(plan.annualPrice, plan.currency)} billed annually
                        </p>
                      ) : null}
                    </div>

                    <div className="mt-3 rounded-lg bg-[#0f1c30] px-3 py-2">
                      <p className="text-[11px] text-gray-400">
                        Partner commission:{" "}
                        <span className="font-semibold text-emerald-400">
                          €{Number(plan.partnerCommission || 0)}/cycle
                        </span>
                      </p>
                    </div>

                    <ul className="mt-3 flex-1 space-y-1.5">
                      {(plan.features || []).slice(0, 6).map((feature: string) => (
                        <li
                          key={feature}
                          className="flex items-start gap-2 text-[11px] text-gray-300"
                        >
                          <Check className="mt-0.5 h-3 w-3 flex-shrink-0 text-emerald-400" />
                          {feature}
                        </li>
                      ))}
                    </ul>

                    <div className="mt-3 flex items-center justify-between border-t border-[#1e2d40] pt-3">
                      <span
                        className={`text-[10px] ${stripeSynced ? "text-emerald-400" : "text-amber-400"}`}
                        title={stripeSynced ? plan.stripeProductId : "Not synced to Stripe"}
                      >
                        {plan.isCustom
                          ? "No checkout"
                          : stripeSynced
                            ? "● Stripe synced"
                            : "● Not in Stripe"}
                      </span>
                      <div className="flex gap-1">
                        <Button
                          size="sm"
                          variant="outline"
                          className="h-7 gap-1 px-2 text-[11px]"
                          onClick={() => openEdit(plan)}
                        >
                          <Pencil className="h-3 w-3" />
                          Edit
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="h-7 gap-1 px-2 text-[11px] text-red-400 hover:text-red-300"
                          onClick={() => setDeleteTarget(plan)}
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>

      <SubscriptionPlanDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        plan={editingPlan}
      />

      <Dialog open={Boolean(deleteTarget)} onOpenChange={(open) => !open && setDeleteTarget(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Delete plan</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-gray-400">
            Delete <span className="font-medium text-gray-200">{deleteTarget?.name}</span>?
            This archives its Stripe product and cannot be undone. Plans with active
            subscriptions can&apos;t be deleted.
          </p>
          <div className="mt-4 flex justify-end gap-2">
            <Button
              variant="outline"
              onClick={() => setDeleteTarget(null)}
              disabled={deleteMutation.isPending}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={() => deleteMutation.mutate(deleteTarget._id)}
              disabled={deleteMutation.isPending}
            >
              {deleteMutation.isPending ? "Deleting..." : "Delete"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
