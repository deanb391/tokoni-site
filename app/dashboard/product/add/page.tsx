"use client";

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'nextjs-toploader/app';

import { useUser } from '@/context/UserContext';
import { uploadToServer } from '@/lib/upload';
import { createProduct } from '@/lib/api/products';

// --- Inline SVG Icons ---
const CloseIcon = () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#111" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <line x1="18" y1="6" x2="6" y2="18"></line>
        <line x1="6" y1="6" x2="18" y2="18"></line>
    </svg>
);

const UploadImageIcon = () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#B9001B" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
        <circle cx="8.5" cy="8.5" r="1.5"></circle>
        <polyline points="21 15 16 10 5 21"></polyline>
        <path d="M14 14.5l2-2 2 2"></path>
        <path d="M16 12.5v6"></path>
    </svg>
);

const PlusIcon = () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#888" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <line x1="12" y1="5" x2="12" y2="19"></line>
        <line x1="5" y1="12" x2="19" y2="12"></line>
    </svg>
);

const ChevronDownIcon = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#444" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="6 9 12 15 18 9"></polyline>
    </svg>
);

const XSmallIcon = () => (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#444" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <line x1="18" y1="6" x2="6" y2="18"></line>
        <line x1="6" y1="6" x2="18" y2="18"></line>
    </svg>
);

const CheckIcon = () => (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#0284C7" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="20 6 9 17 4 12"></polyline>
    </svg>
);

const CATEGORIES = [
    'Fashion',
    'Beauty',
    'Electronics',
    'Sports',
    'Food',
    'Furniture',
    'Health',
    'Phones',
    'Gaming',
    'Books',
    'Art & Crafts',
    'Automotive',
    'Jewelry',
    'Home Decor',
    'Toys & Hobbies',
    'Pets Supplies'
];

