
"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Bed, Users, Clock, CheckCircle, Search, UserCheck } from "lucide-react";
import { motion } from "framer-motion";

interface AccommodationStats {
    totalRequests: number;
    pending: number;
    approved: number;
    checkedIn: number;
    availableBeds: number;
}

interface Request {
    id: number;
    status: string;
    paymentStatus: string;
    checkedIn: boolean;
    createdAt: string;
    user: {
        id: number;
        name: string;
        email: string;
        participantId: string;
        gender: string;
        phone: string;
    };
    assignedProperty: {
        name: string;
    } | null;
}

interface Property {
    id: number;
    name: string;
    type: string;
    gender: string;
    capacity: number;
    occupied: number;
}

export default function AccommodationCommandCenter() {
    const [stats, setStats] = useState<AccommodationStats | null>(null);
    const [requests, setRequests] = useState<Request[]>([]);
    const [properties, setProperties] = useState<Property[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedRequest, setSelectedRequest] = useState<Request | null>(null);
    const [selectedPropertyId, setSelectedPropertyId] = useState<string>("");
    const [searchTerm, setSearchTerm] = useState("");

    const refreshData = async () => {
        setLoading(true);
        try {
            const [statsRes, queueRes, propsRes] = await Promise.all([
                fetch('/api/admin/accommodation/stats'),
                fetch('/api/admin/accommodation/queue'),
                fetch('/api/admin/accommodation/properties')
            ]);

            const statsData = await statsRes.json();
            const queueData = await queueRes.json();
            const propsData = await propsRes.json();

            if (statsData.stats) setStats(statsData.stats);
            if (queueData.requests) setRequests(queueData.requests);
            if (propsData.properties) setProperties(propsData.properties);
        } catch (e) {
            console.error("Error fetching accommodation data", e);
        }
        setLoading(false);
    };

    useEffect(() => {
        refreshData();
        const interval = setInterval(refreshData, 30000); // Auto-refresh every 30s
        return () => clearInterval(interval);
    }, []);

    const handleAssign = async () => {
        if (!selectedRequest || !selectedPropertyId) return;

        try {
            const res = await fetch('/api/admin/accommodation/assign', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    requestId: selectedRequest.id,
                    propertyId: parseInt(selectedPropertyId)
                })
            });

            if (res.ok) {
                setSelectedRequest(null);
                setSelectedPropertyId("");
                refreshData();
            } else {
                alert("Assignment failed");
            }
        } catch (e) {
            console.error("Error assigning", e);
        }
    };

    // Filter properties based on selected user's gender
    const getCompatibleProperties = () => {
        if (!selectedRequest) return [];
        const userGender = selectedRequest.user.gender?.toLowerCase() || '';

        return properties.filter(p => {
            const propGender = p.gender?.toLowerCase() || 'co-ed';
            if (propGender === 'co-ed') return true;
            return propGender === userGender;
        });
    };

    const filteredRequests = requests.filter(r =>
        r.user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        r.user.participantId?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="space-y-6">
            {/* Stats Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
                <Card className="bg-blue-900/10 border-blue-500/20">
                    <CardContent className="p-4 flex flex-col items-center justify-center text-center">
                        <Users className="text-blue-400 mb-2" size={24} />
                        <div className="text-2xl font-bold text-white">{stats?.totalRequests || 0}</div>
                        <div className="text-xs text-blue-300">Total Requests</div>
                    </CardContent>
                </Card>
                <Card className="bg-yellow-900/10 border-yellow-500/20">
                    <CardContent className="p-4 flex flex-col items-center justify-center text-center">
                        <Clock className="text-yellow-400 mb-2" size={24} />
                        <div className="text-2xl font-bold text-white">{stats?.pending || 0}</div>
                        <div className="text-xs text-yellow-300">Pending Assignment</div>
                    </CardContent>
                </Card>
                <Card className="bg-green-900/10 border-green-500/20">
                    <CardContent className="p-4 flex flex-col items-center justify-center text-center">
                        <CheckCircle className="text-green-400 mb-2" size={24} />
                        <div className="text-2xl font-bold text-white">{stats?.approved || 0}</div>
                        <div className="text-xs text-green-300">Assigned</div>
                    </CardContent>
                </Card>
                <Card className="bg-purple-900/10 border-purple-500/20">
                    <CardContent className="p-4 flex flex-col items-center justify-center text-center">
                        <UserCheck className="text-purple-400 mb-2" size={24} />
                        <div className="text-2xl font-bold text-white">{stats?.checkedIn || 0}</div>
                        <div className="text-xs text-purple-300">Checked In</div>
                    </CardContent>
                </Card>
                <Card className="bg-teal-900/10 border-teal-500/20 col-span-2 md:col-span-1">
                    <CardContent className="p-4 flex flex-col items-center justify-center text-center">
                        <Bed className="text-teal-400 mb-2" size={24} />
                        <div className="text-2xl font-bold text-white">{stats?.availableBeds || 0}</div>
                        <div className="text-xs text-teal-300">Available Beds</div>
                    </CardContent>
                </Card>
            </div>

            {/* Request Queue */}
            <Card className="bg-zinc-950 border-zinc-800">
                <CardHeader className="flex flex-row items-center justify-between">
                    <div>
                        <CardTitle className="text-white">Request Queue</CardTitle>
                        <CardDescription>Manage accommodation booking requests</CardDescription>
                    </div>
                    <div className="relative w-64">
                        <Search className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-400" size={14} />
                        <Input
                            placeholder="Search Student..."
                            className="bg-zinc-900 border-zinc-800 pl-8 h-8 text-sm"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow className="border-zinc-800 hover:bg-zinc-900/50">
                                <TableHead className="text-gray-400">Student</TableHead>
                                <TableHead className="text-gray-400">Gender</TableHead>
                                <TableHead className="text-gray-400">Payment</TableHead>
                                <TableHead className="text-gray-400">Status</TableHead>
                                <TableHead className="text-gray-400">Allocation</TableHead>
                                <TableHead className="text-right text-gray-400">Action</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {loading ? (
                                <TableRow>
                                    <TableCell colSpan={6} className="text-center py-8 text-gray-500">Loading requests...</TableCell>
                                </TableRow>
                            ) : filteredRequests.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={6} className="text-center py-8 text-gray-500">No accommodation requests yet</TableCell>
                                </TableRow>
                            ) : (
                                filteredRequests.map((req) => (
                                    <TableRow key={req.id} className="border-zinc-800 hover:bg-zinc-900/50">
                                        <TableCell>
                                            <div className="font-medium text-white">{req.user.name}</div>
                                            <div className="text-xs text-gray-500">{req.user.participantId}</div>
                                        </TableCell>
                                        <TableCell>
                                            <Badge variant="outline" className="text-xs border-zinc-700 text-gray-300">
                                                {req.user.gender || 'N/A'}
                                            </Badge>
                                        </TableCell>
                                        <TableCell>
                                            {req.paymentStatus === 'paid' ? (
                                                <span className="text-green-400 text-xs font-bold flex items-center gap-1">
                                                    <CheckCircle size={10} /> Paid
                                                </span>
                                            ) : (
                                                <span className="text-yellow-400 text-xs font-bold">Pending</span>
                                            )}
                                        </TableCell>
                                        <TableCell>
                                            <Badge className={
                                                req.status === 'approved' ? "bg-green-500/20 text-green-400" :
                                                    req.status === 'pending' ? "bg-yellow-500/20 text-yellow-400" :
                                                        "bg-gray-500/20 text-gray-400"
                                            }>
                                                {req.status}
                                            </Badge>
                                        </TableCell>
                                        <TableCell>
                                            {req.assignedProperty ? (
                                                <div className="text-sm text-white">{req.assignedProperty.name}</div>
                                            ) : (
                                                <div className="text-xs text-gray-500 italic">Unassigned</div>
                                            )}
                                        </TableCell>
                                        <TableCell className="text-right">
                                            {req.status === 'pending' && req.paymentStatus === 'paid' && (
                                                <Button size="sm" onClick={() => setSelectedRequest(req)} className="bg-blue-600 hover:bg-blue-700 h-7 text-xs">
                                                    Assign Room
                                                </Button>
                                            )}
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>

            {/* Assignment Modal */}
            <Dialog open={!!selectedRequest} onOpenChange={(o) => { if (!o) setSelectedRequest(null); }}>
                <DialogContent className="bg-zinc-950 text-white border-zinc-800">
                    <DialogHeader>
                        <DialogTitle>Assign Accommodation</DialogTitle>
                        <CardDescription>
                            Assign a bed for {selectedRequest?.user.name} ({selectedRequest?.user.gender})
                        </CardDescription>
                    </DialogHeader>

                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <label className="text-sm text-gray-400">Select PG / Hostel</label>
                            <Select value={selectedPropertyId} onValueChange={setSelectedPropertyId}>
                                <SelectTrigger className="bg-zinc-900 border-zinc-800">
                                    <SelectValue placeholder="Choose Property" />
                                </SelectTrigger>
                                <SelectContent>
                                    {getCompatibleProperties().map(p => (
                                        <SelectItem key={p.id} value={p.id.toString()} disabled={(p.capacity - p.occupied) <= 0}>
                                            {p.name} ({p.capacity - p.occupied} beds left)
                                        </SelectItem>
                                    ))}
                                    {getCompatibleProperties().length === 0 && (
                                        <SelectItem value="none" disabled>No compatible properties found</SelectItem>
                                    )}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    <DialogFooter>
                        <Button variant="ghost" onClick={() => setSelectedRequest(null)}>Cancel</Button>
                        <Button onClick={handleAssign} disabled={!selectedPropertyId} className="bg-green-600 hover:bg-green-700">
                            Confirm Assignment
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
