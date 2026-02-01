"use client";

import { useState, useEffect } from "react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";
import { Check, AlertCircle, Loader2, Ticket, School, User } from "lucide-react";
import { useRouter } from "next/navigation";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";

export default function PassesPage() {
    const router = useRouter();
    const [batches, setBatches] = useState<any[]>([]);
    const [coupons, setCoupons] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [systemStatus, setSystemStatus] = useState<"ACTIVE" | "PAUSED">("PAUSED");
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const [user, setUser] = useState<any>(null);

    const [userType, setUserType] = useState<"outsider" | "reva">("outsider");
    const [srn, setSrn] = useState("");
    const [dept, setDept] = useState("");

    const [couponCode, setCouponCode] = useState("");
    const [appliedCoupon, setAppliedCoupon] = useState<{ code: string, discount: number } | null>(null);
    const [couponError, setCouponError] = useState("");
    const [purchasing, setPurchasing] = useState(false);

    useEffect(() => {
        fetchPassData();
        fetchAuth();
    }, []);

    const fetchAuth = async () => {
        try {
            const res = await fetch('/api/auth/me');
            if (res.ok) {
                const data = await res.json();
                setUser(data.user);
            }
        } catch (e) { console.error("Auth check failed", e); }
    };

    const fetchPassData = async () => {
        try {
            // Fetch available batches (Public API)
            const res = await fetch('/api/ticketing/public');
            const data = await res.json();
            setBatches(data.batches || []);
            setSystemStatus(data.status || 'ACTIVE');

            // Note: Coupons are verified server-side now, not fetched upfront
        } catch (error) {
            console.error('Error fetching pass data:', error);
        }
        setLoading(false);
    };

    const handleApplyCoupon = async () => {
        setCouponError("");
        setAppliedCoupon(null);
        if (!couponCode) return;

        try {
            const res = await fetch('/api/ticketing/coupon/verify', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ code: couponCode })
            });
            const data = await res.json();

            if (res.ok && data.valid) {
                setAppliedCoupon({ code: data.code, discount: data.discount });
            } else {
                setCouponError(data.error || "Invalid coupon code");
            }
        } catch (error) {
            setCouponError("Error verifying coupon");
        }
    };

    // Check if there are any active batches
    const activeBatches = batches.filter(b => b.status === 'Active' || b.status === 'Scheduled');
    const activeBatch = activeBatches.length > 0 ? activeBatches[0] : null;

    // Dynamic Pricing Logic
    let basePrice = activeBatch ? activeBatch.price : 299;

    // Concession for Reva Students (Example: Flat 50 off or something, but for now user just said "low rate")
    // Let's assume the batch price is the standard price. 
    // If Reva Student, maybe we apply a 20% discount automatically? 
    // The user said "give them at low rate". Let's assume specific reva pricing isn't in DB yet, so we'll simulate it or just stick to base for now unless instructed.
    // ACTUAL: User said "we give them at low rate". I will assume a standard discount for Reva or just keep same price for now if no specific logic provided, but logic supports it.
    // Let's implement a hardcoded discount for now to show the feature.
    if (userType === 'reva') {
        basePrice = Math.floor(basePrice * 0.8); // 20% Discount for Reva
    }

    const discountAmount = appliedCoupon ? (basePrice * appliedCoupon.discount / 100) : 0;
    const finalPrice = Math.max(0, Math.floor(basePrice - discountAmount));

    const handlePurchase = async () => {
        if (userType === 'reva' && (!srn || !dept)) {
            alert("Please enter your SRN and Department.");
            return;
        }

        setPurchasing(true);
        try {
            const res = await fetch('/api/passes', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    passType: activeBatch?.name || 'Standard Pass',
                    amountPaid: finalPrice,
                    couponCode: appliedCoupon?.code,
                    isRevaStudent: userType === 'reva',
                    srn,
                    department: dept
                })
            });

            const data = await res.json();

            if (res.ok) {
                alert(data.message);
                router.push('/dashboard'); // Or my-tickets
            } else {
                alert(data.error || "Purchase Failed");
            }

        } catch (e) {
            console.error(e);
            alert("An error occurred during purchase.");
        }
        setPurchasing(false);
    };

    if (loading) {
        return (
            <main className="min-h-screen bg-black text-white flex items-center justify-center">
                <Navbar />
                <div className="text-center">
                    <Loader2 className="animate-spin mx-auto mb-4" size={48} />
                    <p>Loading pass information...</p>
                </div>
            </main>
        );
    }

    return (
        <main className="min-h-screen bg-black text-white relative overflow-hidden flex flex-col">
            <Navbar />

            <div className="flex-1 container mx-auto px-4 py-24">
                <div className="text-center mb-16">
                    <motion.h1
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-5xl md:text-7xl font-black font-orbitron mb-6 text-white"
                    >
                        GET THE <span className="text-secondary">ALL-ACCESS</span> PASS
                    </motion.h1>
                    <p className="text-xl text-gray-400 max-w-2xl mx-auto">
                        Unlock the full Reva Utsav experience. One pass, endless possibilities.
                    </p>
                </div>

                {/* Check if passes are available */}
                {systemStatus === "PAUSED" || activeBatches.length === 0 || !activeBatch ? (
                    <div className="max-w-2xl mx-auto">
                        <Card className="bg-white/5 border-white/10">
                            <CardContent className="p-12 text-center">
                                <Ticket className="mx-auto mb-6 text-gray-400" size={64} />
                                <h2 className="text-3xl font-bold mb-4 text-white">Passes Not Available Yet</h2>
                                <p className="text-gray-400 mb-6">
                                    Pass sales haven't started yet. Check back soon or contact the admin team for updates.
                                </p>
                                <div className="flex gap-4 justify-center">
                                    <Button onClick={() => router.push('/')} variant="outline">Back to Home</Button>
                                    <Button onClick={() => router.push('/events')} className="bg-secondary text-black hover:bg-yellow-500">Browse Events</Button>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 max-w-5xl mx-auto items-start">
                        {/* Left: Pass Details */}
                        <motion.div initial={{ opacity: 0, x: -50 }} animate={{ opacity: 1, x: 0 }}>
                            <Card className="bg-gradient-to-br from-purple-900/40 to-black border-purple-500/30 overflow-hidden relative">
                                <div className="absolute top-0 right-0 w-40 h-40 bg-secondary/10 rounded-full blur-3xl"></div>

                                <CardHeader>
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <CardTitle className="text-3xl font-bold text-white mb-2">{activeBatch.name}</CardTitle>
                                            <CardDescription className="text-purple-300">OFFICIAL ENTRY TICKET</CardDescription>
                                        </div>
                                        <Badge className="bg-secondary text-black font-bold">{activeBatch.status === 'Active' ? 'AVAILABLE' : activeBatch.status}</Badge>
                                    </div>
                                </CardHeader>

                                <CardContent className="space-y-6">
                                    <div className="space-y-3">
                                        {[
                                            "Entry to All Technical & Cultural Events",
                                            "Access to One Premium Workshop",
                                            "Star Night Concert Access",
                                            "Official Swag Bag & Sticker Pack",
                                            "Lunch & Refreshments included"
                                        ].map((benefit, i) => (
                                            <div key={i} className="flex items-start gap-3">
                                                <Check className="text-secondary mt-1 flex-shrink-0" size={18} />
                                                <span className="text-gray-300">{benefit}</span>
                                            </div>
                                        ))}
                                    </div>

                                    <div className="pt-6 border-t border-white/10">
                                        <div className="text-sm text-gray-400 mb-2">Price</div>
                                        <div className="text-4xl font-black text-secondary">₹{basePrice} <span className="text-lg font-normal text-gray-500 ml-2">{userType === 'reva' ? '(Concession)' : ''}</span></div>
                                    </div>
                                </CardContent>
                            </Card>
                        </motion.div>

                        {/* Right: Checkout & Identification */}
                        <motion.div initial={{ opacity: 0, x: 50 }} animate={{ opacity: 1, x: 0 }} className="space-y-6">

                            {/* User Type Selection */}
                            <Card className="bg-white/5 border-white/10">
                                <CardHeader>
                                    <CardTitle className="text-white text-lg">Select Participant Type</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <RadioGroup value={userType} onValueChange={(v: any) => setUserType(v)} className="grid grid-cols-2 gap-4">
                                        <div>
                                            <RadioGroupItem value="outsider" id="outsider" className="peer sr-only" />
                                            <Label
                                                htmlFor="outsider"
                                                className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-secondary peer-data-[state=checked]:text-secondary cursor-pointer"
                                            >
                                                <User className="mb-3 h-6 w-6" />
                                                Outsider
                                            </Label>
                                        </div>
                                        <div>
                                            <RadioGroupItem value="reva" id="reva" className="peer sr-only" />
                                            <Label
                                                htmlFor="reva"
                                                className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-secondary peer-data-[state=checked]:text-secondary cursor-pointer"
                                            >
                                                <School className="mb-3 h-6 w-6" />
                                                Reva Student
                                            </Label>
                                        </div>
                                    </RadioGroup>

                                    {/* Reva Specific Fields */}
                                    {userType === 'reva' && (
                                        <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} className="mt-4 space-y-3 overflow-hidden">
                                            <div className="bg-yellow-500/10 border border-yellow-500/20 p-3 rounded text-sm text-yellow-500 mb-2">
                                                Note: You must be logged in with your official <strong>@reva.edu.in</strong> email account or link it.
                                            </div>
                                            <div className="space-y-2">
                                                <Label className="text-gray-300">Official Email ID</Label>
                                                <Input
                                                    placeholder="name@reva.edu.in"
                                                    value={user?.email || ""}
                                                    disabled
                                                    className="bg-zinc-900 border-zinc-700 text-white placeholder:text-gray-500 opacity-70 cursor-not-allowed"
                                                />
                                                {!user?.email?.endsWith('@reva.edu.in') && (
                                                    <p className="text-red-400 text-xs">
                                                        Error: You are logged in as {user?.email}. Please logout and use Google Sign-In with your Reva account.
                                                    </p>
                                                )}
                                            </div>
                                            <div className="space-y-2">
                                                <Label className="text-gray-300">SRN Number</Label>
                                                <Input
                                                    placeholder="R21..."
                                                    value={srn}
                                                    onChange={(e) => setSrn(e.target.value)}
                                                    className="bg-zinc-900 border-zinc-700 text-white placeholder:text-gray-500"
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <Label className="text-gray-300">Department / School</Label>
                                                <Input
                                                    placeholder="e.g. C&IT"
                                                    value={dept}
                                                    onChange={(e) => setDept(e.target.value)}
                                                    className="bg-zinc-900 border-zinc-700 text-white placeholder:text-gray-500"
                                                />
                                            </div>
                                        </motion.div>
                                    )}
                                </CardContent>
                            </Card>

                            {/* Coupon Code */}
                            <Card className="bg-white/5 border-white/10">
                                <CardHeader>
                                    <CardTitle className="text-white text-lg">Coupon Code</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="flex gap-2">
                                        <Input
                                            placeholder="Enter Code"
                                            value={couponCode}
                                            onChange={(e) => setCouponCode(e.target.value)}
                                            className="bg-zinc-900 border-zinc-800"
                                        />
                                        <Button onClick={handleApplyCoupon} variant="outline" disabled={activeBatch.status !== 'Active'}>Apply</Button>
                                    </div>
                                    {couponError && <p className="text-red-400 text-sm mt-2 flex items-center gap-2"><AlertCircle size={14} /> {couponError}</p>}
                                    {appliedCoupon && <p className="text-green-400 text-sm mt-2 flex items-center gap-2"><Check size={14} /> {appliedCoupon.discount}% discount applied!</p>}
                                </CardContent>
                            </Card>

                            {/* Summary & Pay */}
                            <Card className="bg-white/5 border-white/10">
                                <CardContent className="space-y-3 pt-6">
                                    <div className="flex justify-between text-gray-400"><span>Subtotal</span><span>₹{basePrice}</span></div>
                                    {appliedCoupon && <div className="flex justify-between text-green-400"><span>Discount</span><span>-₹{discountAmount}</span></div>}
                                    <div className="border-t border-white/10 pt-3 flex justify-between text-xl font-bold text-white"><span>Total</span><span className="text-secondary">₹{finalPrice}</span></div>
                                </CardContent>
                                <CardFooter>
                                    <Button
                                        onClick={() => {
                                            if (!user) {
                                                router.push('/login?redirect=/passes');
                                            } else {
                                                handlePurchase();
                                            }
                                        }}
                                        disabled={activeBatch.status !== 'Active' || purchasing}
                                        className={`w-full font-bold py-6 text-lg ${activeBatch.status === 'Active' ? 'bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white' : 'bg-gray-700 text-gray-400 cursor-not-allowed'}`}
                                    >
                                        {purchasing ? <Loader2 className="animate-spin" /> : (!user ? "LOGIN TO PURCHASE" : (userType === 'reva' ? 'VERIFY & PAY' : 'PROCEED TO PAYMENT'))}
                                    </Button>
                                </CardFooter>
                            </Card>
                        </motion.div>
                    </div>
                )}
            </div>
            <Footer />
        </main>
    );
}
