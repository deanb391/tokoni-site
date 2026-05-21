// app/api/payments/initialize/route.ts
import { NextRequest, NextResponse } from "next/server";
import { initFlutterwavePayment } from "@/lib/services/flutterwave.service";
import {
  createPaymentRecord,
  calculateSponsorshipPrice,
  SUBSCRIPTION_PRICE_NGN,
  SponsorshipDuration,
} from "@/lib/services/subscriptions.service";
import { getVendorByUserIdService } from "@/lib/services/vendors.service";
import { isVendorPremium } from "@/lib/services/subscriptions.service";
import { getCurrentUser } from "@/lib/services/auth.service";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { type, duration, interplatform, productId, userId, userEmail, from } = body;

    if (!type || !userId || !userEmail) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // Get vendor for this user
    const vendor = await getVendorByUserIdService(userId);
    if (!vendor) {
      return NextResponse.json({ error: "Vendor not found" }, { status: 404 });
    }

    const isPremium = isVendorPremium(vendor);
    let amount = 0;
    let description = "";
    let metadata: Record<string, any> = {};

    if (type === "subscription") {
      amount = SUBSCRIPTION_PRICE_NGN;
      description = "Tokoni Premium Plan – Monthly Subscription";
      metadata = { type: "subscription" };
    } else if (type === "sponsorship") {
      if (!duration || !productId) {
        return NextResponse.json({ error: "Missing duration or productId for sponsorship" }, { status: 400 });
      }

      const pricing = calculateSponsorshipPrice({
        duration: duration as SponsorshipDuration,
        interplatform: !!interplatform,
        isPremium,
      });

      amount = pricing.total;
      description = `Product Sponsorship – ${duration}${interplatform ? " + ED-Library" : ""}`;
      metadata = {
        type: "sponsorship",
        productId,
        duration,
        interplatform: !!interplatform,
        isPremium,
        pricing,
        from: from || "dashboard",
      };
    } else {
      return NextResponse.json({ error: "Invalid payment type" }, { status: 400 });
    }

    // Create pending payment record
    const payment = await createPaymentRecord({
      vendorId: vendor.$id,
      amount,
      type,
      description,
      metadata,
    });

    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";
    const redirectUrl = `${baseUrl}/api/payments/verify?paymentId=${payment.$id}`;

    // Initialize Flutterwave payment
    const flutter = await initFlutterwavePayment({
      amount,
      email: userEmail,
      tx_ref: payment.$id,
      description,
      redirect_url: redirectUrl,
    });

    if (!flutter?.data?.link) {
      return NextResponse.json(
        { error: "Failed to initialize payment gateway. Please try again." },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      checkoutUrl: flutter.data.link,
      paymentId: payment.$id,
    });
  } catch (err: any) {
    console.error("PAYMENT INITIALIZE ERROR:", err);
    return NextResponse.json(
      { error: err.message || "Failed to initialize payment" },
      { status: 500 }
    );
  }
}
