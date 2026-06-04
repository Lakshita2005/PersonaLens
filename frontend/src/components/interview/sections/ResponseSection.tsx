import type { RefObject } from "react";
import {
  Camera, CameraOff, ChevronRight, Loader2, MessageSquareText,
  Mic, PauseCircle, PlayCircle, Volume2,
} from "lucide-react";
import { Button } from "../../ui/button";
import { Progress } from "../../ui/progress";
import { Tooltip, TooltipContent, TooltipTrigger } from "../../ui/tooltip";
import type { SessionQuestion, WorkspaceTabId } from "../types";

type Props = {
  question: SessionQuestion;
  currentIdx: number;
  totalQuestions: number;
  progress: number;
  transcript: string;
  setTranscript: (v: string) => void;
  interimTranscript: string;
  setInterimTranscript: (v: string) => void;
  isRecording: boolean;
  isSpeaking: boolean;
  isTalkbackPaused: boolean;
  speechSupported: boolean;
  mediaStatus: "idle" | "loading" | "ready" | "blocked";
  modelsLoaded: boolean;
  modelError: string | undefined;
  videoRef: RefObject<HTMLVideoElement>;
  isProcessing: boolean;
  startCamera: () => void;
  stopCamera: () => void;
  toggleRecording: () => void;
  speak: (t: string) => void;
  pauseTalkback: () => void;
  resumeTalkback: () => void;
  handleNext: () => void;
  openModule: (id: WorkspaceTabId) => void;
};

const diffBadge = (d = "") => {
  const l = d.toLowerCase();
  if (l.includes("hard"))   return "bg-red-50 text-red-600";
  if (l.includes("medium")) return "bg-amber-50 text-amber-700";
  return "bg-emerald-50 text-emerald-700";
};

