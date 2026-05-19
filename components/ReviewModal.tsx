// components/ReviewModal.tsx
"use client";

import React, { useEffect, useState } from "react";

interface ReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (payload: { rating: number; review: string }) => void;
  isSaving?: boolean;
  initialRating?: number;
  initialReview?: string;
}

const StarIcon = ({ fill = "none", size = 26, color = "#B9001B" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill={fill} stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ transition: 'transform 0.15s ease' }}>
    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
  </svg>
);

export default function ReviewModal({
  isOpen,
  onClose,
  onSubmit,
  isSaving = false,
  initialRating = 0,
  initialReview = "",
}: ReviewModalProps) {
  const [rating, setRating] = useState(initialRating);
  const [review, setReview] = useState(initialReview);
  const [hoverRating, setHoverRating] = useState<number | null>(null);

  useEffect(() => {
    if (isOpen) {
      setRating(initialRating);
      setReview(initialReview);
    }
  }, [initialRating, initialReview, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (rating === 0 || !review.trim()) return;

    onSubmit({
      rating,
      review: review.trim(),
    });
  };

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      zIndex: 1000,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: 'rgba(0, 0, 0, 0.45)',
      backdropFilter: 'blur(6px)',
      WebkitBackdropFilter: 'blur(6px)',
      padding: '1.5rem',
      animation: 'fadeIn 0.25s ease-out'
    }}>
      <div style={{
        width: '100%',
        maxWidth: '460px',
        backgroundColor: '#FFFFFF',
        borderRadius: '20px',
        boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1), 0 10px 10px -5px rgba(0,0,0,0.04)',
        overflow: 'hidden',
        border: '1px solid rgba(229, 231, 235, 0.8)',
        animation: 'slideUp 0.3s cubic-bezier(0.16, 1, 0.3, 1)'
      }}>
        <div style={{ padding: '1.75rem' }}>
          <h2 style={{ fontSize: '20px', fontWeight: '800', color: '#111111', margin: '0 0 6px 0', letterSpacing: '-0.3px' }}>
            Leave a Review
          </h2>
          <p style={{ fontSize: '13.5px', color: '#666666', margin: '0 0 1.5rem 0', lineHeight: '1.4' }}>
            Share your experience with this product. Your feedback helps other shoppers make better decisions!
          </p>

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            {/* Stars */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label style={{ fontSize: '13.5px', fontWeight: '700', color: '#1F2937' }}>
                Rating <span style={{ color: '#B9001B' }}>*</span>
              </label>

              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', padding: '1rem', backgroundColor: '#F9FAFB', borderRadius: '12px', border: '1px solid #F3F4F6' }}>
                {Array.from({ length: 5 }).map((_, index) => {
                  const starValue = index + 1;
                  const activeRating = hoverRating !== null ? hoverRating : rating;
                  const filled = starValue <= activeRating;

                  return (
                    <button
                      key={index}
                      type="button"
                      onClick={() => setRating(starValue)}
                      onMouseEnter={() => setHoverRating(starValue)}
                      onMouseLeave={() => setHoverRating(null)}
                      style={{
                        background: 'none',
                        border: 'none',
                        padding: '4px',
                        cursor: 'pointer',
                        transform: filled ? 'scale(1.12)' : 'scale(1)',
                        transition: 'transform 0.15s ease-out'
                      }}
                    >
                      <StarIcon
                        size={30}
                        fill={filled ? "#B9001B" : "none"}
                        color={filled ? "#B9001B" : "#D1D5DB"}
                      />
                    </button>
                  );
                })}
              </div>

              <p style={{ fontSize: '12px', color: '#6B7280', textAlign: 'center', margin: '2px 0 0 0', fontWeight: '500' }}>
                {rating > 0 ? `${rating} / 5 stars selected` : "Tap to select your rating"}
              </p>
            </div>

            {/* Comment */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label style={{ fontSize: '13.5px', fontWeight: '700', color: '#1F2937' }}>
                Your Review <span style={{ color: '#B9001B' }}>*</span>
              </label>

              <textarea
                value={review}
                onChange={(e) => setReview(e.target.value)}
                placeholder="What did you like or dislike about this product? How was the service?"
                required
                style={{
                  width: '100%',
                  minHeight: '120px',
                  resize: 'none',
                  borderRadius: '12px',
                  border: '1px solid #E5E7EB',
                  padding: '0.85rem 1rem',
                  fontSize: '14px',
                  color: '#111111',
                  backgroundColor: '#FFFFFF',
                  outline: 'none',
                  boxSizing: 'border-box',
                  transition: 'border-color 0.15s ease',
                }}
                onFocus={(e) => e.target.style.borderColor = '#B9001B'}
                onBlur={(e) => e.target.style.borderColor = '#E5E7EB'}
              />
            </div>

            {/* Actions */}
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '0.5rem' }}>
              <button
                type="button"
                onClick={onClose}
                style={{
                  padding: '0.65rem 1.25rem',
                  borderRadius: '10px',
                  fontSize: '14px',
                  fontWeight: '600',
                  color: '#4B5563',
                  backgroundColor: '#F3F4F6',
                  border: 'none',
                  cursor: 'pointer',
                  transition: 'background-color 0.15s'
                }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#E5E7EB'}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#F3F4F6'}
              >
                Cancel
              </button>

              <button
                type="submit"
                disabled={isSaving || rating === 0 || !review.trim()}
                style={{
                  padding: '0.65rem 1.5rem',
                  borderRadius: '10px',
                  fontSize: '14px',
                  fontWeight: '700',
                  color: '#FFFFFF',
                  backgroundColor: '#B9001B',
                  border: 'none',
                  cursor: 'pointer',
                  opacity: (rating === 0 || !review.trim() || isSaving) ? 0.6 : 1,
                  transition: 'opacity 0.15s, background-color 0.15s',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}
              >
                {isSaving ? (
                  <>
                    <div style={{ width: '14px', height: '14px', border: '2px solid rgba(255,255,255,0.3)', borderTop: '2px solid white', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
                    Submitting...
                  </>
                ) : "Submit Review"}
              </button>
            </div>
          </form>
        </div>
      </div>

      <style jsx>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes slideUp {
          from { transform: translateY(12px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
