"use client";

import { useState, useEffect } from "react";
import { Zap, LogIn, LogOut, RefreshCw } from "lucide-react";
import { useSession, signIn, signOut } from "next-auth/react";

const APP_VERSION = "1.0.10";

export default function TopBar() {
    const { data: session } = useSession();
    const user = session?.user;
    const [showVersion, setShowVersion] = useState(false);
    const [latestVersion, setLatestVersion] = useState<string | null>(null);
    const [isOutdated, setIsOutdated] = useState(false);

    // Check for updates when logo is clicked
    const handleLogoClick = async () => {
        setShowVersion(true);

        // Fetch latest version from API (not cached)
        try {
            const res = await fetch("/api/version?t=" + Date.now());
            const data = await res.json();
            setLatestVersion(data.version);
            setIsOutdated(data.version !== APP_VERSION);
        } catch (e) {
            console.error("Failed to check version:", e);
        }
    };

    const handleForceRefresh = () => {
        // Clear caches and reload
        if ("serviceWorker" in navigator) {
            navigator.serviceWorker.getRegistrations().then((registrations) => {
                registrations.forEach((reg) => reg.unregister());
            });
        }
        if ("caches" in window) {
            caches.keys().then((names) => {
                names.forEach((name) => caches.delete(name));
            });
        }
        window.location.reload();
    };

    const handleCloseVersion = () => {
        setShowVersion(false);
    };

    return (
        <header className="fixed top-0 left-0 right-0 bg-white/80 dark:bg-gray-900/80 backdrop-blur-md z-50 border-b border-gray-100 dark:border-gray-800 h-14">
            <div className="max-w-md mx-auto h-full flex items-center justify-between px-4">
                {/* Left: User Info */}
                <div className="flex items-center gap-2 min-w-0">
                    {user ? (
                        <div className="flex items-center gap-2 min-w-0">
                            <div className="w-8 h-8 rounded-full overflow-hidden flex-shrink-0 bg-gray-100 dark:bg-gray-700">
                                {user.image ? (
                                    <img src={user.image} alt={user.name || "User"} className="w-full h-full object-cover" />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-sm">👤</div>
                                )}
                            </div>
                            <span className="text-sm font-medium text-gray-700 dark:text-gray-300 truncate">
                                {user.name || "사용자"}
                            </span>
                        </div>
                    ) : (
                        <span className="text-sm text-gray-500 dark:text-gray-400">게스트</span>
                    )}
                </div>

                {/* Center: Logo (클릭하면 버전 표시) */}
                <button
                    onClick={handleLogoClick}
                    className="flex items-center gap-2 text-orange-500 animate-pulse-slow absolute left-1/2 transform -translate-x-1/2 cursor-pointer"
                >
                    <div className="bg-orange-100 dark:bg-orange-900/30 p-2 rounded-full relative">
                        <Zap size={20} fill="currentColor" />
                        {isOutdated && !showVersion && (
                            <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full animate-pulse" />
                        )}
                    </div>
                </button>

                {/* Version Popup */}
                {showVersion && (
                    <div
                        className="fixed inset-0 z-[100] flex items-center justify-center bg-black/30 animate-in fade-in duration-200"
                        onClick={handleCloseVersion}
                    >
                        <div
                            className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-2xl max-w-xs w-full mx-4 animate-in zoom-in-95 duration-200"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <div className="text-center mb-4">
                                <div className="inline-flex bg-orange-100 dark:bg-orange-900/30 p-3 rounded-full mb-3">
                                    <Zap size={32} className="text-orange-500" fill="currentColor" />
                                </div>
                                <h3 className="text-lg font-bold">FastTrack</h3>
                            </div>

                            <div className="space-y-2 text-sm text-center mb-4">
                                <p>
                                    현재 버전: <span className="font-mono font-bold">v{APP_VERSION}</span>
                                </p>
                                {latestVersion && (
                                    <p>
                                        최신 버전: <span className={`font-mono font-bold ${isOutdated ? "text-red-500" : "text-green-500"}`}>
                                            v{latestVersion}
                                        </span>
                                    </p>
                                )}
                                {isOutdated && (
                                    <p className="text-red-500 font-medium">
                                        ⚠️ 새 버전이 있습니다!
                                    </p>
                                )}
                                {!isOutdated && latestVersion && (
                                    <p className="text-green-500 font-medium">
                                        ✅ 최신 버전입니다
                                    </p>
                                )}
                            </div>

                            <div className="flex gap-2">
                                <button
                                    onClick={handleCloseVersion}
                                    className="flex-1 py-2 px-4 bg-gray-200 dark:bg-gray-700 rounded-xl text-sm font-medium"
                                >
                                    닫기
                                </button>
                                {isOutdated && (
                                    <button
                                        onClick={handleForceRefresh}
                                        className="flex-1 py-2 px-4 bg-orange-500 text-white rounded-xl text-sm font-medium flex items-center justify-center gap-1"
                                    >
                                        <RefreshCw size={14} />
                                        업데이트
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                )}

                {/* Right: Auth Button */}
                <button
                    onClick={() => user ? signOut() : signIn("google")}
                    className="flex items-center gap-1 text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-orange-500 dark:hover:text-orange-400 transition-colors flex-shrink-0"
                >
                    {user ? (
                        <>
                            <LogOut size={16} />
                            <span className="hidden sm:inline">로그아웃</span>
                        </>
                    ) : (
                        <>
                            <LogIn size={16} />
                            <span>로그인</span>
                        </>
                    )}
                </button>
            </div>
        </header>
    );
}
