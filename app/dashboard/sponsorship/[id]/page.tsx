// app/dashboard/sponsorship/[id]/page.tsx
"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'nextjs-toploader/app';
import { useParams } from 'next/navigation';
import { useUser } from '@/context/UserContext';

const ArrowLeftIcon = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#111" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <line x1="19" y1="12" x2="5" y2="12"></line>
        <polyline points="12 19 5 12 12 5"></polyline>
    </svg>
);

function StatCard({ label, value, icon, color = '#B9001B' }: { label: string; value: string | number; icon: string; color?: string }) {
    return (
        <div style={{
            backgroundColor: '#FFFFFF',
            borderRadius: '14px',
            border: '1px solid #EDEDED',
            padding: '1.25rem',
            boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
            flex: 1,
            minWidth: '130px',
        }}>
            <div style={{ fontSize: '22px', marginBottom: '6px' }}>{icon}</div>
            <p style={{ fontSize: '22px', fontWeight: '800', color, margin: '0 0 2px' }}>{value}</p>
            <p style={{ fontSize: '12px', color: '#888', fontWeight: '600', margin: 0, textTransform: 'uppercase', letterSpacing: '0.4px' }}>{label}</p>
        </div>
    );
}

function SkeletonBlock({ height = 20, width = '100%', radius = 8 }: { height?: number; width?: string | number; radius?: number }) {
    return (
        <div style={{
            height,
            width,
            borderRadius: radius,
            backgroundColor: '#F3F4F6',
            animation: 'pulse 1.5s ease-in-out infinite',
        }} />
    );
}

function formatDate(iso?: string) {
    if (!iso) return '—';
    return new Date(iso).toLocaleDateString('en-NG', { year: 'numeric', month: 'long', day: 'numeric' });
}

function formatNaira(n: number) {
    return new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN', minimumFractionDigits: 0 }).format(n);
}

function daysLeft(endDate: string) {
    const diff = new Date(endDate).getTime() - Date.now();
    return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
}

