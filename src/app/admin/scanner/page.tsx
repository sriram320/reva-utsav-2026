"use client";

import RegistrationDeskInterface from "@/components/features/RegistrationDeskInterface";

export default function RegistrationDeskPage() {
    return (
        <div className="h-[calc(100vh-8rem)]">
            <RegistrationDeskInterface mode="admin" />
        </div>
    );
}
