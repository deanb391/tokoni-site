// app/signup/page.tsx
"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ShoppingBag, User, Mail, Lock, Store, ArrowRight, Eye, EyeOff } from 'lucide-react';
import { createUser, googleSignIn } from '@/lib/services/auth.service';
import { useUser } from '@/context/UserContext';
import logoImg from "@/assets/images/tokoni_logo.png";
import Image from "next/image";

export default function SignupScreen() {
    const router = useRouter();
    const { refreshUser } = useUser();

    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [isVendor, setIsVendor] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleGoogleSignIn = async () => {
        setIsLoading(true);
        setError(null);
        try {
            await googleSignIn();
        } catch (err: any) {
            console.error('Google Sign-In error:', err);
            setError(err.message || 'Google Sign-In failed. Please try again.');
            setIsLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);

        if (!username || !email || !password || !confirmPassword) {
            setError('Please fill in all fields.');
            return;
        }

        if (password !== confirmPassword) {
            setError('Passwords do not match.');
            return;
        }

        if (password.length < 8) {
            setError('Password must be at least 8 characters long.');
            return;
        }

        setIsLoading(true);

        try {
            // Create user and log them in
            await createUser({
                email,
                password,
                username,
                isVendor
            });

            await refreshUser();

            // Route branching based on isVendor
            if (isVendor) {
                router.push('/onboarding');
            } else {
                router.push('/');
            }
        } catch (err: any) {
            console.error('Sign-up error:', err);
            setError(err.message || 'Registration failed. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#F5F5F5] flex items-center justify-center p-4 font-sans">
            <div className="bg-white w-full max-w-[420px] rounded-[24px] p-8 shadow-sm relative overflow-hidden">

                {/* Subtle background glow effect in top right */}
                <div className="absolute top-0 right-0 w-64 h-64 bg-red-50 rounded-full blur-3xl -mr-16 -mt-16 opacity-70 pointer-events-none"></div>

                {/* Header section */}
                <div className="flex flex-col items-center mb-8 relative z-10">
                    <div className="flex items-center gap-2 mb-1.5 text-[#B9001B]">
                        <Image src={logoImg} alt="Tokoni Logo" height={32} style={{ objectFit: 'contain', width: 'auto' }} priority />
                    </div>
                    <p className="text-gray-600 text-[15px]">Join the premium marketplace</p>
                </div>

                {/* Error Banner Alert */}
                {error && (
                    <div className="bg-[#FFF0F1] border border-[#FFCAD1] rounded-xl p-3.5 mb-5 text-[13px] text-[#B9001B] font-semibold relative z-10">
                        {error}
                    </div>
                )}

                {/* Form section */}
                <form className="space-y-4 relative z-10" onSubmit={handleSubmit}>

                    {/* Username */}
                    <div className="space-y-1.5">
                        <label className="block text-[13px] font-medium text-gray-800">Username</label>
                        <div className="flex items-center bg-[#F9F9F9] border border-gray-100 rounded-xl px-4 py-3">
                            <User size={18} className="text-gray-500 mr-3" strokeWidth={2} />
                            <input
                                type="text"
                                required
                                disabled={isLoading}
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                placeholder="Choose a username"
                                className="bg-transparent border-none outline-none w-full text-[15px] text-gray-800 placeholder-gray-400"
                            />
                        </div>
                    </div>

                    {/* Email Address */}
                    <div className="space-y-1.5" style={{ marginTop: '25px' }}>
                        <label className="block text-[13px] font-medium text-gray-800">Email Address</label>
                        <div className="flex items-center bg-[#F9F9F9] border border-gray-100 rounded-xl px-4 py-3">
                            <Mail size={18} className="text-gray-500 mr-3" strokeWidth={2} />
                            <input
                                type="email"
                                required
                                disabled={isLoading}
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="Enter your email"
                                className="bg-transparent border-none outline-none w-full text-[15px] text-gray-800 placeholder-gray-400"
                            />
                        </div>
                    </div>

                     {/* Password */}
                    <div className="space-y-1.5" style={{ marginTop: '25px' }}>
                        <label className="block text-[13px] font-medium text-gray-800">Password</label>
                        <div className="flex items-center bg-[#F9F9F9] border border-gray-100 rounded-xl px-4 py-3">
                            <Lock size={18} className="text-gray-500 mr-3" strokeWidth={2} />
                            <input
                                type={showPassword ? "text" : "password"}
                                required
                                disabled={isLoading}
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="Create a strong password"
                                className="bg-transparent border-none outline-none w-full text-[15px] text-gray-800 placeholder-gray-400"
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="text-gray-400 hover:text-gray-600 focus:outline-none ml-2"
                            >
                                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                            </button>
                        </div>
                    </div>

                     {/* Confirm Password */}
                    <div className="space-y-1.5" style={{ marginTop: '25px' }}>
                        <label className="block text-[13px] font-medium text-gray-800">Confirm Password</label>
                        <div className="flex items-center bg-[#F9F9F9] border border-gray-100 rounded-xl px-4 py-3">
                            <Lock size={18} className="text-gray-500 mr-3" strokeWidth={2} />
                            <input
                                type={showConfirmPassword ? "text" : "password"}
                                required
                                disabled={isLoading}
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                placeholder="Repeat your password"
                                className="bg-transparent border-none outline-none w-full text-[15px] text-gray-800 placeholder-gray-400"
                            />
                            <button
                                type="button"
                                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                className="text-gray-400 hover:text-gray-600 focus:outline-none ml-2"
                            >
                                {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                            </button>
                        </div>
                    </div>

                    {/* Vendor Toggle */}
                    <div
                        className="mt-6 flex items-center justify-between bg-[#F9F9F9] border border-gray-100 rounded-xl px-4 py-3 cursor-pointer"
                        onClick={() => !isLoading && setIsVendor(!isVendor)}
                        style={{ marginTop: '25px' }}
                    >
                        <div className="flex items-center">
                            <Store size={18} className="text-[#B9001B] mr-3" strokeWidth={2} />
                            <span className="text-[14px] font-semibold text-gray-900">Are you a vendor?</span>
                        </div>

                        {/* Custom Toggle Switch */}
                        <div className={`w-11 h-6 rounded-full relative flex items-center px-1 transition-colors duration-300 ${isVendor ? 'bg-[#B9001B]' : 'bg-[#E5E7EB]'}`}>
                            <div className={`w-4 h-4 bg-white rounded-full shadow-sm transform transition-transform duration-300 ${isVendor ? 'translate-x-5' : 'translate-x-0'}`}></div>
                        </div>
                    </div>

                    {/* Submit Button */}
                    <button
                        type="submit"
                        disabled={isLoading}
                        style={{ marginTop: '30px' }}
                        className="w-full mt-2 bg-[#B9001B] hover:bg-[#A30018] text-white py-3.5 rounded-xl text-[15px] font-semibold flex justify-center items-center gap-2 transition-colors disabled:opacity-75"
                    >
                        {isLoading ? (
                            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                        ) : (
                            <>
                                <span>Create Account</span>
                                <ArrowRight size={18} strokeWidth={2.5} />
                            </>
                        )}
                    </button>

                    {/* Content Divider Layer */}
                    <div className="flex items-center justify-center my-6" style={{ marginTop: '25px', marginBottom: '20px' }}>
                        <div className="flex-1 h-px bg-gray-100"></div>
                        <span className="px-3 text-[11px] text-gray-400 font-semibold tracking-wider">OR CONTINUE WITH</span>
                        <div className="flex-1 h-px bg-gray-100"></div>
                    </div>

                    {/* Google Authentication Button */}
                    <button
                        type="button"
                        onClick={handleGoogleSignIn}
                        disabled={isLoading}
                        className="w-full bg-white border border-gray-200 rounded-xl py-3 text-[14px] font-semibold text-gray-800 flex items-center justify-center gap-2 hover:bg-gray-50 transition-colors disabled:opacity-75"
                    >
                        {/* Authentic Multi-color Google Icon */}
                        <svg width="18" height="18" viewBox="0 0 24 24">
                            <path
                                fill="#4285F4"
                                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                            />
                            <path
                                fill="#34A853"
                                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                            />
                            <path
                                fill="#FBBC05"
                                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l3.66-2.85z"
                            />
                            <path
                                fill="#EA4335"
                                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.85c.87-2.6 3.3-4.53 12-4.53z"
                            />
                        </svg>
                        <span>Google</span>
                    </button>

                </form>

                {/* Footer */}
                <p className="mt-6 text-center text-[14px] text-gray-600 relative z-10">
                    Already have an account? <a href="/signin" className="text-[#B9001B] font-semibold hover:underline">Log in</a>
                </p>

            </div>
        </div>
    );
}