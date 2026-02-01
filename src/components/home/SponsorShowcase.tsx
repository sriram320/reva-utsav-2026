"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

const sponsors = {
  gold: [
    { name: "TechCorp", logo: "TC" },
    { name: "InnovateX", logo: "IX" },
    { name: "FutureLabs", logo: "FL" },
  ],
  silver: [
    { name: "CloudSys", logo: "CS" },
    { name: "DataFlow", logo: "DF" },
    { name: "CyberNet", logo: "CN" },
    { name: "DevOps Inc", logo: "DI" },
  ],
  bronze: [
    { name: "StartUp A", logo: "SA" },
    { name: "StartUp B", logo: "SB" },
    { name: "StartUp C", logo: "SC" },
    { name: "StartUp D", logo: "SD" },
    { name: "StartUp E", logo: "SE" },
  ],
};

export function SponsorShowcase() {
  return (
    <section className="py-24 border-t border-white/10 bg-black/50">
      <div className="container mx-auto px-4 text-center">
        <motion.div
           initial={{ opacity: 0, y: 20 }}
           whileInView={{ opacity: 1, y: 0 }}
           viewport={{ once: true }}
           className="mb-16"
        >
           <h2 className="text-3xl md:text-5xl font-bold font-orbitron text-white mb-4">Our Partners</h2>
           <p className="text-gray-400 max-w-2xl mx-auto">
              Powered by industry leaders who believe in the future of technology.
           </p>
        </motion.div>

        {/* Gold Sponsors */}
        <div className="mb-16">
           <h3 className="text-secondary font-orbitron tracking-widest uppercase mb-8 text-sm">Title Sponsors</h3>
           <div className="flex flex-wrap justify-center gap-8 md:gap-16">
              {sponsors.gold.map((s, i) => (
                 <div key={i} className="w-40 h-24 md:w-56 md:h-32 bg-white/5 border border-secondary/30 rounded-xl flex items-center justify-center hover:bg-white/10 hover:scale-105 transition-all duration-300 shadow-[0_0_20px_rgba(0,212,255,0.1)]">
                    <span className="text-2xl font-bold text-white">{s.name}</span>
                 </div>
              ))}
           </div>
        </div>

        {/* Silver Sponsors */}
        <div className="mb-16">
           <h3 className="text-gray-400 font-orbitron tracking-widest uppercase mb-8 text-sm">Official Partners</h3>
           <div className="flex flex-wrap justify-center gap-6 md:gap-10">
              {sponsors.silver.map((s, i) => (
                 <div key={i} className="w-32 h-20 md:w-44 md:h-24 bg-white/5 border border-white/10 rounded-lg flex items-center justify-center hover:bg-white/10 hover:border-white/30 transition-all">
                    <span className="text-lg font-semibold text-gray-300">{s.name}</span>
                 </div>
              ))}
           </div>
        </div>

        {/* Bronze Sponsors */}
        <div>
           <h3 className="text-gray-500 font-orbitron tracking-widest uppercase mb-8 text-xs">Community Partners</h3>
           <div className="flex flex-wrap justify-center gap-4">
              {sponsors.bronze.map((s, i) => (
                 <div key={i} className="w-24 h-16 md:w-32 md:h-20 bg-white/5 border border-white/5 rounded-lg flex items-center justify-center hover:bg-white/10 transition-all opacity-70 hover:opacity-100">
                    <span className="text-sm font-medium text-gray-400">{s.name}</span>
                 </div>
              ))}
           </div>
        </div>
      </div>
    </section>
  );
}
