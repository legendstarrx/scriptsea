import { NextResponse } from "next/server";
import { generateReport } from "@/lib/decision-engine";
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
    key: getRateLimitKey(request, "ai-report"),
    limit: 12,
    windowMs: 10 * 60 * 1000,
  });
  if (!rateLimit.ok) {
    const retryAfterSeconds = Math.max(
      1,
      Math.ceil((rateLimit.resetAt - Date.now()) / 1000),
    );
    return NextResponse.json(
      { error: "Too many report requests. Please wait a moment and try again." },
      {
        status: 429,
        headers: {
          "Retry-After": String(retryAfterSeconds),
        },
      },
    );
  }

  try {
    const payload = await request.json();
    if (JSON.stringify(payload).length > 20_000) {
      return NextResponse.json(
        { error: "Request is too large. Please shorten your input and retry." },
        { status: 413 },
      );
    }
    const report = await withTimeout(generateReport(payload as Parameters<typeof generateReport>[0]), 18000);
    return NextResponse.json(
      { report },
      {
        headers: {
          "X-RateLimit-Remaining": String(rateLimit.remaining),
        },
      },
    );
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Something went wrong while generating your report.",
      },
      { status: 502 },
    );
  }
}
