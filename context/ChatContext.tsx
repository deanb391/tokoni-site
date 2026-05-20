// context/ChatContext.tsx
"use client";

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useRef,
  ReactNode,
} from "react";
import { useUser } from "./UserContext";
import { client } from "@/lib/appwrite";
import { Chat } from "@/lib/services/chats.service";
import { Message, MessageDraft } from "@/lib/services/messages.service";
import {
  getChatsForUser,
  createChat,
  updateTypingStatus,
  clearChatUnreadCount,
} from "@/lib/api/chats";
import {
  getMessagesByChat,
  sendMessage as apiSendMessage,
  toggleMessageReaction,
  updateMessagesStatus,
} from "@/lib/api/messages";
import { getUserById } from "@/lib/api/users";
import { getMyVendor } from "@/lib/api/vendors";
import { uploadToServer } from "@/lib/upload";

type UserCacheItem = {
  username: string;
  avatar: string;
  isVendor: boolean;
};

type ChatContextType = {
  chats: Chat[];
  messages: Message[];
  activeChatId: string | null;
  chatsLoading: boolean;
  messagesLoading: boolean;
  hasMoreMessages: boolean;
  loadingMoreMessages: boolean;
  loadMoreMessages: () => Promise<void>;
  userCache: Record<string, UserCacheItem>;
  selectChat: (chatId: string | null) => Promise<void>;
  startChatWithUser: (otherUserId: string) => Promise<string>;
  sendTextMessage: (text: string, replyTo?: string) => Promise<void>;
  sendMediaMessage: (file: File, type: "image" | "video", text?: string, replyTo?: string) => Promise<void>;
  reactToMessage: (messageId: string, emoji: string) => Promise<void>;
  setTypingState: (isTyping: boolean) => Promise<void>;
  fetchUserProfile: (userId: string) => Promise<UserCacheItem | null>;
  sessionOpenedTime: string;
};

const ChatContext = createContext<ChatContextType | undefined>(undefined);

const DATABASE_ID = process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID || "6a0b4741002e8ae14adc";
const CHAT_COLLECTION = "chat";
const MESSAGE_COLLECTION = "message";

