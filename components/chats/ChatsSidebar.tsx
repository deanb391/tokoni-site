// components/chats/ChatsSidebar.tsx
"use client";

import React, { useState } from "react";
import { useChat } from "@/context/ChatContext";
import { useUser } from "@/context/UserContext";
import { useRouter } from 'nextjs-toploader/app';

import { Chat } from "@/lib/services/chats.service";

// --- Inline SVGs for Icons ---
const SearchIcon = ({ color = "#666" }) => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="11" cy="11" r="8"></circle>
    <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
  </svg>
);

export default function ChatsSidebar({ activeChatId }: { activeChatId?: string | null }) {
  const { chats, userCache, chatsLoading } = useChat();
  const { user } = useUser();
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [filterTab, setFilterTab] = useState<"all" | "unread" | "vendors">("all");

  const formatChatTime = (isoString?: string) => {
    if (!isoString) return "";
    const date = new Date(isoString);
    const now = new Date();

    // Check if today
    if (date.toDateString() === now.toDateString()) {
      return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    }

    // Check if yesterday
    const yesterday = new Date(now);
    yesterday.setDate(now.getDate() - 1);
    if (date.toDateString() === yesterday.toDateString()) {
      return "Yesterday";
    }

    // Check if within 7 days
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    if (diffDays < 7) {
      return date.toLocaleDateString([], { weekday: "short" });
    }

    // Older
    return date.toLocaleDateString([], { month: "short", day: "numeric" });
  };

  // Filter logic
  const filteredChats = chats.filter((chat) => {
    if (!user?.$id) return false;
    const otherUserId = chat.participants.find((p) => p !== user.$id);
    const otherProfile = otherUserId ? userCache[otherUserId] : null;

    // Search query matching
    const nameToMatch = otherProfile?.username || otherUserId || "";
    if (searchQuery && !nameToMatch.toLowerCase().includes(searchQuery.toLowerCase())) {
      return false;
    }

    // Tab filtering
    if (filterTab === "unread") {
      const unreadCount = chat.unreadCounts[user.$id] || 0;
      if (unreadCount === 0) return false;
    } else if (filterTab === "vendors") {
      if (!otherProfile?.isVendor) return false;
    }

    return true;
  });

  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        backgroundColor: "#FFFFFF",
      }}
    >
      <style>{`
        .chat-item-bounce {
          transition: transform 0.1s ease, background-color 0.15s ease !important;
        }
        .chat-item-bounce:active {
          transform: scale(0.96) !important;
        }
      `}</style>
      {/* Sidebar Search */}
      <div style={{ padding: "1rem" }}>
        <div style={{ position: "relative", display: "flex", alignItems: "center" }}>
          <div style={{ position: "absolute", left: "14px" }}>
            <SearchIcon />
          </div>
          <input
            type="text"
            placeholder="Search messages..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              width: "100%",
              backgroundColor: "#F5F5F5",
              border: "none",
              borderRadius: "12px",
              padding: "0.75rem 1rem 0.75rem 2.5rem",
              fontSize: "14px",
              outline: "none",
              color: "#111",
              boxSizing: "border-box",
            }}
          />
        </div>
      </div>

      {/* Filter Pills */}
      <div
        style={{
          display: "flex",
          gap: "0.5rem",
          padding: "0 1rem 1rem",
          borderBottom: "1px solid #EDEDED",
        }}
      >
        <button
          onClick={() => setFilterTab("all")}
          style={{
            backgroundColor: filterTab === "all" ? "#FFF0F2" : "#F5F5F5",
            color: filterTab === "all" ? "#B9001B" : "#555555",
            border: "none",
            borderRadius: "20px",
            padding: "0.4rem 1rem",
            fontSize: "13px",
            fontWeight: filterTab === "all" ? "600" : "500",
            cursor: "pointer",
            transition: "all 0.2s ease",
          }}
        >
          All
        </button>
        <button
          onClick={() => setFilterTab("unread")}
          style={{
            backgroundColor: filterTab === "unread" ? "#FFF0F2" : "#F5F5F5",
            color: filterTab === "unread" ? "#B9001B" : "#555555",
            border: "none",
            borderRadius: "20px",
            padding: "0.4rem 1rem",
            fontSize: "13px",
            fontWeight: filterTab === "unread" ? "600" : "500",
            cursor: "pointer",
            transition: "all 0.2s ease",
          }}
        >
          Unread
        </button>
        <button
          onClick={() => setFilterTab("vendors")}
          style={{
            backgroundColor: filterTab === "vendors" ? "#FFF0F2" : "#F5F5F5",
            color: filterTab === "vendors" ? "#B9001B" : "#555555",
            border: "none",
            borderRadius: "20px",
            padding: "0.4rem 1rem",
            fontSize: "13px",
            fontWeight: filterTab === "vendors" ? "600" : "500",
            cursor: "pointer",
            transition: "all 0.2s ease",
          }}
        >
          Vendors
        </button>
      </div>

      {/* Chat List */}
      <div style={{ flex: 1, overflowY: "auto" }}>
        {chatsLoading ? (
          <div style={{ display: "flex", flexDirection: "column" }}>
            {[1, 2, 3, 4, 5].map((idx) => (
              <div
                key={`chat-shimmer-${idx}`}
                style={{
                  display: "flex",
                  padding: "1.25rem 1rem",
                  borderBottom: "1px solid #F5F5F5",
                  alignItems: "center",
                }}
              >
                {/* Skeleton Avatar */}
                <div className="skeleton" style={{ width: "44px", height: "44px", borderRadius: "50%", marginRight: "12px", flexShrink: 0 }} />
                
                {/* Skeleton Info */}
                <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: "8px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <div className="skeleton" style={{ width: "80px", height: "14px", borderRadius: "4px" }} />
                    <div className="skeleton" style={{ width: "40px", height: "10px", borderRadius: "4px" }} />
                  </div>
                  <div className="skeleton" style={{ width: "150px", height: "12px", borderRadius: "4px" }} />
                </div>
              </div>
            ))}
            <style jsx global>{`
              .skeleton {
                background: linear-gradient(90deg, #F3F4F6 25%, #E5E7EB 50%, #F3F4F6 75%);
                background-size: 200% 100%;
                animation: loading 1.5s infinite;
              }
              @keyframes loading {
                0% { background-position: 200% 0; }
                100% { background-position: -200% 0; }
              }
            `}</style>
          </div>
        ) : filteredChats.length === 0 ? (
          <div
            style={{
              padding: "3rem 1.5rem",
              textAlign: "center",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: "12px",
            }}
          >
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#CCC" strokeWidth="1.5">
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
            </svg>
            <div style={{ fontSize: "15px", fontWeight: "600", color: "#666" }}>No chats found</div>
            <div style={{ fontSize: "13px", color: "#999" }}>
              {searchQuery ? "Try checking your spelling or filter settings." : "Once you start messaging sellers, they will appear here."}
            </div>
          </div>
        ) : (
          filteredChats.map((chat) => {
            const otherUserId = chat.participants.find((p) => p !== user?.$id) || "";
            const otherProfile = userCache[otherUserId];
            const unreadCount = user?.$id ? chat.unreadCounts[user.$id] || 0 : 0;
            const isUnread = unreadCount > 0;
            const isTyping = chat.typingUsers.length > 0 && chat.typingUsers.includes(otherUserId);
            const isActive = chat.$id === activeChatId;

            const name = otherProfile?.username || "Loading...";
            const avatar = otherProfile?.avatar || "";
            const isVendor = !!otherProfile?.isVendor;
            const initials = name.slice(0, 1).toUpperCase();

            // Set background color of initials dynamically for a unique clean color palette
            const colors = ["#3B4A3F", "#0284C7", "#10B981", "#B9001B", "#6366F1", "#8B5CF6"];
            const hash = otherUserId.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0);
            const avatarBg = colors[hash % colors.length];

            return (
              <div
                key={chat.$id}
                onClick={() => router.push(`/chats/${chat.$id}`)}
                className="chat-item-bounce"
                style={{
                  display: "flex",
                  padding: "1.25rem 1rem",
                  borderBottom: "1px solid #F5F5F5",
                  cursor: "pointer",
                  backgroundColor: isActive
                    ? "#FAFAFA"
                    : isUnread
                    ? "#FFF5F6"
                    : "#FFFFFF",
                  borderLeft: isActive ? "3px solid #B9001B" : "3px solid transparent",
                  transition: "all 0.15s ease",
                }}
              >
                {/* Avatar */}
                <div
                  style={{
                    width: "44px",
                    height: "44px",
                    borderRadius: "50%",
                    backgroundColor: avatarBg,
                    marginRight: "12px",
                    flexShrink: 0,
                    position: "relative",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    overflow: "hidden",
                  }}
                >
                  {avatar ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={avatar}
                      alt={name}
                      style={{ width: "100%", height: "100%", objectFit: "cover" }}
                    />
                  ) : (
                    <span style={{ color: "#FFF", fontWeight: "600", fontSize: "16px" }}>
                      {initials}
                    </span>
                  )}
                  {isVendor && (
                    <span
                      style={{
                        position: "absolute",
                        bottom: "0",
                        right: "0",
                        width: "12px",
                        height: "12px",
                        backgroundColor: "#B9001B",
                        borderRadius: "50%",
                        border: "2px solid #FFF",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                      title="Vendor"
                    />
                  )}
                </div>

                {/* Content */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "baseline",
                      marginBottom: "4px",
                    }}
                  >
                    <span
                      style={{
                        fontSize: "14px",
                        fontWeight: isUnread ? "700" : "600",
                        color: "#111",
                        whiteSpace: "nowrap",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                      }}
                    >
                      {name}
                    </span>
                    <span
                      style={{
                        fontSize: "12px",
                        color: isUnread ? "#B9001B" : "#888",
                        flexShrink: 0,
                        marginLeft: "8px",
                      }}
                    >
                      {formatChatTime(chat.lastMessageAt || chat.$updatedAt)}
                    </span>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <span
                      style={{
                        fontSize: "13.5px",
                        color: isTyping ? "#10B981" : isUnread ? "#111" : "#666",
                        whiteSpace: "nowrap",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        fontWeight: isUnread || isTyping ? "600" : "400",
                        fontStyle: isTyping ? "italic" : "normal",
                        display: "flex",
                        alignItems: "center",
                        gap: "4px",
                      }}
                    >
                      {!isTyping && chat.lastMessageSenderId === user?.$id && chat.lastMessage && (
                        <span style={{ display: "inline-flex", alignItems: "center", flexShrink: 0 }}>
                          {chat.lastMessageStatus === "seen" ? (
                            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#34B7F1" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                              <path d="M2 12l5 5L15 9" />
                              <path d="M8 12l5 5L22 9" />
                            </svg>
                          ) : chat.lastMessageStatus === "delivered" ? (
                            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#888888" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <path d="M2 12l5 5L15 9" />
                              <path d="M8 12l5 5L22 9" />
                            </svg>
                          ) : (
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#888888" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <path d="M5 12l5 5L20 7" />
                            </svg>
                          )}
                        </span>
                      )}
                      <span>
                        {isTyping ? "typing..." : chat.lastMessage || "No messages yet"}
                      </span>
                    </span>
                    {isUnread && (
                      <span
                        style={{
                          backgroundColor: "#B9001B",
                          color: "#FFF",
                          fontSize: "10px",
                          fontWeight: "700",
                          borderRadius: "50%",
                          minWidth: "16px",
                          height: "16px",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          padding: "0 4px",
                          boxSizing: "border-box",
                          flexShrink: 0,
                          marginLeft: "8px",
                        }}
                      >
                        {unreadCount}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
