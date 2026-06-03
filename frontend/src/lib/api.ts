import type { AnalysisPayload, PersonalityAnalysis } from "../types/domain";

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL?.replace(/\/$/, "") || "http://localhost:8000";

export const fallbackAnalysis: PersonalityAnalysis = {
  ocean: [
    { trait: "Openness", A: 84, fullMark: 100 },
    { trait: "Conscientiousness", A: 79, fullMark: 100 },
    { trait: "Extraversion", A: 76, fullMark: 100 },
    { trait: "Agreeableness", A: 82, fullMark: 100 },
    { trait: "Neuroticism", A: 34, fullMark: 100 },
  ],
  summary:
    "The candidate demonstrates strong learning agility, thoughtful communication, and a practical approach to pressure. The profile suggests readiness for structured interviews with continued focus on specificity, examples, and reflective depth.",
  strengths: [
    "Clear self-awareness and motivation",
    "Composed response style under evaluation",
    "Strong collaboration and mentoring potential",
  ],
  improvements: [
    "Add more measurable outcomes to answers",
    "Use tighter examples when explaining conflict",
    "Balance confidence with concise evidence",
  ],
  suggestions: [
    "Practice STAR-format answers for placement interviews.",
    "Build a portfolio story for two academic projects and one leadership moment.",
    "Schedule mentor review sessions using the exported report as the discussion brief.",
  ],
};

const parseAnalysis = (value: unknown): PersonalityAnalysis => {
  if (typeof value === "string") {
    return JSON.parse(value) as PersonalityAnalysis;
  }

  if (value && typeof value === "object" && "analysis" in value) {
    const nested = (value as { analysis: unknown }).analysis;
    return parseAnalysis(nested);
  }

  return value as PersonalityAnalysis;
};

export const analyzeInterview = async (
  payload: AnalysisPayload,
): Promise<PersonalityAnalysis> => {
  const response = await fetch(`${API_BASE_URL}/api/v1/analyze`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const errorBody = await response.text();
    throw new Error(errorBody || `Analysis failed with status ${response.status}`);
  }

  const data = await response.json();
  return parseAnalysis(data.analysis ?? data);
};

export type PreparedQuestion = {
  question_id: string;
  category: string;
  difficulty: string;
  question: string;
  answer_modes: string[];
  source: string;
  rationale?: string;
  expected_signal?: string;
  rubric?: string[];
};

export type PreparationResponse = {
  candidate: Record<string, unknown>;
  job: Record<string, unknown>;
  gap: {
    matched_items?: string[];
    missing_items?: string[];
    weak_areas?: string[];
    gap_score?: number;
    recommendations?: string[];
  };
  questions: PreparedQuestion[];
  source_priority: string[];
  provider: string;
};

export type PreparationPayload = {
  resumeText: string;
  jobDescription: string;
  companyQuestions?: string;
  totalQuestions?: number;
};

export type AuthUser = {
  id: number;
  name: string;
  email: string;
  program?: string | null;
  created_at: string;
};

export type AuthResponse = {
  token: string;
  user: AuthUser;
};

export type OtpPurpose = "signin" | "signup" | "password_reset";

export type OtpResponse = {
  message: string;
  dev_otp?: string | null;
  expires_in_minutes: number;
};

export type ReportRecord = {
  id: number;
  candidateName: string;
  program?: string | null;
  assessmentTrack?: string | null;
  readinessScore: number;
  analysis: PersonalityAnalysis;
  turns: AnalysisPayload["turns"];
  created_at: string;
};

export type ReportPayload = Omit<ReportRecord, "id" | "created_at">;

const AUTH_TOKEN_KEY = "personalens.auth.token";

const getAuthToken = () =>
  typeof window === "undefined" ? "" : window.localStorage.getItem(AUTH_TOKEN_KEY) || "";

export const setAuthToken = (token: string) => {
  window.localStorage.setItem(AUTH_TOKEN_KEY, token);
};

export const clearAuthToken = () => {
  window.localStorage.removeItem(AUTH_TOKEN_KEY);
};

const authHeaders = (): Record<string, string> => {
  const token = getAuthToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
};

