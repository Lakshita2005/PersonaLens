import { type ReactNode } from "react";
import { ArrowRight, RotateCcw, UserPlus } from "lucide-react";
import { navItems } from "../../data/landing";
import type { AppStep, AuthView } from "../../types/domain";
import { Button } from "../ui/button";
import { Toaster } from "sonner";

type AppShellProps = {
  children: ReactNode;
  step: AppStep;
  onHome: () => void;
  onReset: () => void;
  onAuth: (view: AuthView) => void;
  showWorkspaceSidebar?: boolean;
  workspaceSidebarOpen?: boolean;
};

export const AppShell = ({
  children,
  step,
  onHome,
  onReset,
  onAuth,
  showWorkspaceSidebar = false,
  workspaceSidebarOpen = false,
}: AppShellProps) => {
  const showLandingLinks = step === "landing";
  const showWorkspaceStatus = step === "interview" || step === "dashboard";
  const showHeader = showLandingLinks || showWorkspaceStatus;
  const workspacePadding = showWorkspaceSidebar
    ? workspaceSidebarOpen
      ? "lg:pl-72"
      : "lg:pl-20"
    : "";

  const focusAssessment = () => {
    document.getElementById("assessment")?.scrollIntoView({ behavior: "smooth", block: "center" });
    window.setTimeout(() => document.getElementById("candidate-name")?.focus(), 450);
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      {showHeader && (
      <header className="sticky top-0 z-50 border-b border-border/80 bg-background/90 backdrop-blur-xl">
        <div
          className={`mx-auto flex h-16 w-full items-center justify-between px-4 transition-[padding] duration-300 sm:px-6 ${
            !showWorkspaceSidebar
              ? "max-w-7xl lg:px-8"
              : `max-w-none lg:pr-6 ${workspaceSidebarOpen ? "lg:pl-80" : "lg:pl-24"}`
          }`}
        >
          {showLandingLinks || !showWorkspaceStatus ? (
            <button
              type="button"
              onClick={onHome}
              className="flex items-center gap-3 rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              aria-label="PersonaLens home"
            >
              <img src="/logo.png" alt="PersonaLens" className="h-10 w-10 object-contain" />
              <span className="hidden text-sm font-bold tracking-normal text-foreground sm:block">
                PersonaLens
              </span>
            </button>
          ) : (
            <div className="hidden sm:block" /> /* Layout spacer */
          )}

          {showWorkspaceStatus && (
            <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
              <div className="flex items-center gap-2 rounded-full border border-border bg-white px-4 py-1.5 text-xs font-semibold text-muted-foreground shadow-sm">
                <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                {step === "interview" ? "Assessment in progress" : "Result generated"}
              </div>
            </div>
          )}

          {showLandingLinks && (
            <nav
              className="hidden items-center gap-1 rounded-full border border-border bg-surface/80 p-1 shadow-line md:flex"
              aria-label="Primary navigation"
            >
              {navItems.map((item) => (
                <a
                  key={item.href}
                  href={item.href}
                  className="rounded-full px-3.5 py-2 text-sm font-semibold text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                >
                  {item.label}
                </a>
              ))}
            </nav>
          )}

          <div className="flex items-center gap-2">
            {showWorkspaceStatus && (
              <Button variant="outline" size="sm" onClick={onReset}>
                <RotateCcw className="h-4 w-4" />
                <span className="hidden sm:inline">Restart</span>
              </Button>
            )}
            {showLandingLinks && (
              <>
                <Button variant="ghost" size="sm" onClick={() => onAuth("signin")}>
                  Sign in
                </Button>
                <Button variant="secondary" size="sm" onClick={() => onAuth("signup")}>
                  <UserPlus className="h-4 w-4" />
                  <span className="hidden sm:inline">Sign up</span>
                </Button>
                <Button size="sm" onClick={focusAssessment}>
                  Try
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </>
            )}
          </div>
        </div>
      </header>
      )}

      <main className={workspacePadding}>{children}</main>

      {step === "landing" && (
      <footer className="border-t border-border bg-[#f8fafc]">
        <div className="mx-auto grid w-full max-w-7xl gap-10 px-4 py-12 sm:px-6 md:grid-cols-[1.25fr_0.75fr] lg:px-8">
          <div className="space-y-5">
            <img
              src="/logo_wordmark.png"
              alt="PersonaLens"
              className="h-auto w-[420px] max-w-full object-contain"
            />
            <p className="max-w-2xl text-base leading-7 text-muted-foreground">
              PersonaLens helps students practice focused interviews, understand readiness
              signals, save results, and prepare mentor-ready improvement plans.
            </p>
          </div>
          <div className="grid grid-cols-2 gap-6 text-sm">
            <div className="space-y-2">
              <p className="font-semibold text-foreground">Platform</p>
              <p className="text-muted-foreground">Resume intake</p>
              <p className="text-muted-foreground">Mock interview</p>
              <p className="text-muted-foreground">PDF export</p>
            </div>
            <div className="space-y-2">
              <p className="font-semibold text-foreground">Students</p>
              <p className="text-muted-foreground">Saved results</p>
              <p className="text-muted-foreground">Progress comparison</p>
              <p className="text-muted-foreground">Mentor review</p>
            </div>
          </div>
        </div>
      </footer>
      )}
      <Toaster position="bottom-right" richColors />
    </div>
  );
};
