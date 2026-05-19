import { NextRequest, NextResponse } from "next/server";
import { fetchVendorService } from "@/lib/services/vendors.service";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const vendorId = searchParams.get("vendorId");

    if (!vendorId) {
      return NextResponse.json(
        { error: "Missing vendorId parameter" },
        { status: 400 }
      );
    }

    const vendor = await fetchVendorService(vendorId);

    return NextResponse.json(
      { success: true, data: vendor },
      { status: 200 }
    );
  } catch (err: any) {
    console.error("GET VENDOR BY ID API ERROR:", err);
    return NextResponse.json(
      { error: err.message || "Failed to fetch vendor profile" },
      { status: 500 }
    );
  }
}
