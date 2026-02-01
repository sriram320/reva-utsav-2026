"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Play } from "lucide-react";

const tabs = [
    {
        id: "tech",
        label: "TECHNICAL",
        title: "CODE WARS 2026",
        video: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4",
        desc: "24-Hour Hackathon | AI Challenge | RoboWars",
    },
    {
        id: "cult",
        label: "CULTURAL",
        title: "DANCE BATTLES",
        video: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4",
        desc: "Solo Dance | Battle of Bands | Fashion Show",
    },
    {
        id: "game",
        label: "GAMING",
        title: "ESPORTS ARENA",
        video: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4",
        desc: "Valorant | FIFA 26 | BGMI Tournament",
    },
];

export function TabbedEvents() {
    const [activeTab, setActiveTab] = useState(tabs[0]);

    return (
        <section className="py-24 bg-black relative overflow-hidden">
            <div className="container mx-auto px-4 relative z-10 flex flex-col md:flex-row gap-12 items-center">

                {/* Left: Content & Tabs */}
                <div className="w-full md:w-1/3 flex flex-col gap-8">
                    <h2 className="text-5xl font-black font-orbitron text-white">EVENTS</h2>
                    <div className="flex flex-col gap-2">
                        {tabs.map((tab) => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab)}
                                className={`text-left text-2xl font-bold py-4 border-b transition-colors duration-300 ${activeTab.id === tab.id
                                        ? "text-[#FF4F00] border-[#FF4F00]"
                                        : "text-gray-600 border-gray-800 hover:text-gray-400"
                                    }`}
                            >
                                {tab.label}
                            </button>
                        ))}
                    </div>
                    <motion.div
                        key={activeTab.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.4 }}
                    >
                        <p className="text-gray-400 text-lg mb-6">{activeTab.desc}</p>
                        <Button variant="outline" className="border-[#FF4F00] text-[#FF4F00] hover:bg-[#FF4F00] hover:text-white">
                            VIEW DETAILS
                        </Button>
                    </motion.div>
                </div>

                {/* Right: Video Preview */}
                <div className="w-full md:w-2/3 relative h-[500px] rounded-3xl overflow-hidden border border-white/10 group">
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={activeTab.id}
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.5 }}
                            className="absolute inset-0"
                        >
                            <video
                                src={activeTab.video}
                                autoPlay
                                loop
                                muted
                                className="w-full h-full object-cover opacity-60 group-hover:opacity-80 transition-opacity duration-500"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent" />
                            <div className="absolute bottom-12 left-12">
                                <h3 className="text-4xl md:text-6xl font-black font-orbitron text-white mb-4">{activeTab.title}</h3>
                                <div className="w-16 h-16 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center cursor-pointer hover:scale-110 transition-transform">
                                    <Play className="fill-white text-white ml-1" />
                                </div>
                            </div>
                        </motion.div>
                    </AnimatePresence>
                </div>

            </div>
        </section>
    );
}
