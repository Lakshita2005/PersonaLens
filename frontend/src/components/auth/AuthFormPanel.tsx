import { FormEvent, useRef, useState } from "react";
import { motion } from "framer-motion";
import { BadgeCheck, Loader2 } from "lucide-react";
import { toast } from "sonner";
import {
  changePassword,
  googleAuth,
  loginUser,
  registerUser,
  requestOtp,
  resetPassword,
  setAuthToken,
  verifyOtp,
  type AuthResponse,
  type AuthUser,
} from "../../lib/api";
import type { AuthView } from "../../types/domain";
import { Button } from "../ui/button";
import { authCopy, getFooterAction } from "./authContent";

type AuthFormPanelProps = {
  view: AuthView;
  onAuthenticated: (user: AuthUser) => void;
  onHome: () => void;
  onViewChange: (view: AuthView) => void;
};

const parseApiError = (error: unknown, fallback: string) => {
  if (!(error instanceof Error)) {
    return fallback;
  }

  try {
    const parsed = JSON.parse(error.message) as { detail?: string };
    return parsed.detail || fallback;
  } catch {
    return error.message || fallback;
  }
};

const inputClass =
  "h-12 w-full rounded-lg border border-slate-300 bg-[#f8fafc] px-4 text-sm text-slate-950 shadow-[inset_0_1px_2px_rgba(15,23,42,0.04)] outline-none transition-colors placeholder:text-slate-500 focus:border-brand focus:bg-white focus:ring-2 focus:ring-brand/15";
const fieldShellClass = "block w-[320px] max-w-full";

const GoogleMark = () => (
  <svg aria-hidden="true" viewBox="0 0 24 24" className="h-5 w-5">
    <path
      fill="#4285F4"
      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
    />
    <path
      fill="#34A853"
      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
    />
    <path
      fill="#FBBC05"
      d="M5.84 14.1c-.22-.66-.35-1.36-.35-2.1s.13-1.44.35-2.1V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l3.66-2.84z"
    />
    <path
      fill="#EA4335"
      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06L5.84 9.9C6.71 7.31 9.14 5.38 12 5.38z"
    />
  </svg>
);

