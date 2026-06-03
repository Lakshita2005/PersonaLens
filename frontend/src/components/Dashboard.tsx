import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import {
  PolarAngleAxis,
  PolarGrid,
  PolarRadiusAxis,
  Radar,
  RadarChart,
  ResponsiveContainer,
} from "recharts";
import {
  AlertTriangle,
  BarChart3,
  BadgeCheck,
  BookOpenCheck,
  CalendarDays,
  CheckCircle2,
  ClipboardList,
  FileDown,
  FileText,
  Gauge,
  History,
  LayoutDashboard,
  Loader2,
  LogIn,
  LogOut,
  RefreshCw,
  ShieldCheck,
  Target,
  TrendingUp,
  UserRound,
} from "lucide-react";
import {
  analyzeInterview,
  fallbackAnalysis,
  listReports,
  saveReport,
  type AuthUser,
  type ReportRecord,
} from "../lib/api";
import type { AuthView, CandidateProfile, InterviewTurn, PersonalityAnalysis } from "../types/domain";
import { downloadReportPdf } from "../utils/reportPdf";
import { Button } from "./ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Progress } from "./ui/progress";
type DashboardProps = {
  userData: CandidateProfile;
  interviewData: InterviewTurn[];
  onRetake: () => void;
  authUser: AuthUser | null;
  onAuth: (view: AuthView) => void;
  onSignOut: () => void;
  onViewChange?: (view: ReportView) => void;
};

type ReportView = "overview" | "reports" | "profile" | "export";

const reportViews = [
  { id: "overview", label: "Result", icon: LayoutDashboard },
  { id: "reports", label: "History", icon: History },
  { id: "profile", label: "Profile", icon: UserRound },
  { id: "export", label: "Export", icon: FileDown },
] as const;

const averageTraitScore = (analysis: PersonalityAnalysis | null) => {
  if (!analysis?.ocean.length) {
    return 0;
  }

  const total = analysis.ocean.reduce((sum, item) => sum + Number(item.A || 0), 0);
  return Math.round(total / analysis.ocean.length);
};

const readinessBand = (score: number) => {
  if (score >= 82) {
    return {
      label: "Interview ready",
      tone: "text-emerald-700",
      bg: "bg-emerald-50",
      border: "border-emerald-200",
    };
  }

  if (score >= 68) {
    return {
      label: "Mentor review",
      tone: "text-blue-700",
      bg: "bg-blue-50",
      border: "border-blue-200",
    };
  }

  return {
    label: "Needs practice",
    tone: "text-amber-700",
    bg: "bg-amber-50",
    border: "border-amber-200",
  };
};

const summarizeEmotion = (turn: InterviewTurn) => {
  const totals: Record<string, number> = {};
  let frames = 0;

  turn.emotions.forEach((frame) => {
    Object.entries(frame).forEach(([key, value]) => {
      if (key === "timestamp" || typeof value !== "number") {
        return;
      }

      totals[key] = (totals[key] || 0) + value;
    });
    frames += 1;
  });

  if (!frames) {
    return "No stable sample";
  }

  const [emotion, total] =
    Object.entries(totals).sort(([, a], [, b]) => b - a)[0] || [];

  return emotion ? `${emotion} ${Math.round((total / frames) * 100)}%` : "No stable sample";
};

