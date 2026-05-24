import { NextResponse } from "next/server";
import { createSupabaseAdminClient, createSupabaseServerClient } from "@/lib/supabase-server";
import { getAppUrl, getPolarClient, getPolarProductIdForPlan, isPolarPlan } from "@/lib/polar";

type CheckoutRequest = {
  plan?: string;
};

export async function POST(request: Request) {
  try {
    const authHeader = request.headers.get("authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Missing auth token." }, { status: 401 });
    }
    const accessToken = authHeader.slice("Bearer ".length);

    const supabase = createSupabaseServerClient();
    const { data, error } = await supabase.auth.getUser(accessToken);
    if (error || !data.user) {
      return NextResponse.json({ error: "Invalid session." }, { status: 401 });
    }

    // Ensure profile exists before checkout so webhook updates always have a row to update.
    const admin = createSupabaseAdminClient();
    const { error: profileError } = await admin
      .from("profiles" as never)
      .upsert(
        {
          id: data.user.id,
          email: data.user.email ?? "",
          full_name:
            (data.user.user_metadata?.full_name as string | undefined) ??
            (data.user.user_metadata?.name as string | undefined) ??
            null,
        } as never,
        { onConflict: "id" } as never,
      );
    if (profileError) {
      return NextResponse.json({ error: "Unable to prepare profile for checkout." }, { status: 500 });
    }

    const payload = (await request.json()) as CheckoutRequest;
    if (!payload.plan || !isPolarPlan(payload.plan)) {
      return NextResponse.json({ error: "Invalid plan selected." }, { status: 400 });
    }

    const productId = getPolarProductIdForPlan(payload.plan);
    const appUrl = getAppUrl();
    const polar = getPolarClient();

    const checkoutSession = await polar.checkouts.create({
      products: [productId],
      externalCustomerId: data.user.id,
      customerEmail: data.user.email ?? null,
      customerMetadata: {
        user_id: data.user.id,
      },
      metadata: {
        user_id: data.user.id,
        plan: payload.plan,
      },
      successUrl: `${appUrl}/dashboard?payment=success`,
      returnUrl: `${appUrl}/pricing`,
    });

    return NextResponse.json({ url: checkoutSession.url });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unable to start checkout.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

