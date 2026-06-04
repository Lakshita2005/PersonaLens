import { Activity, Camera, ChevronRight, Mic, MessageSquareText } from "lucide-react";
import { Button } from "../../ui/button";
import { Progress } from "../../ui/progress";
import { Tooltip, TooltipContent, TooltipTrigger } from "../../ui/tooltip";
import { emotionLabels, formatPercent } from "../types";
import type { WorkspaceTabId } from "../types";

type Props = {
  dominantEmotions: [string, number][];
  transcript: string;
  speechSupported: boolean;
  modelsLoaded: boolean;
  openModule: (id: WorkspaceTabId) => void;
};

const barClass = (v: number) =>
  v > 0.6 ? "[&>div]:bg-indigo-500"
  : v > 0.3 ? "[&>div]:bg-amber-400"
  : "[&>div]:bg-slate-300";

const badgeClass = (v: number) =>
  v > 0.6 ? "bg-indigo-100/80 text-indigo-700 border-indigo-200"
  : v > 0.3 ? "bg-amber-100/80 text-amber-700 border-amber-200"
  : "bg-slate-100 text-slate-600 border-slate-200";

export const AnalysisSection = ({
  dominantEmotions, transcript, speechSupported, modelsLoaded, openModule
}: Props) => (
  <section id="analysis-layer" className="scroll-mt-6 space-y-6">
    {/* Header */}
    <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
      <div className="flex items-start gap-4">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-indigo-50 border border-indigo-100">
          <Activity size={22} className="text-indigo-600" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-slate-900">Multimodal Analysis</h2>
          <p className="mt-1 text-sm text-slate-500">
            Real-time signals from facial expressions, speech, and transcript — sampled every frame while you record.
          </p>
        </div>
      </div>
    </div>

    <div className="grid gap-6 lg:grid-cols-[1fr_260px]">
      {/* Emotion bars */}
      <div className="rounded-xl border border-slate-200 bg-white shadow-sm flex flex-col">
        <div className="flex items-center justify-between border-b border-slate-100 bg-slate-50/50 px-5 py-4 shrink-0">
          <p className="text-sm font-semibold text-foreground">Live expression signals</p>
          <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${
            modelsLoaded ? "bg-emerald-50 text-emerald-700" : "bg-muted text-muted-foreground"
          }`}>
            <span className={`h-1.5 w-1.5 rounded-full ${modelsLoaded ? "bg-emerald-500 animate-pulse" : "bg-slate-400"}`} />
            {modelsLoaded ? "Model ready" : "Loading…"}
          </span>
        </div>
        <div className="p-5">
          {dominantEmotions.length ? (
            <div className="grid gap-4 sm:grid-cols-2">
              {dominantEmotions.map(([emotion, value]) => (
                <Tooltip key={emotion}>
                  <TooltipTrigger asChild>
                    <div className="rounded-xl border border-slate-100 bg-slate-50/50 p-5 transition-colors hover:bg-slate-50 hover:border-slate-200 hover:shadow-sm">
                      <div className="mb-3 flex items-center justify-between">
                        <span className="text-sm font-bold text-slate-800 capitalize">
                          {emotionLabels[emotion] ?? emotion}
                        </span>
                        <span className={`rounded-md border px-2.5 py-0.5 text-[11px] font-bold tracking-wider ${badgeClass(value)}`}>
                          {formatPercent(value)}
                        </span>
                      </div>
                      <Progress value={value * 100} className={`h-2 bg-slate-200/60 ${barClass(value)}`} />
                    </div>
                  </TooltipTrigger>
                  <TooltipContent>Live confidence from the local face-expression model.</TooltipContent>
                </Tooltip>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-16 text-center border-2 border-dashed border-slate-200 rounded-xl bg-slate-50/50">
              <span className="mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-50 border border-indigo-100 shadow-sm">
                <Activity size={28} className="text-indigo-600" />
              </span>
              <p className="text-base font-bold text-slate-800">No signals captured yet</p>
              <p className="mt-2 max-w-sm text-sm leading-6 text-slate-500">
                Enable the camera and start recording in the Assessment tab to see real-time emotion signals processing locally on your device.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Signal Status Cards */}
      <div className="space-y-6">
        {[
          {
            icon: MessageSquareText,
            label: "Text signal",
            desc: transcript.trim() ? `${transcript.trim().split(/\s+/).length} words recorded` : "Start recording to capture transcript.",
            active: !!transcript.trim(),
          },
          {
            icon: Mic,
            label: "Speech signal",
            desc: speechSupported ? "Web Speech API active." : "Speech recognition unsupported.",
            active: speechSupported,
          },
          {
            icon: Camera,
            label: "Video signal",
            desc: modelsLoaded ? "Face-expression model loaded." : "Loading model…",
            active: modelsLoaded,
          },
        ].map((s) => (
          <div key={s.label} className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="mb-3 flex items-center justify-between">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600">
                <s.icon size={20} />
              </div>
              <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ${
                s.active ? "bg-emerald-50 text-emerald-700" : "bg-slate-100 text-slate-600"
              }`}>
                <span className={`h-1.5 w-1.5 rounded-full ${s.active ? "bg-emerald-500 animate-pulse" : "bg-slate-400"}`} />
                {s.active ? "Active" : "Inactive"}
              </span>
            </div>
            <p className="font-semibold text-slate-800">{s.label}</p>
            <p className="mt-1 text-xs leading-5 text-slate-500">{s.desc}</p>
          </div>
        ))}
      </div>
    </div>
  </section>
);
