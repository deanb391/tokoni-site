"use client";

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useUser } from '@/context/UserContext';
import { account, updateUser, updateAccountPassword, signIn } from '@/lib/services/auth.service';
import { uploadToServer } from '@/lib/upload';

const BRAND_RED = "#B9001B";

// --- Inline SVG Icon Components ---
const ChevronRightIcon = ({ color = "#888" }) => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="9 18 15 12 9 6"></polyline>
    </svg>
);

const UserIcon = ({ color = "#B9001B" }) => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
        <circle cx="12" cy="7" r="4"></circle>
    </svg>
);

const OrderIcon = ({ color = "#B9001B" }) => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
        <polyline points="14 2 14 8 20 8"></polyline>
        <line x1="16" y1="13" x2="8" y2="13"></line>
        <line x1="16" y1="17" x2="8" y2="17"></line>
        <polyline points="10 9 9 9 8 9"></polyline>
    </svg>
);

const BookmarkIcon = ({ color = "#B9001B" }) => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"></path>
    </svg>
);

const StoreIcon = ({ color = "#B9001B" }) => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
        <polyline points="9 22 9 12 15 12 15 22"></polyline>
    </svg>
);

const BellIcon = ({ color = "#B9001B" }) => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path>
        <path d="M13.73 21a2 2 0 0 1-3.46 0"></path>
    </svg>
);

const SettingsIcon = ({ color = "#B9001B" }) => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="3"></circle>
        <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path>
    </svg>
);

const HelpIcon = ({ color = "#B9001B" }) => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10"></circle>
        <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"></path>
        <line x1="12" y1="17" x2="12.01" y2="17"></line>
    </svg>
);

const LogoutIcon = ({ color = "#B9001B" }) => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
        <polyline points="16 17 21 12 16 7"></polyline>
        <line x1="21" y1="12" x2="9" y2="12"></line>
    </svg>
);

const EditIcon = ({ color = "#FFFFFF" }) => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
        <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
    </svg>
);

const LockIcon = ({ color = "#B9001B" }) => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
        <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
    </svg>
);

const TrashIcon = ({ color = "#B9001B" }) => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="3 6 5 6 21 6"></polyline>
        <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
        <line x1="10" y1="11" x2="10" y2="17"></line>
        <line x1="14" y1="11" x2="14" y2="17"></line>
    </svg>
);

const BackIcon = ({ color = "#111" }) => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <line x1="19" y1="12" x2="5" y2="12"></line>
        <polyline points="12 19 5 12 12 5"></polyline>
    </svg>
);

