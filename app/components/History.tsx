"use client";

import { FastingEntry } from "../hooks/useFasting";

interface HistoryProps {
    history: FastingEntry[];
}

export default function History({ history }: HistoryProps) {
    if (history.length === 0) {
        return (
            <div className="w-full max-w-md p-6 bg-gray-50 dark:bg-gray-900 rounded-3xl mt-8 text-center text-gray-500">
                <p>No completed fasts yet. Start one today!</p>
            </div>
        );
    }

    const formatDuration = (seconds: number) => {
        const h = Math.floor(seconds / 3600);
        const m = Math.floor((seconds % 3600) / 60);
        return `${h}h ${m}m`;
    };

    const formatDate = (timestamp: number) => {
        return new Date(timestamp).toLocaleDateString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
    }

    return (
        <div className="w-full max-w-md mt-6">
            <h2 className="text-xl font-bold mb-4 px-2">Recent Fasts</h2>
            <div className="flex flex-col gap-3">
                {history.map((entry) => (
                    <div key={entry.id} className="flex justify-between items-center p-4 bg-gray-50 dark:bg-gray-900 rounded-2xl">
                        <div className="flex flex-col">
                            <span className="text-xs text-gray-400">Ended {formatDate(entry.endTime)}</span>
                            <span className="font-semibold text-gray-700 dark:text-gray-300">
                                {formatDuration(entry.duration)}
                            </span>
                        </div>
                        <div className={`px-3 py-1 rounded-full text-xs font-bold ${entry.duration > 12 * 3600 ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' : 'bg-gray-200 text-gray-600 dark:bg-gray-700 dark:text-gray-400'}`}>
                            {entry.duration > 16 * 3600 ? '🔥 Great' : 'Good'}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
