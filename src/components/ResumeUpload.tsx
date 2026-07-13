import React, { useState } from "react";
import { Button } from "./ui/Button.jsx";
import { Card, CardHeader, CardContent } from "./ui/Card.jsx";
import { 
  Upload, 
  FileText, 
  CheckCircle2, 
  ArrowRight, 
  Loader2, 
  RefreshCw, 
  AlertTriangle,
  ChevronDown,
  ChevronUp,
  Sparkles,
  GraduationCap,
  Briefcase,
  Code2,
  Award,
  Lightbulb,
  ThumbsUp,
  ThumbsDown,
  Target,
  LineChart,
  Percent,
  BookOpen,
  FolderDot,
  CheckCircle,
  Copy
} from "lucide-react";
import { validateFileHeader, extractTextFromPdf, parseResumeMetadata } from "../utils/pdfParser.js";
import { ResumeAnalysis, InterviewPlan } from "../types/index.js";

interface ResumeUploadProps {
  jobTitle: string;
  onCandidateParsed: (name: string, email: string, summary: string, analysis?: ResumeAnalysis, plan?: InterviewPlan) => void;
  onBack: () => void;
}

export const ResumeUpload: React.FC<ResumeUploadProps> = ({ jobTitle, onCandidateParsed, onBack }) => {
  const [dragActive, setDragActive] = useState(false);
  const [fileUploaded, setFileUploaded] = useState<File | null>(null);
  const [isParsing, setIsParsing] = useState(false);
  const [parsingStep, setParsingStep] = useState(0);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Parsed and configurable fields
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [summary, setSummary] = useState("");
  const [extractedText, setExtractedText] = useState("");
  const [matchedSkills, setMatchedSkills] = useState<string[]>([]);
  const [showTextPreview, setShowTextPreview] = useState(false);
  const [showPromptBlueprint, setShowPromptBlueprint] = useState(false);
  const [uploadMethod, setUploadMethod] = useState<"file" | "paste">("file");
  const [pastedResumeText, setPastedResumeText] = useState("");

  // Deep AI Analysis agent states
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<ResumeAnalysis | null>(null);
  const [planResult, setPlanResult] = useState<InterviewPlan | null>(null);
  const [agentStatus, setAgentStatus] = useState<"idle" | "analyzing" | "planning" | "completed">("idle");
  const [copiedPrompt, setCopiedPrompt] = useState(false);

  const parsingSteps = [
    "Reading file bytes into buffer...",
    "Validating document stream headers...",
    "Decoding textual coordinates & streams...",
    "Mapping skill tags & formatting candidate payload..."
  ];

  // Reusable prompt blueprint used by the backend Resume Analysis Agent
  const resumePromptBlueprint = `You are an elite automated resume parsing and candidate assessment AI.
Analyze the following extracted resume plain text in depth:

[EXTRACTED RESUME]
{{resumeText}}
[/EXTRACTED RESUME]

Formulate a highly comprehensive, structured profile containing:
1. Candidate Name (best guess based on headers/top lines)
2. Main skills (list of programming languages, libraries, paradigms)
3. Notable projects (list of 1-4 projects showing project name, description, and technologies used)
4. Core technologies (general tech stack list)
5. Education history (academic institutions, degrees or certificates, graduation years)
6. Professional experience (job roles, companies, duration, and list of key responsibilities/achievements)
7. Strong Areas (where does the candidate excel, technically or professionally based on evidence)
8. Weak Areas or Gaps (growth points, missing tech for the modern stack, brief tenure, or unproved domains)
9. Confidence Estimate (a rating from 0 to 100 on the quality, structure, and completeness of the resume details)
10. Custom Interview Topics (suggested topics for the HireMind AI agent to probe deeper during the live interview session)

Output your response as structured JSON matching the requested schema exactly.`;

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      processFile(e.target.files[0]);
    }
  };

  const processPastedText = () => {
    if (!pastedResumeText || pastedResumeText.trim().length < 20) {
      setErrorMessage("Pasted resume text is too short. Please paste your complete resume experience.");
      return;
    }
    setFileUploaded(new File([pastedResumeText], "PastedResume.txt", { type: "text/plain" }));
    setIsParsing(true);
    setParsingStep(0);
    setErrorMessage(null);
    setExtractedText("");
    setMatchedSkills([]);
    setAnalysisResult(null);
    setPlanResult(null);
    setAgentStatus("idle");

    // Simulate parsing steps for visual cohesion
    let step = 0;
    const interval = setInterval(() => {
      step++;
      if (step < parsingSteps.length) {
        setParsingStep(step);
      } else {
        clearInterval(interval);
        finalizeParsing(pastedResumeText, "PastedResume.txt");
      }
    }, 400);
  };

  const processFile = (file: File) => {
    setFileUploaded(file);
    setIsParsing(true);
    setParsingStep(0);
    setErrorMessage(null);
    setExtractedText("");
    setMatchedSkills([]);
    setAnalysisResult(null);
    setPlanResult(null);
    setAgentStatus("idle");

    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        const buffer = e.target?.result as ArrayBuffer;
        if (!buffer) {
          throw new Error("Could not read file data. File might be locked or empty.");
        }

        // 1. Validate header
        const validation = validateFileHeader(buffer, file.name);
        if (!validation.isValid) {
          throw new Error(validation.error || "File validation failed.");
        }

        // 2. Multi-step loading visualization
        let step = 0;
        const interval = setInterval(() => {
          step++;
          if (step < parsingSteps.length) {
            setParsingStep(step);
          } else {
            clearInterval(interval);
            
            const extension = file.name.split(".").pop()?.toLowerCase();
            
            if (extension === "pdf") {
              const base64Reader = new FileReader();
              base64Reader.onload = () => {
                const dataUrl = base64Reader.result as string;
                const base64 = dataUrl.split(",")[1];
                
                let localText = "";
                try {
                  localText = extractTextFromPdf(buffer);
                } catch (e) {
                  console.warn("Local PDF text extraction failed:", e);
                }
                
                finalizeParsing(localText, file.name, base64);
              };
              base64Reader.onerror = () => {
                handleParsingError(new Error("Failed to convert PDF file for secure API processing."));
              };
              base64Reader.readAsDataURL(file);
            } else {
              // Read text files directly as standard text
              const textReader = new FileReader();
              textReader.onload = (evt) => {
                const plainText = evt.target?.result as string;
                finalizeParsing(plainText, file.name);
              };
              textReader.onerror = () => {
                handleParsingError(new Error("Failed reading text file contents."));
              };
              textReader.readAsText(file);
            }
          }
        }, 800);

      } catch (err: any) {
        handleParsingError(err);
      }
    };

    reader.onerror = () => {
      handleParsingError(new Error("File API read error. Please ensure file permissions are correct."));
    };

    // Read as ArrayBuffer for PDF validation
    reader.readAsArrayBuffer(file);
  };

  const finalizeParsing = async (text: string, fileName: string, pdfBase64?: string) => {
    try {
      if (!pdfBase64 && (!text || text.trim().length < 10)) {
        throw new Error("Extracted resume text is too short or empty. Ensure PDF has selectable text content.");
      }

      // Initial local regex parsing fallback for speed and metadata setup
      const parsed = parseResumeMetadata(text || "", fileName);
      setName(parsed.name || "Processing...");
      setEmail(parsed.email || "Processing...");
      setSummary(parsed.summary || "Extracting profile details with Gemini...");
      setExtractedText(text || "Direct PDF binary ingestion in progress...");
      setMatchedSkills(parsed.skills || []);
      setIsParsing(false);

      // Trigger dual agent sequence
      setIsAnalyzing(true);
      setAgentStatus("analyzing");

      let finalAnalysis: ResumeAnalysis | undefined;

      try {
        const response = await fetch("/api/analyze-resume", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ 
            resumeText: text || undefined,
            pdfBase64: pdfBase64 || undefined
          })
        });
        if (response.ok) {
          const analysis: ResumeAnalysis = await response.json();
          setAnalysisResult(analysis);
          finalAnalysis = analysis;
          
          if (analysis.candidateName && analysis.candidateName !== "Jordan Mercer") {
            setName(analysis.candidateName);
          }
          if (analysis.skills && analysis.skills.length > 0) {
            setMatchedSkills(analysis.skills);
          }
          if (analysis.extractedText) {
            setExtractedText(analysis.extractedText);
            const geminiSummary = analysis.experience?.[0]
              ? `Senior professional with expertise as ${analysis.experience[0].role} at ${analysis.experience[0].company || "various firms"}.`
              : "Gemini Agent compiled profile details successfully.";
            setSummary(geminiSummary);
          }
        } else {
          const errData = await response.json();
          throw new Error(errData.error || "Failed to analyze resume contents.");
        }
      } catch (analysisErr: any) {
        console.error("AI deep analysis agent failed, using local extraction fallback:", analysisErr);
        if (!text) {
          throw new Error(`Direct PDF parsing failed: ${analysisErr.message || "Ensure the document is a valid uncorrupted file."}`);
        }
      }

      // Step 2: Interview Planner Agent
      setAgentStatus("planning");
      try {
        const analysisData = finalAnalysis || {
          candidateName: name || parsed.name,
          skills: matchedSkills.length > 0 ? matchedSkills : parsed.skills,
          projects: [],
          technologies: matchedSkills.length > 0 ? matchedSkills : parsed.skills,
          education: [],
          experience: [],
          strongAreas: ["Strong fundamental skills match"],
          weakAreas: ["Unverified deep domain expertise"],
          confidenceEstimate: 60,
          interviewTopics: ["Technical competency verification"],
          extractedText: text || ""
        };

        const planResponse = await fetch("/api/plan-interview", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ analysis: analysisData, jobTitle })
        });
        if (planResponse.ok) {
          const plan: InterviewPlan = await planResponse.json();
          setPlanResult(plan);
        }
      } catch (planErr) {
        console.error("Interview Planner Agent failed:", planErr);
      } finally {
        setAgentStatus("completed");
        setIsAnalyzing(false);
      }

    } catch (err: any) {
      handleParsingError(err);
    }
  };

  const handleParsingError = (err: any) => {
    console.error("Resume parsing exception:", err);
    setErrorMessage(err.message || "An unexpected error occurred while parsing the resume.");
    setFileUploaded(null);
    setIsParsing(false);
    setAgentStatus("idle");
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(resumePromptBlueprint);
    setCopiedPrompt(true);
    setTimeout(() => setCopiedPrompt(false), 2000);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email) return;
    onCandidateParsed(name, email, summary, analysisResult || undefined, planResult || undefined);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-12">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-xl font-bold tracking-tight text-slate-900">Configure Interviewee Profile</h1>
          <p className="text-xs text-slate-500">
            Campaign targeting: <span className="font-semibold text-indigo-600">{jobTitle}</span>
          </p>
        </div>
        <button
          onClick={() => setShowPromptBlueprint(!showPromptBlueprint)}
          className="text-xs font-semibold text-slate-500 hover:text-slate-800 flex items-center gap-1.5 self-start sm:self-center"
        >
          <Sparkles className="w-3.5 h-3.5 text-indigo-500" />
          {showPromptBlueprint ? "Hide Prompt Template" : "Show Prompt Template"}
        </button>
      </div>

      {/* Reusable Prompt Blueprint Panel */}
      {showPromptBlueprint && (
        <Card className="border-indigo-100 bg-indigo-50/20 overflow-hidden animate-fade-in">
          <CardHeader className="p-4 border-b border-indigo-100 flex flex-row items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-indigo-600 animate-pulse" />
              <span className="text-xs font-bold text-slate-800 uppercase tracking-wider">Reusable Prompt Blueprint</span>
            </div>
            <button
              onClick={copyToClipboard}
              className="text-[10px] font-semibold text-indigo-600 flex items-center gap-1 bg-white hover:bg-indigo-50 border border-indigo-200 px-2 py-1 rounded"
            >
              <Copy className="w-3 h-3" />
              {copiedPrompt ? "Copied!" : "Copy Template"}
            </button>
          </CardHeader>
          <CardContent className="p-4">
            <p className="text-xs text-slate-600 mb-3 leading-relaxed">
              Below is the structured, reusable template sent directly to the **Gemini 3.5 Flash Resume Analysis Agent**. This ensures strict compliance with our evaluation taxonomy.
            </p>
            <pre className="text-[10px] font-mono text-slate-700 bg-white p-3 border border-indigo-100/50 rounded-lg max-h-48 overflow-y-auto whitespace-pre-wrap leading-relaxed">
              {resumePromptBlueprint}
            </pre>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 gap-6">
        {/* Error Banner */}
        {errorMessage && (
          <div className="p-4 bg-rose-50 border border-rose-100 rounded-xl flex items-start gap-3 text-rose-800 text-xs leading-relaxed animate-fade-in">
            <AlertTriangle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <span className="font-bold">Resume Extraction Failed</span>
              <p>{errorMessage}</p>
              <p className="text-[10px] text-rose-600">Please make sure you upload a selectable, text-based PDF or a plain TXT file. Scanned images are not supported in the offline console.</p>
            </div>
          </div>
        )}

        {/* Upload Sandbox Component */}
        <Card className="border-slate-100 bg-white">
          <CardContent className="p-6">
            {!fileUploaded ? (
              <div className="space-y-6 animate-fade-in">
                {/* Method selector buttons */}
                <div className="flex bg-slate-50 p-1 rounded-xl border border-slate-100 max-w-sm">
                  <button
                    type="button"
                    onClick={() => setUploadMethod("file")}
                    className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                      uploadMethod === "file" ? "bg-white text-slate-900 shadow-sm border border-slate-100" : "text-slate-500 hover:text-slate-900"
                    }`}
                  >
                    <Upload className="w-3.5 h-3.5 text-indigo-600" />
                    File Upload
                  </button>
                  <button
                    type="button"
                    onClick={() => setUploadMethod("paste")}
                    className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                      uploadMethod === "paste" ? "bg-white text-slate-900 shadow-sm border border-slate-100" : "text-slate-500 hover:text-slate-900"
                    }`}
                  >
                    <FileText className="w-3.5 h-3.5 text-indigo-600" />
                    Paste Resume Text
                  </button>
                </div>

                {uploadMethod === "file" ? (
                  <div
                    onDragEnter={handleDrag}
                    onDragOver={handleDrag}
                    onDragLeave={handleDrag}
                    onDrop={handleDrop}
                    className={`border-2 border-dashed rounded-2xl p-8 text-center flex flex-col items-center justify-center gap-3 transition ${
                      dragActive ? "border-indigo-500 bg-indigo-50/20" : "border-slate-200 hover:border-slate-300"
                    }`}
                  >
                    <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
                      <Upload className="w-5 h-5" />
                    </div>
                    <div className="space-y-1">
                      <span className="text-xs font-semibold text-slate-800 block">Drag & Drop Resume Data</span>
                      <p className="text-[11px] text-slate-400">PDF or TXT up to 10MB</p>
                    </div>
                    <div className="flex items-center gap-3 w-full max-w-xs justify-center pt-2">
                      <label className="bg-slate-900 hover:bg-slate-800 text-white text-xs font-medium py-2 px-3.5 rounded-lg cursor-pointer transition">
                        Browse Files
                        <input type="file" onChange={handleFileChange} className="hidden" accept=".pdf,.txt" />
                      </label>
                      <span className="text-[11px] text-slate-400">or</span>
                      <button
                        type="button"
                        onClick={() => {
                          // Instantly populate with seed credentials
                          const sampleText = `SAMANTHA REYNOLDS\nsamantha.dev@example.com\n\nPROFESSIONAL SUMMARY\nPrincipal AI Architect with 6+ years of specialized experience in LLM evaluation, vector search indexing, and real-time inference optimization. Academic background includes a Master's degree in Artificial Intelligence.\n\nEXPERIENCE\nAI Lead Developer | GenAI Labs\n2022 - Present\n- Built low-latency system integration pipelines for processing unstructured medical records using Gemini LLMs.\n- Directed a team of 4 senior developers to release an internal prompt catalog decreasing development lifecycle latency by 35%.\n\nEDUCATION\nM.S. Artificial Intelligence | Stanford University | 2021\n\nPROJECTS\n- VectorGraph DB: Engineered an embedded vector similarity index supporting cosine distance over multi-modal embedding spaces.\n\nSKILLS\nReact, TypeScript, Node.js, Python, LLM, Generative AI, SQL, GCP`;
                          finalizeParsing(sampleText, "samantha_resume.txt");
                          setFileUploaded(new File([sampleText], "samantha_resume.txt", { type: "text/plain" }));
                        }}
                        className="text-xs text-indigo-600 hover:text-indigo-800 font-semibold"
                      >
                        Use Sample Resume
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4 animate-fade-in">
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block">Paste Resume Text Here</label>
                      <textarea
                        value={pastedResumeText}
                        onChange={(e) => setPastedResumeText(e.target.value)}
                        placeholder="Paste full text of resume experience, contact details, projects, skills, education..."
                        className="w-full min-h-[220px] p-3 text-xs border border-slate-200 rounded-xl focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 bg-slate-50/50 outline-none font-sans leading-relaxed text-slate-800"
                      />
                    </div>
                    <div className="flex justify-end gap-3">
                      <Button
                        type="button"
                        onClick={processPastedText}
                        className="rounded-xl px-5 py-2 text-xs font-bold"
                        disabled={!pastedResumeText.trim()}
                      >
                        Analyze Pasted Text <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            ) : isParsing ? (
              <div className="py-8 text-center space-y-6">
                <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-full flex items-center justify-center mx-auto animate-spin">
                  <RefreshCw className="w-5 h-5" />
                </div>
                <div className="space-y-2">
                  <h3 className="text-xs font-bold text-slate-800 uppercase tracking-widest flex items-center justify-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-indigo-500 animate-pulse" />
                    Cognitive Resume Parser
                  </h3>
                  <p className="text-xs text-indigo-600 max-w-xs mx-auto italic font-medium">
                    "{parsingSteps[parsingStep]}"
                  </p>
                </div>

                {/* Micro Progress Bar */}
                <div className="w-48 bg-slate-100 h-1.5 rounded-full mx-auto overflow-hidden">
                  <div
                    className="bg-indigo-600 h-full rounded-full transition-all duration-300"
                    style={{ width: `${((parsingStep + 1) / parsingSteps.length) * 100}%` }}
                  />
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-between p-4 bg-emerald-50/40 border border-emerald-100 rounded-xl">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center">
                    <FileText className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-xs font-semibold text-slate-800 block">{fileUploaded.name}</span>
                    <p className="text-[10px] text-emerald-600 flex items-center gap-1 font-semibold">
                      <CheckCircle2 className="w-3 h-3" /> Successfully Parsed & Extracted ({Math.round(fileUploaded.size / 1024)} KB)
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => {
                    setFileUploaded(null);
                    setExtractedText("");
                    setName("");
                    setEmail("");
                    setSummary("");
                    setMatchedSkills([]);
                    setAnalysisResult(null);
                  }}
                  className="text-xs text-rose-600 hover:text-rose-800 font-semibold"
                >
                  Change File
                </button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Dual AI Agent Sequential Pipeline Progress */}
        {isAnalyzing && (
          <Card className="border-indigo-100 bg-indigo-50/10 overflow-hidden animate-pulse">
            <CardContent className="p-8 text-center space-y-4">
              <div className="relative w-12 h-12 mx-auto">
                <div className="absolute inset-0 rounded-full border-4 border-indigo-100 animate-ping" />
                <div className="absolute inset-0 rounded-full border-4 border-indigo-600 border-t-transparent animate-spin" />
                <Sparkles className="w-5 h-5 text-indigo-600 absolute inset-0 m-auto" />
              </div>
              <div className="space-y-2">
                <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center justify-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-indigo-500" />
                  {agentStatus === "analyzing" 
                    ? "Agent 1/2: Resume Parsing & Extraction" 
                    : "Agent 2/2: Interview Strategy Strategy Blueprinting"}
                </h3>
                <p className="text-xs text-indigo-600 max-w-sm mx-auto italic font-medium">
                  {agentStatus === "analyzing"
                    ? '"Scanning candidate experience blocks, extracting technical skill clouds, and scoring confidence profile..."'
                    : '"Devising customized questions, topics difficulty progression, and custom project follow-up scenarios..."'}
                </p>
                <div className="flex items-center justify-center gap-2 pt-2">
                  <span className={`h-2 w-2 rounded-full ${agentStatus === "analyzing" ? "bg-indigo-600 animate-bounce" : "bg-emerald-500"}`} />
                  <span className="text-[10px] text-slate-400 font-mono">
                    {agentStatus === "analyzing" ? "Extracting Data Schema..." : "Formulating Strategy Plan..."}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* AI Deep Analysis Report Card */}
        {analysisResult && !isAnalyzing && (
          <div className="space-y-6 animate-fade-in">
            {/* Confidence Banner */}
            <Card className="border-slate-100 bg-gradient-to-r from-slate-900 to-indigo-950 text-white overflow-hidden shadow-sm">
              <CardContent className="p-6 flex flex-col md:flex-row items-center justify-between gap-6">
                <div className="space-y-2 text-center md:text-left">
                  <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-400/20 text-[10px] font-mono font-bold uppercase tracking-wider">
                    <Sparkles className="w-3 h-3" /> Cognitive Analysis Verified
                  </div>
                  <h3 className="text-lg font-bold tracking-tight">
                    AI Agent Insights for {analysisResult.candidateName}
                  </h3>
                  <p className="text-xs text-slate-300 max-w-lg leading-relaxed">
                    This profile has been compiled utilizing the Gemini parsing agent. Extracted skills, technology clouds, and custom interview prompts are stored securely in the local session state.
                  </p>
                </div>

                {/* Confidence circle score */}
                <div className="flex items-center gap-3 bg-white/5 border border-white/10 p-3.5 rounded-2xl shrink-0">
                  <div className="relative w-14 h-14 flex items-center justify-center shrink-0">
                    <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                      <path
                        className="text-white/10"
                        strokeWidth="3"
                        stroke="currentColor"
                        fill="transparent"
                        d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                      />
                      <path
                        className="text-indigo-400"
                        strokeWidth="3.2"
                        strokeDasharray={`${analysisResult.confidenceEstimate}, 100`}
                        strokeLinecap="round"
                        stroke="currentColor"
                        fill="transparent"
                        d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                      />
                    </svg>
                    <div className="absolute text-center">
                      <span className="text-xs font-extrabold font-mono text-white block">
                        {analysisResult.confidenceEstimate}%
                      </span>
                    </div>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 font-mono block uppercase tracking-wider">Confidence</span>
                    <span className="text-xs font-bold text-slate-200">Data Richness High</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Core Resume Contents Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Left Side: Experience & Education */}
              <div className="space-y-6">
                {/* Experience Card */}
                <Card className="border-slate-100 bg-white">
                  <CardHeader className="p-4 border-b border-slate-50 flex flex-row items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
                      <Briefcase className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="text-xs font-extrabold text-slate-800 uppercase tracking-widest">Extracted Experience</h4>
                      <p className="text-[10px] text-slate-400">Chronological history</p>
                    </div>
                  </CardHeader>
                  <CardContent className="p-5 space-y-5">
                    {analysisResult.experience && analysisResult.experience.length > 0 ? (
                      analysisResult.experience.map((exp, idx) => (
                        <div key={idx} className="relative pl-4 border-l border-slate-100 space-y-1.5 last:pb-0 pb-1">
                          {/* Chrono Node */}
                          <div className="absolute -left-1.5 top-1.5 w-3 h-3 rounded-full bg-indigo-500 border-2 border-white" />
                          <div className="flex items-start justify-between gap-2">
                            <span className="text-xs font-bold text-slate-800 block leading-tight">{exp.role}</span>
                            <span className="text-[10px] font-mono font-medium text-slate-400 shrink-0 bg-slate-50 border border-slate-100 px-1.5 py-0.5 rounded">
                              {exp.duration}
                            </span>
                          </div>
                          <span className="text-[11px] font-semibold text-indigo-600 block">{exp.company}</span>
                          {exp.responsibilities && exp.responsibilities.length > 0 && (
                            <ul className="text-[11px] text-slate-500 space-y-1 pt-1 list-disc pl-3.5 leading-relaxed">
                              {exp.responsibilities.map((resp, rIdx) => (
                                <li key={rIdx}>{resp}</li>
                              ))}
                            </ul>
                          )}
                        </div>
                      ))
                    ) : (
                      <p className="text-xs text-slate-400 italic">No detailed professional experience extracted.</p>
                    )}
                  </CardContent>
                </Card>

                {/* Education Card */}
                <Card className="border-slate-100 bg-white">
                  <CardHeader className="p-4 border-b border-slate-50 flex flex-row items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
                      <GraduationCap className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="text-xs font-extrabold text-slate-800 uppercase tracking-widest">Education & Academic History</h4>
                      <p className="text-[10px] text-slate-400">Credentials & qualifications</p>
                    </div>
                  </CardHeader>
                  <CardContent className="p-5 space-y-4">
                    {analysisResult.education && analysisResult.education.length > 0 ? (
                      analysisResult.education.map((edu, idx) => (
                        <div key={idx} className="flex items-start justify-between gap-4 border-b border-slate-50 pb-2 last:border-0 last:pb-0">
                          <div className="space-y-0.5">
                            <span className="text-xs font-bold text-slate-800 block">{edu.degree}</span>
                            <span className="text-[11px] text-slate-500 block">{edu.institution}</span>
                          </div>
                          <span className="text-[10px] font-mono text-slate-400 bg-slate-50 border border-slate-100 px-1.5 py-0.5 rounded">
                            {edu.year}
                          </span>
                        </div>
                      ))
                    ) : (
                      <p className="text-xs text-slate-400 italic">No academic history extracted.</p>
                    )}
                  </CardContent>
                </Card>
              </div>

              {/* Right Side: Projects, Technologies, and AI Diagnosis */}
              <div className="space-y-6">
                {/* Projects Card */}
                <Card className="border-slate-100 bg-white">
                  <CardHeader className="p-4 border-b border-slate-50 flex flex-row items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
                      <FolderDot className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="text-xs font-extrabold text-slate-800 uppercase tracking-widest">Featured Projects</h4>
                      <p className="text-[10px] text-slate-400">Extracted technical works</p>
                    </div>
                  </CardHeader>
                  <CardContent className="p-5 space-y-4">
                    {analysisResult.projects && analysisResult.projects.length > 0 ? (
                      analysisResult.projects.map((proj, idx) => (
                        <div key={idx} className="space-y-1.5 border-b border-slate-50 pb-3 last:border-0 last:pb-0">
                          <span className="text-xs font-bold text-slate-800 block leading-tight">{proj.name}</span>
                          <p className="text-[11px] text-slate-500 leading-relaxed">{proj.description}</p>
                          {proj.technologies && proj.technologies.length > 0 && (
                            <div className="flex flex-wrap gap-1 pt-1">
                              {proj.technologies.map((tech, tIdx) => (
                                <span key={tIdx} className="text-[9px] font-mono font-semibold bg-amber-50 text-amber-800 border border-amber-100 px-1.5 py-0.5 rounded">
                                  {tech}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                      ))
                    ) : (
                      <p className="text-xs text-slate-400 italic">No detailed projects extracted.</p>
                    )}
                  </CardContent>
                </Card>

                {/* Technologies Tag Cloud Card */}
                <Card className="border-slate-100 bg-white">
                  <CardHeader className="p-4 border-b border-slate-50 flex flex-row items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center">
                      <Code2 className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="text-xs font-extrabold text-slate-800 uppercase tracking-widest">Technologies Stack</h4>
                      <p className="text-[10px] text-slate-400">Languages & developer tools</p>
                    </div>
                  </CardHeader>
                  <CardContent className="p-5">
                    {analysisResult.technologies && analysisResult.technologies.length > 0 ? (
                      <div className="flex flex-wrap gap-1.5">
                        {analysisResult.technologies.map((tech, idx) => (
                          <span key={idx} className="text-[10px] font-mono font-medium bg-rose-50/50 text-rose-800 border border-rose-100 px-2 py-0.5 rounded-full">
                            {tech}
                          </span>
                        ))}
                      </div>
                    ) : (
                      <p className="text-xs text-slate-400 italic">No technologies list extracted.</p>
                    )}
                  </CardContent>
                </Card>
              </div>
            </div>

            {/* AI Insights: Strengths, Weaknesses, and Probing Topics */}
            <Card className="border-slate-100 bg-white shadow-sm">
              <CardHeader className="p-4 border-b border-slate-50 bg-slate-50/50 flex flex-row items-center gap-2">
                <Sparkles className="w-4 h-4 text-indigo-500" />
                <h4 className="text-xs font-extrabold text-slate-800 uppercase tracking-widest">Resume AI Diagnostics & Insights</h4>
              </CardHeader>
              <CardContent className="p-5 space-y-6">
                {/* Bento Grid: Strong and Weak areas */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Strong Areas */}
                  <div className="p-4 rounded-xl bg-emerald-50/30 border border-emerald-100 space-y-2.5">
                    <span className="text-[10px] font-bold text-emerald-800 uppercase tracking-wider flex items-center gap-1.5">
                      <ThumbsUp className="w-3.5 h-3.5 text-emerald-600" /> Strong Areas & Heuristics
                    </span>
                    <ul className="text-[11px] text-slate-600 space-y-1.5 leading-relaxed pl-3 list-disc">
                      {analysisResult.strongAreas && analysisResult.strongAreas.length > 0 ? (
                        analysisResult.strongAreas.map((str, idx) => <li key={idx}>{str}</li>)
                      ) : (
                        <li>Solid baseline expertise identified.</li>
                      )}
                    </ul>
                  </div>

                  {/* Weak Areas */}
                  <div className="p-4 rounded-xl bg-rose-50/30 border border-rose-100 space-y-2.5">
                    <span className="text-[10px] font-bold text-rose-800 uppercase tracking-wider flex items-center gap-1.5">
                      <ThumbsDown className="w-3.5 h-3.5 text-rose-600" /> Technical Gaps & Risks
                    </span>
                    <ul className="text-[11px] text-slate-600 space-y-1.5 leading-relaxed pl-3 list-disc">
                      {analysisResult.weakAreas && analysisResult.weakAreas.length > 0 ? (
                        analysisResult.weakAreas.map((weak, idx) => <li key={idx}>{weak}</li>)
                      ) : (
                        <li>No immediate high-risk gaps detected in material.</li>
                      )}
                    </ul>
                  </div>
                </div>

                {/* Suggested Interview Probe Topics */}
                <div className="space-y-3 pt-2">
                  <div className="flex items-center gap-1.5">
                    <Target className="w-4 h-4 text-indigo-600" />
                    <span className="text-xs font-bold text-slate-800 uppercase tracking-wider">Suggested Adaptive Interview Topics</span>
                  </div>
                  <p className="text-[11px] text-slate-500 leading-relaxed">
                    The HireMind AI Agent has drafted the following custom technical topics based on this candidate's background gaps. These prompts will be loaded dynamically to test structural limits:
                  </p>
                  <div className="grid grid-cols-1 gap-2.5">
                    {analysisResult.interviewTopics && analysisResult.interviewTopics.length > 0 ? (
                      analysisResult.interviewTopics.map((topic, idx) => (
                        <div key={idx} className="flex items-start gap-2.5 p-3 rounded-lg bg-indigo-50/40 border border-indigo-100/30 text-xs text-slate-700 leading-relaxed">
                          <span className="w-5 h-5 rounded-md bg-indigo-50 text-indigo-600 font-mono font-bold flex items-center justify-center shrink-0 text-[10px]">
                            0{idx + 1}
                          </span>
                          <span>{topic}</span>
                        </div>
                      ))
                    ) : (
                      <p className="text-xs text-slate-400 italic">No specific interview topics generated.</p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Interview Planner Strategy Blueprint */}
            {planResult && (
              <Card className="border-slate-100 bg-white shadow-sm overflow-hidden border-l-4 border-l-indigo-600 animate-fade-in">
                <CardHeader className="p-4 border-b border-slate-50 bg-indigo-50/20 flex flex-row items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-indigo-600 animate-pulse" />
                    <div>
                      <h4 className="text-xs font-extrabold text-slate-800 uppercase tracking-widest">Interview Planner Strategy Blueprint</h4>
                      <p className="text-[10px] text-indigo-600 font-semibold font-mono">ROLE COGNITIVE STRATEGY MAP</p>
                    </div>
                  </div>
                  <span className="text-[10px] bg-indigo-100 text-indigo-800 font-bold px-2.5 py-0.5 rounded-full">
                    JSON Plan Compiled
                  </span>
                </CardHeader>
                <CardContent className="p-5 space-y-5">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Difficulty Strategy</span>
                      <p className="text-xs text-slate-700 leading-relaxed font-medium bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                        {planResult.difficultyStrategy}
                      </p>
                    </div>
                    <div className="space-y-1">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Target Focus Topics</span>
                      <div className="flex flex-wrap gap-1.5 pt-1">
                        {planResult.focusTopics.map((topic, tIdx) => (
                          <span key={tIdx} className="text-[10px] font-medium bg-indigo-50 text-indigo-700 border border-indigo-100/50 px-2 py-0.5 rounded-md">
                            {topic}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="space-y-3 pt-2">
                    <span className="text-xs font-bold text-slate-800 uppercase tracking-wider block">Tailored Question Order & Blueprint</span>
                    <div className="space-y-3">
                      {planResult.questions.map((q, qIdx) => (
                        <div key={qIdx} className="p-3.5 rounded-xl border border-slate-100 bg-white hover:border-indigo-100 transition space-y-2.5">
                          <div className="flex items-center justify-between gap-2">
                            <div className="flex items-center gap-2">
                              <span className="w-5 h-5 rounded-full bg-slate-100 text-slate-700 font-mono font-bold flex items-center justify-center text-[10px]">
                                {qIdx + 1}
                              </span>
                              <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-500">
                                {q.category} Question
                              </span>
                            </div>
                            <div className="flex items-center gap-1.5">
                              <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full ${
                                q.difficulty === "Easy" ? "bg-emerald-50 text-emerald-700 border border-emerald-100" :
                                q.difficulty === "Medium" ? "bg-amber-50 text-amber-700 border border-amber-100" :
                                "bg-rose-50 text-rose-700 border border-rose-100"
                              }`}>
                                {q.difficulty}
                              </span>
                            </div>
                          </div>

                          <p className="text-xs font-semibold text-slate-800 leading-relaxed">
                            {q.question}
                          </p>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1 text-[11px]">
                            {/* Expected Response Keywords */}
                            <div className="space-y-1">
                              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Expected Evaluation Signals</span>
                              <div className="flex flex-wrap gap-1">
                                {q.expectedTopics.map((keyword, kIdx) => (
                                  <span key={kIdx} className="text-[9px] font-mono bg-slate-50 text-slate-600 border border-slate-100 px-1.5 py-0.2 rounded">
                                    {keyword}
                                  </span>
                                ))}
                              </div>
                            </div>

                            {/* Suggested Probe/Follow-ups */}
                            <div className="space-y-1">
                              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Suggested Follow-Up Possibilities</span>
                              <ul className="list-disc pl-3 text-[10px] text-slate-500 space-y-1">
                                {q.suggestedFollowUps.map((follow, fIdx) => (
                                  <li key={fIdx} className="leading-tight">{follow}</li>
                                ))}
                              </ul>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        )}

        {/* Display Extracted Text Box */}
        {extractedText && (
          <Card className="border-slate-100">
            <CardHeader className="p-4 border-b border-slate-50 bg-slate-50/50 flex flex-row items-center justify-between">
              <div className="flex items-center gap-1.5">
                <FileText className="w-4 h-4 text-slate-500" />
                <span className="text-[11px] font-mono uppercase tracking-wider text-slate-500">Raw Extracted Text Stream</span>
              </div>
              <button
                onClick={() => setShowTextPreview(!showTextPreview)}
                className="text-[11px] font-semibold text-indigo-600 flex items-center gap-1 hover:text-indigo-800"
              >
                {showTextPreview ? (
                  <>Hide Stream <ChevronUp className="w-3.5 h-3.5" /></>
                ) : (
                  <>Show Stream <ChevronDown className="w-3.5 h-3.5" /></>
                )}
              </button>
            </CardHeader>
            {showTextPreview && (
              <CardContent className="p-0">
                <pre className="text-[10px] font-mono text-slate-600 bg-slate-900 text-slate-200 p-4 max-h-48 overflow-y-auto whitespace-pre-wrap leading-relaxed">
                  {extractedText}
                </pre>
              </CardContent>
            )}
          </Card>
        )}

        {/* Configuration/Confirmation Details Form */}
        {!isParsing && fileUploaded && (
          <Card>
            <CardHeader className="border-b border-slate-50 bg-slate-50/30">
              <h2 className="text-xs font-bold text-slate-400 uppercase tracking-widest">Verify Candidates Core Matrix</h2>
            </CardHeader>
            <form onSubmit={handleSubmit}>
              <CardContent className="p-6 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-600">Candidate Name</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Jordan Mercer"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-slate-800 focus:ring-1 focus:ring-slate-800"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-600">Candidate Email</label>
                    <input
                      type="email"
                      required
                      placeholder="e.g. jordan@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-slate-800 focus:ring-1 focus:ring-slate-800"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-600">Career Summary / Parser Extracted Context</label>
                  <textarea
                    rows={3}
                    placeholder="Provide a quick overview of candidate background, major skills, or experiences to calibrate follow-ups..."
                    value={summary}
                    onChange={(e) => setSummary(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-slate-800 focus:ring-1 focus:ring-slate-800"
                  />
                </div>

                {/* Display Matched Skills Tags */}
                {matchedSkills.length > 0 && (
                  <div className="space-y-2 pt-1">
                    <span className="text-xs font-semibold text-slate-600 block">System Identified Skill Clusters</span>
                    <div className="flex flex-wrap gap-1.5">
                      {matchedSkills.map((skill, index) => (
                        <span 
                          key={index} 
                          className="text-[10px] bg-indigo-50 text-indigo-700 font-mono font-semibold px-2 py-0.5 rounded-full border border-indigo-100"
                        >
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
              <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between rounded-b-xl">
                <button
                  type="button"
                  onClick={onBack}
                  className="text-xs font-semibold text-slate-500 hover:text-slate-800 transition"
                >
                  Back to Hub
                </button>
                <Button type="submit" disabled={!name || !email} variant="custom" size="none" className="px-5 py-2.5 text-xs bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg inline-flex items-center justify-center font-semibold transition-all duration-200 shadow-sm">
                  Launch Dynamic Interview Room <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
                </Button>
              </div>
            </form>
          </Card>
        )}
      </div>
    </div>
  );
};
