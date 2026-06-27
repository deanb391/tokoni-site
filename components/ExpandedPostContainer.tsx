"use client";

import React, { useEffect, useRef, useState } from "react";
import { useFeed } from "@/context/FeedContext";
import { useUser } from "@/context/UserContext";
import { X, Heart, MessageCircle, Send, Bookmark, ShoppingBag, ChevronUp, ChevronDown, Loader2, Play, Pause, VolumeX, Volume2 } from "lucide-react";
import Link from "next/link";
import { useRouter } from 'nextjs-toploader/app';
import { useParams } from 'next/navigation';
import CommentDrawer from "@/components/CommentDrawer";
import { toggleFollowVendor, toggleSavePost } from "@/lib/api/users";
import { trackPostLikeKeywords, trackPostTimeSpentKeywords } from "@/lib/utils/keywordTracker";

export default function ExpandedPostContainer() {
  const { user, setUser } = useUser();
  const router = useRouter();
  const params = useParams();
  const routePostId = params?.postId as string;
  const [followingLoading, setFollowingLoading] = useState(false);
  const [saveLoading, setSaveLoading] = useState(false);

  const handleFollowToggle = async (vendorId: string) => {
    if (!user?.$id) {
      alert("Please sign in to follow vendors.");
      return;
    }
    setFollowingLoading(true);
    try {
      const updated = await toggleFollowVendor(user.$id, vendorId);
      setUser(updated);
    } catch (err) {
      console.error("Failed to toggle follow vendor:", err);
    } finally {
      setFollowingLoading(false);
    }
  };

  const handleSaveToggle = async (postId: string) => {
    if (!user?.$id) {
      alert("Please sign in to save posts.");
      return;
    }
    setSaveLoading(true);
    const isCurrentlySaved = user?.savedPosts?.includes(postId) || false;
    const willBeSaved = !isCurrentlySaved;
    toggleSaveCount(postId, willBeSaved);
    try {
      const updated = await toggleSavePost(user.$id, postId);
      setUser(updated);
    } catch (err) {
      console.error("Failed to toggle save post:", err);
      toggleSaveCount(postId, !willBeSaved);
    } finally {
      setSaveLoading(false);
    }
  };
  const {
    posts,
    loading,
    hasMore,
    expandedPostIndex,
    setExpandedPostIndex,
    setHighestViewedIndex,
    productsMap,
    vendorsMap,
    toggleLike,
    toggleSaveCount,
    incrementCommentCount,
    fetchNextBatch,
    initializeReels
  } = useFeed();

  const [activeMediaIndexes, setActiveMediaIndexes] = useState<Record<string, number>>({});
  const [isMuted, setIsMuted] = useState(true);
  const [doubleTapActive, setDoubleTapActive] = useState<{ postId: string } | null>(null);
  const [videoLoading, setVideoLoading] = useState<Record<string, boolean>>({});
  const [loadedImages, setLoadedImages] = useState<Record<string, boolean>>({});
  const clickTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const lastTapRef = useRef<number>(0);

  const handleMediaClick = (postId: string, isVideo: boolean, videoElement?: HTMLVideoElement | null) => {
    const now = Date.now();
    const DOUBLE_TAP_DELAY = 300;
    
    if (now - lastTapRef.current < DOUBLE_TAP_DELAY) {
      // Double tap detected
      if (clickTimeoutRef.current) {
        clearTimeout(clickTimeoutRef.current);
        clickTimeoutRef.current = null;
      }
      
      const post = posts.find(p => p.$id === postId);
      if (post) {
        const isCurrentlyLiked = user?.$id ? post.likedBy.includes(user.$id) : false;
        if (!isCurrentlyLiked) {
          toggleLike(postId);
          trackPostLikeKeywords(post.caption);
          import("@/lib/api/admin").then(({ logActivity }) => {
            logActivity("post_engage", postId);
          }).catch(e => console.error(e));
        }
      }
      
      setDoubleTapActive({ postId });
      setTimeout(() => {
        setDoubleTapActive(null);
      }, 800);
      
      lastTapRef.current = 0;
    } else {
      lastTapRef.current = now;
      
      clickTimeoutRef.current = setTimeout(() => {
        if (isVideo && videoElement) {
          if (videoElement.paused) {
            videoElement.play().catch(() => {});
            showFeedback(postId, "play");
          } else {
            videoElement.pause();
            showFeedback(postId, "pause");
          }
        }
        clickTimeoutRef.current = null;
      }, DOUBLE_TAP_DELAY);
    }
  };

  const [captionOverlayPostId, setCaptionOverlayPostId] = useState<string | null>(null);
  const [commentDrawerPostId, setCommentDrawerPostId] = useState<string | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const itemRefs = useRef<Record<number, HTMLDivElement | null>>({});
  const videoRefs = useRef<Record<number, HTMLVideoElement | null>>({});
  const trackingRef = useRef<{ postId: string; caption: string; startTime: number } | null>(null);

  const [activeFeedback, setActiveFeedback] = useState<{ postId: string; type: "play" | "pause" } | null>(null);
  const feedbackTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const showFeedback = (postId: string, type: "play" | "pause") => {
    if (feedbackTimeoutRef.current) {
      clearTimeout(feedbackTimeoutRef.current);
    }
    setActiveFeedback({ postId, type });
    feedbackTimeoutRef.current = setTimeout(() => {
      setActiveFeedback(null);
    }, 2000);
  };

  useEffect(() => {
    return () => {
      if (feedbackTimeoutRef.current) {
        clearTimeout(feedbackTimeoutRef.current);
      }
    };
  }, []);

  // Synchronize playing and pausing video elements
  useEffect(() => {
    Object.entries(videoRefs.current).forEach(([idxStr, video]) => {
      if (!video) return;
      const idx = parseInt(idxStr, 10);
      if (idx === expandedPostIndex) {
        video.play().catch((err) => {
          console.warn("Autoplay prevented, attempting muted play:", err);
          video.muted = true;
          video.play().catch((err2) => {
            console.error("Muted video playback failed:", err2);
          });
        });
      } else {
        video.pause();
        try {
          video.currentTime = 0;
        } catch (_) { }
      }
    });
  }, [expandedPostIndex]);

  // Ensure active index is synced to highest viewed index, increment views, and track time spent
  useEffect(() => {
    // Process previous tracking if it exists
    if (trackingRef.current) {
      const duration = (Date.now() - trackingRef.current.startTime) / 1000;
      if (duration >= 3) {
        trackPostTimeSpentKeywords(trackingRef.current.caption, duration);
        const pid = trackingRef.current.postId;
        import("@/lib/api/admin").then(({ logActivity }) => {
          logActivity("video_watch", pid, duration);
        }).catch(e => console.error(e));
      }
      trackingRef.current = null;
    }

    if (expandedPostIndex !== null && posts[expandedPostIndex]) {
      const activePost = posts[expandedPostIndex];
      setHighestViewedIndex(expandedPostIndex);
      setCaptionOverlayPostId(null);

      // Start new tracking
      trackingRef.current = {
        postId: activePost.$id,
        caption: activePost.caption,
        startTime: Date.now()
      };

      // Increment view count via API
      fetch("/api/posts/view", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ postId: activePost.$id })
      }).catch(err => console.error("Error logging view:", err));
    }

    // Cleanup: save time spent on unmount or before next change
    return () => {
      if (trackingRef.current) {
        const duration = (Date.now() - trackingRef.current.startTime) / 1000;
        if (duration >= 3) {
          trackPostTimeSpentKeywords(trackingRef.current.caption, duration);
          const pid = trackingRef.current.postId;
          import("@/lib/api/admin").then(({ logActivity }) => {
            logActivity("video_watch", pid, duration);
          }).catch(e => console.error(e));
        }
        trackingRef.current = null;
      }
    };
  }, [expandedPostIndex, posts]);

  // Auto-initialize reels queue if we are on a direct reels route
  useEffect(() => {
    if (routePostId && expandedPostIndex === null && !loading) {
      initializeReels(routePostId);
    }
  }, [routePostId, expandedPostIndex, loading, initializeReels]);

  // Handle keyboard events (Up / Down / Esc)
  useEffect(() => {
    if (expandedPostIndex === null) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowUp") {
        e.preventDefault();
        if (expandedPostIndex > 0) {
          setExpandedPostIndex(expandedPostIndex - 1);
        }
      } else if (e.key === "ArrowDown") {
        e.preventDefault();
        if (expandedPostIndex < posts.length - 1) {
          setExpandedPostIndex(expandedPostIndex + 1);
        } else if (hasMore && !loading) {
          fetchNextBatch(5).then(() => {
            setExpandedPostIndex(expandedPostIndex + 1);
          });
        }
      } else if (e.key === "Escape") {
        setExpandedPostIndex(null);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [expandedPostIndex, posts.length, hasMore, loading]);



  // Scroll active item into view when active index changes
  useEffect(() => {
    if (expandedPostIndex !== null && itemRefs.current[expandedPostIndex] && containerRef.current) {
      const container = containerRef.current;
      const height = container.clientHeight;
      if (height > 0) {
        const currentIdx = Math.round(container.scrollTop / height);
        if (currentIdx !== expandedPostIndex) {
          itemRefs.current[expandedPostIndex]?.scrollIntoView({
            behavior: "smooth",
            block: "center",
          });
        }
      }
    }
  }, [expandedPostIndex]);

  const handleScroll = () => {
    if (!containerRef.current) return;
    const container = containerRef.current;
    const scrollPos = container.scrollTop;
    const height = container.clientHeight;
    if (height === 0) return;
    const newIndex = Math.round(scrollPos / height);
    if (newIndex >= 0 && newIndex < posts.length && newIndex !== expandedPostIndex) {
      setExpandedPostIndex(newIndex);
    }
  };

  if (expandedPostIndex === null) return null;

  const handleClose = () => {
    setExpandedPostIndex(null);
    if (typeof window !== "undefined" && window.location.pathname.includes("/reels/")) {
      router.push("/feed");
    }
  };

  const handleNextMedia = (postId: string, totalMedia: number) => {
    const currentIdx = activeMediaIndexes[postId] || 0;
    if (currentIdx < totalMedia - 1) {
      setActiveMediaIndexes(prev => ({ ...prev, [postId]: currentIdx + 1 }));
    }
  };

  const handlePrevMedia = (postId: string) => {
    const currentIdx = activeMediaIndexes[postId] || 0;
    if (currentIdx > 0) {
      setActiveMediaIndexes(prev => ({ ...prev, [postId]: currentIdx - 1 }));
    }
  };

  return (
    <div className="fixed inset-0 bg-neutral-950 z-50 flex items-center justify-center select-none overflow-hidden">
      <style>{`
        @keyframes scaleUpFadeOut {
          0% {
            transform: scale(0.6);
            opacity: 0;
          }
          15% {
            transform: scale(1.1);
            opacity: 0.95;
          }
          25% {
            transform: scale(1);
            opacity: 1;
          }
          75% {
            transform: scale(1);
            opacity: 1;
          }
          100% {
            transform: scale(0.85);
            opacity: 0;
          }
        }
        .animate-scale-up-fade-out {
          animation: scaleUpFadeOut 2s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
        @keyframes heartPop {
          0% {
            transform: scale(0);
            opacity: 0;
          }
          15% {
            transform: scale(1.2);
            opacity: 0.9;
          }
          30% {
            transform: scale(0.9);
            opacity: 1;
          }
          80% {
            transform: scale(1);
            opacity: 1;
          }
          100% {
            transform: scale(1.4);
            opacity: 0;
          }
        }
        .animate-heart-pop {
          animation: heartPop 0.8s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards;
        }
      `}</style>
      {/* Mobile Back / Close Button */}
      <button
        onClick={handleClose}
        className="absolute top-4 left-4 md:top-6 md:left-6 z-50 bg-black/40 hover:bg-black/80 backdrop-blur-xs text-white p-2.5 rounded-full transition-all hover:scale-105 active:scale-95 border border-white/10"
      >
        <X className="w-6 h-6" />
      </button>

      {/* Expanded Reels Feed */}
      <div
        ref={containerRef}
        onScroll={handleScroll}
        className="w-full h-full md:max-w-2xl flex flex-col items-center justify-start overflow-y-scroll snap-y snap-mandatory scroll-smooth"
        style={{ scrollbarWidth: "none" }}
      >
        {posts.map((post, idx) => {
          const vendor = vendorsMap[post.vendor];
          const isLiked = user?.$id ? post.likedBy.includes(user.$id) : false;
          const activeIdx = activeMediaIndexes[post.$id] || 0;

          return (
            <div
              key={post.$id}
              ref={el => { itemRefs.current[idx] = el; }}
              className="w-full h-full flex-shrink-0 snap-start snap-always flex items-center justify-center relative bg-black"
              style={{ scrollSnapStop: "always" }}
            >
              {/* Media Section */}
              <div className="w-full h-full flex items-center justify-center relative">
                {post.type === "video" ? (
                  <div
                    className="relative w-full h-full flex items-center justify-center cursor-pointer"
                    onClick={(e) => {
                      const videoEl = videoRefs.current[idx];
                      handleMediaClick(post.$id, true, videoEl);
                    }}
                  >
                    <video
                      ref={el => { videoRefs.current[idx] = el; }}
                      src={idx <= expandedPostIndex + 1 ? post.media[0] : undefined}
                      preload={idx === expandedPostIndex ? "auto" : idx === expandedPostIndex + 1 ? "metadata" : "none"}
                      autoPlay={idx === expandedPostIndex}
                      loop
                      playsInline
                      muted={isMuted}
                      onWaiting={() => setVideoLoading(prev => ({ ...prev, [post.$id]: true }))}
                      onPlaying={() => setVideoLoading(prev => ({ ...prev, [post.$id]: false }))}
                      onLoadStart={() => setVideoLoading(prev => ({ ...prev, [post.$id]: true }))}
                      onCanPlay={() => setVideoLoading(prev => ({ ...prev, [post.$id]: false }))}
                      onSeeked={() => setVideoLoading(prev => ({ ...prev, [post.$id]: false }))}
                      onSeeking={() => setVideoLoading(prev => ({ ...prev, [post.$id]: true }))}
                      className="w-full h-full object-contain"
                    />

                    {/* Circle Loader (Instagram Style) */}
                    {videoLoading[post.$id] && (
                      <div className="absolute inset-0 flex items-center justify-center bg-black/10 z-20 pointer-events-none">
                        <div className="w-12 h-12 border-4 border-white/30 border-t-white rounded-full animate-spin" />
                      </div>
                    )}

                    {/* Mute/Unmute Overlay Span */}
                    {isMuted && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setIsMuted(false);
                          Object.values(videoRefs.current).forEach((v) => {
                            if (v) v.muted = false;
                          });
                        }}
                        className="absolute top-4 right-4 z-40 bg-black/60 hover:bg-black/80 backdrop-blur-xs text-white text-[11px] font-bold px-3 py-1.5 rounded-full border border-white/10 flex items-center gap-1.5 cursor-pointer shadow-lg animate-pulse"
                      >
                        <VolumeX className="w-3.5 h-3.5" />
                        Tap to unmute
                      </button>
                    )}

                    {/* Mute toggle button when unmuted */}
                    {!isMuted && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setIsMuted(true);
                          Object.values(videoRefs.current).forEach((v) => {
                            if (v) v.muted = true;
                          });
                        }}
                        className="absolute top-4 right-4 z-40 bg-black/60 hover:bg-black/80 backdrop-blur-xs text-white text-[11px] font-bold p-2 rounded-full border border-white/10 flex items-center justify-center cursor-pointer shadow-lg"
                      >
                        <Volume2 className="w-3.5 h-3.5" />
                      </button>
                    )}

                    {/* Double-tap Heart Animation */}
                    {doubleTapActive?.postId === post.$id && (
                      <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-30">
                        <Heart className="w-24 h-24 text-white fill-white drop-shadow-2xl animate-heart-pop" />
                      </div>
                    )}

                    {activeFeedback?.postId === post.$id && (
                      <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-30">
                        <div className="bg-black/60 text-white p-5 rounded-full backdrop-blur-xs shadow-xl animate-scale-up-fade-out flex items-center justify-center">
                          {activeFeedback.type === "play" ? (
                            <Play className="w-10 h-10 fill-current ml-1" />
                          ) : (
                            <Pause className="w-10 h-10 fill-current" />
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div
                    className="relative w-full h-full flex items-center justify-center cursor-pointer"
                    onClick={() => handleMediaClick(post.$id, false)}
                  >
                    <img
                      src={idx <= expandedPostIndex + 1 ? post.media[activeIdx] : undefined}
                      loading={idx === expandedPostIndex || idx === expandedPostIndex + 1 ? "eager" : "lazy"}
                      onLoad={() => setLoadedImages(prev => ({ ...prev, [post.media[activeIdx]]: true }))}
                      alt="Reel Slide"
                      className="w-full h-full object-contain"
                    />

                    {/* Image Loading Spinner Overlay */}
                    {!loadedImages[post.media[activeIdx]] && (
                      <div className="absolute inset-0 flex items-center justify-center bg-neutral-900 z-10 animate-pulse">
                        <div className="w-12 h-12 border-4 border-white/10 border-t-white/60 rounded-full animate-spin" />
                      </div>
                    )}

                    {/* Double-tap Heart Animation */}
                    {doubleTapActive?.postId === post.$id && (
                      <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-30">
                        <Heart className="w-24 h-24 text-white fill-white drop-shadow-2xl animate-heart-pop" />
                      </div>
                    )}

                    {/* Carousel Nav Arrows */}
                    {activeIdx > 0 && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handlePrevMedia(post.$id);
                        }}
                        className="absolute left-4 top-1/2 -translate-y-1/2 bg-black/40 hover:bg-black/80 text-white p-2 rounded-full transition-all border border-white/10 z-20"
                      >
                        <ChevronUp className="w-5 h-5 -rotate-90" />
                      </button>
                    )}
                    {activeIdx < post.media.length - 1 && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleNextMedia(post.$id, post.media.length);
                        }}
                        className="absolute right-4 top-1/2 -translate-y-1/2 bg-black/40 hover:bg-black/80 text-white p-2 rounded-full transition-all border border-white/10 z-20"
                      >
                        <ChevronDown className="w-5 h-5 -rotate-90" />
                      </button>
                    )}

                    {/* Dots indicator */}
                    {post.media.length > 1 && (
                      <div className="absolute bottom-24 left-1/2 -translate-x-1/2 flex gap-1.5 z-20 bg-black/30 px-3 py-1.5 rounded-full backdrop-blur-xs">
                        {post.media.map((_, dotIdx) => (
                          <div
                            key={dotIdx}
                            onClick={(e) => {
                              e.stopPropagation();
                              setActiveMediaIndexes(prev => ({ ...prev, [post.$id]: dotIdx }));
                            }}
                            className={`w-1.5 h-1.5 rounded-full transition-all cursor-pointer ${dotIdx === activeIdx ? "bg-white scale-125" : "bg-white/40"
                              }`}
                          />
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* Info Overlay (Bottom-left side) */}
                <div className="absolute bottom-6 left-0 right-14 p-4 md:p-6 bg-gradient-to-t from-black/80 via-black/40 to-transparent flex flex-col gap-2 z-10 text-white">
                  {!vendor ? (
                    <div className="flex items-center gap-2.5 animate-pulse">
                      <div className="w-9 h-9 rounded-full bg-white/20" />
                      <div className="w-28 h-3.5 bg-white/20 rounded" />
                    </div>
                  ) : (
                    <div className="flex items-center gap-2.5">
                      <Link
                        href={vendor.users ? `/profile/${vendor.users}` : "#"}
                        className="flex items-center gap-2.5 hover:opacity-85 transition-opacity"
                        onClick={(e) => {
                          if (!vendor.users) e.preventDefault();
                          e.stopPropagation();
                        }}
                      >
                        <div className="w-9 h-9 rounded-full bg-red-600 overflow-hidden flex items-center justify-center border border-white/20 flex-shrink-0">
                          {vendor?.logoImage ? (
                            <img src={vendor.logoImage} alt={vendor.businessName} className="w-full h-full object-cover" />
                          ) : (
                            <span className="text-xs font-extrabold text-white">
                              {vendor?.businessName?.slice(0, 2).toUpperCase() || "TK"}
                            </span>
                          )}
                        </div>
                        <span className="text-sm font-bold truncate max-w-[200px]">
                          {vendor?.businessName || "Tokoni Vendor"}
                        </span>
                      </Link>
                      {user && user.$id !== post.vendor && (
                        <button
                          onClick={() => handleFollowToggle(post.vendor)}
                          disabled={followingLoading}
                          className={`text-[9px] font-black px-2 py-0.5 rounded-full border transition-all cursor-pointer flex items-center justify-center min-w-[50px] ${user.following?.includes(post.vendor)
                            ? "bg-white/10 text-neutral-300 border-white/20 hover:bg-white/20"
                            : "bg-[#B9001B] hover:bg-[#B9001B]/90 text-white border-transparent"
                            }`}
                        >
                          {followingLoading ? (
                            <Loader2 className="w-2.5 h-2.5 animate-spin" />
                          ) : (
                            user.following?.includes(post.vendor) ? "Following" : "Follow"
                          )}
                        </button>
                      )}
                    </div>
                  )}

                  {post.caption && (
                    <div className="text-xs text-neutral-200 leading-relaxed max-w-full break-words whitespace-pre-wrap">
                      {post.caption.length <= 120 ? (
                        post.caption
                      ) : (
                        <div>
                          {post.caption.slice(0, 120)}...
                          <button
                            onClick={() => setCaptionOverlayPostId(post.$id)}
                            className="text-white/60 font-bold ml-1 hover:text-white cursor-pointer"
                          >
                            more
                          </button>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Tagged Products list */}
                  {post.taggedProducts.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mt-1.5">
                      {post.taggedProducts.map(prodId => {
                        const prod = productsMap[prodId];
                        if (!prod) return null;
                        return (
                          <Link
                            key={prodId}
                            href={`/product/${prodId}`}
                            className="inline-flex items-center gap-1 bg-white/10 hover:bg-white/25 border border-white/10 px-2 py-0.5 rounded-md text-[10px] font-bold text-white transition-all backdrop-blur-xs"
                          >
                            <ShoppingBag className="w-3 h-3 text-red-400" />
                            {prod.name} (₦{prod.price.toLocaleString()})
                          </Link>
                        );
                      })}
                    </div>
                  )}
                </div>

                {/* Bottom Sheet Caption Overlay */}
                {captionOverlayPostId === post.$id && (
                  <div className="absolute bottom-0 left-[5%] w-[90%] h-[50%] bg-neutral-900/95 backdrop-blur-md rounded-t-2xl z-30 border-t border-l border-r border-white/10 p-5 flex flex-col text-white animate-slide-up">
                    {/* Header */}
                    <div className="flex items-center justify-between border-b border-white/10 pb-3">
                      <div className="flex items-center gap-2.5">
                        <Link
                          href={vendor.users ? `/profile/${vendor.users}` : "#"}
                          className="flex items-center gap-2.5 hover:opacity-85 transition-opacity"
                          onClick={(e) => {
                            if (!vendor.users) e.preventDefault();
                            e.stopPropagation();
                          }}
                        >
                          <div className="w-8 h-8 rounded-full bg-red-600 overflow-hidden flex items-center justify-center border border-white/20 flex-shrink-0">
                            {vendor?.logoImage ? (
                              <img src={vendor.logoImage} alt={vendor.businessName} className="w-full h-full object-cover" />
                            ) : (
                              <span className="text-[10px] font-extrabold text-white">
                                {vendor?.businessName?.slice(0, 2).toUpperCase() || "TK"}
                              </span>
                            )}
                          </div>
                          <span className="text-xs font-bold truncate max-w-[180px]">
                            {vendor?.businessName || "Tokoni Vendor"}
                          </span>
                        </Link>
                        {user && user.$id !== post.vendor && (
                          <button
                            onClick={() => handleFollowToggle(post.vendor)}
                            disabled={followingLoading}
                            className={`ml-2 text-[9px] font-black px-2 py-0.5 rounded-full border transition-all cursor-pointer ${user.following?.includes(post.vendor)
                              ? "bg-white/10 text-neutral-300 border-white/20 hover:bg-white/20"
                              : "bg-[#B9001B] hover:bg-[#B9001B]/90 text-white border-transparent"
                              }`}
                          >
                            {user.following?.includes(post.vendor) ? "Following" : "Follow"}
                          </button>
                        )}
                      </div>
                      <button
                        onClick={() => setCaptionOverlayPostId(null)}
                        className="text-neutral-400 hover:text-white p-1 rounded-full hover:bg-white/10 transition-all cursor-pointer"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                    {/* Scrollable Text Body */}
                    <div className="flex-1 overflow-y-auto mt-4 pr-1 text-xs text-neutral-200 leading-relaxed break-words whitespace-pre-wrap scrollbar-thin">
                      {post.caption}
                    </div>
                  </div>
                )}

                <ExpandedActionSidebar
                  post={post}
                  user={user}
                  isLiked={isLiked}
                  saveLoading={saveLoading}
                  toggleLike={toggleLike}
                  setCommentDrawerPostId={setCommentDrawerPostId}
                  handleSaveToggle={handleSaveToggle}
                />
              </div>
            </div>
          );
        })}

        {/* Dynamic Loading / Loader */}
        {hasMore && (
          <div className="w-full py-8 flex justify-center items-center gap-2 text-white snap-start">
            <Loader2 className="w-6 h-6 animate-spin text-red-600" />
            <span className="text-xs font-bold text-neutral-400">Loading reels...</span>
          </div>
        )}
      </div>

      {/* Desktop Controller Side panel */}
      <div className="hidden md:flex flex-col gap-4 ml-6 p-4 bg-white/5 border border-white/10 rounded-2xl backdrop-blur-md z-10">
        <button
          disabled={expandedPostIndex === 0}
          onClick={() => setExpandedPostIndex(expandedPostIndex - 1)}
          className={`p-3 rounded-xl border border-white/10 transition-all ${expandedPostIndex === 0
            ? "text-neutral-600 bg-transparent cursor-not-allowed opacity-50"
            : "text-white bg-black/40 hover:bg-[#B9001B] hover:scale-105 active:scale-95"
            }`}
        >
          <ChevronUp className="w-6 h-6" />
        </button>
        <button
          disabled={expandedPostIndex === posts.length - 1 && !hasMore}
          onClick={() => {
            if (expandedPostIndex === posts.length - 1) {
              if (hasMore && !loading) {
                fetchNextBatch(5).then(() => {
                  setExpandedPostIndex(expandedPostIndex + 1);
                });
              }
            } else {
              setExpandedPostIndex(expandedPostIndex + 1);
            }
          }}
          className={`p-3 rounded-xl border border-white/10 transition-all ${expandedPostIndex === posts.length - 1 && !hasMore
            ? "text-neutral-600 bg-transparent cursor-not-allowed opacity-50"
            : "text-white bg-black/40 hover:bg-[#B9001B] hover:scale-105 active:scale-95"
            }`}
        >
          <ChevronDown className="w-6 h-6" />
        </button>
      </div>

      {commentDrawerPostId && (
        <CommentDrawer
          postId={commentDrawerPostId}
          isOpen={!!commentDrawerPostId}
          onClose={() => setCommentDrawerPostId(null)}
          onCommentsCountChange={() => incrementCommentCount(commentDrawerPostId)}
        />
      )}
    </div>
  );
}

