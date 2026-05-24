import { Webhooks } from "@polar-sh/nextjs";
import { createSupabaseAdminClient } from "@/lib/supabase-server";
import type { SubscriptionStatus } from "@/lib/types";

type PolarEventData = Record<string, unknown>;

const toOptionalString = (value: unknown): string | null => {
  if (typeof value === "string" && value.trim()) return value.trim();
  if (typeof value === "number" && Number.isFinite(value)) return String(value);
  return null;
};

const getField = (source: unknown, key: string): unknown => {
  if (!source || typeof source !== "object") return undefined;
  return (source as Record<string, unknown>)[key];
};

const extractUserId = (data: PolarEventData): string | null =>
  toOptionalString(getField(getField(data, "customer"), "external_id")) ??
  toOptionalString(getField(getField(data, "customer"), "externalId")) ??
  toOptionalString(getField(data, "customer_external_id")) ??
  toOptionalString(getField(data, "customerExternalId")) ??
  toOptionalString(getField(data, "external_customer_id")) ??
  toOptionalString(getField(data, "externalCustomerId")) ??
  toOptionalString(getField(getField(data, "metadata"), "user_id")) ??
  toOptionalString(getField(getField(data, "checkout"), "metadata") && getField(getField(getField(data, "checkout"), "metadata"), "user_id")) ??
  toOptionalString(getField(getField(getField(data, "customer"), "metadata"), "user_id"));

const extractCustomerEmail = (data: PolarEventData): string | null =>
  toOptionalString(getField(getField(data, "customer"), "email")) ??
  toOptionalString(getField(data, "customer_email")) ??
  toOptionalString(getField(data, "customerEmail")) ??
  toOptionalString(getField(data, "email"));

const extractCustomerId = (data: PolarEventData): string | null =>
  toOptionalString(getField(data, "customer_id")) ??
  toOptionalString(getField(data, "customerId")) ??
  toOptionalString(getField(data, "id"));

const extractSubscriptionId = (data: PolarEventData): string | null =>
  toOptionalString(getField(data, "subscription_id")) ??
  toOptionalString(getField(data, "subscriptionId")) ??
  toOptionalString(getField(getField(data, "subscription"), "id")) ??
  toOptionalString(getField(data, "id"));

const extractProductId = (data: PolarEventData): string | null =>
  toOptionalString(getField(data, "product_id")) ??
  toOptionalString(getField(data, "productId")) ??
  toOptionalString(getField(getField(data, "product"), "id")) ??
  toOptionalString(getField(getField(getField(data, "subscription"), "product"), "id"));

const extractSubscriptionStatus = (data: PolarEventData): string | null =>
  toOptionalString(getField(data, "status")) ??
  toOptionalString(getField(getField(data, "subscription"), "status"));

const extractCurrentPeriodEndIso = (data: PolarEventData): string | null => {
  const raw =
    getField(data, "current_period_end") ??
    getField(data, "currentPeriodEnd") ??
    getField(getField(data, "subscription"), "current_period_end") ??
    getField(getField(data, "subscription"), "currentPeriodEnd");

  if (raw instanceof Date) return raw.toISOString();
  const asString = toOptionalString(raw);
  if (!asString) return null;
  const parsed = new Date(asString);
  return Number.isNaN(parsed.getTime()) ? null : parsed.toISOString();
};

const resolveProfileId = async (input: {
  userId?: string | null;
  polarCustomerId?: string | null;
  email?: string | null;
}) => {
  const admin = createSupabaseAdminClient();

  if (input.userId) {
    const { data, error } = await admin
      .from("profiles" as never)
      .select("id")
      .eq("id", input.userId)
      .maybeSingle();
    if (error) throw error;
    if (data) return (data as { id: string }).id;
  }

  if (input.polarCustomerId) {
    const { data, error } = await admin
      .from("profiles" as never)
      .select("id")
      .eq("polar_customer_id", input.polarCustomerId)
      .maybeSingle();
    if (error) throw error;
    if (data) return (data as { id: string }).id;
  }

  if (input.email) {
    const loweredEmail = input.email.toLowerCase();
    const { data, error } = await admin
      .from("profiles" as never)
      .select("id")
      .ilike("email", loweredEmail)
      .maybeSingle();
    if (error) throw error;
    if (data) return (data as { id: string }).id;
  }

  return null;
};

const bindPolarCustomerToProfile = async (input: {
  polarCustomerId: string;
  userId?: string | null;
  email?: string | null;
}) => {
  const profileId = await resolveProfileId({
    userId: input.userId,
    polarCustomerId: input.polarCustomerId,
    email: input.email,
  });
  if (!profileId) return;

  const admin = createSupabaseAdminClient();
  const { error } = await admin
    .from("profiles" as never)
    .update(
      {
        payment_provider: "polar",
        polar_customer_id: input.polarCustomerId,
      } as never,
    )
    .eq("id", profileId);
  if (error) throw error;
};

const updateProfileByUserId = async (
  userId: string,
  patch: {
    subscription_status: SubscriptionStatus;
    payment_provider: string;
    polar_customer_id?: string | null;
    polar_subscription_id?: string | null;
    polar_product_id?: string | null;
    current_period_end?: string | null;
  },
) => {
  const admin = createSupabaseAdminClient();
  const { error, data } = await admin
    .from("profiles" as never)
    .update(patch as never)
    .select("id, subscription_status")
    .eq("id", userId);
  console.log("[polar-webhook] Supabase update result", { userId, data });
  if (error) {
    console.error("[polar-webhook] Supabase update error", { userId, error: error.message });
    throw error;
  }
};

