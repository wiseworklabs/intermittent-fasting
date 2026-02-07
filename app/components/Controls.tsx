"use client";

import { useState } from "react";
import { GOAL_PRESETS } from "./FastingStages";

interface ControlsProps {
    isFasting: boolean;
    goalHours: number;
    onStart: (customStartTime?: number) => void;
    onEnd: () => void;
    onCancel: () => void;
    onSetGoal: (hours: number) => void;
}

export default function Controls({ isFasting, goalHours, onStart, onEnd, onCancel, onSetGoal }: ControlsProps) {
    const [showStartModal, setShowStartModal] = useState(false);
    const [customTime, setCustomTime] = useState("");

    const handleStartNow = () => {
        onStart();
        setShowStartModal(false);
    };

    const handleCustomStart = () => {
        if (customTime) {
            const [hours, minutes] = customTime.split(":").map(Number);
            const now = new Date();
            const customDate = new Date(now.getFullYear(), now.getMonth(), now.getDate(), hours, minutes);

            // 선택한 시간이 현재보다 미래면 전날로 설정
            if (customDate > now) {
                customDate.setDate(customDate.getDate() - 1);
            }

            onStart(customDate.getTime());
        }
        setShowStartModal(false);
        setCustomTime("");
    };

    if (isFasting) {
        return (
            <div className="flex flex-col gap-3 w-full max-w-xs">
                <button
                    onClick={onEnd}
                    className="w-full py-4 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white rounded-2xl font-bold text-lg shadow-lg shadow-red-500/30 active:scale-95 transition-all"
                >
                    단식 종료
                </button>
                <button
                    onClick={onCancel}
                    className="text-gray-400 text-sm py-2 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
                >
                    취소 (저장 안함)
                </button>
            </div>
        );
    }

    return (
        <>
            <div className="flex flex-col gap-4 w-full max-w-xs">
                {/* Goal Duration Selector */}
                <div className="space-y-2">
                    <span className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        목표 시간
                    </span>
                    <div className="grid grid-cols-3 gap-2">
                        {GOAL_PRESETS.map((preset) => (
                            <button
                                key={preset.hours}
                                onClick={() => onSetGoal(preset.hours)}
                                className={`relative py-2 px-3 rounded-xl text-sm font-medium transition-all ${goalHours === preset.hours
                                        ? "bg-blue-500 text-white shadow-md shadow-blue-500/30"
                                        : "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700"
                                    }`}
                            >
                                {preset.label}
                                {preset.isRecommended && goalHours !== preset.hours && (
                                    <span className="absolute -top-1 -right-1 text-[8px] bg-orange-500 text-white px-1 rounded-full">
                                        추천
                                    </span>
                                )}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Start Button */}
                <button
                    onClick={() => setShowStartModal(true)}
                    className="w-full py-4 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white rounded-2xl font-bold text-lg shadow-lg shadow-blue-500/30 active:scale-95 transition-all"
                >
                    단식 시작
                </button>
            </div>

            {/* Start Time Modal */}
            {showStartModal && (
                <div
                    className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-end sm:items-center justify-center z-50 p-4"
                    onClick={() => setShowStartModal(false)}
                >
                    <div
                        className="bg-white dark:bg-gray-900 rounded-t-3xl sm:rounded-3xl w-full max-w-sm p-6 space-y-4"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <h3 className="text-lg font-bold text-center">언제 시작했나요?</h3>

                        {/* Start Now */}
                        <button
                            onClick={handleStartNow}
                            className="w-full py-4 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl font-semibold flex items-center justify-center gap-2 hover:scale-[1.02] active:scale-[0.98] transition"
                        >
                            <span className="text-xl">⚡</span>
                            지금 시작
                        </button>

                        {/* Divider */}
                        <div className="flex items-center gap-3">
                            <div className="flex-1 border-t border-gray-200 dark:border-gray-700"></div>
                            <span className="text-xs text-gray-400">또는</span>
                            <div className="flex-1 border-t border-gray-200 dark:border-gray-700"></div>
                        </div>

                        {/* Custom Time */}
                        <div className="space-y-2">
                            <label className="text-sm text-gray-500">시작 시간 직접 선택</label>
                            <input
                                type="time"
                                value={customTime}
                                onChange={(e) => setCustomTime(e.target.value)}
                                className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-lg font-mono focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                            />
                            <button
                                onClick={handleCustomStart}
                                disabled={!customTime}
                                className="w-full py-3 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-200 rounded-xl font-medium disabled:opacity-40 disabled:cursor-not-allowed hover:bg-gray-200 dark:hover:bg-gray-700 transition"
                            >
                                이 시간에 시작했음
                            </button>
                        </div>

                        {/* Cancel */}
                        <button
                            onClick={() => setShowStartModal(false)}
                            className="w-full py-3 text-gray-400 text-sm hover:text-gray-600 dark:hover:text-gray-200 transition"
                        >
                            취소
                        </button>
                    </div>
                </div>
            )}
        </>
    );
}
