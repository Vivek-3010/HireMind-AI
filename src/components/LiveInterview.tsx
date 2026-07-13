import React, { useState, useEffect, useRef } from "react";
import { Button } from "./ui/Button.jsx";
import { Card, CardContent } from "./ui/Card.jsx";
import { Badge } from "./ui/Badge.jsx";
import { InterviewSession } from "../types/index.js";
import { Mic, MicOff, Send, PhoneOff, AlertCircle, Video, MessageSquare, Loader2, Sparkles, Activity, BrainCircuit } from "lucide-react";
import { AgentDashboard } from "./AgentDashboard.jsx";

interface LiveInterviewProps {
  session: InterviewSession;
  isAnalyzing: boolean;
  isLoading: boolean;
  error: string | null;
  duration: number;
  onSubmitAnswer: (text: string) => Promise<void>;
  onTriggerEvaluation: () => Promise<void>;
  onExit: () => void;
}

export const LiveInterview: React.FC<LiveInterviewProps> = ({
  session,
  isAnalyzing,
  isLoading,
  error,
  duration,
  onSubmitAnswer,
  onTriggerEvaluation,
  onExit,
}) => {
  const [inputText, setInputText] = useState("");
  const [isMicActive, setIsMicActive] = useState(false);
  const [isRecordingSimulated, setIsRecordingSimulated] = useState(false);
  const [speechError, setSpeechError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"media" | "dashboard">("dashboard");
  
  const recognitionRef = useRef<any>(null);

  // Auto-scroll chat transcript to bottom
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [session.messages, isAnalyzing]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() || isAnalyzing) return;
    const textToSend = inputText;
    setInputText("");
    await onSubmitAnswer(textToSend);
  };

  const formatTime = (totalSec: number) => {
    const mins = Math.floor(totalSec / 60);
    const secs = totalSec % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const startSimulatedSpeech = () => {
    setIsRecordingSimulated(true);
    setSpeechError(null);
    setIsMicActive(false);
    const phrases = [
      "That is a great question. In my previous role, I focused heavily on building secure server actions.",
      "Yes, I believe that managing API keys strictly on the backend prevents any credentials leaks.",
      "I typically use React context paired with modular custom hooks to handle complex application states."
    ];
    
    setTimeout(() => {
      const randomPhrase = phrases[Math.floor(Math.random() * phrases.length)];
      setInputText((prev) => (prev ? prev + " " + randomPhrase : randomPhrase));
      setIsRecordingSimulated(false);
    }, 2500);
  };

  const toggleMicrophone = () => {
    const SpeechRecognitionAPI = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (isMicActive) {
      setIsMicActive(false);
      setIsRecordingSimulated(false);
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch (e) {
          console.error(e);
        }
      }
    } else {
      setIsMicActive(true);
      setSpeechError(null);
      setIsRecordingSimulated(false);

      if (!SpeechRecognitionAPI) {
        setSpeechError("Speech recognition API is not supported in this browser. Try Chrome/Safari or use the manual simulation.");
        setIsMicActive(false);
        return;
      }

      try {
        const rec = new SpeechRecognitionAPI();
        rec.continuous = false;
        rec.interimResults = false;
        rec.lang = "en-US";

        rec.onstart = () => {
          setIsRecordingSimulated(false);
        };

        rec.onresult = (event: any) => {
          const resultText = event.results[0][0].transcript;
          if (resultText) {
            setInputText((prev) => (prev ? prev + " " + resultText.trim() : resultText.trim()));
          }
        };

        rec.onerror = (event: any) => {
          console.error("[Speech API Error]", event.error);
          if (event.error === "not-allowed") {
            setSpeechError("Microphone permission denied. Please allow microphone access or use the simulation link.");
          } else if (event.error === "no-speech") {
            setSpeechError("No speech detected. Speak clearly or try again.");
          } else {
            setSpeechError(`Speech recognition status: ${event.error}. Feel free to use the simulation option.`);
          }
          setIsMicActive(false);
        };

        rec.onend = () => {
          setIsMicActive(false);
        };

        recognitionRef.current = rec;
        rec.start();
      } catch (err: any) {
        console.error("[Speech API Start Error]", err);
        setSpeechError("Could not start speech recognition. Use manual simulation.");
        setIsMicActive(false);
      }
    }
  };

  const isCompleted = session.status === "completed";
  const chatEndRef = useRef<HTMLDivElement | null>(null);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 max-w-6xl mx-auto h-[calc(100vh-140px)]">
      {/* Visual Feeds & Telemetry (Left Panel) */}
      <div className="lg:col-span-7 flex flex-col gap-4 h-full overflow-y-auto pr-1">
        {/* Navigation Tabs */}
        <div className="flex bg-slate-100 p-1 rounded-xl gap-1 shrink-0">
          <button
            type="button"
            onClick={() => setActiveTab("dashboard")}
            className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-all ${
              activeTab === "dashboard" ? "bg-white text-slate-900 shadow-sm" : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <BrainCircuit className="w-3.5 h-3.5 text-indigo-600" />
            AI Agent Dashboard
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("media")}
            className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-all ${
              activeTab === "media" ? "bg-white text-slate-900 shadow-sm" : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <Video className="w-3.5 h-3.5 text-slate-500" />
            Media Feed View
          </button>
        </div>

        {activeTab === "dashboard" ? (
          <div className="flex-1">
            <AgentDashboard session={session} isAnalyzing={isAnalyzing} />
          </div>
        ) : (
          <>
            <div className="relative flex-1 bg-slate-900 rounded-2xl overflow-hidden shadow-inner flex flex-col justify-between p-4 border border-slate-850">
              {/* Header Indicators */}
              <div className="flex items-center justify-between z-10">
                <div className="flex items-center gap-2 bg-slate-950/80 backdrop-blur-md px-3 py-1.5 rounded-xl border border-white/5">
                  <span className="w-2.5 h-2.5 bg-rose-500 rounded-full animate-pulse" />
                  <span className="text-xs font-mono text-slate-200 tracking-wider">LIVE RECORDING</span>
                </div>
                <div className="bg-slate-950/80 backdrop-blur-md px-3 py-1.5 rounded-xl border border-white/5">
                  <span className="text-xs font-mono text-slate-200 tracking-wider">{formatTime(duration)}</span>
                </div>
              </div>

              {/* AI Interviewer Avatar / Visual Loop */}
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                {/* Visual audio wave loop when analyzing */}
                <div className="relative w-28 h-28 rounded-full bg-slate-800/40 flex items-center justify-center border border-slate-700/50">
                  <div className={`absolute inset-0 rounded-full bg-slate-500/10 border border-slate-500/30 transition-all duration-1000 ${
                    isAnalyzing ? "animate-ping" : "scale-75"
                  }`} />
                  <Video className="w-8 h-8 text-slate-300" />
                </div>
                <span className="text-xs font-medium text-slate-400 mt-4 tracking-wide">
                  {isAnalyzing ? "HireMind AI is analyzing response..." : "HireMind AI is active & listening"}
                </span>
              </div>

              {/* Adaptive Agenda Checklist (Bottom-Left Overlay) */}
              {session.plan && (
                <div className="absolute bottom-4 left-4 max-w-[240px] bg-slate-950/90 backdrop-blur-md p-3 rounded-xl border border-white/10 z-10 space-y-1.5 hidden md:block">
                  <span className="text-[9px] font-mono font-extrabold tracking-wider text-indigo-400 uppercase block">Active Strategy Agenda</span>
                  <div className="flex flex-wrap gap-1">
                    {session.plan.focusTopics.map((topic, index) => (
                      <span key={index} className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-white/5 text-slate-300 border border-white/5">
                        ✓ {topic}
                      </span>
                    ))}
                  </div>
                  <span className="text-[8px] text-slate-400 font-mono block leading-relaxed">
                    Difficulty: {session.plan.difficultyStrategy}
                  </span>
                </div>
              )}

              {/* Candidate Small Self-View Overlay */}
              <div className="absolute bottom-4 right-4 w-32 h-24 bg-slate-800 rounded-xl overflow-hidden border border-slate-700 shadow-lg flex flex-col justify-between p-2">
                <span className="text-[10px] text-slate-400 font-medium">You</span>
                <div className="flex items-center justify-between">
                  <Badge variant={isMicActive ? "success" : "neutral"} className="text-[9px] px-1.5 py-0">
                    {isMicActive ? "Mic On" : "Muted"}
                  </Badge>
                  {isMicActive && (
                    <div className="flex gap-0.5 items-end h-3">
                      <div className="w-0.5 bg-emerald-500 animate-[bounce_0.8s_infinite_100ms] h-1.5" />
                      <div className="w-0.5 bg-emerald-500 animate-[bounce_0.8s_infinite_300ms] h-3" />
                      <div className="w-0.5 bg-emerald-500 animate-[bounce_0.8s_infinite_200ms] h-2" />
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Audio Simulation Controls */}
            <div className="bg-slate-50 border border-slate-100 p-4 rounded-2xl flex items-center justify-between gap-4 shrink-0">
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={toggleMicrophone}
                  className={`p-3 rounded-xl transition ${
                    isMicActive
                      ? "bg-emerald-100 text-emerald-800 hover:bg-emerald-200 animate-pulse"
                      : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                  }`}
                >
                  {isMicActive ? <Mic className="w-5 h-5" /> : <MicOff className="w-5 h-5" />}
                </button>
                <div className="space-y-0.5 animate-fade-in">
                  <span className="text-xs font-semibold text-slate-800">Voice Input Mode</span>
                  <div className="text-[11px] text-slate-500 leading-normal">
                    {speechError ? (
                      <span className="text-amber-600 font-semibold">{speechError}</span>
                    ) : isMicActive ? (
                      <span className="text-emerald-600 font-semibold animate-pulse">Listening... Speak now</span>
                    ) : isRecordingSimulated ? (
                      <span className="text-indigo-600 font-semibold animate-pulse">Simulating speech typing...</span>
                    ) : (
                      "Toggle Mic to speak your response"
                    )}
                    {!isMicActive && !isRecordingSimulated && (
                      <button
                        type="button"
                        onClick={startSimulatedSpeech}
                        className="text-xs text-indigo-600 hover:text-indigo-800 font-semibold underline ml-2 inline-block cursor-pointer"
                      >
                        (Simulate speech)
                      </button>
                    )}
                  </div>
                </div>
              </div>

              <Button variant="danger" size="sm" onClick={onExit} className="rounded-xl">
                <PhoneOff className="w-4 h-4 mr-2" /> Disconnect Call
              </Button>
            </div>

            {/* Real-Time Answer Evaluation (AI Copilot) */}
            {session.answerEvaluations && session.answerEvaluations.length > 0 && (
              <div className="bg-white border border-slate-100 p-4 rounded-2xl shadow-sm space-y-3 shrink-0">
                <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                  <div className="flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4 text-indigo-600 animate-pulse" />
                    <span className="text-xs font-bold text-slate-800 uppercase tracking-wider">AI Copilot Real-Time Assessment</span>
                  </div>
                  <Badge variant="success" className="text-[9px] font-mono">
                    Latest Answer Score: {session.answerEvaluations[session.answerEvaluations.length - 1].answerScore}%
                  </Badge>
                </div>
                
                {/* 5-Dimension Mini Progress Bars */}
                <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
                  {[
                    { label: "Tech Accuracy", val: session.answerEvaluations[session.answerEvaluations.length - 1].technicalAccuracy, color: "bg-emerald-500" },
                    { label: "Confidence", val: session.answerEvaluations[session.answerEvaluations.length - 1].confidence, color: "bg-indigo-500" },
                    { label: "Communication", val: session.answerEvaluations[session.answerEvaluations.length - 1].communication, color: "bg-blue-500" },
                    { label: "Completeness", val: session.answerEvaluations[session.answerEvaluations.length - 1].completeness, color: "bg-amber-500" },
                    { label: "Practicality", val: session.answerEvaluations[session.answerEvaluations.length - 1].practicalThinking, color: "bg-purple-500" }
                  ].map((dim, dIdx) => (
                    <div key={dIdx} className="bg-slate-50/50 p-1.5 rounded-lg border border-slate-100/50 space-y-1 text-center">
                      <span className="text-[8px] font-semibold text-slate-400 uppercase tracking-tight block truncate">
                        {dim.label}
                      </span>
                      <div className="flex items-center justify-center gap-1">
                        <span className="text-[10px] font-bold text-slate-700 font-mono">
                          {dim.val}
                        </span>
                      </div>
                      <div className="h-1 w-full bg-slate-100 rounded-full overflow-hidden">
                        <div className={`h-full ${dim.color}`} style={{ width: `${dim.val}%` }} />
                      </div>
                    </div>
                  ))}
                </div>

                {/* Quick Feedback Quote */}
                <div className="text-[11px] text-slate-600 leading-relaxed bg-indigo-50/20 p-2.5 rounded-xl border border-indigo-100/30">
                  <strong>Observation:</strong> "{session.answerEvaluations[session.answerEvaluations.length - 1].reason}"
                  <div className="mt-1.5 text-amber-800 border-t border-indigo-100/30 pt-1.5">
                    <strong>Tip:</strong> {session.answerEvaluations[session.answerEvaluations.length - 1].improvementSuggestion}
                  </div>
                </div>

                {/* Decision Agent Autonomous Actions */}
                {session.decisionLogs && session.decisionLogs.length > 0 && (
                  <div className="pt-2.5 border-t border-dashed border-slate-200">
                    <div className="flex items-center gap-1.5 mb-1.5">
                      <Activity className="w-3.5 h-3.5 text-emerald-500 animate-pulse" />
                      <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Decision Agent Action (Autonomous)</span>
                    </div>
                    <div className="bg-emerald-50/10 border border-emerald-100/30 rounded-xl p-2.5 space-y-1.5">
                      <div className="flex items-center gap-2">
                        <span className="bg-emerald-600 text-white rounded-md px-2 py-0.5 text-[9px] font-bold uppercase tracking-tight">
                          {session.decisionLogs[session.decisionLogs.length - 1].decision}
                        </span>
                        <span className="text-[9px] font-mono text-slate-400 font-bold">
                          Adaptive Calibration Active
                        </span>
                      </div>
                      <p className="text-[10px] text-slate-600 leading-normal">
                        <strong>Reasoning:</strong> "{session.decisionLogs[session.decisionLogs.length - 1].reason}"
                      </p>
                      <p className="text-[9px] text-emerald-800 font-semibold italic bg-emerald-500/5 p-1.5 rounded-lg border border-emerald-500/10">
                        <strong>Directive:</strong> {session.decisionLogs[session.decisionLogs.length - 1].suggestedAction}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </div>

      {/* Scrolling Interview Transcript (Right Panel) */}
      <div className="lg:col-span-5 flex flex-col h-full bg-white border border-slate-100 rounded-2xl shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <MessageSquare className="w-4 h-4 text-slate-500" />
            <span className="font-semibold text-sm text-slate-800">Live Transcript</span>
          </div>
          <Badge variant={isCompleted ? "success" : "info"}>
            {isCompleted ? "Session Ready for Scorecard" : "Progressing"}
          </Badge>
        </div>

        {session.plan && session.plan.questions && (
          <div className="border-b border-slate-100 bg-slate-50/30 p-4 space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold text-indigo-600 uppercase tracking-wider block">Interview Strategy Roadmap</span>
              <span className="text-[10px] font-mono text-slate-400 font-bold">
                Question {Math.min(session.currentQuestionIndex + 1, session.plan.questions.length)} of {session.plan.questions.length}
              </span>
            </div>
            <div className="flex gap-1">
              {session.plan.questions.map((q, idx) => {
                const isActive = idx === session.currentQuestionIndex;
                const isCompleted = idx < session.currentQuestionIndex;
                return (
                  <div
                    key={idx}
                    className={`h-1.5 flex-1 rounded-full transition-all duration-350 ${
                      isCompleted ? "bg-emerald-500 shadow-[0_0_4px_rgba(16,185,129,0.3)]" : isActive ? "bg-indigo-600 animate-pulse" : "bg-slate-200"
                    }`}
                    title={`${q.category} Question (${q.difficulty})`}
                  />
                );
              })}
            </div>
            <p className="text-[10px] text-slate-600 italic leading-relaxed">
              <strong>Active Roadmap Focus:</strong> "{session.plan.questions[Math.min(session.currentQuestionIndex, session.plan.questions.length - 1)].question}"
            </p>
          </div>
        )}

        {/* Messaging Board */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {session.messages.map((msg, idx) => (
            <div
              key={msg.id || idx}
              className={`flex flex-col max-w-[85%] ${
                msg.sender === "agent" ? "mr-auto" : "ml-auto items-end"
              }`}
            >
              <div
                className={`px-3.5 py-2.5 rounded-2xl text-xs leading-relaxed ${
                  msg.sender === "agent"
                    ? "bg-slate-100 text-slate-800 rounded-tl-none"
                    : "bg-slate-900 text-white rounded-tr-none"
                }`}
              >
                {msg.text}
              </div>
              <span className="text-[9px] text-slate-400 font-mono mt-1">
                {msg.sender === "agent" ? "HireMind AI" : "You"}
              </span>
            </div>
          ))}

          {isAnalyzing && (
            <div className="flex flex-col mr-auto max-w-[85%]">
              <div className="px-3.5 py-2.5 rounded-2xl text-xs bg-slate-100 text-slate-500 rounded-tl-none flex items-center gap-2">
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                Analyzing response and formulating adaptive follow-up...
              </div>
            </div>
          )}

          <div ref={chatEndRef} />
        </div>

        {/* Notification warnings */}
        {error && (
          <div className="mx-4 p-2.5 bg-rose-50 text-rose-700 text-xs rounded-xl flex items-center gap-2 border border-rose-100">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Input Trigger Bar */}
        <div className="p-4 border-t border-slate-100 bg-slate-50/20">
          {!isCompleted ? (
            <form onSubmit={handleSend} className="flex gap-2">
              <input
                type="text"
                disabled={isAnalyzing}
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder={isAnalyzing ? "Thinking..." : "Type your technical response..."}
                className="flex-1 px-3.5 py-2 border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-slate-800 bg-white disabled:bg-slate-50"
              />
              <Button type="submit" disabled={!inputText.trim() || isAnalyzing} className="rounded-xl px-3">
                <Send className="w-3.5 h-3.5" />
              </Button>
            </form>
          ) : (
            <div className="text-center py-2 space-y-2.5">
              <p className="text-xs font-semibold text-slate-700">Interview Session Concluded!</p>
              <Button
                onClick={onTriggerEvaluation}
                disabled={isLoading}
                variant="custom"
                size="none"
                className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg inline-flex items-center justify-center font-semibold transition-all duration-200 shadow-sm"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin mr-2" />
                    Generating High-Fidelity Scorecard...
                  </>
                ) : (
                  "Generate AI Evaluation Report"
                )}
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
