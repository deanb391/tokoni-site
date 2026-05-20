// lib/api/messages.ts
import { Message, MessageDraft } from "@/lib/services/messages.service";

const jsonHeaders = {
  "Content-Type": "application/json",
};

export async function sendMessage(draft: MessageDraft): Promise<Message> {
  const res = await fetch("/api/messages/create", {
    method: "POST",
    headers: jsonHeaders,
    body: JSON.stringify(draft),
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.error || "Failed to send message");
  }

  const data = await res.json();
  return data.data;
}

export async function getMessagesByChat(
  chatId: string,
  limit = 50,
  cursor?: string
): Promise<{ messages: Message[]; nextCursor?: string; hasMore: boolean }> {
  let url = `/api/messages/list?chatId=${encodeURIComponent(chatId)}&limit=${limit}`;
  if (cursor) {
    url += `&cursor=${encodeURIComponent(cursor)}`;
  }

  const res = await fetch(url, {
    method: "GET",
    headers: jsonHeaders,
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.error || "Failed to fetch messages");
  }

  const data = await res.json();
  return {
    messages: data.messages || [],
    nextCursor: data.nextCursor,
    hasMore: data.hasMore || false,
  };
}

export async function toggleMessageReaction(
  messageId: string,
  userId: string,
  username: string,
  emoji: string
): Promise<Message> {
  const res = await fetch("/api/messages/react", {
    method: "POST",
    headers: jsonHeaders,
    body: JSON.stringify({ messageId, userId, username, emoji }),
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.error || "Failed to toggle reaction");
  }

  const data = await res.json();
  return data.data;
}

export async function updateMessagesStatus(
  messageIds: string[],
  status: "delivered" | "seen",
  chatId?: string
): Promise<boolean> {
  const res = await fetch("/api/messages/status", {
    method: "POST",
    headers: jsonHeaders,
    body: JSON.stringify({ messageIds, status, chatId }),
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.error || "Failed to update message status");
  }

  const data = await res.json();
  return data.success || false;
}
