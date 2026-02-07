"use client";

import { useEffect, useState } from "react";

interface TimerProps {
    isFasting: boolean;
    startTime: number | null;
}

export default function Timer({ isFasting, startTime }: TimerProps) {
    const [elapsed, setElapsed] = useState(0);

    useEffect(() => {
        let interval: NodeJS.Timeout;

        if (isFasting && startTime) {
            // Update immediately
            setElapsed(Math.floor((Date.now() - startTime) / 1000));

            interval = setInterval(() => {
                setElapsed(Math.floor((Date.now() - startTime) / 1000));
            }, 1000);
        } else {
            setElapsed(0);
        }

        return () => clearInterval(interval);
    }, [isFasting, startTime]);

    const formatTime = (totalSeconds: number) => {
        const hours = Math.floor(totalSeconds / 3600);
        const minutes = Math.floor((totalSeconds % 3600) / 60);
        const seconds = totalSeconds % 60;
        return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    };

    return (
        <div className="flex flex-col items-center justify-center w-64 h-64 rounded-full bg-linear-to-b from-blue-500 to-blue-600 shadow-lg shadow-blue-500/30 dark:shadow-blue-900/40 text-white relative overflow-hidden">
            {/* Background glow/effect can go here */}
            <div className="z-10 flex flex-col items-center">
                <span className="text-sm font-medium opacity-80 uppercase tracking-widest">{isFasting ? "Fasting Time" : "Ready to Fast"}</span>
                <div className="text-5xl font-bold font-mono tracking-tighter mt-2">
                    {formatTime(elapsed)}
                </div>
                {isFasting && (
                    <span className="text-xs mt-2 opacity-60">
                        Started: {new Date(startTime!).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                )}
            </div>
        </div>
    );
}
