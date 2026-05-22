// lib/services/users.service.ts
import { databases } from "@/lib/appwrite/server";

const DATABASE_ID = process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID || "6a0b4741002e8ae14adc";
const USER_COLLECTION = process.env.NEXT_PUBLIC_APPWRITE_USER_COLLECTION || "users";

export type UserProfile = {
  $id: string;
  email: string;
  username: string;
  avatar: string;
  isAdmin: boolean;
  isVendor: boolean;
  following: string[];
  savedPosts: string[];
  savedProducts: string[];
  pushNotifications?: boolean;
  emailNotifications?: boolean;
  lastMessageEmailAt?: string;
  $createdAt: string;
  $updatedAt: string;
};

export function mapUserDoc(doc: any): UserProfile {
  let following: string[] = [];
  let savedPosts: string[] = [];
  let savedProducts: string[] = [];

  if (doc.following) {
    try {
      following = typeof doc.following === "string" ? JSON.parse(doc.following) : doc.following;
    } catch {
      following = [];
    }
  }
  if (doc.savedPosts) {
    try {
      savedPosts = typeof doc.savedPosts === "string" ? JSON.parse(doc.savedPosts) : doc.savedPosts;
    } catch {
      savedPosts = [];
    }
  }
  if (doc.savedProducts) {
    try {
      savedProducts = typeof doc.savedProducts === "string" ? JSON.parse(doc.savedProducts) : doc.savedProducts;
    } catch {
      savedProducts = [];
    }
  }

  return {
    $id: doc.$id,
    email: doc.email || "",
    username: doc.username || "",
    avatar: doc.avatar || "",
    isAdmin: !!doc.isAdmin,
    isVendor: !!doc.isVendor,
    following,
    savedPosts,
    savedProducts,
    pushNotifications: doc.pushNotifications !== undefined ? !!doc.pushNotifications : true,
    emailNotifications: doc.emailNotifications !== undefined ? !!doc.emailNotifications : true,
    lastMessageEmailAt: doc.lastMessageEmailAt || "",
    $createdAt: doc.$createdAt,
    $updatedAt: doc.$updatedAt,
  };
}

export async function getUserProfileService(userId: string): Promise<UserProfile | null> {
  try {
    const doc = await databases.getDocument(DATABASE_ID, USER_COLLECTION, userId);
    return mapUserDoc(doc);
  } catch (error) {
    console.error("getUserProfileService error:", error);
    return null;
  }
}

export async function toggleFollowVendorService(userId: string, vendorId: string): Promise<UserProfile> {
  const doc = await databases.getDocument(DATABASE_ID, USER_COLLECTION, userId);
  let following: string[] = [];
  if (doc.following) {
    try {
      following = typeof doc.following === "string" ? JSON.parse(doc.following) : doc.following;
    } catch {
      following = [];
    }
  }

  const isFollowing = following.includes(vendorId);
  if (isFollowing) {
    following = following.filter((id) => id !== vendorId);
  } else {
    following.push(vendorId);
  }

  const updated = await databases.updateDocument(DATABASE_ID, USER_COLLECTION, userId, {
    following: JSON.stringify(following),
  });

  // Trigger follow notification & email if this is a new follow action
  if (!isFollowing) {
    try {
      // 1. Fetch vendor document
      const vendorDoc = await databases.getDocument(DATABASE_ID, "vendor", vendorId);
      const vendorUserId = vendorDoc.users;
      
      if (vendorUserId && vendorUserId !== userId) {
        // 2. Fetch vendor's user profile
        const vendorUserDoc = await databases.getDocument(DATABASE_ID, USER_COLLECTION, vendorUserId);
        
        // 3. Create in-app notification
        const followerName = doc.username || "A user";
        const { createNotificationService } = await import("@/lib/services/notifications.service");
        await createNotificationService({
          userId: vendorUserId,
          senderId: userId,
          type: "follower",
          title: "New Follower",
          message: `${followerName} started following your store!`,
          link: `/profile/${userId}`,
        }).catch(console.error);

        // 4. Send email if enabled
        const emailNotificationsEnabled = vendorUserDoc.emailNotifications !== false;
        if (emailNotificationsEnabled && vendorUserDoc.email) {
          const { sendNewFollowerEmail } = await import("@/lib/email/events");
          const businessName = vendorDoc.businessName || vendorUserDoc.username || "Vendor";
          await sendNewFollowerEmail(vendorUserDoc.email, businessName, followerName).catch(console.error);
        }
      }
    } catch (err) {
      console.error("Error triggering follow notifications/emails:", err);
    }
  }

  return mapUserDoc(updated);
}

import { togglePostSavedCountService } from "@/lib/services/posts.service";

export async function toggleSavePostService(userId: string, postId: string): Promise<UserProfile> {
  const doc = await databases.getDocument(DATABASE_ID, USER_COLLECTION, userId);
  let savedPosts: string[] = [];
  if (doc.savedPosts) {
    try {
      savedPosts = typeof doc.savedPosts === "string" ? JSON.parse(doc.savedPosts) : doc.savedPosts;
    } catch {
      savedPosts = [];
    }
  }

  const isSaved = savedPosts.includes(postId);
  if (isSaved) {
    savedPosts = savedPosts.filter((id) => id !== postId);
  } else {
    savedPosts.push(postId);
  }

  const updated = await databases.updateDocument(DATABASE_ID, USER_COLLECTION, userId, {
    savedPosts: JSON.stringify(savedPosts),
  });

  // Increment or decrement saved field in post document asynchronously
  togglePostSavedCountService(postId, !isSaved).catch((err) => {
    console.error("Failed to update post saved count:", err);
  });

  return mapUserDoc(updated);
}

export async function toggleSaveProductService(userId: string, productId: string): Promise<UserProfile> {
  const doc = await databases.getDocument(DATABASE_ID, USER_COLLECTION, userId);
  let savedProducts: string[] = [];
  if (doc.savedProducts) {
    try {
      savedProducts = typeof doc.savedProducts === "string" ? JSON.parse(doc.savedProducts) : doc.savedProducts;
    } catch {
      savedProducts = [];
    }
  }

  const isSaved = savedProducts.includes(productId);
  if (isSaved) {
    savedProducts = savedProducts.filter((id) => id !== productId);
  } else {
    savedProducts.push(productId);
  }

  const updated = await databases.updateDocument(DATABASE_ID, USER_COLLECTION, userId, {
    savedProducts: JSON.stringify(savedProducts),
  });

  return mapUserDoc(updated);
}