export default function SponsorshipDetailPage() {
    const router = useRouter();
    const { id } = useParams<{ id: string }>();
    const { user, vendor } = useUser();

    const [sponsorship, setSponsorship] = useState<any>(null);
    const [product, setProduct] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const load = async () => {
            if (!id) return;
            try {
                const res = await fetch(`/api/sponsorships/${id}`);
                if (!res.ok) throw new Error('Sponsorship not found');
                const data = await res.json();
                setSponsorship(data.sponsorship);
                setProduct(data.product);
            } catch (err: any) {
                setError(err.message || 'Failed to load sponsorship');
            } finally {
                setLoading(false);
            }
        };
        load();
    }, [id]);

    const remaining = sponsorship?.endDate ? daysLeft(sponsorship.endDate) : 0;
    const totalDays = sponsorship?.duration === 'day' ? 1 : sponsorship?.duration === 'week' ? 7 : 30;
    const elapsed = totalDays - remaining;
    const progress = Math.min(100, Math.round((elapsed / totalDays) * 100));

    return (
        <div style={{ backgroundColor: '#F9FAFB', minHeight: '100vh', fontFamily: 'var(--font-body), sans-serif', padding: '2rem 1rem' }}>
            <div style={{ maxWidth: '720px', margin: '0 auto' }}>

                {/* Back */}
                <button
                    onClick={() => router.back()}
                    style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'none', border: 'none', cursor: 'pointer', color: '#555', fontSize: '14px', fontWeight: '600', marginBottom: '2rem', padding: 0 }}
                >
                    <ArrowLeftIcon />
                    Back
                </button>

                <h1 style={{ fontSize: '26px', fontWeight: '800', color: '#111', margin: '0 0 0.5rem' }}>Sponsorship Details</h1>
                <p style={{ fontSize: '14px', color: '#666', margin: '0 0 2rem' }}>Track the performance of your sponsored listing.</p>

                {error && (
                    <div style={{ backgroundColor: '#FFF0F1', border: '1px solid #FFD7DE', borderRadius: '12px', padding: '1rem 1.25rem', color: '#B9001B', marginBottom: '1.5rem' }}>
                        {error}
                    </div>
                )}

                {/* Product preview card */}
                <div style={{ backgroundColor: '#FFFFFF', borderRadius: '16px', border: '1px solid #EDEDED', padding: '1.25rem', marginBottom: '1.25rem', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
                    <p style={{ fontSize: '12px', fontWeight: '700', color: '#888', textTransform: 'uppercase', letterSpacing: '0.5px', margin: '0 0 0.75rem' }}>Sponsored Product</p>
                    {loading ? (
                        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                            <SkeletonBlock height={60} width={60} radius={10} />
                            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                <SkeletonBlock height={16} width="60%" />
                                <SkeletonBlock height={12} width="40%" />
                            </div>
                        </div>
                    ) : product ? (
                        <div style={{ display: 'flex', gap: '14px', alignItems: 'center' }}>
                            {product.images?.[0] && (
                                <img src={product.images[0]} alt={product.name} style={{ width: '64px', height: '64px', borderRadius: '10px', objectFit: 'cover', border: '1px solid #F3F4F6' }} />
                            )}
                            <div style={{ flex: 1 }}>
                                <p style={{ fontSize: '15px', fontWeight: '700', color: '#111', margin: '0 0 4px' }}>{product.name}</p>
                                <p style={{ fontSize: '13px', color: '#888', margin: '0 0 4px' }}>{product.category} · {formatNaira(product.price)}</p>
                                <span style={{ fontSize: '11px', fontWeight: '700', backgroundColor: '#FFF0F2', color: '#B9001B', padding: '2px 8px', borderRadius: '20px' }}>⚡ Sponsored</span>
                            </div>
                            <button
                                onClick={() => router.push(`/product/${product.$id}`)}
                                style={{ fontSize: '12px', fontWeight: '700', color: '#B9001B', background: 'none', border: 'none', cursor: 'pointer', padding: '4px 8px' }}
                            >
                                View →
                            </button>
                        </div>
                    ) : null}
                </div>

                {/* Sponsorship meta */}
                <div style={{ backgroundColor: '#FFFFFF', borderRadius: '16px', border: '1px solid #EDEDED', padding: '1.25rem', marginBottom: '1.25rem', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
                    <p style={{ fontSize: '12px', fontWeight: '700', color: '#888', textTransform: 'uppercase', letterSpacing: '0.5px', margin: '0 0 1rem' }}>Sponsorship Info</p>
                    {loading ? (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                            {[1, 2, 3].map(i => <SkeletonBlock key={i} height={14} />)}
                        </div>
                    ) : sponsorship ? (
                        <>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginBottom: '1rem' }}>
                                {[
                                    { label: 'Duration', value: sponsorship.duration === 'day' ? '1 Day' : sponsorship.duration === 'week' ? '1 Week' : '1 Month' },
                                    { label: 'Status', value: sponsorship.status === 'active' ? '🟢 Active' : '⚫ Ended' },
                                    { label: 'Start Date', value: formatDate(sponsorship.startDate) },
                                    { label: 'End Date', value: formatDate(sponsorship.endDate) },
                                    { label: 'ED-Library', value: sponsorship.interplatform ? '✓ Included' : '✗ Not included' },
                                    { label: 'Days Remaining', value: `${remaining} day${remaining !== 1 ? 's' : ''}` },
                                ].map(({ label, value }) => (
                                    <div key={label}>
                                        <p style={{ fontSize: '11px', fontWeight: '700', color: '#AAA', textTransform: 'uppercase', margin: '0 0 2px' }}>{label}</p>
                                        <p style={{ fontSize: '14px', fontWeight: '600', color: '#111', margin: 0 }}>{value}</p>
                                    </div>
                                ))}
                            </div>

                            {/* Progress bar */}
                            <div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                                    <span style={{ fontSize: '12px', fontWeight: '600', color: '#888' }}>Campaign progress</span>
                                    <span style={{ fontSize: '12px', fontWeight: '700', color: '#B9001B' }}>{progress}%</span>
                                </div>
                                <div style={{ height: '8px', backgroundColor: '#F3F4F6', borderRadius: '999px', overflow: 'hidden' }}>
                                    <div style={{ height: '100%', width: `${progress}%`, background: 'linear-gradient(90deg, #B9001B, #FF4D6D)', borderRadius: '999px', transition: 'width 0.8s ease' }} />
                                </div>
                            </div>
                        </>
                    ) : null}
                </div>

                {/* Analytics */}
                <p style={{ fontSize: '14px', fontWeight: '700', color: '#374151', margin: '0 0 0.75rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Analytics</p>
                {loading ? (
                    <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
                        {[1, 2, 3, 4].map(i => <SkeletonBlock key={i} height={90} width="calc(25% - 9px)" radius={14} />)}
                    </div>
                ) : (
                    <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', marginBottom: '1.5rem' }}>
                        <StatCard icon="👁️" label="Reach" value={(product?.views ?? 0).toLocaleString()} color="#B9001B" />
                        <StatCard icon="🖱️" label="Clicks" value={(product?.clicks ?? 0).toLocaleString()} color="#7C3AED" />
                        <StatCard icon="❤️" label="Likes" value={(product?.likes ?? 0).toLocaleString()} color="#EC4899" />
                        <StatCard icon="🔖" label="Saves" value="—" color="#059669" />
                    </div>
                )}

                {/* Renew button */}
                {sponsorship && remaining === 0 && (
                    <button
                        onClick={() => router.push(`/dashboard/product/sponsor?productId=${sponsorship.productId}`)}
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
                        }}
                    >
                        ⚡ Renew Sponsorship
                    </button>
                )}

            </div>
            <style>{`
                @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.5; } }
            `}</style>
        </div>
    );
}
