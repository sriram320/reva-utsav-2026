"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, User, LogOut, Settings } from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
    { name: "Home", href: "/" },
    { name: "Events", href: "/events" },
    { name: "Workshops", href: "/workshops" },
    { name: "Accommodation", href: "/accommodation" },
    { name: "Schedule", href: "/schedule" },
    { name: "Contact", href: "/contact" },
];

export function Navbar() {
    const router = useRouter();
    const [isScrolled, setIsScrolled] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [user, setUser] = useState<{ name: string; email: string } | null>(null);
    const [showUserMenu, setShowUserMenu] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 50);
        };
        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    useEffect(() => {
        checkAuth();
    }, []);

    const checkAuth = async () => {
        try {
            const res = await fetch("/api/auth/me");
            if (res.ok) {
                const data = await res.json();
                setUser(data.user);
            }
        } catch (err) {
            // Not authenticated, that's fine
        }
    };

    const handleLogout = async () => {
        try {
            await fetch("/api/auth/logout", { method: "POST" });
            setUser(null);
            router.push("/");
        } catch (err) {
            console.error("Logout failed:", err);
        }
    };

    return (
        <nav
            className={cn(
                "fixed top-0 left-0 right-0 z-50 transition-all duration-300",
                isScrolled
                    ? "bg-primary/70 backdrop-blur-md border-b border-white/10 py-4"
                    : "bg-transparent py-6"
            )}
        >
            <div className="container mx-auto px-4 flex items-center justify-between">
                {/* Logo */}
                <Link href="/" className="text-2xl font-bold font-orbitron tracking-wider text-white">
                    REVA<span className="text-secondary">UTSAV</span>
                </Link>

                {/* Desktop Navigation */}
                <div className="hidden md:flex items-center space-x-6">
                    {navItems.map((item) => (
                        <Link
                            key={item.name}
                            href={item.href}
                            className="text-sm font-medium text-gray-300 hover:text-secondary transition-colors"
                        >
                            {item.name}
                        </Link>
                    ))}
                    <div className="h-6 w-px bg-white/10 mx-2" />
                    <Link href="/staff-login">
                        <Button variant="ghost" size="sm" className="text-gray-400 hover:text-white">
                            Admin Portal
                        </Button>
                    </Link>

                    {user ? (
                        <div className="relative">
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setShowUserMenu(!showUserMenu)}
                                className="flex items-center gap-2"
                            >
                                <User className="w-4 h-4" />
                                {user.name}
                            </Button>

                            {showUserMenu && (
                                <div className="absolute right-0 mt-2 w-48 bg-black/90 backdrop-blur-md border border-white/10 rounded-lg shadow-lg py-2">
                                    <Link href="/dashboard">
                                        <button className="w-full text-left px-4 py-2 text-sm text-gray-300 hover:bg-white/10 hover:text-white flex items-center gap-2">
                                            <User className="w-4 h-4" />
                                            Dashboard
                                        </button>
                                    </Link>
                                    <Link href="/profile/edit">
                                        <button className="w-full text-left px-4 py-2 text-sm text-gray-300 hover:bg-white/10 hover:text-white flex items-center gap-2">
                                            <Settings className="w-4 h-4" />
                                            Edit Profile
                                        </button>
                                    </Link>
                                    <div className="border-t border-white/10 my-1"></div>
                                    <button
                                        onClick={handleLogout}
                                        className="w-full text-left px-4 py-2 text-sm text-red-400 hover:bg-white/10 hover:text-red-300 flex items-center gap-2"
                                    >
                                        <LogOut className="w-4 h-4" />
                                        Logout
                                    </button>
                                </div>
                            )}
                        </div>
                    ) : (
                        <>
                            <Link href="/login">
                                <Button variant="outline" size="sm">
                                    Login
                                </Button>
                            </Link>
                            <Link href="/register">
                                <Button variant="primary" size="sm" glow>
                                    Register
                                </Button>
                            </Link>
                        </>
                    )}
                </div>

                {/* Mobile Menu Button */}
                <div className="md:hidden">
                    <button
                        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                        className="text-white p-2"
                    >
                        {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
                    </button>
                </div>
            </div>

            {/* Mobile Menu */}
            <AnimatePresence>
                {isMobileMenuOpen && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        className="md:hidden bg-black/95 backdrop-blur-md border-t border-white/10"
                    >
                        <div className="container mx-auto px-4 py-4 space-y-2">
                            {navItems.map((item) => (
                                <Link
                                    key={item.name}
                                    href={item.href}
                                    className="block py-2 text-gray-300 hover:text-secondary transition-colors"
                                    onClick={() => setIsMobileMenuOpen(false)}
                                >
                                    {item.name}
                                </Link>
                            ))}
                            <div className="border-t border-white/10 my-2"></div>
                            {user ? (
                                <>
                                    <div className="py-2 text-sm text-gray-400">
                                        Logged in as: <span className="text-white">{user.name}</span>
                                    </div>
                                    <Link href="/dashboard" onClick={() => setIsMobileMenuOpen(false)}>
                                        <Button variant="outline" size="sm" className="w-full mb-2">
                                            Dashboard
                                        </Button>
                                    </Link>
                                    <Link href="/profile/edit" onClick={() => setIsMobileMenuOpen(false)}>
                                        <Button variant="outline" size="sm" className="w-full mb-2">
                                            Edit Profile
                                        </Button>
                                    </Link>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        className="w-full text-red-400"
                                        onClick={handleLogout}
                                    >
                                        Logout
                                    </Button>
                                </>
                            ) : (
                                <>
                                    <Link href="/login" onClick={() => setIsMobileMenuOpen(false)}>
                                        <Button variant="outline" size="sm" className="w-full mb-2">
                                            Login
                                        </Button>
                                    </Link>
                                    <Link href="/register" onClick={() => setIsMobileMenuOpen(false)}>
                                        <Button variant="primary" size="sm" glow className="w-full">
                                            Register
                                        </Button>
                                    </Link>
                                </>
                            )}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </nav>
    );
}
