"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, MessageCircle, MapPin } from "lucide-react";
import { motion } from "framer-motion";

const attendees = [
    { id: 1, name: "Alice Chen", role: "Developer", company: "TechCorp", bio: "Building the future of web." },
    { id: 2, name: "Bob Smith", role: "Designer", company: "Freelance", bio: "UI/UX enthusiast." },
    { id: 3, name: "Charlie D", role: "Student", company: "REVA Univ", bio: "Learning React and Next.js." },
    { id: 4, name: "Dana White", role: "Manager", company: "Innovate", bio: "Looking for talent." },
];

export function AttendeeDirectory() {
    const [searchTerm, setSearchTerm] = useState("");

    const filtered = attendees.filter(a =>
        a.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        a.role.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="py-12">
            <div className="max-w-xl mx-auto mb-12 relative">
                <Search className="absolute left-4 top-3.5 text-gray-400" size={20} />
                <Input
                    placeholder="Find people by name or role..."
                    className="pl-12 h-12 bg-white/5 border-white/20 rounded-full focus:ring-secondary/50"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filtered.map((user) => (
                    <motion.div
                        key={user.id}
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="bg-black/40 border border-white/10 rounded-xl p-6 hover:border-secondary/50 transition-all group"
                    >
                        <div className="flex items-center space-x-4 mb-4">
                            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-secondary to-accent flex items-center justify-center text-black font-bold text-lg">
                                {user.name[0]}
                            </div>
                            <div>
                                <h3 className="font-bold text-white group-hover:text-secondary transition-colors">{user.name}</h3>
                                <p className="text-xs text-secondary">{user.role} @ {user.company}</p>
                            </div>
                        </div>
                        <p className="text-sm text-gray-400 mb-6 line-clamp-2">{user.bio}</p>
                        <Button variant="outline" size="sm" className="w-full gap-2">
                            <MessageCircle size={14} /> Connect
                        </Button>
                    </motion.div>
                ))}
            </div>
        </div>
    );
}
