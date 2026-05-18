"use client";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { workflowsApi } from "@/lib/api";
import { Header } from "@/components/layout/header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { Plus, Users, Settings, GitBranch, Zap, HeadphonesIcon, CheckSquare, TrendingUp, Clock, RefreshCw } from "lucide-react";

const workflowGroups = [
  {
    id: 1,
    title: "1. Partner Management",
    workflows: [
      { id: "w1", icon: Users, color: "bg-blue-600", title: "Create Partner", desc: "Add a new partner to the system", tag: "" },
      { id: "w2", icon: MapPin, color: "bg-green-600", title: "Assign Territory", desc: "Assign territory to a partner", tag: "Popular" },
      { id: "w3", icon: RefreshCw, color: "bg-orange-600", title: "Reassign Partner", desc: "Move partner to another setup", tag: "Popular" },
      { id: "w4", icon: TrendingUp, color: "bg-red-600", title: "Change Commission", desc: "Update/optimize the commission rates", tag: "" },
      { id: "w5", icon: Users, color: "bg-purple-600", title: "Impersonate Partner", desc: "Login customer to view dashboard", tag: "" },
    ],
  },
  {
    id: 2,
    title: "2. Customer Management",
    workflows: [
      { id: "w6", icon: Users, color: "bg-blue-600", title: "Create Customer", desc: "Add a new customer to the system", tag: "" },
      { id: "w7", icon: Settings, color: "bg-purple-600", title: "Edit Customer Data", desc: "Update customer information", tag: "" },
      { id: "w8", icon: Lock, color: "bg-amber-600", title: "Reset Password", desc: "Reset customer's high-privileged password", tag: "Popular" },
      { id: "w9", icon: XCircle, color: "bg-red-600", title: "Cancel Subscription", desc: "Cancel/refund a customer subscription", tag: "" },
      { id: "w10", icon: Users, color: "bg-emerald-600", title: "Impersonate Customer", desc: "Login customer to view account", tag: "Popular" },
    ],
  },
  {
    id: 3,
    title: "3. Sales Control",
    workflows: [
      { id: "w11", icon: GitBranch, color: "bg-blue-600", title: "Reassign Leads", desc: "Reassign leads to another partner", tag: "Popular" },
      { id: "w12", icon: GitBranch, color: "bg-purple-600", title: "Bulk Assign Leads", desc: "Assign multiple leads at once", tag: "" },
      { id: "w13", icon: Settings, color: "bg-amber-600", title: "Change Lead Status", desc: "Update the status of a lead", tag: "" },
      { id: "w14", icon: Download, color: "bg-cyan-600", title: "Import Leads", desc: "Import leads from CSV or other source", tag: "" },
      { id: "w15", icon: GitBranch, color: "bg-green-600", title: "Force Close Deal", desc: "Manually close a deal", tag: "" },
    ],
  },
  {
    id: 4,
    title: "4. Territory Control",
    workflows: [
      { id: "w16", icon: MapPin, color: "bg-blue-600", title: "Create Territory", desc: "Draw and create new territory", tag: "Popular" },
      { id: "w17", icon: Settings, color: "bg-amber-600", title: "Edit Boundaries", desc: "Modify territory boundaries", tag: "" },
      { id: "w18", icon: RefreshCw, color: "bg-purple-600", title: "Resolve Overlap", desc: "Fix overlapping territory", tag: "" },
      { id: "w19", icon: Users, color: "bg-green-600", title: "Assign Territory", desc: "Assign territory to a partner", tag: "" },
      { id: "w20", icon: XCircle, color: "bg-red-600", title: "Remove Territory", desc: "Delete territory from system", tag: "" },
    ],
  },
  {
    id: 5,
    title: "5. System Operations",
    workflows: [
      { id: "w21", icon: Zap, color: "bg-amber-600", title: "Trigger Automation", desc: "Manually trigger automation", tag: "Popular" },
      { id: "w22", icon: RefreshCw, color: "bg-blue-600", title: "Resync Data", desc: "Sync data across all systems", tag: "" },
      { id: "w23", icon: Settings, color: "bg-red-600", title: "System Cleanup", desc: "Clean up old logs and data", tag: "" },
      { id: "w24", icon: TrendingUp, color: "bg-green-600", title: "Recalculate Metrics", desc: "Rebuild metrics and statistics", tag: "" },
    ],
  },
  {
    id: 6,
    title: "6. Support Actions",
    workflows: [
      { id: "w25", icon: Lock, color: "bg-red-600", title: "Unlock Account", desc: "Immediately unlock a customer account - Admin approval required", tag: "" },
      { id: "w26", icon: RefreshCw, color: "bg-green-600", title: "Refund Request", desc: "Process refund for customer", tag: "" },
      { id: "w27", icon: Settings, color: "bg-purple-600", title: "Escalate Issue", desc: "Escalate issue to higher level", tag: "" },
      { id: "w28", icon: Zap, color: "bg-amber-600", title: "Manual Fix", desc: "Apply manual fix to an issue", tag: "" },
    ],
  },
];

function MapPin({ className }: any) { return <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>; }
function Lock({ className }: any) { return <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>; }
function XCircle({ className }: any) { return <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>; }
function Download({ className }: any) { return <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>; }

