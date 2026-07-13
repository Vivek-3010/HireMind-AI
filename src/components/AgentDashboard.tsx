import React from "react";
import { Card, CardHeader, CardContent } from "./ui/Card.jsx";
import { Badge } from "./ui/Badge.jsx";
import { InterviewSession } from "../types/index.js";
import { 
  Bot, 
  Target, 
  ListTodo, 
  FileCheck, 
  Heading, 
  Sparkles, 
  BrainCircuit, 
  Activity, 
  Percent, 
  Award,
  ChevronRight,
  TrendingUp,
  AwardIcon,
  BookOpen,
  ArrowRight
} from "lucide-react";
import { motion } from "motion/react";

interface AgentDashboardProps {
  session: InterviewSession;
  isAnalyzing: boolean;
}

export const AgentDashboard: React.FC<AgentDashboardProps> = ({ session, isAnalyzing }) => {
  const currentQuestion = session.plan?.questions?.[session.currentQuestionIndex];
  const latestEval = session.answerEvaluations?.[session.answerEvaluations.length - 1];
  const lastDecision = session.decisionLogs?.[session.decisionLogs.length - 1];
  
  // 1. Determine active agent and current goal
  let activeAgent = "Idle / Listening";
  let agentDescription = "Waiting for next candidate input...";
  let currentGoal = "Listen to candidate's technical response and provide adaptive questions.";

  if (session.status === "ongoing") {
    if (isAnalyzing) {
      activeAgent = "Live Evaluator Agent";
      agentDescription = "Parsing candidate speech & evaluating performance dimensions...";
      currentGoal = "Analyze technical accuracy, practical knowledge, and communication style of latest response.";
    } else {
      activeAgent = "Conversational Agent";
      agentDescription = "Facilitating natural discussion flow...";
      currentGoal = `Gather evidence for current competency: "${currentQuestion?.category || "Technical Skills"}"`;
    }
  } else if (session.status === "completed") {
    activeAgent = "Hiring Recommendation Agent";
    agentDescription = "Synthesizing multi-dimension scorecard...";
    currentGoal = "Process all session telemetry logs, memory tracks, and answers to formulate a final verdict.";
  } else if (session.status === "evaluated") {
    activeAgent = "Reporting & Analytics Agent";
    agentDescription = "Rendering evaluation dashboard analytics...";
    currentGoal = "Present interactive report card and feedback metrics to HR team.";
  }

  // Calculate interview progress percentage
  const totalQuestions = session.plan?.questions?.length || 5;
  const answeredCount = session.answerEvaluations?.length || 0;
  const progressPercentage = Math.round((answeredCount / totalQuestions) * 100);

  // List of all agents in the pipeline
  const pipelineAgents = [
    { name: "Resume Analyzer", status: session.analysis ? "completed" : "idle", icon: FileCheck },
    { name: "Strategy Planner", status: session.plan ? "completed" : "idle", icon: Target },
    { name: "Live Evaluator", status: isAnalyzing && activeAgent === "Live Evaluator Agent" ? "active" : answeredCount > 0 ? "completed" : "idle", icon: BrainCircuit },
    { name: "Decision Agent", status: isAnalyzing && activeAgent === "Live Evaluator Agent" ? "active" : session.decisionLogs && session.decisionLogs.length > 0 ? "completed" : "idle", icon: Activity },
    { name: "Memory Agent", status: session.memory && session.memory.length > 0 ? "completed" : "idle", icon: Sparkles },
    { name: "Hiring Recommender", status: session.status === "evaluated" || session.status === "completed" ? "completed" : "idle", icon: Award }
  ];

  return (
    <div className="space-y-6">
      {/* Real-time Agent Status Banner */}
      <Card className="border-indigo-100/80 bg-gradient-to-r from-slate-900 via-slate-850 to-indigo-950 text-white overflow-hidden">
        <CardContent className="p-5">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="flex items-center gap-3.5">
              <div className="relative">
                <div className="w-12 h-12 rounded-xl bg-indigo-500/20 flex items-center justify-center border border-indigo-400/30 text-indigo-400">
                  <Bot className="w-6 h-6" />
                </div>
                {isAnalyzing && (
                  <span className="absolute -top-1 -right-1 flex h-3 w-3">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
                  </span>
                )}
              </div>
              <div className="space-y-0.5">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-mono tracking-wider text-indigo-300 font-bold uppercase">Active Orchestrator Unit</span>
                  <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-pulse" />
                </div>
                <h3 className="text-base font-bold tracking-tight text-white">{activeAgent}</h3>
                <p className="text-xs text-slate-300 font-medium">{agentDescription}</p>
              </div>
            </div>
            
            {/* Real-time Telemetry Pulse */}
            <div className="bg-white/5 border border-white/10 p-3 rounded-xl shrink-0 text-right">
              <span className="text-[9px] font-mono text-slate-400 block tracking-widest">COGNITIVE LOAD</span>
              <div className="flex items-center gap-2 mt-1 justify-end">
                <div className="flex gap-0.5 items-end h-3 w-10">
                  <div className={`w-1 bg-indigo-400 rounded-full ${isAnalyzing ? "animate-[bounce_0.8s_infinite_100ms] h-3" : "h-1"}`} />
                  <div className={`w-1 bg-indigo-400 rounded-full ${isAnalyzing ? "animate-[bounce_0.8s_infinite_300ms] h-2" : "h-1"}`} />
                  <div className={`w-1 bg-indigo-400 rounded-full ${isAnalyzing ? "animate-[bounce_0.8s_infinite_200ms] h-3.5" : "h-1.5"}`} />
                  <div className={`w-1 bg-indigo-400 rounded-full ${isAnalyzing ? "animate-[bounce_0.8s_infinite_400ms] h-1.5" : "h-1"}`} />
                </div>
                <span className="text-xs font-bold font-mono text-indigo-300">{isAnalyzing ? "High" : "Optimal"}</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Multi-Agent Sequential Pipeline */}
      <Card className="border-slate-100 shadow-sm overflow-hidden bg-slate-50/20">
        <CardContent className="p-4">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-3.5">Agentic Pipeline Sequencing</span>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
            {pipelineAgents.map((agent, index) => {
              const Icon = agent.icon;
              const isActive = agent.status === "active";
              const isCompleted = agent.status === "completed";
              return (
                <div 
                  key={index} 
                  className={`relative p-3 rounded-xl border flex flex-col items-center justify-center text-center transition-all ${
                    isActive 
                      ? "bg-indigo-50/70 border-indigo-200 text-indigo-700 shadow-sm" 
                      : isCompleted 
                        ? "bg-emerald-50/30 border-emerald-100 text-emerald-800" 
                        : "bg-white border-slate-100 text-slate-400"
                  }`}
                >
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center mb-1.5 ${
                    isActive 
                      ? "bg-indigo-100 text-indigo-600 animate-pulse" 
                      : isCompleted 
                        ? "bg-emerald-100 text-emerald-700" 
                        : "bg-slate-50 text-slate-400"
                  }`}>
                    <Icon className="w-4 h-4" />
                  </div>
                  <span className="text-[10px] font-bold leading-tight block">{agent.name}</span>
                  <span className="text-[8px] font-mono font-medium mt-1 uppercase">
                    {isActive ? "ACTIVE" : isCompleted ? "COMPLETED" : "WAITING"}
                  </span>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Grid of Telemetry Details */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Goals, Progress, Topic & Difficulty */}
        <div className="space-y-6">
          
          {/* Goal & Strategy */}
          <Card>
            <CardHeader className="py-4 flex flex-row items-center gap-2.5">
              <Target className="w-4 h-4 text-slate-500" />
              <span className="text-xs font-bold text-slate-800 uppercase tracking-wider">Current Goal & Topic Focus</span>
            </CardHeader>
            <CardContent className="space-y-4 pt-1">
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 space-y-1">
                <span className="text-[9px] font-mono text-slate-400 tracking-wider block uppercase font-bold">COGNITIVE GOAL DIRECTIVE</span>
                <p className="text-xs text-slate-700 leading-relaxed font-medium">"{currentGoal}"</p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 space-y-1">
                  <span className="text-[9px] font-mono text-slate-400 tracking-wider block uppercase font-bold">ACTIVE TOPIC</span>
                  <div className="flex items-center gap-1.5 mt-1">
                    <Badge variant="primary" className="text-[10px] font-bold capitalize">
                      {currentQuestion?.category || "Introduction"}
                    </Badge>
                  </div>
                </div>

                <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 space-y-1">
                  <span className="text-[9px] font-mono text-slate-400 tracking-wider block uppercase font-bold">CALIBRATED DIFFICULTY</span>
                  <div className="flex items-center gap-1.5 mt-1">
                    <Badge 
                      variant={
                        currentQuestion?.difficulty === "Hard" 
                          ? "danger" 
                          : currentQuestion?.difficulty === "Medium" 
                            ? "warning" 
                            : "success"
                      }
                      className="text-[10px] font-bold"
                    >
                      {currentQuestion?.difficulty || "Medium"}
                    </Badge>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Interview Progress & Real-time Evaluation Score */}
          <Card>
            <CardHeader className="py-4 flex flex-row items-center justify-between">
              <div className="flex items-center gap-2.5">
                <TrendingUp className="w-4 h-4 text-slate-500" />
                <span className="text-xs font-bold text-slate-800 uppercase tracking-wider">Live Interview Progress</span>
              </div>
              <span className="text-xs font-mono text-indigo-600 font-bold bg-indigo-50 px-2 py-0.5 rounded-lg border border-indigo-100">
                {answeredCount}/{totalQuestions} Qs
              </span>
            </CardHeader>
            <CardContent className="space-y-5 pt-1">
              <div className="space-y-2">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-500 font-medium">Conversational Progress</span>
                  <span className="font-bold text-slate-800 font-mono">{progressPercentage}%</span>
                </div>
                <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-indigo-600 rounded-full transition-all duration-500 shadow-sm"
                    style={{ width: `${progressPercentage}%` }}
                  />
                </div>
              </div>

              {/* Latest Answer Score Gauge */}
              <div className="bg-slate-50/50 p-3.5 rounded-xl border border-slate-100/80 flex items-center justify-between">
                <div className="space-y-1">
                  <span className="text-[9px] font-mono text-slate-400 tracking-wider block uppercase font-bold">LATEST EVALUATION SCORE</span>
                  <p className="text-xs text-slate-600 leading-normal font-medium">
                    {latestEval ? `Dimension Average Score: ${latestEval.answerScore}%` : "No responses evaluated yet."}
                  </p>
                  {latestEval && (
                    <p className="text-[10px] text-indigo-600 font-semibold italic">
                      🎯 Calibration: {latestEval.nextDifficultyRecommendation} recommended
                    </p>
                  )}
                </div>
                {latestEval ? (
                  <div className="w-14 h-14 rounded-full border-4 border-emerald-100 bg-white flex flex-col items-center justify-center shrink-0 shadow-sm">
                    <span className="text-xs font-extrabold text-emerald-600 font-mono leading-none">{latestEval.answerScore}</span>
                    <span className="text-[7px] text-emerald-500 font-mono font-bold mt-0.5">SCORE</span>
                  </div>
                ) : (
                  <div className="w-14 h-14 rounded-full border-4 border-dashed border-slate-200 bg-white flex items-center justify-center shrink-0">
                    <span className="text-[10px] text-slate-400 font-bold font-mono">--</span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Resume Analysis Status */}
          <Card>
            <CardHeader className="py-4 flex flex-row items-center gap-2.5">
              <FileCheck className="w-4 h-4 text-slate-500" />
              <span className="text-xs font-bold text-slate-800 uppercase tracking-wider">Resume Analysis Registry</span>
            </CardHeader>
            <CardContent className="pt-1 space-y-3">
              {session.analysis ? (
                <>
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-xs font-bold text-slate-800 block leading-tight">{session.analysis.candidateName}</span>
                      <span className="text-[10px] text-slate-400 block font-medium mt-0.5">Parsed via Gemini 3.5 Flash</span>
                    </div>
                    <Badge variant="success" className="text-[10px] font-mono">
                      Confidence: {session.analysis.confidenceEstimate}%
                    </Badge>
                  </div>
                  <div className="space-y-1.5">
                    <span className="text-[9px] font-mono text-slate-400 tracking-wider block uppercase font-bold">EXTRACTED CORE CAPABILITIES</span>
                    <div className="flex flex-wrap gap-1">
                      {session.analysis.skills.slice(0, 10).map((skill, idx) => (
                        <span key={idx} className="text-[9px] font-semibold bg-indigo-50/40 text-indigo-700 border border-indigo-100/50 px-1.5 py-0.5 rounded">
                          {skill}
                        </span>
                      ))}
                      {session.analysis.skills.length > 10 && (
                        <span className="text-[9px] text-slate-400 font-medium">+{session.analysis.skills.length - 10} more</span>
                      )}
                    </div>
                  </div>
                </>
              ) : (
                <div className="text-center py-2">
                  <p className="text-xs text-slate-400 italic">No resume parsed for this manual campaign.</p>
                </div>
              )}
            </CardContent>
          </Card>

        </div>

        {/* Memory Updates & Final Verdict */}
        <div className="space-y-6">

          {/* Memory Updates */}
          <Card className="flex flex-col h-[280px]">
            <CardHeader className="py-4 border-b border-slate-50 flex flex-row items-center justify-between shrink-0">
              <div className="flex items-center gap-2.5">
                <BrainCircuit className="w-4 h-4 text-indigo-600 animate-pulse" />
                <span className="text-xs font-bold text-slate-800 uppercase tracking-wider">Memory Agent Log (Cumulative)</span>
              </div>
              <Badge variant="info" className="text-[10px] font-mono font-bold">
                {session.memory?.length || 0} facts stored
              </Badge>
            </CardHeader>
            <div className="flex-1 overflow-y-auto p-4 space-y-2.5 min-h-0">
              {session.memory && session.memory.length > 0 ? (
                session.memory.map((fact, index) => (
                  <motion.div 
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    key={index} 
                    className="flex items-start gap-2.5 bg-slate-50 p-2.5 rounded-xl border border-slate-100 text-xs text-slate-700 leading-relaxed font-medium"
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 shrink-0 mt-1.5" />
                    <p>{fact}</p>
                  </motion.div>
                ))
              ) : (
                <div className="flex flex-col items-center justify-center text-center h-full text-slate-400 space-y-2 py-8">
                  <Sparkles className="w-6 h-6 text-slate-300" />
                  <p className="text-xs italic leading-relaxed">No memory tracks recorded yet.<br/>The Memory Agent will extract evidence dynamically.</p>
                </div>
              )}
            </div>
          </Card>

          {/* Final Hiring Decision */}
          <Card>
            <CardHeader className="py-4 flex flex-row items-center gap-2.5">
              <Award className="w-4 h-4 text-slate-500" />
              <span className="text-xs font-bold text-slate-800 uppercase tracking-wider">Autonomous Hiring Recommendation</span>
            </CardHeader>
            <CardContent className="pt-1">
              {session.status === "evaluated" && session.evaluation ? (
                <div className="space-y-3.5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-slate-500 font-medium">Scorecard Verdict</span>
                    <Badge 
                      variant={
                        session.evaluation.recommendation === "STRONG_HIRE" || session.evaluation.recommendation === "HIRE"
                          ? "success" 
                          : session.evaluation.recommendation === "MAYBE" 
                            ? "warning" 
                            : "danger"
                      }
                      className="text-xs font-bold uppercase py-0.5 px-2.5"
                    >
                      {session.evaluation.recommendation.replace("_", " ")}
                    </Badge>
                  </div>
                  
                  <div className="p-3 bg-indigo-50/30 border border-indigo-100/30 rounded-xl space-y-1">
                    <span className="text-[9px] font-mono text-indigo-600 font-bold uppercase tracking-wider block">Decision Agent Summary</span>
                    <p className="text-xs text-slate-700 leading-relaxed font-medium">"{session.evaluation.summary}"</p>
                  </div>
                </div>
              ) : session.status === "completed" ? (
                <div className="bg-amber-50/50 border border-amber-100 rounded-xl p-4 text-center space-y-2.5">
                  <Activity className="w-5 h-5 text-amber-500 mx-auto animate-pulse" />
                  <div className="space-y-1">
                    <span className="text-xs font-bold text-amber-800 block">Session Complete - Evaluation Ready</span>
                    <p className="text-[11px] text-amber-700 leading-normal">The orchestrator is awaiting instructions to compile the dynamic scorecard report.</p>
                  </div>
                </div>
              ) : (
                <div className="text-center py-6 text-slate-400 space-y-1.5">
                  <Bot className="w-5 h-5 text-slate-300 mx-auto" />
                  <p className="text-xs italic leading-relaxed">Recommendation will be computed automatically at the conclusion of the live campaign.</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Audit Trail Completed Steps */}
          <Card>
            <CardHeader className="py-3 border-b border-slate-50 flex flex-row items-center justify-between">
              <span className="text-xs font-bold text-slate-800 uppercase tracking-wider">Completed System Steps</span>
              <Badge variant="primary" className="text-[9px] font-mono">
                {2 + answeredCount} verified steps
              </Badge>
            </CardHeader>
            <CardContent className="p-4 pt-3.5 space-y-2.5">
              <div className="flex items-center gap-2 text-xs text-slate-700 font-medium">
                <span className="w-4 h-4 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center text-[10px] font-extrabold font-mono">✓</span>
                <span>Job campaign targeting initialized</span>
              </div>
              <div className="flex items-center gap-2 text-xs text-slate-700 font-medium">
                <span className="w-4 h-4 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center text-[10px] font-extrabold font-mono">✓</span>
                <span>Resume content parsing and metadata mapping successfully loaded</span>
              </div>
              {session.answerEvaluations?.map((ev, index) => (
                <div key={index} className="flex items-center gap-2 text-xs text-slate-700 font-medium animate-fade-in">
                  <span className="w-4 h-4 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center text-[10px] font-extrabold font-mono">✓</span>
                  <span>Answer {index + 1} scored & committed to Memory Agent (Score: {ev.answerScore}%)</span>
                </div>
              ))}
            </CardContent>
          </Card>

        </div>

      </div>
    </div>
  );
};
