import { FormEvent, useState } from "react";
import { motion } from "framer-motion";
import {
  ArrowRight,
  BrainCircuit,
  Building2,
  Camera,
  ClipboardCheck,
  DatabaseZap,
  FileText,
  GraduationCap,
  Layers3,
  LineChart,
  LockKeyhole,
  Network,
  PlayCircle,
  Server,
  ShieldCheck,
  Users2,
} from "lucide-react";
import {
  academicUseCases,
  capabilities,
  governance,
  pipeline,
} from "../data/landing";
import { TRACKS } from "../data/questions";
import type { CandidateProfile } from "../types/domain";
import { Button } from "./ui/button";
import { Card, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Progress } from "./ui/progress";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";

type LandingProps = {
  onStart: (data: CandidateProfile) => void;
};

const fadeUp = {
  hidden: { opacity: 0, y: 18 },
  visible: { opacity: 1, y: 0 },
};

const platformStats = [
  { value: "6", label: "guided interview prompts" },
  { value: "5", label: "OCEAN personality traits" },
  { value: "PDF", label: "mentor-ready export" },
];

const stackPillars = [
  {
    icon: Layers3,
    title: "Frontend workspace",
    body: "React, TypeScript, Framer Motion, Radix UI, Tailwind, Recharts, and local face-api models.",
  },
  {
    icon: Server,
    title: "FastAPI services",
    body: "Versioned analysis endpoints, typed schemas, settings, CORS boundaries, and Gemini/fallback analyzer.",
  },
  {
    icon: Network,
    title: "Pipeline ready",
    body: "The project is prepared for question generation, speech analysis, video scoring, and report merging.",
  },
];

const signalRows = [
  ["Transcript quality", 88],
  ["Visual affect sample", 76],
  ["Mentor actionability", 91],
];

const coreDashboard = [
  {
    icon: Camera,
    title: "Interview capture",
    metric: "Live",
    body: "Guided prompts, browser camera/mic permissions, speech transcript, and emotion timeline capture.",
  },
  {
    icon: BrainCircuit,
    title: "OCEAN report",
    metric: "5 traits",
    body: "Big Five personality scores, strengths, growth areas, and mentor-ready recommendations.",
  },
  {
    icon: FileText,
    title: "PDF export",
    metric: "1 click",
    body: "Downloadable assessment report for mentors, placement teams, and student improvement plans.",
  },
  {
    icon: Layers3,
    title: "Frontend module",
    metric: "React TS",
    body: "Vite, TypeScript, Tailwind, Radix UI, Framer Motion, Recharts, and local model assets.",
  },
  {
    icon: Server,
    title: "FastAPI services",
    metric: "API v1",
    body: "Typed schemas, health checks, analysis route, CORS config, Gemini provider, and fallback analyzer.",
  },
  {
    icon: Network,
    title: "Pipeline ready",
    metric: "Next phase",
    body: "Prepared for dynamic questions, speech analysis, video scoring, report merge, and storage layers.",
  },
];

