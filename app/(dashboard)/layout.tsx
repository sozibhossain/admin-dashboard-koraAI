import { NovyaShell } from "@/components/novya/shell";
import { MobileNavProvider } from "@/components/layout/mobile-nav-context";
import { AuthSessionGate } from "@/components/auth-session-gate";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthSessionGate>
      <MobileNavProvider>
        <NovyaShell>{children}</NovyaShell>
      </MobileNavProvider>
    </AuthSessionGate>
  );
}
