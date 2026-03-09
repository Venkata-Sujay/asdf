"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { LinkData } from "../components/Dashboard";

export default function RedirectPage() {
    const params = useParams();
    const router = useRouter();
    const [error, setError] = useState(false);

    useEffect(() => {
        // We unwrap params safely for latest Next.js conventions
        const code = Array.isArray(params.shortCode) ? params.shortCode[0] : params.shortCode;

        if (!code) {
            setError(true);
            return;
        }

        const stored = localStorage.getItem("vibelink_data");
        if (!stored) {
            setError(true);
            return;
        }

        try {
            const links: LinkData[] = JSON.parse(stored);
            const linkIndex = links.findIndex((l) => l.shortCode === code);

            if (linkIndex !== -1) {
                // Increment click count
                const updatedLinks = [...links];
                updatedLinks[linkIndex] = {
                    ...updatedLinks[linkIndex],
                    clicks: updatedLinks[linkIndex].clicks + 1,
                };
                localStorage.setItem("vibelink_data", JSON.stringify(updatedLinks));

                // Instant redirect
                window.location.replace(updatedLinks[linkIndex].originalUrl);
            } else {
                setError(true);
            }
        } catch (err) {
            console.error(err);
            setError(true);
        }
    }, [params]);

    if (error) {
        return (
            <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center p-4">
                <h1 className="text-4xl font-bold text-red-500 mb-4">404 - Not Found</h1>
                <p className="text-white/60 mb-8 max-w-md text-center">
                    The link you are trying to reach does not exist or has been removed.
                </p>
                <button
                    onClick={() => router.push("/")}
                    className="px-6 py-3 bg-white/10 hover:bg-white/20 rounded-full transition-colors font-medium"
                >
                    Return Home
                </button>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-black flex items-center justify-center">
            <div className="w-12 h-12 border-4 border-neon-purple border-t-neon-green rounded-full animate-spin"></div>
        </div>
    );
}
