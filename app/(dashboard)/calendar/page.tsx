/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import Image from "next/image";
import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import { appointmentsApi, employeesApi } from "@/lib/api";
import { Header } from "@/components/layout/header";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { asArray, getInitials } from "@/lib/utils";
import {
  AlertTriangle,
  BarChart3,
  Bell,
  Bot,
  CalendarDays,
  CalendarPlus,
  CheckSquare,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Filter,
  Globe2,
  Eye,
  LocateFixed,
  MoreHorizontal,
  Palette,
  Plus,
  RefreshCw,
  Send,
  Settings,
  Settings2,
  ShieldCheck,
  User,
} from "lucide-react";
import { CreateAppointmentDialog } from "@/components/create-appointment-dialog";
import { AppointmentDetailsDialog } from "@/components/appointment-details-dialog";

const VIEWS = ["Day", "Week", "Month", "Agenda"] as const;
const DAY_LABELS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const HOURS = Array.from({ length: 11 }, (_, index) => 9 + index);

const TEAM_COLOR_POOL = [
  "#3b82f6",
  "#22c55e",
  "#f97316",
  "#a855f7",
  "#ec4899",
  "#14b8a6",
  "#f59e0b",
  "#10b981",
];

const startOfWeek = (date: Date) => {
  const next = new Date(date);
  const day = next.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  next.setDate(next.getDate() + diff);
  next.setHours(0, 0, 0, 0);
  return next;
};

const endOfWeek = (date: Date) => {
  const next = startOfWeek(date);
  next.setDate(next.getDate() + 6);
  next.setHours(23, 59, 59, 999);
  return next;
};

const startOfMonthGrid = (date: Date) => startOfWeek(new Date(date.getFullYear(), date.getMonth(), 1));

const endOfMonthGrid = (date: Date) => {
  const end = endOfWeek(new Date(date.getFullYear(), date.getMonth() + 1, 0));
  end.setHours(23, 59, 59, 999);
  return end;
};

const isSameDay = (first: Date, second: Date) =>
  first.getFullYear() === second.getFullYear() &&
  first.getMonth() === second.getMonth() &&
  first.getDate() === second.getDate();

const formatMonthDay = (date: Date) =>
  date.toLocaleDateString("en-US", { month: "short", day: "numeric" });

const formatHourLabel = (hour: number) => `${String(hour).padStart(2, "0")}:00`;

const formatRange = (start: string, end: string) => {
  if (!start || !end) return "";
  return `${start.slice(0, 5)} - ${end.slice(0, 5)}`;
};

const STATUS_FILTERS = ["all", "upcoming", "started", "completed", "cancelled"] as const;

const APPOINTMENT_TYPE_PRESETS = [
  { name: "Internal Meeting", color: "#2563eb", duration: "60 min", visibility: "Admin" },
  { name: "Partner Review", color: "#7c3aed", duration: "60 min", visibility: "Partners" },
  { name: "Customer Success Review", color: "#16a34a", duration: "45 min", visibility: "Customers" },
  { name: "System Maintenance", color: "#f97316", duration: "All day", visibility: "Platform" },
  { name: "Executive Briefing", color: "#ec4899", duration: "30 min", visibility: "Admin" },
];

