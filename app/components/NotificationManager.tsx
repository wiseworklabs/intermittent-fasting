"use client";

import { useState, useEffect } from "react";

export default function NotificationManager() {
    const [permission, setPermission] = useState<NotificationPermission | "unsupported">("default");
    const [showBanner, setShowBanner] = useState(false);

    useEffect(() => {
        // Check if notifications are supported
        if (!("Notification" in window)) {
            setPermission("unsupported");
            return;
        }

        setPermission(Notification.permission);

        // Show banner if permission not yet decided
        if (Notification.permission === "default") {
            setShowBanner(true);
        }
    }, []);

    const requestPermission = async () => {
        try {
            const result = await Notification.requestPermission();
            setPermission(result);

            if (result === "granted") {
                // Register for push notifications
                await registerPushSubscription();
                // Show test notification
                showTestNotification();
            }
        } catch (error) {
            console.error("Failed to request permission:", error);
        }
        setShowBanner(false);
    };

    const registerPushSubscription = async () => {
        if (!("serviceWorker" in navigator)) return;

        try {
            const registration = await navigator.serviceWorker.ready;
            console.log("Service Worker ready for push");

            // Note: In production, you'd subscribe to a push service here
            // For now, we'll just use local notifications scheduled via setTimeout
        } catch (error) {
            console.error("Failed to register push:", error);
        }
    };

    const showTestNotification = () => {
        if ("serviceWorker" in navigator && navigator.serviceWorker.controller) {
            new Notification("FastTrack 🌙", {
                body: "알림이 활성화되었습니다! 단식 목표 달성 시 알림을 받게 됩니다.",
                icon: "/icon-192x192.png",
            });
        }
    };

    if (permission === "granted" || permission === "denied" || permission === "unsupported") {
        return null;
    }

    if (!showBanner) {
        return null;
    }

    return (
        <div className="fixed bottom-4 left-4 right-4 max-w-md mx-auto z-50 animate-in slide-in-from-bottom duration-300">
            <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 p-4">
                <div className="flex items-start gap-3">
                    <div className="text-3xl">🔔</div>
                    <div className="flex-1">
                        <h3 className="font-semibold text-sm">알림 받기</h3>
                        <p className="text-xs text-gray-500 mt-1">
                            단식 목표 달성 시 알림을 받아보세요!
                        </p>
                    </div>
                </div>
                <div className="flex gap-2 mt-3">
                    <button
                        onClick={() => setShowBanner(false)}
                        className="flex-1 py-2 text-sm text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 transition"
                    >
                        나중에
                    </button>
                    <button
                        onClick={requestPermission}
                        className="flex-1 py-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white text-sm font-medium rounded-xl hover:scale-[1.02] active:scale-[0.98] transition"
                    >
                        알림 허용
                    </button>
                </div>
            </div>
        </div>
    );
}
