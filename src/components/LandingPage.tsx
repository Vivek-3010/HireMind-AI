import React from "react";
import { Button } from "./ui/Button.jsx";
import { Card, CardContent } from "./ui/Card.jsx";
import { Brain, Sparkles, Shield, Clock, BarChart3, UserCheck, ArrowRight, Zap, CheckCircle2 } from "lucide-react";

interface LandingPageProps {
  onEnterApp: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onEnterApp }) => {
  return (
    <div className="space-y-20 py-12">
      {/* Hero Section */}
      <div className="text-center max-w-4xl mx-auto space-y-6 px-4">
        <div className="inline-flex items-center gap-2 bg-indigo-50 text-indigo-700 px-3 py-1.5 rounded-full text-xs font-semibold border border-indigo-100 animate-pulse">
          <Sparkles className="w-3.5 h-3.5" /> Introducing HireMind Agentic AI 2.0
        </div>
        
        <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight text-slate-900 leading-none">
          Autonomous AI Interviews with{" "}
          <span className="bg-gradient-to-r from-indigo-600 via-violet-600 to-pink-600 bg-clip-text text-transparent">
            Cognitive Depth
          </span>
        </h1>
        
        <p className="text-sm md:text-base text-slate-600 max-w-2xl mx-auto leading-relaxed">
          HireMind AI goes beyond static chatbots. Our agentic system reads resumes, designs structured campaigns, and conducts dynamic, adaptive conversations—probing deeper into candidate answers in real-time.
        </p>

        <div className="flex flex-col sm:flex-row justify-center items-center gap-4 pt-4">
          <Button onClick={onEnterApp} variant="custom" size="none" className="bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 text-white shadow-lg shadow-indigo-100 rounded-xl px-8 py-4 text-sm font-semibold inline-flex items-center justify-center transition-all duration-200">
            Launch Recruiter Console <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
          <button 
            onClick={onEnterApp}
            className="text-xs font-semibold text-slate-600 hover:text-indigo-600 transition flex items-center gap-1.5"
          >
            Explore Sandbox Campaigns
          </button>
        </div>

        {/* Floating Interactive SaaS Badges */}
        <div className="pt-8 flex flex-wrap justify-center items-center gap-x-8 gap-y-3 text-xs text-slate-400">
          <div className="flex items-center gap-1.5">
            <Shield className="w-4 h-4 text-emerald-500" /> Server-side Key Masking
          </div>
          <div className="flex items-center gap-1.5">
            <Zap className="w-4 h-4 text-amber-500" /> Powered by Gemini 3.5 Flash
          </div>
          <div className="flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-indigo-500" /> High-Fidelity Scorecards
          </div>
        </div>
      </div>

      {/* Features Grid */}
      <div className="max-w-6xl mx-auto px-4 space-y-12">
        <div className="text-center space-y-2">
          <h2 className="text-2xl font-bold tracking-tight text-slate-900">Built to Professional Evaluation Standards</h2>
          <p className="text-sm text-slate-500 max-w-md mx-auto">Standard HR interviews are flat. HireMind conducts contextual deep dives.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="hover:border-indigo-100 transition duration-300">
            <CardContent className="p-6 space-y-4">
              <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
                <Brain className="w-5 h-5" />
              </div>
              <h3 className="font-semibold text-slate-800 text-sm">Adaptive Turn Generation</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Using Gemini 3.5 Flash, the AI tracks answers to generate contextual, rigorous follow-up questions instead of mindlessly moving to the next script.
              </p>
            </CardContent>
          </Card>

          <Card className="hover:border-violet-100 transition duration-300">
            <CardContent className="p-6 space-y-4">
              <div className="w-10 h-10 rounded-xl bg-violet-50 text-violet-600 flex items-center justify-center">
                <BarChart3 className="w-5 h-5" />
              </div>
              <h3 className="font-semibold text-slate-800 text-sm">Fidelity Competency Cards</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Get automated scorecards with detailed numerical evaluations and verbatim evidence extracted from the conversation transcript.
              </p>
            </CardContent>
          </Card>

          <Card className="hover:border-pink-100 transition duration-300">
            <CardContent className="p-6 space-y-4">
              <div className="w-10 h-10 rounded-xl bg-pink-50 text-pink-600 flex items-center justify-center">
                <UserCheck className="w-5 h-5" />
              </div>
              <h3 className="font-semibold text-slate-800 text-sm">Campaign Blueprint Designer</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Design custom campaigns. Specify specific roles, experience targets, and direct competencies that you want evaluated.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* How it Works / Steps */}
      <div className="bg-slate-900 text-white py-16 -mx-4 px-4 sm:-mx-6 md:-mx-8">
        <div className="max-w-5xl mx-auto space-y-12">
          <div className="text-center space-y-3">
            <span className="text-[10px] font-mono tracking-widest text-indigo-400 uppercase">Interactive Sandbox Playground</span>
            <h2 className="text-2xl md:text-3xl font-bold tracking-tight">The 3-Step Candidate Experience</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="space-y-3">
              <div className="text-xs font-mono text-indigo-400">01 / PARSE</div>
              <h3 className="font-semibold text-sm">Smart Resume Upload</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Upload candidate resume data. The parser maps core skills to contextualize the interview's adaptive path.
              </p>
            </div>
            <div className="space-y-3">
              <div className="text-xs font-mono text-indigo-400">02 / INTERVIEW</div>
              <h3 className="font-semibold text-sm">Immersive Live Room</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Conduct the call with full transcript logs, voice synthesis simulation, and real-time conversation trackers.
              </p>
            </div>
            <div className="space-y-3">
              <div className="text-xs font-mono text-indigo-400">03 / VERDICT</div>
              <h3 className="font-semibold text-sm">Evidence-Driven Scorecard</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Review automated breakdowns, highlights, growth areas, fit percentages, and direct verbatim evidence.
              </p>
            </div>
          </div>

          <div className="pt-8 text-center">
            <Button onClick={onEnterApp} variant="custom" size="none" className="bg-white text-slate-900 hover:bg-slate-100 rounded-xl px-8 py-3.5 text-xs font-semibold inline-flex items-center justify-center transition-all duration-200">
              Enter Sandbox Now
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
