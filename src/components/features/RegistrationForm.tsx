"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { motion } from "framer-motion";
import { useState } from "react";
import { CheckCircle } from "lucide-react";

// Simplified Schema
const formSchema = z.object({
    role: z.string().min(1, "Please select an identity"),
    phone: z.string().min(10, "Phone number must be at least 10 digits"),
    name: z.string().min(2, "Name must be at least 2 characters"),
    gender: z.enum(["Male", "Female", "Other"]),
});

export function RegistrationForm() {
    const [isSubmitted, setIsSubmitted] = useState(false);

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            role: "",
            // @ts-ignore
            gender: undefined,
        },
    });

    const onSubmit = (values: z.infer<typeof formSchema>) => {
        // Simulate API call
        setTimeout(() => {
            console.log("Registered:", values);
            setIsSubmitted(true);
        }, 1000);
    };

    if (isSubmitted) {
        return (
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="max-w-md mx-auto"
            >
                <Card className="bg-black/80 border-secondary/50 shadow-[0_0_50px_rgba(0,212,255,0.2)]">
                    <CardHeader className="text-center">
                        <div className="mx-auto w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mb-4">
                            <CheckCircle size={32} className="text-green-500" />
                        </div>
                        <CardTitle className="text-2xl text-secondary">Registration Complete!</CardTitle>
                        <CardDescription>Thank you for letting us know you better.</CardDescription>
                    </CardHeader>
                    <CardContent className="text-center">
                        <p className="text-gray-300">Your profile has been updated successfully.</p>
                    </CardContent>
                    <CardFooter>
                        <Button className="w-full" onClick={() => window.location.href = '/dashboard'}>Go to Dashboard</Button>
                    </CardFooter>
                </Card>
            </motion.div>
        );
    }

    return (
        <Card className="border-white/10 bg-black/60 backdrop-blur-md">
            <CardHeader>
                <CardTitle className="text-2xl text-white uppercase font-orbitron tracking-wider">Fill the Registration Form</CardTitle>
                <CardDescription>To help us know you better</CardDescription>
            </CardHeader>
            <CardContent>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">

                    {/* Identity Select */}
                    <div className="space-y-2">
                        <Label>I am a...</Label>
                        <select
                            {...form.register("role")}
                            className="flex h-11 w-full rounded-md border border-white/20 bg-white/5 px-3 py-2 text-sm text-white focus:bg-white/10 outline-none focus:ring-2 focus:ring-secondary"
                        >
                            <option value="" className="bg-black text-gray-400">Select Identity</option>
                            <option value="Student" className="bg-black">Student</option>
                            <option value="Faculty" className="bg-black">Faculty</option>
                            <option value="Alumni" className="bg-black">Alumni</option>
                            <option value="Guest" className="bg-black">Guest</option>
                        </select>
                        {form.formState.errors.role && (
                            <p className="text-red-400 text-xs">{form.formState.errors.role.message}</p>
                        )}
                    </div>

                    <div className="space-y-2">
                        <Label>Phone Number</Label>
                        <Input {...form.register("phone")} placeholder="+91 XXXXX XXXXX" />
                        {form.formState.errors.phone && (
                            <p className="text-red-400 text-xs">{form.formState.errors.phone.message}</p>
                        )}
                    </div>

                    <div className="space-y-2">
                        <Label>Name</Label>
                        <Input {...form.register("name")} placeholder="Your Full Name" />
                        {form.formState.errors.name && (
                            <p className="text-red-400 text-xs">{form.formState.errors.name.message}</p>
                        )}
                    </div>

                    <div className="space-y-2">
                        <Label>Gender</Label>
                        <div className="flex gap-4">
                            {["Male", "Female", "Other"].map((g) => (
                                <label key={g} className={`flex-1 cursor-pointer border rounded-lg p-3 text-center transition-all ${form.watch("gender") === g ? "border-secondary bg-secondary/20 text-white" : "border-white/10 bg-white/5 text-gray-400 hover:border-white/30"}`}>
                                    <input
                                        type="radio"
                                        value={g}
                                        {...form.register("gender")}
                                        className="hidden"
                                    />
                                    {g}
                                </label>
                            ))}
                        </div>
                        {form.formState.errors.gender && (
                            <p className="text-red-400 text-xs">{form.formState.errors.gender.message}</p>
                        )}
                    </div>

                    <Button type="submit" className="w-full" size="lg" glow disabled={form.formState.isSubmitting}>
                        {form.formState.isSubmitting ? "Submitting..." : "Submit Profile"}
                    </Button>
                </form>
            </CardContent>
        </Card>
    );
}
