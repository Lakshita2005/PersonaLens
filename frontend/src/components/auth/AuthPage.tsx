import type { AuthView } from "../../types/domain";
import type { AuthUser } from "../../lib/api";
import { AuthFormPanel } from "./AuthFormPanel";
import { AuthVisualPanel } from "./AuthVisualPanel";

type AuthPageProps = {
  view: AuthView;
  onAuthenticated: (user: AuthUser) => void;
  onHome: () => void;
  onViewChange: (view: AuthView) => void;
};

export const AuthPage = ({ view, onAuthenticated, onHome, onViewChange }: AuthPageProps) => (
  <section className="relative z-10 min-h-screen overflow-hidden bg-[#f5f7fb] p-3 sm:p-4">
    <div className="mx-auto grid min-h-[calc(100vh-1.5rem)] max-w-7xl overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-[0_24px_70px_rgba(15,23,42,0.12)] sm:min-h-[calc(100vh-2rem)] lg:grid-cols-[1.02fr_0.98fr]">
      <AuthVisualPanel />
      <AuthFormPanel
        view={view}
        onAuthenticated={onAuthenticated}
        onHome={onHome}
        onViewChange={onViewChange}
      />
    </div>
  </section>
);
