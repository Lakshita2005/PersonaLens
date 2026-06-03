import { Button } from "../ui/button";
import { Progress } from "../ui/progress";
import type { CandidateProfile } from "../../types/domain";
import type { PreparationResponse } from "../../lib/api";
import type { WorkspaceTabId } from "./types";

type Props = {
  userData: CandidateProfile;
  currentIdx: number;
  totalQuestions: number;
  fitScore: number;
  preparation: PreparationResponse | null;
  turnsLogged: number;
  progress: number;
  openModule: (id: WorkspaceTabId) => void;
};

export const SessionHeader = ({
  userData, currentIdx, totalQuestions, fitScore, preparation, turnsLogged, progress, openModule
}: Props) => (
  <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
    <div className="flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
      {/* Identity */}
      <div className="min-w-0">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-brand/10 bg-brand/5 px-2.5 py-1">
          <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-brand" />
          <span className="text-[10px] font-bold uppercase tracking-widest text-brand">Live Assessment</span>
        </div>
        <h1 className="truncate text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl">
          {userData.name}
        </h1>
        <p className="mt-1.5 text-sm font-medium text-muted-foreground">
          {userData.program}
          {userData.program && userData.assessmentTrack && <span className="mx-2 text-border">·</span>}
          <span className="text-foreground/80">{userData.assessmentTrack}</span>
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-2 sm:shrink-0 sm:gap-3">
        {[
          { label: "Question",   value: `${currentIdx + 1}/${totalQuestions}` },
          { label: "Resume fit", value: preparation ? `${fitScore}%` : "—" },
          { label: "Turns",      value: String(turnsLogged) },
        ].map((s) => (
          <div key={s.label} className="flex min-w-[80px] flex-col items-center justify-center rounded-xl border border-border/50 bg-slate-50/50 px-4 py-3 transition-colors hover:bg-slate-50">
            <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">{s.label}</p>
            <p className="mt-1 text-xl font-black tabular-nums text-foreground">{s.value}</p>
          </div>
        ))}
      </div>
    </div>

    {/* Progress bar and Continue button */}
    <div className="mt-8">
      <div className="mb-3 flex flex-wrap items-center justify-between gap-4">
        <div className="text-xs font-semibold text-slate-500">
          Session progress <span className="ml-1.5 text-indigo-600 tabular-nums">{Math.round(progress)}%</span>
        </div>
        <Button 
          size="sm" 
          onClick={() => openModule("response-layer")} 
          className="bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm font-semibold h-8 gap-2"
        >
          Continue Assessment <span aria-hidden="true">&rarr;</span>
        </Button>
      </div>
      <Progress value={progress} className="h-2 w-full bg-slate-100" />
    </div>
  </div>
);
