"use client";
import { useEffect, useState } from "react";
import { getSession, signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
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
  const router = useRouter();
  const [email, setEmail] = useState("admin@gmail.com");
  const [password, setPassword] = useState("123456");
  const [showPwd, setShowPwd] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formError, setFormError] = useState("");

  function showLoginError(code: string) {
    const message = loginErrorMessages[code] || "Invalid email or password.";
    setFormError(message);
    toast.error(message);
  }

  useEffect(() => {
    const searchParams = new URLSearchParams(window.location.search);
    const code = searchParams.get("code") || searchParams.get("error");
    if (!code) return;

    const message = loginErrorMessages[code] || "Invalid email or password.";
    setFormError(message);
    toast.error(message);
  }, []);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setFormError("");

    try {
      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
        callbackUrl: "/dashboard",
      });
      const authErrorCode = getLoginErrorCode(result);
      if (!result?.ok || authErrorCode) {
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
      router.replace("/dashboard");
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
