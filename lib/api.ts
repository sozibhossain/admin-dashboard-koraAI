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
  changePassword: (data: object) => api.put("/user/change-password", data),
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
  search: (q: string) => api.get("/customers/search", { params: { q } }),
  import: (data: FormData) =>
    api.post("/customers/import", data, {
      headers: { "Content-Type": "multipart/form-data" },
    }),
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
  generate: (data: object) => api.post("/leads/generate", data),
  convertToCustomer: (id: string) => api.post(`/leads/${id}/convert`),
};

// ─── Territories ──────────────────────────────────────────────────────────────
export const territoriesApi = {
  getAll: (params?: object) => api.get("/territories", { params }),
  getById: (id: string) => api.get(`/territories/${id}`),
  create: (data: object) => api.post("/territories", data),
  update: (id: string, data: object) => api.put(`/territories/${id}`, data),
  delete: (id: string) => api.delete(`/territories/${id}`),
};

// ─── Analytics ────────────────────────────────────────────────────────────────
export const analyticsApi = {
  getSalesAnalytics: (params?: object) =>
    api.get("/analytics", { params }),
  getRevenueOverview: (params?: object) =>
    api.get("/accounting/revenue", { params }),
};

// ─── Workflows ────────────────────────────────────────────────────────────────
export const workflowsApi = {
  getAll: (params?: object) => api.get("/workflows", { params }),
  getById: (id: string) => api.get(`/workflows/${id}`),
  create: (data: object) => api.post("/workflows", data),
  update: (id: string, data: object) => api.put(`/workflows/${id}`, data),
  delete: (id: string) => api.delete(`/workflows/${id}`),
  execute: (id: string, data: object) =>
    api.post(`/workflows/${id}/execute`, data),
};

// ─── Approvals ────────────────────────────────────────────────────────────────
export const approvalsApi = {
  getAll: (params?: object) => api.get("/approvals", { params }),
  getById: (id: string) => api.get(`/approvals/${id}`),
  approve: (id: string) => api.patch(`/approvals/${id}/approve`),
  reject: (id: string, data?: object) =>
    api.patch(`/approvals/${id}/reject`, data),
};

// ─── Activity ─────────────────────────────────────────────────────────────────
export const activityApi = {
  getAll: (params?: object) => api.get("/activity", { params }),
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
};

// ─── Inbox ────────────────────────────────────────────────────────────────────
export const inboxApi = {
  getChats: (params?: object) => api.get("/inbox", { params }),
  getChatById: (id: string) => api.get(`/inbox/${id}`),
  search: (q: string) => api.get("/inbox/search", { params: { q } }),
  createGroup: (data: object) => api.post("/inbox/group", data),
  markRead: (id: string) => api.patch(`/inbox/${id}/read`),
  sendMessage: (data: { recipientId: string; content: string }) => api.post("/inbox", data),
  deleteMessage: (conversationId: string, messageId: string) =>
    api.delete(`/inbox/${conversationId}/messages/${messageId}`),
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
