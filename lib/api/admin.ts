// lib/api/admin.ts

export type ActivityType = "video_watch" | "post_engage" | "product_engage" | "cart_sent";

export async function logActivity(type: ActivityType, targetId?: string, value?: number): Promise<boolean> {
  try {
    const response = await fetch("/api/admin/log-activity", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ type, targetId, value }),
    });

    return response.ok;
  } catch (error) {
    console.error("Failed to log activity:", error);
    return false;
  }
}
