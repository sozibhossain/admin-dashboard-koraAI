import type { ReactNode } from "react";
import { ShieldCheck } from "lucide-react";

export function AuthCard({ title, description, children }: {
  title: string;
  description: ReactNode;
  children: ReactNode;
}) {
  return (
    <>
      <div className="auth-brand" aria-label="NOVYA Admin platform">
        <span className="nv-brand-mark" aria-hidden="true">N</span>
        <span>NOVYA</span>
      </div>
      <section className="auth-card" aria-labelledby="auth-title">
        <div className="auth-eyebrow"><span />ADMIN PLATFORM</div>
        <header className="auth-heading">
          <h1 id="auth-title">{title}</h1>
          <p>{description}</p>
        </header>
        {children}
      </section>
      <p className="auth-security"><ShieldCheck size={14} aria-hidden="true" />Secure access to the NOVYA workspace</p>
    </>
  );
}
