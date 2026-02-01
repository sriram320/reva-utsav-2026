"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Navbar } from "@/components/layout/Navbar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { User, QrCode, Ticket, Shield, Loader2, ShoppingCart, Home } from "lucide-react";
import Link from "next/link";

interface UserProfile {
    user: {
        id: number;
        name: string;
        email: string;
        college: string | null;
        phone: string | null;
    };
    passes: Array<{
        id: number;
        passType: string;
        passId: string;
        purchaseDate: string;
        amountPaid: number;
        status: string;
    }>;
    registrations: Array<{
        id: number;
        eventName: string;
        eventCategory: string;
        status: string;
    }>;
    accommodation?: {
        status: string;
        roomAllotted: string | null;
        checkedIn: boolean;
    } | null;
}

export default function DashboardPage() {
    const router = useRouter();
    const [profile, setProfile] = useState<UserProfile | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        fetchProfile();
    }, []);

    const fetchProfile = async () => {
        try {
            const res = await fetch("/api/user/profile");

            if (res.status === 401) {
                // Not authenticated, redirect to login
                router.push("/login");
                return;
            }

            if (!res.ok) {
                throw new Error("Failed to fetch profile");
            }

            const data = await res.json();
            setProfile(data);
        } catch (err) {
            setError("Failed to load profile");
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleLogout = async () => {
        try {
            await fetch("/api/auth/logout", { method: "POST" });
            router.push("/login");
        } catch (err) {
            console.error("Logout failed:", err);
        }
    };

    if (loading) {
        return (
            <main className="min-h-screen bg-black text-white flex items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-secondary" />
            </main>
        );
    }

    if (error || !profile) {
        return (
            <main className="min-h-screen bg-black text-white flex items-center justify-center">
                <div className="text-center">
                    <p className="text-red-500 mb-4">{error || "Failed to load profile"}</p>
                    <Button onClick={() => router.push("/login")}>Go to Login</Button>
                </div>
            </main>
        );
    }

    const hasPass = profile.passes.length > 0;
    const activePass = hasPass ? profile.passes[0] : null;

    return (
        <main className="min-h-screen bg-black text-white relative overflow-hidden flex flex-col">
            <Navbar />

            <div className="container mx-auto px-4 py-24 flex-1">
                <div className="mb-8 flex justify-between items-center">
                    <div>
                        <h1 className="text-3xl font-orbitron font-bold text-white">My Dashboard</h1>
                        <p className="text-gray-400">Welcome back, {profile.user.name}!</p>
                    </div>
                    <Button variant="outline" size="sm" onClick={handleLogout}>
                        Logout
                    </Button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* Profile Card */}
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Profile Status</CardTitle>
                            <User className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">
                                {profile.user.college && profile.user.phone ? "100%" : "75%"}
                            </div>
                            <p className="text-xs text-muted-foreground">
                                {profile.user.college && profile.user.phone
                                    ? "Profile complete"
                                    : "Complete your profile"}
                            </p>
                            <Link href="/profile/edit">
                                <Button variant="ghost" className="w-full mt-4 text-xs h-8">
                                    Edit Profile
                                </Button>
                            </Link>
                        </CardContent>
                    </Card>

                    {/* Pass Card */}
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Access Pass</CardTitle>
                            <QrCode className="h-4 w-4 text-secondary" />
                        </CardHeader>
                        <CardContent>
                            {hasPass && activePass ? (
                                activePass.status === 'pending_verification' ? (
                                    <>
                                        <div className="text-xl font-bold text-yellow-500 animate-pulse">
                                            Verification Pending
                                        </div>
                                        <p className="text-xs text-muted-foreground mt-2">
                                            Validating your identity. Waiting for Admin Approval.
                                        </p>
                                        <div className="w-full h-32 bg-secondary/10 rounded-lg mt-4 flex items-center justify-center border border-dashed border-secondary/30">
                                            <Shield className="w-12 h-12 text-secondary/50" />
                                        </div>
                                    </>
                                ) : (
                                    <>
                                        <div className="text-2xl font-bold text-secondary">
                                            {activePass.passType}
                                        </div>
                                        <p className="text-xs text-muted-foreground">
                                            ID: {activePass.passId}
                                        </p>
                                        <Button variant="primary" className="w-full mt-4 text-xs h-8" glow>
                                            View QR Code
                                        </Button>
                                    </>
                                )
                            ) : (
                                <>
                                    <div className="text-2xl font-bold text-gray-500">No Pass</div>
                                    <p className="text-xs text-muted-foreground">
                                        Purchase a pass to access events
                                    </p>
                                    <Link href="/passes">
                                        <Button variant="primary" className="w-full mt-4 text-xs h-8" glow>
                                            <ShoppingCart className="w-3 h-3 mr-1" />
                                            Buy Pass
                                        </Button>
                                    </Link>
                                </>
                            )}
                        </CardContent>
                    </Card>

                    {/* Events Card */}
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Registrations</CardTitle>
                            <Ticket className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{profile.registrations.length}</div>
                            <p className="text-xs text-muted-foreground">
                                {profile.registrations.length === 0
                                    ? "No events registered"
                                    : "Events registered"}
                            </p>
                            <Link href="/events">
                                <Button variant="outline" className="w-full mt-4 text-xs h-8">
                                    {profile.registrations.length === 0 ? "Browse Events" : "View My Events"}
                                </Button>
                            </Link>
                        </CardContent>
                    </Card>
                </div>

                {/* Event Registrations List */}
                {profile.registrations.length > 0 && (
                    <div className="mt-8">
                        <h2 className="text-xl font-semibold mb-4">My Event Registrations</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {profile.registrations.map((reg) => (
                                <Card key={reg.id}>
                                    <CardHeader>
                                        <CardTitle className="text-base">{reg.eventName}</CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <p className="text-sm text-gray-400 mb-2">
                                            Category: {reg.eventCategory}
                                        </p>
                                        <div className={`inline-block px-2 py-1 rounded text-xs ${reg.status === 'paid' ? 'bg-green-500/20 text-green-500' :
                                            reg.status === 'pending' ? 'bg-yellow-500/20 text-yellow-500' :
                                                'bg-gray-500/20 text-gray-500'
                                            }`}>
                                            {reg.status.toUpperCase()}
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    </div>
                )}

                {/* Accommodation Status */}
                <div className="mt-8 border border-white/10 rounded-xl p-8 bg-white/5 relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-4 opacity-10">
                        <Home className="w-24 h-24" />
                    </div>

                    <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative z-10">
                        <div>
                            <div className="flex items-center gap-3 mb-2">
                                <h3 className="text-xl font-semibold">Accommodation</h3>
                                {profile.accommodation ? (
                                    <span className={`px-2 py-0.5 rounded text-xs font-bold ${profile.accommodation.status === 'approved' ? 'bg-green-500/20 text-green-500' : 'bg-yellow-500/20 text-yellow-500'
                                        }`}>
                                        {profile.accommodation.status.toUpperCase()}
                                    </span>
                                ) : (
                                    <span className="px-2 py-0.5 rounded text-xs font-bold bg-gray-500/20 text-gray-400">
                                        NOT BOOKED
                                    </span>
                                )}
                            </div>

                            {profile.accommodation ? (
                                <div className="space-y-1">
                                    <p className="text-gray-300">
                                        Room Allotted: <span className="text-secondary font-bold text-lg ml-2">{profile.accommodation.roomAllotted || "Pending"}</span>
                                    </p>
                                    <p className="text-sm text-gray-400">
                                        Check-in Status: <span className={profile.accommodation.checkedIn ? "text-green-400" : "text-yellow-500"}>
                                            {profile.accommodation.checkedIn ? "Checked In ✅" : "Not Checked In"}
                                        </span>
                                    </p>
                                </div>
                            ) : (
                                <p className="text-gray-400">
                                    Need a place to stay during the fest? Book your accommodation now.
                                </p>
                            )}
                        </div>

                        <Link href="/accommodation">
                            <Button variant="outline" className="min-w-[150px]">
                                {profile.accommodation ? "View Details" : "Book Accommodation"}
                            </Button>
                        </Link>
                    </div>
                </div>
            </div>
        </main>
    );
}
