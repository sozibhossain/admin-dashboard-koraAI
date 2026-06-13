/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useEffect, useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Eye, EyeOff } from "lucide-react";
import { toast } from "sonner";
import { adminApi } from "@/lib/api";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  owner?: any | null;
};

export function BusinessOwnerFormDialog({ open, onOpenChange, owner }: Props) {
  const queryClient = useQueryClient();
  const isEdit = Boolean(owner?._id);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    if (!open) return;
    setName(owner?.name || "");
    setEmail(owner?.email || "");
    setPhoneNumber(owner?.phoneNumber || "");
    setPassword("");
    setShowPassword(false);
  }, [open, owner]);

  const mutation = useMutation({
    mutationFn: async () => {
      if (isEdit) {
        const response = await adminApi.updateUser(owner._id, {
          name,
          email,
          phoneNumber,
        });
        return response.data?.data;
      }

      const response = await adminApi.createUser({
        name,
        email,
        phoneNumber,
        password,
      });
      return response.data?.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["business-owners-directory"] });
      toast.success(isEdit ? "Business owner updated" : "Business owner created");
      onOpenChange(false);
    },
    onError: (error: any) => {
      toast.error(
        error?.response?.data?.message ||
          error?.message ||
          (isEdit ? "Failed to update business owner" : "Failed to create business owner")
      );
    },
  });

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    if (!name.trim() || !email.trim() || !phoneNumber.trim() || (!isEdit && !password.trim())) {
      toast.error("Name, email, phone number, and password are required");
      return;
    }
    mutation.mutate();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>{isEdit ? "Edit Business Owner" : "Add Business Owner"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid gap-3 md:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="owner-name">Full name</Label>
              <Input
                id="owner-name"
                value={name}
                onChange={(event) => setName(event.target.value)}
                required
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="owner-email">Email</Label>
              <Input
                id="owner-email"
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                required
              />
            </div>
          </div>

          <div className="grid gap-3 md:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="owner-phone">Phone number</Label>
              <Input
                id="owner-phone"
                value={phoneNumber}
                onChange={(event) => setPhoneNumber(event.target.value)}
                required
              />
            </div>
            {!isEdit ? (
              <div className="space-y-1.5">
                <Label htmlFor="owner-password">Temporary password</Label>
                <div className="relative">
                  <Input
                    id="owner-password"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    className="pr-10"
                    required
                  />
                  <button
                    type="button"
                    aria-label={showPassword ? "Hide password" : "Show password"}
                    onClick={() => setShowPassword((current) => !current)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 transition hover:text-gray-300"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>
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
                : "Create business owner"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
