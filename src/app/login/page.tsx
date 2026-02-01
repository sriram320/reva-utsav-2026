"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Navbar } from "@/components/layout/Navbar";
import { motion } from "framer-motion";
import { Chrome } from "lucide-react";
import { signIn } from "next-auth/react";

export default function LoginPage() {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState("");
    const [formData, setFormData] = useState({
        email: "",
        password: ""
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError("");

        try {
            const result = await signIn("credentials", {
                email: formData.email,
                password: formData.password,
                redirect: false,
            });

            if (result?.error) {
                setError("Invalid email or password");
            } else if (result?.ok) {
                // Redirect to dashboard on success
                router.push("/dashboard");
                router.refresh();
            }
        } catch (e) {
            setError("Something went wrong. Please try again.");
        } finally {
            setIsLoading(false);
        }
    };

    const handleGoogleSignIn = async () => {
        await signIn("google", { callbackUrl: "/dashboard" });
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
                            <CardTitle className="text-2xl text-center">Participant Login</CardTitle>
                            <CardDescription className="text-center">
                                Enter your credentials to access the portal
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="grid gap-4">
                            {error && (
                                <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/50 text-red-500 text-sm">
                                    {error}
                                </div>
                            )}
                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div className="grid gap-2">
                                    <Label htmlFor="email">Email</Label>
                                    <Input
                                        id="email"
                                        type="email"
                                        placeholder="name@example.com"
                                        required
                                        value={formData.email}
                                        onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                                    />
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="password">Password</Label>
                                    <Input
                                        id="password"
                                        type="password"
                                        required
                                        value={formData.password}
                                        onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
                                    />
                                </div>
                                <Button className="w-full" type="submit" disabled={isLoading} glow variant="primary">
                                    {isLoading ? "Authenticating..." : "Sign In"}
                                </Button>
                            </form>

                            <div className="relative">
                                <div className="absolute inset-0 flex items-center">
                                    <span className="w-full border-t border-white/10" />
                                </div>
                                <div className="relative flex justify-center text-xs uppercase">
                                    <span className="bg-black px-2 text-gray-400">Or continue with</span>
                                </div>
                            </div>

                            <Button
                                type="button"
                                variant="outline"
                                className="w-full"
                                onClick={handleGoogleSignIn}
                            >
                                <Chrome className="w-4 h-4 mr-2" />
                                Sign in with Google
                            </Button>
                        </CardContent>
                        <CardFooter className="flex flex-col space-y-2">
                            <div className="text-sm text-center text-gray-400">
                                Don't have an account?{" "}
                                <Link href="/register" className="text-secondary hover:underline">
                                    Register Now
                                </Link>
                            </div>
                            <div className="text-xs text-center text-gray-500">
                                <Link href="/forgot-password" className="hover:text-gray-300">Forgot password?</Link>
                            </div>
                        </CardFooter>
                    </Card>
                </motion.div>
            </div>
        </main>
    );
}
