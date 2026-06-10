import type { AuthView } from "../../types/domain";

export const authCopy: Record<AuthView, { title: string; body: string; action: string }> = {
  signin: {
    title: "Welcome Back",
    body: "Enter your email and password to access your account",
    action: "Sign In",
  },
  signup: {
    title: "Create Account",
    body: "Create your PersonaLens profile to save results and compare progress",
    action: "Sign Up",
  },
  "forgot-password": {
    title: "Forgot Password",
    body: "Enter your registered email and receive a verification code",
    action: "Send OTP",
  },
  "verify-otp": {
    title: "Verify OTP",
    body: "Confirm the one-time code before continuing",
    action: "Verify OTP",
  },
  "reset-password": {
    title: "Reset Password",
    body: "Use your OTP and create a new secure password",
    action: "Reset Password",
  },
  "change-password": {
    title: "Change Password",
    body: "Update your signed-in profile password",
    action: "Change Password",
  },
  "google-auth": {
    title: "Continue with Google",
    body: "Connect your college Google identity with PersonaLens",
    action: "Continue",
  },
};

export const getFooterAction = (view: AuthView) => {
  if (view === "signin") {
    return {
      text: "Don't have an account?",
      label: "Sign Up",
      target: "signup" as const,
    };
  }

  if (view === "signup") {
    return {
      text: "Already have an account?",
      label: "Sign In",
      target: "signin" as const,
    };
  }

  return {
    text: "Remember your password?",
    label: "Sign In",
    target: "signin" as const,
  };
};
