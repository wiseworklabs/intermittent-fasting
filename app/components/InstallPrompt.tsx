"use client";

import { useState, useEffect } from "react";

interface BeforeInstallPromptEvent extends Event {
    prompt: () => Promise<void>;
    userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

export default function InstallPrompt() {
    const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
    const [showInstallButton, setShowInstallButton] = useState(false);
    const [isInstalled, setIsInstalled] = useState(false);

    useEffect(() => {
        // Check if already installed (standalone mode)
        if (window.matchMedia("(display-mode: standalone)").matches) {
            setIsInstalled(true);
            return;
        }

        // Check if on iOS
        const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
        if (isIOS) {
            // iOS doesn't support beforeinstallprompt, show manual instructions
            const dismissed = localStorage.getItem("pwa-install-dismissed");
            if (!dismissed) {
                setShowInstallButton(true);
            }
            return;
        }

        // Listen for beforeinstallprompt event (Chrome/Edge/Samsung Internet)
        const handleBeforeInstall = (e: Event) => {
            e.preventDefault();
            setDeferredPrompt(e as BeforeInstallPromptEvent);

            const dismissed = localStorage.getItem("pwa-install-dismissed");
            if (!dismissed) {
                setShowInstallButton(true);
            }
        };

        window.addEventListener("beforeinstallprompt", handleBeforeInstall);

        // Check if app was installed
        window.addEventListener("appinstalled", () => {
            setIsInstalled(true);
            setShowInstallButton(false);
            setDeferredPrompt(null);
        });

        return () => {
            window.removeEventListener("beforeinstallprompt", handleBeforeInstall);
        };
    }, []);

    const handleInstallClick = async () => {
        if (deferredPrompt) {
            // Chrome/Edge/Samsung Internet
            await deferredPrompt.prompt();
            const { outcome } = await deferredPrompt.userChoice;

            if (outcome === "accepted") {
                setShowInstallButton(false);
            }
            setDeferredPrompt(null);
        } else {
            // iOS - show instructions
            alert("홈 화면에 추가하려면:\n\n1. Safari 하단의 공유 버튼(□↑)을 탭하세요\n2. '홈 화면에 추가'를 선택하세요");
        }
    };

    const handleDismiss = () => {
        setShowInstallButton(false);
        localStorage.setItem("pwa-install-dismissed", "true");
    };

    if (isInstalled || !showInstallButton) {
        return null;
    }

    return (
        <div className="fixed bottom-20 left-4 right-4 max-w-md mx-auto z-50 animate-in slide-in-from-bottom duration-500">
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl shadow-2xl p-4 text-white">
                <div className="flex items-start gap-3">
                    <div className="text-3xl">📲</div>
                    <div className="flex-1">
                        <h3 className="font-bold text-sm">앱으로 설치하기</h3>
                        <p className="text-xs text-white/80 mt-1">
                            홈 화면에 추가하면 더 빠르게 접근할 수 있어요!
                        </p>
                    </div>
                    <button
                        onClick={handleDismiss}
                        className="text-white/60 hover:text-white text-lg leading-none"
                        aria-label="닫기"
                    >
                        ✕
                    </button>
                </div>
                <div className="flex gap-2 mt-3">
                    <button
                        onClick={handleDismiss}
                        className="flex-1 py-2.5 text-sm text-white/70 hover:text-white transition"
                    >
                        나중에
                    </button>
                    <button
                        onClick={handleInstallClick}
                        className="flex-1 py-2.5 bg-white text-blue-600 text-sm font-bold rounded-xl hover:bg-blue-50 active:scale-95 transition shadow-lg"
                    >
                        지금 설치
                    </button>
                </div>
            </div>
        </div>
    );
}
