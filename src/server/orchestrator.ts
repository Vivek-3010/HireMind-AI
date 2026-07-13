import { 
  JobRole, 
  InterviewCandidate, 
  ChatMessage, 
  ResumeAnalysis, 
  InterviewPlan, 
  AnswerEvaluation, 
  DecisionLog, 
  HiringRecommendation, 
  OrchestratorLog, 
  InterviewSession 
} from "../types/index.js";
import { 
  analyzeResume, 
  planInterview, 
  getNextInterviewTurn, 
  evaluateCurrentAnswer, 
  makeAutonomousDecision, 
  extractMemoryFacts, 
  generateHiringRecommendation, 
  evaluateInterview 
} from "./gemini.js";

export class AgentOrchestrator {
  /**
   * Helper executor to run an agent task with single retry-on-failure policy, execution timing, and logging.
   */
  private static async executeWithRetry<T>(
    agentName: string,
    stepName: string,
    taskFn: () => Promise<T>,
    logs: OrchestratorLog[]
  ): Promise<T> {
    const startTime = Date.now();
    let retryAttempted = false;

    try {
      // First attempt
      const result = await taskFn();
      const duration = Date.now() - startTime;
      
      logs.push({
        timestamp: new Date().toISOString(),
        agentName,
        step: stepName,
        status: "success",
        retryAttempted: false,
        executionTimeMs: duration
      });

      return result;
    } catch (error: any) {
      console.warn(`[Orchestrator] ${agentName} failed on first attempt. Retrying once... Error:`, error.message || error);
      retryAttempted = true;

      const retryStartTime = Date.now();
      try {
        // Retry attempt (exactly once)
        const result = await taskFn();
        const duration = (Date.now() - startTime); // total duration including failed first attempt & delay
        
        logs.push({
          timestamp: new Date().toISOString(),
          agentName,
          step: stepName,
          status: "retried_success",
          retryAttempted: true,
          executionTimeMs: duration
        });

        return result;
      } catch (retryError: any) {
        console.warn(`[Orchestrator] ${agentName} failed on retry. Failing permanently. Error:`, retryError.message || retryError);
        const totalDuration = Date.now() - startTime;
        
        logs.push({
          timestamp: new Date().toISOString(),
          agentName,
          step: stepName,
          status: "retried_failed",
          error: retryError.message || String(retryError),
          retryAttempted: true,
          executionTimeMs: totalDuration
        });

        throw retryError;
      }
    }
  }

  /**
   * Pipeline Step 1 & 2: Resume Upload -> Resume Analysis Agent
   */
  public static async processResumeAnalysis(
    resumeText?: string,
    pdfBase64?: string,
    sessionLogs: OrchestratorLog[] = []
  ): Promise<{ analysis: ResumeAnalysis; logs: OrchestratorLog[] }> {
    const analysis = await this.executeWithRetry<ResumeAnalysis>(
      "Resume Analysis Agent",
      "Analyze raw candidate resume text",
      () => analyzeResume(resumeText, pdfBase64),
      sessionLogs
    );
    return { analysis, logs: sessionLogs };
  }

  /**
   * Pipeline Step 3: Interview Planner Agent
   */
  public static async processInterviewPlan(
    analysis: ResumeAnalysis,
    jobTitle: string,
    sessionLogs: OrchestratorLog[] = []
  ): Promise<{ plan: InterviewPlan; logs: OrchestratorLog[] }> {
    const plan = await this.executeWithRetry<InterviewPlan>(
      "Interview Planner Agent",
      "Generate custom competencies-focused interview questions",
      () => planInterview(analysis, jobTitle),
      sessionLogs
    );
    return { plan, logs: sessionLogs };
  }

