"use client";

import Link from "next/link";
import { LogOut } from "lucide-react";

export default function RegistrationDeskLayout({ children }: { children: React.ReactNode }) {
    return (
        <div className="min-h-screen bg-black text-white flex flex-col">
            <header className="h-16 border-b border-white/10 flex items-center justify-between px-6 bg-black/50 backdrop-blur-sm sticky top-0 z-50">
                <div className="flex items-center gap-2">
                    <span className="text-xl font-bold font-orbitron tracking-wider">
                        REVA<span className="text-secondary">DESK</span>
                    </span>
                    <span className="text-xs bg-secondary/10 text-secondary px-2 py-0.5 rounded-full border border-secondary/20">
                        VOLUNTEER
                    </span>
                </div>
                <Link href="/staff-login" className="flex items-center gap-2 text-sm text-gray-400 hover:text-red-400 transition-colors">
                    <LogOut size={16} /> Logout
                </Link>
            </header>
            <main className="flex-1 p-6">
                {children}
            </main>
        </div>
    );
}
