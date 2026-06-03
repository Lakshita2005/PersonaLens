import {
  Activity, GitMerge, MessageSquareText, Search, UploadCloud, Wand2,
} from "lucide-react";
import { workspaceTabs, type WorkspaceTabId } from "./types";

const ICONS = {
  "intake-layer":   UploadCloud,
  "gap-layer":      Search,
  "question-layer": Wand2,
  "response-layer": MessageSquareText,
  "analysis-layer": Activity,
  "fusion-layer":   GitMerge,
} as const;

type Props = {
  activeId: WorkspaceTabId;
  isOpen: boolean;
  onHome: () => void;
  onSelect: (id: WorkspaceTabId) => void;
  onOpenChange: (v: boolean) => void;
};

export const AssessmentSidebar = ({ activeId, isOpen, onHome, onSelect, onOpenChange }: Props) => (
  <aside
    onMouseEnter={() => onOpenChange(true)}
    onMouseLeave={() => onOpenChange(false)}
    className={`fixed left-0 top-0 z-[70] hidden h-screen flex-col bg-slate-950 transition-[width] duration-300 ease-in-out lg:flex ${
      isOpen ? "w-[220px]" : "w-[68px]"
    }`}
  >
    {/* Logo */}
    <button
      type="button"
      onClick={onHome}
      className="flex h-[60px] shrink-0 items-center gap-3 px-4"
      aria-label="Go home"
    >
      <img src="/logo.png" alt="PersonaLens" className="h-8 w-8 shrink-0 object-contain" />
      <span className={`text-base font-bold text-white transition-opacity duration-300 ${isOpen ? "opacity-100" : "w-0 opacity-0 overflow-hidden"}`}>
        PersonaLens
      </span>
    </button>

    {/* Nav */}
    <nav className="flex flex-1 flex-col gap-1 overflow-y-auto p-3 pb-24" aria-label="Assessment pipeline">
      {workspaceTabs.map((item) => {
        const Icon = ICONS[item.id];
        const active = activeId === item.id;
        return (
          <button
            key={item.id}
            type="button"
            onClick={() => onSelect(item.id)}
            aria-label={item.label}
            className={`group flex items-center rounded-xl text-sm font-medium transition-all duration-150 ${
              isOpen ? "w-full h-10 px-3 gap-3" : "w-10 h-10 justify-center px-0 mx-auto"
            } ${
              active
                ? "bg-brand text-white shadow-sm"
                : "text-slate-400 hover:bg-white/5 hover:text-slate-100"
            }`}
          >
            <Icon size={18} className="shrink-0" />
            {isOpen && (
              <span className="flex-1 truncate text-left text-sm opacity-100 transition-opacity duration-300">
                {item.label}
              </span>
            )}
          </button>
        );
      })}
    </nav>

    {/* Footer */}
    <div className={`absolute bottom-0 left-0 right-0 overflow-hidden whitespace-nowrap border-t border-white/10 bg-slate-950 transition-all duration-300 ${isOpen ? "h-[72px] px-5 py-4 opacity-100" : "h-0 border-transparent px-4 py-0 opacity-0"}`}>
      <p className="text-[12px] font-semibold text-slate-300">PersonaLens</p>
      <p className="text-[11px] font-medium text-slate-500 mt-0.5">AI Interview Intelligence</p>
    </div>

  </aside>
);

export const AssessmentMobileTabs = ({
  activeId,
  onSelect,
}: Pick<Props, "activeId" | "onSelect">) => (
  <div className="sticky top-0 z-30 -mx-4 mb-6 border-b border-border bg-white/95 px-4 py-2 backdrop-blur-sm lg:hidden">
    <nav className="flex gap-1.5 overflow-x-auto pb-0.5" style={{ scrollbarWidth: "none" }}>
      {workspaceTabs.map((item) => {
        const Icon = ICONS[item.id];
        const active = activeId === item.id;
        return (
          <button
            key={item.id}
            type="button"
            onClick={() => onSelect(item.id)}
            className={`inline-flex h-8 shrink-0 items-center gap-1.5 rounded-lg px-3 text-xs font-semibold transition-all ${
              active
                ? "bg-brand text-white shadow-sm"
                : "bg-muted text-muted-foreground hover:text-foreground"
            }`}
          >
            <Icon size={13} />
            {item.label}
          </button>
        );
      })}
    </nav>
  </div>
);
