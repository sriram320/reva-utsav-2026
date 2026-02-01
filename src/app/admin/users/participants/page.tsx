"use client";

import { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { CheckCircle2, XCircle, Eye, Search, UserCheck, QrCode, Printer } from "lucide-react";
import QRCodeLib from "qrcode";

interface Participant {
    id: number;
    participantId: string;
    name: string;
    email: string;
    college: string | null;
    phone: string | null;
    verified: boolean;
    createdAt: string;
    events: Array<{
        eventName: string;
        eventCategory: string;
        status: string;
    }>;
    passes: Array<{
        passType: string;
        status: string;
    }>;
}

export default function ParticipantsPage() {
    const [participants, setParticipants] = useState<Participant[]>([]);
    const [filteredParticipants, setFilteredParticipants] = useState<Participant[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedParticipant, setSelectedParticipant] = useState<Participant | null>(null);
    const [isProfileOpen, setIsProfileOpen] = useState(false);
    const [qrCodeUrl, setQrCodeUrl] = useState("");
    const qrCanvasRef = useRef<HTMLCanvasElement>(null);

    const generateQRCode = async (participantId: string) => {
        try {
            const qrData = JSON.stringify({
                id: participantId,
                type: "participant",
                event: "REVA-UTSAV-2026"
            });
            const url = await QRCodeLib.toDataURL(qrData, {
                width: 300,
                margin: 2,
                color: {
                    dark: "#000000",
                    light: "#FFFFFF"
                }
            });
            setQrCodeUrl(url);
        } catch (error) {
            console.error("Error generating QR code:", error);
        }
    };

    const fetchParticipants = async () => {
        setLoading(true);
        try {
            const res = await fetch("/api/admin/participants");
            const data = await res.json();
            setParticipants(data.participants || []);
            setFilteredParticipants(data.participants || []);
        } catch (error) {
            console.error("Error fetching participants:", error);
        }
        setLoading(false);
    };

    useEffect(() => {
        fetchParticipants();
    }, []);

    useEffect(() => {
        const filtered = participants.filter(p =>
            p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            p.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
            p.participantId.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (p.college && p.college.toLowerCase().includes(searchTerm.toLowerCase()))
        );
        setFilteredParticipants(filtered);
    }, [searchTerm, participants]);

    const handleVerify = async (userId: number, currentStatus: boolean) => {
        try {
            await fetch("/api/admin/participants", {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ userId, verified: !currentStatus })
            });
            fetchParticipants();
        } catch (error) {
            console.error("Error updating verification:", error);
        }
    };

    const viewProfile = (participant: Participant) => {
        setSelectedParticipant(participant);
        setIsProfileOpen(true);
        generateQRCode(participant.participantId);
    };

    const printQRCode = () => {
        const printWindow = window.open('', '_blank');
        if (printWindow && selectedParticipant) {
            printWindow.document.write(`
                <html>
                    <head>
                        <title>Participant Badge - ${selectedParticipant.participantId}</title>
                        <style>
                            body { 
                                font-family: Arial, sans-serif; 
                                display: flex; 
                                justify-content: center; 
                                align-items: center; 
                                height: 100vh; 
                                margin: 0;
                                background: white;
                            }
                            .badge {
                                border: 3px solid #FFD700;
                                padding: 30px;
                                text-align: center;
                                border-radius: 10px;
                                box-shadow: 0 4px 6px rgba(0,0,0,0.1);
                            }
                            .badge h1 { margin: 0 0 10px 0; color: #000; font-size: 24px; }
                            .badge .id { font-size: 32px; font-weight: bold; color: #FFD700; margin: 10px 0; }
                            .badge .name { font-size: 20px; margin: 10px 0; }
                            .badge img { margin: 20px 0; }
                            @media print {
                                body { background: white; }
                                .no-print { display: none; }
                            }
                        </style>
                    </head>
                    <body>
                        <div class="badge">
                            <h1>REVA UTSAV 2026</h1>
                            <div class="id">${selectedParticipant.participantId}</div>
                            <div class="name">${selectedParticipant.name}</div>
                            <img src="${qrCodeUrl}" alt="QR Code" />
                            <div style="font-size: 12px; color: #666;">${selectedParticipant.email}</div>
                        </div>
                        <script>
                            window.onload = () => {
                                window.print();
                                setTimeout(() => window.close(), 100);
                            };
                        </script>
                    </body>
                </html>
            `);
            printWindow.document.close();
        }
    };

    const getCategoryColor = (category: string) => {
        const colors: Record<string, string> = {
            "Technical": "bg-blue-500/20 text-blue-400 border-blue-500/30",
            "Cultural": "bg-purple-500/20 text-purple-400 border-purple-500/30",
            "Sports": "bg-green-500/20 text-green-400 border-green-500/30",
            "Workshop": "bg-orange-500/20 text-orange-400 border-orange-500/30",
        };
        return colors[category] || "bg-gray-500/20 text-gray-400 border-gray-500/30";
    };

    return (
        <div className="min-h-screen bg-black text-white p-8">
            <div className="max-w-7xl mx-auto">
                <div className="flex justify-between items-center mb-6">
                    <div>
                        <h1 className="text-3xl font-bold font-orbitron text-secondary">Participant Management</h1>
                        <p className="text-gray-400 mt-1">Registration Desk & Check-in</p>
                    </div>
                    <div className="flex items-center gap-4">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                            <Input
                                placeholder="Search by name, email, ID, college..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="pl-10 bg-zinc-900 border-zinc-800 w-96"
                            />
                        </div>
                        <Badge variant="outline" className="border-secondary text-secondary">
                            {filteredParticipants.length} Participants
                        </Badge>
                    </div>
                </div>

                <Card className="bg-zinc-950 border-zinc-800">
                    <CardHeader>
                        <CardTitle className="text-white">All Registered Participants</CardTitle>
                        <CardDescription>View and manage event registrations</CardDescription>
                    </CardHeader>
                    <CardContent>
                        {loading ? (
                            <div className="text-center py-12 text-gray-400">Loading participants...</div>
                        ) : filteredParticipants.length === 0 ? (
                            <div className="text-center py-12 text-gray-400">No participants found</div>
                        ) : (
                            <Table>
                                <TableHeader>
                                    <TableRow className="border-zinc-800 hover:bg-zinc-900/50">
                                        <TableHead className="text-gray-400">ID</TableHead>
                                        <TableHead className="text-gray-400">Participant</TableHead>
                                        <TableHead className="text-gray-400">College</TableHead>
                                        <TableHead className="text-gray-400">Events</TableHead>
                                        <TableHead className="text-gray-400">Status</TableHead>
                                        <TableHead className="text-right text-gray-400">Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {filteredParticipants.map((participant) => (
                                        <TableRow key={participant.id} className="border-zinc-800 hover:bg-zinc-900/50">
                                            <TableCell className="font-mono text-secondary font-bold">
                                                {participant.participantId}
                                            </TableCell>
                                            <TableCell>
                                                <div>
                                                    <div className="font-medium text-white">{participant.name}</div>
                                                    <div className="text-sm text-gray-400">{participant.email}</div>
                                                </div>
                                            </TableCell>
                                            <TableCell className="text-gray-300">
                                                {participant.college || "N/A"}
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex flex-wrap gap-1">
                                                    {participant.events.length === 0 && participant.passes.length === 0 ? (
                                                        <Badge variant="outline" className="border-zinc-700 text-gray-500">No Events</Badge>
                                                    ) : (
                                                        <>
                                                            {participant.events.map((event, idx) => (
                                                                <Badge
                                                                    key={idx}
                                                                    className={`${getCategoryColor(event.eventCategory)} border text-xs`}
                                                                >
                                                                    {event.eventName.substring(0, 1)}
                                                                </Badge>
                                                            ))}
                                                            {participant.passes.map((pass, idx) => (
                                                                <Badge
                                                                    key={idx}
                                                                    className="bg-yellow-500/20 text-yellow-400 border-yellow-500/30 border text-xs"
                                                                >
                                                                    {pass.passType}
                                                                </Badge>
                                                            ))}
                                                        </>
                                                    )}
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                {participant.verified ? (
                                                    <Badge className="bg-green-500/20 text-green-400 border-green-500/30">
                                                        <CheckCircle2 size={14} className="mr-1" /> Verified
                                                    </Badge>
                                                ) : (
                                                    <Badge variant="outline" className="border-yellow-500/30 text-yellow-400">
                                                        <XCircle size={14} className="mr-1" /> Pending
                                                    </Badge>
                                                )}
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <div className="flex justify-end gap-2">
                                                    <Button
                                                        size="sm"
                                                        variant="ghost"
                                                        className="text-blue-400 hover:bg-blue-900/20"
                                                        onClick={() => viewProfile(participant)}
                                                    >
                                                        <Eye size={14} className="mr-1" /> View
                                                    </Button>
                                                    <Button
                                                        size="sm"
                                                        variant="outline"
                                                        className={participant.verified ? "border-red-500/30 text-red-400" : "border-green-500/30 text-green-400"}
                                                        onClick={() => handleVerify(participant.id, participant.verified)}
                                                    >
                                                        <UserCheck size={14} className="mr-1" />
                                                        {participant.verified ? "Unverify" : "Verify"}
                                                    </Button>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        )}
                    </CardContent>
                </Card>

                {/* Profile Modal */}
                <Dialog open={isProfileOpen} onOpenChange={setIsProfileOpen}>
                    <DialogContent className="bg-zinc-950 border-zinc-800 text-white max-w-2xl">
                        <DialogHeader>
                            <DialogTitle className="flex items-center justify-between">
                                <span className="flex items-center gap-2">
                                    <QrCode className="text-secondary" />
                                    Participant Profile
                                </span>
                                <Button
                                    onClick={printQRCode}
                                    className="bg-secondary text-black hover:bg-yellow-500"
                                    size="sm"
                                >
                                    <Printer size={16} className="mr-2" />
                                    Print Badge
                                </Button>
                            </DialogTitle>
                        </DialogHeader>
                        {selectedParticipant && (
                            <div className="space-y-4">
                                {/* QR Code Section */}
                                <div className="flex justify-center bg-white p-4 rounded-lg">
                                    {qrCodeUrl && (
                                        <img src={qrCodeUrl} alt="QR Code" className="w-48 h-48" />
                                    )}
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <div className="text-sm text-gray-400">Participant ID</div>
                                        <div className="font-mono text-secondary font-bold text-lg">{selectedParticipant.participantId}</div>
                                    </div>
                                    <div>
                                        <div className="text-sm text-gray-400">Status</div>
                                        <div>
                                            {selectedParticipant.verified ? (
                                                <Badge className="bg-green-500/20 text-green-400 border-green-500/30">Verified</Badge>
                                            ) : (
                                                <Badge variant="outline" className="border-yellow-500/30 text-yellow-400">Pending</Badge>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                <div>
                                    <div className="text-sm text-gray-400">Name</div>
                                    <div className="text-white font-medium">{selectedParticipant.name}</div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <div className="text-sm text-gray-400">Email</div>
                                        <div className="text-white">{selectedParticipant.email}</div>
                                    </div>
                                    <div>
                                        <div className="text-sm text-gray-400">Phone</div>
                                        <div className="text-white">{selectedParticipant.phone || "N/A"}</div>
                                    </div>
                                </div>

                                <div>
                                    <div className="text-sm text-gray-400">College</div>
                                    <div className="text-white">{selectedParticipant.college || "N/A"}</div>
                                </div>

                                <div>
                                    <div className="text-sm text-gray-400 mb-2">Registered Events</div>
                                    {selectedParticipant.events.length === 0 ? (
                                        <div className="text-gray-500">No events registered</div>
                                    ) : (
                                        <div className="space-y-2">
                                            {selectedParticipant.events.map((event, idx) => (
                                                <div key={idx} className="flex items-center justify-between bg-zinc-900 p-2 rounded">
                                                    <span>{event.eventName}</span>
                                                    <Badge className={getCategoryColor(event.eventCategory)}>
                                                        {event.eventCategory}
                                                    </Badge>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>

                                {selectedParticipant.passes.length > 0 && (
                                    <div>
                                        <div className="text-sm text-gray-400 mb-2">Passes</div>
                                        <div className="space-y-2">
                                            {selectedParticipant.passes.map((pass, idx) => (
                                                <div key={idx} className="flex items-center justify-between bg-zinc-900 p-2 rounded">
                                                    <span>{pass.passType}</span>
                                                    <Badge className="bg-yellow-500/20 text-yellow-400 border-yellow-500/30">
                                                        {pass.status}
                                                    </Badge>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                <div className="text-xs text-gray-500">
                                    Registered: {new Date(selectedParticipant.createdAt).toLocaleString()}
                                </div>
                            </div>
                        )}
                    </DialogContent>
                </Dialog>
            </div>
        </div>
    );
}