export function ChatProvider({ children }: { children: ReactNode }) {
  const { user } = useUser();
  const [chats, setChats] = useState<Chat[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [activeChatId, setActiveChatId] = useState<string | null>(null);
  const [chatsLoading, setChatsLoading] = useState(false);
  const [messagesLoading, setMessagesLoading] = useState(false);
  const [hasMoreMessages, setHasMoreMessages] = useState(false);
  const [loadingMoreMessages, setLoadingMoreMessages] = useState(false);
  const [userCache, setUserCache] = useState<Record<string, UserCacheItem>>({});
  const [sessionOpenedTime, setSessionOpenedTime] = useState<string>("");

  const nextCursorRef = useRef<string | undefined>(undefined);
  const activeChatIdRef = useRef<string | null>(null);
  const userRef = useRef<any>(null);
  const chatsRef = useRef<Chat[]>([]);

  // Update refs to ensure realtime callbacks always access the freshest state
  useEffect(() => {
    activeChatIdRef.current = activeChatId;
  }, [activeChatId]);

  useEffect(() => {
    userRef.current = user;
  }, [user]);

  useEffect(() => {
    chatsRef.current = chats;
  }, [chats]);

  // Retrieve user profile or load from cache
  const fetchUserProfile = useCallback(
    async (userId: string): Promise<UserCacheItem | null> => {
      if (userCache[userId]) return userCache[userId];
      try {
        const profile = await getUserById(userId);
        if (profile) {
          let username = profile.username || "User";
          let avatar = profile.avatar || "";

          if (profile.isVendor) {
            try {
              const vendorData = await getMyVendor(userId);
              if (vendorData) {
                username = vendorData.businessName || username;
                avatar = vendorData.logoImage || avatar;
              }
            } catch (vendorErr) {
              console.warn(`Error fetching vendor details for user profile ${userId}:`, vendorErr);
            }
          }

          const item: UserCacheItem = {
            username,
            avatar,
            isVendor: !!profile.isVendor,
          };
          setUserCache((prev) => ({ ...prev, [userId]: item }));
          return item;
        }
      } catch (err) {
        console.error(`Error caching user profile for ${userId}:`, err);
      }
      return null;
    },
    [userCache]
  );

  // Load user chats on mount or user login
  const loadChats = useCallback(async () => {
    if (!user?.$id) return;
    setChatsLoading(true);
    try {
      const userChats = await getChatsForUser(user.$id);
      setChats(userChats);

      // Pre-fetch profiles for other participants in chats
      const otherParticipantIds = Array.from(
        new Set(
          userChats.flatMap((chat) =>
            chat.participants.filter((p) => p !== user.$id)
          )
        )
      );

      await Promise.all(
        otherParticipantIds.map((id) => fetchUserProfile(id).catch(() => null))
      );
    } catch (err) {
      console.error("Error loading user chats:", err);
    } finally {
      setChatsLoading(false);
    }
  }, [user?.$id, fetchUserProfile]);

  useEffect(() => {
    if (user?.$id) {
      loadChats();
    } else {
      setChats([]);
      setActiveChatId(null);
      setMessages([]);
    }
  }, [user?.$id, loadChats]);

  // Setup Appwrite Realtime Subscriptions
  useEffect(() => {
    if (!user?.$id) return;

    // 1. Subscribe to Chat Collection changes
    const chatChannel = `databases.${DATABASE_ID}.collections.${CHAT_COLLECTION}.documents`;
    const unsubscribeChats = client.subscribe(chatChannel, (response) => {
      const eventType = response.events[0];
      const doc: any = response.payload;

      // Only handle if current user is a participant
      const participants = Array.isArray(doc.participants)
        ? doc.participants
        : JSON.parse(doc.participants || "[]");

      if (!participants.includes(user.$id)) return;

      const parsedChat = {
        $id: doc.$id,
        participants,
        lastMessage: doc.lastMessage || "",
        lastMessageSenderId: doc.lastMessageSenderId || "",
        lastMessageAt: doc.lastMessageAt || "",
        unreadCounts: typeof doc.unreadCounts === "string" ? JSON.parse(doc.unreadCounts) : doc.unreadCounts || {},
        typingUsers: Array.isArray(doc.typingUsers) ? doc.typingUsers : JSON.parse(doc.typingUsers || "[]"),
        $createdAt: doc.$createdAt,
        $updatedAt: doc.$updatedAt,
      };

      if (eventType.includes(".create")) {
        setChats((prev) => {
          if (prev.some((c) => c.$id === parsedChat.$id)) return prev;
          return [parsedChat, ...prev];
        });
        // Pre-fetch new participant profile
        const otherId = participants.find((p: string) => p !== user.$id);
        if (otherId) fetchUserProfile(otherId);
      } else if (eventType.includes(".update")) {
        setChats((prev) => {
          const filtered = prev.filter((c) => c.$id !== parsedChat.$id);
          // Sort by last message recency
          return [parsedChat, ...filtered].sort(
            (a, b) =>
              new Date(b.lastMessageAt || b.$createdAt).getTime() -
              new Date(a.lastMessageAt || a.$createdAt).getTime()
          );
        });

        // If the updated chat is active, automatically reset unread count
        if (parsedChat.$id === activeChatIdRef.current) {
          const currentUnread = parsedChat.unreadCounts[user.$id] || 0;
          if (currentUnread > 0) {
            clearChatUnreadCount(parsedChat.$id, user.$id).catch(() => null);
          }
        }
      }
    });

    // 2. Subscribe to Message Collection changes
    const msgChannel = `databases.${DATABASE_ID}.collections.${MESSAGE_COLLECTION}.documents`;
    const unsubscribeMessages = client.subscribe(msgChannel, (response) => {
      const eventType = response.events[0];
      const doc: any = response.payload;

      // Only handle if current user is a participant of this chat
      const currentUser = userRef.current;
      if (currentUser && doc.senderId !== currentUser.$id) {
        const isParticipant = chatsRef.current.some((c) => c.$id === doc.chatId);
        if (isParticipant) {
          if (eventType.includes(".create")) {
            if (doc.chatId === activeChatIdRef.current) {
              updateMessagesStatus([doc.$id], "seen", doc.chatId).catch(() => null);
            } else {
              updateMessagesStatus([doc.$id], "delivered", doc.chatId).catch(() => null);
            }
          }
        }
      }

      // Only handle local messages state updates if message belongs to active chat
      if (doc.chatId !== activeChatIdRef.current) return;

      const parsedMessage: Message = {
        $id: doc.$id,
        chatId: doc.chatId,
        senderId: doc.senderId,
        text: doc.text || "",
        media: Array.isArray(doc.media) ? doc.media : JSON.parse(doc.media || "[]"),
        mediaType: doc.mediaType || "none",
        replyTo: doc.replyTo || "",
        reactions: typeof doc.reactions === "string" ? JSON.parse(doc.reactions) : doc.reactions || [],
        status: doc.status || "sent",
        $createdAt: doc.$createdAt,
        $updatedAt: doc.$updatedAt,
      };

      if (eventType.includes(".create")) {
        setMessages((prev) => {
          if (prev.some((m) => m.$id === parsedMessage.$id)) return prev;
          return [...prev, parsedMessage];
        });

        // Mark as read in the database
        if (currentUser && parsedMessage.senderId !== currentUser.$id) {
          clearChatUnreadCount(doc.chatId, currentUser.$id).catch(() => null);
        }
      } else if (eventType.includes(".update")) {
        setMessages((prev) =>
          prev.map((m) => (m.$id === parsedMessage.$id ? parsedMessage : m))
        );
      }
    });

    return () => {
      unsubscribeChats();
      unsubscribeMessages();
    };
  }, [user?.$id, fetchUserProfile]);

  // Select a chat and fetch its thread
  const selectChat = useCallback(async (chatId: string | null) => {
    setActiveChatId(chatId);
    if (!chatId) {
      setMessages([]);
      setSessionOpenedTime("");
      setHasMoreMessages(false);
      nextCursorRef.current = undefined;
      return;
    }

    setMessagesLoading(true);
    setSessionOpenedTime(new Date().toISOString());
    setHasMoreMessages(false);
    nextCursorRef.current = undefined;

    try {
      const res = await getMessagesByChat(chatId, 30);
      setMessages(res.messages);
      nextCursorRef.current = res.nextCursor;
      setHasMoreMessages(res.hasMore);

      // Reset local unread counts in state
      setChats((prev) =>
        prev.map((c) => {
          if (c.$id === chatId && user?.$id) {
            const unreadCounts = { ...c.unreadCounts };
            unreadCounts[user.$id] = 0;
            return { ...c, unreadCounts };
          }
          return c;
        })
      );

      // Reset in Appwrite DB
      if (user?.$id) {
        await clearChatUnreadCount(chatId, user.$id);
        
        const unseenMsgIds = res.messages
          .filter((m) => m.senderId !== user.$id && m.status !== "seen")
          .map((m) => m.$id);

        if (unseenMsgIds.length > 0) {
          await updateMessagesStatus(unseenMsgIds, "seen", chatId).catch(() => null);
        }
      }
    } catch (err) {
      console.error("Error loading chat messages:", err);
    } finally {
      setMessagesLoading(false);
    }
  }, [user?.$id]);

  // Load older messages
  const loadMoreMessages = useCallback(async () => {
    if (!activeChatId || loadingMoreMessages || !hasMoreMessages || !nextCursorRef.current) return;
    setLoadingMoreMessages(true);
    try {
      const res = await getMessagesByChat(activeChatId, 30, nextCursorRef.current);
      setMessages((prev) => [...res.messages, ...prev]);
      nextCursorRef.current = res.nextCursor;
      setHasMoreMessages(res.hasMore);
    } catch (err) {
      console.error("Error loading more messages:", err);
    } finally {
      setLoadingMoreMessages(false);
    }
  }, [activeChatId, loadingMoreMessages, hasMoreMessages]);

  // Start chat or load existing chat with a user
  const startChatWithUser = useCallback(
    async (otherUserId: string): Promise<string> => {
      if (!user?.$id) throw new Error("User must be logged in to start a chat");
      try {
        const chatDoc = await createChat([user.$id, otherUserId]);
        
        // Add to local state if not present
        setChats((prev) => {
          if (prev.some((c) => c.$id === chatDoc.$id)) return prev;
          return [chatDoc, ...prev];
        });

        // Cache the other user's profile
        await fetchUserProfile(otherUserId);

        // Open the chat
        await selectChat(chatDoc.$id);
        return chatDoc.$id;
      } catch (err) {
        console.error("Error starting chat with user:", err);
        throw err;
      }
    },
    [user?.$id, fetchUserProfile, selectChat]
  );

  // Send textual message
  const sendTextMessage = useCallback(
    async (text: string, replyTo?: string) => {
      if (!activeChatId || !user?.$id) return;

      const draft: MessageDraft = {
        chatId: activeChatId,
        senderId: user.$id,
        text,
        mediaType: "none",
        replyTo,
      };

      try {
        await apiSendMessage(draft);
        // Clearing typing indicator on send
        updateTypingStatus(activeChatId, user.$id, false).catch(() => null);
      } catch (err) {
        console.error("Error sending message:", err);
      }
    },
    [activeChatId, user?.$id]
  );

  // Upload and send image/video attachments
  const sendMediaMessage = useCallback(
    async (file: File, type: "image" | "video", text?: string, replyTo?: string) => {
      if (!activeChatId || !user?.$id) return;

      try {
        // 1. Upload to storage
        const mediaUrl = await uploadToServer(file, "chats", type);

        // 2. Send message with media payload
        const draft: MessageDraft = {
          chatId: activeChatId,
          senderId: user.$id,
          text,
          media: [mediaUrl],
          mediaType: type,
          replyTo,
        };

        await apiSendMessage(draft);
      } catch (err) {
        console.error("Error sending media message:", err);
        throw err;
      }
    },
    [activeChatId, user?.$id]
  );

  // React to message
  const reactToMessage = useCallback(
    async (messageId: string, emoji: string) => {
      if (!user?.$id) return;
      try {
        await toggleMessageReaction(messageId, user.$id, user.username, emoji);
      } catch (err) {
        console.error("Error reacting to message:", err);
      }
    },
    [user?.$id]
  );

  // Toggle client typing state
  const setTypingState = useCallback(
    async (isTyping: boolean) => {
      if (!activeChatId || !user?.$id) return;
      try {
        await updateTypingStatus(activeChatId, user.$id, isTyping);
      } catch (err) {
        console.warn("Failed to update typing status:", err);
      }
    },
    [activeChatId, user?.$id]
  );

  return (
    <ChatContext.Provider
      value={{
        chats,
        messages,
        activeChatId,
        chatsLoading,
        messagesLoading,
        hasMoreMessages,
        loadingMoreMessages,
        loadMoreMessages,
        userCache,
        selectChat,
        startChatWithUser,
        sendTextMessage,
        sendMediaMessage,
        reactToMessage,
        setTypingState,
        fetchUserProfile,
        sessionOpenedTime,
      }}
    >
      {children}
    </ChatContext.Provider>
  );
}

export function useChat() {
  const context = useContext(ChatContext);
  if (!context) {
    throw new Error("useChat must be used within a ChatProvider");
  }
  return context;
}
