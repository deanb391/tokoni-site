// app/api/payments/verify/route.ts
import { NextRequest, NextResponse } from "next/server";
import { verifyFlutterwaveTransaction } from "@/lib/services/flutterwave.service";
import {
  getPaymentById,
  updatePaymentStatus,
  activatePremiumPlan,
  createSponsorshipRecord,
  SponsorshipDuration,
} from "@/lib/services/subscriptions.service";
import { databases } from "@/lib/appwrite/server";

const DATABASE_ID = process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID || "6a0b4741002e8ae14adc";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const paymentId = searchParams.get("paymentId");
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";

  if (!paymentId) {
    return NextResponse.redirect(`${baseUrl}/payment/failed?type=unknown&from=dashboard`);
  }

  try {
    const payment = await getPaymentById(paymentId);
    if (!payment) {
      return NextResponse.redirect(`${baseUrl}/payment/failed?type=unknown&from=dashboard`);
    }

    const metadata = payment.metadata ? JSON.parse(payment.metadata) : {};
    const type = payment.type;
    const productId = metadata?.productId || "";

    // Prevent double-processing
    if (payment.status === "successful") {
      if (type === "subscription") {
        return NextResponse.redirect(`${baseUrl}/payment/success?type=subscription&from=dashboard`);
      }
      return NextResponse.redirect(`${baseUrl}/payment/success?type=sponsorship&from=dashboard&productId=${productId}`);
    }

    // Verify with Flutterwave
    const verification = await verifyFlutterwaveTransaction(paymentId);

    if (verification?.status !== "success" || verification?.data?.status !== "successful") {
      await updatePaymentStatus(paymentId, "failed");
      if (type === "subscription") {
        return NextResponse.redirect(`${baseUrl}/payment/failed?type=subscription&from=dashboard`);
      }
      return NextResponse.redirect(`${baseUrl}/payment/failed?type=sponsorship&from=dashboard&productId=${productId}`);
    }

    // Mark payment successful
    await updatePaymentStatus(paymentId, "successful");

    if (type === "subscription") {
      await activatePremiumPlan(payment.vendorId);
      return NextResponse.redirect(`${baseUrl}/payment/success?type=subscription&from=dashboard`);
    }

    if (type === "sponsorship") {
      const { duration, interplatform, from } = metadata;
      if (productId && duration) {
        await createSponsorshipRecord({
          vendorId: payment.vendorId,
          productId,
          duration: duration as SponsorshipDuration,
          interplatform: !!interplatform,
          paymentId,
        });

        // Mark the product as sponsored
        try {
          await databases.updateDocument(DATABASE_ID, "product", productId, {
            isSponsored: true,
          });
        } catch (err) {
          console.error("Failed to mark product as sponsored:", err);
        }
      }
      const origin = from || "dashboard";
      return NextResponse.redirect(
        `${baseUrl}/payment/success?type=sponsorship&from=${origin}&productId=${productId}`
      );
    }

    return NextResponse.redirect(`${baseUrl}/payment/success?type=unknown&from=dashboard`);
  } catch (err: any) {
    console.error("PAYMENT VERIFY ERROR:", err);
    return NextResponse.redirect(`${baseUrl}/payment/failed?type=unknown&from=dashboard`);
  }
}
