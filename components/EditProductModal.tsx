// components/EditProductModal.tsx
"use client";

import React, { useState, useEffect, useRef } from 'react';
import { uploadToServer } from '@/lib/upload';
import { editProduct, deleteProduct } from '@/lib/api/products';

// --- Inline SVG Icons ---
const CloseIcon = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#111" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
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
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#888" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <line x1="12" y1="5" x2="12" y2="19"></line>
        <line x1="5" y1="12" x2="19" y2="12"></line>
    </svg>
);

const ChevronDownIcon = () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#444" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
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

const TrashIcon = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="3 6 5 6 21 6"></polyline>
        <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
        <line x1="10" y1="11" x2="10" y2="17"></line>
        <line x1="14" y1="11" x2="14" y2="17"></line>
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

interface EditProductModalProps {
    product: any;
    isOpen: boolean;
    onClose: () => void;
    onSuccess: (updatedProduct: any) => void;
    onDeleteSuccess?: () => void;
}

export default function EditProductModal({
    product,
    isOpen,
    onClose,
    onSuccess,
    onDeleteSuccess
}: EditProductModalProps) {
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

    // Dropdown & Upload State
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [deleting, setDeleting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const fileInputRef = useRef<HTMLInputElement | null>(null);
    const dropdownRef = useRef<HTMLDivElement | null>(null);

    // Load initial values from product
    useEffect(() => {
        if (product) {
            setName(product.name || '');
            setDescription(product.description || '');
            setPrice(product.price ? String(product.price) : '');
            setDiscountPrice(product.discountPrice ? String(product.discountPrice) : '');
            setStock(product.stock ? String(product.stock) : '');
            setCategory(product.category || '');
            setCondition(product.condition || 'New');
            setTags(product.tags || []);
            setImages(product.images || []);
            setAvailable(product.available !== false);
            setError(null);
        }
    }, [product, isOpen]);

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

    if (!isOpen || !product) return null;

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

    const handleSave = async () => {
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

        setSaving(true);
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
                available,
            };

            const updated = await editProduct(product.$id, draftPayload);
            onSuccess(updated);
            onClose();
        } catch (err: any) {
            console.error("Product update failed:", err);
            setError(err.message || "Failed to update product. Please try again.");
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async () => {
        if (!window.confirm("Are you sure you want to delete this product? This action cannot be undone.")) {
            return;
        }

        setDeleting(true);
        setError(null);

        try {
            await deleteProduct(product.$id);
            if (onDeleteSuccess) {
                onDeleteSuccess();
            }
            onClose();
        } catch (err: any) {
            console.error("Product deletion failed:", err);
            setError(err.message || "Failed to delete product. Please try again.");
        } finally {
            setDeleting(false);
        }
    };

    // Styling Tokens
    const inputStyle: React.CSSProperties = {
        width: '100%',
        padding: '0.75rem 1rem',
        border: '1px solid #ECA1A6',
        borderRadius: '8px',
        fontSize: '14px',
        color: '#111',
        backgroundColor: '#FFFFFF',
        outline: 'none',
        boxSizing: 'border-box',
    };

    const labelStyle: React.CSSProperties = {
        display: 'block',
        fontSize: '13.5px',
        fontWeight: '600',
        color: '#111',
        marginBottom: '6px'
    };

    const reqAsterisk = <span style={{ color: '#B9001B' }}>*</span>;

    return (
        <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0,0,0,0.5)',
            backdropFilter: 'blur(4px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            padding: '1rem',
            boxSizing: 'border-box'
        }}>
            <div style={{
                backgroundColor: '#FFFFFF',
                borderRadius: '16px',
                width: '100%',
                maxWidth: '680px',
                maxHeight: '90vh',
                display: 'flex',
                flexDirection: 'column',
                boxShadow: '0 10px 25px rgba(0,0,0,0.15)',
                overflow: 'hidden'
            }}>
                {/* Header */}
                <div style={{
                    padding: '1.25rem 1.5rem',
                    borderBottom: '1px solid #EDEDED',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    backgroundColor: '#FFFFFF',
                }}>
                    <div>
                        <h2 style={{ fontSize: '18px', fontWeight: '700', color: '#111', margin: 0 }}>Edit Product</h2>
                        <p style={{ fontSize: '12px', color: '#666', margin: '2px 0 0 0' }}>Update your item details or tags</p>
                    </div>
                    <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '4px', display: 'flex', alignItems: 'center' }}>
                        <CloseIcon />
                    </button>
                </div>

                {/* Body Content */}
                <div style={{
                    padding: '1.5rem',
                    overflowY: 'auto',
                    flex: 1,
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '1.25rem'
                }}>
                    {error && (
                        <div style={{ backgroundColor: '#FFF0F1', border: '1px solid #FFCAD1', borderRadius: '8px', padding: '0.75rem 1rem', color: '#B9001B', fontSize: '13.5px', fontWeight: '600' }}>
                            {error}
                        </div>
                    )}

                    {/* Product Images Area */}
                    <div>
                        <label style={labelStyle}>Product Images {reqAsterisk} <span style={{ fontWeight: 'normal', color: '#666' }}>({images.length}/8)</span></label>
                        <div style={{ display: 'flex', gap: '0.75rem', overflowX: 'auto', paddingBottom: '0.5rem' }}>
                            {images.map((img, index) => (
                                <div key={index} style={{ width: '80px', height: '80px', borderRadius: '8px', border: '1px solid #E5E7EB', position: 'relative', flexShrink: 0, overflow: 'hidden' }}>
                                    <img src={img} alt="Product" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                    <button
                                        type="button"
                                        onClick={() => handleRemoveImage(index)}
                                        style={{ position: 'absolute', top: '4px', right: '4px', backgroundColor: 'rgba(0,0,0,0.6)', border: 'none', borderRadius: '50%', width: '18px', height: '18px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', padding: 0 }}
                                    >
                                        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#FFF" strokeWidth="3"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                                    </button>
                                    {index === 0 && (
                                        <span style={{ position: 'absolute', bottom: 0, left: 0, right: 0, backgroundColor: 'rgba(185, 0, 27, 0.85)', color: '#FFF', fontSize: '9px', fontWeight: 'bold', textAlign: 'center', padding: '2px 0' }}>Cover</span>
                                    )}
                                </div>
                            ))}

                            {images.length < 8 && (
                                <div
                                    onClick={() => fileInputRef.current?.click()}
                                    style={{ width: '80px', height: '80px', borderRadius: '8px', border: '2px dashed #ECA1A6', backgroundColor: '#FAFAFA', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', flexShrink: 0, cursor: 'pointer', gap: '4px' }}
                                >
                                    <UploadImageIcon />
                                    <span style={{ fontSize: '10px', color: '#B9001B', fontWeight: '600' }}>{uploading ? '...' : 'Add'}</span>
                                </div>
                            )}
                        </div>
                        <input
                            ref={fileInputRef}
                            type="file"
                            accept="image/*"
                            multiple
                            onChange={handleImageUpload}
                            style={{ display: 'none' }}
                        />
                    </div>

                    {/* Product Name */}
                    <div>
                        <label style={labelStyle}>Product Name {reqAsterisk}</label>
                        <input
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="e.g. Minimalist Ceramic Vase"
                            style={inputStyle}
                        />
                    </div>

                    {/* Description */}
                    <div>
                        <label style={labelStyle}>Description {reqAsterisk}</label>
                        <textarea
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            placeholder="Describe the product condition, features, or size details..."
                            rows={3}
                            style={{ ...inputStyle, fontFamily: 'inherit', resize: 'vertical' }}
                        />
                    </div>

                    {/* Pricing & Stock Row */}
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem' }}>
                        <div>
                            <label style={labelStyle}>Base Price {reqAsterisk}</label>
                            <div style={{ display: 'flex', alignItems: 'center', border: '1px solid #ECA1A6', borderRadius: '8px', backgroundColor: '#FFF' }}>
                                <span style={{ paddingLeft: '0.75rem', color: '#666', fontSize: '14px' }}>₦</span>
                                <input
                                    type="number"
                                    value={price}
                                    onChange={(e) => setPrice(e.target.value)}
                                    placeholder="0.00"
                                    style={{ ...inputStyle, border: 'none', paddingLeft: '0.35rem' }}
                                />
                            </div>
                        </div>
                        <div>
                            <label style={labelStyle}>Discount Price</label>
                            <div style={{ display: 'flex', alignItems: 'center', border: '1px solid #ECA1A6', borderRadius: '8px', backgroundColor: '#FFF' }}>
                                <span style={{ paddingLeft: '0.75rem', color: '#666', fontSize: '14px' }}>₦</span>
                                <input
                                    type="number"
                                    value={discountPrice}
                                    onChange={(e) => setDiscountPrice(e.target.value)}
                                    placeholder="0.00"
                                    style={{ ...inputStyle, border: 'none', paddingLeft: '0.35rem' }}
                                />
                            </div>
                        </div>
                        <div>
                            <label style={labelStyle}>Stock Qty {reqAsterisk}</label>
                            <input
                                type="number"
                                value={stock}
                                onChange={(e) => setStock(e.target.value)}
                                placeholder="0"
                                style={inputStyle}
                            />
                        </div>
                    </div>

                    {/* Category & Condition Row */}
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                        {/* Category Dropdown */}
                        <div ref={dropdownRef} style={{ position: 'relative' }}>
                            <label style={labelStyle}>Category {reqAsterisk}</label>
                            <div style={{ position: 'relative' }}>
                                <input
                                    type="text"
                                    value={category}
                                    readOnly
                                    onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                                    placeholder="Select a category"
                                    style={{ ...inputStyle, cursor: 'pointer' }}
                                />
                                <div style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }}>
                                    <ChevronDownIcon />
                                </div>
                            </div>
                            {isDropdownOpen && (
                                <div style={{ position: 'absolute', bottom: '100%', left: 0, right: 0, backgroundColor: '#FFFFFF', border: '1px solid #E5E7EB', borderRadius: '8px', boxShadow: '0 -4px 12px rgba(0,0,0,0.08)', zIndex: 1100, maxHeight: '180px', overflowY: 'auto', marginBottom: '4px' }}>
                                    {CATEGORIES.map((catName) => (
                                        <div
                                            key={catName}
                                            onClick={() => {
                                                setCategory(catName);
                                                setIsDropdownOpen(false);
                                            }}
                                            style={{ padding: '8px 12px', fontSize: '13.5px', color: '#333', cursor: 'pointer', backgroundColor: category === catName ? '#FFF0F2' : 'transparent', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
                                        >
                                            {catName}
                                            {category === catName && <CheckIcon />}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Condition & Available Toggles */}
                        <div>
                            <label style={labelStyle}>Condition {reqAsterisk}</label>
                            <div style={{ display: 'flex', gap: '1.25rem', height: '40px', alignItems: 'center' }}>
                                <label
                                    onClick={() => setCondition('New')}
                                    style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer', fontSize: '14px', color: '#111' }}
                                >
                                    <input type="radio" checked={condition === 'New'} readOnly style={{ accentColor: '#B9001B' }} />
                                    New
                                </label>
                                <label
                                    onClick={() => setCondition('Used')}
                                    style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer', fontSize: '14px', color: '#111' }}
                                >
                                    <input type="radio" checked={condition === 'Used'} readOnly style={{ accentColor: '#B9001B' }} />
                                    Used
                                </label>
                            </div>
                        </div>
                    </div>

                    {/* Availability toggle & Tags */}
                    <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 0.8fr', gap: '1rem', alignItems: 'center' }}>
                        <div>
                            <label style={labelStyle}>Tags <span style={{ fontWeight: 'normal', color: '#888' }}>(Press Enter to add)</span></label>
                            <input
                                type="text"
                                value={tagInput}
                                onChange={(e) => setTagInput(e.target.value)}
                                onKeyDown={handleTagKeyDown}
                                placeholder="Add keywords..."
                                style={inputStyle}
                            />
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
                            <label style={labelStyle}>Is Available</label>
                            <div
                                onClick={() => setAvailable(!available)}
                                style={{ width: '48px', height: '24px', backgroundColor: available ? '#B9001B' : '#E5E7EB', borderRadius: '12px', position: 'relative', cursor: 'pointer', transition: 'background-color 0.2s' }}
                            >
                                <div style={{ width: '18px', height: '18px', backgroundColor: '#FFFFFF', borderRadius: '50%', position: 'absolute', top: '3px', left: available ? '27px' : '3px', transition: 'left 0.2s', boxShadow: '0 1px 3px rgba(0,0,0,0.15)' }} />
                            </div>
                        </div>
                    </div>

                    {/* Tag Pills */}
                    {tags.length > 0 && (
                        <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginTop: '-0.25rem' }}>
                            {tags.map((tag) => (
                                <div key={tag} style={{ backgroundColor: '#F3F4F6', color: '#333', padding: '4px 10px', borderRadius: '20px', fontSize: '12px', display: 'flex', alignItems: 'center', gap: '4px' }}>
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
                    )}
                </div>

                {/* Footer Buttons */}
                <div style={{
                    padding: '1.25rem 1.5rem',
                    borderTop: '1px solid #EDEDED',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    backgroundColor: '#FAFAFA'
                }}>
                    <button
                        onClick={handleDelete}
                        disabled={deleting || saving}
                        style={{
                            backgroundColor: 'transparent',
                            color: '#ef4444',
                            border: '1px solid #fee2e2',
                            borderRadius: '8px',
                            padding: '0.6rem 1.25rem',
                            fontSize: '13.5px',
                            fontWeight: '600',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '6px',
                            opacity: deleting ? 0.6 : 1
                        }}
                    >
                        <TrashIcon />
                        {deleting ? 'Deleting...' : 'Delete'}
                    </button>

                    <div style={{ display: 'flex', gap: '0.75rem' }}>
                        <button
                            onClick={onClose}
                            disabled={saving}
                            style={{
                                backgroundColor: '#FFFFFF',
                                color: '#4b5563',
                                border: '1px solid #d1d5db',
                                borderRadius: '8px',
                                padding: '0.6rem 1.25rem',
                                fontSize: '13.5px',
                                fontWeight: '600',
                                cursor: 'pointer'
                            }}
                        >
                            Cancel
                        </button>
                        <button
                            onClick={handleSave}
                            disabled={saving || deleting || uploading}
                            style={{
                                backgroundColor: '#B9001B',
                                color: '#FFFFFF',
                                border: 'none',
                                borderRadius: '8px',
                                padding: '0.6rem 1.5rem',
                                fontSize: '13.5px',
                                fontWeight: '600',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '8px',
                                opacity: saving || uploading ? 0.6 : 1
                            }}
                        >
                            {saving ? 'Saving...' : 'Save Changes'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
