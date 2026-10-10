"use client";
import { useState } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { useMutation } from "@tanstack/react-query";
import { novya, errorMessage } from "@/lib/novya";
import { PageHeading, Panel } from "./primitives";

const steps = ["Ownership", "Scopes", "Guardrails", "Create"];
const scopes = [
  { key: "overview.read", name: "Read platform overview", description: "Recorded platform totals and summary metrics." },
  { key: "system-health.read", name: "Read system health summary", description: "Recorded services and incident health." },
];

export function ApiKeyCreate() {
  const { data: session } = useSession();
  const [step, setStep] = useState(0), [name, setName] = useState(""), [selected, setSelected] = useState<string[]>([]), [expiresAt, setExpiresAt] = useState("");
  const [validation, setValidation] = useState("");
  const create = useMutation({ mutationFn: () => novya.post("/settings/api-keys", { name: name.trim(), scopes: selected, ...(expiresAt ? { expiresAt: new Date(expiresAt).toISOString() } : {}) }) });
  function next() {
    if (step === 1 && !selected.length) { setValidation("Choose at least one scope."); return; }
    if (expiresAt && (!Number.isFinite(new Date(expiresAt).getTime()) || new Date(expiresAt) <= new Date())) { setValidation("Choose a future expiry."); return; }
    setValidation(""); setStep(step + 1);
  }
  return <><PageHeading title="Create API Key" subtitle="Define owner, scopes, environment and Kora access before issuing a one-time secret." action={<span className="nv-pill">Step {step + 1} of 4</span>}/>
    <div className="nv-stepper">{steps.map((label, index) => <span key={label} className={step === index ? "active" : ""}><b>{index < step ? "✓" : index + 1}</b>{label}</span>)}</div>
    {create.isSuccess ? <Panel title="Your new API key"><p className="text-sm text-slate-300">Copy this key now. It will not be returned again.</p><code className="block break-all select-all p-4 mt-4 bg-black rounded">{String(create.data.data.key ?? "")}</code><Link className="nv-button mt-4" href="/settings/integrations/api-keys">Done</Link></Panel> :
      <div className="nv-two-column"><Panel title={["Key ownership", "Choose Scopes", "Security & Lifetime", "Review and create"][step]} subtitle="Select the minimum platform access required by this service.">
        <form onSubmit={e => { e.preventDefault(); if (step === 3) create.mutate(); else next(); }}>
          {step === 0 && <div className="nv-form-grid"><label className="nv-field"><span>Key name *</span><input className="nv-input" required maxLength={120} value={name} onChange={e => setName(e.target.value)}/></label><label className="nv-field"><span>Owner</span><input className="nv-input" readOnly value={session?.user?.name ?? "Current administrator"}/></label><p className="text-xs text-slate-400">The server binds this key to your authenticated account and current backend environment.</p></div>}
          {step === 1 && <><div className="nv-list-item"><strong className="flex-1">{name}</strong><span className="text-xs text-emerald-300">Current account owner</span></div><p className="nv-section-label mt-5">API scopes</p><div className="nv-stack">{scopes.map(scope => <label className="nv-list-item" key={scope.key}><div className="flex-1"><strong>{scope.name}</strong><p>{scope.description}</p></div><input type="checkbox" aria-label={scope.name} checked={selected.includes(scope.key)} onChange={e => setSelected(previous => e.target.checked ? [...previous, scope.key] : previous.filter(key => key !== scope.key))}/></label>)}</div><p className="nv-section-label mt-5">Data domains</p>{[["Platform summary", selected.includes("overview.read")], ["System events", selected.includes("system-health.read")]].map(([label, enabled]) => <div className="nv-list-item" key={String(label)}><span className="flex-1">{label}</span><span className="nv-pill">{enabled ? "Read" : "Disabled"}</span></div>)}</>}
          {step === 2 && <><label className="nv-field"><span>Expiry (optional)</span><input type="datetime-local" className="nv-input" value={expiresAt} onChange={e => setExpiresAt(e.target.value)}/></label><div className="nv-list-item mt-5"><strong className="flex-1">Credential storage</strong><span>SHA-256 hash</span></div><p className="text-xs text-slate-400 mt-3">The secret is returned once. Keys can be revoked from Integrations & API.</p></>}
          {step === 3 && <div className="nv-stack"><div className="nv-list-item"><strong className="flex-1">Name</strong><span>{name}</span></div><div className="nv-list-item"><strong className="flex-1">Scopes</strong><span>{selected.join(", ")}</span></div><div className="nv-list-item"><strong className="flex-1">Expiry</strong><span>{expiresAt ? new Date(expiresAt).toLocaleString() : "No scheduled expiry"}</span></div><p className="text-xs text-slate-400">Creating this key grants the selected read permissions to whoever holds its secret.</p></div>}
          {(validation || create.error) && <p className="nv-error-text">{validation || errorMessage(create.error)}</p>}
          <div className="nv-form-footer">{step > 0 ? <button type="button" className="nv-button" disabled={create.isPending} onClick={() => { setValidation(""); setStep(step - 1); }}>Back</button> : <Link className="nv-button" href="/settings/integrations/api-keys">Cancel</Link>}<button className="nv-button nv-button-primary" disabled={create.isPending}>{create.isPending ? "Creating…" : step === 3 ? "Create key" : step === 1 ? "Continue to guardrails" : "Continue"}</button></div>
        </form></Panel><div className="nv-stack"><Panel title="Key summary" subtitle="Only the selected read and diagnostic scopes"><div className="nv-list-item"><span className="flex-1">Ownership</span><strong>Current account</strong></div><div className="nv-list-item"><span className="flex-1">Scopes</span><strong>{selected.length} enabled</strong></div><div className="nv-list-item"><span className="flex-1">User mutation</span><span>Disabled</span></div><div className="nv-list-item"><span className="flex-1">Financial data</span><span>Disabled</span></div></Panel><Panel title="Security & Lifetime"><p className="text-xs text-slate-400">This key supports the platform overview and system health machine API. Tenant records and Kora action execution are unavailable through these scopes.</p><div className="nv-list-item mt-3"><span className="flex-1">Lifetime</span><span>{expiresAt ? "Scheduled expiry" : "Until revoked"}</span></div></Panel></div></div>}</>;
}
