// app/api/vendors/edit/route.ts
import { NextRequest, NextResponse } from "next/server";
import { editVendorService, VendorDraft } from "@/lib/services/vendors.service";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { vendorId, updates } = body;

    if (!vendorId || !updates) {
      return NextResponse.json(
        { error: "Missing vendorId or updates" },
        { status: 400 }
      );
    }

    const vendor = await editVendorService(vendorId, updates as Partial<VendorDraft>);

    return NextResponse.json(
      { success: true, data: vendor },
      { status: 200 }
    );
  } catch (err: any) {
    console.error("EDIT VENDOR API ROUTE ERROR:", err);
    return NextResponse.json(
      { error: err.message || "Failed to update vendor profile" },
      { status: 500 }
    );
  }
}
