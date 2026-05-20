// lib/services/messages.service.ts
import { ID, Query } from "node-appwrite";
import { databases } from "@/lib/appwrite/server";
import { updateChatLastMessageService } from "./chats.service";

const DATABASE_ID = process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID || "6a0b4741002e8ae14adc";
const MESSAGE_COLLECTION = "message";

export type Reaction = {
  userId: string;
  username: string;
  emoji: string;
};

export type Message = {
  $id: string;
  chatId: string;
  senderId: string;
  text: string;
  media: string[];
  mediaType: "image" | "video" | "none";
  replyTo?: string;
  reactions: Reaction[];
  status: "sent" | "delivered" | "seen";
  $createdAt: string;
  $updatedAt: string;
};

export type MessageDraft = {
  chatId: string;
  senderId: string;
  text?: string;
  media?: string[];
  mediaType?: "image" | "video" | "none";
  replyTo?: string;
  status?: "sent" | "delivered" | "seen";
};

export function mapMessageDoc(doc: any): Message {
  let media: string[] = [];
  if (doc.media) {
    if (typeof doc.media === "string") {
      try {
        media = JSON.parse(doc.media);
      } catch {
        media = [doc.media];
      }
    } else if (Array.isArray(doc.media)) {
      media = doc.media;
    }
  }

  let reactions: Reaction[] = [];
  if (doc.reactions) {
    try {
      reactions = typeof doc.reactions === "string" ? JSON.parse(doc.reactions) : doc.reactions;
    } catch {
      reactions = [];
    }
  }

  return {
    $id: doc.$id,
    chatId: doc.chatId || "",
    senderId: doc.senderId || "",
    text: doc.text || "",
    media,
    mediaType: doc.mediaType || "none",
    replyTo: doc.replyTo || "",
    reactions,
    status: doc.status || "sent",
    $createdAt: doc.$createdAt,
    $updatedAt: doc.$updatedAt,
  };
}

export async function createMessageService(draft: MessageDraft): Promise<Message> {
  const now = new Date().toISOString();
  const text = draft.text || "";
  const media = draft.media || [];
  const mediaType = draft.mediaType || "none";
  const replyTo = draft.replyTo || "";
  const status = draft.status || "sent";

  const payload = {
    chatId: draft.chatId,
    senderId: draft.senderId,
    text,
    media,
    mediaType,
    replyTo,
    reactions: JSON.stringify([]),
    status,
    $createdAt: now,
    $updatedAt: now,
  };

  const doc = await databases.createDocument(
    DATABASE_ID,
    MESSAGE_COLLECTION,
    ID.unique(),
    payload
  );

  const message = mapMessageDoc(doc);

  // Update last message preview in the parent chat
  let previewText = text;
  if (!previewText && media.length > 0) {
    previewText = mediaType === "video" ? "🎥 Sent a video" : "📷 Sent an image";
  }

  // Update chat last message asynchronously
  updateChatLastMessageService(draft.chatId, previewText, draft.senderId, status).catch((err) => {
    console.error("Failed to update chat last message in createMessageService:", err);
  });

  return message;
}

export async function getMessagesByChatService(
  chatId: string,
  limit = 50,
  cursor?: string
): Promise<{ messages: Message[]; nextCursor?: string; hasMore: boolean }> {
  try {
    const queries = [
      Query.equal("chatId", chatId),
      Query.orderDesc("$createdAt"),
      Query.limit(limit),
    ];

    if (cursor) {
      queries.push(Query.cursorAfter(cursor));
    }

    const res = await databases.listDocuments(DATABASE_ID, MESSAGE_COLLECTION, queries);
    
    // Reverse messages so they read chronologically (ascending) for the chat interface
    const messages = res.documents.map(mapMessageDoc).reverse();
    const nextCursor =
      res.documents.length === limit
        ? res.documents[res.documents.length - 1].$id
        : undefined;

    return {
      messages,
      nextCursor,
      hasMore: res.documents.length === limit,
    };
  } catch (error) {
    console.error("getMessagesByChatService error:", error);
    return { messages: [], hasMore: false };
  }
}

export async function toggleMessageReactionService(
  messageId: string,
  userId: string,
  username: string,
  emoji: string
): Promise<Message> {
  const doc = await databases.getDocument(DATABASE_ID, MESSAGE_COLLECTION, messageId);
  const message = mapMessageDoc(doc);

  let updatedReactions = [...message.reactions];
  const existingReactionIndex = updatedReactions.findIndex(
    (r) => r.userId === userId && r.emoji === emoji
  );

  if (existingReactionIndex > -1) {
    // Remove reaction if user clicks it again
    updatedReactions.splice(existingReactionIndex, 1);
  } else {
    // Add reaction
    updatedReactions.push({ userId, username, emoji });
  }

  const updated = await databases.updateDocument(DATABASE_ID, MESSAGE_COLLECTION, messageId, {
    reactions: JSON.stringify(updatedReactions),
  });

  return mapMessageDoc(updated);
}

export async function updateMessagesStatusService(
  messageIds: string[],
  status: "delivered" | "seen",
  chatId?: string
): Promise<boolean> {
  try {
    await Promise.all(
      messageIds.map((id) =>
        databases.updateDocument(DATABASE_ID, MESSAGE_COLLECTION, id, {
          status,
        })
      )
    );

    // If a chatId is provided, also update lastMessageStatus for that chat
    if (chatId) {
      await databases.updateDocument(DATABASE_ID, "chat", chatId, {
        lastMessageStatus: status,
      });
    }

    return true;
  } catch (err) {
    console.error("Failed to update message statuses:", err);
    return false;
  }
}
