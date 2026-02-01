"use client";

import { motion, useScroll, useTransform } from "framer-motion";
import { ArrowRight, Calendar, MapPin, Ticket } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useRef } from "react";

export function HeroModern() {
    const containerRef = useRef<HTMLDivElement>(null);
    const { scrollYProgress } = useScroll({
        target: containerRef,
        offset: ["start start", "end start"]
    });

    const yLeft = useTransform(scrollYProgress, [0, 1], ["0%", "50%"]);
    const yRight = useTransform(scrollYProgress, [0, 1], ["0%", "20%"]);
    const opacity = useTransform(scrollYProgress, [0, 0.5], [1, 0]);

    return (
        <div ref={containerRef} className="relative h-screen w-full flex flex-col md:flex-row overflow-hidden bg-[#0A0A0A]">

            {/* Left Split - Visual Impact */}
            <motion.div
                style={{ y: yLeft }}
                className="w-full md:w-[60%] h-[50vh] md:h-full relative overflow-hidden group"
            >
                {/* Background Video/Image Placeholder */}
                <div className="absolute inset-0 bg-gradient-to-br from-[#1A1A1A] to-[#0A0A0A] z-0">
                    <div className="absolute inset-0 opacity-20 bg-[url('https://images.unsplash.com/photo-1518770660439-4636190af475?q=80&w=2070&auto=format&fit=crop')] bg-cover bg-center mix-blend-overlay" />
                </div>

                {/* Overlay Gradient Mesh */}
                <div className="absolute inset-0 bg-gradient-mesh opacity-40 mix-blend-screen animate-pulse-slow" />

                {/* Main 3D Logo / Floating Element */}
                <div className="absolute inset-0 flex items-center justify-center p-8 z-10">
                    <div className="relative w-64 h-64 md:w-96 md:h-96">
                        {/* Orbiting Rings */}
                        <div className="absolute inset-0 border-2 border-[#FF6B35]/30 rounded-full animate-[spin_10s_linear_infinite]" />
                        <div className="absolute inset-4 border border-[#FF6B35]/20 rounded-full animate-[spin_15s_linear_infinite_reverse]" />
                        <div className="absolute inset-12 border border-[#FFFFFF]/10 rounded-full animate-[ping_3s_ease-in-out_infinite]" />

                        {/* Central Sphere */}
                        <div className="absolute inset-0 m-auto w-32 h-32 bg-gradient-to-br from-[#FF6B35] to-[#FFA500] rounded-full blur-[50px] opacity-40" />
                        <motion.div
                            initial={{ scale: 0.8, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            transition={{ duration: 1, delay: 0.5 }}
                            className="absolute inset-0 m-auto w-40 h-40 md:w-56 md:h-56 bg-black rounded-full border border-[#FF6B35]/50 flex items-center justify-center shadow-[0_0_50px_-10px_rgba(255,107,53,0.5)] backdrop-blur-xl"
                        >
                            <span className="text-4xl md:text-6xl font-orbitron font-bold text-transparent bg-clip-text bg-gradient-to-r from-white to-gray-400">
                                2026
                            </span>
                        </motion.div>
                    </div>
                </div>

                {/* Particle Overlay */}
                <div className="absolute inset-0 z-20 pointer-events-none">
                    {/* Can insert simple JS particle canvas here if needed, or CSS dots */}
                </div>
            </motion.div>

            {/* Diagonal Divider */}
            <div className="hidden md:block absolute top-0 bottom-0 left-[60%] w-[1px] bg-gradient-to-b from-transparent via-[#FF6B35] to-transparent z-30" />

            {/* Right Split - Content */}
            <motion.div
                style={{ y: yRight }}
                className="w-full md:w-[40%] h-[50vh] md:h-full relative bg-[#0A0A0A]/90 backdrop-blur-sm flex flex-col justify-center px-8 md:px-12 z-20 border-l border-white/5"
            >
                <motion.div
                    initial={{ opacity: 0, x: 50 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.8, delay: 0.8 }}
                    className="space-y-6"
                >
                    <div className="flex items-center gap-2 mb-4">
                        <span className="h-[1px] w-12 bg-[#FF6B35]" />
                        <span className="text-[#FF6B35] font-mono text-sm tracking-widest uppercase">
                            The Future is Here
                        </span>
                    </div>

                    <h1 className="text-5xl md:text-7xl font-orbitron font-black text-white leading-[0.9]">
                        REVA<br />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#FF6B35] to-[#FFA500]">
                            TECHFEST
                        </span>
                    </h1>

                    <p className="text-gray-400 text-lg md:text-xl max-w-md leading-relaxed">
                        Experience the convergence of technology, culture, and innovation.
                        Join 10,000+ visionaries for the ultimate celebration.
                    </p>

                    <div className="grid grid-cols-2 gap-4 py-6 border-t border-white/10 mt-6">
                        <div className="flex flex-col">
                            <span className="text-3xl font-bold text-white">25+</span>
                            <span className="text-sm text-gray-500 uppercase tracking-wider">Events</span>
                        </div>
                        <div className="flex flex-col">
                            <span className="text-3xl font-bold text-white">₹5L+</span>
                            <span className="text-sm text-gray-500 uppercase tracking-wider">Prize Pool</span>
                        </div>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-4 pt-4">
                        <Link href="/register" className="flex-1">
                            <Button size="lg" className="w-full bg-[#FF6B35] hover:bg-[#FF8C42] text-black font-bold h-14 text-lg">
                                Register Now <ArrowRight className="ml-2 w-5 h-5" />
                            </Button>
                        </Link>
                        <Link href="/events" className="flex-1">
                            <Button size="lg" variant="outline" className="w-full border-white/20 hover:bg-white/5 text-white h-14">
                                Explore Events
                            </Button>
                        </Link>
                    </div>
                </motion.div>
            </motion.div>

            {/* Scroll Indicator */}
            <motion.div
                style={{ opacity }}
                className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 z-40"
            >
                <div className="w-[1px] h-16 bg-gradient-to-b from-[#FF6B35] to-transparent" />
                <span className="text-[10px] uppercase tracking-[0.2em] text-gray-500 animate-pulse">Scroll</span>
            </motion.div>
        </div>
    );
}
