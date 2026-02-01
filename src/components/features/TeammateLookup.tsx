"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, UserCheck, Loader2, UserPlus } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";

export function TeammateLookup() {
    const [query, setQuery] = useState("");
    const [status, setStatus] = useState<"idle" | "loading" | "found" | "error">("idle");
    const [result, setResult] = useState<{ name: string; avatar: string; skills: string[] } | null>(null);

    const handleSearch = () => {
        if (!query) return;
        setStatus("loading");

        // Simulate API call
        setTimeout(() => {
            if (query.length > 3) {
                setResult({
                    name: "Alex Johnson",
                    avatar: "AJ",
                    skills: ["React", "Python", "UI/UX"]
                });
                setStatus("found");
            } else {
                setStatus("error");
            }
        }, 1500);
    };

    return (
        <section className="py-24 bg-black relative overflow-hidden">
            {/* Background Elements */}
            <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-blue-900/20 via-black to-black pointer-events-none" />

            <div className="container mx-auto px-4 relative z-10">
                <div className="max-w-3xl mx-auto text-center mb-12">
                    <h2 className="text-4xl md:text-5xl font-black font-orbitron text-white mb-6">
                        BUILD YOUR <span className="text-blue-500">SQUAD</span>
                    </h2>
                    <p className="text-gray-400 text-lg">
                        Looking for a teammate? Enter their Public ID to verify their profile and invite them to your team.
                    </p>
                </div>

                <div className="max-w-xl mx-auto">
                    <div className="relative flex items-center mb-12">
                        <Input
                            placeholder="Enter Public ID (e.g. VIS-2026-X9Y)"
                            className="bg-white/5 border-white/20 text-white h-14 pl-6 pr-32 rounded-full text-lg focus:border-blue-500 transition-colors"
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                        />
                        <Button
                            className="absolute right-2 top-2 bottom-2 rounded-full px-6 bg-blue-600 hover:bg-blue-500 text-white"
                            onClick={handleSearch}
                            disabled={status === "loading"}
                        >
                            {status === "loading" ? <Loader2 className="animate-spin" /> : <Search />}
                        </Button>
                    </div>

                    <AnimatePresence mode="wait">
                        {status === "found" && result && (
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.95 }}
                            >
                                <Card className="bg-white/10 border-blue-500/30 overflow-hidden backdrop-blur-md">
                                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 to-purple-500" />
                                    <CardContent className="p-6 flex items-center gap-6">
                                        <div className="w-20 h-20 rounded-full bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center text-2xl font-bold text-white shadow-lg shadow-blue-500/20">
                                            {result.avatar}
                                        </div>
                                        <div className="flex-1 text-left">
                                            <h3 className="text-xl font-bold text-white flex items-center gap-2">
                                                {result.name}
                                                <UserCheck size={18} className="text-green-400" />
                                            </h3>
                                            <div className="flex flex-wrap gap-2 mt-2">
                                                {result.skills.map(skill => (
                                                    <span key={skill} className="bg-black/40 text-blue-300 text-xs px-2 py-1 rounded border border-blue-500/20">
                                                        {skill}
                                                    </span>
                                                ))}
                                            </div>
                                        </div>
                                        <Button variant="outline" className="border-blue-500 text-blue-400 hover:bg-blue-500 hover:text-white">
                                            <UserPlus size={18} className="mr-2" /> Invite
                                        </Button>
                                    </CardContent>
                                </Card>
                            </motion.div>
                        )}
                        {status === "error" && (
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0 }}
                                className="text-center text-red-400 bg-red-500/10 border border-red-500/20 p-4 rounded-xl"
                            >
                                User not found. Please check the ID and try again.
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>
        </section>
    );
}