const Landing = ({ onStart }: LandingProps) => {
  const [name, setName] = useState("");
  const [program, setProgram] = useState("");
  const [assessmentTrack, setAssessmentTrack] = useState<(typeof TRACKS)[number]>(
    TRACKS[0],
  );

  const focusAssessment = () => {
    document.getElementById("assessment")?.scrollIntoView({ behavior: "smooth", block: "center" });
    window.setTimeout(() => document.getElementById("candidate-name")?.focus(), 450);
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!name.trim()) {
      return;
    }

    onStart({
      name: name.trim(),
      program: program.trim() || "General academic cohort",
      assessmentTrack,
    });
  };

  return (
    <div className="relative">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-[680px] bg-[linear-gradient(180deg,#edf4ff_0%,rgba(248,250,252,0)_78%)]" />

      <section
        id="overview"
        className="container-shell relative z-10 grid gap-12 py-16 lg:grid-cols-[0.95fr_1.05fr] lg:py-24"
      >
        <motion.div
          initial="hidden"
          animate="visible"
          transition={{ staggerChildren: 0.08 }}
          className="max-w-3xl"
        >
          <motion.div
            variants={fadeUp}
            className="mb-8 inline-flex items-center gap-2 rounded-full border border-brand/20 bg-white px-3 py-2 shadow-line"
          >
            <ShieldCheck className="h-4 w-4 text-brand" />
            <span className="text-xs font-bold uppercase tracking-[0.18em] text-brand">
              Multimodal interview intelligence
            </span>
          </motion.div>

          <motion.h1
            variants={fadeUp}
            className="landing-display max-w-3xl text-[1.9rem] leading-[1.32] tracking-normal text-foreground sm:text-[2.45rem] lg:text-[2.65rem]"
          >
            Turn academic mock interviews into mentor-ready intelligence.
          </motion.h1>

          <motion.p
            variants={fadeUp}
            className="mt-8 max-w-2xl text-base leading-8 text-muted-foreground"
          >
            PersonaLens helps colleges assess placement readiness by combining guided
            interview answers, browser-side emotion signals, OCEAN personality analysis,
            and secure assessment services that can grow with the product.
          </motion.p>

          <motion.div variants={fadeUp} className="mt-10 flex flex-col gap-4 sm:flex-row">
            <Button size="lg" onClick={focusAssessment}>
              Start assessment
              <ArrowRight className="h-4 w-4" />
            </Button>
            <Button
              variant="secondary"
              size="lg"
              onClick={() =>
                document.getElementById("pipeline")?.scrollIntoView({ behavior: "smooth" })
              }
            >
              View architecture
              <PlayCircle className="h-4 w-4" />
            </Button>
          </motion.div>

          <motion.div variants={fadeUp} className="mt-12 grid max-w-2xl gap-4 sm:grid-cols-3">
            {platformStats.map((item) => (
              <div
                key={item.label}
                className="rounded-lg border border-border bg-white/85 p-4 shadow-line backdrop-blur"
              >
                <p className="text-2xl font-semibold text-foreground">{item.value}</p>
                <p className="mt-1 text-xs font-bold uppercase tracking-[0.14em] text-muted-foreground">
                  {item.label}
                </p>
              </div>
            ))}
          </motion.div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.12 }}
          className="relative"
        >
          <div className="rounded-[28px] border border-slate-200 bg-slate-950 p-3 shadow-[0_30px_80px_rgba(15,23,42,0.22)]">
            <div className="rounded-[20px] border border-white/10 bg-[#f8fafc] p-4">
              <div className="mb-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div>
                    <img
                      src="/logo_wordmark.png"
                      alt="PersonaLens"
                      className="h-10 w-auto max-w-[230px] object-contain"
                    />
                    <p className="text-xs font-medium text-slate-500">Academic readiness suite</p>
                  </div>
                </div>
                <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-700">
                  Live API
                </span>
              </div>

              <div className="grid gap-4 lg:grid-cols-[0.95fr_1.05fr]">
                <div className="space-y-4">
                  <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-line">
                    <div className="mb-4 flex items-center justify-between">
                      <p className="text-sm font-bold text-slate-950">Readiness score</p>
                      <LineChart className="h-4 w-4 text-brand" />
                    </div>
                    <div className="flex items-end gap-3">
                      <span className="text-5xl font-semibold tracking-normal text-slate-950">
                        84
                      </span>
                      <span className="pb-2 text-sm font-semibold text-emerald-700">
                        mentor ready
                      </span>
                    </div>
                    <Progress value={84} className="mt-5" />
                  </div>

                  <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-line">
                    <p className="mb-4 text-sm font-bold text-slate-950">Signal layers</p>
                    <div className="space-y-3">
                      {signalRows.map(([label, value]) => (
                        <div key={label}>
                          <div className="mb-1.5 flex items-center justify-between text-xs font-semibold text-slate-500">
                            <span>{label}</span>
                            <span>{value}%</span>
                          </div>
                          <Progress value={Number(value)} className="h-1.5" />
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div id="assessment" className="rounded-2xl border border-slate-200 bg-white p-4 shadow-line">
                  <div className="mb-5 flex items-start justify-between gap-4">
                    <div>
                      <p className="text-sm font-bold text-slate-950">Launch candidate session</p>
                      <p className="mt-1 text-xs leading-5 text-slate-500">
                        Create a guided interview and generate an OCEAN report.
                      </p>
                    </div>
                    <Users2 className="h-5 w-5 text-brand" />
                  </div>

                  <form onSubmit={handleSubmit} className="space-y-3">
                    <div>
                      <label htmlFor="candidate-name" className="mb-1.5 block text-xs font-bold text-slate-700">
                        Candidate name
                      </label>
                      <input
                        id="candidate-name"
                        className="field bg-white"
                        value={name}
                        onChange={(event) => setName(event.target.value)}
                        placeholder="Enter full name"
                        autoComplete="name"
                        required
                      />
                    </div>

                    <div>
                      <label htmlFor="program" className="mb-1.5 block text-xs font-bold text-slate-700">
                        Program or department
                      </label>
                      <input
                        id="program"
                        className="field bg-white"
                        value={program}
                        onChange={(event) => setProgram(event.target.value)}
                        placeholder="B.Tech CSE, MBA, Psychology"
                      />
                    </div>

                    <div>
                      <label htmlFor="track" className="mb-1.5 block text-xs font-bold text-slate-700">
                        Assessment track
                      </label>
                      <Select
                        value={assessmentTrack}
                        onValueChange={(value) =>
                          setAssessmentTrack(value as (typeof TRACKS)[number])
                        }
                      >
                        <SelectTrigger id="track" className="bg-white">
                          <SelectValue placeholder="Choose assessment track" />
                        </SelectTrigger>
                        <SelectContent>
                          {TRACKS.map((track) => (
                            <SelectItem key={track} value={track}>
                              {track}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <Button type="submit" size="lg" className="w-full">
                      Begin live assessment
                      <ArrowRight className="h-4 w-4" />
                    </Button>
                  </form>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </section>

      <section className="border-y border-border bg-white">
        <div className="container-shell grid gap-4 py-6 md:grid-cols-3">
          {[
            ["Student view", "Structured interview practice before placements and viva-style evaluations."],
            ["Mentor view", "A consistent personality and communication report for review sessions."],
            ["College view", "A scalable base for speech, video, and report pipelines."],
          ].map(([title, body]) => (
            <div key={title} className="flex items-start gap-3 py-3">
              <ClipboardCheck className="mt-1 h-5 w-5 text-brand" />
              <div>
                <p className="font-semibold">{title}</p>
                <p className="mt-1 text-sm leading-6 text-muted-foreground">{body}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section id="core-dashboard" className="section-y container-shell">
        <div className="mb-10 grid gap-6 lg:grid-cols-[0.8fr_1.2fr]">
          <div>
            <p className="eyebrow">Core features dashboard</p>
            <h2 className="landing-display mt-3 text-xl tracking-normal sm:text-2xl">
              The PersonaLens modules your project is built around.
            </h2>
          </div>
          <p className="text-base leading-7 text-muted-foreground">
            This dashboard section maps the actual product pieces: interview capture,
            OCEAN personality reporting, PDF export, student practice, mentor review,
            and progress tracking.
          </p>
        </div>

        <div className="rounded-[28px] border border-border bg-slate-950 p-3 shadow-[0_26px_70px_rgba(15,23,42,0.18)]">
          <div className="rounded-[20px] bg-[#f8fafc] p-4 sm:p-5">
            <div className="mb-5 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-3">
                <img src="/logo.png" alt="" className="h-11 w-11 object-contain" />
                <div>
                  <p className="text-sm font-bold text-slate-950">PersonaLens platform dashboard</p>
                  <p className="text-xs font-medium text-slate-500">
                    Core assessment, reporting, and architecture modules
                  </p>
                </div>
              </div>
              <Button size="sm" onClick={focusAssessment}>
                Launch session
                <ArrowRight className="h-4 w-4" />
              </Button>
            </div>

            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {coreDashboard.map((item) => (
                <div
                  key={item.title}
                  className="rounded-2xl border border-slate-200 bg-white p-5 shadow-line transition-all hover:-translate-y-0.5 hover:shadow-soft"
                >
                  <div className="mb-5 flex items-start justify-between gap-4">
                    <div className="flex h-11 w-11 items-center justify-center rounded-md bg-brand-soft text-brand">
                      <item.icon className="h-5 w-5" />
                    </div>
                    <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-bold uppercase tracking-[0.12em] text-slate-600">
                      {item.metric}
                    </span>
                  </div>
                  <h3 className="text-base font-bold text-slate-950">{item.title}</h3>
                  <p className="mt-3 text-sm leading-6 text-slate-500">{item.body}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="section-y container-shell">
        <div className="mb-10 grid gap-6 lg:grid-cols-[0.75fr_1fr]">
          <div>
            <p className="eyebrow">Product capability</p>
            <h2 className="landing-display mt-3 text-xl tracking-normal sm:text-2xl">
              A SaaS-style assessment layer for academic career development.
            </h2>
          </div>
          <p className="text-base leading-7 text-muted-foreground">
            PersonaLens is not just a mock interview screen. It is a productized
            workflow that collects candidate context, captures interview turns,
            tracks emotion timelines, analyzes personality traits, and produces a
            report that mentors can actually use.
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {capabilities.map((item) => (
            <Card key={item.title} className="h-full shadow-line transition-shadow hover:shadow-soft">
              <CardHeader>
                <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-md bg-brand-soft text-brand">
                  <item.icon className="h-5 w-5" />
                </div>
                <CardTitle>{item.title}</CardTitle>
                <CardDescription>{item.body}</CardDescription>
              </CardHeader>
            </Card>
          ))}
        </div>
      </section>

      <section id="pipeline" className="section-y border-y border-border bg-white">
        <div className="container-shell">
          <div className="mb-10 flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-2xl">
              <p className="eyebrow">System architecture</p>
              <h2 className="landing-display mt-3 text-xl tracking-normal sm:text-2xl">
                Modular assessment services for your product roadmap.
              </h2>
            </div>
            <div className="flex items-center gap-2 rounded-full border border-border bg-background px-4 py-2 text-sm font-bold text-muted-foreground">
              <DatabaseZap className="h-4 w-4 text-brand" />
              API-first assessment contract
            </div>
          </div>

          <div className="grid gap-4 lg:grid-cols-4">
            {pipeline.map((stage, index) => (
              <div
                key={stage.label}
                className="rounded-2xl border border-border bg-background p-5 shadow-line"
              >
                <div className="mb-5 flex items-center justify-between">
                  <div className="flex h-11 w-11 items-center justify-center rounded-md bg-brand-soft text-brand">
                    <stage.icon className="h-5 w-5" />
                  </div>
                  <span className="text-sm font-bold text-muted-foreground">
                    0{index + 1}
                  </span>
                </div>
                <h3 className="font-semibold">{stage.label}</h3>
                <p className="mt-3 text-sm leading-6 text-muted-foreground">{stage.detail}</p>
              </div>
            ))}
          </div>

          <div className="mt-6 grid gap-4 lg:grid-cols-3">
            {stackPillars.map((item) => (
              <div key={item.title} className="rounded-2xl border border-border bg-surface p-5 shadow-line">
                <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-md bg-accent-soft text-accent">
                  <item.icon className="h-5 w-5" />
                </div>
                <h3 className="font-semibold">{item.title}</h3>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">{item.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="section-y container-shell">
        <div className="grid gap-8 lg:grid-cols-[0.75fr_1.25fr]">
          <div>
            <p className="eyebrow">Campus workflows</p>
            <h2 className="landing-display mt-3 text-xl tracking-normal sm:text-2xl">
              Built around placement cells, mentors, and student readiness labs.
            </h2>
            <p className="mt-4 text-base leading-7 text-muted-foreground">
              The product content now reflects what PersonaLens does: mock interview
              capture, personality reasoning, report delivery, and future institutional
              integration across LMS, ERP, and placement systems.
            </p>
          </div>

          <Tabs defaultValue="assessment" className="w-full">
            <TabsList className="grid h-auto w-full grid-cols-1 sm:grid-cols-3">
              <TabsTrigger value="assessment">Assessment</TabsTrigger>
              <TabsTrigger value="reporting">Reporting</TabsTrigger>
              <TabsTrigger value="integration">Integration</TabsTrigger>
            </TabsList>
            <TabsContent value="assessment">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BrainCircuit className="h-5 w-5 text-brand" />
                    Guided multimodal assessment
                  </CardTitle>
                  <CardDescription>
                    Candidate profile, interview prompts, browser transcript capture,
                    expression timeline, and structured interview turns in one workflow.
                  </CardDescription>
                </CardHeader>
              </Card>
            </TabsContent>
            <TabsContent value="reporting">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="h-5 w-5 text-brand" />
                    Mentor-ready personality report
                  </CardTitle>
                  <CardDescription>
                    OCEAN trait scores, strengths, improvement areas, recommended actions,
                    interview evidence, and PDF export for advisory meetings.
                  </CardDescription>
                </CardHeader>
              </Card>
            </TabsContent>
            <TabsContent value="integration">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <LockKeyhole className="h-5 w-5 text-brand" />
                    Enterprise academic rollout
                  </CardTitle>
                  <CardDescription>
                    Separated app and service modules create clean boundaries for consent,
                    storage, audit trails, cohort dashboards, and AI services.
                  </CardDescription>
                </CardHeader>
              </Card>
            </TabsContent>
          </Tabs>
        </div>

        <div className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {academicUseCases.map((item) => (
            <div
              key={item}
              className="flex items-center gap-3 rounded-xl border border-border bg-white px-4 py-3 shadow-line"
            >
              <GraduationCap className="h-4 w-4 text-accent" />
              <span className="text-sm font-semibold">{item}</span>
            </div>
          ))}
        </div>
      </section>

      <section id="governance" className="section-y border-t border-border bg-white">
        <div className="container-shell">
          <div className="mb-10 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div className="max-w-3xl">
              <p className="eyebrow">Enterprise posture</p>
              <h2 className="landing-display mt-3 text-xl tracking-normal sm:text-2xl">
                Professional enough for college deployment, flexible enough for your roadmap.
              </h2>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            {governance.map((item) => (
              <Card key={item.title} className="shadow-line">
                <CardHeader>
                  <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-md bg-accent-soft text-accent">
                    <item.icon className="h-5 w-5" />
                  </div>
                  <CardTitle>{item.title}</CardTitle>
                  <CardDescription>{item.body}</CardDescription>
                </CardHeader>
              </Card>
            ))}
          </div>

          <div className="mt-8 rounded-2xl border border-border bg-slate-950 p-6 text-white shadow-soft">
            <div className="grid gap-6 lg:grid-cols-[1fr_auto] lg:items-center">
              <div className="flex items-start gap-3">
                <Building2 className="mt-1 h-5 w-5 text-blue-200" />
                <div>
                  <p className="font-semibold">Ready for the next implementation phase</p>
                  <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-300">
                    The frontend now presents PersonaLens as a real SaaS platform,
                    while the services are organized for dynamic questions, speech analysis,
                    video scoring, report merging, persistence, and campus integrations.
                  </p>
                </div>
              </div>
              <Button
                variant="secondary"
                onClick={focusAssessment}
              >
                Create session
                <ArrowRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Landing;
