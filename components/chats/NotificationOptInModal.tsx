"use client";

import React, { useState, useEffect } from 'react';

type NotificationOptInModalProps = {
    onClose?: () => void;
};

export default function NotificationOptInModal({ onClose }: NotificationOptInModalProps) {
    const [isVisible, setIsVisible] = useState(false);
    const BRAND_RED = "#B9001B";

    useEffect(() => {
        // Only run in client browser environment
        if (typeof window === 'undefined') return;

        // Check if browser notifications are supported
        if (!('Notification' in window)) return;

        // Check if permission is default and not already dismissed persistently
        const isDismissed = localStorage.getItem('tokoni-push-dismissed') === 'true';
        if (Notification.permission === 'default' && !isDismissed) {
            // Delay slightly for premium UX feel
            const timer = setTimeout(() => {
                setIsVisible(true);
            }, 1500);
            return () => clearTimeout(timer);
        }
    }, []);

    const handleEnable = async () => {
        if (typeof window === 'undefined') return;
        try {
            const permission = await Notification.requestPermission();
            if (permission === 'granted') {
                new Notification("Notifications Enabled!", {
                    body: "You will now receive alerts for new messages on Tokoni.",
                    icon: "/favicon.ico"
                });
            }
        } catch (err) {
            console.error("Error requesting notification permission:", err);
        } finally {
            setIsVisible(false);
            if (onClose) onClose();
        }
    };

    const handleMaybeLater = () => {
        setIsVisible(false);
        if (onClose) onClose();
    };

    const handleDontShowAgain = () => {
        if (typeof window !== 'undefined') {
            localStorage.setItem('tokoni-push-dismissed', 'true');
        }
        setIsVisible(false);
        if (onClose) onClose();
    };

    if (!isVisible) return null;

    return (
        <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(17, 24, 39, 0.45)',
            backdropFilter: 'blur(6px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            padding: '1.5rem',
            boxSizing: 'border-box'
        }}>
            <div className="fade-in" style={{
                backgroundColor: '#ffffff',
                borderRadius: '24px',
                padding: '2.5rem 2rem',
                maxWidth: '420px',
                width: '100%',
                boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.15)',
                boxSizing: 'border-box',
                textAlign: 'center',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center'
            }}>
                {/* Premium Swinging Bell Animation */}
                <div style={{
                    width: '70px',
                    height: '70px',
                    borderRadius: '50%',
                    backgroundColor: '#FFF0F2',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginBottom: '1.5rem',
                    boxShadow: '0 8px 24px rgba(185, 0, 27, 0.08)'
                }}>
                    <svg
                        width="32"
                        height="32"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke={BRAND_RED}
                        strokeWidth="2.2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        style={{
                            animation: 'swing 2s ease-in-out infinite',
                            transformOrigin: '50% 0%'
                        }}
                    >
                        <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path>
                        <path d="M13.73 21a2 2 0 0 1-3.46 0"></path>
                    </svg>
                </div>

                <style>{`
                    @keyframes swing {
                        0% { transform: rotate(0); }
                        15% { transform: rotate(12deg); }
                        30% { transform: rotate(-10deg); }
                        45% { transform: rotate(8deg); }
                        60% { transform: rotate(-6deg); }
                        75% { transform: rotate(4deg); }
                        90% { transform: rotate(-2deg); }
                        100% { transform: rotate(0); }
                    }
                    .btn-hover:hover {
                        transform: translateY(-1px);
                        box-shadow: 0 4px 12px rgba(185, 0, 27, 0.2);
                    }
                    .btn-flat-hover:hover {
                        background-color: #f9fafb !important;
                    }
                `}</style>

                <h3 style={{
                    fontSize: '1.25rem',
                    fontWeight: '700',
                    color: '#111827',
                    margin: '0 0 0.5rem 0',
                    letterSpacing: '-0.3px'
                }}>
                    Enable Push Notifications
                </h3>

                <p style={{
                    fontSize: '0.925rem',
                    color: '#4b5563',
                    lineHeight: '1.5',
                    margin: '0 0 2rem 0'
                }}>
                    Never miss a message! Stay updated in real-time when buyers, vendors, or followers send you a message.
                </p>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', width: '100%' }}>
                    <button
                        onClick={handleEnable}
                        className="btn-hover"
                        style={{
                            width: '100%',
                            padding: '0.875rem',
                            borderRadius: '14px',
                            backgroundColor: BRAND_RED,
                            color: '#ffffff',
                            border: 'none',
                            fontWeight: '600',
                            fontSize: '0.95rem',
                            cursor: 'pointer',
                            transition: 'all 0.2s ease',
                            boxShadow: '0 4px 8px rgba(185, 0, 27, 0.12)'
                        }}
                    >
                        Allow Notifications
                    </button>

                    <button
                        onClick={handleMaybeLater}
                        className="btn-flat-hover"
                        style={{
                            width: '100%',
                            padding: '0.875rem',
                            borderRadius: '14px',
                            backgroundColor: 'transparent',
                            color: '#4b5563',
                            border: '1px solid #e5e7eb',
                            fontWeight: '600',
                            fontSize: '0.95rem',
                            cursor: 'pointer',
                            transition: 'all 0.2s ease'
                        }}
                    >
                        Maybe Later
                    </button>

                    <button
                        onClick={handleDontShowAgain}
                        style={{
                            border: 'none',
                            backgroundColor: 'transparent',
                            color: '#9ca3af',
                            fontSize: '0.8rem',
                            fontWeight: '500',
                            cursor: 'pointer',
                            marginTop: '0.5rem',
                            textDecoration: 'underline'
                        }}
                    >
                        Don't show this again
                    </button>
                </div>
            </div>
        </div>
    );
}
