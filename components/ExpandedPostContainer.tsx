"use client";

import React, { useEffect, useRef, useState } from "react";
import { useFeed } from "@/context/FeedContext";
import { useUser } from "@/context/UserContext";
import { X, Heart, MessageCircle, Send, Bookmark, ShoppingBag, ChevronUp, ChevronDown, Loader2 } from "lucide-react";
import Link from "next/link";

export default function ExpandedPostContainer() {
  const { user } = useUser();
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
    fetchNextBatch
  } = useFeed();

  const [activeMediaIndexes, setActiveMediaIndexes] = useState<Record<string, number>>({});
  const containerRef = useRef<HTMLDivElement>(null);
  const itemRefs = useRef<Record<number, HTMLDivElement | null>>({});

  // Ensure active index is synced to highest viewed index for prefetching
  useEffect(() => {
    if (expandedPostIndex !== null) {
      setHighestViewedIndex(expandedPostIndex);
    }
  }, [expandedPostIndex]);

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
    if (expandedPostIndex !== null && itemRefs.current[expandedPostIndex]) {
      itemRefs.current[expandedPostIndex]?.scrollIntoView({
        behavior: "smooth",
        block: "center",
      });
    }
  }, [expandedPostIndex]);

  if (expandedPostIndex === null) return null;

  const handleClose = () => setExpandedPostIndex(null);

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
              className="w-full h-full min-h-screen flex-shrink-0 snap-start flex items-center justify-center relative bg-black border-b border-white/5"
            >
              {/* Media Section */}
              <div className="w-full h-full flex items-center justify-center relative">
                {post.type === "video" ? (
                  <video
                    src={post.media[0]}
                    controls
                    autoPlay={idx === expandedPostIndex}
                    loop
                    muted
                    playsInline
                    className="w-full h-full object-contain"
                  />
                ) : (
                  <div className="relative w-full h-full flex items-center justify-center">
                    <img
                      src={post.media[activeIdx]}
                      alt="Reel Slide"
                      className="w-full h-full object-contain"
                    />

                    {/* Carousel Nav Arrows */}
                    {activeIdx > 0 && (
                      <button
                        onClick={() => handlePrevMedia(post.$id)}
                        className="absolute left-4 top-1/2 -translate-y-1/2 bg-black/40 hover:bg-black/80 text-white p-2 rounded-full transition-all border border-white/10"
                      >
                        <ChevronUp className="w-5 h-5 -rotate-90" />
                      </button>
                    )}
                    {activeIdx < post.media.length - 1 && (
                      <button
                        onClick={() => handleNextMedia(post.$id, post.media.length)}
                        className="absolute right-4 top-1/2 -translate-y-1/2 bg-black/40 hover:bg-black/80 text-white p-2 rounded-full transition-all border border-white/10"
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
                            className={`w-1.5 h-1.5 rounded-full transition-all ${
                              dotIdx === activeIdx ? "bg-white scale-125" : "bg-white/40"
                            }`}
                          />
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* Info Overlay (Bottom-left side) */}
                <div className="absolute bottom-0 left-0 right-14 p-4 md:p-6 bg-gradient-to-t from-black/80 via-black/40 to-transparent flex flex-col gap-2 z-10 text-white">
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-full bg-red-600 overflow-hidden flex items-center justify-center border border-white/20">
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
                  </div>

                  {post.caption && (
                    <p className="text-xs text-neutral-200 line-clamp-3 leading-relaxed">
                      {post.caption}
                    </p>
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

                {/* Action Sidebar (Right overlay) */}
                <div className="absolute right-3 bottom-1/4 flex flex-col gap-5 items-center z-20 text-white">
                  {/* Like Button */}
                  <button
                    onClick={() => toggleLike(post.$id)}
                    className="flex flex-col items-center gap-1.5 group cursor-pointer"
                  >
                    <div className="bg-black/40 p-2.5 rounded-full backdrop-blur-xs group-hover:bg-[#B9001B]/95 border border-white/10 transition-all group-active:scale-125">
                      <Heart className={`w-5 h-5 ${isLiked ? "fill-red-600 text-red-600" : "text-white"}`} />
                    </div>
                    <span className="text-[10px] font-extrabold tracking-wide">{post.likes}</span>
                  </button>

                  {/* Comments */}
                  <button className="flex flex-col items-center gap-1.5 group">
                    <div className="bg-black/40 p-2.5 rounded-full backdrop-blur-xs group-hover:bg-white/20 border border-white/10 transition-all">
                      <MessageCircle className="w-5 h-5 text-white" />
                    </div>
                    <span className="text-[10px] font-extrabold tracking-wide">0</span>
                  </button>

                  {/* Share */}
                  <button className="flex flex-col items-center gap-1.5 group">
                    <div className="bg-black/40 p-2.5 rounded-full backdrop-blur-xs group-hover:bg-white/20 border border-white/10 transition-all">
                      <Send className="w-5 h-5 text-white" />
                    </div>
                  </button>

                  {/* Bookmark */}
                  <button className="flex flex-col items-center gap-1.5 group">
                    <div className="bg-black/40 p-2.5 rounded-full backdrop-blur-xs group-hover:bg-white/20 border border-white/10 transition-all">
                      <Bookmark className="w-5 h-5 text-white" />
                    </div>
                  </button>
                </div>
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
          className={`p-3 rounded-xl border border-white/10 transition-all ${
            expandedPostIndex === 0
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
          className={`p-3 rounded-xl border border-white/10 transition-all ${
            expandedPostIndex === posts.length - 1 && !hasMore
              ? "text-neutral-600 bg-transparent cursor-not-allowed opacity-50"
              : "text-white bg-black/40 hover:bg-[#B9001B] hover:scale-105 active:scale-95"
          }`}
        >
          <ChevronDown className="w-6 h-6" />
        </button>
      </div>
    </div>
  );
}
