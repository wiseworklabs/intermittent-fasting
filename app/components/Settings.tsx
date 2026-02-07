"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { subscribeToPush, sendTestPush } from "@/lib/push";
import { useToast } from "./Toast";

interface SettingsProps {
    currentGoal: number;
    onUpdateGoal: (hours: number) => void;
}

export default function Settings({ currentGoal, onUpdateGoal }: SettingsProps) {
    const [isOpen, setIsOpen] = useState(false);
    const { data: session } = useSession();
    const [pushStatus, setPushStatus] = useState<"idle" | "subscribing" | "sending" | "success" | "error">("idle");
    const [pushMessage, setPushMessage] = useState("");
    const [isSubscribed, setIsSubscribed] = useState(false);
    const { showToast, showError } = useToast();

    const isAdmin = session?.user?.email?.endsWith("@wiseworklabs.com");

    // Check if already subscribed to push
    useEffect(() => {
        if ("serviceWorker" in navigator && "PushManager" in window) {
            navigator.serviceWorker.ready.then((registration) => {
                registration.pushManager.getSubscription().then((subscription) => {
                    setIsSubscribed(!!subscription);
                });
            });
        }
    }, []);

    const handleSubscribePush = async () => {
        setPushStatus("subscribing");
        setPushMessage("");

        // Request notification permission first
        if ("Notification" in window && Notification.permission !== "granted") {
            const permission = await Notification.requestPermission();
            if (permission !== "granted") {
                setPushStatus("error");
                setPushMessage("알림 권한이 거부되었습니다");
                showError("알림 권한이 거부되었습니다");
                return;
            }
        }

        const result = await subscribeToPush();
        if (result.success) {
            setIsSubscribed(true);
            setPushStatus("success");
            setPushMessage("푸시 알림이 활성화되었습니다!");
            showToast("푸시 알림이 활성화되었습니다!", "success");
        } else {
            setPushStatus("error");
            const errorMsg = result.error || "푸시 등록에 실패했습니다";
            setPushMessage(errorMsg);
            showError(errorMsg);
        }
    };

    const handleTestPush = async () => {
        if (!isSubscribed) {
            setPushMessage("먼저 푸시 알림을 활성화해주세요");
            setPushStatus("error");
            return;
        }

        setPushStatus("sending");
        setPushMessage("");

        const result = await sendTestPush();
        if (result.success) {
            setPushStatus("success");
            setPushMessage(result.message);
        } else {
            setPushStatus("error");
            setPushMessage(result.message);
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
                    <div className="bg-white dark:bg-gray-800 rounded-2xl w-full max-w-sm p-6 shadow-xl relative animate-in zoom-in-95 duration-200 max-h-[90vh] overflow-y-auto">
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
                                <div className="flex items-center gap-2 mb-3">
                                    <span className="text-amber-600 dark:text-amber-400 text-sm font-semibold">🔧 Admin Tools</span>
                                </div>

                                <div className="space-y-2">
                                    {!isSubscribed && (
                                        <button
                                            onClick={handleSubscribePush}
                                            disabled={pushStatus === "subscribing"}
                                            className="w-full py-2 bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 disabled:opacity-50 text-white text-sm font-medium rounded-lg transition-all active:scale-95"
                                        >
                                            {pushStatus === "subscribing" ? "등록 중..." : "📲 푸시 알림 활성화"}
                                        </button>
                                    )}

                                    <button
                                        onClick={handleTestPush}
                                        disabled={pushStatus === "sending" || !isSubscribed}
                                        className="w-full py-2 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 disabled:opacity-50 text-white text-sm font-medium rounded-lg transition-all active:scale-95"
                                    >
                                        {pushStatus === "sending" ? "전송 중..." : "🔔 푸시 테스트 전송"}
                                    </button>
                                </div>

                                {pushMessage && (
                                    <p className={`mt-2 text-xs text-center ${pushStatus === "success" ? "text-green-600" : "text-red-500"}`}>
                                        {pushMessage}
                                    </p>
                                )}

                                {isSubscribed && (
                                    <p className="mt-2 text-xs text-center text-green-600">
                                        ✅ 푸시 알림 활성화됨
                                    </p>
                                )}
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
