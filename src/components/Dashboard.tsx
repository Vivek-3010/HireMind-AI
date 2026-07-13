import React, { useState } from "react";
import { Button } from "./ui/Button.jsx";
import { Card, CardHeader, CardContent } from "./ui/Card.jsx";
import { Badge } from "./ui/Badge.jsx";
import { JobRole, InterviewSession } from "../types/index.js";
import { Plus, Briefcase, UserPlus, Play, FileText, CheckCircle2, ChevronRight, Sparkles, HelpCircle } from "lucide-react";

interface DashboardProps {
  jobs: JobRole[];
  interviews: InterviewSession[];
  onConfigureJob: () => void;
  onStartInterview: (jobId: string, name: string, email: string, summary: string) => void;
  onViewEvaluation: (session: InterviewSession) => void;
  onResumeInterview: (session: InterviewSession) => void;
  onStartUpload: (job: JobRole) => void;
}

export const Dashboard: React.FC<DashboardProps> = ({
  jobs,
  interviews,
  onConfigureJob,
  onStartInterview,
  onViewEvaluation,
  onResumeInterview,
  onStartUpload,
}) => {
  const [isInviteOpen, setIsInviteOpen] = useState(false);
  const [selectedJobId, setSelectedJobId] = useState("");
  const [candidateName, setCandidateName] = useState("");
  const [candidateEmail, setCandidateEmail] = useState("");
  const [experienceSummary, setExperienceSummary] = useState("");

  const handleInviteSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedJobId || !candidateName || !candidateEmail) return;

    onStartInterview(selectedJobId, candidateName, candidateEmail, experienceSummary);
    setIsInviteOpen(false);
    
    // Clear Form
    setCandidateName("");
    setCandidateEmail("");
    setExperienceSummary("");
  };

  const openInviteModal = (jobId: string) => {
    setSelectedJobId(jobId);
    setIsInviteOpen(true);
  };

  return (
    <div className="space-y-8 max-w-6xl mx-auto relative">
      {/* Top Welcome Title & Pitch */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-slate-100 pb-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 flex items-center gap-2">
            HireMind AI <Sparkles className="w-5 h-5 text-indigo-500 fill-indigo-100" />
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Adaptive, competency-driven AI interviewer & structural candidate assessment pipeline.
          </p>
        </div>
        <div className="flex gap-2">
          <Button onClick={onConfigureJob} size="sm">
            <Plus className="w-4 h-4 mr-1.5" /> New Job Campaign
          </Button>
        </div>
      </div>

      {/* Grid Content */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Side: Active Job Positions */}
        <div className="lg:col-span-4 space-y-4">
          <div className="flex items-center justify-between px-1">
            <h2 className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
              <Briefcase className="w-3.5 h-3.5" /> Active Campaigns
            </h2>
            <span className="text-xs font-mono font-medium text-slate-400">{jobs.length} roles</span>
          </div>

          <div className="space-y-3">
            {jobs.map((job) => (
              <Card key={job.id} hoverable className="border-slate-100">
                <CardContent className="p-4 space-y-3">
                  <div>
                    <h3 className="text-sm font-semibold text-slate-800 leading-tight">{job.title}</h3>
                    <span className="text-[10px] text-slate-400">{job.department} • {job.experienceLevel}</span>
                  </div>
                  <p className="text-[11px] text-slate-500 line-clamp-2 leading-relaxed">
                    {job.description}
                  </p>
                  <div className="pt-2.5 border-t border-slate-50 flex flex-col gap-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[9px] text-slate-400 font-mono">
                        {job.competencies.length} Target Skills
                      </span>
                      <span className="text-[9px] font-semibold text-indigo-600 bg-indigo-50/50 px-1.5 py-0.5 rounded">
                        Adaptive Probing
                      </span>
                    </div>
                    <div className="flex gap-2">
                      <Button onClick={() => onStartUpload(job)} variant="custom" size="none" className="flex-1 text-xs py-2 px-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg inline-flex items-center justify-center font-medium transition-all duration-200">
                        <UserPlus className="w-3.5 h-3.5 mr-1" /> Upload Resume
                      </Button>
                      <Button onClick={() => openInviteModal(job.id)} size="sm" variant="outline" className="text-xs px-2.5 py-1.5 border-slate-200 hover:bg-slate-50">
                        Quick Start
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Right Side: Candidate Pipeline Statuses */}
        <div className="lg:col-span-8 space-y-4">
          <div className="flex items-center justify-between px-1">
            <h2 className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5" /> Live Assessment Pipeline
            </h2>
            <span className="text-xs font-mono font-medium text-slate-400">{interviews.length} sessions</span>
          </div>

          {interviews.length === 0 ? (
            <Card className="border-dashed border-slate-200">
              <CardContent className="p-8 text-center space-y-3">
                <div className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center mx-auto">
                  <Play className="w-4 h-4 text-slate-400" />
                </div>
                <div className="space-y-1">
                  <p className="text-xs font-semibold text-slate-700">No Interview Candidates Logged Yet</p>
                  <p className="text-[11px] text-slate-500 max-w-sm mx-auto">
                    Choose one of our active campaigns on the left and click "Start Interview" to launch a live adaptive interview trial.
                  </p>
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="border border-slate-100 rounded-xl divide-y divide-slate-100 overflow-hidden bg-white shadow-sm">
              {interviews.map((session) => (
                <div
                  key={session.id}
                  className="p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 hover:bg-slate-50/50 transition duration-200"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-sm text-slate-800">{session.candidate.name}</span>
                      <span className="text-[11px] text-slate-400 font-mono">({session.candidate.email})</span>
                    </div>
                    <div className="flex flex-wrap gap-2 items-center text-xs">
                      <span className="text-slate-500 font-medium">Applied for {session.jobTitle}</span>
                      <span className="text-slate-300">•</span>
                      <span className="text-slate-400 text-[10px] font-mono">
                        Started {new Date(session.startedAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 shrink-0 self-end sm:self-center">
                    {session.status === "ongoing" && (
                      <>
                        <Badge variant="info">Ongoing Call</Badge>
                        <Button onClick={() => onResumeInterview(session)} variant="primary" size="sm" className="px-3">
                          Resume <ChevronRight className="w-3.5 h-3.5 ml-1" />
                        </Button>
                      </>
                    )}

                    {session.status === "completed" && (
                      <>
                        <Badge variant="warning">Awaiting Assessment</Badge>
                        <Button onClick={() => onResumeInterview(session)} variant="outline" size="sm" className="px-3">
                          Review <ChevronRight className="w-3.5 h-3.5 ml-1" />
                        </Button>
                      </>
                    )}

                    {session.status === "evaluated" && (
                      <>
                        <div className="text-right hidden sm:block">
                          <span className="text-xs text-slate-400 uppercase tracking-widest block font-mono">SCORE</span>
                          <span className="font-bold text-sm text-indigo-600">{session.evaluation?.overallScore}%</span>
                        </div>
                        {session.evaluation?.recommendation === "STRONG_HIRE" || session.evaluation?.recommendation === "HIRE" ? (
                          <Badge variant="success">Recommended</Badge>
                        ) : (
                          <Badge variant="neutral">Assessed</Badge>
                        )}
                        <Button onClick={() => onViewEvaluation(session)} variant="outline" size="sm" className="px-3">
                          <FileText className="w-3.5 h-3.5 mr-1" /> View Scorecard
                        </Button>
                      </>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Candidate Invitation Overlay Modal */}
      {isInviteOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-md shadow-xl bg-white border border-slate-200">
            <CardHeader className="flex flex-row items-center justify-between pb-3">
              <div>
                <h3 className="text-sm font-bold text-slate-800">Initiate Interview Candidate</h3>
                <p className="text-[10px] text-slate-500">Configure simulated user info to start the adaptive call</p>
              </div>
              <button
                onClick={() => setIsInviteOpen(false)}
                className="text-slate-400 hover:text-slate-600 font-medium text-xs"
              >
                Close
              </button>
            </CardHeader>
            <form onSubmit={handleInviteSubmit}>
              <CardContent className="space-y-3.5 py-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-semibold text-slate-600 uppercase">Candidate Name</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Alexis Carter"
                    value={candidateName}
                    onChange={(e) => setCandidateName(e.target.value)}
                    className="w-full px-3 py-1.5 border border-slate-200 rounded-lg text-xs focus:outline-none focus:border-slate-800 bg-white"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-semibold text-slate-600 uppercase">Candidate Email</label>
                  <input
                    type="email"
                    required
                    placeholder="e.g. alexis@example.com"
                    value={candidateEmail}
                    onChange={(e) => setCandidateEmail(e.target.value)}
                    className="w-full px-3 py-1.5 border border-slate-200 rounded-lg text-xs focus:outline-none focus:border-slate-800 bg-white"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-semibold text-slate-600 uppercase">Background / Summary (Optional)</label>
                  <textarea
                    rows={2}
                    placeholder="Summarize candidate's resume/skills to help Gemini personalize the questions..."
                    value={experienceSummary}
                    onChange={(e) => setExperienceSummary(e.target.value)}
                    className="w-full px-3 py-1.5 border border-slate-200 rounded-lg text-xs focus:outline-none focus:border-slate-800 bg-white"
                  />
                </div>
              </CardContent>
              <div className="p-4 border-t border-slate-50 bg-slate-50/50 flex gap-2 justify-end rounded-b-xl">
                <Button type="button" variant="ghost" size="sm" onClick={() => setIsInviteOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" size="sm">
                  Start Live Session
                </Button>
              </div>
            </form>
          </Card>
        </div>
      )}
    </div>
  );
};
