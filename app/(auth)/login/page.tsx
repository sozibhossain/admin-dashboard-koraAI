"use client";
import { Suspense, useState } from "react";
import { getSession, signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { isAdminRole } from "@/lib/roles";
import Link from "next/link";
import { AuthCard } from "@/components/auth-card";

const loginErrorMessages: Record<string, string> = {
  credentials: "Invalid email or password.",
  CredentialsSignin: "Invalid email or password.",
  user_not_found: "No account found for this email.",
  wrong_password: "Incorrect password.",
  email_not_verified: "Email not verified. Please verify your email first.",
  role_not_allowed: "You are not an admin. Please use an admin account.",
  missing_credentials: "Email and password are required.",
  auth_service_unavailable: "Login service is unavailable. Please try again.",
  invalid_credentials: "Invalid email or password.",
  account_blocked: "This account is blocked. Contact your administrator.",
  platform_access_required: "This account has no active platform administrator access. Contact your administrator.",
  second_factor_required: "Enter a fresh six-digit code from your authenticator app.",
  session_required: "Please sign in to continue.",
  session_expired: "Your session expired. Please sign in again.",
};

function getLoginErrorMessage(result?: {
  code?: string | null;
  error?: string | null;
  url?: string | null;
}) {
  const code = getLoginErrorCode(result);

  return loginErrorMessages[code] || "Invalid email or password.";
}

function getLoginErrorCode(result?: {
  code?: string | null;
  error?: string | null;
  url?: string | null;
}) {
  const url = result?.url ? new URL(result.url, window.location.origin) : null;
  return (
    result?.code ||
    url?.searchParams.get("code") ||
    url?.searchParams.get("error") ||
    result?.error ||
    ""
  );
}

export default function LoginPage() {
  return <Suspense fallback={<AuthCard title="Welcome back" description="Loading sign-in…"><Loader2 className="animate-spin" /></AuthCard>}><LoginForm /></Suspense>;
}

function LoginForm() {
  const router = useRouter();
  const params = useSearchParams();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [mfaCode, setMfaCode] = useState("");
  const [needsSecondFactor, setNeedsSecondFactor] = useState(false);
  const [showPwd, setShowPwd] = useState(false);
  const [loading, setLoading] = useState(false);
  const initialError = params.get("code") || params.get("error");
  const [formError, setFormError] = useState(initialError ? loginErrorMessages[initialError] || "Unable to sign in. Please try again." : "");

  function showLoginError(code: string) {
    const message = loginErrorMessages[code] || "Invalid email or password.";
    setFormError(message);
    toast.error(message);
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setFormError("");

    try {
      const result = await signIn("credentials", {
        email,
        password,
        mfaCode,
        redirect: false,
        callbackUrl: "/dashboard",
      });
      const authErrorCode = getLoginErrorCode(result);
      if (!result?.ok || authErrorCode) {
        if (authErrorCode === "second_factor_required") setNeedsSecondFactor(true);
        const message = getLoginErrorMessage(result);
        setFormError(message);
        toast.error(message);
        return;
      }

      const session = await getSession();
      const role = session?.user?.role ?? "";

      if (!session) {
        showLoginError("session_required");
        return;
      }

      if (!isAdminRole(role)) {
        showLoginError("role_not_allowed");
        return;
      }

      toast.success("Login successful!");
      const callbackUrl = params.get("callbackUrl");
      router.replace(callbackUrl?.startsWith("/") && !callbackUrl.startsWith("//") && !callbackUrl.startsWith("/login") ? callbackUrl : "/dashboard");
      router.refresh();
    } catch {
      const message = "Something went wrong. Please try again.";
      setFormError(message);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthCard title="Welcome back" description="Sign in to your NOVYA admin workspace.">
      <form onSubmit={handleSubmit} className="auth-form">
        <div className="auth-field">
          <Label htmlFor="email">Email Address</Label>
          <Input
            id="email"
            type="email"
            placeholder="admin@example.com"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              if (formError) setFormError("");
            }}
            required
            autoComplete="email"
          />
        </div>

        <div className="auth-field">
          <div className="auth-field-heading">
            <Label htmlFor="password">Password</Label>
            <Link href="/forgot-password" className="auth-link">
              Forgot password?
            </Link>
          </div>
          <div className="auth-password">
            <Input
              id="password"
              type={showPwd ? "text" : "password"}
              placeholder="Enter your password"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                if (formError) setFormError("");
              }}
              required
              autoComplete="current-password"
              className="pr-10"
            />
            <button
              type="button"
              onClick={() => setShowPwd(!showPwd)}
              aria-label={showPwd ? "Hide password" : "Show password"}
              aria-pressed={showPwd}
              className="auth-password-toggle"
            >
              {showPwd ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {needsSecondFactor && <div className="auth-field"><Label htmlFor="mfaCode">Authenticator code</Label><Input id="mfaCode" type="text" inputMode="numeric" autoComplete="one-time-code" pattern="[0-9]{6}" maxLength={6} required value={mfaCode} onChange={e => setMfaCode(e.target.value.replace(/\D/g, ""))} placeholder="Six-digit code" /></div>}

        {formError ? (
          <div className="auth-error" role="alert">
            {formError}
          </div>
        ) : null}

        <Button type="submit" className="auth-submit" disabled={loading}>
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Signing in...
            </>
          ) : (
            "Sign In"
          )}
        </Button>
      </form>

    </AuthCard>
  );
}
