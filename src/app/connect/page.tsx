"use client";

import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { AttendeeDirectory } from "@/components/features/AttendeeDirectory";

export default function NetworkingPage() {
    return (
        <main className="min-h-screen bg-black text-white relative overflow-hidden flex flex-col">
            <Navbar />

            <div className="container mx-auto px-4 py-24 flex-1">
                <div className="text-center mb-12">
                    <h1 className="text-4xl md:text-6xl font-bold font-orbitron mb-4 text-white">
                        Community Connect
                    </h1>
                    <p className="text-gray-400 max-w-xl mx-auto">
                        Find teammates, mentors, and industry leaders attending the fest.
                    </p>
                </div>

                <AttendeeDirectory />
            </div>

            <Footer />
        </main>
    );
}
