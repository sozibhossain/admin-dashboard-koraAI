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
import { X } from "lucide-react";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  territory?: any | null;
};

export function TerritoryFormDialog({ open, onOpenChange, territory }: Props) {
  const queryClient = useQueryClient();
  const isEdit = Boolean(territory?._id);

  const [name, setName] = useState("");
  const [region, setRegion] = useState("");
  const [description, setDescription] = useState("");
  const [assignedPartnerId, setAssignedPartnerId] = useState("");
  const [zipCodes, setZipCodes] = useState<string[]>([]);
  const [zipInput, setZipInput] = useState("");

  const { data: partnersResponse } = useQuery({
    queryKey: ["territory-form-partners"],
    queryFn: () => partnersApi.getAll({ limit: 100 }).then((response) => response.data),
    enabled: open,
  });
  const partners: any[] = partnersResponse?.data || [];

  useEffect(() => {
    if (!open) return;
    setName(territory?.name || "");
    setRegion(territory?.region || "");
    setDescription(territory?.description || "");
    setAssignedPartnerId(
      territory?.assigned_partner_id?._id || territory?.assigned_partner_id || ""
    );
    setZipCodes(territory?.zipCodes || []);
    setZipInput("");
  }, [open, territory]);

  const addZip = () => {
    const value = zipInput.trim();
    if (!value || zipCodes.includes(value)) {
      setZipInput("");
      return;
    }
    setZipCodes([...zipCodes, value]);
    setZipInput("");
  };

  const removeZip = (value: string) =>
    setZipCodes(zipCodes.filter((zip) => zip !== value));

  const mutation = useMutation({
    mutationFn: async () => {
      const payload: any = {
        name,
        region,
        description,
        zipCodes,
      };
      if (assignedPartnerId) {
        payload.assigned_partner_id = assignedPartnerId;
      } else if (isEdit) {
        payload.assigned_partner_id = null;
      }
      if (isEdit) {
        const response = await territoriesApi.update(territory._id, payload);
        return response.data?.data;
      }
      const response = await territoriesApi.create(payload);
      return response.data?.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["territories"] });
      toast.success(isEdit ? "Territory updated" : "Territory created");
      onOpenChange(false);
    },
    onError: (error: any) =>
      toast.error(
        error?.response?.data?.message ||
          error?.message ||
          (isEdit ? "Failed to update territory" : "Failed to create territory")
      ),
  });

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    if (!name.trim() || !region.trim()) {
      toast.error("Name and region are required");
      return;
    }
    mutation.mutate();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>{isEdit ? "Edit Territory" : "Create Territory"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid gap-3 md:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="territory-name">Name</Label>
              <Input
                id="territory-name"
                value={name}
                onChange={(event) => setName(event.target.value)}
                required
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="territory-region">Region</Label>
              <Input
                id="territory-region"
                value={region}
                onChange={(event) => setRegion(event.target.value)}
                placeholder="City, Country"
                required
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label>Assign Partner</Label>
            <Select
              value={assignedPartnerId || "none"}
              onValueChange={(value) =>
                setAssignedPartnerId(value === "none" ? "" : value)
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Select partner" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">Unassigned</SelectItem>
                {partners.map((partner: any) => (
                  <SelectItem
                    key={partner._id}
                    value={partner.userId?._id || partner._id}
                  >
                    {partner.userId?.name || partner.businessName}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <Label>Zip codes</Label>
            <div className="flex gap-2">
              <Input
                value={zipInput}
                onChange={(event) => setZipInput(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === "Enter") {
                    event.preventDefault();
                    addZip();
                  }
                }}
                placeholder="Add zip code and press Enter"
              />
              <Button type="button" variant="outline" onClick={addZip}>
                Add
              </Button>
            </div>
            {zipCodes.length > 0 ? (
              <div className="flex flex-wrap gap-1.5 pt-1">
                {zipCodes.map((zip) => (
                  <span
                    key={zip}
                    className="flex items-center gap-1 rounded-full bg-blue-600/20 px-2 py-0.5 text-[11px] text-blue-300"
                  >
                    {zip}
                    <button
                      type="button"
                      onClick={() => removeZip(zip)}
                      className="text-blue-300 hover:text-white"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </span>
                ))}
              </div>
            ) : null}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="territory-desc">Description</Label>
            <textarea
              id="territory-desc"
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              rows={3}
              className="w-full rounded-lg border border-[#2a3547] bg-[#0d1526] px-3 py-2 text-sm text-gray-200 placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
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
              {mutation.isPending
                ? "Saving..."
                : isEdit
                ? "Save changes"
                : "Create territory"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
