"use client";
import { useState } from "react";
import { Header } from "@/components/layout/header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import {
  Settings, Users, Globe, Bell, Shield, GitBranch, HeadphonesIcon,
  Palette, Save, RefreshCw, Sparkles
} from "lucide-react";

const categories = [
  { id: "general", label: "General", icon: Settings, desc: "Basic platform configuration" },
  { id: "users", label: "User & Roles", icon: Users, desc: "Manage users and permissions" },
  { id: "partner", label: "Partner Settings", icon: Globe, desc: "Partner management rules" },
  { id: "customer", label: "Customer Settings", icon: Users, desc: "Customer onboarding & security" },
  { id: "sales", label: "Sales & Leads", icon: Globe, desc: "Lead and sales configuration" },
  { id: "territory", label: "Territory Settings", icon: Globe, desc: "Territory and assignment rules" },
  { id: "workflow", label: "Workflows & Automation", icon: GitBranch, desc: "Workflow and approval rules" },
  { id: "support", label: "Support Settings", icon: HeadphonesIcon, desc: "Support and ticketing rules" },
  { id: "security", label: "Security", icon: Shield, desc: "Security and access control" },
  { id: "integrations", label: "Integrations", icon: Globe, desc: "Third-party integrations" },
];

export default function SettingsPage() {
  const [activeCategory, setActiveCategory] = useState("general");
  const [platformName, setPlatformName] = useState("KoraAI");
  const [language, setLanguage] = useState("English");
  const [timezone, setTimezone] = useState("GMT+1 Europe/Berlin");
  const [maintenanceMode, setMaintenanceMode] = useState(false);
  const [platformAnnouncements, setPlatformAnnouncements] = useState(true);
  const [fromName, setFromName] = useState("KoraAI Support");
  const [fromEmail, setFromEmail] = useState("noreply@korai.com");

  function handleSave() {
    toast.success("Settings saved successfully");
  }

  function handleReset() {
    toast.info("Settings reset to default");
  }

  const active = categories.find(c => c.id === activeCategory);

  return (
    <div>
      <Header title="Settings" subtitle="Configure and manage your platform settings and preferences." />
      <div className="p-6">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-5">
          {/* Categories */}
          <Card className="lg:col-span-1">
            <CardHeader><CardTitle className="text-sm">Settings Categories</CardTitle></CardHeader>
            <CardContent className="p-2">
              {categories.map((cat) => {
                const Icon = cat.icon;
                return (
                  <button key={cat.id} onClick={() => setActiveCategory(cat.id)}
                    className={`w-full flex items-start gap-2.5 px-3 py-2.5 rounded-lg text-left transition-colors mb-0.5 ${activeCategory === cat.id ? "bg-blue-600/20 text-blue-400 border border-blue-600/20" : "text-gray-400 hover:bg-[#1e2d40] hover:text-gray-200"}`}>
                    <Icon className="w-4 h-4 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-xs font-medium">{cat.label}</p>
                      <p className="text-[10px] text-gray-500">{cat.desc}</p>
                    </div>
                  </button>
                );
              })}
            </CardContent>
          </Card>

          {/* Settings Content */}
          <div className="lg:col-span-2 space-y-4">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm">General Settings</CardTitle>
                  <p className="text-xs text-gray-500">Configure the basic settings for your platform.</p>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label>Platform Name</Label>
                    <Input value={platformName} onChange={(e) => setPlatformName(e.target.value)} />
                  </div>
                  <div className="space-y-1.5">
                    <Label>Default Language</Label>
                    <Input value={language} onChange={(e) => setLanguage(e.target.value)} />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <Label>Platform Logo</Label>
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-blue-600 flex items-center justify-center">
                      <Sparkles className="w-6 h-6 text-white" />
                    </div>
                    <div className="flex gap-2">
                      <Button variant="secondary" size="sm">Upload/Change</Button>
                      <Button variant="outline" size="sm">Remove</Button>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label>Timezone</Label>
                    <Input value={timezone} onChange={(e) => setTimezone(e.target.value)} />
                  </div>
                  <div className="space-y-1.5">
                    <Label>Primary Color</Label>
                    <div className="flex gap-2">
                      {["#4F6BE3", "#10B981", "#8B5CF6"].map((c) => (
                        <div key={c} className="w-8 h-8 rounded-lg border-2 border-[#2a3547] cursor-pointer" style={{ backgroundColor: c }} />
                      ))}
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between py-2 border-b border-[#1e2d40]">
                    <div>
                      <p className="text-sm text-gray-200">Enable Maintenance Mode</p>
                      <p className="text-xs text-gray-500">Will make only administrators accessible on the platform</p>
                    </div>
                    <button onClick={() => setMaintenanceMode(!maintenanceMode)}
                      className={`w-10 h-5 rounded-full transition-colors ${maintenanceMode ? "bg-blue-600" : "bg-[#2a3547]"}`}>
                      <div className={`w-4 h-4 bg-white rounded-full transition-transform mx-0.5 ${maintenanceMode ? "translate-x-5" : "translate-x-0"}`} />
                    </button>
                  </div>
                  <div className="flex items-center justify-between py-2">
                    <div>
                      <p className="text-sm text-gray-200">Show Platform Announcements</p>
                      <p className="text-xs text-gray-500">Display important announcements to all users</p>
                    </div>
                    <button onClick={() => setPlatformAnnouncements(!platformAnnouncements)}
                      className={`w-10 h-5 rounded-full transition-colors ${platformAnnouncements ? "bg-blue-600" : "bg-[#2a3547]"}`}>
                      <div className={`w-4 h-4 bg-white rounded-full transition-transform mx-0.5 ${platformAnnouncements ? "translate-x-5" : "translate-x-0"}`} />
                    </button>
                  </div>
                </div>

                <Button onClick={handleSave} className="w-full"><Save className="w-4 h-4" />Save Changes</Button>
              </CardContent>
            </Card>

            {/* Email Settings */}
            <Card>
              <CardHeader><CardTitle className="text-sm">Email Settings</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label>From Name</Label>
                    <Input value={fromName} onChange={(e) => setFromName(e.target.value)} />
                  </div>
                  <div className="space-y-1.5">
                    <Label>From Email</Label>
                    <Input value={fromEmail} onChange={(e) => setFromEmail(e.target.value)} />
                  </div>
                  <div className="space-y-1.5">
                    <Label>Email Provider</Label>
                    <Input value="SendGrid" readOnly />
                  </div>
                  <div className="space-y-1.5">
                    <Label>Reply-To Email</Label>
                    <Input value="support@korai.com" />
                  </div>
                </div>
                <div className="flex items-center gap-2 text-xs text-gray-400">
                  <span>✉ Test Email Settings</span>
                  <span className="text-gray-500">Last tested May 31, 2025 10:00 PM</span>
                  <Button variant="ghost" size="icon" className="h-6 w-6"><RefreshCw className="w-3 h-3" /></Button>
                </div>
                <Button onClick={handleSave}><Save className="w-4 h-4" />Save Changes</Button>
              </CardContent>
            </Card>
          </div>

          {/* Right Panel */}
          <div className="space-y-4">
            {/* Actions */}
            <div className="flex gap-2">
              <Button variant="outline" onClick={handleReset}><RefreshCw className="w-4 h-4" />Reset to Default</Button>
              <Button onClick={handleSave}><Save className="w-4 h-4" />Save Changes</Button>
            </div>

            {/* Settings Overview */}
            <Card>
              <CardHeader><CardTitle className="text-sm">Settings Overview</CardTitle></CardHeader>
              <CardContent>
                <p className="text-xs text-gray-400 mb-3">These settings define the basic configuration of your platform. Changes may affect all users.</p>
                <div className="space-y-1.5">
                  {["This setting effects:", "All Partners", "All Customers", "All Administrators", "System Workflows"].map((e, i) => (
                    <div key={e} className="flex items-center gap-2 text-xs">
                      {i === 0 ? <span className="text-gray-400">{e}</span> : (
                        <><span className="w-1.5 h-1.5 rounded-full bg-emerald-500 flex-shrink-0" /><span className="text-gray-300">{e}</span></>
                      )}
                    </div>
                  ))}
                </div>
                <div className="mt-3 p-2 bg-amber-600/10 border border-amber-600/20 rounded-lg">
                  <p className="text-xs text-amber-400">⚠ Important: Changes to these settings require re-authentication from all administrators.</p>
                </div>
              </CardContent>
            </Card>

            {/* Kora Assistant */}
            <Card className="border-blue-600/20">
              <CardContent className="pt-4">
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-lg">🤖</span>
                  <p className="text-sm font-medium text-white">Kora Assistant</p>
                </div>
                <div className="space-y-2 mb-3">
                  <div className="bg-emerald-600/10 rounded-lg p-2">
                    <p className="text-xs text-emerald-400">✓ AI Recommendations: Your platform is running as expected and professionally set up!</p>
                  </div>
                  <div className="bg-blue-600/10 rounded-lg p-2">
                    <p className="text-xs text-blue-400">+ Suggested Action: Consider enabling maintenance mode during updates to prevent user disruption.</p>
                  </div>
                </div>
                <button className="text-xs text-blue-400 hover:text-blue-300">View All Recommendations →</button>
              </CardContent>
            </Card>

            {/* Change History */}
            <Card>
              <CardHeader>
                <div className="flex justify-between"><CardTitle className="text-sm">Change History</CardTitle><button className="text-xs text-blue-400">View all</button></div>
              </CardHeader>
              <CardContent>
                {[
                  { user: "Admin Dave", action: "Updated platform.name", time: "May 31, 2025 10:00 AM" },
                  { user: "Admin Dave", action: "Changed primary color", time: "May 30, 2025 06:15 PM" },
                  { user: "System", action: "Initial settings configured", time: "May 13, 2025 09:00 AM" },
                ].map((h, i) => (
                  <div key={i} className="flex items-start gap-2 py-2 border-b border-[#1e2d40] last:border-0">
                    <div className="w-5 h-5 rounded-full bg-[#1e2d40] flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span className="text-[8px] text-gray-400">{h.user[0]}</span>
                    </div>
                    <div>
                      <p className="text-xs text-gray-300">{h.user}: {h.action}</p>
                      <p className="text-[10px] text-gray-500">{h.time}</p>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
