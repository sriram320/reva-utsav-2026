"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Loader2, ShieldAlert } from "lucide-react";
import Link from "next/link";

export default function AdminLoginPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    // Form Data
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError("");

        try {
            const res = await fetch("/api/auth/login", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, password })
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.error || "Login failed");
            }

            // Verify Admin Role
            const meRes = await fetch("/api/auth/me");
            const meData = await meRes.json();

            if (meData.role !== 'admin') {
                setError("Access Denied: You are not an admin");
                // Optional: Logout if they are not admin
                return;
            }

            router.push("/admin/accommodation");

        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <main className="min-h-screen bg-black text-white flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-red-950/30 via-black to-black opacity-50 z-0" />

            <Card className="w-full max-w-md bg-zinc-950 border-red-900/30 z-10 relative shadow-2xl shadow-red-900/10">
                <CardHeader className="text-center space-y-2">
                    <div className="mx-auto bg-red-900/20 p-3 rounded-full w-fit mb-2 border border-red-500/20 animate-pulse">
                        <ShieldAlert className="w-8 h-8 text-red-500" />
                    </div>
                    <CardTitle className="text-2xl font-bold font-orbitron text-red-100">Admin Command</CardTitle>
                    <CardDescription className="text-red-200/50">Restricted Access Level 5</CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleLogin} className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="email">Admin ID</Label>
                            <Input
                                id="email"
                                type="email"
                                placeholder="admin@reva.edu"
                                className="bg-zinc-900 border-red-900/20 focus:border-red-500/50 transition-colors"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="password">Secure Key</Label>
                            <Input
                                id="password"
                                type="password"
                                placeholder="••••••••"
                                className="bg-zinc-900 border-red-900/20 focus:border-red-500/50 transition-colors"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                            />
                        </div>

                        {error && (
                            <div className="text-red-500 text-sm text-center bg-red-950/20 p-2 rounded border border-red-900/50">
                                {error}
                            </div>
                        )}

                        <Button type="submit" className="w-full bg-red-700 hover:bg-red-600 font-bold text-white shadow-lg shadow-red-900/20" disabled={loading}>
                            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Authenticate & Access"}
                        </Button>

                    </form>
                </CardContent>
            </Card>
        </main>
    );
}
