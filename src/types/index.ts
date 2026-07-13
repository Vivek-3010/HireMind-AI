/**
 * HireMind AI - Core TypeScript Definitions
 * Clean Architecture - Domain Models
 */

export enum CompetencyLevel {
  ENTRY = "Entry",
  MID = "Mid",
  SENIOR = "Senior",
  LEAD = "Lead",
}

export interface CompetencyRequirement {
  name: string;
  description: string;
  level: CompetencyLevel;
}

export interface JobRole {
  id: string;
  title: string;
  department: string;
  description: string;
  competencies: CompetencyRequirement[];
  customQuestions?: string[];
  experienceLevel: CompetencyLevel;
  createdAt: string;
}

export interface InterviewCandidate {
  name: string;
  email: string;
  resumeUrl?: string;
  experienceSummary?: string;
}

export interface ChatMessage {
  id: string;
  sender: "agent" | "candidate";
  text: string;
  timestamp: string;
  audioUrl?: string; // Optional captured audio response
}

export interface SkillScore {
  skill: string;
  score: number; // 1 to 10 scale
  evidence: string; // Direct evidence from candidate answers
}

export interface InterviewEvaluation {
  id: string;
  candidateName: string;
  candidateEmail: string;
  jobTitle: string;
  overallScore: number; // Percentage
  recommendation: "STRONG_HIRE" | "HIRE" | "MAYBE" | "REJECT";
  summary: string;
  technicalSkills: SkillScore[];
  softSkills: SkillScore[];
  communicationScore: number;
  criticalThinkingScore: number;
  growthAreas: string[];
  keyStrengths: string[];
}

export interface ResumeProject {
  name: string;
  description: string;
  technologies: string[];
}

export interface ResumeEducation {
  institution: string;
  degree: string;
  year: string;
}

export interface ResumeExperience {
  role: string;
  company: string;
  duration: string;
  responsibilities: string[];
}

export interface ResumeAnalysis {
  candidateName: string;
  skills: string[];
  projects: ResumeProject[];
  technologies: string[];
  education: ResumeEducation[];
  experience: ResumeExperience[];
  strongAreas: string[];
  weakAreas: string[];
  confidenceEstimate: number; // 0 to 100
  interviewTopics: string[];
  extractedText?: string;
}

export interface InterviewQuestion {
  question: string;
  category: "behavioral" | "technical" | "project";
  expectedTopics: string[];
  suggestedFollowUps: string[];
  difficulty: "Easy" | "Medium" | "Hard";
}

export interface InterviewPlan {
  roleTitle: string;
  difficultyStrategy: string;
  focusTopics: string[];
  questions: InterviewQuestion[];
}

export interface AnswerEvaluation {
  questionIndex: number;
  questionText: string;
  candidateAnswer: string;
  technicalAccuracy: number; // 0 to 100
  confidence: number; // 0 to 100
  communication: number; // 0 to 100
  completeness: number; // 0 to 100
  practicalThinking: number; // 0 to 100
  answerScore: number; // 0 to 100
  reason: string;
  improvementSuggestion: string;
  nextDifficultyRecommendation: "Easy" | "Medium" | "Hard";
}

export interface HiringRecommendation {
  overallScore: number;
  technicalScore: number;
  communicationScore: number;
  problemSolvingScore: number;
  strengths: string[];
  weaknesses: string[];
  recommendedLearning: string[];
  hiringDecision: "Strong Hire" | "Hire" | "Borderline" | "Reject";
  reasoning: string;
}

export type DecisionAction = "Increase Difficulty" | "Decrease Difficulty" | "Change Topic" | "Ask Follow-up" | "Move to Next Skill";

export interface DecisionLog {
  timestamp: string;
  questionIndex: number;
  questionText: string;
  evaluationScore: number;
  decision: DecisionAction;
  reason: string;
  suggestedAction: string;
}

export interface OrchestratorLog {
  timestamp: string;
  agentName: string;
  step: string;
  status: "success" | "failed" | "retried_success" | "retried_failed";
  error?: string;
  retryAttempted: boolean;
  executionTimeMs: number;
}

export interface InterviewSession {
  id: string;
  jobId: string;
  jobTitle: string;
  candidate: InterviewCandidate;
  messages: ChatMessage[];
  currentQuestionIndex: number;
  status: "pending" | "ongoing" | "completed" | "evaluated";
  evaluation?: InterviewEvaluation;
  analysis?: ResumeAnalysis; // Stored resume analysis
  plan?: InterviewPlan; // Stored AI-generated Interview Plan
  answerEvaluations?: AnswerEvaluation[]; // Stored evaluations per answer
  decisionLogs?: DecisionLog[]; // Stored autonomous decisions made by Decision Agent
  hiringRecommendation?: HiringRecommendation; // Stored autonomous Hiring Recommendation Agent report
  memory?: string[]; // Stored key facts extracted by the Memory Agent
  orchestratorLogs?: OrchestratorLog[]; // Audit trail log entries from the Agent Orchestrator
  startedAt: string;
  completedAt?: string;
}
