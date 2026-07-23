export const ADMIN_ROLE = "admin";

export function normalizeRole(role?: string | null) {
  return String(role ?? "").trim().toLowerCase();
}

export function isAdminRole(role?: string | null) {
  return normalizeRole(role) === ADMIN_ROLE;
}
