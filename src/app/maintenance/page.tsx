import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { AlertTriangle, Wrench } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function MaintenancePage() {
    return (
        <main className="min-h-screen bg-black text-white flex flex-col">
            <Navbar />

            <div className="flex-1 flex items-center justify-center px-4 py-24">
                <Card className="max-w-2xl w-full bg-zinc-950 border-yellow-500/50">
                    <CardHeader className="text-center">
                        <div className="mx-auto w-20 h-20 bg-yellow-500/20 rounded-full flex items-center justify-center mb-6">
                            <Wrench className="text-yellow-500" size={40} />
                        </div>
                        <CardTitle className="text-4xl font-black font-orbitron text-yellow-500 mb-4">
                            Under Maintenance
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="text-center space-y-6">
                        <div className="flex items-center justify-center gap-2 text-yellow-400">
                            <AlertTriangle size={20} />
                            <p className="text-lg font-medium">
                                We're currently performing scheduled maintenance
                            </p>
                        </div>

                        <p className="text-gray-300 text-lg leading-relaxed">
                            Our team is working hard to improve your experience.
                            The site will be back online shortly.
                        </p>

                        <div className="bg-zinc-900 p-6 rounded-lg border border-zinc-800">
                            <p className="text-sm text-gray-400 mb-2">Expected Duration</p>
                            <p className="text-2xl font-bold text-white">30 - 60 minutes</p>
                        </div>

                        <div className="pt-6 border-t border-zinc-800">
                            <p className="text-sm text-gray-500">
                                For urgent inquiries, please contact us at{" "}
                                <a href="mailto:utsav@reva.edu.in" className="text-secondary hover:underline">
                                    utsav@reva.edu.in
                                </a>
                            </p>
                        </div>
                    </CardContent>
                </Card>
            </div>

            <Footer />
        </main>
    );
}
