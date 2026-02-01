"use client";

import { useState, useEffect } from "react";
import { Navbar } from "@/components/layout/Navbar";
import { GravityScene } from "@/components/home/GravityScene";
import { Footer } from "@/components/layout/Footer";
import { OrbAccordion } from "@/components/home/OrbAccordion";
import { SlotMachineText } from "@/components/home/SlotMachineText";
import { TabbedEvents } from "@/components/home/TabbedEvents";
import { TeammateLookup } from "@/components/features/TeammateLookup";
import { PastEvents } from "@/components/home/PastEvents";
import { EventCountdown } from "@/components/home/EventCountdown";
import { EventStats } from "@/components/home/EventStats";
import { Testimonials } from "@/components/home/Testimonials";
import { Button } from "@/components/ui/button";
import { motion, useScroll, useTransform, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { IntroOverlay } from "@/components/home/IntroOverlay";

export default function Home() {
    const { scrollYProgress } = useScroll();
    const x = useTransform(scrollYProgress, [0, 1], ["0%", "-50%"]);

    const [introComplete, setIntroComplete] = useState(false);
    const [showContent, setShowContent] = useState(false);

    useEffect(() => {
        // Prevent scrolling during intro
        if (!introComplete) {
            document.body.style.overflow = "hidden";
        } else {
            document.body.style.overflow = "auto";
            setTimeout(() => setShowContent(true), 100);
        }
    }, [introComplete]);

    return (
        <main className="min-h-screen bg-black text-white overflow-hidden selection:bg-[#FF6B35] selection:text-white">
            <AnimatePresence>
                {!introComplete && (
                    <IntroOverlay onComplete={() => setIntroComplete(true)} />
                )}
            </AnimatePresence>

            <div className={`transition-opacity duration-1000 ${showContent ? "opacity-100" : "opacity-0"}`}>
                <Navbar />

                {/* Cinematic Hero */}
                <section className="relative h-screen flex items-center justify-center overflow-hidden">
                    {/* Video Background - Space Theme */}
                    <video
                        autoPlay
                        loop
                        muted
                        playsInline
                        className="absolute inset-0 w-full h-full object-cover opacity-30 pointer-events-none"
                    >
                        <source src="https://videos.pexels.com/video-files/3141211/3141211-uhd_2560_1440_25fps.mp4" type="video/mp4" />
                    </video>

                    <div className="absolute inset-0 bg-gradient-to-t from-background via-transpose to-transparent" />

                    <div className="container mx-auto px-4 z-10 text-center">
                        <motion.h1
                            initial={{ y: 100, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            transition={{ duration: 1, ease: [0.19, 1, 0.22, 1] }}
                            className="text-7xl md:text-9xl font-black font-orbitron text-white mb-6"
                        >
                            TECHNO<br />UTSAV '26
                        </motion.h1>

                        <motion.div
                            initial={{ scale: 0.8, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            transition={{ delay: 0.2, duration: 0.8 }}
                        >
                            <Link href="/passes">
                                <Button className="bg-[#FF6B35] text-white hover:bg-[#FF8C42] shadow-[0_0_40px_rgba(255,107,53,0.5)] px-12 py-8 text-xl rounded-full font-bold transition-all hover:scale-105" glow>
                                    GET YOUR PASS
                                </Button>
                            </Link>
                        </motion.div>
                    </div>
                </section>

                {/* Kinetic Marquee - Orange */}
                <div className="bg-[#FF6B35] text-white overflow-hidden py-6 my-16 border-y-4 border-[#FF8C42]">
                    <motion.div style={{ x }} className="flex whitespace-nowrap text-6xl font-black font-orbitron uppercase">
                        <span className="mx-12">Innovation • Technology • Culture • Creativity • Excellence • </span>
                        <span className="mx-12">Innovation • Technology • Culture • Creativity • Excellence • </span>
                    </motion.div>
                </div>

                {/* Countdown Timer */}
                <EventCountdown />

                {/* Event Stats */}
                <EventStats />

                {/* Accordion */}
                <OrbAccordion />

                {/* Zero Gravity Sponsors */}
                <GravityScene />

                {/* Slot Machine CTA */}
                <SlotMachineText />

                {/* Tabbed Events Slider */}
                <TabbedEvents />

                {/* Past Events */}
                <PastEvents />

                {/* Testimonials */}
                <Testimonials />

                {/* Teammate Lookup */}
                <TeammateLookup />

                {/* Footer */}
                <Footer />
            </div>
        </main>
    );
}
