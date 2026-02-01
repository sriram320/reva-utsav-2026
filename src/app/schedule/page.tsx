"use client";

import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { EnhancedAgenda } from "@/components/features/EnhancedAgenda";

export default function SchedulePage() {
    return (
        <main className="min-h-screen bg-black text-white relative overflow-hidden flex flex-col">
            <Navbar />

            <div className="container mx-auto px-4 py-24 flex-1">
                <div className="text-center mb-12">
                    <h1 className="text-4xl md:text-6xl font-bold font-orbitron mb-4 text-[#FFD700]">
                        Event Agenda
                    </h1>
                    <p className="text-gray-300 max-w-xl mx-auto">
                        Track your favorite sessions across multiple stages.
                    </p>
                </div>

                <EnhancedAgenda />
            </div>

            <Footer />
        </main>
    );
}
