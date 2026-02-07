"use client";

import Link from "next/link";
import { FastingEntry } from "../hooks/useFasting";

interface HistoryProps {
    history: FastingEntry[];
}

export default function History({ history }: HistoryProps) {
    if (history.length === 0) {
        return (
            <div className="w-full max-w-md p-6 bg-gray-50 dark:bg-gray-900 rounded-3xl mt-8 text-center text-gray-500">
                <p>아직 완료된 단식이 없습니다. 오늘 시작해보세요!</p>
            </div>
        );
    }

    const formatDuration = (seconds: number) => {
        const h = Math.floor(seconds / 3600);
        const m = Math.floor((seconds % 3600) / 60);
        return `${h}시간 ${m}분`;
    };

    const formatDate = (timestamp: number) => {
        return new Date(timestamp).toLocaleDateString("ko-KR", { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
    }

    // Show only last 3 entries
    const recentHistory = history.slice(0, 3);

    return (
        <div className="w-full max-w-md mt-6">
            <div className="flex justify-between items-center mb-4 px-2">
                <h2 className="text-xl font-bold">최근 기록</h2>
                <Link href="/history" className="text-sm text-blue-600 hover:text-blue-800">
                    전체 보기 →
                </Link>
            </div>
            <div className="flex flex-col gap-3">
                {recentHistory.map((entry) => (
                    <div key={entry.id} className="flex justify-between items-center p-4 bg-gray-50 dark:bg-gray-900 rounded-2xl">
                        <div className="flex flex-col">
                            <span className="text-xs text-gray-400">종료: {formatDate(entry.endTime)}</span>
                            <span className="font-semibold text-gray-700 dark:text-gray-300">
                                {formatDuration(entry.duration)}
                            </span>
                        </div>
                        <div className={`px-3 py-1 rounded-full text-xs font-bold ${entry.duration > 12 * 3600 ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' : 'bg-gray-200 text-gray-600 dark:bg-gray-700 dark:text-gray-400'}`}>
                            {entry.duration > 16 * 3600 ? '🔥 훌륭해요' : '좋아요'}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

