import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { AuthPage } from "./components/auth/AuthPage";
import Dashboard from "./components/Dashboard";
import Interview from "./components/Interview";
import Landing from "./components/Landing";
import type { WorkspaceTabId } from "./components/interview/types";
import { AppShell } from "./components/layout/AppShell";
import { GlobalSidebar, type SidebarTarget } from "./components/layout/GlobalSidebar";
import { clearAuthToken, getCurrentUser, type AuthUser } from "./lib/api";
import type { AppStep, AuthView, CandidateProfile, InterviewTurn } from "./types/domain";

const assessmentTargets: WorkspaceTabId[] = [
  "intake-layer",
  "gap-layer",
  "question-layer",
  "response-layer",
  "analysis-layer",
  "fusion-layer",
];

const resultTargetToView: Partial<Record<SidebarTarget, "overview" | "reports" | "profile" | "export">> = {
  "result-overview": "overview",
  "result-history": "reports",
  "result-profile": "profile",
  "result-export": "export",
};

const isAuthStep = (step: AppStep): step is AuthView =>
  [
    "signin",
    "signup",
    "forgot-password",
    "verify-otp",
    "reset-password",
    "change-password",
    "google-auth",
  ].includes(step);

function App() {
  const [step, setStep] = useState<AppStep>("landing");
  const [userData, setUserData] = useState<CandidateProfile>({
    name: "",
    program: "",
    assessmentTrack: "Placement readiness",
  });
  const [interviewData, setInterviewData] = useState<InterviewTurn[]>([]);
  const [authUser, setAuthUser] = useState<AuthUser | null>(null);
  const [authReturnStep, setAuthReturnStep] = useState<AppStep>("landing");
  const [activeTarget, setActiveTarget] = useState<SidebarTarget>("intake-layer");
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    let isMounted = true;

    const restoreProfile = async () => {
      try {
        const user = await getCurrentUser();
        if (isMounted) {
          setAuthUser(user);
        }
      } catch {
        clearAuthToken();
      }
    };

    restoreProfile();

    return () => {
      isMounted = false;
    };
  }, []);

  const handleStart = (data: CandidateProfile) => {
    setUserData(data);
    setInterviewData([]);
    setActiveTarget("response-layer");
    setStep("interview");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleComplete = (data: InterviewTurn[]) => {
    setInterviewData(data);
    setActiveTarget("result-overview");
    setStep("dashboard");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleReset = () => {
    setInterviewData([]);
    setStep("landing");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const openAuth = (view: AuthView) => {
    setAuthReturnStep(step === "interview" || step === "dashboard" ? step : "landing");
    setSidebarOpen(false);
    setStep(view);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleAuthSuccess = (user: AuthUser) => {
    setAuthUser(user);
    setStep(authReturnStep === "interview" || authReturnStep === "dashboard" ? authReturnStep : "landing");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleSignOut = () => {
    clearAuthToken();
    setAuthUser(null);
  };

  const handleSidebarNavigate = (target: SidebarTarget) => {
    setActiveTarget(target);

    if (assessmentTargets.includes(target as WorkspaceTabId)) {
      setStep("interview");
      window.setTimeout(() => {
        window.dispatchEvent(
          new CustomEvent("personalens:assessment-module", { detail: { id: target } }),
        );
      }, 60);
      return;
    }

    const view = resultTargetToView[target];
    if (view) {
      setStep("dashboard");
      window.setTimeout(() => {
        window.dispatchEvent(
          new CustomEvent("personalens:result-view", { detail: { view } }),
        );
      }, 60);
    }
  };

  const showWorkspaceSidebar = step === "interview" || step === "dashboard";

  return (
    <AppShell
      step={step}
      onHome={handleReset}
      onReset={handleReset}
      onAuth={openAuth}
      showWorkspaceSidebar={showWorkspaceSidebar}
      workspaceSidebarOpen={sidebarOpen}
    >
      {showWorkspaceSidebar && (
        <GlobalSidebar
          activeTarget={activeTarget}
          authUser={authUser}
          isOpen={sidebarOpen}
          onAuth={openAuth}
          onHome={handleReset}
          onNavigate={handleSidebarNavigate}
          onOpenChange={setSidebarOpen}
          onSignOut={handleSignOut}
        />
      )}
      <div className="relative overflow-hidden">
        <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(rgba(18,34,56,0.045)_1px,transparent_1px),linear-gradient(90deg,rgba(18,34,56,0.045)_1px,transparent_1px)] bg-[size:40px_40px]" />
        <AnimatePresence mode="wait">
          {step === "landing" && (
            <motion.div
              key="landing"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <Landing onStart={handleStart} />
            </motion.div>
          )}
          {step === "interview" && (
            <motion.div
              key="interview"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
            >
              <Interview
                userData={userData}
                onComplete={handleComplete}
                onHome={handleReset}
                initialModule={
                  assessmentTargets.includes(activeTarget as WorkspaceTabId)
                    ? (activeTarget as WorkspaceTabId)
                    : "response-layer"
                }
                onModuleChange={(id) => setActiveTarget(id)}
              />
            </motion.div>
          )}
          {step === "dashboard" && (
            <motion.div
              key="dashboard"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
            >
              <Dashboard
                userData={userData}
                interviewData={interviewData}
                onRetake={handleReset}
                authUser={authUser}
                onAuth={openAuth}
                onSignOut={handleSignOut}
                onViewChange={(view) => {
                  const target = Object.entries(resultTargetToView).find(
                    ([, mappedView]) => mappedView === view,
                  )?.[0] as SidebarTarget | undefined;
                  if (target) {
                    setActiveTarget(target);
                  }
                }}
              />
            </motion.div>
          )}
          {isAuthStep(step) && (
            <motion.div
              key={step}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
            >
              <AuthPage
                view={step}
                onAuthenticated={handleAuthSuccess}
                onHome={handleReset}
                onViewChange={setStep}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </AppShell>
  );
}

export default App;
