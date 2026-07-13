import express from "express";
import path from "path";
import dotenv from "dotenv";
import { createServer as createViteServer } from "vite";
import { getNextInterviewTurn, evaluateInterview, analyzeResume, planInterview, evaluateCurrentAnswer, makeAutonomousDecision, generateHiringRecommendation } from "./src/server/gemini.js";
import { JobRole, InterviewSession, ChatMessage, CompetencyLevel } from "./src/types/index.js";
import { AgentOrchestrator } from "./src/server/orchestrator.js";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json({ limit: "20mb" }));
app.use(express.urlencoded({ limit: "20mb", extended: true }));

// In-memory data store seeded with high-quality job campaign templates
let jobRoles: JobRole[] = [
  {
    id: "job-1",
    title: "Senior Full-Stack AI Engineer",
    department: "Engineering",
    description: "Looking for an engineer to architect our next-generation AI agent framework. Experienced in Node.js/TypeScript, React/Vite, and LLM orchestration (specifically Gemini API).",
    experienceLevel: CompetencyLevel.SENIOR,
    competencies: [
      {
        name: "Full-Stack System Architecture",
        description: "Designs robust, maintainable multi-tier web applications with secure server-side logic.",
        level: CompetencyLevel.SENIOR,
      },
      {
        name: "AI & LLM Integration",
        description: "Expertise in prompt engineering, function calling, structured schemas, and context management.",
        level: CompetencyLevel.SENIOR,
      },
      {
        name: "TypeScript Proficiency",
        description: "Strong type definitions, modular modules, and modern asynchronous execution.",
        level: CompetencyLevel.SENIOR,
      },
    ],
    customQuestions: [
      "Can you describe a time you took a complex generative AI model from a prototype to a secure, server-side production app?",
      "How do you approach managing state or handling latency (like chunk streams) when building chatbot UI modules?",
      "What is your strategy for optimizing context windows and prompt schemas when conducting complex multi-step analysis?"
    ],
    createdAt: new Date().toISOString(),
  },
  {
    id: "job-2",
    title: "Lead AI Product Manager",
    department: "Product Management",
    description: "Responsible for driving product definition and design for automated AI interview and evaluations modules, working alongside engineering.",
    experienceLevel: CompetencyLevel.LEAD,
    competencies: [
      {
        name: "Product Strategy & Vision",
        description: "Articulates clear user personas, market opportunities, and defines release milestones.",
        level: CompetencyLevel.LEAD,
      },
      {
        name: "Metrics-Driven Analysis",
        description: "Establishes structured product metrics to track candidate completion rates and score accuracy.",
        level: CompetencyLevel.MID,
      },
    ],
    customQuestions: [
      "How do you design feedback loops to ensure AI output matches human HR standards of consistency?",
      "Describe how you prioritize technical debt against rapid market feature requests when building AI features."
    ],
    createdAt: new Date().toISOString(),
  }
];

let interviewSessions: InterviewSession[] = [];

// ==================== API ENDPOINTS ====================

// Retrieve all jobs
app.get("/api/jobs", (req, res) => {
  res.json(jobRoles);
});

// Add a new job position
app.post("/api/jobs", (req, res) => {
  const { title, department, description, experienceLevel, competencies, customQuestions } = req.body;
  
  if (!title || !description || !competencies || competencies.length === 0) {
    res.status(400).json({ error: "Missing required fields (title, description, competencies)" });
    return;
  }

  const newJob: JobRole = {
    id: `job-${Date.now()}`,
    title,
    department,
    description,
    experienceLevel,
    competencies,
    customQuestions: customQuestions || [],
    createdAt: new Date().toISOString()
  };

  jobRoles.push(newJob);
  res.status(201).json(newJob);
});

