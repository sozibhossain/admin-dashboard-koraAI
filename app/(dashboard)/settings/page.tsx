/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useEffect, useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { adminApi, userApi } from "@/lib/api";
import { Header } from "@/components/layout/header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { formatDate, timeAgo } from "@/lib/utils";
import {
  Bell,
  CheckSquare,
  GitBranch,
  Globe,
  HeadphonesIcon,
  RefreshCw,
  Save,
  Settings as SettingsIcon,
  Shield,
  Sparkles,
  Users,
} from "lucide-react";

const CATEGORIES = [
  { id: "general", label: "General", icon: SettingsIcon, desc: "Basic platform configuration" },
  { id: "email", label: "Email", icon: Bell, desc: "Transactional email settings" },
  { id: "partner", label: "Partner Settings", icon: Globe, desc: "Partner management rules" },
  { id: "customer", label: "Customer Settings", icon: Users, desc: "Customer onboarding & security" },
  { id: "sales", label: "Sales & Leads", icon: Globe, desc: "Lead and sales configuration" },
  { id: "territory", label: "Territory Settings", icon: Globe, desc: "Territory and assignment rules" },
  { id: "workflows", label: "Workflows & Automation", icon: GitBranch, desc: "Workflow and approval rules" },
  { id: "support", label: "Support Settings", icon: HeadphonesIcon, desc: "Support and ticketing rules" },
  { id: "security", label: "Security", icon: Shield, desc: "Security and access control" },
  { id: "integrations", label: "Integrations", icon: Globe, desc: "Third-party integrations" },
  { id: "profile", label: "My Profile", icon: Users, desc: "Your admin account" },
] as const;

const TIMEZONE_OPTIONS = [
  "GMT-12",
  "GMT-8 Pacific",
  "GMT-5 Eastern",
  "GMT+0 UTC",
  "GMT+1 Europe/Berlin",
  "GMT+2 Europe/Athens",
  "GMT+5:30 India",
  "GMT+8 Singapore",
  "GMT+9 Tokyo",
];

const LANGUAGE_OPTIONS = ["English", "German", "French", "Spanish", "Bengali"];

const PRIMARY_COLORS = ["#3b82f6", "#10B981", "#8B5CF6", "#f59e0b", "#ef4444"];

const ALLOWED_SERVICES = [
  "Residential",
  "Retail",
  "Commercial Spa Service",
  "Vacation rental",
  "Religious Institution",
  "Health Clubs & Fitness Center",
  "Professional Sports Teams",
  "Manufacture Warranty",
  "Insurance Repair",
];

const LEAD_SOURCES = [
  "manual",
  "website",
  "referral",
  "ad_campaign",
  "partner",
  "lead_generator",
  "other",
];

type CategoryId = (typeof CATEGORIES)[number]["id"];

