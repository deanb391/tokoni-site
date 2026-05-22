// app/api/users/update-settings/route.ts
import { NextRequest, NextResponse } from "next/server";
import { databases } from "@/lib/appwrite/server";

const DATABASE_ID = process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID || "6a0b4741002e8ae14adc";
const USER_COLLECTION = process.env.NEXT_PUBLIC_APPWRITE_USER_COLLECTION || "users";

export async function POST(req: NextRequest) {
  try {
    const { userId, pushNotifications, emailNotifications } = await req.json();

    if (!userId) {
      return NextResponse.json(
        { error: "Missing required field: userId" },
        { status: 400 }
      );
    }

    const updates: Record<string, any> = {};
    if (pushNotifications !== undefined) {
      updates.pushNotifications = !!pushNotifications;
    }
    if (emailNotifications !== undefined) {
      updates.emailNotifications = !!emailNotifications;
    }

    const updatedDoc = await databases.updateDocument(
      DATABASE_ID,
      USER_COLLECTION,
      userId,
      updates
    );

    return NextResponse.json(
      {
        success: true,
        data: {
          pushNotifications: updatedDoc.pushNotifications,
          emailNotifications: updatedDoc.emailNotifications,
        },
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("UPDATE SETTINGS API ERROR:", error);
    return NextResponse.json(
      { error: error.message || "Failed to update notification settings" },
      { status: 500 }
    );
  }
}
