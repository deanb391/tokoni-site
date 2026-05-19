// app/api/vendors/me/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getVendorByUserIdService } from "@/lib/services/vendors.service";

export async function GET(req: NextRequest) {
  try {
    const userId = req.nextUrl.searchParams.get("userId");

    if (!userId) {
      return NextResponse.json(
        { error: "Missing userId parameter" },
        { status: 400 }
      );
    }

    const vendor = await getVendorByUserIdService(userId);

    return NextResponse.json(
      { success: true, vendor },
      { status: 200 }
    );
  } catch (err: any) {
    console.error("GET ME VENDOR API ROUTE ERROR:", err);
    return NextResponse.json(
      { error: err.message || "Failed to fetch vendor status" },
      { status: 500 }
    );
  }
}
