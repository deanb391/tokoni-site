"use client";

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useUser } from '@/context/UserContext';
import { editVendor } from '@/lib/api/vendors';
import { uploadToServer } from '@/lib/upload';
import { getVendorProducts } from '@/lib/api/products';
import EditProductModal from '@/components/EditProductModal';

// --- Inline SVG Icons ---
const SearchIcon = ({ color = "#666" }) => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line>
    </svg>
);

const BellIcon = ({ color = "#111" }) => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path><path d="M13.73 21a2 2 0 0 1-3.46 0"></path>
    </svg>
);

const FilterSortIcon = () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#111" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <line x1="4" y1="6" x2="20" y2="6"></line>
        <line x1="8" y1="12" x2="16" y2="12"></line>
        <line x1="11" y1="18" x2="13" y2="18"></line>
    </svg>
);

const EditPencilIcon = ({ color = "#B9001B" }) => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
        <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
    </svg>
);

const PlusIcon = () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#FFFFFF" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <line x1="12" y1="5" x2="12" y2="19"></line>
        <line x1="5" y1="12" x2="19" y2="12"></line>
    </svg>
);

const CloseIcon = () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#111" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
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

const ChevronDownIcon = () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#111" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="6 9 12 15 18 9"></polyline>
    </svg>
);

// --- Category SVGs / Icons ---
const CatFashion = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 4v4m0 0l-5 4v8h10v-8l-5-4z"></path></svg>;
const CatBeauty = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"></circle><path d="M8 14s1.5 2 4 2 4-2 4-2"></path><line x1="9" y1="9" x2="9.01" y2="9"></line><line x1="15" y1="9" x2="15.01" y2="9"></line></svg>;
const CatElectronics = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="3" width="20" height="14" rx="2" ry="2"></rect><line x1="8" y1="21" x2="16" y2="21"></line><line x1="12" y1="17" x2="12" y2="21"></line></svg>;
const CatSports = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"></circle><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path><path d="M2 12h20"></path></svg>;
const CatFood = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M11 20H3v-8a8 8 0 0 1 16 0v8h-8z"></path><line x1="11" y1="4" x2="11" y2="12"></line><line x1="15" y1="4" x2="15" y2="12"></line><line x1="7" y1="4" x2="7" y2="12"></line></svg>;
const CatFurniture = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="4" y="6" width="16" height="12" rx="2"></rect><path d="M2 14h20"></path><path d="M6 18v2"></path><path d="M18 18v2"></path></svg>;
const CatHealth = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path></svg>;
const CatPhones = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="5" y="2" width="14" height="20" rx="2" ry="2"></rect><line x1="12" y1="18" x2="12.01" y2="18"></line></svg>;
const CatGaming = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="6" width="20" height="12" rx="2"></rect><path d="M6 12h4"></path><path d="M8 10v4"></path><line x1="15" y1="13" x2="15.01" y2="13"></line><line x1="18" y1="11" x2="18.01" y2="11"></line></svg>;
const CatBooks = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path></svg>;
const CatArtCrafts = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z"></path><path d="M7.5 10.5C8.32843 10.5 9 9.82843 9 9C9 8.17157 8.32843 7.5 7.5 7.5C6.67157 7.5 6 8.17157 6 9C6 9.82843 6.67157 10.5 7.5 10.5Z"></path><path d="M11.5 7.5C12.3284 7.5 13 6.82843 13 6C13 5.17157 12.3284 4.5 11.5 4.5C10.6716 4.5 10 5.17157 10 6C10 6.82843 10.6716 7.5 11.5 7.5Z"></path><path d="M16.5 10.5C17.3284 10.5 18 9.82843 18 9C18 8.17157 17.3284 7.5 16.5 7.5C15.6716 7.5 15 8.17157 15 9C15 9.82843 15.6716 10.5 16.5 10.5Z"></path><path d="M6 14C6 14 8 18 12 18C16 18 18 14 18 14"></path></svg>;
const CatAutomotive = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="11" width="20" height="8" rx="2"></rect><path d="M4 11V7a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v4"></path><circle cx="6.5" cy="19.5" r="2.5"></circle><circle cx="17.5" cy="19.5" r="2.5"></circle></svg>;
const CatJewelry = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 2l3 6H9l3-6z"></path><circle cx="12" cy="14" r="6"></circle><circle cx="12" cy="14" r="2"></circle></svg>;
const CatHomeDecor = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path><polyline points="9 22 9 12 15 12 15 22"></polyline></svg>;
const CatToys = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="22" r="10"></circle><circle cx="12" cy="12" r="3"></circle><path d="M12 2v7M12 15v7M2 12h7M15 12h7"></path></svg>;
const CatPets = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="4.5" cy="9.5" r="2.5"></circle><circle cx="9.5" cy="5.5" r="2.5"></circle><circle cx="14.5" cy="5.5" r="2.5"></circle><circle cx="19.5" cy="9.5" r="2.5"></circle><path d="M12 12c-3.5 0-6 2.5-6 6a4 4 0 0 0 8 0 4 4 0 0 0 4 0c0-3.5-2.5-6-6-6z"></path></svg>;

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

