"use client";

import React, { useEffect, useState, useRef } from "react";
import { X, Heart, Send, MessageCircle, CornerDownRight, Loader2 } from "lucide-react";
import { useUser } from "@/context/UserContext";
import { Comment, createComment, getComments, toggleCommentLike } from "@/lib/api/comments";
import { getUserById } from "@/lib/api/users";

interface CommentDrawerProps {
  postId: string;
  isOpen: boolean;
  onClose: () => void;
  onCommentsCountChange?: (count: number) => void;
}

export default function CommentDrawer({
  postId,
  isOpen,
  onClose,
  onCommentsCountChange,
}: CommentDrawerProps) {
  const { user } = useUser();
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(false);
  const [nextCursor, setNextCursor] = useState<string | undefined>(undefined);

  const [inputText, setInputText] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [replyingTo, setReplyingTo] = useState<Comment | null>(null);

  // User Profile Cache: userId -> user profile object
  const [profiles, setProfiles] = useState<Record<string, any>>({});

  // Replies state: parentId -> replies list
  const [replies, setReplies] = useState<Record<string, Comment[]>>({});
  const [repliesLoading, setRepliesLoading] = useState<Record<string, boolean>>({});
  const [expandedReplies, setExpandedReplies] = useState<Record<string, boolean>>({});

  const listRef = useRef<HTMLDivElement>(null);

  // Load initial top-level comments
  useEffect(() => {
    if (isOpen && postId) {
      loadInitialComments();
    } else {
      // Clear state when drawer closes
      setComments([]);
      setReplies({});
      setExpandedReplies({});
      setReplyingTo(null);
      setInputText("");
    }
  }, [isOpen, postId]);

  const loadInitialComments = async () => {
    setLoading(true);
    try {
      const res = await getComments(postId, "", 10);
      console.log("Post Id: ", postId)
      setComments(res.comments);
      setNextCursor(res.nextCursor);
      setHasMore(res.hasMore);

      // Trigger profile fetches for loaded comments
      res.comments.forEach((c) => {
        fetchProfile(c.users);
      });
    } catch (err) {
      console.error("Failed to load comments:", err);
    } finally {
      setLoading(false);
    }
  };

  const loadMoreComments = async () => {
    if (loading || !hasMore || !nextCursor) return;
    setLoading(true);
    try {
      const res = await getComments(postId, "", 10, nextCursor);
      setComments((prev) => [...prev, ...res.comments]);
      setNextCursor(res.nextCursor);
      setHasMore(res.hasMore);

      res.comments.forEach((c) => {
        fetchProfile(c.users);
      });
    } catch (err) {
      console.error("Failed to load more comments:", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchProfile = async (userId: string) => {
    if (!userId || profiles[userId]) return;
    try {
      const profile = await getUserById(userId);
      setProfiles((prev) => ({ ...prev, [userId]: profile }));
    } catch (err) {
      // Silently catch profile load errors
      console.warn("Could not load profile for comment user:", userId);
    }
  };

  // Load nested replies for a comment
  const loadReplies = async (parentId: string) => {
    setRepliesLoading((prev) => ({ ...prev, [parentId]: true }));
    try {
      const res = await getComments(postId, parentId, 20);
      setReplies((prev) => ({ ...prev, [parentId]: res.comments }));
      setExpandedReplies((prev) => ({ ...prev, [parentId]: true }));

      // Fetch profiles for replies
      res.comments.forEach((r) => {
        fetchProfile(r.users);
      });
    } catch (err) {
      console.error("Failed to load replies:", err);
    } finally {
      setRepliesLoading((prev) => ({ ...prev, [parentId]: false }));
    }
  };

  const handlePostComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !inputText.trim() || submitting) return;

    setSubmitting(true);
    const textToSend = inputText.trim();
    setInputText("");

    try {
      const parentId = replyingTo ? replyingTo.$id : "";
      const newComment = await createComment(postId, user.$id, textToSend, parentId);

      if (newComment) {
        if (!newComment.users || typeof newComment.users === "object") {
          newComment.users = user.$id;
        }
      }

      // Prepend current user profile to cache
      setProfiles((prev) => {
        if (prev[user.$id]) return prev;
        return { ...prev, [user.$id]: user };
      });

      if (parentId) {
        // Add to replies list
        setReplies((prev) => {
          const existing = prev[parentId] || [];
          return { ...prev, [parentId]: [newComment, ...existing] };
        });
        setExpandedReplies((prev) => ({ ...prev, [parentId]: true }));
        setReplyingTo(null);
      } else {
        // Prepend to top-level comments
        setComments((prev) => [newComment, ...prev]);
        if (onCommentsCountChange) {
          onCommentsCountChange(comments.length + 1);
        }
      }
    } catch (err) {
      console.error("Failed to post comment:", err);
      setInputText(textToSend); // restore on error
    } finally {
      setSubmitting(false);
    }
  };

  const handleLikeComment = async (commentId: string, isReply = false, parentId = "") => {
    if (!user) return;

    // Optimistic Update
    if (isReply && parentId) {
      setReplies((prev) => {
        const list = prev[parentId] || [];
        return {
          ...prev,
          [parentId]: list.map((c) => {
            if (c.$id !== commentId) return c;
            const liked = c.likedBy.includes(user.$id);
            const nextLikedBy = liked
              ? c.likedBy.filter((id) => id !== user.$id)
              : [...c.likedBy, user.$id];
            return {
              ...c,
              likes: nextLikedBy.length,
              likedBy: nextLikedBy,
            };
          }),
        };
      });
    } else {
      setComments((prev) =>
        prev.map((c) => {
          if (c.$id !== commentId) return c;
          const liked = c.likedBy.includes(user.$id);
          const nextLikedBy = liked
            ? c.likedBy.filter((id) => id !== user.$id)
            : [...c.likedBy, user.$id];
          return {
            ...c,
            likes: nextLikedBy.length,
            likedBy: nextLikedBy,
          };
        })
      );
    }

    try {
      await toggleCommentLike(commentId, user.$id);
    } catch (err) {
      console.error("Failed to toggle comment like:", err);
      // Re-load comments to sync correct likes on error
      if (isReply && parentId) {
        loadReplies(parentId);
      } else {
        loadInitialComments();
      }
    }
  };

  const getFriendlyTime = (dateStr: string) => {
    const d = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - d.getTime();
    const diffSec = Math.floor(diffMs / 1000);
    const diffMin = Math.floor(diffSec / 60);
    const diffHr = Math.floor(diffMin / 60);
    const diffDays = Math.floor(diffHr / 24);

    if (diffSec < 60) return "just now";
    if (diffMin < 60) return `${diffMin}m`;
    if (diffHr < 24) return `${diffHr}h`;
    return `${diffDays}d`;
  };

  const getProfileName = (userId: string) => {
    const profile = profiles[userId];
    if (!profile) return "User";
    return profile.name || profile.username || "User";
  };

  const getProfileInitials = (userId: string) => {
    const name = getProfileName(userId);
    return name.slice(0, 2).toUpperCase();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 backdrop-blur-xs select-none">
      {/* Click outside to close */}
      <div className="absolute inset-0" onClick={onClose} />

      {/* Main Drawer Container */}
      <div className="relative w-full max-w-2xl h-[80vh] md:h-[75vh] bg-neutral-900 border-t border-white/10 rounded-t-3xl flex flex-col text-white animate-slide-up z-10 overflow-hidden">
        {/* Drag handle/Indicator */}
        <div className="w-full flex justify-center py-2">
          <div className="w-12 h-1 bg-white/20 rounded-full" />
        </div>

        {/* Drawer Header */}
        <div className="flex items-center justify-between px-5 pb-3 border-b border-white/5">
          <div className="flex items-center gap-2">
            <MessageCircle className="w-5 h-5 text-red-500" />
            <span className="font-extrabold text-sm tracking-tight">Comments</span>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full bg-white/5 hover:bg-white/10 text-neutral-400 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Comments Scroll Area */}
        <div
          ref={listRef}
          className="flex-1 overflow-y-auto p-4 space-y-5 scrollbar-thin"
        >
          {comments.length === 0 && loading ? (
            <div className="w-full flex flex-col gap-5">
              {[1, 2, 3].map((idx) => (
                <div key={idx} className="flex items-start gap-3">
                  <div className="skeleton w-8 h-8 rounded-full flex-shrink-0" />
                  <div className="flex-1 flex flex-col gap-2">
                    <div className="flex items-center gap-2">
                      <div className="skeleton w-24 h-3.5 rounded" />
                      <div className="skeleton w-12 h-2.5 rounded" />
                    </div>
                    <div className="skeleton w-full h-12 rounded-lg" />
                    <div className="skeleton w-16 h-3 rounded" />
                  </div>
                </div>
              ))}
              <style jsx global>{`
                .skeleton {
                  background: linear-gradient(90deg, rgba(255,255,255,0.05) 25%, rgba(255,255,255,0.1) 50%, rgba(255,255,255,0.05) 75%);
                  background-size: 200% 100%;
                  animation: loading 1.5s infinite;
                }
                @keyframes loading {
                  0% { background-position: 200% 0; }
                  100% { background-position: -200% 0; }
                }
              `}</style>
            </div>
          ) : comments.length === 0 && !loading ? (
            <div className="h-full flex flex-col items-center justify-center gap-2 text-neutral-500 py-20">
              <MessageCircle className="w-12 h-12 text-neutral-700 animate-bounce" />
              <p className="text-xs font-bold uppercase tracking-wider">No comments yet</p>
              <p className="text-[10px] text-neutral-600">Start the conversation below</p>
            </div>
          ) : (
            comments.map((comment) => {
              const profile = profiles[comment.users];
              const commentLiked = user ? comment.likedBy.includes(user.$id) : false;
              const hasReplies = replies[comment.$id] && replies[comment.$id].length > 0;
              const isRepliesExpanded = expandedReplies[comment.$id] || false;

              return (
                <div key={comment.$id} className="space-y-3">
                  {/* Top-Level Comment Row */}
                  <div className="flex items-start justify-between gap-3 group">
                    <div className="flex items-start gap-2.5 flex-1 min-w-0">
                      {/* Avatar */}
                      {!profile ? (
                        <div className="w-8 h-8 rounded-full bg-neutral-850 overflow-hidden flex-shrink-0 border border-white/10 animate-pulse" />
                      ) : (
                        <div className="w-8 h-8 rounded-full bg-red-600 overflow-hidden flex items-center justify-center flex-shrink-0 border border-white/10">
                          {profile.avatar ? (
                            <img
                              src={profile.avatar}
                              alt="Avatar"
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <span className="text-[10px] font-black text-white">
                              {getProfileInitials(comment.users)}
                            </span>
                          )}
                        </div>
                      )}

                      {/* Comment content */}
                      <div className="flex-1 min-w-0 space-y-1">
                        <div className="text-xs flex items-center gap-1.5">
                          {!profile ? (
                            <span className="inline-block h-3 w-16 bg-neutral-800 rounded animate-pulse" />
                          ) : (
                            <span className="font-extrabold text-neutral-200">
                              {getProfileName(comment.users)}
                            </span>
                          )}
                          <span className="text-neutral-400 text-[10px]">
                            {getFriendlyTime(comment.$createdAt)}
                          </span>
                        </div>
                        <p className="text-xs text-neutral-100 leading-relaxed break-words whitespace-pre-wrap">
                          {comment.text}
                        </p>

                        {/* Action buttons */}
                        <div className="flex items-center gap-3 pt-0.5 text-[10px] text-neutral-500 font-bold">
                          {comment.likes > 0 && (
                            <span>{comment.likes} {comment.likes === 1 ? "like" : "likes"}</span>
                          )}
                          <button
                            onClick={() => {
                              setReplyingTo(comment);
                              setInputText(`@${getProfileName(comment.users)} `);
                            }}
                            className="hover:text-white transition-colors cursor-pointer"
                          >
                            Reply
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Like button on the right */}
                    <button
                      onClick={() => handleLikeComment(comment.$id)}
                      className={`p-1.5 rounded-full hover:bg-white/5 transition-colors cursor-pointer ${commentLiked ? "text-red-500" : "text-neutral-500 hover:text-white"
                        }`}
                    >
                      <Heart className={`w-4 h-4 ${commentLiked ? "fill-current" : ""}`} />
                    </button>
                  </div>

                  {/* Replies Block */}
                  <div className="pl-10 space-y-3">
                    {/* View replies trigger */}
                    {!isRepliesExpanded && (
                      <button
                        onClick={() => loadReplies(comment.$id)}
                        className="flex items-center gap-1 text-[10px] font-bold text-neutral-500 hover:text-white transition-colors cursor-pointer"
                      >
                        <CornerDownRight className="w-3.5 h-3.5" />
                        <span>View replies</span>
                        {repliesLoading[comment.$id] && (
                          <Loader2 className="w-3 h-3 animate-spin ml-1" />
                        )}
                      </button>
                    )}

                    {/* Replies list */}
                    {isRepliesExpanded && replies[comment.$id] && (
                      <div className="space-y-3 pt-1">
                        {replies[comment.$id].map((reply) => {
                          const rProfile = profiles[reply.users];
                          const rLiked = user ? reply.likedBy.includes(user.$id) : false;

                          return (
                            <div key={reply.$id} className="flex items-start justify-between gap-3 group">
                              <div className="flex items-start gap-2.5 flex-1 min-w-0">
                                {/* Reply Avatar */}
                                {!rProfile ? (
                                  <div className="w-6 h-6 rounded-full bg-neutral-850 overflow-hidden flex-shrink-0 border border-white/5 animate-pulse" />
                                ) : (
                                  <div className="w-6 h-6 rounded-full bg-neutral-700 overflow-hidden flex items-center justify-center flex-shrink-0 border border-white/5">
                                    {rProfile.avatar ? (
                                      <img
                                        src={rProfile.avatar}
                                        alt="Avatar"
                                        className="w-full h-full object-cover"
                                      />
                                    ) : (
                                      <span className="text-[8px] font-black text-white">
                                        {getProfileInitials(reply.users)}
                                      </span>
                                    )}
                                  </div>
                                )}

                                {/* Reply content */}
                                <div className="flex-1 min-w-0 space-y-0.5">
                                  <div className="text-[10px] flex items-center gap-1.5">
                                    {!rProfile ? (
                                      <span className="inline-block h-2.5 w-12 bg-neutral-800 rounded animate-pulse" />
                                    ) : (
                                      <span className="font-extrabold text-neutral-200">
                                        {getProfileName(reply.users)}
                                      </span>
                                    )}
                                    <span className="text-neutral-400">
                                      {getFriendlyTime(reply.$createdAt)}
                                    </span>
                                  </div>
                                  <p className="text-xs text-neutral-100 leading-relaxed break-words whitespace-pre-wrap">
                                    {reply.text}
                                  </p>

                                  <div className="flex items-center gap-3 pt-0.5 text-[9px] text-neutral-500 font-bold">
                                    {reply.likes > 0 && (
                                      <span>{reply.likes} {reply.likes === 1 ? "like" : "likes"}</span>
                                    )}
                                    <button
                                      onClick={() => {
                                        setReplyingTo(comment);
                                        setInputText(`@${getProfileName(reply.users)} `);
                                      }}
                                      className="hover:text-white transition-colors cursor-pointer"
                                    >
                                      Reply
                                    </button>
                                  </div>
                                </div>
                              </div>

                              {/* Reply Like button */}
                              <button
                                onClick={() => handleLikeComment(reply.$id, true, comment.$id)}
                                className={`p-1.5 rounded-full hover:bg-white/5 transition-colors cursor-pointer ${rLiked ? "text-red-500" : "text-neutral-500 hover:text-white"
                                  }`}
                              >
                                <Heart className={`w-3.5 h-3.5 ${rLiked ? "fill-current" : ""}`} />
                              </button>
                            </div>
                          );
                        })}

                        {/* Hide replies link */}
                        <button
                          onClick={() =>
                            setExpandedReplies((prev) => ({ ...prev, [comment.$id]: false }))
                          }
                          className="text-[10px] font-bold text-neutral-500 hover:text-white transition-colors block cursor-pointer pt-1"
                        >
                          Hide replies
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              );
            })
          )}

          {/* Load More comments indicator */}
          {hasMore && (
            <button
              onClick={loadMoreComments}
              className="w-full text-center py-2 text-xs font-bold text-neutral-400 hover:text-white transition-colors cursor-pointer"
            >
              {loading ? "Loading more comments..." : "Load more comments"}
            </button>
          )}
        </div>

        {/* Drawer Input Footer */}
        <div className="border-t border-white/10 bg-neutral-900/90 backdrop-blur-md p-4 space-y-2">
          {/* Replying banner */}
          {replyingTo && (
            <div className="flex items-center justify-between bg-white/5 px-3 py-1.5 rounded-md text-[10px] font-bold text-neutral-300">
              <span>Replying to @{getProfileName(replyingTo.users)}</span>
              <button
                onClick={() => setReplyingTo(null)}
                className="text-neutral-400 hover:text-white cursor-pointer"
              >
                Cancel
              </button>
            </div>
          )}

          <form onSubmit={handlePostComment} className="flex items-center gap-3">
            {/* Logged in User avatar */}
            <div className="w-8 h-8 rounded-full bg-[#B9001B] overflow-hidden flex items-center justify-center flex-shrink-0 border border-white/10">
              {user?.avatar ? (
                <img
                  src={user.avatar}
                  alt="My Avatar"
                  className="w-full h-full object-cover"
                />
              ) : (
                <span className="text-[10px] font-black text-white">
                  {user ? user.username?.slice(0, 2).toUpperCase() : "ME"}
                </span>
              )}
            </div>

            {/* Input field */}
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder={replyingTo ? "Add a reply..." : "Add a comment..."}
              className="flex-1 bg-white/5 border border-white/10 focus:border-white/20 focus:bg-white/10 rounded-full px-4 py-2 text-white focus:outline-none transition-all placeholder-neutral-500"
              style={{ fontSize: "16px" }}
            />

            {/* Submit button */}
            <button
              type="submit"
              disabled={submitting || !inputText.trim()}
              className="p-2 rounded-full bg-red-600 hover:bg-red-700 disabled:bg-neutral-800 disabled:text-neutral-500 text-white transition-colors cursor-pointer"
            >
              {submitting ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Send className="w-4 h-4" />
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
