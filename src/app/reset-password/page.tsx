"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Navbar } from "@/components/layout/Navbar";
import { motion } from "framer-motion";
import { Lock, CheckCircle, AlertCircle, Loader2 } from "lucide-react";

function ResetPasswordForm() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const token = searchParams.get("token");

    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState(false);
    const [tokenValid, setTokenValid] = useState<boolean | null>(null);

    useEffect(() => {
        // Verify token on page load
        if (!token) {
            setTokenValid(false);
            setError("Invalid or missing reset token");
            return;
        }

        // You can add token validation API call here
        setTokenValid(true);
    }, [token]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");

        // Validation
        if (password.length < 8) {
            setError("Password must be at least 8 characters long");
            return;
        }

        if (password !== confirmPassword) {
            setError("Passwords do not match");
            return;
        }

        setIsLoading(true);

        try {
            const res = await fetch("/api/auth/reset-password", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ token, password })
            });

            const data = await res.json();

            if (!res.ok) {
                setError(data.error || "Failed to reset password");
            } else {
                setSuccess(true);
                // Redirect to login after 3 seconds
                setTimeout(() => {
                    router.push("/login");
                }, 3000);
            }
        } catch (e) {
            setError("Something went wrong. Please try again.");
        } finally {
            setIsLoading(false);
        }
    };

    if (tokenValid === false) {
        return (
            <div className="flex-1 flex items-center justify-center p-4">
                <Card className="border-white/10 bg-black/60 w-full max-w-md">
                    <CardHeader className="text-center">
                        <div className="flex items-center justify-center mb-4">
                            <div className="w-16 h-16 rounded-full bg-red-500/10 flex items-center justify-center">
                                <AlertCircle className="w-8 h-8 text-red-500" />
                            </div>
                        </div>
                        <CardTitle className="text-2xl">Invalid Reset Link</CardTitle>
                        <CardDescription>
                            This password reset link is invalid or has expired.
                        </CardDescription>
                    </CardHeader>
                    <CardFooter className="flex flex-col gap-2">
                        <Link href="/forgot-password" className="w-full">
                            <Button className="w-full" variant="primary">
                                Request New Link
                            </Button>
                        </Link>
                        <Link href="/login" className="w-full">
                            <Button className="w-full" variant="outline">
                                Back to Login
                            </Button>
                        </Link>
                    </CardFooter>
                </Card>
            </div>
        );
    }

    return (
        <div className="flex-1 flex items-center justify-center -mt-16 p-4">
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5 }}
                className="w-full max-w-md"
            >
                <Card className="border-white/10 bg-black/60 shadow-[0_0_50px_-12px_rgba(0,0,0,0.5)]">
                    <CardHeader className="space-y-1 my-2">
                        <div className="flex items-center justify-center mb-4">
                            <div className={`w-16 h-16 rounded-full flex items-center justify-center ${success ? "bg-green-500/10" : "bg-secondary/10"
                                }`}>
                                {success ? (
                                    <CheckCircle className="w-8 h-8 text-green-500" />
                                ) : (
                                    <Lock className="w-8 h-8 text-secondary" />
                                )}
                            </div>
                        </div>
                        <CardTitle className="text-2xl text-center">
                            {success ? "Password Reset!" : "Reset Your Password"}
                        </CardTitle>
                        <CardDescription className="text-center">
                            {success
                                ? "Your password has been successfully reset"
                                : "Enter your new password below"
                            }
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="grid gap-4">
                        {success ? (
                            <div className="space-y-4">
                                <div className="p-4 rounded-lg bg-green-500/10 border border-green-500/50 text-green-500 text-sm text-center">
                                    <p className="font-medium mb-2">Success!</p>
                                    <p className="text-xs text-green-400">
                                        Redirecting you to login page...
                                    </p>
                                </div>
                                <Link href="/login" className="block">
                                    <Button className="w-full" variant="primary">
                                        Go to Login
                                    </Button>
                                </Link>
                            </div>
                        ) : (
                            <>
                                {error && (
                                    <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/50 text-red-500 text-sm">
                                        {error}
                                    </div>
                                )}
                                <form onSubmit={handleSubmit} className="space-y-4">
                                    <div className="grid gap-2">
                                        <Label htmlFor="password">New Password</Label>
                                        <Input
                                            id="password"
                                            type="password"
                                            placeholder="Enter new password"
                                            required
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                            disabled={isLoading}
                                            minLength={8}
                                        />
                                        <p className="text-xs text-gray-400">
                                            Must be at least 8 characters long
                                        </p>
                                    </div>
                                    <div className="grid gap-2">
                                        <Label htmlFor="confirmPassword">Confirm Password</Label>
                                        <Input
                                            id="confirmPassword"
                                            type="password"
                                            placeholder="Confirm new password"
                                            required
                                            value={confirmPassword}
                                            onChange={(e) => setConfirmPassword(e.target.value)}
                                            disabled={isLoading}
                                        />
                                    </div>
                                    <Button
                                        className="w-full"
                                        type="submit"
                                        disabled={isLoading}
                                        variant="primary"
                                    >
                                        {isLoading ? "Resetting..." : "Reset Password"}
                                    </Button>
                                </form>
                            </>
                        )}
                    </CardContent>
                    {!success && (
                        <CardFooter className="flex flex-col space-y-2">
                            <div className="text-sm text-center text-gray-400">
                                Remember your password?{" "}
                                <Link href="/login" className="text-secondary hover:underline">
                                    Sign In
                                </Link>
                            </div>
                        </CardFooter>
                    )}
                </Card>
            </motion.div>
        </div>
    );
}

export default function ResetPasswordPage() {
    return (
        <main className="min-h-screen bg-black text-white relative overflow-hidden flex flex-col">
            <Navbar />

            {/* Background Ambience */}
            <div className="absolute inset-0 pointer-events-none">
                <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-secondary/5 rounded-full blur-3xl" />
                <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-accent/5 rounded-full blur-3xl" />
            </div>

            <Suspense fallback={<div className="flex-1 flex items-center justify-center"><Loader2 className="animate-spin text-white" size={48} /></div>}>
                <ResetPasswordForm />
            </Suspense>
        </main>
    );
}
