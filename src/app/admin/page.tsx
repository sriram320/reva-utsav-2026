"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { DollarSign, Users, Ticket, TrendingUp, Download, Calendar } from "lucide-react";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, PieChart, Pie, Cell, BarChart, Bar, Legend } from "recharts";

const COLORS = ['#8B5CF6', '#EC4899', '#10B981', '#F59E0B'];

export default function AdminDashboard() {
    const [stats, setStats] = useState({
        totalRevenue: 0,
        totalExpenses: 0,
        totalRegistrations: 0,
        totalTickets: 0,
        totalUsers: 0
    });
    const [transactions, setTransactions] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchStats();
    }, []);

    const fetchStats = async () => {
        try {
            // Fetch financials for revenue
            const financialsRes = await fetch('/api/admin/financials');
            const financialsData = await financialsRes.json();
            const revenue = financialsData.summary?.totalRevenue || 0;
            const expenses = financialsData.summary?.totalExpenses || 0;
            const allTransactions = financialsData.transactions || [];

            // Fetch ticketing for tickets sold
            const ticketingRes = await fetch('/api/admin/ticketing');
            const ticketingData = await ticketingRes.json();
            const tickets = ticketingData.totalSold || 0;

            // Fetch users for total registrations
            const usersRes = await fetch('/api/admin/users');
            const usersData = await usersRes.json();
            const users = usersData.users?.length || 0;

            setStats({
                totalRevenue: revenue,
                totalExpenses: expenses,
                totalRegistrations: users,
                totalTickets: tickets,
                totalUsers: users
            });
            setTransactions(allTransactions);
        } catch (error) {
            console.error('Error fetching stats:', error);
        }
        setLoading(false);
    };

    // Calculate revenue breakdown from transactions
    const revenueData = [
        {
            name: "Sponsorships",
            value: transactions.filter(t => t.isIncome && t.category === 'Sponsorship').reduce((sum, t) => sum + t.amount, 0)
        },
        {
            name: "Registrations",
            value: transactions.filter(t => t.isIncome && t.category === 'Registration').reduce((sum, t) => sum + t.amount, 0)
        },
        {
            name: "Other",
            value: transactions.filter(t => t.isIncome && t.category !== 'Sponsorship' && t.category !== 'Registration').reduce((sum, t) => sum + t.amount, 0)
        },
    ].filter(item => item.value > 0);

    // Calculate expense breakdown
    const expenseData = [
        {
            name: "Technical",
            value: transactions.filter(t => !t.isIncome && t.category === 'Technical').reduce((sum, t) => sum + t.amount, 0)
        },
        {
            name: "Marketing",
            value: transactions.filter(t => !t.isIncome && t.category === 'Marketing').reduce((sum, t) => sum + t.amount, 0)
        },
        {
            name: "Logistics",
            value: transactions.filter(t => !t.isIncome && t.category === 'Logistics').reduce((sum, t) => sum + t.amount, 0)
        },
        {
            name: "Other",
            value: transactions.filter(t => !t.isIncome && !['Technical', 'Marketing', 'Logistics'].includes(t.category)).reduce((sum, t) => sum + t.amount, 0)
        },
    ].filter(item => item.value > 0);

    const handleExport = () => {
        alert("Downloading Comprehensive Admin Report...");
    };

    if (loading) {
        return <div className="flex items-center justify-center min-h-screen">
            <div className="text-white">Loading dashboard...</div>
        </div>;
    }

    return (
        <div className="space-y-8">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold font-orbitron text-white">Dashboard Overview</h1>
                    <p className="text-gray-400">Real-time event pulse and analytics</p>
                </div>
                <Button onClick={handleExport} className="bg-secondary text-black hover:bg-secondary/80 font-bold">
                    <Download className="mr-2" size={18} /> Export Data
                </Button>
            </div>

            {/* Stats Overview */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <Card className="bg-white/5 border-white/10">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium text-gray-400">Total Revenue</CardTitle>
                        <DollarSign size={16} className="text-green-400" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-white">₹{stats.totalRevenue.toLocaleString()}</div>
                        <p className="text-xs text-green-400 flex items-center mt-1">
                            <TrendingUp size={12} className="mr-1" /> From financials
                        </p>
                    </CardContent>
                </Card>

                <Card className="bg-white/5 border-white/10">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium text-gray-400">Total Users</CardTitle>
                        <Users size={16} className="text-blue-400" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-white">{stats.totalUsers}</div>
                        <p className="text-xs text-blue-400 mt-1">Registered users</p>
                    </CardContent>
                </Card>

                <Card className="bg-white/5 border-white/10">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium text-gray-400">Tickets Sold</CardTitle>
                        <Ticket size={16} className="text-purple-400" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-white">{stats.totalTickets}</div>
                        <p className="text-xs text-gray-400 mt-1">Total sales</p>
                    </CardContent>
                </Card>

                <Card className="bg-white/5 border-white/10">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium text-gray-400">Net Profit</CardTitle>
                        <Calendar size={16} className="text-yellow-400" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-white">₹{(stats.totalRevenue - stats.totalExpenses).toLocaleString()}</div>
                        <p className="text-xs text-yellow-400 mt-1">Revenue - Expenses</p>
                    </CardContent>
                </Card>
            </div>

            {/* Analytics Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Revenue Sources */}
                {revenueData.length > 0 && (
                    <Card className="bg-white/5 border-white/10">
                        <CardHeader>
                            <CardTitle className="text-white">Revenue Sources</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <ResponsiveContainer width="100%" height={300}>
                                <PieChart>
                                    <Pie
                                        data={revenueData}
                                        cx="50%"
                                        cy="50%"
                                        labelLine={false}
                                        label={({ name, percent }) => `${name}: ${((percent || 0) * 100).toFixed(0)}%`}
                                        outerRadius={80}
                                        fill="#8884d8"
                                        dataKey="value"
                                    >
                                        {revenueData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                        ))}
                                    </Pie>
                                    <RechartsTooltip
                                        contentStyle={{ backgroundColor: '#18181b', border: '1px solid #27272a' }}
                                        formatter={(value: any) => `₹${value.toLocaleString()}`}
                                    />
                                </PieChart>
                            </ResponsiveContainer>
                        </CardContent>
                    </Card>
                )}

                {/* Expense Breakdown */}
                {expenseData.length > 0 && (
                    <Card className="bg-white/5 border-white/10">
                        <CardHeader>
                            <CardTitle className="text-white">Expense Breakdown</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <ResponsiveContainer width="100%" height={300}>
                                <BarChart data={expenseData}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
                                    <XAxis dataKey="name" stroke="#71717a" />
                                    <YAxis stroke="#71717a" />
                                    <RechartsTooltip
                                        contentStyle={{ backgroundColor: '#18181b', border: '1px solid #27272a' }}
                                        formatter={(value: any) => `₹${value.toLocaleString()}`}
                                    />
                                    <Bar dataKey="value" fill="#F7941D" />
                                </BarChart>
                            </ResponsiveContainer>
                        </CardContent>
                    </Card>
                )}
            </div>

            {/* Quick Links */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card className="bg-white/5 border-white/10 hover:border-secondary/50 transition cursor-pointer">
                    <CardHeader>
                        <CardTitle className="text-white">Financials</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-gray-400 text-sm mb-4">Manage transactions and settlements</p>
                        <Button className="w-full bg-secondary text-black hover:bg-yellow-500" onClick={() => window.location.href = '/admin/financials'}>
                            View Financials
                        </Button>
                    </CardContent>
                </Card>

                <Card className="bg-white/5 border-white/10 hover:border-secondary/50 transition cursor-pointer">
                    <CardHeader>
                        <CardTitle className="text-white">Ticketing</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-gray-400 text-sm mb-4">Manage ticket batches and sales</p>
                        <Button className="w-full bg-secondary text-black hover:bg-yellow-500" onClick={() => window.location.href = '/admin/ticketing'}>
                            View Ticketing
                        </Button>
                    </CardContent>
                </Card>

                <Card className="bg-white/5 border-white/10 hover:border-secondary/50 transition cursor-pointer">
                    <CardHeader>
                        <CardTitle className="text-white">Accommodation</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-gray-400 text-sm mb-4">Manage accommodation requests</p>
                        <Button className="w-full bg-secondary text-black hover:bg-yellow-500" onClick={() => window.location.href = '/admin/accommodation'}>
                            View Accommodation
                        </Button>
                    </CardContent>
                </Card>

                <Card className="bg-white/5 border-white/10 hover:border-secondary/50 transition cursor-pointer border-l-4 border-l-yellow-500">
                    <CardHeader>
                        <CardTitle className="text-white">Approvals</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-gray-400 text-sm mb-4">Verify Reva Student passes</p>
                        <Button className="w-full" variant="outline" onClick={() => window.location.href = '/admin/ticketing'}>
                            Pending Queue
                        </Button>
                    </CardContent>
                </Card>
            </div>

            {/* Additional Quick Access - Grid updated to 4 columns or handled automatically by flex/grid */}

            {/* Additional Quick Access */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card className="bg-white/5 border-white/10">
                    <CardHeader>
                        <CardTitle className="text-white">User Management</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-gray-400 text-sm mb-4">View and manage all users and participants</p>
                        <Button className="w-full" variant="outline" onClick={() => window.location.href = '/admin/users'}>
                            Manage Users
                        </Button>
                    </CardContent>
                </Card>

                <Card className="bg-white/5 border-white/10">
                    <CardHeader>
                        <CardTitle className="text-white">Events</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-gray-400 text-sm mb-4">Create and manage event listings</p>
                        <Button className="w-full" variant="outline" onClick={() => window.location.href = '/admin/events'}>
                            Manage Events
                        </Button>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
