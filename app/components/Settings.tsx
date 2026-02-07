"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";

interface SettingsProps {
    currentGoal: number;
    onUpdateGoal: (hours: number) => void;
}

export default function Settings({ currentGoal, onUpdateGoal }: SettingsProps) {
    const [isOpen, setIsOpen] = useState(false);
    const { data: session } = useSession();

    const isAdmin = session?.user?.email?.endsWith("@wiseworklabs.com");

    const handleTestNotification = () => {
        if ("Notification" in window && Notification.permission === "granted") {
            new Notification("🔔 FastTrack 테스트 알림", {
                body: "단식 목표를 달성했습니다! 축하합니다! 🎉",
                icon: "/icon-192x192.png",
                badge: "/icon-192x192.png",
            });
        } else if ("Notification" in window) {
            alert("알림 권한이 필요합니다. 브라우저 설정에서 알림을 허용해주세요.");
        } else {
            alert("이 브라우저는 알림을 지원하지 않습니다.");
        }
    };

    return (
        <>
            <button
                onClick={() => setIsOpen(true)}
                className="p-2 text-gray-500 hover:text-gray-900 dark:hover:text-white transition-colors"
                aria-label="Settings"
            >
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.38a2 2 0 0 0-.73-2.73l-.15-.1a2 2 0 0 1-1-1.72v-.51a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"></path>
                    <circle cx="12" cy="12" r="3"></circle>
                </svg>
            </button>

            {isOpen && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
                    <div className="bg-white dark:bg-gray-800 rounded-2xl w-full max-w-sm p-6 shadow-xl relative animate-in zoom-in-95 duration-200">
                        <h3 className="text-xl font-bold mb-4">Settings</h3>

                        <div className="mb-6">
                            <label htmlFor="goal" className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
                                Fasting Goal (Hours)
                            </label>
                            <div className="flex gap-2 items-center">
                                <input
                                    id="goal"
                                    type="range"
                                    min="1"
                                    max="48"
                                    value={currentGoal}
                                    onChange={(e) => onUpdateGoal(Number(e.target.value))}
                                    className="w-full"
                                />
                                <span className="font-mono font-bold w-12 text-right">{currentGoal}h</span>
                            </div>
                            <div className="flex justify-between text-xs text-gray-400 mt-1">
                                <span>1h</span>
                                <span>16h</span>
                                <span>48h</span>
                            </div>
                        </div>

                        {isAdmin && (
                            <div className="mb-4 p-3 bg-amber-50 dark:bg-amber-900/20 rounded-xl border border-amber-200 dark:border-amber-800">
                                <div className="flex items-center gap-2 mb-2">
                                    <span className="text-amber-600 dark:text-amber-400 text-sm font-semibold">🔧 Admin Tools</span>
                                </div>
                                <button
                                    onClick={handleTestNotification}
                                    className="w-full py-2 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white text-sm font-medium rounded-lg transition-all active:scale-95"
                                >
                                    🔔 알림 테스트
                                </button>
                            </div>
                        )}

                        <div className="flex justify-end">
                            <button
                                onClick={() => setIsOpen(false)}
                                className="bg-blue-600 text-white px-4 py-2 rounded-xl font-bold"
                            >
                                Done
                            </button>
                        </div>

                        <button
                            onClick={() => setIsOpen(false)}
                            className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
                        >
                            ✕
                        </button>
                    </div>
                </div>
            )}
        </>
    );
}
