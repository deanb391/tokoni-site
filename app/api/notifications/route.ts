// app/api/notifications/route.ts
import { NextRequest, NextResponse } from "next/server";
import {
  getNotificationsService,
  markNotificationReadService,
  getUnreadNotificationCountService,
} from "@/lib/services/notifications.service";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("userId");
    const unreadOnly = searchParams.get("unreadCountOnly") === "true";

    if (!userId) {
      return NextResponse.json(
        { error: "Missing required parameter: userId" },
        { status: 400 }
      );
    }

    if (unreadOnly) {
      const count = await getUnreadNotificationCountService(userId);
      return NextResponse.json({ success: true, count }, { status: 200 });
    }

    const notifications = await getNotificationsService(userId);
    return NextResponse.json({ success: true, data: notifications }, { status: 200 });
  } catch (error: any) {
    console.error("GET NOTIFICATIONS API ERROR:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch notifications" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const { notificationId } = await req.json();

    if (!notificationId) {
      return NextResponse.json(
        { error: "Missing required field: notificationId" },
        { status: 400 }
      );
    }

    const updated = await markNotificationReadService(notificationId);
    return NextResponse.json({ success: true, data: updated }, { status: 200 });
  } catch (error: any) {
    console.error("POST MARK READ NOTIFICATION API ERROR:", error);
    return NextResponse.json(
      { error: error.message || "Failed to update notification status" },
      { status: 500 }
    );
  }
}
