import { display, RecordData, recordValue, rowsOf } from "@/lib/novya";
import { Metric } from "./primitives";
type Item = [string, unknown];
export function SettingsMetrics({ section, data }: { section: string; data: RecordData }) {
  const get = (key: string) => recordValue(data, key);
  let items: Item[];
  switch (section) {
    case "general": items = [["Default language", get("defaultLanguage")], ["Timezone", get("timezone")], ["Currency", get("currency")], ["Maintenance mode", get("maintenanceMode") == null ? undefined : get("maintenanceMode") ? "Enabled" : "Disabled"]]; break;
    case "company": items = [["Legal entity", get("legalName")], ["Country", get("country")], ["VAT ID", get("vatId")], ["Contact channels", Object.values((get("contacts") as RecordData) ?? {}).filter(Boolean).length]]; break;
    case "branding": items = [["Domains", rowsOf(get("domains")).length], ["Verified domains", rowsOf(get("domains")).filter(row => row.verified).length], ["Primary color", get("primaryColor")], ["Accent color", get("accentColor")]]; break;
    case "security": items = [["MFA policy", get("mfaRequired") == null ? undefined : get("mfaRequired") ? "Required" : "Optional"], ["Session timeout", get("sessionTimeoutMinutes") == null ? undefined : `${get("sessionTimeoutMinutes")} min`], ["Network allowlist", Array.isArray(get("ipAllowlist")) ? (get("ipAllowlist") as unknown[]).length : 0], ["Emergency access policy", get("emergencyAccess.enabled") == null ? undefined : get("emergencyAccess.enabled") ? "Enabled" : "Disabled"]]; break;
    case "notifications": { const channels = (get("channels") as RecordData) ?? {}; const rules = rowsOf(get("alertPolicy")); items = [["Enabled channels", Object.values(channels).filter(Boolean).length], ["Alert rules", rules.length], ["Enabled rules", rules.filter(row => row.enabled).length], ["Email channel", channels.email == null ? undefined : channels.email ? "Enabled" : "Disabled"]]; break; }
    case "kora": { const routes = rowsOf(get("modelRoutes")); items = [["Default assistant", get("assistantName")], ["Model routes", routes.length], ["Approval action types", Array.isArray(get("approval.requireApprovalFor")) ? (get("approval.requireApprovalFor") as unknown[]).length : 0], ["Monthly budget", get("monthlyBudgetEur") == null ? undefined : `€${get("monthlyBudgetEur")}`]]; break; }
    case "data": { const windows = rowsOf(get("retention")).map(row => Number(row.days)).filter(Number.isFinite); items = [["Residency policy", get("residency")], ["Retention categories", windows.length], ["Longest retention", windows.length ? `${Math.max(...windows)} days` : "Not configured"], ["Shortest retention", windows.length ? `${Math.min(...windows)} days` : "Not configured"]]; break; }
    default: { const flags = rowsOf(get("featureFlags")); items = [["Feature flags", flags.length], ["Enabled flags", flags.filter(row => row.enabled).length], ["Configured limits", Object.keys((get("resourceLimits") as RecordData) ?? {}).length], ["Rollout rules", flags.filter(row => row.rolloutPercent != null).length]]; }
  }
  return <div className="nv-metrics">{items.map(([label, value]) => <Metric key={label} label={label} value={display(value)} note="Platform configuration"/>)}</div>;
}
