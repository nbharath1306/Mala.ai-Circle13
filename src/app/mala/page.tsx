"use client";

import MalaCounter from "@/components/mala/MalaCounter";
import Link from "next/link";
import { X } from "lucide-react";

export default function MalaPage() {
    return (
        <main className="h-screen w-full flex flex-col relative overflow-hidden">
            {/* Close / Exit */}
            <Link
                href="/"
                className="absolute top-6 left-6 z-20 p-2 rounded-full hover:bg-[var(--foreground)]/5 transition-colors"
            >
                <X size={24} className="opacity-50 hover:opacity-100" />
            </Link>

            {/* The Mala Logic */}
            <div className="flex-1">
                <MalaCounter />
            </div>
        </main>
    );
}
