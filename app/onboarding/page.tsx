// app/onboarding/page.tsx
"use client";

import React, { useState, useEffect, useRef } from 'react';
import logoImg from "@/assets/images/tokoni_logo.png";
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useUser } from '@/context/UserContext';
import { createVendor } from '@/lib/api/vendors';
import { uploadToServer } from '@/lib/upload';

// --- Inline SVG Icons ---
const BackArrowIcon = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#111" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <line x1="19" y1="12" x2="5" y2="12"></line>
        <polyline points="12 19 5 12 12 5"></polyline>
    </svg>
);

const CloseIcon = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#111" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <line x1="18" y1="6" x2="6" y2="18"></line>
        <line x1="6" y1="6" x2="18" y2="18"></line>
    </svg>
);

const ImageIcon = () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#666" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
        <circle cx="8.5" cy="8.5" r="1.5"></circle>
        <polyline points="21 15 16 10 5 21"></polyline>
    </svg>
);

const CameraPlusIcon = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#666" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"></path>
        <circle cx="12" cy="13" r="4"></circle>
        <line x1="18" y1="10" x2="18" y2="10.01"></line>
    </svg>
);

const StorefrontIcon = () => (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#111" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
        <polyline points="9 22 9 12 15 12 15 22"></polyline>
    </svg>
);

const LockIcon = () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#666" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
        <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
    </svg>
);

const ChevronDownIcon = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#111" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="6 9 12 15 18 9"></polyline>
    </svg>
);

const SearchIcon = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#666" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="11" cy="11" r="8"></circle>
        <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
    </svg>
);

const MapPinIcon = ({ color = "#666" }) => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
        <circle cx="12" cy="10" r="3"></circle>
    </svg>
);

const SuccessCheckIcon = () => (
    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#B9001B" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
        <polyline points="22 4 12 14.01 9 11.01"></polyline>
    </svg>
);

// --- Category SVGs ---
const CatFashion = () => <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 4v4m0 0l-5 4v8h10v-8l-5-4z"></path></svg>;
const CatBeauty = () => <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"></circle><path d="M8 14s1.5 2 4 2 4-2 4-2"></path><line x1="9" y1="9" x2="9.01" y2="9"></line><line x1="15" y1="9" x2="15.01" y2="9"></line></svg>;
const CatElectronics = () => <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="3" width="20" height="14" rx="2" ry="2"></rect><line x1="8" y1="21" x2="16" y2="21"></line><line x1="12" y1="17" x2="12" y2="21"></line></svg>;
const CatSports = () => <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"></circle><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path><path d="M2 12h20"></path></svg>;
const CatFood = () => <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M11 20H3v-8a8 8 0 0 1 16 0v8h-8z"></path><line x1="11" y1="4" x2="11" y2="12"></line><line x1="15" y1="4" x2="15" y2="12"></line><line x1="7" y1="4" x2="7" y2="12"></line></svg>;
const CatFurniture = () => <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="4" y="6" width="16" height="12" rx="2"></rect><path d="M2 14h20"></path><path d="M6 18v2"></path><path d="M18 18v2"></path></svg>;
const CatHealth = () => <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path></svg>;
const CatPhones = () => <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="5" y="2" width="14" height="20" rx="2" ry="2"></rect><line x1="12" y1="18" x2="12.01" y2="18"></line></svg>;
const CatGaming = () => <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="6" width="20" height="12" rx="2"></rect><path d="M6 12h4"></path><path d="M8 10v4"></path><line x1="15" y1="13" x2="15.01" y2="13"></line><line x1="18" y1="11" x2="18.01" y2="11"></line></svg>;
const CatBooks = () => <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path></svg>;
const CatArtCrafts = () => <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z"></path><path d="M7.5 10.5C8.32843 10.5 9 9.82843 9 9C9 8.17157 8.32843 7.5 7.5 7.5C6.67157 7.5 6 8.17157 6 9C6 9.82843 6.67157 10.5 7.5 10.5Z"></path><path d="M11.5 7.5C12.3284 7.5 13 6.82843 13 6C13 5.17157 12.3284 4.5 11.5 4.5C10.6716 4.5 10 5.17157 10 6C10 6.82843 10.6716 7.5 11.5 7.5Z"></path><path d="M16.5 10.5C17.3284 10.5 18 9.82843 18 9C18 8.17157 17.3284 7.5 16.5 7.5C15.6716 7.5 15 8.17157 15 9C15 9.82843 15.6716 10.5 16.5 10.5Z"></path><path d="M6 14C6 14 8 18 12 18C16 18 18 14 18 14"></path></svg>;
const CatAutomotive = () => <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="11" width="20" height="8" rx="2"></rect><path d="M4 11V7a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v4"></path><circle cx="6.5" cy="19.5" r="2.5"></circle><circle cx="17.5" cy="19.5" r="2.5"></circle></svg>;
const CatJewelry = () => <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 2l3 6H9l3-6z"></path><circle cx="12" cy="14" r="6"></circle><circle cx="12" cy="14" r="2"></circle></svg>;
const CatHomeDecor = () => <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path><polyline points="9 22 9 12 15 12 15 22"></polyline></svg>;
const CatToys = () => <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20z"></path><circle cx="12" cy="12" r="3"></circle><path d="M12 2v7M12 15v7M2 12h7M15 12h7"></path></svg>;
const CatPets = () => <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="4.5" cy="9.5" r="2.5"></circle><circle cx="9.5" cy="5.5" r="2.5"></circle><circle cx="14.5" cy="5.5" r="2.5"></circle><circle cx="19.5" cy="9.5" r="2.5"></circle><path d="M12 12c-3.5 0-6 2.5-6 6a4 4 0 0 0 8 0 4 4 0 0 0 4 0c0-3.5-2.5-6-6-6z"></path></svg>;

