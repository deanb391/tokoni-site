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
import { trackPostLikeKeywords } from "@/lib/utils/keywordTracker";

interface PostCardProps {
    post: Post;
    vendorName: string;
    vendorLogo?: string;
    vendorUserId?: string | null;
    taggedProductsMap: Record<string, Product>;
    onLikeToggle?: (postId: string) => void;
    currentUserId?: string;
    onMediaClick?: () => void;
    isLoadingVendor?: boolean;
}

// Floating heart particle
interface HeartParticle {
    id: number;
    x: number;
    y: number;
}

export default function PostCard({
    post,
    vendorName,
    vendorLogo,
    vendorUserId: vendorUserIdProp,
    taggedProductsMap,
    onLikeToggle,
    currentUserId,
    onMediaClick,
    isLoadingVendor = false
}: PostCardProps) {
    const [activeMediaIndex, setActiveMediaIndex] = useState(0);
    const [isLiked, setIsLiked] = useState(currentUserId ? post.likedBy.includes(currentUserId) : false);
    const [likesCount, setLikesCount] = useState(post.likes);
    const [commentsCount, setCommentsCount] = useState(post.comments || 0);
    const [savedCount, setSavedCount] = useState(post.saved || 0);
    const [captionExpanded, setCaptionExpanded] = useState(false);
    const [isCommentDrawerOpen, setIsCommentDrawerOpen] = useState(false);
    const [heartParticles, setHeartParticles] = useState<HeartParticle[]>([]);
    const [likeAnimating, setLikeAnimating] = useState(false);
    const [commentAnimating, setCommentAnimating] = useState(false);
    const [shareAnimating, setShareAnimating] = useState(false);
    const [saveAnimating, setSaveAnimating] = useState(false);
    const likeButtonRef = useRef<HTMLButtonElement>(null);

    const { user, setUser } = useUser();
    const { toggleSaveCount, incrementCommentCount, expandedPostIndex } = useFeed();
    const [followingLoading, setFollowingLoading] = useState(false);
    const [saveLoading, setSaveLoading] = useState(false);
    const [videoLoading, setVideoLoading] = useState(true);
    const [loadedImages, setLoadedImages] = useState<Record<string, boolean>>({});
    const vendorId = typeof post.vendor === "string" ? post.vendor : (post.vendor as any)?.$id || "";
    const vendorUserId = vendorUserIdProp || (typeof post.vendor === "object" && post.vendor ? (post.vendor as any).users : null) || (vendorId?.startsWith("mock-vendor-") ? "mock-user-id" : null);

    const isFollowing = user?.following?.includes(vendorId) || false;
    const isSaved = user?.savedPosts?.includes(post.$id) || false;

    const videoRef = useRef<HTMLVideoElement>(null);
    let particleIdRef = useRef(0);

    useEffect(() => {
        const videoEl = videoRef.current;
        if (!videoEl || post.type !== "video") return;

        // If any post is expanded in reels mode, pause feed card videos immediately
        if (expandedPostIndex !== null) {
            videoEl.pause();
            return;
        }

        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting && expandedPostIndex === null) {
                    videoEl.play().catch(() => {
                        videoEl.muted = true;
                        videoEl.play().catch(() => {});
                    });
                } else {
                    videoEl.pause();
                }
            },
            { threshold: 0.5 }
        );
        observer.observe(videoEl);
        return () => observer.disconnect();
    }, [post.type, expandedPostIndex]);

    useEffect(() => {
        const videoEl = videoRef.current;
        if (!videoEl || post.type !== "video") return;

        let playStartTime = 0;
        let totalWatchedThisSession = 0;

        const onPlay = () => {
            playStartTime = Date.now();
        };

        const onPause = () => {
            if (playStartTime > 0) {
                const duration = (Date.now() - playStartTime) / 1000;
                totalWatchedThisSession += duration;
                playStartTime = 0;
            }
        };

        videoEl.addEventListener("play", onPlay);
        videoEl.addEventListener("pause", onPause);

        return () => {
            videoEl.removeEventListener("play", onPlay);
            videoEl.removeEventListener("pause", onPause);
            if (playStartTime > 0) {
                const duration = (Date.now() - playStartTime) / 1000;
                totalWatchedThisSession += duration;
            }
            if (totalWatchedThisSession >= 3) {
                import("@/lib/api/admin").then(({ logActivity }) => {
                    logActivity("video_watch", post.$id, totalWatchedThisSession);
                }).catch(e => console.error(e));
            }
        };
    }, [post.type, post.$id]);

    useEffect(() => {
        setIsLiked(currentUserId ? post.likedBy.includes(currentUserId) : false);
        setLikesCount(post.likes);
    }, [post.likes, post.likedBy, currentUserId]);

    useEffect(() => { setCommentsCount(post.comments || 0); }, [post.comments]);
    useEffect(() => { setSavedCount(post.saved || 0); }, [post.saved]);

    const spawnHeartParticles = () => {
        if (!likeButtonRef.current) return;
        const rect = likeButtonRef.current.getBoundingClientRect();
        const containerRect = likeButtonRef.current.closest('article')?.getBoundingClientRect();
        if (!containerRect) return;
        const x = rect.left - containerRect.left + rect.width / 2;
        const y = rect.top - containerRect.top;

        const newParticles: HeartParticle[] = Array.from({ length: 5 }, (_, i) => ({
            id: particleIdRef.current++,
            x: x + (Math.random() - 0.5) * 40,
            y,
        }));
        setHeartParticles(prev => [...prev, ...newParticles]);
        setTimeout(() => {
            setHeartParticles(prev => prev.filter(p => !newParticles.find(n => n.id === p.id)));
        }, 1000);
    };

    const handleFollowToggle = async (e: React.MouseEvent) => {
        e.stopPropagation();
        if (!user?.$id) { alert("Please sign in to follow vendors."); return; }
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

    const handleSaveToggle = async (e: React.MouseEvent) => {
        e.stopPropagation();
        if (!user?.$id) { alert("Please sign in to save posts."); return; }
        setSaveAnimating(true);
        setTimeout(() => setSaveAnimating(false), 350);
        setSaveLoading(true);
        const willBeSaved = !isSaved;
        setSavedCount(prev => Math.max(0, prev + (willBeSaved ? 1 : -1)));
        if (toggleSaveCount) toggleSaveCount(post.$id, willBeSaved);
        try {
            const updated = await toggleSavePost(user.$id, post.$id);
            setUser(updated);
        } catch (err) {
            console.error("Failed to toggle save post:", err);
            setSavedCount(prev => Math.max(0, prev + (willBeSaved ? -1 : 1)));
            if (toggleSaveCount) toggleSaveCount(post.$id, !willBeSaved);
        } finally {
            setSaveLoading(false);
        }
    };

    const handleNext = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (activeMediaIndex < post.media.length - 1) setActiveMediaIndex(prev => prev + 1);
    };

    const handlePrev = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (activeMediaIndex > 0) setActiveMediaIndex(prev => prev - 1);
    };

    const handleLike = () => {
        if (!currentUserId) return;
        const newIsLiked = !isLiked;
        setIsLiked(newIsLiked);
        setLikesCount(prev => newIsLiked ? prev + 1 : prev - 1);
        setLikeAnimating(true);
        setTimeout(() => setLikeAnimating(false), 400);
        if (newIsLiked) {
            spawnHeartParticles();
            trackPostLikeKeywords(post.caption);
            import("@/lib/api/admin").then(({ logActivity }) => {
                logActivity("post_engage", post.$id);
            }).catch(e => console.error(e));
        }
        if (onLikeToggle) onLikeToggle(post.$id);
    };

    const handleCommentClick = () => {
        setCommentAnimating(true);
        setTimeout(() => setCommentAnimating(false), 350);
        setIsCommentDrawerOpen(true);
    };

    const handleShareClick = () => {
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

    const firstTaggedProduct = post.taggedProducts.length > 0 ? taggedProductsMap[post.taggedProducts[0]] : null;

    return (
        <article className="w-full bg-white border border-neutral-200 rounded-2xl overflow-hidden shadow-xs" style={{ position: 'relative' }}>

            {/* Floating heart particles */}
            {heartParticles.map(p => (
                <div
                    key={p.id}
                    style={{
                        position: 'absolute',
                        left: p.x,
                        top: p.y,
                        pointerEvents: 'none',
                        zIndex: 20,
                        animation: 'float-heart 1s ease-out forwards',
                        fontSize: '18px',
                        transform: 'translateX(-50%)',
                    }}
                >
                    ❤️
                </div>
            ))}

            {/* Post Header */}
            <div className="p-3.5 flex justify-between items-center border-b border-neutral-100">
                <div className="flex items-center gap-2.5 flex-1 min-w-0">
                    {isLoadingVendor ? (
                        <div className="flex items-center gap-2.5 w-full">
                            <div className="w-9 h-9 rounded-full bg-neutral-100 animate-pulse" />
                            <div className="flex flex-col gap-1 flex-1">
                                <div className="w-24 h-3.5 bg-neutral-100 rounded animate-pulse" />
                                <div className="w-16 h-2.5 bg-neutral-100 rounded animate-pulse" />
                            </div>
                        </div>
                    ) : (
                        <>
                            <Link href={vendorUserId ? `/profile/${vendorUserId}` : "#"} className="w-9 h-9 rounded-full bg-red-50 border border-neutral-200 overflow-hidden flex items-center justify-center flex-shrink-0 hover:opacity-85 transition-opacity">
                                {vendorLogo ? (
                                    <img src={vendorLogo} alt={vendorName} className="w-full h-full object-cover" />
                                ) : (
                                    <span className="text-xs font-bold text-[#B9001B]">{vendorName.slice(0, 2).toUpperCase()}</span>
                                )}
                            </Link>
                            <div className="flex items-center gap-2">
                                <div className="flex flex-col">
                                    <Link href={vendorUserId ? `/profile/${vendorUserId}` : "#"} className="text-sm font-bold text-neutral-900 leading-tight hover:underline">
                                        {vendorName}
                                    </Link>
                                    <span className="text-[11px] text-neutral-400">
                                        {new Date(post.$createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                                    </span>
                                </div>
                                {user && vendorUserId && user.$id !== vendorUserId && (
                                    <button
                                        onClick={handleFollowToggle}
                                        disabled={followingLoading}
                                        className={`ml-2 text-[10px] font-extrabold px-2.5 py-0.5 rounded-full border transition-all cursor-pointer flex items-center justify-center min-w-[55px] ${isFollowing
                                            ? "bg-neutral-50 text-neutral-600 border-neutral-200 hover:bg-neutral-100"
                                            : "bg-[#B9001B]/5 hover:bg-[#B9001B]/10 text-[#B9001B] border-[#B9001B]/20"
                                            }`}
                                    >
                                        {followingLoading ? <Loader2 className="w-3 h-3 animate-spin" /> : isFollowing ? "Following" : "Follow"}
                                    </button>
                                )}
                            </div>
                        </>
                    )}
                </div>
                {vendorName && vendorName !== "Loading..." && (
                    <button className="text-neutral-500 hover:text-neutral-800 p-1 rounded-full hover:bg-neutral-50 transition-colors">
                        <MoreHorizontal className="w-5 h-5" />
                    </button>
                )}
            </div>

            {/* Media Slider */}
            <div 
                onClick={() => {
                    if (videoRef.current) {
                        videoRef.current.pause();
                    }
                    onMediaClick?.();
                }}
                className="relative aspect-square bg-neutral-950 flex items-center justify-center overflow-hidden group cursor-pointer"
            >
                {post.type === 'video' ? (
                    <>
                        <video
                            ref={videoRef}
                            src={post.media[0]}
                            preload="metadata"
                            controls
                            loop
                            playsInline
                            onPlay={(e) => {
                                if (expandedPostIndex !== null) {
                                    e.currentTarget.pause();
                                }
                            }}
                            onWaiting={() => setVideoLoading(true)}
                            onPlaying={() => setVideoLoading(false)}
                            onLoadStart={() => setVideoLoading(true)}
                            onCanPlay={() => setVideoLoading(false)}
                            onSeeked={() => setVideoLoading(false)}
                            onSeeking={() => setVideoLoading(true)}
                            className="w-full h-full object-contain"
                        />
                        {videoLoading && (
                            <div className="absolute inset-0 flex items-center justify-center bg-black/10 z-20 pointer-events-none">
                                <div className="w-12 h-12 border-4 border-white/30 border-t-white rounded-full animate-spin" />
                            </div>
                        )}
                    </>
                ) : (
                    <>
                        <img
                            src={post.media[activeMediaIndex]}
                            onLoad={() => setLoadedImages(prev => ({ ...prev, [post.media[activeMediaIndex]]: true }))}
                            alt={`Post slide ${activeMediaIndex + 1}`}
                            className="w-full h-full object-contain transition-all duration-300"
                        />
                        {!loadedImages[post.media[activeMediaIndex]] && (
                            <div className="absolute inset-0 flex items-center justify-center bg-neutral-900/10 z-10 animate-pulse">
                                <div className="w-10 h-10 border-4 border-neutral-300 border-t-neutral-600 rounded-full animate-spin" />
                            </div>
                        )}
                        {post.media.length > 1 && (
                            <span className="absolute top-4 right-4 bg-black/60 backdrop-blur-[2px] text-white text-[10px] font-bold px-2 py-0.5 rounded-full z-10 select-none">
                                {activeMediaIndex + 1}/{post.media.length}
                            </span>
                        )}
                        {activeMediaIndex > 0 && (
                            <button type="button" onClick={handlePrev} className="absolute left-3 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white text-neutral-800 p-1.5 rounded-full opacity-0 group-hover:opacity-100 transition-all shadow-md active:scale-90 z-20">
                                <ChevronLeft className="w-5 h-5" />
                            </button>
                        )}
                        {activeMediaIndex < post.media.length - 1 && (
                            <button type="button" onClick={handleNext} className="absolute right-3 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white text-neutral-800 p-1.5 rounded-full opacity-0 group-hover:opacity-100 transition-all shadow-md active:scale-90 z-20">
                                <ChevronRight className="w-5 h-5" />
                            </button>
                        )}
                        {post.media.length > 1 && (
                            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-1.5 z-10">
                                {post.media.map((_, idx) => (
                                    <div key={idx} className={`w-1.5 h-1.5 rounded-full transition-all ${idx === activeMediaIndex ? "bg-white scale-125" : "bg-white/40"}`} />
                                ))}
                            </div>
                        )}
                    </>
                )}
                {firstTaggedProduct && (
                    <Link href={`/product/${firstTaggedProduct.$id}`} className="absolute bottom-4 right-4 bg-white hover:bg-neutral-50 text-neutral-900 px-3.5 py-1.5 rounded-full shadow-lg flex items-center gap-2 hover:scale-105 transition-all select-none z-10 border border-neutral-100 active:scale-95">
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
                    {/* Like button */}
                    <button
                        ref={likeButtonRef}
                        onClick={handleLike}
                        style={{
                            transform: likeAnimating ? 'scale(1.35)' : 'scale(1)',
                            transition: 'transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)',
                            color: isLiked ? '#B9001B' : '#374151',
                            background: 'none',
                            border: 'none',
                            cursor: 'pointer',
                            padding: 0,
                            position: 'relative',
                        }}
                    >
                        <Heart
                            className="w-6 h-6"
                            style={{
                                fill: isLiked ? '#B9001B' : 'none',
                                transition: 'fill 0.2s ease, color 0.2s ease',
                            }}
                        />
                    </button>

                    {/* Comment button */}
                    <button
                        onClick={handleCommentClick}
                        style={{
                            transform: commentAnimating ? 'scale(1.25) rotate(-10deg)' : 'scale(1) rotate(0deg)',
                            transition: 'transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)',
                            color: '#374151',
                            background: 'none',
                            border: 'none',
                            cursor: 'pointer',
                            padding: 0,
                        }}
                    >
                        <MessageCircle className="w-6 h-6" />
                    </button>

                    {/* Share button */}
                    <button
                        onClick={handleShareClick}
                        style={{
                            transform: shareAnimating ? 'scale(1.2) translateX(4px)' : 'scale(1) translateX(0)',
                            transition: 'transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)',
                            color: '#374151',
                            background: 'none',
                            border: 'none',
                            cursor: 'pointer',
                            padding: 0,
                        }}
                    >
                        <Send className="w-6 h-6" />
                    </button>
                </div>

                {/* Save button */}
                <button
                    onClick={handleSaveToggle}
                    disabled={saveLoading}
                    style={{
                        transform: saveAnimating ? 'scale(1.3)' : 'scale(1)',
                        transition: 'transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)',
                        color: isSaved ? '#111827' : '#374151',
                        background: 'none',
                        border: 'none',
                        cursor: 'pointer',
                        padding: 0,
                    }}
                >
                    <Bookmark
                        className="w-6 h-6"
                        style={{ fill: isSaved ? '#111827' : 'none', transition: 'fill 0.2s ease' }}
                    />
                </button>
            </div>

            {/* Metrics & Caption */}
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
                        <Link href={vendorUserId ? `/profile/${vendorUserId}` : "#"} className="font-extrabold text-neutral-900 mr-2 hover:underline">
                            {vendorName}
                        </Link>
                        {post.caption.length <= 120 || captionExpanded ? (
                            <>
                                {post.caption}
                                {post.caption.length > 120 && (
                                    <button onClick={() => setCaptionExpanded(false)} className="text-neutral-400 font-bold ml-1.5 hover:text-neutral-600">show less</button>
                                )}
                            </>
                        ) : (
                            <>
                                {post.caption.slice(0, 120)}...
                                <button onClick={() => setCaptionExpanded(true)} className="text-neutral-400 font-bold ml-1 hover:text-neutral-600">more</button>
                            </>
                        )}
                    </div>
                )}
                {post.taggedProducts.length > 0 && (
                    <div className="pt-2 border-t border-neutral-100 flex flex-wrap gap-2">
                        {post.taggedProducts.map(id => {
                            const prod = taggedProductsMap[id];
                            if (!prod) return null;
                            return (
                                <Link key={id} href={`/product/${id}`} className="inline-flex items-center gap-1.5 bg-neutral-50 border border-neutral-200/60 hover:bg-red-50/50 hover:border-red-200 hover:text-[#B9001B] text-neutral-700 px-3 py-1 rounded-full text-xs font-semibold transition-all">
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
                    if (incrementCommentCount) incrementCommentCount(post.$id);
                }}
            />

            <style>{`
                @keyframes float-heart {
                    0% { opacity: 1; transform: translateX(-50%) scale(1) translateY(0); }
                    100% { opacity: 0; transform: translateX(-50%) scale(1.4) translateY(-60px); }
                }
            `}</style>
        </article>
    );
}
