"use client";

import React, { useState } from "react";
import { Plus, X, ShoppingBag, PenSquare } from "lucide-react";
import Link from "next/link";

interface FloatingActionButtonProps {
  className?: string;
}

export default function FloatingActionButton({ className = "" }: FloatingActionButtonProps) {
  const [isOpen, setIsOpen] = useState(false);

  const toggleOpen = () => setIsOpen(!isOpen);

  return (
    <>
      {/* Backdrop overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/45 backdrop-blur-[2px] z-[98] transition-opacity duration-300"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Floating Action Button & Menu */}
      <div className={`fixed bottom-8 right-6 md:right-12 z-[99] flex flex-col items-end gap-4 ${className}`}>
        {/* Action Options */}
        <div className={`flex flex-col gap-3 transition-all duration-300 transform ${
          isOpen 
            ? "scale-100 opacity-100 translate-y-0" 
            : "scale-0 opacity-0 translate-y-10 pointer-events-none"
        }`}>
          {/* Add Product Option */}
          <Link
            href="/dashboard/product/add"
            onClick={() => setIsOpen(false)}
            className="flex items-center gap-3 bg-white text-gray-700 px-4 py-2.5 rounded-full shadow-lg border border-gray-100 hover:bg-gray-50 transition-all duration-200 group"
          >
            <span className="text-sm font-semibold">Add Product</span>
            <div className="w-10 h-10 rounded-full bg-[#FFF0F2] flex items-center justify-center text-[#B9001B] group-hover:bg-[#B9001B] group-hover:text-white transition-colors duration-200">
              <ShoppingBag size={18} />
            </div>
          </Link>

          {/* Create Post Option */}
          <Link
            href="/dashboard/post/add"
            onClick={() => setIsOpen(false)}
            className="flex items-center gap-3 bg-white text-gray-700 px-4 py-2.5 rounded-full shadow-lg border border-gray-100 hover:bg-gray-50 transition-all duration-200 group"
          >
            <span className="text-sm font-semibold">Create Post</span>
            <div className="w-10 h-10 rounded-full bg-[#FFF0F2] flex items-center justify-center text-[#B9001B] group-hover:bg-[#B9001B] group-hover:text-white transition-colors duration-200">
              <PenSquare size={18} />
            </div>
          </Link>
        </div>

        {/* Main Floating Button */}
        <button
          onClick={toggleOpen}
          aria-label={isOpen ? "Close menu" : "Open add actions"}
          className={`w-14 h-14 rounded-full shadow-2xl flex items-center justify-center transition-all duration-300 transform hover:scale-110 active:scale-95 outline-none cursor-pointer ${
            isOpen 
              ? "bg-[#B9001B] text-white rotate-90" 
              : "bg-white text-[#B9001B] border border-[#B9001B]/15 hover:bg-red-50/50"
          }`}
        >
          {isOpen ? (
            <X size={26} strokeWidth={2.5} />
          ) : (
            <Plus size={26} strokeWidth={2.5} />
          )}
        </button>
      </div>
    </>
  );
}
