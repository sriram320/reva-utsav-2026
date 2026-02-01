"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useInView } from "framer-motion";
import { Trophy, Users, Calendar, IndianRupee } from "lucide-react";

const stats = [
    {
        icon: IndianRupee,
        value: 2500000,
        label: "Prize Pool",
        prefix: "₹",
        suffix: "L"
    },
    {
        icon: Users,
        value: 5000,
        label: "Attendees",
        prefix: "",
        suffix: "+"
    },
    {
        icon: Calendar,
        value: 50,
        label: "Events & Competitions",
        prefix: "",
        suffix: "+"
    },
    {
        icon: Trophy,
        value: 100,
        label: "Prizes to Win",
        prefix: "",
        suffix: "+"
    }
];

export function EventStats() {
    return (
        <section className="py-24 bg-gradient-to-b from-black via-[#FF6B35]/5 to-black relative overflow-hidden">
            {/* Animated background elements */}
            <div className="absolute inset-0 opacity-20">
                <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-[#FF6B35] rounded-full blur-[100px]" />
                <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-[#FF8C42] rounded-full blur-[100px]" />
            </div>

            <div className="container mx-auto px-4 relative z-10">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="text-center mb-16"
                >
                    <h2 className="text-4xl md:text-6xl font-black font-orbitron text-white mb-4">
                        BY THE NUMBERS
                    </h2>
                    <p className="text-gray-400 text-lg">Experience the scale of innovation</p>
                </motion.div>

                <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
                    {stats.map((stat, index) => (
                        <StatCard key={index} {...stat} index={index} />
                    ))}
                </div>
            </div>
        </section>
    );
}

function StatCard({ icon: Icon, value, label, prefix, suffix, index }: any) {
    const [count, setCount] = useState(0);
    const ref = useRef(null);
    const isInView = useInView(ref, { once: true });

    useEffect(() => {
        if (isInView) {
            let start = 0;
            const duration = 2000;
            const increment = value / (duration / 16);

            const timer = setInterval(() => {
                start += increment;
                if (start >= value) {
                    setCount(value);
                    clearInterval(timer);
                } else {
                    setCount(Math.floor(start));
                }
            }, 16);

            return () => clearInterval(timer);
        }
    }, [isInView, value]);

    const displayValue = prefix === "₹" ? (count / 100000).toFixed(0) : count;

    return (
        <motion.div
            ref={ref}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: index * 0.1 }}
            className="group relative bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-8 hover:bg-white/10 transition-all duration-300"
        >
            {/* Icon */}
            <div className="mb-6 flex justify-center">
                <div className="p-4 bg-gradient-to-br from-[#FF6B35] to-[#FF8C42] rounded-2xl">
                    <Icon className="text-white" size={32} />
                </div>
            </div>

            {/* Number */}
            <div className="text-center mb-3">
                <span className="text-5xl md:text-6xl font-black font-orbitron text-white">
                    {prefix}{displayValue}{suffix}
                </span>
            </div>

            {/* Label */}
            <p className="text-gray-400 text-sm md:text-base font-medium text-center">
                {label}
            </p>

            {/* Hover glow effect */}
            <div className="absolute inset-0 bg-gradient-to-br from-[#FF6B35]/20 to-[#FF8C42]/20 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
        </motion.div>
    );
}
