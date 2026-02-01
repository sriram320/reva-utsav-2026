"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "lucide-react"; // Wait, Badge is an icon? Or component? I'll use simple div for badge.

const tracks = ["All", "Tech", "Design", "Cultural", "Keynote"];

const schedule = [
    {
        id: 1,
        time: "09:00 AM",
        title: "Opening Ceremony",
        speaker: "Dr. Chancellor",
        track: "Keynote",
        description: "Inauguration of Techno-Utsav 2026",
    },
    {
        id: 2,
        time: "10:30 AM",
        title: "AI in 2030",
        speaker: "Dr. Sarah Connor",
        track: "Tech",
        description: "What happens when AGI becomes reality?",
    },
    {
        id: 3,
        time: "11:00 AM",
        title: "Design Systems Workshop",
        speaker: "Alex M.",
        track: "Design",
        description: "Building scalable UI frameworks.",
    },
    {
        id: 4,
        time: "01:00 PM",
        title: "RoboWars Qualifiers",
        speaker: "Arena A",
        track: "Tech",
        description: "Battle of the bots - Round 1.",
    },
    {
        id: 5,
        time: "03:00 PM",
        title: "Battle of Bands",
        speaker: "Main Stage",
        track: "Cultural",
        description: "Student bands compete for glory.",
    },
];

export function EnhancedAgenda() {
    const [activeTrack, setActiveTrack] = useState("All");

    const filteredEvents = activeTrack === "All"
        ? schedule
        : schedule.filter(e => e.track === activeTrack);

    return (
        <section className="py-12">
            <div className="flex flex-wrap justify-center gap-2 mb-12">
                {tracks.map((track) => (
                    <Button
                        key={track}
                        variant={activeTrack === track ? "primary" : "outline"}
                        onClick={() => setActiveTrack(track)}
                        className="rounded-full min-w-[80px]"
                    >
                        {track}
                    </Button>
                ))}
            </div>

            <div className="max-w-4xl mx-auto relative px-4">
                {/* Vertical Line */}
                <div className="absolute left-8 top-0 bottom-0 w-px bg-white/10 hidden md:block" />

                <AnimatePresence mode="popLayout">
                    {filteredEvents.map((event) => (
                        <motion.div
                            key={event.id}
                            layout
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            transition={{ duration: 0.3 }}
                            className="flex flex-col md:flex-row gap-6 mb-8 relative md:pl-12 group"
                        >
                            {/* Timeline Dot */}
                            <div className="hidden md:block absolute left-[27px] top-6 w-3 h-3 rounded-full bg-secondary border-4 border-black z-10 shadow-[0_0_10px_rgba(0,212,255,0.8)]" />

                            <div className="w-32 pt-2 flex-shrink-0">
                                <span className="text-xl font-orbitron font-bold text-white">{event.time}</span>
                            </div>

                            <Card className="flex-1 bg-white/5 border-white/10 hover:border-secondary/50 hover:bg-white/10 transition-all duration-300">
                                <CardContent className="p-6">
                                    <div className="flex justify-between items-start mb-2">
                                        <h3 className="text-xl font-bold text-white group-hover:text-secondary transition-colors">
                                            {event.title}
                                        </h3>
                                        <span className={`text-[10px] uppercase font-bold px-2 py-1 rounded border ${event.track === 'Tech' ? 'border-blue-500 text-blue-400' :
                                                event.track === 'Cultural' ? 'border-purple-500 text-purple-400' :
                                                    'border-white/20 text-gray-400'
                                            }`}>
                                            {event.track}
                                        </span>
                                    </div>
                                    <p className="text-sm text-gray-400 mb-1">with <span className="text-white">{event.speaker}</span></p>
                                    <p className="text-sm text-gray-500">{event.description}</p>
                                </CardContent>
                            </Card>
                        </motion.div>
                    ))}
                </AnimatePresence>
            </div>
        </section>
    );
}
