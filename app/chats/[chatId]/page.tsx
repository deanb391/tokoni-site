// app/chats/[chatId]/page.tsx
"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from 'nextjs-toploader/app';
import { useParams, useSearchParams } from 'next/navigation';
import { useChat } from "@/context/ChatContext";
import { useUser } from "@/context/UserContext";
import ChatsSidebar from "@/components/chats/ChatsSidebar";
import { Message } from "@/lib/services/messages.service";
import { getProductById, getVendorProducts } from "@/lib/api/products";
import { getMyVendor } from "@/lib/api/vendors";
import { getCart, clearCart } from "@/lib/utils/cart";
import CartDrawer from "@/components/CartDrawer";
import { ShoppingBag, Search } from "lucide-react";
import NotificationOptInModal from "@/components/chats/NotificationOptInModal";

// --- Inline SVGs for Icons ---
const PhoneIcon = ({ color = "#111" }) => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path>
  </svg>
);

const MoreIcon = ({ color = "#111" }) => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="1"></circle>
    <circle cx="12" cy="5" r="1"></circle>
    <circle cx="12" cy="19" r="1"></circle>
  </svg>
);

const PlusIcon = ({ color = "#111" }) => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="12" y1="5" x2="12" y2="19"></line>
    <line x1="5" y1="12" x2="19" y2="12"></line>
  </svg>
);

const SendIcon = ({ color = "#FFF" }) => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="22" y1="2" x2="11" y2="13"></line>
    <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
  </svg>
);

const BackIcon = ({ color = "#111" }) => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="15 18 9 12 15 6"></polyline>
  </svg>
);

const ReplyIcon = ({ color = "#666" }) => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="9 17 4 12 9 7"></polyline>
    <path d="M20 18v-2a4 4 0 0 0-4-4H4"></path>
  </svg>
);

const ReactionIcon = ({ color = "#666" }) => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10"></circle>
    <path d="M8 14s1.5 2 4 2 4-2 4-2"></path>
    <line x1="9" y1="9" x2="9.01" y2="9"></line>
    <line x1="15" y1="9" x2="15.01" y2="9"></line>
  </svg>
);

const CloseIcon = ({ color = "#666", size = 16 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="6" x2="6" y2="18"></line>
    <line x1="6" y1="6" x2="18" y2="18"></line>
  </svg>
);

// Reaction set approved by user
const REACTION_LIST = ["❤️", "👍", "😂", "😢", "🙏"];

const truncateText = (text: string, maxLength: number = 60) => {
  if (!text) return "";
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength) + "...";
};

