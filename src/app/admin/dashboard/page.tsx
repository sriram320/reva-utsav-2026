"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Navbar } from "@/components/layout/Navbar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Search, Loader2, Home, CheckCircle, XCircle } from "lucide-react";

export default function AdminDashboard() {
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [users, setUsers] = useState<any[]>([]);
    const [filteredUsers, setFilteredUsers] = useState<any[]>([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [accommodationEnabled, setAccommodationEnabled] = useState(false);
    const [actionLoading, setActionLoading] = useState<string | null>(null);

    useEffect(() => {
        fetchData();
    }, []);

    useEffect(() => {
        if (!searchTerm) {
            setFilteredUsers(users);
            return;
        }
        const lowerTerm = searchTerm.toLowerCase();
        const filtered = users.filter(u =>
            u.name?.toLowerCase().includes(lowerTerm) ||
            u.email?.toLowerCase().includes(lowerTerm) ||
            u.pass?.passId?.toLowerCase().includes(lowerTerm)
        );
        setFilteredUsers(filtered);
    }, [searchTerm, users]);

    const fetchData = async () => {
        try {
            // Fetch users
            const usersRes = await fetch("/api/admin/users");
            if (usersRes.status === 403 || usersRes.status === 401) {
                router.push("/login"); // Or show unauthorized
                return;
            }
            const usersData = await usersRes.json();
            setUsers(usersData.users || []);
            setFilteredUsers(usersData.users || []);

            // Fetch settings
            const settingsRes = await fetch("/api/admin/settings");
            const settingsData = await settingsRes.json();
            setAccommodationEnabled(settingsData.accommodation_open === 'true');

        } catch (error) {
            console.error("Failed to fetch admin data", error);
        } finally {
            setLoading(false);
        }
    };

    const toggleAccommodation = async () => {
        const newValue = !accommodationEnabled;
        setAccommodationEnabled(newValue);
        try {
            await fetch("/api/admin/settings", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ key: "accommodation_open", value: String(newValue) })
            });
        } catch (error) {
            console.error("Failed to save setting");
            setAccommodationEnabled(!newValue); // Revert on error
        }
    };

    const allotRoom = async (userId: number, room: string) => {
        setActionLoading(`${userId}-allot`);
        try {
            await fetch(`/api/admin/users/${userId}/accommodation`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ roomAllotted: room, status: 'approved' })
            });
            // Refresh data (opt: simpler to just update local state)
            fetchData();
        } finally {
            setActionLoading(null);
        }
    };

    const toggleCheckIn = async (userId: number, currentStatus: boolean) => {
        setActionLoading(`${userId}-checkin`);
        try {
            await fetch(`/api/admin/users/${userId}/accommodation`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ checkedIn: !currentStatus })
            });
            fetchData();
        } finally {
            setActionLoading(null);
        }
    };

    if (loading) {
        return (
            <main className="min-h-screen bg-black text-white flex items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-secondary" />
            </main>
        );
    }

    return (
        <main className="min-h-screen bg-black text-white relative overflow-hidden flex flex-col">
            <Navbar />

            <div className="container mx-auto px-4 py-24 flex-1">
                <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
                    <div>
                        <h1 className="text-3xl font-orbitron font-bold">Admin Dashboard</h1>
                        <p className="text-gray-400">Manage registrations, accommodation, and check-ins</p>
                    </div>

                    <Card className="bg-zinc-900 border-zinc-800 p-4 flex items-center gap-4">
                        <span className="text-sm font-medium">Accommodation Booking:</span>
                        <div className="flex items-center gap-2">
                            <span className={accommodationEnabled ? "text-green-500" : "text-gray-500"}>
                                {accommodationEnabled ? "ON" : "OFF"}
                            </span>
                            <Switch
                                checked={accommodationEnabled}
                                onCheckedChange={toggleAccommodation}
                            />
                        </div>
                    </Card>
                </div>

                {/* Search */}
                <div className="mb-6">
                    <div className="relative max-w-md">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
                        <Input
                            placeholder="Search by name, email, or Pass ID..."
                            className="bg-zinc-900 border-zinc-800 pl-10"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>

                {/* Users Table */}
                <Card className="bg-zinc-900 border-zinc-800 overflow-hidden">
                    <CardHeader>
                        <CardTitle className="text-lg">Registered Users ({filteredUsers.length})</CardTitle>
                    </CardHeader>
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left">
                            <thead className="text-xs text-gray-400 uppercase bg-zinc-950/50">
                                <tr>
                                    <th className="px-6 py-3">User</th>
                                    <th className="px-6 py-3">Contact</th>
                                    <th className="px-6 py-3">Pass / Events</th>
                                    <th className="px-6 py-3">Accommodation</th>
                                    <th className="px-6 py-3">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredUsers.map((user) => (
                                    <tr key={user.id} className="border-b border-zinc-800 hover:bg-zinc-800/50">
                                        <td className="px-6 py-4 font-medium">
                                            <div>{user.name}</div>
                                            <div className="text-gray-500 text-xs">{user.college}</div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div>{user.email}</div>
                                            <div className="text-gray-500 text-xs">{user.phone || '-'}</div>
                                            <div className="text-gray-500 text-xs">{user.state ? `${user.city || user.district}, ${user.state}` : ''}</div>
                                        </td>
                                        <td className="px-6 py-4">
                                            {user.pass ? (
                                                <div className="text-green-400 font-mono text-xs">{user.pass.passId}</div>
                                            ) : (
                                                <div className="text-gray-500 text-xs">No Pass</div>
                                            )}
                                            <div className="text-xs text-gray-400 mt-1">{user.registrationCount} events</div>
                                        </td>
                                        <td className="px-6 py-4">
                                            {user.accommodation ? (
                                                <div className="space-y-2">
                                                    <div className="flex items-center gap-2">
                                                        <input
                                                            type="text"
                                                            placeholder="Room No."
                                                            className="w-20 bg-zinc-950 border-zinc-700 text-xs p-1 rounded"
                                                            defaultValue={user.accommodation.roomAllotted}
                                                            onKeyDown={(e) => {
                                                                if (e.key === 'Enter') {
                                                                    allotRoom(user.id, e.currentTarget.value)
                                                                }
                                                            }}
                                                        />
                                                        {actionLoading === `${user.id}-allot` && <Loader2 className="w-3 h-3 animate-spin" />}
                                                    </div>
                                                    <div className="text-xs text-gray-500">
                                                        Status: {user.accommodation.status}
                                                    </div>
                                                </div>
                                            ) : (
                                                <Button
                                                    variant="secondary"
                                                    size="sm"
                                                    className="h-6 text-xs bg-zinc-800"
                                                    onClick={() => allotRoom(user.id, "Pending")}
                                                >
                                                    Enable
                                                </Button>
                                            )}
                                        </td>
                                        <td className="px-6 py-4">
                                            {user.accommodation && (
                                                <Button
                                                    variant={user.accommodation.checkedIn ? "primary" : "outline"}
                                                    size="sm"
                                                    className={`h-8 text-xs ${user.accommodation.checkedIn ? 'bg-green-600 hover:bg-green-700' : ''}`}
                                                    onClick={() => toggleCheckIn(user.id, user.accommodation.checkedIn)}
                                                    disabled={actionLoading === `${user.id}-checkin`}
                                                >
                                                    {actionLoading === `${user.id}-checkin` ? (
                                                        <Loader2 className="w-3 h-3 animate-spin" />
                                                    ) : user.accommodation.checkedIn ? (
                                                        <>Checked In <CheckCircle className="w-3 h-3 ml-1" /></>
                                                    ) : (
                                                        "Check In"
                                                    )}
                                                </Button>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </Card>
            </div>
        </main>
    );
}