export default function MenuScreen() {
    const router = useRouter();
    const { user, vendor, refreshUser, loading } = useUser();
    const [mounted, setMounted] = useState(false);
    const [isMobile, setIsMobile] = useState(false);

    // View state
    const [currentView, setCurrentView] = useState<'menu' | 'account' | 'change-password' | 'settings'>('menu');

    // UI Toast feedback
    const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

    // Edit Profile state
    const [showEditModal, setShowEditModal] = useState(false);
    const [editUsername, setEditUsername] = useState('');
    const [avatarFile, setAvatarFile] = useState<File | null>(null);
    const [avatarPreview, setAvatarPreview] = useState('');
    const [uploadingImage, setUploadingImage] = useState(false);
    const [savingProfile, setSavingProfile] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Change Password state
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [changingPassword, setChangingPassword] = useState(false);

    // Deactivate state
    const [showDeactivateModal, setShowDeactivateModal] = useState(false);
    const [deactivatePassword, setDeactivatePassword] = useState('');
    const [deactivating, setDeactivating] = useState(false);

    // Settings panel simulated states
    const [pushEnabled, setPushEnabled] = useState(true);
    const [emailEnabled, setEmailEnabled] = useState(true);
    const [darkMode, setDarkMode] = useState(false);
    const [currency, setCurrency] = useState('NGN');

    useEffect(() => {
        setMounted(true);
        const handleResize = () => setIsMobile(window.innerWidth < 768);
        handleResize();
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    // Redirect to signin if not authenticated
    useEffect(() => {
        if (mounted && !loading && !user) {
            router.push('/signin');
        }
    }, [user, loading, mounted, router]);

    // Update form values once user object is available
    useEffect(() => {
        if (user) {
            setEditUsername(user.username || '');
        }
    }, [user]);

    const showToast = (message: string, type: 'success' | 'error' = 'success') => {
        setToast({ message, type });
        setTimeout(() => setToast(null), 4000);
    };

    const handleLogout = async () => {
        try {
            await account.deleteSession("current");
            await refreshUser();
            showToast("Successfully logged out");
            router.push("/signin");
        } catch (err) {
            console.error("Logout failed:", err);
            showToast("Failed to logout. Please try again.", "error");
        }
    };

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setAvatarFile(file);
            setAvatarPreview(URL.createObjectURL(file));
        }
    };

    const handleSaveProfile = async () => {
        if (!user) return;
        setSavingProfile(true);
        try {
            let uploadedUrl = user.avatar;

            if (avatarFile) {
                setUploadingImage(true);
                uploadedUrl = await uploadToServer(avatarFile, 'profiles', 'image');
                setUploadingImage(false);
            }

            await updateUser({
                userId: user.$id,
                username: editUsername,
                avatar: uploadedUrl
            });

            await refreshUser();
            showToast("Profile details updated successfully!");
            setShowEditModal(false);
            setAvatarFile(null);
        } catch (err: any) {
            console.error(err);
            showToast(err.message || "Failed to update profile", "error");
        } finally {
            setSavingProfile(false);
            setUploadingImage(false);
        }
    };

    const handleChangePasswordSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!currentPassword || !newPassword) {
            showToast("Please fill in all fields", "error");
            return;
        }

        setChangingPassword(true);
        try {
            await updateAccountPassword(newPassword, currentPassword);
            showToast("Password updated successfully!");
            setCurrentPassword('');
            setNewPassword('');
            setCurrentView('account');
        } catch (err: any) {
            console.error(err);
            showToast(err.message || "Failed to change password", "error");
        } finally {
            setChangingPassword(false);
        }
    };

    const handleDeactivateConfirm = async () => {
        if (!user) return;
        if (!deactivatePassword) {
            showToast("Please enter your current password to confirm", "error");
            return;
        }

        setDeactivating(true);
        try {
            // Confirm the password is correct by attempting a quick sign in
            await signIn(user.email, deactivatePassword);

            // Set deactivated status in database
            await updateUser({
                userId: user.$id,
                isDeactivated: true
            });

            // Log out
            await account.deleteSession("current");
            await refreshUser();

            showToast("Your account has been deactivated");
            setShowDeactivateModal(false);
            setDeactivatePassword('');
            router.push('/signin');
        } catch (err: any) {
            console.error(err);
            showToast(err.message || "Incorrect password or deactivation failed", "error");
        } finally {
            setDeactivating(false);
        }
    };

    const mobile = mounted ? isMobile : false;

    // Full Page Loader
    if (loading || !user) {
        return (
            <main style={{ paddingBottom: '4rem', fontFamily: 'var(--font-body), sans-serif' }}>
                <style>{`
                    @keyframes skeleton-pulse {
                        0%, 100% { background-color: #f3f4f6; }
                        50% { background-color: #e5e7eb; }
                    }
                    .skeleton-item {
                        animation: skeleton-pulse 1.8s cubic-bezier(0.4, 0, 0.6, 1) infinite;
                    }
                `}</style>
                {/* Profile Header Skeleton */}
                <div style={{
                    maxWidth: '900px',
                    margin: '0 auto',
                    padding: '0 2rem',
                    position: 'relative',
                    marginTop: '2.5rem',
                    display: 'flex',
                    alignItems: 'flex-end',
                    justifyContent: 'space-between',
                    gap: '1.5rem'
                }}>
                    <div style={{ display: 'flex', alignItems: 'flex-end', gap: '1.5rem' }}>
                        <div className="skeleton-item" style={{ width: '110px', height: '110px', borderRadius: '50%', border: '4px solid #ffffff' }} />
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', paddingBottom: '0.5rem' }}>
                            <div className="skeleton-item" style={{ width: '150px', height: '24px', borderRadius: '4px' }} />
                            <div className="skeleton-item" style={{ width: '100px', height: '14px', borderRadius: '4px' }} />
                        </div>
                    </div>
                    <div className="skeleton-item" style={{ width: '120px', height: '40px', borderRadius: '25px', paddingBottom: '0.5rem' }} />
                </div>
                {/* Menu Items List Skeleton */}
                <div style={{
                    maxWidth: '750px',
                    margin: '2.5rem auto 0',
                    backgroundColor: '#ffffff',
                    borderRadius: '16px',
                    boxShadow: '0 4px 20px rgba(0, 0, 0, 0.03)',
                    padding: '0.5rem 0',
                    width: mobile ? '90%' : '100%'
                }}>
                    {[...Array(6)].map((_, i) => (
                        <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1.15rem 1.5rem', borderBottom: i === 5 ? 'none' : '1px solid #f3f4f6' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                <div className="skeleton-item" style={{ width: '40px', height: '40px', borderRadius: '50%' }} />
                                <div className="skeleton-item" style={{ width: '120px', height: '16px', borderRadius: '4px' }} />
                            </div>
                            <div className="skeleton-item" style={{ width: '18px', height: '18px', borderRadius: '4px' }} />
                        </div>
                    ))}
                </div>
            </main>
        );
    }

    return (
        <main style={{ paddingBottom: '4rem', fontFamily: 'var(--font-body), sans-serif', minHeight: '80vh' }}>
            <style>{`
                @keyframes fadeIn {
                    from { opacity: 0; transform: translateY(8px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                .fade-in {
                    animation: fadeIn 0.35s cubic-bezier(0.16, 1, 0.3, 1) forwards;
                }
                .toggle-checkbox:checked + .toggle-label {
                    background-color: ${BRAND_RED} !important;
                }
                .toggle-checkbox:checked + .toggle-label:after {
                    left: calc(100% - 2px) !important;
                    transform: translateX(-100%) !important;
                }
            `}</style>

            {/* Toast Alerts */}
            {toast && (
                <div style={{
                    position: 'fixed',
                    bottom: '24px',
                    left: '50%',
                    transform: 'translateX(-50%)',
                    backgroundColor: toast.type === 'success' ? '#10b981' : '#ef4444',
                    color: '#ffffff',
                    padding: '12px 24px',
                    borderRadius: '9999px',
                    boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
                    zIndex: 1000,
                    fontWeight: '600',
                    fontSize: '0.9rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    animation: 'fadeIn 0.2s ease-out forwards'
                }}>
                    <span>{toast.type === 'success' ? '✓' : '✗'}</span>
                    <span>{toast.message}</span>
                </div>
            )}

            {/* SCREEN 1: MAIN MENU VIEW */}
            {currentView === 'menu' && (
                <div className="fade-in">
                    {/* Profile Information Section */}
                    <div
                        style={{
                            maxWidth: '900px',
                            margin: '0 auto',
                            padding: mobile ? '1.5rem' : '3rem 2rem 1.5rem',
                            display: 'flex',
                            flexDirection: mobile ? 'column' : 'row',
                            alignItems: mobile ? 'flex-start' : 'center',
                            justifyContent: 'space-between',
                            gap: '1.5rem',
                            borderBottom: '1px solid #f3f4f6'
                        }}
                    >
                        {/* Left Side: Avatar & Text */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
                            <div
                                style={{
                                    width: '90px',
                                    height: '90px',
                                    borderRadius: '50%',
                                    backgroundColor: '#E5E7EB',
                                    border: '1px solid #E5E7EB',
                                    boxShadow: '0 4px 10px rgba(0,0,0,0.05)',
                                    flexShrink: 0,
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    overflow: 'hidden'
                                }}
                            >
                                {user.avatar ? (
                                    <img src={user.avatar} alt="Avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                ) : (
                                    <span style={{ fontSize: '2.25rem', fontWeight: '800', color: '#4b5563' }}>
                                        {user.username?.[0]?.toUpperCase()}
                                    </span>
                                )}
                            </div>

                            <div>
                                <h1 style={{ fontSize: '26px', fontWeight: '700', color: '#111', margin: '0 0 0.25rem 0', letterSpacing: '-0.5px' }}>
                                    {user.username}
                                </h1>
                                <p style={{ fontSize: '14px', color: '#666666', margin: 0, fontWeight: '500' }}>
                                    {user.email}
                                </p>
                            </div>
                        </div>

                        {/* Edit Profile Quick Trigger */}
                        {/* <div style={{ display: 'flex', gap: '0.75rem', width: mobile ? '100%' : 'auto' }}>
                            <button
                                onClick={() => {
                                    setEditUsername(user.username || '');
                                    setAvatarPreview(user.avatar || '');
                                    setShowEditModal(true);
                                }}
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    gap: '8px',
                                    backgroundColor: BRAND_RED,
                                    color: '#FFFFFF',
                                    border: 'none',
                                    borderRadius: '25px',
                                    padding: '0.6rem 1.5rem',
                                    fontSize: '14px',
                                    fontWeight: '600',
                                    cursor: 'pointer',
                                    flex: mobile ? 1 : 'none',
                                    boxShadow: '0 2px 8px rgba(185, 0, 27, 0.2)'
                                }}
                            >
                                <EditIcon />
                                Edit Profile
                            </button>
                        </div> */}
                    </div>

                    {/* Menu List Box */}
                    <div
                        style={{
                            maxWidth: '750px',
                            margin: '2.5rem auto 0',
                            backgroundColor: '#FFFFFF',
                            borderRadius: '16px',
                            boxShadow: '0 4px 20px rgba(0, 0, 0, 0.03)',
                            padding: '0.5rem 0',
                            width: mobile ? '90%' : '100%'
                        }}
                    >
                        {/* 1. Account Details */}
                        <div
                            onClick={() => setCurrentView('account')}
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'space-between',
                                padding: '1.15rem 1.5rem',
                                borderBottom: '1px solid #F3F4F6',
                                cursor: 'pointer',
                                transition: 'background-color 0.2s',
                            }}
                            onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#FAFAFA'}
                            onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                        >
                            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                <div style={{ width: '40px', height: '40px', borderRadius: '50%', backgroundColor: '#FFF0F2', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                    <UserIcon />
                                </div>
                                <span style={{ fontSize: '15px', fontWeight: '500', color: '#111111' }}>
                                    Account Details
                                </span>
                            </div>
                            <ChevronRightIcon />
                        </div>

                        {/* 2. Saved Products */}
                        <div
                            onClick={() => router.push('/saved')}
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'space-between',
                                padding: '1.15rem 1.5rem',
                                borderBottom: '1px solid #F3F4F6',
                                cursor: 'pointer',
                                transition: 'background-color 0.2s',
                            }}
                            onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#FAFAFA'}
                            onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                        >
                            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                <div style={{ width: '40px', height: '40px', borderRadius: '50%', backgroundColor: '#FFF0F2', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                    <BookmarkIcon />
                                </div>
                                <span style={{ fontSize: '15px', fontWeight: '500', color: '#111111' }}>
                                    Saved Products & Posts
                                </span>
                            </div>
                            <ChevronRightIcon />
                        </div>

                        {/* 3. Vendor Dashboard / Become a Vendor (Conditional display based on vendor status) */}
                        {user.isVendor || vendor ? (
                            <div
                                onClick={() => router.push('/dashboard')}
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'space-between',
                                    padding: '1.15rem 1.5rem',
                                    borderBottom: '1px solid #F3F4F6',
                                    cursor: 'pointer',
                                    transition: 'background-color 0.2s',
                                }}
                                onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#FAFAFA'}
                                onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                            >
                                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                    <div style={{ width: '40px', height: '40px', borderRadius: '50%', backgroundColor: '#FFF0F2', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                        <StoreIcon />
                                    </div>
                                    <span style={{ fontSize: '15px', fontWeight: '500', color: '#111111' }}>
                                        Vendor Dashboard
                                    </span>
                                </div>
                                <ChevronRightIcon />
                            </div>
                        ) : (
                            <div
                                onClick={() => router.push('/onboarding')}
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'space-between',
                                    padding: '1.15rem 1.5rem',
                                    borderBottom: '1px solid #F3F4F6',
                                    cursor: 'pointer',
                                    transition: 'background-color 0.2s',
                                }}
                                onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#FAFAFA'}
                                onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                            >
                                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                    <div style={{ width: '40px', height: '40px', borderRadius: '50%', backgroundColor: '#FFF0F2', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                        <StoreIcon />
                                    </div>
                                    <span style={{ fontSize: '15px', fontWeight: '600', color: BRAND_RED }}>
                                        Become a Vendor
                                    </span>
                                </div>
                                <ChevronRightIcon color={BRAND_RED} />
                            </div>
                        )}

                        {/* 4. Notifications */}
                        {/* <div
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'space-between',
                                padding: '1.15rem 1.5rem',
                                borderBottom: '1px solid #F3F4F6',
                                cursor: 'pointer',
                                transition: 'background-color 0.2s',
                            }}
                            onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#FAFAFA'}
                            onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                        >
                            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                <div style={{ width: '40px', height: '40px', borderRadius: '50%', backgroundColor: '#FFF0F2', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                    <BellIcon />
                                </div>
                                <span style={{ fontSize: '15px', fontWeight: '500', color: '#111111' }}>
                                    Notifications
                                </span>
                            </div>
                            <ChevronRightIcon />
                        </div> */}

                        {/* 5. Settings & Privacy */}
                        <div
                            onClick={() => setCurrentView('settings')}
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'space-between',
                                padding: '1.15rem 1.5rem',
                                borderBottom: '1px solid #F3F4F6',
                                cursor: 'pointer',
                                transition: 'background-color 0.2s',
                            }}
                            onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#FAFAFA'}
                            onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                        >
                            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                <div style={{ width: '40px', height: '40px', borderRadius: '50%', backgroundColor: '#FFF0F2', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                    <SettingsIcon />
                                </div>
                                <span style={{ fontSize: '15px', fontWeight: '500', color: '#111111' }}>
                                    Settings & Privacy
                                </span>
                            </div>
                            <ChevronRightIcon />
                        </div>

                        {/* 6. Help Center (routes to contacts page) */}
                        <div
                            onClick={() => router.push('/contact')}
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'space-between',
                                padding: '1.15rem 1.5rem',
                                borderBottom: '1px solid #F3F4F6',
                                cursor: 'pointer',
                                transition: 'background-color 0.2s',
                            }}
                            onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#FAFAFA'}
                            onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                        >
                            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                <div style={{ width: '40px', height: '40px', borderRadius: '50%', backgroundColor: '#FFF0F2', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                    <HelpIcon />
                                </div>
                                <span style={{ fontSize: '15px', fontWeight: '500', color: '#111111' }}>
                                    Help Center
                                </span>
                            </div>
                            <ChevronRightIcon />
                        </div>

                        {/* 7. Logout */}
                        <div
                            onClick={handleLogout}
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'space-between',
                                padding: '1.15rem 1.5rem',
                                cursor: 'pointer',
                                transition: 'background-color 0.2s',
                            }}
                            onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#FFF5F6'}
                            onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                        >
                            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                <div style={{ width: '40px', height: '40px', borderRadius: '50%', backgroundColor: '#FFE6E9', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                    <LogoutIcon color={BRAND_RED} />
                                </div>
                                <span style={{ fontSize: '15px', fontWeight: '600', color: BRAND_RED }}>
                                    Logout
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* SCREEN 2: ACCOUNT DETAILS VIEW */}
            {currentView === 'account' && (
                <div className="fade-in" style={{ maxWidth: '650px', margin: '2rem auto 0', padding: '0 1.5rem' }}>
                    {/* Header bar */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2rem' }}>
                        <button
                            onClick={() => setCurrentView('menu')}
                            style={{
                                border: '1px solid #e5e7eb',
                                backgroundColor: '#ffffff',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                width: '40px',
                                height: '40px',
                                borderRadius: '50%',
                                boxShadow: '0 1px 2px rgba(0,0,0,0.05)'
                            }}
                        >
                            <BackIcon />
                        </button>
                        <h2 style={{ fontSize: '1.5rem', fontWeight: '700', color: '#111827', margin: 0 }}>Account Details</h2>
                    </div>

                    {/* Profile details summary card */}
                    <div style={{
                        backgroundColor: '#ffffff',
                        borderRadius: '20px',
                        padding: '2rem',
                        boxShadow: '0 4px 20px rgba(0, 0, 0, 0.02)',
                        border: '1px solid #f3f4f6',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        gap: '1.25rem',
                        marginBottom: '2rem'
                    }}>
                        <div style={{ position: 'relative', width: '120px', height: '120px', borderRadius: '50%', backgroundColor: '#D2D6DC', overflow: 'hidden', border: '4px solid #ffffff', boxShadow: '0 4px 10px rgba(0,0,0,0.08)' }}>
                            {user.avatar ? (
                                <img src={user.avatar} alt="Avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                            ) : (
                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '100%', height: '100%', fontSize: '3rem', fontWeight: '800', color: '#4b5563' }}>
                                    {user.username?.[0]?.toUpperCase()}
                                </div>
                            )}
                        </div>

                        <div style={{ textAlign: 'center' }}>
                            <h3 style={{ fontSize: '1.25rem', fontWeight: '700', color: '#111827', margin: '0 0 0.25rem 0' }}>{user.username}</h3>
                            <p style={{ fontSize: '0.9rem', color: '#6b7280', margin: 0 }}>{user.email}</p>
                        </div>

                        <button
                            onClick={() => {
                                setEditUsername(user.username || '');
                                setAvatarPreview(user.avatar || '');
                                setShowEditModal(true);
                            }}
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '8px',
                                backgroundColor: '#ffffff',
                                border: '1px solid #e5e7eb',
                                padding: '8px 18px',
                                borderRadius: '9999px',
                                fontWeight: '600',
                                color: '#374151',
                                fontSize: '0.85rem',
                                cursor: 'pointer',
                                transition: 'all 0.2s'
                            }}
                            onMouseOver={(e) => { e.currentTarget.style.backgroundColor = '#f9fafb'; e.currentTarget.style.borderColor = '#d1d5db'; }}
                            onMouseOut={(e) => { e.currentTarget.style.backgroundColor = '#ffffff'; e.currentTarget.style.borderColor = '#e5e7eb'; }}
                        >
                            <EditIcon color="#374151" />
                            Edit Profile
                        </button>
                    </div>

                    {/* Account Settings List */}
                    <div style={{
                        backgroundColor: '#ffffff',
                        borderRadius: '16px',
                        boxShadow: '0 4px 20px rgba(0, 0, 0, 0.02)',
                        padding: '0.5rem 0',
                        border: '1px solid #f3f4f6'
                    }}>
                        {/* Change Password Link */}
                        <div
                            onClick={() => setCurrentView('change-password')}
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'space-between',
                                padding: '1.15rem 1.5rem',
                                borderBottom: '1px solid #F3F4F6',
                                cursor: 'pointer',
                                transition: 'background-color 0.2s',
                            }}
                            onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#FAFAFA'}
                            onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                        >
                            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                <div style={{ width: '40px', height: '40px', borderRadius: '50%', backgroundColor: '#FFF0F2', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                    <LockIcon />
                                </div>
                                <div style={{ display: 'flex', flexDirection: 'column' }}>
                                    <span style={{ fontSize: '15px', fontWeight: '600', color: '#111827' }}>Change Password</span>
                                    <span style={{ fontSize: '0.8rem', color: '#6b7280', marginTop: '2px' }}>Keep your account secure</span>
                                </div>
                            </div>
                            <ChevronRightIcon />
                        </div>

                        {/* Deactivate Account Link */}
                        <div
                            onClick={() => setShowDeactivateModal(true)}
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'space-between',
                                padding: '1.15rem 1.5rem',
                                cursor: 'pointer',
                                transition: 'background-color 0.2s',
                            }}
                            onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#FFF5F6'}
                            onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                        >
                            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                <div style={{ width: '40px', height: '40px', borderRadius: '50%', backgroundColor: '#FFE6E9', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                    <TrashIcon color={BRAND_RED} />
                                </div>
                                <div style={{ display: 'flex', flexDirection: 'column' }}>
                                    <span style={{ fontSize: '15px', fontWeight: '600', color: BRAND_RED }}>Deactivate Account</span>
                                    <span style={{ fontSize: '0.8rem', color: '#ef4444', marginTop: '2px' }}>Temporarily disable your profile</span>
                                </div>
                            </div>
                            <ChevronRightIcon color={BRAND_RED} />
                        </div>
                    </div>
                </div>
            )}

            {/* SCREEN 3: CHANGE PASSWORD VIEW */}
            {currentView === 'change-password' && (
                <div className="fade-in" style={{ maxWidth: '500px', margin: '2rem auto 0', padding: '0 1.5rem' }}>
                    {/* Header bar */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2rem' }}>
                        <button
                            onClick={() => setCurrentView('account')}
                            style={{
                                border: '1px solid #e5e7eb',
                                backgroundColor: '#ffffff',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                width: '40px',
                                height: '40px',
                                borderRadius: '50%',
                                boxShadow: '0 1px 2px rgba(0,0,0,0.05)'
                            }}
                        >
                            <BackIcon />
                        </button>
                        <h2 style={{ fontSize: '1.5rem', fontWeight: '700', color: '#111827', margin: 0 }}>Change Password</h2>
                    </div>

                    <form onSubmit={handleChangePasswordSubmit} style={{
                        backgroundColor: '#ffffff',
                        borderRadius: '24px',
                        padding: '2.5rem 2rem',
                        boxShadow: '0 4px 25px rgba(0, 0, 0, 0.03)',
                        border: '1px solid #f3f4f6',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '1.5rem'
                    }}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                            <label style={{ fontSize: '0.85rem', fontWeight: '600', color: '#4b5563' }}>Current Password</label>
                            <input
                                type="password"
                                required
                                value={currentPassword}
                                onChange={(e) => setCurrentPassword(e.target.value)}
                                placeholder="••••••••"
                                style={{
                                    padding: '12px 16px',
                                    borderRadius: '12px',
                                    border: '1px solid #e5e7eb',
                                    fontSize: '0.95rem',
                                    color: '#111827',
                                    outline: 'none',
                                    boxSizing: 'border-box',
                                    width: '100%',
                                    transition: 'border-color 0.2s',
                                }}
                                onFocus={(e) => e.currentTarget.style.borderColor = BRAND_RED}
                                onBlur={(e) => e.currentTarget.style.borderColor = '#e5e7eb'}
                            />
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                            <label style={{ fontSize: '0.85rem', fontWeight: '600', color: '#4b5563' }}>New Password</label>
                            <input
                                type="password"
                                required
                                value={newPassword}
                                onChange={(e) => setNewPassword(e.target.value)}
                                placeholder="•••••••• (Min. 8 characters)"
                                style={{
                                    padding: '12px 16px',
                                    borderRadius: '12px',
                                    border: '1px solid #e5e7eb',
                                    fontSize: '0.95rem',
                                    color: '#111827',
                                    outline: 'none',
                                    boxSizing: 'border-box',
                                    width: '100%',
                                    transition: 'border-color 0.2s',
                                }}
                                onFocus={(e) => e.currentTarget.style.borderColor = BRAND_RED}
                                onBlur={(e) => e.currentTarget.style.borderColor = '#e5e7eb'}
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={changingPassword}
                            style={{
                                padding: '14px',
                                borderRadius: '12px',
                                backgroundColor: BRAND_RED,
                                border: 'none',
                                fontWeight: '700',
                                color: '#ffffff',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: '8px',
                                fontSize: '1rem',
                                boxShadow: '0 4px 12px rgba(185, 0, 27, 0.2)',
                                transition: 'opacity 0.2s',
                                marginTop: '0.5rem',
                                opacity: changingPassword ? 0.7 : 1
                            }}
                        >
                            {changingPassword ? (
                                <>
                                    <span style={{
                                        width: '18px',
                                        height: '18px',
                                        border: '2px solid rgba(255,255,255,0.4)',
                                        borderTopColor: '#ffffff',
                                        borderRadius: '50%',
                                        display: 'inline-block',
                                        animation: 'skeleton-pulse 1s linear infinite'
                                    }} />
                                    Updating...
                                </>
                            ) : 'Update Password'}
                        </button>
                    </form>
                </div>
            )}

            {/* SCREEN 4: SETTINGS & PRIVACY VIEW */}
            {currentView === 'settings' && (
                <div className="fade-in" style={{ maxWidth: '650px', margin: '2rem auto 0', padding: '0 1.5rem' }}>
                    {/* Header bar */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2rem' }}>
                        <button
                            onClick={() => setCurrentView('menu')}
                            style={{
                                border: '1px solid #e5e7eb',
                                backgroundColor: '#ffffff',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                width: '40px',
                                height: '40px',
                                borderRadius: '50%',
                                boxShadow: '0 1px 2px rgba(0,0,0,0.05)'
                            }}
                        >
                            <BackIcon />
                        </button>
                        <h2 style={{ fontSize: '1.5rem', fontWeight: '700', color: '#111827', margin: 0 }}>Settings & Privacy</h2>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                        {/* Section 1: Notifications */}
                        <div style={{ backgroundColor: '#ffffff', borderRadius: '16px', border: '1px solid #f3f4f6', padding: '1.5rem', boxShadow: '0 4px 15px rgba(0,0,0,0.01)' }}>
                            <h3 style={{ fontSize: '1rem', fontWeight: '700', color: '#111827', margin: '0 0 1rem 0', borderBottom: '1px solid #f3f4f6', paddingBottom: '0.5rem' }}>Notifications</h3>

                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.75rem 0' }}>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                                    <span style={{ fontSize: '0.95rem', fontWeight: '600', color: '#374151' }}>Push Notifications</span>
                                    <span style={{ fontSize: '0.8rem', color: '#6b7280' }}>Receive alerts about orders and product updates</span>
                                </div>
                                <div style={{ position: 'relative', display: 'inline-block', width: '44px', height: '24px' }}>
                                    <input
                                        type="checkbox"
                                        id="push-toggle"
                                        className="toggle-checkbox"
                                        checked={pushEnabled}
                                        onChange={() => setPushEnabled(!pushEnabled)}
                                        style={{ opacity: 0, width: 0, height: 0 }}
                                    />
                                    <label
                                        htmlFor="push-toggle"
                                        className="toggle-label"
                                        style={{
                                            position: 'absolute', cursor: 'pointer', top: 0, left: 0, right: 0, bottom: 0,
                                            backgroundColor: '#ccc', borderRadius: '24px', transition: '0.4s',
                                        }}
                                        ref={(el) => {
                                            if (el) {
                                                el.style.setProperty('--after-content', '""');
                                                el.style.backgroundColor = pushEnabled ? BRAND_RED : '#ccc';
                                            }
                                        }}
                                    >
                                        <span style={{
                                            position: 'absolute', content: '""', height: '20px', width: '20px', left: pushEnabled ? '22px' : '2px', bottom: '2px',
                                            backgroundColor: 'white', borderRadius: '50%', transition: '0.4s'
                                        }} />
                                    </label>
                                </div>
                            </div>

                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.75rem 0' }}>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                                    <span style={{ fontSize: '0.95rem', fontWeight: '600', color: '#374151' }}>Email Notifications</span>
                                    <span style={{ fontSize: '0.8rem', color: '#6b7280' }}>Weekly summaries and newsletter updates</span>
                                </div>
                                <div style={{ position: 'relative', display: 'inline-block', width: '44px', height: '24px' }}>
                                    <input
                                        type="checkbox"
                                        id="email-toggle"
                                        checked={emailEnabled}
                                        onChange={() => setEmailEnabled(!emailEnabled)}
                                        style={{ opacity: 0, width: 0, height: 0 }}
                                    />
                                    <label
                                        htmlFor="email-toggle"
                                        style={{
                                            position: 'absolute', cursor: 'pointer', top: 0, left: 0, right: 0, bottom: 0,
                                            backgroundColor: emailEnabled ? BRAND_RED : '#ccc', borderRadius: '24px', transition: '0.4s',
                                        }}
                                    >
                                        <span style={{
                                            position: 'absolute', height: '20px', width: '20px', left: emailEnabled ? '22px' : '2px', bottom: '2px',
                                            backgroundColor: 'white', borderRadius: '50%', transition: '0.4s'
                                        }} />
                                    </label>
                                </div>
                            </div>
                        </div>

                        {/* Section 2: Preferences */}
                        <div style={{ backgroundColor: '#ffffff', borderRadius: '16px', border: '1px solid #f3f4f6', padding: '1.5rem', boxShadow: '0 4px 15px rgba(0,0,0,0.01)' }}>
                            <h3 style={{ fontSize: '1rem', fontWeight: '700', color: '#111827', margin: '0 0 1rem 0', borderBottom: '1px solid #f3f4f6', paddingBottom: '0.5rem' }}>Preferences</h3>

                            {/* Currency Preference */}
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.75rem 0' }}>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                                    <span style={{ fontSize: '0.95rem', fontWeight: '600', color: '#374151' }}>Currency</span>
                                    <span style={{ fontSize: '0.8rem', color: '#6b7280' }}>Display prices in your preferred currency</span>
                                </div>
                                <select
                                    value={currency}
                                    onChange={(e) => setCurrency(e.target.value)}
                                    style={{
                                        padding: '6px 12px',
                                        borderRadius: '8px',
                                        border: '1px solid #e5e7eb',
                                        backgroundColor: '#ffffff',
                                        fontWeight: '600',
                                        color: '#374151',
                                        fontSize: '0.85rem',
                                        outline: 'none',
                                        cursor: 'pointer'
                                    }}
                                >
                                    <option value="NGN">NGN (₦)</option>
                                    <option value="USD">USD ($)</option>
                                    <option value="GBP">GBP (£)</option>
                                    <option value="EUR">EUR (€)</option>
                                </select>
                            </div>

                            {/* Dark Mode Preference (Simulated) */}
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.75rem 0' }}>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                                    <span style={{ fontSize: '0.95rem', fontWeight: '600', color: '#374151' }}>Dark Mode</span>
                                    <span style={{ fontSize: '0.8rem', color: '#6b7280' }}>Enjoy dark visual aesthetics (Simulated)</span>
                                </div>
                                <div style={{ position: 'relative', display: 'inline-block', width: '44px', height: '24px' }}>
                                    <input
                                        type="checkbox"
                                        id="dark-toggle"
                                        checked={darkMode}
                                        onChange={() => setDarkMode(!darkMode)}
                                        style={{ opacity: 0, width: 0, height: 0 }}
                                    />
                                    <label
                                        htmlFor="dark-toggle"
                                        style={{
                                            position: 'absolute', cursor: 'pointer', top: 0, left: 0, right: 0, bottom: 0,
                                            backgroundColor: darkMode ? BRAND_RED : '#ccc', borderRadius: '24px', transition: '0.4s',
                                        }}
                                    >
                                        <span style={{
                                            position: 'absolute', height: '20px', width: '20px', left: darkMode ? '22px' : '2px', bottom: '2px',
                                            backgroundColor: 'white', borderRadius: '50%', transition: '0.4s'
                                        }} />
                                    </label>
                                </div>
                            </div>
                        </div>

                        {/* Section 3: Legal & Support */}
                        <div style={{ backgroundColor: '#ffffff', borderRadius: '16px', border: '1px solid #f3f4f6', padding: '1.5rem', boxShadow: '0 4px 15px rgba(0,0,0,0.01)' }}>
                            <h3 style={{ fontSize: '1rem', fontWeight: '700', color: '#111827', margin: '0 0 1rem 0', borderBottom: '1px solid #f3f4f6', paddingBottom: '0.5rem' }}>Support & Info</h3>

                            <div
                                onClick={() => router.push('/privacy')}
                                style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.75rem 0', cursor: 'pointer' }}
                            >
                                <span style={{ fontSize: '0.95rem', fontWeight: '600', color: '#374151' }}>Privacy Policy</span>
                                <ChevronRightIcon />
                            </div>

                            <div
                                onClick={() => router.push('/terms')}
                                style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.75rem 0', cursor: 'pointer' }}
                            >
                                <span style={{ fontSize: '0.95rem', fontWeight: '600', color: '#374151' }}>Terms of Service</span>
                                <ChevronRightIcon />
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* EDIT PROFILE MODAL */}
            {showEditModal && (
                <div style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    backgroundColor: 'rgba(17, 24, 39, 0.45)',
                    backdropFilter: 'blur(5px)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    zIndex: 999,
                    padding: '1.5rem',
                    boxSizing: 'border-box'
                }}>
                    <div className="fade-in" style={{
                        backgroundColor: '#ffffff',
                        borderRadius: '24px',
                        padding: '2.25rem 2rem',
                        maxWidth: '440px',
                        width: '100%',
                        boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
                        boxSizing: 'border-box'
                    }}>
                        <h3 style={{ fontSize: '1.25rem', fontWeight: '700', color: '#111827', margin: '0 0 1.5rem 0' }}>Edit Profile</h3>

                        {/* Avatar Picker & Preview */}
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px', marginBottom: '1.5rem' }}>
                            <div style={{ position: 'relative', width: '100px', height: '100px', borderRadius: '50%', backgroundColor: '#f3f4f6', overflow: 'hidden', border: '3px solid #f3f4f6' }}>
                                {avatarPreview ? (
                                    <img src={avatarPreview} alt="Preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                ) : (
                                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '100%', height: '100%', fontSize: '2.5rem', fontWeight: '800', color: '#4b5563' }}>
                                        {editUsername?.[0]?.toUpperCase()}
                                    </div>
                                )}

                                {uploadingImage && (
                                    <div style={{
                                        position: 'absolute',
                                        top: 0,
                                        left: 0,
                                        right: 0,
                                        bottom: 0,
                                        backgroundColor: 'rgba(0, 0, 0, 0.5)',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        color: '#ffffff',
                                        fontSize: '0.8rem',
                                        fontWeight: '600'
                                    }}>
                                        Uploading...
                                    </div>
                                )}
                            </div>

                            <button
                                type="button"
                                onClick={() => fileInputRef.current?.click()}
                                style={{
                                    padding: '6px 14px',
                                    borderRadius: '9999px',
                                    border: '1px solid #e5e7eb',
                                    backgroundColor: '#ffffff',
                                    fontSize: '0.8rem',
                                    fontWeight: '600',
                                    color: '#374151',
                                    cursor: 'pointer',
                                    transition: 'background-color 0.2s'
                                }}
                                onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#f9fafb'}
                                onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#ffffff'}
                            >
                                Change Image
                            </button>
                            <input
                                type="file"
                                ref={fileInputRef}
                                onChange={handleImageChange}
                                accept="image/*"
                                style={{ display: 'none' }}
                            />
                        </div>

                        {/* Username Input Field */}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginBottom: '1.75rem' }}>
                            <label style={{ fontSize: '0.85rem', fontWeight: '600', color: '#4b5563' }}>Username</label>
                            <input
                                type="text"
                                value={editUsername}
                                onChange={(e) => setEditUsername(e.target.value)}
                                placeholder="Enter username"
                                style={{
                                    padding: '11px 14px',
                                    borderRadius: '12px',
                                    border: '1px solid #e5e7eb',
                                    fontSize: '0.95rem',
                                    color: '#111827',
                                    outline: 'none',
                                    boxSizing: 'border-box',
                                    width: '100%',
                                    transition: 'border-color 0.2s'
                                }}
                                onFocus={(e) => e.currentTarget.style.borderColor = BRAND_RED}
                                onBlur={(e) => e.currentTarget.style.borderColor = '#e5e7eb'}
                            />
                        </div>

                        {/* Modal Action Buttons */}
                        <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
                            <button
                                type="button"
                                onClick={() => { setShowEditModal(false); setAvatarFile(null); }}
                                style={{
                                    padding: '10px 18px',
                                    borderRadius: '9999px',
                                    backgroundColor: '#f3f4f6',
                                    border: 'none',
                                    fontWeight: '600',
                                    color: '#4b5563',
                                    cursor: 'pointer'
                                }}
                            >
                                Cancel
                            </button>
                            <button
                                type="button"
                                onClick={handleSaveProfile}
                                disabled={savingProfile || uploadingImage || !editUsername.trim()}
                                style={{
                                    padding: '10px 22px',
                                    borderRadius: '9999px',
                                    backgroundColor: BRAND_RED,
                                    border: 'none',
                                    fontWeight: '600',
                                    color: '#ffffff',
                                    cursor: 'pointer',
                                    opacity: (savingProfile || uploadingImage || !editUsername.trim()) ? 0.7 : 1,
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '6px'
                                }}
                            >
                                {savingProfile ? 'Saving...' : 'Save'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* DEACTIVATE ACCOUNT MODAL */}
            {showDeactivateModal && (
                <div style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    backgroundColor: 'rgba(17, 24, 39, 0.45)',
                    backdropFilter: 'blur(5px)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    zIndex: 999,
                    padding: '1.5rem',
                    boxSizing: 'border-box'
                }}>
                    <div className="fade-in" style={{
                        backgroundColor: '#ffffff',
                        borderRadius: '24px',
                        padding: '2.25rem 2rem',
                        maxWidth: '440px',
                        width: '100%',
                        boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
                        boxSizing: 'border-box'
                    }}>
                        <h3 style={{ fontSize: '1.25rem', fontWeight: '700', color: BRAND_RED, margin: '0 0 1rem 0' }}>Deactivate Account</h3>
                        <p style={{ fontSize: '0.9rem', color: '#4b5563', lineHeight: '1.5', margin: '0 0 1.5rem 0' }}>
                            Are you sure you want to deactivate your account? This action will log you out and temporarily disable your seller and buyer profile.
                        </p>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginBottom: '1.75rem' }}>
                            <label style={{ fontSize: '0.85rem', fontWeight: '600', color: '#4b5563' }}>Confirm Password</label>
                            <input
                                type="password"
                                value={deactivatePassword}
                                onChange={(e) => setDeactivatePassword(e.target.value)}
                                placeholder="Enter password"
                                style={{
                                    padding: '11px 14px',
                                    borderRadius: '12px',
                                    border: '1px solid #e5e7eb',
                                    fontSize: '0.95rem',
                                    color: '#111827',
                                    outline: 'none',
                                    boxSizing: 'border-box',
                                    width: '100%',
                                    transition: 'border-color 0.2s'
                                }}
                                onFocus={(e) => e.currentTarget.style.borderColor = BRAND_RED}
                                onBlur={(e) => e.currentTarget.style.borderColor = '#e5e7eb'}
                            />
                        </div>

                        <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
                            <button
                                type="button"
                                onClick={() => { setShowDeactivateModal(false); setDeactivatePassword(''); }}
                                style={{
                                    padding: '10px 18px',
                                    borderRadius: '9999px',
                                    backgroundColor: '#f3f4f6',
                                    border: 'none',
                                    fontWeight: '600',
                                    color: '#4b5563',
                                    cursor: 'pointer'
                                }}
                            >
                                Cancel
                            </button>
                            <button
                                type="button"
                                onClick={handleDeactivateConfirm}
                                disabled={deactivating || !deactivatePassword}
                                style={{
                                    padding: '10px 22px',
                                    borderRadius: '9999px',
                                    backgroundColor: BRAND_RED,
                                    border: 'none',
                                    fontWeight: '600',
                                    color: '#ffffff',
                                    cursor: 'pointer',
                                    opacity: (deactivating || !deactivatePassword) ? 0.7 : 1,
                                }}
                            >
                                {deactivating ? 'Deactivating...' : 'Deactivate Account'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </main>
    );
}