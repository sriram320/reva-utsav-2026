"use client";

import { useState, useEffect, useRef, ChangeEvent } from "react";
import { ArrowLeft, Camera, QrCode, CheckCircle, Printer, Tag, ClipboardList, Upload, CheckSquare, Loader2, Users, Search, X, Bed } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { motion, AnimatePresence } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import QRCodeLib from "qrcode";
import jsQR from "jsqr";
import AccommodationCommandCenter from "./AccommodationCommandCenter";

interface RegistrationDeskProps {
    mode: "admin" | "volunteer";
    onBack?: () => void;
}

export default function RegistrationDeskInterface({ mode, onBack }: RegistrationDeskProps) {
    const [view, setView] = useState<"menu" | "check-in" | "temp-pass" | "tasks" | "accommodation">("menu");

    // --- Check-In Logic (Scanner + List) ---
    const [isCameraActive, setIsCameraActive] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const [checkInStep, setCheckInStep] = useState<"list" | "form">("list");

    // Scanner State
    const [scanProcessing, setScanProcessing] = useState(false);
    const [activeUser, setActiveUser] = useState<{ name: string, event: string, id: string, phone: string, participantId: string } | null>(null);
    const [govtIdFilePreview, setGovtIdFilePreview] = useState<string | null>(null);
    const [govtIdFile, setGovtIdFile] = useState<File | null>(null);
    const [qrCodeUrl, setQrCodeUrl] = useState<string>("");

    // Video Ref for Scanner
    const videoRef = useRef<HTMLVideoElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);

    // --- Check-In Logic (Scanner + List) ---
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const [participants, setParticipants] = useState<any[]>([]);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const [tasks, setTasks] = useState<any[]>([]);

    // Camera Logic
    useEffect(() => {
        let stream: MediaStream | null = null;
        let animationId: number;

        const startCamera = async () => {
            if (isCameraActive && checkInStep === "list") {
                try {
                    // Wait for video element to be ready
                    if (!videoRef.current) return;

                    stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" } });
                    videoRef.current.srcObject = stream;
                    // Required to play the video
                    videoRef.current.setAttribute("playsinline", "true");
                    await videoRef.current.play();

                    requestAnimationFrame(tick);
                } catch (err) {
                    console.error("Camera error:", err);
                    setScanProcessing(false);
                }
            } else {
                if (stream) { // Cleanup if camera was active but now disabled
                    stream.getTracks().forEach(track => track.stop());
                }
            }
        };

        const tick = () => {
            if (videoRef.current && videoRef.current.readyState === videoRef.current.HAVE_ENOUGH_DATA) {
                if (!canvasRef.current) return;

                const canvas = canvasRef.current;
                const context = canvas.getContext("2d");
                if (!context) return;

                canvas.height = videoRef.current.videoHeight;
                canvas.width = videoRef.current.videoWidth;
                context.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);

                const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
                const code = jsQR(imageData.data, imageData.width, imageData.height, {
                    inversionAttempts: "dontInvert",
                });

                if (code) {
                    console.log("Found QR code", code.data);
                    // Extract ID from URL or raw text
                    // Assuming format: {"id":"REVA-UTS-001",...} or just ID string
                    let foundId = code.data;
                    try {
                        const parsed = JSON.parse(code.data);
                        if (parsed.id) foundId = parsed.id;
                    } catch (e) {
                        // Not JSON, use raw string
                    }

                    setSearchQuery(foundId);
                    setScanProcessing(true);

                    // Add a small beep or visual feedback here
                    setIsCameraActive(false); // Close camera on find
                }
            }
            if (isCameraActive) {
                animationId = requestAnimationFrame(tick);
            }
        };

        startCamera();

        return () => {
            if (stream) {
                stream.getTracks().forEach(track => track.stop());
            }
            if (animationId) cancelAnimationFrame(animationId);
        };
    }, [isCameraActive, checkInStep]);


    // Fetch participants based on search
    useEffect(() => {
        const fetchParticipants = async () => {
            if (searchQuery.length < 2) {
                setParticipants([]);
                return;
            }
            try {
                // Determine if searching by ID or Name
                const url = `/api/admin/users?query=${encodeURIComponent(searchQuery)}`;

                const res = await fetch(url);
                const data = await res.json();
                setParticipants(data.users || []); // Assuming API returns users

                // Reset scan processing if we got results
                setScanProcessing(false);
            } catch (e) {
                console.error("Search error", e);
                setScanProcessing(false);
            }
        };

        const timeoutId = setTimeout(fetchParticipants, 300);
        return () => clearTimeout(timeoutId);
    }, [searchQuery]);


    // --- Helper Functions ---
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const handleSelectUser = (user: any) => {
        setActiveUser(user);
        setCheckInStep("form");
    };

    const generateQRCode = async (id: string) => {
        try {
            const qrData = JSON.stringify({
                id: id,
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

    const handleConfirmAdmit = async () => {
        if (!activeUser) return;

        try {
            // 1. Upload Document if present
            let uploadedUrl = null;
            if (govtIdFile) {
                const formData = new FormData();
                formData.append('file', govtIdFile);

                const uploadRes = await fetch('/api/upload', {
                    method: 'POST',
                    body: formData
                });

                if (uploadRes.ok) {
                    const data = await uploadRes.json();
                    uploadedUrl = data.url;
                }
            }

            // 2. Mark as verified in DB
            // Note: Using the generic participants verification endpoint which uses userId
            const res = await fetch("/api/admin/participants", {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                // id is present on activeUser type
                body: JSON.stringify({
                    userId: activeUser.id,
                    verified: true,
                    govtIdUrl: uploadedUrl
                })
            });

            if (!res.ok) {
                console.error("Failed to verify user");
                return;
            }

            // 3. Generate QR
            await generateQRCode(activeUser.participantId || activeUser.id);

            // 4. Show Print Modal
            setShowPrintModal(true);

        } catch (e) {
            console.error("Error confirming admit:", e);
        }
    };

    // --- Temp Pass Logic ---
    const [tempUser, setTempUser] = useState({ name: "", phone: "", category: "Visitor" });
    const [showPrintModal, setShowPrintModal] = useState(false);

    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setGovtIdFile(file);
            const objectUrl = URL.createObjectURL(file);
            setGovtIdFilePreview(objectUrl);
        }
    };

    useEffect(() => {
        if (mode === 'volunteer') {
            fetchMyTasks();
        }
    }, [mode]);

    const fetchMyTasks = async () => {
        try {
            // Get current user ID first
            const authRes = await fetch('/api/auth/me');
            const authData = await authRes.json();
            if (authData.user) {
                const res = await fetch(`/api/admin/tasks?assignedTo=${authData.user.id}`);
                const data = await res.json();
                setTasks(data.tasks || []);
            }
        } catch (e) { console.error("Task fetch error", e); }
    };

    const handleMarkTask = async (id: number) => {
        try {
            const res = await fetch('/api/admin/tasks', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id, status: 'Pending Verification' })
            });
            if (res.ok) {
                fetchMyTasks();
            }
        } catch (e) { console.error("Task update error", e); }
    };
    // --- Render Helpers ---
    const renderMenu = () => (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-5xl">
            <div onClick={() => setView("check-in")} className="bg-gradient-to-br from-blue-900/20 to-black border border-blue-500/30 p-6 rounded-3xl cursor-pointer hover:border-blue-400 group transition-all flex flex-col items-center text-center gap-4">
                <div className="w-16 h-16 rounded-full bg-blue-500/10 flex items-center justify-center group-hover:bg-blue-500/20 transition-colors">
                    <Users size={32} className="text-blue-400" />
                </div>
                <div>
                    <h2 className="text-xl font-bold text-white">Check-In Desk</h2>
                    <p className="text-sm text-gray-400 mt-1">Scan QR or Search List</p>
                </div>
            </div>

            <div onClick={() => setView("temp-pass")} className="bg-gradient-to-br from-purple-900/20 to-black border border-purple-500/30 p-6 rounded-3xl cursor-pointer hover:border-purple-400 group transition-all flex flex-col items-center text-center gap-4">
                <div className="w-16 h-16 rounded-full bg-purple-500/10 flex items-center justify-center group-hover:bg-purple-500/20 transition-colors">
                    <Tag size={32} className="text-purple-400" />
                </div>
                <div>
                    <h2 className="text-xl font-bold text-white">Issue Passes</h2>
                    <p className="text-sm text-gray-400 mt-1">On-spot Registration</p>
                </div>
            </div>

            {mode === "volunteer" && (
                <>
                    <div onClick={() => setView("tasks")} className="bg-gradient-to-br from-green-900/20 to-black border border-green-500/30 p-6 rounded-3xl cursor-pointer hover:border-green-400 group transition-all flex flex-col items-center text-center gap-4">
                        <div className="w-16 h-16 rounded-full bg-green-500/10 flex items-center justify-center group-hover:bg-green-500/20 transition-colors">
                            <ClipboardList size={32} className="text-green-400" />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-white">My Tasks</h2>
                            <p className="text-sm text-gray-400 mt-1">
                                {tasks.filter(t => t.status === "pending").length} Pending Assignments
                            </p>
                        </div>
                    </div>

                    <div onClick={() => setView("accommodation")} className="bg-gradient-to-br from-orange-900/20 to-black border border-orange-500/30 p-6 rounded-3xl cursor-pointer hover:border-orange-400 group transition-all flex flex-col items-center text-center gap-4">
                        <div className="w-16 h-16 rounded-full bg-orange-500/10 flex items-center justify-center group-hover:bg-orange-500/20 transition-colors">
                            <Bed size={32} className="text-orange-400" />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-white">Accommodation</h2>
                            <p className="text-sm text-gray-400 mt-1">
                                Command Center
                            </p>
                        </div>
                    </div>
                </>
            )}
        </motion.div>
    );

    return (
        <div className="flex flex-col h-full w-full relative">
            {/* Header */}
            <div className="flex items-center justify-between z-10 mb-6">
                <div className="flex items-center gap-4">
                    {view !== "menu" && (
                        <Button variant="ghost" size="sm" onClick={() => { setView("menu"); setIsCameraActive(false); setCheckInStep("list"); }} className="gap-2 text-gray-400 hover:text-white pl-0">
                            <ArrowLeft size={16} /> Back to Menu
                        </Button>
                    )}
                    {view === "menu" && <p className="text-gray-400">Select an operation to begin</p>}
                </div>
                {mode === "volunteer" && <Badge variant="outline" className="text-secondary border-secondary/50">Volunteer Mode</Badge>}
            </div>

            <div className="flex-1 flex justify-center items-start">

                {view === "menu" && renderMenu()}

                {view === "check-in" && (
                    <div className="w-full max-w-4xl space-y-4">
                        {/* Check-In Header Controls */}
                        {checkInStep === "list" && (
                            <div className="flex flex-col md:flex-row gap-4">
                                <Button
                                    size="lg"
                                    className={`${isCameraActive ? 'bg-red-600 hover:bg-red-700' : 'bg-blue-600 hover:bg-blue-700'} transition-all`}
                                    onClick={() => setIsCameraActive(!isCameraActive)}
                                >
                                    {isCameraActive ? <><X size={20} className="mr-2" /> Close Camera</> : <><Camera size={20} className="mr-2" /> Scan QR Code</>}
                                </Button>
                                <div className="flex-1 relative">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                                    <Input
                                        placeholder="Search Participant by Name or ID..."
                                        className="pl-10 bg-white/5 border-white/10 text-white h-11"
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                    />
                                </div>
                            </div>
                        )}

                        {/* Camera Overlay */}
                        <AnimatePresence>
                            {isCameraActive && checkInStep === "list" && (
                                <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
                                    <div className="bg-black border-blue-500/30 overflow-hidden relative h-64 md:h-80 flex items-center justify-center rounded-lg shadow-2xl">
                                        {/* Real Video Element */}
                                        <video
                                            ref={videoRef}
                                            className="absolute inset-0 w-full h-full object-cover opacity-100" // Opacity 100 to see cam
                                            // autoPlay playsInline muted are set via JS but backup here
                                            autoPlay
                                            playsInline
                                            muted
                                        />
                                        <canvas ref={canvasRef} className="hidden" />

                                        {/* Fallback pattern if video fails/loading */}
                                        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1573164713714-d95e436ab8d6?auto=format&fit=crop&q=80')] bg-cover bg-center opacity-10 pointer-events-none" />

                                        {/* Scanning UI Overlays */}
                                        <div className="relative z-10 border-2 border-blue-500 w-48 h-48 rounded-lg flex flex-col items-center justify-center shadow-[0_0_50px_rgba(59,130,246,0.5)]">
                                            <div className="w-full h-1 bg-blue-500 absolute top-0 animate-[scan_2s_ease-in-out_infinite]" />
                                            {scanProcessing ? (
                                                <div className="bg-black/80 px-4 py-2 rounded-full text-blue-400 font-bold animate-pulse">Processing...</div>
                                            ) : (
                                                <div className="text-[10px] text-blue-300 font-mono mt-20 bg-black/50 px-2 rounded">SCANNING QR...</div>
                                            )}
                                        </div>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>

                        {/* List View */}
                        {checkInStep === "list" && (
                            <Card className="bg-white/5 border-white/10 min-h-[400px]">
                                <CardContent className="p-0">
                                    <div className="divide-y divide-white/5">
                                        {participants.map((user, i) => (
                                            <div key={i} className="flex items-center justify-between p-4 hover:bg-white/5 transition-colors cursor-pointer" onClick={() => handleSelectUser(user)}>
                                                <div className="flex items-center gap-4">
                                                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-gray-800 to-black flex items-center justify-center font-bold text-gray-400 border border-white/10">
                                                        {user.name?.charAt(0) || '?'}
                                                    </div>
                                                    <div>
                                                        <h4 className="font-bold text-white">{user.name}</h4>
                                                        <p className="text-xs text-gray-400">{user.participantId || user.email}</p>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-4">
                                                    <Badge variant="secondary" className="hidden md:flex">{user.role || 'Participant'}</Badge>
                                                    <Button size="sm" variant="ghost" className="text-blue-400 hover:text-blue-300 hover:bg-blue-400/10">
                                                        Verify &rarr;
                                                    </Button>
                                                </div>
                                            </div>
                                        ))}
                                        {participants.length === 0 && (
                                            <div className="p-8 text-center text-gray-500">
                                                {searchQuery.length < 2 ? "Enter 2+ characters to search" : `No participants found matching "${searchQuery}"`}
                                            </div>
                                        )}
                                    </div>
                                </CardContent>
                            </Card>
                        )}

                        {/* Detailed Verification Form */}
                        {checkInStep === "form" && activeUser && (
                            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
                                <Card className="bg-white/5 border-white/10">
                                    <div className="flex items-center gap-4 p-6 border-b border-white/10 bg-black/20">
                                        <Button size="icon" variant="ghost" onClick={() => setCheckInStep("list")}>
                                            <ArrowLeft size={18} />
                                        </Button>
                                        <div>
                                            <h2 className="text-xl font-bold text-white">Verify Identity</h2>
                                            <p className="text-xs text-gray-400">Reviewing details for {activeUser.id}</p>
                                        </div>
                                    </div>

                                    <CardContent className="p-6 space-y-6">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            <div className="space-y-4">
                                                <div className="space-y-2">
                                                    <label className="text-xs uppercase font-bold text-gray-500">Participant Details</label>
                                                    <Input defaultValue={activeUser.name} className="bg-white/5 border-white/10" placeholder="Full Name" />
                                                    <Input defaultValue={activeUser.phone} className="bg-white/5 border-white/10" placeholder="Phone" />
                                                    <Input defaultValue="Reva University" className="bg-white/5 border-white/10" placeholder="College" />
                                                </div>

                                                <div className="p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
                                                    <h4 className="text-yellow-500 font-bold mb-1 flex items-center gap-2">
                                                        <Tag size={16} /> Event Pass: {activeUser.event}
                                                    </h4>
                                                    <p className="text-xs text-yellow-500/80">Confirm ticket validity before entry.</p>
                                                </div>
                                            </div>

                                            <div className="space-y-4">
                                                <div className="space-y-2">
                                                    <label className="text-xs uppercase font-bold text-gray-500 flex justify-between">
                                                        <span>Govt ID Upload</span>
                                                        <span className="text-red-400">*Required</span>
                                                    </label>
                                                    <Input placeholder="Enter ID Number (Aadhar/DL)" className="bg-white/5 border-white/10 mb-2" />
                                                    <input
                                                        type="file"
                                                        ref={fileInputRef}
                                                        className="hidden"
                                                        accept="image/*,.pdf"
                                                        onChange={handleFileChange}
                                                    />
                                                    <div
                                                        className="border border-dashed border-white/20 rounded-xl p-6 flex flex-col items-center justify-center gap-2 hover:bg-white/5 cursor-pointer transition-colors relative overflow-hidden"
                                                        onClick={() => fileInputRef.current?.click()}
                                                    >
                                                        {govtIdFilePreview ? (
                                                            <>
                                                                <img src={govtIdFilePreview} alt="ID Preview" className="absolute inset-0 w-full h-full object-cover opacity-60" />
                                                                <div className="relative z-10 flex flex-col items-center">
                                                                    <CheckCircle size={32} className="text-green-500 drop-shadow-md" />
                                                                    <p className="text-sm font-bold text-green-400 drop-shadow-md">Document Uploaded</p>
                                                                </div>
                                                            </>
                                                        ) : (
                                                            <>
                                                                <Upload size={32} className="text-gray-400" />
                                                                <p className="text-sm text-gray-400">Click to upload ID Proof</p>
                                                            </>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="flex gap-4 pt-4 border-t border-white/10">
                                            <Button variant="outline" className="flex-1" onClick={() => setCheckInStep("list")}>Cancel</Button>
                                            <Button className="flex-1 bg-green-600 hover:bg-green-700" onClick={handleConfirmAdmit}>
                                                <CheckSquare size={16} className="mr-2" /> Confirm & Admit
                                            </Button>
                                        </div>
                                    </CardContent>
                                </Card>
                            </motion.div>
                        )}
                    </div>
                )}

                {view === "temp-pass" && (
                    <div className="w-full max-w-lg">
                        <Card className="bg-white/5 border-white/10 shadow-2xl">
                            <CardHeader>
                                <CardTitle className="text-white flex items-center gap-2">
                                    <Tag size={20} className="text-secondary" /> Issue Temporary Pass
                                </CardTitle>
                                <CardDescription>Guests, Vendors, or Parents</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <Input placeholder="Full Name" className="bg-black/20 text-white" value={tempUser.name} onChange={(e) => setTempUser({ ...tempUser, name: e.target.value })} />
                                <Input placeholder="Phone Number" className="bg-black/20 text-white" value={tempUser.phone} onChange={(e) => setTempUser({ ...tempUser, phone: e.target.value })} />
                                <select className="w-full h-10 rounded-md bg-black/20 border border-white/10 text-sm px-3 text-white" value={tempUser.category} onChange={(e) => setTempUser({ ...tempUser, category: e.target.value })}>
                                    <option>Visitor</option>
                                    <option>Parent</option>
                                    <option>Vendor</option>
                                </select>
                                <Button className="w-full bg-secondary text-black" onClick={() => setShowPrintModal(true)}>
                                    <Printer size={16} className="mr-2" /> GENERATE
                                </Button>
                            </CardContent>
                        </Card>
                    </div>
                )}

                {view === "tasks" && (
                    <div className="w-full max-w-3xl">
                        <Card className="bg-white/5 border-white/10">
                            <CardHeader>
                                <CardTitle className="text-white flex justify-between">
                                    <span>Assignment Board</span>
                                    <Badge variant="secondary">{tasks.length} Assigned</Badge>
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                {tasks.map((task) => (
                                    <div key={task.id} className="flex items-center justify-between p-4 bg-white/5 rounded-lg border border-white/5 hover:border-white/10 transition-colors">
                                        <div>
                                            <h4 className={`font-bold ${task.status === "Completed" ? "text-gray-500 line-through" : "text-white"}`}>{task.title}</h4>
                                            <p className="text-xs text-gray-400">Assigned: {new Date(task.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                                        </div>
                                        <div>
                                            {task.status === "Pending" && (
                                                <Button size="sm" variant="outline" className="border-green-500/50 text-green-400 hover:bg-green-500/10" onClick={() => handleMarkTask(task.id)}>
                                                    <CheckSquare size={16} className="mr-2" /> Mark Done
                                                </Button>
                                            )}
                                            {task.status === "Pending Verification" && (
                                                <Badge className="bg-yellow-500/20 text-yellow-500 hover:bg-yellow-500/20">
                                                    <Loader2 size={12} className="mr-1 animate-spin" /> Verifying
                                                </Badge>
                                            )}
                                            {task.status === "Completed" && (
                                                <Badge className="bg-green-500/20 text-green-500 hover:bg-green-500/20">
                                                    Verified
                                                </Badge>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </CardContent>
                        </Card>
                    </div>
                )}

                {view === "accommodation" && (
                    <div className="w-full max-w-6xl">
                        <AccommodationCommandCenter />
                    </div>
                )}
            </div>

            {/* Shared Print Modal */}
            <Dialog open={showPrintModal} onOpenChange={setShowPrintModal}>
                <DialogContent className="bg-white text-black max-w-sm">
                    <DialogHeader><DialogTitle>Confirmed</DialogTitle></DialogHeader>
                    <div className="flex flex-col items-center py-6 space-y-4">
                        <div className="w-48 h-48 bg-white flex items-center justify-center border-2 border-dashed border-gray-300 rounded-lg p-2">
                            {qrCodeUrl ? (
                                <img src={qrCodeUrl} alt="QR Code" className="w-full h-full object-contain" />
                            ) : (
                                <QrCode size={64} className="text-gray-300" />
                            )}
                        </div>
                        <p className="text-center text-sm text-gray-500">Participant verified. Printing pass...</p>
                        <Button className="w-full" onClick={() => { window.print(); setTimeout(() => setShowPrintModal(false), 1000); }}>Print Badge</Button>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
}
