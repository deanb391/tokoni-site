// app/chats/page.tsx
"use client";

import React, { useState, useEffect } from "react";
import ChatsSidebar from "@/components/chats/ChatsSidebar";
import { useUser } from "@/context/UserContext";

export default function ChatsPage() {
  const { user, loading } = useUser();
  const [isMobile, setIsMobile] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const mobile = mounted ? isMobile : false;

  if (loading) {
    return (
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          height: "calc(100vh - 73px)",
          backgroundColor: "#FFFFFF",
          fontFamily: "var(--font-body), sans-serif",
          color: "#666",
        }}
      >
        Loading messages...
      </div>
    );
  }

  if (!user) {
    return (
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          height: "calc(100vh - 73px)",
          backgroundColor: "#FFFFFF",
          fontFamily: "var(--font-body), sans-serif",
          padding: "2rem",
          textAlign: "center",
          gap: "1.5rem",
        }}
      >
        <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="#B9001B" strokeWidth="1.5">
          <path d="M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z"></path>
          <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1Z"></path>
        </svg>
        <div>
          <h2 style={{ fontSize: "20px", fontWeight: "700", color: "#111", marginBottom: "8px" }}>
            Access Denied
          </h2>
          <p style={{ fontSize: "14px", color: "#666", maxWidth: "400px" }}>
            Please sign in to view and send messages.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        height: mobile ? "calc(100vh - 116px)" : "calc(100vh - 73px)",
        backgroundColor: "#FFFFFF",
        fontFamily: "var(--font-body), sans-serif",
      }}
    >
      <div style={{ display: "flex", flex: 1, overflow: "hidden" }}>
        {/* Sidebar Panel */}
        <div style={{ width: mobile ? "100%" : "340px", height: "100%", borderRight: mobile ? "none" : "1px solid #EDEDED", flexShrink: 0 }}>
          <ChatsSidebar activeChatId={null} />
        </div>

        {/* Empty state panel on desktop */}
        {!mobile && (
          <div
            style={{
              flex: 1,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              backgroundColor: "#F9FAFB",
              padding: "2rem",
              textAlign: "center",
              gap: "1.5rem",
            }}
          >
            {/* Visual background circles card */}
            <div
              style={{
                width: "80px",
                height: "80px",
                borderRadius: "50%",
                backgroundColor: "#FFF0F2",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                boxShadow: "0 8px 16px rgba(185, 0, 27, 0.05)",
              }}
            >
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#B9001B" strokeWidth="1.5">
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
              </svg>
            </div>
            <div>
              <h3 style={{ fontSize: "18px", fontWeight: "700", color: "#111", marginBottom: "8px" }}>
                Your Inbox
              </h3>
              <p style={{ fontSize: "14px", color: "#666", maxWidth: "320px", lineHeight: "1.5" }}>
                Select a conversation from the sidebar list to start exchanging messages.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}