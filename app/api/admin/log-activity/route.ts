// app/api/admin/log-activity/route.ts
import { NextRequest, NextResponse } from "next/server";
import { databases } from "@/lib/appwrite/server";
import { ID } from "node-appwrite";

const DATABASE_ID = process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID || "6a0b4741002e8ae14adc";
const LOG_COLLECTION = "activity_log";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { type, targetId, value } = body;

    if (!type) {
      return NextResponse.json({ error: "Missing activity type" }, { status: 400 });
    }

    const payload = {
      type,
      targetId: targetId || "",
      value: value !== undefined && value !== null ? parseFloat(value) : 0,
      timestamp: new Date().toISOString(),
    };

    const doc = await databases.createDocument(
      DATABASE_ID,
      LOG_COLLECTION,
      ID.unique(),
      payload
    );

    return NextResponse.json({ success: true, documentId: doc.$id }, { status: 200 });
  } catch (error: any) {
    console.error("LOG ACTIVITY API ERROR:", error);
    return NextResponse.json({ error: error.message || "Failed to log activity" }, { status: 500 });
  }
}
