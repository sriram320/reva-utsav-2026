"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";

export function EventCountdown() {
    // Set event date - adjust this to your actual event date
    const eventDate = new Date("2026-03-15T09:00:00").getTime();

    const [timeLeft, setTimeLeft] = useState({
        days: 0,
        hours: 0,
        minutes: 0,
        seconds: 0
    });

    useEffect(() => {
        const timer = setInterval(() => {
            const now = new Date().getTime();
            const distance = eventDate - now;

            if (distance > 0) {
                setTimeLeft({
                    days: Math.floor(distance / (1000 * 60 * 60 * 24)),
                    hours: Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
                    minutes: Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60)),
                    seconds: Math.floor((distance % (1000 * 60)) / 1000)
                });
            }
        }, 1000);

        return () => clearInterval(timer);
    }, [eventDate]);

    const TimeBox = ({ value, label }: { value: number; label: string }) => (
        <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="flex flex-col items-center"
        >
            <div className="relative">
                <div className="bg-gradient-to-br from-[#FF6B35] to-[#FF8C42] p-1 rounded-2xl shadow-2xl">
                    <div className="bg-black px-6 py-4 md:px-8 md:py-6 rounded-xl">
                        <motion.span
                            key={value}
                            initial={{ y: -20, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            className="text-5xl md:text-7xl font-black font-orbitron text-white"
                        >
                            {value.toString().padStart(2, '0')}
                        </motion.span>
                    </div>
                </div>
            </div>
            <p className="text-gray-400 text-sm md:text-base font-semibold mt-3 uppercase tracking-wider">
                {label}
            </p>
        </motion.div>
    );

    return (
        <section className="py-24 bg-black relative overflow-hidden">
            {/* Background glow */}
            <div className="absolute inset-0 bg-gradient-to-b from-[#FF6B35]/5 via-transparent to-transparent" />

            <div className="container mx-auto px-4 relative z-10">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="text-center mb-12"
                >
                    <h2 className="text-4xl md:text-6xl font-black font-orbitron text-white mb-4">
                        EVENT STARTS IN
                    </h2>
                    <p className="text-gray-400 text-lg">Don't miss out on the biggest tech fest of the year!</p>
                </motion.div>

                <div className="flex justify-center gap-4 md:gap-8 flex-wrap">
                    <TimeBox value={timeLeft.days} label="Days" />
                    <TimeBox value={timeLeft.hours} label="Hours" />
                    <TimeBox value={timeLeft.minutes} label="Minutes" />
                    <TimeBox value={timeLeft.seconds} label="Seconds" />
                </div>
            </div>
        </section>
    );
}
