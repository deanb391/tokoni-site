// lib/services/subscriptions.service.ts
import { ID, Query } from "node-appwrite";
import { databases } from "@/lib/appwrite/server";

const DATABASE_ID = process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID || "6a0b4741002e8ae14adc";
const VENDORS_COLLECTION = process.env.NEXT_PUBLIC_APPWRITE_VENDORS_COLLECTION || "vendor";
const PAYMENTS_COLLECTION = "tokoni_payments";
const SPONSORSHIPS_COLLECTION = "tokoni_sponsorships";
const PRODUCTS_COLLECTION = "product";
const POSTS_COLLECTION = "post";

// Pricing constants
export const SUBSCRIPTION_PRICE_NGN = 700;

export const SPONSORSHIP_PRICES = {
  day: 300,
  week: 1500,
  month: 5000,
};

export const INTERPLATFORM_PRICES = {
  day: 200,
  week: 500,
  month: 1000,
};

export const FREE_TIER_LIMITS = {
  products: 15,
  posts: 20,
};

export type PaymentStatus = "pending" | "successful" | "failed";
export type PaymentType = "subscription" | "sponsorship";
export type SponsorshipDuration = "day" | "week" | "month";

export interface TokoniPayment {
  $id: string;
  vendorId: string;
  amount: number;
  status: PaymentStatus;
  type: PaymentType;
  description: string;
  metadata?: string;
  $createdAt: string;
}

export interface TokoniSponsorship {
  $id: string;
  vendorId: string;
  productId: string;
  startDate: string;
  endDate: string;
  duration: SponsorshipDuration;
  interplatform: boolean;
  status: string;
  paymentId: string;
  $createdAt: string;
}

/**
 * Checks if a vendor is currently on Premium.
 * A vendor is premium if they are in their free trial OR have an active paid plan.
 */
export function isVendorPremium(vendor: {
  plan?: string;
  trialEndsAt?: string;
  planEndsAt?: string;
}): boolean {
  const now = new Date();

  // Check trial period
  if (vendor.trialEndsAt) {
    const trialEnd = new Date(vendor.trialEndsAt);
    if (now < trialEnd) return true;
  }

  // Check active paid plan
  if (vendor.plan === "premium" && vendor.planEndsAt) {
    const planEnd = new Date(vendor.planEndsAt);
    if (now < planEnd) return true;
  }

  return false;
}

/**
 * Get the number of products a vendor has created in the current calendar month
 */
export async function getVendorProductCountThisMonth(vendorId: string): Promise<number> {
  try {
    const now = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();

    const res = await databases.listDocuments(
      DATABASE_ID,
      PRODUCTS_COLLECTION,
      [
        Query.equal("vendor", vendorId),
        Query.greaterThanEqual("$createdAt", monthStart),
        Query.limit(100),
      ]
    );
    return res.total;
  } catch (err) {
    console.error("Error counting vendor products this month:", err);
    return 0;
  }
}

/**
 * Get the number of posts a vendor has created in the current calendar month
 */
export async function getVendorPostCountThisMonth(vendorId: string): Promise<number> {
  try {
    const now = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();

    const res = await databases.listDocuments(
      DATABASE_ID,
      POSTS_COLLECTION,
      [
        Query.equal("vendor", vendorId),
        Query.greaterThanEqual("$createdAt", monthStart),
        Query.limit(100),
      ]
    );
    return res.total;
  } catch (err) {
    console.error("Error counting vendor posts this month:", err);
    return 0;
  }
}

/**
 * Create a pending payment record
 */
export async function createPaymentRecord(params: {
  vendorId: string;
  amount: number;
  type: PaymentType;
  description: string;
  metadata?: Record<string, any>;
}): Promise<TokoniPayment> {
  const doc = await databases.createDocument(
    DATABASE_ID,
    PAYMENTS_COLLECTION,
    ID.unique(),
    {
      vendorId: params.vendorId,
      amount: params.amount,
      status: "pending",
      type: params.type,
      description: params.description,
      metadata: params.metadata ? JSON.stringify(params.metadata) : null,
    }
  );

  return {
    $id: doc.$id,
    vendorId: doc.vendorId,
    amount: doc.amount,
    status: doc.status,
    type: doc.type,
    description: doc.description,
    metadata: doc.metadata,
    $createdAt: doc.$createdAt,
  };
}

/**
 * Update payment status
 */