  /**
   * Pipeline Step 4, 5, 6, 7 (Repeat loop for ongoing interview answers):
   * Conductor Agent -> Evaluation Agent -> Memory Agent -> Decision Agent -> Repeat
   */
  public static async orchestrateInterviewTurn(
    session: InterviewSession,
    job: JobRole,
    candidateAnswerText: string
  ): Promise<InterviewSession> {
    const logs: OrchestratorLog[] = session.orchestratorLogs || [];

    // --- PIPELINE STEP 4: INTERVIEW CONDUCTOR - CANDIDATE INPUT ADDITION ---
    // Extract the question candidate was answering
    const agentMessages = session.messages.filter(m => m.sender === "agent");
    const lastAgentQuestionText = agentMessages.length > 0 
      ? agentMessages[agentMessages.length - 1].text 
      : "Could you introduce yourself and highlight your core relevant experience for this role?";

    const candidateMsg: ChatMessage = {
      id: `msg-${Date.now()}-cand`,
      sender: "candidate",
      text: candidateAnswerText,
      timestamp: new Date().toISOString()
    };
    session.messages.push(candidateMsg);
    const currentQIndex = session.currentQuestionIndex;

    // --- PIPELINE STEP 5: EVALUATION AGENT ---
    let latestEvaluation: AnswerEvaluation | null = null;
    try {
      latestEvaluation = await this.executeWithRetry<AnswerEvaluation>(
        "Evaluation Agent",
        `Evaluate answer for Question #${currentQIndex + 1}`,
        () => evaluateCurrentAnswer(lastAgentQuestionText, candidateAnswerText, currentQIndex),
        logs
      );

      if (!session.answerEvaluations) {
        session.answerEvaluations = [];
      }
      session.answerEvaluations.push(latestEvaluation);
    } catch (err) {
      console.error("[Orchestrator] Evaluation Agent failed permanently in sequence:", err);
    }

    // --- PIPELINE STEP 6: MEMORY AGENT ---
    try {
      const updatedMemory = await this.executeWithRetry<string[]>(
        "Memory Agent",
        "Synthesize facts & claims into candidate memory context",
        () => extractMemoryFacts(session.messages, session.memory || []),
        logs
      );
      session.memory = updatedMemory;
    } catch (err) {
      console.error("[Orchestrator] Memory Agent failed permanently in sequence:", err);
    }

    // --- PIPELINE STEP 7: DECISION AGENT ---
    let latestDecision: any = null;
    if (latestEvaluation) {
      try {
        const decisionResult = await this.executeWithRetry<{ decision: any; reason: string; suggestedAction: string }>(
          "Decision Agent",
          `Autonomous decision-making loop for Question #${currentQIndex + 1}`,
          () => makeAutonomousDecision(session.messages, latestEvaluation!, session.plan, currentQIndex),
          logs
        );
        latestDecision = decisionResult;

        if (!session.decisionLogs) {
          session.decisionLogs = [];
        }
        session.decisionLogs.push({
          timestamp: new Date().toISOString(),
          questionIndex: currentQIndex,
          questionText: lastAgentQuestionText,
          evaluationScore: latestEvaluation.answerScore,
          decision: decisionResult.decision,
          reason: decisionResult.reason,
          suggestedAction: decisionResult.suggestedAction
        });
      } catch (err) {
        console.error("[Orchestrator] Decision Agent failed permanently in sequence:", err);
      }
    }

    // --- PIPELINE STEP 8: NEXT TURN PREPARATION (Conductor continuation) ---
    const hasPlan = !!(session.plan && session.plan.questions && session.plan.questions.length > 0);
    const totalQuestions = hasPlan ? session.plan!.questions.length : (job.customQuestions ? job.customQuestions.length : 0);

    let nextPlannedQuestion = "";
    if (hasPlan) {
      if (currentQIndex + 1 < totalQuestions) {
        nextPlannedQuestion = session.plan!.questions[currentQIndex + 1].question;
      } else {
        nextPlannedQuestion = "What unique contributions do you believe you can offer to this role, or do you have any final remarks for our evaluation team?";
      }
    } else {
      if (currentQIndex + 1 < totalQuestions) {
        nextPlannedQuestion = job.customQuestions![currentQIndex + 1];
      } else {
        nextPlannedQuestion = "What unique contributions do you believe you can offer to this role, or do you have any final remarks for our evaluation team?";
      }
    }

    try {
      const nextTurn = await this.executeWithRetry<{ text: string; isFollowUp: boolean; shouldEnd: boolean }>(
        "Interview Conductor Agent",
        "Generate adaptive next interview prompt",
        () => getNextInterviewTurn(
          job,
          session.candidate,
          session.messages,
          nextPlannedQuestion,
          session.plan,
          currentQIndex,
          latestDecision || undefined
        ),
        logs
      );

      // Advance core index only if not asking a drill-down follow-up question
      if (!nextTurn.isFollowUp && currentQIndex + 1 < totalQuestions) {
        session.currentQuestionIndex += 1;
      }

      const agentMsg: ChatMessage = {
        id: `msg-${Date.now()}-agent`,
        sender: "agent",
        text: nextTurn.text,
        timestamp: new Date().toISOString()
      };
      session.messages.push(agentMsg);

      const isLastQuestionReached = currentQIndex >= totalQuestions - 1;
      const shouldWrapUp = nextTurn.shouldEnd || (isLastQuestionReached && !nextTurn.isFollowUp) || session.messages.length > 20;

      if (shouldWrapUp) {
        session.status = "completed";
        session.completedAt = new Date().toISOString();
      }
    } catch (err) {
      console.error("[Orchestrator] Conductor Agent failed to generate next turn:", err);
      // Fallback response safely
      session.currentQuestionIndex += 1;
      const agentMsg: ChatMessage = {
        id: `msg-${Date.now()}-agent-fallback`,
        sender: "agent",
        text: "Thank you for that response. Let's move forward. Could you walk me through another major technical highlight from your engineering career?",
        timestamp: new Date().toISOString()
      };
      session.messages.push(agentMsg);
    }

    session.orchestratorLogs = logs;
    return session;
  }

  /**
   * Pipeline Step 9: Hiring Recommendation Agent + Wrap Up Evaluation
   */
  public static async orchestrateFinalHiringRecommendation(
    session: InterviewSession,
    job: JobRole
  ): Promise<InterviewSession> {
    const logs: OrchestratorLog[] = session.orchestratorLogs || [];

    // Run evaluations in sequence/parallel with retry wrappers
    try {
      const scorecard = await this.executeWithRetry<any>(
        "Evaluation Agent",
        "Perform comprehensive final transcript appraisal scorecard",
        () => evaluateInterview(job, session.candidate, session.messages),
        logs
      );

      const recommendation = await this.executeWithRetry<HiringRecommendation>(
        "Hiring Recommendation Agent",
        "Synthesize resume, evaluations, memory log and transcript for final score and recommendation JSON",
        () => generateHiringRecommendation(job, session.candidate, session.messages, session.analysis, session.answerEvaluations),
        logs
      );

      session.status = "evaluated";
      session.evaluation = {
        id: `eval-${Date.now()}`,
        ...scorecard
      };
      session.hiringRecommendation = recommendation;
    } catch (error) {
      console.error("[Orchestrator] Failed during final Hiring Recommendation Agent appraisal:", error);
      throw error;
    }

    session.orchestratorLogs = logs;
    return session;
  }
}
