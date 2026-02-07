"use client";

import { useEffect, useState } from "react";
import { getCurrentStage, getNextStage, type FastingStage } from "./FastingStages";

interface TimerProps {
    isFasting: boolean;
    startTime: number | null;
    goalHours: number;
}

export default function Timer({ isFasting, startTime, goalHours }: TimerProps) {
    const [elapsed, setElapsed] = useState(0);

    useEffect(() => {
        let interval: NodeJS.Timeout;

        if (isFasting && startTime) {
            setElapsed(Math.floor((Date.now() - startTime) / 1000));

            interval = setInterval(() => {
                setElapsed(Math.floor((Date.now() - startTime) / 1000));
            }, 1000);
        } else {
            setElapsed(0);
        }

        return () => clearInterval(interval);
    }, [isFasting, startTime]);

    const elapsedHours = elapsed / 3600;
    const goalSeconds = goalHours * 3600;
    const progress = Math.min((elapsed / goalSeconds) * 100, 100);
    const currentStage = getCurrentStage(elapsedHours);
    const nextStage = getNextStage(elapsedHours);

    const formatTime = (totalSeconds: number) => {
        const hours = Math.floor(totalSeconds / 3600);
        const minutes = Math.floor((totalSeconds % 3600) / 60);
        const seconds = totalSeconds % 60;
        return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    };

    // 목표까지 남은 시간
    const remainingSeconds = Math.max(goalSeconds - elapsed, 0);
    const isGoalReached = elapsed >= goalSeconds;

    // SVG 원형 진행바 계산
    const radius = 110;
    const circumference = 2 * Math.PI * radius;
    const strokeDashoffset = circumference - (progress / 100) * circumference;

    return (
        <div className="flex flex-col items-center gap-6">
            {/* Circular Progress Timer */}
            <div className="relative w-64 h-64">
                {/* Background Circle */}
                <svg className="absolute inset-0 w-full h-full -rotate-90">
                    <circle
                        cx="128"
                        cy="128"
                        r={radius}
                        strokeWidth="12"
                        fill="none"
                        className="stroke-gray-200 dark:stroke-gray-700"
                    />
                    {/* Progress Circle */}
                    <circle
                        cx="128"
                        cy="128"
                        r={radius}
                        strokeWidth="12"
                        fill="none"
                        stroke={isFasting ? currentStage.color : "#3b82f6"}
                        strokeLinecap="round"
                        strokeDasharray={circumference}
                        strokeDashoffset={isFasting ? strokeDashoffset : circumference}
                        style={{ transition: "stroke-dashoffset 0.5s ease, stroke 0.3s ease" }}
                    />
                </svg>

                {/* Inner Content */}
                <div className="absolute inset-0 flex flex-col items-center justify-center z-10">
                    {isFasting ? (
                        <>
                            <span className="text-3xl mb-1">{currentStage.icon}</span>
                            <span className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                {currentStage.nameKo}
                            </span>
                            <div className="text-4xl font-bold font-mono tracking-tighter mt-1" style={{ color: currentStage.color }}>
                                {formatTime(elapsed)}
                            </div>
                            {!isGoalReached && (
                                <span className="text-xs text-gray-400 mt-1">
                                    목표까지 {formatTime(remainingSeconds)}
                                </span>
                            )}
                            {isGoalReached && (
                                <span className="text-xs text-green-500 font-semibold mt-1 animate-pulse">
                                    🎉 목표 달성!
                                </span>
                            )}
                        </>
                    ) : (
                        <>
                            <span className="text-4xl mb-2">🌙</span>
                            <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
                                단식 준비
                            </span>
                            <span className="text-xs text-gray-400 mt-1">
                                목표: {goalHours}시간
                            </span>
                        </>
                    )}
                </div>
            </div>

            {/* Stage Info Card */}
            {isFasting && (
                <div
                    className="w-full max-w-xs p-4 rounded-2xl border transition-colors"
                    style={{
                        borderColor: currentStage.color + "40",
                        backgroundColor: currentStage.color + "10"
                    }}
                >
                    <p className="text-sm text-center font-medium" style={{ color: currentStage.color }}>
                        {currentStage.messageKo}
                    </p>
                    <p className="text-xs text-center text-gray-500 dark:text-gray-400 mt-1">
                        {currentStage.descriptionKo}
                    </p>
                    {nextStage && (
                        <p className="text-xs text-center text-gray-400 mt-2">
                            다음 단계: {nextStage.nameKo} ({nextStage.minHours}시간)
                        </p>
                    )}
                </div>
            )}

            {/* Start Time Info */}
            {isFasting && startTime && (
                <span className="text-xs text-gray-400">
                    시작: {new Date(startTime).toLocaleTimeString("ko-KR", { hour: '2-digit', minute: '2-digit' })}
                </span>
            )}
        </div>
    );
}
