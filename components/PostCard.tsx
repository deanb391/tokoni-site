"use client";

import React, { useState, useEffect, useRef } from "react";
import { Post } from "@/lib/services/posts.service";
import { Product } from "@/lib/services/products.service";
import { Heart, MessageCircle, Send, Bookmark, MoreHorizontal, ShoppingBag, ChevronLeft, ChevronRight, Loader2 } from "lucide-react";
import Link from "next/link";
import CommentDrawer from "@/components/CommentDrawer";
import { useUser } from "@/context/UserContext";
import { useFeed } from "@/context/FeedContext";
import { toggleFollowVendor, toggleSavePost } from "@/lib/api/users";

interface PostCardProps {
    post: Post;
    vendorName: string;
    vendorLogo?: string;
    taggedProductsMap: Record<string, Product>;
    onLikeToggle?: (postId: string) => void;
    currentUserId?: string;
    onMediaClick?: () => void;
}

export default function PostCard({
    post,
    vendorName,
    vendorLogo,
    taggedProductsMap,
    onLikeToggle,
    currentUserId,
    onMediaClick
}: PostCardProps) {
    const [activeMediaIndex, setActiveMediaIndex] = useState(0);
    const [isLiked, setIsLiked] = useState(currentUserId ? post.likedBy.includes(currentUserId) : false);
    const [likesCount, setLikesCount] = useState(post.likes);
    const [commentsCount, setCommentsCount] = useState(post.comments || 0);
    const [savedCount, setSavedCount] = useState(post.saved || 0);
    const [captionExpanded, setCaptionExpanded] = useState(false);
    const [isCommentDrawerOpen, setIsCommentDrawerOpen] = useState(false);

    const { user, setUser } = useUser();
    const { toggleSaveCount, incrementCommentCount } = useFeed();
    const [followingLoading, setFollowingLoading] = useState(false);
    const [saveLoading, setSaveLoading] = useState(false);

    const isFollowing = user?.following?.includes(post.vendor) || false;
    const isSaved = user?.savedPosts?.includes(post.$id) || false;

    const videoRef = useRef<HTMLVideoElement>(null);

    useEffect(() => {
        const videoEl = videoRef.current;
        if (!videoEl || post.type !== "video") return;

        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    videoEl.play().catch((err) => {
                        console.warn("Autoplay prevented, attempting muted play:", err);
                        videoEl.muted = true;
                        videoEl.play().catch((err2) => {
                            console.error("Muted video playback failed:", err2);
                        });
                    });
                } else {
                    videoEl.pause();
                }
            },
            {
                threshold: 0.5, // Trigger when 50% of the video is visible
            }
        );

        observer.observe(videoEl);

        return () => {
            observer.disconnect();
        };
    }, [post.type]);

    useEffect(() => {
        setIsLiked(currentUserId ? post.likedBy.includes(currentUserId) : false);
        setLikesCount(post.likes);
    }, [post.likes, post.likedBy, currentUserId]);

    useEffect(() => {
        setCommentsCount(post.comments || 0);
    }, [post.comments]);

    useEffect(() => {
        setSavedCount(post.saved || 0);
    }, [post.saved]);

    const handleFollowToggle = async (e: React.MouseEvent) => {
        e.stopPropagation();
        if (!user?.$id) {
            alert("Please sign in to follow vendors.");
            return;
        }
        setFollowingLoading(true);
        try {
            const updated = await toggleFollowVendor(user.$id, post.vendor);
            setUser(updated);
        } catch (err) {
            console.error("Failed to toggle follow vendor:", err);
        } finally {
            setFollowingLoading(false);
        }
    };

    const handleSaveToggle = async (e: React.MouseEvent) => {
        e.stopPropagation();
        if (!user?.$id) {
            alert("Please sign in to save posts.");
            return;
        }
        setSaveLoading(true);
        const willBeSaved = !isSaved;
        setSavedCount(prev => Math.max(0, prev + (willBeSaved ? 1 : -1)));
        if (toggleSaveCount) {
            toggleSaveCount(post.$id, willBeSaved);
        }
        try {
            const updated = await toggleSavePost(user.$id, post.$id);
            setUser(updated);
        } catch (err) {
            console.error("Failed to toggle save post:", err);
            setSavedCount(prev => Math.max(0, prev + (willBeSaved ? -1 : 1)));
            if (toggleSaveCount) {
                toggleSaveCount(post.$id, !willBeSaved);
            }
        } finally {
            setSaveLoading(false);
        }
    };

    const handleNext = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (activeMediaIndex < post.media.length - 1) {
            setActiveMediaIndex(prev => prev + 1);
        }
    };

    const handlePrev = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (activeMediaIndex > 0) {
            setActiveMediaIndex(prev => prev - 1);
        }
    };

    const handleLike = async () => {
        if (!currentUserId) return;
        const newIsLiked = !isLiked;
        setIsLiked(newIsLiked);
        setLikesCount(prev => newIsLiked ? prev + 1 : prev - 1);
        if (onLikeToggle) {
            onLikeToggle(post.$id);
        }
    };

    // Resolve first tagged product for the overlay tag
    const firstTaggedProduct = post.taggedProducts.length > 0 ? taggedProductsMap[post.taggedProducts[0]] : null;

    return (
        <article className="w-full bg-white border border-neutral-200 rounded-2xl overflow-hidden shadow-xs">
            {/* Post Header */}
            <div className="p-3.5 flex justify-between items-center border-b border-neutral-100">
                <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-full bg-red-50 border border-neutral-200 overflow-hidden flex items-center justify-center flex-shrink-0">
                        {vendorLogo ? (
                            <img src={vendorLogo} alt={vendorName} className="w-full h-full object-cover" />
                        ) : (
                            <span className="text-xs font-bold text-[#B9001B]">
                                {vendorName.slice(0, 2).toUpperCase()}
                            </span>
                        )}
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="flex flex-col">
                            <span className="text-sm font-bold text-neutral-900 leading-tight">{vendorName}</span>
                            <span className="text-[11px] text-neutral-400">
                                {new Date(post.$createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                            </span>
                        </div>
                        {user && user.$id !== post.vendor && (
                            <button
                                onClick={handleFollowToggle}
                                disabled={followingLoading}
                                className={`ml-2 text-[10px] font-extrabold px-2.5 py-0.5 rounded-full border transition-all cursor-pointer flex items-center justify-center min-w-[55px] ${isFollowing
                                        ? "bg-neutral-50 text-neutral-600 border-neutral-200 hover:bg-neutral-100"
                                        : "bg-[#B9001B]/5 hover:bg-[#B9001B]/10 text-[#B9001B] border-[#B9001B]/20"
                                    }`}
                            >
                                {followingLoading ? (
                                    <Loader2 className="w-3 h-3 animate-spin" />
                                ) : (
                                    isFollowing ? "Following" : "Follow"
                                )}
                            </button>
                        )}
                    </div>
                </div>
                <button className="text-neutral-500 hover:text-neutral-800 p-1 rounded-full hover:bg-neutral-50 transition-colors">
                    <MoreHorizontal className="w-5 h-5" />
                </button>
            </div>

            {/* Media Slider Area */}
            <div
                onClick={onMediaClick}
                className="relative aspect-square bg-neutral-950 flex items-center justify-center overflow-hidden group cursor-pointer"
            >
                {post.type === 'video' ? (
                    <video
                        ref={videoRef}
                        src={post.media[0]}
                        controls
                        loop
                        playsInline
                        className="w-full h-full object-contain"
                    />
                ) : (
                    <>
                        <img
                            src={post.media[activeMediaIndex]}
                            alt={`Post slide ${activeMediaIndex + 1}`}
                            className="w-full h-full object-contain transition-all duration-300"
                        />

                        {/* Slides Indicator Badge */}
                        {post.media.length > 1 && (
                            <span className="absolute top-4 right-4 bg-black/60 backdrop-blur-[2px] text-white text-[10px] font-bold px-2 py-0.5 rounded-full z-10 select-none">
                                {activeMediaIndex + 1}/{post.media.length}
                            </span>
                        )}

                        {/* Left Navigation Arrow */}
                        {activeMediaIndex > 0 && (
                            <button
                                type="button"
                                onClick={handlePrev}
                                className="absolute left-3 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white text-neutral-800 p-1.5 rounded-full opacity-0 group-hover:opacity-100 transition-all shadow-md active:scale-90"
                            >
                                <ChevronLeft className="w-5 h-5" />
                            </button>
                        )}

                        {/* Right Navigation Arrow */}
                        {activeMediaIndex < post.media.length - 1 && (
                            <button
                                type="button"
                                onClick={handleNext}
                                className="absolute right-3 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white text-neutral-800 p-1.5 rounded-full opacity-0 group-hover:opacity-100 transition-all shadow-md active:scale-90"
                            >
                                <ChevronRight className="w-5 h-5" />
                            </button>
                        )}

                        {/* Dots navigation */}
                        {post.media.length > 1 && (
                            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-1.5 z-10">
                                {post.media.map((_, idx) => (
                                    <div
                                        key={idx}
                                        className={`w-1.5 h-1.5 rounded-full transition-all ${idx === activeMediaIndex ? "bg-white scale-125" : "bg-white/40"
                                            }`}
                                    />
                                ))}
                            </div>
                        )}
                    </>
                )}

                {/* Price Tag Overlay for the first tagged product */}
                {firstTaggedProduct && (
                    <Link
                        href={`/product/${firstTaggedProduct.$id}`}
                        className="absolute bottom-4 right-4 bg-white hover:bg-neutral-50 text-neutral-900 px-3.5 py-1.5 rounded-full shadow-lg flex items-center gap-2 hover:scale-105 transition-all select-none z-10 border border-neutral-100 active:scale-95"
                    >
                        <span className="text-xs font-extrabold">₦{firstTaggedProduct.price.toLocaleString()}</span>
                        <div className="bg-[#B9001B] w-6 h-6 rounded-full flex items-center justify-center text-white">
                            <ShoppingBag className="w-3.5 h-3.5" />
                        </div>
                    </Link>
                )}
            </div>

            {/* Action Bar */}
            <div className="p-3.5 pb-2 flex justify-between items-center">
                <div className="flex gap-4">
                    <button
                        onClick={handleLike}
                        className={`transition-transform duration-200 active:scale-125 ${isLiked ? "text-[#B9001B]" : "text-neutral-700 hover:text-[#B9001B]"
                            }`}
                    >
                        <Heart className={`w-6 h-6 ${isLiked ? "fill-current" : ""}`} />
                    </button>
                    <button
                        onClick={() => setIsCommentDrawerOpen(true)}
                        className="text-neutral-700 hover:text-neutral-900 transition-colors cursor-pointer"
                    >
                        <MessageCircle className="w-6 h-6" />
                    </button>
                    <button className="text-neutral-700 hover:text-neutral-900 transition-colors">
                        <Send className="w-6 h-6" />
                    </button>
                </div>
                <button
                    onClick={handleSaveToggle}
                    disabled={saveLoading}
                    className="text-neutral-700 hover:text-neutral-900 transition-colors cursor-pointer"
                >
                    <Bookmark className={`w-6 h-6 ${isSaved ? "fill-neutral-900 text-neutral-900" : ""}`} />
                </button>
            </div>

            {/* Engagement metrics & caption */}
            <div className="px-3.5 pb-4 space-y-1.5 text-sm">
                <div className="flex items-center gap-2 text-xs font-bold text-neutral-500 mb-1 select-none">
                    <span>{likesCount.toLocaleString()} {likesCount === 1 ? "like" : "likes"}</span>
                    <span>•</span>
                    <button onClick={() => setIsCommentDrawerOpen(true)} className="hover:underline text-neutral-500 font-bold cursor-pointer">
                        {commentsCount.toLocaleString()} {commentsCount === 1 ? "comment" : "comments"}
                    </button>
                    <span>•</span>
                    <span>{savedCount.toLocaleString()} {savedCount === 1 ? "save" : "saves"}</span>
                </div>
                {post.caption && (
                    <div className="text-neutral-800 leading-normal font-medium break-words whitespace-pre-wrap">
                        <span className="font-extrabold text-neutral-900 mr-2">{vendorName}</span>
                        {post.caption.length <= 120 || captionExpanded ? (
                            <>
                                {post.caption}
                                {post.caption.length > 120 && (
                                    <button
                                        onClick={() => setCaptionExpanded(false)}
                                        className="text-neutral-400 font-bold ml-1.5 hover:text-neutral-600 animate-fade-in"
                                    >
                                        show less
                                    </button>
                                )}
                            </>
                        ) : (
                            <>
                                {post.caption.slice(0, 120)}...
                                <button
                                    onClick={() => setCaptionExpanded(true)}
                                    className="text-neutral-400 font-bold ml-1 hover:text-neutral-600"
                                >
                                    more
                                </button>
                            </>
                        )}
                    </div>
                )}

                {/* Tagged products list at the bottom of the post card */}
                {post.taggedProducts.length > 0 && (
                    <div className="pt-2 border-t border-neutral-100 flex flex-wrap gap-2">
                        {post.taggedProducts.map(id => {
                            const prod = taggedProductsMap[id];
                            if (!prod) return null;
                            return (
                                <Link
                                    key={id}
                                    href={`/product/${id}`}
                                    className="inline-flex items-center gap-1.5 bg-neutral-50 border border-neutral-200/60 hover:bg-red-50/50 hover:border-red-200 hover:text-[#B9001B] text-neutral-700 px-3 py-1 rounded-full text-xs font-semibold transition-all"
                                >
                                    <ShoppingBag className="w-3 h-3 text-neutral-500 hover:text-inherit" />
                                    {prod.name} <span className="font-bold ml-0.5">₦{prod.price.toLocaleString()}</span>
                                </Link>
                            );
                        })}
                    </div>
                )}
            </div>

            <CommentDrawer
                postId={post.$id}
                isOpen={isCommentDrawerOpen}
                onClose={() => setIsCommentDrawerOpen(false)}
                onCommentsCountChange={() => {
                    setCommentsCount(prev => prev + 1);
                    if (incrementCommentCount) {
                        incrementCommentCount(post.$id);
                    }
                }}
            />
        </article>
    );
}
