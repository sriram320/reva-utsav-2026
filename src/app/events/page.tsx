"use client";

import { useState, useEffect } from "react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import Link from "next/link";
import { Calendar, Users, Trophy } from "lucide-react";

export default function EventsPage() {
    const [filter, setFilter] = useState("All");
    const [events, setEvents] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchEvents();
    }, []);

    const fetchEvents = async () => {
        try {
            const res = await fetch('/api/events');
            const data = await res.json();
            setEvents(data.events || []);
        } catch (error) {
            console.error('Error fetching events:', error);
        }
        setLoading(false);
    };

    const filteredEvents = filter === "All" ? events : events.filter(e => e.category === filter);

    if (loading) {
        return (
            <main className="min-h-screen bg-black text-white flex items-center justify-center">
                <Navbar />
                <div>Loading events...</div>
            </main>
        );
    }

    return (
        <main className="min-h-screen bg-black text-white relative overflow-hidden flex flex-col">
            <Navbar />

            <div className="container mx-auto px-4 py-24 flex-1">
                <div className="flex flex-col md:flex-row justify-between items-end mb-12">
                    <div>
                        <h1 className="text-4xl md:text-5xl font-bold font-orbitron mb-4 text-secondary">
                            Events
                        </h1>
                        <p className="text-gray-300 max-w-xl">
                            Explore our diverse range of technical and cultural events designed to challenge and inspire.
                        </p>
                    </div>

                    <div className="flex space-x-2 mt-6 md:mt-0">
                        {['All', 'Technical', 'Cultural', 'Sports', 'Workshop'].map((cat) => (
                            <Button
                                key={cat}
                                variant={filter === cat ? "secondary" : "outline"}
                                size="sm"
                                onClick={() => setFilter(cat)}
                            >
                                {cat}
                            </Button>
                        ))}
                    </div>
                </div>

                {filteredEvents.length === 0 ? (
                    <div className="text-center py-20">
                        <p className="text-gray-400 text-xl">No events available yet. Check back soon!</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filteredEvents.map((event, index) => (
                            <motion.div
                                key={event.id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.1 }}
                            >
                                <Card className="bg-white/5 border-white/10 hover:border-secondary/50 transition-all h-full flex flex-col">
                                    {event.imageUrl && (
                                        <div className="h-48 overflow-hidden rounded-t-lg">
                                            <img
                                                src={event.imageUrl}
                                                alt={event.name}
                                                className="w-full h-full object-cover"
                                            />
                                        </div>
                                    )}
                                    <CardHeader>
                                        <div className="flex justify-between items-start">
                                            <CardTitle className="text-white">{event.name}</CardTitle>
                                            <span className="text-xs bg-secondary/20 text-secondary px-2 py-1 rounded">
                                                {event.category}
                                            </span>
                                        </div>
                                        <CardDescription className="text-gray-400">
                                            {event.description?.substring(0, 100)}...
                                        </CardDescription>
                                    </CardHeader>
                                    <CardContent className="flex-1">
                                        <div className="space-y-2 text-sm text-gray-400">
                                            {event.date && (
                                                <div className="flex items-center gap-2">
                                                    <Calendar size={16} />
                                                    {new Date(event.date).toLocaleDateString()}
                                                </div>
                                            )}
                                            {event.teamSize && (
                                                <div className="flex items-center gap-2">
                                                    <Users size={16} />
                                                    Team Size: {event.teamSize}
                                                </div>
                                            )}
                                            {event.fees !== undefined && (
                                                <div className="flex items-center gap-2">
                                                    <Trophy size={16} />
                                                    Entry Fee: ₹{event.fees}
                                                </div>
                                            )}
                                        </div>
                                    </CardContent>
                                    <CardFooter>
                                        <Link href={`/events/${event.id}`} className="w-full">
                                            <Button className="w-full bg-secondary text-black hover:bg-yellow-500">
                                                View Details
                                            </Button>
                                        </Link>
                                    </CardFooter>
                                </Card>
                            </motion.div>
                        ))}
                    </div>
                )}
            </div>

            <Footer />
        </main>
    );
}
