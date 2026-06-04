import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Loader2 } from "lucide-react";
import { TooltipProvider } from "../ui/tooltip";
import { Card, CardDescription, CardHeader, CardTitle } from "../ui/card";
import { QUESTIONS } from "../../data/questions";
import { toast } from "sonner";
import { useEmotions } from "../../hooks/useEmotions";
import { prepareInterview, type PreparationResponse } from "../../lib/api";
import type { CandidateProfile, EmotionFrame, InterviewTurn } from "../../types/domain";
import { AssessmentMobileTabs } from "./AssessmentLayout";
import { SessionHeader } from "./SessionHeader";
import { IntakeSection } from "./sections/IntakeSection";
import { GapMapSection } from "./sections/GapMapSection";
import { QuestionEngineSection } from "./sections/QuestionEngineSection";
import { ResponseSection } from "./sections/ResponseSection";
import { AnalysisSection } from "./sections/AnalysisSection";
import { FusionSection } from "./sections/FusionSection";
import { workspaceTabs, type SessionQuestion, type WorkspaceTabId } from "./types";

/* ---------- helpers ---------- */
const skillKeywords = ["react","typescript","python","fastapi","sql","machine learning","communication","leadership","api","data","cloud","teamwork"];
const toLabel = (v = "") => v.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase()).trim();
const extractSkills = (v: string) => { const l = v.toLowerCase(); return skillKeywords.filter((s) => l.includes(s)); };
const scrollToSection = (id: string) => document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });

const defaultQuestions: SessionQuestion[] = QUESTIONS.map((q) => ({ category: q.category, text: q.text }));

/* ---------- component ---------- */
type Props = {
  userData: CandidateProfile;
  onComplete: (t: InterviewTurn[]) => void;
  onHome: () => void;
  initialModule?: WorkspaceTabId;
  onModuleChange?: (id: WorkspaceTabId) => void;
};

