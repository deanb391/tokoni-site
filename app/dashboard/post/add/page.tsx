"use client";

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useUser } from '@/context/UserContext';
import { getVendorProducts } from '@/lib/api/products';
import { createPost } from '@/lib/api/posts';
import { uploadToServer } from '@/lib/upload';
import { Product } from '@/lib/services/products.service';
import { PostDraft } from '@/lib/services/posts.service';
import { Search, Image, Film, X, Check, Loader2, ArrowLeft, UploadCloud, PlusCircleIcon } from 'lucide-react';
import Link from 'next/link';

interface MediaFile {
  id: string;
  file: File;
  previewUrl: string;
  s3Url?: string;
  status: 'uploading' | 'done' | 'error';
}

export default function CreateNewPostScreen() {
  const router = useRouter();
  const { vendor, loading: userLoading } = useUser();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [postType, setPostType] = useState<'image' | 'video'>('image');
  const [caption, setCaption] = useState('');
  const [mediaFiles, setMediaFiles] = useState<MediaFile[]>([]);
  const mediaFilesRef = useRef<MediaFile[]>([]);

  useEffect(() => {
    mediaFilesRef.current = mediaFiles;
  }, [mediaFiles]);

  const [products, setProducts] = useState<Product[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [taggedProductIds, setTaggedProductIds] = useState<string[]>([]);

  const [productsLoading, setProductsLoading] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // Redirect if not loaded or not vendor
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

  // Clean up object URLs on unmount
  useEffect(() => {
    return () => {
      mediaFiles.forEach(f => URL.revokeObjectURL(f.previewUrl));
    };
  }, [mediaFiles]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;
    processSelectedFiles(Array.from(files));
  };

  const processSelectedFiles = (files: File[]) => {
    if (files.length === 0) return;

    if (postType === 'video') {
      // Only 1 video allowed
      const videoFile = files[0];
      if (!videoFile.type.startsWith('video/')) {
        setErrorMessage("Please select a valid video file.");
        return;
      }
      // Revoke old ones if any
      mediaFiles.forEach(f => URL.revokeObjectURL(f.previewUrl));

      const newMediaFile: MediaFile = {
        id: Math.random().toString(36).substr(2, 9),
        file: videoFile,
        previewUrl: URL.createObjectURL(videoFile),
        status: 'uploading'
      };
      setMediaFiles([newMediaFile]);
      setErrorMessage("");
      uploadFileInBackground(newMediaFile);
    } else {
      // Images: max 7
      const imageFiles = files.filter(f => f.type.startsWith('image/'));
      if (imageFiles.length === 0) {
        setErrorMessage("Please select valid image files.");
        return;
      }

      const availableSlots = 7 - mediaFiles.length;
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

      const newFiles = filesToAdd.map(file => ({
        id: Math.random().toString(36).substr(2, 9),
        file,
        previewUrl: URL.createObjectURL(file),
        status: 'uploading' as const
      }));

      setMediaFiles(prev => [...prev, ...newFiles]);
      newFiles.forEach(uploadFileInBackground);
    }
  };

  const uploadFileInBackground = async (mediaFile: MediaFile) => {
    try {
      const url = await uploadToServer(mediaFile.file, 'posts', postType);
      setMediaFiles(prev =>
        prev.map(f => (f.id === mediaFile.id ? { ...f, s3Url: url, status: 'done' } : f))
      );
    } catch (err) {
      console.error("Background upload failed:", err);
      setMediaFiles(prev =>
        prev.map(f => (f.id === mediaFile.id ? { ...f, status: 'error' } : f))
      );
    }
  };

  const removeMediaFile = (id: string) => {
    const fileToRemove = mediaFiles.find(f => f.id === id);
    if (fileToRemove) {
      URL.revokeObjectURL(fileToRemove.previewUrl);
    }
    setMediaFiles(prev => prev.filter(f => f.id !== id));
  };

  const handlePublish = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!vendor) return;

    const initialMedia = mediaFilesRef.current;
    if (initialMedia.length === 0) {
      setErrorMessage("Please select at least one image or video.");
      return;
    }

    setPublishing(true);
    setErrorMessage("");

    // Wait silently if any media files are still uploading in the background
    let checkAttempts = 0;
    while (mediaFilesRef.current.some(f => f.status === 'uploading') && checkAttempts < 60) {
      await new Promise(resolve => setTimeout(resolve, 500));
      checkAttempts++;
    }

    const currentMedia = mediaFilesRef.current;
    const anyUploading = currentMedia.some(f => f.status === 'uploading');
    if (anyUploading) {
      setErrorMessage("Upload is taking longer than expected. Please try again.");
      setPublishing(false);
      return;
    }

    const anyErrors = currentMedia.some(f => f.status === 'error');
    if (anyErrors) {
      setErrorMessage("Some files failed to upload. Please remove them or try again.");
      setPublishing(false);
      return;
    }

    try {
      const s3Urls = currentMedia.map(f => f.s3Url!).filter(Boolean);

      const draft: PostDraft = {
        type: postType,
        media: s3Urls,
        caption,
        taggedProducts: taggedProductIds
      };

      await createPost(draft, vendor.$id);
      router.push('/dashboard');
    } catch (err: any) {
      setErrorMessage(err.message || "Failed to create post. Please try again.");
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
      <header className="sticky top-0 bg-white border-b border-neutral-200 z-30 px-4 py-3 md:px-8 flex justify-between items-center shadow-xs">
        <div className="flex items-center gap-3">
          <button
            onClick={() => router.push('/dashboard')}
            className="p-2 hover:bg-neutral-100 rounded-full transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="text-xl font-bold text-neutral-900">Create New Post</h1>
        </div>
        <div className="flex items-center gap-2">
          <Link
            href="/dashboard"
            className="px-4 py-2 border border-neutral-300 rounded-full text-sm font-semibold hover:bg-neutral-50 transition-colors"
          >
            Cancel
          </Link>
          <button
            onClick={handlePublish}
            disabled={publishing || mediaFiles.length === 0}
            className={`px-5 py-2 rounded-full text-sm font-semibold text-white transition-all shadow-sm flex items-center gap-2 ${publishing || mediaFiles.length === 0
                ? "bg-red-400 cursor-not-allowed"
                : "bg-[#B9001B] hover:bg-[#A30018] active:scale-95 cursor-pointer"
              }`}
          >
            {publishing ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Publishing...
              </>
            ) : "Publish"}
          </button>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 mt-6 md:px-8">
        {errorMessage && (
          <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 rounded-r-lg text-red-700 text-sm font-medium">
            {errorMessage}
          </div>
        )}

        <form onSubmit={handlePublish} className="grid grid-cols-1 md:grid-cols-5 gap-8">

          {/* LEFT COLUMN: Media Upload & Details (3 Cols) */}
          <div className="md:col-span-3 flex flex-col gap-6">

            {/* Type Selector */}
            <div className="bg-white p-1 rounded-xl border border-neutral-200 flex shadow-2xs">
              <button
                type="button"
                onClick={() => {
                  setPostType('image');
                  setMediaFiles([]);
                  setErrorMessage("");
                }}
                className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-bold transition-all ${postType === 'image'
                    ? "bg-[#B9001B] text-white shadow-xs"
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
                  setMediaFiles([]);
                  setErrorMessage("");
                }}
                className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-bold transition-all ${postType === 'video'
                    ? "bg-[#B9001B] text-white shadow-xs"
                    : "text-neutral-500 hover:bg-neutral-50"
                  }`}
              >
                <Film className="w-4 h-4" />
                Video Post
              </button>
            </div>

            {/* Media Upload Box / Carousel Preview */}
            <div className="bg-white rounded-2xl border border-neutral-200 p-6 flex flex-col items-center justify-center relative min-h-[300px] shadow-sm">
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                accept={postType === 'video' ? 'video/*' : 'image/*'}
                multiple={postType === 'image'}
                className="hidden"
              />

              {mediaFiles.length === 0 ? (
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full flex flex-col items-center justify-center py-12 border-2 border-dashed border-neutral-200 rounded-xl cursor-pointer hover:bg-red-50/20 hover:border-red-200 transition-colors group"
                >
                  <div className="w-14 h-14 bg-neutral-100 rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-200">
                    <UploadCloud className="w-6 h-6 text-neutral-500 group-hover:text-[#B9001B]" />
                  </div>
                  <h3 className="font-semibold text-neutral-800 text-base mb-1">
                    Select your {postType === 'video' ? 'video' : 'images'}
                  </h3>
                  <p className="text-sm text-neutral-400 text-center px-6">
                    {postType === 'video'
                      ? "Choose 1 video file (MP4 format)"
                      : "Choose up to 7 images. They will be displayed in slides format."}
                  </p>
                </div>
              ) : (
                <div className="w-full flex flex-col gap-4">
                  {/* Grid / Carousel View of Selected Media */}
                  {postType === 'video' ? (
                    <div className="relative rounded-xl overflow-hidden bg-neutral-900 flex justify-center max-h-[360px]">
                      <video
                        src={mediaFiles[0].previewUrl}
                        controls
                        className="max-h-[360px] object-contain"
                      />
                      <button
                        type="button"
                        onClick={() => removeMediaFile(mediaFiles[0].id)}
                        className="absolute top-3 right-3 bg-black/60 hover:bg-black text-white p-1.5 rounded-full transition-colors"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ) : (
                    <div>
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                        {mediaFiles.map((item, idx) => (
                          <div key={item.id} className="relative aspect-square rounded-xl overflow-hidden bg-neutral-100 border border-neutral-200 group">
                            <img
                              src={item.previewUrl}
                              alt={`slide-${idx}`}
                              className="w-full h-full object-cover"
                            />
                            <button
                              type="button"
                              onClick={() => removeMediaFile(item.id)}
                              className="absolute top-2 right-2 bg-black/60 hover:bg-black text-white p-1 rounded-full opacity-90 transition-all hover:scale-105"
                            >
                              <X className="w-3.5 h-3.5" />
                            </button>
                            <span className="absolute bottom-2 left-2 bg-black/60 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                              Slide {idx + 1}
                            </span>
                            {item.status === 'error' && (
                              <div className="absolute inset-0 bg-red-950/70 flex flex-col items-center justify-center text-red-200 text-[10px] gap-1 font-semibold">
                                <X className="w-4 h-4 text-red-400" />
                                Failed
                              </div>
                            )}
                          </div>
                        ))}
                        {mediaFiles.length < 7 && (
                          <button
                            type="button"
                            onClick={() => fileInputRef.current?.click()}
                            className="aspect-square border-2 border-dashed border-neutral-200 hover:border-red-200 rounded-xl flex flex-col items-center justify-center gap-1 hover:bg-neutral-50 transition-colors text-neutral-400 hover:text-[#B9001B]"
                          >
                            <PlusCircleIcon />
                            <span className="text-[11px] font-bold">Add Slide</span>
                          </button>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Caption Input */}
            <div className="bg-white rounded-2xl border border-neutral-200 p-6 shadow-sm">
              <label className="block text-sm font-bold text-neutral-900 mb-2">Caption</label>
              <textarea
                value={caption}
                onChange={(e) => setCaption(e.target.value)}
                placeholder="Write a compelling caption for your followers..."
                maxLength={2200}
                rows={4}
                className="w-full bg-neutral-50 border border-neutral-200 rounded-xl p-3 text-sm text-neutral-800 outline-none focus:bg-white focus:border-red-200 transition-all resize-none"
              />
              <div className="flex justify-end mt-1.5 text-xs text-neutral-400">
                <span>{caption.length} / 2200</span>
              </div>
            </div>

          </div>

          {/* RIGHT COLUMN: Tag Products (2 Cols) */}
          <div className="md:col-span-2 flex flex-col gap-6">

            <div className="bg-white rounded-2xl border border-neutral-200 p-6 flex flex-col max-h-[600px] shadow-sm">
              <div className="flex justify-between items-center mb-4">
                <label className="text-sm font-bold text-neutral-900">Tag Products</label>
                {taggedProductIds.length > 0 && (
                  <span className="bg-red-50 text-[#B9001B] text-xs font-bold px-2 py-0.5 rounded-full">
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
                  className="w-full bg-neutral-50 border border-neutral-200 rounded-xl py-2 pl-9 pr-4 text-xs text-neutral-800 outline-none focus:bg-white focus:border-red-200 transition-all"
                />
              </div>

              {/* Products List (Scrollable) */}
              <div className="flex-1 overflow-y-auto space-y-3 pr-1 min-h-[250px]">
                {productsLoading ? (
                  <div className="flex justify-center items-center py-12">
                    <Loader2 className="w-6 h-6 animate-spin text-neutral-400" />
                  </div>
                ) : filteredProducts.length === 0 ? (
                  <div className="text-center py-12 text-xs text-neutral-400">
                    No products found in inventory.
                  </div>
                ) : (
                  filteredProducts.map((p) => {
                    const isTagged = taggedProductIds.includes(p.$id);
                    return (
                      <div
                        key={p.$id}
                        onClick={() => toggleTagProduct(p.$id)}
                        className={`flex items-center gap-3 p-2.5 rounded-xl border transition-all cursor-pointer ${isTagged
                            ? "bg-red-50/40 border-red-200"
                            : "border-neutral-100 hover:bg-neutral-50"
                          }`}
                      >
                        <div className="w-12 h-12 bg-neutral-100 rounded-lg overflow-hidden flex-shrink-0 border border-neutral-200">
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
                          <span className="text-xs font-semibold text-[#B9001B]">₦{p.price.toLocaleString()}</span>
                        </div>
                        <div className={`w-5 h-5 rounded-full flex items-center justify-center border transition-all ${isTagged
                            ? "bg-[#B9001B] border-[#B9001B] text-white"
                            : "border-neutral-300"
                          }`}>
                          {isTagged && <Check className="w-3.5 h-3.5 stroke-[3]" />}
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