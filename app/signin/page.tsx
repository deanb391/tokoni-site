// app/signin/page.tsx
"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { signIn, googleSignIn } from '@/lib/services/auth.service';
import { useUser } from '@/context/UserContext';
import Image from 'next/image';
import logoImg from "@/assets/images/tokoni_logo.png";

export default function LoginScreen() {
    const router = useRouter();
    const { refreshUser } = useUser();

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!email || !password) {
            setError('Please fill in all fields.');
            return;
        }

        setIsLoading(true);
        setError(null);

        try {
            await signIn(email, password);
            await refreshUser();
            router.push('/');
        } catch (err: any) {
            console.error('Sign-in error:', err);
            setError(err.message || 'Invalid email or password. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

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

    return (
        <div
            style={{
                minHeight: "100vh",
                backgroundColor: "#F9FAFB",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                padding: "2rem 1.5rem",
                boxSizing: "border-box",
                fontFamily: 'var(--font-body), sans-serif'
            }}
        >
            {/* Top Logo Brand Asset */}
            <div
                style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    marginBottom: "2.5rem"
                }}
            >
                <Image src={logoImg} alt="Tokoni Logo" height={32} style={{ objectFit: 'contain', width: 'auto' }} priority />
            </div>

            {/* Main Authentication Card */}
            <div
                style={{
                    backgroundColor: "#FFFFFF",
                    width: "100%",
                    maxWidth: "450px",
                    borderRadius: "24px",
                    padding: "3rem 2.5rem",
                    boxShadow: "0px 4px 24px rgba(0, 0, 0, 0.015), 0px 1px 2px rgba(0, 0, 0, 0.01)",
                    border: "1px solid #EDEDED",
                    boxSizing: "border-box"
                }}
            >
                {/* Heading Header Group */}
                <div style={{ textAlign: "center", marginBottom: "2.25rem" }}>
                    <h2
                        style={{
                            fontSize: "24px",
                            fontWeight: "600",
                            color: "#111111",
                            margin: "0 0 0.5rem 0",
                            letterSpacing: "-0.5px"
                        }}
                    >
                        Welcome back
                    </h2>
                    <p
                        style={{
                            fontSize: "14px",
                            color: "#666666",
                            margin: 0
                        }}
                    >
                        Enter your details to access your account.
                    </p>
                </div>

                {/* Error Banner Alert */}
                {error && (
                    <div
                        style={{
                            backgroundColor: "#FFF0F1",
                            border: "1px solid #FFCAD1",
                            borderRadius: "10px",
                            padding: "0.85rem 1rem",
                            fontSize: "13px",
                            color: "#B9001B",
                            fontWeight: "500",
                            marginBottom: "1.5rem"
                        }}
                    >
                        {error}
                    </div>
                )}

                {/* Input Form Fields */}
                <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column" }}>

                    {/* Email Block */}
                    <div style={{ marginBottom: "1.25rem" }}>
                        <label
                            style={{
                                display: "block",
                                fontSize: "13.5px",
                                fontWeight: "500",
                                color: "#111111",
                                marginBottom: "0.5rem"
                            }}
                        >
                            Email address
                        </label>
                        <input
                            type="email"
                            required
                            disabled={isLoading}
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="hello@tokoni.com"
                            style={{
                                width: "100%",
                                backgroundColor: "#F6F5F5",
                                border: "1px solid #EFEFEF",
                                borderRadius: "8px",
                                padding: "0.85rem 1rem",
                                fontSize: "14px",
                                color: "#111111",
                                outline: "none",
                                boxSizing: "border-box"
                            }}
                        />
                    </div>

                    {/* Password Block */}
                    <div style={{ marginBottom: "1.5rem" }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.5rem" }}>
                            <label
                                style={{
                                    fontSize: "13.5px",
                                    fontWeight: "500",
                                    color: "#111111"
                                }}
                            >
                                Password
                            </label>
                            <a
                                href="#"
                                style={{
                                    fontSize: "12.5px",
                                    fontWeight: "500",
                                    color: "#B9001B",
                                    textDecoration: "none"
                                }}
                            >
                                Forgot password?
                            </a>
                        </div>

                        <div
                            style={{
                                display: "flex",
                                alignItems: "center",
                                backgroundColor: "#F6F5F5",
                                border: "1px solid #EFEFEF",
                                borderRadius: "8px",
                                paddingRight: "1rem"
                            }}
                        >
                            <input
                                type={showPassword ? "text" : "password"}
                                required
                                disabled={isLoading}
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="••••••••"
                                style={{
                                    width: "100%",
                                    backgroundColor: "transparent",
                                    border: "none",
                                    borderRadius: "8px",
                                    padding: "0.85rem 1rem",
                                    fontSize: "14px",
                                    color: "#111111",
                                    outline: "none",
                                    boxSizing: "border-box"
                                }}
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                style={{
                                    background: "none",
                                    border: "none",
                                    cursor: "pointer",
                                    padding: 0,
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center"
                                }}
                            >
                                {showPassword ? (
                                    /* Eye Icon SVG */
                                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#444444" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                                        <circle cx="12" cy="12" r="3"></circle>
                                    </svg>
                                ) : (
                                    /* Eye Off Icon SVG */
                                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#444444" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <path d="M17.94 17.94A10.07 10.07 0 0 1 12 19c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
                                        <line x1="1" y1="1" x2="23" y2="23"></line>
                                    </svg>
                                )}
                            </button>
                        </div>
                    </div>

                    {/* Action Login Button */}
                    <button
                        type="submit"
                        disabled={isLoading}
                        style={{
                            width: "100%",
                            backgroundColor: "#B9001B",
                            color: "#FFFFFF",
                            border: "none",
                            borderRadius: "8px",
                            padding: "0.9rem",
                            fontSize: "14px",
                            fontWeight: "600",
                            cursor: isLoading ? "not-allowed" : "pointer",
                            boxSizing: "border-box",
                            opacity: isLoading ? 0.8 : 1,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center"
                        }}
                    >
                        {isLoading ? (
                            <div
                                style={{
                                    width: "20px",
                                    height: "20px",
                                    border: "2px solid #FFFFFF33",
                                    borderTop: "2px solid #FFFFFF",
                                    borderRadius: "50%",
                                    animation: "spin 0.8s linear infinite"
                                }}
                            />
                        ) : (
                            "Sign In"
                        )}
                    </button>
                </form>

                {/* Content Divider Layer */}
                <div
                    style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        margin: "2rem 0",
                        width: "100%"
                    }}
                >
                    <div style={{ flex: 1, height: "1px", backgroundColor: "#EAEAEA" }}></div>
                    <span
                        style={{
                            padding: "0 1rem",
                            fontSize: "11px",
                            color: "#888888",
                            fontWeight: "500",
                            letterSpacing: "0.5px"
                        }}
                    >
                        OR CONTINUE WITH
                    </span>
                    <div style={{ flex: 1, height: "1px", backgroundColor: "#EAEAEA" }}></div>
                </div>

                {/* Google Authentication Button */}
                <button
                    type="button"
                    onClick={handleGoogleSignIn}
                    disabled={isLoading}
                    style={{
                        width: "100%",
                        backgroundColor: "#FFFFFF",
                        border: "1px solid #E0E0E0",
                        borderRadius: "8px",
                        padding: "0.85rem",
                        fontSize: "14px",
                        fontWeight: "500",
                        color: "#111111",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        gap: "10px",
                        cursor: isLoading ? "not-allowed" : "pointer",
                        boxSizing: "border-box",
                        opacity: isLoading ? 0.7 : 1
                    }}
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
                    Google
                </button>

            </div>

            {/* Persistent Outer Bottom Navigation Context */}
            <p
                style={{
                    marginTop: "2rem",
                    fontSize: "14px",
                    color: "#444444",
                    textAlign: "center"
                }}
            >
                Don't have an account?{" "}
                <a
                    href="/signup"
                    style={{
                        color: "#B9001B",
                        fontWeight: "600",
                        textDecoration: "none",
                        marginLeft: "2px"
                    }}
                >
                    Sign Up
                </a>
            </p>

            <style jsx>{`
                @keyframes spin {
                    to { transform: rotate(360deg); }
                }
            `}</style>
        </div>
    );
}