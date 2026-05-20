// app/api/users/follow/route.ts
import { NextRequest, NextResponse } from "next/server";
import { toggleFollowVendorService } from "@/lib/services/users.service";

export async function POST(req: NextRequest) {
  try {
    const { userId, vendorId } = await req.json();

    if (!userId || !vendorId) {
      return NextResponse.json(
        { error: "Missing required fields (userId, vendorId)" },
        { status: 400 }
      );
    }

    const updatedProfile = await toggleFollowVendorService(userId, vendorId);

    return NextResponse.json(
      { success: true, data: updatedProfile },
      { status: 200 }
    );
  } catch (err: any) {
    console.error("TOGGLE FOLLOW VENDOR API ERROR:", err);
    return NextResponse.json(
      { error: err.message || "Failed to toggle follow" },
      { status: 500 }
    );
  }
}
