// app/dashboard/product/sponsor/page.tsx
"use client";

import React, { useState, useEffect, Suspense } from 'react';
import { useRouter } from 'nextjs-toploader/app';
import { useSearchParams } from 'next/navigation';
import { useUser } from '@/context/UserContext';
import { isVendorPremium, calculateSponsorshipPrice, SPONSORSHIP_PRICES, INTERPLATFORM_PRICES, SponsorshipDuration } from '@/lib/services/subscriptions.service';
import { getVendorProducts } from '@/lib/api/products';

const ArrowLeftIcon = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#111" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <line x1="19" y1="12" x2="5" y2="12"></line>
        <polyline points="12 19 5 12 12 5"></polyline>
    </svg>
);

const CrownIcon = () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#FFD700" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M2 20h20M5 20L2 8l5 4 5-6 5 6 5-4-3 12"></path>
    </svg>
);

const ZapIcon = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#B9001B" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon>
    </svg>
);

const duration_options: { value: SponsorshipDuration; label: string }[] = [
    { value: "day", label: "1 Day" },
    { value: "week", label: "1 Week" },
    { value: "month", label: "1 Month" },
];

function formatNaira(amount: number) {
    return new Intl.NumberFormat("en-NG", { style: "currency", currency: "NGN", minimumFractionDigits: 0 }).format(amount);
}