export default function CalendarPage() {
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showAppointmentTypesDialog, setShowAppointmentTypesDialog] = useState(false);
  const [showCalendarSettingsDialog, setShowCalendarSettingsDialog] = useState(false);
  const [appointmentTypes, setAppointmentTypes] = useState(APPOINTMENT_TYPE_PRESETS);
  const [newAppointmentType, setNewAppointmentType] = useState("");
  const [newAppointmentTypeDuration, setNewAppointmentTypeDuration] = useState("60 min");
  const [newAppointmentTypeVisibility, setNewAppointmentTypeVisibility] = useState("Admin");
  const [newAppointmentTypeColor, setNewAppointmentTypeColor] = useState("#2563eb");
  const [appointmentDefaultDate, setAppointmentDefaultDate] = useState<Date | null>(null);
  const [detailsId, setDetailsId] = useState<string | null>(null);
  const [view, setView] = useState<(typeof VIEWS)[number]>("Week");
  const [weekAnchor, setWeekAnchor] = useState(() => startOfWeek(new Date()));
  const [selectedDayIndex, setSelectedDayIndex] = useState<number | null>(null);
  const [selectedEmployees, setSelectedEmployees] = useState<Set<string>>(new Set());
  const [assistantInput, setAssistantInput] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [statusFilter, setStatusFilter] = useState<(typeof STATUS_FILTERS)[number]>("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [calendarSettings, setCalendarSettings] = useState({
    defaultView: "Week",
    timeZone: "UTC",
    weekStartsOn: "Monday",
    workingStart: "09:00",
    workingEnd: "18:00",
    defaultDuration: "60",
    reminder: "15",
    eventDensity: "Detailed",
    syncGoogle: true,
    showWeekends: true,
    showDeclined: true,
    platformVisibility: "All calendars",
    adminApproval: true,
    partnerCanEdit: false,
  });
  const now = useMemo(() => new Date(), []);

  const weekStart = weekAnchor;
  const weekEnd = useMemo(() => endOfWeek(weekStart), [weekStart]);
  const rangeStart = useMemo(
    () => (view === "Month" ? startOfMonthGrid(weekAnchor) : weekStart),
    [view, weekAnchor, weekStart]
  );
  const rangeEnd = useMemo(
    () => (view === "Month" ? endOfMonthGrid(weekAnchor) : weekEnd),
    [view, weekAnchor, weekEnd]
  );

  const days = useMemo(
    () =>
      Array.from({ length: 7 }, (_, index) => {
        const current = new Date(weekStart);
        current.setDate(weekStart.getDate() + index);
        return current;
      }),
    [weekStart]
  );

  const monthDays = useMemo(
    () =>
      Array.from({ length: 42 }, (_, index) => {
        const current = new Date(startOfMonthGrid(weekAnchor));
        current.setDate(current.getDate() + index);
        return current;
      }),
    [weekAnchor]
  );

  const { data: appointmentsResponse, isLoading: appointmentsLoading } = useQuery({
    queryKey: ["calendar-appointments", rangeStart.toISOString(), rangeEnd.toISOString()],
    queryFn: () =>
      appointmentsApi
        .getAll({
          startDate: rangeStart.toISOString(),
          endDate: rangeEnd.toISOString(),
          limit: 200,
        })
        .then((response) => response.data),
  });

  const { data: employeesResponse } = useQuery({
    queryKey: ["calendar-team"],
    queryFn: () => employeesApi.getAll({ limit: 50 }).then((response) => response.data),
  });

  const appointments: any[] = asArray(
    appointmentsResponse?.data?.appointments ||
      appointmentsResponse?.data?.data?.appointments ||
      appointmentsResponse?.data
  );
  const employees: any[] = asArray(
    employeesResponse?.data?.employees ||
      employeesResponse?.data?.data?.employees ||
      employeesResponse?.data
  );

  const teamMembers = useMemo(() => {
    if (!employees.length) {
      return Array.from({ length: 5 }, (_, index) => ({
        id: `partner-${index + 1}`,
        name: `Partner ${index + 1}`,
        color: TEAM_COLOR_POOL[index % TEAM_COLOR_POOL.length],
        imageUrl: "",
      }));
    }

    return employees.slice(0, 5).map((employee, index) => ({
      id: String(employee.userId?._id || employee._id || index),
      name: employee.userId?.name || employee.name || `Partner ${index + 1}`,
      imageUrl: employee.userId?.profileImage?.url || employee.profileImage?.url || "",
      color: TEAM_COLOR_POOL[index % TEAM_COLOR_POOL.length],
    }));
  }, [employees]);

  const memberColorMap = useMemo(() => {
    const map = new Map<string, string>();
    teamMembers.forEach((member) => map.set(member.id, member.color));
    return map;
  }, [teamMembers]);

  const appointmentTitle = (appointment: any) =>
    appointment.customer?.name ||
    appointment.client?.name ||
    appointment.title ||
    "Appointment";

  const appointmentMeta = (appointment: any) => {
    if (typeof appointment.service === "string") return appointment.service;
    if (appointment.service?.name) return appointment.service.name;
    return appointment.location || appointment.type || "";
  };

  const filteredAppointments = useMemo(() => {
    return appointments.filter((appointment) => {
      const employeeId = String(
        appointment.employee?._id ||
          appointment.employee?.userId?._id ||
          appointment.employee ||
          ""
      );
      if (selectedEmployees.size > 0 && !selectedEmployees.has(employeeId)) {
        return false;
      }
      if (statusFilter !== "all" && appointment.status !== statusFilter) {
        return false;
      }
      if (typeFilter !== "all" && appointmentMeta(appointment) !== typeFilter) {
        return false;
      }
      return true;
    });
  }, [appointments, selectedEmployees, statusFilter, typeFilter]);

  const typeOptions = useMemo(() => {
    const values = new Set<string>();
    appointments.forEach((appointment) => {
      const type = appointmentMeta(appointment);
      if (type) values.add(type);
    });
    return Array.from(values).sort();
  }, [appointments]);

  const dayBuckets = useMemo(
    () =>
      days.map((day) => {
        const dayAppointments = filteredAppointments.filter((appointment) => {
          const dateValue = new Date(appointment.appointmentDate || appointment.start_time);
          return isSameDay(dateValue, day);
        });

        return {
          day,
          appointments: dayAppointments,
          capacity: Math.min(120, Math.round((dayAppointments.length / 8) * 100)),
        };
      }),
    [days, filteredAppointments]
  );

  const selectedDay = useMemo(() => {
    if (selectedDayIndex === null) {
      const todayIndex = dayBuckets.findIndex((bucket) => isSameDay(bucket.day, now));
      if (todayIndex >= 0) return dayBuckets[todayIndex];
      return dayBuckets[0] || null;
    }

    return dayBuckets[selectedDayIndex] || null;
  }, [dayBuckets, now, selectedDayIndex]);

  const isCurrentWeek = useMemo(
    () => days.some((day) => isSameDay(day, now)),
    [days, now]
  );
  const currentHour = now.getHours();
  const currentMinuteOffset = `${Math.max(6, Math.min(94, (now.getMinutes() / 60) * 100))}%`;
  const selectedDayAppointments = selectedDay?.appointments || [];
  const busiestDay = useMemo(
    () =>
      dayBuckets.reduce(
        (best, bucket) =>
          bucket.appointments.length > best.appointments.length ? bucket : best,
        dayBuckets[0] || { day: now, appointments: [], capacity: 0 }
      ),
    [dayBuckets, now]
  );
  const conflictCount = useMemo(() => {
    let count = 0;
    dayBuckets.forEach((bucket) => {
      const seen = new Set<string>();
      bucket.appointments.forEach((appointment) => {
        const employeeId = String(appointment.employee?._id || appointment.employee || "unknown");
        const key = `${employeeId}-${appointment.startTime}-${appointment.endTime}`;
        if (seen.has(key)) count += 1;
        seen.add(key);
      });
    });
    return count;
  }, [dayBuckets]);
  const insightCards = [
    {
      title: "Busiest Day",
      value: busiestDay.day.toLocaleDateString("en-US", { weekday: "long" }),
      detail: `${busiestDay.appointments.length} events scheduled`,
      icon: BarChart3,
      tone: "text-blue-300 bg-blue-500/15",
    },
    {
      title: "Appointment Volume",
      value: String(filteredAppointments.length),
      detail: "events in current range",
      icon: CalendarDays,
      tone: "text-emerald-300 bg-emerald-500/15",
    },
    {
      title: "Capacity Alerts",
      value: String(dayBuckets.filter((bucket) => bucket.capacity >= 80).length),
      detail: "days near or over capacity",
      icon: AlertTriangle,
      tone: "text-amber-300 bg-amber-500/15",
    },
    {
      title: "Conflicts",
      value: String(conflictCount),
      detail: "overlapping schedule slots",
      icon: CheckSquare,
      tone: "text-cyan-300 bg-cyan-500/15",
    },
  ];

  const openCreateAppointmentDialog = (date?: Date | null) => {
    setAppointmentDefaultDate(date || selectedDay?.day || null);
    setShowCreateDialog(true);
  };

  const navigateWeek = (delta: number) => {
    setWeekAnchor((current) => {
      const next = new Date(current);
      next.setDate(next.getDate() + delta * 7);
      return startOfWeek(next);
    });
  };

  const toggleMember = (id: string) => {
    setSelectedEmployees((current) => {
      const next = new Set(current);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const employeeColor = (appointment: any) => {
    if (appointment.color) return appointment.color;
    const employeeId = String(
      appointment.employee?._id ||
        appointment.employee?.userId?._id ||
        appointment.employee ||
        ""
    );
    return memberColorMap.get(employeeId) || TEAM_COLOR_POOL[0];
  };

  const updateCalendarSetting = (key: keyof typeof calendarSettings, value: string | boolean) => {
    setCalendarSettings((current) => ({ ...current, [key]: value }));
  };

  return (
    <div>
      <Header
        title="Calendar"
        subtitle="Manage your schedule and view all calendars across the platform."
        action={
          <div className="flex items-center overflow-hidden rounded-lg bg-blue-700">
            <Button
              size="sm"
              className="h-10 rounded-none bg-blue-700 px-5 text-sm hover:bg-blue-600"
              onClick={() => openCreateAppointmentDialog()}
            >
              <Plus className="mr-2 h-4 w-4" />
              Create Appointment
            </Button>
            <button
              className="flex h-10 w-11 items-center justify-center border-l border-blue-500/60 text-white hover:bg-blue-600"
              onClick={() => openCreateAppointmentDialog()}
              aria-label="More create options"
            >
              <ChevronDown className="h-4 w-4" />
            </button>
          </div>
        }
      />

      <div className="space-y-5 p-3 sm:p-4 lg:p-6">
        <div className="grid grid-cols-1 gap-5 2xl:grid-cols-[minmax(0,1fr)_280px]">
          <div className="min-w-0 space-y-4">
            <div className="flex flex-wrap items-center gap-4">
              <div className="flex overflow-hidden rounded-lg border border-[#183657] bg-[#071321]">
                {VIEWS.map((option) => (
                  <button
                    key={option}
                    onClick={() => setView(option)}
                    className={`h-9 min-w-20 border-r border-[#112842] px-4 text-xs font-medium last:border-r-0 ${
                      view === option
                        ? "bg-blue-600 text-white"
                        : "text-gray-300 hover:bg-[#0d1a2d]"
                    }`}
                  >
                    {option === "Day" ? "Today" : option}
                  </button>
                ))}
              </div>

              <div className="flex items-center overflow-hidden rounded-lg border border-[#183657] bg-[#071321]">
                <button
                  onClick={() => navigateWeek(-1)}
                  className="flex h-9 w-10 items-center justify-center text-gray-300 hover:bg-[#0d1a2d]"
                  aria-label="Previous week"
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>
                <span className="border-x border-[#112842] px-5 text-sm font-medium text-gray-100">
                  {formatMonthDay(weekStart)} - {formatMonthDay(weekEnd)}, {weekEnd.getFullYear()}
                </span>
                <button
                  onClick={() => navigateWeek(1)}
                  className="flex h-9 w-10 items-center justify-center text-gray-300 hover:bg-[#0d1a2d]"
                  aria-label="Next week"
                >
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>

              <div className="ml-auto flex items-center gap-3">
                <Button
                  variant="outline"
                  size="sm"
                  className="h-9 gap-2 text-xs"
                  onClick={() => setShowFilters((value) => !value)}
                >
                  <Filter className="h-4 w-4" />
                  Filters
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  className="h-9 w-9"
                  aria-label="Calendar settings"
                >
                  <Settings className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <div>
              <p className="mb-2 text-xs font-medium text-gray-300">View Calendar</p>
              <div className="flex flex-wrap items-center gap-2">
                <button
                  onClick={() => setSelectedEmployees(new Set())}
                  className={`flex h-11 items-center gap-2 rounded-lg border px-3 text-left transition-colors ${
                    selectedEmployees.size === 0
                      ? "border-blue-500 bg-[#061c3f]"
                      : "border-[#183657] bg-[#071321] hover:bg-[#0d1a2d]"
                  }`}
                >
                  <Avatar className="h-6 w-6">
                    <AvatarFallback className="bg-blue-600 text-[10px] text-white">
                      AU
                    </AvatarFallback>
                  </Avatar>
                  <span className="text-xs font-medium text-gray-100">
                    My Calendar (Admin)
                  </span>
                  <span className="h-2 w-2 rounded-full bg-blue-400" />
                  <ChevronDown className="h-3.5 w-3.5 text-gray-400" />
                </button>

                {teamMembers.map((member) => {
                  const isActive = selectedEmployees.has(member.id);
                  return (
                    <button
                      key={member.id}
                      onClick={() => toggleMember(member.id)}
                      className={`flex h-11 items-center gap-2 rounded-lg border px-3 transition-colors ${
                        isActive
                          ? "border-blue-500 bg-[#061c3f]"
                          : "border-[#183657] bg-[#071321] hover:bg-[#0d1a2d]"
                      }`}
                    >
                      <Avatar className="h-6 w-6">
                        {member.imageUrl ? (
                          <AvatarImage src={member.imageUrl} alt={member.name} />
                        ) : null}
                        <AvatarFallback
                          className="text-[9px]"
                          style={{
                            backgroundColor: `${member.color}33`,
                            color: member.color,
                          }}
                        >
                          {getInitials(member.name)}
                        </AvatarFallback>
                      </Avatar>
                      <span className="text-xs font-medium text-gray-200">{member.name}</span>
                      <span className="h-2 w-2 rounded-full" style={{ background: member.color }} />
                    </button>
                  );
                })}

                <button
                  onClick={() => openCreateAppointmentDialog()}
                  className="flex h-11 w-11 items-center justify-center rounded-lg border border-[#183657] bg-[#071321] text-gray-300 hover:bg-[#0d1a2d] hover:text-white"
                  aria-label="Add calendar"
                >
                  <Plus className="h-4 w-4" />
                </button>
              </div>
            </div>

            {showFilters ? (
              <div className="grid gap-3 rounded-lg border border-[#16314f] bg-[#071321] p-3 md:grid-cols-3">
                <div>
                  <p className="mb-2 text-xs font-medium text-gray-300">Status</p>
                  <div className="flex flex-wrap gap-2">
                    {STATUS_FILTERS.map((status) => (
                      <button
                        key={status}
                        onClick={() => setStatusFilter(status)}
                        className={`rounded-md px-3 py-1.5 text-xs capitalize ${
                          statusFilter === status
                            ? "bg-blue-600 text-white"
                            : "bg-[#0d1a2d] text-gray-300 hover:bg-[#102944]"
                        }`}
                      >
                        {status.replace(/_/g, " ")}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <p className="mb-2 text-xs font-medium text-gray-300">Event Type</p>
                  <div className="flex flex-wrap gap-2">
                    {["all", ...typeOptions].map((type) => (
                      <button
                        key={type}
                        onClick={() => setTypeFilter(type)}
                        className={`rounded-md px-3 py-1.5 text-xs ${
                          typeFilter === type
                            ? "bg-blue-600 text-white"
                            : "bg-[#0d1a2d] text-gray-300 hover:bg-[#102944]"
                        }`}
                      >
                        {type === "all" ? "All types" : type}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <p className="mb-2 text-xs font-medium text-gray-300">Date Range</p>
                  <div className="rounded-md bg-[#0d1a2d] px-3 py-2 text-xs text-gray-300">
                    {view === "Month"
                      ? `${formatMonthDay(rangeStart)} - ${formatMonthDay(rangeEnd)}`
                      : `${formatMonthDay(weekStart)} - ${formatMonthDay(weekEnd)}`}
                  </div>
                </div>
              </div>
            ) : null}

            <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
              {insightCards.map((insight) => (
                <div
                  key={insight.title}
                  className="flex min-w-0 items-center gap-3 rounded-lg border border-[#16314f] bg-[#071321] p-3"
                >
                  <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${insight.tone}`}>
                    <insight.icon className="h-4 w-4" />
                  </span>
                  <div className="min-w-0">
                    <p className="truncate text-[11px] font-medium text-gray-400">{insight.title}</p>
                    <p className="truncate text-sm font-semibold text-gray-100">{insight.value}</p>
                    <p className="truncate text-[11px] text-gray-500">{insight.detail}</p>
                  </div>
                </div>
              ))}
            </div>

            <Card className="overflow-hidden rounded-lg border-[#16314f] bg-[#061527]">
              <CardContent className="p-0">
                {view === "Day" ? (
                  <div className="p-4">
                    <div className="mb-4 flex items-center justify-between">
                      <div>
                        <p className="text-sm font-semibold text-white">
                          {selectedDay?.day.toLocaleDateString("en-US", {
                            weekday: "long",
                            month: "long",
                            day: "numeric",
                            year: "numeric",
                          })}
                        </p>
                        <p className="text-xs text-gray-500">
                          {selectedDayAppointments.length} events, {selectedDay?.capacity || 0}% capacity
                        </p>
                      </div>
                      <Button size="sm" onClick={() => openCreateAppointmentDialog(selectedDay?.day)}>
                        <Plus className="mr-2 h-4 w-4" />
                        Add Event
                      </Button>
                    </div>
                    <div className="space-y-2">
                      {HOURS.map((hour) => {
                        const items = selectedDayAppointments.filter((appointment) => {
                          const startHour = parseInt((appointment.startTime || "00:00").slice(0, 2), 10);
                          return startHour === hour;
                        });
                        return (
                          <div key={hour} className="grid min-h-[76px] grid-cols-[72px_minmax(0,1fr)] rounded-lg border border-[#15304f]">
                            <div className="border-r border-[#15304f] px-3 py-3 text-sm text-gray-400">
                              {formatHourLabel(hour)}
                            </div>
                            <div className="group relative p-2">
                              {items.length === 0 ? (
                                <button
                                  onClick={() => openCreateAppointmentDialog(selectedDay?.day)}
                                  className="hidden h-8 items-center rounded-md bg-[#102944] px-3 text-xs text-gray-300 group-hover:flex"
                                >
                                  <Plus className="mr-1 h-3 w-3" />
                                  Add event
                                </button>
                              ) : null}
                              {items.map((appointment, index) => {
                                const color = employeeColor(appointment);
                                return (
                                  <button
                                    key={appointment._id || `${hour}-${index}`}
                                    onClick={() => setDetailsId(String(appointment._id))}
                                    className="mb-2 w-full rounded-md border px-3 py-2 text-left"
                                    style={{ borderColor: `${color}88`, backgroundColor: `${color}25` }}
                                  >
                                    <span className="block text-xs font-medium" style={{ color }}>
                                      {formatRange(appointment.startTime, appointment.endTime)}
                                    </span>
                                    <span className="block truncate text-sm font-semibold text-gray-100">
                                      {appointmentTitle(appointment)}
                                    </span>
                                    <span className="block truncate text-xs text-gray-400">
                                      {appointmentMeta(appointment)}
                                    </span>
                                  </button>
                                );
                              })}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ) : view === "Month" ? (
                  <div className="p-4">
                    <div className="mb-3 grid grid-cols-7 text-center text-xs font-medium text-gray-400">
                      {DAY_LABELS.map((label) => (
                        <div key={label} className="py-2">{label}</div>
                      ))}
                    </div>
                    <div className="grid grid-cols-7 overflow-hidden rounded-lg border border-[#15304f]">
                      {monthDays.map((day) => {
                        const items = filteredAppointments.filter((appointment) =>
                          isSameDay(new Date(appointment.appointmentDate || appointment.start_time), day)
                        );
                        const muted = day.getMonth() !== weekAnchor.getMonth();
                        return (
                          <button
                            key={day.toISOString()}
                            onClick={() => {
                              setWeekAnchor(startOfWeek(day));
                              setSelectedDayIndex(days.findIndex((item) => isSameDay(item, day)));
                            }}
                            className={`min-h-[112px] border-b border-r border-[#15304f] p-2 text-left hover:bg-[#071d35] ${
                              muted ? "bg-[#06101f] text-gray-600" : "bg-[#061527] text-gray-200"
                            }`}
                          >
                            <span
                              className={
                                isSameDay(day, now)
                                  ? "inline-flex h-6 w-6 items-center justify-center rounded-full bg-blue-600 text-xs text-white"
                                  : "text-xs"
                              }
                            >
                              {day.getDate()}
                            </span>
                            <div className="mt-2 space-y-1">
                              {items.slice(0, 3).map((appointment, index) => {
                                const color = employeeColor(appointment);
                                return (
                                  <div
                                    key={appointment._id || `${day.toISOString()}-${index}`}
                                    className="truncate rounded px-2 py-1 text-[10px]"
                                    style={{ backgroundColor: `${color}25`, color }}
                                  >
                                    {appointmentTitle(appointment)}
                                  </div>
                                );
                              })}
                              {items.length > 3 ? (
                                <p className="text-[10px] text-gray-500">+{items.length - 3} more</p>
                              ) : null}
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ) : view === "Agenda" ? (
                  <div className="divide-y divide-[#15304f]">
                    {filteredAppointments.length === 0 ? (
                      <div className="p-8 text-center text-sm text-gray-500">No events in this range.</div>
                    ) : (
                      [...filteredAppointments]
                        .sort((a, b) => {
                          const dateCompare =
                            new Date(a.appointmentDate || a.start_time).getTime() -
                            new Date(b.appointmentDate || b.start_time).getTime();
                          if (dateCompare !== 0) return dateCompare;
                          return (a.startTime || "").localeCompare(b.startTime || "");
                        })
                        .map((appointment, index) => {
                          const color = employeeColor(appointment);
                          const date = new Date(appointment.appointmentDate || appointment.start_time);
                          return (
                            <button
                              key={appointment._id || index}
                              onClick={() => setDetailsId(String(appointment._id))}
                              className="grid w-full grid-cols-[110px_minmax(0,1fr)_140px] gap-4 px-4 py-3 text-left hover:bg-[#071d35]"
                            >
                              <div>
                                <p className="text-xs font-medium text-gray-200">
                                  {date.toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                                </p>
                                <p className="text-[11px] text-gray-500">
                                  {date.toLocaleDateString("en-US", { weekday: "long" })}
                                </p>
                              </div>
                              <div className="min-w-0 border-l-2 pl-3" style={{ borderColor: color }}>
                                <p className="truncate text-sm font-semibold text-gray-100">
                                  {appointmentTitle(appointment)}
                                </p>
                                <p className="truncate text-xs text-gray-500">{appointmentMeta(appointment)}</p>
                              </div>
                              <div className="text-right text-xs text-gray-300">
                                {formatRange(appointment.startTime, appointment.endTime)}
                              </div>
                            </button>
                          );
                        })
                    )}
                  </div>
                ) : (
                <div className="overflow-x-auto">
                  <div className="min-w-[940px]">
                    <div className="grid grid-cols-[70px_repeat(7,minmax(0,1fr))] border-b border-[#15304f]">
                      <div className="px-4 py-4 text-xs text-gray-400">GMT+2</div>
                      {dayBuckets.map((bucket, index) => {
                        const isToday = isSameDay(bucket.day, now);
                        return (
                          <button
                            key={bucket.day.toISOString()}
                            onClick={() => setSelectedDayIndex(index)}
                            className="border-l border-[#15304f] px-3 py-4 text-center hover:bg-[#0b1f37]"
                          >
                            <span className="text-sm text-gray-200">{DAY_LABELS[index]} </span>
                            <span
                              className={
                                isToday
                                  ? "inline-flex h-7 w-7 items-center justify-center rounded-full bg-blue-600 text-sm font-semibold text-white"
                                  : "text-sm text-gray-200"
                              }
                            >
                              {bucket.day.getDate()}
                            </span>
                          </button>
                        );
                      })}
                    </div>

                    <div className="grid min-h-[48px] grid-cols-[70px_repeat(7,minmax(0,1fr))] border-b border-[#15304f]">
                      <div className="px-4 py-3 text-xs text-gray-300">All-day</div>
                      {dayBuckets.map((bucket, dayIndex) => {
                        const allDayItems = bucket.appointments.filter(
                          (appointment) => appointment.allDay || !appointment.startTime
                        );
                        return (
                          <div
                            key={bucket.day.toISOString()}
                            className="group relative border-l border-[#15304f] px-2 py-2"
                            onClick={() => setSelectedDayIndex(dayIndex)}
                          >
                            {allDayItems.slice(0, 1).map((appointment, index) => {
                              const color = employeeColor(appointment);
                              return (
                                <button
                                  key={appointment._id || `${dayIndex}-all-${index}`}
                                  onClick={(event) => {
                                    event.stopPropagation();
                                    setDetailsId(String(appointment._id));
                                  }}
                                  className="w-full rounded-md border px-2 py-1 text-left text-[11px]"
                                  style={{
                                    borderColor: `${color}88`,
                                    backgroundColor: `${color}25`,
                                    color,
                                  }}
                                >
                                  <span className="block truncate">
                                    {appointmentTitle(appointment)}
                                  </span>
                                </button>
                              );
                            })}
                            {allDayItems.length === 0 ? (
                              <button
                                onClick={(event) => {
                                  event.stopPropagation();
                                  setSelectedDayIndex(dayIndex);
                                  openCreateAppointmentDialog(bucket.day);
                                }}
                                className="hidden h-6 w-6 items-center justify-center rounded-md bg-[#102944] text-gray-400 group-hover:flex"
                                aria-label="Add all day appointment"
                              >
                                <Plus className="h-3 w-3" />
                              </button>
                            ) : null}
                          </div>
                        );
                      })}
                    </div>

                    {appointmentsLoading ? (
                      <div className="space-y-2 p-4">
                        {Array.from({ length: 10 }).map((_, index) => (
                          <Skeleton key={index} className="h-14 w-full" />
                        ))}
                      </div>
                    ) : (
                      HOURS.map((hour) => (
                        <div
                          key={hour}
                          className="relative grid min-h-[74px] grid-cols-[70px_repeat(7,minmax(0,1fr))] border-b border-[#15304f]"
                        >
                          {isCurrentWeek && currentHour === hour ? (
                            <div
                              className="pointer-events-none absolute left-[70px] right-0 z-10 h-px bg-red-500"
                              style={{ top: currentMinuteOffset }}
                            >
                              <span className="absolute -left-1.5 -top-1.5 h-3 w-3 rounded-full bg-red-500" />
                            </div>
                          ) : null}
                          <div className="px-4 py-3 text-sm text-gray-300">
                            {formatHourLabel(hour)}
                          </div>
                          {dayBuckets.map((bucket, dayIndex) => {
                            const slotAppointments = bucket.appointments.filter((appointment) => {
                              if (appointment.allDay || !appointment.startTime) return false;
                              const startHour = parseInt(
                                (appointment.startTime || "00:00").slice(0, 2),
                                10
                              );
                              return startHour === hour;
                            });

                            return (
                              <div
                                key={bucket.day.toISOString()}
                                className="group relative border-l border-[#15304f] px-2 py-2 hover:bg-[#071d35]"
                                onClick={() => setSelectedDayIndex(dayIndex)}
                              >
                                {slotAppointments.length === 0 ? (
                                  <button
                                    onClick={(event) => {
                                      event.stopPropagation();
                                      setSelectedDayIndex(dayIndex);
                                      openCreateAppointmentDialog(bucket.day);
                                    }}
                                    className="absolute right-2 top-2 hidden h-6 w-6 items-center justify-center rounded-md bg-[#102944] text-gray-400 group-hover:flex hover:text-blue-300"
                                    aria-label="Add appointment"
                                  >
                                    <Plus className="h-3 w-3" />
                                  </button>
                                ) : null}

                                {slotAppointments.slice(0, 2).map((appointment, index) => {
                                  const color = employeeColor(appointment);
                                  return (
                                    <button
                                      key={appointment._id || `${dayIndex}-${hour}-${index}`}
                                      onClick={(event) => {
                                        event.stopPropagation();
                                        setDetailsId(String(appointment._id));
                                      }}
                                      className="mb-1 w-full rounded-md border px-2 py-2 text-left shadow-[inset_0_1px_0_rgba(255,255,255,0.04)] transition-opacity hover:opacity-90"
                                      style={{
                                        backgroundColor: `${color}25`,
                                        borderColor: `${color}88`,
                                      }}
                                    >
                                      <span
                                        className="block truncate text-[11px] font-medium"
                                        style={{ color }}
                                      >
                                        {formatRange(appointment.startTime, appointment.endTime)}
                                      </span>
                                      <span className="mt-1 flex items-center gap-1 truncate text-[11px] font-semibold text-gray-100">
                                        {appointmentTitle(appointment)}
                                        <User className="h-3 w-3 shrink-0 text-gray-400" />
                                      </span>
                                      <span className="mt-1 block truncate text-[10px] text-gray-400">
                                        {appointmentMeta(appointment)}
                                      </span>
                                    </button>
                                  );
                                })}
                              </div>
                            );
                          })}
                        </div>
                      ))
                    )}
                  </div>
                </div>
                )}
              </CardContent>
            </Card>
          </div>

          <aside className="min-w-0 space-y-4">
            <Card className="overflow-hidden rounded-lg border-[#16314f] bg-[#061527]">
              <CardContent className="flex min-h-[520px] flex-col p-4">
                <div className="mb-5 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <h2 className="text-sm font-semibold text-white">Kora Assistant</h2>
                    <span className="h-2 w-2 rounded-full bg-emerald-400" />
                    <span className="text-xs font-medium text-emerald-400">Online</span>
                  </div>
                  <MoreHorizontal className="h-4 w-4 text-gray-400" />
                </div>

                <div className="flex flex-col items-center text-center">
                  <div className="relative h-20 w-20">
                    <Image
                      src="/kora.png"
                      alt="Kora Assistant"
                      fill
                      sizes="80px"
                      className="object-contain drop-shadow-[0_0_22px_rgba(0,184,255,0.85)]"
                      priority
                    />
                  </div>
                  <p className="mt-4 text-sm font-medium text-gray-100">Hi Admin!</p>
                  <p className="mt-2 max-w-[190px] text-sm leading-6 text-gray-300">
                    How can I help you with your schedule today?
                  </p>
                </div>

                <div className="mt-6 space-y-2">
                  {[
                    { label: "Schedule a meeting", icon: CalendarPlus },
                    { label: "What's on my agenda today?", icon: CheckSquare },
                    { label: "Show me all partner calls", icon: User },
                    { label: "Find time for a meeting tomorrow", icon: CalendarDays },
                    { label: "View team availability", icon: LocateFixed },
                  ].map((item) => (
                    <button
                      key={item.label}
                      className="flex h-12 w-full items-center gap-3 rounded-lg border border-[#102944] bg-[#0b1c32] px-3 text-left text-sm text-gray-100 hover:bg-[#102944]"
                    >
                      <item.icon className="h-4 w-4 shrink-0 text-cyan-400" />
                      <span className="truncate">{item.label}</span>
                    </button>
                  ))}
                </div>

                <div className="mt-6 flex justify-end">
                  <div className="max-w-[220px] rounded-lg bg-blue-700 px-4 py-3 text-sm leading-5 text-white">
                    What&apos;s on my agenda tomorrow?
                    <div className="mt-1 text-right text-[10px] text-blue-200">10:45 AM</div>
                  </div>
                </div>

                <div className="mt-4 flex items-start gap-3">
                  <div className="mt-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-cyan-400/70 text-cyan-300">
                    <Bot className="h-4 w-4" />
                  </div>
                  <div className="rounded-lg bg-[#0b1c32] px-4 py-3 text-sm leading-6 text-gray-200">
                    {selectedDay ? (
                      <>
                        {selectedDay.day.toLocaleDateString("en-US", {
                          weekday: "long",
                          month: "long",
                          day: "numeric",
                        })}
                        , you have {selectedDayAppointments.length} appointments.
                        {selectedDayAppointments.slice(0, 3).map((appointment) => (
                          <div
                            key={appointment._id}
                            className="mt-2 border-l-2 border-blue-500 pl-3 text-xs text-gray-300"
                          >
                            <span className="block text-gray-100">
                              {(appointment.startTime || "").slice(0, 5)} -{" "}
                              {appointmentTitle(appointment)}
                            </span>
                            <span>{appointmentMeta(appointment)}</span>
                          </div>
                        ))}
                      </>
                    ) : (
                      "Select a day to see your appointments."
                    )}
                    <div className="mt-2 text-right text-[10px] text-gray-400">10:45 AM</div>
                  </div>
                </div>

                <div className="mt-auto pt-4">
                  <div className="relative">
                    <input
                      value={assistantInput}
                      onChange={(event) => setAssistantInput(event.target.value)}
                      placeholder="Ask anything..."
                      className="h-12 w-full rounded-lg border border-[#183657] bg-[#071321] px-4 pr-12 text-sm text-white outline-none placeholder:text-gray-500"
                    />
                    <button
                      onClick={() => setAssistantInput("")}
                      className="absolute right-2 top-2 flex h-8 w-8 items-center justify-center rounded-md bg-blue-700 text-white hover:bg-blue-600"
                      aria-label="Send message"
                    >
                      <Send className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="rounded-lg border-[#16314f] bg-[#061527]">
              <CardContent className="space-y-3 p-4">
                <div>
                  <p className="text-sm font-semibold text-white">Daily Overview</p>
                  <p className="text-xs text-gray-500">
                    {selectedDay?.day.toLocaleDateString("en-US", {
                      weekday: "long",
                      month: "short",
                      day: "numeric",
                    })}
                  </p>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div className="rounded-lg bg-[#0b1c32] p-3">
                    <p className="text-[11px] text-gray-500">Events</p>
                    <p className="text-lg font-semibold text-white">{selectedDayAppointments.length}</p>
                  </div>
                  <div className="rounded-lg bg-[#0b1c32] p-3">
                    <p className="text-[11px] text-gray-500">Capacity</p>
                    <p
                      className={`text-lg font-semibold ${
                        (selectedDay?.capacity || 0) >= 100
                          ? "text-red-400"
                          : (selectedDay?.capacity || 0) >= 80
                          ? "text-amber-400"
                          : "text-emerald-400"
                      }`}
                    >
                      {selectedDay?.capacity || 0}%
                    </p>
                  </div>
                </div>
                <div className="h-1.5 overflow-hidden rounded-full bg-[#102944]">
                  <div
                    className="h-full rounded-full bg-emerald-500"
                    style={{ width: `${Math.min(selectedDay?.capacity || 0, 100)}%` }}
                  />
                </div>
                <div className="space-y-2">
                  {selectedDayAppointments.slice(0, 3).map((appointment) => (
                    <button
                      key={appointment._id}
                      onClick={() => setDetailsId(String(appointment._id))}
                      className="flex w-full items-center justify-between rounded-lg bg-[#0b1c32] px-3 py-2 text-left hover:bg-[#102944]"
                    >
                      <span className="min-w-0">
                        <span className="block truncate text-xs font-medium text-gray-100">
                          {appointmentTitle(appointment)}
                        </span>
                        <span className="block text-[10px] text-gray-500">
                          {formatRange(appointment.startTime, appointment.endTime)}
                        </span>
                      </span>
                      <span className="ml-2 rounded-full bg-blue-500/15 px-2 py-1 text-[10px] text-blue-300">
                        {appointment.status || "upcoming"}
                      </span>
                    </button>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card className="rounded-lg border-[#16314f] bg-[#061527]">
              <CardContent className="p-4">
                <p className="mb-3 text-sm font-semibold text-white">Quick Actions</p>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { label: "Add Appointment", icon: Plus, action: () => openCreateAppointmentDialog() },
                    { label: "Add Block", icon: CalendarPlus },
                    { label: "Appointment Types", icon: Settings2, action: () => setShowAppointmentTypesDialog(true) },
                    { label: "Calendar Settings", icon: Settings, action: () => setShowCalendarSettingsDialog(true) },
                  ].map((item) => (
                    <button
                      key={item.label}
                      onClick={item.action}
                      className="flex min-h-16 flex-col items-center justify-center gap-2 rounded-lg bg-[#0b1c32] p-2 text-center text-[11px] text-gray-200 hover:bg-[#102944]"
                    >
                      <item.icon className="h-4 w-4 text-blue-400" />
                      {item.label}
                    </button>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card className="rounded-lg border-[#16314f] bg-[#061527]">
              <CardContent className="space-y-3 p-4">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-semibold text-white">Calendar Sync</p>
                  <span className="flex items-center gap-1 text-xs text-emerald-400">
                    <span className="h-2 w-2 rounded-full bg-emerald-400" />
                    Connected
                  </span>
                </div>
                <button
                  onClick={() => setShowCalendarSettingsDialog(true)}
                  className="flex w-full items-center justify-center gap-2 rounded-lg border border-[#183657] bg-[#071321] px-3 py-2 text-xs text-gray-200 hover:bg-[#102944]"
                >
                  <RefreshCw className="h-3.5 w-3.5" />
                  Sync Settings
                </button>
              </CardContent>
            </Card>
          </aside>
        </div>
      </div>

      <Dialog open={showAppointmentTypesDialog} onOpenChange={setShowAppointmentTypesDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-600/15 text-blue-400">
                <Settings2 className="h-5 w-5" />
              </div>
              <div>
                <DialogTitle>Appointment Types</DialogTitle>
                <p className="mt-1 text-xs text-gray-500">
                  Define platform calendar event types for admin, partners, and customers.
                </p>
              </div>
            </div>
          </DialogHeader>

          <div className="space-y-4">
            <div className="grid grid-cols-[minmax(0,1.2fr)_90px_90px_100px] gap-2 px-2 text-[10px] font-medium uppercase tracking-wide text-gray-500">
              <span>Type</span>
              <span>Duration</span>
              <span>Visible To</span>
              <span>Color</span>
            </div>
            <div className="space-y-2">
              {appointmentTypes.map((type) => (
                <div key={type.name} className="grid grid-cols-[minmax(0,1.2fr)_90px_90px_100px] items-center gap-2 rounded-lg border border-[#1e2d40] bg-[#0d1a2d] p-2">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-gray-100">{type.name}</p>
                    <p className="truncate text-[11px] text-gray-500">Used for admin scheduling, filters, and color rules.</p>
                  </div>
                  <span className="text-xs text-gray-300">{type.duration}</span>
                  <span className="text-xs text-gray-300">{type.visibility}</span>
                  <div className="flex items-center gap-2">
                    <span className="h-5 w-5 rounded-full border border-white/20" style={{ backgroundColor: type.color }} />
                    <span className="text-[10px] text-gray-500">{type.color}</span>
                  </div>
                </div>
              ))}
            </div>
            <div className="grid gap-3 rounded-lg border border-dashed border-[#24405f] bg-[#071321] p-3 md:grid-cols-[minmax(0,1fr)_110px_110px_84px]">
              <Input value={newAppointmentType} onChange={(event) => setNewAppointmentType(event.target.value)} placeholder="New type name" />
              <select value={newAppointmentTypeDuration} onChange={(event) => setNewAppointmentTypeDuration(event.target.value)} className="h-10 rounded-lg border border-[#2a3547] bg-[#0d1526] px-3 text-xs text-gray-200 outline-none focus:ring-2 focus:ring-blue-500">
                <option>30 min</option>
                <option>45 min</option>
                <option>60 min</option>
                <option>90 min</option>
                <option>All day</option>
              </select>
              <select value={newAppointmentTypeVisibility} onChange={(event) => setNewAppointmentTypeVisibility(event.target.value)} className="h-10 rounded-lg border border-[#2a3547] bg-[#0d1526] px-3 text-xs text-gray-200 outline-none focus:ring-2 focus:ring-blue-500">
                <option>Admin</option>
                <option>Partners</option>
                <option>Customers</option>
                <option>Platform</option>
              </select>
              <Button
                onClick={() => {
                  if (!newAppointmentType.trim()) {
                    toast.error("Type name is required");
                    return;
                  }
                  setAppointmentTypes((current) => [
                    ...current,
                    {
                      name: newAppointmentType.trim(),
                      duration: newAppointmentTypeDuration,
                      visibility: newAppointmentTypeVisibility,
                      color: newAppointmentTypeColor,
                    },
                  ]);
                  setNewAppointmentType("");
                  toast.success("Appointment type added");
                }}
                className="h-10 text-xs"
              >
                Add
              </Button>
            </div>
            <div className="flex items-center justify-between border-t border-[#1e2d40] pt-4">
              <div className="flex items-center gap-2">
                <span className="text-xs text-gray-500">New type color</span>
                <input type="color" value={newAppointmentTypeColor} onChange={(event) => setNewAppointmentTypeColor(event.target.value)} className="h-8 w-12 rounded border border-[#2a3547] bg-[#0d1526]" />
              </div>
              <div className="flex gap-2">
                <Button variant="outline" onClick={() => setShowAppointmentTypesDialog(false)}>Cancel</Button>
                <Button
                  onClick={() => {
                    window.localStorage.setItem("admin-calendar-appointment-types", JSON.stringify(appointmentTypes));
                    toast.success("Appointment type settings saved");
                    setShowAppointmentTypesDialog(false);
                  }}
                >
                  Save Types
                </Button>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={showCalendarSettingsDialog} onOpenChange={setShowCalendarSettingsDialog}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-600/15 text-blue-400">
                <Settings className="h-5 w-5" />
              </div>
              <div>
                <DialogTitle>Calendar Settings</DialogTitle>
                <p className="mt-1 text-xs text-gray-500">
                  Configure platform calendar display, Google sync, approvals, and access rules.
                </p>
              </div>
            </div>
          </DialogHeader>

          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            <div className="space-y-3 rounded-xl border border-[#1e2d40] bg-[#0d1a2d] p-4">
              <div className="flex items-center gap-2 text-sm font-semibold text-gray-100">
                <CalendarDays className="h-4 w-4 text-blue-400" />
                Calendar Display
              </div>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <label className="space-y-1.5">
                  <span className="text-xs text-gray-400">Default view</span>
                  <select value={calendarSettings.defaultView} onChange={(event) => updateCalendarSetting("defaultView", event.target.value)} className="h-10 w-full rounded-lg border border-[#2a3547] bg-[#0d1526] px-3 text-sm text-gray-200 outline-none focus:ring-2 focus:ring-blue-500">
                    {VIEWS.map((option) => <option key={option}>{option}</option>)}
                  </select>
                </label>
                <label className="space-y-1.5">
                  <span className="text-xs text-gray-400">Platform visibility</span>
                  <select value={calendarSettings.platformVisibility} onChange={(event) => updateCalendarSetting("platformVisibility", event.target.value)} className="h-10 w-full rounded-lg border border-[#2a3547] bg-[#0d1526] px-3 text-sm text-gray-200 outline-none focus:ring-2 focus:ring-blue-500">
                    <option>All calendars</option>
                    <option>Admin only</option>
                    <option>Partners only</option>
                    <option>Customer bookings</option>
                  </select>
                </label>
                <label className="space-y-1.5">
                  <span className="text-xs text-gray-400">Week starts on</span>
                  <select value={calendarSettings.weekStartsOn} onChange={(event) => updateCalendarSetting("weekStartsOn", event.target.value)} className="h-10 w-full rounded-lg border border-[#2a3547] bg-[#0d1526] px-3 text-sm text-gray-200 outline-none focus:ring-2 focus:ring-blue-500">
                    <option>Monday</option>
                    <option>Sunday</option>
                    <option>Saturday</option>
                  </select>
                </label>
                <label className="space-y-1.5">
                  <span className="text-xs text-gray-400">Timezone</span>
                  <select value={calendarSettings.timeZone} onChange={(event) => updateCalendarSetting("timeZone", event.target.value)} className="h-10 w-full rounded-lg border border-[#2a3547] bg-[#0d1526] px-3 text-sm text-gray-200 outline-none focus:ring-2 focus:ring-blue-500">
                    <option>UTC</option>
                    <option>Asia/Dhaka</option>
                    <option>America/New_York</option>
                    <option>Europe/London</option>
                  </select>
                </label>
              </div>
            </div>

            <div className="space-y-3 rounded-xl border border-[#1e2d40] bg-[#0d1a2d] p-4">
              <div className="flex items-center gap-2 text-sm font-semibold text-gray-100">
                <Bell className="h-4 w-4 text-blue-400" />
                Scheduling Defaults
              </div>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <label className="space-y-1.5"><span className="text-xs text-gray-400">Working start</span><Input type="time" value={calendarSettings.workingStart} onChange={(event) => updateCalendarSetting("workingStart", event.target.value)} /></label>
                <label className="space-y-1.5"><span className="text-xs text-gray-400">Working end</span><Input type="time" value={calendarSettings.workingEnd} onChange={(event) => updateCalendarSetting("workingEnd", event.target.value)} /></label>
                <label className="space-y-1.5">
                  <span className="text-xs text-gray-400">Default duration</span>
                  <select value={calendarSettings.defaultDuration} onChange={(event) => updateCalendarSetting("defaultDuration", event.target.value)} className="h-10 w-full rounded-lg border border-[#2a3547] bg-[#0d1526] px-3 text-sm text-gray-200 outline-none focus:ring-2 focus:ring-blue-500">
                    <option value="30">30 min</option><option value="45">45 min</option><option value="60">60 min</option><option value="90">90 min</option>
                  </select>
                </label>
                <label className="space-y-1.5">
                  <span className="text-xs text-gray-400">Default reminder</span>
                  <select value={calendarSettings.reminder} onChange={(event) => updateCalendarSetting("reminder", event.target.value)} className="h-10 w-full rounded-lg border border-[#2a3547] bg-[#0d1526] px-3 text-sm text-gray-200 outline-none focus:ring-2 focus:ring-blue-500">
                    <option value="5">5 min before</option><option value="15">15 min before</option><option value="30">30 min before</option><option value="60">1 hour before</option>
                  </select>
                </label>
              </div>
            </div>

            <div className="space-y-3 rounded-xl border border-[#1e2d40] bg-[#0d1a2d] p-4">
              <div className="flex items-center gap-2 text-sm font-semibold text-gray-100">
                <Globe2 className="h-4 w-4 text-blue-400" />
                Google Calendar Sync
              </div>
              {[
                ["Two-way Google sync", "syncGoogle"],
                ["Show weekends", "showWeekends"],
                ["Show declined or cancelled events", "showDeclined"],
              ].map(([label, key]) => (
                <label key={key} className="flex items-center justify-between rounded-lg border border-[#203651] bg-[#071321] px-3 py-2">
                  <span className="text-xs text-gray-300">{label}</span>
                  <input type="checkbox" checked={Boolean(calendarSettings[key as keyof typeof calendarSettings])} onChange={(event) => updateCalendarSetting(key as keyof typeof calendarSettings, event.target.checked)} className="h-4 w-4 rounded border-[#2a3547] bg-[#0d1526]" />
                </label>
              ))}
              <div className="flex items-center gap-2 rounded-lg border border-[#203651] bg-[#071321] px-3 py-2 text-xs text-gray-400">
                <Palette className="h-3.5 w-3.5 text-blue-400" />
                Sync platform event colors with appointment type colors.
              </div>
            </div>

            <div className="space-y-3 rounded-xl border border-[#1e2d40] bg-[#0d1a2d] p-4">
              <div className="flex items-center gap-2 text-sm font-semibold text-gray-100">
                <ShieldCheck className="h-4 w-4 text-blue-400" />
                Access and Approval
              </div>
              {[
                ["Admin approval required for partner changes", "adminApproval"],
                ["Partners can edit shared calendar events", "partnerCanEdit"],
              ].map(([label, key]) => (
                <label key={key} className="flex items-center justify-between rounded-lg border border-[#203651] bg-[#071321] px-3 py-2">
                  <span className="text-xs text-gray-300">{label}</span>
                  <input type="checkbox" checked={Boolean(calendarSettings[key as keyof typeof calendarSettings])} onChange={(event) => updateCalendarSetting(key as keyof typeof calendarSettings, event.target.checked)} className="h-4 w-4 rounded border-[#2a3547] bg-[#0d1526]" />
                </label>
              ))}
              <div className="flex items-center gap-2 rounded-lg border border-[#203651] bg-[#071321] px-3 py-2 text-xs text-gray-400">
                <Eye className="h-3.5 w-3.5 text-blue-400" />
                Admin can view all partner, customer, and platform calendar items.
              </div>
            </div>
          </div>

          <div className="mt-4 flex items-center justify-between border-t border-[#1e2d40] pt-4">
            <p className="text-[11px] text-gray-500">These settings define admin calendar behavior across the platform.</p>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setShowCalendarSettingsDialog(false)}>Cancel</Button>
              <Button
                onClick={() => {
                  window.localStorage.setItem("admin-calendar-settings", JSON.stringify(calendarSettings));
                  toast.success("Calendar settings saved");
                  setShowCalendarSettingsDialog(false);
                }}
              >
                Save Settings
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <CreateAppointmentDialog
        key={appointmentDefaultDate?.toISOString() || "today"}
        open={showCreateDialog}
        onOpenChange={setShowCreateDialog}
        defaultDate={appointmentDefaultDate}
      />

      <AppointmentDetailsDialog
        open={Boolean(detailsId)}
        onOpenChange={(open) => {
          if (!open) setDetailsId(null);
        }}
        appointmentId={detailsId}
      />
    </div>
  );
}