export default function WorkflowsPage() {
  const { data, isLoading } = useQuery({
    queryKey: ["workflows"],
    queryFn: () => workflowsApi.getAll().then((r) => r.data),
  });

  const recentActivity = [
    { text: "Reassign leads to Michael Brown", status: "Completed", time: "2 min ago", color: "text-emerald-400" },
    { text: "Reset password for Sarah Mitchell", status: "Completed", time: "15 min ago", color: "text-emerald-400" },
    { text: "Assigned territory to Alex Anderson", status: "Completed", time: "1 hour ago", color: "text-emerald-400" },
    { text: "Change commission rate for David Wilson", status: "In Progress", time: "2 hours ago", color: "text-amber-400" },
    { text: "Bulk assign leads to Lisa Martinez", status: "Pending", time: "30 min ago", color: "text-blue-400" },
  ];

  return (
    <div>
      <Header title="Workflows" subtitle="Execute powerful actions and manage system workflows." />
      <div className="p-6">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-5">
          {/* Workflows Grid */}
          <div className="lg:col-span-3 space-y-6">
            {workflowGroups.map((group) => (
              <div key={group.id}>
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-semibold text-gray-200">{group.title}</h3>
                  <button className="text-xs text-blue-400 hover:text-blue-300">View All</button>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
                  {group.workflows.map((wf) => {
                    const Icon = wf.icon;
                    return (
                      <Card key={wf.id} className="hover:border-blue-600/40 transition-colors cursor-pointer group">
                        <CardContent className="p-3">
                          <div className="flex items-start justify-between mb-2">
                            <div className={`w-8 h-8 rounded-lg ${wf.color} flex items-center justify-center`}>
                              <Icon className="w-4 h-4 text-white" />
                            </div>
                            {wf.tag && (
                              <span className="text-[9px] px-1.5 py-0.5 bg-blue-600/20 text-blue-400 rounded-full">{wf.tag}</span>
                            )}
                          </div>
                          <p className="text-xs font-medium text-gray-200 mb-1">{wf.title}</p>
                          <p className="text-[10px] text-gray-500 leading-relaxed">{wf.desc}</p>
                          <button
                            onClick={() => toast.info(`Starting workflow: ${wf.title}`)}
                            className="mt-2 text-[10px] text-blue-400 hover:text-blue-300 opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            Start Workflow →
                          </button>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>

          {/* Right Panel */}
          <div className="space-y-4">
            {/* Workflow Activity */}
            <Card>
              <CardHeader>
                <div className="flex justify-between">
                  <CardTitle className="text-sm">Workflow Activity</CardTitle>
                  <button className="text-xs text-blue-400">View All</button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {recentActivity.map((a, i) => (
                    <div key={i} className="flex items-start gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-1.5 flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="text-xs text-gray-300 truncate">{a.text}</p>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className={`text-[10px] font-medium ${a.color}`}>{a.status}</span>
                          <span className="text-[10px] text-gray-500">{a.time}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Workflow Insights */}
            <Card>
              <CardHeader><CardTitle className="text-sm">Workflow Insights</CardTitle></CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {[
                    { label: "Workflows Executed Today", value: "24", change: "+8% vs yesterday", color: "text-emerald-400" },
                    { label: "Pending Approvals", value: "8", note: "Requires your action", color: "text-amber-400" },
                    { label: "Success Rate", value: "98.2%", note: "Last 30 days", color: "text-emerald-400" },
                    { label: "Avg. Completion Time", value: "2m 34s", change: "+3% vs last 30 days", color: "text-blue-400" },
                  ].map((item) => (
                    <div key={item.label} className="flex justify-between py-1.5 border-b border-[#1e2d40] last:border-0">
                      <span className="text-xs text-gray-400">{item.label}</span>
                      <div className="text-right">
                        <p className="text-xs font-medium text-gray-200">{item.value}</p>
                        <p className={`text-[10px] ${item.color}`}>{item.change || item.note}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card>
              <CardHeader><CardTitle className="text-sm">Quick Actions</CardTitle></CardHeader>
              <CardContent className="space-y-2">
                {[
                  { label: "New Workflow Wizard", desc: "Browse all executed workflows" },
                  { label: "Workflow Approvals", desc: "Review pending approvals", badge: "1" },
                  { label: "Workflow Templates", desc: "Manage workflow templates" },
                ].map((a) => (
                  <button key={a.label} onClick={() => toast.info(a.label)}
                    className="w-full flex items-center gap-2 p-2.5 rounded-lg hover:bg-[#1e2d40] transition-colors text-left">
                    <div className="w-7 h-7 rounded-lg bg-[#1e2d40] flex items-center justify-center flex-shrink-0">
                      <GitBranch className="w-3.5 h-3.5 text-blue-400" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium text-gray-200">{a.label}</p>
                      <p className="text-[10px] text-gray-500">{a.desc}</p>
                    </div>
                    {a.badge && (
                      <span className="text-[10px] bg-amber-600/20 text-amber-400 px-1.5 py-0.5 rounded-full">{a.badge}</span>
                    )}
                  </button>
                ))}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