export default function SettingsPage() {
  const queryClient = useQueryClient();
  const [activeCategory, setActiveCategory] = useState<CategoryId>("general");
  const [draft, setDraft] = useState<any>(null);

  const { data: settingsResponse, isLoading: settingsLoading } = useQuery({
    queryKey: ["platform-settings"],
    queryFn: () => adminApi.getPlatformSettings().then((response) => response.data?.data),
  });

  const { data: profileResponse, isLoading: profileLoading } = useQuery({
    queryKey: ["my-profile"],
    queryFn: () => userApi.getProfile().then((response) => response.data?.data),
  });

  // Initialise draft once settings load
  useEffect(() => {
    if (settingsResponse && !draft) {
      setDraft(structuredClone(settingsResponse));
    }
  }, [settingsResponse, draft]);

  const dirty = useMemo(() => {
    if (!draft || !settingsResponse) return false;
    return JSON.stringify(draft) !== JSON.stringify(settingsResponse);
  }, [draft, settingsResponse]);

  const saveMutation = useMutation({
    mutationFn: () => adminApi.updatePlatformSettings(draft),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["platform-settings"] });
      toast.success("Settings saved");
    },
    onError: (error: any) =>
      toast.error(error?.response?.data?.message || "Failed to save"),
  });

  const handleReset = () => {
    if (settingsResponse) setDraft(structuredClone(settingsResponse));
    toast.info("Reverted unsaved changes");
  };

  const updateField = (path: string[], value: any) => {
    setDraft((current: any) => {
      const next = structuredClone(current);
      let cursor: any = next;
      for (let i = 0; i < path.length - 1; i += 1) {
        cursor[path[i]] = cursor[path[i]] || {};
        cursor = cursor[path[i]];
      }
      cursor[path[path.length - 1]] = value;
      return next;
    });
  };

  const active = CATEGORIES.find((category) => category.id === activeCategory);

  return (
    <div>
      <Header
        title="Settings"
        subtitle="Configure and manage your platform settings and preferences."
        action={
          <div className="flex gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={handleReset}
              disabled={!dirty || saveMutation.isPending}
            >
              <RefreshCw className="mr-1 h-3.5 w-3.5" />
              Revert
            </Button>
            <Button
              size="sm"
              onClick={() => saveMutation.mutate()}
              disabled={!dirty || saveMutation.isPending}
            >
              <Save className="mr-1 h-3.5 w-3.5" />
              {saveMutation.isPending ? "Saving..." : "Save Changes"}
            </Button>
          </div>
        }
      />

      <div className="p-3 sm:p-4 lg:p-6">
        <div className="grid grid-cols-1 gap-5 lg:grid-cols-4">
          <Card className="lg:col-span-1">
            <CardHeader>
              <CardTitle className="text-sm">Settings Categories</CardTitle>
            </CardHeader>
            <CardContent className="p-2">
              {CATEGORIES.map((category) => {
                const Icon = category.icon;
                return (
                  <button
                    key={category.id}
                    onClick={() => setActiveCategory(category.id)}
                    className={`mb-0.5 flex w-full items-start gap-2.5 rounded-lg px-3 py-2.5 text-left transition-colors ${
                      activeCategory === category.id
                        ? "border border-blue-600/20 bg-blue-600/20 text-blue-400"
                        : "text-gray-400 hover:bg-[#1e2d40] hover:text-gray-200"
                    }`}
                  >
                    <Icon className="mt-0.5 h-4 w-4 shrink-0" />
                    <div>
                      <p className="text-xs font-medium">{category.label}</p>
                      <p className="text-[10px] text-gray-500">{category.desc}</p>
                    </div>
                  </button>
                );
              })}
            </CardContent>
          </Card>

          <div className="space-y-4 lg:col-span-2">
            {settingsLoading || !draft ? (
              <Card>
                <CardContent className="p-6">
                  <Skeleton className="h-40 w-full" />
                </CardContent>
              </Card>
            ) : (
              <>
                {activeCategory === "general" ? (
                  <GeneralPanel draft={draft} onChange={updateField} />
                ) : null}
                {activeCategory === "email" ? (
                  <EmailPanel draft={draft} onChange={updateField} />
                ) : null}
                {activeCategory === "partner" ? (
                  <PartnerPanel draft={draft} onChange={updateField} />
                ) : null}
                {activeCategory === "customer" ? (
                  <CustomerPanel draft={draft} onChange={updateField} />
                ) : null}
                {activeCategory === "sales" ? (
                  <SalesPanel draft={draft} onChange={updateField} />
                ) : null}
                {activeCategory === "territory" ? (
                  <TerritoryPanel draft={draft} onChange={updateField} />
                ) : null}
                {activeCategory === "workflows" ? (
                  <WorkflowsPanel draft={draft} onChange={updateField} />
                ) : null}
                {activeCategory === "support" ? (
                  <SupportPanel draft={draft} onChange={updateField} />
                ) : null}
                {activeCategory === "security" ? (
                  <SecurityPanel draft={draft} onChange={updateField} />
                ) : null}
                {activeCategory === "integrations" ? (
                  <IntegrationsPanel draft={draft} onChange={updateField} />
                ) : null}
                {activeCategory === "profile" ? (
                  <ProfilePanel profile={profileResponse} loading={profileLoading} />
                ) : null}
              </>
            )}
          </div>

          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Settings Overview</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="mb-3 text-xs text-gray-400">
                  These settings define the global configuration of your platform. Changes
                  apply to all users on save.
                </p>
                <div className="space-y-1.5">
                  {[
                    "All Partners",
                    "All Customers",
                    "All Administrators",
                    "System Workflows",
                  ].map((entry) => (
                    <div key={entry} className="flex items-center gap-2 text-xs">
                      <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-emerald-500" />
                      <span className="text-gray-300">{entry}</span>
                    </div>
                  ))}
                </div>
                {draft?.maintenanceMode ? (
                  <div className="mt-3 rounded-lg border border-amber-600/20 bg-amber-600/10 p-2">
                    <p className="text-xs text-amber-400">
                      ⚠ Maintenance mode is on — only admins can access the platform.
                    </p>
                  </div>
                ) : null}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Change History</CardTitle>
              </CardHeader>
              <CardContent>
                {!settingsResponse ? (
                  <p className="text-xs text-gray-500">No history yet.</p>
                ) : (
                  <div className="space-y-2 text-xs">
                    <Row label="Last updated">
                      {settingsResponse.updatedAt
                        ? `${formatDate(settingsResponse.updatedAt)} · ${timeAgo(settingsResponse.updatedAt)}`
                        : "—"}
                    </Row>
                    <Row label="Updated by">
                      {settingsResponse.lastUpdatedBy?.name ||
                        (settingsResponse.lastUpdatedBy ? "Admin" : "System")}
                    </Row>
                    <Row label="Created">
                      {settingsResponse.createdAt
                        ? formatDate(settingsResponse.createdAt)
                        : "—"}
                    </Row>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex justify-between border-b border-[#1e2d40] py-1.5 last:border-0">
      <span className="text-gray-500">{label}</span>
      <span className="text-right text-gray-200">{children}</span>
    </div>
  );
}

function Toggle({
  label,
  description,
  checked,
  onChange,
}: {
  label: string;
  description?: string;
  checked: boolean;
  onChange: (next: boolean) => void;
}) {
  return (
    <div className="flex items-center justify-between border-b border-[#1e2d40] py-3 last:border-0">
      <div className="min-w-0">
        <p className="text-sm text-gray-200">{label}</p>
        {description ? (
          <p className="text-xs text-gray-500">{description}</p>
        ) : null}
      </div>
      <button
        type="button"
        onClick={() => onChange(!checked)}
        className={`h-5 w-10 shrink-0 rounded-full transition-colors ${
          checked ? "bg-blue-600" : "bg-[#2a3547]"
        }`}
      >
        <div
          className={`mx-0.5 h-4 w-4 rounded-full bg-white transition-transform ${
            checked ? "translate-x-5" : "translate-x-0"
          }`}
        />
      </button>
    </div>
  );
}

function GeneralPanel({ draft, onChange }: any) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm">General Settings</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <Label>Platform Name</Label>
            <Input
              value={draft.platformName || ""}
              onChange={(event) => onChange(["platformName"], event.target.value)}
            />
          </div>
          <div className="space-y-1.5">
            <Label>Default Language</Label>
            <Select
              value={draft.defaultLanguage || "English"}
              onValueChange={(value) => onChange(["defaultLanguage"], value)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {LANGUAGE_OPTIONS.map((option) => (
                  <SelectItem key={option} value={option}>
                    {option}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="space-y-1.5">
          <Label>Platform Logo</Label>
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-600">
              {draft.platformLogo?.url ? (
                <img
                  src={draft.platformLogo.url}
                  alt="logo"
                  className="h-12 w-12 rounded-xl object-cover"
                />
              ) : (
                <Sparkles className="h-6 w-6 text-white" />
              )}
            </div>
            <p className="text-xs text-gray-500">
              Logo upload requires file storage integration. Set the URL via API for now.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <Label>Timezone</Label>
            <Select
              value={draft.timezone || "GMT+1 Europe/Berlin"}
              onValueChange={(value) => onChange(["timezone"], value)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {TIMEZONE_OPTIONS.map((option) => (
                  <SelectItem key={option} value={option}>
                    {option}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label>Primary Color</Label>
            <div className="flex gap-2">
              {PRIMARY_COLORS.map((color) => (
                <button
                  key={color}
                  type="button"
                  onClick={() => onChange(["primaryColor"], color)}
                  className={`h-8 w-8 rounded-lg border-2 ${
                    draft.primaryColor === color ? "border-white" : "border-[#2a3547]"
                  }`}
                  style={{ backgroundColor: color }}
                />
              ))}
            </div>
          </div>
        </div>

        <div className="space-y-0">
          <Toggle
            label="Enable Maintenance Mode"
            description="Only administrators can access the platform when enabled."
            checked={Boolean(draft.maintenanceMode)}
            onChange={(value) => onChange(["maintenanceMode"], value)}
          />
          <Toggle
            label="Show Platform Announcements"
            description="Display important announcements to all users."
            checked={Boolean(draft.showAnnouncements)}
            onChange={(value) => onChange(["showAnnouncements"], value)}
          />
        </div>
      </CardContent>
    </Card>
  );
}

function EmailPanel({ draft, onChange }: any) {
  const email = draft.email || {};
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm">Email Settings</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <Label>From Name</Label>
            <Input
              value={email.fromName || ""}
              onChange={(event) => onChange(["email", "fromName"], event.target.value)}
            />
          </div>
          <div className="space-y-1.5">
            <Label>From Email</Label>
            <Input
              type="email"
              value={email.fromEmail || ""}
              onChange={(event) => onChange(["email", "fromEmail"], event.target.value)}
            />
          </div>
          <div className="space-y-1.5">
            <Label>Reply-To Email</Label>
            <Input
              type="email"
              value={email.replyToEmail || ""}
              onChange={(event) =>
                onChange(["email", "replyToEmail"], event.target.value)
              }
            />
          </div>
          <div className="space-y-1.5">
            <Label>Provider</Label>
            <Input
              value={email.provider || ""}
              onChange={(event) => onChange(["email", "provider"], event.target.value)}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function PartnerPanel({ draft, onChange }: any) {
  const partner = draft.partner || {};
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm">Partner Settings</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-1.5">
          <Label>Default commission rate (%)</Label>
          <Input
            type="number"
            min={0}
            max={100}
            value={partner.defaultCommissionRate ?? 20}
            onChange={(event) =>
              onChange(["partner", "defaultCommissionRate"], Number(event.target.value))
            }
          />
        </div>
        <Toggle
          label="Auto-approve partner signups"
          description="Automatically activate new partner accounts without admin review."
          checked={Boolean(partner.autoApproveSignups)}
          onChange={(value) => onChange(["partner", "autoApproveSignups"], value)}
        />
        <Toggle
          label="Require two-factor for partners"
          description="Force 2FA enrolment for all partner accounts."
          checked={Boolean(partner.requireTwoFactor)}
          onChange={(value) => onChange(["partner", "requireTwoFactor"], value)}
        />
      </CardContent>
    </Card>
  );
}

function CustomerPanel({ draft, onChange }: any) {
  const customer = draft.customer || {};
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm">Customer Settings</CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        <Toggle
          label="Require email verification"
          description="New customers must verify their email before logging in."
          checked={Boolean(customer.requireEmailVerification)}
          onChange={(value) => onChange(["customer", "requireEmailVerification"], value)}
        />
        <Toggle
          label="Allow self-signup"
          description="Let customers create their own accounts."
          checked={Boolean(customer.allowSelfSignup)}
          onChange={(value) => onChange(["customer", "allowSelfSignup"], value)}
        />
      </CardContent>
    </Card>
  );
}

function SalesPanel({ draft, onChange }: any) {
  const sales = draft.sales || {};
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm">Sales & Leads</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-1.5">
          <Label>Default lead source</Label>
          <Select
            value={sales.defaultLeadSource || "manual"}
            onValueChange={(value) => onChange(["sales", "defaultLeadSource"], value)}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {LEAD_SOURCES.map((option) => (
                <SelectItem key={option} value={option}>
                  {option}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <Toggle
          label="Auto-assign new leads"
          description="Distribute new leads to partners by territory automatically."
          checked={Boolean(sales.autoAssignLeads)}
          onChange={(value) => onChange(["sales", "autoAssignLeads"], value)}
        />
        <div className="space-y-1.5">
          <Label>Follow-up window (days)</Label>
          <Input
            type="number"
            min={1}
            max={90}
            value={sales.conversionFollowUpDays ?? 7}
            onChange={(event) =>
              onChange(["sales", "conversionFollowUpDays"], Number(event.target.value))
            }
          />
        </div>
      </CardContent>
    </Card>
  );
}

function TerritoryPanel({ draft, onChange }: any) {
  const territory = draft.territory || {};
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm">Territory Settings</CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        <Toggle
          label="Enforce one partner per territory"
          description="Block assigning a territory that already has an active partner."
          checked={Boolean(territory.enforceUniquePartner)}
          onChange={(value) => onChange(["territory", "enforceUniquePartner"], value)}
        />
        <Toggle
          label="Auto-suggest territory on lead create"
          description="Suggest a territory based on address when creating a lead."
          checked={Boolean(territory.autoSuggestOnLeadCreate)}
          onChange={(value) => onChange(["territory", "autoSuggestOnLeadCreate"], value)}
        />
      </CardContent>
    </Card>
  );
}

function WorkflowsPanel({ draft, onChange }: any) {
  const workflows = draft.workflows || {};
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm">Workflows & Automation</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <Toggle
          label="Auto-cancel stale approvals"
          description="Reject pending approvals after the threshold below."
          checked={Boolean(workflows.autoCancelStaleApprovals)}
          onChange={(value) => onChange(["workflows", "autoCancelStaleApprovals"], value)}
        />
        <div className="space-y-1.5">
          <Label>Stale threshold (days)</Label>
          <Input
            type="number"
            min={1}
            max={90}
            value={workflows.staleApprovalDays ?? 14}
            onChange={(event) =>
              onChange(["workflows", "staleApprovalDays"], Number(event.target.value))
            }
          />
        </div>
      </CardContent>
    </Card>
  );
}

function SupportPanel({ draft, onChange }: any) {
  const support = draft.support || {};
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm">Support Settings</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-1.5">
          <Label>Default ticket priority</Label>
          <Select
            value={support.defaultPriority || "medium"}
            onValueChange={(value) => onChange(["support", "defaultPriority"], value)}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {["low", "medium", "high", "urgent"].map((option) => (
                <SelectItem key={option} value={option}>
                  {option}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <Toggle
          label="Auto-assign to available admin"
          description="Distribute new tickets to admins automatically."
          checked={Boolean(support.autoAssignToAvailableAdmin)}
          onChange={(value) =>
            onChange(["support", "autoAssignToAvailableAdmin"], value)
          }
        />
        <div className="space-y-1.5">
          <Label>SLA response time (hours)</Label>
          <Input
            type="number"
            min={1}
            max={168}
            value={support.slaResponseHours ?? 24}
            onChange={(event) =>
              onChange(["support", "slaResponseHours"], Number(event.target.value))
            }
          />
        </div>
      </CardContent>
    </Card>
  );
}

function SecurityPanel({ draft, onChange }: any) {
  const security = draft.security || {};
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm">Security & Access Control</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <Toggle
          label="Require 2FA for all admins"
          description="Admins must use an authenticator app to sign in."
          checked={Boolean(security.requireTwoFactorForAdmins)}
          onChange={(value) =>
            onChange(["security", "requireTwoFactorForAdmins"], value)
          }
        />
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <Label>Session timeout (minutes)</Label>
            <Input
              type="number"
              min={5}
              max={1440}
              value={security.sessionTimeoutMinutes ?? 60}
              onChange={(event) =>
                onChange(["security", "sessionTimeoutMinutes"], Number(event.target.value))
              }
            />
          </div>
          <div className="space-y-1.5">
            <Label>Minimum password length</Label>
            <Input
              type="number"
              min={6}
              max={32}
              value={security.passwordMinLength ?? 8}
              onChange={(event) =>
                onChange(["security", "passwordMinLength"], Number(event.target.value))
              }
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function IntegrationsPanel({ draft, onChange }: any) {
  const integrations = draft.integrations || {};
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm">Integrations</CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        <Toggle
          label="Google Calendar"
          description="Sync appointments with Google Calendar."
          checked={Boolean(integrations.googleCalendar)}
          onChange={(value) => onChange(["integrations", "googleCalendar"], value)}
        />
        <Toggle
          label="Stripe"
          description="Accept payments via Stripe."
          checked={Boolean(integrations.stripe)}
          onChange={(value) => onChange(["integrations", "stripe"], value)}
        />
        <Toggle
          label="Twilio"
          description="Send SMS notifications via Twilio."
          checked={Boolean(integrations.twilio)}
          onChange={(value) => onChange(["integrations", "twilio"], value)}
        />
      </CardContent>
    </Card>
  );
}

function ProfilePanel({
  profile,
  loading,
}: {
  profile: any;
  loading: boolean;
}) {
  const queryClient = useQueryClient();
  const [name, setName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [service, setService] = useState("");
  const [file, setFile] = useState<File | null>(null);

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");

  useEffect(() => {
    if (profile) {
      setName(profile.name || "");
      setPhoneNumber(profile.phoneNumber || "");
      setService(profile.service || "Residential");
    }
  }, [profile]);

  const profileMutation = useMutation({
    mutationFn: () => {
      const formData = new FormData();
      formData.append("name", name);
      formData.append("phoneNumber", phoneNumber);
      formData.append("service", service);
      if (file) formData.append("profileImage", file);
      return userApi.updateProfile(formData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["my-profile"] });
      setFile(null);
      toast.success("Profile updated");
    },
    onError: (error: any) =>
      toast.error(error?.response?.data?.message || "Failed to update profile"),
  });

  const passwordMutation = useMutation({
    mutationFn: () =>
      userApi.changePassword({
        currentPassword,
        newPassword,
        confirmNewPassword,
      }),
    onSuccess: () => {
      setCurrentPassword("");
      setNewPassword("");
      setConfirmNewPassword("");
      toast.success("Password changed");
    },
    onError: (error: any) =>
      toast.error(error?.response?.data?.message || "Failed to change password"),
  });

  if (loading || !profile) {
    return (
      <Card>
        <CardContent className="p-6">
          <Skeleton className="h-40 w-full" />
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">My Profile</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label>Full Name</Label>
              <Input value={name} onChange={(event) => setName(event.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label>Email</Label>
              <Input value={profile.email} readOnly />
            </div>
            <div className="space-y-1.5">
              <Label>Phone Number</Label>
              <Input
                value={phoneNumber}
                onChange={(event) => setPhoneNumber(event.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <Label>Service</Label>
              <Select value={service} onValueChange={setService}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {ALLOWED_SERVICES.map((option) => (
                    <SelectItem key={option} value={option}>
                      {option}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="space-y-1.5">
            <Label>Profile photo</Label>
            <Input
              type="file"
              accept="image/*"
              onChange={(event) => setFile(event.target.files?.[0] || null)}
            />
            {profile.profileImage?.url ? (
              <p className="text-[10px] text-gray-500">
                Current: {profile.profileImage.url}
              </p>
            ) : null}
          </div>
          <Button onClick={() => profileMutation.mutate()} disabled={profileMutation.isPending}>
            <Save className="mr-1 h-3.5 w-3.5" />
            {profileMutation.isPending ? "Saving..." : "Save Profile"}
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Change Password</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-1 gap-3">
            <div className="space-y-1.5">
              <Label>Current password</Label>
              <Input
                type="password"
                value={currentPassword}
                onChange={(event) => setCurrentPassword(event.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <Label>New password</Label>
              <Input
                type="password"
                value={newPassword}
                onChange={(event) => setNewPassword(event.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <Label>Confirm new password</Label>
              <Input
                type="password"
                value={confirmNewPassword}
                onChange={(event) => setConfirmNewPassword(event.target.value)}
              />
            </div>
          </div>
          <Button
            variant="outline"
            onClick={() => passwordMutation.mutate()}
            disabled={
              !currentPassword.trim() ||
              !newPassword.trim() ||
              !confirmNewPassword.trim() ||
              passwordMutation.isPending
            }
          >
            <CheckSquare className="mr-1 h-3.5 w-3.5" />
            {passwordMutation.isPending ? "Updating..." : "Update Password"}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
