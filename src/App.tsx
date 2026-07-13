import { useState, useEffect } from "react";
import { LandingPage } from "./components/LandingPage.jsx";
import { ResumeUpload } from "./components/ResumeUpload.jsx";
import { Dashboard } from "./components/Dashboard.jsx";
import { JobSetup } from "./components/JobSetup.jsx";
import { LiveInterview } from "./components/LiveInterview.jsx";
import { EvaluationDashboard } from "./components/EvaluationDashboard.jsx";
import { useInterview } from "./hooks/useInterview.js";
import { JobRole, InterviewSession } from "./types/index.js";
import { Sparkles, Brain, GraduationCap, Home, FolderKanban } from "lucide-react";

export default function App() {
  const [view, setView] = useState<"landing" | "hub" | "upload" | "configure" | "live-call" | "report">("landing");
  const [jobs, setJobs] = useState<JobRole[]>([]);
  const [interviews, setInterviews] = useState<InterviewSession[]>([]);
  const [selectedSession, setSelectedSession] = useState<InterviewSession | null>(null);
  const [uploadJobTarget, setUploadJobTarget] = useState<JobRole | null>(null);

  const {
    session,
    isAnalyzing,
    isLoading,
    error,
    duration,
    startSession,
    submitAnswer,
    triggerEvaluation,
    resetSession,
  } = useInterview();

  // Fetch campaign postings and evaluations on mount
  useEffect(() => {
    fetchJobs();
    fetchInterviews();
  }, []);

  // Sync hook session updates back to parent state
  useEffect(() => {
    if (session) {
      setSelectedSession(session);
      // If the hook session status changes to evaluated, update our registers & show report
      if (session.status === "evaluated") {
        fetchInterviews();
        setView("report");
      }
    }
  }, [session]);

  const fetchJobs = async () => {
    try {
      const response = await fetch("/api/jobs");
      if (response.ok) {
        const data = await response.json();
        setJobs(data);
      }
    } catch (err) {
      console.error("Error fetching jobs:", err);
    }
  };

  const fetchInterviews = async () => {
    try {
      const response = await fetch("/api/interviews");
      if (response.ok) {
        const data = await response.json();
        setInterviews(data);
      }
    } catch (err) {
      console.error("Error fetching interview sessions:", err);
    }
  };

  const handleStartInterview = async (jobId: string, name: string, email: string, summary: string, analysis?: any, plan?: any) => {
    await startSession(jobId, name, email, summary, analysis, plan);
    setView("live-call");
  };

  const handleJobCreated = (newJob: JobRole) => {
    setJobs((prev) => [...prev, newJob]);
    setView("hub");
  };

  const handleResumeInterview = (sessionToResume: InterviewSession) => {
    setSelectedSession(sessionToResume);
    // Explicitly seed the hook so it picks up where the user left off
    // Since our session was ongoing, let's start the live room
    setView("live-call");
  };

  const handleExitCall = () => {
    resetSession();
    fetchInterviews();
    setView("hub");
  };

  return (
    <div className="min-h-screen bg-slate-50/50 flex flex-col antialiased">
      {/* Top Brand Nav */}
      <header className="bg-white border-b border-slate-100 sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2.5 cursor-pointer" onClick={() => setView("landing")}>
            <div className="w-8 h-8 rounded-lg bg-slate-900 flex items-center justify-center text-white">
              <Brain className="w-4 h-4" />
            </div>
            <span className="font-bold text-sm tracking-tight text-slate-900">HireMind AI</span>
          </div>

          {/* SaaS Navbar Links */}
          <div className="flex items-center gap-4">
            <button
              onClick={() => setView("landing")}
              className={`text-xs font-semibold px-2 py-1 rounded transition flex items-center gap-1 ${
                view === "landing" ? "text-indigo-600 bg-indigo-50" : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <Home className="w-3.5 h-3.5" /> Home
            </button>
            <button
              onClick={() => setView("hub")}
              className={`text-xs font-semibold px-2 py-1 rounded transition flex items-center gap-1 ${
                view === "hub" ? "text-indigo-600 bg-indigo-50" : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <FolderKanban className="w-3.5 h-3.5" /> Campaigns Hub
            </button>
            <div className="h-4 w-[1px] bg-slate-200 hidden sm:block" />
            <div className="items-center gap-1 hidden sm:flex">
              <GraduationCap className="w-4 h-4 text-slate-400" />
              <span className="text-xs text-slate-400 font-mono">HR Evaluation Sandbox v1.0</span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Body Stage */}
      <main className="flex-1 p-4 md:p-6 max-w-6xl w-full mx-auto">
        {view === "landing" && (
          <LandingPage onEnterApp={() => setView("hub")} />
        )}

        {view === "hub" && (
          <Dashboard
            jobs={jobs}
            interviews={interviews}
            onConfigureJob={() => setView("configure")}
            onStartInterview={handleStartInterview}
            onViewEvaluation={(s) => {
              setSelectedSession(s);
              setView("report");
            }}
            onResumeInterview={handleResumeInterview}
            onStartUpload={(job) => {
              setUploadJobTarget(job);
              setView("upload");
            }}
          />
        )}

        {view === "upload" && (
          <ResumeUpload
            jobTitle={uploadJobTarget?.title || ""}
            onCandidateParsed={(name, email, summary, analysis, plan) => {
              if (uploadJobTarget) {
                handleStartInterview(uploadJobTarget.id, name, email, summary, analysis, plan);
              }
            }}
            onBack={() => setView("hub")}
          />
        )}

        {view === "configure" && (
          <JobSetup
            onBack={() => setView("hub")}
            onJobCreated={handleJobCreated}
          />
        )}

        {view === "live-call" && selectedSession && (
          <LiveInterview
            session={session || selectedSession}
            isAnalyzing={isAnalyzing}
            isLoading={isLoading}
            error={error}
            duration={duration}
            onSubmitAnswer={submitAnswer}
            onTriggerEvaluation={triggerEvaluation}
            onExit={handleExitCall}
          />
        )}

        {view === "report" && selectedSession && (
          <EvaluationDashboard
            session={selectedSession}
            onBack={() => {
              setSelectedSession(null);
              fetchInterviews();
              setView("hub");
            }}
          />
        )}
      </main>

      {/* Modern Humble Footer */}
      <footer className="bg-white border-t border-slate-100 py-6 mt-12">
        <div className="max-w-6xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-400">
          <p>© 2026 HireMind AI. Designed for adaptive corporate intelligence.</p>
          <div className="flex gap-4">
            <span>Clean Architecture</span>
            <span>Gemini Adaptive Engine</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
