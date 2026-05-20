// app/api/users/save-product/route.ts
import { NextRequest, NextResponse } from "next/server";
import { toggleSaveProductService } from "@/lib/services/users.service";

export async function POST(req: NextRequest) {
  try {
    const { userId, productId } = await req.json();

    if (!userId || !productId) {
      return NextResponse.json(
        { error: "Missing required fields (userId, productId)" },
        { status: 400 }
      );
    }

    const updatedProfile = await toggleSaveProductService(userId, productId);

    return NextResponse.json(
      { success: true, data: updatedProfile },
      { status: 200 }
    );
  } catch (err: any) {
    console.error("TOGGLE SAVE PRODUCT API ERROR:", err);
    return NextResponse.json(
      { error: err.message || "Failed to toggle save product" },
      { status: 500 }
    );
  }
}
