"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Copy, Plus, Activity, CheckCircle2, AlertCircle } from "lucide-react";
import { isValidUrl, generateShortCode, normalizeUrl } from "@/lib/utils";

export interface LinkData {
    id: string;
    originalUrl: string;
    shortCode: string;
    clicks: number;
    createdAt: number;
}

export default function Dashboard() {
    const [links, setLinks] = useState<LinkData[]>([]);
    const [inputValue, setInputValue] = useState("");
    const [error, setError] = useState<string | null>(null);
    const [copiedId, setCopiedId] = useState<string | null>(null);
    const [isClient, setIsClient] = useState(false);

    // Load from local storage
    useEffect(() => {
        setIsClient(true);
        const stored = localStorage.getItem("vibelink_data");
        if (stored) {
            try {
                setLinks(JSON.parse(stored));
            } catch (err) {
                console.error("Failed to parse local storage", err);
            }
        }
    }, []);

    // Sync to local storage on change
    useEffect(() => {
        if (isClient) {
            localStorage.setItem("vibelink_data", JSON.stringify(links));
        }
    }, [links, isClient]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);

        const trimmed = inputValue.trim();
        if (!trimmed) {
            setError("Please enter a URL");
            return;
        }

        if (!isValidUrl(trimmed)) {
            setError("Please enter a valid URL (e.g., https://example.com)");
            return;
        }

        const normalizedUrl = normalizeUrl(trimmed);

        // Check for exact duplicate
        const existing = links.find((l) => l.originalUrl === normalizedUrl);
        if (existing) {
            setError("This URL has already been shortened!");
            return;
        }

        // Generate unique short code
        let code = generateShortCode();
        // In rare chance of collision, regenerate
        while (links.some((l) => l.shortCode === code)) {
            code = generateShortCode();
        }

        const newLink: LinkData = {
            id: crypto.randomUUID(),
            originalUrl: normalizedUrl,
            shortCode: code,
            clicks: 0,
            createdAt: Date.now(),
        };

        setLinks([newLink, ...links]);
        setInputValue("");
    };

    const copyToClipboard = async (link: LinkData) => {
        const shortUrl = `${window.location.origin}/${link.shortCode}`;
        await navigator.clipboard.writeText(shortUrl);
        setCopiedId(link.id);
        setTimeout(() => setCopiedId(null), 2000);
    };

    if (!isClient) return null; // Prevent hydration mismatch

    return (
        <div className="min-h-screen bg-black text-white p-8 font-sans selection:bg-neon-purple selection:text-white">
            <div className="max-w-4xl mx-auto space-y-12">
                {/* Header Section */}
                <div className="text-center space-y-4 pt-12">
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="inline-block"
                    >
                        <h1 className="text-5xl md:text-7xl font-bold tracking-tight text-glow-purple">
                            Vibe<span className="text-neon-green text-glow-green">Link</span>
                        </h1>
                    </motion.div>
                    <motion.p
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.1 }}
                        className="text-white/60 text-lg md:text-xl max-w-2xl mx-auto"
                    >
                        A high-performance URL shortener with real-time analytics and instant redirection.
                    </motion.p>
                </div>

                {/* Input Section */}
                <motion.form
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    onSubmit={handleSubmit}
                    className="relative max-w-2xl mx-auto"
                >
                    <div className="relative flex items-center group">
                        <input
                            type="text"
                            value={inputValue}
                            onChange={(e) => {
                                setInputValue(e.target.value);
                                if (error) setError(null);
                            }}
                            placeholder="Paste your long URL here..."
                            className={`w-full glass rounded-full py-4 pl-6 pr-32 text-lg focus:outline-none focus:ring-2 transition-all ${error
                                    ? "focus:ring-red-500 border-red-500/50"
                                    : "focus:ring-neon-purple border-white/10"
                                }`}
                        />
                        <button
                            type="submit"
                            className="absolute right-2 bg-neon-purple hover:bg-neon-purple/80 text-white p-2 px-6 rounded-full font-medium transition-all flex items-center gap-2 hover:scale-105 active:scale-95"
                        >
                            Shorten <Plus size={18} />
                        </button>
                    </div>

                    <AnimatePresence>
                        {error && (
                            <motion.div
                                initial={{ opacity: 0, y: -10, x: -10 }}
                                animate={{ opacity: 1, y: 0, x: [-10, 10, -10, 10, 0] }}
                                exit={{ opacity: 0 }}
                                transition={{ duration: 0.4 }}
                                className="absolute -bottom-8 left-6 text-red-400 text-sm flex items-center gap-1"
                            >
                                <AlertCircle size={14} /> {error}
                            </motion.div>
                        )}
                    </AnimatePresence>
                </motion.form>

                {/* Dashboard List */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.3 }}
                    className="pt-8"
                >
                    <div className="flex items-center justify-between mb-6 px-2">
                        <h2 className="text-2xl font-semibold flex items-center gap-2">
                            <Activity className="text-neon-green" /> Your Links
                        </h2>
                        <span className="text-white/40 text-sm">{links.length} shortened</span>
                    </div>

                    <div className="space-y-4">
                        <AnimatePresence>
                            {links.length === 0 ? (
                                <motion.div
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    className="text-center py-12 glass rounded-3xl"
                                >
                                    <p className="text-white/40">No links yet. Shorten one above!</p>
                                </motion.div>
                            ) : (
                                links.map((link) => (
                                    <motion.div
                                        key={link.id}
                                        layout
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        exit={{ opacity: 0, scale: 0.95 }}
                                        transition={{ type: "spring", stiffness: 400, damping: 30 }}
                                        className="glass rounded-2xl p-4 md:p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 group hover:border-white/20 transition-all"
                                    >
                                        <div className="flex-1 min-w-0 pr-4">
                                            <div className="flex flex-col gap-1">
                                                <a
                                                    href={link.originalUrl}
                                                    target="_blank"
                                                    rel="noreferrer"
                                                    className="text-white/60 truncate hover:text-white transition-colors text-sm"
                                                    title={link.originalUrl}
                                                >
                                                    {link.originalUrl}
                                                </a>
                                                <a
                                                    href={`/${link.shortCode}`}
                                                    target="_blank"
                                                    rel="noreferrer"
                                                    className="text-neon-green hover:underline font-mono text-lg font-medium flex items-center gap-2 w-fit"
                                                >
                                                    vibelink.app/{link.shortCode}
                                                </a>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-4 w-full md:w-auto justify-between md:justify-end border-t border-white/10 md:border-none pt-4 md:pt-0">
                                            <div className="flex items-center gap-2 bg-white/5 px-3 py-1.5 rounded-full border border-white/5" title="Total Clicks">
                                                <Activity size={14} className="text-neon-purple" />
                                                <span className="font-mono">{link.clicks}</span>
                                            </div>

                                            <button
                                                onClick={() => copyToClipboard(link)}
                                                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all ${copiedId === link.id
                                                        ? "bg-neon-green/20 text-neon-green"
                                                        : "bg-white/10 hover:bg-white/20 text-white"
                                                    }`}
                                            >
                                                {copiedId === link.id ? (
                                                    <>
                                                        <CheckCircle2 size={16} /> Copied!
                                                    </>
                                                ) : (
                                                    <>
                                                        <Copy size={16} /> Copy
                                                    </>
                                                )}
                                            </button>
                                        </div>
                                    </motion.div>
                                ))
                            )}
                        </AnimatePresence>
                    </div>
                </motion.div>
            </div>
        </div>
    );
}
