import {
  BarChart3,
  BrainCircuit,
  Camera,
  FileCheck2,
  GraduationCap,
  LockKeyhole,
  Mic2,
  Network,
  ShieldCheck,
  Workflow,
} from "lucide-react";

export const navItems = [
  { label: "Product", href: "#overview" },
  { label: "Dashboard", href: "#core-dashboard" },
  { label: "Architecture", href: "#pipeline" },
  { label: "Governance", href: "#governance" },
  { label: "Launch", href: "#assessment" },
];

export const capabilities = [
  {
    icon: BrainCircuit,
    title: "Personality inference",
    body: "OCEAN trait reporting from structured answers, interview behavior, and confidence signals.",
  },
  {
    icon: Camera,
    title: "Visual affect layer",
    body: "Browser-side face expression detection keeps real-time emotion sampling close to the candidate session.",
  },
  {
    icon: Mic2,
    title: "Speech readiness",
    body: "Transcript-driven review captures clarity, depth, and response structure for interview preparation.",
  },
  {
    icon: BarChart3,
    title: "Academic reporting",
    body: "Exportable reports turn each session into an advisory artifact for mentors and placement teams.",
  },
];

export const academicUseCases = [
  "Campus placement mock interviews",
  "Career services readiness scoring",
  "Soft skill lab assessment",
  "Mentor review before internships",
  "Scholarship and leadership preparation",
  "Final-year employability portfolio",
];

export const pipeline = [
  {
    icon: GraduationCap,
    label: "Candidate intake",
    detail: "Profile, program, track, and consent-aware session setup.",
  },
  {
    icon: Workflow,
    label: "Guided interview",
    detail: "Question sequence, transcript capture, and structured interview turns.",
  },
  {
    icon: Network,
    label: "Multimodal analysis",
    detail: "Text, facial expression timeline, and future speech layer integration.",
  },
  {
    icon: FileCheck2,
    label: "Report delivery",
    detail: "OCEAN scores, strengths, growth areas, and mentor-facing recommendations.",
  },
];

export const governance = [
  {
    icon: ShieldCheck,
    title: "Responsible AI posture",
    body: "Assessment output is positioned as guidance for mentorship, not as an automated rejection system.",
  },
  {
    icon: LockKeyhole,
    title: "Data boundaries",
    body: "Browser emotion sampling and API contracts are isolated so storage, audit, and consent rules can be added cleanly.",
  },
  {
    icon: Network,
    title: "Integration ready",
    body: "The frontend and FastAPI backend are now separated for LMS, ERP, and placement-cell integrations.",
  },
];
