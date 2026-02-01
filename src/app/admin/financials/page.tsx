"use client";

import { useState, useRef, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { DollarSign, TrendingDown, TrendingUp, Plus, FileText, Trophy, Trash2, CheckCircle, AlertCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export default function FinancialsPage() {
    const [view, setView] = useState<"ledger" | "settlements">("ledger");
    const [expenses, setExpenses] = useState<any[]>([]);
    const [settlements, setSettlements] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [newExpense, setNewExpense] = useState({ desc: "", amount: "", cat: "Logistics", isIncome: false });
    const [filter, setFilter] = useState("All");

    useEffect(() => {
        fetchFinancials();
    }, []);

    const fetchFinancials = async () => {
        try {
            const res = await fetch('/api/admin/financials');
            const data = await res.json();
            setExpenses(data.transactions || []);
            setSettlements(data.settlements || []);
        } catch (error) {
            console.error('Error fetching financials:', error);
        }
        setLoading(false);
    };

    const handleAddTransaction = async () => {
        if (!newExpense.desc || !newExpense.amount) return;

        try {
            await fetch('/api/admin/financials', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    description: newExpense.desc,
                    category: newExpense.cat,
                    amount: newExpense.amount,
                    isIncome: newExpense.isIncome
                })
            });

            setNewExpense({ desc: "", amount: "", cat: "Logistics", isIncome: false });
            fetchFinancials();
        } catch (error) {
            console.error('Error adding transaction:', error);
        }
    };

    const handleDelete = async (id: number) => {
        if (confirm("Are you sure you want to delete this transaction?")) {
            try {
                await fetch(`/api/admin/financials?id=${id}`, { method: 'DELETE' });
                fetchFinancials();
            } catch (error) {
                console.error('Error deleting transaction:', error);
            }
        }
    };

    const handleSettle = async (id: number) => {
        if (confirm("Confirm settlement payment? This will log an expense automatically.")) {
            try {
                await fetch('/api/admin/financials/settlements', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ settlementId: id })
                });
                fetchFinancials();
            } catch (error) {
                console.error('Error settling payment:', error);
            }
        }
    };

    const totalRevenue = expenses.filter((e: any) => e.isIncome).reduce((sum: number, e: any) => sum + Number(e.amount), 0);
    const totalExpenses = expenses.filter((e: any) => !e.isIncome).reduce((sum: number, e: any) => sum + Number(e.amount), 0);
    const netProfit = totalRevenue - totalExpenses;
    const pendingSettlements = settlements.filter((s: any) => s.status === "Pending").reduce((sum: number, s: any) => sum + s.amountDue, 0);
    const filteredExpenses = filter === "All" ? expenses : expenses.filter((e: any) => e.isIncome === (filter === "Income"));

    const downloadCSV = () => {
        const headers = ["Description", "Category", "Date", "Amount", "Type"];
        const rows = expenses.map((e: any) => [
            e.description,
            e.category,
            new Date(e.date).toLocaleDateString(),
            e.amount,
            e.isIncome ? "Income" : "Expense"
        ]);

        const csvContent = "data:text/csv;charset=utf-8,"
            + [headers.join(","), ...rows.map(r => r.join(","))].join("\n");

        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", "reva_utsav_financials.csv");
        document.body.appendChild(link);
        link.click();
        link.remove();
    };

    if (loading) {
        return <div className="flex items-center justify-center min-h-screen">
            <div className="text-white">Loading financials...</div>
        </div>;
    }

    return (
        <div className="min-h-screen bg-black text-white p-8">
            <div className="max-w-7xl mx-auto space-y-8">
                <div className="flex justify-between items-center">
                    <h1 className="text-3xl font-bold font-orbitron text-secondary">Financial Command Center</h1>
                    <Button onClick={downloadCSV} variant="outline" className="border-secondary text-secondary">
                        <FileText className="mr-2" size={16} />
                        Download Financial Report
                    </Button>
                </div>

                {/* Summary Cards */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                    <Card className="bg-white/5 border-white/10">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm text-gray-400">Total Revenue</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-3xl font-bold text-green-400">₹{totalRevenue.toLocaleString()}</div>
                            <p className="text-xs text-gray-500 mt-1">Includes Sponsorships & Registrations</p>
                        </CardContent>
                    </Card>

                    <Card className="bg-white/5 border-white/10">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm text-gray-400">Total Expenses</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-3xl font-bold text-red-400">₹{totalExpenses.toLocaleString()}</div>
                            <p className="text-xs text-gray-500 mt-1">Operational Costs</p>
                        </CardContent>
                    </Card>

                    <Card className="bg-white/5 border-white/10">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm text-gray-400">Net Position</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className={`text-3xl font-bold ${netProfit >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                                ₹{netProfit.toLocaleString()}
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="bg-white/5 border-white/10">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm text-gray-400">Pending Settlements</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-3xl font-bold text-yellow-400">₹{pendingSettlements.toLocaleString()}</div>
                        </CardContent>
                    </Card>
                </div>

                {/* Tabs */}
                <div className="flex gap-4 border-b border-white/10">
                    <button
                        onClick={() => setView("ledger")}
                        className={`px-4 py-2 font-medium ${view === "ledger" ? "text-secondary border-b-2 border-secondary" : "text-gray-400"}`}
                    >
                        Ledger
                    </button>
                    <button
                        onClick={() => setView("settlements")}
                        className={`px-4 py-2 font-medium ${view === "settlements" ? "text-secondary border-b-2 border-secondary" : "text-gray-400"}`}
                    >
                        Settlements
                    </button>
                </div>

                {view === "ledger" && (
                    <div className="space-y-6">
                        {/* Add Transaction Form */}
                        <Card className="bg-white/5 border-white/10">
                            <CardHeader>
                                <CardTitle className="text-white">Log Transaction</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-4">
                                    <div className="flex gap-2">
                                        <Button
                                            variant={!newExpense.isIncome ? "primary" : "outline"}
                                            onClick={() => setNewExpense({ ...newExpense, isIncome: false })}
                                            className="flex-1"
                                        >
                                            Expense
                                        </Button>
                                        <Button
                                            variant={newExpense.isIncome ? "primary" : "outline"}
                                            onClick={() => setNewExpense({ ...newExpense, isIncome: true })}
                                            className="flex-1"
                                        >
                                            Income
                                        </Button>
                                    </div>
                                    <Input
                                        placeholder="Description"
                                        value={newExpense.desc}
                                        onChange={(e) => setNewExpense({ ...newExpense, desc: e.target.value })}
                                        className="bg-zinc-900 border-zinc-800"
                                    />
                                    <Input
                                        type="number"
                                        placeholder="Amount (₹)"
                                        value={newExpense.amount}
                                        onChange={(e) => setNewExpense({ ...newExpense, amount: e.target.value })}
                                        className="bg-zinc-900 border-zinc-800"
                                    />
                                    <select
                                        value={newExpense.cat}
                                        onChange={(e) => setNewExpense({ ...newExpense, cat: e.target.value })}
                                        className="bg-zinc-900 border border-zinc-800 rounded-md px-3 py-2 text-white"
                                    >
                                        <option value="Logistics">Logistics</option>
                                        <option value="Technical">Technical</option>
                                        <option value="Marketing">Marketing</option>
                                        <option value="Sponsorship">Sponsorship</option>
                                        <option value="Registration">Registration</option>
                                        <option value="Accommodation">Accommodation</option>
                                    </select>
                                    <Button onClick={handleAddTransaction} className="bg-secondary text-black hover:bg-yellow-500">
                                        <Plus size={16} className="mr-2" />
                                        LOG {newExpense.isIncome ? "INCOME" : "EXPENSE"}
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Ledger Table */}
                        <Card className="bg-white/5 border-white/10">
                            <CardHeader>
                                <div className="flex justify-between items-center">
                                    <CardTitle className="text-white">Ledger</CardTitle>
                                    <div className="flex gap-2">
                                        <Button
                                            variant={filter === "All" ? "primary" : "outline"}
                                            size="sm"
                                            onClick={() => setFilter("All")}
                                        >
                                            All
                                        </Button>
                                        <Button
                                            variant={filter === "Income" ? "primary" : "outline"}
                                            size="sm"
                                            onClick={() => setFilter("Income")}
                                        >
                                            Income
                                        </Button>
                                        <Button
                                            variant={filter === "Expense" ? "primary" : "outline"}
                                            size="sm"
                                            onClick={() => setFilter("Expense")}
                                        >
                                            Expense
                                        </Button>
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent>
                                {filteredExpenses.length === 0 ? (
                                    <div className="text-center py-12 text-gray-400">No transactions yet</div>
                                ) : (
                                    <div className="space-y-2">
                                        {filteredExpenses.map((expense: any) => (
                                            <div key={expense.id} className="flex items-center justify-between p-4 bg-zinc-900 rounded-lg hover:bg-zinc-800 transition">
                                                <div className="flex-1">
                                                    <div className="font-medium text-white">{expense.description}</div>
                                                    <div className="text-sm text-gray-400">{expense.category} • {new Date(expense.date).toLocaleDateString()}</div>
                                                </div>
                                                <div className="flex items-center gap-4">
                                                    <div className={`text-xl font-bold ${expense.isIncome ? 'text-green-400' : 'text-red-400'}`}>
                                                        {expense.isIncome ? '+' : '-'}₹{Number(expense.amount).toLocaleString()}
                                                    </div>
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() => handleDelete(expense.id)}
                                                        className="text-red-400 hover:text-red-300"
                                                    >
                                                        <Trash2 size={16} />
                                                    </Button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </div>
                )}

                {view === "settlements" && (
                    <Card className="bg-white/5 border-white/10">
                        <CardHeader>
                            <CardTitle className="text-white">PG & Partner Settlements</CardTitle>
                            <CardDescription>Track accommodation partner payments</CardDescription>
                        </CardHeader>
                        <CardContent>
                            {settlements.length === 0 ? (
                                <div className="text-center py-12 text-gray-400">No settlements yet</div>
                            ) : (
                                <div className="space-y-4">
                                    {settlements.map((settlement: any) => (
                                        <div key={settlement.id} className="flex items-center justify-between p-4 bg-zinc-900 rounded-lg">
                                            <div>
                                                <div className="font-medium text-white">{settlement.name}</div>
                                                <div className="text-sm text-gray-400">{settlement.type} • Last Paid: {settlement.lastPaidDate ? new Date(settlement.lastPaidDate).toLocaleDateString() : 'Never'}</div>
                                            </div>
                                            <div className="flex items-center gap-4">
                                                <div className="text-right">
                                                    <div className="text-xl font-bold text-yellow-400">₹{settlement.amountDue.toLocaleString()}</div>
                                                    <Badge variant={settlement.status === "Settled" ? "default" : "destructive"}>
                                                        {settlement.status}
                                                    </Badge>
                                                </div>
                                                {settlement.status === "Pending" && settlement.amountDue > 0 && (
                                                    <Button
                                                        onClick={() => handleSettle(settlement.id)}
                                                        className="bg-green-600 hover:bg-green-700"
                                                    >
                                                        <CheckCircle size={16} className="mr-2" />
                                                        Settle Payment
                                                    </Button>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </CardContent>
                    </Card>
                )}
            </div>
        </div >
    );
}