function SponsorProductForm() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const { user, vendor, loading } = useUser();

    const preselectedProductId = searchParams.get("productId") || "";
    const from = searchParams.get("from") || "dashboard";

    const [products, setProducts] = useState<any[]>([]);
    const [productsLoading, setProductsLoading] = useState(true);
    const [selectedProductId, setSelectedProductId] = useState(preselectedProductId);
    const [duration, setDuration] = useState<SponsorshipDuration>("day");
    const [interplatform, setInterplatform] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [errorMsg, setErrorMsg] = useState<string | null>(null);

    const isPremium = vendor ? isVendorPremium(vendor) : false;

    useEffect(() => {
        const load = async () => {
            if (!vendor?.$id) return;
            setProductsLoading(true);
            try {
                const res = await getVendorProducts(vendor.$id);
                setProducts(res);
                if (!preselectedProductId && res.length > 0) {
                    setSelectedProductId(res[0].$id);
                }
            } catch {
                /* no-op */
            } finally {
                setProductsLoading(false);
            }
        };
        load();
    }, [vendor?.$id]);

    const pricing = calculateSponsorshipPrice({ duration, interplatform, isPremium });

    const handleSubmit = async () => {
        if (!user || !vendor || !selectedProductId) return;
        setSubmitting(true);
        setErrorMsg(null);
        try {
            const res = await fetch("/api/payments/initialize", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    type: "sponsorship",
                    userId: user.$id,
                    userEmail: user.email,
                    productId: selectedProductId,
                    duration,
                    interplatform,
                    from: from || 'dashboard',
                }),
            });
            const data = await res.json();
            if (!res.ok || !data.checkoutUrl) {
                throw new Error(data.error || "Failed to initialize payment");
            }
            window.location.href = data.checkoutUrl;
        } catch (err: any) {
            setErrorMsg(err.message || "Something went wrong. Please try again.");
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) return null;

    const selectedProduct = products.find(p => p.$id === selectedProductId);

    return (
        <div style={{ backgroundColor: '#F9FAFB', minHeight: '100vh', fontFamily: 'var(--font-body), sans-serif', padding: '2rem 1rem' }}>
            <div style={{ maxWidth: '640px', margin: '0 auto' }}>

                {/* Back */}
                <button
                    onClick={() => router.push('/dashboard')}
                    style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'none', border: 'none', cursor: 'pointer', color: '#555', fontSize: '14px', fontWeight: '600', marginBottom: '2rem', padding: 0 }}
                >
                    <ArrowLeftIcon />
                    Back to Dashboard
                </button>

                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '0.5rem' }}>
                    <ZapIcon />
                    <h1 style={{ fontSize: '26px', fontWeight: '800', color: '#111', margin: 0 }}>Sponsor a Product</h1>
                </div>
                <p style={{ fontSize: '14px', color: '#666', margin: '0 0 2rem 0' }}>
                    Boost your product visibility. Featured listings appear across Tokoni{interplatform ? " and ED-Library" : ""}.
                </p>

                {isPremium && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', backgroundColor: '#FFF9FA', border: '1px solid #FFD7DE', borderRadius: '10px', padding: '0.75rem 1rem', marginBottom: '1.5rem' }}>
                        <CrownIcon />
                        <span style={{ fontSize: '13.5px', fontWeight: '700', color: '#B9001B' }}>Premium discount applied — 50% off base sponsorship price!</span>
                    </div>
                )}

                {errorMsg && (
                    <div style={{ backgroundColor: '#FFF0F1', border: '1px solid #FFCAD1', borderRadius: '10px', padding: '0.85rem 1.25rem', color: '#B9001B', fontSize: '13.5px', fontWeight: '600', marginBottom: '1.5rem' }}>
                        {errorMsg}
                    </div>
                )}

                {/* Product Selection */}
                <div style={{ backgroundColor: '#FFFFFF', borderRadius: '16px', border: '1px solid #EDEDED', padding: '1.5rem', marginBottom: '1.25rem', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
                    <h3 style={{ fontSize: '14px', fontWeight: '700', color: '#374151', margin: '0 0 1rem 0', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Select Product</h3>
                    {productsLoading ? (
                        <div style={{ height: '44px', backgroundColor: '#F3F4F6', borderRadius: '8px', animation: 'pulse 1.5s ease-in-out infinite' }} />
                    ) : products.length === 0 ? (
                        <p style={{ color: '#9CA3AF', fontSize: '14px' }}>No products found. Add a product first.</p>
                    ) : (
                        <select
                            value={selectedProductId}
                            onChange={(e) => setSelectedProductId(e.target.value)}
                            style={{ width: '100%', padding: '0.8rem 1rem', backgroundColor: '#F9FAFB', border: '1.5px solid #E5E7EB', borderRadius: '10px', fontSize: '14px', fontWeight: '600', color: '#111', outline: 'none', cursor: 'pointer' }}
                        >
                            {products.map(p => (
                                <option key={p.$id} value={p.$id}>{p.name} — {formatNaira(p.price)}</option>
                            ))}
                        </select>
                    )}
                    {selectedProduct && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginTop: '0.85rem', padding: '0.75rem', backgroundColor: '#F9FAFB', borderRadius: '8px' }}>
                            {selectedProduct.images?.[0] && (
                                <img src={selectedProduct.images[0]} alt="" style={{ width: '40px', height: '40px', borderRadius: '6px', objectFit: 'cover' }} />
                            )}
                            <div>
                                <p style={{ fontSize: '13px', fontWeight: '700', color: '#111', margin: '0 0 2px 0' }}>{selectedProduct.name}</p>
                                <p style={{ fontSize: '12px', color: '#888', margin: 0 }}>{selectedProduct.category} · Stock: {selectedProduct.stock}</p>
                            </div>
                        </div>
                    )}
                </div>

                {/* Duration Selection */}
                <div style={{ backgroundColor: '#FFFFFF', borderRadius: '16px', border: '1px solid #EDEDED', padding: '1.5rem', marginBottom: '1.25rem', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
                    <h3 style={{ fontSize: '14px', fontWeight: '700', color: '#374151', margin: '0 0 1rem 0', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Sponsorship Duration</h3>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.75rem' }}>
                        {duration_options.map(opt => {
                            const isSelected = duration === opt.value;
                            const basePrice = SPONSORSHIP_PRICES[opt.value];
                            const discount = isPremium ? Math.floor(basePrice * 0.5) : 0;
                            const discountedPrice = basePrice - discount;
                            return (
                                <button
                                    key={opt.value}
                                    onClick={() => setDuration(opt.value)}
                                    style={{
                                        padding: '1rem 0.5rem',
                                        borderRadius: '12px',
                                        border: isSelected ? '2px solid #B9001B' : '1.5px solid #E5E7EB',
                                        backgroundColor: isSelected ? '#FFF9FA' : '#FFFFFF',
                                        cursor: 'pointer',
                                        textAlign: 'center',
                                        transition: 'all 0.15s',
                                    }}
                                >
                                    <p style={{ fontSize: '14px', fontWeight: '700', color: isSelected ? '#B9001B' : '#111', margin: '0 0 4px 0' }}>{opt.label}</p>
                                    {isPremium && discount > 0 ? (
                                        <>
                                            <p style={{ fontSize: '11px', color: '#9CA3AF', textDecoration: 'line-through', margin: '0 0 2px 0' }}>{formatNaira(basePrice)}</p>
                                            <p style={{ fontSize: '13px', fontWeight: '800', color: '#B9001B', margin: 0 }}>{formatNaira(discountedPrice)}</p>
                                        </>
                                    ) : (
                                        <p style={{ fontSize: '13px', fontWeight: '800', color: isSelected ? '#B9001B' : '#555', margin: 0 }}>{formatNaira(basePrice)}</p>
                                    )}
                                </button>
                            );
                        })}
                    </div>
                </div>

                {/* Inter-platform Option */}
                <div
                    onClick={() => setInterplatform(!interplatform)}
                    style={{
                        backgroundColor: '#FFFFFF',
                        borderRadius: '16px',
                        border: interplatform ? '2px solid #B9001B' : '1.5px solid #EDEDED',
                        padding: '1.25rem 1.5rem',
                        marginBottom: '1.5rem',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        cursor: 'pointer',
                        boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
                        transition: 'all 0.15s',
                    }}
                >
                    <div>
                        <p style={{ fontSize: '14.5px', fontWeight: '700', color: '#111', margin: '0 0 4px 0' }}>🌐 Push to ED-Library</p>
                        <p style={{ fontSize: '13px', color: '#666', margin: '0 0 4px 0' }}>Reach students on the ED-Library platform too.</p>
                        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                            {duration_options.map(opt => (
                                <span key={opt.value} style={{ fontSize: '12px', color: '#888', fontWeight: '600' }}>
                                    {opt.label}: +{formatNaira(INTERPLATFORM_PRICES[opt.value])}
                                </span>
                            ))}
                        </div>
                    </div>
                    <div style={{
                        width: '22px',
                        height: '22px',
                        borderRadius: '6px',
                        border: interplatform ? '2px solid #B9001B' : '2px solid #D1D5DB',
                        backgroundColor: interplatform ? '#B9001B' : '#FFF',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0,
                        transition: 'all 0.15s',
                    }}>
                        {interplatform && (
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#FFF" strokeWidth="3">
                                <polyline points="20 6 9 17 4 12"></polyline>
                            </svg>
                        )}
                    </div>
                </div>

                {/* Price Summary */}
                <div style={{ backgroundColor: '#FFFFFF', borderRadius: '16px', border: '1px solid #EDEDED', padding: '1.5rem', marginBottom: '1.5rem', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
                    <h3 style={{ fontSize: '14px', fontWeight: '700', color: '#374151', margin: '0 0 1rem 0', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Price Summary</h3>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                        <span style={{ fontSize: '14px', color: '#555' }}>Base ({duration_options.find(d => d.value === duration)?.label})</span>
                        <div style={{ textAlign: 'right' }}>
                            {isPremium && pricing.discount > 0 && (
                                <span style={{ fontSize: '12px', color: '#9CA3AF', textDecoration: 'line-through', display: 'block' }}>{formatNaira(pricing.base)}</span>
                            )}
                            <span style={{ fontSize: '14px', fontWeight: '700', color: '#111' }}>{formatNaira(pricing.base - pricing.discount)}</span>
                        </div>
                    </div>
                    {isPremium && pricing.discount > 0 && (
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                            <span style={{ fontSize: '13px', color: '#059669', fontWeight: '600' }}>Premium discount (50%)</span>
                            <span style={{ fontSize: '13px', color: '#059669', fontWeight: '700' }}>-{formatNaira(pricing.discount)}</span>
                        </div>
                    )}
                    {interplatform && (
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                            <span style={{ fontSize: '14px', color: '#555' }}>ED-Library cross-post</span>
                            <span style={{ fontSize: '14px', fontWeight: '700', color: '#111' }}>+{formatNaira(pricing.interplatform)}</span>
                        </div>
                    )}
                    <div style={{ borderTop: '1px solid #F3F4F6', marginTop: '0.75rem', paddingTop: '0.75rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ fontSize: '15px', fontWeight: '700', color: '#111' }}>Total</span>
                        <span style={{ fontSize: '22px', fontWeight: '800', color: '#B9001B' }}>{formatNaira(pricing.total)}</span>
                    </div>
                </div>

                {/* Submit */}
                <button
                    onClick={handleSubmit}
                    disabled={submitting || !selectedProductId || products.length === 0}
                    style={{
                        width: '100%',
                        padding: '1rem',
                        background: 'linear-gradient(135deg, #B9001B 0%, #ff4d6d 100%)',
                        color: '#FFF',
                        border: 'none',
                        borderRadius: '14px',
                        fontSize: '15px',
                        fontWeight: '700',
                        cursor: (submitting || !selectedProductId) ? 'not-allowed' : 'pointer',
                        opacity: (submitting || !selectedProductId) ? 0.7 : 1,
                        boxShadow: '0 4px 16px rgba(185,0,27,0.3)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '10px',
                        transition: 'all 0.2s',
                    }}
                >
                    {submitting ? (
                        <>
                            <div style={{ width: '18px', height: '18px', border: '2px solid rgba(255,255,255,0.4)', borderTop: '2px solid #FFF', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
                            Redirecting to checkout...
                        </>
                    ) : (
                        `Pay ${formatNaira(pricing.total)} to Sponsor`
                    )}
                </button>
                <p style={{ fontSize: '12.5px', color: '#9CA3AF', textAlign: 'center', marginTop: '0.75rem' }}>
                    Secure checkout by Flutterwave. Your sponsorship activates immediately after payment.
                </p>

            </div>

            <style>{`
                @keyframes spin { to { transform: rotate(360deg); } }
                @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.5; } }
            `}</style>
        </div>
    );
}

export default function SponsorProductPage() {
    return (
        <Suspense fallback={
            <div style={{ backgroundColor: '#F9FAFB', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'var(--font-body), sans-serif' }}>
                <div style={{ textAlign: 'center', color: '#666' }}>
                    <div style={{ width: '40px', height: '40px', border: '3px solid rgba(185,0,27,0.1)', borderTop: '3px solid #B9001B', borderRadius: '50%', animation: 'spin 1s linear infinite', margin: '0 auto 1rem' }} />
                    <p style={{ fontSize: '14px', fontWeight: '600' }}>Loading sponsorship details...</p>
                </div>
            </div>
        }>
            <SponsorProductForm />
        </Suspense>
    );
}
