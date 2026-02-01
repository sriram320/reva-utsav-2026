"use client";

import { useState } from "react";
import Link from "next/link";
import { signOut } from "next-auth/react";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Users, Calendar, Settings, LogOut, Truck, ScanLine, Ticket, Star, DollarSign, Megaphone, Home, BarChart3 } from "lucide-react";
import { cn } from "@/lib/utils";

const sidebarItems = [
    { icon: LayoutDashboard, label: "Dashboard", href: "/admin" },
    { icon: Users, label: "Participants Database", href: "/admin/users" },
    { icon: Calendar, label: "Event Management", href: "/admin/events" },
    { icon: Ticket, label: "Ticketing", href: "/admin/ticketing" },
    { icon: Truck, label: "Volunteers & Logistics", href: "/admin/volunteers" },
    { icon: Home, label: "Accommodation", href: "/admin/accommodation" },
    { icon: DollarSign, label: "Financials", href: "/admin/financials" },
    { icon: ScanLine, label: "Registration Desk", href: "/admin/scanner" },
    { icon: Settings, label: "System Settings", href: "/admin/settings" },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();

    return (
        <div className="min-h-screen bg-black text-white flex">
            {/* Sidebar */}
            <aside className="w-64 border-r border-white/10 bg-black/50 fixed h-full z-10">
                <div className="p-6">
                    <div className="flex items-center gap-3">
                        <img src="/logo-icon.png" alt="REVA" className="w-10 h-10 object-contain" />
                        <h1 className="text-xl font-bold font-orbitron tracking-wider">
                            REVA<span className="text-secondary">ADMIN</span>
                        </h1>
                    </div>
                </div>
                <nav className="px-4 space-y-2">
                    {sidebarItems.map((item) => {
                        const isActive = pathname === item.href;
                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                className={cn(
                                    "flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors",
                                    isActive
                                        ? "bg-secondary/10 text-secondary"
                                        : "text-gray-400 hover:bg-white/5 hover:text-white"
                                )}
                            >
                                <item.icon size={20} />
                                <span className="font-medium">{item.label}</span>
                            </Link>
                        );
                    })}
                </nav>
                <div className="absolute bottom-8 left-0 right-0 px-4">
                    <button
                        onClick={() => signOut({ callbackUrl: "/staff-login" })}
                        className="flex items-center space-x-3 px-4 py-3 rounded-lg text-red-400 hover:bg-red-500/10 w-full transition-colors"
                    >
                        <LogOut size={20} />
                        <span className="font-medium">Logout</span>
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <div className="flex-1 ml-64">
                <header className="h-16 border-b border-white/10 flex items-center justify-between px-8 bg-black/50 backdrop-blur-sm sticky top-0 z-10">
                    <h2 className="text-xl font-semibold">
                        {sidebarItems.find(i => i.href === pathname)?.label || "Overview"}
                    </h2>
                    <div className="flex items-center space-x-4">
                        <div className="w-8 h-8 rounded-full bg-secondary/20 flex items-center justify-center text-secondary font-bold">
                            A
                        </div>
                        <span className="text-sm font-medium">Admin User</span>
                    </div>
                </header>
                <main className="p-8">
                    {children}
                </main>
            </div>
        </div>
    );
}
