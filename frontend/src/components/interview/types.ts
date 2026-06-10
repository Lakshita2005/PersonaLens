export type SessionQuestion = {
  id?: string;
  category: string;
  text: string;
  difficulty?: string;
  source?: string;
  rationale?: string;
  expectedSignal?: string;
  rubric?: string[];
};

export const workspaceTabs = [
  { id: "intake-layer" as const,   label: "Intake",    step: "01", desc: "Resume & JD" },
  { id: "gap-layer" as const,      label: "Gap Map",   step: "02", desc: "Fit analysis" },
  { id: "question-layer" as const, label: "Questions", step: "03", desc: "AI question plan" },
  { id: "response-layer" as const, label: "Assessment",  step: "04", desc: "Live capture" },
  { id: "analysis-layer" as const, label: "Analysis",  step: "05", desc: "Multimodal" },
  { id: "fusion-layer" as const,   label: "Report",    step: "06", desc: "Fusion summary" },
];

export type WorkspaceTabId = (typeof workspaceTabs)[number]["id"];

export const emotionLabels: Record<string, string> = {
  neutral:   "Neutral",
  happy:     "Positive",
  sad:       "Low affect",
  angry:     "Tension",
  fearful:   "Stress",
  disgusted: "Discomfort",
  surprised: "Surprise",
};

export const formatPercent = (v = 0) => `${Math.round(v * 100)}%`;
