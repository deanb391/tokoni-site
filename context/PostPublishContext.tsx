// context/PostPublishContext.tsx
"use client";

import React, { createContext, useContext, useState, ReactNode } from "react";
import { createPost } from "@/lib/api/posts";
import { Post, PostDraft } from "@/lib/services/posts.service";
import { useRouter } from "next/navigation";

export interface UploadingFile {
  id: string;
  name: string;
  previewUrl: string;
  progress: number;
  status: "pending" | "uploading" | "done" | "error";
}

export interface PublishingPostState {
  caption: string;
  postType: "image" | "video";
  mediaFiles: UploadingFile[];
  status: "idle" | "uploading" | "creating_post" | "done" | "error";
  progress: number;
  errorMessage?: string;
}

interface PostPublishContextType {
  publishingPost: PublishingPostState;
  newlyPublishedPosts: Post[];
  publishPost: (
    caption: string,
    postType: "image" | "video",
    files: File[],
    taggedProductIds: string[],
    vendorId: string
  ) => Promise<void>;
  clearPublishingState: () => void;
  removeNewPostFromList: (postId: string) => void;
}

const PostPublishContext = createContext<PostPublishContextType | undefined>(undefined);

export function PostPublishProvider({ children }: { children: ReactNode }) {
  const router = useRouter();
  const [publishingPost, setPublishingPost] = useState<PublishingPostState>({
    caption: "",
    postType: "image",
    mediaFiles: [],
    status: "idle",
    progress: 0,
  });
  const [newlyPublishedPosts, setNewlyPublishedPosts] = useState<Post[]>([]);

  const clearPublishingState = () => {
    setPublishingPost({
      caption: "",
      postType: "image",
      mediaFiles: [],
      status: "idle",
      progress: 0,
    });
  };

  const removeNewPostFromList = (postId: string) => {
    setNewlyPublishedPosts(prev => prev.filter(p => p.$id !== postId));
  };

  const publishPost = async (
    caption: string,
    postType: "image" | "video",
    files: File[],
    taggedProductIds: string[],
    vendorId: string
  ) => {
    // 1. Initialize state
    const initialFiles: UploadingFile[] = files.map((file, idx) => ({
      id: `${Date.now()}-${idx}`,
      name: file.name,
      previewUrl: URL.createObjectURL(file),
      progress: 0,
      status: "pending",
    }));

    setPublishingPost({
      caption,
      postType,
      mediaFiles: initialFiles,
      status: "uploading",
      progress: 0,
    });

    // 2. Redirect to dashboard immediately
    router.push("/dashboard");

    // Helper to run S3 direct uploads
    try {
      const s3Urls: string[] = [];
      const updatedFiles = [...initialFiles];

      // Upload files in parallel
      await Promise.all(
        files.map(async (file, index) => {
          const uFile = updatedFiles[index];
          uFile.status = "uploading";
          
          setPublishingPost(prev => ({
            ...prev,
            mediaFiles: [...updatedFiles],
          }));

          try {
            // Get S3 presigned URL
            const presignedRes = await fetch(
              `/api/upload?action=presigned&folder=posts&contentType=${encodeURIComponent(
                file.type
              )}&filename=${encodeURIComponent(file.name)}`
            );
            if (!presignedRes.ok) {
              throw new Error("Failed to generate S3 upload token");
            }
            const { uploadUrl, fileUrl } = await presignedRes.json();

            // Upload directly to S3 with progress monitoring via XMLHttpRequest
            await new Promise<void>((resolve, reject) => {
              const xhr = new XMLHttpRequest();
              xhr.open("PUT", uploadUrl);
              xhr.setRequestHeader("Content-Type", file.type);
              
              xhr.upload.onprogress = (event) => {
                if (event.lengthComputable) {
                  const percent = Math.round((event.loaded / event.total) * 100);
                  uFile.progress = percent;
                  
                  // Calculate overall upload progress
                  setPublishingPost(prev => {
                    const nextMedia = prev.mediaFiles.map(f =>
                      f.id === uFile.id ? { ...f, progress: percent } : f
                    );
                    const totalProgress = nextMedia.reduce((acc, f) => acc + f.progress, 0);
                    const avgProgress = Math.round(totalProgress / nextMedia.length);
                    // Upload represents 90% of overall progress
                    const overallProgress = Math.min(90, Math.round(avgProgress * 0.9));
                    
                    return {
                      ...prev,
                      mediaFiles: nextMedia,
                      progress: overallProgress,
                    };
                  });
                }
              };

              xhr.onload = () => {
                if (xhr.status >= 200 && xhr.status < 300) {
                  resolve();
                } else {
                  reject(new Error(`S3 upload failed: status ${xhr.status}`));
                }
              };

              xhr.onerror = () => reject(new Error("S3 upload network error"));
              xhr.send(file);
            });

            uFile.status = "done";
            uFile.progress = 100;
            s3Urls[index] = fileUrl;

            setPublishingPost(prev => {
              const nextMedia = prev.mediaFiles.map(f =>
                f.id === uFile.id ? { ...f, status: "done", progress: 100 } : f
              );
              const totalProgress = nextMedia.reduce((acc, f) => acc + f.progress, 0);
              const avgProgress = Math.round(totalProgress / nextMedia.length);
              const overallProgress = Math.min(90, Math.round(avgProgress * 0.9));

              return {
                ...prev,
                mediaFiles: nextMedia,
                progress: overallProgress,
              };
            });

          } catch (err: any) {
            uFile.status = "error";
            setPublishingPost(prev => ({
              ...prev,
              mediaFiles: prev.mediaFiles.map(f => (f.id === uFile.id ? { ...f, status: "error" } : f)),
            }));
            throw err;
          }
        })
      );

      // 3. Media is done uploading, now create the DB post
      setPublishingPost(prev => ({
        ...prev,
        status: "creating_post",
        progress: 95,
      }));

      const draft: PostDraft = {
        type: postType,
        media: s3Urls.filter(Boolean),
        caption,
        taggedProducts: taggedProductIds,
      };

      const createdPost = await createPost(draft, vendorId);

      // 4. Finished publishing!
      setPublishingPost(prev => ({
        ...prev,
        status: "done",
        progress: 100,
      }));

      // Prepend to list of newly published posts
      setNewlyPublishedPosts(prev => [createdPost, ...prev]);

      // Clean up object URLs
      initialFiles.forEach(f => URL.revokeObjectURL(f.previewUrl));

      // Reset state after a short delay so the user sees "Done!"
      setTimeout(() => {
        clearPublishingState();
      }, 1500);

    } catch (error: any) {
      console.error("Direct S3 publish error:", error);
      setPublishingPost(prev => ({
        ...prev,
        status: "error",
        errorMessage: error.message || "Failed to publish post. Please check your network and try again.",
      }));
    }
  };

  return (
    <PostPublishContext.Provider
      value={{
        publishingPost,
        newlyPublishedPosts,
        publishPost,
        clearPublishingState,
        removeNewPostFromList,
      }}
    >
      {children}
    </PostPublishContext.Provider>
  );
}

export function usePostPublish() {
  const context = useContext(PostPublishContext);
  if (!context) {
    throw new Error("usePostPublish must be used within a PostPublishProvider");
  }
  return context;
}
