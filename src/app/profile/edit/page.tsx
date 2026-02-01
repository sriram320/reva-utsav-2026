"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Navbar } from "@/components/layout/Navbar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function EditProfilePage() {
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState(false);
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        phone: "",
        college: "",
        state: "",
        district: "",
    });

    const isRevaStudent = formData.college?.toLowerCase().includes("reva");

    useEffect(() => {
        fetchProfile();
    }, []);

    const fetchProfile = async () => {
        try {
            const res = await fetch("/api/user/profile");

            if (res.status === 401) {
                router.push("/login");
                return;
            }

            if (!res.ok) {
                throw new Error("Failed to fetch profile");
            }

            const data = await res.json();
            setFormData({
                name: data.user.name || "",
                email: data.user.email || "",
                phone: data.user.phone || "",
                college: data.user.college || "",
                state: data.user.state || "",
                district: data.user.district || "",
            });
        } catch (err) {
            setError("Failed to load profile");
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        setError("");
        setSuccess(false);

        try {
            const res = await fetch("/api/user/profile", {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(formData),
            });

            if (!res.ok) {
                const data = await res.json();
                throw new Error(data.error || "Failed to update profile");
            }

            setSuccess(true);
            setTimeout(() => {
                router.push("/dashboard");
            }, 2000);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <main className="min-h-screen bg-black text-white flex items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-secondary" />
            </main>
        );
    }

    return (
        <main className="min-h-screen bg-black text-white relative overflow-hidden flex flex-col">
            <Navbar />

            {/* Background Ambience */}
            <div className="absolute inset-0 pointer-events-none">
                <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-secondary/5 rounded-full blur-3xl" />
                <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-accent/5 rounded-full blur-3xl" />
            </div>

            <div className="container mx-auto px-4 py-24 flex-1 relative z-10">
                <div className="max-w-2xl mx-auto">
                    <div className="mb-6">
                        <Link href="/dashboard">
                            <Button variant="ghost" size="sm" className="mb-4">
                                <ArrowLeft className="w-4 h-4 mr-2" />
                                Back to Dashboard
                            </Button>
                        </Link>
                        <h1 className="text-3xl font-orbitron font-bold">Edit Profile</h1>
                        <p className="text-gray-400 mt-2">Update your personal information</p>
                    </div>

                    <Card className="border-white/10 bg-black/60 shadow-xl">
                        <CardHeader>
                            <CardTitle>Personal Information</CardTitle>
                            <CardDescription>
                                Keep your profile up to date
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            {error && (
                                <div className="mb-4 p-3 rounded-lg bg-red-500/10 border border-red-500/50 text-red-500 text-sm">
                                    {error}
                                </div>
                            )}
                            {success && (
                                <div className="mb-4 p-3 rounded-lg bg-green-500/10 border border-green-500/50 text-green-500 text-sm">
                                    Profile updated successfully! Redirecting...
                                </div>
                            )}

                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="name">Full Name *</Label>
                                    <Input
                                        id="name"
                                        type="text"
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                        required
                                        disabled={saving}
                                        className="bg-zinc-900 border-zinc-800"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="email">Email Address *</Label>
                                    <Input
                                        id="email"
                                        type="email"
                                        value={formData.email}
                                        disabled
                                        className="opacity-50 cursor-not-allowed bg-zinc-900 border-zinc-800"
                                    />
                                    <p className="text-xs text-gray-400">Email cannot be changed</p>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="phone">Phone Number</Label>
                                    <Input
                                        id="phone"
                                        type="tel"
                                        value={formData.phone}
                                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                        placeholder="Enter your phone number"
                                        disabled={saving}
                                        className="bg-zinc-900 border-zinc-800"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="college">College/University *</Label>
                                    <Input
                                        id="college"
                                        type="text"
                                        value={formData.college}
                                        onChange={(e) => setFormData({ ...formData, college: e.target.value })}
                                        placeholder="Enter your college name"
                                        disabled={saving}
                                        required
                                        className="bg-zinc-900 border-zinc-800"
                                    />
                                </div>

                                {!isRevaStudent && formData.college && (
                                    <>
                                        <div className="space-y-2">
                                            <Label htmlFor="state">State *</Label>
                                            <Input
                                                id="state"
                                                type="text"
                                                value={formData.state}
                                                onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                                                placeholder="Enter your state"
                                                disabled={saving}
                                                required
                                                className="bg-zinc-900 border-zinc-800"
                                            />
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="district">District *</Label>
                                            <Input
                                                id="district"
                                                type="text"
                                                value={formData.district}
                                                onChange={(e) => setFormData({ ...formData, district: e.target.value })}
                                                placeholder="Enter your district"
                                                disabled={saving}
                                                required
                                                className="bg-zinc-900 border-zinc-800"
                                            />
                                        </div>
                                    </>
                                )}

                                <div className="flex gap-3 pt-4">
                                    <Link href="/dashboard" className="flex-1">
                                        <Button type="button" variant="outline" className="w-full" disabled={saving}>
                                            Cancel
                                        </Button>
                                    </Link>
                                    <Button type="submit" variant="primary" glow className="flex-1" disabled={saving}>
                                        {saving ? (
                                            <>
                                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                                Saving...
                                            </>
                                        ) : (
                                            "Save Changes"
                                        )}
                                    </Button>
                                </div>
                            </form>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </main>
    );
}
