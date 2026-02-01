"use client";

import { useRef, useEffect } from "react";
import { motion } from "framer-motion";

const pastEvents = [
    {
        id: 1,
        title: "Tech Summit 2024",
        video: "https://videos.pexels.com/video-files/3163534/3163534-uhd_2560_1440_24fps.mp4",
        year: "2024"
    },
    {
        id: 2,
        title: "Hackathon Finals",
        video: "https://videos.pexels.com/video-files/6774266/6774266-hd_1920_1080_25fps.mp4",
        year: "2023"
    },
    {
        id: 3,
        title: "Cultural Festival",
        video: "https://videos.pexels.com/video-files/3209828/3209828-uhd_2560_1440_25fps.mp4",
        year: "2023"
    },
    {
        id: 4,
        title: "Innovation Expo",
        video: "https://videos.pexels.com/video-files/3141207/3141207-uhd_2560_1440_25fps.mp4",
        year: "2022"
    },
    {
        id: 5,
        title: "Startup Showcase",
        video: "https://videos.pexels.com/video-files/6457089/6457089-hd_1920_1080_30fps.mp4",
        year: "2022"
    }
];

export function PastEvents() {
    const videoRefs = useRef<(HTMLVideoElement | null)[]>([]);

    useEffect(() => {
        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    const video = entry.target as HTMLVideoElement;
                    if (entry.isIntersecting) {
                        video.play().catch(() => { });
                    } else {
                        video.pause();
                    }
                });
            },
            { threshold: 0.5 }
        );

        videoRefs.current.forEach((video) => {
            if (video) observer.observe(video);
        });

        return () => observer.disconnect();
    }, []);

    return (
        <section className="min-h-screen bg-black py-24 flex flex-col justify-center">
            {/* Header */}
            <div className="container mx-auto px-4 mb-16">
                <motion.h2
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="text-5xl md:text-7xl font-black font-orbitron text-white mb-4"
                >
                    PAST EVENTS
                </motion.h2>
                <p className="text-gray-400 text-xl">Relive the magic of REVA University's greatest moments</p>
            </div>

            {/* Horizontal Scroll Container */}
            <div className="overflow-x-scroll scrollbar-hide">
                <div className="flex gap-8 px-4 pb-8 min-w-max">
                    {pastEvents.map((event, index) => (
                        <motion.div
                            key={event.id}
                            initial={{ opacity: 0, x: 50 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: index * 0.1 }}
                            className="flex-shrink-0 w-[80vw] md:w-[600px] rounded-2xl overflow-hidden border-2 border-white/20 shadow-2xl hover:scale-105 transition-transform duration-300"
                        >
                            <div className="relative aspect-video">
                                <video
                                    ref={(el) => { videoRefs.current[index] = el; }}
                                    loop
                                    muted
                                    playsInline
                                    className="w-full h-full object-cover"
                                >
                                    <source src={event.video} type="video/mp4" />
                                </video>

                                {/* Overlay with event info */}
                                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black via-black/90 to-transparent p-8">
                                    <p className="text-[#FF6B35] text-sm font-bold mb-2 uppercase tracking-wider">{event.year}</p>
                                    <h3 className="text-white text-3xl font-bold font-orbitron">{event.title}</h3>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>

            {/* Scroll hint */}
            <div className="text-center mt-8 text-gray-500 text-sm">
                ← Scroll horizontally to see more →
            </div>
        </section>
    );
}
