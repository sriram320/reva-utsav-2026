"use client";

import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { motion } from "framer-motion";

const sponsors = {
    platinum: [
        { name: "Tech Giants Inc.", logo: "TG" },
        { name: "Innovation Labs", logo: "IL" },
    ],
    gold: [
        { name: "Cloud Solutions", logo: "CS" },
        { name: "Digital Dynamics", logo: "DD" },
        { name: "Future Tech", logo: "FT" },
    ],
    silver: [
        { name: "Startup Hub", logo: "SH" },
        { name: "Code Academy", logo: "CA" },
        { name: "Web Wizards", logo: "WW" },
        { name: "App Masters", logo: "AM" },
    ],
};

export default function SponsorsPage() {
    return (
        <main className="min-h-screen bg-black text-white relative overflow-hidden flex flex-col">
            <Navbar />

            <div className="container mx-auto px-4 py-24 flex-1">
                {/* Header */}
                <div className="text-center mb-16">
                    <motion.h1
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-5xl md:text-7xl font-black font-orbitron mb-4 text-[#FFD700]"
                    >
                        OUR SPONSORS
                    </motion.h1>
                    <p className="text-gray-300 text-lg max-w-2xl mx-auto">
                        We are grateful to our sponsors for making REVA Utsav 2026 possible. Join us in celebrating innovation and technology!
                    </p>
                </div>

                {/* Platinum Sponsors */}
                <SponsorTier
                    title="Platinum Sponsors"
                    sponsors={sponsors.platinum}
                    color="from-gray-300 to-gray-400"
                    size="large"
                />

                {/* Gold Sponsors */}
                <SponsorTier
                    title="Gold Sponsors"
                    sponsors={sponsors.gold}
                    color="from-yellow-400 to-yellow-600"
                    size="medium"
                />

                {/* Silver Sponsors */}
                <SponsorTier
                    title="Silver Sponsors"
                    sponsors={sponsors.silver}
                    color="from-gray-400 to-gray-500"
                    size="small"
                />

                {/* Become a Sponsor CTA */}
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="mt-20 text-center bg-white/5 backdrop-blur-sm border border-white/10 rounded-3xl p-12"
                >
                    <h2 className="text-3xl md:text-4xl font-bold font-orbitron text-[#FFD700] mb-4">
                        Become a Sponsor
                    </h2>
                    <p className="text-gray-300 mb-8 max-w-2xl mx-auto">
                        Partner with us to reach thousands of talented students and innovators. Contact our sponsorship team to learn more about the benefits.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <a
                            href="mailto:sponsors@revautsav.com"
                            className="px-8 py-4 bg-[#FFD700] text-black font-bold rounded-full hover:bg-[#FFC107] transition-colors"
                        >
                            Contact Sponsorship Team
                        </a>
                        <a
                            href="/sponsorship-brochure.pdf"
                            className="px-8 py-4 bg-white/10 text-white font-bold rounded-full hover:bg-white/20 transition-colors border border-white/20"
                        >
                            Download Brochure
                        </a>
                    </div>
                </motion.div>
            </div>

            <Footer />
        </main>
    );
}

function SponsorTier({
    title,
    sponsors,
    color,
    size,
}: {
    title: string;
    sponsors: { name: string; logo: string }[];
    color: string;
    size: "small" | "medium" | "large";
}) {
    const sizeClasses = {
        small: "w-32 h-32 text-2xl",
        medium: "w-40 h-40 text-3xl",
        large: "w-48 h-48 text-4xl",
    };

    return (
        <div className="mb-16">
            <h2 className={`text-3xl font-bold font-orbitron mb-8 text-center bg-gradient-to-r ${color} bg-clip-text text-transparent`}>
                {title}
            </h2>
            <div className="flex flex-wrap justify-center gap-8">
                {sponsors.map((sponsor, index) => (
                    <motion.div
                        key={index}
                        initial={{ opacity: 0, scale: 0.8 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        viewport={{ once: true }}
                        transition={{ delay: index * 0.1 }}
                        whileHover={{ scale: 1.05 }}
                        className={`${sizeClasses[size]} bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl flex items-center justify-center cursor-pointer group hover:border-[#FFD700]/50 transition-all`}
                    >
                        <div className="text-center">
                            <div className={`font-black ${size === 'large' ? 'text-4xl' : size === 'medium' ? 'text-3xl' : 'text-2xl'} text-white/20 group-hover:text-[#FFD700]/30 transition-colors`}>
                                {sponsor.logo}
                            </div>
                            <p className="text-xs text-gray-400 mt-2 px-2">{sponsor.name}</p>
                        </div>
                    </motion.div>
                ))}
            </div>
        </div>
    );
}
