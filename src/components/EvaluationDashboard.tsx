import React from "react";
import { Button } from "./ui/Button.jsx";
import { Card, CardHeader, CardContent } from "./ui/Card.jsx";
import { Badge } from "./ui/Badge.jsx";
import { InterviewSession, SkillScore } from "../types/index.js";
import { ArrowLeft, CheckCircle2, AlertCircle, FileText, TrendingUp, Award, AwardIcon, Sparkles, Compass, Lightbulb, Check, Activity, BarChart3 } from "lucide-react";

interface EvaluationDashboardProps {
  session: InterviewSession;
  onBack: () => void;
}

export const EvaluationDashboard: React.FC<EvaluationDashboardProps> = ({ session, onBack }) => {
  const evalData = session.evaluation;

  if (!evalData) {
    return (
      <div className="text-center py-12 space-y-3">
        <AlertCircle className="w-8 h-8 text-amber-500 mx-auto" />
        <h3 className="font-semibold text-slate-800">No Assessment Record Found</h3>
        <p className="text-xs text-slate-500">Wait for the candidate to conclude and hit Generate Scorecard.</p>
        <Button onClick={onBack}>Return to Hub</Button>
      </div>
    );
  }

  const getRecommendationBadge = (rec: string) => {
    switch (rec) {
      case "STRONG_HIRE":
        return <Badge variant="success">Strong Hire</Badge>;
      case "HIRE":
        return <Badge variant="success">Hire</Badge>;
      case "MAYBE":
        return <Badge variant="warning">Maybe / Hold</Badge>;
      case "REJECT":
        return <Badge variant="danger">Do Not Proceed</Badge>;
      default:
        return <Badge variant="neutral">{rec}</Badge>;
    }
  };

  const ScoreBar: React.FC<{ item: SkillScore }> = ({ item }) => (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold text-slate-700">{item.skill}</span>
        <span className="text-xs font-mono font-bold text-slate-800">{item.score}/10</span>
      </div>
      <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-500 ${
            item.score >= 8
              ? "bg-emerald-500"
              : item.score >= 6
              ? "bg-indigo-500"
              : item.score >= 4
              ? "bg-amber-500"
              : "bg-rose-500"
          }`}
          style={{ width: `${item.score * 10}%` }}
        />
      </div>
      <p className="text-[11px] text-slate-500 italic leading-snug">
        <strong className="text-slate-600 font-medium">Evidence:</strong> "{item.evidence}"
      </p>
    </div>
  );

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Navigation Header */}
      <div className="flex items-center justify-between pb-4 border-b border-slate-100">
        <div className="flex items-center gap-3">
          <button onClick={onBack} className="p-2 hover:bg-slate-100 rounded-lg transition text-slate-500">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">AI Assessment Report Card</h1>
            <p className="text-xs text-slate-500">Generated automatically by HireMind AI</p>
          </div>
        </div>
        <Button variant="outline" size="sm" onClick={() => window.print()} className="hidden sm:inline-flex">
          Print Assessment
        </Button>
      </div>

      {/* Hero Overview Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Overall Fit Card */}
        <Card className="bg-slate-900 border-slate-900 text-white md:col-span-2">
          <CardContent className="p-6 flex items-center justify-between h-full">
            <div className="space-y-2">
              <span className="text-[10px] font-semibold uppercase tracking-widest text-slate-400">Executive Fit Verdict</span>
              <div className="flex items-baseline gap-2.5">
                <h2 className="text-2xl font-bold tracking-tight">{evalData.candidateName}</h2>
                <span className="text-xs text-slate-400">for {evalData.jobTitle}</span>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed max-w-lg">{evalData.summary}</p>
            </div>
            <div className="text-center bg-white/5 border border-white/10 px-5 py-4 rounded-2xl shrink-0 min-w-[120px]">
              <span className="text-[10px] font-mono tracking-wider text-slate-400 block mb-1">SCORE</span>
              <span className="text-3xl font-extrabold text-white tracking-tighter">{evalData.overallScore}%</span>
              <div className="mt-2">{getRecommendationBadge(evalData.recommendation)}</div>
            </div>
          </CardContent>
        </Card>

        {/* Core Competencies Averages */}
        <Card>
          <CardContent className="p-6 flex flex-col justify-between h-full space-y-4">
            <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest">Averages Matrix</span>
            <div className="space-y-3">
              <div className="flex justify-between items-center pb-2 border-b border-slate-100">
                <span className="text-xs text-slate-600">Communication Skills</span>
                <span className="text-sm font-bold text-slate-800">{evalData.communicationScore}/10</span>
              </div>
              <div className="flex justify-between items-center pb-2 border-b border-slate-100">
                <span className="text-xs text-slate-600">Critical Reasoning</span>
                <span className="text-sm font-bold text-slate-800">{evalData.criticalThinkingScore}/10</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-xs text-slate-600">Total Transcripts Duration</span>
                <span className="text-xs font-mono text-slate-500 font-medium">Completed</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Autonomous Hiring Recommendation Agent Report */}
      {session.hiringRecommendation && (
        <Card className="border-indigo-100 bg-gradient-to-br from-indigo-50/5 via-white to-purple-50/5 shadow-sm">
          <CardHeader className="p-5 border-b border-indigo-50 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-indigo-50/10">
            <div className="flex items-center gap-2">
              <Award className="w-5 h-5 text-indigo-600 animate-pulse" />
              <div>
                <h3 className="text-sm font-semibold text-slate-900">Autonomous Hiring Recommendation Agent</h3>
                <p className="text-[10px] text-slate-500">Synthesized from entire interview loop, resumes, and real-time answer evaluations</p>
              </div>
            </div>
            <Badge className={`${
              session.hiringRecommendation.hiringDecision === "Strong Hire" ? "bg-emerald-600 text-white hover:bg-emerald-700" :
              session.hiringRecommendation.hiringDecision === "Hire" ? "bg-indigo-600 text-white hover:bg-indigo-700" :
              session.hiringRecommendation.hiringDecision === "Borderline" ? "bg-amber-500 text-white hover:bg-amber-600" :
              "bg-rose-600 text-white hover:bg-rose-700"
            } text-xs font-bold uppercase tracking-wider py-1 px-3 rounded-full shadow-sm shrink-0`}>
              Verdict: {session.hiringRecommendation.hiringDecision}
            </Badge>
          </CardHeader>
          <CardContent className="p-6 space-y-6">
            {/* Multi-Score Matrix */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="bg-slate-50/60 p-3.5 rounded-xl border border-slate-100 space-y-2">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tight block">Overall Fit Score</span>
                <div className="flex items-baseline gap-1">
                  <span className="text-2xl font-extrabold text-indigo-600 font-mono">{session.hiringRecommendation.overallScore}%</span>
                  <span className="text-slate-400 text-xs">/100</span>
                </div>
                <div className="h-1 w-full bg-slate-100 rounded-full overflow-hidden">
                  <div className="h-full bg-indigo-600" style={{ width: `${session.hiringRecommendation.overallScore}%` }} />
                </div>
              </div>

              <div className="bg-slate-50/60 p-3.5 rounded-xl border border-slate-100 space-y-2">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tight block">Technical Score</span>
                <div className="flex items-baseline gap-1">
                  <span className="text-2xl font-extrabold text-emerald-600 font-mono">{session.hiringRecommendation.technicalScore}%</span>
                  <span className="text-slate-400 text-xs">/100</span>
                </div>
                <div className="h-1 w-full bg-slate-100 rounded-full overflow-hidden">
                  <div className="h-full bg-emerald-600" style={{ width: `${session.hiringRecommendation.technicalScore}%` }} />
                </div>
              </div>

              <div className="bg-slate-50/60 p-3.5 rounded-xl border border-slate-100 space-y-2">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tight block">Communication</span>
                <div className="flex items-baseline gap-1">
                  <span className="text-2xl font-extrabold text-blue-600 font-mono">{session.hiringRecommendation.communicationScore}%</span>
                  <span className="text-slate-400 text-xs">/100</span>
                </div>
                <div className="h-1 w-full bg-slate-100 rounded-full overflow-hidden">
                  <div className="h-full bg-blue-600" style={{ width: `${session.hiringRecommendation.communicationScore}%` }} />
                </div>
              </div>

              <div className="bg-slate-50/60 p-3.5 rounded-xl border border-slate-100 space-y-2">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tight block">Problem Solving</span>
                <div className="flex items-baseline gap-1">
                  <span className="text-2xl font-extrabold text-purple-600 font-mono">{session.hiringRecommendation.problemSolvingScore}%</span>
                  <span className="text-slate-400 text-xs">/100</span>
                </div>
                <div className="h-1 w-full bg-slate-100 rounded-full overflow-hidden">
                  <div className="h-full bg-purple-600" style={{ width: `${session.hiringRecommendation.problemSolvingScore}%` }} />
                </div>
              </div>
            </div>

            {/* Explanatory reasoning */}
            <div className="bg-indigo-50/10 border border-indigo-50/40 p-4 rounded-xl space-y-1.5">
              <span className="text-[10px] font-bold text-indigo-700 uppercase tracking-wider block">Decision Reasoning Explanation</span>
              <p className="text-xs text-slate-700 leading-relaxed font-medium">
                {session.hiringRecommendation.reasoning}
              </p>
            </div>

            {/* Tri-column feedback structure */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5 pt-2">
              {/* Strengths */}
              <div className="space-y-2">
                <div className="flex items-center gap-1.5 border-b border-emerald-100/60 pb-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span className="text-[10px] font-bold text-emerald-800 uppercase tracking-wider">Demonstrated Strengths</span>
                </div>
                <ul className="space-y-1.5">
                  {session.hiringRecommendation.strengths.map((str, sIdx) => (
                    <li key={sIdx} className="text-xs text-slate-600 flex items-start gap-1.5 leading-snug">
                      <span className="text-emerald-500 font-bold select-none mt-0.5">•</span>
                      <span>{str}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Weaknesses */}
              <div className="space-y-2">
                <div className="flex items-center gap-1.5 border-b border-rose-100 pb-1.5">
                  <AlertCircle className="w-4 h-4 text-rose-600" />
                  <span className="text-[10px] font-bold text-rose-800 uppercase tracking-wider">Identified Gaps / Weaknesses</span>
                </div>
                <ul className="space-y-1.5">
                  {session.hiringRecommendation.weaknesses.map((weak, wIdx) => (
                    <li key={wIdx} className="text-xs text-slate-600 flex items-start gap-1.5 leading-snug">
                      <span className="text-rose-500 font-bold select-none mt-0.5">•</span>
                      <span>{weak}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Recommended Learning */}
              <div className="space-y-2">
                <div className="flex items-center gap-1.5 border-b border-indigo-100 pb-1.5">
                  <Compass className="w-4 h-4 text-indigo-600" />
                  <span className="text-[10px] font-bold text-indigo-800 uppercase tracking-wider">Recommended Upskilling</span>
                </div>
                <ul className="space-y-1.5">
                  {session.hiringRecommendation.recommendedLearning.map((learn, lIdx) => (
                    <li key={lIdx} className="text-xs text-slate-600 flex items-start gap-1.5 leading-snug">
                      <span className="text-indigo-500 font-bold select-none mt-0.5">•</span>
                      <span>{learn}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Agent Orchestrator Audit & Execution logs */}
      {session.orchestratorLogs && session.orchestratorLogs.length > 0 && (
        <Card className="border-slate-200 bg-slate-50/20 shadow-sm">
          <CardHeader className="p-4 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-50/50">
            <div className="flex items-center gap-2">
              <Activity className="w-4 h-4 text-indigo-600 animate-pulse" />
              <div>
                <h3 className="text-sm font-semibold text-slate-900">Agent Orchestrator Pipeline Audit Log</h3>
                <p className="text-[10px] text-slate-500">Autonomous sequence verification with single-retry fault tolerance policy</p>
              </div>
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              <Badge variant="outline" className="text-[10px] font-mono text-indigo-600 bg-indigo-50/50 border-indigo-200/50">
                Total Steps: {session.orchestratorLogs.length}
              </Badge>
              <Badge className="bg-emerald-100 text-emerald-800 hover:bg-emerald-100 text-[10px] font-mono uppercase">
                Active Watchdog: Enabled
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="p-4 space-y-4">
            {/* Quick Stats overview */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center">
              <div className="bg-white p-2.5 rounded-xl border border-slate-100">
                <span className="text-[9px] font-bold text-slate-400 block uppercase">Avg Step Duration</span>
                <span className="text-sm font-bold text-slate-800">
                  {Math.round(session.orchestratorLogs.reduce((acc, log) => acc + log.executionTimeMs, 0) / session.orchestratorLogs.length)} ms
                </span>
              </div>
              <div className="bg-white p-2.5 rounded-xl border border-slate-100">
                <span className="text-[9px] font-bold text-slate-400 block uppercase">Total Pipeline Time</span>
                <span className="text-sm font-bold text-indigo-600">
                  {(session.orchestratorLogs.reduce((acc, log) => acc + log.executionTimeMs, 0) / 1000).toFixed(2)}s
                </span>
              </div>
              <div className="bg-white p-2.5 rounded-xl border border-slate-100">
                <span className="text-[9px] font-bold text-slate-400 block uppercase">Retries Triggered</span>
                <span className="text-sm font-bold text-amber-600">
                  {session.orchestratorLogs.filter(l => l.retryAttempted).length}
                </span>
              </div>
              <div className="bg-white p-2.5 rounded-xl border border-slate-100">
                <span className="text-[9px] font-bold text-slate-400 block uppercase">Pipeline Integrity</span>
                <span className="text-sm font-bold text-emerald-600">
                  {session.orchestratorLogs.every(l => l.status !== "retried_failed") ? "100% Perfect" : "Degraded"}
                </span>
              </div>
            </div>

            {/* Step execution chronological stream */}
            <div className="space-y-2 max-h-[300px] overflow-y-auto pr-1">
              {session.orchestratorLogs.map((log, lIdx) => (
                <div key={lIdx} className="bg-white p-3 rounded-xl border border-slate-100 flex items-start sm:items-center justify-between gap-3 text-xs shadow-[0_1px_2px_rgba(0,0,0,0.02)]">
                  <div className="flex items-center gap-3">
                    {/* Status indicator badge */}
                    {log.status === "success" && (
                      <span className="w-2 h-2 rounded-full bg-emerald-500 block shrink-0 ring-4 ring-emerald-50" />
                    )}
                    {log.status === "retried_success" && (
                      <span className="w-2 h-2 rounded-full bg-amber-500 block shrink-0 ring-4 ring-amber-50 animate-bounce" />
                    )}
                    {(log.status === "failed" || log.status === "retried_failed") && (
                      <span className="w-2 h-2 rounded-full bg-rose-500 block shrink-0 ring-4 ring-rose-50 animate-pulse" />
                    )}

                    <div className="space-y-0.5">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="font-bold text-slate-800">{log.agentName}</span>
                        <span className="text-[10px] text-slate-400 font-mono">[{log.step}]</span>
                      </div>
                      <div className="flex items-center gap-2 text-[10px] text-slate-400 font-mono">
                        <span>{new Date(log.timestamp).toLocaleTimeString()}</span>
                        <span>•</span>
                        <span>Timing: <strong>{log.executionTimeMs}ms</strong></span>
                        {log.retryAttempted && (
                          <>
                            <span>•</span>
                            <span className="text-amber-600 font-semibold uppercase tracking-tight">Recovered via Retry</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="shrink-0">
                    {log.status === "success" && (
                      <Badge className="bg-emerald-50 text-emerald-700 border border-emerald-100 hover:bg-emerald-50 uppercase text-[9px] font-mono">
                        SUCCESS
                      </Badge>
                    )}
                    {log.status === "retried_success" && (
                      <Badge className="bg-amber-50 text-amber-700 border border-amber-100 hover:bg-amber-50 uppercase text-[9px] font-mono">
                        RETRIED OK
                      </Badge>
                    )}
                    {log.status === "retried_failed" && (
                      <Badge className="bg-rose-50 text-rose-700 border border-rose-100 hover:bg-rose-50 uppercase text-[9px] font-mono">
                        FAIL ON RETRY
                      </Badge>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Strengths and Growth Areas (Bento Block) */}
      <div className={`grid grid-cols-1 ${session.memory && session.memory.length > 0 ? 'md:grid-cols-3' : 'md:grid-cols-2'} gap-4`}>
        {/* Key Strengths */}
        <Card className="border-emerald-100/60 bg-emerald-50/10">
          <CardHeader className="flex items-center gap-2 border-emerald-50/20 bg-emerald-50/10">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <h3 className="text-xs font-semibold uppercase tracking-wider text-emerald-800">Key Strengths Detected</h3>
          </CardHeader>
          <CardContent className="p-4">
            <ul className="space-y-2">
              {evalData.keyStrengths.map((str, idx) => (
                <li key={idx} className="text-xs text-slate-700 flex items-start gap-2 leading-relaxed">
                  <span className="text-emerald-500 select-none mt-0.5">•</span>
                  <span>{str}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>

        {/* Growth areas */}
        <Card className="border-amber-100/60 bg-amber-50/10">
          <CardHeader className="flex items-center gap-2 border-amber-50/20 bg-amber-50/10">
            <TrendingUp className="w-4 h-4 text-amber-600" />
            <h3 className="text-xs font-semibold uppercase tracking-wider text-amber-800">Growth / Probe Vectors</h3>
          </CardHeader>
          <CardContent className="p-4">
            <ul className="space-y-2">
              {evalData.growthAreas.map((area, idx) => (
                <li key={idx} className="text-xs text-slate-700 flex items-start gap-2 leading-relaxed">
                  <span className="text-amber-500 select-none mt-0.5">•</span>
                  <span>{area}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>

        {/* Candidate Claims & Facts (Memory Agent) */}
        {session.memory && session.memory.length > 0 && (
          <Card className="border-indigo-100 bg-indigo-50/10">
            <CardHeader className="flex items-center gap-2 border-indigo-50/20 bg-indigo-50/10">
              <Compass className="w-4 h-4 text-indigo-600 animate-pulse" />
              <h3 className="text-xs font-semibold uppercase tracking-wider text-indigo-800 font-bold">Memory Agent Knowledge Base</h3>
            </CardHeader>
            <CardContent className="p-4">
              <ul className="space-y-2">
                {session.memory.map((fact, idx) => (
                  <li key={idx} className="text-xs text-slate-700 flex items-start gap-2 leading-relaxed">
                    <span className="text-indigo-500 font-bold select-none mt-0.5">•</span>
                    <span>{fact}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Skill Gauges Block */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Technical Competency Breakdown */}
        <Card>
          <CardHeader>
            <h3 className="text-sm font-semibold text-slate-800">Technical competency scorecard</h3>
          </CardHeader>
          <CardContent className="p-5 space-y-4">
            {evalData.technicalSkills.map((item, idx) => (
              <ScoreBar key={idx} item={item} />
            ))}
          </CardContent>
        </Card>

        {/* Soft Skills Breakdown */}
        <Card>
          <CardHeader>
            <h3 className="text-sm font-semibold text-slate-800">Soft Skills & cultural alignment</h3>
          </CardHeader>
          <CardContent className="p-5 space-y-4">
            {evalData.softSkills.map((item, idx) => (
              <ScoreBar key={idx} item={item} />
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Stored Resume Analysis section */}
      {session.analysis && (
        <Card className="border-slate-100 bg-white">
          <CardHeader className="p-4 border-b border-slate-50 flex flex-row items-center gap-2 bg-slate-50/40">
            <Sparkles className="w-4 h-4 text-indigo-500" />
            <h3 className="text-sm font-semibold text-slate-800">Stored Candidate Resume Analysis Agent Report</h3>
          </CardHeader>
          <CardContent className="p-5 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Education & Academic History */}
              <div className="space-y-2">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Education & Degree</span>
                {session.analysis.education && session.analysis.education.length > 0 ? (
                  session.analysis.education.map((edu, eIdx) => (
                    <div key={eIdx} className="text-xs">
                      <span className="font-bold text-slate-800 block">{edu.degree}</span>
                      <span className="text-slate-500 text-[11px] block">{edu.institution} ({edu.year})</span>
                    </div>
                  ))
                ) : (
                  <span className="text-xs text-slate-400 italic">No stored academic history.</span>
                )}
              </div>

              {/* Confidence rating */}
              <div className="space-y-2">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">AI Parse Confidence</span>
                <div className="flex items-center gap-2">
                  <div className="h-2 w-24 bg-slate-100 rounded-full overflow-hidden">
                    <div className="h-full bg-indigo-600" style={{ width: `${session.analysis.confidenceEstimate}%` }} />
                  </div>
                  <span className="text-xs font-mono font-bold text-indigo-600">{session.analysis.confidenceEstimate}%</span>
                </div>
              </div>

              {/* Gaps / Risks mapped */}
              <div className="space-y-2">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Identified Resume Risks</span>
                <div className="flex flex-wrap gap-1">
                  {session.analysis.weakAreas && session.analysis.weakAreas.length > 0 ? (
                    session.analysis.weakAreas.map((weak, wIdx) => (
                      <span key={wIdx} className="text-[10px] bg-rose-50 text-rose-800 font-medium px-2 py-0.5 rounded border border-rose-100">
                        {weak}
                      </span>
                    ))
                  ) : (
                    <span className="text-xs text-slate-400 italic">None detected.</span>
                  )}
                </div>
              </div>
            </div>

            {/* Projects */}
            {session.analysis.projects && session.analysis.projects.length > 0 && (
              <div className="space-y-1.5 pt-2 border-t border-slate-50">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Candidate Key Projects</span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {session.analysis.projects.map((proj, pIdx) => (
                    <div key={pIdx} className="p-2.5 rounded-lg bg-slate-50 border border-slate-100 space-y-1">
                      <span className="text-xs font-bold text-slate-800 block">{proj.name}</span>
                      <p className="text-[10px] text-slate-500 leading-normal">{proj.description}</p>
                      <div className="flex flex-wrap gap-1 pt-0.5">
                        {proj.technologies.map((tech, tIdx) => (
                          <span key={tIdx} className="text-[8px] font-mono bg-indigo-50 text-indigo-700 px-1 py-0.2 rounded border border-indigo-100/50">
                            {tech}
                          </span>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Stored Interview Strategy Blueprint section */}
      {session.plan && (
        <Card className="border-slate-100 bg-white">
          <CardHeader className="p-4 border-b border-slate-50 flex flex-row items-center gap-2 bg-indigo-50/10">
            <Sparkles className="w-4 h-4 text-indigo-600 animate-pulse" />
            <h3 className="text-sm font-semibold text-slate-800">Interviewer Strategy Execution Blueprint</h3>
          </CardHeader>
          <CardContent className="p-5 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Cognitive Difficulty Strategy</span>
                <p className="text-xs text-slate-700 leading-relaxed font-medium bg-slate-50 p-3 rounded-lg border border-slate-100/50">
                  {session.plan.difficultyStrategy}
                </p>
              </div>
              <div className="space-y-1">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Target Skill Areas Evaluated</span>
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {session.plan.focusTopics.map((topic, index) => (
                    <span key={index} className="text-[10px] font-medium bg-indigo-50 text-indigo-700 border border-indigo-100 px-2 py-0.5 rounded-md">
                      ✓ {topic}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            <div className="space-y-2.5 pt-2 border-t border-slate-50">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Tailored Questions Order Blueprint</span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {session.plan.questions.map((q, idx) => (
                  <div key={idx} className="p-3 rounded-xl border border-slate-100 bg-slate-50/40 space-y-2">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-[9px] font-mono bg-indigo-50 text-indigo-700 px-1.5 py-0.2 rounded font-bold uppercase">
                        {q.category} • {q.difficulty}
                      </span>
                      <span className="text-[10px] font-mono text-slate-400 font-bold">#0{idx + 1}</span>
                    </div>
                    <p className="text-xs text-slate-800 leading-relaxed font-medium">"{q.question}"</p>
                    <div className="text-[9px] text-slate-500 italic">
                      <strong>Probes:</strong> {q.suggestedFollowUps.join(", ")}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Question-by-Question Real-time Evaluations (Evaluation Agent integration) */}
      {session.answerEvaluations && session.answerEvaluations.length > 0 && (
        <Card className="border-slate-100 bg-white shadow-sm">
          <CardHeader className="p-4 border-b border-slate-50 flex flex-row items-center justify-between bg-indigo-50/5">
            <div className="flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-indigo-600" />
              <h3 className="text-sm font-semibold text-slate-800">Granular Performance Audits (Answer-by-Answer)</h3>
            </div>
            <Badge variant="info" className="text-[10px] uppercase font-mono">
              {session.answerEvaluations.length} Answers Logged
            </Badge>
          </CardHeader>
          <CardContent className="p-0 divide-y divide-slate-100 max-h-[500px] overflow-y-auto">
            {session.answerEvaluations.map((evalItem, idx) => (
              <div key={idx} className="p-5 hover:bg-slate-50/30 transition-all duration-200">
                {/* Header Row */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3.5">
                  <div className="space-y-1">
                    <span className="text-[9px] font-mono font-extrabold uppercase bg-indigo-100/60 text-indigo-700 px-2 py-0.5 rounded-md">
                      Question #{idx + 1}
                    </span>
                    <h4 className="text-xs font-semibold text-slate-800 italic">
                      "{evalItem.questionText}"
                    </h4>
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    <div className="text-right">
                      <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider block">Answer Score</span>
                      <span className="text-sm font-extrabold text-indigo-600">{evalItem.answerScore}%</span>
                    </div>
                    <div className="bg-indigo-50 border border-indigo-100/40 px-2.5 py-1 rounded-lg text-center min-w-[70px]">
                      <span className="text-[8px] text-indigo-500 font-bold uppercase tracking-wider block">Next Rec</span>
                      <span className="text-[10px] font-bold text-indigo-700">{evalItem.nextDifficultyRecommendation}</span>
                    </div>
                  </div>
                </div>

                {/* Candidate's Response */}
                <div className="bg-slate-50/50 p-3 rounded-lg border border-slate-100 mb-4">
                  <span className="text-[9px] font-mono text-slate-400 font-bold uppercase block mb-1">Candidate Answer:</span>
                  <p className="text-xs text-slate-700 leading-relaxed font-medium">
                    "{evalItem.candidateAnswer}"
                  </p>
                </div>

                {/* 5 Dimensions Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-3.5 mb-4">
                  {[
                    { label: "Technical Accuracy", val: evalItem.technicalAccuracy, color: "bg-emerald-500" },
                    { label: "Confidence", val: evalItem.confidence, color: "bg-indigo-500" },
                    { label: "Communication", val: evalItem.communication, color: "bg-blue-500" },
                    { label: "Completeness", val: evalItem.completeness, color: "bg-amber-500" },
                    { label: "Practical Thinking", val: evalItem.practicalThinking, color: "bg-purple-500" }
                  ].map((dim, dIdx) => (
                    <div key={dIdx} className="bg-white p-2.5 rounded-lg border border-slate-100 shadow-sm/40 space-y-1.5">
                      <span className="text-[9px] font-bold text-slate-400 uppercase tracking-tight block truncate" title={dim.label}>
                        {dim.label}
                      </span>
                      <div className="flex items-center justify-between gap-1">
                        <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                          <div className={`h-full ${dim.color}`} style={{ width: `${dim.val}%` }} />
                        </div>
                        <span className="text-[10px] font-bold text-slate-700 font-mono shrink-0">
                          {dim.val}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>

                {/* AI Observations / Feedback */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1.5">
                  <div className="space-y-1 bg-slate-50/40 p-3 rounded-lg border border-slate-100/50">
                    <div className="flex items-center gap-1.5 text-slate-700 font-semibold text-[10px] uppercase tracking-wider">
                      <Compass className="w-3.5 h-3.5 text-indigo-500" />
                      <span>Evaluation Logic / Reason</span>
                    </div>
                    <p className="text-[11px] text-slate-600 leading-relaxed">
                      {evalItem.reason}
                    </p>
                  </div>

                  <div className="space-y-1 bg-amber-50/10 p-3 rounded-lg border border-amber-100/30">
                    <div className="flex items-center gap-1.5 text-amber-800 font-semibold text-[10px] uppercase tracking-wider">
                      <Lightbulb className="w-3.5 h-3.5 text-amber-500 animate-pulse" />
                      <span>Suggested Improvements</span>
                    </div>
                    <p className="text-[11px] text-slate-600 leading-relaxed">
                      {evalItem.improvementSuggestion}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Decision Agent Adaptive Chronology */}
      {session.decisionLogs && session.decisionLogs.length > 0 && (
        <Card className="border-slate-100 bg-white shadow-sm">
          <CardHeader className="p-4 border-b border-slate-50 flex flex-row items-center justify-between bg-emerald-50/5">
            <div className="flex items-center gap-2">
              <Activity className="w-4 h-4 text-emerald-600 animate-pulse" />
              <h3 className="text-sm font-semibold text-slate-800">Autonomous Decision Agent Timeline</h3>
            </div>
            <Badge variant="success" className="text-[10px] uppercase font-mono">
              Dynamic Adapters Active
            </Badge>
          </CardHeader>
          <CardContent className="p-4 space-y-4 max-h-[400px] overflow-y-auto">
            <div className="relative border-l border-emerald-150 pl-5 ml-2.5 space-y-5">
              {session.decisionLogs.map((log, lIdx) => (
                <div key={lIdx} className="relative group">
                  {/* Timeline Dot */}
                  <div className="absolute -left-[27px] top-1.5 w-3 h-3 rounded-full bg-emerald-500 border-2 border-white ring-4 ring-emerald-50" />
                  
                  {/* Decision Log Content */}
                  <div className="bg-slate-50/50 hover:bg-slate-50 transition-colors p-3.5 rounded-xl border border-slate-100 space-y-2">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-[9px] font-bold text-slate-400 font-mono">STEP {lIdx + 1}</span>
                        <Badge className="bg-emerald-600 text-white hover:bg-emerald-700 text-[10px] font-bold uppercase py-0.5">
                          {log.decision}
                        </Badge>
                        <span className="text-[10px] text-slate-400 font-medium">
                          Answer Score: <strong>{log.evaluationScore}%</strong>
                        </span>
                      </div>
                      <span className="text-[9px] font-mono text-slate-400 shrink-0">
                        {new Date(log.timestamp).toLocaleTimeString()}
                      </span>
                    </div>

                    <div className="space-y-1">
                      <p className="text-[10px] text-slate-400 font-bold uppercase tracking-tight">Question Addressed:</p>
                      <p className="text-xs text-slate-700 italic">"{log.questionText}"</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1 border-t border-slate-100">
                      <div>
                        <p className="text-[9px] text-slate-400 font-bold uppercase tracking-tight">Agent reasoning:</p>
                        <p className="text-[11px] text-slate-600 leading-relaxed">{log.reason}</p>
                      </div>
                      <div>
                        <p className="text-[9px] text-emerald-600 font-bold uppercase tracking-tight">Strategic Directive:</p>
                        <p className="text-[11px] text-slate-600 leading-relaxed font-semibold italic">{log.suggestedAction}</p>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Transcript Log Drawer */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div className="flex items-center gap-2">
            <FileText className="w-4 h-4 text-slate-500" />
            <h3 className="text-sm font-semibold text-slate-800">Verified Transcript Audits</h3>
          </div>
          <span className="text-[10px] text-slate-400 font-mono">
            {session.messages.length} log events
          </span>
        </CardHeader>
        <CardContent className="max-h-64 overflow-y-auto divide-y divide-slate-100 p-0">
          {session.messages.map((msg, idx) => (
            <div key={idx} className="p-3 flex items-start gap-3.5 text-xs">
              <span
                className={`px-2 py-0.5 rounded text-[10px] font-mono shrink-0 ${
                  msg.sender === "agent"
                    ? "bg-slate-100 text-slate-700"
                    : "bg-slate-900 text-white"
                }`}
              >
                {msg.sender === "agent" ? "AGENT" : "CANDIDATE"}
              </span>
              <div className="space-y-0.5">
                <p className="text-slate-700 font-medium leading-relaxed">{msg.text}</p>
                <span className="text-[9px] text-slate-400 block font-mono">
                  {new Date(msg.timestamp).toLocaleTimeString()}
                </span>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
};