const InterviewWorkspace = ({
  userData,
  onComplete,
  onHome,
  initialModule = "intake-layer",
  onModuleChange,
}: Props) => {
  /* state */
  const [currentIdx,         setCurrentIdx]         = useState(0);
  const [isRecording,        setIsRecording]        = useState(false);
  const [isSpeaking,         setIsSpeaking]         = useState(false);
  const [isTalkbackPaused,   setIsTalkbackPaused]   = useState(false);
  const [transcript,         setTranscript]         = useState("");
  const [interimTranscript,  setInterimTranscript]  = useState("");
  const [interviewLog,       setInterviewLog]       = useState<InterviewTurn[]>([]);
  const [isProcessing,       setIsProcessing]       = useState(false);
  const [activeModule,       setActiveModule]       = useState<WorkspaceTabId>(initialModule);
  const [mediaStatus,        setMediaStatus]        = useState<"idle"|"loading"|"ready"|"blocked">("idle");
  const [speechSupported,    setSpeechSupported]    = useState(true);
  const [resumeText,         setResumeText]         = useState("");
  const [jobDescription,     setJobDescription]     = useState("");
  const [companyQuestions,   setCompanyQuestions]   = useState("");
  const [resumeFileName,     setResumeFileName]     = useState("");
  const [isResumeDragging,   setIsResumeDragging]   = useState(false);
  const [preparation,        setPreparation]        = useState<PreparationResponse | null>(null);
  const [isPreparing,        setIsPreparing]        = useState(false);
  const [sessionQuestions,   setSessionQuestions]   = useState<SessionQuestion[]>(defaultQuestions);

  const videoRef         = useRef<HTMLVideoElement | null>(null);
  const streamRef        = useRef<MediaStream | null>(null);
  const recognitionRef   = useRef<SpeechRecognition | null>(null);
  const emotionHistoryRef = useRef<EmotionFrame[]>([]);

  const { emotions, modelsLoaded, modelError } = useEmotions(videoRef);

  const question  = sessionQuestions[currentIdx] ?? defaultQuestions[0];
  const progress  = (interviewLog.length / sessionQuestions.length) * 100;

  const resumeSkills   = useMemo(() => extractSkills(resumeText),    [resumeText]);
  const jdSkills       = useMemo(() => extractSkills(jobDescription), [jobDescription]);
  const missingSkills  = useMemo(() => jdSkills.filter((s) => !resumeSkills.includes(s)), [jdSkills, resumeSkills]);
  const preparedGap    = preparation?.gap;
  const fitScore       = typeof preparedGap?.gap_score === "number"
    ? Math.max(0, Math.round((1 - preparedGap.gap_score) * 100))
    : jdSkills.length ? Math.round(((jdSkills.length - missingSkills.length) / jdSkills.length) * 100) : 0;
  const matchedSignals  = preparedGap?.matched_items?.length  ? preparedGap.matched_items  : resumeSkills;
  const missingSignals  = preparedGap?.missing_items?.length  ? preparedGap.missing_items  : missingSkills;
  const weakAreas       = preparedGap?.weak_areas       ?? [];
  const recommendations = preparedGap?.recommendations  ?? [];

  /* speech recognition */
  useEffect(() => {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) { setSpeechSupported(false); return; }
    const r = new SR();
    r.continuous = true; r.interimResults = true; r.lang = "en-IN";
    r.onresult = (e) => {
      let fin = ""; let interim = "";
      for (let i = e.resultIndex; i < e.results.length; i++) {
        const p = e.results[i][0].transcript;
        e.results[i].isFinal ? (fin += `${p} `) : (interim += p);
      }
      if (fin) setTranscript((prev) => `${prev}${fin}`.replace(/\s+/g, " "));
      setInterimTranscript(interim);
    };
    r.onerror = () => { setSpeechSupported(false); setIsRecording(false); };
    recognitionRef.current = r;
    return () => { r.stop(); recognitionRef.current = null; };
  }, []);

  /* camera cleanup */
  const stopTalkback = useCallback(() => { window.speechSynthesis.cancel(); setIsSpeaking(false); setIsTalkbackPaused(false); }, []);
  useEffect(() => () => { streamRef.current?.getTracks().forEach((t) => t.stop()); stopTalkback(); }, [stopTalkback]);

  const openModule = useCallback((id: WorkspaceTabId) => {
    setActiveModule(id);
    onModuleChange?.(id);
    window.setTimeout(() => scrollToSection(id), 80);
  }, [onModuleChange]);

  useEffect(() => {
    const handleWorkspaceNavigation = (event: Event) => {
      const moduleEvent = event as CustomEvent<{ id?: WorkspaceTabId }>;
      const id = moduleEvent.detail?.id;

      if (id && workspaceTabs.some((tab) => tab.id === id)) {
        openModule(id);
      }
    };

    window.addEventListener("personalens:assessment-module", handleWorkspaceNavigation);

    return () => {
      window.removeEventListener("personalens:assessment-module", handleWorkspaceNavigation);
    };
  }, [openModule]);

  const readResumeFile = useCallback(async (file: File) => {
    setResumeFileName(file.name);
    try {
      const raw = await file.text();
      setResumeText(raw.replace(/\0/g, " ").replace(/[^\x09\x0A\x0D\x20-\x7E]/g, " ").replace(/[ \t]{2,}/g, " ").trim() || raw.trim());
      setPreparation(null);
    } catch { toast.error("Resume file could not be read. Paste the text instead."); }
  }, []);

  const stopRecording = useCallback(() => { recognitionRef.current?.stop(); setIsRecording(false); setInterimTranscript(""); }, []);
  const pauseTalkback  = useCallback(() => { window.speechSynthesis.pause(); setIsSpeaking(false); setIsTalkbackPaused(true); }, []);
  const resumeTalkback = useCallback(() => { window.speechSynthesis.resume(); setIsSpeaking(true); setIsTalkbackPaused(false); }, []);

  const startCamera = useCallback(async () => {
    setMediaStatus("loading");
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
      streamRef.current = stream;
      if (videoRef.current) videoRef.current.srcObject = stream;
      setMediaStatus("ready");
    } catch { setMediaStatus("blocked"); }
  }, []);

  const stopCamera = useCallback(() => {
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
    if (videoRef.current) videoRef.current.srcObject = null;
    setMediaStatus("idle");
  }, []);

  const speak = useCallback((text: string) => {
    window.speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(text);
    u.rate = 0.92; u.pitch = 1;
    u.onend = () => { setIsSpeaking(false); setIsTalkbackPaused(false); };
    u.onerror = () => { setIsSpeaking(false); setIsTalkbackPaused(false); };
    setIsSpeaking(true); setIsTalkbackPaused(false);
    window.speechSynthesis.speak(u);
  }, []);

  useEffect(() => {
    if (emotions && isRecording) emotionHistoryRef.current.push({ ...emotions, timestamp: Date.now() });
  }, [emotions, isRecording]);

  const resetQuestionState = () => { setCurrentIdx(0); setTranscript(""); setInterimTranscript(""); setInterviewLog([]); emotionHistoryRef.current = []; };

  const generateInterviewPlan = async () => {
    if (!resumeText.trim() || !jobDescription.trim()) { toast.error("Add resume content and a job description first."); return; }
    setIsPreparing(true);
    try {
      const result = await prepareInterview({ resumeText, jobDescription, companyQuestions, totalQuestions: 8 });
      const qs = result.questions.map((q) => ({
        id: q.question_id, category: toLabel(q.category), text: q.question,
        difficulty: toLabel(q.difficulty), source: toLabel(q.source),
        rationale: q.rationale, expectedSignal: q.expected_signal, rubric: q.rubric ?? [],
      }));
      setPreparation(result);
      setSessionQuestions(qs.length ? qs : defaultQuestions);
      resetQuestionState();
      openModule("question-layer");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "PersonaLens could not generate the interview plan.");
    } finally { setIsPreparing(false); }
  };

  const useDefaultQuestions = () => { setCompanyQuestions(""); setPreparation(null); setSessionQuestions(defaultQuestions); resetQuestionState(); };

  const toggleRecording = () => {
    if (!speechSupported || !recognitionRef.current) return;
    if (isRecording) { stopRecording(); return; }
    try { recognitionRef.current.start(); setIsRecording(true); } catch { setIsRecording(false); }
  };

  const handleNext = async () => {
    const ans = transcript.trim();
    if (!ans) return;
    stopRecording(); stopTalkback();
    const entry: InterviewTurn = { question: question.text, category: question.category, answer: ans, emotions: [...emotionHistoryRef.current] };
    const nextLog = [...interviewLog, entry];
    setInterviewLog(nextLog);
    if (currentIdx < sessionQuestions.length - 1) {
      setCurrentIdx((p) => p + 1); setTranscript(""); setInterimTranscript(""); emotionHistoryRef.current = [];
      return;
    }
    setIsProcessing(true);
    onComplete(nextLog);
  };

  const dominantEmotions = emotions
    ? (Object.entries(emotions) as [string, number][]).sort(([, a], [, b]) => b - a).slice(0, 4)
    : [];

  return (
    <TooltipProvider delayDuration={140}>
      <section className="relative h-[calc(100vh-4rem)] overflow-hidden bg-background">
        <div className="h-full overflow-y-auto">
          <div className="mx-auto w-full max-w-7xl space-y-6 px-4 py-6 sm:px-6 lg:px-8">
            <AssessmentMobileTabs activeId={activeModule} onSelect={openModule} />
            <SessionHeader
              userData={userData} currentIdx={currentIdx}
              totalQuestions={sessionQuestions.length} fitScore={fitScore}
              preparation={preparation} turnsLogged={interviewLog.length} progress={progress}
              openModule={openModule}
            />

            {/* Sections — show/hide based on activeModule */}
            {activeModule === "intake-layer" && (
              <IntakeSection
                resumeText={resumeText} setResumeText={setResumeText}
                jobDescription={jobDescription} setJobDescription={setJobDescription}
                resumeFileName={resumeFileName}
                isResumeDragging={isResumeDragging} setIsResumeDragging={setIsResumeDragging}
                readResumeFile={readResumeFile}
                isPreparing={isPreparing}
                generateInterviewPlan={generateInterviewPlan}
                openModule={openModule} setPreparation={() => setPreparation(null)}
              />
            )}

            {activeModule === "gap-layer" && (
              <GapMapSection
                fitScore={fitScore} preparation={preparation}
                matchedSignals={matchedSignals} missingSignals={missingSignals}
                weakAreas={weakAreas} recommendations={recommendations}
                openModule={openModule}
              />
            )}

            {activeModule === "question-layer" && (
              <QuestionEngineSection
                sessionQuestions={sessionQuestions}
                companyQuestions={companyQuestions} setCompanyQuestions={setCompanyQuestions}
                isPreparing={isPreparing}
                preparation={preparation} setPreparation={() => setPreparation(null)}
                generateInterviewPlan={generateInterviewPlan}
                openModule={openModule} useDefaultQuestions={useDefaultQuestions}
              />
            )}

            {activeModule === "response-layer" && (
              <ResponseSection
                question={question} currentIdx={currentIdx}
                totalQuestions={sessionQuestions.length} progress={progress}
                transcript={transcript} setTranscript={setTranscript}
                interimTranscript={interimTranscript} setInterimTranscript={setInterimTranscript}
                isRecording={isRecording} isSpeaking={isSpeaking} isTalkbackPaused={isTalkbackPaused}
                speechSupported={speechSupported} mediaStatus={mediaStatus}
                modelsLoaded={modelsLoaded} modelError={modelError ?? undefined}
                videoRef={videoRef} isProcessing={isProcessing}
                startCamera={startCamera} stopCamera={stopCamera}
                toggleRecording={toggleRecording} speak={speak}
                pauseTalkback={pauseTalkback} resumeTalkback={resumeTalkback}
                handleNext={handleNext} openModule={openModule}
              />
            )}

            {activeModule === "analysis-layer" && (
              <AnalysisSection
                dominantEmotions={dominantEmotions} transcript={transcript}
                speechSupported={speechSupported} modelsLoaded={modelsLoaded}
                openModule={openModule}
              />
            )}

            {activeModule === "fusion-layer" && (
              <FusionSection
                currentIdx={currentIdx} totalQuestions={sessionQuestions.length}
                mediaStatus={mediaStatus} interviewLog={interviewLog}
              />
            )}
          </div>
        </div>

        {/* Processing overlay */}
        <AnimatePresence>
          {isProcessing && (
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 flex items-center justify-center bg-background/90 backdrop-blur-sm"
            >
              <div className="overflow-hidden rounded-2xl border border-border bg-white shadow-2xl">
                <div className="h-0.5 bg-gradient-to-r from-brand to-indigo-400" />
                <div className="flex flex-col items-center p-10 text-center">
                  <Loader2 className="mb-5 h-10 w-10 animate-spin text-brand" />
                  <p className="text-lg font-bold text-foreground">Generating assessment report</p>
                  <p className="mt-2 max-w-sm text-sm text-muted-foreground">
                    PersonaLens is preparing the fusion summary, OCEAN view, and structured report.
                  </p>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </section>
    </TooltipProvider>
  );
};

export default InterviewWorkspace;
