import { resources } from "./novya-pages";

const settingsDetails: Record<string, string[]> = {
  general: ["defaults"], company: ["legal-contacts"], branding: ["identity", "domains"], roles: ["policies"],
  security: ["authentication", "emergency"], notifications: ["alert-policy"], integrations: ["api-keys"],
  kora: ["routing", "approval-policy"], data: ["retention", "privacy-requests"], audit: ["changes"], advanced: ["plans", "feature-flags"],
};
const id = (value: string | undefined) => !!value && /^[a-f\d]{24}$/i.test(value);
export function isNovyaRoute(parts: string[]): boolean {
  const [root, section, record, tab] = parts, base = parts.slice(0, 2).join("/");
  if (root === "profile") return parts.length === 1;
  if (root === "settings") {
    if (parts.length === 1) return true;
    if (!(section in settingsDetails)) return false;
    if (parts.length === 2) return true;
    if (section === "roles" && id(record)) return parts.length === 3;
    if (section === "integrations" && record !== "api-keys") return parts.length === 3 && /^[a-z][a-z0-9_-]*$/i.test(record);
    if (!settingsDetails[section].includes(record)) return false;
    if (parts.length === 3) return true;
    return parts.length === 4 && ((section === "integrations" && record === "api-keys" && tab === "create") || (section === "data" && record === "privacy-requests" && (tab === "create" || id(tab))) || (section === "audit" && record === "changes" && id(tab)));
  }
  if (root === "tasks") return parts.length === 1 || (parts.length === 2 && (["create", "team"].includes(section) || id(section))) || (parts.length === 3 && id(section) && record === "edit");
  if (root === "system-health") return parts.length === 1 || (parts.length === 3 && ["services", "incidents"].includes(section) && id(record));
  if (root === "workflows") return parts.length === 1 || (section === "runs" ? parts.length === 2 || (parts.length === 3 && id(record)) : parts.length === 2 && /^[a-z][a-z0-9_]*$/.test(section));
  if (!["management", "team", "kora", "live-view", "approvals"].includes(root)) return false;
  if (parts.length === 1) return true;
  if (["management/health-risk", "management/plans-billing", "team/recruiting", "kora/brain", "kora/sources"].includes(base)) return parts.length === 2;
  if (base === "kora/conversations") return parts.length === 3 && id(record);
  if (base === "live-view/channels" && record) return parts.length === 3 && ["whatsapp", "phone", "website_chat", "email", "sms", "portal"].includes(record);
  const resource = resources[root === "approvals" ? "approvals/all" : base];
  if (!resource) return false;
  const tail = root === "approvals" ? (section === "all" ? parts.slice(2) : parts.slice(1)) : parts.slice(2);
  if (!tail.length) return true;
  if (tail[0] === "create") return tail.length === 1 && !!resource.fields;
  if (!id(tail[0]) || tail.length > 2) return false;
  return tail.length === 1 || (tail[1] === "edit" ? !!resource.fields : !!resource.tabs?.some(([, key]) => key === tail[1]));
}
