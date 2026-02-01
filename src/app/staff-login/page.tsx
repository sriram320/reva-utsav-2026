"use client";

import { useState, useEffect } from "react";
import { signIn, signOut } from "next-auth/react"; // signOut needs client config or just hit endpoint
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Loader2, TicketPercent, ShieldAlert, LogOut } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function StaffLoginPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [session, setSession] = useState<any>(null);
    const [error, setError] = useState("");
    const [formData, setFormData] = useState({ email: "", password: "" });

    useEffect(() => {
        // Check if already logged in (to handle Stuck/Unauthorized state)
        fetch("/api/auth/session").then(res => res.json()).then(data => {
            if (data && data.user) {
                setSession(data);
            }
        });
    }, []);

    const handleSignOut = async () => {
        await signOut({ callbackUrl: "/staff-login" });
    };

    const handleGoogleLogin = async (role: 'admin') => {
        setLoading(true);
        await signIn("google", { callbackUrl: '/admin' });
    };

    const handleCredentialsLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError("");

        try {
            const res = await signIn("credentials", {
                email: formData.email,
                password: formData.password,
                redirect: false,
            });

            if (res?.error) {
                // User requested specific error message
                throw new Error("Incorrect Password. Contact Admin.");
            }

            // Success
            router.push("/registration-desk");
        } catch (err: any) {
            setError(err.message);
            setLoading(false);
        }
    };

    if (session) {
        return (
            <main className="min-h-screen bg-black text-white flex items-center justify-center p-4">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-zinc-900/50 via-black to-black opacity-50 z-0" />
                <Card className="w-full max-w-md bg-zinc-950 border-red-900 z-10 relative shadow-2xl">
                    <CardHeader className="text-center">
                        <div className="mx-auto bg-red-900/20 p-3 rounded-full w-fit mb-4">
                            <ShieldAlert className="w-10 h-10 text-red-500" />
                        </div>
                        <CardTitle className="text-xl font-bold font-orbitron text-red-100">Access Restricted</CardTitle>
                        <CardDescription>
                            You are logged in as <span className="text-white font-mono">{session.user.email}</span>
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="text-center space-y-4">
                        <div className="p-4 bg-red-950/30 border border-red-900/50 rounded-lg">
                            <p className="text-sm text-red-200">
                                Current Role: <span className="font-bold uppercase text-red-400">{session.user.role || 'Guest'}</span>
                            </p>
                            <p className="text-xs text-gray-400 mt-2">
                                You do not have permission to access the requested page.
                            </p>
                        </div>
                    </CardContent>
                    <CardFooter>
                        <Button variant="destructive" className="w-full" onClick={handleSignOut}>
                            <LogOut className="mr-2 h-4 w-4" /> Sign Out & Try Again
                        </Button>
                    </CardFooter>
                </Card>
            </main>
        );
    }


    return (
        <main className="min-h-screen bg-black text-white flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-blue-900/10 via-black to-black opacity-50 z-0" />

            <Card className="w-full max-w-md bg-zinc-950 border-zinc-800 z-10 relative shadow-2xl">
                <CardHeader className="text-center pb-2">
                    <CardTitle className="text-2xl font-bold font-orbitron">Reva Utsav Portal</CardTitle>
                    <CardDescription>Secure Access via Google</CardDescription>
                </CardHeader>
                <CardContent>
                    <Tabs defaultValue="staff" className="w-full">
                        <TabsList className="grid w-full grid-cols-2 mb-6 bg-zinc-900">
                            <TabsTrigger value="staff">Registration Desk</TabsTrigger>
                            <TabsTrigger value="admin">Admin Command</TabsTrigger>
                        </TabsList>

                        {/* STAFF LOGIN (Credentials) */}
                        <TabsContent value="staff">
                            <div className="text-center mb-6">
                                <div className="mx-auto bg-blue-900/20 p-3 rounded-full w-fit mb-2 border border-blue-500/20">
                                    <TicketPercent className="w-8 h-8 text-blue-400" />
                                </div>
                                <h3 className="text-lg font-bold text-blue-100">Volunteer Access</h3>
                                <p className="text-xs text-blue-200/50">For Registration Desk Operations</p>
                            </div>
                            <form onSubmit={handleCredentialsLogin} className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="staff-email">Staff Email</Label>
                                    <Input
                                        id="staff-email"
                                        type="email"
                                        placeholder="volunteer@reva.edu"
                                        className="bg-zinc-900 border-zinc-800"
                                        value={formData.email}
                                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                        required
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="staff-password">Password</Label>
                                    <Input
                                        id="staff-password"
                                        type="password"
                                        placeholder="••••••••"
                                        className="bg-zinc-900 border-zinc-800"
                                        value={formData.password}
                                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                        required
                                    />
                                </div>
                                {error && <div className="text-red-500 text-xs text-center">{error}</div>}
                                <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700" disabled={loading}>
                                    {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Access Desk"}
                                </Button>
                            </form>
                        </TabsContent>

                        {/* ADMIN LOGIN */}
                        <TabsContent value="admin" className="space-y-4">
                            <div className="text-center mb-6">
                                <div className="mx-auto bg-red-900/20 p-3 rounded-full w-fit mb-2 border border-red-500/20">
                                    <ShieldAlert className="w-8 h-8 text-red-500" />
                                </div>
                                <h3 className="text-lg font-bold text-red-100">Command Center</h3>
                                <p className="text-xs text-red-200/50">Admins Only</p>
                            </div>

                            <Button
                                onClick={() => handleGoogleLogin('admin')}
                                className="w-full bg-white text-black hover:bg-gray-200 font-bold py-6 flex items-center gap-3 justify-center"
                                disabled={loading}
                            >
                                {loading ? <Loader2 className="animate-spin" /> : (
                                    <>
                                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" className="w-6 h-6">
                                            <path fill="#FFC107" d="M43.6 20c0-1.8-.2-3.6-.5-5.3H24v10h11c-.5 2.5-1.9 4.6-4 6l6.6 5.1c3.9-3.6 6-8.9 6-14.8z" />
                                            <path fill="#FF3D00" d="M24 40c5.4 0 9.9-1.8 13.2-4.9l-6.6-5.1c-1.8 1.2-4.1 1.9-6.6 1.9-5.1 0-9.4-3.5-10.9-8.1l-6.4 4.9C10.1 35.6 16.5 40 24 40z" />
                                            <path fill="#4CAF50" d="M13.1 23.8c-.4-1.2-.6-2.5-.6-3.8s.2-2.6.6-3.8l-6.4-4.9C3.7 15.3 2 19.5 2 24s1.7 8.7 4.7 12.7l6.4-4.9z" />
                                            <path fill="#1976D2" d="M24 8c2.9 0 5.5 1 7.6 2.9l5.7-5.7C33.9 2 29.3 0 24 0 16.5 0 10.1 4.4 6.7 11.3l6.4 4.9C14.6 11.5 18.9 8 24 8z" />
                                        </svg>
                                        Sign in with Google
                                    </>
                                )}
                            </Button>
                        </TabsContent>
                    </Tabs>
                </CardContent>
            </Card>
        </main>
    );
}
