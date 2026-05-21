// app/api/payments/history/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getVendorPayments } from "@/lib/services/subscriptions.service";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const vendorId = searchParams.get("vendorId");

  if (!vendorId) {
    return NextResponse.json({ error: "Missing vendorId" }, { status: 400 });
  }

  try {
    const payments = await getVendorPayments(vendorId);
    return NextResponse.json({ success: true, payments });
  } catch (err: any) {
    console.error("PAYMENT HISTORY ERROR:", err);
    return NextResponse.json({ error: err.message || "Failed to fetch payments" }, { status: 500 });
  }
}
