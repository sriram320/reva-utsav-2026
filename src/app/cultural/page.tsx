"use client";

import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { motion } from "framer-motion";
import { Sparkles } from "lucide-react";

export default function CulturalPage() {
    return (
        <main className="min-h-screen bg-black text-white relative overflow-hidden flex flex-col">
            <Navbar />

            <div className="flex-1 flex flex-col items-center justify-center relative">
                {/* Background Effects */}
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-purple-900/20 via-black to-black" />

                <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.8, ease: "easeOut" }}
                    className="z-10 text-center px-4"
                >
                    <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                        className="w-24 h-24 mx-auto mb-8 text-purple-500 opacity-80"
                    >
                        <Sparkles size={96} />
                    </motion.div>

                    <h1 className="text-5xl md:text-8xl font-black font-orbitron mb-6 bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-pink-600">
                        COMING SOON
                    </h1>

                    <p className="text-xl md:text-2xl text-gray-400 max-w-2xl mx-auto font-light leading-relaxed">
                        The stars are aligning for the biggest Cultural Extravaganza of 2026.
                        <br />
                        <span className="text-purple-400 font-bold mt-4 block">Lineup Reveal Loading...</span>
                    </p>

                    <div className="mt-12 flex justify-center gap-2">
                        {[0, 1, 2].map((i) => (
                            <motion.div
                                key={i}
                                animate={{ scale: [1, 1.5, 1], opacity: [0.5, 1, 0.5] }}
                                transition={{ duration: 1.5, repeat: Infinity, delay: i * 0.2 }}
                                className="w-3 h-3 bg-white rounded-full"
                            />
                        ))}
                    </div>
                </motion.div>
            </div>

            <Footer />
        </main>
    );
}
