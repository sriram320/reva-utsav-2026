"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Trash2, Eye, Trophy, X, Upload, UserPlus, Calendar, MapPin, Users, IndianRupee } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";

interface EventCoordinator {
    name: string;
    phone: string;
}

interface Event {
    id: number;
    name: string;
    category: string;
    description: string | null;
    rules: string[] | any; // Handle potential jsonb parsing variations
    imageUrl: string | null;
    date: string | null;
    venue: string | null;
    teamSize: number;
    fees: number;
    coordinators: EventCoordinator[] | any;
}

// Form state separate from display entity for convenience (splitting date/time)
interface NewEventForm {
    name: string;
    category: string;
    date: string;
    time: string;
    venue: string;
    fees: number;
    teamSize: string; // Input as string for easier handling
    description: string;
    rules: string[];
    coordinators: EventCoordinator[];
    imageUrl: string;
}

export default function AdminEventsPage() {
    const [events, setEvents] = useState<Event[]>([]);
    const [loading, setLoading] = useState(true);
    const [isAddOpen, setIsAddOpen] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [editingEvent, setEditingEvent] = useState<Event | null>(null);

    // Participants View State
    const [viewingParticipants, setViewingParticipants] = useState<Event | null>(null);
    const [participants, setParticipants] = useState<any[]>([]);
    const [loadingParticipants, setLoadingParticipants] = useState(false);

    const [newEvent, setNewEvent] = useState<NewEventForm>({
        name: "",
        category: "Technical",
        date: "",
        time: "",
        venue: "",
        fees: 0,
        teamSize: "1",
        description: "",
        rules: [""],
        coordinators: [{ name: "", phone: "" }],
        imageUrl: "",
    });

    useEffect(() => {
        fetchEvents();
    }, []);

    const fetchEvents = async () => {
        try {
            const res = await fetch('/api/admin/events');
            if (!res.ok) throw new Error('Failed to fetch events');
            const data = await res.json();
            setEvents(data.events || []);
        } catch (error) {
            console.error(error);
            toast.error("Failed to load events");
        } finally {
            setLoading(false);
        }
    };

    const fetchParticipants = async (eventId: number) => {
        setLoadingParticipants(true);
        try {
            const res = await fetch(`/api/admin/events/${eventId}/registrations`);
            if (!res.ok) throw new Error('Failed to fetch participants');
            const data = await res.json();
            setParticipants(data.registrations || []);
        } catch (error) {
            console.error(error);
            toast.error("Failed to load participants");
        } finally {
            setLoadingParticipants(false);
        }
    };

    const handleOpenEdit = (event: Event) => {
        setEditingEvent(event);

        // Parse date and time from ISO string
        let dateStr = "";
        let timeStr = "";
        if (event.date) {
            const d = new Date(event.date);
            dateStr = d.toISOString().split('T')[0];
            timeStr = d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false });
        }

        setNewEvent({
            name: event.name,
            category: event.category,
            date: dateStr,
            time: timeStr,
            venue: event.venue || "",
            fees: event.fees,
            teamSize: event.teamSize.toString(),
            description: event.description || "",
            rules: Array.isArray(event.rules) && event.rules.length > 0 ? event.rules : [""],
            coordinators: Array.isArray(event.coordinators) && event.coordinators.length > 0 ? event.coordinators : [{ name: "", phone: "" }],
            imageUrl: event.imageUrl || "",
        });
        setIsAddOpen(true);
    };

    const handleAddOrUpdateEvent = async () => {
        if (!newEvent.name || !newEvent.date || !newEvent.venue || !newEvent.category) {
            toast.error("Please fill in required fields");
            return;
        }

        setSubmitting(true);
        try {
            // Combine date and time
            const dateObj = new Date(`${newEvent.date}T${newEvent.time || '00:00'}`);

            const payload = {
                ...newEvent,
                date: dateObj.toISOString(),
                teamSize: parseInt(newEvent.teamSize) || 1,
                rules: newEvent.rules.filter(r => r.trim() !== ""),
                coordinators: newEvent.coordinators.filter(c => c.name.trim() !== ""),
            };

            let res;
            if (editingEvent) {
                // Update existing event
                res = await fetch('/api/admin/events', {
                    method: 'PATCH',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ id: editingEvent.id, ...payload })
                });
            } else {
                // Create new event
                res = await fetch('/api/admin/events', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(payload)
                });
            }

            if (!res.ok) throw new Error(editingEvent ? 'Failed to update event' : 'Failed to create event');

            toast.success(editingEvent ? "Event updated successfully" : "Event created successfully");
            setIsAddOpen(false);
            setEditingEvent(null);
            fetchEvents(); // Refresh list

            // Reset form
            setNewEvent({
                name: "",
                category: "Technical",
                date: "",
                time: "",
                venue: "",
                fees: 0,
                teamSize: "1",
                description: "",
                rules: [""],
                coordinators: [{ name: "", phone: "" }],
                imageUrl: "",
            });
        } catch (error) {
            console.error(error);
            toast.error(editingEvent ? "Failed to update event" : "Failed to create event");
        } finally {
            setSubmitting(false);
        }
    };

    const deleteEvent = async (id: number) => {
        if (!confirm("Are you sure you want to delete this event? This action cannot be undone.")) return;

        try {
            const res = await fetch(`/api/admin/events?id=${id}`, {
                method: 'DELETE',
            });

            if (!res.ok) throw new Error('Failed to delete event');

            toast.success("Event deleted");
            setEvents(events.filter(e => e.id !== id));
        } catch (error) {
            console.error(error);
            toast.error("Failed to delete event");
        }
    };

    // Helper functions for form
    const addRule = () => setNewEvent({ ...newEvent, rules: [...newEvent.rules, ""] });
    const updateRule = (index: number, value: string) => {
        const updated = [...newEvent.rules];
        updated[index] = value;
        setNewEvent({ ...newEvent, rules: updated });
    };
    const removeRule = (index: number) => setNewEvent({ ...newEvent, rules: newEvent.rules.filter((_, i) => i !== index) });

    const addCoordinator = () => setNewEvent({ ...newEvent, coordinators: [...newEvent.coordinators, { name: "", phone: "" }] });
    const updateCoordinator = (index: number, field: 'name' | 'phone', value: string) => {
        const updated = [...newEvent.coordinators];
        updated[index][field] = value;
        setNewEvent({ ...newEvent, coordinators: updated });
    };
    const removeCoordinator = (index: number) => setNewEvent({ ...newEvent, coordinators: newEvent.coordinators.filter((_, i) => i !== index) });

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold text-white">Event Management</h1>
                    <p className="text-gray-400">Create and manage events for REVA Utsav</p>
                </div>
                <Button onClick={() => {
                    setEditingEvent(null);
                    setNewEvent({
                        name: "",
                        category: "Technical",
                        date: "",
                        time: "",
                        venue: "",
                        fees: 0,
                        teamSize: "1",
                        description: "",
                        rules: [""],
                        coordinators: [{ name: "", phone: "" }],
                        imageUrl: "",
                    });
                    setIsAddOpen(true);
                }} className="bg-secondary hover:bg-secondary/90 text-black font-semibold">
                    <Plus className="mr-2" size={16} /> Create Event
                </Button>
            </div>

            {/* Add/Edit Event Modal */}
            {isAddOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-200">
                    <div className="w-full max-w-4xl max-h-[90vh] bg-[#0a0a0a] border border-white/10 rounded-xl flex flex-col shadow-2xl">
                        <div className="p-6 border-b border-white/10 flex-shrink-0 flex justify-between items-center">
                            <div>
                                <h2 className="text-2xl font-bold text-white">{editingEvent ? 'Edit Event' : 'Create New Event'}</h2>
                                <p className="text-sm text-gray-400">{editingEvent ? 'Update event details' : 'Fill in all event details'}</p>
                            </div>
                            <Button variant="ghost" onClick={() => setIsAddOpen(false)}>
                                <X size={24} />
                            </Button>
                        </div>
                        <div className="p-6 space-y-6 overflow-y-auto min-h-0 flex-1">
                            {/* Basic Details */}
                            <div className="space-y-4">
                                <h3 className="text-lg font-semibold text-white">Basic Information</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="md:col-span-2">
                                        <label className="text-sm text-gray-400">Event Name *</label>
                                        <Input
                                            value={newEvent.name}
                                            onChange={(e) => setNewEvent({ ...newEvent, name: e.target.value })}
                                            placeholder="e.g. RoboWars 2026"
                                            className="bg-white/5 border-white/10"
                                        />
                                    </div>
                                    <div>
                                        <label className="text-sm text-gray-400">Category *</label>
                                        <select
                                            value={newEvent.category}
                                            onChange={(e) => setNewEvent({ ...newEvent, category: e.target.value })}
                                            className="w-full p-2.5 rounded-md bg-white/5 border border-white/10 text-white focus:outline-none focus:ring-2 focus:ring-secondary/50"
                                        >
                                            <option value="Technical" className="bg-black">Technical</option>
                                            <option value="Cultural" className="bg-black">Cultural</option>
                                            <option value="Sports" className="bg-black">Sports</option>
                                            <option value="Workshop" className="bg-black">Workshop</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="text-sm text-gray-400">Venue *</label>
                                        <Input
                                            value={newEvent.venue}
                                            onChange={(e) => setNewEvent({ ...newEvent, venue: e.target.value })}
                                            placeholder="e.g. Main Auditorium"
                                            className="bg-white/5 border-white/10"
                                        />
                                    </div>
                                    <div>
                                        <label className="text-sm text-gray-400">Date *</label>
                                        <Input
                                            type="date"
                                            value={newEvent.date}
                                            onChange={(e) => setNewEvent({ ...newEvent, date: e.target.value })}
                                            className="bg-white/5 border-white/10"
                                        />
                                    </div>
                                    <div>
                                        <label className="text-sm text-gray-400">Time</label>
                                        <Input
                                            type="time"
                                            value={newEvent.time}
                                            onChange={(e) => setNewEvent({ ...newEvent, time: e.target.value })}
                                            className="bg-white/5 border-white/10"
                                        />
                                    </div>

                                    <div>
                                        <label className="text-sm text-gray-400">Entry Fee (₹)</label>
                                        <Input
                                            type="number"
                                            value={newEvent.fees}
                                            onChange={(e) => setNewEvent({ ...newEvent, fees: parseInt(e.target.value) || 0 })}
                                            placeholder="0"
                                            className="bg-white/5 border-white/10"
                                        />
                                    </div>
                                    <div>
                                        <label className="text-sm text-gray-400">Team Size</label>
                                        <Input
                                            value={newEvent.teamSize}
                                            onChange={(e) => setNewEvent({ ...newEvent, teamSize: e.target.value })}
                                            placeholder="e.g. 1 or 4"
                                            className="bg-white/5 border-white/10"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Description */}
                            <div>
                                <label className="text-sm text-gray-400">Description</label>
                                <textarea
                                    value={newEvent.description}
                                    onChange={(e) => setNewEvent({ ...newEvent, description: e.target.value })}
                                    placeholder="Detailed event description"
                                    className="w-full p-3 rounded-md bg-white/5 border border-white/10 text-white min-h-[100px] focus:outline-none focus:ring-1 focus:ring-secondary/50"
                                />
                            </div>

                            {/* Rules */}
                            <div className="space-y-3">
                                <div className="flex justify-between items-center">
                                    <label className="text-sm text-gray-400">Rules & Regulations</label>
                                    <Button onClick={addRule} size="sm" variant="outline" className="h-7 text-xs">
                                        <Plus size={12} className="mr-1" /> Add Rule
                                    </Button>
                                </div>
                                {newEvent.rules.map((rule, index) => (
                                    <div key={index} className="flex gap-2">
                                        <Input
                                            value={rule}
                                            onChange={(e) => updateRule(index, e.target.value)}
                                            placeholder={`Rule ${index + 1}`}
                                            className="bg-white/5 border-white/10"
                                        />
                                        {newEvent.rules.length > 1 && (
                                            <Button onClick={() => removeRule(index)} size="icon" variant="ghost" className="text-red-400 hover:text-red-300 hover:bg-red-900/20">
                                                <Trash2 size={16} />
                                            </Button>
                                        )}
                                    </div>
                                ))}
                            </div>

                            {/* Coordinators */}
                            <div className="space-y-3">
                                <div className="flex justify-between items-center">
                                    <label className="text-sm text-gray-400">Event Coordinators</label>
                                    <Button onClick={addCoordinator} size="sm" variant="outline" className="h-7 text-xs">
                                        <UserPlus size={12} className="mr-1" /> Add Coordinator
                                    </Button>
                                </div>
                                {newEvent.coordinators.map((coord, index) => (
                                    <div key={index} className="flex gap-2">
                                        <Input
                                            value={coord.name}
                                            onChange={(e) => updateCoordinator(index, 'name', e.target.value)}
                                            placeholder="Name"
                                            className="bg-white/5 border-white/10 flex-1"
                                        />
                                        <Input
                                            value={coord.phone}
                                            onChange={(e) => updateCoordinator(index, 'phone', e.target.value)}
                                            placeholder="Phone"
                                            className="bg-white/5 border-white/10 flex-1"
                                        />
                                        {newEvent.coordinators.length > 1 && (
                                            <Button onClick={() => removeCoordinator(index)} size="icon" variant="ghost" className="text-red-400 hover:text-red-300 hover:bg-red-900/20">
                                                <Trash2 size={16} />
                                            </Button>
                                        )}
                                    </div>
                                ))}
                            </div>

                            {/* Image Upload */}
                            <div>
                                <label className="text-sm text-gray-400">Event Image URL</label>
                                <div className="flex gap-2">
                                    <Input
                                        value={newEvent.imageUrl}
                                        onChange={(e) => setNewEvent({ ...newEvent, imageUrl: e.target.value })}
                                        placeholder="https://example.com/image.jpg"
                                        className="bg-white/5 border-white/10"
                                    />
                                </div>
                            </div>

                            {/* Actions */}
                            <div className="flex justify-end gap-3 pt-4 border-t border-white/10">
                                <Button onClick={() => setIsAddOpen(false)} variant="ghost" disabled={submitting}>
                                    Cancel
                                </Button>
                                <Button onClick={handleAddOrUpdateEvent} className="bg-secondary hover:bg-secondary/90 text-black" disabled={submitting}>
                                    {submitting ? 'Saving...' : (editingEvent ? 'Update Event' : 'Create Event')}
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* View Participants Modal */}
            {viewingParticipants && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-200">
                    <div className="w-full max-w-4xl max-h-[90vh] bg-[#0a0a0a] border border-white/10 rounded-xl flex flex-col shadow-2xl">
                        <div className="p-6 border-b border-white/10 flex-shrink-0 flex justify-between items-center">
                            <div>
                                <h2 className="text-2xl font-bold text-white">Event Participants</h2>
                                <p className="text-sm text-gray-400">{viewingParticipants.name}</p>
                            </div>
                            <Button variant="ghost" onClick={() => setViewingParticipants(null)}>
                                <X size={24} />
                            </Button>
                        </div>
                        <div className="p-6 flex-1 overflow-auto">
                            {loadingParticipants ? (
                                <div className="text-center py-10 text-gray-500">Loading participants...</div>
                            ) : participants.length === 0 ? (
                                <div className="text-center py-10 text-gray-500">No participants registered yet.</div>
                            ) : (
                                <table className="w-full text-left text-sm text-gray-400">
                                    <thead className="text-xs uppercase bg-white/5 text-gray-300">
                                        <tr>
                                            <th className="px-4 py-3 rounded-tl-lg">Name</th>
                                            <th className="px-4 py-3">SRN</th>
                                            <th className="px-4 py-3">Phone</th>
                                            <th className="px-4 py-3">Status</th>
                                            <th className="px-4 py-3 rounded-tr-lg">Registered At</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-white/5">
                                        {participants.map((p) => (
                                            <tr key={p.id} className="hover:bg-white/5 transition-colors">
                                                <td className="px-4 py-3 font-medium text-white">{p.user?.name || "Unknown"}</td>
                                                <td className="px-4 py-3">{p.user?.srn || "-"}</td>
                                                <td className="px-4 py-3">{p.user?.phone || "-"}</td>
                                                <td className="px-4 py-3">
                                                    <span className={`px-2 py-0.5 rounded text-xs ${p.status === 'paid' ? 'bg-green-500/10 text-green-400' : 'bg-yellow-500/10 text-yellow-400'}`}>
                                                        {p.status}
                                                    </span>
                                                </td>
                                                <td className="px-4 py-3">
                                                    {new Date(p.registeredAt).toLocaleDateString()}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* Events List */}
            {loading ? (
                <div className="text-center py-20 text-gray-500">Loading events...</div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {events.map((event) => (
                        <Card
                            key={event.id}
                            className="bg-white/5 border-white/10 hover:border-secondary/50 transition-colors group relative flex flex-col h-full"
                        >
                            <CardHeader className="flex flex-row items-start justify-between pb-2">
                                <div className="space-y-1">
                                    <span className={`text-xs px-2 py-0.5 rounded border ${event.category === 'Technical' ? 'bg-blue-500/10 border-blue-500/20 text-blue-400' :
                                        event.category === 'Cultural' ? 'bg-purple-500/10 border-purple-500/20 text-purple-400' :
                                            'bg-gray-500/10 border-gray-500/20 text-gray-400'
                                        }`}>
                                        {event.category}
                                    </span>
                                    <CardTitle className="text-xl font-bold text-white pt-2 leading-tight">{event.name}</CardTitle>
                                </div>
                                <div className="flex gap-1 -mr-2 -mt-2">
                                    <Button
                                        size="icon"
                                        variant="ghost"
                                        onClick={() => handleOpenEdit(event)}
                                        className="text-gray-500 hover:text-secondary hover:bg-secondary/10"
                                    >
                                        <Plus className="rotate-45" size={16} /> {/* Using rotated Plus as edit icon since strict mode might complain about new icon imports not present. But wait, I can import Edit2. I'll just use text or existing icons if needed. But I can import icons. Let's stick to what we have or add more. */}
                                    </Button>
                                    <Button
                                        size="icon"
                                        variant="ghost"
                                        className="text-gray-500 hover:text-red-400 hover:bg-red-900/20"
                                        onClick={() => deleteEvent(event.id)}
                                    >
                                        <Trash2 size={16} />
                                    </Button>
                                </div>
                            </CardHeader>
                            <CardContent className="space-y-3 flex-1">
                                <div className="space-y-2 text-sm text-gray-400">
                                    {event.date && (
                                        <div className="flex items-center gap-2">
                                            <Calendar size={14} className="text-secondary/70" />
                                            <span>{new Date(event.date).toLocaleDateString()} {new Date(event.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                        </div>
                                    )}
                                    {event.venue && (
                                        <div className="flex items-center gap-2">
                                            <MapPin size={14} className="text-secondary/70" />
                                            <span>{event.venue}</span>
                                        </div>
                                    )}
                                    <div className="flex items-center gap-2">
                                        <Users size={14} className="text-secondary/70" />
                                        <span>Team: {event.teamSize}</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <IndianRupee size={14} className="text-secondary/70" />
                                        <span>{event.fees === 0 ? 'Free' : `₹${event.fees}`}</span>
                                    </div>
                                </div>
                            </CardContent>
                            <CardFooter className="pt-2 border-t border-white/5 flex gap-2">
                                <Button
                                    size="sm"
                                    variant="outline"
                                    className="flex-1 bg-white/5 hover:bg-white/10 border-white/10 hover:text-white"
                                    onClick={() => {
                                        setViewingParticipants(event);
                                        fetchParticipants(event.id);
                                    }}
                                >
                                    <Users size={14} className="mr-2" /> Participants
                                </Button>
                                <Link href={`/events/${event.id}`} className="flex-1">
                                    <Button size="sm" variant="outline" className="w-full bg-white/5 hover:bg-white/10 border-white/10 hover:text-white">
                                        <Eye size={14} className="mr-2" /> View Page
                                    </Button>
                                </Link>
                            </CardFooter>
                        </Card>
                    ))}
                    {events.length === 0 && (
                        <div className="col-span-full text-center py-20 text-gray-500 border border-dashed border-white/10 rounded-xl bg-white/5">
                            <Trophy size={48} className="mx-auto mb-4 opacity-20" />
                            <p>No events created yet.</p>
                            <Button variant="ghost" onClick={() => setIsAddOpen(true)} className="text-secondary">
                                Create your first event
                            </Button>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