export default function VendorDashboardScreen() {
    const router = useRouter();
    const { user, vendor, loading, vendorLoading, refetchVendor } = useUser();

    const [isMobile, setIsMobile] = useState(false);
    const [mounted, setMounted] = useState(false);
    const [activeTab, setActiveTab] = useState('Products');

    // Products State
    const [products, setProducts] = useState<any[]>([]);
    const [productsLoading, setProductsLoading] = useState(true);
    const [selectedProductToEdit, setSelectedProductToEdit] = useState<any | null>(null);
    const [isEditProductModalOpen, setIsEditProductModalOpen] = useState(false);

    // Edit Modal State
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
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

    // Modal status states
    const [uploadingCover, setUploadingCover] = useState(false);
    const [uploadingLogo, setUploadingLogo] = useState(false);
    const [saving, setSaving] = useState(false);
    const [modalError, setModalError] = useState<string | null>(null);

    // File Input Refs
    const coverInputRef = useRef<HTMLInputElement | null>(null);
    const logoInputRef = useRef<HTMLInputElement | null>(null);

    useEffect(() => {
        setMounted(true);
        const handleResize = () => setIsMobile(window.innerWidth < 900);
        handleResize();
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    // Load actual vendor products
    useEffect(() => {
        const loadProducts = async () => {
            if (!vendor?.$id) return;
            setProductsLoading(true);
            try {
                const list = await getVendorProducts(vendor.$id);
                setProducts(list);
            } catch (err) {
                console.error("Failed to load vendor products:", err);
            } finally {
                setProductsLoading(false);
            }
        };
        if (vendor?.$id) {
            loadProducts();
        }
    }, [vendor]);

    // Redirect unauthenticated user
    useEffect(() => {
        if (mounted && !loading && !user) {
            router.push('/signin');
        }
    }, [mounted, loading, user, router]);

    // Populate modal state when opened or when vendor updates
    const openEditModal = () => {
        if (vendor) {
            setBusinessName(vendor.businessName || '');
            setTagline(vendor.tagline || '');
            setCoverImage(vendor.coverImage || '');
            setLogoImage(vendor.logoImage || '');
            setPhoneNumber(vendor.phoneNumber || '');
            setCountryCode(vendor.countryCode || '+234');
            setSelectedCategories(vendor.category || []);
            setCountry(vendor.country || 'Nigeria');
            setState(vendor.state || '');
            setAddress(vendor.address || '');
            setModalError(null);
            setIsEditModalOpen(true);
        }
    };

    const handleCoverImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setUploadingCover(true);
        setModalError(null);

        try {
            const url = await uploadToServer(file, "vendors/cover", "image");
            setCoverImage(url);
        } catch (err: any) {
            console.error("Cover image upload failed:", err);
            setModalError(err.message || "Failed to upload cover image.");
        } finally {
            setUploadingCover(false);
        }
    };

    const handleLogoImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setUploadingLogo(true);
        setModalError(null);

        try {
            const url = await uploadToServer(file, "vendors/logo", "image");
            setLogoImage(url);
        } catch (err: any) {
            console.error("Logo image upload failed:", err);
            setModalError(err.message || "Failed to upload logo image.");
        } finally {
            setUploadingLogo(false);
        }
    };

    const handleSaveChanges = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!vendor?.$id) return;

        if (!businessName) {
            setModalError('Business Name is required.');
            return;
        }
        if (!phoneNumber) {
            setModalError('Phone Number is required.');
            return;
        }
        if (selectedCategories.length === 0) {
            setModalError('Please select at least one category.');
            return;
        }
        if (!state || !address) {
            setModalError('Please provide State and Street Address.');
            return;
        }

        setSaving(true);
        setModalError(null);

        try {
            const updates = {
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

            await editVendor(vendor.$id, updates);
            await refetchVendor();
            setIsEditModalOpen(false);
        } catch (err: any) {
            console.error("Failed to update vendor profile:", err);
            setModalError(err.message || "Failed to update vendor profile. Please try again.");
        } finally {
            setSaving(false);
        }
    };

    if (loading || (user && vendorLoading && !vendor)) {
        return (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '80vh', fontFamily: 'var(--font-body), sans-serif', backgroundColor: '#F9FAFB' }}>
                <div style={{ width: '40px', height: '40px', border: '3px solid #E5E7EB', borderTop: '3px solid #B9001B', borderRadius: '50%', animation: 'spin 1s linear infinite', marginBottom: '1.5rem' }}></div>
                <p style={{ color: '#555', fontSize: '15px', fontWeight: '500' }}>Loading your premium experience...</p>
                <style jsx global>{`
                    @keyframes spin {
                        to { transform: rotate(360deg); }
                    }
                `}</style>
            </div>
        );
    }

    if (!user) {
        return null; // Handled by useEffect redirect
    }

    // Authenticated but does not have a vendor account yet
    if (!vendor) {
        return (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '80vh', backgroundColor: '#F9FAFB', fontFamily: 'var(--font-body), sans-serif', padding: '2rem' }}>
                <div style={{ maxWidth: '480px', width: '100%', backgroundColor: '#FFFFFF', borderRadius: '24px', padding: '3rem 2.5rem', boxShadow: '0 10px 30px rgba(0,0,0,0.03)', border: '1px solid #EDEDED', textAlign: 'center' }}>
                    <div style={{ width: '80px', height: '80px', borderRadius: '50%', backgroundColor: '#FFF0F2', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem' }}>
                        <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#B9001B" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
                            <polyline points="9 22 9 12 15 12 15 22"></polyline>
                        </svg>
                    </div>
                    <h2 style={{ fontSize: '24px', fontWeight: '800', color: '#111', margin: '0 0 0.75rem 0', letterSpacing: '-0.5px' }}>Become a Tokoni Vendor</h2>
                    <p style={{ fontSize: '14.5px', color: '#555', lineHeight: '1.6', margin: '0 0 2rem 0' }}>
                        Create a premium storefront to list your products, manage customer orders, track sales analytics, and grow your modern brand.
                    </p>
                    <button
                        onClick={() => router.push('/onboarding')}
                        style={{ width: '100%', padding: '0.9rem', backgroundColor: '#B9001B', color: '#FFFFFF', border: 'none', borderRadius: '12px', fontSize: '15px', fontWeight: '600', cursor: 'pointer', transition: 'background-color 0.2s', boxShadow: '0 4px 12px rgba(185, 0, 27, 0.2)' }}
                    >
                        Set Up Vendor Storefront
                    </button>
                </div>
            </div>
        );
    }

    const mobile = mounted ? isMobile : false;
    const tabs = ['Products', 'Orders', 'Analytics', 'Followers', 'Settings'];

    // Products and mock states mapped dynamically

    return (
        <div style={{ backgroundColor: '#F9FAFB', minHeight: '100vh', fontFamily: 'var(--font-body), sans-serif' }}>

            {/* ================= HERO SECTION ================= */}
            <section style={{ backgroundColor: '#FFFFFF', borderBottom: '1px solid #EDEDED' }}>

                {/* Cover Image */}
                {vendor.coverImage ? (
                    <div style={{ width: '100%', height: mobile ? '160px' : '240px', backgroundImage: `url(${vendor.coverImage})`, backgroundSize: 'cover', backgroundPosition: 'center', position: 'relative' }} />
                ) : (
                    <div style={{ width: '100%', height: mobile ? '160px' : '240px', background: 'linear-gradient(to right, #B9001B, #ECA1A6, #B9001B)', position: 'relative' }}>
                        <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', opacity: 0.08, backgroundImage: 'repeating-linear-gradient(90deg, transparent, transparent 40px, #000 40px, #000 45px)' }}></div>
                    </div>
                )}

                {/* Profile Info Container */}
                <div style={{ maxWidth: '1200px', margin: '0 auto', padding: mobile ? '0 1.5rem' : '0 3rem', position: 'relative', paddingBottom: '1rem' }}>

                    <div style={{ display: 'flex', flexDirection: mobile ? 'column' : 'row', alignItems: mobile ? 'center' : 'flex-start', justifyContent: 'space-between', gap: '1.5rem' }}>

                        {/* Avatar & Text Group */}
                        <div style={{ display: 'flex', flexDirection: mobile ? 'column' : 'row', alignItems: mobile ? 'center' : 'flex-start', gap: mobile ? '1rem' : '2rem', marginTop: mobile ? '-50px' : '-60px' }}>

                            {/* Avatar / Logo */}
                            <div style={{ width: mobile ? '100px' : '130px', height: mobile ? '100px' : '130px', borderRadius: '50%', backgroundColor: '#FFFFFF', border: '5px solid #FFFFFF', zIndex: 10, overflow: 'hidden', flexShrink: 0, boxShadow: '0 4px 10px rgba(0,0,0,0.06)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                {vendor.logoImage ? (
                                    <img src={vendor.logoImage} alt={`${vendor.businessName} logo`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                ) : user.avatar ? (
                                    <img src={user.avatar} alt={`${vendor.businessName} owner avatar`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                ) : (
                                    <svg width="100%" height="100%" viewBox="0 0 32 32" fill="none"><rect width="32" height="32" fill="#E5E7EB" /><circle cx="16" cy="13" r="7" fill="#9CA3AF" /><path d="M2 32C2 24.268 8.268 18 16 18C23.732 18 30 24.268 30 32H2Z" fill="#1F2937" /></svg>
                                )}
                            </div>

                            {/* Text Info */}
                            <div style={{ marginTop: mobile ? '0' : '75px', textAlign: mobile ? 'center' : 'left' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap', justifyContent: mobile ? 'center' : 'flex-start' }}>
                                    <h1 style={{ fontSize: mobile ? '24px' : '28px', fontWeight: '800', color: '#111', margin: '0', letterSpacing: '-0.5px' }}>
                                        {vendor.businessName}
                                    </h1>
                                    <span style={{ fontSize: '11px', fontWeight: '700', textTransform: 'uppercase', padding: '3px 8px', borderRadius: '20px', backgroundColor: vendor.status === 'approved' ? '#EBFDF5' : '#FEF3C7', color: vendor.status === 'approved' ? '#059669' : '#D97706', letterSpacing: '0.5px' }}>
                                        {vendor.status || 'Pending Verification'}
                                    </span>
                                </div>

                                {vendor.tagline && (
                                    <p style={{ fontSize: '15px', color: '#555', margin: '0.5rem 0 1rem 0', maxWidth: '600px', lineHeight: '1.5' }}>
                                        {vendor.tagline}
                                    </p>
                                )}

                                {/* Location & Categories */}
                                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap', justifyContent: mobile ? 'center' : 'flex-start', margin: '0 0 1.25rem 0', color: '#666', fontSize: '13.5px' }}>
                                    <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>
                                        {vendor.state}, {vendor.country}
                                    </span>
                                    {vendor.category && vendor.category.length > 0 && (
                                        <div style={{ display: 'flex', gap: '6px' }}>
                                            {vendor.category.map((cat) => (
                                                <span key={cat} style={{ fontSize: '12px', fontWeight: '600', backgroundColor: '#F3F4F6', color: '#374151', padding: '2px 8px', borderRadius: '6px' }}>
                                                    {cat}
                                                </span>
                                            ))}
                                        </div>
                                    )}
                                </div>

                                {/* Stats */}
                                <div style={{ display: 'flex', gap: '2rem', justifyContent: mobile ? 'center' : 'flex-start' }}>
                                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                                        <span style={{ fontSize: '16px', fontWeight: '700', color: '#111' }}>12.4K</span>
                                        <span style={{ fontSize: '13px', color: '#666' }}>Followers</span>
                                    </div>
                                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                                        <span style={{ fontSize: '16px', fontWeight: '700', color: '#111' }}>450</span>
                                        <span style={{ fontSize: '13px', color: '#666' }}>Following</span>
                                    </div>
                                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                                        <span style={{ fontSize: '16px', fontWeight: '700', color: '#111' }}>{productsLoading ? '...' : products.length}</span>
                                        <span style={{ fontSize: '13px', color: '#666' }}>Products Listed</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Action Buttons */}
                        <div style={{ display: 'flex', gap: '1rem', marginTop: mobile ? '1rem' : '75px', width: mobile ? '100%' : 'auto' }}>
                            <button
                                onClick={openEditModal}
                                style={{ flex: mobile ? 1 : 'none', backgroundColor: '#E5E7EB', color: '#B9001B', border: 'none', borderRadius: '25px', padding: '0.65rem 1.75rem', fontSize: '14.5px', fontWeight: '600', cursor: 'pointer', transition: 'background-color 0.2s', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}
                            >
                                <EditPencilIcon color="#B9001B" />
                                Edit Profile
                            </button>
                            <button style={{ flex: mobile ? 1 : 'none', backgroundColor: '#B9001B', color: '#FFFFFF', border: 'none', borderRadius: '25px', padding: '0.65rem 1.75rem', fontSize: '14.5px', fontWeight: '600', cursor: 'pointer', transition: 'background-color 0.2s' }}>
                                Manage Store
                            </button>
                        </div>

                    </div>

                    {/* Tabs */}
                    <div style={{ display: 'flex', gap: '2rem', marginTop: '2.5rem', overflowX: 'auto', borderBottom: '2px solid transparent', paddingBottom: '1px' }}>
                        {tabs.map((tab) => {
                            const isActive = tab === activeTab;
                            return (
                                <button
                                    key={tab}
                                    onClick={() => setActiveTab(tab)}
                                    style={{
                                        background: 'none',
                                        border: 'none',
                                        padding: '0 0 0.75rem 0',
                                        fontSize: '15px',
                                        fontWeight: isActive ? '600' : '500',
                                        color: isActive ? '#B9001B' : '#666666',
                                        borderBottom: isActive ? '2px solid #B9001B' : '2px solid transparent',
                                        cursor: 'pointer',
                                        whiteSpace: 'nowrap',
                                        transition: 'all 0.2s'
                                    }}
                                >
                                    {tab}
                                </button>
                            );
                        })}
                    </div>

                </div>
            </section>

            {/* ================= MAIN CONTENT ================= */}
            <main style={{ maxWidth: '1200px', margin: '0 auto', padding: mobile ? '2rem 1.5rem' : '3rem', position: 'relative' }}>

                {activeTab === 'Products' && (
                    <>
                        {/* Section Header */}
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                            <h2 style={{ fontSize: '22px', fontWeight: '700', color: '#111', margin: 0 }}>Your Products</h2>
                            <button style={{ width: '40px', height: '40px', borderRadius: '50%', backgroundColor: '#F3F4F6', border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
                                <FilterSortIcon />
                            </button>
                        </div>

                        {/* Product Grid */}
                        {productsLoading ? (
                            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '4rem', width: '100%' }}>
                                <div style={{ width: '30px', height: '30px', border: '3px solid #E5E7EB', borderTop: '3px solid #B9001B', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div>
                            </div>
                        ) : products.length === 0 ? (
                            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '6rem 2rem', backgroundColor: '#FFFFFF', borderRadius: '16px', border: '1px solid #EDEDED', textAlign: 'center', width: '100%', boxSizing: 'border-box' }}>
                                <span style={{ fontSize: '48px', marginBottom: '1rem' }}>📦</span>
                                <h3 style={{ fontSize: '20px', fontWeight: '700', color: '#111', margin: '0 0 0.5rem 0' }}>No Products Listed</h3>
                                <p style={{ fontSize: '14.5px', color: '#666', maxWidth: '380px', margin: '0 0 1.5rem 0', lineHeight: '1.5' }}>
                                    You haven't listed any products yet. Click the "Add Product" button to list your first item!
                                </p>
                                <button
                                    onClick={() => router.push('/dashboard/product/add')}
                                    style={{ backgroundColor: '#B9001B', color: '#FFFFFF', border: 'none', borderRadius: '25px', padding: '0.65rem 1.75rem', fontSize: '14px', fontWeight: '600', cursor: 'pointer', transition: 'background-color 0.2s' }}
                                >
                                    Add Your First Product
                                </button>
                            </div>
                        ) : (
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '2rem', width: '100%' }}>
                                {products.map((prod) => {
                                    const isAvailable = prod.available;
                                    const badgeText = !isAvailable 
                                        ? "Draft" 
                                        : prod.stock > 0 
                                            ? `In Stock (${prod.stock})` 
                                            : "Out of Stock";
                                    const badgeColor = !isAvailable 
                                        ? "#4b5563" 
                                        : prod.stock > 0 
                                            ? "#B9001B" 
                                            : "#ef4444";
                                    const badgeBg = !isAvailable 
                                        ? "#f3f4f6" 
                                        : prod.stock > 0 
                                            ? "#FFF0F2" 
                                            : "#fee2e2";

                                    return (
                                        <div key={prod.$id} style={{ backgroundColor: '#FFFFFF', borderRadius: '12px', border: '1px solid #EDEDED', overflow: 'hidden', display: 'flex', flexDirection: 'column', transition: 'transform 0.2s, box-shadow 0.2s', cursor: 'pointer' }}>
                                            <div onClick={() => router.push(`/product/${prod.$id}`)} style={{ width: '100%', height: '300px', backgroundColor: '#F3F4F6', position: 'relative', overflow: 'hidden' }}>
                                                {prod.images && prod.images.length > 0 ? (
                                                    <img src={prod.images[0]} alt={prod.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                                ) : (
                                                    <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                                        <ImageIcon />
                                                    </div>
                                                )}
                                                <div style={{ position: 'absolute', top: '12px', right: '12px', backgroundColor: badgeBg, color: badgeColor, padding: '4px 12px', borderRadius: '4px', fontSize: '11px', fontWeight: '700' }}>
                                                    {badgeText}
                                                </div>
                                            </div>
                                            <div style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', flex: 1 }}>
                                                <h3 onClick={() => router.push(`/product/${prod.$id}`)} style={{ fontSize: '16px', fontWeight: '600', color: '#111', margin: '0 0 0.5rem 0' }}>{prod.name}</h3>
                                                <span onClick={() => router.push(`/product/${prod.$id}`)} style={{ fontSize: '15px', color: '#444', fontWeight: '600', marginBottom: '1rem' }}>
                                                    ₦{prod.price.toFixed(2)}
                                                    {prod.discountPrice && (
                                                        <span style={{ textDecoration: 'line-through', color: '#888', fontSize: '13px', marginLeft: '8px', fontWeight: '400' }}>
                                                            ₦{prod.discountPrice.toFixed(2)}
                                                        </span>
                                                    )}
                                                </span>
                                                <div style={{ marginTop: 'auto', paddingTop: '1rem', borderTop: '1px solid #F3F4F6', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                    <span style={{ fontSize: '13px', color: '#666' }}>Stock: {prod.stock}</span>
                                                    <button
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            setSelectedProductToEdit(prod);
                                                            setIsEditProductModalOpen(true);
                                                        }}
                                                        style={{ background: 'none', border: 'none', display: 'flex', alignItems: 'center', gap: '6px', color: '#B9001B', fontSize: '13px', fontWeight: '600', cursor: 'pointer', padding: 0 }}
                                                    >
                                                        <EditPencilIcon />
                                                        Edit
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </>
                )}

                {activeTab !== 'Products' && (
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '6rem 2rem', backgroundColor: '#FFFFFF', borderRadius: '16px', border: '1px solid #EDEDED', textAlign: 'center' }}>
                        <span style={{ fontSize: '48px', marginBottom: '1rem' }}>📦</span>
                        <h3 style={{ fontSize: '20px', fontWeight: '700', color: '#111', margin: '0 0 0.5rem 0' }}>{activeTab} Management</h3>
                        <p style={{ fontSize: '14.5px', color: '#666', maxWidth: '380px', margin: 0 }}>
                            This dashboard tab is ready for backend connection. Add actual items or adjust setting parameters.
                        </p>
                    </div>
                )}

            </main>

            {/* ================= FLOATING ACTION BUTTON ================= */}
            <button
                onClick={() => router.push('/dashboard/product/add')}
                style={{
                    position: 'fixed',
                    bottom: '2rem',
                    right: mobile ? '1.5rem' : '3rem',
                    backgroundColor: '#B9001B',
                    color: '#FFFFFF',
                    border: 'none',
                    borderRadius: '30px',
                    padding: '1rem 1.5rem',
                    fontSize: '15px',
                    fontWeight: '600',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    cursor: 'pointer',
                    boxShadow: '0 4px 15px rgba(185, 0, 27, 0.3)',
                    zIndex: 100,
                    transition: 'transform 0.2s, background-color 0.2s'
                }}
            >
                <PlusIcon />
                Add Product
            </button>

            {/* ================= EDIT PROFILE MODAL ================= */}
            {isEditModalOpen && (
                <div
                    style={{
                        position: 'fixed',
                        top: 0,
                        left: 0,
                        width: '100vw',
                        height: '100vh',
                        backgroundColor: 'rgba(0,0,0,0.5)',
                        backdropFilter: 'blur(4px)',
                        zIndex: 999,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        padding: '1.5rem',
                        boxSizing: 'border-box'
                    }}
                >
                    <div
                        style={{
                            backgroundColor: '#FFFFFF',
                            borderRadius: '24px',
                            width: '100%',
                            maxWidth: '650px',
                            maxHeight: '90vh',
                            overflowY: 'auto',
                            padding: mobile ? '1.5rem' : '2.5rem',
                            boxShadow: '0 20px 50px rgba(0,0,0,0.15)',
                            position: 'relative',
                            boxSizing: 'border-box'
                        }}
                    >
                        {/* Close button */}
                        <button
                            onClick={() => setIsEditModalOpen(false)}
                            style={{
                                position: 'absolute',
                                top: '1.5rem',
                                right: '1.5rem',
                                background: '#F3F4F6',
                                border: 'none',
                                borderRadius: '50%',
                                width: '36px',
                                height: '36px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                cursor: 'pointer',
                                transition: 'background-color 0.2s'
                            }}
                        >
                            <CloseIcon />
                        </button>

                        <div style={{ marginBottom: '1.5rem' }}>
                            <h2 style={{ fontSize: '24px', fontWeight: '800', color: '#111', margin: '0 0 0.25rem 0', letterSpacing: '-0.5px' }}>Edit Vendor Profile</h2>
                            <p style={{ fontSize: '14px', color: '#666', margin: 0 }}>Update details and image assets for your premium storefront.</p>
                        </div>

                        {modalError && (
                            <div style={{ backgroundColor: '#FFF0F1', border: '1px solid #FFCAD1', borderRadius: '12px', padding: '0.85rem 1.25rem', color: '#B9001B', fontSize: '13.5px', fontWeight: '600', marginBottom: '1.5rem' }}>
                                {modalError}
                            </div>
                        )}

                        <form onSubmit={handleSaveChanges} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>

                            {/* Storefront Visuals */}
                            <div>
                                <label style={{ display: 'block', fontSize: '13.5px', fontWeight: '700', color: '#111', marginBottom: '8px' }}>Storefront Visuals</label>
                                
                                <div style={{ position: 'relative', marginBottom: '2.5rem' }}>
                                    {/* Cover Image Upload */}
                                    <div
                                        onClick={() => coverInputRef.current?.click()}
                                        style={{ height: '140px', border: '2px dashed #ECA1A6', borderRadius: '12px', backgroundColor: '#FFFDFD', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', overflow: 'hidden', position: 'relative', transition: 'border-color 0.2s' }}
                                    >
                                        {uploadingCover ? (
                                            <div style={{ width: '24px', height: '24px', border: '2px solid #E5E7EB', borderTop: '2px solid #B9001B', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }}></div>
                                        ) : coverImage ? (
                                            <img src={coverImage} alt="Cover Preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                        ) : (
                                            <>
                                                <ImageIcon />
                                                <p style={{ fontSize: '13px', fontWeight: '600', color: '#111', margin: '4px 0 2px 0' }}>Upload Cover Image</p>
                                                <p style={{ fontSize: '11px', color: '#888', margin: 0 }}>1200 x 400px (JPG/PNG)</p>
                                            </>
                                        )}
                                    </div>
                                    <input
                                        ref={coverInputRef}
                                        type="file"
                                        accept="image/*"
                                        style={{ display: 'none' }}
                                        onChange={handleCoverImageChange}
                                    />

                                    {/* Logo Image Upload */}
                                    <div
                                        onClick={() => logoInputRef.current?.click()}
                                        style={{ position: 'absolute', bottom: '-25px', left: '1.5rem', width: '70px', height: '70px', borderRadius: '50%', border: '2px dashed #ECA1A6', backgroundColor: '#FFFDFD', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', overflow: 'hidden', zIndex: 5, boxShadow: '0 4px 10px rgba(0,0,0,0.06)' }}
                                    >
                                        {uploadingLogo ? (
                                            <div style={{ width: '20px', height: '20px', border: '2px solid #E5E7EB', borderTop: '2px solid #B9001B', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }}></div>
                                        ) : logoImage ? (
                                            <img src={logoImage} alt="Logo Preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                        ) : (
                                            <CameraPlusIcon />
                                        )}
                                        <div style={{ position: 'absolute', bottom: '-2px', right: '-2px', width: '20px', height: '20px', backgroundColor: '#F3F4F6', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '2px solid #FFF' }}>
                                            <StorefrontIcon />
                                        </div>
                                    </div>
                                    <input
                                        ref={logoInputRef}
                                        type="file"
                                        accept="image/*"
                                        style={{ display: 'none' }}
                                        onChange={handleLogoImageChange}
                                    />
                                </div>
                            </div>

                            {/* Business Name */}
                            <div>
                                <label style={{ display: 'block', fontSize: '13.5px', fontWeight: '700', color: '#111', marginBottom: '8px' }}>Business Name <span style={{ color: '#B9001B' }}>*</span></label>
                                <input
                                    type="text"
                                    value={businessName}
                                    onChange={(e) => setBusinessName(e.target.value)}
                                    placeholder="Enter your official store name"
                                    required
                                    style={{ width: '100%', padding: '0.8rem 1rem', backgroundColor: '#F5F5F5', border: '1px solid #EAEAEA', borderRadius: '8px', fontSize: '14px', color: '#111', outline: 'none', boxSizing: 'border-box' }}
                                />
                            </div>

                            {/* Tagline */}
                            <div>
                                <label style={{ display: 'block', fontSize: '13.5px', fontWeight: '700', color: '#111', marginBottom: '8px' }}>Short Tagline</label>
                                <input
                                    type="text"
                                    value={tagline}
                                    onChange={(e) => setTagline(e.target.value)}
                                    placeholder="e.g. Premium Vintage Apparel"
                                    style={{ width: '100%', padding: '0.8rem 1rem', backgroundColor: '#F5F5F5', border: '1px solid #EAEAEA', borderRadius: '8px', fontSize: '14px', color: '#111', outline: 'none', boxSizing: 'border-box' }}
                                />
                            </div>

                            {/* Phone Number */}
                            <div>
                                <label style={{ display: 'block', fontSize: '13.5px', fontWeight: '700', color: '#111', marginBottom: '8px' }}>Phone Number <span style={{ color: '#B9001B' }}>*</span></label>
                                <div style={{ display: 'flex', gap: '0.75rem' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px', backgroundColor: '#FFFFFF', border: '1px solid #ECA1A6', borderRadius: '8px', padding: '0.75rem 0.5rem', width: '90px', justifyContent: 'center', boxSizing: 'border-box' }}>
                                        <select
                                            value={countryCode}
                                            onChange={(e) => setCountryCode(e.target.value)}
                                            style={{ border: 'none', outline: 'none', background: 'transparent', fontSize: '13.5px', fontWeight: '600', color: '#111', cursor: 'pointer', appearance: 'none', width: '100%', textAlign: 'center' }}
                                        >
                                            <option value="+1">🇺🇸 +1</option>
                                            <option value="+234">🇳🇬 +234</option>
                                            <option value="+44">🇬🇧 +44</option>
                                            <option value="+254">🇰🇪 +254</option>
                                            <option value="+27">🇿🇦 +27</option>
                                        </select>
                                        <ChevronDownIcon />
                                    </div>
                                    <input
                                        type="tel"
                                        value={phoneNumber}
                                        onChange={(e) => setPhoneNumber(e.target.value)}
                                        placeholder="7011285642"
                                        required
                                        style={{ flex: 1, padding: '0.8rem 1rem', backgroundColor: '#FFFFFF', border: '1px solid #ECA1A6', borderRadius: '8px', fontSize: '14px', color: '#111', outline: 'none', boxSizing: 'border-box' }}
                                    />
                                </div>
                            </div>

                            {/* Categories */}
                            <div>
                                <label style={{ display: 'block', fontSize: '13.5px', fontWeight: '700', color: '#111', marginBottom: '6px' }}>Categories (Choose up to 3) <span style={{ color: '#B9001B' }}>*</span></label>
                                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', margin: '4px 0 10px 0' }}>
                                    {categories.map((cat) => {
                                        const isSelected = selectedCategories.includes(cat.name);
                                        const Icon = cat.icon;
                                        return (
                                            <button
                                                type="button"
                                                key={cat.name}
                                                onClick={() => {
                                                    if (isSelected) {
                                                        setSelectedCategories(selectedCategories.filter(c => c !== cat.name));
                                                        setModalError(null);
                                                    } else {
                                                        if (selectedCategories.length >= 3) {
                                                            setModalError("You can only select up to 3 categories.");
                                                            return;
                                                        }
                                                        setSelectedCategories([...selectedCategories, cat.name]);
                                                        setModalError(null);
                                                    }
                                                }}
                                                style={{
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    gap: '6px',
                                                    padding: '6px 12px',
                                                    borderRadius: '20px',
                                                    border: isSelected ? '1px solid #B9001B' : '1px solid #E5E7EB',
                                                    backgroundColor: isSelected ? '#FFF0F2' : '#F9FAFB',
                                                    color: isSelected ? '#B9001B' : '#555555',
                                                    fontSize: '12.5px',
                                                    fontWeight: '600',
                                                    cursor: 'pointer',
                                                    transition: 'all 0.15s'
                                                }}
                                            >
                                                <Icon />
                                                {cat.name}
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>

                            {/* Location Grid */}
                            <div style={{ display: 'flex', gap: '1rem', flexDirection: mobile ? 'column' : 'row' }}>
                                <div style={{ flex: 1 }}>
                                    <label style={{ display: 'block', fontSize: '13.5px', fontWeight: '700', color: '#111', marginBottom: '8px' }}>Country</label>
                                    <select
                                        value={country}
                                        onChange={(e) => setCountry(e.target.value)}
                                        style={{ width: '100%', padding: '0.8rem 1rem', backgroundColor: '#F5F5F5', border: '1px solid #EAEAEA', borderRadius: '8px', fontSize: '14px', color: '#111', outline: 'none', boxSizing: 'border-box' }}
                                    >
                                        <option value="Nigeria">Nigeria</option>
                                    </select>
                                </div>
                                <div style={{ flex: 1 }}>
                                    <label style={{ display: 'block', fontSize: '13.5px', fontWeight: '700', color: '#111', marginBottom: '8px' }}>State / Province <span style={{ color: '#B9001B' }}>*</span></label>
                                    <input
                                        type="text"
                                        value={state}
                                        onChange={(e) => setState(e.target.value)}
                                        placeholder="e.g. Rivers State"
                                        required
                                        style={{ width: '100%', padding: '0.8rem 1rem', backgroundColor: '#F5F5F5', border: '1px solid #EAEAEA', borderRadius: '8px', fontSize: '14px', color: '#111', outline: 'none', boxSizing: 'border-box' }}
                                    />
                                </div>
                            </div>

                            {/* Address */}
                            <div>
                                <label style={{ display: 'block', fontSize: '13.5px', fontWeight: '700', color: '#111', marginBottom: '8px' }}>Street Address <span style={{ color: '#B9001B' }}>*</span></label>
                                <input
                                    type="text"
                                    value={address}
                                    onChange={(e) => setAddress(e.target.value)}
                                    placeholder="Enter your store street address"
                                    required
                                    style={{ width: '100%', padding: '0.8rem 1rem', backgroundColor: '#F5F5F5', border: '1px solid #EAEAEA', borderRadius: '8px', fontSize: '14px', color: '#111', outline: 'none', boxSizing: 'border-box' }}
                                />
                            </div>

                            {/* Actions */}
                            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end', marginTop: '1rem' }}>
                                <button
                                    type="button"
                                    onClick={() => setIsEditModalOpen(false)}
                                    style={{ padding: '0.75rem 1.5rem', backgroundColor: '#F3F4F6', color: '#1F2937', border: 'none', borderRadius: '8px', fontSize: '14.5px', fontWeight: '600', cursor: 'pointer' }}
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={saving}
                                    style={{ padding: '0.75rem 1.5rem', backgroundColor: '#B9001B', color: '#FFFFFF', border: 'none', borderRadius: '8px', fontSize: '14.5px', fontWeight: '600', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}
                                >
                                    {saving ? (
                                        <>
                                            <div style={{ width: '16px', height: '16px', border: '2px solid rgba(255,255,255,0.3)', borderTop: '2px solid white', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
                                            Saving...
                                        </>
                                    ) : 'Save Changes'}
                                </button>
                            </div>

                        </form>
                    </div>
                </div>
            )}

            <EditProductModal
                product={selectedProductToEdit}
                isOpen={isEditProductModalOpen}
                onClose={() => {
                    setIsEditProductModalOpen(false);
                    setSelectedProductToEdit(null);
                }}
                onSuccess={(updatedProd) => {
                    setProducts((prev) => prev.map((p) => p.$id === updatedProd.$id ? updatedProd : p));
                }}
                onDeleteSuccess={() => {
                    setProducts((prev) => prev.filter((p) => p.$id !== selectedProductToEdit?.$id));
                }}
            />
        </div>
    );
}