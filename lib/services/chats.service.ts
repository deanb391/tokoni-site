// lib/services/chats.service.ts
import { ID, Query } from "node-appwrite";
import { databases } from "@/lib/appwrite/server";

const DATABASE_ID = process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID || "6a0b4741002e8ae14adc";
const CHAT_COLLECTION = "chat";

export type Chat = {
  $id: string;
  participants: string[];
  lastMessage?: string;
  lastMessageSenderId?: string;
  lastMessageAt?: string;
  lastMessageStatus?: "sent" | "delivered" | "seen";
  unreadCounts: Record<string, number>;
  typingUsers: string[];
  $createdAt: string;
  $updatedAt: string;
};

export function mapChatDoc(doc: any): Chat {
  let participants: string[] = [];
  if (doc.participants) {
    if (typeof doc.participants === "string") {
      try {
        participants = JSON.parse(doc.participants);
      } catch {
        participants = [doc.participants];
      }
    } else if (Array.isArray(doc.participants)) {
      participants = doc.participants;
    }
  }

  let typingUsers: string[] = [];
  if (doc.typingUsers) {
    if (typeof doc.typingUsers === "string") {
      try {
        typingUsers = JSON.parse(doc.typingUsers);
      } catch {
        typingUsers = [doc.typingUsers];
      }
    } else if (Array.isArray(doc.typingUsers)) {
      typingUsers = doc.typingUsers;
    }
  }

  let unreadCounts: Record<string, number> = {};
  if (doc.unreadCounts) {
    try {
      unreadCounts = typeof doc.unreadCounts === "string" ? JSON.parse(doc.unreadCounts) : doc.unreadCounts;
    } catch {
      unreadCounts = {};
    }
  }

  return {
    $id: doc.$id,
    participants,
    lastMessage: doc.lastMessage || "",
    lastMessageSenderId: doc.lastMessageSenderId || "",
    lastMessageAt: doc.lastMessageAt || "",
    lastMessageStatus: doc.lastMessageStatus || "sent",
    unreadCounts,
    typingUsers,
    $createdAt: doc.$createdAt,
    $updatedAt: doc.$updatedAt,
  };
}

export async function createChatService(participants: string[]): Promise<Chat> {
  // Sort participants to ensure consistency (for direct messaging, order doesn't matter, but helps avoid duplicates)
  const sortedParticipants = [...participants].sort();
  const uniqueParticipants = Array.from(new Set(sortedParticipants));

  // Check if a chat already exists with exactly these participants
  try {
    const queries = uniqueParticipants.map((p) => Query.contains("participants", p));
    queries.push(Query.limit(100));

    const res = await databases.listDocuments(DATABASE_ID, CHAT_COLLECTION, queries);

    // Find the exact match where participants array has the exact same elements
    const existingDoc = res.documents.find((doc) => {
      const docParticipants = Array.isArray(doc.participants)
        ? doc.participants
        : JSON.parse(doc.participants || "[]");
      return (
        docParticipants.length === sortedParticipants.length &&
        docParticipants.every((p: string) => sortedParticipants.includes(p))
      );
    });

    if (existingDoc) {
      return mapChatDoc(existingDoc);
    }
  } catch (err) {
    console.error("Error checking existing chat:", err);
  }

  // Initialize unread counts
  const unreadCounts: Record<string, number> = {};
  for (const p of sortedParticipants) {
    unreadCounts[p] = 0;
  }

  const payload = {
    participants: sortedParticipants,
    unreadCounts: JSON.stringify(unreadCounts),
    typingUsers: [],
    lastMessage: "",
    lastMessageSenderId: "",
    lastMessageAt: new Date().toISOString(),
  };

  const doc = await databases.createDocument(
    DATABASE_ID,
    CHAT_COLLECTION,
    ID.unique(),
    payload
  );

  return mapChatDoc(doc);
}

export async function getChatsForUserService(userId: string): Promise<Chat[]> {
  try {
    const res = await databases.listDocuments(DATABASE_ID, CHAT_COLLECTION, [
      Query.contains("participants", userId),
      Query.orderDesc("lastMessageAt"),
      Query.limit(100),
    ]);
    return res.documents.map(mapChatDoc);
  } catch (error) {
    console.error("getChatsForUserService error:", error);
    return [];
  }
}

export async function getChatByIdService(chatId: string): Promise<Chat | null> {
  try {
    const doc = await databases.getDocument(DATABASE_ID, CHAT_COLLECTION, chatId);
    return mapChatDoc(doc);
  } catch (error) {
    console.error(`getChatByIdService error for ${chatId}:`, error);
    return null;
  }
}

export async function updateChatLastMessageService(
  chatId: string,
  text: string,
  senderId: string,
  lastMessageStatus: "sent" | "delivered" | "seen" = "sent"
): Promise<Chat> {
  const doc = await databases.getDocument(DATABASE_ID, CHAT_COLLECTION, chatId);
  const chat = mapChatDoc(doc);

  // Update unread counts: increment for all participants except the sender
  const updatedUnreadCounts = { ...chat.unreadCounts };
  for (const p of chat.participants) {
    if (p !== senderId) {
      updatedUnreadCounts[p] = (updatedUnreadCounts[p] || 0) + 1;
    }
  }

  const now = new Date().toISOString();
  const updated = await databases.updateDocument(DATABASE_ID, CHAT_COLLECTION, chatId, {
    lastMessage: text,
    lastMessageSenderId: senderId,
    lastMessageAt: now,
    lastMessageStatus,
    unreadCounts: JSON.stringify(updatedUnreadCounts),
  });

  return mapChatDoc(updated);
}

export async function updateChatLastMessageStatusService(
  chatId: string,
  status: "delivered" | "seen"
): Promise<Chat> {
  const updated = await databases.updateDocument(DATABASE_ID, CHAT_COLLECTION, chatId, {
    lastMessageStatus: status,
  });
  return mapChatDoc(updated);
}

export async function clearChatUnreadCountService(
  chatId: string,
  userId: string
): Promise<Chat> {
  const doc = await databases.getDocument(DATABASE_ID, CHAT_COLLECTION, chatId);
  const chat = mapChatDoc(doc);

  const updatedUnreadCounts = { ...chat.unreadCounts };
  updatedUnreadCounts[userId] = 0;

  const updated = await databases.updateDocument(DATABASE_ID, CHAT_COLLECTION, chatId, {
    unreadCounts: JSON.stringify(updatedUnreadCounts),
  });

  return mapChatDoc(updated);
}

export async function updateChatTypingStateService(
  chatId: string,
  userId: string,
  isTyping: boolean
): Promise<Chat> {
  const doc = await databases.getDocument(DATABASE_ID, CHAT_COLLECTION, chatId);
  const chat = mapChatDoc(doc);

  let updatedTypingUsers = [...chat.typingUsers];
  const isCurrentlyTyping = updatedTypingUsers.includes(userId);

  if (isTyping && !isCurrentlyTyping) {
    updatedTypingUsers.push(userId);
  } else if (!isTyping && isCurrentlyTyping) {
    updatedTypingUsers = updatedTypingUsers.filter((id) => id !== userId);
  } else {
    // No change
    return chat;
  }

  const updated = await databases.updateDocument(DATABASE_ID, CHAT_COLLECTION, chatId, {
    typingUsers: updatedTypingUsers,
  });

  return mapChatDoc(updated);
}
