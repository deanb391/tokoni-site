// app/auth/callback/page.tsx
"use client";

import { useEffect, useRef } from "react";
import { useRouter } from 'nextjs-toploader/app';

import { handleOAuthSignIn } from "@/lib/services/auth.service";
import { useUser } from "@/context/UserContext";

export default function AuthCallbackPage() {
  const router = useRouter();
  const hasRun = useRef(false);
  const { refreshUser } = useUser();

  useEffect(() => {
    if (hasRun.current) return;
    hasRun.current = true;

    const run = async () => {
      try {
        const params = new URLSearchParams(window.location.search);
        const userId = params.get("userId");
        const secret = params.get("secret");

        if (!userId || !secret) {
          router.replace("/signin");
          return;
        }

        const result = await handleOAuthSignIn(userId, secret);

        // clean URL to avoid secret leaks
        window.history.replaceState({}, document.title, "/auth/callback");

        if (result.status === "EXISTS") {
          await refreshUser();
          router.replace("/");
        } else {
          router.replace("/complete-profile");
        }
      } catch (error) {
        console.error("OAuth callback error:", error);
        router.replace("/signin");
      }
    };

    run();
  }, [router, refreshUser]);

  return (
    <div className="min-h-screen bg-[#F9FAFB] flex items-center justify-center font-sans">
      <div className="text-center p-8 bg-white rounded-3xl shadow-sm border border-gray-100 max-w-sm w-full mx-4">
        {/* Spinner */}
        <div className="relative w-12 h-12 mx-auto mb-5">
          <div className="absolute inset-0 rounded-full border-4 border-gray-100"></div>
          <div className="absolute inset-0 rounded-full border-4 border-t-[#B9001B] border-r-[#B9001B] animate-spin"></div>
        </div>
        <h2 className="text-lg font-bold text-gray-900 mb-1">Completing Sign-In</h2>
        <p className="text-sm text-gray-500">Please wait while we secure your session...</p>
      </div>
    </div>
  );
}