const applySubscriptionState = async (data: PolarEventData, status: SubscriptionStatus) => {
  const detectedUserId = extractUserId(data);
  const detectedCustomerId = extractCustomerId(data);
  const detectedEmail = extractCustomerEmail(data);
  const detectedSubscriptionStatus = extractSubscriptionStatus(data);
  console.log("[polar-webhook] subscription event", {
    payloadDataId: toOptionalString(getField(data, "id")),
    detectedUserId,
    detectedCustomerId,
    detectedEmail,
    detectedSubscriptionStatus,
  });

  const profileId = await resolveProfileId({
    userId: detectedUserId,
    polarCustomerId: detectedCustomerId,
    email: detectedEmail,
  });
  if (!profileId) {
    console.warn("[polar-webhook] profile not found for subscription event", {
      detectedUserId,
      detectedCustomerId,
      detectedEmail,
    });
    return;
  }

  const patch = {
    subscription_status: status,
    payment_provider: "polar",
    polar_customer_id: detectedCustomerId,
    polar_subscription_id: extractSubscriptionId(data),
    polar_product_id: extractProductId(data),
    current_period_end: extractCurrentPeriodEndIso(data),
  };

  await updateProfileByUserId(profileId, patch);
};

const isFutureDate = (date: Date | null | undefined) => {
  if (!date) return false;
  return date.getTime() > Date.now();
};

const handleOrderPaid = async (data: PolarEventData) => {
  const subscriptionId = extractSubscriptionId(data);
  if (!subscriptionId) return;
  const detectedUserId = extractUserId(data);
  const detectedCustomerId = extractCustomerId(data);
  const detectedEmail = extractCustomerEmail(data);
  const detectedSubscriptionStatus = extractSubscriptionStatus(data);
  console.log("[polar-webhook] order.paid", {
    payloadDataId: toOptionalString(getField(data, "id")),
    detectedUserId,
    detectedCustomerId,
    detectedEmail,
    detectedSubscriptionStatus,
  });

  const profileId = await resolveProfileId({
    userId: detectedUserId,
    polarCustomerId: detectedCustomerId,
    email: detectedEmail,
  });
  if (!profileId) {
    console.warn("[polar-webhook] profile not found for order.paid", {
      detectedUserId,
      detectedCustomerId,
      detectedEmail,
    });
    return;
  }

  const patch = {
    subscription_status: "active" as SubscriptionStatus,
    payment_provider: "polar",
    polar_customer_id: detectedCustomerId,
    polar_subscription_id: subscriptionId,
    polar_product_id: extractProductId(data),
    current_period_end: extractCurrentPeriodEndIso(data),
  };

  await updateProfileByUserId(profileId, patch);
};

export const POST = Webhooks({
  webhookSecret: process.env.POLAR_WEBHOOK_SECRET ?? "",
  onPayload: async (payload) => {
    console.log("[polar-webhook] payload", {
      type: payload.type,
      payloadDataId: toOptionalString(getField(payload.data as PolarEventData, "id")),
    });
  },
  onCustomerCreated: async (payload) => {
    await bindPolarCustomerToProfile({
      polarCustomerId: payload.data.id,
      userId: toOptionalString(payload.data.externalId),
      email: toOptionalString(payload.data.email),
    });
  },
  onCustomerUpdated: async (payload) => {
    await bindPolarCustomerToProfile({
      polarCustomerId: payload.data.id,
      userId: toOptionalString(payload.data.externalId),
      email: toOptionalString(payload.data.email),
    });
  },
  onSubscriptionCreated: async (payload) => {
    const status = extractSubscriptionStatus(payload.data as PolarEventData);
    if (status === "active") {
      await applySubscriptionState(payload.data as PolarEventData, "active");
    }
  },
  onSubscriptionActive: async (payload) => {
    await applySubscriptionState(payload.data as PolarEventData, "active");
  },
  onSubscriptionUpdated: async (payload) => {
    const status = extractSubscriptionStatus(payload.data as PolarEventData);
    if (status === "active") {
      await applySubscriptionState(payload.data as PolarEventData, "active");
      return;
    }
    if (
      status === "past_due" ||
      status === "unpaid" ||
      status === "canceled" ||
      status === "revoked"
    ) {
      await applySubscriptionState(payload.data as PolarEventData, "inactive");
    }
  },
  onSubscriptionCanceled: async (payload) => {
    const currentPeriodEndIso = extractCurrentPeriodEndIso(payload.data as PolarEventData);
    const hasAccess = currentPeriodEndIso ? isFutureDate(new Date(currentPeriodEndIso)) : false;
    await applySubscriptionState(payload.data as PolarEventData, hasAccess ? "active" : "inactive");
  },
  onSubscriptionRevoked: async (payload) => {
    const currentPeriodEndIso = extractCurrentPeriodEndIso(payload.data as PolarEventData);
    const hasAccess = currentPeriodEndIso ? isFutureDate(new Date(currentPeriodEndIso)) : false;
    await applySubscriptionState(payload.data as PolarEventData, hasAccess ? "active" : "inactive");
  },
  onOrderPaid: async (payload) => {
    await handleOrderPaid(payload.data as PolarEventData);
  },
});