export const AuthFormPanel = ({
  view,
  onAuthenticated,
  onHome,
  onViewChange,
}: AuthFormPanelProps) => {
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    currentPassword: "",
    newPassword: "",
    otp: "",
    program: "",
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [devOtp, setDevOtp] = useState<string | null>(null);
  const emailRef = useRef<HTMLInputElement | null>(null);

  const copy = authCopy[view];
  const footerAction = getFooterAction(view);
  const showGoogle = view === "signin" || view === "signup";

  const update = (key: keyof typeof form, value: string) => {
    setForm((previous) => ({ ...previous, [key]: value }));
  };

  const completeAuth = (response: AuthResponse) => {
    setAuthToken(response.token);
    toast.success(`Welcome, ${response.user.name}. Your results can now be saved.`);
    onAuthenticated(response.user);
  };

  const handleGoogle = async () => {
    if (!form.email.trim()) {
      emailRef.current?.focus();
      return;
    }

    setLoading(true);
    setMessage("");

    try {
      const response = await googleAuth({
        email: form.email.trim(),
        name: form.name.trim() || form.email.split("@")[0],
        program: form.program.trim() || undefined,
      });
      completeAuth(response);
    } catch (authError) {
      const parsed = parseApiError(authError, "Google authentication failed");
      toast.error(parsed);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);
    setMessage("");

    try {
      if (view === "signin") {
        completeAuth(await loginUser({ email: form.email, password: form.password }));
        return;
      }

      if (view === "signup") {
        completeAuth(
          await registerUser({
            name: form.name,
            email: form.email,
            password: form.password,
            program: form.program,
          }),
        );
        return;
      }

      if (view === "forgot-password") {
        const response = await requestOtp({ email: form.email, purpose: "password_reset" });
        setDevOtp(response.dev_otp ?? null);
        setMessage(response.message);
        toast.success("OTP generated. Use it to reset your password.");
        onViewChange("reset-password");
        return;
      }

      if (view === "verify-otp") {
        const response = await verifyOtp({
          email: form.email,
          otp: form.otp,
          purpose: "password_reset",
        });
        setMessage(response.message);
        toast.success("OTP verified.");
        return;
      }

      if (view === "reset-password") {
        const response = await resetPassword({
          email: form.email,
          otp: form.otp,
          newPassword: form.newPassword,
        });
        setMessage(response.message);
        toast.success("Password reset complete. Sign in with the new password.");
        setForm((previous) => ({
          ...previous,
          password: "",
          currentPassword: "",
          newPassword: "",
          otp: "",
        }));
        window.setTimeout(() => onViewChange("signin"), 650);
        return;
      }

      if (view === "change-password") {
        const response = await changePassword({
          currentPassword: form.currentPassword,
          newPassword: form.newPassword,
        });
        setMessage(response.message);
        toast.success("Password changed successfully.");
        setForm((previous) => ({ ...previous, currentPassword: "", newPassword: "" }));
        return;
      }

      await handleGoogle();
    } catch (authError) {
      const parsed = parseApiError(authError, "Authentication action failed");
      toast.error(parsed);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center px-5 py-8 sm:px-8 lg:min-h-0 lg:px-14">
      <motion.div
        key={view}
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex min-h-[640px] w-full max-w-[320px] flex-col"
      >
        <button
          type="button"
          onClick={onHome}
          className="mx-auto mb-10 flex items-center justify-center rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          aria-label="PersonaLens home"
        >
          <img src="/logo.png" alt="PersonaLens" className="h-10 w-10 object-contain" />
        </button>

        <div className="text-center">
          <h1 className="font-display text-3xl leading-tight tracking-normal text-slate-950 sm:text-4xl">
            {copy.title}
          </h1>
          <p className="mt-4 text-sm leading-6 text-slate-500">{copy.body}</p>
        </div>

        <form onSubmit={handleSubmit} className="mt-10 flex flex-col items-center space-y-5">
          {(view === "signup" || view === "google-auth") && (
            <label className={fieldShellClass}>
              <span className="mb-2 block text-sm font-semibold text-slate-950">Full name</span>
              <input
                className={inputClass}
                value={form.name}
                onChange={(event) => update("name", event.target.value)}
                placeholder="Enter your full name"
                autoComplete="name"
                required={view === "signup"}
              />
            </label>
          )}

          {view !== "change-password" && (
            <label className={fieldShellClass}>
              <span className="mb-2 block text-sm font-semibold text-slate-950">Email</span>
              <input
                className={inputClass}
                ref={emailRef}
                type="email"
                value={form.email}
                onChange={(event) => update("email", event.target.value)}
                placeholder="Enter your email"
                autoComplete="email"
                required
              />
            </label>
          )}

          {view === "signup" && (
            <label className={fieldShellClass}>
              <span className="mb-2 block text-sm font-semibold text-slate-950">Program</span>
              <input
                className={inputClass}
                value={form.program}
                onChange={(event) => update("program", event.target.value)}
                placeholder="B.Tech CSE"
              />
            </label>
          )}

          {(view === "signin" || view === "signup") && (
            <label className={fieldShellClass}>
              <span className="mb-2 block text-sm font-semibold text-slate-950">Password</span>
              <input
                className={inputClass}
                type="password"
                value={form.password}
                onChange={(event) => update("password", event.target.value)}
                placeholder="Enter your password"
                autoComplete={view === "signup" ? "new-password" : "current-password"}
                required
              />
            </label>
          )}

          {view === "signin" && (
            <div className="flex w-[320px] max-w-full items-center justify-between text-xs text-slate-600">
              <label className="inline-flex items-center gap-2">
                <input type="checkbox" className="h-4 w-4 rounded border-slate-300" />
                Remember me
              </label>
              <button
                type="button"
                onClick={() => onViewChange("forgot-password")}
                className="font-semibold text-slate-950 hover:underline"
              >
                Forgot Password
              </button>
            </div>
          )}

          {(view === "verify-otp" || view === "reset-password") && (
            <label className={fieldShellClass}>
              <span className="mb-2 block text-sm font-semibold text-slate-950">OTP code</span>
              <input
                className={`${inputClass} tracking-[0.28em]`}
                value={form.otp}
                onChange={(event) => update("otp", event.target.value.replace(/\D/g, "").slice(0, 6))}
                placeholder="000000"
                inputMode="numeric"
                required
              />
            </label>
          )}

          {view === "change-password" && (
            <label className={fieldShellClass}>
              <span className="mb-2 block text-sm font-semibold text-slate-950">Current password</span>
              <input
                className={inputClass}
                type="password"
                value={form.currentPassword}
                onChange={(event) => update("currentPassword", event.target.value)}
                placeholder="Current password"
                autoComplete="current-password"
                required
              />
            </label>
          )}

          {(view === "reset-password" || view === "change-password") && (
            <label className={fieldShellClass}>
              <span className="mb-2 block text-sm font-semibold text-slate-950">New password</span>
              <input
                className={inputClass}
                type="password"
                value={form.newPassword}
                onChange={(event) => update("newPassword", event.target.value)}
                placeholder="New password"
                autoComplete="new-password"
                required
              />
            </label>
          )}

          {devOtp && (
            <div className="rounded-lg bg-blue-50 px-4 py-3 text-sm font-semibold text-blue-900">
              Dev OTP: {devOtp}
            </div>
          )}
          {message && (
            <div className="flex items-start gap-2 rounded-lg bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-800">
              <BadgeCheck className="mt-0.5 h-4 w-4 shrink-0" />
              {message}
            </div>
          )}
          <Button
            type="submit"
            size="lg"
            className="h-12 w-[320px] max-w-full rounded-lg bg-black text-white hover:bg-slate-900"
            disabled={loading}
          >
            {loading && <Loader2 className="h-4 w-4 animate-spin" />}
            {copy.action}
          </Button>
        </form>

        {showGoogle && (
          <Button
            type="button"
            variant="secondary"
            size="lg"
            className="mt-3 h-12 w-[320px] max-w-full rounded-lg border-slate-200 bg-white text-slate-950 hover:bg-slate-50"
            onClick={handleGoogle}
            disabled={loading}
          >
            <GoogleMark />
            {view === "signin" ? "Sign In with Google" : "Sign Up with Google"}
          </Button>
        )}

        <div className="mt-auto pt-12 text-center text-sm text-slate-600">
          {footerAction.text}{" "}
          <button
            type="button"
            onClick={() => onViewChange(footerAction.target)}
            className="font-bold text-slate-950 hover:underline"
          >
            {footerAction.label}
          </button>
        </div>
      </motion.div>
    </div>
  );
};
