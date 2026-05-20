// lib/api/chats.ts
import { Chat } from "@/lib/services/chats.service";

const jsonHeaders = {
  "Content-Type": "application/json",
};

export async function createChat(participants: string[]): Promise<Chat> {
  const res = await fetch("/api/chats/create", {
    method: "POST",
    headers: jsonHeaders,
    body: JSON.stringify({ participants }),
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.error || "Failed to create or fetch chat");
  }

  const data = await res.json();
  return data.data;
}

export async function getChatsForUser(userId: string): Promise<Chat[]> {
  const res = await fetch(`/api/chats/list?userId=${encodeURIComponent(userId)}`, {
    method: "GET",
    headers: jsonHeaders,
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.error || "Failed to fetch chats");
  }

  const data = await res.json();
  return data.chats || [];
}

export async function updateTypingStatus(
  chatId: string,
  userId: string,
  isTyping: boolean
): Promise<Chat> {
  const res = await fetch("/api/chats/typing", {
    method: "POST",
    headers: jsonHeaders,
    body: JSON.stringify({ chatId, userId, isTyping }),
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.error || "Failed to update typing status");
  }

  const data = await res.json();
  return data.data;
}

export async function clearChatUnreadCount(
  chatId: string,
  userId: string
): Promise<Chat> {
  const res = await fetch("/api/chats/clear-unread", {
    method: "POST",
    headers: jsonHeaders,
    body: JSON.stringify({ chatId, userId }),
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.error || "Failed to clear unread counts");
  }

  const data = await res.json();
  return data.data;
}
