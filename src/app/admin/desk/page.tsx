"use client";

import RegistrationDeskInterface from "@/components/features/RegistrationDeskInterface";
import { Navbar } from "@/components/layout/Navbar";

export default function VolunteerDeskPage() {
    return (
        <div className="min-h-screen bg-black text-white flex flex-col">
            <Navbar />
            <div className="flex-1 p-4 pb-20 md:p-8 flex justify-center">
                <RegistrationDeskInterface mode="volunteer" />
            </div>
        </div>
    );
}
