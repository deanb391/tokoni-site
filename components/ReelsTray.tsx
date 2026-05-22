"use client";

import React, { useEffect, useState } from "react";
import { useFeed } from "@/context/FeedContext";
import { useUser } from "@/context/UserContext";
import { Post } from "@/lib/services/posts.service";
import { Vendor } from "@/lib/services/vendors.service";
import { Play, Film } from "lucide-react";
import { getVendorById } from "@/lib/api/vendors";

export default function ReelsTray() {
  const { user } = useUser();
  const { initializeReels, vendorsMap } = useFeed();
  const [reels, setReels] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [localVendors, setLocalVendors] = useState<Record<string, Vendor>>({});

  useEffect(() => {
    let active = true;
    async function fetchReels() {
      try {
        const userId = user?.$id || "";
        const url = `/api/posts/feed?type=reels&limit=5&userId=${encodeURIComponent(userId)}`;
        const res = await fetch(url).then(r => r.json());
        if (res.success && active) {
          setReels(res.posts || []);

          // Resolve vendor profiles for reels
          const vendorIds = Array.from(new Set((res.posts || []).map((p: Post) => p.vendor))) as string[];
          const missingIds = vendorIds.filter(id => !vendorsMap[id] && !localVendors[id]);

          if (missingIds.length > 0) {
            const resolved = await Promise.all(
              missingIds.map(async id => {
                try {
                  const v = await getVendorById(id);
                  return { id, v };
                } catch {
                  return null;
                }
              })
            );
            const newMap: Record<string, Vendor> = {};
            resolved.forEach(item => {
              if (item && item.v) {
                newMap[item.id] = item.v;
              }
            });
            if (active) {
              setLocalVendors(prev => ({ ...prev, ...newMap }));
            }
          }
        }
      } catch (err) {
        console.error("Error fetching reels for tray:", err);
      } finally {
        if (active) setLoading(false);
      }
    }

    fetchReels();
    return () => {
      active = false;
    };
  }, [user?.$id, vendorsMap]);

  if (loading) {
    return (
      <div className="w-full bg-white border border-neutral-100 rounded-2xl p-4 shadow-xs mb-4">
        <div className="flex items-center gap-2 mb-3">
          <Film className="w-4 h-4 text-[#B9001B]" />
          <span className="text-sm font-black text-neutral-800 uppercase tracking-wider">Reels</span>
        </div>
        <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-none">
          {[1, 2, 3, 4, 5].map(idx => (
            <div key={idx} className="w-[110px] h-[190px] rounded-xl bg-neutral-100 animate-pulse flex-shrink-0" />
          ))}
        </div>
      </div>
    );
  }

  if (reels.length === 0) return null;

  return (
    <div className="w-full bg-white border border-neutral-100 rounded-2xl p-4 shadow-xs mb-4">
      {/* Tray Header */}
      <div className="flex items-center justify-between mb-3.5">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-lg bg-red-50 flex items-center justify-center text-[#B9001B]">
            <Film className="w-3.5 h-3.5 fill-[#B9001B]/10" />
          </div>
          <span className="text-xs font-black text-neutral-800 uppercase tracking-wider">Reels</span>
        </div>
      </div>

      {/* Horizontal Carousel */}
      <div className="flex gap-3 overflow-x-auto pb-1 scrollbar-none snap-x snap-mandatory">
        {reels.map(reel => {
          const vendor = vendorsMap[reel.vendor] || localVendors[reel.vendor];
          const hasMedia = reel.media && reel.media.length > 0;
          const mediaUrl = hasMedia ? reel.media[0] : "";

          return (
            <div
              key={reel.$id}
              onClick={() => initializeReels(reel.$id, reel)}
              className="group relative w-[130px] sm:w-[170px] h-[250px] sm:h-[290px] rounded-xl overflow-hidden shadow-xs cursor-pointer flex-shrink-0 snap-start select-none bg-neutral-900 border border-neutral-100/10 hover:border-[#B9001B]/30 transition-all duration-300 transform hover:scale-[1.02]"
            >
              {/* Media Preview (Video or Image) */}
              {hasMedia ? (
                reel.type === "video" ? (
                  <div className="absolute inset-0 w-full h-full">
                    <video
                      src={mediaUrl}
                      preload="none"
                      muted
                      playsInline
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute top-2 right-2 bg-black/40 backdrop-blur-xs w-6 h-6 rounded-full flex items-center justify-center text-white">
                      <Play className="w-3 h-3 fill-current ml-0.5" />
                    </div>
                  </div>
                ) : (
                  <img
                    src={mediaUrl}
                    alt="Reel preview"
                    className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                )
              ) : (
                <div className="absolute inset-0 flex items-center justify-center text-neutral-500 bg-neutral-950">
                  <Film className="w-6 h-6" />
                </div>
              )}

              {/* Black Gradient Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-black/25 z-10" />

              {/* Creator Avatar (Top Left) */}
              <div className="absolute top-2 left-2 z-20">
                <div className="w-7 h-7 rounded-full overflow-hidden border-2 border-[#B9001B] bg-neutral-800 flex items-center justify-center shadow-md">
                  {vendor?.logoImage ? (
                    <img
                      src={vendor.logoImage}
                      alt={vendor.businessName}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span className="text-[10px] font-black text-white">
                      {vendor?.businessName?.slice(0, 2).toUpperCase() || "TK"}
                    </span>
                  )}
                </div>
              </div>

              {/* Business Name (Bottom) */}
              <div className="absolute bottom-2 left-2 right-2 z-20">
                <p className="text-[10px] font-extrabold text-white leading-tight truncate drop-shadow-md">
                  {vendor?.businessName || "Tokoni Creator"}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
