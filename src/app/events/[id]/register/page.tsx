"use client";

import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { EVENTS_DATA } from "@/lib/mock-data";
import { ArrowLeft, CheckCircle, Plus, Trash2, CreditCard, UserCheck, Loader2, Sparkles, AlertCircle, ExternalLink } from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import Link from "next/link";
import { motion } from "framer-motion";

export default function EventBookingPage() {
    const params = useParams();
    const router = useRouter();
    const event = EVENTS_DATA.find(e => e.id === params.id);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const [user, setUser] = useState<any>(null);

    useEffect(() => {
        const checkAuth = async () => {
            try {
                const res = await fetch('/api/auth/me');
                const data = await res.json();
                if (!res.ok || !data.user) {
                    router.push('/login?redirect=/events/' + params.id + '/register');
                } else {
                    setUser(data.user);
                }
            } catch (e) {
                router.push('/login');
            }
        };
        checkAuth();
    }, [router, params.id]);



    // Mock Database
    const MOCK_PARTICIPANTS: Record<string, { name: string, email: string, hasPass: boolean }> = {
        "REVA001": { name: "Rahul S.", email: "rahul@reva.edu", hasPass: true },
        "REVA002": { name: "Priya M.", email: "priya@reva.edu", hasPass: false },
        "REVA003": { name: "Amit K.", email: "amit@reva.edu", hasPass: true },
        "REVA004": { name: "Sneha R.", email: "sneha@reva.edu", hasPass: false },
    };

    // State
    const [teamName, setTeamName] = useState("");
    const [members, setMembers] = useState([{ id: "", name: "", email: "", role: "Leader", verified: false, checking: false, hasPass: false, error: "" }]);
    const [step, setStep] = useState(1); // 1: Details, 2: Payment, 3: Success
    const [paymentMode, setPaymentMode] = useState<"standard" | "pass">("standard");
    const [showUpsell, setShowUpsell] = useState(false);

    const maxMembers = event ? parseInt(event.teamSize?.split('-')[1] || event.teamSize || "4") : 4;

    const addMember = () => {
        if (members.length < maxMembers) {
            setMembers([...members, { id: "", name: "", email: "", role: "Member", verified: false, checking: false, hasPass: false, error: "" }]);
        }
    };

    const removeMember = (index: number) => {
        if (members.length > 1) {
            const newMembers = [...members];
            newMembers.splice(index, 1);
            setMembers(newMembers);
        }
    };

    const verifyMember = (index: number) => {
        const memberId = members[index].id ? members[index].id.toUpperCase() : "";
        if (!memberId) return;

        const newMembers = [...members];
        newMembers[index].checking = true;
        newMembers[index].error = "";
        setMembers(newMembers);

        // Call API
        fetch('/api/events/verify-member', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ revaId: memberId })
        })
            .then(res => res.json())
            .then(data => {
                const updatedMembers = [...members];
                updatedMembers[index].checking = false;

                if (data.success && data.user) {
                    updatedMembers[index].verified = true;
                    updatedMembers[index].name = data.user.name;
                    updatedMembers[index].email = data.user.email;
                    updatedMembers[index].hasPass = data.user.hasPass;
                    updatedMembers[index].error = "";
                } else {
                    updatedMembers[index].verified = false;
                    updatedMembers[index].error = data.error || "User not found";
                }
                setMembers(updatedMembers);
            })
            .catch(err => {
                const updatedMembers = [...members];
                updatedMembers[index].checking = false;
                updatedMembers[index].error = "Verification failed";
                setMembers(updatedMembers);
            });
    };

    if (!user) return <div className="min-h-screen bg-black text-white flex items-center justify-center"><Loader2 className="animate-spin" /> Checking access...</div>;

    if (!event) return null;

    const passHoldersCount = members.filter(m => m.verified && m.hasPass).length;
    const totalMembers = members.length;
    const nonPassHolders = members.filter(m => !m.hasPass); // Includes unverified as potential payers
    const standardTotal = event.price || 0;

    // Split Logic REMOVED.
    // New Rule: If anyone lacks a pass, the team pays the FULL standard amount.
    // "No concession" per user request.
    const isFree = members.every(m => m.verified && m.hasPass);
    const payableAmount = isFree ? 0 : standardTotal;

    return (
        <main className="min-h-screen bg-black text-white flex flex-col">
            <Navbar />

            <div className="flex-1 container mx-auto px-4 py-24 max-w-4xl">
                <Link href={`/events/${event.id}`} className="text-gray-400 hover:text-white flex items-center mb-8">
                    <ArrowLeft size={16} className="mr-2" /> Back to Event
                </Link>

                {/* Promo Banner */}
                <div className="bg-gradient-to-r from-purple-900 to-indigo-900 rounded-xl p-4 mb-8 flex items-center justify-between border border-purple-500/30 shadow-[0_0_20px_rgba(168,85,247,0.2)]">
                    <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center">
                            <Sparkles className="text-yellow-400" size={20} />
                        </div>
                        <div>
                            <h3 className="font-bold text-white text-lg">Pro Pass Benefits</h3>
                            <p className="text-gray-300 text-sm">Entry is free ONLY if ALL team members have a Pro Pass.</p>
                        </div>
                    </div>
                    <Link href="/passes">
                        <Button variant="secondary" size="sm" className="gap-2">
                            Buy Pass <ExternalLink size={14} />
                        </Button>
                    </Link>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {/* Left: Event Summary */}
                    <div className="md:col-span-1">
                        <div className="bg-white/5 border border-white/10 rounded-xl p-6 sticky top-24">
                            <h2 className="text-xl font-bold font-orbitron mb-2">{event.title}</h2>
                            <p className="text-secondary text-sm font-bold mb-4">{event.category}</p>

                            <div className="space-y-4 text-sm text-gray-400">
                                <div className="flex justify-between">
                                    <span>Date</span>
                                    <span className="text-white">{event.date}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span>Team Size</span>
                                    <span className="text-white">{event.teamSize}</span>
                                </div>
                                <div className="border-t border-white/10 pt-4 flex justify-between items-center">
                                    <span>Event Fee</span>
                                    <span className="text-xl font-bold text-white">₹{event.price}</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Right: Steps */}
                    <div className="md:col-span-2">
                        {step === 1 && (
                            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
                                <h1 className="text-3xl font-bold font-orbitron mb-6">Team Registration</h1>

                                <div className="space-y-6">
                                    {/* Team Name Input */}
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-gray-300">Team Name</label>
                                        <Input
                                            placeholder="e.g. Code Warriors"
                                            value={teamName}
                                            onChange={(e) => setTeamName(e.target.value)}
                                            className="bg-white/5 border-white/10 text-white"
                                        />
                                    </div>

                                    {/* Members List */}
                                    <div className="space-y-4">
                                        <div className="flex justify-between items-center">
                                            <label className="text-sm font-medium text-gray-300">Team Members ({members.length}/{maxMembers})</label>
                                            {members.length < maxMembers && (
                                                <Button variant="ghost" size="sm" onClick={addMember} className="text-secondary hover:text-secondary/80">
                                                    <Plus size={16} className="mr-1" /> Add Member
                                                </Button>
                                            )}
                                        </div>

                                        {members.map((member, index) => (
                                            <Card key={index} className="bg-white/5 border-white/10 p-4 relative overflow-hidden">
                                                {/* Verification Badge */}
                                                {member.verified && (
                                                    <div className={`absolute top-0 right-0 px-3 py-1 rounded-bl-lg text-xs font-bold flex items-center gap-1 ${member.hasPass ? 'bg-purple-500 text-white' : 'bg-green-500/20 text-green-400'}`}>
                                                        {member.hasPass ? <><Sparkles size={12} /> PRO PASS</> : <><CheckCircle size={12} /> VERIFIED</>}
                                                    </div>
                                                )}

                                                <div className="flex gap-4 items-start">
                                                    <div className="w-8 h-8 rounded-full bg-secondary/20 flex items-center justify-center text-secondary font-bold text-xs mt-1">
                                                        {index + 1}
                                                    </div>
                                                    <div className="flex-1 grid grid-cols-1 gap-3">
                                                        <div className="flex gap-2 items-start">
                                                            <div className="flex-1">
                                                                <Input
                                                                    placeholder="Enter Email (e.g. user@example.com)"
                                                                    className={`bg-black/20 border-white/10 text-white ${member.error ? "border-red-500" : ""}`}
                                                                    value={member.id}
                                                                    onChange={(e) => {
                                                                        const newM = [...members];
                                                                        newM[index].id = e.target.value;
                                                                        newM[index].verified = false;
                                                                        newM[index].hasPass = false;
                                                                        newM[index].error = "";
                                                                        setMembers(newM);
                                                                    }}
                                                                />
                                                                {member.error && <p className="text-red-400 text-xs mt-1">{member.error}</p>}
                                                            </div>
                                                            <Button
                                                                size="icon"
                                                                variant="outline"
                                                                onClick={() => verifyMember(index)}
                                                                disabled={member.verified || member.checking || !member.id}
                                                                title="Verify REVA ID"
                                                            >
                                                                {member.checking ? <Loader2 className="animate-spin" size={16} /> : <UserCheck size={16} />}
                                                            </Button>
                                                        </div>
                                                        <div className="grid grid-cols-2 gap-2">
                                                            <Input
                                                                placeholder="Name (Auto-filled)"
                                                                className="bg-black/20 border-white/10 text-gray-400 cursor-not-allowed"
                                                                value={member.name}
                                                                readOnly
                                                            />
                                                            <Input
                                                                placeholder="Email (Auto-filled)"
                                                                className="bg-black/20 border-white/10 text-gray-400 cursor-not-allowed"
                                                                value={member.email}
                                                                readOnly
                                                            />
                                                        </div>
                                                    </div>
                                                    {index > 0 && (
                                                        <Button variant="ghost" size="icon" onClick={() => removeMember(index)} className="text-red-400 hover:bg-red-500/10">
                                                            <Trash2 size={16} />
                                                        </Button>
                                                    )}
                                                </div>
                                            </Card>
                                        ))}
                                    </div>

                                    {/* Warning if not verified */}
                                    {members.some(m => !m.verified) && (
                                        <div className="bg-yellow-500/10 border border-yellow-500/20 p-4 rounded-lg flex items-start gap-3">
                                            <AlertCircle className="text-yellow-400 shrink-0 mt-0.5" size={18} />
                                            <p className="text-sm text-yellow-200">
                                                Please verify all members to calculate Pass eligibility.
                                            </p>
                                        </div>
                                    )}

                                    <Button
                                        className="w-full mt-6 bg-secondary text-black hover:bg-secondary/80"
                                        size="lg"
                                        onClick={() => setStep(2)}
                                        disabled={!teamName || members.some(m => !m.verified)}
                                    >
                                        Proceed to Payment
                                    </Button>
                                </div>
                            </motion.div>
                        )}

                        {step === 2 && (
                            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
                                <h1 className="text-3xl font-bold font-orbitron mb-6">Select Payment Mode</h1>

                                <div className="grid grid-cols-1 gap-4 mb-8">
                                    {/* Option 1: Standard Fee */}
                                    <div
                                        className={`p-6 rounded-xl border-2 cursor-pointer transition-all ${paymentMode === 'standard' ? 'border-white bg-white/10' : 'border-white/10 bg-white/5 hover:border-white/30'}`}
                                        onClick={() => setPaymentMode('standard')}
                                    >
                                        <div className="flex justify-between items-center mb-2">
                                            <h3 className="font-bold text-lg text-white">
                                                Standard Event Entry
                                            </h3>
                                            <div className="w-5 h-5 rounded-full border border-white flex items-center justify-center">
                                                {paymentMode === 'standard' && <div className="w-3 h-3 bg-white rounded-full" />}
                                            </div>
                                        </div>
                                        <p className="text-gray-400 text-sm mb-4">
                                            {passHoldersCount > 0 && passHoldersCount < totalMembers
                                                ? `Wait! ${passHoldersCount} members have passes, but NOT everyone. You must pay the FULL fee.`
                                                : "Pay the registration fee for the entire team."}
                                        </p>
                                        <div className="flex justify-between items-center">
                                            <span className="text-sm text-gray-500">Payable Amount</span>
                                            <span className="text-2xl font-bold text-white">₹{standardTotal}</span>
                                        </div>
                                    </div>

                                    {/* Option 2: Full Pass Redemption (Only if 0 to pay) */}
                                    <div
                                        className={`p-6 rounded-xl border-2 transition-all relative overflow-hidden ${paymentMode === 'pass' ? 'border-purple-500 bg-purple-500/10' : 'border-white/10 bg-white/5'}`}
                                        onClick={() => isFree && setPaymentMode('pass')}
                                        style={{ cursor: isFree ? 'pointer' : 'not-allowed', opacity: isFree ? 1 : 0.6 }}
                                    >
                                        {!isFree && (
                                            <div className="absolute inset-0 bg-black/50 flex items-center justify-center backdrop-blur-[1px] z-10">
                                                <div className="bg-red-500/90 text-white px-4 py-2 rounded-full text-xs font-bold flex items-center gap-2">
                                                    <AlertCircle size={14} /> Eligibility: ALL Members must have Passes
                                                </div>
                                            </div>
                                        )}

                                        <div className="flex justify-between items-center mb-2">
                                            <h3 className="font-bold text-lg text-purple-300 flex items-center gap-2">
                                                <Sparkles size={18} />
                                                Redeem Pro Passes
                                            </h3>
                                            <div className={`w-5 h-5 rounded-full border flex items-center justify-center ${paymentMode === 'pass' ? 'border-purple-500' : 'border-white'}`}>
                                                {paymentMode === 'pass' && <div className="w-3 h-3 bg-purple-500 rounded-full" />}
                                            </div>
                                        </div>
                                        <p className="text-gray-300 text-sm mb-4">
                                            Entry is free if <strong>ALL</strong> team members hold a valid Pro Pass.
                                        </p>
                                        <div className="flex justify-between items-center pt-2 border-t border-white/10">
                                            <span className="text-xs text-gray-400">Team Status: {isFree ? "Eligible" : "Ineligible"}</span>
                                            <span className="text-2xl font-bold text-green-400">FREE</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="bg-black/40 p-4 rounded-lg flex justify-between items-center mb-6 border border-white/10">
                                    <span className="text-gray-400">Total Payable</span>
                                    <span className="text-3xl font-bold text-white">
                                        ₹{paymentMode === 'standard' ? standardTotal : 0}
                                    </span>
                                </div>

                                <div className="flex gap-4">
                                    <Button variant="ghost" onClick={() => setStep(1)}>Back</Button>
                                    <Button
                                        className="flex-1 bg-green-500 hover:bg-green-600 text-white"
                                        size="lg"
                                        onClick={async () => {
                                            if (paymentMode === 'standard' && passHoldersCount < totalMembers && passHoldersCount > 0) {
                                                setShowUpsell(true);
                                                return;
                                            }

                                            // Handle Registration API Call
                                            try {
                                                const res = await fetch(`/api/events/${event.id}/register`, {
                                                    method: 'POST',
                                                    headers: { 'Content-Type': 'application/json' },
                                                    body: JSON.stringify({
                                                        teamName,
                                                        members: members.map(m => ({ email: m.email, role: m.role })),
                                                        paymentMode,
                                                        amountPaid: paymentMode === 'standard' ? standardTotal : 0
                                                    })
                                                });
                                                if (res.ok) {
                                                    setStep(3);
                                                } else {
                                                    alert('Registration Failed: ' + (await res.json()).error);
                                                }
                                            } catch (e) {
                                                alert('Network error during registration');
                                            }
                                        }}
                                    >
                                        {paymentMode === 'standard' ? `Pay ₹${standardTotal} & Register` : "Confirm Free Registration"}
                                    </Button>

                                    {/* Strict Upsell Modal */}
                                    <Dialog open={showUpsell} onOpenChange={setShowUpsell}>
                                        <DialogContent className="bg-gradient-to-br from-purple-900 via-black to-black border-purple-500/50 text-white sm:max-w-md">
                                            <DialogHeader>
                                                <DialogTitle className="text-3xl font-black font-orbitron text-center text-yellow-400">
                                                    BAD DEAL ALERT! ⚠️
                                                </DialogTitle>
                                            </DialogHeader>
                                            <div className="space-y-6 py-4 text-center">
                                                <div className="text-6xl animate-bounce">🤔</div>
                                                <p className="text-lg text-gray-200">
                                                    You have <strong>{passHoldersCount}</strong> pass holders, but you are about to pay the <span className="font-bold text-red-500">FULL PRICE (₹{standardTotal})</span> because some members don't have passes!
                                                </p>
                                                <div className="bg-red-500/10 p-4 rounded-xl border border-red-500/20">
                                                    <p className="text-sm font-bold text-red-300 mb-2">The Rule:</p>
                                                    <p className="text-xs text-gray-300">
                                                        "One for All, All for One." If even one person lacks a pass, the whole team pays full price. No discounts.
                                                    </p>
                                                </div>

                                                <div className="bg-green-500/10 p-4 rounded-xl border border-green-500/20 text-left">
                                                    <p className="text-sm font-bold text-green-300 mb-2">The Smart Move:</p>
                                                    <p className="text-xs text-gray-300 mb-3">
                                                        Buy passes for the remaining {nonPassHolders.length} members. Then the whole team enters <strong>FREE</strong>.
                                                    </p>
                                                    <Link href="/passes" className="w-full">
                                                        <Button className="w-full bg-green-500 text-black hover:bg-green-400 font-bold text-sm">
                                                            Buy Individual Passes Now 🎟️
                                                        </Button>
                                                    </Link>
                                                </div>
                                            </div>
                                            <div className="flex flex-col gap-3">
                                                <Button variant="ghost" className="text-gray-500 hover:text-white text-xs" onClick={() => { setShowUpsell(false); setStep(3); }}>
                                                    I don't care. I'll pay the full ₹{standardTotal}.
                                                </Button>
                                            </div>
                                        </DialogContent>
                                    </Dialog>
                                </div>
                            </motion.div>
                        )}

                        {step === 3 && (
                            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, x: 0, scale: 1 }} className="text-center py-12">
                                <div className="w-24 h-24 bg-green-500/20 text-green-400 rounded-full flex items-center justify-center mx-auto mb-6">
                                    <CheckCircle size={48} />
                                </div>
                                <h2 className="text-3xl font-bold font-orbitron text-white mb-4">Registration Successful!</h2>
                                <p className="text-gray-400 mb-8 max-w-md mx-auto">
                                    Your team <strong>{teamName}</strong> is registered.
                                </p>
                                <div className="bg-white/5 border border-white/10 rounded-lg p-4 max-w-sm mx-auto mb-8 text-left space-y-2">
                                    <div className="flex items-center gap-3 text-sm text-gray-300">
                                        <div className="w-2 h-2 rounded-full bg-green-500" />
                                        <span>Confimation sent to <strong>{members[0].email}</strong></span>
                                    </div>
                                    <div className="flex items-center gap-3 text-sm text-gray-300">
                                        <div className="w-2 h-2 rounded-full bg-blue-500" />
                                        <span>Invites sent to <strong>{members.length - 1}</strong> teammates</span>
                                    </div>
                                    {paymentMode === 'standard' && payableAmount > 0 && (
                                        <div className="flex items-center gap-3 text-sm text-gray-300">
                                            <div className="w-2 h-2 rounded-full bg-yellow-500" />
                                            <span>Invoice of <strong>₹{payableAmount}</strong> generated</span>
                                        </div>
                                    )}
                                </div>
                                <div className="flex justify-center gap-4">
                                    <Link href="/dashboard">
                                        <Button variant="outline">View Dashboard</Button>
                                    </Link>
                                    <Link href="/events">
                                        <Button>Browse More Events</Button>
                                    </Link>
                                </div>
                            </motion.div>
                        )}
                    </div>
                </div>
            </div>

            <Footer />
        </main>
    );
}
