import { FileText, Gauge, GitMerge, Radio } from "lucide-react";
import type { InterviewTurn } from "../../../types/domain";

type Props = {
  currentIdx: number;
  totalQuestions: number;
  mediaStatus: "idle" | "loading" | "ready" | "blocked";
  interviewLog: InterviewTurn[];
};

const fusionSteps = [
  { step: "01", title: "Transcript fusion",  body: "Full answer text from all questions is analysed for vocabulary, depth, and coherence." },
  { step: "02", title: "Emotion timeline",   body: "Per-question emotion samples are aggregated into confidence and stress trend scores." },
  { step: "03", title: "Resume-fit grading", body: "Answer content is compared against JD requirements to score gap coverage." },
  { step: "04", title: "OCEAN scoring",      body: "Openness, Conscientiousness, Extraversion, Agreeableness & Neuroticism are estimated." },
  { step: "05", title: "Hiring signal",      body: "All signals are fused into a structured hiring recommendation with evidence anchors." },
];

export const FusionSection = ({ currentIdx, totalQuestions, mediaStatus, interviewLog }: Props) => (
  <section id="fusion-layer" className="scroll-mt-6 space-y-6 pb-8">
    {/* Header */}
    <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
      <div className="flex items-start gap-4">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-indigo-50 border border-indigo-100">
          <GitMerge size={22} className="text-indigo-600" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-slate-900">Fusion Report</h2>
          <p className="mt-1 text-sm text-slate-500">
            PersonaLens fuses your transcript, emotion timeline, and fit signals into a structured LLM-generated assessment report.
          </p>
        </div>
      </div>
    </div>

    {/* Metric cards */}
    <div className="grid gap-4 sm:grid-cols-3">
      {[
        {
          icon: Gauge,
          tag: "Progress",
          value: `${currentIdx + 1} / ${totalQuestions}`,
          label: "Questions answered",
          detail: "Current position in the guided prompt sequence.",
          ok: currentIdx + 1 === totalQuestions,
        },
        {
          icon: Radio,
          tag: "Capture",
          value: mediaStatus === "ready" ? "Active" : "Pending",
          label: "Capture pipeline",
          detail: "Camera, microphone, transcript, and vision model status.",
          ok: mediaStatus === "ready",
        },
        {
          icon: FileText,
          tag: "Report",
          title: `${interviewLog.length} turn${interviewLog.length !== 1 ? "s" : ""}`,
          desc: "Answers ready for LLM fusion and structured report generation.",
          ok: interviewLog.length > 0,
        },
      ].map((c) => (
        <div key={c.tag} className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="mb-4 flex items-center justify-between">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600">
              <c.icon size={20} />
            </div>
            <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ${
              c.ok ? "bg-emerald-50 text-emerald-700" : "bg-slate-100 text-slate-600"
            }`}>
              <span className={`h-1.5 w-1.5 rounded-full ${c.ok ? "bg-emerald-500" : "bg-slate-400"}`} />
              {c.ok ? "Ready" : "Pending"}
            </span>
          </div>
          <p className="text-[11px] font-bold uppercase tracking-widest text-slate-500">{c.tag}</p>
          <p className="mt-1 font-semibold text-slate-900">{c.title}</p>
          <p className="mt-1.5 text-xs leading-5 text-slate-500">{c.desc}</p>
        </div>
      ))}
    </div>

    {/* Fusion pipeline steps */}
    <div className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
      <div className="border-b border-slate-100 bg-slate-50/50 px-5 py-4">
        <p className="font-semibold text-slate-800">How the fusion report is built</p>
      </div>
      <div className="divide-y divide-slate-100">
        {fusionSteps.map((s) => (
          <div key={s.step} className="flex gap-4 px-5 py-4">
            <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-brand/10 text-[10px] font-bold text-brand">
              {s.step}
            </span>
            <div>
              <p className="text-sm font-semibold text-foreground">{s.title}</p>
              <p className="mt-0.5 text-xs leading-5 text-muted-foreground">{s.body}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  </section>
);
