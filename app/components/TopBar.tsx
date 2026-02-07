"use client";

import { useState } from "react";
import { Zap, LogIn, LogOut } from "lucide-react";
import { useSession, signIn, signOut } from "next-auth/react";

const APP_VERSION = "1.0.1";

export default function TopBar() {
    const { data: session } = useSession();
    const user = session?.user;
    const [showVersion, setShowVersion] = useState(false);

    const handleLogoClick = () => {
        setShowVersion(true);
        setTimeout(() => setShowVersion(false), 3000);
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
                        {showVersion && (
                            <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 text-xs px-2 py-1 rounded-md whitespace-nowrap animate-in fade-in slide-in-from-top-2 duration-200">
                                v{APP_VERSION}
                            </div>
                        )}
                    </div>
                </button>

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
