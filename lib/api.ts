import api from "./axios";

// ─── Auth ───────────────────────────────────────────────────────────────────
export const authApi = {
  login: (data: { email: string; password: string }) =>
    api.post("/auth/login", data),
  forgotPassword: (data: { email: string }) =>
    api.post("/auth/forget-password", data),
  verifyResetOtp: (data: { email: string; otp: string }) =>
    api.post("/auth/verify-reset-otp", data),
  resetPassword: (data: {
    email: string;
    otp: string;
    password: string;
    confirmPassword: string;
  }) => api.post("/auth/reset-password", data),
  refreshToken: (data: { refreshToken: string }) =>
    api.post("/auth/refresh-token", data),
  logout: () => api.post("/auth/logout"),
  addSalesPartner: (data: object) => api.post("/auth/add-sales-partner", data),
};

// ─── User ────────────────────────────────────────────────────────────────────
export const userApi = {
  getProfile: () => api.get("/user/profile"),
  updateProfile: (data: FormData) =>
    api.put("/user/profile", data, {
      headers: { "Content-Type": "multipart/form-data" },
    }),
  changePassword: (data: {
    currentPassword: string;
    newPassword: string;
    confirmNewPassword: string;
  }) => api.put("/user/change-password", data),
};

// ─── Admin ───────────────────────────────────────────────────────────────────
export const adminApi = {
  getDashboardStats: () => api.get("/admin/dashboard"),
  getAllUsers: (params?: object) => api.get("/admin/users", { params }),
  getUserById: (id: string) => api.get(`/admin/users/${id}`),
  updateUserRole: (id: string, data: { role: string }) =>
    api.patch(`/admin/users/${id}/role`, data),
  suspendUser: (id: string) => api.patch(`/admin/users/${id}/suspend`),
  deleteUser: (id: string) => api.delete(`/admin/users/${id}`),
  getSystemActivity: (params?: object) =>
    api.get("/admin/activity", { params }),
  getPlatformSettings: () => api.get("/admin/settings"),
  updatePlatformSettings: (data: object) => api.put("/admin/settings", data),
};

// ─── Partners ─────────────────────────────────────────────────────────────────
export const partnersApi = {
  getDashboard: () => api.get("/partners/dashboard"),
  getAll: (params?: object) => api.get("/partners", { params }),
  getById: (id: string) => api.get(`/partners/${id}`),
  create: (data: object) => api.post("/partners", data),
  update: (id: string, data: object) => api.put(`/partners/${id}`, data),
  delete: (id: string) => api.delete(`/partners/${id}`),
  getPerformance: (id: string) => api.get(`/partners/${id}/performance`),
  assignTerritory: (id: string, data: object) =>
    api.patch(`/partners/${id}/assign-territory`, data),
};

// ─── Customers ────────────────────────────────────────────────────────────────
export const customersApi = {
  getAll: (params?: object) => api.get("/customers", { params }),
  getById: (id: string) => api.get(`/customers/${id}`),
  create: (data: object) => api.post("/customers", data),
  update: (id: string, data: object) => api.put(`/customers/${id}`, data),
  delete: (id: string) => api.delete(`/customers/${id}`),
  getHistory: (id: string) => api.get(`/customers/${id}/history`),
  getStats: () => api.get("/customers/stats"),
  search: (q: string) => api.get("/customers/search", { params: { q } }),
  import: (customers: object[]) =>
    api.post("/customers/import", { customers }),
};

// ─── Leads ────────────────────────────────────────────────────────────────────
export const leadsApi = {
  getAll: (params?: object) => api.get("/leads", { params }),
  getById: (id: string) => api.get(`/leads/${id}`),
  create: (data: object) => api.post("/leads", data),
  update: (id: string, data: object) => api.put(`/leads/${id}`, data),
  delete: (id: string) => api.delete(`/leads/${id}`),
  changeStatus: (id: string, data: { status: string }) =>
    api.patch(`/leads/${id}/status`, data),
  bulkUpdateStatus: (data: { leadIds: string[]; status: string }) =>
    api.post("/leads/bulk-status", data),
  generate: (data: object) => api.post("/leads/generate", data),
  convertToCustomer: (id: string, data?: object) =>
    api.post(`/leads/${id}/convert`, data || {}),
  getAnalytics: () => api.get("/leads/analytics"),
};

