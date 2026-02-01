"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Navbar } from "@/components/layout/Navbar";
import { motion } from "framer-motion";
import { Mail, ArrowLeft, CheckCircle } from "lucide-react";

export default function ForgotPasswordPage() {
    const [email, setEmail] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError("");

        try {
            const res = await fetch("/api/auth/forgot-password", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email })
            });

            const data = await res.json();

            if (!res.ok) {
                setError(data.error || "Failed to send reset email");
            } else {
                setSuccess(true);
            }
        } catch (e) {
            setError("Something went wrong. Please try again.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <main className="min-h-screen bg-black text-white relative overflow-hidden flex flex-col">
            <Navbar />

            {/* Background Ambience */}
            <div className="absolute inset-0 pointer-events-none">
                <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-secondary/5 rounded-full blur-3xl" />
                <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-accent/5 rounded-full blur-3xl" />
            </div>

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
                                <div className="w-16 h-16 rounded-full bg-secondary/10 flex items-center justify-center">
                                    <Mail className="w-8 h-8 text-secondary" />
                                </div>
                            </div>
                            <CardTitle className="text-2xl text-center">Forgot Password?</CardTitle>
                            <CardDescription className="text-center">
                                {success
                                    ? "Check your email for reset instructions"
                                    : "Enter your email to receive a password reset link"
                                }
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="grid gap-4">
                            {success ? (
                                <div className="space-y-4">
                                    <div className="flex items-center justify-center">
                                        <CheckCircle className="w-16 h-16 text-green-500" />
                                    </div>
                                    <div className="p-4 rounded-lg bg-green-500/10 border border-green-500/50 text-green-500 text-sm text-center">
                                        <p className="font-medium mb-2">Email Sent Successfully!</p>
                                        <p className="text-xs text-green-400">
                                            We've sent a password reset link to <strong>{email}</strong>
                                        </p>
                                        <p className="text-xs text-green-400 mt-2">
                                            The link will expire in 1 hour.
                                        </p>
                                    </div>
                                    <Link href="/login" className="block">
                                        <Button className="w-full" variant="outline">
                                            <ArrowLeft className="w-4 h-4 mr-2" />
                                            Back to Login
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
                                            <Label htmlFor="email">Email Address</Label>
                                            <Input
                                                id="email"
                                                type="email"
                                                placeholder="name@example.com"
                                                required
                                                value={email}
                                                onChange={(e) => setEmail(e.target.value)}
                                                disabled={isLoading}
                                            />
                                        </div>
                                        <Button
                                            className="w-full"
                                            type="submit"
                                            disabled={isLoading}
                                            glow
                                            variant="primary"
                                        >
                                            {isLoading ? "Sending..." : "Send Reset Link"}
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
        </main>
    );
}
