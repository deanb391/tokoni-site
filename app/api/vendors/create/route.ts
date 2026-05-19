// app/api/vendors/create/route.ts
import { NextRequest, NextResponse } from "next/server";
import { createVendorService, VendorDraft } from "@/lib/services/vendors.service";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { draft, userId } = body;

    if (!draft || !userId) {
      return NextResponse.json(
        { error: "Missing vendor draft or userId" },
        { status: 400 }
      );
    }

    const missingFields: string[] = [];
    if (!draft.businessName) missingFields.push("Business Name");
    if (!draft.phoneNumber) missingFields.push("Phone Number");
    if (!draft.countryCode) missingFields.push("Country Code");
    if (!Array.isArray(draft.category) || draft.category.length === 0) missingFields.push("Categories");
    if (!draft.country) missingFields.push("Country");
    if (!draft.state) missingFields.push("State/Province");
    if (!draft.address) missingFields.push("Street Address");

    if (missingFields.length > 0) {
      return NextResponse.json(
        { error: `Missing required fields: ${missingFields.join(", ")}` },
        { status: 400 }
      );
    }

    const vendor = await createVendorService(draft as VendorDraft, userId);

    return NextResponse.json(
      { success: true, data: vendor },
      { status: 201 }
    );
  } catch (err: any) {
    console.error("CREATE VENDOR API ROUTE ERROR:", err);
    return NextResponse.json(
      { error: err.message || "Failed to create vendor profile" },
      { status: 500 }
    );
  }
}
