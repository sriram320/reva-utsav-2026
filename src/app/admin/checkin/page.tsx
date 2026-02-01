"use client";

import { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Search, QrCode, UserCheck, CheckCircle2, XCircle, AlertTriangle } from "lucide-react";

interface Participant {
    id: number;
    participantId: string;
    name: string;
    email: string;
    college: string | null;
    phone: string | null;
    verified: boolean;
    srn: string | null;
    department: string | null;
    passes: Array<{
        id: number;
        passType: string;
        status: string;
        checkedIn: boolean; // Added schema support
    }>;
}

export default function CheckInDesk() {
    const [participants, setParticipants] = useState<Participant[]>([]);
    const [filteredParticipants, setFilteredParticipants] = useState<Participant[]>([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [loading, setLoading] = useState(true);
    const [scanMode, setScanMode] = useState(false);
    const [lastAction, setLastAction] = useState<{ type: 'success' | 'error', message: string } | null>(null);

    const searchInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        fetchParticipants();
    }, []);

    // Fetch participants logic
    const fetchParticipants = async () => {
        setLoading(true);
        try {
            // Using existing participants API, assume it returns passes with checkedIn status now
            // Note: We need to update the GET /api/admin/participants to include passes.checkedIn
            const res = await fetch("/api/admin/participants");
            const data = await res.json();
            setParticipants(data.participants || []);
            setFilteredParticipants(data.participants || []);
        } catch (error) {
            console.error("Error fetching participants:", error);
        }
        setLoading(false);
    };

    // Filter logic
    useEffect(() => {
        const term = searchTerm.toLowerCase();
        const filtered = participants.filter(p =>
            p.name.toLowerCase().includes(term) ||
            p.email.toLowerCase().includes(term) ||
            p.participantId.toLowerCase().includes(term) ||
            (p.srn && p.srn.toLowerCase().includes(term)) ||
            (p.passes.some(pass => pass.passType.toLowerCase().includes(term)))
        );
        setFilteredParticipants(filtered);
    }, [searchTerm, participants]);

    const handleCheckIn = async (passId: number, currentStatus: boolean) => {
        if (currentStatus) return; // Already checked in

        try {
            const res = await fetch("/api/admin/checkin", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ passId })
            });

            if (res.ok) {
                setLastAction({ type: "success", message: "Check-in Successful!" });
                // Optimistic update
                setParticipants(prev => prev.map(p => ({
                    ...p,
                    passes: p.passes.map(pass => pass.id === passId ? { ...pass, checkedIn: true } : pass)
                })));
            } else {
                setLastAction({ type: "error", message: "Check-in Failed. Try again." });
            }
        } catch (error) {
            setLastAction({ type: "error", message: "Network Error" });
        }
    };

    // Simulate Scan Mode focus
    useEffect(() => {
        if (scanMode && searchInputRef.current) {
            searchInputRef.current.focus();
        }
    }, [scanMode]);

    return (
        <div className="min-h-screen bg-black text-white p-8">
            <div className="max-w-7xl mx-auto space-y-6">
                <div className="flex justify-between items-center">
                    <div>
                        <h1 className="text-3xl font-bold font-orbitron text-secondary">Check-In Desk</h1>
                        <p className="text-gray-400">Scan QR or Search to mark entry.</p>
                    </div>
                    <Button
                        variant={scanMode ? "secondary" : "outline"}
                        className={scanMode ? "bg-green-600 animate-pulse text-white" : "border-gray-500"}
                        onClick={() => setScanMode(!scanMode)}
                    >
                        <QrCode className="mr-2" />
                        {scanMode ? "Scanner Active (Focus)" : "Enable Scanner Mode"}
                    </Button>
                </div>

                {lastAction && (
                    <Alert className={lastAction.type === 'success' ? "border-green-500 bg-green-500/10" : "border-red-500 bg-red-500/10"}>
                        {lastAction.type === 'success' ? <CheckCircle2 className="h-4 w-4 text-green-500" /> : <AlertTriangle className="h-4 w-4 text-red-500" />}
                        <AlertTitle>{lastAction.type === 'success' ? "Success" : "Error"}</AlertTitle>
                        <AlertDescription>{lastAction.message}</AlertDescription>
                    </Alert>
                )}

                <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                    <Input
                        ref={searchInputRef}
                        placeholder="Scan QR or Search by Name, SRN, ID..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10 bg-zinc-900 border-zinc-800 h-12 text-lg"
                        autoFocus={scanMode}
                    />
                </div>

                <Card className="bg-white/5 border-white/10">
                    <CardHeader>
                        <CardTitle className="text-white">Attendees ({filteredParticipants.length})</CardTitle>
                    </CardHeader>
                    <CardContent>
                        {loading ? (
                            <div className="text-center py-12 text-gray-400">Loading attendees...</div>
                        ) : filteredParticipants.length === 0 ? (
                            <div className="text-center py-12 text-gray-400">No attendees found.</div>
                        ) : (
                            <Table>
                                <TableHeader>
                                    <TableRow className="border-white/10 hover:bg-transparent">
                                        <TableHead className="text-gray-400">Participant</TableHead>
                                        <TableHead className="text-gray-400">Identifiers</TableHead>
                                        <TableHead className="text-gray-400">Pass Type</TableHead>
                                        <TableHead className="text-gray-400">Entry Status</TableHead>
                                        <TableHead className="text-right text-gray-400">Action</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {filteredParticipants.map(row => {
                                        // Flatten logic: A user might have multiple passes, but we check them in per pass.
                                        // For now, listing the user. If multiple passes, we show them.
                                        return row.passes.length > 0 ? row.passes.map(pass => (
                                            <TableRow key={`${row.id}-${pass.id}`} className="border-white/10 hover:bg-white/5">
                                                <TableCell>
                                                    <div className="font-medium text-white">{row.name}</div>
                                                    <div className="text-xs text-gray-400">{row.email}</div>
                                                </TableCell>
                                                <TableCell>
                                                    <div className="font-mono text-secondary">{row.participantId}</div>
                                                    {row.srn && <div className="text-xs text-gray-400">SRN: {row.srn}</div>}
                                                </TableCell>
                                                <TableCell>
                                                    <Badge variant="outline">{pass.passType}</Badge>
                                                </TableCell>
                                                <TableCell>
                                                    {pass.checkedIn ? (
                                                        <Badge className="bg-green-500 text-black font-bold">Entered ✅</Badge>
                                                    ) : (
                                                        <Badge variant="secondary" className="bg-gray-700 text-gray-300">Not Entered</Badge>
                                                    )}
                                                </TableCell>
                                                <TableCell className="text-right">
                                                    {!pass.checkedIn && (
                                                        <Button
                                                            size="sm"
                                                            className="bg-secondary text-black hover:bg-yellow-500"
                                                            onClick={() => handleCheckIn(pass.id, pass.checkedIn)}
                                                        >
                                                            <UserCheck size={16} className="mr-2" />
                                                            Check In
                                                        </Button>
                                                    )}
                                                </TableCell>
                                            </TableRow>
                                        )) : (
                                            <TableRow key={row.id}>
                                                <TableCell colSpan={5} className="text-center text-gray-500">
                                                    {row.name} (No Pass)
                                                </TableCell>
                                            </TableRow>
                                        );
                                    })}
                                </TableBody>
                            </Table>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
