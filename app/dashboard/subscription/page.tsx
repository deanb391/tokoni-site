// app/dashboard/subscription/page.tsx
"use client";

import React, { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useUser } from '@/context/UserContext';
import { isVendorPremium, SUBSCRIPTION_PRICE_NGN, FREE_TIER_LIMITS, TokoniPayment } from '@/lib/services/subscriptions.service';

const CheckIcon = ({ color = "#059669" }) => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="20 6 9 17 4 12"></polyline>
    </svg>
);

const XIcon = ({ color = "#9CA3AF" }) => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <line x1="18" y1="6" x2="6" y2="18"></line>
        <line x1="6" y1="6" x2="18" y2="18"></line>
    </svg>
);

const CrownIcon = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#FFD700" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M2 20h20M5 20L2 8l5 4 5-6 5 6 5-4-3 12"></path>
    </svg>
);

const ArrowLeftIcon = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#111" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <line x1="19" y1="12" x2="5" y2="12"></line>
        <polyline points="12 19 5 12 12 5"></polyline>
    </svg>
);

const features = [
    { label: "Products per month", free: "15 max", premium: "Unlimited" },
    { label: "Posts per month", free: "20 max", premium: "Unlimited" },
    { label: "Product Sponsorships", free: "Full price", premium: "50% off base price" },
    { label: "ED-Library Cross-posting", free: true, premium: true },
    { label: "Analytics Dashboard", free: true, premium: true },
    { label: "Direct Messaging", free: true, premium: true },
];

function formatDate(iso?: string) {
    if (!iso) return "—";
    return new Date(iso).toLocaleDateString("en-NG", {
        year: "numeric", month: "long", day: "numeric"
    });
}

function formatNaira(amount: number) {
    return new Intl.NumberFormat("en-NG", { style: "currency", currency: "NGN", minimumFractionDigits: 0 }).format(amount);
}