// ─── Territories ──────────────────────────────────────────────────────────────
export const territoriesApi = {
  getAll: (params?: object) => api.get("/territories", { params }),
  getById: (id: string) => api.get(`/territories/${id}`),
  create: (data: object) => api.post("/territories", data),
  update: (id: string, data: object) => api.put(`/territories/${id}`, data),
  delete: (id: string) => api.delete(`/territories/${id}`),
  getLeads: (id: string, params?: object) =>
    api.get(`/territories/${id}/leads`, { params }),
  getPerformance: (id: string) => api.get(`/territories/${id}/performance`),
  unassignPartner: (id: string) => api.patch(`/territories/${id}/unassign`),
  bulkAssign: (data: { territoryIds: string[]; partnerId: string }) =>
    api.post("/territories/bulk-assign", data),
};

// ─── Analytics ────────────────────────────────────────────────────────────────
export const analyticsApi = {
  getDashboard: () => api.get("/analytics/dashboard"),
  getRevenue: (params?: object) => api.get("/analytics/revenue", { params }),
  getPartners: () => api.get("/analytics/partners"),
  getTerritories: () => api.get("/analytics/territories"),
  getFunnel: () => api.get("/analytics/funnel"),
  getTopPerformers: (params?: object) =>
    api.get("/analytics/top-performers", { params }),
  getTrends: () => api.get("/analytics/trends"),
  export: () => api.get("/analytics/export", { responseType: "blob" }),
};

// ─── Workflows ────────────────────────────────────────────────────────────────
export const workflowsApi = {
  getAll: (params?: object) => api.get("/workflows", { params }),
  getById: (id: string) => api.get(`/workflows/${id}`),
  create: (data: object) => api.post("/workflows", data),
  update: (id: string, data: object) => api.put(`/workflows/${id}`, data),
  execute: (data: { workflowType: string; payload?: object }) =>
    api.post("/workflows/execute", data),
  getHistory: (params?: object) => api.get("/workflows/history", { params }),
  getStats: () => api.get("/workflows/stats"),
};

// ─── Approvals ────────────────────────────────────────────────────────────────
export const approvalsApi = {
  getAll: (params?: object) => api.get("/approvals", { params }),
  getById: (id: string) => api.get(`/approvals/${id}`),
  approve: (id: string, data?: object) =>
    api.patch(`/approvals/${id}/approve`, data || {}),
  reject: (id: string, data?: object) =>
    api.patch(`/approvals/${id}/reject`, data || {}),
  getStats: () => api.get("/approvals/stats"),
  getHistory: (params?: object) => api.get("/approvals/history", { params }),
  bulkApprove: (data: { approvalIds: string[] }) =>
    api.post("/approvals/bulk", data),
};

// ─── Activity ─────────────────────────────────────────────────────────────────
export const activityApi = {
  getAll: (params?: object) => api.get("/activity", { params }),
  getStats: () => api.get("/activity/stats"),
  filter: (params?: object) => api.get("/activity/filter", { params }),
  export: () => api.get("/activity/export", { responseType: "blob" }),
  getByEntity: (entityType: string, entityId: string, params?: object) =>
    api.get(`/activity/${entityType}/${entityId}`, { params }),
};

// ─── Support ──────────────────────────────────────────────────────────────────
export const supportApi = {
  getAll: (params?: object) => api.get("/support", { params }),
  getById: (id: string) => api.get(`/support/${id}`),
  create: (data: object) => api.post("/support", data),
  update: (id: string, data: object) => api.put(`/support/${id}`, data),
  reply: (id: string, data: { message: string; isInternal?: boolean }) =>
    api.post(`/support/${id}/reply`, data),
  close: (id: string) => api.patch(`/support/${id}/close`),
  assign: (id: string, data: { admin_id: string }) =>
    api.patch(`/support/${id}/assign`, data),
  getStats: () => api.get("/support/stats"),
};

// ─── Inbox ────────────────────────────────────────────────────────────────────
export const inboxApi = {
  getChats: (params?: object) => api.get("/inbox", { params }),
  getChatById: (id: string) => api.get(`/inbox/${id}`),
  search: (q: string) => api.get("/inbox/search", { params: { q } }),
  createGroup: (data: object) => api.post("/inbox/group", data),
  markRead: (id: string) => api.patch(`/inbox/${id}/read`),
  sendMessage: (data: FormData | { recipientId: string; content?: string }) =>
    data instanceof FormData
      ? api.post("/inbox", data, { headers: { "Content-Type": "multipart/form-data" } })
      : api.post("/inbox", data),
  deleteMessage: (conversationId: string, messageId: string) =>
    api.delete(`/inbox/${conversationId}/messages/${messageId}`),
  editMessage: (conversationId: string, messageId: string, data: { content: string }) =>
    api.patch(`/inbox/${conversationId}/messages/${messageId}`, data),
  deleteChat: (id: string) => api.delete(`/inbox/${id}`),
  getRecipients: (params?: { q?: string }) =>
    api.get("/inbox/recipients", { params }),
};

