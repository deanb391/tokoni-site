// app/payment/failed/page.tsx
"use client";

import React, { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

function PaymentFailedForm() {
    const router = useRouter();
    const searchParams = useSearchParams();

    const type = searchParams.get('type') || 'subscription';
    const from = searchParams.get('from') || 'dashboard';
    const productId = searchParams.get('productId') || '';

    const [mounted, setMounted] = useState(false);
    useEffect(() => { setTimeout(() => setMounted(true), 60); }, []);

    const isSubscription = type === 'subscription';

    const handleRetry = () => {
        if (isSubscription) {
            router.push('/dashboard/subscription');
        } else {
            if (from === 'product' && productId) {
                router.push(`/dashboard/product/sponsor?productId=${productId}`);
            } else {
                router.push('/dashboard/product/sponsor');
            }
        }
    };

    const handleGoBack = () => {
        if (isSubscription) {
            router.push('/dashboard/subscription');
        } else {
            if (from === 'product' && productId) {
                router.push(`/product/${productId}`);
            } else {
                router.push('/dashboard');
            }
        }
    };

    return (
        <div style={{
            minHeight: '100vh',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'linear-gradient(160deg, #fff 0%, #FFF5F5 100%)',
            fontFamily: 'var(--font-body), sans-serif',
            padding: '2rem',
        }}>
            <div style={{
                textAlign: 'center',
                maxWidth: '440px',
                transform: mounted ? 'scale(1) translateY(0)' : 'scale(0.85) translateY(20px)',
                opacity: mounted ? 1 : 0,
                transition: 'all 0.45s cubic-bezier(0.34, 1.56, 0.64, 1)',
            }}>

                {/* Sad icon with shake animation */}
                <div style={{
                    width: '110px', height: '110px',
                    borderRadius: '50%',
                    backgroundColor: '#FFF0F2',
                    border: '3px solid #FFD7DE',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    margin: '0 auto 1.5rem',
                    animation: mounted ? 'wobble 0.6s ease-in-out 0.3s' : 'none',
                }}>
                    <span style={{ fontSize: '52px' }}>😔</span>
                </div>

                <h1 style={{
                    fontSize: '28px',
                    fontWeight: '900',
                    color: '#111',
                    margin: '0 0 0.75rem',
                    letterSpacing: '-0.5px',
                }}>
                    Payment Didn't Go Through
                </h1>

                <p style={{ fontSize: '15px', color: '#666', lineHeight: 1.65, margin: '0 0 0.5rem' }}>
                    Something went wrong with your payment. Don't worry — nothing was charged.
                </p>
                <p style={{ fontSize: '14px', color: '#999', lineHeight: 1.5, margin: '0 0 2rem' }}>
                    This could be a temporary issue with the payment gateway. Give it another shot!
                </p>

                {/* Tips */}
                <div style={{
                    backgroundColor: '#FFF8F8',
                    border: '1px solid #FFD7DE',
                    borderRadius: '14px',
                    padding: '1rem 1.25rem',
                    textAlign: 'left',
                    marginBottom: '1.5rem',
                }}>
                    <p style={{ fontSize: '13px', fontWeight: '700', color: '#B9001B', margin: '0 0 8px' }}>Common reasons:</p>
                    {[
                        'Insufficient funds in account',
                        'Card declined by bank',
                        'Network interruption during payment',
                    ].map(r => (
                        <div key={r} style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                            <span style={{ color: '#B9001B', fontSize: '12px' }}>•</span>
                            <span style={{ fontSize: '13px', color: '#555' }}>{r}</span>
                        </div>
                    ))}
                </div>

                <button
                    onClick={handleRetry}
                    style={{
                        width: '100%',
                        padding: '1rem',
                        background: 'linear-gradient(135deg, #B9001B, #FF4D6D)',
                        color: '#FFF',
                        border: 'none',
                        borderRadius: '14px',
                        fontSize: '15px',
                        fontWeight: '700',
                        cursor: 'pointer',
                        boxShadow: '0 4px 16px rgba(185,0,27,0.25)',
                        marginBottom: '0.75rem',
                        transition: 'transform 0.15s',
                    }}
                    onMouseOver={e => (e.currentTarget.style.transform = 'scale(1.02)')}
                    onMouseOut={e => (e.currentTarget.style.transform = 'scale(1)')}
                >
                    Try Again
                </button>

                <button
                    onClick={handleGoBack}
                    style={{
                        width: '100%',
                        padding: '0.9rem',
                        backgroundColor: '#FFF',
                        color: '#555',
                        border: '1.5px solid #E5E7EB',
                        borderRadius: '14px',
                        fontSize: '15px',
                        fontWeight: '600',
                        cursor: 'pointer',
                    }}
                >
                    Go Back
                </button>
            </div>

            <style>{`
                @keyframes wobble {
                    0%, 100% { transform: rotate(0deg); }
                    20% { transform: rotate(-8deg); }
                    40% { transform: rotate(8deg); }
                    60% { transform: rotate(-5deg); }
                    80% { transform: rotate(5deg); }
                }
            `}</style>
        </div>
    );
}

export default function PaymentFailedPage() {
    return (
        <Suspense fallback={
            <div style={{ backgroundColor: '#F9FAFB', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'var(--font-body), sans-serif' }}>
                <div style={{ textAlign: 'center', color: '#666' }}>
                    <div style={{ width: '40px', height: '40px', border: '3px solid rgba(185,0,27,0.1)', borderTop: '3px solid #B9001B', borderRadius: '50%', animation: 'spin 1s linear infinite', margin: '0 auto 1rem' }} />
                    <p style={{ fontSize: '14px', fontWeight: '600' }}>Loading payment info...</p>
                </div>
            </div>
        }>
            <PaymentFailedForm />
        </Suspense>
    );
}
