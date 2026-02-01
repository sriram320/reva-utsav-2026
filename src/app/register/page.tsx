"use client";

import { useState } from "react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronRight, Check, Loader2, Chrome } from "lucide-react";
import { useRouter } from "next/navigation";

export default function RegisterPage() {
    const router = useRouter();
    const [step, setStep] = useState(1);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    // OTP State
    const [otp, setOtp] = useState("");
    const [otpSent, setOtpSent] = useState(false);
    const [otpLoading, setOtpLoading] = useState(false);
    const [isEmailVerified, setIsEmailVerified] = useState(false);

    const [formData, setFormData] = useState({
        identity: "",
        phone: "",
        name: "",
        gender: "",
        email: "",
        password: "",
        confirmPassword: "",
        // REVA-specific fields
        srn: "",
        revaEmail: "",
        department: ""
    });

    const updateField = (field: string, value: string) => {
        setFormData(prev => ({ ...prev, [field]: value }));
        setError(""); // Clear error on change
    };

    const handleSendOtp = async () => {
        setOtpLoading(true);
        try {
            const res = await fetch('/api/auth/otp/send', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: formData.revaEmail })
            });
            const data = await res.json();
            if (res.ok) {
                setOtpSent(true);
                setError("");
                alert(`OTP Sent to ${formData.revaEmail}. NOTE: For demo, check server console for code.`);
            } else {
                setError(data.error);
            }
        } catch (e) {
            setError("Failed to send OTP");
        }
        setOtpLoading(false);
    };

    const handleVerifyOtp = async () => {
        setOtpLoading(true);
        try {
            const res = await fetch('/api/auth/otp/verify', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: formData.revaEmail, otp })
            });
            const data = await res.json();
            if (res.ok) {
                setIsEmailVerified(true);
                setError("");
                setOtpSent(false); // Hide otp box
            } else {
                setError(data.error);
            }
        } catch (e) {
            setError("Verification failed");
        }
        setOtpLoading(false);
    };

    const validateStep1 = () => {
        if (!formData.identity) return "Please select an identity.";
        if (!formData.phone || formData.phone.length < 10) return "Please enter a valid phone number (at least 10 digits).";
        if (!formData.name || formData.name.length < 2) return "Name must be at least 2 characters.";
        if (!formData.gender) return "Please select your gender.";

        // REVA Student specific validation
        if (formData.identity === "REVA Student") {
            if (!formData.srn || formData.srn.length < 5) return "Please enter a valid SRN.";
            if (!formData.revaEmail || !formData.revaEmail.includes("@reva.edu.in")) return "Please enter a valid REVA email (@reva.edu.in).";
            if (!formData.department) return "Please select your department/school.";
        }

        return null;
    };

    const validateStep2 = () => {
        if (!formData.email || !formData.email.includes("@")) return "Please enter a valid email.";
        if (!formData.password || formData.password.length < 6) return "Password must be at least 6 characters.";
        if (formData.password !== formData.confirmPassword) return "Passwords do not match.";
        return null;
    };

    const handleNext = () => {
        const err = validateStep1();
        if (err) {
            setError(err);
            return;
        }
        // Auto-fill email for REVA Students to match verified email
        if (formData.identity === "REVA Student" && formData.revaEmail) {
            setFormData(prev => ({ ...prev, email: formData.revaEmail }));
        }
        setStep(2);
    };

    const handleSubmit = async () => {
        const err = validateStep2();
        if (err) {
            setError(err);
            return;
        }

        setLoading(true);
        setError("");
        try {
            const res = await fetch("/api/auth/register", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    name: formData.name,
                    email: formData.email,
                    password: formData.password,
                    college: formData.identity, // Using identity field as college
                    phone: formData.phone,
                    gender: formData.gender,
                    // REVA-specific fields
                    srn: formData.identity === "REVA Student" ? formData.srn : undefined,
                    department: formData.identity === "REVA Student" ? formData.department : undefined
                })
            });

            const data = await res.json();

            if (!res.ok) {
                setError(data.error || "Registration failed");
            } else {
                // Redirect to dashboard on success
                router.push("/dashboard");
            }
        } catch (e) {
            setError("Something went wrong. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    const handleGoogleSignIn = async () => {
        // Firebase Google Sign-In will be implemented here
        // For now, show a placeholder message
        setError("Google Sign-In will be available once Firebase is configured");
    };

    return (
        <main className="min-h-screen bg-black text-white relative overflow-hidden flex flex-col">
            <Navbar />

            {/* Background Ambience */}
            <div className="absolute inset-0 pointer-events-none">
                <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-secondary/10 rounded-full blur-[100px]" />
                <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-[#FFD700]/10 rounded-full blur-[100px]" />
            </div>

            <div className="flex-1 flex items-center justify-center p-4 pt-24 pb-12 relative z-10">
                <div className="w-full max-w-lg">
                    <Card className="bg-[#0a0a0a] border-white/10 shadow-2xl overflow-hidden relative">
                        {/* Progress Bar */}
                        <div className="absolute top-0 left-0 h-1 bg-white/10 w-full">
                            <motion.div
                                className="h-full bg-[#FFD700]"
                                initial={{ width: "0%" }}
                                animate={{ width: step === 1 ? "50%" : "100%" }}
                            />
                        </div>

                        <CardHeader className="text-center pt-8">
                            <CardTitle className="text-2xl font-orbitron font-bold text-white mb-2">
                                {step === 1 ? "Fill the Registration Form" : "Set Your Credentials"}
                            </CardTitle>
                            <CardDescription>
                                {step === 1 ? "To help us know you better" : "Secure your account access"}
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="p-6 md:p-8">
                            <AnimatePresence mode="wait">
                                {step === 1 && (
                                    <motion.div
                                        key="step1"
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        exit={{ opacity: 0, x: 20 }}
                                        className="space-y-6"
                                    >
                                        <div className="space-y-2">
                                            <Label>I am a...</Label>
                                            <Select onValueChange={(val) => updateField('identity', val)} value={formData.identity}>
                                                <SelectTrigger className="bg-white/5 border-white/10 text-white">
                                                    <SelectValue placeholder="Select Identity" />
                                                </SelectTrigger>
                                                <SelectContent className="bg-[#1a1a1a] border-white/10 text-white">
                                                    <SelectItem value="REVA Student">REVA Student</SelectItem>
                                                    <SelectItem value="Other College Student">Other College Student</SelectItem>
                                                    <SelectItem value="Faculty">Faculty</SelectItem>
                                                    <SelectItem value="Guest">Guest</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>

                                        <div className="space-y-2">
                                            <Label>Phone Number</Label>
                                            <Input
                                                placeholder="+91 XXXXX XXXXX"
                                                className="bg-white/5 border-white/10"
                                                value={formData.phone}
                                                onChange={(e) => updateField('phone', e.target.value)}
                                            />
                                            <p className="text-xs text-gray-500">Phone number must be at least 10 digits</p>
                                        </div>

                                        <div className="space-y-2">
                                            <Label>Name</Label>
                                            <Input
                                                placeholder="Your Full Name"
                                                className="bg-white/5 border-white/10"
                                                value={formData.name}
                                                onChange={(e) => updateField('name', e.target.value)}
                                            />
                                        </div>

                                        <div className="space-y-2">
                                            <Label className="text-white">Gender</Label>
                                            <RadioGroup
                                                value={formData.gender}
                                                onValueChange={(val) => updateField('gender', val)}
                                                className="flex gap-4"
                                            >
                                                <div className="flex items-center space-x-2">
                                                    <RadioGroupItem value="Male" id="male" className="border-white/50 text-[#FFD700]" />
                                                    <Label htmlFor="male" className="cursor-pointer text-white">Male</Label>
                                                </div>
                                                <div className="flex items-center space-x-2">
                                                    <RadioGroupItem value="Female" id="female" className="border-white/50 text-[#FFD700]" />
                                                    <Label htmlFor="female" className="cursor-pointer text-white">Female</Label>
                                                </div>
                                                <div className="flex items-center space-x-2">
                                                    <RadioGroupItem value="Other" id="other" className="border-white/50 text-[#FFD700]" />
                                                    <Label htmlFor="other" className="cursor-pointer text-white">Other</Label>
                                                </div>
                                            </RadioGroup>
                                        </div>

                                        {/* REVA Student Specific Fields */}
                                        {formData.identity === "REVA Student" && (
                                            <>
                                                <div className="space-y-2">
                                                    <Label>REVA SRN Number</Label>
                                                    <Input
                                                        placeholder="e.g., R20XXXXX"
                                                        className="bg-white/5 border-white/10"
                                                        value={formData.srn}
                                                        onChange={(e) => updateField('srn', e.target.value)}
                                                    />
                                                    <p className="text-xs text-gray-500">Your Student Registration Number</p>
                                                </div>

                                                <div className="space-y-4">
                                                    <Label>REVA Email ID</Label>
                                                    <div className="flex gap-2">
                                                        <Input
                                                            type="email"
                                                            placeholder="yourname@reva.edu.in"
                                                            className={`bg-white/5 border-white/10 ${isEmailVerified ? 'border-green-500 text-green-400' : ''}`}
                                                            value={formData.revaEmail}
                                                            onChange={(e) => {
                                                                updateField('revaEmail', e.target.value);
                                                                setIsEmailVerified(false);
                                                                setOtpSent(false);
                                                            }}
                                                            disabled={isEmailVerified}
                                                        />
                                                        {!isEmailVerified && (
                                                            <Button
                                                                type="button"
                                                                onClick={handleSendOtp}
                                                                disabled={otpLoading || !formData.revaEmail.endsWith('@reva.edu.in')}
                                                                variant="secondary"
                                                            >
                                                                {otpLoading ? <Loader2 className="animate-spin" /> : (otpSent ? "Resend" : "Verify")}
                                                            </Button>
                                                        )}
                                                        {isEmailVerified && <Button variant="ghost" className="text-green-500" disabled><Check /></Button>}
                                                    </div>

                                                    {otpSent && !isEmailVerified && (
                                                        <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} className="flex gap-2">
                                                            <Input
                                                                placeholder="Enter verify code"
                                                                value={otp}
                                                                onChange={(e) => setOtp(e.target.value)}
                                                                className="bg-white/5 border-white/10"
                                                                maxLength={6}
                                                            />
                                                            <Button type="button" onClick={handleVerifyOtp} disabled={otpLoading}>
                                                                {otpLoading ? <Loader2 className="animate-spin" /> : "Confirm"}
                                                            </Button>
                                                        </motion.div>
                                                    )}
                                                    <p className="text-xs text-gray-500">Must end with @reva.edu.in</p>
                                                </div>

                                                <div className="space-y-2">
                                                    <Label>School/Department/Branch</Label>
                                                    <Select onValueChange={(val) => updateField('department', val)} value={formData.department}>
                                                        <SelectTrigger className="bg-white/5 border-white/10 text-white">
                                                            <SelectValue placeholder="Select Department" />
                                                        </SelectTrigger>
                                                        <SelectContent className="bg-[#1a1a1a] border-white/10 text-white">
                                                            <SelectItem value="School of CSE">School of CSE</SelectItem>
                                                            <SelectItem value="School of ECE">School of ECE</SelectItem>
                                                            <SelectItem value="School of Civil Engineering">School of Civil Engineering</SelectItem>
                                                            <SelectItem value="School of Mechanical Engineering">School of Mechanical Engineering</SelectItem>
                                                            <SelectItem value="School of Architecture">School of Architecture</SelectItem>
                                                            <SelectItem value="School of Commerce">School of Commerce</SelectItem>
                                                            <SelectItem value="School of Management">School of Management</SelectItem>
                                                            <SelectItem value="School of Legal Studies">School of Legal Studies</SelectItem>
                                                            <SelectItem value="School of Applied Sciences">School of Applied Sciences</SelectItem>
                                                            <SelectItem value="Other">Other</SelectItem>
                                                        </SelectContent>
                                                    </Select>
                                                </div>
                                            </>
                                        )}

                                        <Button
                                            className="w-full bg-white text-black hover:bg-gray-200 mt-4"
                                            size="lg"
                                            onClick={handleNext}
                                            disabled={formData.identity === "REVA Student" && !isEmailVerified}
                                        >
                                            {formData.identity === "REVA Student" && !isEmailVerified ? "Verify Email to Continue" : <>Submit Profile <ChevronRight size={16} className="ml-2" /></>}
                                        </Button>
                                    </motion.div>
                                )}

                                {step === 2 && (
                                    <motion.div
                                        key="step2"
                                        initial={{ opacity: 0, x: 20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        exit={{ opacity: 0, x: -20 }}
                                        className="space-y-6"
                                    >
                                        <div className="space-y-2">
                                            <Label>Email Address</Label>
                                            <Input
                                                type="email"
                                                placeholder="you@example.com"
                                                className="bg-white/5 border-white/10"
                                                value={formData.email}
                                                onChange={(e) => updateField('email', e.target.value)}
                                            />
                                        </div>

                                        <div className="space-y-2">
                                            <Label>Password</Label>
                                            <Input
                                                type="password"
                                                placeholder="Create a strong password"
                                                className="bg-white/5 border-white/10"
                                                value={formData.password}
                                                onChange={(e) => updateField('password', e.target.value)}
                                            />
                                        </div>

                                        <div className="space-y-2">
                                            <Label>Confirm Password</Label>
                                            <Input
                                                type="password"
                                                placeholder="Repeat password"
                                                className="bg-white/5 border-white/10"
                                                value={formData.confirmPassword}
                                                onChange={(e) => updateField('confirmPassword', e.target.value)}
                                            />
                                        </div>

                                        <div className="pt-4 flex gap-3">
                                            <Button
                                                variant="outline"
                                                className="flex-1"
                                                onClick={() => setStep(1)}
                                                disabled={loading}
                                            >
                                                Back
                                            </Button>
                                            <Button
                                                className="flex-1 bg-[#FFD700] text-black hover:bg-[#FFC107]"
                                                onClick={handleSubmit}
                                                disabled={loading}
                                            >
                                                {loading ? <Loader2 className="animate-spin" size={20} /> : "Complete Registration"}
                                            </Button>
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>

                            {error && (
                                <motion.div
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="text-red-400 text-sm text-center mt-4 bg-red-500/10 p-2 rounded"
                                >
                                    {error}
                                </motion.div>
                            )}

                            {step === 1 && (
                                <>
                                    <div className="relative my-6">
                                        <div className="absolute inset-0 flex items-center">
                                            <span className="w-full border-t border-white/10" />
                                        </div>
                                        <div className="relative flex justify-center text-xs uppercase">
                                            <span className="bg-[#0a0a0a] px-2 text-gray-400">Or register with</span>
                                        </div>
                                    </div>

                                    <Button
                                        type="button"
                                        variant="outline"
                                        className="w-full"
                                        onClick={handleGoogleSignIn}
                                    >
                                        <Chrome className="w-4 h-4 mr-2" />
                                        Sign up with Google
                                    </Button>
                                </>
                            )}
                        </CardContent>
                    </Card>

                    <p className="text-center text-gray-500 text-sm mt-6">
                        Already have an account? <a href="/login" className="text-[#FFD700] hover:underline">Log In</a>
                    </p>
                </div>
            </div>

            <Footer />
        </main>
    );
}
