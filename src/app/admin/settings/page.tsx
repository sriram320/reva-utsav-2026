"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Save, AlertTriangle, Shield, Globe } from "lucide-react";
import { motion } from "framer-motion";

export default function SettingsPage() {
    const [settings, setSettings] = useState({
        site_name: "Reva Utsav 2026",
        contact_email: "utsav@reva.edu.in",
        maintenance_mode: "false",
        registration_open: "true",
        public_api: "false",
        theme_color: "#FF4F00",
        accommodation_open: "true"
    });

    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        const fetchSettings = async () => {
            try {
                const res = await fetch('/api/admin/settings');
                if (res.ok) {
                    const data = await res.json();

                    // Merge with defaults, ensuring all keys exist
                    setSettings(prev => ({
                        ...prev,
                        ...data
                    }));
                }
            } catch (e) {
                console.error("Failed to load settings", e);
            }
        };
        fetchSettings();
    }, []);

    const handleSave = async () => {
        setIsSaving(true);
        try {
            // Save each setting
            const promises = Object.entries(settings).map(([key, value]) =>
                fetch('/api/admin/settings', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ key, value })
                })
            );

            await Promise.all(promises);
            // Re-fetch to confirm? Or just assume success.
            setTimeout(() => setIsSaving(false), 1000);
        } catch (e) {
            console.error("Failed to save", e);
            setIsSaving(false);
        }
    };

    const updateSetting = (key: string, value: string) => {
        setSettings(prev => ({ ...prev, [key]: value }));
    };

    return (
        <div className="space-y-8">
            <div className="flex justify-between items-center">
                <h1 className="text-4xl font-black font-orbitron text-white">System Settings</h1>
                <Button onClick={handleSave} disabled={isSaving} className={isSaving ? "bg-green-500" : ""}>
                    <Save size={16} className="mr-2" />
                    {isSaving ? "Saved!" : "Save Changes"}
                </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* General Settings */}
                <Card className="bg-white/5 border-white/10">
                    <CardHeader>
                        <CardTitle className="text-white flex items-center gap-2">
                            <Globe size={20} className="text-blue-400" /> General Information
                        </CardTitle>
                        <CardDescription>Basic configuration for the event portal.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <Label className="text-gray-300">Site Name</Label>
                            <Input
                                value={settings.site_name}
                                onChange={(e) => updateSetting('site_name', e.target.value)}
                                className="bg-black/20 border-white/10 text-white"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label className="text-gray-300">Contact Email</Label>
                            <Input
                                value={settings.contact_email}
                                onChange={(e) => updateSetting('contact_email', e.target.value)}
                                className="bg-black/20 border-white/10 text-white"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label className="text-gray-300">Theme Primary Color</Label>
                            <div className="flex gap-2">
                                <Input
                                    type="color"
                                    value={settings.theme_color}
                                    onChange={(e) => updateSetting('theme_color', e.target.value)}
                                    className="bg-black/20 border-white/10 w-12 h-10 p-1"
                                />
                                <Input
                                    value={settings.theme_color}
                                    onChange={(e) => updateSetting('theme_color', e.target.value)}
                                    className="bg-black/20 border-white/10 text-white flex-1"
                                />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* System Controls */}
                <Card className="bg-white/5 border-white/10">
                    <CardHeader>
                        <CardTitle className="text-white flex items-center gap-2">
                            <Shield size={20} className="text-red-400" /> System Controls
                        </CardTitle>
                        <CardDescription>Critical switches for site availability and security.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="flex items-center justify-between">
                            <div className="space-y-0.5">
                                <Label className="text-white">Registration Open</Label>
                                <p className="text-xs text-gray-400">Allow new users to sign up and book events.</p>
                            </div>
                            <Switch
                                checked={settings.registration_open === 'true'}
                                onCheckedChange={(c) => updateSetting('registration_open', String(c))}
                            />
                        </div>

                        <div className="flex items-center justify-between">
                            <div className="space-y-0.5">
                                <Label className="text-white">Accommodation Booking</Label>
                                <p className="text-xs text-gray-400">Allow users to book accommodation.</p>
                            </div>
                            <Switch
                                checked={settings.accommodation_open === 'true'}
                                onCheckedChange={(c) => updateSetting('accommodation_open', String(c))}
                            />
                        </div>

                        <div className="flex items-center justify-between">
                            <div className="space-y-0.5">
                                <Label className="text-white">Public API Access</Label>
                                <p className="text-xs text-gray-400">Enable external fetch requests for leaderboard data.</p>
                            </div>
                            <Switch
                                checked={settings.public_api === 'true'}
                                onCheckedChange={(c) => updateSetting('public_api', String(c))}
                            />
                        </div>
                        <div className="flex items-center justify-between bg-red-500/10 p-3 rounded-lg border border-red-500/20">
                            <div className="space-y-0.5">
                                <Label className="text-red-400 flex items-center gap-2">
                                    <AlertTriangle size={14} /> Maintenance Mode
                                </Label>
                                <p className="text-xs text-red-300">Shuts down the public facing site completely.</p>
                            </div>
                            <Switch
                                checked={settings.maintenance_mode === 'true'}
                                onCheckedChange={(c) => updateSetting('maintenance_mode', String(c))}
                            />
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
