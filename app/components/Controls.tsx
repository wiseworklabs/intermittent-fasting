"use client";

import { useState } from "react";
import { GOAL_PRESETS } from "./FastingStages";
import { Play, Square, X, Clock, Calendar } from "lucide-react";

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
    const [customDateTime, setCustomDateTime] = useState("");

    const handleStartNow = () => {
        onStart();
        setShowStartModal(false);
    };

    const handleCustomStart = () => {
        if (customDateTime) {
            const selectedDate = new Date(customDateTime);
            onStart(selectedDate.getTime());
        }
        setShowStartModal(false);
        setCustomDateTime("");
    };

    if (isFasting) {
        return (
            <div className="flex flex-col gap-4 w-full max-w-xs animate-in fade-in slide-in-from-bottom-4 duration-500">
                <button
                    onClick={onEnd}
                    className="group relative w-full py-5 bg-gradient-to-br from-rose-400 to-red-500 hover:from-rose-500 hover:to-red-600 text-white rounded-3xl font-bold text-xl shadow-[0_10px_20px_-5px_rgba(244,63,94,0.4)] active:scale-95 transition-all flex items-center justify-center gap-3 overflow-hidden"
                >
                    <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300 rounded-3xl" />
                    <Square fill="currentColor" size={24} />
                    <span>단식 종료</span>
                </button>
                <button
                    onClick={onCancel}
                    className="flex items-center justify-center gap-2 text-gray-400 text-sm py-2 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
                >
                    <X size={14} />
                    <span>기록하지 않고 취소</span>
                </button>
            </div>
        );
    }

    return (
        <>
            <div className="flex flex-col gap-6 w-full max-w-xs animate-in fade-in slide-in-from-bottom-4 duration-500">
                {/* Goal Duration Selector */}
                <div className="space-y-3 bg-white/50 dark:bg-gray-800/50 p-4 rounded-3xl backdrop-blur-sm border border-white/20 shadow-sm">
                    <span className="flex items-center gap-2 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider ml-1">
                        <Clock size={12} />
                        목표 시간 설정
                    </span>
                    <div className="grid grid-cols-3 gap-2">
                        {GOAL_PRESETS.map((preset) => (
                            <button
                                key={preset.hours}
                                onClick={() => onSetGoal(preset.hours)}
                                className={`relative py-3 px-2 rounded-2xl text-sm font-bold transition-all ${goalHours === preset.hours
                                    ? "bg-orange-400 text-white shadow-lg shadow-orange-400/30 scale-105"
                                    : "bg-white dark:bg-gray-700 text-gray-500 dark:text-gray-300 hover:bg-orange-50 dark:hover:bg-gray-600 border border-gray-100 dark:border-gray-600"
                                    }`}
                            >
                                <span className="text-lg">{preset.hours}</span>
                                <span className="text-[10px] ml-0.5">시간</span>
                                {preset.isRecommended && goalHours !== preset.hours && (
                                    <span className="absolute -top-2 -right-1 text-[8px] bg-red-400 text-white px-1.5 py-0.5 rounded-full shadow-sm animate-bounce">
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
                    className="group relative w-full py-5 bg-gradient-to-br from-orange-400 to-pink-500 hover:from-orange-500 hover:to-pink-600 text-white rounded-[2rem] font-black text-2xl shadow-[0_10px_30px_-5px_rgba(251,146,60,0.5)] active:scale-95 transition-all flex items-center justify-center gap-3"
                >
                    <span className="absolute inset-0 rounded-[2rem] bg-white/20 translate-y-2 blur opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                    <Play fill="currentColor" size={28} className="translate-x-1" />
                    <span>START!</span>
                </button>
            </div>

            {/* Start Time Modal */}
            {showStartModal && (
                <div
                    className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-end sm:items-center justify-center z-[100] p-4 animate-in fade-in duration-200"
                    onClick={() => setShowStartModal(false)}
                >
                    <div
                        className="bg-white dark:bg-gray-900 rounded-[2rem] w-full max-w-sm p-6 space-y-6 shadow-2xl animate-in slide-in-from-bottom-10 duration-300"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="text-center space-y-1">
                            <div className="w-12 h-12 bg-orange-100 dark:bg-orange-900/30 rounded-full flex items-center justify-center mx-auto mb-2 text-orange-500">
                                <Calendar size={24} />
                            </div>
                            <h3 className="text-xl font-bold text-gray-800 dark:text-white">언제부터 시작할까요?</h3>
                            <p className="text-gray-400 text-sm">정확한 기록을 위해 시작 시간을 알려주세요!</p>
                        </div>

                        {/* Start Now */}
                        <button
                            onClick={handleStartNow}
                            className="w-full py-4 bg-gradient-to-r from-orange-400 to-pink-500 text-white rounded-2xl font-bold text-lg shadow-lg hover:shadow-xl hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2"
                        >
                            <span>⚡</span>
                            지금 바로 시작!
                        </button>

                        <div className="relative">
                            <div className="absolute inset-0 flex items-center">
                                <div className="w-full border-t border-gray-100 dark:border-gray-800"></div>
                            </div>
                            <div className="relative flex justify-center text-xs uppercase">
                                <span className="bg-white dark:bg-gray-900 px-2 text-gray-400 font-medium">또는 날짜 선택</span>
                            </div>
                        </div>

                        {/* Custom Time */}
                        <div className="space-y-3">
                            <input
                                type="datetime-local"
                                value={customDateTime}
                                onChange={(e) => setCustomDateTime(e.target.value)}
                                className="w-full px-5 py-4 rounded-2xl border border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-800 dark:text-gray-100 text-lg font-medium focus:ring-4 focus:ring-orange-100 dark:focus:ring-orange-900/20 focus:border-orange-300 outline-none transition-all"
                            />
                            <button
                                onClick={handleCustomStart}
                                disabled={!customDateTime}
                                className="w-full py-4 bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 rounded-2xl font-bold hover:bg-gray-200 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                            >
                                이 시간으로 설정 완료
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
