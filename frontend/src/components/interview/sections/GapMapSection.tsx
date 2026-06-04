import { BarChart3, ChevronRight, ClipboardCheck, Search, ShieldCheck } from "lucide-react";
import { Button } from "../../ui/button";
import { Progress } from "../../ui/progress";
import type { PreparationResponse } from "../../../lib/api";
import type { WorkspaceTabId } from "../types";

type Props = {
  fitScore: number;
  preparation: PreparationResponse | null;
  matchedSignals: string[];
  missingSignals: string[];
  weakAreas: string[];
  recommendations: string[];
  openModule: (id: WorkspaceTabId) => void;
};

export const GapMapSection = ({
  fitScore, preparation, matchedSignals, missingSignals, weakAreas, recommendations, openModule
}: Props) => (
  <section id="gap-layer" className="scroll-mt-6 space-y-6">
    {/* Header */}
    <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
      <div className="flex items-start gap-4">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-indigo-50 border border-indigo-100">
          <Search size={22} className="text-indigo-600" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-slate-900">Gap Map Analysis</h2>
          <p className="mt-1 text-sm text-slate-500">
            Compare your profile against the role requirements to identify key areas for preparation.
          </p>
        </div>
      </div>
    </div>

    <div className="grid gap-4 lg:grid-cols-[1fr_300px]">
      {/* Left */}
      <div className="space-y-6">
        {/* Fit score */}
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="mb-4 flex items-center justify-between">
            <p className="text-sm font-semibold text-foreground">Resume–job fit score</p>
            <span className={`text-3xl font-black tabular-nums ${
              !preparation ? "text-muted-foreground" :
              fitScore >= 70 ? "text-emerald-600" : fitScore >= 40 ? "text-amber-600" : "text-red-600"
            }`}>
              {preparation ? `${fitScore}%` : "—"}
            </span>
          </div>
          <Progress
            value={preparation ? fitScore : 0}
            className={`h-2 ${
              fitScore >= 70 ? "[&>div]:bg-emerald-500" :
              fitScore >= 40 ? "[&>div]:bg-amber-500" :
              "[&>div]:bg-red-500"
            }`}
          />
          <p className="mt-3 text-xs text-muted-foreground">
            {preparation
              ? fitScore >= 70
                ? "Strong match — you are well-positioned for this role."
                : fitScore >= 40
                ? "Moderate match — a few targeted gaps to bridge."
                : "Significant gaps — focus on the key missing skills."
              : "Generate an interview plan to compute your fit score against the role."}
          </p>
        </div>

        {/* Strengths & gaps */}
        <div className="grid gap-6 sm:grid-cols-2">
          <div className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
            <div className="bg-emerald-50 px-4 py-3 border-b border-emerald-100 flex items-center gap-2">
              <ShieldCheck size={16} className="text-emerald-600" />
              <p className="text-sm font-semibold text-emerald-800">Matching Strengths</p>
            </div>
            <div className="p-4">
              {matchedSignals.length ? (
                <div className="flex flex-wrap gap-1.5">
                  {matchedSignals.slice(0, 14).map((s) => (
                    <span key={s} className="rounded-full border border-emerald-200 bg-white px-2.5 py-0.5 text-xs font-medium text-emerald-800">
                      {s}
                    </span>
                  ))}
                </div>
              ) : (
                <p className="text-xs leading-5 text-emerald-700/70">Generate a plan to detect your matched resume signals.</p>
              )}
            </div>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
            <div className="bg-rose-50 px-4 py-3 border-b border-rose-100 flex items-center gap-2">
              <BarChart3 size={16} className="text-rose-600" />
              <p className="text-sm font-semibold text-rose-800">Identified Gaps</p>
            </div>
            <div className="p-4">
              {missingSignals.length ? (
                <div className="flex flex-wrap gap-1.5">
                  {missingSignals.slice(0, 14).map((s) => (
                    <span key={s} className="rounded-full border border-amber-200 bg-white px-2.5 py-0.5 text-xs font-medium text-amber-800">
                      {s}
                    </span>
                  ))}
                </div>
              ) : (
                <p className="text-xs leading-5 text-amber-700/70">No skill gaps detected yet.</p>
              )}
            </div>
          </div>
        </div>

        {/* Prep actions */}
        {(weakAreas.length > 0 || recommendations.length > 0) && (
          <div className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
            <div className="border-b border-slate-100 bg-slate-50/50 px-6 py-5">
              <p className="font-bold text-slate-800">Recommended Preparation</p>
            </div>
            <div className="p-6 space-y-3">
              {[...weakAreas, ...recommendations].slice(0, 6).map((item, i) => (
                <div key={item} className="flex items-start gap-4 rounded-xl border border-indigo-100/50 bg-indigo-50/30 px-5 py-4 transition-colors hover:bg-indigo-50/60">
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-indigo-100 text-[11px] font-bold text-indigo-700 shadow-sm">
                    {i + 1}
                  </span>
                  <span className="text-sm leading-6 text-slate-700 font-medium">{item}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Right: info cards */}
      <div className="space-y-4">
        {[
          {
            icon: ClipboardCheck,
            tag: "Explainable AI",
            title: "Grounded Feedback",
            body: "Every insight is derived from your resume, JD, and live answers — fully explainable.",
          },
          {
            icon: BarChart3,
            tag: "Analytics",
            title: "Session Benchmarking",
            body: "Fit score, emotion trends, and answer quality tracked across attempts.",
          },
          {
            icon: ShieldCheck,
            tag: "Local Only",
            title: "Privacy-First",
            body: "All vision processing runs locally in-browser — nothing is uploaded or stored.",
          },
        ].map((c) => (
          <div key={c.title} className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm relative overflow-hidden group hover:border-indigo-200 transition-colors">
            <div className="absolute right-0 top-0 h-full w-1 bg-indigo-500 opacity-0 transition-opacity group-hover:opacity-100" />
            <div className="mb-4 flex items-center justify-between">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 border border-indigo-100/50">
                <c.icon size={22} />
              </div>
              <span className="rounded-md bg-slate-100 px-2.5 py-1 text-[10px] font-bold uppercase tracking-widest text-slate-500">
                {c.tag}
              </span>
            </div>
            <p className="text-base font-bold text-slate-800">{c.title}</p>
            <p className="mt-2 text-sm leading-6 text-slate-500">{c.body}</p>
          </div>
        ))}
      </div>
    </div>
  </section>
);