const formatDate = (value?: string) => {
  if (!value) {
    return "Current session";
  }

  return new Intl.DateTimeFormat("en-IN", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
};

const parseApiError = (error: unknown, fallback: string) => {
  if (!(error instanceof Error)) {
    return fallback;
  }

  try {
    const parsed = JSON.parse(error.message) as { detail?: string };
    return parsed.detail || fallback;
  } catch {
    return error.message || fallback;
  }
};

const ReportSidebar = ({
  activeView,
  onSelect,
  authUser,
  isOpen,
  onHome,
  onOpenChange,
}: {
  activeView: ReportView;
  onSelect: (view: ReportView) => void;
  authUser: AuthUser | null;
  isOpen: boolean;
  onHome: () => void;
  onOpenChange: (value: boolean) => void;
}) => (
  <aside
    onMouseEnter={() => onOpenChange(true)}
    onMouseLeave={() => onOpenChange(false)}
    className={`fixed left-0 top-0 z-[70] hidden h-screen flex-col border-r border-border bg-white/95 p-3 shadow-soft backdrop-blur-xl transition-[width] duration-300 lg:flex ${
      isOpen ? "w-72" : "w-20"
    }`}
  >
    <button
      type="button"
      onClick={onHome}
      className={`mb-4 flex h-16 w-full items-center overflow-hidden bg-transparent text-brand focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${
        isOpen ? "justify-start px-3" : "justify-center px-0"
      }`}
      aria-label="PersonaLens report workspace"
    >
      <img
        src={isOpen ? "/logo_wordmark.png" : "/logo.png"}
        alt="PersonaLens"
        className={isOpen ? "h-12 w-auto max-w-[220px] object-contain" : "h-10 w-10 object-contain"}
      />
    </button>

    <nav className="space-y-1" aria-label="Report workspace navigation">
      {reportViews.map((item) => (
        <button
          key={item.id}
          type="button"
          onClick={() => onSelect(item.id)}
          className={`flex text-sm font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${
            isOpen
              ? "h-11 w-full items-center gap-3 rounded-xl border px-3"
              : "mx-auto h-12 w-12 items-center justify-center rounded-full border p-0"
          } ${
            activeView === item.id
              ? "border-brand/20 bg-brand-soft text-brand shadow-line"
              : "border-transparent bg-transparent text-muted-foreground hover:bg-brand-soft hover:text-brand"
          }`}
          aria-label={item.label}
        >
          <item.icon className="h-5 w-5 shrink-0" />
          <span
            className={`min-w-0 overflow-hidden whitespace-nowrap transition-all duration-200 ${
              isOpen ? "max-w-[180px] opacity-100" : "max-w-0 opacity-0"
            }`}
          >
            {item.label}
          </span>
        </button>
      ))}
    </nav>

    <div className="mt-auto rounded-xl border border-border bg-background p-3">
      <div className="flex items-center gap-3">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-brand-soft text-sm font-bold text-brand">
          {(authUser?.name || "PL").slice(0, 1).toUpperCase()}
        </div>
        <div
          className={`min-w-0 overflow-hidden transition-all duration-200 ${
            isOpen ? "max-w-[180px] opacity-100" : "max-w-0 opacity-0"
          }`}
        >
          <p className="truncate text-sm font-bold text-foreground">
            {authUser?.name || "Guest profile"}
          </p>
          <p className="truncate text-xs text-muted-foreground">
            {authUser ? "History sync on" : "Sign in to save"}
          </p>
        </div>
      </div>
    </div>
  </aside>
);

const ReportMobileNav = ({
  activeView,
  onSelect,
}: {
  activeView: ReportView;
  onSelect: (view: ReportView) => void;
}) => (
  <div className="sticky top-0 z-30 -mx-4 mb-5 border-y border-border bg-background/95 px-4 py-2 backdrop-blur lg:hidden">
    <nav className="flex gap-2 overflow-x-auto" aria-label="Report workspace navigation">
      {reportViews.map((item) => (
        <button
          key={item.id}
          type="button"
          onClick={() => onSelect(item.id)}
          className={`inline-flex h-10 shrink-0 items-center gap-2 rounded-full border px-3 text-xs font-bold shadow-line ${
            activeView === item.id
              ? "border-brand/20 bg-brand-soft text-brand"
              : "border-border bg-white text-muted-foreground"
          }`}
        >
          <item.icon className="h-4 w-4" />
          {item.label}
        </button>
      ))}
    </nav>
  </div>
);

const Dashboard = ({
  userData,
  interviewData,
  onRetake,
  authUser,
  onAuth,
  onSignOut,
  onViewChange,
}: DashboardProps) => {
  const [analysis, setAnalysis] = useState<PersonalityAnalysis | null>(null);
  const [loading, setLoading] = useState(true);
  const [isDownloading, setIsDownloading] = useState(false);
  const [usingFallback, setUsingFallback] = useState(false);
  const [activeView, setActiveView] = useState<ReportView>("overview");
  const [reports, setReports] = useState<ReportRecord[]>([]);
  const [reportSyncState, setReportSyncState] = useState("Sign in to save this result");
  const [hasSavedCurrentReport, setHasSavedCurrentReport] = useState(false);
  const [currentReportId, setCurrentReportId] = useState<number | null>(null);

  useEffect(() => {
    const handleResultNavigation = (event: Event) => {
      const resultEvent = event as CustomEvent<{ view?: ReportView }>;
      const view = resultEvent.detail?.view;

      if (view && reportViews.some((item) => item.id === view)) {
        setActiveView(view);
      }
    };

    window.addEventListener("personalens:result-view", handleResultNavigation);

    return () => {
      window.removeEventListener("personalens:result-view", handleResultNavigation);
    };
  }, []);

  useEffect(() => {
    onViewChange?.(activeView);
  }, [activeView, onViewChange]);

  useEffect(() => {
    let isMounted = true;

    const fetchAnalysis = async () => {
      setLoading(true);
      setUsingFallback(false);

      try {
        const result = await analyzeInterview({
          name: userData.name,
          program: userData.program,
          assessmentTrack: userData.assessmentTrack,
          turns: interviewData,
        });

        if (isMounted) {
          setAnalysis(result);
        }
      } catch (error) {
        console.error("Analysis API failed, using demo fallback", error);

        if (isMounted) {
          setAnalysis(fallbackAnalysis);
          setUsingFallback(true);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchAnalysis();

    return () => {
      isMounted = false;
    };
  }, [interviewData, userData]);

  useEffect(() => {
    let isMounted = true;

    const syncHistory = async () => {
      if (!authUser) {
        setReports([]);
        setHasSavedCurrentReport(false);
        setCurrentReportId(null);
        setReportSyncState("Sign in to save this result");
        return;
      }

      try {
        const history = await listReports();

        if (isMounted) {
          setReports(history);
          setReportSyncState("Result history synced");
        }
      } catch (error) {
        if (isMounted) {
          setReportSyncState(parseApiError(error, "Result history sync failed"));
        }
      }
    };

    syncHistory();

    return () => {
      isMounted = false;
    };
  }, [authUser]);

  const readinessScore = useMemo(() => averageTraitScore(analysis), [analysis]);
  const band = readinessBand(readinessScore);
  const latestPreviousReport = reports.find((report) => report.id !== currentReportId);
  const comparisonDelta = latestPreviousReport
    ? readinessScore - latestPreviousReport.readinessScore
    : null;

  useEffect(() => {
    let isMounted = true;

    const persistReport = async () => {
      if (!authUser || !analysis || hasSavedCurrentReport) {
        return;
      }

      try {
        setReportSyncState("Saving result to profile");
        const saved = await saveReport({
          candidateName: userData.name,
          program: userData.program,
          assessmentTrack: userData.assessmentTrack,
          readinessScore,
          analysis,
          turns: interviewData,
        });
        const history = await listReports();

        if (isMounted) {
          setHasSavedCurrentReport(true);
          setCurrentReportId(saved.id);
          setReports(history.length ? history : [saved]);
          setReportSyncState("Current result saved");
        }
      } catch (error) {
        if (isMounted) {
          setReportSyncState(parseApiError(error, "Result save failed"));
        }
      }
    };

    persistReport();

    return () => {
      isMounted = false;
    };
  }, [
    analysis,
    authUser,
    hasSavedCurrentReport,
    interviewData,
    readinessScore,
    userData.assessmentTrack,
    userData.name,
    userData.program,
  ]);

  const handleDownloadReport = async () => {
    if (!analysis || isDownloading) {
      return;
    }

    try {
      setIsDownloading(true);
      downloadReportPdf({ userData, analysis, interviewData });
    } finally {
      setIsDownloading(false);
    }
  };

  if (loading || !analysis) {
    return (
      <section className="container-shell relative z-10 flex min-h-[70vh] items-center justify-center py-16">
        <Card className="w-full max-w-md shadow-soft">
          <CardHeader className="items-center text-center">
            <Loader2 className="mb-4 h-10 w-10 animate-spin text-brand" />
          <CardTitle>Synthesizing persona result</CardTitle>
            <CardDescription>
              PersonaLens is combining interview answers and signal history.
            </CardDescription>
          </CardHeader>
        </Card>
      </section>
    );
  }

  const metricCards = [
    {
      label: "Readiness index",
      value: `${readinessScore}`,
      hint: band.label,
      icon: Gauge,
      className: `${band.bg} ${band.border} ${band.tone}`,
    },
    {
      label: "Evidence turns",
      value: `${interviewData.length}`,
      hint: "Recorded answers",
      icon: ClipboardList,
      className: "border-blue-200 bg-blue-50 text-blue-700",
    },
    {
      label: "Result sync",
      value: authUser ? "On" : "Guest",
      hint: reportSyncState,
      icon: ShieldCheck,
      className: "border-violet-200 bg-violet-50 text-violet-700",
    },
    {
      label: "Comparison",
      value: comparisonDelta === null ? "New" : `${comparisonDelta >= 0 ? "+" : ""}${comparisonDelta}`,
      hint: latestPreviousReport ? "vs latest saved" : "No previous report",
      icon: TrendingUp,
      className: "border-slate-200 bg-white text-slate-700",
    },
  ];

  return (
    <section className="relative h-[calc(100vh-4rem)] overflow-hidden bg-[#f8fafc]">
        <div className="h-full overflow-y-auto">
          <div className="mx-auto w-full max-w-7xl space-y-5 px-4 py-6 sm:px-6 lg:px-8">
            <ReportMobileNav activeView={activeView} onSelect={setActiveView} />

            <motion.div
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              className="rounded-2xl border border-border bg-white p-5 shadow-line"
            >
              <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
                <div>
                  <p className="eyebrow">Generated result</p>
                  <h1 className="mt-2 text-3xl font-bold tracking-normal text-slate-950 sm:text-4xl">
                    {userData.name}
                  </h1>
                  <p className="mt-2 text-sm leading-6 text-muted-foreground">
                    {userData.program} - {userData.assessmentTrack}
                  </p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Button variant="secondary" onClick={handleDownloadReport} disabled={isDownloading}>
                    {isDownloading ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <FileDown className="h-4 w-4" />
                    )}
                    Export PDF
                  </Button>
                  <Button variant="outline" onClick={onRetake}>
                    <RefreshCw className="h-4 w-4" />
                    Retake
                  </Button>
                </div>
              </div>
            </motion.div>

            {activeView === "overview" && (
              <div className="space-y-5">
                <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                  {metricCards.map((item) => (
                    <Card key={item.label} className={`border ${item.className}`}>
                      <CardHeader>
                        <div className="flex items-center justify-between gap-3">
                          <div>
                            <p className="text-xs font-bold uppercase tracking-[0.16em] opacity-80">
                              {item.label}
                            </p>
                            <CardTitle className="mt-2 text-3xl">{item.value}</CardTitle>
                          </div>
                          <item.icon className="h-6 w-6" />
                        </div>
                        <CardDescription className="text-current opacity-75">
                          {item.hint}
                        </CardDescription>
                      </CardHeader>
                    </Card>
                  ))}
                </div>

                <div className="grid gap-5 xl:grid-cols-[0.92fr_1.08fr]">
                  <Card className="overflow-hidden rounded-2xl">
                    <CardHeader className="border-b border-blue-100 bg-blue-50 text-slate-950">
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <p className="text-xs font-bold uppercase tracking-[0.18em] text-brand">
                            Executive interpretation
                          </p>
                          <CardTitle className="mt-3 text-2xl">Candidate performance summary</CardTitle>
                        </div>
                        <BadgeCheck className="h-8 w-8 text-emerald-700" />
                      </div>
                      <CardDescription className="text-slate-600">
                        {analysis.summary}
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="grid gap-4 p-5 md:grid-cols-2">
                      <div className={`rounded-xl border p-4 ${band.border} ${band.bg}`}>
                        <p className={`text-sm font-bold ${band.tone}`}>{band.label}</p>
                        <p className="mt-2 text-5xl font-bold text-slate-950">{readinessScore}</p>
                        <Progress value={readinessScore} className="mt-4" />
                      </div>
                      <div className="rounded-xl border border-border bg-background p-4">
                        <p className="text-sm font-bold text-slate-950">Comparative signal</p>
                        <p className="mt-2 text-sm leading-6 text-muted-foreground">
                          {comparisonDelta === null
                            ? "No previous saved result yet. Sign in and complete another session to unlock trend comparison."
                            : `This session is ${Math.abs(comparisonDelta)} points ${
                                comparisonDelta >= 0 ? "above" : "below"
                              } the latest saved result.`}
                        </p>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="overflow-hidden rounded-2xl">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <BarChart3 className="h-5 w-5 text-brand" />
                        Behavioral trait architecture
                      </CardTitle>
                      <CardDescription>
                        These scores are coaching indicators for interview preparation.
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="grid gap-5 lg:grid-cols-[0.9fr_1.1fr]">
                      <div className="h-[320px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                          <RadarChart cx="50%" cy="50%" outerRadius="76%" data={analysis.ocean}>
                            <PolarGrid stroke="#d8dee8" />
                            <PolarAngleAxis dataKey="trait" tick={{ fill: "#44546a", fontSize: 12 }} />
                            <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                            <Radar
                              name="Score"
                              dataKey="A"
                              stroke="#4b70b1"
                              fill="#4b70b1"
                              fillOpacity={0.24}
                            />
                          </RadarChart>
                        </ResponsiveContainer>
                      </div>
                      <div className="space-y-4">
                        {analysis.ocean.map((trait) => (
                          <div key={trait.trait}>
                            <div className="mb-2 flex items-center justify-between text-sm">
                              <span className="font-semibold">{trait.trait}</span>
                              <span className="text-muted-foreground">{trait.A}/100</span>
                            </div>
                            <Progress value={trait.A} />
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </div>

                <div className="grid gap-5 lg:grid-cols-2">
                  <Card className="border-emerald-200 bg-emerald-50">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2 text-emerald-800">
                        <CheckCircle2 className="h-5 w-5" />
                        Strengths
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="grid gap-3">
                      {analysis.strengths.map((item) => (
                        <div key={item} className="rounded-md border border-emerald-200 bg-white p-3 text-sm font-semibold text-slate-800">
                          {item}
                        </div>
                      ))}
                    </CardContent>
                  </Card>

                  <Card className="border-amber-200 bg-amber-50">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2 text-amber-800">
                        <Target className="h-5 w-5" />
                        Development areas
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="grid gap-3">
                      {analysis.improvements.map((item) => (
                        <div key={item} className="rounded-md border border-amber-200 bg-white p-3 text-sm font-semibold text-slate-800">
                          {item}
                        </div>
                      ))}
                    </CardContent>
                  </Card>
                </div>

                {usingFallback && (
                  <div className="flex items-start gap-2 rounded-md border border-amber-300 bg-amber-50 p-3 text-sm text-amber-900">
                    <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
                    Backend analysis was unavailable, so demo data is shown.
                  </div>
                )}
              </div>
            )}

            {activeView === "reports" && (
              <div className="grid gap-5 xl:grid-cols-[0.75fr_1.25fr]">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <TrendingUp className="h-5 w-5 text-brand" />
                      Comparative results
                    </CardTitle>
                    <CardDescription>
                      Saved results power score movement and previous-session context.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="rounded-xl border border-border bg-background p-4">
                      <p className="text-sm font-bold text-foreground">Current readiness</p>
                      <p className="mt-2 text-4xl font-bold text-slate-950">{readinessScore}</p>
                    </div>
                    <div className="rounded-xl border border-border bg-background p-4">
                      <p className="text-sm font-bold text-foreground">Latest saved comparison</p>
                      <p className="mt-2 text-4xl font-bold text-slate-950">
                        {comparisonDelta === null
                          ? "NA"
                          : `${comparisonDelta >= 0 ? "+" : ""}${comparisonDelta}`}
                      </p>
                      <p className="mt-2 text-sm leading-6 text-muted-foreground">
                        {latestPreviousReport
                          ? `Compared with ${formatDate(latestPreviousReport.created_at)}`
                          : "No previous result saved yet."}
                      </p>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <FileText className="h-5 w-5 text-brand" />
                      Result history
                    </CardTitle>
                    <CardDescription>
                      Authenticated results are stored in the FastAPI profile layer.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="grid gap-3">
                    {!authUser && (
                      <div className="rounded-md border border-blue-200 bg-blue-50 p-4 text-sm leading-6 text-blue-900">
                        Sign in from the profile section to save this result and compare future attempts.
                      </div>
                    )}
                    {authUser && reports.length === 0 && (
                      <div className="rounded-md border border-border bg-background p-4 text-sm leading-6 text-muted-foreground">
                        No saved results yet. The current result will sync automatically after analysis.
                      </div>
                    )}
                    {reports.map((report) => (
                      <div
                        key={report.id}
                        className="grid gap-3 rounded-xl border border-border bg-background p-4 md:grid-cols-[1fr_auto]"
                      >
                        <div>
                          <div className="flex flex-wrap items-center gap-2">
                            <p className="font-bold text-slate-950">{report.candidateName}</p>
                            <span className="rounded-full bg-white px-2.5 py-1 text-xs font-bold text-muted-foreground shadow-line">
                              {report.assessmentTrack || "Assessment"}
                            </span>
                          </div>
                          <p className="mt-2 flex items-center gap-2 text-sm text-muted-foreground">
                            <CalendarDays className="h-4 w-4" />
                            {formatDate(report.created_at)}
                          </p>
                        </div>
                        <div className="text-left md:text-right">
                          <p className="text-3xl font-bold text-slate-950">{report.readinessScore}</p>
                          <p className="text-xs font-bold uppercase tracking-[0.14em] text-muted-foreground">
                            score
                          </p>
                        </div>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              </div>
            )}

            {activeView === "profile" && (
              <div className="grid gap-5 xl:grid-cols-[0.85fr_1.15fr]">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <UserRound className="h-5 w-5 text-brand" />
                      User profile
                    </CardTitle>
                    <CardDescription>
                      This layer lets PersonaLens track previous results for comparison.
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {authUser ? (
                      <div className="space-y-4">
                        <div className="rounded-xl border border-border bg-background p-4">
                          <p className="text-xs font-bold uppercase tracking-[0.16em] text-muted-foreground">
                            Signed in as
                          </p>
                          <p className="mt-2 text-xl font-bold text-slate-950">{authUser.name}</p>
                          <p className="mt-1 text-sm text-muted-foreground">{authUser.email}</p>
                        </div>
                        <Button variant="outline" onClick={onSignOut}>
                          <LogOut className="h-4 w-4" />
                          Sign out
                        </Button>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        <div className="rounded-xl border border-blue-200 bg-blue-50 p-4 text-sm leading-6 text-blue-900">
                          Sign in to save this result, compare future attempts, and keep your
                          placement-readiness history connected to your profile.
                        </div>
                        <div className="grid gap-3 sm:grid-cols-2">
                          <Button onClick={() => onAuth("signin")}>
                            <LogIn className="h-4 w-4" />
                            Sign in
                          </Button>
                          <Button variant="secondary" onClick={() => onAuth("signup")}>
                            <UserRound className="h-4 w-4" />
                            Create account
                          </Button>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>

                <div className="grid gap-5 md:grid-cols-3">
                  {[
                    {
                      icon: ShieldCheck,
                      title: "Auth layer",
                      text: "Bearer token session with password hashing in FastAPI.",
                    },
                    {
                      icon: History,
                      title: "Result history",
                      text: "Saved results are tied to the signed-in student profile.",
                    },
                    {
                      icon: TrendingUp,
                      title: "Comparison",
                      text: "Future attempts can compare readiness movement and evidence.",
                    },
                  ].map((item) => (
                    <Card key={item.title}>
                      <CardHeader>
                        <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-md bg-brand-soft text-brand">
                          <item.icon className="h-5 w-5" />
                        </div>
                        <CardTitle>{item.title}</CardTitle>
                        <CardDescription>{item.text}</CardDescription>
                      </CardHeader>
                    </Card>
                  ))}
                </div>
              </div>
            )}

            {activeView === "export" && (
              <div className="grid gap-5 xl:grid-cols-[1.1fr_0.9fr]">
                <Card className="overflow-hidden rounded-2xl">
                  <CardHeader className="border-b border-blue-100 bg-blue-50 text-slate-950">
                    <CardTitle className="flex items-center gap-2 text-2xl">
                      <BookOpenCheck className="h-6 w-6 text-emerald-700" />
                      Company-style assessment export
                    </CardTitle>
                    <CardDescription className="text-slate-600">
                      The PDF now reads like a formal candidate result with snapshot, competency
                      matrix, OCEAN indicators, evidence, and development roadmap.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="grid gap-4 p-5 md:grid-cols-2">
                    {[
                      "Candidate snapshot and assessment metadata",
                      "Overall readiness index and interpretation band",
                      "OCEAN behavioral indicator table",
                      "Strengths and development areas",
                      "Question-wise interview evidence",
                      "Recommended preparation roadmap",
                    ].map((item) => (
                      <div key={item} className="rounded-md border border-border bg-background p-3 text-sm font-semibold text-slate-800">
                        {item}
                      </div>
                    ))}
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Export actions</CardTitle>
                    <CardDescription>
                      Use this for mentor review, placement-cell records, and student progress files.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <Button size="lg" className="w-full" onClick={handleDownloadReport} disabled={isDownloading}>
                      {isDownloading ? (
                        <Loader2 className="h-5 w-5 animate-spin" />
                      ) : (
                        <FileDown className="h-5 w-5" />
                      )}
                      Download assessment PDF
                    </Button>
                    <Button size="lg" variant="secondary" className="w-full" onClick={() => setActiveView("reports")}>
                      <History className="h-5 w-5" />
                      View saved results
                    </Button>
                  </CardContent>
                </Card>
              </div>
            )}

            <div className="grid gap-4 pb-8 md:grid-cols-3">
              {analysis.suggestions.map((item, index) => (
                <Card key={item}>
                  <CardHeader>
                    <span className="text-sm font-semibold text-muted-foreground">
                      Action 0{index + 1}
                    </span>
                    <CardTitle className="text-base leading-6">{item}</CardTitle>
                  </CardHeader>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </section>
  );
};

export default Dashboard;
