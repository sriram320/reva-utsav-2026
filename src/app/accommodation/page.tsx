
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Check, Star, Shield, Wifi, Coffee } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export default function AccommodationBookingPage() {
    const router = useRouter();
    const [gender, setGender] = useState("");
    const [loading, setLoading] = useState(false);
    const [isBooked, setIsBooked] = useState(false);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const [user, setUser] = useState<any>(null);
    const [isBookingOpen, setIsBookingOpen] = useState(true);

    useEffect(() => {
        async function init() {
            try {
                // Check Auth
                const authRes = await fetch('/api/auth/me');
                if (authRes.ok) {
                    const data = await authRes.json();
                    setUser(data.user);
                }

                // Check Settings
                const settingsRes = await fetch('/api/admin/settings');
                if (settingsRes.ok) {
                    const settings = await settingsRes.json();
                    if (settings.accommodation_open === 'false') {
                        setIsBookingOpen(false);
                    }
                }
            } catch (e) {
                console.error("Init check failed", e);
            }
        }
        init();
    }, []);

    const handleBook = async () => {
        if (!user) {
            router.push('/login');
            return;
        }
        if (!gender) {
            alert("Please select your gender for room allocation.");
            return;
        }

        setLoading(true);
        try {
            const res = await fetch('/api/accommodation/book', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ gender })
            });

            if (res.ok) {
                setIsBooked(true);
            } else {
                alert("Booking failed. You might already have a request.");
            }
        } catch (e) {
            console.error(e);
            alert("Something went wrong");
        }
        setLoading(false);
    };

    if (isBooked) {
        return (
            <div className="min-h-screen bg-black text-white flex items-center justify-center p-4">
                <Card className="max-w-md w-full bg-zinc-950 border-green-500/50">
                    <CardHeader className="text-center">
                        <div className="mx-auto w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mb-4">
                            <Check className="text-green-500" size={32} />
                        </div>
                        <CardTitle className="text-green-500 text-2xl">Booking Confirmed!</CardTitle>
                        <CardDescription className="text-gray-400">
                            Your accommodation request is received.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4 text-center">
                        <p className="text-gray-300">
                            Your stay is confirmed. Please report to the <strong>Accommodation Desk</strong> at the venue upon arrival for room assignment.
                        </p>
                        <div className="bg-zinc-900 p-4 rounded-lg">
                            <div className="text-sm text-gray-500 uppercase font-bold mb-2">Next Steps</div>
                            <ol className="text-sm text-left list-decimal list-inside space-y-2 text-gray-300">
                                <li>Arrive at REVA University.</li>
                                <li>Go to the Registration Area.</li>
                                <li>Look for the Accommodation Desk.</li>
                                <li>Show your Participant ID & Govt ID.</li>
                                <li>Get your room assigned instantly.</li>
                            </ol>
                        </div>
                        <Button className="w-full bg-secondary text-black hover:bg-yellow-500" onClick={() => window.location.href = '/dashboard'}>
                            Return to Dashboard
                        </Button>
                    </CardContent>
                </Card>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-black text-white">
            <div className="relative h-[40vh] w-full overflow-hidden">
                <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1555854877-bab0e564b8d5?auto=format&fit=crop&q=80')] bg-cover bg-center"></div>
                <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black"></div>
                <div className="absolute bottom-0 left-0 p-8 max-w-7xl mx-auto w-full">
                    <Badge className="bg-secondary text-black mb-4">Official Stay Partner</Badge>
                    <h1 className="text-5xl font-bold font-orbitron mb-2">REVA UTSAV STAY</h1>
                    <p className="text-xl text-gray-300 max-w-xl">
                        Premium accommodation for all participants. Comfortable and secure.
                    </p>
                </div>
            </div>

            <div className="max-w-7xl mx-auto p-8 grid grid-cols-1 md:grid-cols-3 gap-8 -mt-20 relative z-10">
                <div className="col-span-2 space-y-8">
                    <Card className="bg-zinc-950 border-zinc-800">
                        <CardHeader>
                            <CardTitle className="text-white text-2xl">The Package</CardTitle>
                            <CardDescription>Everything you need for a comfortable festival experience</CardDescription>
                        </CardHeader>
                        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="flex items-start gap-4 p-4 bg-zinc-900 rounded-lg">
                                <div className="p-3 bg-blue-500/20 rounded-lg text-blue-400">
                                    <Star />
                                </div>
                                <div>
                                    <h3 className="font-bold text-lg text-white">3 Days / 4 Nights</h3>
                                    <p className="text-sm text-gray-400">Complete stay covered for the entire duration of the fest.</p>
                                </div>
                            </div>
                            <div className="flex items-start gap-4 p-4 bg-zinc-900 rounded-lg">
                                <div className="p-3 bg-purple-500/20 rounded-lg text-purple-400">
                                    <Shield />
                                </div>
                                <div>
                                    <h3 className="font-bold text-lg text-white">Security</h3>
                                    <p className="text-sm text-gray-400">24/7 security and managed access for your safety.</p>
                                </div>
                            </div>
                            <div className="flex items-start gap-4 p-4 bg-zinc-900 rounded-lg">
                                <div className="p-3 bg-green-500/20 rounded-lg text-green-400">
                                    <Wifi />
                                </div>
                                <div>
                                    <h3 className="font-bold text-lg text-white">Amenities</h3>
                                    <p className="text-sm text-gray-400">High-speed Wi-Fi, Charging stations, and Common areas.</p>
                                </div>
                            </div>
                            <div className="flex items-start gap-4 p-4 bg-zinc-900 rounded-lg">
                                <div className="p-3 bg-orange-500/20 rounded-lg text-orange-400">
                                    <Coffee />
                                </div>
                                <div>
                                    <h3 className="font-bold text-lg text-white">Refreshments</h3>
                                    <p className="text-sm text-gray-400">Morning breakfast included with your stay.</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <div className="bg-zinc-900 rounded-xl p-8 border border-zinc-800">
                        <h2 className="text-2xl font-bold mb-4">Hostel Rules</h2>
                        <ul className="list-disc list-inside space-y-2 text-gray-400">
                            <li>Check-in allowed only with valid Participant ID and Govt ID.</li>
                            <li>Separate accommodation blocks for Boys and Girls.</li>
                            <li>No alcohol or smoking permitted on campus premises.</li>
                            <li>Curfew timing: 10:30 PM.Gates will be closed.</li>
                            <li>Damage to property will be charged to the individual.</li>
                        </ul>
                    </div>
                </div>

                <div className="col-span-1">
                    <Card className="bg-zinc-950 border-secondary/50 sticky top-8 shadow-[0_0_30px_rgba(255,215,0,0.1)]">
                        <CardHeader>
                            <CardTitle className="text-white">Book Your Spot</CardTitle>
                            <CardDescription>Limited beds available. First come, first serve.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="text-center py-4 border-b border-zinc-800">
                                <div className="text-sm text-gray-400 mb-1">Fixed Price Package</div>
                                <div className="text-4xl font-bold text-secondary">₹1,500</div>
                                <div className="text-xs text-gray-500">Per Person (Incl. Taxes)</div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-300">Select Gender <span className="text-red-500">*</span></label>
                                <Select onValueChange={setGender}>
                                    <SelectTrigger className="bg-zinc-900 border-zinc-700">
                                        <SelectValue placeholder="Select Gender" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="Male">Male</SelectItem>
                                        <SelectItem value="Female">Female</SelectItem>
                                        <SelectItem value="Other">Other</SelectItem>
                                    </SelectContent>
                                </Select>
                                <p className="text-xs text-gray-500">Required for room allocation.</p>
                            </div>

                            <Button
                                className={`w-full h-12 text-lg font-bold ${!isBookingOpen ? 'bg-gray-700 text-gray-400 cursor-not-allowed' : 'bg-secondary text-black hover:bg-yellow-500'}`}
                                onClick={handleBook}
                                disabled={loading || !isBookingOpen}
                            >
                                {loading ? "Processing..." : (!isBookingOpen ? "BOOKING CLOSED" : (user ? "PAY & BOOK NOW" : "LOGIN TO BOOK"))}
                            </Button>

                            <p className="text-xs text-center text-gray-500">
                                By booking, you agree to the hostel rules and regulations.
                            </p>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
