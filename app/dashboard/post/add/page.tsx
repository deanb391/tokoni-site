// app/dashboard/post/add/page.tsx
"use client";

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'nextjs-toploader/app';

import { useUser } from '@/context/UserContext';
import { usePostPublish } from '@/context/PostPublishContext';
import { getVendorProducts } from '@/lib/api/products';
import { Product } from '@/lib/services/products.service';
import { Search, Image, Film, X, Check, Loader2, ArrowLeft, UploadCloud, PlusCircleIcon } from 'lucide-react';
import Link from 'next/link';

interface MediaPreview {
  url: string;
  type: 'image' | 'video';
}

export default function CreateNewPostScreen() {
  const router = useRouter();
  const { vendor, loading: userLoading } = useUser();
  const { publishPost } = usePostPublish();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [postType, setPostType] = useState<'image' | 'video'>('image');
  const [caption, setCaption] = useState('');
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [mediaPreviews, setMediaPreviews] = useState<MediaPreview[]>([]);

  const [products, setProducts] = useState<Product[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [taggedProductIds, setTaggedProductIds] = useState<string[]>([]);

  const [productsLoading, setProductsLoading] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // Redirect if not logged or not vendor
  useEffect(() => {
    if (!userLoading && !vendor) {
      router.push('/dashboard');
    }
  }, [vendor, userLoading, router]);

  // Load vendor products for tagging
  useEffect(() => {
    const loadProducts = async () => {
      if (!vendor?.$id) return;
      setProductsLoading(true);
      try {
        const list = await getVendorProducts(vendor.$id);
        setProducts(list);
      } catch (err) {
        console.error("Failed to load vendor products:", err);
      } finally {
        setProductsLoading(false);
      }
    };
    loadProducts();
  }, [vendor]);

  // Clean up previews on unmount
  useEffect(() => {
    return () => {
      mediaPreviews.forEach(p => URL.revokeObjectURL(p.url));
    };
  }, [mediaPreviews]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;
    processSelectedFiles(Array.from(files));
  };

  const processSelectedFiles = (files: File[]) => {
    if (files.length === 0) return;

    if (postType === 'video') {
      const videoFile = files[0];
      if (!videoFile.type.startsWith('video/')) {
        setErrorMessage("Please select a valid video file.");
        return;
      }
      // Revoke old previews
      mediaPreviews.forEach(p => URL.revokeObjectURL(p.url));

      setSelectedFiles([videoFile]);
      setMediaPreviews([{ url: URL.createObjectURL(videoFile), type: 'video' }]);
      setErrorMessage("");
    } else {
      const imageFiles = files.filter(f => f.type.startsWith('image/'));
      if (imageFiles.length === 0) {
        setErrorMessage("Please select valid image files.");
        return;
      }

      const availableSlots = 7 - selectedFiles.length;
      if (availableSlots <= 0) {
        setErrorMessage("You can upload a maximum of 7 images.");
        return;
      }

      const filesToAdd = imageFiles.slice(0, availableSlots);
      if (imageFiles.length > availableSlots) {
        setErrorMessage("Only the first 7 images were added.");
      } else {
        setErrorMessage("");
      }

      setSelectedFiles(prev => [...prev, ...filesToAdd]);
      setMediaPreviews(prev => [
        ...prev,
        ...filesToAdd.map(f => ({ url: URL.createObjectURL(f), type: 'image' as const }))
      ]);
    }
  };

  const removeSelectedFile = (idxToRemove: number) => {
    URL.revokeObjectURL(mediaPreviews[idxToRemove].url);
    setSelectedFiles(prev => prev.filter((_, idx) => idx !== idxToRemove));
    setMediaPreviews(prev => prev.filter((_, idx) => idx !== idxToRemove));
  };

  const handlePublish = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!vendor?.$id) return;

    if (selectedFiles.length === 0) {
      setErrorMessage("Please select at least one image or video.");
      return;
    }

    setPublishing(true);
    setErrorMessage("");

    try {
      // Direct S3 background upload via context
      await publishPost(caption, postType, selectedFiles, taggedProductIds, vendor.$id);
    } catch (err: any) {
      setErrorMessage(err.message || "Failed to publish post. Please try again.");
      setPublishing(false);
    }
  };

  const toggleTagProduct = (id: string) => {
    setTaggedProductIds(prev =>
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  const filteredProducts = products.filter(p =>
    p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-neutral-50 text-neutral-800 font-sans pb-16">
      {/* Header */}
      <header className="sticky top-0 bg-white/90 backdrop-blur-md border-b border-neutral-200/80 z-30 px-4 py-3 md:px-8 flex justify-between items-center shadow-xs">
        <div className="flex items-center gap-3">
          <button
            onClick={() => router.push('/dashboard')}
            className="p-2 hover:bg-neutral-100 rounded-full transition-colors flex items-center justify-center"
          >
            <ArrowLeft className="w-5 h-5 text-neutral-600" />
          </button>
          <h1 className="text-lg md:text-xl font-black text-neutral-900 tracking-tight">Create Post</h1>
        </div>
        <div className="flex items-center gap-2">
          <Link
            href="/dashboard"
            className="px-4 py-1.5 border border-neutral-300 rounded-full text-xs md:text-sm font-bold text-neutral-700 hover:bg-neutral-50 transition-colors"
          >
            Cancel
          </Link>
          <button
            onClick={handlePublish}
            disabled={publishing || selectedFiles.length === 0}
            className={`px-5 py-1.5 rounded-full text-xs md:text-sm font-extrabold text-white transition-all shadow-md flex items-center gap-1.5 ${
              publishing || selectedFiles.length === 0
                ? "bg-[#B9001B]/40 cursor-not-allowed shadow-none"
                : "bg-[#B9001B] hover:bg-[#A30018] active:scale-95 cursor-pointer hover:shadow-lg"
            }`}
          >
            {publishing ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                Publishing...
              </>
            ) : "Publish"}
          </button>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 mt-6 md:px-8">
        {errorMessage && (
          <div className="mb-6 p-4 bg-red-50 border-l-4 border-[#B9001B] rounded-r-xl text-[#B9001B] text-xs md:text-sm font-bold shadow-xs">
            {errorMessage}
          </div>
        )}

        <form onSubmit={handlePublish} className="flex flex-col md:grid md:grid-cols-5 gap-6 md:gap-8">

          {/* LEFT COLUMN: Media Upload & Details (3 Cols) */}
          <div className="md:col-span-3 flex flex-col gap-6">

            {/* Type Selector */}
            <div className="bg-white p-1 rounded-2xl border border-neutral-200 flex shadow-xs">
              <button
                type="button"
                onClick={() => {
                  setPostType('image');
                  setSelectedFiles([]);
                  setMediaPreviews([]);
                  setErrorMessage("");
                }}
                className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs md:text-sm font-extrabold transition-all duration-200 ${
                  postType === 'image'
                    ? "bg-[#B9001B] text-white shadow-md"
                    : "text-neutral-500 hover:bg-neutral-50"
                }`}
              >
                <Image className="w-4 h-4" />
                Image Post
              </button>
              <button
                type="button"
                onClick={() => {
                  setPostType('video');
                  setSelectedFiles([]);
                  setMediaPreviews([]);
                  setErrorMessage("");
                }}
                className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs md:text-sm font-extrabold transition-all duration-200 ${
                  postType === 'video'
                    ? "bg-[#B9001B] text-white shadow-md"
                    : "text-neutral-500 hover:bg-neutral-50"
                }`}
              >
                <Film className="w-4 h-4" />
                Video Post
              </button>
            </div>

            {/* Media Upload Box / Carousel Preview */}
            <div className="bg-white rounded-3xl border border-neutral-200 p-5 md:p-6 flex flex-col items-center justify-center relative min-h-[260px] md:min-h-[300px] shadow-xs">
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                accept={postType === 'video' ? 'video/*' : 'image/*'}
                multiple={postType === 'image'}
                className="hidden"
              />

              {selectedFiles.length === 0 ? (
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full flex flex-col items-center justify-center py-12 border-2 border-dashed border-neutral-200 rounded-2xl cursor-pointer hover:bg-red-50/10 hover:border-[#B9001B]/30 transition-colors group"
                >
                  <div className="w-14 h-14 bg-neutral-100 rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-200">
                    <UploadCloud className="w-6 h-6 text-neutral-500 group-hover:text-[#B9001B]" />
                  </div>
                  <h3 className="font-extrabold text-neutral-800 text-sm md:text-base mb-1 tracking-tight">
                    Select your {postType === 'video' ? 'video' : 'images'}
                  </h3>
                  <p className="text-[11.5px] md:text-xs text-neutral-400 text-center px-6 leading-relaxed max-w-sm">
                    {postType === 'video'
                      ? "Choose 1 video file (MP4 format is recommended)"
                      : "Choose up to 7 images. They will be displayed in a premium sliding layout."}
                  </p>
                </div>
              ) : (
                <div className="w-full flex flex-col gap-4">
                  {/* Grid / Carousel View of Selected Media */}
                  {postType === 'video' ? (
                    <div className="relative rounded-2xl overflow-hidden bg-neutral-900 flex justify-center max-h-[360px] border border-neutral-200">
                      <video
                        src={mediaPreviews[0].url}
                        controls
                        className="max-h-[360px] object-contain w-full"
                      />
                      <button
                        type="button"
                        onClick={() => removeSelectedFile(0)}
                        className="absolute top-3 right-3 bg-black/75 hover:bg-black text-white p-1.5 rounded-full transition-colors active:scale-90"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ) : (
                    <div>
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                        {mediaPreviews.map((item, idx) => (
                          <div key={idx} className="relative aspect-square rounded-2xl overflow-hidden bg-neutral-100 border border-neutral-200 group shadow-xs">
                            <img
                              src={item.url}
                              alt={`slide-${idx}`}
                              className="w-full h-full object-cover"
                            />
                            <button
                              type="button"
                              onClick={() => removeSelectedFile(idx)}
                              className="absolute top-2 right-2 bg-black/75 hover:bg-black text-white p-1 rounded-full opacity-90 transition-all hover:scale-105 active:scale-90"
                            >
                              <X className="w-3.5 h-3.5" />
                            </button>
                            <span className="absolute bottom-2 left-2 bg-black/60 text-white text-[10px] font-black px-2 py-0.5 rounded-full select-none">
                              Slide {idx + 1}
                            </span>
                          </div>
                        ))}
                        {selectedFiles.length < 7 && (
                          <button
                            type="button"
                            onClick={() => fileInputRef.current?.click()}
                            className="aspect-square border-2 border-dashed border-neutral-200 hover:border-[#B9001B]/40 rounded-2xl flex flex-col items-center justify-center gap-1 hover:bg-neutral-50 transition-colors text-neutral-400 hover:text-[#B9001B] group active:scale-95"
                          >
                            <PlusCircleIcon className="group-hover:scale-110 transition-transform" />
                            <span className="text-[11px] font-black tracking-tight">Add Slide</span>
                          </button>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Caption Input */}
            <div className="bg-white rounded-3xl border border-neutral-200 p-5 md:p-6 shadow-xs">
              <label className="block text-xs md:text-sm font-bold text-neutral-900 mb-2 tracking-tight">Caption</label>
              <textarea
                value={caption}
                onChange={(e) => setCaption(e.target.value)}
                placeholder="Write a compelling caption for your followers..."
                maxLength={2200}
                rows={4}
                className="w-full bg-neutral-50 border border-neutral-200/80 rounded-2xl p-3 text-xs md:text-sm text-neutral-800 outline-none focus:bg-white focus:border-[#B9001B]/40 focus:ring-4 focus:ring-[#B9001B]/5 transition-all resize-none leading-relaxed"
              />
              <div className="flex justify-end mt-1.5 text-[10px] md:text-xs text-neutral-400 font-semibold">
                <span>{caption.length} / 2200</span>
              </div>
            </div>

          </div>

          {/* RIGHT COLUMN: Tag Products (2 Cols) */}
          <div className="md:col-span-2 flex flex-col gap-6">

            <div className="bg-white rounded-3xl border border-neutral-200 p-5 md:p-6 flex flex-col max-h-[500px] md:max-h-[600px] shadow-xs">
              <div className="flex justify-between items-center mb-4">
                <label className="text-xs md:text-sm font-bold text-neutral-900 tracking-tight">Tag Products</label>
                {taggedProductIds.length > 0 && (
                  <span className="bg-red-50 text-[#B9001B] text-[10px] md:text-xs font-black px-2.5 py-0.5 rounded-full select-none animate-bounce">
                    {taggedProductIds.length} tagged
                  </span>
                )}
              </div>

              {/* Product Search */}
              <div className="relative mb-4">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400">
                  <Search className="w-4 h-4" />
                </span>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search your inventory..."
                  className="w-full bg-neutral-50 border border-neutral-200/80 rounded-2xl py-2 pl-9 pr-4 text-xs text-neutral-800 outline-none focus:bg-white focus:border-[#B9001B]/40 focus:ring-4 focus:ring-[#B9001B]/5 transition-all"
                />
              </div>

              {/* Products List (Scrollable) */}
              <div className="flex-1 overflow-y-auto space-y-2.5 pr-1 min-h-[220px] md:min-h-[250px] scrollbar-thin">
                {productsLoading ? (
                  <div className="flex justify-center items-center py-12">
                    <Loader2 className="w-6 h-6 animate-spin text-[#B9001B]" />
                  </div>
                ) : filteredProducts.length === 0 ? (
                  <div className="text-center py-12 text-xs text-neutral-400 font-semibold">
                    No products found in inventory.
                  </div>
                ) : (
                  filteredProducts.map((p) => {
                    const isTagged = taggedProductIds.includes(p.$id);
                    return (
                      <div
                        key={p.$id}
                        onClick={() => toggleTagProduct(p.$id)}
                        className={`flex items-center gap-3 p-2.5 rounded-2xl border transition-all cursor-pointer ${
                          isTagged
                            ? "bg-red-50/40 border-[#B9001B]/30 shadow-2xs"
                            : "border-neutral-100 hover:bg-neutral-50"
                        }`}
                      >
                        <div className="w-11 h-11 bg-neutral-100 rounded-xl overflow-hidden flex-shrink-0 border border-neutral-200">
                          {p.images && p.images[0] ? (
                            <img
                              src={p.images[0]}
                              alt={p.name}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-[10px] text-neutral-400">
                              No image
                            </div>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="text-xs font-bold text-neutral-800 truncate">{p.name}</h4>
                          <span className="text-[11.5px] font-extrabold text-[#B9001B]">₦{p.price.toLocaleString()}</span>
                        </div>
                        <div className={`w-5 h-5 rounded-full flex items-center justify-center border transition-all ${
                          isTagged
                            ? "bg-[#B9001B] border-[#B9001B] text-white"
                            : "border-neutral-300"
                        }`}>
                          {isTagged && <Check className="w-3 h-3 stroke-[3]" />}
                        </div>
                      </div>
                    );
                  })
                )}
              </div>

            </div>

          </div>

        </form>
      </main>
    </div>
  );
}