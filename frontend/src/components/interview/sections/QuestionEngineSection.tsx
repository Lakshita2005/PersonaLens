import { ChevronRight, Loader2, RotateCcw, Sparkles, Wand2 } from "lucide-react";
import { Button } from "../../ui/button";
import type { PreparationResponse } from "../../../lib/api";
import type { SessionQuestion, WorkspaceTabId } from "../types";

type Props = {
  sessionQuestions: SessionQuestion[];
  companyQuestions: string;
  setCompanyQuestions: (v: string) => void;
  isPreparing: boolean;
  preparation: PreparationResponse | null;
  setPreparation: (v: null) => void;
  generateInterviewPlan: () => void;
  openModule: (id: WorkspaceTabId) => void;
  useDefaultQuestions: () => void;
};

const diffBadge = (d = "") => {
  const l = d.toLowerCase();
  if (l.includes("hard"))   return "bg-red-50 text-red-600 ring-1 ring-red-200";
  if (l.includes("medium")) return "bg-amber-50 text-amber-700 ring-1 ring-amber-200";
  return "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200";
};

export const QuestionEngineSection = ({
  sessionQuestions, companyQuestions, setCompanyQuestions, isPreparing,
  preparation, setPreparation, generateInterviewPlan, openModule, useDefaultQuestions,
}: Props) => (
  <section id="question-layer" className="scroll-mt-6 space-y-6">
    {/* Header */}
    <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
      <div className="flex items-start gap-4">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-indigo-50 border border-indigo-100">
          <Wand2 size={22} className="text-indigo-600" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-slate-900">Question Engine</h2>
          <p className="mt-1 text-sm text-slate-500">
            Review your AI-generated interview plan or customize with company-specific questions.
          </p>
        </div>
      </div>
    </div>

    <div className="grid gap-6 xl:grid-cols-[1fr_320px]">
      {/* Question list */}
      <div className="rounded-xl border border-slate-200 bg-white shadow-sm flex flex-col max-h-[600px]">
        <div className="flex items-center justify-between border-b border-slate-100 bg-slate-50/80 px-6 py-5 shrink-0">
          <p className="font-bold text-slate-800">Active Question Set</p>
          <span className="rounded-full bg-indigo-100 border border-indigo-200 px-3 py-1 text-[11px] font-bold tracking-widest uppercase text-indigo-700">
            {sessionQuestions.length} prompts
          </span>
        </div>
        <div className="divide-y divide-slate-100 overflow-y-auto">
          {sessionQuestions.map((q, i) => (
            <div key={`${q.id || q.text}-${i}`} className="flex gap-4 px-6 py-5 transition-colors hover:bg-slate-50/50">
              <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-indigo-50 text-[11px] font-bold text-indigo-600 border border-indigo-100 shadow-sm">
                {i + 1}
              </span>
              <div className="min-w-0 flex-1">
                <div className="mb-2 flex flex-wrap items-center gap-2">
                  <span className="rounded-md bg-indigo-100/80 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-indigo-700">
                    {q.category}
                  </span>
                  {q.difficulty && (
                    <span className={`rounded-md px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider ${diffBadge(q.difficulty)}`}>
                      {q.difficulty}
                    </span>
                  )}
                  {q.source && (
                    <span className="rounded-md bg-slate-100 border border-slate-200 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-500">
                      {q.source}
                    </span>
                  )}
                </div>
                <p className="text-[15px] font-semibold leading-relaxed text-slate-800">{q.text}</p>
                {q.rationale && (
                  <p className="mt-1.5 text-xs leading-5 text-slate-500 font-medium">{q.rationale}</p>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Controls */}
      <div className="space-y-6">
        <div className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
          <div className="border-b border-slate-100 bg-slate-50/80 px-6 py-5">
            <p className="font-bold text-slate-800">Custom Prompts</p>
            <p className="mt-1 text-xs text-slate-500 font-medium">Optional — add your own questions, one per line.</p>
          </div>
          <div className="space-y-4 p-6 bg-slate-50/30">
            <textarea
              value={companyQuestions}
              onChange={(e) => { setCompanyQuestions(e.target.value); setPreparation(null); }}
              className="w-full rounded-xl border border-slate-200 bg-white p-4 text-sm leading-relaxed text-slate-700 placeholder:text-slate-400 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 min-h-[120px] resize-y"
              placeholder="e.g. Tell me about a time you led a team through ambiguity…"
            />
            <div className="space-y-2.5">
              <Button className="w-full h-11 gap-2 bg-slate-900 hover:bg-slate-800 text-white font-bold shadow-sm" onClick={generateInterviewPlan} disabled={isPreparing}>
                {isPreparing ? <Loader2 size={16} className="animate-spin" /> : <Sparkles size={16} />}
                {isPreparing ? "Generating…" : "Generate AI Plan"}
              </Button>
              <Button variant="outline" className="w-full h-11 gap-2 font-bold text-slate-600 bg-white hover:bg-slate-50" onClick={useDefaultQuestions}>
                <RotateCcw size={14} /> Reset Defaults
              </Button>
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-indigo-100 bg-indigo-50/60 p-5">
          <p className="mb-2 text-[11px] font-bold uppercase tracking-widest text-indigo-800">Pro tip</p>
          <p className="text-sm leading-relaxed text-indigo-900/80 font-medium">
            PersonaLens blends company-provided questions with AI-generated gap-targeted prompts, ensuring your session covers both expected topics and blind spots.
          </p>
        </div>
      </div>
    </div>
  </section>
);
