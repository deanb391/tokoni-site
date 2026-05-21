// app/payment/success/page.tsx
"use client";

import React, { useEffect, useState, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

const CONFETTI_COLORS = ['#B9001B', '#FFD700', '#FF4D6D', '#FF8FA3', '#FFF'];

function Confetti() {
    const canvasRef = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;

        const pieces: any[] = [];
        for (let i = 0; i < 120; i++) {
            pieces.push({
                x: Math.random() * canvas.width,
                y: Math.random() * -canvas.height,
                w: Math.random() * 10 + 5,
                h: Math.random() * 5 + 3,
                color: CONFETTI_COLORS[Math.floor(Math.random() * CONFETTI_COLORS.length)],
                rot: Math.random() * 360,
                speed: Math.random() * 3 + 1.5,
                rotSpeed: Math.random() * 3 - 1.5,
                opacity: Math.random() * 0.6 + 0.4,
            });
        }

        let animId: number;
        function draw() {
            ctx!.clearRect(0, 0, canvas!.width, canvas!.height);
            pieces.forEach(p => {
                ctx!.save();
                ctx!.globalAlpha = p.opacity;
                ctx!.translate(p.x + p.w / 2, p.y + p.h / 2);
                ctx!.rotate((p.rot * Math.PI) / 180);
                ctx!.fillStyle = p.color;
                ctx!.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);
                ctx!.restore();
                p.y += p.speed;
                p.rot += p.rotSpeed;
                if (p.y > canvas!.height) {
                    p.y = -20;
                    p.x = Math.random() * canvas!.width;
                }
            });
            animId = requestAnimationFrame(draw);
        }
        draw();
        return () => cancelAnimationFrame(animId);
    }, []);

    return (
        <canvas
            ref={canvasRef}
            style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', pointerEvents: 'none', zIndex: 0 }}
        />
    );
}

export default function PaymentSuccessPage() {
    const router = useRouter();
    const searchParams = useSearchParams();

    const type = searchParams.get('type') || 'subscription'; // 'subscription' | 'sponsorship'
    const from = searchParams.get('from') || 'dashboard'; // 'dashboard' | 'product'
    const productId = searchParams.get('productId') || '';
    const vendorId = searchParams.get('vendorId') || '';

    const [scale, setScale] = useState(0.5);
    const [opacity, setOpacity] = useState(0);

    useEffect(() => {
        const t = setTimeout(() => {
            setScale(1);
            setOpacity(1);
        }, 80);
        return () => clearTimeout(t);
    }, []);

    const isSubscription = type === 'subscription';

    const handleContinue = () => {
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
            background: 'linear-gradient(160deg, #fff 0%, #FFF0F2 100%)',
            fontFamily: 'var(--font-body), sans-serif',
            padding: '2rem',
            position: 'relative',
            overflow: 'hidden',
        }}>
            <Confetti />

            <div style={{
                position: 'relative',
                zIndex: 1,
                textAlign: 'center',
                maxWidth: '460px',
                transform: `scale(${scale})`,
                opacity,
                transition: 'all 0.5s cubic-bezier(0.34, 1.56, 0.64, 1)',
            }}>

                {/* Trophy / Medal animation */}
                <div style={{
                    width: '120px', height: '120px',
                    borderRadius: '50%',
                    background: 'linear-gradient(135deg, #B9001B, #FF4D6D)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    margin: '0 auto 1.5rem',
                    boxShadow: '0 0 0 16px rgba(185,0,27,0.08), 0 0 0 32px rgba(185,0,27,0.04)',
                    animation: 'pulse-ring 2s ease-in-out infinite',
                }}>
                    <span style={{ fontSize: '52px' }}>{isSubscription ? '👑' : '⚡'}</span>
                </div>

                {/* Stars */}
                <div style={{ fontSize: '24px', marginBottom: '1rem', letterSpacing: '6px' }}>⭐⭐⭐</div>

                <h1 style={{
                    fontSize: '32px',
                    fontWeight: '900',
                    color: '#111',
                    margin: '0 0 0.75rem',
                    lineHeight: 1.2,
                    letterSpacing: '-0.5px',
                }}>
                    {isSubscription ? 'You\'re Premium!' : 'Listing Sponsored!'}
                </h1>

                <p style={{ fontSize: '16px', color: '#555', lineHeight: 1.6, margin: '0 0 0.75rem' }}>
                    {isSubscription
                        ? 'Your Premium plan is now active. Enjoy unlimited products, unlimited posts, and 50% off all sponsorships.'
                        : 'Your product is now featured across Tokoni. Sit back and watch your reach grow!'}
                </p>

                {isSubscription && (
                    <div style={{
                        background: 'linear-gradient(135deg, #B9001B, #FF4D6D)',
                        borderRadius: '14px',
                        padding: '1rem 1.5rem',
                        margin: '1.25rem 0',
                        textAlign: 'left',
                    }}>
                        <p style={{ color: '#FFD700', fontWeight: '800', fontSize: '13px', textTransform: 'uppercase', letterSpacing: '1px', margin: '0 0 6px' }}>What you unlocked</p>
                        {['Unlimited product listings', 'Unlimited posts per month', '50% off all sponsorships'].map(f => (
                            <div key={f} style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                                <span style={{ color: '#FFD700', fontSize: '14px' }}>✓</span>
                                <span style={{ color: '#FFF', fontSize: '14px', fontWeight: '600' }}>{f}</span>
                            </div>
                        ))}
                    </div>
                )}

                <button
                    onClick={handleContinue}
                    style={{
                        width: '100%',
                        padding: '1rem',
                        background: 'linear-gradient(135deg, #B9001B, #FF4D6D)',
                        color: '#FFF',
                        border: 'none',
                        borderRadius: '14px',
                        fontSize: '16px',
                        fontWeight: '700',
                        cursor: 'pointer',
                        boxShadow: '0 6px 20px rgba(185,0,27,0.3)',
                        marginBottom: '0.75rem',
                        transition: 'transform 0.15s',
                    }}
                    onMouseOver={e => (e.currentTarget.style.transform = 'scale(1.02)')}
                    onMouseOut={e => (e.currentTarget.style.transform = 'scale(1)')}
                >
                    {isSubscription ? 'Explore Your Premium Dashboard' : 'View Sponsorship Details'}
                </button>
            </div>

            <style>{`
                @keyframes pulse-ring {
                    0%, 100% { box-shadow: 0 0 0 16px rgba(185,0,27,0.08), 0 0 0 32px rgba(185,0,27,0.04); }
                    50% { box-shadow: 0 0 0 20px rgba(185,0,27,0.12), 0 0 0 40px rgba(185,0,27,0.06); }
                }
            `}</style>
        </div>
    );
}