export const prepareInterview = async (
  payload: PreparationPayload,
): Promise<PreparationResponse> => {
  const response = await fetch(`${API_BASE_URL}/api/v1/prepare`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const errorBody = await response.text();
    throw new Error(errorBody || `Preparation failed with status ${response.status}`);
  }

  return response.json() as Promise<PreparationResponse>;
};

export const registerUser = async (payload: {
  name: string;
  email: string;
  password: string;
  program?: string;
}): Promise<AuthResponse> => {
  const response = await fetch(`${API_BASE_URL}/api/v1/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const errorBody = await response.text();
    throw new Error(errorBody || `Registration failed with status ${response.status}`);
  }

  return response.json() as Promise<AuthResponse>;
};

export const loginUser = async (payload: {
  email: string;
  password: string;
}): Promise<AuthResponse> => {
  const response = await fetch(`${API_BASE_URL}/api/v1/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const errorBody = await response.text();
    throw new Error(errorBody || `Login failed with status ${response.status}`);
  }

  return response.json() as Promise<AuthResponse>;
};

export const requestOtp = async (payload: {
  email: string;
  purpose: OtpPurpose;
}): Promise<OtpResponse> => {
  const response = await fetch(`${API_BASE_URL}/api/v1/auth/request-otp`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const errorBody = await response.text();
    throw new Error(errorBody || `OTP request failed with status ${response.status}`);
  }

  return response.json() as Promise<OtpResponse>;
};

export const verifyOtp = async (payload: {
  email: string;
  otp: string;
  purpose: OtpPurpose;
}): Promise<{ message: string }> => {
  const response = await fetch(`${API_BASE_URL}/api/v1/auth/verify-otp`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const errorBody = await response.text();
    throw new Error(errorBody || `OTP verification failed with status ${response.status}`);
  }

  return response.json() as Promise<{ message: string }>;
};

export const resetPassword = async (payload: {
  email: string;
  otp: string;
  newPassword: string;
}): Promise<{ message: string }> => {
  const response = await fetch(`${API_BASE_URL}/api/v1/auth/reset-password`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const errorBody = await response.text();
    throw new Error(errorBody || `Password reset failed with status ${response.status}`);
  }

  return response.json() as Promise<{ message: string }>;
};

export const changePassword = async (payload: {
  currentPassword: string;
  newPassword: string;
}): Promise<{ message: string }> => {
  const response = await fetch(`${API_BASE_URL}/api/v1/auth/change-password`, {
    method: "POST",
    headers: { "Content-Type": "application/json", ...authHeaders() },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const errorBody = await response.text();
    throw new Error(errorBody || `Password change failed with status ${response.status}`);
  }

  return response.json() as Promise<{ message: string }>;
};

export const googleAuth = async (payload: {
  email: string;
  name?: string;
  program?: string;
  credential?: string;
}): Promise<AuthResponse> => {
  const response = await fetch(`${API_BASE_URL}/api/v1/auth/google`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const errorBody = await response.text();
    throw new Error(errorBody || `Google authentication failed with status ${response.status}`);
  }

  return response.json() as Promise<AuthResponse>;
};

export const getCurrentUser = async (): Promise<AuthUser> => {
  const response = await fetch(`${API_BASE_URL}/api/v1/auth/me`, {
    headers: authHeaders(),
  });

  if (!response.ok) {
    throw new Error(`Profile lookup failed with status ${response.status}`);
  }

  return response.json() as Promise<AuthUser>;
};

export const saveReport = async (payload: ReportPayload): Promise<ReportRecord> => {
  const response = await fetch(`${API_BASE_URL}/api/v1/reports`, {
    method: "POST",
    headers: { "Content-Type": "application/json", ...authHeaders() },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const errorBody = await response.text();
    throw new Error(errorBody || `Report save failed with status ${response.status}`);
  }

  return response.json() as Promise<ReportRecord>;
};

export const listReports = async (): Promise<ReportRecord[]> => {
  const response = await fetch(`${API_BASE_URL}/api/v1/reports`, {
    headers: authHeaders(),
  });

  if (!response.ok) {
    throw new Error(`Report history failed with status ${response.status}`);
  }

  const data = (await response.json()) as { reports: ReportRecord[] };
  return data.reports;
};
