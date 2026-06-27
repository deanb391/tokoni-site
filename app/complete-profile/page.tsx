// app/complete-profile/page.tsx
"use client";

import React, { useState, useEffect } from "react";
import { User, Store, ArrowRight, ShoppingBag } from "lucide-react";
import { useRouter } from 'nextjs-toploader/app';

import { account } from "@/lib/services/auth.service";
import { useUser } from "@/context/UserContext";
import { createUserProfile } from "@/lib/services/auth.service";

export default function CompleteProfilePage() {
  const router = useRouter();
  const { refreshUser } = useUser();

  const [username, setUsername] = useState("");
  const [isVendor, setIsVendor] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [authUser, setAuthUser] = useState<any>(null);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const currentUser = await account.get();
        setAuthUser(currentUser);
        setUsername(currentUser.name || "");
      } catch {
        router.replace("/signin");
      }
    };
    checkAuth();
  }, [router]);

  const handleCompleteProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!authUser) return;

    setIsLoading(true);

    try {
      await createUserProfile(authUser, {
        username,
        isVendor,
      });

      await refreshUser();

      if (isVendor) {
        router.replace("/onboarding");
      } else {
        router.replace("/");
      }
    } catch (error) {
      console.error("Error completing profile:", error);
      alert("Something went wrong. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  if (!authUser) {
    return (
      <div className="min-h-screen bg-[#F9FAFB] flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-[#B9001B]"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F5F5F5] flex items-center justify-center p-4 font-sans">
      <div className="bg-white w-full max-w-[420px] rounded-[24px] p-8 shadow-sm relative overflow-hidden">
        {/* Subtle background glow effect */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-red-50 rounded-full blur-3xl -mr-16 -mt-16 opacity-70 pointer-events-none"></div>

        {/* Header section */}
        <div className="flex flex-col items-center mb-8 relative z-10 text-center">
          <div className="flex items-center gap-2 mb-2.5 text-[#B9001B]">
            <ShoppingBag size={28} strokeWidth={2.5} />
            <span className="text-3xl font-bold tracking-tight">Tokoni</span>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-1">Complete Your Profile</h1>
          <p className="text-gray-500 text-sm">Just a few quick details to set up your account</p>
        </div>

        {/* Form */}
        <form onSubmit={handleCompleteProfile} className="space-y-5 relative z-10">
          {/* Username */}
          <div className="space-y-1.5">
            <label className="block text-[13px] font-medium text-gray-800">Username</label>
            <div className="flex items-center bg-[#F9F9F9] rounded-xl px-4 py-3 border border-gray-100">
              <User size={18} className="text-gray-500 mr-3" strokeWidth={2} />
              <input
                type="text"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Choose a display name"
                className="bg-transparent border-none outline-none w-full text-[15px] text-gray-800 placeholder-gray-400"
              />
            </div>
          </div>

          {/* Vendor Toggle */}
          <div 
            className="flex items-center justify-between bg-[#F9F9F9] rounded-xl px-4 py-3 cursor-pointer border border-gray-100" 
            onClick={() => setIsVendor(!isVendor)}
          >
            <div className="flex items-center">
              <Store size={18} className="text-[#B9001B] mr-3" strokeWidth={2} />
              <div className="flex flex-col">
                <span className="text-[14px] font-semibold text-gray-900">Are you a vendor?</span>
                <span className="text-[11px] text-gray-500">I want to sell items on Tokoni</span>
              </div>
            </div>

            {/* Custom Toggle Switch */}
            <div className={`w-11 h-6 rounded-full relative flex items-center px-1 transition-colors duration-300 ${isVendor ? 'bg-[#B9001B]' : 'bg-[#E5E7EB]'}`}>
              <div className={`w-4 h-4 bg-white rounded-full shadow-sm transform transition-transform duration-300 ${isVendor ? 'translate-x-5' : 'translate-x-0'}`}></div>
            </div>
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-[#B9001B] hover:bg-[#A30018] text-white py-3.5 rounded-xl text-[15px] font-semibold flex justify-center items-center gap-2 transition-colors disabled:opacity-75"
          >
            {isLoading ? (
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
            ) : (
              <>
                <span>Complete Profile</span>
                <ArrowRight size={18} strokeWidth={2.5} />
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
