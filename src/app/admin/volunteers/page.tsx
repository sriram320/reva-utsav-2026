"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Loader2, Eye, EyeOff, Copy, ShieldAlert, UserPlus, Users, ArrowUpCircle, Truck, Package, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Trophy, Medal, Gift, ClipboardList } from "lucide-react";

interface User {
    id: number;
    name: string;
    email: string;
    role: string;
    visiblePassword?: string;
    createdAt: string;
    // Mock/Frontend fields for display
    referralCode?: string;
    referralCount?: number;
}

interface LeaderboardItem {
    name: string;
    email: string;
    count: number;
}

// Mock Data Removed

export default function StaffManagementPage() {
    const [activeTab, setActiveTab] = useState("admins");
    const [users, setUsers] = useState<User[]>([]);
    const [leaderboard, setLeaderboard] = useState<LeaderboardItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [showPassword, setShowPassword] = useState<Record<number, boolean>>({});

    // Dialog States
    const [selectedUser, setSelectedUser] = useState<User | null>(null);
    const [referralDetails, setReferralDetails] = useState<any[]>([]);
    const [isReferralOpen, setIsReferralOpen] = useState(false);

    // Create Form
    const [newUser, setNewUser] = useState({ name: "", email: "", password: "", role: "admin" });
    const [couponForm, setCouponForm] = useState({ discount: "10", customCode: "" });
    const [taskForm, setTaskForm] = useState({ title: "", description: "" });

    const fetchAllData = async () => {
        setLoading(true);
        try {
            // 1. Users
            const res = await fetch("/api/admin/users");
            const data = await res.json();

            // 2. Leaderboard
            const resLb = await fetch("/api/admin/leaderboard");
            const dataLb = await resLb.json();
            setLeaderboard(dataLb.leaderboard || []);

            // 3. Map Referrals to Users
            const lbMap = new Map((dataLb.leaderboard || []).map((i: any) => [i.email, i.count]));

            const processedUsers = (data.users || []).map((u: any) => ({
                ...u,
                referralCount: lbMap.get(u.email) || 0,
                referralCode: `VOL-${u.name.split(' ')[0].toUpperCase()}-${u.id}` // Default simplified
            }));

            // Fetch actual coupons to map real codes if needed, but simplistic for now
            setUsers(processedUsers);

        } catch (e) { console.error(e); }
        setLoading(false);
    };

    useEffect(() => {
        fetchAllData();
    }, []);

    // --- Task Verification Logic ---
    const [userTasks, setUserTasks] = useState<any[]>([]);
    const fetchUserTasks = async (userId: number) => {
        const res = await fetch(`/api/admin/tasks?assignedTo=${userId}`);
        const data = await res.json();
        setUserTasks(data.tasks || []);
    };

    useEffect(() => {
        if (selectedUser) {
            fetchUserTasks(selectedUser.id);
        }
    }, [selectedUser]);

    const handleVerifyTask = async (taskId: number) => {
        await fetch('/api/admin/tasks', {
            method: 'PATCH', headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id: taskId, status: 'Completed' })
        });
        if (selectedUser) fetchUserTasks(selectedUser.id);
    };

    const toggleShow = (id: number) => setShowPassword(prev => ({ ...prev, [id]: !prev[id] }));
    const copyToClipboard = (text: string) => { navigator.clipboard.writeText(text); alert("Copied!"); };

    const handleCreateUser = async () => {
        if (!newUser.name || !newUser.email || !newUser.password) return alert("Fill all fields");
        try {
            const res = await fetch("/api/admin/volunteers", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(newUser)
            });
            if (res.ok) {
                alert("User Created!");
                setNewUser({ name: "", email: "", password: "", role: activeTab === 'admins' ? 'admin' : 'volunteer' });
                fetchAllData();
            } else {
                alert((await res.json()).error);
            }
        } catch (e) { alert("Error"); }
    };

    const handleCreateCoupon = async () => {
        if (!selectedUser || !couponForm.discount) return;
        try {
            const res = await fetch("/api/admin/coupons", {
                method: "POST", headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ assignedTo: selectedUser.id, discountPercent: couponForm.discount, customCode: couponForm.customCode })
            });
            if (res.ok) { alert("Coupon Generated!"); setSelectedUser(null); fetchAllData(); }
            else { alert("Failed to generate coupon"); }
        } catch (e) { alert("Error"); }
    };

    const handleAssignTask = async () => {
        if (!selectedUser || !taskForm.title) return;
        try {
            const res = await fetch("/api/admin/tasks", {
                method: "POST", headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ title: taskForm.title, description: taskForm.description, assignedTo: selectedUser.id })
            });
            if (res.ok) { alert("Task Assigned!"); setSelectedUser(null); setTaskForm({ title: "", description: "" }); }
            else { alert("Failed"); }
        } catch (e) { alert("Error"); }
    };

    const viewReferrals = async (user: User) => {
        // Fetch details
        const code = user.referralCode || ""; // Ideally fetch real code from coupons API
        // Quick workaround: Since we didn't store code in user object, let's assume standard format OR look up via API
        // Better: Fetch details by Volunteer ID?
        // For now, let's try assuming the code we display.
        try {
            const res = await fetch(`/api/admin/referrals?code=${code}`);
            const data = await res.json();
            setReferralDetails(data.referrals || []);
            setIsReferralOpen(true);
        } catch (e) { alert("Could not load details"); }
    };

    const handlePromote = async (userId: number, role: string) => {
        if (!confirm(`Are you sure you want to change role to ${role}?`)) return;
        try {
            const res = await fetch("/api/admin/users", {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ userId, role })
            });
            if (res.ok) {
                fetchAllData();
            } else {
                alert("Failed to update role");
            }
        } catch (e) { alert("Error"); }
    };

    const handleDelete = async (userId: number, email: string) => {
        if (!confirm(`Are you sure you want to delete user ${email}? This action cannot be undone.`)) return;
        try {
            // FIXED: Send userId as Query Param (API expects searchParams)
            const res = await fetch(`/api/admin/users?userId=${userId}`, {
                method: "DELETE",
            });
            if (res.ok) {
                alert("User deleted successfully!");
                fetchAllData();
            } else {
                alert((await res.json()).error || "Failed to delete user");
            }
        } catch (e) {
            alert("Error deleting user");
        }
    };

    const admins = users.filter(u => u.role === 'admin');
    const volunteers = users.filter(u => u.role === 'volunteer');
    const guests = users.filter(u => u.role === 'user');

    return (
        <div className="min-h-screen bg-black text-white flex">
            <div className="p-8 w-full max-w-6xl mx-auto">
                <div className="flex justify-between items-center mb-6">
                    <h1 className="text-3xl font-bold font-orbitron text-secondary">Staff & Access Control</h1>
                    <Dialog>
                        <DialogTrigger asChild>
                            <Button className="bg-secondary text-black hover:bg-white"><UserPlus className="mr-2 h-4 w-4" /> Add Staff Member</Button>
                        </DialogTrigger>
                        <DialogContent className="bg-zinc-950 border-zinc-800 text-white">
                            <DialogHeader><DialogTitle>Create New Staff Account</DialogTitle></DialogHeader>
                            <div className="space-y-4 py-4">
                                <div className="space-y-2">
                                    <Label>Role</Label>
                                    <select
                                        className="w-full bg-zinc-900 border-zinc-800 rounded-md p-2"
                                        value={newUser.role}
                                        onChange={(e) => setNewUser({ ...newUser, role: e.target.value })}
                                    >
                                        <option value="admin">Admin</option>
                                        <option value="volunteer">Volunteer</option>
                                    </select>
                                </div>
                                <div className="space-y-2"><Label>Name</Label><Input value={newUser.name} onChange={e => setNewUser({ ...newUser, name: e.target.value })} className="bg-zinc-900 border-zinc-800" /></div>
                                <div className="space-y-2"><Label>Email</Label><Input value={newUser.email} onChange={e => setNewUser({ ...newUser, email: e.target.value })} className="bg-zinc-900 border-zinc-800" /></div>
                                <div className="space-y-2"><Label>Password</Label><Input value={newUser.password} onChange={e => setNewUser({ ...newUser, password: e.target.value })} className="bg-zinc-900 border-zinc-800" /></div>
                                <Button onClick={handleCreateUser} className="w-full bg-secondary text-black">Create Account</Button>
                            </div>
                        </DialogContent>
                    </Dialog>
                </div>

                <Tabs defaultValue="admins" onValueChange={setActiveTab}>
                    <TabsList className="bg-zinc-900 border-zinc-800 mb-6">
                        <TabsTrigger value="admins" className="data-[state=active]:bg-red-900/50 data-[state=active]:text-red-200">Admins ({admins.length})</TabsTrigger>
                        <TabsTrigger value="volunteers" className="data-[state=active]:bg-blue-900/50 data-[state=active]:text-blue-200">Volunteers ({volunteers.length})</TabsTrigger>
                        <TabsTrigger value="guests" className="data-[state=active]:bg-yellow-900/50 data-[state=active]:text-yellow-200">Guests ({guests.length})</TabsTrigger>
                    </TabsList>

                    <TabsContent value="admins">
                        <Card className="bg-zinc-950 border-red-900/30">
                            <CardHeader><CardTitle className="text-red-400">Administrators</CardTitle><CardDescription>Full access</CardDescription></CardHeader>
                            <CardContent>{renderTable(admins, 'admin', toggleShow, showPassword, copyToClipboard, handlePromote, handleDelete, setSelectedUser, viewReferrals)}</CardContent>
                        </Card>
                    </TabsContent>

                    <TabsContent value="volunteers">
                        {/* Leaderboard Banner */}
                        {leaderboard.length > 0 && (
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                                {leaderboard.slice(0, 3).map((lb, index) => (
                                    <Card key={index} className={`bg-gradient-to-br ${index === 0 ? 'from-yellow-900/20 to-black border-yellow-500/50' : 'from-gray-900/20 to-black border-white/10'}`}>
                                        <CardContent className="p-4 flex items-center gap-4">
                                            {index === 0 ? <Trophy className="text-yellow-500 w-8 h-8" /> : <Medal className="text-gray-400 w-6 h-6" />}
                                            <div>
                                                <div className="text-lg font-bold text-white">{lb.name}</div>
                                                <div className="text-sm text-gray-400">{lb.count} Referrals</div>
                                            </div>
                                        </CardContent>
                                    </Card>
                                ))}
                            </div>
                        )}

                        <Card className="bg-zinc-950 border-blue-900/30">
                            <CardHeader><CardTitle className="text-blue-400">Volunteers</CardTitle><CardDescription>Manage Tasks & Coupons</CardDescription></CardHeader>
                            <CardContent>{renderTable(volunteers, 'volunteer', toggleShow, showPassword, copyToClipboard, handlePromote, handleDelete, setSelectedUser, viewReferrals)}</CardContent>
                        </Card>
                    </TabsContent>

                    <TabsContent value="guests">
                        <Card className="bg-zinc-950 border-yellow-900/30">
                            <CardHeader><CardTitle className="text-yellow-400">Pending</CardTitle><CardDescription></CardDescription></CardHeader>
                            <CardContent>
                                {guests.length === 0 ? <p className="text-gray-500 text-center py-8">No guests</p> : renderTable(guests, 'user', toggleShow, showPassword, copyToClipboard, handlePromote, handleDelete, setSelectedUser, viewReferrals)}
                            </CardContent>
                        </Card>
                    </TabsContent>
                </Tabs>

                {/* Referrals Modal */}
                <Dialog open={isReferralOpen} onOpenChange={setIsReferralOpen}>
                    <DialogContent className="bg-zinc-950 border-zinc-800 text-white max-w-2xl">
                        <DialogHeader><DialogTitle>Referral Details</DialogTitle></DialogHeader>
                        <Table>
                            <TableHeader><TableRow><TableHead>Purchaser</TableHead><TableHead>Email</TableHead><TableHead>Item</TableHead><TableHead>Date</TableHead></TableRow></TableHeader>
                            <TableBody>
                                {referralDetails.length === 0 ? <TableRow><TableCell colSpan={4} className="text-center">No purchases yet.</TableCell></TableRow> :
                                    referralDetails.map((r, i) => (
                                        <TableRow key={i}><TableCell>{r.name}</TableCell><TableCell>{r.email}</TableCell><TableCell>{r.item || 'Registration'}</TableCell><TableCell>{new Date(r.date).toLocaleDateString()}</TableCell></TableRow>
                                    ))}
                            </TableBody>
                        </Table>
                    </DialogContent>
                </Dialog>

                {/* Task/Coupon Assignment Modal (Shared reusable dialog logic simplification) */}
                {selectedUser && (
                    <Dialog open={!!selectedUser} onOpenChange={() => setSelectedUser(null)}>
                        <DialogContent className="bg-zinc-950 border-zinc-800 text-white">
                            <DialogHeader><DialogTitle>Manage {selectedUser.name}</DialogTitle></DialogHeader>
                            <Tabs defaultValue="coupon">
                                <TabsList className="bg-zinc-900 w-full"><TabsTrigger value="coupon" className="flex-1">Generate Coupon</TabsTrigger><TabsTrigger value="task" className="flex-1">Assign Task</TabsTrigger></TabsList>
                                <TabsContent value="coupon" className="space-y-4 pt-4">
                                    <div className="space-y-2"><Label>Discount %</Label><Input value={couponForm.discount} onChange={e => setCouponForm({ ...couponForm, discount: e.target.value })} className="bg-zinc-900" /></div>
                                    <div className="space-y-2"><Label>Custom Code (Optional)</Label><Input value={couponForm.customCode} placeholder={`VOL-${selectedUser.name.split(' ')[0]}-...`} onChange={e => setCouponForm({ ...couponForm, customCode: e.target.value })} className="bg-zinc-900" /></div>
                                    <Button onClick={handleCreateCoupon} className="w-full bg-green-600 hover:bg-green-700">Generate Coupon</Button>
                                </TabsContent>
                                <TabsContent value="task" className="space-y-4 pt-4">
                                    <div className="space-y-2"><Label>Task Title</Label><Input value={taskForm.title} onChange={e => setTaskForm({ ...taskForm, title: e.target.value })} className="bg-zinc-900" /></div>
                                    <div className="space-y-2"><Label>Description</Label><Input value={taskForm.description} onChange={e => setTaskForm({ ...taskForm, description: e.target.value })} className="bg-zinc-900" /></div>
                                    <Button onClick={handleAssignTask} className="w-full bg-blue-600 hover:bg-blue-700">Assign Task</Button>

                                    <div className="mt-6 border-t border-white/10 pt-4">
                                        <h4 className="font-bold text-white mb-3">Assigned Tasks</h4>
                                        <div className="space-y-2 max-h-60 overflow-y-auto">
                                            {userTasks.length === 0 ? <p className="text-sm text-gray-500">No tasks assigned.</p> : userTasks.map(t => (
                                                <div key={t.id} className="bg-white/5 p-3 rounded flex justify-between items-center">
                                                    <div>
                                                        <div className="text-sm font-bold text-white">{t.title}</div>
                                                        <div className="text-xs text-gray-400">{t.status}</div>
                                                    </div>
                                                    {t.status === 'Pending Verification' && (
                                                        <Button size="sm" className="bg-green-600 h-7" onClick={() => handleVerifyTask(t.id)}>Verify</Button>
                                                    )}
                                                    {t.status === 'Completed' && <Badge className="bg-green-500/20 text-green-500">Done</Badge>}
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </TabsContent>
                            </Tabs>
                        </DialogContent>
                    </Dialog>
                )}
            </div>
        </div>
    );
}

function renderTable(users: User[], type: string, toggleShow: any, showPassword: any, copy: any, handlePromote: any, handleDelete: any, setSelectedUser: any, viewReferrals: any) {
    return (
        <Table>
            <TableHeader>
                <TableRow className="border-zinc-800 hover:bg-zinc-900/50">
                    <TableHead className="text-gray-400">Name</TableHead>
                    <TableHead className="text-gray-400">Email</TableHead>
                    <TableHead className="text-gray-400">Credentials</TableHead>
                    {type === 'volunteer' && <TableHead className="text-gray-400">Referral Code</TableHead>}
                    {type === 'volunteer' && <TableHead className="text-gray-400">Registrations</TableHead>}
                    <TableHead className="text-right text-gray-400">Actions</TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                {users.map((u) => {
                    const isSuperAdmin = u.email === 'sriramkundapur777@gmail.com';
                    return (
                        <TableRow key={u.id} className="border-zinc-800 hover:bg-zinc-900/50">
                            <TableCell className="font-medium text-white">
                                {u.name}
                                {isSuperAdmin && <span className="ml-2 text-[10px] bg-red-600 px-1 py-0.5 rounded text-white font-bold">YOU</span>}
                            </TableCell>
                            <TableCell className="text-gray-400">{u.email}</TableCell>
                            <TableCell>
                                {u.visiblePassword ? (
                                    <div className="flex items-center gap-2">
                                        <div className="bg-zinc-900 px-2 py-1 rounded font-mono text-sm border border-zinc-700 min-w-[80px]">
                                            {showPassword[u.id] ? u.visiblePassword : "••••••"}
                                        </div>
                                        <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => toggleShow(u.id)}>
                                            {showPassword[u.id] ? <EyeOff size={12} /> : <Eye size={12} />}
                                        </Button>
                                    </div>
                                ) : <Badge variant="outline" className="border-zinc-800 text-gray-500">Google</Badge>}
                            </TableCell>

                            {type === 'volunteer' && (
                                <>
                                    <TableCell>
                                        <Badge variant="secondary" className="font-mono tracking-wider cursor-pointer" onClick={() => copy(u.referralCode)}>
                                            {u.referralCode} <Copy size={10} className="ml-1" />
                                        </Badge>
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex items-center gap-2 text-green-400 font-bold cursor-pointer hover:underline" onClick={() => viewReferrals(u)}>
                                            <ArrowUpCircle size={16} /> {u.referralCount}
                                        </div>
                                    </TableCell>
                                </>
                            )}

                            <TableCell className="text-right">
                                <div className="flex justify-end gap-2 items-center">
                                    {isSuperAdmin ? (
                                        <span className="text-xs text-gray-600 italic mr-2">Protected</span>
                                    ) : (
                                        <>
                                            {/* New Manage Button for Volunteers */}
                                            {type === 'volunteer' && (
                                                <Button size="sm" variant="outline" className="border-green-900 text-green-400 hover:bg-green-900/20 h-8 mr-2" onClick={() => setSelectedUser(u)}>
                                                    <Gift size={14} className="mr-1" /> Manage
                                                </Button>
                                            )}

                                            {type === 'user' && (
                                                <>
                                                    <Button size="sm" className="bg-red-600 hover:bg-red-700 h-8" onClick={() => handlePromote(u.id, 'admin')}>Promote</Button>
                                                    <Button size="sm" className="bg-blue-600 hover:bg-blue-700 h-8" onClick={() => handlePromote(u.id, 'volunteer')}>Volunteer</Button>
                                                </>
                                            )}
                                            {type === 'volunteer' && (
                                                <Button size="sm" variant="outline" className="border-red-900 text-red-400 hover:bg-red-900/20 h-8" onClick={() => handlePromote(u.id, 'admin')}>Promote</Button>
                                            )}
                                            {type === 'admin' && (
                                                <Button size="sm" variant="outline" className="border-blue-900 text-blue-400 hover:bg-blue-900/20 h-8" onClick={() => handlePromote(u.id, 'volunteer')}>Demote</Button>
                                            )}

                                            <Button size="sm" variant="ghost" className="text-red-500 hover:bg-red-900/20 hover:text-red-400 h-8 w-8 p-0" onClick={() => handleDelete(u.id, u.email)}>
                                                <Users size={16} />
                                            </Button>
                                        </>
                                    )}
                                </div>
                            </TableCell>
                        </TableRow>
                    );
                })}
            </TableBody>
        </Table>
    );
}
