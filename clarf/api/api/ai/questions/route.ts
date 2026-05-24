import { NextResponse } from "next/server";
import { generateFallbackQuestions, generateQuestions } from "@/lib/decision-engine";
import { enforceRateLimit, getRateLimitKey } from "@/lib/api-rate-limit";

const withTimeout = async <T,>(promise: Promise<T>, timeoutMs: number): Promise<T> => {
  let timer: ReturnType<typeof setTimeout> | null = null;
  const timeoutPromise = new Promise<T>((_, reject) => {
    timer = setTimeout(() => reject(new Error("Route timeout")), timeoutMs);
  });
  try {
    return await Promise.race([promise, timeoutPromise]);
  } finally {
    if (timer) clearTimeout(timer);
  }
};

export async function POST(request: Request) {
  const rateLimit = enforceRateLimit({
    key: getRateLimitKey(request, "ai-questions"),
    limit: 20,
    windowMs: 10 * 60 * 1000,
  });
  if (!rateLimit.ok) {
    const retryAfterSeconds = Math.max(
      1,
      Math.ceil((rateLimit.resetAt - Date.now()) / 1000),
    );
    return NextResponse.json(
      { error: "Too many question requests. Please wait a moment and try again." },
      {
        status: 429,
        headers: {
          "Retry-After": String(retryAfterSeconds),
        },
      },
    );
  }

  let payload: unknown;
  try {
    payload = await request.json();
    if (JSON.stringify(payload).length > 20_000) {
      return NextResponse.json(
        { error: "Request is too large. Please shorten your input and retry." },
        { status: 413 },
      );
    }
    const questions = await withTimeout(
      generateQuestions(payload as Parameters<typeof generateQuestions>[0]),
      12000,
    );
    return NextResponse.json(
      { questions },
      {
        headers: {
          "X-RateLimit-Remaining": String(rateLimit.remaining),
        },
      },
    );
  } catch {
    if (payload) {
      return NextResponse.json(
        {
          questions: generateFallbackQuestions(
            payload as Parameters<typeof generateFallbackQuestions>[0],
          ),
        },
        {
          headers: {
            "X-RateLimit-Remaining": String(rateLimit.remaining),
          },
        },
      );
    }
    return NextResponse.json({ error: "Something went wrong while generating questions." }, { status: 500 });
  }
}