export default function ChatDetailPage() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const chatId = params.chatId as string;

  const { user } = useUser();
  const {
    chats,
    messages,
    messagesLoading,
    hasMoreMessages,
    loadingMoreMessages,
    loadMoreMessages,
    userCache,
    selectChat,
    sendTextMessage,
    sendMediaMessage,
    reactToMessage,
    setTypingState,
    fetchUserProfile,
  } = useChat();

  const [isMobile, setIsMobile] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [inputText, setInputText] = useState("");
  const [isTypingLocal, setIsTypingLocal] = useState(false);
  const [replyMessage, setReplyMessage] = useState<Message | null>(null);

  // Media upload state
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [fileType, setFileType] = useState<"image" | "video" | null>(null);
  const [filePreview, setFilePreview] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  // Full-screen media view overlay
  const [activeMediaOverlay, setActiveMediaOverlay] = useState<{ url: string; type: "image" | "video" } | null>(null);

  // Context Menu State
  const [activeMenuMessageId, setActiveMenuMessageId] = useState<string | null>(null);
  const [menuCoords, setMenuCoords] = useState<{ x: number; y: number } | null>(null);

  // Slide-to-reply State
  const [swipingMessageId, setSwipingMessageId] = useState<string | null>(null);
  const [slideOffset, setSlideOffset] = useState<number>(0);
  const swipeStartXRef = useRef<number>(0);
  const swipeStartYRef = useRef<number>(0);
  const isSwipeDirectionLockedRef = useRef<boolean>(false);

  // Longpress timer ref
  const touchTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Unread messages separator state
  const [initialUnreadCount, setInitialUnreadCount] = useState<number>(0);

  // Shopping Cart drawer views
  const [activeCartItems, setActiveCartItems] = useState<any[]>([]);
  const [isChatCartOpen, setIsChatCartOpen] = useState(false);

  // Auto-send and tagging states
  const [attachedProduct, setAttachedProduct] = useState<any | null>(null);

  // Vendor & Product query states for product tagging modal
  const [myVendor, setMyVendor] = useState<any | null>(null);
  const [otherVendor, setOtherVendor] = useState<any | null>(null);
  const [myProducts, setMyProducts] = useState<any[]>([]);
  const [otherProducts, setOtherProducts] = useState<any[]>([]);
  const [isLoadingProducts, setIsLoadingProducts] = useState(false);

  // Product tagging popup controls
  const [activeTagTab, setActiveTagTab] = useState<"me" | "other">("other");
  const [tagSearchQuery, setTagSearchQuery] = useState("");

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const typingTimerRef = useRef<NodeJS.Timeout | null>(null);
  const processedParamsRef = useRef<{ sendCart?: string; autoSendProduct?: string }>({});
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Capture initial unread count before selectChat clears it
  useEffect(() => {
    if (chatId && user?.$id) {
      const chat = chats.find((c) => c.$id === chatId);
      if (chat) {
        setInitialUnreadCount(chat.unreadCounts[user.$id] || 0);
      }
    }
  }, [chatId, chats, user?.$id]);

  const handleContextMenu = (msgId: string, e: React.MouseEvent) => {
    e.preventDefault();
    setActiveMenuMessageId(msgId);
    setMenuCoords({ x: e.clientX, y: e.clientY });
  };

  const handleSwipeStart = (msgId: string, e: React.TouchEvent) => {
    const touch = e.touches[0];
    swipeStartXRef.current = touch.clientX;
    swipeStartYRef.current = touch.clientY;
    setSwipingMessageId(msgId);
    setSlideOffset(0);
    isSwipeDirectionLockedRef.current = false;

    if (touchTimerRef.current) clearTimeout(touchTimerRef.current);
    const clientX = touch.clientX;
    const clientY = touch.clientY;
    touchTimerRef.current = setTimeout(() => {
      setActiveMenuMessageId(msgId);
      setMenuCoords({ x: clientX, y: clientY });
      if (navigator.vibrate) navigator.vibrate(50);
    }, 600);
  };

  const handleSwipeMove = (msgId: string, e: React.TouchEvent) => {
    if (swipingMessageId !== msgId) return;
    const touch = e.touches[0];
    const diffX = touch.clientX - swipeStartXRef.current;
    const diffY = touch.clientY - swipeStartYRef.current;

    // lock swipe direction if displacement is substantial
    if (!isSwipeDirectionLockedRef.current) {
      if (Math.abs(diffX) > 8 || Math.abs(diffY) > 8) {
        isSwipeDirectionLockedRef.current = true;
      }
    }

    // Cancel horizontal swipe if vertical scroll is dominant
    if (isSwipeDirectionLockedRef.current && Math.abs(diffY) > Math.abs(diffX)) {
      setSlideOffset(0);
      return;
    }

    // If user dragged more than 10px, cancel longpress
    if (Math.abs(diffX) > 10 && touchTimerRef.current) {
      clearTimeout(touchTimerRef.current);
      touchTimerRef.current = null;
    }

    if (diffX > 0) {
      const cappedOffset = Math.min(80, diffX);
      setSlideOffset(cappedOffset);
    }
  };

  const handleSwipeEnd = (msg: Message) => {
    if (touchTimerRef.current) {
      clearTimeout(touchTimerRef.current);
      touchTimerRef.current = null;
    }

    if (swipingMessageId === msg.$id) {
      if (slideOffset > 50) {
        handleReplyToggle(msg);
        if (navigator.vibrate) navigator.vibrate(30);
      }
    }
    setSlideOffset(0);
    setTimeout(() => {
      setSwipingMessageId(null);
    }, 250);
  };

  // Detect responsive view layout
  useEffect(() => {
    setMounted(true);
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const mobile = mounted ? isMobile : false;

  // Sync route param with Context active chat
  useEffect(() => {
    if (chatId) {
      selectChat(chatId);
    }
    return () => {
      selectChat(null);
    };
  }, [chatId, selectChat]);

  // Scroll to bottom helper
  const scrollToBottom = (behavior: ScrollBehavior = "smooth") => {
    messagesEndRef.current?.scrollIntoView({ behavior, block: "nearest" });
  };

  useEffect(() => {
    if (messages.length > 0) {
      scrollToBottom("instant");
    }
  }, [messagesLoading, chatId]);

  // Scroll to bottom when new messages arrive
  useEffect(() => {
    if (messages.length > 0) {
      scrollToBottom("smooth");
    }
  }, [messages.length]);

  // Retrieve current active chat metadata
  const currentChat = chats.find((c) => c.$id === chatId);
  const otherUserId = currentChat?.participants.find((p) => p !== user?.$id) || "";
  const otherProfile = userCache[otherUserId];
  const otherName = otherProfile?.username || "Loading...";
  const otherAvatar = otherProfile?.avatar || "";
  const isOtherTyping = currentChat?.typingUsers.includes(otherUserId) || false;
  const isOtherVendor = !!otherProfile?.isVendor;

  const sendCartParam = searchParams?.get("sendCart");
  const vendorIdParam = searchParams?.get("vendorId");
  const autoSendProductId = searchParams?.get("autoSendProductId");

  // Load products & vendor details for the tag modal
  useEffect(() => {
    async function fetchVendorsAndProducts() {
      if (!user?.$id) return;
      setIsLoadingProducts(true);
      try {
        // Fetch current user vendor details & products
        const myV = await getMyVendor(user.$id);
        setMyVendor(myV);
        if (myV?.$id) {
          const myProds = await getVendorProducts(myV.$id);
          setMyProducts(myProds);
        }

        // Fetch other user vendor details & products
        if (otherUserId) {
          const otherV = await getMyVendor(otherUserId);
          setOtherVendor(otherV);
          if (otherV?.$id) {
            const otherProds = await getVendorProducts(otherV.$id);
            setOtherProducts(otherProds);
          }
        }
      } catch (err) {
        console.error("Error loading chat vendor/products:", err);
      } finally {
        setIsLoadingProducts(false);
      }
    }
    if (mounted && user?.$id && otherUserId) {
      fetchVendorsAndProducts();
    }
  }, [mounted, user?.$id, otherUserId]);

  // Handle URL query parameters for Cart Sending and Product Auto-Sending
  useEffect(() => {
    async function processQueryParams() {
      if (messagesLoading) return; // Wait for message fetching to settle

      // 1. Send Cart
      if (sendCartParam === "true" && vendorIdParam) {
        const actionKey = `${chatId}-${vendorIdParam}`;
        if (processedParamsRef.current.sendCart === actionKey) return;
        processedParamsRef.current.sendCart = actionKey;

        const cartItems = getCart(vendorIdParam);
        // Clear cart immediately so that concurrent re-runs don't find it
        clearCart(vendorIdParam);

        if (cartItems.length > 0) {
          try {
            // Format and send message
            const cartMessageText = "__TOKONI_CART__:" + JSON.stringify(cartItems);
            await sendTextMessage(cartMessageText);
            import("@/lib/api/admin").then(({ logActivity }) => {
              logActivity("cart_sent", vendorIdParam);
            }).catch(e => console.error(e));
          } catch (err) {
            console.error("Failed to send cart message:", err);
          }
        }
        // Clean URL query params
        router.replace(`/chats/${chatId}`);
        return;
      }

      // 2. Product Auto-Send context
      if (autoSendProductId) {
        const actionKey = `${chatId}-${autoSendProductId}`;
        if (processedParamsRef.current.autoSendProduct === actionKey) return;
        processedParamsRef.current.autoSendProduct = actionKey;

        try {
          const productData = await getProductById(autoSendProductId);
          if (productData) {
            const productContextPayload = {
              productId: productData.$id,
              name: productData.name,
              price: productData.discountPrice || productData.price,
              image: productData.images?.[0] || ""
            };

            // If chat has 0 messages, auto-send immediate message context
            if (messages.length === 0) {
              const autoMsgText = "__TOKONI_PRODUCT_TAG__:" + JSON.stringify({
                ...productContextPayload,
                text: "Hi, I am interested in this product!"
              });
              await sendTextMessage(autoMsgText);
            } else {
              // Otherwise, pre-populate input and set attachedProduct to draft
              setAttachedProduct(productContextPayload);
              setInputText("Hi, I am interested in this product!");
              setTimeout(() => {
                if (textareaRef.current) {
                  textareaRef.current.style.height = "auto";
                  textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 120)}px`;
                }
              }, 50);
            }
          }
        } catch (err) {
          console.error("Failed to process auto-send product param:", err);
        }
        // Clean URL query params
        router.replace(`/chats/${chatId}`);
      }
    }

    if (mounted && chatId) {
      processQueryParams();
    }
  }, [mounted, chatId, messagesLoading, sendCartParam, vendorIdParam, autoSendProductId, messages.length]);

  const initials = otherName.slice(0, 1).toUpperCase();
  const colors = ["#3B4A3F", "#0284C7", "#10B981", "#B9001B", "#6366F1", "#8B5CF6"];
  const hash = otherUserId.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0);
  const avatarBg = colors[hash % colors.length];

  const lastAtIdx = inputText.lastIndexOf("@");
  const showTagModal = lastAtIdx !== -1 && (lastAtIdx === 0 || inputText[lastAtIdx - 1] === " ");

  const showMyTab = !!myVendor;
  const showOtherTab = !!otherVendor;

  // Sync tab selection state based on availability
  useEffect(() => {
    if (showOtherTab) {
      setActiveTagTab("other");
    } else if (showMyTab) {
      setActiveTagTab("me");
    }
  }, [showMyTab, showOtherTab]);

  const displayedProducts = (activeTagTab === "me" ? myProducts : otherProducts).filter(p => {
    const searchVal = tagSearchQuery.trim().toLowerCase();
    if (!searchVal) return true;
    return p.name.toLowerCase().includes(searchVal);
  });

  // Typing event handler with debounced typing-stop timeout
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputText(e.target.value);

    if (!isTypingLocal) {
      setIsTypingLocal(true);
      setTypingState(true);
    }

    if (typingTimerRef.current) clearTimeout(typingTimerRef.current);

    typingTimerRef.current = setTimeout(() => {
      setIsTypingLocal(false);
      setTypingState(false);
    }, 3000);
  };

  // Clear typing on submit
  const clearTypingTimer = () => {
    if (typingTimerRef.current) clearTimeout(typingTimerRef.current);
    setIsTypingLocal(false);
    setTypingState(false);
  };

  // Handle media selection
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const isImage = file.type.startsWith("image/");
    const isVideo = file.type.startsWith("video/");

    if (!isImage && !isVideo) {
      alert("Please select a valid image or video file.");
      return;
    }

    setSelectedFile(file);
    setFileType(isImage ? "image" : "video");
    setFilePreview(URL.createObjectURL(file));
  };

  // Remove media attachment selection
  const handleCancelMedia = () => {
    setSelectedFile(null);
    setFileType(null);
    if (filePreview) URL.revokeObjectURL(filePreview);
    setFilePreview(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  // Send message submit
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() && !selectedFile) return;

    let textToSend = inputText.trim();
    const replyToId = replyMessage?.$id || undefined;

    if (attachedProduct) {
      textToSend = "__TOKONI_PRODUCT_TAG__:" + JSON.stringify({
        productId: attachedProduct.productId,
        name: attachedProduct.name,
        price: attachedProduct.price,
        image: attachedProduct.image,
        text: textToSend
      });
      setAttachedProduct(null);
    }

    // Reset input indicators
    setInputText("");
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
    }
    setReplyMessage(null);
    clearTypingTimer();

    try {
      if (selectedFile && fileType) {
        setIsUploading(true);
        const file = selectedFile;
        const type = fileType;
        handleCancelMedia(); // clear picker UI preview

        await sendMediaMessage(file, type, textToSend, replyToId);
      } else {
        await sendTextMessage(textToSend, replyToId);
      }
    } catch (err) {
      console.error("Failed to send message:", err);
      alert("Failed to send message. Please try again.");
    } finally {
      setIsUploading(false);
    }
  };

  // Quick reply toggle
  const handleReplyToggle = (message: Message) => {
    setReplyMessage(message);
  };

  // Jump scroll to replied message element
  const handleJumpToParent = (replyToId: string) => {
    const element = document.getElementById(`msg-${replyToId}`);
    if (element) {
      element.scrollIntoView({ behavior: "smooth", block: "center" });
      element.style.transition = "background-color 0.5s ease";
      element.style.backgroundColor = "#FFF0F2";
      setTimeout(() => {
        element.style.backgroundColor = "transparent";
      }, 1000);
    }
  };

  // Group messages chronologically by Date
  const renderMessageGroups = () => {
    const groups: { [key: string]: Message[] } = {};
    messages.forEach((msg) => {
      const dateStr = new Date(msg.$createdAt).toDateString();
      if (!groups[dateStr]) groups[dateStr] = [];
      groups[dateStr].push(msg);
    });

    // Detect unread messages index for separation line
    const totalMessages = messages.length;
    const unreadStartIndex = totalMessages - initialUnreadCount;

    let globalIndex = 0;

    return Object.keys(groups).map((dateKey) => {
      const date = new Date(dateKey);
      const now = new Date();
      let headerText = date.toLocaleDateString([], { month: "short", day: "numeric", year: "numeric" });

      if (date.toDateString() === now.toDateString()) {
        headerText = "Today";
      } else {
        const yesterday = new Date(now);
        yesterday.setDate(now.getDate() - 1);
        if (date.toDateString() === yesterday.toDateString()) {
          headerText = "Yesterday";
        }
      }

      return (
        <div key={dateKey} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
          {/* Date Divider */}
          <div style={{ display: "flex", justifyContent: "center", margin: "0.5rem 0" }}>
            <span
              style={{
                backgroundColor: "#FFFFFF",
                border: "1px solid #EDEDED",
                padding: "4px 12px",
                borderRadius: "20px",
                fontSize: "11px",
                fontWeight: "600",
                color: "#555",
              }}
            >
              {headerText}
            </span>
          </div>

          {groups[dateKey].map((msg) => {
            const isOutgoing = msg.senderId === user?.$id;
            const messageIndex = globalIndex;
            globalIndex++;

            // Render new message divider line
            const showUnreadSeparator = initialUnreadCount > 0 && messageIndex === unreadStartIndex;

            // Resolve parent message reply metadata
            let replyParent: Message | undefined;
            if (msg.replyTo) {
              replyParent = messages.find((m) => m.$id === msg.replyTo);
            }

            const senderProfile = isOutgoing ? user : userCache[msg.senderId];
            const senderName = isOutgoing ? "You" : senderProfile?.username || "Loading...";

            // Group reactions by Emoji
            const reactionCounts = msg.reactions.reduce((acc, r) => {
              acc[r.emoji] = (acc[r.emoji] || 0) + 1;
              return acc;
            }, {} as Record<string, number>);

            return (
              <React.Fragment key={msg.$id}>
                {showUnreadSeparator && (
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      margin: "1rem 0",
                    }}
                  >
                    <div style={{ flex: 1, height: "1px", backgroundColor: "#B9001B", opacity: 0.2 }} />
                    <span
                      style={{
                        padding: "4px 10px",
                        fontSize: "11px",
                        fontWeight: "700",
                        color: "#B9001B",
                        backgroundColor: "#FFF0F2",
                        borderRadius: "12px",
                        margin: "0 10px",
                        letterSpacing: "0.5px",
                        textTransform: "uppercase",
                      }}
                    >
                      Unread Messages
                    </span>
                    <div style={{ flex: 1, height: "1px", backgroundColor: "#B9001B", opacity: 0.2 }} />
                  </div>
                )}

                <div
                  id={`msg-${msg.$id}`}
                  onContextMenu={(e) => handleContextMenu(msg.$id, e)}
                  onTouchStart={(e) => handleSwipeStart(msg.$id, e)}
                  onTouchMove={(e) => handleSwipeMove(msg.$id, e)}
                  onTouchEnd={() => handleSwipeEnd(msg)}
                  style={{
                    display: "flex",
                    justifyContent: isOutgoing ? "flex-end" : "flex-start",
                    alignItems: "flex-start",
                    gap: "8px",
                    position: "relative",
                    padding: "4px 0",
                  }}
                >
                  {/* Swipe reply indicator behind */}
                  {swipingMessageId === msg.$id && slideOffset > 10 && (
                    <div
                      style={{
                        position: "absolute",
                        left: isOutgoing ? "auto" : "40px",
                        right: isOutgoing ? "40px" : "auto",
                        top: "50%",
                        transform: "translateY(-50%)",
                        opacity: Math.min(1, slideOffset / 50),
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        color: "#B9001B",
                        zIndex: 0,
                      }}
                    >
                      <ReplyIcon color="#B9001B" />
                    </div>
                  )}

                  {/* Left Avatar for Incoming */}
                  {!isOutgoing && (
                    <div
                      style={{
                        width: "28px",
                        height: "28px",
                        borderRadius: "50%",
                        backgroundColor: avatarBg,
                        flexShrink: 0,
                        overflow: "hidden",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        marginTop: "2px",
                      }}
                    >
                      {otherAvatar ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={otherAvatar}
                          alt={otherName}
                          style={{ width: "100%", height: "100%", objectFit: "cover" }}
                        />
                      ) : (
                        <span style={{ color: "#FFF", fontWeight: "600", fontSize: "11px" }}>
                          {initials}
                        </span>
                      )}
                    </div>
                  )}

                  {/* Message Bubble Container */}
                  <div
                    style={{
                      maxWidth: "70%",
                      display: "flex",
                      flexDirection: "column",
                      alignItems: isOutgoing ? "flex-end" : "flex-start",
                      transform: swipingMessageId === msg.$id ? `translateX(${slideOffset}px)` : "translateX(0px)",
                      transition: swipingMessageId === msg.$id ? "none" : "transform 0.25s cubic-bezier(0.1, 0.8, 0.2, 1)",
                    }}
                  >
                    {/* Bubble Content Body */}
                    <div
                      style={{
                        backgroundColor: isOutgoing ? "#B9001B" : "#EFEAEB",
                        color: isOutgoing ? "#FFFFFF" : "#111",
                        padding: "10px 14px",
                        borderRadius: isOutgoing
                          ? "16px 4px 16px 16px"
                          : "4px 16px 16px 16px",
                        fontSize: "14.5px",
                        lineHeight: "1.45",
                        boxShadow: "0 1px 2px rgba(0,0,0,0.02)",
                        display: "flex",
                        flexDirection: "column",
                        gap: "6px",
                      }}
                    >
                      {/* Nested Reply Block */}
                      {replyParent && (
                        <div
                          onClick={() => handleJumpToParent(msg.replyTo!)}
                          style={{
                            backgroundColor: isOutgoing ? "rgba(255,255,255,0.12)" : "rgba(0,0,0,0.05)",
                            borderLeft: isOutgoing ? "3px solid #FFF" : "3px solid #B9001B",
                            padding: "6px 10px",
                            borderRadius: "4px",
                            fontSize: "12px",
                            cursor: "pointer",
                            marginBottom: "2px",
                            maxWidth: "100%",
                            opacity: 0.95,
                          }}
                        >
                          <div style={{ fontWeight: "700", marginBottom: "2px" }}>
                            {replyParent.senderId === user?.$id ? "You" : otherName}
                          </div>
                          <div style={{ whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                            {replyParent.text ? truncateText(replyParent.text, 30) : (replyParent.mediaType === "video" ? "🎥 Video file" : "📷 Image file")}
                          </div>
                        </div>
                      )}

                      {/* Message Media Preview (Images or Videos) */}
                      {msg.media && msg.media.length > 0 && (
                        <div style={{ marginTop: "2px", borderRadius: "10px", overflow: "hidden" }}>
                          {msg.media.map((url, i) => (
                            <div key={i} style={{ position: "relative" }}>
                              {msg.mediaType === "video" ? (
                                <div
                                  onClick={() => setActiveMediaOverlay({ url, type: "video" })}
                                  style={{ position: "relative", cursor: "zoom-in" }}
                                >
                                  <video
                                    muted
                                    playsInline
                                    style={{
                                      maxWidth: "100%",
                                      maxHeight: "320px",
                                      borderRadius: "10px",
                                      backgroundColor: "#000",
                                      display: "block",
                                    }}
                                  >
                                    <source src={url} />
                                  </video>
                                  {/* Custom play button overlay */}
                                  <div
                                    style={{
                                      position: "absolute",
                                      inset: 0,
                                      display: "flex",
                                      alignItems: "center",
                                      justifyContent: "center",
                                      backgroundColor: "rgba(0,0,0,0.25)",
                                      borderRadius: "10px",
                                    }}
                                  >
                                    <div
                                      style={{
                                        width: "44px",
                                        height: "44px",
                                        borderRadius: "50%",
                                        backgroundColor: "rgba(255,255,255,0.9)",
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "center",
                                        boxShadow: "0 4px 10px rgba(0,0,0,0.15)",
                                      }}
                                    >
                                      <svg width="18" height="18" viewBox="0 0 24 24" fill="#B9001B">
                                        <polygon points="5 3 19 12 5 21 5 3"></polygon>
                                      </svg>
                                    </div>
                                  </div>
                                </div>
                              ) : (
                                // eslint-disable-next-line @next/next/no-img-element
                                <img
                                  src={url}
                                  alt="Attachment"
                                  onClick={() => setActiveMediaOverlay({ url, type: "image" })}
                                  style={{
                                    maxWidth: "100%",
                                    maxHeight: "320px",
                                    borderRadius: "10px",
                                    objectFit: "contain",
                                    display: "block",
                                    cursor: "zoom-in",
                                  }}
                                />
                              )}
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Message Text */}
                      {msg.text && (
                        <div>
                          {msg.text.startsWith("__TOKONI_CART__:") ? (
                            (() => {
                              try {
                                const items = JSON.parse(msg.text.slice(16));
                                return (
                                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', minWidth: '220px' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', borderBottom: isOutgoing ? '1px solid rgba(255,255,255,0.2)' : '1px solid #E5E7EB', paddingBottom: '6px' }}>
                                      <span style={{ fontSize: '15px' }}>🛒</span>
                                      <span style={{ fontWeight: '800', fontSize: '13.5px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Shopping Cart</span>
                                    </div>

                                    {/* Collage/Grid of Images */}
                                    <div style={{ display: 'grid', gridTemplateColumns: items.length > 1 ? 'repeat(2, 1fr)' : '1fr', gap: '4px', borderRadius: '8px', overflow: 'hidden' }}>
                                      {items.slice(0, 4).map((item: any, idx: number) => (
                                        <div key={idx} style={{ position: 'relative', height: items.length > 2 ? '70px' : '110px', backgroundColor: '#F3F4F6' }}>
                                          <img src={item.image} alt={item.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                          {idx === 3 && items.length > 4 && (
                                            <div style={{ position: 'absolute', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#FFF', fontWeight: 'bold', fontSize: '14px' }}>
                                              +{items.length - 4}
                                            </div>
                                          )}
                                        </div>
                                      ))}
                                    </div>

                                    <div style={{ fontSize: '12px', opacity: 0.9 }}>
                                      Contains {items.length} item{items.length > 1 ? 's' : ''}
                                    </div>

                                    <button
                                      onClick={() => {
                                        setActiveCartItems(items);
                                        setIsChatCartOpen(true);
                                      }}
                                      style={{
                                        width: '100%',
                                        backgroundColor: isOutgoing ? '#FFFFFF' : '#B9001B',
                                        color: isOutgoing ? '#B9001B' : '#FFFFFF',
                                        border: 'none',
                                        borderRadius: '8px',
                                        padding: '8px',
                                        fontSize: '13px',
                                        fontWeight: '700',
                                        cursor: 'pointer',
                                        marginTop: '4px',
                                        boxShadow: '0 2px 5px rgba(0,0,0,0.05)'
                                      }}
                                    >
                                      View Cart
                                    </button>
                                  </div>
                                );
                              } catch (e) {
                                return <div>[Corrupted Cart Message]</div>;
                              }
                            })()
                          ) : msg.text.startsWith("__TOKONI_PRODUCT_TAG__:") ? (
                            (() => {
                              try {
                                const pData = JSON.parse(msg.text.slice(23));
                                return (
                                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', minWidth: '220px' }}>
                                    {/* Product Section Card */}
                                    <div
                                      onClick={() => router.push(`/product/${pData.productId}`)}
                                      style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '10px',
                                        backgroundColor: isOutgoing ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.04)',
                                        border: isOutgoing ? '1px solid rgba(255,255,255,0.2)' : '1px solid #E5E7EB',
                                        borderRadius: '10px',
                                        padding: '8px',
                                        cursor: 'pointer'
                                      }}
                                    >
                                      <img
                                        src={pData.image}
                                        alt={pData.name}
                                        style={{ width: '48px', height: '48px', objectFit: 'cover', borderRadius: '6px' }}
                                      />
                                      <div style={{ flex: 1, minWidth: 0 }}>
                                        <div style={{ fontSize: '13px', fontWeight: '800', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                          {pData.name}
                                        </div>
                                        <div style={{ fontSize: '12px', fontWeight: '700', color: isOutgoing ? '#FFF' : '#B9001B', marginTop: '2px' }}>
                                          ₦{pData.price.toLocaleString()}
                                        </div>
                                      </div>
                                      <div style={{ fontSize: '11px', fontWeight: 'bold', color: isOutgoing ? '#FFF' : '#B9001B', textDecoration: 'underline', flexShrink: 0 }}>
                                        View
                                      </div>
                                    </div>
                                    {/* Text Message below card */}
                                    {pData.text && (
                                      <div style={{ whiteSpace: "pre-wrap", wordBreak: "break-word" }}>
                                        {pData.text}
                                      </div>
                                    )}
                                  </div>
                                );
                              } catch (e) {
                                return <div>[Corrupted Product Tag Message]</div>;
                              }
                            })()
                          ) : (
                            <div style={{ whiteSpace: "pre-wrap", wordBreak: "break-word" }}>{msg.text}</div>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Reactions Pill Display */}
                    {msg.reactions.length > 0 && (
                      <div
                        style={{
                          display: "flex",
                          gap: "4px",
                          marginTop: "4px",
                          flexWrap: "wrap",
                        }}
                      >
                        {Object.entries(reactionCounts).map(([emoji, count]) => {
                          const hasUserReacted = msg.reactions.some(
                            (r) => r.userId === user?.$id && r.emoji === emoji
                          );
                          return (
                            <button
                              key={emoji}
                              onClick={() => reactToMessage(msg.$id, emoji)}
                              style={{
                                display: "flex",
                                alignItems: "center",
                                gap: "3px",
                                backgroundColor: hasUserReacted ? "#FFF0F2" : "#FFFFFF",
                                border: hasUserReacted ? "1px solid #E0A0A6" : "1px solid #EAEAEA",
                                borderRadius: "12px",
                                padding: "2px 8px",
                                fontSize: "11px",
                                cursor: "pointer",
                                boxShadow: "0 1px 2px rgba(0,0,0,0.03)",
                              }}
                            >
                              <span>{emoji}</span>
                              <span style={{ fontWeight: "600", color: hasUserReacted ? "#B9001B" : "#555" }}>
                                {count}
                              </span>
                            </button>
                          );
                        })}
                      </div>
                    )}

                    {/* Sent Timestamp */}
                    <div
                      style={{
                        fontSize: "10px",
                        color: "#888",
                        marginTop: "4px",
                        marginLeft: isOutgoing ? "0" : "4px",
                        marginRight: isOutgoing ? "4px" : "0",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: isOutgoing ? "flex-end" : "flex-start",
                        gap: "3px",
                      }}
                    >
                      <span>
                        {new Date(msg.$createdAt).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>
                      {isOutgoing && (
                        <span style={{ display: "inline-flex", alignItems: "center" }}>
                          {(msg.status as string) === "pending" ? (
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#888888" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <title>Pending</title>
                              <circle cx="12" cy="12" r="10" />
                              <polyline points="12 6 12 12 16 14" />
                            </svg>
                          ) : msg.status === "seen" ? (
                            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#34B7F1" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                              <path d="M2 12l5 5L15 9" />
                              <path d="M8 12l5 5L22 9" />
                            </svg>
                          ) : msg.status === "delivered" ? (
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
                    </div>
                  </div>
                </div>
              </React.Fragment>
            );
          })}
        </div>
      );
    });
  };

  if (!mounted) return null;

  return (
    <div
      style={{
        position: "fixed",
        top: "72px",
        bottom: 0,
        left: 0,
        right: 0,
        display: "flex",
        flexDirection: "column",
        backgroundColor: "#FFFFFF",
        fontFamily: "var(--font-body), sans-serif",
      }}
    >
      <div style={{ display: "flex", flex: 1, overflow: "hidden" }}>
        {/* Chats Sidebar panel on Desktop */}
        {!mobile && (
          <div
            style={{
              width: "340px",
              height: "100%",
              borderRight: "1px solid #EDEDED",
              flexShrink: 0,
            }}
          >
            <ChatsSidebar activeChatId={chatId} />
          </div>
        )}

        {/* Chat Detail Thread Area */}
        <div style={{ flex: 1, display: "flex", flexDirection: "column", backgroundColor: "#F9FAFB", height: "100%" }}>

          {/* Chat Header */}
          <div
            style={{
              padding: "0.75rem 1.5rem",
              backgroundColor: "#FFFFFF",
              borderBottom: "1px solid #EDEDED",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              boxShadow: "0 1px 3px rgba(0,0,0,0.02)",
            }}
          >
            <div
              onClick={() => otherUserId && router.push(`/profile/${otherUserId}`)}
              style={{ display: "flex", alignItems: "center", gap: "12px", cursor: "pointer" }}
              className="hover:opacity-85 transition-opacity"
            >
              {/* Back button on Mobile */}
              {mobile && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    router.push("/chats");
                  }}
                  style={{
                    background: "none",
                    border: "none",
                    padding: "0 8px 0 0",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                  }}
                >
                  <BackIcon />
                </button>
              )}
              {/* Header Avatar */}
              <div
                style={{
                  width: "40px",
                  height: "40px",
                  borderRadius: "50%",
                  backgroundColor: avatarBg,
                  position: "relative",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  overflow: "hidden",
                }}
              >
                {otherAvatar ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={otherAvatar}
                    alt={otherName}
                    style={{ width: "100%", height: "100%", objectFit: "cover" }}
                  />
                ) : (
                  <span style={{ color: "#FFF", fontWeight: "600", fontSize: "14px" }}>
                    {initials}
                  </span>
                )}
              </div>
              <div>
                <h2
                  style={{
                    fontSize: "15px",
                    fontWeight: "700",
                    color: "#111",
                    margin: "0 0 2px 0",
                    display: "flex",
                    alignItems: "center",
                    gap: "6px",
                  }}
                >
                  {otherName}
                  {isOtherVendor && (
                    <span
                      style={{
                        backgroundColor: "#FFF0F2",
                        color: "#B9001B",
                        fontSize: "9px",
                        fontWeight: "700",
                        padding: "1px 5px",
                        borderRadius: "8px",
                      }}
                    >
                      Seller
                    </span>
                  )}
                </h2>
                <p style={{ fontSize: "12px", color: isOtherTyping ? "#10B981" : "#666", margin: 0, fontWeight: isOtherTyping ? "600" : "400" }}>
                  {isOtherTyping ? "typing..." : "Active now"}
                </p>
              </div>
            </div>
            <div style={{ display: "flex", gap: "1rem" }}>
              <button style={{ background: "none", border: "none", cursor: "pointer", padding: 0 }} title="Call (Disabled)">
                <PhoneIcon color="#666" />
              </button>
              <button style={{ background: "none", border: "none", cursor: "pointer", padding: 0 }} title="Options">
                <MoreIcon color="#666" />
              </button>
            </div>
          </div>

          {/* Messages Feed View */}
          <div style={{ flex: 1, padding: "1.5rem", overflowY: "auto", display: "flex", flexDirection: "column", gap: "1.5rem" }}>
            {/* Load More Button at the top */}
            {!messagesLoading && messages.length > 0 && hasMoreMessages && (
              <div style={{ display: "flex", justifyContent: "center", marginBottom: "0.5rem" }}>
                <button
                  type="button"
                  onClick={loadMoreMessages}
                  disabled={loadingMoreMessages}
                  style={{
                    backgroundColor: "#FFFFFF",
                    border: "1px solid #EDEDED",
                    borderRadius: "20px",
                    padding: "6px 16px",
                    fontSize: "12px",
                    fontWeight: "600",
                    color: "#B9001B",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    gap: "6px",
                    boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
                    outline: "none",
                  }}
                >
                  {loadingMoreMessages ? (
                    <>
                      <span style={{ width: "12px", height: "12px", border: "2px solid #B9001B", borderTop: "2px solid transparent", borderRadius: "50%", animation: "spin 1s linear infinite" }} />
                      <style>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
                      <span>Loading...</span>
                    </>
                  ) : (
                    <span>Load Previous Messages</span>
                  )}
                </button>
              </div>
            )}

            {messagesLoading ? (
              <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: "1rem" }}>
                {/* Left side message skeleton */}
                <div style={{ display: "flex", gap: "10px", alignSelf: "flex-start", width: "70%" }}>
                  <div className="skeleton" style={{ width: "32px", height: "32px", borderRadius: "50%", flexShrink: 0 }} />
                  <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: "6px" }}>
                    <div className="skeleton" style={{ width: "40%", height: "12px", borderRadius: "4px" }} />
                    <div className="skeleton" style={{ width: "100%", height: "40px", borderRadius: "4px 16px 16px 16px" }} />
                  </div>
                </div>

                {/* Right side message skeleton */}
                <div style={{ display: "flex", flexDirection: "column", gap: "6px", alignSelf: "flex-end", width: "60%" }}>
                  <div className="skeleton" style={{ width: "30%", height: "12px", borderRadius: "4px", alignSelf: "flex-end" }} />
                  <div className="skeleton" style={{ width: "100%", height: "55px", borderRadius: "16px 16px 4px 16px" }} />
                </div>

                {/* Left side message skeleton */}
                <div style={{ display: "flex", gap: "10px", alignSelf: "flex-start", width: "50%" }}>
                  <div className="skeleton" style={{ width: "32px", height: "32px", borderRadius: "50%", flexShrink: 0 }} />
                  <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: "6px" }}>
                    <div className="skeleton" style={{ width: "50%", height: "12px", borderRadius: "4px" }} />
                    <div className="skeleton" style={{ width: "100%", height: "36px", borderRadius: "4px 16px 16px 16px" }} />
                  </div>
                </div>

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
            ) : messages.length === 0 ? (
              <div
                style={{
                  flex: 1,
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "12px",
                  padding: "2rem",
                  textAlign: "center",
                }}
              >
                <div style={{ fontSize: "40px" }}>💬</div>
                <h4 style={{ fontSize: "15px", fontWeight: "600", color: "#666", margin: 0 }}>
                  No messages yet
                </h4>
                <p style={{ fontSize: "13px", color: "#999", maxWidth: "240px", margin: 0 }}>
                  Send a message to start a conversation with {otherName}.
                </p>
              </div>
            ) : (
              renderMessageGroups()
            )}

            {/* In-feed Typing Indicator */}
            {isOtherTyping && (
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <div
                  style={{
                    width: "24px",
                    height: "24px",
                    borderRadius: "50%",
                    backgroundColor: avatarBg,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    overflow: "hidden",
                  }}
                >
                  {otherAvatar ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={otherAvatar}
                      alt={otherName}
                      style={{ width: "100%", height: "100%", objectFit: "cover" }}
                    />
                  ) : (
                    <span style={{ color: "#FFF", fontWeight: "600", fontSize: "10px" }}>
                      {initials}
                    </span>
                  )}
                </div>
                {/* Typing dots */}
                <div
                  style={{
                    backgroundColor: "#EFEAEB",
                    padding: "10px 14px",
                    borderRadius: "4px 16px 16px 16px",
                    display: "flex",
                    gap: "4px",
                    alignItems: "center",
                  }}
                >
                  <span className="dot" style={{ width: "6px", height: "6px", backgroundColor: "#888", borderRadius: "50%", animation: "bounce 1.4s infinite ease-in-out both" }}></span>
                  <span className="dot" style={{ width: "6px", height: "6px", backgroundColor: "#888", borderRadius: "50%", animation: "bounce 1.4s infinite ease-in-out both 0.2s" }}></span>
                  <span className="dot" style={{ width: "6px", height: "6px", backgroundColor: "#888", borderRadius: "50%", animation: "bounce 1.4s infinite ease-in-out both 0.4s" }}></span>
                </div>
                {/* Styles for typing bounce animation */}
                <style>{`
                  @keyframes bounce {
                    0%, 80%, 100% { transform: scale(0); }
                    40% { transform: scale(1.0); }
                  }
                `}</style>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Chat Controls Input Console */}
          <div style={{ backgroundColor: "#FFFFFF", borderTop: "1px solid #EDEDED", position: "relative" }}>
            <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column" }}>

              {/* Product Tagging Autocomplete Modal */}
              {showTagModal && (showMyTab || showOtherTab) && (
                <div
                  style={{
                    position: 'absolute',
                    bottom: '100%',
                    left: '1rem',
                    right: '1rem',
                    backgroundColor: '#FFFFFF',
                    border: '1px solid #EAEAEA',
                    borderRadius: '16px',
                    boxShadow: '0 -4px 20px rgba(0,0,0,0.08)',
                    display: 'flex',
                    flexDirection: 'column',
                    maxHeight: '280px',
                    zIndex: 900,
                    overflow: 'hidden',
                    marginBottom: '8px'
                  }}
                >
                  {/* Tabs selector */}
                  {showMyTab && showOtherTab && (
                    <div style={{ display: 'flex', borderBottom: '1px solid #F3F4F6' }}>
                      <button
                        type="button"
                        onClick={() => setActiveTagTab("other")}
                        style={{
                          flex: 1,
                          padding: '10px',
                          fontSize: '12.5px',
                          fontWeight: '700',
                          color: activeTagTab === "other" ? '#B9001B' : '#6B7280',
                          border: 'none',
                          background: 'none',
                          borderBottom: activeTagTab === "other" ? '2.5px solid #B9001B' : 'none',
                          cursor: 'pointer'
                        }}
                      >
                        {otherVendor?.businessName || "Vendor"}
                      </button>
                      <button
                        type="button"
                        onClick={() => setActiveTagTab("me")}
                        style={{
                          flex: 1,
                          padding: '10px',
                          fontSize: '12.5px',
                          fontWeight: '700',
                          color: activeTagTab === "me" ? '#B9001B' : '#6B7280',
                          border: 'none',
                          background: 'none',
                          borderBottom: activeTagTab === "me" ? '2.5px solid #B9001B' : 'none',
                          cursor: 'pointer'
                        }}
                      >
                        Me
                      </button>
                    </div>
                  )}

                  {/* Search Bar */}
                  <div style={{ position: 'relative', margin: '8px 12px' }}>
                    <Search style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', width: '14px', height: '14px', color: '#9CA3AF' }} />
                    <input
                      type="text"
                      placeholder="Search products..."
                      value={tagSearchQuery}
                      onChange={(e) => setTagSearchQuery(e.target.value)}
                      style={{
                        width: '100%',
                        padding: '8px 10px 8px 30px',
                        fontSize: '13px',
                        borderRadius: '20px',
                        border: '1px solid #E5E7EB',
                        outline: 'none',
                        backgroundColor: '#F9FAFB'
                      }}
                    />
                  </div>

                  {/* Vertical Scroll List */}
                  <div style={{ flex: 1, overflowY: 'auto', padding: '4px 12px 12px 12px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    {isLoadingProducts ? (
                      <div style={{ display: 'flex', justifyContent: 'center', padding: '20px', fontSize: '12px', color: '#888' }}>
                        Loading products...
                      </div>
                    ) : displayedProducts.length === 0 ? (
                      <div style={{ display: 'flex', justifyContent: 'center', padding: '20px', fontSize: '12px', color: '#888' }}>
                        No products found
                      </div>
                    ) : (
                      displayedProducts.map((p: any) => (
                        <div
                          key={p.$id}
                          onClick={() => {
                            // Remove the @ tag part from inputText
                            const atIdx = inputText.lastIndexOf("@");
                            setInputText(inputText.slice(0, atIdx));
                            setAttachedProduct({
                              productId: p.$id,
                              name: p.name,
                              price: p.discountPrice || p.price,
                              image: p.images?.[0] || ""
                            });
                            setTagSearchQuery("");
                          }}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '10px',
                            padding: '8px',
                            borderRadius: '8px',
                            cursor: 'pointer',
                            transition: 'background-color 0.2s',
                            border: '1px solid #F9FAFB'
                          }}
                          onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#FFF5F5'}
                          onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                        >
                          <img
                            src={p.images?.[0]}
                            alt={p.name}
                            style={{ width: '36px', height: '36px', objectFit: 'cover', borderRadius: '4px', backgroundColor: '#F3F4F6' }}
                          />
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={{ fontSize: '13px', fontWeight: '700', color: '#111827', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                              {p.name}
                            </div>
                            <div style={{ fontSize: '11px', fontWeight: '700', color: '#B9001B', marginTop: '1px' }}>
                              ₦{(p.discountPrice || p.price).toLocaleString()}
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}

              {/* Reply Quote Indicator Bar */}
              {replyMessage && (
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    backgroundColor: "#F9FAFB",
                    borderBottom: "1px solid #EDEDED",
                    padding: "8px 1.5rem",
                  }}
                >
                  <div
                    style={{
                      borderLeft: "3px solid #B9001B",
                      paddingLeft: "10px",
                      fontSize: "12.5px",
                      color: "#555",
                      overflow: "hidden",
                      flex: 1,
                      minWidth: 0,
                    }}
                  >
                    <span style={{ fontWeight: "700", color: "#111" }}>
                      Replying to {replyMessage.senderId === user?.$id ? "yourself" : otherName}
                    </span>
                    <div style={{ whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", marginTop: "2px" }}>
                      {replyMessage.text ? truncateText(replyMessage.text, 60) : (replyMessage.mediaType === "video" ? "🎥 Video file" : "📷 Image file")}
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setReplyMessage(null)}
                    style={{ background: "none", border: "none", cursor: "pointer", padding: "4px" }}
                  >
                    <CloseIcon />
                  </button>
                </div>
              )}

              {/* Attached Product Preview Bar */}
              {attachedProduct && (
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    backgroundColor: "#FFF8F8",
                    borderBottom: "1px solid #EDEDED",
                    padding: "10px 1.5rem",
                    gap: "12px",
                  }}
                >
                  <img
                    src={attachedProduct.image}
                    alt={attachedProduct.name}
                    style={{ width: "40px", height: "40px", objectFit: "cover", borderRadius: "6px" }}
                  />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: "12.5px", fontWeight: "750", color: "#111", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                      {attachedProduct.name}
                    </div>
                    <div style={{ fontSize: "11px", fontWeight: "700", color: "#B9001B", marginTop: "2px" }}>
                      ₦{attachedProduct.price.toLocaleString()}
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setAttachedProduct(null)}
                    style={{ background: "none", border: "none", cursor: "pointer", padding: "4px" }}
                  >
                    <CloseIcon />
                  </button>
                </div>
              )}

              {/* Media Upload Attachment Preview Bar */}
              {filePreview && (
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    backgroundColor: "#F9FAFB",
                    borderBottom: "1px solid #EDEDED",
                    padding: "10px 1.5rem",
                    gap: "12px",
                  }}
                >
                  <div
                    style={{
                      width: "48px",
                      height: "48px",
                      borderRadius: "8px",
                      backgroundColor: "#000",
                      overflow: "hidden",
                      position: "relative",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    {fileType === "video" ? (
                      <video style={{ width: "100%", height: "100%", objectFit: "cover" }}>
                        <source src={filePreview} />
                      </video>
                    ) : (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={filePreview}
                        alt="Upload preview"
                        style={{ width: "100%", height: "100%", objectFit: "cover" }}
                      />
                    )}
                    {isUploading && (
                      <div
                        style={{
                          position: "absolute",
                          inset: 0,
                          backgroundColor: "rgba(0,0,0,0.5)",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                        }}
                      >
                        <span style={{ width: "14px", height: "14px", border: "2px solid #FFF", borderTop: "2px solid transparent", borderRadius: "50%", animation: "spin 1s linear infinite" }} />
                        <style>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
                      </div>
                    )}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: "13px", fontWeight: "600", color: "#111", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                      {selectedFile ? truncateText(selectedFile.name, 30) : ""}
                    </div>
                    <div style={{ fontSize: "11.5px", color: "#888", marginTop: "2px" }}>
                      {selectedFile ? (selectedFile.size / (1024 * 1024)).toFixed(2) + " MB" : ""}
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={handleCancelMedia}
                    disabled={isUploading}
                    style={{ background: "none", border: "none", cursor: "pointer", padding: "4px" }}
                  >
                    <CloseIcon />
                  </button>
                </div>
              )}

              {/* Message Controls Panel */}
              <div style={{ padding: "1rem 1.5rem", display: "flex", alignItems: "center", gap: "12px" }}>
                {/* File picker button */}
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  accept="image/*,video/*"
                  style={{ display: "none" }}
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isUploading}
                  style={{
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                    padding: 0,
                    display: "flex",
                    alignItems: "center",
                    opacity: isUploading ? 0.5 : 1,
                  }}
                  title="Attach image or video"
                >
                  <PlusIcon />
                </button>

                {/* Input box */}
                <div style={{ flex: 1, display: "flex", alignItems: "flex-end", backgroundColor: "#F5F5F5", borderRadius: "20px", padding: "8px 8px 8px 16px" }}>
                  <textarea
                    ref={textareaRef}
                    value={inputText}
                    onChange={(e) => {
                      handleInputChange(e as any);
                      // Auto-grow height logic
                      e.target.style.height = "auto";
                      e.target.style.height = `${Math.min(e.target.scrollHeight, 120)}px`;
                    }}
                    onKeyDown={(e) => {
                      // Pressing enter submits the message, shift+enter inserts newlines
                      if (e.key === "Enter" && !e.shiftKey) {
                        e.preventDefault();
                        handleSubmit(e as any);
                      }
                    }}
                    placeholder={filePreview ? "Add caption..." : "Type a message..."}
                    rows={1}
                    style={{
                      flex: 1,
                      backgroundColor: "transparent",
                      border: "none",
                      outline: "none",
                      fontSize: "16px",
                      color: "#111",
                      resize: "none",
                      fontFamily: "inherit",
                      maxHeight: "120px",
                      overflowY: "auto",
                      paddingTop: "4px",
                      paddingBottom: "4px",
                      lineHeight: "20px",
                    }}
                  />
                  {/* Send Button */}
                  <button
                    type="submit"
                    disabled={(!inputText.trim() && !selectedFile) || isUploading}
                    style={{
                      backgroundColor: "#B9001B",
                      border: "none",
                      width: "36px",
                      height: "36px",
                      borderRadius: "50%",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      cursor: "pointer",
                      marginLeft: "12px",
                      opacity: (!inputText.trim() && !selectedFile) || isUploading ? 0.6 : 1,
                      transition: "opacity 0.2s ease",
                      flexShrink: 0,
                    }}
                  >
                    {isUploading ? (
                      <span style={{ width: "12px", height: "12px", border: "2px solid #FFF", borderTop: "2px solid transparent", borderRadius: "50%", animation: "spin 1s linear infinite" }} />
                    ) : (
                      <SendIcon />
                    )}
                  </button>
                </div>
              </div>
            </form>
          </div>

          {/* Reaction Overlay Context Menu */}
          {activeMenuMessageId && menuCoords && (
            <>
              {/* Backdrop to close on tap outside */}
              <div
                onClick={() => {
                  setActiveMenuMessageId(null);
                  setMenuCoords(null);
                }}
                onContextMenu={(e) => {
                  e.preventDefault();
                  setActiveMenuMessageId(null);
                  setMenuCoords(null);
                }}
                style={{
                  position: "fixed",
                  inset: 0,
                  backgroundColor: "transparent",
                  zIndex: 990,
                }}
              />

              {/* Context menu next to selected message */}
              <div
                style={{
                  position: "fixed",
                  left: `${Math.min(window.innerWidth - 260, Math.max(16, menuCoords.x - 110))}px`,
                  top: `${Math.min(window.innerHeight - 100, Math.max(16, menuCoords.y - 50))}px`,
                  backgroundColor: "#FFFFFF",
                  boxShadow: "0 10px 25px rgba(0,0,0,0.15)",
                  borderRadius: "16px",
                  display: "flex",
                  alignItems: "center",
                  padding: "6px 12px",
                  gap: "8px",
                  zIndex: 995,
                  border: "1px solid #EDEDED",
                  animation: "popIn 0.15s cubic-bezier(0.34, 1.56, 0.64, 1) forwards",
                }}
              >
                {/* Emojis */}
                {REACTION_LIST.map((emoji) => (
                  <button
                    key={emoji}
                    onClick={() => {
                      reactToMessage(activeMenuMessageId, emoji);
                      setActiveMenuMessageId(null);
                      setMenuCoords(null);
                    }}
                    style={{
                      border: "none",
                      background: "none",
                      fontSize: "20px",
                      cursor: "pointer",
                      padding: "4px",
                      transition: "transform 0.15s ease",
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.transform = "scale(1.35)")}
                    onMouseLeave={(e) => (e.currentTarget.style.transform = "scale(1)")}
                  >
                    {emoji}
                  </button>
                ))}

                <div style={{ width: "1px", height: "24px", backgroundColor: "#EDEDED", margin: "0 4px" }} />

                {/* Reply action */}
                <button
                  type="button"
                  onClick={() => {
                    const msg = messages.find((m) => m.$id === activeMenuMessageId);
                    if (msg) handleReplyToggle(msg);
                    setActiveMenuMessageId(null);
                    setMenuCoords(null);
                  }}
                  title="Reply"
                  style={{
                    border: "none",
                    background: "none",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    padding: "8px",
                    borderRadius: "50%",
                    backgroundColor: "#F3F4F6",
                    transition: "background-color 0.2s",
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#E5E7EB")}
                  onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "#F3F4F6")}
                >
                  <ReplyIcon color="#111" />
                </button>

                <style>{`
                  @keyframes popIn {
                    0% { transform: scale(0.85); opacity: 0; }
                    100% { transform: scale(1); opacity: 1; }
                  }
                `}</style>
              </div>
            </>
          )}

          {/* Expanded Media Lightbox Overlay */}
          {activeMediaOverlay && (
            <div
              onClick={() => setActiveMediaOverlay(null)}
              style={{
                position: "fixed",
                inset: 0,
                backgroundColor: "rgba(0,0,0,0.92)",
                zIndex: 1000,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                cursor: "zoom-out",
              }}
            >
              <button
                type="button"
                onClick={() => setActiveMediaOverlay(null)}
                style={{
                  position: "absolute",
                  top: "20px",
                  right: "20px",
                  background: "rgba(255,255,255,0.15)",
                  border: "none",
                  borderRadius: "50%",
                  width: "44px",
                  height: "44px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "#FFFFFF",
                  cursor: "pointer",
                  zIndex: 1010,
                  transition: "background-color 0.2s",
                }}
                onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "rgba(255,255,255,0.25)")}
                onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "rgba(255,255,255,0.15)")}
              >
                <CloseIcon color="#FFF" size={20} />
              </button>

              <div style={{ position: "relative", maxWidth: "90%", maxHeight: "85%", display: "flex", justifyContent: "center" }}>
                {activeMediaOverlay.type === "video" ? (
                  <video
                    src={activeMediaOverlay.url}
                    controls
                    autoPlay
                    onClick={(e) => e.stopPropagation()}
                    style={{ maxWidth: "100%", maxHeight: "100%", borderRadius: "8px", boxShadow: "0 10px 30px rgba(0,0,0,0.5)" }}
                  />
                ) : (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={activeMediaOverlay.url}
                    alt="Expanded view"
                    onClick={(e) => e.stopPropagation()}
                    style={{ maxWidth: "100%", maxHeight: "100%", objectFit: "contain", borderRadius: "8px", boxShadow: "0 10px 30px rgba(0,0,0,0.5)" }}
                  />
                )}
              </div>
            </div>
          )}

          {/* Read-Only Cart Details Drawer */}
          <CartDrawer
            isOpen={isChatCartOpen}
            onClose={() => setIsChatCartOpen(false)}
            items={activeCartItems}
            isReadOnly={true}
            title="Shared Cart"
          />

          {/* Browser Notification Permission Opt-in Prompt */}
          <NotificationOptInModal />

        </div>
      </div>
    </div>
  );
}
