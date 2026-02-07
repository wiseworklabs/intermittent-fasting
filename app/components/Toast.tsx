"use client";

import { createContext, useContext, useState, useCallback, ReactNode } from "react";

interface Toast {
    id: string;
    message: string;
    type: "error" | "success" | "info";
}

interface ToastContextType {
    showToast: (message: string, type?: "error" | "success" | "info") => void;
    showError: (message: string) => void;
}

const ToastContext = createContext<ToastContextType | null>(null);

export function useToast() {
    const context = useContext(ToastContext);
    if (!context) {
        throw new Error("useToast must be used within ToastProvider");
    }
    return context;
}

export function ToastProvider({ children }: { children: ReactNode }) {
    const [toasts, setToasts] = useState<Toast[]>([]);

    const showToast = useCallback((message: string, type: "error" | "success" | "info" = "info") => {
        const id = Date.now().toString();
        setToasts((prev) => [...prev, { id, message, type }]);

        // Auto remove after 5 seconds
        setTimeout(() => {
            setToasts((prev) => prev.filter((t) => t.id !== id));
        }, 5000);
    }, []);

    const showError = useCallback((message: string) => {
        showToast(message, "error");
    }, [showToast]);

    const removeToast = (id: string) => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
    };

    return (
        <ToastContext.Provider value={{ showToast, showError }}>
            {children}

            {/* Toast Container */}
            <div className="fixed bottom-20 left-0 right-0 z-[100] flex flex-col items-center gap-2 px-4 pointer-events-none">
                {toasts.map((toast) => (
                    <div
                        key={toast.id}
                        onClick={() => removeToast(toast.id)}
                        className={`
                            pointer-events-auto cursor-pointer max-w-md w-full px-4 py-3 rounded-xl shadow-lg
                            animate-in slide-in-from-bottom-4 fade-in duration-300
                            ${toast.type === "error"
                                ? "bg-red-500 text-white"
                                : toast.type === "success"
                                    ? "bg-green-500 text-white"
                                    : "bg-gray-800 text-white dark:bg-gray-100 dark:text-gray-900"
                            }
                        `}
                    >
                        <div className="flex items-center gap-2">
                            <span className="text-lg">
                                {toast.type === "error" ? "❌" : toast.type === "success" ? "✅" : "ℹ️"}
                            </span>
                            <span className="font-medium text-sm">{toast.message}</span>
                        </div>
                    </div>
                ))}
            </div>
        </ToastContext.Provider>
    );
}
