"use client";

import { useState } from "react";
import { motion } from "framer-motion";

const items = [
    {
        id: 1,
        title: "FOUNDERS",
        desc: "For those building the future.",
        image: "https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=800&q=80" // Team startup meeting
    },
    {
        id: 2,
        title: "LEADS",
        desc: "For those guiding the way.",
        image: "https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=800&q=80" // Leadership team
    },
    {
        id: 3,
        title: "CREATORS",
        desc: "For those visualizing dreams.",
        image: "https://images.unsplash.com/photo-1561070791-2526d30994b5?w=800&q=80" // Creative design workspace
    },
    {
        id: 4,
        title: "ENGINEERS",
        desc: "For those coding reality.",
        image: "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=800&q=80" // Coding laptop
    },
];

export function OrbAccordion() {
    const [active, setActive] = useState(0);

    return (
        <section className="py-24 border-y border-white/10 bg-black/40">
            <div className="container mx-auto px-4">
                <h2 className="text-sm text-gray-500 font-orbitron tracking-widest uppercase mb-12 text-center">Who is this for?</h2>

                <div className="flex flex-col md:flex-row h-[400px] w-full gap-2">
                    {items.map((item, index) => {
                        const isActive = active === index;
                        return (
                            <motion.div
                                key={item.id}
                                onHoverStart={() => setActive(index)}
                                initial={false}
                                animate={{ flex: isActive ? 3 : 1 }}
                                transition={{ duration: 0.5, ease: [0.19, 1, 0.22, 1] }} // Expo easing
                                className="relative h-full rounded-2xl overflow-hidden border border-white/10 cursor-pointer flex flex-col justify-end p-8 group"
                            >
                                {/* Background Image */}
                                <div
                                    className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-110"
                                    style={{ backgroundImage: `url('${item.image}')` }}
                                />

                                {/* Dark Overlay */}
                                <div className="absolute inset-0 bg-black/60" />

                                {/* The Orb - Scales up on Active */}
                                <motion.div
                                    animate={{
                                        scale: isActive ? 1 : 0,
                                        opacity: isActive ? 0.4 : 0
                                    }}
                                    className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-gradient-to-r from-[#FF6B35] to-[#FF8C42] rounded-full blur-[80px] pointer-events-none"
                                />

                                <div className="relative z-10">
                                    <h3 className={`text-4xl md:text-5xl font-black font-orbitron transition-colors duration-300 ${isActive ? 'text-white' : 'text-gray-300'}`}>
                                        {item.title}
                                    </h3>

                                    {/* Text Reveal - Slides Up */}
                                    <div className="overflow-hidden">
                                        <motion.p
                                            initial={{ y: 20, opacity: 0 }}
                                            animate={{ y: isActive ? 0 : 20, opacity: isActive ? 1 : 0 }}
                                            transition={{ duration: 0.4, delay: 0.1 }}
                                            className="text-lg text-gray-200 mt-2 font-inter"
                                        >
                                            {item.desc}
                                        </motion.p>
                                    </div>
                                </div>
                            </motion.div>
                        );
                    })}
                </div>
            </div>
        </section>
    );
}
