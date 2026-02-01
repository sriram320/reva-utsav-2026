"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft, Mail, Phone, MapPin, Calendar, Shield, CreditCard, Activity } from "lucide-react";
import Link from "next/link";

export default function UserProfilePage() {
    const params = useParams();
    const userId = params.id as string;

    // Mock User Data (In a real app, fetch based on userId)
    const user = {
        id: userId,
        name: "Rahul Sharma",
        email: "rahul@reva.edu",
        role: "Student",
        phone: "+91 98765 43210",
        department: "Computer Science",
        year: "3rd Year",
        status: "Active",
        joined: "Aug 2023",
        registrations: [
            { event: "RoboWars", role: "Team Leader", team: "Mecha Titans", status: "Confirmed", date: "Jan 15, 2026" },
            { event: "Hackathon", role: "Member", team: "CodeX", status: "Waitlist", date: "Jan 18, 2026" }
        ],
        transactions: [
            { id: "TXN_12345", desc: "RoboWars Registration", amount: 500, date: "Jan 15, 2026", status: "Success" }
        ]
    };

    return (
        <div className="space-y-8">
            {/* Header */}
            <div className="flex items-center gap-4">
                <Link href="/admin/events">
                    <Button variant="ghost" size="icon" className="hover:bg-white/10">
                        <ArrowLeft size={20} />
                    </Button>
                </Link>
                <div>
                    <h1 className="text-3xl font-bold font-orbitron text-white">{user.name}</h1>
                    <div className="flex items-center gap-2 text-sm text-gray-400">
                        <Badge variant="outline" className="text-blue-400 border-blue-400/50">{user.role}</Badge>
                        <span>•</span>
                        <span className="font-mono">{user.id}</span>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left Column: Personal Info */}
                <Card className="bg-white/5 border-white/10 h-fit">
                    <CardHeader>
                        <CardTitle className="text-white">Personal Details</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex items-center gap-3 text-sm">
                            <Mail size={16} className="text-gray-500" />
                            <span className="text-gray-300">{user.email}</span>
                        </div>
                        <div className="flex items-center gap-3 text-sm">
                            <Phone size={16} className="text-gray-500" />
                            <span className="text-gray-300">{user.phone}</span>
                        </div>
                        <div className="flex items-center gap-3 text-sm">
                            <MapPin size={16} className="text-gray-500" />
                            <span className="text-gray-300">{user.department}, {user.year}</span>
                        </div>
                        <div className="flex items-center gap-3 text-sm">
                            <Calendar size={16} className="text-gray-500" />
                            <span className="text-gray-300">Joined {user.joined}</span>
                        </div>
                        <div className="flex items-center gap-3 text-sm">
                            <Shield size={16} className="text-gray-500" />
                            <span className="text-green-400">{user.status}</span>
                        </div>
                    </CardContent>
                </Card>

                {/* Right Column: Activity Tabs */}
                <div className="lg:col-span-2">
                    <Tabs defaultValue="registrations" className="w-full">
                        <TabsList className="bg-white/5 border border-white/10">
                            <TabsTrigger value="registrations">Registrations</TabsTrigger>
                            <TabsTrigger value="finance">Financials</TabsTrigger>
                            <TabsTrigger value="logs">Activity Logs</TabsTrigger>
                        </TabsList>

                        <TabsContent value="registrations" className="mt-4">
                            <Card className="bg-white/5 border-white/10">
                                <CardHeader>
                                    <CardTitle className="text-white">Event Participation</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-4">
                                        {user.registrations.map((reg, i) => (
                                            <div key={i} className="flex justify-between items-center p-4 bg-black/20 rounded border border-white/5">
                                                <div>
                                                    <h4 className="font-bold text-white">{reg.event}</h4>
                                                    <p className="text-sm text-gray-400">{reg.team} • {reg.role}</p>
                                                </div>
                                                <div className="text-right">
                                                    <Badge variant="secondary" className={reg.status === "Confirmed" ? "bg-green-500/20 text-green-400" : "bg-yellow-500/20 text-yellow-400"}>
                                                        {reg.status}
                                                    </Badge>
                                                    <p className="text-xs text-gray-500 mt-1">{reg.date}</p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </CardContent>
                            </Card>
                        </TabsContent>

                        <TabsContent value="finance" className="mt-4">
                            <Card className="bg-white/5 border-white/10">
                                <CardHeader>
                                    <CardTitle className="text-white">Transaction History</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-4">
                                        {user.transactions.map((txn, i) => (
                                            <div key={i} className="flex justify-between items-center p-4 bg-black/20 rounded border border-white/5">
                                                <div className="flex items-center gap-3">
                                                    <div className="p-2 bg-white/5 rounded">
                                                        <CreditCard size={16} className="text-gray-400" />
                                                    </div>
                                                    <div>
                                                        <h4 className="font-medium text-white">{txn.desc}</h4>
                                                        <p className="text-xs text-gray-500 font-mono">{txn.id} • {txn.date}</p>
                                                    </div>
                                                </div>
                                                <div className="text-right">
                                                    <p className="font-bold text-white">₹{txn.amount}</p>
                                                    <span className="text-xs text-green-400">{txn.status}</span>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </CardContent>
                            </Card>
                        </TabsContent>

                        <TabsContent value="logs" className="mt-4">
                            <Card className="bg-white/5 border-white/10">
                                <CardContent className="pt-6">
                                    <div className="text-center text-gray-500 py-8">
                                        <Activity size={32} className="mx-auto mb-2 opacity-50" />
                                        <p>No recent activity logs found.</p>
                                    </div>
                                </CardContent>
                            </Card>
                        </TabsContent>
                    </Tabs>
                </div>
            </div>
        </div>
    );
}
