"use client";

import { useRouter } from "next/navigation";
import { useRef, useState } from "react";
import { DashboardLayout, Protected } from "@/components/app-shell";
import { DecisionInputCard, ProgressStepper } from "@/components/ui";
import { clearPendingDecision, getPendingDecision } from "@/lib/pending-decision";
import { getCurrentProfile, getSessionUser } from "@/lib/supabase-auth";
import { createDecisionRecord, updateDecisionRecord } from "@/lib/supabase-decisions";

type SpeechRecognitionLike = {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  start: () => void;
  stop: () => void;
  onresult: ((event: SpeechRecognitionEventLike) => void) | null;
  onerror: (() => void) | null;
  onend: (() => void) | null;
};

type SpeechRecognitionEventLike = {
  results: ArrayLike<ArrayLike<{ transcript: string }>>;
};

export default function NewDecisionPage() {
  const router = useRouter();
  const [situation, setSituation] = useState(() => {
    if (typeof window === "undefined") return "";
    const search = new URLSearchParams(window.location.search);
    return search.get("prefill") ?? getPendingDecision();
  });
  const [isRecording, setIsRecording] = useState(false);
  const [speechError, setSpeechError] = useState("");
  const [error, setError] = useState("");
  const [analyzing, setAnalyzing] = useState(false);
  const recognitionRef = useRef<SpeechRecognitionLike | null>(null);

  const toggleRecording = () => {
    const speechApi =
      (window as Window & { SpeechRecognition?: new () => SpeechRecognitionLike })
        .SpeechRecognition ??
      (window as Window & { webkitSpeechRecognition?: new () => SpeechRecognitionLike })
        .webkitSpeechRecognition;

    if (!speechApi) {
      setSpeechError("Voice input is not supported in this browser yet.");
      return;
    }

    if (!recognitionRef.current) {
      const recognition = new speechApi();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = "en-US";
      recognition.onresult = (event) => {
        let transcript = "";
        for (let i = 0; i < event.results.length; i += 1) {
          transcript += event.results[i][0]?.transcript ?? "";
        }
        setSituation(transcript.trim());
      };
      recognition.onerror = () => {
        setSpeechError("Could not capture voice. Please try again.");
        setIsRecording(false);
      };
      recognition.onend = () => setIsRecording(false);
      recognitionRef.current = recognition;
    }

    const recognition = recognitionRef.current;
    if (!recognition) return;

    recognition.onresult = (event) => {
      let transcript = "";
      for (let i = 0; i < event.results.length; i += 1) {
        transcript += event.results[i][0]?.transcript ?? "";
      }
      setSituation(transcript.trim());
    };

    if (isRecording) {
      recognition.stop();
      setIsRecording(false);
      return;
    }

    setSpeechError("");
    recognition.start();
    setIsRecording(true);
  };

  const getDecisionTitleFromSituation = (text: string) => {
    const cleaned = text.replace(/\s+/g, " ").trim();
    if (!cleaned) return "Untitled decision";
    const firstSentence = cleaned.split(/[.!?]/)[0]?.trim() ?? cleaned;
    const baseTitle = firstSentence || cleaned;
    const shortFromWords = baseTitle.split(" ").filter(Boolean).slice(0, 8).join(" ");
    const compactTitle = shortFromWords || baseTitle;
    return compactTitle.length > 48 ? `${compactTitle.slice(0, 45)}...` : compactTitle;
  };

  return (
    <Protected>
      <DashboardLayout>
        <div className="space-y-5">
          <h1 className="text-2xl font-black text-slate-900">New Decision</h1>
          <ProgressStepper step={1} />
          <DecisionInputCard>
            <div className="space-y-3">
              <div className="relative">
                <textarea className="min-h-40 w-full rounded-xl border px-3 py-2 pr-12" value={situation} onChange={(e) => setSituation(e.target.value)} placeholder="Explain what’s happening. Include pressure, fears, and what decision you are stuck on." />
                <button
                  type="button"
                  aria-label={isRecording ? "Stop voice input" : "Start voice input"}
                  title={isRecording ? "Stop voice input" : "Start voice input"}
                  className={`absolute right-3 top-3 rounded-full p-2 transition ${
                    isRecording
                      ? "bg-red-500 text-white"
                      : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                  }`}
                  onClick={toggleRecording}
                >
                  <svg viewBox="0 0 24 24" className="h-4 w-4" fill="currentColor" aria-hidden="true">
                    <path d="M12 14a3 3 0 0 0 3-3V6a3 3 0 1 0-6 0v5a3 3 0 0 0 3 3Zm-1 5.93V17.9a7 7 0 0 1-6-6.9h2a5 5 0 1 0 10 0h2a7 7 0 0 1-6 6.9v2.03h4v2H7v-2h4Z" />
                  </svg>
                </button>
              </div>
              <p className="text-xs text-slate-500">
                Tap the mic inside the box to talk instead of typing.
              </p>
              {speechError ? <p className="text-sm text-amber-700">{speechError}</p> : null}
              {error ? <p className="text-sm text-red-600">{error}</p> : null}
              <button
                className="w-full rounded-xl bg-gradient-to-r from-blue-600 to-violet-600 px-4 py-3 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-60"
                disabled={analyzing}
                onClick={async () => {
                  const user = await getSessionUser();
                  const profile = await getCurrentProfile();
                  const cleanedSituation = situation.trim();
                  if (!user || !profile || cleanedSituation.length < 15) {
                    setError("Add a clear explanation to continue.");
                    return;
                  }
                  const derivedTitle = getDecisionTitleFromSituation(cleanedSituation);
                  setError("");
                  setAnalyzing(true);
                  try {
                    const record = await createDecisionRecord({
                      userId: user.id,
                      title: derivedTitle,
                      mode: "single",
                      decisionText: cleanedSituation,
                    });
                    clearPendingDecision();

                    const controller = new AbortController();
                    const timer = setTimeout(() => controller.abort(), 20000);
                    const response = await fetch("/api/ai/report", {
                      method: "POST",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify({
                        title: record.title,
                        mode: record.mode,
                        decisionText: record.decisionText,
                        options: [record.optionA, record.optionB, record.optionC].filter(Boolean),
                        mainGoal: record.mainGoal,
                        urgency: record.urgency,
                        leaning: record.leaning,
                        answers: {},
                      }),
                      signal: controller.signal,
                    });
                    clearTimeout(timer);
                    const data = (await response.json()) as { report?: NonNullable<typeof record.result> };
                    const report = data.report;
                    if (!report) {
                      setError("Could not generate report. Please try again.");
                      return;
                    }

                    await updateDecisionRecord(record.id, profile.id, {
                      ...record,
                      followUpQuestions: [],
                      followUpAnswers: {},
                      result: report,
                      confidenceScore: report.confidence_score,
                      riskLevel: report.risk_level,
                    });

                    if (profile.subscription_status !== "active") {
                      router.push(`/paywall?id=${record.id}`);
                      return;
                    }
                    router.push(`/result/${record.id}`);
                  } catch {
                    setError("Analysis took too long. Please try again.");
                  } finally {
                    setAnalyzing(false);
                  }
                }}
              >
                {analyzing ? "Analyzing..." : "Analyze Decision"}
              </button>
            </div>
          </DecisionInputCard>
        </div>
      </DashboardLayout>
    </Protected>
  );
}