// Start an interview session
app.post("/api/interviews/start", (req, res) => {
  const { jobId, candidateName, candidateEmail, experienceSummary, analysis, plan } = req.body;

  if (!jobId || !candidateName || !candidateEmail) {
    res.status(400).json({ error: "Missing required starting configurations" });
    return;
  }

  const job = jobRoles.find((j) => j.id === jobId);
  if (!job) {
    res.status(404).json({ error: "Configured Job Role not found" });
    return;
  }

  const firstQuestion = plan && plan.questions && plan.questions.length > 0
    ? plan.questions[0].question
    : (job.customQuestions && job.customQuestions.length > 0
        ? job.customQuestions[0]
        : "Could you introduce yourself and highlight your core relevant experience for this role?");

  const welcomeMessage: ChatMessage = {
    id: `msg-welcome`,
    sender: "agent",
    text: `Hello ${candidateName}! Welcome to your automated evaluation with HireMind AI. I will be conducting a conversational interview today for the "${job.title}" position. Let's start with our first topic: \n\n${firstQuestion}`,
    timestamp: new Date().toISOString()
  };

  const newSession: InterviewSession = {
    id: `session-${Date.now()}`,
    jobId: job.id,
    jobTitle: job.title,
    candidate: {
      name: candidateName,
      email: candidateEmail,
      experienceSummary
    },
    messages: [welcomeMessage],
    currentQuestionIndex: 0,
    status: "ongoing",
    analysis: analysis || undefined,
    plan: plan || undefined,
    memory: [],
    orchestratorLogs: [],
    startedAt: new Date().toISOString()
  };

  interviewSessions.push(newSession);
  res.status(201).json(newSession);
});

// Analyze raw resume text or PDF binary using Gemini AI Agent
app.post("/api/analyze-resume", async (req, res) => {
  const { resumeText, pdfBase64 } = req.body;
  if (!resumeText && !pdfBase64) {
    res.status(400).json({ error: "Resume text content or PDF file is required" });
    return;
  }

  try {
    const { analysis } = await AgentOrchestrator.processResumeAnalysis(resumeText, pdfBase64);
    res.json(analysis);
  } catch (error) {
    console.error("Resume analysis failure:", error);
    res.status(500).json({ error: "Failed to perform AI resume analysis." });
  }
});

// Create complete interview plan using Gemini AI Agent based on resume analysis JSON
app.post("/api/plan-interview", async (req, res) => {
  const { analysis, jobTitle } = req.body;
  if (!analysis || !jobTitle) {
    res.status(400).json({ error: "Analysis JSON and target Job Title are required" });
    return;
  }

  try {
    const { plan } = await AgentOrchestrator.processInterviewPlan(analysis, jobTitle);
    res.json(plan);
  } catch (error) {
    console.error("Interview planner agent failure:", error);
    res.status(500).json({ error: "Failed to build the custom interview plan." });
  }
});

// Send an answer & get next turn (Adaptive Agent Logic)
app.post("/api/interviews/:id/respond", async (req, res) => {
  const { id } = req.params;
  const { text } = req.body;

  if (!text) {
    res.status(400).json({ error: "Response text is required" });
    return;
  }

  const session = interviewSessions.find((s) => s.id === id);
  if (!session) {
    res.status(404).json({ error: "Active session not found" });
    return;
  }

  const job = jobRoles.find((j) => j.id === session.jobId);
  if (!job) {
    res.status(404).json({ error: "Associated Job Role not found" });
    return;
  }

  try {
    const updatedSession = await AgentOrchestrator.orchestrateInterviewTurn(session, job, text);
    res.json({ session: updatedSession, shouldEnd: updatedSession.status === "completed" });
  } catch (err) {
    console.error("Orchestrated turn failed:", err);
    res.status(500).json({ error: "Failed to process interview turn via agent orchestrator." });
  }
});

// Evaluate a completed interview (Generate Report Card)
app.post("/api/interviews/:id/evaluate", async (req, res) => {
  const { id } = req.params;

  const session = interviewSessions.find((s) => s.id === id);
  if (!session) {
    res.status(404).json({ error: "Session not found" });
    return;
  }

  const job = jobRoles.find((j) => j.id === session.jobId);
  if (!job) {
    res.status(404).json({ error: "Associated Job Role not found" });
    return;
  }

  try {
    const updatedSession = await AgentOrchestrator.orchestrateFinalHiringRecommendation(session, job);
    res.json(updatedSession);
  } catch (error) {
    console.error("Evaluation failure:", error);
    res.status(500).json({ error: "Failed to generate AI evaluation report." });
  }
});

// Retrieve all interview sessions (dashboard feed)
app.get("/api/interviews", (req, res) => {
  res.json(interviewSessions);
});

// Retrieve single session details
app.get("/api/interviews/:id", (req, res) => {
  const session = interviewSessions.find((s) => s.id === req.params.id);
  if (!session) {
    res.status(404).json({ error: "Session not found" });
    return;
  }
  res.json(session);
});

// ==================== FRONTEND BINDING ====================

async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    // Mount Vite middleware for fast client asset rendering & hot reloading
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`HireMind AI Fullstack engine actively listening on http://localhost:${PORT}`);
  });
}

startServer();
