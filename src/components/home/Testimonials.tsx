"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight, Quote } from "lucide-react";

const testimonials = [
    {
        id: 1,
        name: "Priya Sharma",
        role: "Winner - Hackathon 2024",
        college: "IIT Delhi",
        image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&h=150&fit=crop",
        quote: "REVA Utsav completely changed my perspective on tech. The hackathon was intense, the mentors were amazing, and winning ₹2L was the cherry on top!"
    },
    {
        id: 2,
        name: "Arjun Mehta",
        role: "Participant - Tech Summit 2023",
        college: "NIT Trichy",
        image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop",
        quote: "Best tech fest I've attended! The networking opportunities, workshops, and star night made it unforgettable. Already registered for this year!"
    },
    {
        id: 3,
        name: "Sneha Reddy",
        role: "2nd Runner Up - Design Competition",
        college: "BITS Pilani",
        image: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop",
        quote: "The creative energy here is unmatched. Met incredible designers, learned from industry experts, and got exposure I never imagined!"
    },
    {
        id: 4,
        name: "Rahul Verma",
        role: "Team Lead - Robotics Challenge",
        college: "VIT Vellore",
        image: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop",
        quote: "Our team came from across the country. The organization, facilities, and competition level were world-class. Can't wait for 2026!"
    }
];

export function Testimonials() {
    const [current, setCurrent] = useState(0);

    useEffect(() => {
        const timer = setInterval(() => {
            setCurrent((prev) => (prev + 1) % testimonials.length);
        }, 5000);

        return () => clearInterval(timer);
    }, []);

    const next = () => setCurrent((prev) => (prev + 1) % testimonials.length);
    const prev = () => setCurrent((cur) => (cur - 1 + testimonials.length) % testimonials.length);

    return (
        <section className="py-24 bg-black relative overflow-hidden">
            {/* Background gradient */}
            <div className="absolute inset-0 bg-gradient-to-t from-[#FF6B35]/10 via-transparent to-transparent" />

            <div className="container mx-auto px-4 relative z-10">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="text-center mb-16"
                >
                    <h2 className="text-4xl md:text-6xl font-black font-orbitron text-white mb-4">
                        WHAT THEY SAY
                    </h2>
                    <p className="text-gray-400 text-lg">Hear from past participants</p>
                </motion.div>

                <div className="max-w-4xl mx-auto">
                    <div className="relative">
                        <AnimatePresence mode="wait">
                            <motion.div
                                key={current}
                                initial={{ opacity: 0, x: 100 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -100 }}
                                transition={{ duration: 0.5 }}
                                className="bg-white/5 backdrop-blur-md border border-white/10 rounded-3xl p-8 md:p-12"
                            >
                                {/* Quote icon */}
                                <Quote className="text-[#FF6B35] mb-6" size={48} />

                                {/* Quote */}
                                <p className="text-white text-xl md:text-2xl font-medium leading-relaxed mb-8">
                                    "{testimonials[current].quote}"
                                </p>

                                {/* Author */}
                                <div className="flex items-center gap-4">
                                    <img
                                        src={testimonials[current].image}
                                        alt={testimonials[current].name}
                                        className="w-16 h-16 rounded-full object-cover border-2 border-[#FF6B35]"
                                    />
                                    <div>
                                        <h4 className="text-white font-bold text-lg">
                                            {testimonials[current].name}
                                        </h4>
                                        <p className="text-[#FF6B35] text-sm font-medium">
                                            {testimonials[current].role}
                                        </p>
                                        <p className="text-gray-400 text-sm">
                                            {testimonials[current].college}
                                        </p>
                                    </div>
                                </div>
                            </motion.div>
                        </AnimatePresence>

                        {/* Navigation buttons */}
                        <button
                            onClick={prev}
                            className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-1/2 md:-translate-x-full bg-[#FF6B35] text-white p-3 rounded-full hover:bg-[#FF8C42] transition-colors shadow-lg"
                        >
                            <ChevronLeft size={24} />
                        </button>
                        <button
                            onClick={next}
                            className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-1/2 md:translate-x-full bg-[#FF6B35] text-white p-3 rounded-full hover:bg-[#FF8C42] transition-colors shadow-lg"
                        >
                            <ChevronRight size={24} />
                        </button>
                    </div>

                    {/* Dots indicator */}
                    <div className="flex justify-center gap-2 mt-8">
                        {testimonials.map((_, index) => (
                            <button
                                key={index}
                                onClick={() => setCurrent(index)}
                                className={`w-2 h-2 rounded-full transition-all duration-300 ${index === current ? 'bg-[#FF6B35] w-8' : 'bg-white/30'
                                    }`}
                            />
                        ))}
                    </div>
                </div>
            </div>
        </section>
    );
}
