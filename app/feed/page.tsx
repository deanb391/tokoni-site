"use client";

import React, { useEffect, useRef } from "react";
import { useFeed } from "@/context/FeedContext";
import { useUser } from "@/context/UserContext";
import { useRouter } from 'nextjs-toploader/app';

import PostCard from "@/components/PostCard";
import ExpandedPostContainer from "@/components/ExpandedPostContainer";
import ReelsTray from "@/components/ReelsTray";
import { Loader2, Compass, Sparkles } from "lucide-react";

// Native IntersectionObserver wrapper to notify the context when a card is visible
function VisibilityTracker({
  index,
  onChange,
  children
}: {
  index: number;
  onChange: (idx: number) => void;
  children: React.ReactNode;
}) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          onChange(index);
        }
      },
      { threshold: 0.1 }
    );

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => {
      observer.disconnect();
    };
  }, [index, onChange]);

  return <div ref={ref} className="w-full">{children}</div>;
}

export default function FeedScreen() {
  const { user } = useUser();
  const router = useRouter();
  const {
    posts,
    loading,
    hasMore,
    productsMap,
    vendorsMap,
    setHighestViewedIndex,
    setExpandedPostIndex,
    toggleLike,
    fetchNextBatch
  } = useFeed();

  return (
    <main className="w-full min-h-screen bg-neutral-50/50 py-6 md:py-10 px-4 flex flex-col items-center">
      {/* Feed Header */}
      <div className="w-full max-w-[540px] mb-8 flex items-center justify-between">
        <div className="flex flex-col">
          <div className="flex items-center gap-1.5 text-[#B9001B]">
            <Compass className="w-5 h-5 animate-pulse" />
            <span className="text-xs font-black uppercase tracking-wider">Explore Feed</span>
          </div>
          <h1 className="text-2xl font-black text-neutral-900 tracking-tight mt-0.5">
            Discover Creators
          </h1>
        </div>
        <div className="flex items-center gap-1 bg-amber-50 border border-amber-200/60 text-amber-800 px-3 py-1.5 rounded-full text-xs font-bold shadow-2xs select-none">
          <Sparkles className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
          Featured Shop
        </div>
      </div>

      {/* Main Feed Container */}
      <div className="w-full max-w-[540px] flex flex-col gap-6">
        {posts.length === 0 && loading ? (
          <div className="w-full flex flex-col gap-6">
            {[1, 2].map((idx) => (
              <div key={idx} className="bg-white border border-neutral-100 rounded-2xl p-4 flex flex-col gap-3 shadow-xs">
                <div className="flex items-center gap-3">
                  <div className="skeleton w-10 h-10 rounded-full"></div>
                  <div className="flex flex-col gap-1.5">
                    <div className="skeleton w-32 h-3.5 rounded"></div>
                    <div className="skeleton w-20 h-2.5 rounded"></div>
                  </div>
                </div>
                <div className="skeleton w-full aspect-[4/5] rounded-xl"></div>
                <div className="skeleton w-3/4 h-4 rounded"></div>
                <div className="skeleton w-1/2 h-3 rounded"></div>
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
        ) : posts.length === 0 && !loading ? (
          <div className="bg-white border border-neutral-200 rounded-2xl p-12 text-center shadow-xs flex flex-col items-center justify-center gap-4">
            <div className="w-16 h-16 rounded-full bg-red-50 flex items-center justify-center text-[#B9001B]">
              <Compass className="w-8 h-8" />
            </div>
            <div className="space-y-1">
              <h3 className="text-base font-bold text-neutral-800">No Posts in Feed</h3>
              <p className="text-sm text-neutral-400 max-w-xs">
                Check back later or browse our marketplace to find premium products.
              </p>
            </div>
          </div>
        ) : (
          posts.map((post, idx) => (
            <React.Fragment key={post.$id}>
              <VisibilityTracker
                index={idx}
                onChange={setHighestViewedIndex}
              >
                <PostCard
                  post={post}
                  vendorName={vendorsMap[post.vendor]?.businessName || "Tokoni Store"}
                  vendorLogo={vendorsMap[post.vendor]?.logoImage}
                  vendorUserId={vendorsMap[post.vendor]?.users}
                  taggedProductsMap={productsMap}
                  onLikeToggle={() => toggleLike(post.$id)}
                  currentUserId={user?.$id}
                  onMediaClick={() => setExpandedPostIndex(idx)}
                />
              </VisibilityTracker>

              {idx === 0 && <ReelsTray />}
            </React.Fragment>
          ))
        )}

        {/* Loading Spinner for Feed */}
        {loading && (
          <div className="w-full py-6 flex justify-center items-center gap-2 text-neutral-500">
            <Loader2 className="w-5 h-5 animate-spin text-[#B9001B]" />
            <span className="text-xs font-bold">Loading more posts...</span>
          </div>
        )}

        {/* End of Feed Message */}
        {!hasMore && posts.length > 0 && (
          <div className="w-full text-center py-8 text-xs font-bold text-neutral-400 uppercase tracking-widest">
            You've caught up with everyone
          </div>
        )}
      </div>

      <ExpandedPostContainer />
    </main>
  );
}