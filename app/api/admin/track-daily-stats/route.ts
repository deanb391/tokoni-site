// app/api/admin/track-daily-stats/route.ts
import { NextRequest, NextResponse } from "next/server";
import { databases } from "@/lib/appwrite/server";
import { Query, ID } from "node-appwrite";

const DATABASE_ID = process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID || "6a0b4741002e8ae14adc";
const STATS_COLLECTION = "admin_stats";
const LOG_COLLECTION = "activity_log";

export async function GET(req: NextRequest) {
  try {
    // Compile today's stats
    const todayStats = await compileTodayStats();

    // Fetch all historical rollup logs to return to client
    const statsListResponse = await databases.listDocuments(
      DATABASE_ID,
      STATS_COLLECTION,
      [Query.orderAsc("date"), Query.limit(1000)]
    );

    // Replace or add today's live compiled stats in the returned array if it's updated
    let stats = statsListResponse.documents;
    const todayStr = new Date().toISOString().split("T")[0];
    const todayIndex = stats.findIndex((s) => s.date === todayStr);

    if (todayIndex > -1) {
      stats[todayIndex] = { ...stats[todayIndex], ...todayStats };
    } else {
      stats.push({ $id: "today_live", ...todayStats } as any);
    }

    // Also get live current totals for direct displays
    const [totalUsersRes, totalVendorsRes, totalPostsRes, totalProductsRes, totalChatsRes] = await Promise.all([
      databases.listDocuments(DATABASE_ID, "users", [Query.limit(1)]),
      databases.listDocuments(DATABASE_ID, "vendor", [Query.limit(1)]),
      databases.listDocuments(DATABASE_ID, "post", [Query.limit(1)]),
      databases.listDocuments(DATABASE_ID, "product", [Query.limit(1)]),
      databases.listDocuments(DATABASE_ID, "chat", [Query.limit(1)]),
    ]);

    return NextResponse.json({
      success: true,
      stats,
      totals: {
        users: totalUsersRes.total,
        vendors: totalVendorsRes.total,
        posts: totalPostsRes.total,
        products: totalProductsRes.total,
        chats: totalChatsRes.total,
      }
    }, { status: 200 });
  } catch (error: any) {
    console.error("TRACK DAILY STATS API ERROR:", error);
    return NextResponse.json({ error: error.message || "Failed to compile stats" }, { status: 500 });
  }
}

async function compileTodayStats() {
  const todayStr = new Date().toISOString().split("T")[0];
  const startOfDay = new Date();
  startOfDay.setHours(0, 0, 0, 0);
  const startOfDayISO = startOfDay.toISOString();

  const startOf30Days = new Date();
  startOf30Days.setDate(startOf30Days.getDate() - 30);
  const startOf30DaysISO = startOf30Days.toISOString();

  // Queries for live activity counts
  const [
    signupsRes,
    vendorsSignedUpRes,
    postsCreatedRes,
    productsCreatedRes,
    dauRes,
    mauRes,
    davRes,
    mavRes,
    activeChatsRes,
    logsRes,
  ] = await Promise.all([
    databases.listDocuments(DATABASE_ID, "users", [Query.greaterThanEqual("$createdAt", startOfDayISO), Query.limit(1)]),
    databases.listDocuments(DATABASE_ID, "vendor", [Query.greaterThanEqual("$createdAt", startOfDayISO), Query.limit(1)]),
    databases.listDocuments(DATABASE_ID, "post", [Query.greaterThanEqual("$createdAt", startOfDayISO), Query.limit(1)]),
    databases.listDocuments(DATABASE_ID, "product", [Query.greaterThanEqual("$createdAt", startOfDayISO), Query.limit(1)]),
    databases.listDocuments(DATABASE_ID, "users", [Query.greaterThanEqual("lastTime", startOfDayISO), Query.limit(1)]),
    databases.listDocuments(DATABASE_ID, "users", [Query.greaterThanEqual("lastTime", startOf30DaysISO), Query.limit(1)]),
    databases.listDocuments(DATABASE_ID, "users", [Query.equal("isVendor", true), Query.greaterThanEqual("lastTime", startOfDayISO), Query.limit(1)]),
    databases.listDocuments(DATABASE_ID, "users", [Query.equal("isVendor", true), Query.greaterThanEqual("lastTime", startOf30DaysISO), Query.limit(1)]),
    databases.listDocuments(DATABASE_ID, "chat", [Query.greaterThanEqual("lastMessageAt", startOfDayISO), Query.limit(1)]),
    databases.listDocuments(DATABASE_ID, LOG_COLLECTION, [Query.greaterThanEqual("timestamp", startOfDayISO), Query.limit(1000)]),
  ]);

  // Aggregate logs
  let totalWatchTime = 0;
  let watchTimeCount = 0;
  let postsEngaged = 0;
  let productsEngaged = 0;
  let cartsSent = 0;

  for (const log of logsRes.documents) {
    if (log.type === "video_watch") {
      totalWatchTime += log.value || 0;
      watchTimeCount++;
    } else if (log.type === "post_engage") {
      postsEngaged++;
    } else if (log.type === "product_engage") {
      productsEngaged++;
    } else if (log.type === "cart_sent") {
      cartsSent++;
    }
  }

  const avgWatchTime = watchTimeCount > 0 ? parseFloat((totalWatchTime / watchTimeCount).toFixed(1)) : 0;

  const statsPayload = {
    date: todayStr,
    dau: dauRes.total,
    mau: mauRes.total,
    dav: davRes.total,
    mav: mavRes.total,
    signups: signupsRes.total,
    vendorsSignedUp: vendorsSignedUpRes.total,
    postsCreated: postsCreatedRes.total,
    productsCreated: productsCreatedRes.total,
    avgWatchTime,
    totalWatchTime: parseFloat(totalWatchTime.toFixed(1)),
    postsEngaged,
    productsEngaged,
    activeChats: activeChatsRes.total,
    cartsSent,
  };

  // Check if document exists for today to perform upsert
  const existingDocs = await databases.listDocuments(DATABASE_ID, STATS_COLLECTION, [
    Query.equal("date", todayStr),
    Query.limit(1),
  ]);

  if (existingDocs.documents.length > 0) {
    await databases.updateDocument(
      DATABASE_ID,
      STATS_COLLECTION,
      existingDocs.documents[0].$id,
      statsPayload
    );
  } else {
    await databases.createDocument(
      DATABASE_ID,
      STATS_COLLECTION,
      ID.unique(),
      statsPayload
    );
  }

  return statsPayload;
}
