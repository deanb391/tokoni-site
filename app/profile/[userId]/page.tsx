// app/profile/[userId]/page.tsx
"use client";

import React, { useState, useEffect, useRef } from "react";
import { useRouter } from 'nextjs-toploader/app';
import { useParams } from 'next/navigation';
import { useUser } from "@/context/UserContext";
import { useChat } from "@/context/ChatContext";
import { getUserById, toggleFollowVendor } from "@/lib/api/users";
import { getMyVendor } from "@/lib/api/vendors";
import { getVendorProductsPaginated } from "@/lib/api/products";
import { getVendorPosts } from "@/lib/api/posts";
import ProductCard from "@/components/ProductCard";
import PostCard from "@/components/PostCard";
import { 
  MapPin, 
  MessageSquare, 
  UserPlus, 
  UserCheck, 
  Package, 
  FileText, 
  Calendar, 
  ArrowLeft,
  Loader2,
  Users,
  ShoppingBag
} from "lucide-react";
import { getCart, removeFromCart, CartItem } from "@/lib/utils/cart";
import CartDrawer from "@/components/CartDrawer";

export default function UserProfilePage() {
  const router = useRouter();
  const params = useParams();
  const userId = params?.userId ? String(params.userId) : "";

  const { user: currentUser, setUser: setCurrentUser } = useUser();
  const { startChatWithUser } = useChat();

  const [loading, setLoading] = useState(true);
  const [profileUser, setProfileUser] = useState<any>(null);
  const [vendorInfo, setVendorInfo] = useState<any>(null);
  const [isExpanded, setIsExpanded] = useState(false);
  const [expandedImage, setExpandedImage] = useState("");
  
  // Responsive design
  const [isMobile, setIsMobile] = useState(false);
  const [mounted, setMounted] = useState(false);

  // Tabs & Lists
  const [activeTab, setActiveTab] = useState<"products" | "posts">("products");
  const [products, setProducts] = useState<any[]>([]);
  const [productsLoading, setProductsLoading] = useState(false);
  const [posts, setPosts] = useState<any[]>([]);
  const [postsLoading, setPostsLoading] = useState(false);
  
  // Follow State
  const [isFollowing, setIsFollowing] = useState(false);
  const [followingLoading, setFollowingLoading] = useState(false);
  const [followersCount, setFollowersCount] = useState(0);

  // Message Sending Status
  const [messagingLoading, setMessagingLoading] = useState(false);

  // Cart management states
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);

  useEffect(() => {
    if (vendorInfo?.$id) {
      setCartItems(getCart(vendorInfo.$id));
    }
  }, [vendorInfo]);

  useEffect(() => {
    const handleCartSync = () => {
      if (vendorInfo?.$id) {
        setCartItems(getCart(vendorInfo.$id));
      }
    };
    window.addEventListener("tokoni_cart_updated", handleCartSync);
    return () => window.removeEventListener("tokoni_cart_updated", handleCartSync);
  }, [vendorInfo]);

  const handleRemoveCartItem = (pId: string) => {
    if (!vendorInfo?.$id) return;
    removeFromCart(vendorInfo.$id, pId);
    setCartItems(getCart(vendorInfo.$id));
  };

  const handleSendCart = async () => {
    if (!currentUser?.$id) {
      alert("Please log in to send your cart.");
      router.push('/signin');
      return;
    }
    const targetUserId = vendorInfo?.users;
    if (!targetUserId) {
      alert("Unable to find vendor account details.");
      return;
    }
    setMessagingLoading(true);
    try {
      const chatId = await startChatWithUser(targetUserId);
      router.push(`/chats/${chatId}?sendCart=true&vendorId=${vendorInfo.$id}`);
    } catch (err) {
      console.error("Failed to start chat with vendor:", err);
      alert("Failed to start chat session. Please try again.");
    } finally {
      setMessagingLoading(false);
      setIsCartOpen(false);
    }
  };

  useEffect(() => {
    setMounted(true);
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const mobile = mounted ? isMobile : false;

  useEffect(() => {
    if (!userId) return;

    const loadProfileData = async () => {
      setLoading(true);
      try {
        const uProfile = await getUserById(userId);
        if (!uProfile) {
          setLoading(false);
          return;
        }
        setProfileUser(uProfile);

        // If user is a vendor, fetch vendor document
        if (uProfile.isVendor) {
          const vDoc = await getMyVendor(userId);
          if (vDoc) {
            setVendorInfo(vDoc);
            setFollowersCount(vDoc.followersCount || 0);

            // Fetch products and posts
            setProductsLoading(true);
            setPostsLoading(true);
            
            getVendorProductsPaginated(vDoc.$id, 20)
              .then((res) => setProducts(res.products))
              .catch((err) => console.error("Error loading products:", err))
              .finally(() => setProductsLoading(false));

            getVendorPosts(vDoc.$id, 20)
              .then((res) => setPosts(res.posts))
              .catch((err) => console.error("Error loading posts:", err))
              .finally(() => setPostsLoading(false));
          }
        }
      } catch (err) {
        console.error("Failed to load profile details:", err);
      } finally {
        setLoading(false);
      }
    };

    loadProfileData();
  }, [userId]);

  // Sync follow state with current user following list
  useEffect(() => {
    if (vendorInfo && currentUser) {
      const followingList = currentUser.following || [];
      setIsFollowing(followingList.includes(vendorInfo.$id));
    }
  }, [vendorInfo, currentUser]);

  const handleFollowToggle = async () => {
    if (!currentUser?.$id) {
      alert("Please sign in to follow vendors.");
      router.push("/signin");
      return;
    }
    if (!vendorInfo) return;

    setFollowingLoading(true);
    const willFollow = !isFollowing;
    
    // Optimistic UI update
    setIsFollowing(willFollow);
    setFollowersCount((prev) => Math.max(0, prev + (willFollow ? 1 : -1)));

    try {
      const updated = await toggleFollowVendor(currentUser.$id, vendorInfo.$id);
      if (setCurrentUser) {
        setCurrentUser(updated);
      }
    } catch (err) {
      console.error("Failed to toggle follow vendor:", err);
      // Revert on error
      setIsFollowing(!willFollow);
      setFollowersCount((prev) => Math.max(0, prev + (willFollow ? -1 : 1)));
    } finally {
      setFollowingLoading(false);
    }
  };

  const handleMessageClick = async () => {
    if (!currentUser?.$id) {
      alert("Please sign in to send messages.");
      router.push("/signin");
      return;
    }
    if (currentUser.$id === userId) {
      alert("You cannot start a chat with yourself.");
      return;
    }

    setMessagingLoading(true);
    try {
      const chatId = await startChatWithUser(userId);
      router.push(`/chats/${chatId}`);
    } catch (err) {
      console.error("Error initiating chat:", err);
      alert("Failed to start chat session. Please try again.");
    } finally {
      setMessagingLoading(false);
    }
  };

  if (loading) {
    return (
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: "80vh", backgroundColor: "#F9FAFB", fontFamily: "var(--font-body), sans-serif" }}>
        <Loader2 className="w-8 h-8 animate-spin text-[#B9001B] mb-4" />
        <p style={{ color: "#666", fontSize: "15px", fontWeight: "500" }}>Loading Profile...</p>
      </div>
    );
  }

  if (!profileUser) {
    return (
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: "80vh", backgroundColor: "#F9FAFB", fontFamily: "var(--font-body), sans-serif", padding: "2rem" }}>
        <span style={{ fontSize: "48px", marginBottom: "1rem" }}>👤</span>
        <h2 style={{ fontSize: "20px", fontWeight: "700", color: "#111", marginBottom: "0.5rem" }}>User Not Found</h2>
        <p style={{ color: "#666", fontSize: "14px", marginBottom: "1.5rem" }}>The user profile you are looking for does not exist or has been deleted.</p>
        <button onClick={() => router.back()} style={{ backgroundColor: "#B9001B", color: "#FFF", border: "none", borderRadius: "20px", padding: "8px 24px", fontWeight: "600", cursor: "pointer" }}>Go Back</button>
      </div>
    );
  }

  const isOwnProfile = currentUser?.$id === userId;

  return (
    <div style={{ backgroundColor: "#F9FAFB", minHeight: "100vh", fontFamily: "var(--font-body), sans-serif" }}>
      {/* Header Bar */}
      <header style={{ display: "flex", alignItems: "center", padding: "1rem 2rem", backgroundColor: "#FFFFFF", borderBottom: "1px solid #EDEDED", position: "sticky", top: 0, zIndex: 40 }}>
        <button onClick={() => router.back()} style={{ width: "36px", height: "36px", borderRadius: "50%", backgroundColor: "#F3F4F6", border: "none", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", marginRight: "1rem" }}>
          <ArrowLeft className="w-5 h-5 text-neutral-800" />
        </button>
        <h1 style={{ fontSize: "18px", fontWeight: "700", color: "#111", margin: 0 }}>
          {vendorInfo ? vendorInfo.businessName : `@${profileUser.username}`}
        </h1>
      </header>

      {/* Hero Visual Section */}
      {vendorInfo ? (
        <section style={{ backgroundColor: "#FFFFFF", borderBottom: "1px solid #EDEDED" }}>
          {vendorInfo.coverImage ? (
            <div
              onClick={() => { setExpandedImage(vendorInfo.coverImage); setIsExpanded(true); }}
              style={{ width: "100%", height: "220px", backgroundImage: `url(${vendorInfo.coverImage})`, backgroundSize: "cover", backgroundPosition: "center", cursor: "zoom-in" }}
            />
          ) : (
            <div style={{ width: "100%", height: "180px", background: "linear-gradient(to right, #B9001B, #ECA1A6, #B9001B)" }} />
          )}

          <div style={{ maxWidth: "1000px", margin: "0 auto", padding: "0 2rem 1.5rem", position: "relative" }}>
            <div style={{ display: "flex", flexDirection: mobile ? "column" : "row", alignItems: "flex-start", gap: "1.5rem" }}>
              
              {/* Logo / Avatar */}
              <div
                onClick={() => {
                  const imgUrl = vendorInfo.logoImage || profileUser.avatar;
                  if (imgUrl) {
                    setExpandedImage(imgUrl);
                    setIsExpanded(true);
                  }
                }}
                style={{ width: "110px", height: "110px", borderRadius: "50%", backgroundColor: "#FFFFFF", border: "4px solid #FFFFFF", zIndex: 10, overflow: "hidden", marginTop: "-55px", boxShadow: "0 4px 10px rgba(0,0,0,0.06)", display: "flex", alignItems: "center", justifyContent: "center", cursor: (vendorInfo.logoImage || profileUser.avatar) ? "zoom-in" : "default" }}
              >
                {vendorInfo.logoImage ? (
                  <img src={vendorInfo.logoImage} alt={vendorInfo.businessName} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                ) : profileUser.avatar ? (
                  <img src={profileUser.avatar} alt={profileUser.username} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                ) : (
                  <div style={{ width: "100%", height: "100%", backgroundColor: "#E5E7EB", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: "bold", fontSize: "28px", color: "#B9001B" }}>
                    {vendorInfo.businessName.slice(0, 1).toUpperCase()}
                  </div>
                )}
              </div>

              {/* Vendor Info Content */}
              <div style={{ flex: 1, marginTop: "10px" }}>
                <h2 style={{ fontSize: "24px", fontWeight: "800", color: "#111", margin: 0, letterSpacing: "-0.5px" }}>
                  {vendorInfo.businessName}
                </h2>
                {vendorInfo.tagline && (
                  <p style={{ fontSize: "14px", color: "#555", margin: "4px 0 10px 0" }}>{vendorInfo.tagline}</p>
                )}

                <div style={{ display: "flex", flexWrap: "wrap", gap: "1rem", fontSize: "13px", color: "#666", marginBottom: "1rem" }}>
                  <span style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                    <MapPin className="w-4 h-4 text-neutral-400" />
                    {vendorInfo.state}, {vendorInfo.country}
                  </span>
                  <span style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                    <Calendar className="w-4 h-4 text-neutral-400" />
                    Joined {new Date(profileUser.$createdAt).toLocaleDateString(undefined, { month: "short", year: "numeric" })}
                  </span>
                </div>

                {/* Stats row */}
                <div style={{ display: "flex", gap: "1.5rem", marginBottom: "1rem" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                    <Users className="w-4.5 h-4.5 text-[#B9001B]" />
                    <span style={{ fontSize: "14px", fontWeight: "700", color: "#111" }}>{followersCount}</span>
                    <span style={{ fontSize: "13px", color: "#666" }}>Followers</span>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                    <Package className="w-4.5 h-4.5 text-neutral-400" />
                    <span style={{ fontSize: "14px", fontWeight: "700", color: "#111" }}>{products.length}</span>
                    <span style={{ fontSize: "13px", color: "#666" }}>Products</span>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                    <FileText className="w-4.5 h-4.5 text-neutral-400" />
                    <span style={{ fontSize: "14px", fontWeight: "700", color: "#111" }}>{posts.length}</span>
                    <span style={{ fontSize: "13px", color: "#666" }}>Posts</span>
                  </div>
                </div>

                {/* Category tags */}
                {vendorInfo.category && vendorInfo.category.length > 0 && (
                  <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
                    {vendorInfo.category.map((cat: string) => (
                      <span key={cat} style={{ fontSize: "11px", fontWeight: "600", backgroundColor: "#F3F4F6", color: "#475569", padding: "2px 8px", borderRadius: "6px" }}>
                        {cat}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              {!isOwnProfile && (
                <div style={{ display: "flex", gap: "0.75rem", alignSelf: "stretch", justifyContent: "flex-end", marginTop: "10px" }}>
                  <button
                    onClick={handleFollowToggle}
                    disabled={followingLoading}
                    style={{
                      flex: 1,
                      maxWidth: "150px",
                      padding: "10px 20px",
                      borderRadius: "20px",
                      border: isFollowing ? "1px solid #DDD" : "none",
                      backgroundColor: isFollowing ? "#FFFFFF" : "#B9001B",
                      color: isFollowing ? "#333" : "#FFFFFF",
                      fontSize: "14px",
                      fontWeight: "600",
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: "6px"
                    }}
                  >
                    {isFollowing ? (
                      <>
                        <UserCheck className="w-4 h-4 text-emerald-600" />
                        <span>Following</span>
                      </>
                    ) : (
                      <>
                        <UserPlus className="w-4 h-4" />
                        <span>Follow</span>
                      </>
                    )}
                  </button>
                  <button
                    onClick={handleMessageClick}
                    disabled={messagingLoading}
                    style={{
                      flex: 1,
                      maxWidth: "150px",
                      padding: "10px 20px",
                      borderRadius: "20px",
                      border: "none",
                      backgroundColor: "#111827",
                      color: "#FFFFFF",
                      fontSize: "14px",
                      fontWeight: "600",
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: "6px"
                    }}
                  >
                    {messagingLoading ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <MessageSquare className="w-4 h-4" />
                    )}
                    <span>Message</span>
                  </button>
                </div>
              )}
            </div>

            {/* Tab switch headers */}
            <div style={{ display: "flex", gap: "2rem", marginTop: "2rem", borderBottom: "1px solid #EDEDED" }}>
              <button
                onClick={() => setActiveTab("products")}
                style={{
                  background: "none",
                  border: "none",
                  padding: "0 0 8px 0",
                  fontSize: "14.5px",
                  fontWeight: activeTab === "products" ? "600" : "500",
                  color: activeTab === "products" ? "#B9001B" : "#666",
                  borderBottom: activeTab === "products" ? "2px solid #B9001B" : "2px solid transparent",
                  cursor: "pointer",
                  transition: "all 0.2s"
                }}
              >
                Products ({products.length})
              </button>
              <button
                onClick={() => setActiveTab("posts")}
                style={{
                  background: "none",
                  border: "none",
                  padding: "0 0 8px 0",
                  fontSize: "14.5px",
                  fontWeight: activeTab === "posts" ? "600" : "500",
                  color: activeTab === "posts" ? "#B9001B" : "#666",
                  borderBottom: activeTab === "posts" ? "2px solid #B9001B" : "2px solid transparent",
                  cursor: "pointer",
                  transition: "all 0.2s"
                }}
              >
                Posts ({posts.length})
              </button>
            </div>
          </div>
        </section>
      ) : (
        /* Regular User Profile Layout */
        <section style={{ backgroundColor: "#FFFFFF", borderBottom: "1px solid #EDEDED", padding: "3rem 2rem" }}>
          <div style={{ maxWidth: "600px", margin: "0 auto", textAlign: "center", display: "flex", flexDirection: "column", alignItems: "center" }}>
            <div
              onClick={() => {
                if (profileUser.avatar) {
                  setExpandedImage(profileUser.avatar);
                  setIsExpanded(true);
                }
              }}
              style={{ width: "90px", height: "90px", borderRadius: "50%", backgroundColor: "#FFF0F2", overflow: "hidden", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: "1.25rem", border: "1px solid #FFCAD1", cursor: profileUser.avatar ? "zoom-in" : "default" }}
            >
              {profileUser.avatar ? (
                <img src={profileUser.avatar} alt={profileUser.username} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
              ) : (
                <span style={{ fontSize: "36px", color: "#B9001B" }}>
                  {profileUser.username.charAt(0).toUpperCase()}
                </span>
              )}
            </div>

            <h2 style={{ fontSize: "22px", fontWeight: "800", color: "#111", margin: "0 0 4px 0" }}>
              @{profileUser.username}
            </h2>
            <p style={{ fontSize: "13.5px", color: "#666", display: "flex", alignItems: "center", gap: "4px", marginBottom: "1.5rem" }}>
              <Calendar className="w-4 h-4 text-neutral-400" />
              Member since {new Date(profileUser.$createdAt).toLocaleDateString(undefined, { month: "long", year: "numeric" })}
            </p>

            <div style={{ display: "flex", gap: "1.5rem", backgroundColor: "#F9FAFB", padding: "10px 24px", borderRadius: "12px", border: "1px solid #EDEDED", marginBottom: "2rem" }}>
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                <span style={{ fontSize: "15px", fontWeight: "700", color: "#111" }}>
                  {profileUser.following?.length || 0}
                </span>
                <span style={{ fontSize: "12px", color: "#666" }}>Following</span>
              </div>
            </div>

            {!isOwnProfile && (
              <button
                onClick={handleMessageClick}
                disabled={messagingLoading}
                style={{
                  width: "100%",
                  maxWidth: "200px",
                  padding: "10px 24px",
                  borderRadius: "20px",
                  border: "none",
                  backgroundColor: "#B9001B",
                  color: "#FFFFFF",
                  fontSize: "14.5px",
                  fontWeight: "600",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "8px",
                  boxShadow: "0 4px 12px rgba(185,0,27,0.15)"
                }}
              >
                {messagingLoading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <MessageSquare className="w-4 h-4" />
                )}
                <span>Send Message</span>
              </button>
            )}
          </div>
        </section>
      )}

      {/* Lists / Grid Main Display (Only active for Vendor profiles) */}
      {vendorInfo && (
        <main style={{ maxWidth: "1000px", margin: "0 auto", padding: "2rem" }}>
          
          {activeTab === "products" && (
            <>
              {productsLoading ? (
                <div style={{ display: "flex", justifyContent: "center", padding: "4rem" }}>
                  <Loader2 className="w-7 h-7 animate-spin text-[#B9001B]" />
                </div>
              ) : products.length === 0 ? (
                <div style={{ textAlign: "center", padding: "4rem 2rem", backgroundColor: "#FFFFFF", borderRadius: "12px", border: "1px solid #EDEDED" }}>
                  <span style={{ fontSize: "36px" }}>📦</span>
                  <h3 style={{ fontSize: "16px", fontWeight: "700", color: "#111", margin: "10px 0 4px" }}>No Products Listed</h3>
                  <p style={{ fontSize: "13px", color: "#666", margin: 0 }}>This vendor has not published any products yet.</p>
                </div>
              ) : (
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: "1.5rem" }}>
                  {products.map((prod) => (
                    <ProductCard key={prod.$id} product={prod} />
                  ))}
                </div>
              )}
            </>
          )}

          {activeTab === "posts" && (
            <>
              {postsLoading ? (
                <div style={{ display: "flex", justifyContent: "center", padding: "4rem" }}>
                  <Loader2 className="w-7 h-7 animate-spin text-[#B9001B]" />
                </div>
              ) : posts.length === 0 ? (
                <div style={{ textAlign: "center", padding: "4rem 2rem", backgroundColor: "#FFFFFF", borderRadius: "12px", border: "1px solid #EDEDED" }}>
                  <span style={{ fontSize: "36px" }}>📸</span>
                  <h3 style={{ fontSize: "16px", fontWeight: "700", color: "#111", margin: "10px 0 4px" }}>No Posts Published</h3>
                  <p style={{ fontSize: "13px", color: "#666", margin: 0 }}>This vendor has not shared any posts yet.</p>
                </div>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: "2rem", maxWidth: "500px", margin: "0 auto" }}>
                  {posts.map((post) => (
                    <PostCard
                      key={post.$id}
                      post={post}
                      vendorName={vendorInfo.businessName}
                      vendorLogo={vendorInfo.logoImage}
                      taggedProductsMap={
                        products.reduce((acc, p) => {
                          acc[p.$id] = p;
                          return acc;
                        }, {} as Record<string, any>)
                      }
                      currentUserId={currentUser?.$id}
                    />
                  ))}
                </div>
              )}
            </>
          )}
        </main>
      )}

      {/* Expanded Image Overlay */}
      {isExpanded && expandedImage && (
        <div
          onClick={() => setIsExpanded(false)}
          style={{
            position: "fixed",
            inset: 0,
            backgroundColor: "rgba(0,0,0,0.9)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1000,
            cursor: "zoom-out",
          }}
        >
          <button
            onClick={(e) => { e.stopPropagation(); setIsExpanded(false); }}
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
              color: "#FFF",
              fontSize: "24px",
              cursor: "pointer",
              zIndex: 1010,
            }}
          >
            ✕
          </button>
          <img
            src={expandedImage}
            alt="Expanded view"
            onClick={(e) => e.stopPropagation()}
            style={{
              maxWidth: "90%",
              maxHeight: "85%",
              objectFit: "contain",
              borderRadius: "8px",
              boxShadow: "0 10px 30px rgba(0,0,0,0.5)",
            }}
          />
        </div>
      )}

      {/* Floating Cart Button */}
      {cartItems.length > 0 && (
        <button
          onClick={() => setIsCartOpen(true)}
          style={{
            position: "fixed",
            bottom: "24px",
            right: "24px",
            backgroundColor: "#B9001B",
            color: "#FFFFFF",
            border: "none",
            width: "60px",
            height: "60px",
            borderRadius: "50%",
            boxShadow: "0 4px 20px rgba(185, 0, 27, 0.3)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: "pointer",
            zIndex: 999,
            transition: "transform 0.2s cubic-bezier(0.175, 0.885, 0.32, 1.275)"
          }}
          onMouseOver={(e) => e.currentTarget.style.transform = "scale(1.1)"}
          onMouseOut={(e) => e.currentTarget.style.transform = "scale(1)"}
        >
          <ShoppingBag style={{ width: "24px", height: "24px" }} />
          <span
            style={{
              position: "absolute",
              top: "-4px",
              right: "-4px",
              backgroundColor: "#111827",
              color: "#FFFFFF",
              fontSize: "11px",
              fontWeight: "bold",
              padding: "4px 8px",
              borderRadius: "50%",
              boxShadow: "0 2px 4px rgba(0,0,0,0.1)"
            }}
          >
            {cartItems.length}
          </span>
        </button>
      )}

      {/* Cart Drawer */}
      <CartDrawer
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        items={cartItems}
        onRemoveItem={handleRemoveCartItem}
        onSendCart={handleSendCart}
        isSending={messagingLoading}
      />
    </div>
  );
}