export const ResponseSection = ({
  question, currentIdx, totalQuestions, progress,
  transcript, setTranscript, interimTranscript, setInterimTranscript,
  isRecording, isSpeaking, isTalkbackPaused, speechSupported,
  mediaStatus, modelsLoaded, modelError, videoRef, isProcessing,
  startCamera, stopCamera, toggleRecording,
  speak, pauseTalkback, resumeTalkback, handleNext, openModule,
}: Props) => (
  <section id="response-layer" className="scroll-mt-6 space-y-6">
    {/* Header */}
    <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
      <div className="flex items-start gap-4">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-indigo-50 border border-indigo-100">
          <MessageSquareText size={22} className="text-indigo-600" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-slate-900">Assessment Capture</h2>
          <p className="mt-1 text-sm text-slate-500">
            Answer each question by speaking or typing. Facial expression analysis runs in parallel when camera is enabled.
          </p>
        </div>
      </div>
    </div>

    <div className="grid gap-6 xl:grid-cols-2">
      {/* Camera card */}
      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm flex flex-col">
        {/* Video */}
        <div className="relative aspect-video bg-slate-900/95 overflow-hidden rounded-t-xl">
          <video ref={videoRef} autoPlay muted playsInline className="h-full w-full object-cover" />

          {mediaStatus !== "ready" && (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 bg-slate-900/40">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white/10 shadow-[0_0_40px_rgba(255,255,255,0.1)] backdrop-blur-md border border-white/10">
                {mediaStatus === "blocked" ? (
                  <CameraOff size={28} className="text-slate-300" />
                ) : mediaStatus === "loading" ? (
                  <Loader2 size={28} className="animate-spin text-indigo-400" />
                ) : (
                  <Camera size={28} className="text-slate-300" />
                )}
              </div>
              <div className="text-center">
                <p className="text-base font-semibold text-white tracking-wide">
                  {mediaStatus === "blocked" ? "Camera blocked"
                    : mediaStatus === "loading" ? "Initializing vision…"
                    : "Camera is offline"}
                </p>
                <p className="mt-1.5 text-xs text-slate-300 font-medium">
                  {mediaStatus === "blocked"
                    ? "Check browser permissions."
                    : "Required for expression capture."}
                </p>
              </div>
              {mediaStatus !== "loading" && (
                <Button size="sm" onClick={startCamera} className="mt-2 gap-2 bg-indigo-600 text-white hover:bg-indigo-700 font-medium border-0">
                  <Camera size={14} /> Enable Vision
                </Button>
              )}
            </div>
          )}

          {/* Overlays */}
          <div className="absolute left-4 top-4 flex flex-wrap gap-2">
            <span className="inline-flex items-center gap-2 rounded-full bg-slate-900/60 px-3 py-1.5 text-[11px] font-semibold text-white backdrop-blur-md border border-white/10">
              <span className={`h-2 w-2 rounded-full shadow-sm ${mediaStatus === "ready" && modelsLoaded ? "bg-emerald-400 shadow-emerald-400/50" : "bg-slate-400"}`} />
              {mediaStatus === "ready" ? (modelsLoaded ? "Vision active" : "Loading models…") : "Vision paused"}
            </span>
            {isRecording && (
              <span className="inline-flex items-center gap-2 rounded-full bg-red-500/20 px-3 py-1.5 text-[11px] font-bold tracking-wider text-red-500 backdrop-blur-md border border-red-500/20">
                <span className="h-2 w-2 animate-pulse rounded-full bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.8)]" /> REC
              </span>
            )}
          </div>

          {mediaStatus === "ready" && (
            <div className="absolute right-4 top-4">
              <Button size="icon" onClick={stopCamera} className="h-8 w-8 rounded-full bg-slate-900/60 text-white hover:bg-slate-800/80 backdrop-blur-md border border-white/10">
                <CameraOff size={14} />
              </Button>
            </div>
          )}
        </div>

        {/* Camera info */}
        <div className="grid grid-cols-2 divide-x divide-slate-100 border-t border-slate-100 bg-slate-50/50">
          <div className="flex items-center gap-3 px-4 py-3">
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white shadow-sm border border-slate-100">
              <Camera size={15} className="text-slate-500" />
            </span>
            <div className="min-w-0">
              <p className="text-xs font-semibold text-slate-800">Video layer</p>
              <p className="truncate text-[11px] text-slate-500">
                {modelError || (mediaStatus === "ready" ? "Expression sampling active." : "Camera off — enable above.")}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3 px-4 py-3">
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white shadow-sm border border-slate-100">
              <Mic size={15} className="text-slate-500" />
            </span>
            <div className="min-w-0">
              <p className="text-xs font-semibold text-slate-800">Speech layer</p>
              <p className="truncate text-[11px] text-slate-500">
                {speechSupported ? "Enable mic to start capture." : "Type your answers instead."}
              </p>
            </div>
          </div>
        </div>
        
        {/* Fill the remaining gap with helpful instructions */}
        <div className="flex-1 p-6 bg-slate-50/30 flex flex-col justify-center">
          <p className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-4">Assessment Guidelines</p>
          <ul className="space-y-3">
            <li className="flex items-start gap-3 text-sm text-slate-600 font-medium">
              <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-indigo-100 text-indigo-600 text-[10px] font-bold">1</span>
              Speak clearly into your microphone, or type your answer in the box.
            </li>
            <li className="flex items-start gap-3 text-sm text-slate-600 font-medium">
              <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-indigo-100 text-indigo-600 text-[10px] font-bold">2</span>
              Maintain eye contact with the camera to generate accurate OCEAN personality scores.
            </li>
            <li className="flex items-start gap-3 text-sm text-slate-600 font-medium">
              <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-indigo-100 text-indigo-600 text-[10px] font-bold">3</span>
              Click 'Next Question' when you are satisfied with your response.
            </li>
          </ul>
        </div>
      </div>

      {/* Question + answer */}
      <div className="flex flex-col gap-6">
        {/* Question card */}
        <div className="rounded-xl border border-indigo-100 bg-indigo-50/40 shadow-sm overflow-hidden">
          <div className="border-b border-indigo-100/50 bg-transparent px-6 py-5">
            <div className="flex items-start justify-between gap-3">
              <div className="flex flex-wrap items-center gap-2">
                <span className="rounded-md bg-indigo-100/80 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-indigo-700">
                  {question.category}
                </span>
                {question.difficulty && (
                  <span className={`rounded-md px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider ${diffBadge(question.difficulty)}`}>
                    {question.difficulty}
                  </span>
                )}
                {question.source && (
                  <span className="rounded-md bg-white/60 border border-slate-200/60 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-500">
                    {question.source}
                  </span>
                )}
              </div>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-9 w-9 shrink-0 rounded-full hover:bg-indigo-100/50 text-indigo-600"
                    onClick={() => isSpeaking ? pauseTalkback() : isTalkbackPaused ? resumeTalkback() : speak(question.text)}>
                    {isSpeaking ? <PauseCircle size={18} /> : <Volume2 size={18} />}
                  </Button>
                </TooltipTrigger>
                <TooltipContent>{isSpeaking ? "Pause" : isTalkbackPaused ? "Resume" : "Read aloud"}</TooltipContent>
              </Tooltip>
            </div>
            <p className="mt-4 text-lg font-bold leading-relaxed text-slate-900">{question.text}</p>
            {question.rationale && (
              <p className="mt-2 text-sm leading-6 text-slate-600 font-medium">{question.rationale}</p>
            )}
          </div>
          <div className="px-6 py-4 bg-white/40">
            <div className="flex items-center justify-between text-xs font-bold text-indigo-900/60 uppercase tracking-widest">
              <span>Question {currentIdx + 1} of {totalQuestions}</span>
              <span className="text-indigo-600">{Math.round(progress)}%</span>
            </div>
            <Progress value={progress} className="mt-2 h-1.5 bg-indigo-100 [&>div]:bg-indigo-500" />
          </div>
        </div>

        {/* Transcript */}
        <div className="flex-1 rounded-xl border border-slate-200 bg-white shadow-sm flex flex-col">
          <div className="flex items-center justify-between border-b border-slate-100 bg-slate-50/80 px-6 py-4">
            <p className="text-sm font-bold text-slate-800 tracking-wide">Your Answer</p>
            {transcript.trim() && (
              <span className="inline-flex items-center rounded-full bg-indigo-50 px-2.5 py-0.5 text-[11px] font-bold text-indigo-600">
                {transcript.trim().split(/\s+/).length} words
              </span>
            )}
          </div>
          <div className="p-6">
            <textarea
              className="w-full resize-none bg-transparent text-slate-700 placeholder:text-slate-400 focus:outline-none min-h-[140px] text-[15px] leading-relaxed"
              value={transcript + (interimTranscript ? ` ${interimTranscript}` : "")}
              onChange={(e) => { setTranscript(e.target.value); setInterimTranscript(""); }}
              placeholder={
                speechSupported
                  ? "Your spoken answer appears here in real-time…"
                  : "Speech unavailable — type your answer here."
              }
            />
            <div className="mt-4 flex gap-3">
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant={isRecording ? "destructive" : "outline"}
                    size="lg" className={`flex-1 gap-2 font-bold shadow-sm ${!isRecording && "bg-white border-slate-200 hover:bg-slate-50 text-slate-700"}`}
                    onClick={toggleRecording} disabled={!speechSupported}
                  >
                    {isRecording ? <PauseCircle size={18} /> : <PlayCircle size={18} />}
                    {isRecording ? "Mute Mic" : "Enable Mic"}
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  {speechSupported ? "Toggle microphone capture." : "Speech recognition unavailable in this browser."}
                </TooltipContent>
              </Tooltip>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button size="lg" className="gap-2 font-bold bg-slate-900 hover:bg-slate-800 text-white shadow-sm"
                    onClick={handleNext} disabled={!transcript.trim() || isProcessing}>
                    {currentIdx === totalQuestions - 1 ? "Finish Assessment" : "Next Question"}
                    <ChevronRight size={18} />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Save response and advance.</TooltipContent>
              </Tooltip>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
);
