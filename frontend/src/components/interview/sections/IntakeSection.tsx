import { ChevronRight, FileText, Loader2, Sparkles, UploadCloud } from "lucide-react";
import { Button } from "../../ui/button";
import type { WorkspaceTabId } from "../types";

type Props = {
  resumeText: string;
  setResumeText: (v: string) => void;
  jobDescription: string;
  setJobDescription: (v: string) => void;
  resumeFileName: string;
  isResumeDragging: boolean;
  setIsResumeDragging: (v: boolean) => void;
  readResumeFile: (f: File) => Promise<void>;
  isPreparing: boolean;
  generateInterviewPlan: () => void;
  openModule: (id: WorkspaceTabId) => void;
  setPreparation: (v: null) => void;
};

const SectionLabel = ({ children }: { children: string }) => (
  <p className="mb-1.5 text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">{children}</p>
);

export const IntakeSection = ({
  resumeText, setResumeText, jobDescription, setJobDescription,
  resumeFileName, isResumeDragging, setIsResumeDragging, readResumeFile,
  isPreparing, generateInterviewPlan, openModule, setPreparation,
}: Props) => (
  <section id="intake-layer" className="scroll-mt-6 space-y-6">
    {/* Header */}
    <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
      <div className="flex items-start gap-4">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-indigo-50 border border-indigo-100">
          <UploadCloud size={22} className="text-indigo-600" />
        </div>
        <div className="flex-1">
          <h2 className="text-xl font-bold text-slate-900">Resume &amp; JD Intake</h2>
          <p className="mt-1 text-sm text-slate-500">
            Upload your resume and target job description so PersonaLens can build a focused, gap-targeted interview plan.
          </p>
        </div>
      </div>
    </div>

    {/* Removed Step Tracker for cleaner UI */}

    {/* Two-column form */}
    <div className="grid gap-8 lg:grid-cols-2">
      {/* Resume panel */}
      <div className="flex flex-col rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
        <div className="border-b border-slate-100 bg-slate-50/80 px-6 py-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded bg-indigo-100 text-indigo-600">
              <FileText size={16} />
            </div>
            <p className="font-bold text-slate-800">Your Resume</p>
          </div>
          {resumeFileName && (
            <span className="flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-700 border border-emerald-200">
              <Sparkles size={12} /> {resumeFileName}
            </span>
          )}
        </div>
        <div className="flex-1 p-6 space-y-6">
          {/* Drop zone */}
          <div
            onDragEnter={(e) => { e.preventDefault(); setIsResumeDragging(true); }}
            onDragOver={(e) => { e.preventDefault(); setIsResumeDragging(true); }}
            onDragLeave={() => setIsResumeDragging(false)}
            onDrop={(e) => {
              e.preventDefault(); setIsResumeDragging(false);
              const [f] = Array.from(e.dataTransfer.files);
              if (f) void readResumeFile(f);
            }}
            className={`relative flex min-h-[200px] w-full flex-col items-center justify-center rounded-xl border-2 border-dashed p-8 text-center transition-all duration-200 ${
              isResumeDragging ? "border-indigo-500 bg-indigo-50/80 scale-[1.02] shadow-inner" : "border-slate-200 bg-slate-50/50 hover:border-indigo-400 hover:bg-indigo-50/30"
            }`}
          >
            <input
              id="resume-file" type="file" accept=".txt,.md,.pdf,.doc,.docx"
              className="absolute inset-0 cursor-pointer opacity-0"
              onChange={(e) => { const f = e.currentTarget.files?.[0]; if (f) void readResumeFile(f); }}
            />
            <div className={`mb-4 flex h-14 w-14 items-center justify-center rounded-full transition-colors ${isResumeDragging ? "bg-indigo-100 text-indigo-600" : "bg-white text-slate-400 shadow-sm"}`}>
              <UploadCloud size={24} />
            </div>
            <p className="text-sm font-bold text-slate-700">Drag & drop your resume</p>
            <p className="text-xs text-slate-500 mt-1.5 font-medium">or click to browse files</p>
            <div className="mt-4 flex gap-2 text-[10px] font-bold uppercase tracking-wider text-slate-400">
              <span className="rounded bg-slate-100 px-2 py-1">PDF</span>
              <span className="rounded bg-slate-100 px-2 py-1">DOCX</span>
              <span className="rounded bg-slate-100 px-2 py-1">TXT</span>
            </div>
          </div>
          <div>
            <SectionLabel>Or paste text directly</SectionLabel>
            <textarea
              value={resumeText}
              onChange={(e) => { setResumeText(e.target.value); setPreparation(null); }}
              className="w-full rounded-xl border border-slate-200 bg-slate-50/50 p-4 text-sm leading-relaxed text-slate-700 placeholder:text-slate-400 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 min-h-[140px] resize-y"
              placeholder="Paste or review your skills, projects, education, and experience."
            />
          </div>
        </div>
      </div>

      {/* JD panel */}
      <div className="flex flex-col rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
        <div className="border-b border-slate-100 bg-slate-50/80 px-6 py-5">
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded bg-indigo-100 text-indigo-600">
              <Sparkles size={16} />
            </div>
            <p className="font-bold text-slate-800">Target Job Description</p>
          </div>
        </div>
        <div className="flex-1 p-6 flex flex-col gap-6">
          <div className="flex-1">
            <SectionLabel>Role requirements</SectionLabel>
            <textarea
              value={jobDescription}
              onChange={(e) => { setJobDescription(e.target.value); setPreparation(null); }}
              className="w-full h-full min-h-[280px] rounded-xl border border-slate-200 bg-slate-50/50 p-4 text-sm leading-relaxed text-slate-700 placeholder:text-slate-400 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 resize-none"
              placeholder="Paste the full job description — responsibilities, required skills, nice-to-haves."
            />
          </div>
          <div className="rounded-xl border border-indigo-100 bg-indigo-50/60 p-5 shrink-0">
            <p className="mb-3 text-[11px] font-bold uppercase tracking-widest text-indigo-800">How it works</p>
            <ul className="space-y-2.5">
              {[
                "Resume is parsed — skills, experience & education extracted.",
                "JD is analysed for required competencies and gaps.",
                "AI generates 8 targeted questions from your gap map.",
              ].map((t) => (
                <li key={t} className="flex items-start gap-3 text-[13px] leading-relaxed text-indigo-900/80 font-medium">
                  <span className="mt-1.5 flex h-1.5 w-1.5 shrink-0 rounded-full bg-indigo-500 shadow-sm shadow-indigo-500/50" />
                  {t}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>

    {/* Actions Banner */}
    <div className="mt-8 flex flex-col sm:flex-row items-center justify-between rounded-xl border border-indigo-100 bg-indigo-50/50 p-6 shadow-sm">
      <div className="mb-4 sm:mb-0">
        <p className="font-bold text-slate-800">Ready to start?</p>
        <p className="text-sm text-slate-500">Ensure your resume and JD are accurate before generating the plan.</p>
      </div>
      <Button 
        size="lg"
        onClick={generateInterviewPlan} 
        disabled={isPreparing} 
        className="w-full sm:w-auto gap-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold tracking-wide shadow-md hover:shadow-lg transition-all h-12 px-8"
      >
        {isPreparing ? <Loader2 size={18} className="animate-spin" /> : <Sparkles size={18} />}
        {isPreparing ? "Generating Interview Plan…" : "Generate AI Interview Plan"}
      </Button>
    </div>
  </section>
);
