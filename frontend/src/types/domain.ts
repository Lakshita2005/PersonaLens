export type AuthView =
  | "signin"
  | "signup"
  | "forgot-password"
  | "verify-otp"
  | "reset-password"
  | "change-password"
  | "google-auth";

export type AppStep = "landing" | "interview" | "dashboard" | AuthView;

export type CandidateProfile = {
  name: string;
  program: string;
  assessmentTrack: string;
};

export type EmotionFrame = {
  timestamp: number;
  neutral?: number;
  happy?: number;
  sad?: number;
  angry?: number;
  fearful?: number;
  disgusted?: number;
  surprised?: number;
  [key: string]: number | undefined;
};

export type InterviewTurn = {
  question: string;
  answer: string;
  emotions: EmotionFrame[];
  category?: string;
};

export type OceanTrait = {
  trait: string;
  A: number;
  fullMark: number;
};

export type PersonalityAnalysis = {
  ocean: OceanTrait[];
  summary: string;
  strengths: string[];
  improvements: string[];
  suggestions: string[];
};

export type AnalysisPayload = {
  name: string;
  program?: string;
  assessmentTrack?: string;
  turns: InterviewTurn[];
};
