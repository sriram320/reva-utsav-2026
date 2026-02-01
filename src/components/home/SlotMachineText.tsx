"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

const words = ["DESIGN", "BUSINESS", "TECH", "CULTURE", "FUTURE"];

export function SlotMachineText() {
    const [index, setIndex] = useState(0);

    useEffect(() => {
        const interval = setInterval(() => {
            setIndex((prev) => (prev + 1) % words.length);
        }, 2000);
        return () => clearInterval(interval);
    }, []);

    return (
        <section className="py-32 flex flex-col items-center justify-center text-center">
            <p className="text-xl md:text-2xl text-gray-500 font-light mb-4">THE REVOLUTION STARTS HERE</p>
            <div className="flex flex-col md:flex-row items-baseline justify-center gap-4 text-6xl md:text-8xl font-black font-orbitron">
                <span className="text-white">EXPLORE</span>

                {/* Masked Scroll Container */}
                <div className="h-[1.1em] overflow-hidden relative w-[250px] md:w-[450px]">
                    <AnimatePresence mode="popLayout">
                        <motion.span
                            key={index}
                            initial={{ y: "100%" }}
                            animate={{ y: 0 }}
                            exit={{ y: "-100%" }}
                            transition={{ duration: 0.8, ease: [0.19, 1, 0.22, 1] }} // Expo out
                            className="absolute inset-0 bg-clip-text text-transparent bg-gradient-to-r from-secondary to-accent"
                        >
                            {words[index]}
                        </motion.span>
                    </AnimatePresence>
                </div>

                <span className="text-white">TODAY</span>
            </div>
        </section>
    );
}