export async function updatePaymentStatus(
  paymentId: string,
  status: PaymentStatus
): Promise<void> {
  await databases.updateDocument(DATABASE_ID, PAYMENTS_COLLECTION, paymentId, {
    status,
  });
}

/**
 * Get a payment by ID
 */
export async function getPaymentById(paymentId: string): Promise<TokoniPayment | null> {
  try {
    const doc = await databases.getDocument(DATABASE_ID, PAYMENTS_COLLECTION, paymentId);
    return {
      $id: doc.$id,
      vendorId: doc.vendorId,
      amount: doc.amount,
      status: doc.status,
      type: doc.type,
      description: doc.description,
      metadata: doc.metadata,
      $createdAt: doc.$createdAt,
    };
  } catch {
    return null;
  }
}

/**
 * Get payment history for a vendor
 */
export async function getVendorPayments(vendorId: string, limit = 20): Promise<TokoniPayment[]> {
  try {
    const res = await databases.listDocuments(
      DATABASE_ID,
      PAYMENTS_COLLECTION,
      [Query.equal("vendorId", vendorId), Query.orderDesc("$createdAt"), Query.limit(limit)]
    );
    return res.documents.map((doc) => ({
      $id: doc.$id,
      vendorId: doc.vendorId,
      amount: doc.amount,
      status: doc.status,
      type: doc.type,
      description: doc.description,
      metadata: doc.metadata,
      $createdAt: doc.$createdAt,
    }));
  } catch (err) {
    console.error("Error fetching vendor payments:", err);
    return [];
  }
}

/**
 * Activate premium subscription after successful payment.
 * Extends from today (or existing planEndsAt if still valid) by 1 month.
 */
export async function activatePremiumPlan(vendorId: string): Promise<void> {
  const vendorDoc = await databases.getDocument(DATABASE_ID, VENDORS_COLLECTION, vendorId);
  const now = new Date();
  let base = now;

  // If the existing planEndsAt is still in the future, extend from there
  if (vendorDoc.planEndsAt) {
    const existing = new Date(vendorDoc.planEndsAt);
    if (existing > now) base = existing;
  }

  const newEnd = new Date(base);
  newEnd.setMonth(newEnd.getMonth() + 1);

  await databases.updateDocument(DATABASE_ID, VENDORS_COLLECTION, vendorId, {
    plan: "premium",
    planEndsAt: newEnd.toISOString(),
  });
}

/**
 * Create a sponsorship record after successful payment
 */
export async function createSponsorshipRecord(params: {
  vendorId: string;
  productId: string;
  duration: SponsorshipDuration;
  interplatform: boolean;
  paymentId: string;
}): Promise<TokoniSponsorship> {
  const now = new Date();
  const endDate = new Date(now);

  if (params.duration === "day") endDate.setDate(endDate.getDate() + 1);
  else if (params.duration === "week") endDate.setDate(endDate.getDate() + 7);
  else if (params.duration === "month") endDate.setMonth(endDate.getMonth() + 1);

  const doc = await databases.createDocument(
    DATABASE_ID,
    SPONSORSHIPS_COLLECTION,
    ID.unique(),
    {
      vendorId: params.vendorId,
      productId: params.productId,
      startDate: now.toISOString(),
      endDate: endDate.toISOString(),
      duration: params.duration,
      interplatform: params.interplatform,
      status: "active",
      paymentId: params.paymentId,
    }
  );

  return {
    $id: doc.$id,
    vendorId: doc.vendorId,
    productId: doc.productId,
    startDate: doc.startDate,
    endDate: doc.endDate,
    duration: doc.duration,
    interplatform: doc.interplatform,
    status: doc.status,
    paymentId: doc.paymentId,
    $createdAt: doc.$createdAt,
  };
}

/**
 * Calculate the total sponsorship price
 */
export function calculateSponsorshipPrice(params: {
  duration: SponsorshipDuration;
  interplatform: boolean;
  isPremium: boolean;
}): { base: number; interplatform: number; total: number; discount: number } {
  const base = SPONSORSHIP_PRICES[params.duration];
  const interplatformFee = params.interplatform ? INTERPLATFORM_PRICES[params.duration] : 0;

  // Premium vendors get 50% off the base sponsorship price only
  const discount = params.isPremium ? Math.floor(base * 0.5) : 0;
  const discountedBase = base - discount;

  return {
    base,
    interplatform: interplatformFee,
    total: discountedBase + interplatformFee,
    discount,
  };
}
