"use client";

import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import Link from "next/link";
import dynamic from "next/dynamic";

// Dynamic import to avoid SSR issues with Recharts
const BarChart = dynamic(() => import("recharts").then((mod) => mod.BarChart), { ssr: false });
const Bar = dynamic(() => import("recharts").then((mod) => mod.Bar), { ssr: false });
const XAxis = dynamic(() => import("recharts").then((mod) => mod.XAxis), { ssr: false });
const YAxis = dynamic(() => import("recharts").then((mod) => mod.YAxis), { ssr: false });
const Tooltip = dynamic(() => import("recharts").then((mod) => mod.Tooltip), { ssr: false });
const ResponsiveContainer = dynamic(() => import("recharts").then((mod) => mod.ResponsiveContainer), { ssr: false });
const CartesianGrid = dynamic(() => import("recharts").then((mod) => mod.CartesianGrid), { ssr: false });
const ReferenceLine = dynamic(() => import("recharts").then((mod) => mod.ReferenceLine), { ssr: false });

interface FastingLog {
    id: string;
    startTime: string;
    endTime: string | null;
    duration: number | null;
    goalHours: number;
}

export default function HistoryPage() {
    const { data: session, status } = useSession();
    const [logs, setLogs] = useState<FastingLog[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        if (status === "authenticated") {
            fetchHistory();
        } else if (status === "unauthenticated") {
            // Try to load from localStorage
            loadLocalHistory();
        }
    }, [status]);

    const fetchHistory = async () => {
        try {
            const res = await fetch("/api/history");
            if (res.ok) {
                const data = await res.json();
                setLogs(data);
            }
        } catch (error) {
            console.error("Failed to fetch history:", error);
        } finally {
            setIsLoading(false);
        }
    };

    const loadLocalHistory = () => {
        const stored = localStorage.getItem("fasttrack_data");
        if (stored) {
            try {
                const data = JSON.parse(stored);
                const localLogs = (data.history || []).map((h: { id: string; startTime: number; endTime: number; duration: number }) => ({
                    id: h.id,
                    startTime: new Date(h.startTime).toISOString(),
                    endTime: new Date(h.endTime).toISOString(),
                    duration: h.duration,
                    goalHours: data.goalHours || 16,
                }));
                setLogs(localLogs);
            } catch (e) {
                console.error(e);
            }
        }
        setIsLoading(false);
    };

    const formatDuration = (seconds: number) => {
        const hours = Math.floor(seconds / 3600);
        const minutes = Math.floor((seconds % 3600) / 60);
        return `${hours}시간 ${minutes}분`;
    };

    const formatDate = (dateStr: string) => {
        const date = new Date(dateStr);
        return date.toLocaleDateString("ko-KR", {
            month: "short",
            day: "numeric",
            weekday: "short",
        });
    };

    // Chart data: last 7 completed fasts
    const chartData = logs.slice(0, 7).reverse().map((log) => ({
        date: formatDate(log.startTime),
        duration: Math.round((log.duration || 0) / 3600 * 10) / 10,
        goal: log.goalHours,
    }));

    // Statistics
    const totalFasts = logs.length;
    const avgDuration = logs.length > 0
        ? Math.round(logs.reduce((sum, log) => sum + (log.duration || 0), 0) / logs.length / 3600 * 10) / 10
        : 0;
    const successfulFasts = logs.filter(log => (log.duration || 0) >= log.goalHours * 3600).length;
    const successRate = totalFasts > 0 ? Math.round((successfulFasts / totalFasts) * 100) : 0;

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-background">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-background">
            <div className="max-w-lg mx-auto p-4">
                {/* Header */}
                <header className="flex items-center gap-4 py-4 mb-4">
                    <Link
                        href="/"
                        className="p-2 -ml-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition"
                    >
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                        </svg>
                    </Link>
                    <h1 className="text-xl font-bold">단식 기록</h1>
                </header>

                {/* Statistics Cards */}
                <div className="grid grid-cols-3 gap-3 mb-6">
                    <div className="bg-white dark:bg-gray-900 rounded-xl p-4 text-center shadow-sm">
                        <div className="text-2xl font-bold text-blue-600">{totalFasts}</div>
                        <div className="text-xs text-gray-500">총 단식</div>
                    </div>
                    <div className="bg-white dark:bg-gray-900 rounded-xl p-4 text-center shadow-sm">
                        <div className="text-2xl font-bold text-purple-600">{avgDuration}h</div>
                        <div className="text-xs text-gray-500">평균 시간</div>
                    </div>
                    <div className="bg-white dark:bg-gray-900 rounded-xl p-4 text-center shadow-sm">
                        <div className="text-2xl font-bold text-green-600">{successRate}%</div>
                        <div className="text-xs text-gray-500">성공률</div>
                    </div>
                </div>

                {/* Chart */}
                {chartData.length > 0 && (
                    <div className="bg-white dark:bg-gray-900 rounded-2xl p-4 mb-6 shadow-sm">
                        <h2 className="text-sm font-semibold text-gray-600 dark:text-gray-400 mb-4">최근 7일 기록</h2>
                        <div className="h-48">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={chartData} margin={{ top: 5, right: 5, left: -20, bottom: 5 }}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                                    <XAxis
                                        dataKey="date"
                                        tick={{ fontSize: 10, fill: "#9ca3af" }}
                                        axisLine={false}
                                        tickLine={false}
                                    />
                                    <YAxis
                                        tick={{ fontSize: 10, fill: "#9ca3af" }}
                                        axisLine={false}
                                        tickLine={false}
                                        unit="h"
                                    />
                                    <Tooltip
                                        contentStyle={{
                                            backgroundColor: "#1f2937",
                                            border: "none",
                                            borderRadius: "8px",
                                            fontSize: "12px"
                                        }}
                                    />
                                    <ReferenceLine y={16} stroke="#f97316" strokeDasharray="3 3" />
                                    <Bar
                                        dataKey="duration"
                                        fill="url(#colorGradient)"
                                        radius={[4, 4, 0, 0]}
                                    />
                                    <defs>
                                        <linearGradient id="colorGradient" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="0%" stopColor="#8b5cf6" />
                                            <stop offset="100%" stopColor="#3b82f6" />
                                        </linearGradient>
                                    </defs>
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                )}

                {/* Fasting Log List */}
                <div className="space-y-3">
                    <h2 className="text-sm font-semibold text-gray-600 dark:text-gray-400">전체 기록</h2>

                    {logs.length === 0 ? (
                        <div className="bg-white dark:bg-gray-900 rounded-2xl p-8 text-center shadow-sm">
                            <span className="text-4xl mb-3 block">🌙</span>
                            <p className="text-gray-500">아직 완료된 단식이 없습니다.</p>
                            <Link href="/" className="text-blue-600 text-sm mt-2 inline-block hover:underline">
                                첫 단식 시작하기 →
                            </Link>
                        </div>
                    ) : (
                        logs.map((log) => {
                            const isSuccess = (log.duration || 0) >= log.goalHours * 3600;
                            return (
                                <div
                                    key={log.id}
                                    className="bg-white dark:bg-gray-900 rounded-xl p-4 shadow-sm border-l-4 transition"
                                    style={{ borderColor: isSuccess ? "#22c55e" : "#f97316" }}
                                >
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <div className="font-medium">
                                                {formatDate(log.startTime)}
                                            </div>
                                            <div className="text-sm text-gray-500 mt-1">
                                                {new Date(log.startTime).toLocaleTimeString("ko-KR", { hour: "2-digit", minute: "2-digit" })}
                                                {" → "}
                                                {log.endTime && new Date(log.endTime).toLocaleTimeString("ko-KR", { hour: "2-digit", minute: "2-digit" })}
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <div className="font-bold" style={{ color: isSuccess ? "#22c55e" : "#f97316" }}>
                                                {formatDuration(log.duration || 0)}
                                            </div>
                                            <div className="text-xs text-gray-400">
                                                목표: {log.goalHours}h {isSuccess ? "✓" : ""}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            );
                        })
                    )}
                </div>
            </div>
        </div>
    );
}
