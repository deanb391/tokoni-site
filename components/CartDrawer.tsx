"use client";

import React, { useEffect, useState } from "react";
import { X, Trash2, ShoppingBag } from "lucide-react";

interface CartItem {
  productId: string;
  name: string;
  price: number;
  image: string;
}

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  items: CartItem[];
  onRemoveItem?: (productId: string) => void;
  onSendCart?: () => void;
  isSending?: boolean;
  title?: string;
  isReadOnly?: boolean;
}

export default function CartDrawer({
  isOpen,
  onClose,
  items,
  onRemoveItem,
  onSendCart,
  isSending = false,
  title = "Shopping Cart",
  isReadOnly = false,
}: CartDrawerProps) {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isOpen) {
      setLoading(true);
      // Simulate/Trigger fetching cart products with a high-fidelity skeleton animation
      const timer = setTimeout(() => {
        setLoading(false);
      }, 1200);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        backgroundColor: "rgba(0, 0, 0, 0.6)",
        backdropFilter: "blur(4px)",
        zIndex: 1000,
        display: "flex",
        alignItems: "flex-end",
        justifyContent: "center",
      }}
    >
      {/* Click outside to close */}
      <div
        style={{ position: "absolute", inset: 0 }}
        onClick={onClose}
      />

      {/* Main Drawer Container */}
      <div
        style={{
          position: "relative",
          width: "1050px",
          maxWidth: "100%",
          maxHeight: "80vh",
          backgroundColor: "#FFFFFF",
          borderTopLeftRadius: "24px",
          borderTopRightRadius: "24px",
          display: "flex",
          flexDirection: "column",
          boxShadow: "0 -8px 30px rgba(0, 0, 0, 0.15)",
          zIndex: 1010,
          overflow: "hidden",
          animation: "slideUp 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards",
        }}
      >
        {/* Drag handle */}
        <div
          style={{
            width: "100%",
            display: "flex",
            justifyContent: "center",
            padding: "10px 0",
          }}
        >
          <div
            style={{
              width: "48px",
              height: "4px",
              backgroundColor: "#E5E7EB",
              borderRadius: "9999px",
            }}
          />
        </div>

        {/* Drawer Header */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            padding: "0 24px 16px 24px",
            borderBottom: "1px solid #F3F4F6",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <ShoppingBag style={{ width: "20px", height: "20px", color: "#B9001B" }} />
            <h2 style={{ fontSize: "18px", fontWeight: 800, color: "#111827", margin: 0 }}>
              {title}
            </h2>
          </div>
          <button
            onClick={onClose}
            style={{
              background: "none",
              border: "none",
              cursor: "pointer",
              padding: "6px",
              borderRadius: "50%",
              backgroundColor: "#F3F4F6",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <X style={{ width: "16px", height: "16px", color: "#4B5563" }} />
          </button>
        </div>

        {/* Scrollable Cart Items List */}
        <div
          style={{
            flex: 1,
            overflowY: "auto",
            padding: "24px",
            display: "flex",
            flexDirection: "column",
            gap: "16px",
          }}
        >
          {loading ? (
            /* Skeleton Loading State */
            <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              {[1, 2].map((i) => (
                <div
                  key={i}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "16px",
                    padding: "16px",
                    borderRadius: "16px",
                    border: "1px solid #F3F4F6",
                  }}
                >
                  <div
                    className="skeleton"
                    style={{
                      width: "64px",
                      height: "64px",
                      borderRadius: "12px",
                      flexShrink: 0,
                    }}
                  />
                  <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: "8px" }}>
                    <div
                      className="skeleton"
                      style={{ width: "60%", height: "16px", borderRadius: "4px" }}
                    />
                    <div
                      className="skeleton"
                      style={{ width: "30%", height: "14px", borderRadius: "4px" }}
                    />
                  </div>
                </div>
              ))}
            </div>
          ) : items.length === 0 ? (
            /* Empty State */
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                padding: "48px 0",
                color: "#9CA3AF",
                gap: "12px",
              }}
            >
              <ShoppingBag style={{ width: "48px", height: "48px", strokeWidth: 1.5 }} />
              <span style={{ fontSize: "14px", fontWeight: "600" }}>Your cart is empty</span>
            </div>
          ) : (
            /* Items List */
            items.map((item) => (
              <div
                key={item.productId}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  gap: "16px",
                  padding: "16px",
                  backgroundColor: "#FFFFFF",
                  borderRadius: "16px",
                  border: "1px solid #F3F4F6",
                  boxShadow: "0 2px 8px rgba(0,0,0,0.01)",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: "16px", flex: 1, minWidth: 0 }}>
                  <div
                    style={{
                      width: "64px",
                      height: "64px",
                      borderRadius: "12px",
                      backgroundColor: "#F3F4F6",
                      overflow: "hidden",
                      flexShrink: 0,
                    }}
                  >
                    {item.image ? (
                      <img
                        src={item.image}
                        alt={item.name}
                        style={{ width: "100%", height: "100%", objectFit: "cover" }}
                      />
                    ) : (
                      <div
                        style={{
                          width: "100%",
                          height: "100%",
                          background: "linear-gradient(135deg, #1A1A1A 0%, #B9001B 100%)",
                        }}
                      />
                    )}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <h4
                      style={{
                        fontSize: "14.5px",
                        fontWeight: "750",
                        color: "#111827",
                        margin: "0 0 4px 0",
                        whiteSpace: "nowrap",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                      }}
                    >
                      {item.name}
                    </h4>
                    <span style={{ fontSize: "14px", fontWeight: "700", color: "#B9001B" }}>
                      ₦{item.price.toLocaleString()}
                    </span>
                  </div>
                </div>

                {!isReadOnly && onRemoveItem && (
                  <button
                    onClick={() => onRemoveItem(item.productId)}
                    style={{
                      background: "none",
                      border: "none",
                      cursor: "pointer",
                      padding: "8px",
                      borderRadius: "8px",
                      backgroundColor: "#FFF0F2",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <Trash2 style={{ width: "16px", height: "16px", color: "#B9001B" }} />
                  </button>
                )}
              </div>
            ))
          )}
        </div>

        {/* Drawer CTA Action Footer */}
        {!isReadOnly && items.length > 0 && onSendCart && (
          <div
            style={{
              padding: "16px 24px 24px 24px",
              borderTop: "1px solid #F3F4F6",
              backgroundColor: "#FFFFFF",
            }}
          >
            <button
              onClick={onSendCart}
              disabled={isSending || loading}
              style={{
                width: "100%",
                backgroundColor: "#B9001B",
                color: "#FFFFFF",
                border: "none",
                borderRadius: "12px",
                padding: "14px",
                fontSize: "15px",
                fontWeight: "700",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "8px",
                opacity: isSending || loading ? 0.7 : 1,
                boxShadow: "0 4px 12px rgba(185, 0, 27, 0.15)",
              }}
            >
              {isSending ? (
                <div
                  style={{
                    width: "20px",
                    height: "20px",
                    border: "2px solid #FFF",
                    borderTop: "2px solid transparent",
                    borderRadius: "50%",
                    animation: "spin 1s linear infinite",
                  }}
                />
              ) : (
                <>Send Cart to Vendor</>
              )}
            </button>
          </div>
        )}
      </div>

      <style jsx global>{`
        @keyframes slideUp {
          from {
            transform: translateY(100%);
          }
          to {
            transform: translateY(0);
          }
        }
        .skeleton {
          background: linear-gradient(90deg, #F3F4F6 25%, #E5E7EB 50%, #F3F4F6 75%);
          background-size: 200% 100%;
          animation: loading 1.5s infinite;
        }
        @keyframes loading {
          0% {
            background-position: 200% 0;
          }
          100% {
            background-position: -200% 0;
          }
        }
        @keyframes spin {
          to {
            transform: rotate(360deg);
          }
        }
      `}</style>
    </div>
  );
}
