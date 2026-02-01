"use client";

import { useEffect, useState } from "react";
import { Html5QrcodeScanner } from "html5-qrcode";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle, XCircle } from "lucide-react";

export function TicketScanner() {
    const [scanResult, setScanResult] = useState<string | null>(null);
    const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');

    useEffect(() => {
        const scanner = new Html5QrcodeScanner(
            "reader",
            { fps: 10, qrbox: { width: 250, height: 250 } },
      /* verbose= */ false
        );

        scanner.render(
            (decodedText) => {
                scanner.clear();
                setScanResult(decodedText);
                // Mock verification logic
                if (decodedText.startsWith("TICKET-")) {
                    setStatus('success');
                } else {
                    setStatus('error');
                }
            },
            (error) => {
                // console.warn(error);
            }
        );

        return () => {
            scanner.clear().catch(error => console.error("Failed to clear scanner", error));
        };
    }, []);

    const resetScanner = () => {
        setScanResult(null);
        setStatus('idle');
        window.location.reload(); // Simplest way to re-init scanner cleanly in this mock
    };

    return (
        <div className="max-w-md mx-auto">
            <Card className="bg-black/80 border-white/20">
                <CardHeader>
                    <CardTitle className="text-center text-white">Entry Scanner</CardTitle>
                </CardHeader>
                <CardContent>
                    {!scanResult ? (
                        <div id="reader" className="overflow-hidden rounded-xl border-2 border-dashed border-white/20" />
                    ) : (
                        <div className="text-center py-8">
                            {status === 'success' ? (
                                <div className="flex flex-col items-center space-y-4">
                                    <CheckCircle size={64} className="text-green-500" />
                                    <h3 className="text-2xl font-bold text-white">Access Granted</h3>
                                    <p className="text-gray-400 font-mono text-sm break-all">{scanResult}</p>
                                    <div className="bg-green-500/20 text-green-400 px-4 py-1 rounded-full text-sm font-bold">
                                        GOLD TIER
                                    </div>
                                </div>
                            ) : (
                                <div className="flex flex-col items-center space-y-4">
                                    <XCircle size={64} className="text-red-500" />
                                    <h3 className="text-2xl font-bold text-white">Invalid Ticket</h3>
                                </div>
                            )}
                            <Button onClick={resetScanner} className="mt-8 w-full" variant="outline">
                                Scan Next
                            </Button>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