interface ExpandedActionSidebarProps {
  post: any;
  user: any;
  isLiked: boolean;
  saveLoading: boolean;
  toggleLike: (postId: string) => void;
  setCommentDrawerPostId: (postId: string | null) => void;
  handleSaveToggle: (postId: string) => void;
}

function ExpandedActionSidebar({
  post,
  user,
  isLiked,
  saveLoading,
  toggleLike,
  setCommentDrawerPostId,
  handleSaveToggle,
}: ExpandedActionSidebarProps) {
  const [likeAnimating, setLikeAnimating] = useState(false);
  const [commentAnimating, setCommentAnimating] = useState(false);
  const [shareAnimating, setShareAnimating] = useState(false);
  const [saveAnimating, setSaveAnimating] = useState(false);
  const [heartParticles, setHeartParticles] = useState<{ id: number; x: number; y: number }[]>([]);
  
  const likeButtonRef = useRef<HTMLButtonElement>(null);
  const particleIdRef = useRef(0);

  const spawnHeartParticles = () => {
    if (!likeButtonRef.current) return;
    const rect = likeButtonRef.current.getBoundingClientRect();
    const container = likeButtonRef.current.closest(".snap-start");
    if (!container) return;
    const containerRect = container.getBoundingClientRect();
    const x = rect.left - containerRect.left + rect.width / 2;
    const y = rect.top - containerRect.top;

    const newParticles = Array.from({ length: 5 }, (_, i) => ({
      id: particleIdRef.current++,
      x: x + (Math.random() - 0.5) * 40,
      y,
    }));
    setHeartParticles((prev) => [...prev, ...newParticles]);
    setTimeout(() => {
      setHeartParticles((prev) => prev.filter((p) => !newParticles.find((n) => n.id === p.id)));
    }, 1000);
  };

  const handleLike = (e: React.MouseEvent) => {
    e.stopPropagation();
    setLikeAnimating(true);
    setTimeout(() => setLikeAnimating(false), 400);
    if (!isLiked) {
      spawnHeartParticles();
      trackPostLikeKeywords(post.caption);
      import("@/lib/api/admin").then(({ logActivity }) => {
        logActivity("post_engage", post.$id);
      }).catch(e => console.error(e));
    }
    toggleLike(post.$id);
  };

  const handleCommentClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCommentAnimating(true);
    setTimeout(() => setCommentAnimating(false), 350);
    setCommentDrawerPostId(post.$id);
  };

  const handleShareClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShareAnimating(true);
    setTimeout(() => setShareAnimating(false), 350);
    // Call share API route
    fetch("/api/posts/share", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ postId: post.$id })
    }).catch(err => console.error("Error logging share:", err));

    import("@/lib/api/admin").then(({ logActivity }) => {
      logActivity("post_engage", post.$id);
    }).catch(e => console.error(e));
  };

  const handleSaveClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setSaveAnimating(true);
    setTimeout(() => setSaveAnimating(false), 350);
    handleSaveToggle(post.$id);
  };

  const isSaved = user?.savedPosts?.includes(post.$id) || false;

  return (
    <>
      {/* Floating heart particles */}
      {heartParticles.map((p) => (
        <div
          key={p.id}
          style={{
            position: "absolute",
            left: p.x,
            top: p.y,
            pointerEvents: "none",
            zIndex: 40,
            animation: "float-heart-expanded 1s ease-out forwards",
            fontSize: "24px",
            transform: "translateX(-50%)",
          }}
        >
          ❤️
        </div>
      ))}

      <div className="absolute right-3 bottom-1/12 flex flex-col gap-5 items-center z-20 text-white">
        {/* Like Button */}
        <button
          ref={likeButtonRef}
          onClick={handleLike}
          style={{
            transform: likeAnimating ? "scale(1.35)" : "scale(1)",
            transition: "transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)",
            background: "none",
            border: "none",
            cursor: "pointer",
            padding: 0,
          }}
          className="flex flex-col items-center gap-1.2 group"
        >
          <div className="bg-black/40 p-2.5 rounded-full backdrop-blur-xs group-hover:bg-[#B9001B]/95 border border-white/10 transition-all">
            <Heart className={`w-5 h-5 ${isLiked ? "fill-red-600 text-red-600" : "text-white"}`} />
          </div>
          <span className="text-[10px] font-extrabold tracking-wide">{post.likes}</span>
        </button>

        {/* Comments */}
        <button
          onClick={handleCommentClick}
          style={{
            transform: commentAnimating ? "scale(1.25) rotate(-10deg)" : "scale(1) rotate(0deg)",
            transition: "transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)",
            background: "none",
            border: "none",
            cursor: "pointer",
            padding: 0,
          }}
          className="flex flex-col items-center gap-1.5 group"
        >
          <div className="bg-black/40 p-2.5 rounded-full backdrop-blur-xs group-hover:bg-white/20 border border-white/10 transition-all">
            <MessageCircle className="w-5 h-5 text-white" />
          </div>
          <span className="text-[10px] font-extrabold tracking-wide">{post?.comments || 0}</span>
        </button>

        {/* Share */}
        <button
          onClick={handleShareClick}
          style={{
            transform: shareAnimating ? "scale(1.2) translateX(4px)" : "scale(1) translateX(0)",
            transition: "transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)",
            background: "none",
            border: "none",
            cursor: "pointer",
            padding: 0,
          }}
          className="flex flex-col items-center gap-1.5 group"
        >
          <div className="bg-black/40 p-2.5 rounded-full backdrop-blur-xs group-hover:bg-white/20 border border-white/10 transition-all">
            <Send className="w-5 h-5 text-white" />
          </div>
        </button>

        {/* Bookmark */}
        <button
          onClick={handleSaveClick}
          disabled={saveLoading}
          style={{
            transform: saveAnimating ? "scale(1.3)" : "scale(1)",
            transition: "transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)",
            background: "none",
            border: "none",
            cursor: "pointer",
            padding: 0,
          }}
          className="flex flex-col items-center gap-1.5 group"
        >
          <div className="bg-black/40 p-2.5 rounded-full backdrop-blur-xs group-hover:bg-white/20 border border-white/10 transition-all">
            <Bookmark className={`w-5 h-5 ${isSaved ? "fill-white text-white" : "text-white"}`} />
          </div>
          <span className="text-[10px] font-extrabold tracking-wide">{post?.saved || 0}</span>
        </button>
      </div>

      <style>{`
        @keyframes float-heart-expanded {
          0% { opacity: 1; transform: translateX(-50%) scale(1) translateY(0); }
          100% { opacity: 0; transform: translateX(-50%) scale(1.4) translateY(-80px); }
        }
      `}</style>
    </>
  );
}
