import { useState, useEffect, useRef } from "react";
import { InterviewSession, ChatMessage } from "../types/index.js";

export function useInterview() {
  const [session, setSession] = useState<InterviewSession | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [duration, setDuration] = useState<number>(0);
  
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Active call duration counter
  useEffect(() => {
    if (session && session.status === "ongoing") {
      timerRef.current = setInterval(() => {
        setDuration((prev) => prev + 1);
      }, 1000);
    } else {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [session?.status]);

  // Starts the interview campaign for a candidate
  const startSession = async (
    jobId: string,
    candidateName: string,
    candidateEmail: string,
    experienceSummary: string,
    analysis?: any,
    plan?: any
  ) => {
    setIsLoading(true);
    setError(null);
    setDuration(0);

    try {
      const response = await fetch("/api/interviews/start", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ jobId, candidateName, candidateEmail, experienceSummary, analysis, plan }),
      });

      if (!response.ok) {
        throw new Error("Could not initialize interview session. Please try again.");
      }

      const data: InterviewSession = await response.json();
      setSession(data);
    } catch (err: any) {
      setError(err.message || "Something went wrong.");
    } finally {
      setIsLoading(false);
    }
  };

  // Submits a text answer, returning an adaptive AI response
  const submitAnswer = async (text: string) => {
    if (!session) return;
    setIsAnalyzing(true);
    setError(null);

    // Optimistically update candidate message in client state
    const optimisticCandidateMsg: ChatMessage = {
      id: `msg-${Date.now()}-cand`,
      sender: "candidate",
      text,
      timestamp: new Date().toISOString()
    };

    setSession((prev) => {
      if (!prev) return null;
      return {
        ...prev,
        messages: [...prev.messages, optimisticCandidateMsg]
      };
    });

    try {
      const response = await fetch(`/api/interviews/${session.id}/respond`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text }),
      });

      if (!response.ok) {
        throw new Error("Failed to receive feedback from the AI Hiring Agent.");
      }

      const data: { session: InterviewSession; shouldEnd: boolean } = await response.json();
      setSession(data.session);
    } catch (err: any) {
      setError(err.message || "Failed to process message.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Triggers the heavy scoring and evaluation pipeline once completed
  const triggerEvaluation = async () => {
    if (!session) return;
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/interviews/${session.id}/evaluate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });

      if (!response.ok) {
        throw new Error("Failed to finalize AI assessment.");
      }

      const updatedSession: InterviewSession = await response.json();
      setSession(updatedSession);
    } catch (err: any) {
      setError(err.message || "Failed to generate interview report.");
    } finally {
      setIsLoading(false);
    }
  };

  const resetSession = () => {
    setSession(null);
    setDuration(0);
    setError(null);
  };

  return {
    session,
    isLoading,
    isAnalyzing,
    error,
    duration,
    startSession,
    submitAnswer,
    triggerEvaluation,
    resetSession,
  };
}
