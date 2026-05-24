/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useQuery } from "@tanstack/react-query";
import { adminApi } from "@/lib/api";
import { Header } from "@/components/layout/header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { formatCurrency, getInitials, timeAgo } from "@/lib/utils";
import { Target, TrendingUp, UserCheck, Users } from "lucide-react";

function StatCard({ title, value, helper, icon: Icon, color }: any) {
  return (
    <Card>
      <CardContent className="pt-5">
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${color}`}>
            <Icon className="w-5 h-5 text-white" />
          </div>
          <div>
            <p className="text-2xl font-bold text-white">{value}</p>
            <p className="text-xs text-gray-400">{title}</p>
            <p className="text-[10px] text-emerald-400">{helper}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default function AdminDashboardPage() {
  const { data: dashboardResponse, isLoading } = useQuery({
    queryKey: ["admin-dashboard"],
    queryFn: () => adminApi.getDashboardStats().then((response) => response.data),
  });

  const dashboard = dashboardResponse?.data || {};
  const stats = [
    {
      title: "Total Customers",
      value: dashboard.totalCustomers || 0,
      helper: `${dashboard.activeCustomers || 0} active customers`,
      icon: Users,
      color: "bg-blue-600",
    },
    {
      title: "Total Partners",
      value: dashboard.totalPartners || 0,
      helper: "Active partner accounts",
      icon: UserCheck,
      color: "bg-emerald-600",
    },
    {
      title: "Total Leads",
      value: dashboard.totalLeads || 0,
      helper: `${dashboard.conversionRate || 0}% conversion rate`,
      icon: Target,
      color: "bg-purple-600",
    },
    {
      title: "Monthly Revenue",
      value: formatCurrency(dashboard.monthlyRevenue || 0, "$"),
      helper: `${formatCurrency(dashboard.totalRevenue || 0, "$")} total closed revenue`,
      icon: TrendingUp,
      color: "bg-amber-600",
    },
  ];

  return (
    <div>
      <Header
        title="Dashboard"
        subtitle="Live admin overview using backend dashboard metrics, partner records, and activity."
      />
      <div className="space-y-6 p-3 sm:p-4 lg:p-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {isLoading
            ? Array.from({ length: 4 }).map((_, index) => (
                <Card key={index}>
                  <CardContent className="pt-5">
                    <Skeleton className="h-12 w-full" />
                  </CardContent>
                </Card>
              ))
            : stats.map((stat) => <StatCard key={stat.title} {...stat} />)}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Revenue Snapshot</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="rounded-xl bg-[#1e2d40] p-4">
                <p className="text-xs text-gray-400">Total Closed Revenue</p>
                <p className="text-2xl font-bold text-white mt-1">
                  {formatCurrency(dashboard.totalRevenue || 0, "$")}
                </p>
              </div>
              <div className="rounded-xl bg-[#1e2d40] p-4">
                <p className="text-xs text-gray-400">Revenue This Month</p>
                <p className="text-2xl font-bold text-white mt-1">
                  {formatCurrency(dashboard.monthlyRevenue || 0, "$")}
                </p>
              </div>
              <div className="rounded-xl bg-[#1e2d40] p-4">
                <p className="text-xs text-gray-400">Lead Conversion Rate</p>
                <p className="text-2xl font-bold text-white mt-1">
                  {dashboard.conversionRate || 0}%
                </p>
              </div>
            </CardContent>
          </Card>

          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle className="text-base">Top Performing Partners</CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="space-y-3">
                  {Array.from({ length: 4 }).map((_, index) => (
                    <Skeleton key={index} className="h-16 w-full" />
                  ))}
                </div>
              ) : (dashboard.topPartners || []).length === 0 ? (
                <p className="text-sm text-gray-500">No active partners found.</p>
              ) : (
                <div className="space-y-0">
                  {(dashboard.topPartners || []).map((partner: any, index: number) => (
                    <div
                      key={partner._id}
                      className="flex items-center gap-3 py-2.5 border-b border-[#1e2d40] last:border-0"
                    >
                      <span className="text-xs text-gray-500 w-4 flex-shrink-0">
                        {index + 1}
                      </span>
                      <Avatar className="w-8 h-8 flex-shrink-0">
                        <AvatarFallback className="text-xs">
                          {getInitials(partner.userId?.name || partner.businessName || "SP")}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-200 truncate">
                          {partner.userId?.name || partner.businessName || "Partner"}
                        </p>
                        <p className="text-xs text-gray-500">
                          {partner.businessName || "No business name"} • {partner.tier}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium text-white">
                          {formatCurrency(partner.totalEarnings || 0, "$")}
                        </p>
                        <Badge variant="secondary" className="text-[10px] capitalize">
                          {partner.status}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-3">
                {Array.from({ length: 4 }).map((_, index) => (
                  <Skeleton key={index} className="h-14 w-full" />
                ))}
              </div>
            ) : (dashboard.recentActivity || []).length === 0 ? (
              <p className="text-sm text-gray-500">No recent activity records found.</p>
            ) : (
              <div className="space-y-3">
                {(dashboard.recentActivity || []).map((activity: any) => (
                  <div key={activity._id} className="flex items-start gap-3">
                    <Avatar className="w-8 h-8 flex-shrink-0 mt-0.5">
                      <AvatarFallback className="text-[10px]">
                        {getInitials(activity.user_id?.name || "SY")}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="text-xs text-gray-300">
                          {activity.description || activity.action || "Activity logged"}
                        </p>
                        <Badge variant="secondary" className="text-[10px] capitalize">
                          {activity.type || "other"}
                        </Badge>
                      </div>
                      <p className="text-[10px] text-gray-500 mt-1">
                        {activity.user_id?.name || "System"} •{" "}
                        {timeAgo(activity.timestamp || activity.createdAt)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
