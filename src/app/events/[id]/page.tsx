"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar, MapPin, Users, Trophy, Clock } from "lucide-react";

export default function EventDetailPage() {
    const params = useParams();
    const router = useRouter();
    const [event, setEvent] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const [user, setUser] = useState<any>(null);

    useEffect(() => {
        if (params.id) {
            fetchEvent(params.id as string);
            checkAuth();
        }
    }, [params.id]);

    const checkAuth = async () => {
        try {
            const res = await fetch('/api/auth/me');
            if (res.ok) {
                const data = await res.json();
                setUser(data.user);
            }
        } catch (e) { console.error("Auth check failed", e); }
    };

    const fetchEvent = async (id: string) => {
        try {
            const res = await fetch(`/api/events/${id}`);
            const data = await res.json();
            setEvent(data.event);
        } catch (error) {
            console.error('Error fetching event:', error);
        }
        setLoading(false);
    };

    if (loading) {
        return (
            <main className="min-h-screen bg-black text-white flex items-center justify-center">
                <Navbar />
                <div>Loading event details...</div>
            </main>
        );
    }

    if (!event) {
        return (
            <main className="min-h-screen bg-black text-white flex flex-col items-center justify-center">
                <Navbar />
                <div className="text-center">
                    <h1 className="text-4xl font-bold mb-4">Event Not Found</h1>
                    <Button onClick={() => router.push('/events')}>Back to Events</Button>
                </div>
            </main>
        );
    }

    return (
        <main className="min-h-screen bg-black text-white relative overflow-hidden">
            <Navbar />

            <div className="container mx-auto px-4 py-24">
                <div className="max-w-4xl mx-auto">
                    {event.imageUrl && (
                        <div className="h-96 overflow-hidden rounded-xl mb-8">
                            <img
                                src={event.imageUrl}
                                alt={event.name}
                                className="w-full h-full object-cover"
                            />
                        </div>
                    )}

                    <div className="flex justify-between items-start mb-6">
                        <div>
                            <h1 className="text-5xl md:text-7xl font-black font-orbitron text-secondary mb-6">
                                {event.name}
                            </h1>
                            <span className="bg-secondary/20 text-secondary px-4 py-2 rounded-full text-sm font-medium">
                                {event.category}
                            </span>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
                        {event.date && (
                            <Card className="bg-white/5 border-white/10">
                                <CardContent className="flex items-center gap-3 p-4">
                                    <Calendar className="text-secondary" size={24} />
                                    <div>
                                        <div className="text-sm text-gray-400">Date</div>
                                        <div className="font-medium">{new Date(event.date).toLocaleDateString()}</div>
                                    </div>
                                </CardContent>
                            </Card>
                        )}

                        {event.venue && (
                            <Card className="bg-white/5 border-white/10">
                                <CardContent className="flex items-center gap-3 p-4">
                                    <MapPin className="text-secondary" size={24} />
                                    <div>
                                        <div className="text-sm text-gray-400">Venue</div>
                                        <div className="font-medium">{event.venue}</div>
                                    </div>
                                </CardContent>
                            </Card>
                        )}

                        {event.teamSize && (
                            <Card className="bg-white/5 border-white/10">
                                <CardContent className="flex items-center gap-3 p-4">
                                    <Users className="text-secondary" size={24} />
                                    <div>
                                        <div className="text-sm text-gray-400">Team Size</div>
                                        <div className="font-medium">{event.teamSize} {event.teamSize === 1 ? 'Person' : 'People'}</div>
                                    </div>
                                </CardContent>
                            </Card>
                        )}

                        {event.fees !== undefined && (
                            <Card className="bg-white/5 border-white/10">
                                <CardContent className="flex items-center gap-3 p-4">
                                    <Trophy className="text-secondary" size={24} />
                                    <div>
                                        <div className="text-sm text-gray-400">Entry Fee</div>
                                        <div className="font-medium">₹{event.fees}</div>
                                    </div>
                                </CardContent>
                            </Card>
                        )}
                    </div>

                    <Card className="bg-white/5 border-white/10 mb-8">
                        <CardHeader>
                            <CardTitle className="text-white">About This Event</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-gray-300 leading-relaxed">
                                {event.description || 'No description available.'}
                            </p>
                        </CardContent>
                    </Card>

                    {event.rules && Array.isArray(event.rules) && event.rules.length > 0 && (
                        <Card className="bg-secondary/10 border-secondary/30 mb-8">
                            <CardHeader>
                                <CardTitle className="text-secondary font-orbitron">Rules & Guidelines</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <ul className="space-y-2">
                                    {event.rules.map((rule: string, index: number) => (
                                        <li key={index} className="flex items-start gap-2 text-gray-300">
                                            <span className="text-secondary mt-1">•</span>
                                            <span>{rule}</span>
                                        </li>
                                    ))}
                                </ul>
                            </CardContent>
                        </Card>
                    )}

                    {event.coordinators && Array.isArray(event.coordinators) && event.coordinators.length > 0 && (
                        <Card className="bg-white/5 border-white/10 mb-8">
                            <CardHeader>
                                <CardTitle className="text-white">Event Coordinators</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-3">
                                    {event.coordinators.map((coordinator: any, index: number) => (
                                        <div key={index} className="flex items-center justify-between p-3 bg-zinc-900 rounded-lg">
                                            <div>
                                                <div className="font-medium text-white">{coordinator.name}</div>
                                                <div className="text-sm text-gray-400">{coordinator.phone}</div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    )}

                    <div className="flex gap-4">
                        <Button
                            onClick={() => {
                                if (!user) router.push('/login?redirect=/events/' + event.id);
                                else router.push(`/events/${event.id}/register`);
                            }}
                            className="flex-1 bg-secondary text-black hover:bg-yellow-500 py-6 text-lg font-bold"
                        >
                            {user ? "Register Now" : "Login to Register"}
                        </Button>
                        <Button
                            variant="outline"
                            onClick={() => router.push('/events')}
                            className="border-secondary text-secondary hover:bg-secondary hover:text-black py-6"
                        >
                            Back to Events
                        </Button>
                    </div>
                </div>
            </div>

            <Footer />
        </main>
    );
}
