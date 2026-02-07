"use client";

import { useSession } from "next-auth/react";
import { useState, useEffect } from "react";
import Link from "next/link";

export default function ProfilePage() {
    const { data: session, status } = useSession();
    const [nickname, setNickname] = useState("");
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

    useEffect(() => {
        if (status === "authenticated") {
            fetchProfile();
        } else if (status === "unauthenticated") {
            setIsLoading(false);
        }
    }, [status]);

    const fetchProfile = async () => {
        try {
            const res = await fetch("/api/profile");
            if (res.ok) {
                const data = await res.json();
                setNickname(data.nickname || "");
            }
        } catch (error) {
            console.error("Failed to fetch profile:", error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleSave = async () => {
        setIsSaving(true);
        setMessage(null);

        try {
            const res = await fetch("/api/profile", {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ nickname }),
            });

            if (res.ok) {
                setMessage({ type: "success", text: "프로필이 저장되었습니다!" });
            } else {
                const data = await res.json();
                setMessage({ type: "error", text: data.error || "저장 실패" });
            }
        } catch {
            setMessage({ type: "error", text: "저장 중 오류가 발생했습니다." });
        } finally {
            setIsSaving(false);
        }
    };

    if (status === "loading" || isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-background">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    if (!session?.user) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-background p-4">
                <div className="text-center">
                    <h1 className="text-2xl font-bold mb-4">로그인이 필요합니다</h1>
                    <Link
                        href="/"
                        className="text-blue-600 hover:text-blue-800 underline"
                    >
                        홈으로 돌아가기
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-background">
            <div className="max-w-md mx-auto p-4">
                {/* Header */}
                <header className="flex items-center gap-4 py-4 mb-6">
                    <Link
                        href="/"
                        className="p-2 -ml-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition"
                    >
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                        </svg>
                    </Link>
                    <h1 className="text-xl font-bold">프로필</h1>
                </header>

                {/* Profile Card */}
                <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-lg p-6 space-y-6">
                    {/* User Avatar */}
                    <div className="flex flex-col items-center">
                        {session.user.image ? (
                            <img
                                src={session.user.image}
                                alt="Profile"
                                className="w-24 h-24 rounded-full border-4 border-blue-100 dark:border-blue-900"
                            />
                        ) : (
                            <div className="w-24 h-24 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center">
                                <span className="text-3xl font-bold text-white">
                                    {(nickname || session.user.name || session.user.email || "U")[0].toUpperCase()}
                                </span>
                            </div>
                        )}
                        <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                            {session.user.email}
                        </p>
                    </div>

                    {/* Nickname Input */}
                    <div className="space-y-2">
                        <label htmlFor="nickname" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                            닉네임
                        </label>
                        <input
                            id="nickname"
                            type="text"
                            value={nickname}
                            onChange={(e) => setNickname(e.target.value)}
                            placeholder="닉네임을 입력하세요"
                            maxLength={50}
                            className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                        />
                        <p className="text-xs text-gray-400 text-right">{nickname.length}/50</p>
                    </div>

                    {/* Message */}
                    {message && (
                        <div className={`p-3 rounded-lg text-sm ${message.type === "success"
                                ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                                : "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
                            }`}>
                            {message.text}
                        </div>
                    )}

                    {/* Save Button */}
                    <button
                        onClick={handleSave}
                        disabled={isSaving}
                        className="w-full py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white font-semibold rounded-xl shadow-md hover:shadow-lg hover:scale-[1.02] active:scale-[0.98] transition disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {isSaving ? (
                            <span className="flex items-center justify-center gap-2">
                                <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                </svg>
                                저장 중...
                            </span>
                        ) : (
                            "저장"
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
}