export const mailApi = {
  getAll: (params?: object) => api.get("/mail", { params }),
  getById: (id: string) => api.get(`/mail/${id}`),
  create: (data: FormData) =>
    api.post("/mail", data, {
      headers: { "Content-Type": "multipart/form-data" },
    }),
  update: (id: string, data: FormData) =>
    api.put(`/mail/${id}`, data, {
      headers: { "Content-Type": "multipart/form-data" },
    }),
  toggleStar: (id: string) => api.put(`/mail/${id}/star`),
  remove: (id: string) => api.delete(`/mail/${id}`),
};

// ─── Services ─────────────────────────────────────────────────────────────────
export const servicesApi = {
  getAll: (params?: object) => api.get("/services", { params }),
  getById: (id: string) => api.get(`/services/${id}`),
  create: (data: object) => api.post("/services", data),
  update: (id: string, data: object) => api.put(`/services/${id}`, data),
  delete: (id: string) => api.delete(`/services/${id}`),
};

// ─── Calendar ─────────────────────────────────────────────────────────────────
export const calendarApi = {
  getEvents: (params?: object) => api.get("/calendar", { params }),
  getInsights: () => api.get("/calendar/insights"),
  sync: () => api.post("/calendar/sync"),
  createEvent: (data: object) => api.post("/calendar", data),
  updateEvent: (id: string, data: object) =>
    api.put(`/calendar/${id}`, data),
  deleteEvent: (id: string) => api.delete(`/calendar/${id}`),
};

// ─── Appointments ────────────────────────────────────────────────────────────
export const appointmentsApi = {
  getAll: (params?: object) => api.get("/appointments", { params }),
  getById: (id: string) => api.get(`/appointments/${id}`),
  create: (data: object) => api.post("/appointments", data),
  update: (id: string, data: object) =>
    api.put(`/appointments/${id}`, data),
  getAvailableSlots: (params?: object) =>
    api.get("/appointments/available-slots", { params }),
  getEmployees: (params?: object) =>
    api.get("/appointments/employees", { params }),
};

// ─── Employees (read-only for admin) ─────────────────────────────────────────
export const employeesApi = {
  getAll: (params?: object) => api.get("/appointments/employees", { params }),
};

// ─── Kora Assistant ──────────────────────────────────────────────────────────
export const koraAssistantApi = {
  sendMessage: (data: { message: string }) =>
    api.post("/kora-assistant", data),
  getHistory: (params?: object) =>
    api.get("/kora-assistant", { params }),
};

// ─── Notifications ───────────────────────────────────────────────────────────
export const notificationsApi = {
  getAll: (params?: object) => api.get("/notification", { params }),
  getUnreadCount: () => api.get("/notification/unread-count"),
  markRead: (id: string) => api.put(`/notification/${id}/read`),
  markAllRead: () => api.put("/notification/read-all"),
};

// ─── Earnings ─────────────────────────────────────────────────────────────────
export const earningsApi = {
  getDashboard: () => api.get("/earnings/dashboard"),
  getAll: (params?: object) => api.get("/earnings", { params }),
  getPayouts: (params?: object) => api.get("/earnings/payouts", { params }),
  requestWithdrawal: (data: object) => api.post("/earnings/withdraw", data),
  exportReport: () => api.get("/earnings/export"),
};

// ─── Subscription plans (admin CRUD) ────────────────────────────────────────────
export const subscriptionApi = {
  getAllPlans: () => api.get("/subscription/admin/plans"),
  getPlanById: (id: string) => api.get(`/subscription/admin/plans/${id}`),
  createPlan: (data: object) => api.post("/subscription/admin/plans", data),
  updatePlan: (id: string, data: object) =>
    api.put(`/subscription/admin/plans/${id}`, data),
  deletePlan: (id: string) => api.delete(`/subscription/admin/plans/${id}`),
};