export default function VendorOnboardingFlow() {
    const router = useRouter();
    const { user, refreshUser } = useUser();

    const [step, setStep] = useState(1);
    const [isMobile, setIsMobile] = useState(false);
    const [mounted, setMounted] = useState(false);

    // Form inputs state
    const [businessName, setBusinessName] = useState('');
    const [tagline, setTagline] = useState('');
    const [coverImage, setCoverImage] = useState('');
    const [logoImage, setLogoImage] = useState('');
    const [phoneNumber, setPhoneNumber] = useState('');
    const [countryCode, setCountryCode] = useState('+234');
    const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
    const [country, setCountry] = useState('Nigeria');
    const [state, setState] = useState('');
    const [address, setAddress] = useState('');

    // Loader & error states
    const [uploadingCover, setUploadingCover] = useState(false);
    const [uploadingLogo, setUploadingLogo] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // File input refs
    const coverInputRef = useRef<HTMLInputElement | null>(null);
    const logoInputRef = useRef<HTMLInputElement | null>(null);

    useEffect(() => {
        setMounted(true);
        const handleResize = () => setIsMobile(window.innerWidth < 768);
        handleResize();
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const mobile = mounted ? isMobile : false;

    const nextStep = () => {
        setError(null);
        if (step === 1) {
            if (!businessName) {
                setError('Business Name is required.');
                return;
            }
        }
        if (step === 2) {
            if (!phoneNumber) {
                setError('Phone Number is required.');
                return;
            }
        }
        if (step === 3) {
            if (selectedCategories.length === 0) {
                setError('Please select at least one category.');
                return;
            }
        }
        if (step === 4) {
            if (!country || !state || !address) {
                setError('Please fill in all location details.');
                return;
            }
            // Trigger submit on Step 4 next
            handleSubmit();
            return;
        }

        if (step < 5) setStep(step + 1);
    };

    const prevStep = () => {
        setError(null);
        if (step > 1) setStep(step - 1);
    };

    // File upload handlers
    const handleCoverImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setUploadingCover(true);
        setError(null);

        try {
            const url = await uploadToServer(file, "vendors/cover", "image");
            setCoverImage(url);
        } catch (err: any) {
            console.error("Cover image upload failed:", err);
            setError(err.message || "Failed to upload cover image.");
        } finally {
            setUploadingCover(false);
        }
    };

    const handleLogoImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setUploadingLogo(true);
        setError(null);

        try {
            const url = await uploadToServer(file, "vendors/logo", "image");
            setLogoImage(url);
        } catch (err: any) {
            console.error("Logo image upload failed:", err);
            setError(err.message || "Failed to upload logo image.");
        } finally {
            setUploadingLogo(false);
        }
    };

    const handleSubmit = async () => {
        if (!user?.$id) {
            setError("User is not authenticated. Please log in.");
            return;
        }

        setSubmitting(true);
        setError(null);

        try {
            const draft = {
                businessName,
                tagline,
                coverImage,
                logoImage,
                phoneNumber,
                countryCode,
                category: selectedCategories,
                country,
                state,
                address,
            };

            await createVendor(draft, user.$id);
            await refreshUser();
            setStep(5); // Show success screen
        } catch (err: any) {
            console.error("Vendor onboarding failed:", err);
            setError(err.message || "Failed to submit vendor profile. Please try again.");
        } finally {
            setSubmitting(false);
        }
    };

    // Reusable Input Styles
    const inputStyle: React.CSSProperties = {
        width: '100%',
        padding: '0.85rem 1rem',
        backgroundColor: '#F5F5F5',
        border: '1px solid #EAEAEA',
        borderRadius: '8px',
        fontSize: '14px',
        color: '#111',
        outline: 'none',
        boxSizing: 'border-box'
    };

    const labelStyle: React.CSSProperties = {
        display: 'block',
        fontSize: '13.5px',
        fontWeight: '600',
        color: '#111',
        marginBottom: '8px'
    };

    // Helper for Progress Bar segments
    const renderProgress = (total: number, active: number, variant: string = 'default') => {
        return (
            <div style={{ display: 'flex', gap: '8px', width: variant === 'wide' ? '100%' : '300px', margin: '0 auto 2rem' }}>
                {[...Array(total)].map((_, i) => (
                    <div
                        key={i}
                        style={{
                            height: '4px',
                            flex: 1,
                            backgroundColor: i < active ? '#B9001B' : '#E5E7EB',
                            borderRadius: '2px',
                            transition: 'background-color 0.3s ease'
                        }}
                    />
                ))}
            </div>
        );
    };

    // CATEGORIES DATA for Step 3
    const categories = [
        { name: 'Fashion', icon: CatFashion },
        { name: 'Beauty', icon: CatBeauty },
        { name: 'Electronics', icon: CatElectronics },
        { name: 'Sports', icon: CatSports },
        { name: 'Food', icon: CatFood },
        { name: 'Furniture', icon: CatFurniture },
        { name: 'Health', icon: CatHealth },
        { name: 'Phones', icon: CatPhones },
        { name: 'Gaming', icon: CatGaming },
        { name: 'Books', icon: CatBooks },
        { name: 'Art & Crafts', icon: CatArtCrafts },
        { name: 'Automotive', icon: CatAutomotive },
        { name: 'Jewelry', icon: CatJewelry },
        { name: 'Home Decor', icon: CatHomeDecor },
        { name: 'Toys & Hobbies', icon: CatToys },
        { name: 'Pets Supplies', icon: CatPets }
    ];

    if (submitting) {
        return (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', backgroundColor: '#FAFAFA' }}>
                <div style={{ width: '40px', height: '40px', border: '3px solid #E5E7EB', borderTop: '3px solid #B9001B', borderRadius: '50%', animation: 'spin 1s linear infinite', marginBottom: '1.5rem' }}></div>
                <p style={{ color: '#555', fontSize: '15px', fontWeight: '500' }}>Creating your vendor storefront...</p>
                <style jsx>{`
                    @keyframes spin {
                        to { transform: rotate(360deg); }
                    }
                `}</style>
            </div>
        );
    }

    return (
        <div style={{ backgroundColor: '#FAFAFA', minHeight: '100vh', fontFamily: 'var(--font-body), sans-serif', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>

            {/* ================= GLOBAL HEADER ================= */}
            <header
                style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: mobile ? '1rem' : '1.5rem 3rem',
                    backgroundColor: '#FAFAFA',
                    zIndex: 10
                }}
            >
                <div style={{ width: '80px', display: 'flex', alignItems: 'center' }}>
                    {step > 1 && step < 5 && (
                        <button onClick={prevStep} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>
                            <BackArrowIcon />
                        </button>
                    )}
                </div>

                <Image src={logoImg} alt="Tokoni Logo" height={32} style={{ objectFit: 'contain', width: 'auto' }} priority />

                <div style={{ width: '100px', display: 'flex', justifyContent: 'flex-end', fontSize: '14px', color: '#666' }}>
                    {step < 5 ? (
                        <span><strong style={{ color: '#B9001B' }}>{step}</strong> of 5</span>
                    ) : (
                        <span>Done</span>
                    )}
                </div>
            </header>

            {/* ================= SLIDING TRACK ================= */}
            <div style={{ flex: 1, position: 'relative', width: '100%' }}>
                <div
                    style={{
                        display: 'flex',
                        width: '500%',
                        transform: `translateX(-${(step - 1) * 20}%)`,
                        transition: 'transform 0.5s cubic-bezier(0.4, 0.0, 0.2, 1)',
                        alignItems: 'flex-start',
                        height: '100%'
                    }}
                >

                    {/* ================= STEP 1: Business Profile Setup ================= */}
                    <div style={{ width: '20%', padding: mobile ? '0 1rem 2rem' : '0 2rem 3rem', boxSizing: 'border-box' }}>
                        <div style={{ maxWidth: '600px', margin: '0 auto', textAlign: 'center' }}>
                            <h1 style={{ fontSize: '32px', fontWeight: '700', color: '#111', margin: '0 0 0.5rem 0' }}>Business Profile Setup</h1>
                            <p style={{ fontSize: '15px', color: '#666', margin: '0 0 2rem 0', lineHeight: '1.5' }}>
                                Let's create the visual identity for your marketplace<br />storefront. This is what customers will see first.
                            </p>

                            {renderProgress(5, 1)}

                            {error && (
                                <div style={{ backgroundColor: '#FFF0F1', border: '1px solid #FFCAD1', borderRadius: '10px', padding: '0.85rem 1.25rem', color: '#B9001B', fontSize: '13.5px', fontWeight: '600', marginBottom: '1.5rem', textAlign: 'left' }}>
                                    {error}
                                </div>
                            )}

                            <div style={{ backgroundColor: '#FFFFFF', borderRadius: '16px', padding: mobile ? '1.5rem' : '2.5rem', boxShadow: '0 4px 24px rgba(0,0,0,0.02)', textAlign: 'left' }}>

                                <h3 style={{ fontSize: '14px', fontWeight: '600', color: '#111', margin: '0 0 1rem 0' }}>Storefront Visuals</h3>

                                {/* Upload Areas */}
                                <div style={{ position: 'relative', marginBottom: '2.5rem' }}>
                                    {/* Cover Upload */}
                                    <div
                                        onClick={() => coverInputRef.current?.click()}
                                        style={{ height: '160px', border: '2px dashed #ECA1A6', borderRadius: '8px', backgroundColor: '#FFFDFD', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', overflow: 'hidden', position: 'relative' }}
                                    >
                                        {uploadingCover ? (
                                            <div style={{ width: '24px', height: '24px', border: '2px solid #E5E7EB', borderTop: '2px solid #B9001B', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }}></div>
                                        ) : coverImage ? (
                                            <img src={coverImage} alt="Cover image" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                        ) : (
                                            <>
                                                <ImageIcon />
                                                <p style={{ fontSize: '14px', fontWeight: '500', color: '#111', margin: '0.5rem 0 0.2rem 0' }}>Upload Cover Image</p>
                                                <p style={{ fontSize: '12px', color: '#888', margin: 0 }}>Recommended: 1200 x 400px (JPG/PNG)</p>
                                            </>
                                        )}
                                    </div>
                                    <input
                                        ref={coverInputRef}
                                        type="file"
                                        accept="image/*"
                                        className="hidden"
                                        style={{ display: 'none' }}
                                        onChange={handleCoverImageChange}
                                    />

                                    {/* Logo Upload Circle */}
                                    <div
                                        onClick={() => logoInputRef.current?.click()}
                                        style={{ position: 'absolute', bottom: '-25px', left: '2rem', width: '80px', height: '80px', borderRadius: '50%', border: '2px dashed #ECA1A6', backgroundColor: '#FFFDFD', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', overflow: 'hidden', zIndex: 5 }}
                                    >
                                        {uploadingLogo ? (
                                            <div style={{ width: '20px', height: '20px', border: '2px solid #E5E7EB', borderTop: '2px solid #B9001B', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }}></div>
                                        ) : logoImage ? (
                                            <img src={logoImage} alt="Store logo" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                        ) : (
                                            <CameraPlusIcon />
                                        )}
                                        <div style={{ position: 'absolute', bottom: '-2px', right: '-2px', width: '24px', height: '24px', backgroundColor: '#F3F4F6', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '2px solid #FFF' }}>
                                            <StorefrontIcon />
                                        </div>
                                    </div>
                                    <input
                                        ref={logoInputRef}
                                        type="file"
                                        accept="image/*"
                                        className="hidden"
                                        style={{ display: 'none' }}
                                        onChange={handleLogoImageChange}
                                    />
                                </div>

                                {/* Form Fields */}
                                <div style={{ marginBottom: '1.5rem' }}>
                                    <label style={labelStyle}>Business Name <span style={{ color: '#B9001B' }}>*</span></label>
                                    <input
                                        type="text"
                                        value={businessName}
                                        onChange={(e) => setBusinessName(e.target.value)}
                                        placeholder="Enter your official store name"
                                        style={inputStyle}
                                    />
                                </div>

                                <div style={{ marginBottom: '2rem' }}>
                                    <label style={labelStyle}>Short Tagline</label>
                                    <input
                                        type="text"
                                        value={tagline}
                                        onChange={(e) => setTagline(e.target.value)}
                                        placeholder="e.g., Premium Vintage Apparel"
                                        style={inputStyle}
                                    />
                                </div>

                                <button onClick={nextStep} style={{ width: '100%', backgroundColor: '#B9001B', color: '#FFF', border: 'none', borderRadius: '8px', padding: '0.9rem', fontSize: '15px', fontWeight: '600', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', cursor: 'pointer', marginBottom: '1rem' }}>
                                    Continue to Next Step
                                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#FFF" strokeWidth="2.5"><polyline points="9 18 15 12 9 6"></polyline></svg>
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* ================= STEP 2: Phone Number ================= */}
                    <div style={{ width: '20%', padding: mobile ? '0 1rem 2rem' : '0 2rem 3rem', boxSizing: 'border-box' }}>
                        <div style={{ maxWidth: '500px', margin: '0 auto' }}>

                            <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
                                {renderProgress(5, 2, 'default')}
                                <p style={{ fontSize: '12px', fontWeight: '600', color: '#888', letterSpacing: '1px', textTransform: 'uppercase', marginBottom: '1rem' }}>STEP 2 OF 5</p>
                                <h1 style={{ fontSize: '32px', fontWeight: '700', color: '#111', margin: '0 0 0.5rem 0' }}>What's your phone number?</h1>
                                <p style={{ fontSize: '15px', color: '#666', margin: 0, lineHeight: '1.5' }}>
                                    Your number remains private and is used to securely verify and set up your Tokoni vendor account.
                                </p>
                            </div>

                            {error && (
                                <div style={{ backgroundColor: '#FFF0F1', border: '1px solid #FFCAD1', borderRadius: '10px', padding: '0.85rem 1.25rem', color: '#B9001B', fontSize: '13.5px', fontWeight: '600', marginBottom: '1.5rem', textAlign: 'left' }}>
                                    {error}
                                </div>
                            )}

                            <div style={{ marginBottom: '2rem' }}>
                                <label style={labelStyle}>Phone Number <span style={{ color: '#B9001B' }}>*</span></label>
                                <div style={{ display: 'flex', gap: '1rem' }}>
                                    {/* Country Code Dropdown */}
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', backgroundColor: '#FFFFFF', border: '1px solid #ECA1A6', borderRadius: '8px', padding: '0.85rem', cursor: 'pointer', width: '100px', justifyContent: 'center' }}>
                                        <select
                                            value={countryCode}
                                            onChange={(e) => setCountryCode(e.target.value)}
                                            style={{ border: 'none', outline: 'none', background: 'transparent', fontSize: '14px', fontWeight: '500', color: '#111', cursor: 'pointer', appearance: 'none', width: '100%', textAlign: 'center' }}
                                        >
                                            <option value="+1">🇺🇸 +1</option>
                                            <option value="+234">🇳🇬 +234</option>
                                            <option value="+44">🇬🇧 +44</option>
                                            <option value="+254">🇰🇪 +254</option>
                                            <option value="+27">🇿🇦 +27</option>
                                        </select>
                                        <ChevronDownIcon />
                                    </div>
                                    {/* Number Input */}
                                    <input
                                        type="tel"
                                        value={phoneNumber}
                                        onChange={(e) => setPhoneNumber(e.target.value)}
                                        placeholder="7011285642"
                                        style={{ ...inputStyle, flex: 1, backgroundColor: '#FFFFFF', border: '1px solid #ECA1A6' }}
                                    />
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '1rem', color: '#666' }}>
                                    <LockIcon />
                                    <span style={{ fontSize: '13px' }}>Standard message and data rates may apply.</span>
                                </div>
                            </div>

                            {/* Bottom Nav */}
                            <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', marginTop: '4rem' }}>
                                <button onClick={prevStep} style={{ padding: '0.85rem 2.5rem', backgroundColor: '#FFFFFF', border: '1px solid #ECA1A6', borderRadius: '30px', fontSize: '15px', fontWeight: '600', color: '#111', cursor: 'pointer' }}>
                                    Back
                                </button>
                                <button onClick={nextStep} style={{ padding: '0.85rem 2.5rem', backgroundColor: '#B9001B', border: 'none', borderRadius: '30px', fontSize: '15px', fontWeight: '600', color: '#FFFFFF', display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                                    Continue <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#FFF" strokeWidth="2.5"><polyline points="9 18 15 12 9 6"></polyline></svg>
                                </button>
                            </div>

                        </div>
                    </div>

                    {/* ================= STEP 3: Categories ================= */}
                    <div style={{ width: '20%', padding: mobile ? '0 1rem 2rem' : '0 2rem 3rem', boxSizing: 'border-box' }}>
                        <div style={{ maxWidth: '800px', margin: '0 auto' }}>

                            <div style={{ width: '100%', marginBottom: '2rem' }}>
                                {renderProgress(5, 3, 'wide')}
                            </div>

                            <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
                                <h1 style={{ fontSize: '32px', fontWeight: '700', color: '#111', margin: '0 0 0.5rem 0' }}>What are you selling?</h1>
                                <p style={{ fontSize: '16px', color: '#555', margin: 0 }}>Select the categories that best describe your business. You can choose up to 3 categories.</p>
                            </div>

                            {error && (
                                <div style={{ backgroundColor: '#FFF0F1', border: '1px solid #FFCAD1', borderRadius: '10px', padding: '0.85rem 1.25rem', color: '#B9001B', fontSize: '13.5px', fontWeight: '600', marginBottom: '1.5rem', textAlign: 'center' }}>
                                    {error}
                                </div>
                            )}

                             {/* Grid */}
                             <div style={{ display: 'grid', gridTemplateColumns: mobile ? 'repeat(2, 1fr)' : 'repeat(4, 1fr)', gap: '1rem', marginBottom: '3rem' }}>
                                 {categories.map((cat) => {
                                     const isSelected = selectedCategories.includes(cat.name);
                                     const Icon = cat.icon;
                                     return (
                                         <div
                                             key={cat.name}
                                             onClick={() => {
                                                 if (isSelected) {
                                                     setSelectedCategories(selectedCategories.filter(c => c !== cat.name));
                                                     setError(null);
                                                 } else {
                                                     if (selectedCategories.length >= 3) {
                                                         setError("You can only select up to 3 categories.");
                                                         return;
                                                     }
                                                     setSelectedCategories([...selectedCategories, cat.name]);
                                                     setError(null);
                                                 }
                                             }}
                                             style={{
                                                 backgroundColor: isSelected ? '#FFFDFD' : '#F5F5F5',
                                                 border: isSelected ? '2px solid #B9001B' : '2px solid transparent',
                                                 borderRadius: '12px',
                                                 padding: '1.5rem 0',
                                                 display: 'flex',
                                                 flexDirection: 'column',
                                                 alignItems: 'center',
                                                 justifyContent: 'center',
                                                 cursor: 'pointer',
                                                 transition: 'all 0.2s'
                                             }}
                                         >
                                             <div style={{ width: '50px', height: '50px', borderRadius: '50%', backgroundColor: isSelected ? '#B9001B' : '#E5E7EB', color: isSelected ? '#FFF' : '#666', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '12px' }}>
                                                 <Icon />
                                             </div>
                                             <span style={{ fontSize: '14px', fontWeight: '600', color: isSelected ? '#B9001B' : '#111' }}>{cat.name}</span>
                                         </div>
                                     );
                                 })}
                             </div>

                            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                <button onClick={prevStep} style={{ padding: '0.85rem 2.5rem', backgroundColor: '#FFFFFF', border: '1px solid #ECA1A6', borderRadius: '12px', fontSize: '15px', fontWeight: '600', color: '#111', cursor: 'pointer' }}>
                                    Back
                                </button>
                                <button onClick={nextStep} style={{ padding: '0.85rem 2.5rem', backgroundColor: '#B9001B', border: 'none', borderRadius: '12px', fontSize: '15px', fontWeight: '600', color: '#FFFFFF', cursor: 'pointer' }}>
                                    Continue
                                </button>
                            </div>

                        </div>
                    </div>

                    {/* ================= STEP 4: Location ================= */}
                    <div style={{ width: '20%', padding: mobile ? '0 1rem 2rem' : '0 2rem 3rem', boxSizing: 'border-box' }}>
                        <div style={{ maxWidth: '650px', margin: '0 auto', backgroundColor: '#FFFFFF', borderRadius: '16px', padding: mobile ? '1.5rem' : '3rem', boxShadow: '0 4px 24px rgba(0,0,0,0.02)' }}>

                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                                <span style={{ fontSize: '13px', color: '#666' }}>Step 4 of 5</span>
                                <span style={{ fontSize: '13px', fontWeight: '700', color: '#B9001B' }}>Location</span>
                            </div>
                            <div style={{ marginBottom: '2rem' }}>
                                {renderProgress(5, 4, 'wide')}
                            </div>

                            <h1 style={{ fontSize: '32px', fontWeight: '700', color: '#111', margin: '0 0 0.5rem 0' }}>Where are you located?</h1>
                            <p style={{ fontSize: '15px', color: '#666', margin: '0 0 2rem 0', lineHeight: '1.5' }}>
                                This helps us connect you with local buyers and calculate shipping rates accurately.
                            </p>

                            {error && (
                                <div style={{ backgroundColor: '#FFF0F1', border: '1px solid #FFCAD1', borderRadius: '10px', padding: '0.85rem 1.25rem', color: '#B9001B', fontSize: '13.5px', fontWeight: '600', marginBottom: '1.5rem', textAlign: 'left' }}>
                                    {error}
                                </div>
                            )}

                            {/* Form Grid */}
                            <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem', flexDirection: mobile ? 'column' : 'row' }}>
                                <div style={{ flex: 1 }}>
                                    <label style={{ ...labelStyle, color: '#666', fontWeight: '500' }}>Country <span style={{ color: '#B9001B' }}>*</span></label>
                                    <div style={{ position: 'relative' }}>
                                        <select
                                            value={country}
                                            onChange={(e) => setCountry(e.target.value)}
                                            style={inputStyle}
                                        >

                                            <option value="Nigeria">Nigeria</option>

                                        </select>
                                    </div>
                                </div>
                                <div style={{ flex: 1 }}>
                                    <label style={{ ...labelStyle, color: '#666', fontWeight: '500' }}>State / Province <span style={{ color: '#B9001B' }}>*</span></label>
                                    <input
                                        type="text"
                                        value={state}
                                        onChange={(e) => setState(e.target.value)}
                                        placeholder="e.g. Rivers State"
                                        style={inputStyle}
                                    />
                                </div>
                            </div>

                            <div style={{ marginBottom: '2rem' }}>
                                <label style={{ ...labelStyle, color: '#666', fontWeight: '500' }}>Street Address <span style={{ color: '#B9001B' }}>*</span></label>
                                <div style={{ position: 'relative' }}>
                                    <div style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }}><MapPinIcon /></div>
                                    <input
                                        type="text"
                                        value={address}
                                        onChange={(e) => setAddress(e.target.value)}
                                        placeholder="Start typing your address..."
                                        style={{ ...inputStyle, paddingLeft: '2.5rem' }}
                                    />
                                </div>
                            </div>

                            {/* Bottom Buttons */}
                            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                <button onClick={prevStep} style={{ padding: '0.85rem 2rem', backgroundColor: '#F3F4F6', border: 'none', borderRadius: '8px', fontSize: '14.5px', fontWeight: '600', color: '#B9001B', display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#B9001B" strokeWidth="2.5"><polyline points="15 18 9 12 15 6"></polyline></svg> Back
                                </button>
                                <button onClick={nextStep} style={{ padding: '0.85rem 2rem', backgroundColor: '#B9001B', border: 'none', borderRadius: '8px', fontSize: '14.5px', fontWeight: '600', color: '#FFFFFF', display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                                    Submit Onboarding <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#FFF" strokeWidth="2.5"><polyline points="9 18 15 12 9 6"></polyline></svg>
                                </button>
                            </div>

                        </div>
                    </div>

                    {/* ================= STEP 5: Success ================= */}
                    <div style={{ width: '20%', padding: mobile ? '0 1rem 2rem' : '0 2rem 3rem', boxSizing: 'border-box' }}>
                        <div style={{ maxWidth: '500px', margin: '0 auto', backgroundColor: '#FFFFFF', borderRadius: '16px', padding: mobile ? '2.5rem 1.5rem' : '4rem 3rem', boxShadow: '0 10px 40px rgba(185,0,27,0.05)', textAlign: 'center', position: 'relative' }}>

                            {/* Decorative Dots */}
                            <div style={{ display: 'flex', gap: '6px', justifyContent: 'center', marginBottom: '2rem' }}>
                                <div style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#B9001B' }}></div>
                                <div style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#B9001B' }}></div>
                                <div style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#B9001B' }}></div>
                                <div style={{ width: '20px', height: '6px', borderRadius: '3px', backgroundColor: '#B9001B' }}></div>
                            </div>

                            {/* Glowing Check Icon */}
                            <div style={{ width: '90px', height: '90px', borderRadius: '50%', backgroundColor: '#FFF0F2', margin: '0 auto 2rem', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 0 30px 10px #FFF0F2' }}>
                                <SuccessCheckIcon />
                            </div>

                            <h1 style={{ fontSize: '32px', fontWeight: '700', color: '#111', margin: '0 0 1rem 0', lineHeight: '1.2' }}>
                                Your vendor account is<br />ready
                            </h1>
                            <p style={{ fontSize: '15px', color: '#666', margin: '0 0 2rem 0', lineHeight: '1.6' }}>
                                Welcome to Tokoni. You can now start<br />adding products, managing your store,<br />and connecting with customers.
                            </p>

                            {/* Premium Trial Banner */}
                            <div style={{
                                background: 'linear-gradient(135deg, #B9001B 0%, #ff4d6d 100%)',
                                borderRadius: '14px',
                                padding: '1.25rem 1.5rem',
                                marginBottom: '1.5rem',
                                textAlign: 'left',
                                position: 'relative',
                                overflow: 'hidden'
                            }}>
                                <div style={{ position: 'absolute', top: '-20px', right: '-20px', width: '100px', height: '100px', borderRadius: '50%', backgroundColor: 'rgba(255,255,255,0.08)' }} />
                                <div style={{ position: 'absolute', bottom: '-30px', left: '60%', width: '80px', height: '80px', borderRadius: '50%', backgroundColor: 'rgba(255,255,255,0.05)' }} />
                                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
                                    <span style={{ fontSize: '18px' }}>🎁</span>
                                    <span style={{ fontSize: '13px', fontWeight: '800', color: '#FFD700', textTransform: 'uppercase', letterSpacing: '1px' }}>Founding Vendor Gift</span>
                                </div>
                                <p style={{ fontSize: '15px', fontWeight: '700', color: '#FFFFFF', margin: '0 0 4px 0' }}>2 Months Premium — Free</p>
                                <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.85)', margin: 0, lineHeight: '1.5' }}>
                                    Unlimited products & posts, 50% off all sponsorships. No card needed.
                                </p>
                            </div>

                            <button
                                onClick={() => router.push('/dashboard')}
                                style={{ width: '100%', padding: '1rem', backgroundColor: '#B9001B', border: 'none', borderRadius: '12px', fontSize: '15px', fontWeight: '600', color: '#FFFFFF', cursor: 'pointer', marginBottom: '1rem' }}
                            >
                                Go to Dashboard
                            </button>
                        </div>
                    </div>

                </div>
            </div>

            <style jsx>{`
                @keyframes spin {
                    to { transform: rotate(360deg); }
                }
            `}</style>
        </div>
    );
}