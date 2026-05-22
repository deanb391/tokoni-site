// lib/services/notifications.service.ts
import { ID, Query } from "node-appwrite";
import { databases } from "@/lib/appwrite/server";

const DATABASE_ID = process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID || "6a0b4741002e8ae14adc";
const NOTIFICATION_COLLECTION = "notifications";

export interface TokoniNotification {
  $id: string;
  userId: string;
  senderId?: string;
  type: string;
  title: string;
  message: string;
  read: boolean;
  link?: string;
  $createdAt: string;
}

function mapNotificationDoc(doc: any): TokoniNotification {
  return {
    $id: doc.$id,
    userId: doc.userId || "",
    senderId: doc.senderId || undefined,
    type: doc.type || "",
    title: doc.title || "",
    message: doc.message || "",
    read: !!doc.read,
    link: doc.link || undefined,
    $createdAt: doc.$createdAt,
  };
}

/**
 * Creates a notification in Appwrite
 */
export async function createNotificationService(params: {
  userId: string;
  senderId?: string;
  type: string;
  title: string;
  message: string;
  link?: string;
}): Promise<TokoniNotification> {
  const doc = await databases.createDocument(
    DATABASE_ID,
    NOTIFICATION_COLLECTION,
    ID.unique(),
    {
      userId: params.userId,
      senderId: params.senderId || null,
      type: params.type,
      title: params.title,
      message: params.message,
      read: false,
      link: params.link || null,
    }
  );

  return mapNotificationDoc(doc);
}

/**
 * Fetches notifications for a user, sorted by descending creation time
 */
export async function getNotificationsService(
  userId: string,
  limit = 50
): Promise<TokoniNotification[]> {
  try {
    const res = await databases.listDocuments(
      DATABASE_ID,
      NOTIFICATION_COLLECTION,
      [
        Query.equal("userId", userId),
        Query.orderDesc("$createdAt"),
        Query.limit(limit),
      ]
    );

    return res.documents.map(mapNotificationDoc);
  } catch (error) {
    console.error("getNotificationsService error:", error);
    return [];
  }
}

/**
 * Marks a notification as read
 */
export async function markNotificationReadService(
  notificationId: string
): Promise<TokoniNotification> {
  const doc = await databases.updateDocument(
    DATABASE_ID,
    NOTIFICATION_COLLECTION,
    notificationId,
    {
      read: true,
    }
  );

  return mapNotificationDoc(doc);
}

/**
 * Gets count of unread notifications for a user
 */
export async function getUnreadNotificationCountService(
  userId: string
): Promise<number> {
  try {
    const res = await databases.listDocuments(
      DATABASE_ID,
      NOTIFICATION_COLLECTION,
      [
        Query.equal("userId", userId),
        Query.equal("read", false),
        Query.limit(1), // we only care about the total count
      ]
    );

    return res.total;
  } catch (error) {
    console.error("getUnreadNotificationCountService error:", error);
    return 0;
  }
}

/**
 * Notifies all followers of a vendor when they upload new content (post or product)
 */
export async function notifyFollowersOfNewContent(
  vendorId: string,
  contentType: "post" | "product",
  contentName: string,
  linkPath: string
): Promise<void> {
  try {
    const USER_COLLECTION = process.env.NEXT_PUBLIC_APPWRITE_USER_COLLECTION || "users";
    
    // 1. Get vendor details to get businessName and vendorUserId
    const vendorDoc = await databases.getDocument(DATABASE_ID, "vendor", vendorId);
    const vendorUserId = vendorDoc.users;
    if (!vendorUserId) return;

    // 2. Fetch follower list (retrieve up to 100 users who follow this vendor)
    const usersList = await databases.listDocuments(
      DATABASE_ID,
      USER_COLLECTION,
      [Query.limit(100)]
    );

    const followers = usersList.documents.filter((doc) => {
      let following: string[] = [];
      if (doc.following) {
        try {
          following = typeof doc.following === "string" ? JSON.parse(doc.following) : doc.following;
        } catch {
          following = [];
        }
      }
      return following.includes(vendorId);
    });

    const businessName = vendorDoc.businessName || "A vendor you follow";
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";
    const fullUrl = `${baseUrl}${linkPath}`;

    // 3. Send notifications and emails
    for (const follower of followers) {
      if (follower.$id === vendorUserId) continue; // skip vendor themselves

      // a. Create in-app notification
      const typeText = contentType === "product" ? "product" : "post/reel";
      await createNotificationService({
        userId: follower.$id,
        senderId: vendorUserId,
        type: `${contentType}_upload`,
        title: `New ${contentType === "product" ? "Product" : "Post"} uploaded!`,
        message: `${businessName} uploaded a new ${typeText}: "${contentName}"`,
        link: linkPath,
      }).catch(console.error);

      // b. Send email if enabled
      const emailNotificationsEnabled = follower.emailNotifications !== false;
      if (emailNotificationsEnabled && follower.email) {
        const { sendNewContentAlertEmail } = await import("@/lib/email/events");
        await sendNewContentAlertEmail(follower.email, {
          followerName: follower.username || "User",
          vendorName: businessName,
          contentType,
          contentName,
          linkUrl: fullUrl,
        }).catch(console.error);
      }
    }
  } catch (error) {
    console.error("Failed to notify followers of new content:", error);
  }
}