export default function AddProductScreen() {
    const router = useRouter();
    const { user, vendor, loading } = useUser();

    const [isMobile, setIsMobile] = useState(false);
    const [mounted, setMounted] = useState(false);

    // Responsive layout tracking
    useEffect(() => {
        setMounted(true);
        const handleResize = () => setIsMobile(window.innerWidth < 1024);
        handleResize();
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    // Redirect guest or non-vendor users
    useEffect(() => {
        if (mounted && !loading) {
            if (!user) {
                router.push('/signin');
            } else if (!vendor) {
                router.push('/dashboard');
            }
        }
    }, [mounted, loading, user, vendor, router]);

    // Product state variables
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [price, setPrice] = useState('');
    const [discountPrice, setDiscountPrice] = useState('');
    const [stock, setStock] = useState('');
    const [category, setCategory] = useState('');
    const [condition, setCondition] = useState('New');
    const [tags, setTags] = useState<string[]>([]);
    const [tagInput, setTagInput] = useState('');
    const [images, setImages] = useState<string[]>([]);
    const [available, setAvailable] = useState(true);

    // UI Feedback state
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [publishing, setPublishing] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const fileInputRef = useRef<HTMLInputElement | null>(null);
    const dropdownRef = useRef<HTMLDivElement | null>(null);

    // Close dropdown on outside click
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsDropdownOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const mobile = mounted ? isMobile : false;

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (!files || files.length === 0) return;

        setUploading(true);
        setError(null);

        try {
            const uploadPromises = Array.from(files).map(async (file) => {
                const url = await uploadToServer(file, "products", "image");
                return url;
            });

            const urls = await Promise.all(uploadPromises);
            setImages((prev) => {
                const combined = [...prev, ...urls];
                return combined.slice(0, 8); // Max 8 images
            });
        } catch (err: any) {
            console.error("Image upload failed:", err);
            setError(err.message || "Failed to upload images");
        } finally {
            setUploading(false);
        }
    };

    const handleRemoveImage = (index: number) => {
        setImages((prev) => prev.filter((_, i) => i !== index));
    };

    const handleTagKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            const val = tagInput.trim();
            if (val && !tags.includes(val)) {
                setTags([...tags, val]);
                setTagInput('');
            }
        }
    };

    const handleRemoveTag = (tagToRemove: string) => {
        setTags(tags.filter((t) => t !== tagToRemove));
    };

    const handlePublish = async (isDraft: boolean) => {
        if (!vendor?.$id) {
            setError("You must have a storefront to publish products.");
            return;
        }

        if (!name.trim()) {
            setError("Product Name is required.");
            return;
        }
        if (!description.trim()) {
            setError("Description is required.");
            return;
        }
        if (!price || parseFloat(price) <= 0) {
            setError("A valid base price is required.");
            return;
        }
        if (!stock || parseInt(stock, 10) < 0) {
            setError("Stock quantity cannot be negative.");
            return;
        }
        if (!category) {
            setError("Please select a product category.");
            return;
        }
        if (images.length === 0) {
            setError("Please upload at least one product image.");
            return;
        }

        setPublishing(true);
        setError(null);

        try {
            const draftPayload = {
                name: name.trim(),
                description: description.trim(),
                price: parseFloat(price),
                discountPrice: discountPrice ? parseFloat(discountPrice) : null,
                stock: parseInt(stock, 10),
                category,
                condition,
                tags,
                images,
                available: isDraft ? false : available,
            };

            await createProduct(draftPayload, vendor.$id);
            router.push('/dashboard');
        } catch (err: any) {
            console.error("Product publication failed:", err);
            setError(err.message || "Failed to create product. Please try again.");
        } finally {
            setPublishing(false);
        }
    };

    // Reusable Input Wrapper Style
    const inputStyle: React.CSSProperties = {
        width: '100%',
        padding: '0.85rem 1rem',
        border: '1px solid #E5E7EB',
        borderRadius: '8px',
        fontSize: '14px',
        color: '#111',
        backgroundColor: '#FFFFFF',
        outline: 'none',
        boxSizing: 'border-box',
        transition: 'border-color 0.2s',
    };

    const labelStyle: React.CSSProperties = {
        display: 'block',
        fontSize: '14px',
        fontWeight: '600',
        color: '#111',
        marginBottom: '8px'
    };

    const reqAsterisk = <span style={{ color: '#B9001B' }}>*</span>;

    const cardStyle: React.CSSProperties = {
        backgroundColor: '#FFFFFF',
        borderRadius: '12px',
        padding: '2rem',
        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.02)',
        boxSizing: 'border-box',
        width: '100%',
    };

    if (loading || (user && !vendor)) {
        return (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '80vh', fontFamily: 'var(--font-body), sans-serif' }}>
                <div style={{ width: '40px', height: '40px', border: '3px solid #E5E7EB', borderTop: '3px solid #B9001B', borderRadius: '50%', animation: 'spin 1s linear infinite', marginBottom: '1.5rem' }}></div>
                <p style={{ color: '#555', fontSize: '15px', fontWeight: '500' }}>Validating storefront access...</p>
                <style jsx global>{`
                    @keyframes spin {
                        to { transform: rotate(360deg); }
                    }
                `}</style>
            </div>
        );
    }

    return (
        <div style={{ backgroundColor: '#F6F6F6', minHeight: '100vh', fontFamily: 'var(--font-body), sans-serif' }}>

            {/* ================= HEADER ================= */}
            <header
                style={{
                    position: 'sticky',
                    top: 0,
                    zIndex: 50,
                    backgroundColor: '#FFFFFF',
                    borderBottom: '1px solid #EDEDED',
                    padding: mobile ? '1rem' : '1.25rem 2rem',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    flexWrap: 'wrap',
                    gap: '1rem'
                }}
            >
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <button
                        onClick={() => router.push('/dashboard')}
                        style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', padding: 0 }}
                    >
                        <CloseIcon />
                    </button>
                    <h1 style={{ fontSize: '22px', fontWeight: '600', color: '#111', margin: 0 }}>Add New Product</h1>
                </div>

                <div style={{ display: 'flex', gap: '1rem', width: mobile ? '100%' : 'auto' }}>
                    <button
                        onClick={() => handlePublish(true)}
                        disabled={publishing}
                        style={{
                            flex: mobile ? 1 : 'none',
                            backgroundColor: '#F3F4F6',
                            color: '#111',
                            border: 'none',
                            borderRadius: '8px',
                            padding: '0.6rem 1.5rem',
                            fontSize: '14px',
                            fontWeight: '600',
                            cursor: 'pointer',
                            opacity: publishing ? 0.6 : 1,
                        }}
                    >
                        Save as Draft
                    </button>
                    <button
                        onClick={() => handlePublish(false)}
                        disabled={publishing}
                        style={{
                            flex: mobile ? 1 : 'none',
                            backgroundColor: '#B9001B',
                            color: '#FFFFFF',
                            border: 'none',
                            borderRadius: '8px',
                            padding: '0.6rem 1.5rem',
                            fontSize: '14px',
                            fontWeight: '600',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '8px',
                            opacity: publishing ? 0.6 : 1,
                        }}
                    >
                        {publishing ? (
                            <>
                                <div style={{ width: '14px', height: '14px', border: '2px solid rgba(255,255,255,0.3)', borderTop: '2px solid white', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
                                Publishing...
                            </>
                        ) : 'Publish Product'}
                    </button>
                </div>
            </header>

            {/* Error Message banner */}
            {error && (
                <div style={{ maxWidth: '1200px', margin: '1.5rem auto 0', padding: '0 2rem', boxSizing: 'border-box' }}>
                    <div style={{ backgroundColor: '#FFF0F1', border: '1px solid #FFCAD1', borderRadius: '12px', padding: '1rem 1.5rem', color: '#B9001B', fontSize: '14.5px', fontWeight: '600' }}>
                        {error}
                    </div>
                </div>
            )}

            {/* ================= MAIN CONTENT ================= */}
            <main
                style={{
                    maxWidth: '1200px',
                    margin: '0 auto',
                    padding: mobile ? '1.5rem 1rem' : '2.5rem 2rem',
                    display: 'flex',
                    flexDirection: mobile ? 'column' : 'row',
                    gap: '2rem',
                    alignItems: 'flex-start'
                }}
            >
                {/* ================= LEFT COLUMN ================= */}
                <div style={{ flex: mobile ? 'none' : 2, width: '100%', display: 'flex', flexDirection: 'column', gap: '2rem' }}>

                    {/* Card 1: Product Media */}
                    <section style={cardStyle}>
                        <h2 style={{ fontSize: '20px', fontWeight: '600', margin: '0 0 0.5rem 0' }}>Product Media</h2>
                        <p style={{ fontSize: '14px', color: '#666', margin: '0 0 1.5rem 0' }}>Add up to 8 images. The first image will be the cover.</p>

                        {/* Drag & Drop Upload Area */}
                        <div
                            onClick={() => fileInputRef.current?.click()}
                            style={{
                                border: '2px dashed #ECA1A6',
                                backgroundColor: '#FFFDFD',
                                borderRadius: '12px',
                                padding: '3rem 1rem',
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                                justifyContent: 'center',
                                cursor: 'pointer',
                                marginBottom: '1.5rem'
                            }}
                        >
                            <div style={{ width: '56px', height: '56px', borderRadius: '50%', backgroundColor: '#FFF0F2', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1rem' }}>
                                <UploadImageIcon />
                            </div>
                            <p style={{ fontSize: '15px', fontWeight: '600', color: '#111', margin: '0 0 0.5rem 0' }}>
                                {uploading ? 'Uploading images...' : 'Click to upload or drag and drop'}
                            </p>
                            <p style={{ fontSize: '13px', color: '#888', margin: 0 }}>SVG, PNG, JPG or GIF (max. 5MB)</p>
                            <input
                                ref={fileInputRef}
                                type="file"
                                accept="image/*"
                                multiple
                                onChange={handleImageUpload}
                                style={{ display: 'none' }}
                            />
                        </div>

                        {/* Thumbnail Row */}
                        <div style={{ display: 'flex', gap: '1rem', overflowX: 'auto', paddingBottom: '0.5rem' }}>
                            {images.map((url, idx) => (
                                <div key={url} style={{ width: '140px', height: '140px', borderRadius: '12px', position: 'relative', flexShrink: 0, overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid #D1D5DB' }}>
                                    <img src={url} alt={`Product Image ${idx + 1}`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                    {idx === 0 && (
                                        <span style={{ position: 'absolute', top: '8px', left: '8px', backgroundColor: '#B9001B', color: '#FFF', fontSize: '10px', fontWeight: '700', padding: '4px 8px', borderRadius: '4px', zIndex: 2 }}>COVER</span>
                                    )}
                                    <button
                                        type="button"
                                        onClick={() => handleRemoveImage(idx)}
                                        style={{
                                            position: 'absolute',
                                            top: '8px',
                                            right: '8px',
                                            backgroundColor: 'rgba(255, 255, 255, 0.9)',
                                            border: 'none',
                                            borderRadius: '50%',
                                            width: '24px',
                                            height: '24px',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            cursor: 'pointer',
                                            zIndex: 5,
                                        }}
                                    >
                                        <XSmallIcon />
                                    </button>
                                </div>
                            ))}

                            {/* Empty Slots */}
                            {images.length < 8 && (
                                <div
                                    onClick={() => fileInputRef.current?.click()}
                                    style={{ width: '140px', height: '140px', borderRadius: '12px', border: '2px dashed #E5E7EB', backgroundColor: '#FAFAFA', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, cursor: 'pointer' }}
                                >
                                    {uploading ? (
                                        <div style={{ width: '24px', height: '24px', border: '2px solid #E5E7EB', borderTop: '2px solid #B9001B', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
                                    ) : (
                                        <PlusIcon />
                                    )}
                                </div>
                            )}
                        </div>
                    </section>

                    {/* Card 2: Basic Information */}
                    <section style={cardStyle}>
                        <h2 style={{ fontSize: '20px', fontWeight: '600', margin: '0 0 1.5rem 0' }}>Basic Information</h2>

                        <div style={{ marginBottom: '1.5rem' }}>
                            <label style={labelStyle}>Product Name {reqAsterisk}</label>
                            <input
                                type="text"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                placeholder="e.g. Minimalist Ceramic Vase"
                                style={{ ...inputStyle, border: '1px solid #ECA1A6' }}
                            />
                        </div>

                        <div>
                            <label style={labelStyle}>Description {reqAsterisk}</label>
                            <textarea
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                placeholder="Describe your product's features, materials, and benefits..."
                                style={{ ...inputStyle, minHeight: '140px', resize: 'vertical', border: '1px solid #ECA1A6' }}
                            />
                        </div>
                    </section>
                </div>

                {/* ================= RIGHT COLUMN ================= */}
                <div style={{ flex: mobile ? 'none' : 1, width: '100%', display: 'flex', flexDirection: 'column', gap: '2rem', minWidth: mobile ? 'auto' : '340px' }}>

                    {/* Card 3: Pricing */}
                    <section style={cardStyle}>
                        <h2 style={{ fontSize: '20px', fontWeight: '600', margin: '0 0 1.5rem 0' }}>Pricing</h2>

                        <div style={{ marginBottom: '1.5rem' }}>
                            <label style={labelStyle}>Base Price {reqAsterisk}</label>
                            <div style={{ display: 'flex', alignItems: 'center', border: '1px solid #ECA1A6', borderRadius: '8px', backgroundColor: '#FFF' }}>
                                <span style={{ paddingLeft: '1rem', color: '#666', fontSize: '15px' }}>₦</span>
                                <input
                                    type="number"
                                    value={price}
                                    onChange={(e) => setPrice(e.target.value)}
                                    placeholder="0.00"
                                    step="0.01"
                                    min="0"
                                    style={{ ...inputStyle, border: 'none', paddingLeft: '0.5rem' }}
                                />
                            </div>
                        </div>

                        <div>
                            <label style={labelStyle}>Discount Price (Optional)</label>
                            <div style={{ display: 'flex', alignItems: 'center', border: '1px solid #ECA1A6', borderRadius: '8px', backgroundColor: '#FFF' }}>
                                <span style={{ paddingLeft: '1rem', color: '#666', fontSize: '15px' }}>₦</span>
                                <input
                                    type="number"
                                    value={discountPrice}
                                    onChange={(e) => setDiscountPrice(e.target.value)}
                                    placeholder="0.00"
                                    step="0.01"
                                    min="0"
                                    style={{ ...inputStyle, border: 'none', paddingLeft: '0.5rem' }}
                                />
                            </div>
                        </div>
                    </section>

                    {/* Card 4: Inventory */}
                    <section style={cardStyle}>
                        <h2 style={{ fontSize: '20px', fontWeight: '600', margin: '0 0 1.5rem 0' }}>Inventory</h2>
                        <div>
                            <label style={labelStyle}>Stock Quantity {reqAsterisk}</label>
                            <input
                                type="number"
                                value={stock}
                                onChange={(e) => setStock(e.target.value)}
                                placeholder="0"
                                min="0"
                                style={{ ...inputStyle, border: '1px solid #ECA1A6' }}
                            />
                        </div>
                    </section>

                    {/* Card 5: Organization */}
                    <section style={cardStyle}>
                        <h2 style={{ fontSize: '20px', fontWeight: '600', margin: '0 0 1.5rem 0' }}>Organization</h2>

                        {/* Category Dropdown */}
                        <div ref={dropdownRef} style={{ marginBottom: '1.5rem', position: 'relative' }}>
                            <label style={labelStyle}>Category {reqAsterisk}</label>
                            <div style={{ position: 'relative' }}>
                                <input
                                    type="text"
                                    value={category}
                                    readOnly
                                    onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                                    placeholder="Select a category"
                                    style={{ ...inputStyle, border: '1px solid #ECA1A6', cursor: 'pointer' }}
                                />
                                <div style={{ position: 'absolute', right: '14px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }}>
                                    <ChevronDownIcon />
                                </div>
                            </div>
                            {isDropdownOpen && (
                                <div style={{ position: 'absolute', top: '100%', left: 0, right: 0, backgroundColor: '#FFFFFF', border: '1px solid #E5E7EB', borderRadius: '8px', boxShadow: '0 4px 12px rgba(0,0,0,0.08)', zIndex: 60, maxHeight: '200px', overflowY: 'auto', marginTop: '4px' }}>
                                    {CATEGORIES.map((catName) => (
                                        <div
                                            key={catName}
                                            onClick={() => {
                                                setCategory(catName);
                                                setIsDropdownOpen(false);
                                            }}
                                            style={{ padding: '0.75rem 1rem', cursor: 'pointer', fontSize: '14px', color: '#333', backgroundColor: category === catName ? '#FFF0F2' : 'transparent', transition: 'background-color 0.15s' }}
                                        >
                                            {catName}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Condition Radio */}
                        <div style={{ marginBottom: '1.5rem' }}>
                            <label style={labelStyle}>Condition</label>
                            <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'center' }}>
                                <label
                                    onClick={() => setCondition('New')}
                                    style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '15px', color: '#111' }}
                                >
                                    <div style={{ width: '18px', height: '18px', borderRadius: '50%', border: condition === 'New' ? '5px solid #B9001B' : '1px solid #CCC', boxSizing: 'border-box', transition: 'border-width 0.15s' }}></div>
                                    New
                                </label>
                                <label
                                    onClick={() => setCondition('Used')}
                                    style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '15px', color: '#111' }}
                                >
                                    <div style={{ width: '18px', height: '18px', borderRadius: '50%', border: condition === 'Used' ? '5px solid #B9001B' : '1px solid #CCC', boxSizing: 'border-box', transition: 'border-width 0.15s' }}></div>
                                    Used
                                </label>
                            </div>
                        </div>

                        {/* Tags Input */}
                        <div>
                            <label style={labelStyle}>Tags</label>
                            <input
                                type="text"
                                value={tagInput}
                                onChange={(e) => setTagInput(e.target.value)}
                                onKeyDown={handleTagKeyDown}
                                placeholder="Press enter to add tags"
                                style={{ ...inputStyle, border: '1px solid #ECA1A6', marginBottom: '1rem' }}
                            />

                            {/* Tag Pills */}
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem' }}>
                                {tags.map((tag) => (
                                    <div key={tag} style={{ backgroundColor: '#F3F4F6', color: '#333', padding: '6px 12px', borderRadius: '20px', fontSize: '12.5px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                        {tag}
                                        <button
                                            type="button"
                                            onClick={() => handleRemoveTag(tag)}
                                            style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer', display: 'flex', alignItems: 'center' }}
                                        >
                                            <XSmallIcon />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </section>

                    {/* Card 6: Availability */}
                    <section style={{ ...cardStyle, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div>
                            <h2 style={{ fontSize: '18px', fontWeight: '600', margin: '0 0 0.25rem 0' }}>Availability</h2>
                            <p style={{ fontSize: '13px', color: '#666', margin: 0 }}>Make product visible on store</p>
                        </div>

                        {/* Custom Toggle Switch */}
                        <div
                            onClick={() => setAvailable(!available)}
                            style={{ width: '52px', height: '28px', backgroundColor: available ? '#B9001B' : '#E5E7EB', borderRadius: '14px', position: 'relative', cursor: 'pointer', transition: 'background-color 0.2s' }}
                        >
                            <div style={{ position: 'absolute', right: available ? '2px' : '26px', top: '2px', width: '24px', height: '24px', backgroundColor: '#FFF', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 1px 3px rgba(0,0,0,0.2)', transition: 'right 0.2s' }}>
                                {available && <CheckIcon />}
                            </div>
                        </div>
                    </section>

                </div>
            </main>
        </div>
    );
}