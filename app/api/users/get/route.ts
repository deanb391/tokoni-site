// app/api/users/get/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getUserById } from "@/lib/appwrite/server";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { error: "Missing user ID" },
        { status: 400 }
      );
    }

    const userDoc = await getUserById(id);
    if (!userDoc) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    // Return the document mapping (excluding sensitive keys if needed, but Appwrite docs are standard)
    return NextResponse.json(
      { success: true, data: userDoc },
      { status: 200 }
    );
  } catch (err: any) {
    console.error("GET USER PROFILE API ERROR:", err);
    return NextResponse.json(
      { error: err.message || "Failed to fetch user profile" },
      { status: 500 }
    );
  }
}
