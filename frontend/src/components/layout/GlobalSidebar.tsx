import { useState } from "react";
import {
  Activity,
  ClipboardList,
  FileDown,
  FileText,
  History,
  Home,
  LogIn,
  LogOut,
  MessageSquareText,
  Search,
  UploadCloud,
  UserRound,
  Wand2,
} from "lucide-react";
import type { AuthView } from "../../types/domain";
import type { AuthUser } from "../../lib/api";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";

export type SidebarTarget =
  | "intake-layer"
  | "gap-layer"
  | "question-layer"
  | "response-layer"
  | "analysis-layer"
  | "fusion-layer"
  | "result-overview"
  | "result-history"
  | "result-profile"
  | "result-export";

type GlobalSidebarProps = {
  activeTarget: SidebarTarget;
  authUser: AuthUser | null;
  isOpen: boolean;
  onAuth: (view: AuthView) => void;
  onHome: () => void;
  onNavigate: (target: SidebarTarget) => void;
  onOpenChange: (open: boolean) => void;
  onSignOut: () => void;
};

const sidebarItems = [
  { id: "intake-layer", label: "Intake", icon: UploadCloud },
  { id: "gap-layer", label: "Resume Fit", icon: Search },
  { id: "question-layer", label: "Questions", icon: Wand2 },
  { id: "response-layer", label: "Practice", icon: MessageSquareText },
  { id: "analysis-layer", label: "Signals", icon: Activity },
  { id: "fusion-layer", label: "Review", icon: FileText },
  { id: "result-overview", label: "Result", icon: ClipboardList },
  { id: "result-history", label: "History", icon: History },
  { id: "result-export", label: "Export", icon: FileDown },
] as const;

export const GlobalSidebar = ({
  activeTarget,
  authUser,
  isOpen,
  onAuth,
  onHome,
  onNavigate,
  onOpenChange,
  onSignOut,
}: GlobalSidebarProps) => {
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);

  return (
  <aside
    onMouseEnter={() => onOpenChange(true)}
    onMouseLeave={() => {
      if (!profileMenuOpen) {
        onOpenChange(false);
      }
    }}
    className={`fixed left-0 top-0 z-[70] hidden h-screen flex-col border-r border-border bg-white/95 p-3 shadow-soft backdrop-blur-xl transition-[width] duration-300 lg:flex ${
      isOpen ? "w-72" : "w-20"
    }`}
  >
    <button
      type="button"
      onClick={onHome}
      className={`mb-4 flex h-16 w-full items-center overflow-hidden bg-transparent text-brand focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${
        isOpen ? "justify-start px-3" : "justify-center px-0"
      }`}
      aria-label="PersonaLens home"
    >
      <img
        src={isOpen ? "/logo_wordmark.png" : "/logo.png"}
        alt="PersonaLens"
        className={isOpen ? "h-12 w-auto max-w-[220px] object-contain" : "h-10 w-10 object-contain"}
      />
    </button>

    <nav className="space-y-1" aria-label="PersonaLens workspace">
      {sidebarItems.map((item) => (
        <button
          key={item.id}
          type="button"
          onClick={() => onNavigate(item.id)}
          className={`flex text-sm font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${
            isOpen
              ? "h-11 w-full items-center gap-3 rounded-xl border px-3"
              : "mx-auto h-12 w-12 items-center justify-center rounded-xl border p-0"
          } ${
            activeTarget === item.id
              ? "border-brand/20 bg-brand-soft text-brand shadow-line"
              : "border-transparent bg-transparent text-muted-foreground hover:bg-brand-soft hover:text-brand"
          }`}
          aria-label={item.label}
        >
          <item.icon className="h-5 w-5 shrink-0" />
          <span
            className={`min-w-0 overflow-hidden whitespace-nowrap transition-all duration-200 ${
              isOpen ? "max-w-[180px] opacity-100" : "max-w-0 opacity-0"
            }`}
          >
            {item.label}
          </span>
        </button>
      ))}
    </nav>

    <div className="mt-auto">
      <DropdownMenu
        open={profileMenuOpen}
        onOpenChange={(open) => {
          setProfileMenuOpen(open);
          if (open) {
            onOpenChange(true);
          }
        }}
      >
        <DropdownMenuTrigger asChild>
          <button
            type="button"
            className={`flex items-center gap-3 border text-left transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${
              isOpen
                ? "w-full rounded-xl border-border bg-background p-3 hover:bg-muted"
                : "mx-auto h-12 w-12 justify-center rounded-xl border-transparent bg-transparent p-0 text-muted-foreground hover:bg-brand-soft hover:text-brand"
            }`}
            aria-label="Profile menu"
          >
            <span
              className={`flex shrink-0 items-center justify-center text-sm font-bold ${
                isOpen ? "h-10 w-10 rounded-md bg-brand-soft text-brand" : "h-5 w-5"
              }`}
            >
              <UserRound className="h-5 w-5" />
            </span>
            <span
              className={`min-w-0 overflow-hidden transition-all duration-200 ${
                isOpen ? "max-w-[180px] opacity-100" : "max-w-0 opacity-0"
              }`}
            >
              <span className="block truncate text-sm font-bold text-foreground">
                {authUser?.name || "Guest profile"}
              </span>
              <span className="block truncate text-xs text-muted-foreground">
                {authUser ? "Results sync on" : "Sign in to save"}
              </span>
            </span>
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent side="right" align="end">
          <DropdownMenuLabel>{authUser ? authUser.name : "Account"}</DropdownMenuLabel>
          {authUser ? (
            <>
              <DropdownMenuItem onClick={() => onNavigate("result-profile")}>
                <UserRound className="h-4 w-4" />
                Profile
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onNavigate("result-history")}>
                <FileText className="h-4 w-4" />
                Result history
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onAuth("change-password")}>
                <UserRound className="h-4 w-4" />
                Change password
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={onSignOut}>
                <LogOut className="h-4 w-4" />
                Sign out
              </DropdownMenuItem>
            </>
          ) : (
            <>
              <DropdownMenuItem onClick={() => onAuth("signin")}>
                <LogIn className="h-4 w-4" />
                Sign in to save
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onAuth("signup")}>
                <UserRound className="h-4 w-4" />
                Create account
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onAuth("forgot-password")}>
                <FileText className="h-4 w-4" />
                Forgot password
              </DropdownMenuItem>
            </>
          )}
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={onHome}>
            <Home className="h-4 w-4" />
            Home
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  </aside>
  );
};
