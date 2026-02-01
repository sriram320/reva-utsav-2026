"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Ticket, Activity, Plus, Play, Pause, Trash2, Check, X, Loader2, RefreshCcw } from "lucide-react";
import { motion } from "framer-motion";
import { toast } from "sonner";

export default function TicketingPage() {
    const [totalSold, setTotalSold] = useState(0);
    const [status, setStatus] = useState<"ACTIVE" | "PAUSED">("ACTIVE");
    const [batches, setBatches] = useState<any[]>([]);
    const [coupons, setCoupons] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    // Approval State
    const [pendingPasses, setPendingPasses] = useState<any[]>([]);
    const [processingId, setProcessingId] = useState<number | null>(null);

    const [newBatch, setNewBatch] = useState({
        name: "",
        price: 299,
        capacity: 100
    });

    useEffect(() => {
        fetchTicketing();
        fetchPendingPasses();
    }, []);

    const fetchTicketing = async () => {
        try {
            const res = await fetch('/api/admin/ticketing');
            const data = await res.json();
            setBatches(data.batches || []);
            setTotalSold(data.totalSold || 0);
            setStatus(data.status || 'ACTIVE');

            // Fetch coupons
            const couponsRes = await fetch('/api/admin/coupons');
            const couponsData = await couponsRes.json();
            setCoupons(couponsData.coupons || []);
        } catch (error) {
            console.error('Error fetching ticketing:', error);
        }
        setLoading(false);
    };

    const fetchPendingPasses = async () => {
        try {
            const res = await fetch('/api/admin/passes/pending');
            const data = await res.json();
            setPendingPasses(data.passes || []);
        } catch (error) {
            console.error(error);
        }
    };

    const handleReleaseBatch = async () => {
        if (!newBatch.name) return;
        try {
            await fetch('/api/admin/ticketing/batch', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name: newBatch.name,
                    price: newBatch.price,
                    capacity: newBatch.capacity,
                    totalTickets: newBatch.capacity
                })
            });
            setNewBatch({ name: "", price: 299, capacity: 100 });
            fetchTicketing();
        } catch (error) {
            console.error('Error creating batch:', error);
        }
    };

    const handleDeleteBatch = async (id: number) => {
        if (confirm("Are you sure you want to delete this batch?")) {
            const toastId = toast.loading("Deleting batch...");
            try {
                const res = await fetch(`/api/admin/ticketing/batch?id=${id}`, { method: 'DELETE' });
                const data = await res.json();

                if (res.ok) {
                    toast.success("Batch deleted successfully", { id: toastId });
                    fetchTicketing();
                } else {
                    toast.error(data.error || "Failed to delete batch", { id: toastId });
                }
            } catch (error) {
                console.error('Error deleting batch:', error);
                toast.error("Network error. Please try again.", { id: toastId });
            }
        }
    };

    const handleStatusChange = async (newStatus: "ACTIVE" | "PAUSED") => {
        try {
            await fetch('/api/admin/ticketing/status', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status: newStatus })
            });
            setStatus(newStatus);
        } catch (error) {
            console.error('Error updating status:', error);
        }
    };

    const handleApprovalAction = async (passId: number, action: 'approve' | 'reject') => {
        setProcessingId(passId);
        try {
            const res = await fetch('/api/admin/passes/approve', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ passId, action })
            });

            if (res.ok) {
                // Remove from list
                setPendingPasses(prev => prev.filter(p => p.id !== passId));
                // If approved, refresh stats as sold count might update (conceptually)
                if (action === 'approve') fetchTicketing();
            } else {
                alert("Action failed");
            }
        } catch (error) {
            console.error(error);
            alert("Error processing request");
        }
        setProcessingId(null);
    };

    if (loading) {
        return <div className="flex items-center justify-center min-h-screen">
            <div className="text-white">Loading ticketing data...</div>
        </div>;
    }

    return (
        <div className="space-y-8">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold font-orbitron text-white">Ticketing Command Center</h1>
                <Badge variant={status === "ACTIVE" ? "secondary" : "destructive"} className="text-lg px-4 py-1 animate-pulse">
                    System: {status}
                </Badge>
            </div>

            <Tabs defaultValue="overview" className="space-y-6">
                <TabsList className="bg-white/5 border border-white/10">
                    <TabsTrigger value="overview">Overview & Batches</TabsTrigger>
                    <TabsTrigger value="approvals" className="relative">
                        Expert Verification Queue
                        {pendingPasses.length > 0 && (
                            <span className="ml-2 bg-yellow-500 text-black text-xs font-bold px-1.5 py-0.5 rounded-full">
                                {pendingPasses.length}
                            </span>
                        )}
                    </TabsTrigger>
                </TabsList>

                <TabsContent value="overview" className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {/* Live Monitor */}
                        <Card className="bg-white/5 border-white/10 col-span-1">
                            <CardHeader>
                                <CardTitle className="flex items-center text-white">
                                    <Activity className="mr-2 text-green-400 animate-pulse" /> Live Sales
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="h-[150px] flex items-center justify-center bg-black/40 rounded-xl">
                                    <div className="text-center">
                                        <motion.div
                                            key={totalSold}
                                            initial={{ scale: 1.2, color: "#4ade80" }}
                                            animate={{ scale: 1, color: "#ffffff" }}
                                            className="text-6xl font-sans font-bold"
                                        >
                                            {totalSold}
                                        </motion.div>
                                        <p className="text-gray-400 mt-2">Passes Sold Total</p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Batch Control */}
                        <Card className="bg-white/5 border-white/10 col-span-2">
                            <CardHeader>
                                <div className="flex justify-between">
                                    <CardTitle className="text-white">Pass Batches & Inventory</CardTitle>
                                    <div className="flex gap-2">
                                        <Button variant="destructive" size="sm" onClick={() => handleStatusChange("PAUSED")} disabled={status === "PAUSED"}>
                                            <Pause size={14} className="mr-1" /> Pause Sales
                                        </Button>
                                        <Button
                                            variant="primary"
                                            size="sm"
                                            onClick={() => handleStatusChange("ACTIVE")}
                                            disabled={status === "ACTIVE"}
                                            className="bg-green-600 hover:bg-green-700"
                                        >
                                            <Play size={14} className="mr-1" /> Resume Sales
                                        </Button>
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-4">
                                    {batches.length === 0 ? (
                                        <div className="text-center py-8 text-gray-400">No pass batches created yet. Create a batch to release passes for sale.</div>
                                    ) : (
                                        batches.map((batch) => (
                                            <div key={batch.id} className="flex items-center justify-between p-4 bg-zinc-900 rounded-lg">
                                                <div className="flex-1">
                                                    <div className="font-medium text-white text-lg">{batch.name}</div>
                                                    <div className="flex gap-4 mt-2 text-sm text-gray-400">
                                                        <span>Price: ₹{batch.price || 299}</span>
                                                        <span>Capacity: {batch.capacity || 0}</span>
                                                        <span>Sold: {batch.soldTickets || 0}/{batch.capacity || 0}</span>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-3">
                                                    <Badge className={batch.status === "Active" ? "bg-green-500" : "bg-gray-500"}>{batch.status}</Badge>
                                                    {batch.status === 'Scheduled' && (
                                                        <Button size="sm" variant="outline" onClick={async () => {
                                                            await fetch('/api/admin/ticketing/batch', {
                                                                method: 'PATCH',
                                                                headers: { 'Content-Type': 'application/json' },
                                                                body: JSON.stringify({ id: batch.id, status: 'Active' })
                                                            });
                                                            fetchTicketing();
                                                        }} className="border-green-500 text-green-500 hover:bg-green-500 hover:text-white">
                                                            <Play size={14} className="mr-1" /> Activate
                                                        </Button>
                                                    )}
                                                    <Button variant="ghost" size="sm" onClick={() => handleDeleteBatch(batch.id)} className="text-red-400">
                                                        <Trash2 size={16} />
                                                    </Button>
                                                </div>
                                            </div>
                                        ))
                                    )}

                                    <div className="border-t border-white/10 pt-4 mt-4">
                                        <h3 className="text-white font-semibold mb-4">Create New Pass Batch</h3>
                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                            <div>
                                                <Label className="text-gray-400 text-sm">Batch Name</Label>
                                                <Input placeholder="e.g., Early Bird, Phase 2" value={newBatch.name} onChange={(e) => setNewBatch({ ...newBatch, name: e.target.value })} className="bg-zinc-900 border-zinc-800 mt-1" />
                                            </div>
                                            <div>
                                                <Label className="text-gray-400 text-sm">Price (₹)</Label>
                                                <Input type="number" placeholder="299" value={newBatch.price} onChange={(e) => setNewBatch({ ...newBatch, price: parseInt(e.target.value) || 0 })} className="bg-zinc-900 border-zinc-800 mt-1" />
                                            </div>
                                            <div>
                                                <Label className="text-gray-400 text-sm">Capacity</Label>
                                                <Input type="number" placeholder="100" value={newBatch.capacity} onChange={(e) => setNewBatch({ ...newBatch, capacity: parseInt(e.target.value) || 0 })} className="bg-zinc-900 border-zinc-800 mt-1" />
                                            </div>
                                        </div>
                                        <Button onClick={handleReleaseBatch} className="w-full mt-4 bg-secondary text-black hover:bg-yellow-500">
                                            <Plus size={16} className="mr-2" /> Release Pass Batch
                                        </Button>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Coupons */}
                    <Card className="bg-white/5 border-white/10">
                        <CardHeader>
                            <div className="flex justify-between items-center">
                                <div>
                                    <CardTitle className="text-white">Active Discount Coupons</CardTitle>
                                    <CardDescription>Promotional codes with volunteer tracking</CardDescription>
                                </div>
                                <Button variant="outline" size="sm" onClick={() => window.location.href = '/admin/volunteers'} className="border-secondary text-secondary hover:bg-secondary hover:text-black">
                                    Manage Coupons
                                </Button>
                            </div>
                        </CardHeader>
                        <CardContent>
                            {coupons.length === 0 ? (
                                <div className="text-center py-8 text-gray-400">No coupons available. <a href="/admin/volunteers" className="text-secondary underline hover:text-yellow-500">Create coupons in the Volunteers section</a>.</div>
                            ) : (
                                <div className="space-y-2">
                                    {coupons.map((coupon: any) => (
                                        <div key={coupon.id} className="flex items-center justify-between p-3 bg-zinc-900 rounded-lg">
                                            <div className="flex-1">
                                                <div className="font-mono font-bold text-secondary">{coupon.code}</div>
                                                <div className="text-sm text-gray-400">{coupon.discountPercent}% discount • Used {coupon.usageCount} times</div>
                                            </div>
                                            <Badge className="bg-green-500">Active</Badge>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="approvals">
                    <Card className="bg-white/5 border-white/10">
                        <CardHeader>
                            <div className="flex justify-between items-center">
                                <div>
                                    <CardTitle className="text-white">Verification Queue ({pendingPasses.length})</CardTitle>
                                    <CardDescription>Validate Reva Student Identities and SRN</CardDescription>
                                </div>
                                <Button onClick={fetchPendingPasses} variant="outline" size="sm">
                                    <RefreshCcw className="mr-2 h-4 w-4" /> Refresh
                                </Button>
                            </div>
                        </CardHeader>
                        <CardContent>
                            {pendingPasses.length === 0 ? (
                                <div className="text-center py-12 text-gray-500">
                                    <Check className="mx-auto h-12 w-12 text-green-500 mb-4 opacity-50" />
                                    No pending verifications. All clear!
                                </div>
                            ) : (
                                <Table>
                                    <TableHeader>
                                        <TableRow className="border-white/10 hover:bg-transparent">
                                            <TableHead className="text-gray-400">Student</TableHead>
                                            <TableHead className="text-gray-400">SRN & Dept</TableHead>
                                            <TableHead className="text-gray-400">Pass Details</TableHead>
                                            <TableHead className="text-gray-400">Date</TableHead>
                                            <TableHead className="text-right text-gray-400">Actions</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {pendingPasses.map((pass) => (
                                            <TableRow key={pass.id} className="border-white/10 hover:bg-white/5">
                                                <TableCell>
                                                    <div className="font-medium text-white">{pass.userName}</div>
                                                    <div className="text-xs text-gray-400">{pass.userEmail}</div>
                                                </TableCell>
                                                <TableCell>
                                                    <div className="font-mono text-secondary">{pass.userSrn || 'N/A'}</div>
                                                    <div className="text-xs text-gray-400">{pass.userDept || 'N/A'}</div>
                                                </TableCell>
                                                <TableCell>
                                                    <Badge variant="outline" className="mb-1">{pass.passType}</Badge>
                                                    <div className="text-xs text-gray-400">Paid: ₹{pass.amountPaid}</div>
                                                </TableCell>
                                                <TableCell className="text-gray-400">
                                                    {new Date(pass.purchaseDate).toLocaleDateString()}
                                                </TableCell>
                                                <TableCell className="text-right space-x-2">
                                                    <Button
                                                        size="sm"
                                                        className="bg-green-600 hover:bg-green-700 text-white"
                                                        disabled={processingId === pass.id}
                                                        onClick={() => handleApprovalAction(pass.id, 'approve')}
                                                    >
                                                        {processingId === pass.id ? <Loader2 className="animate-spin h-4 w-4" /> : <Check className="h-4 w-4" />}
                                                    </Button>
                                                    <Button
                                                        size="sm"
                                                        variant="destructive"
                                                        disabled={processingId === pass.id}
                                                        onClick={() => handleApprovalAction(pass.id, 'reject')}
                                                    >
                                                        {processingId === pass.id ? <Loader2 className="animate-spin h-4 w-4" /> : <X className="h-4 w-4" />}
                                                    </Button>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            )}
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    );
}