function SubscriptionForm() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const { user, vendor, loading, refetchVendor } = useUser();

    const [payments, setPayments] = useState<TokoniPayment[]>([]);
    const [paymentsLoading, setPaymentsLoading] = useState(false);
    const [subscribing, setSubscribing] = useState(false);
    const [successMsg, setSuccessMsg] = useState<string | null>(null);
    const [errorMsg, setErrorMsg] = useState<string | null>(null);

    const isPremium = vendor ? isVendorPremium(vendor) : false;

    // Show success/failure based on redirect from payment verify
    useEffect(() => {
        const payment = searchParams.get("payment");
        const type = searchParams.get("type");
        if (payment === "success" && type === "subscription") {
            setSuccessMsg("🎉 Premium plan activated! Enjoy unlimited access.");
            refetchVendor();
        } else if (payment === "failed") {
            setErrorMsg("Payment failed or was cancelled. Please try again.");
        }
    }, [searchParams]);

    // Load billing history
    useEffect(() => {
        const loadPayments = async () => {
            if (!vendor?.$id) return;
            setPaymentsLoading(true);
            try {
                const res = await fetch(`/api/payments/history?vendorId=${vendor.$id}`);
                if (res.ok) {
                    const data = await res.json();
                    setPayments(data.payments || []);
                }
            } catch (err) {
                console.error("Failed to load payment history:", err);
            } finally {
                setPaymentsLoading(false);
            }
        };
        loadPayments();
    }, [vendor?.$id]);

    const handleUpgrade = async () => {
        if (!user || !vendor) return;
        setSubscribing(true);
        setErrorMsg(null);
        try {
            const res = await fetch("/api/payments/initialize", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    type: "subscription",
                    userId: user.$id,
                    userEmail: user.email,
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
            setSubscribing(false);
        }
    };

    if (loading) return null;

    // Trial / plan expiry display
    const trialEnd = vendor?.trialEndsAt ? new Date(vendor.trialEndsAt) : null;
    const planEnd = vendor?.planEndsAt ? new Date(vendor.planEndsAt) : null;
    const now = new Date();
    const isInTrial = trialEnd && now < trialEnd;
    const hasPaidPlan = vendor?.plan === "premium" && planEnd && now < planEnd;

    return (
        <div style={{ backgroundColor: '#F9FAFB', minHeight: '100vh', fontFamily: 'var(--font-body), sans-serif', padding: '2rem 1rem' }}>
            <div style={{ maxWidth: '760px', margin: '0 auto' }}>

                {/* Back */}
                <button
                    onClick={() => router.push('/dashboard')}
                    style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'none', border: 'none', cursor: 'pointer', color: '#555', fontSize: '14px', fontWeight: '600', marginBottom: '2rem', padding: 0 }}
                >
                    <ArrowLeftIcon />
                    Back to Dashboard
                </button>

                <h1 style={{ fontSize: '28px', fontWeight: '800', color: '#111', margin: '0 0 0.5rem 0' }}>Subscription & Billing</h1>
                <p style={{ fontSize: '15px', color: '#666', margin: '0 0 2rem 0' }}>Manage your Tokoni vendor plan.</p>

                {successMsg && (
                    <div style={{ backgroundColor: '#ECFDF5', border: '1px solid #A7F3D0', borderRadius: '12px', padding: '1rem 1.25rem', color: '#065F46', fontSize: '14px', fontWeight: '600', marginBottom: '1.5rem' }}>
                        {successMsg}
                    </div>
                )}
                {errorMsg && (
                    <div style={{ backgroundColor: '#FFF0F1', border: '1px solid #FFCAD1', borderRadius: '12px', padding: '1rem 1.25rem', color: '#B9001B', fontSize: '14px', fontWeight: '600', marginBottom: '1.5rem' }}>
                        {errorMsg}
                    </div>
                )}

                {/* Current Plan Banner */}
                <div style={{
                    borderRadius: '16px',
                    padding: '1.5rem',
                    marginBottom: '2rem',
                    background: isPremium
                        ? 'linear-gradient(135deg, #B9001B 0%, #ff4d6d 100%)'
                        : '#FFFFFF',
                    border: isPremium ? 'none' : '1px solid #EDEDED',
                    boxShadow: isPremium ? '0 8px 24px rgba(185,0,27,0.2)' : '0 2px 8px rgba(0,0,0,0.04)',
                    position: 'relative',
                    overflow: 'hidden',
                }}>
                    {isPremium && (
                        <>
                            <div style={{ position: 'absolute', top: '-30px', right: '-30px', width: '120px', height: '120px', borderRadius: '50%', backgroundColor: 'rgba(255,255,255,0.08)' }} />
                            <div style={{ position: 'absolute', bottom: '-40px', left: '40%', width: '100px', height: '100px', borderRadius: '50%', backgroundColor: 'rgba(255,255,255,0.05)' }} />
                        </>
                    )}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '1rem' }}>
                        {isPremium && <CrownIcon />}
                        <div>
                            <p style={{ fontSize: '13px', fontWeight: '600', color: isPremium ? 'rgba(255,255,255,0.75)' : '#888', margin: '0 0 2px 0' }}>Current Plan</p>
                            <h2 style={{ fontSize: '22px', fontWeight: '800', color: isPremium ? '#FFF' : '#111', margin: 0 }}>
                                {isPremium ? 'Premium' : 'Free'}
                            </h2>
                        </div>
                    </div>

                    {isInTrial && (
                        <div style={{ backgroundColor: 'rgba(255,255,255,0.15)', borderRadius: '8px', padding: '0.5rem 0.85rem', display: 'inline-block' }}>
                            <span style={{ fontSize: '13px', color: '#FFD700', fontWeight: '700' }}>
                                🎁 Free Trial — expires {formatDate(vendor?.trialEndsAt)}
                            </span>
                        </div>
                    )}
                    {hasPaidPlan && (
                        <div style={{ backgroundColor: 'rgba(255,255,255,0.15)', borderRadius: '8px', padding: '0.5rem 0.85rem', display: 'inline-block' }}>
                            <span style={{ fontSize: '13px', color: '#FFF', fontWeight: '600' }}>
                                Active until {formatDate(vendor?.planEndsAt)}
                            </span>
                        </div>
                    )}
                    {!isPremium && (
                        <p style={{ fontSize: '14px', color: '#666', margin: 0 }}>
                            You are on the Free plan. Upgrade to unlock unlimited access.
                        </p>
                    )}
                </div>

                {/* Plan Comparison */}
                <div style={{ backgroundColor: '#FFFFFF', borderRadius: '16px', border: '1px solid #EDEDED', overflow: 'hidden', marginBottom: '2rem', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', borderBottom: '1px solid #F3F4F6' }}>
                        <div style={{ padding: '1.25rem 1rem', fontSize: '13px', fontWeight: '700', color: '#888', textTransform: 'uppercase' }}>Feature</div>
                        <div style={{ padding: '1.25rem 1rem', fontSize: '13px', fontWeight: '700', color: '#888', textAlign: 'center', textTransform: 'uppercase' }}>Free</div>
                        <div style={{ padding: '1.25rem 1rem', fontSize: '13px', fontWeight: '800', color: '#B9001B', textAlign: 'center', textTransform: 'uppercase', background: '#FFF9FA' }}>Premium</div>
                    </div>
                    {features.map((f, i) => (
                        <div key={i} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', borderBottom: i < features.length - 1 ? '1px solid #F9FAFB' : 'none' }}>
                            <div style={{ padding: '1rem', fontSize: '14px', fontWeight: '500', color: '#374151' }}>{f.label}</div>
                            <div style={{ padding: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                {typeof f.free === 'boolean'
                                    ? (f.free ? <CheckIcon /> : <XIcon />)
                                    : <span style={{ fontSize: '13px', color: '#6B7280', fontWeight: '600' }}>{f.free}</span>
                                }
                            </div>
                            <div style={{ padding: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#FFF9FA' }}>
                                {typeof f.premium === 'boolean'
                                    ? (f.premium ? <CheckIcon color="#B9001B" /> : <XIcon />)
                                    : <span style={{ fontSize: '13px', color: '#B9001B', fontWeight: '700' }}>{f.premium}</span>
                                }
                            </div>
                        </div>
                    ))}

                    {/* Pricing footer */}
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', backgroundColor: '#FAFAFA', borderTop: '1px solid #EDEDED' }}>
                        <div style={{ padding: '1.25rem 1rem' }} />
                        <div style={{ padding: '1.25rem 1rem', textAlign: 'center' }}>
                            <span style={{ fontSize: '20px', fontWeight: '800', color: '#111' }}>₦0</span>
                            <span style={{ fontSize: '12px', color: '#888', display: 'block' }}>Forever free</span>
                        </div>
                        <div style={{ padding: '1.25rem 1rem', textAlign: 'center', background: '#FFF9FA' }}>
                            <span style={{ fontSize: '20px', fontWeight: '800', color: '#B9001B' }}>{formatNaira(SUBSCRIPTION_PRICE_NGN)}</span>
                            <span style={{ fontSize: '12px', color: '#888', display: 'block' }}>per month</span>
                        </div>
                    </div>
                </div>

                {/* CTA */}
                {!isPremium && (
                    <div style={{ marginBottom: '2rem', textAlign: 'center' }}>
                        <button
                            onClick={handleUpgrade}
                            disabled={subscribing}
                            style={{
                                padding: '0.9rem 3rem',
                                background: 'linear-gradient(135deg, #B9001B 0%, #ff4d6d 100%)',
                                color: '#FFF',
                                border: 'none',
                                borderRadius: '30px',
                                fontSize: '16px',
                                fontWeight: '700',
                                cursor: subscribing ? 'not-allowed' : 'pointer',
                                opacity: subscribing ? 0.7 : 1,
                                boxShadow: '0 4px 16px rgba(185,0,27,0.3)',
                                transition: 'all 0.2s',
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '8px',
                            }}
                        >
                            {subscribing ? (
                                <>
                                    <div style={{ width: '18px', height: '18px', border: '2px solid rgba(255,255,255,0.4)', borderTop: '2px solid #FFF', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
                                    Redirecting to checkout...
                                </>
                            ) : (
                                <><CrownIcon /> Upgrade to Premium — {formatNaira(SUBSCRIPTION_PRICE_NGN)}/mo</>
                            )}
                        </button>
                        <p style={{ fontSize: '13px', color: '#888', marginTop: '0.75rem' }}>Secure checkout powered by Flutterwave. Cancel anytime.</p>
                    </div>
                )}
                {isPremium && (
                    <div style={{ marginBottom: '2rem', backgroundColor: '#ECFDF5', border: '1px solid #A7F3D0', borderRadius: '12px', padding: '1rem 1.25rem', textAlign: 'center' }}>
                        <span style={{ fontSize: '14px', fontWeight: '600', color: '#065F46' }}>
                            ✓ You're on Premium. Your plan renews automatically.
                        </span>
                    </div>
                )}

                {/* Billing History */}
                <div style={{ backgroundColor: '#FFFFFF', borderRadius: '16px', border: '1px solid #EDEDED', overflow: 'hidden', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
                    <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid #F3F4F6' }}>
                        <h3 style={{ fontSize: '16px', fontWeight: '700', color: '#111', margin: 0 }}>Billing History</h3>
                    </div>
                    {paymentsLoading ? (
                        <div style={{ padding: '3rem', display: 'flex', justifyContent: 'center' }}>
                            <div style={{ width: '28px', height: '28px', border: '3px solid #E5E7EB', borderTop: '3px solid #B9001B', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
                        </div>
                    ) : payments.length === 0 ? (
                        <div style={{ padding: '3rem', textAlign: 'center', color: '#9CA3AF', fontSize: '14px' }}>
                            No billing history yet.
                        </div>
                    ) : (
                        payments.map((p) => (
                            <div key={p.$id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem 1.5rem', borderBottom: '1px solid #F9FAFB' }}>
                                <div>
                                    <p style={{ fontSize: '14px', fontWeight: '600', color: '#111', margin: '0 0 2px 0' }}>{p.description}</p>
                                    <p style={{ fontSize: '12px', color: '#9CA3AF', margin: 0 }}>{formatDate(p.$createdAt)}</p>
                                </div>
                                <div style={{ textAlign: 'right' }}>
                                    <p style={{ fontSize: '14px', fontWeight: '700', color: '#111', margin: '0 0 2px 0' }}>{formatNaira(p.amount)}</p>
                                    <span style={{
                                        fontSize: '11px', fontWeight: '700',
                                        color: p.status === 'successful' ? '#059669' : p.status === 'pending' ? '#D97706' : '#EF4444',
                                        backgroundColor: p.status === 'successful' ? '#ECFDF5' : p.status === 'pending' ? '#FEF3C7' : '#FEF2F2',
                                        padding: '2px 6px', borderRadius: '4px', textTransform: 'uppercase'
                                    }}>
                                        {p.status}
                                    </span>
                                </div>
                            </div>
                        ))
                    )}
                </div>

            </div>

            <style jsx global>{`
                @keyframes spin { to { transform: rotate(360deg); } }
            `}</style>
        </div>
    );
}

export default function SubscriptionPage() {
    return (
        <Suspense fallback={
            <div style={{ backgroundColor: '#F9FAFB', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'var(--font-body), sans-serif' }}>
                <div style={{ textAlign: 'center', color: '#666' }}>
                    <div style={{ width: '40px', height: '40px', border: '3px solid rgba(185,0,27,0.1)', borderTop: '3px solid #B9001B', borderRadius: '50%', animation: 'spin 1s linear infinite', margin: '0 auto 1rem' }} />
                    <p style={{ fontSize: '14px', fontWeight: '600' }}>Loading subscription details...</p>
                </div>
            </div>
        }>
            <SubscriptionForm />
        </Suspense>
    );
}
