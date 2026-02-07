"use client";

import { useState } from "react";
import { useSession, signIn } from "next-auth/react";
import { GOAL_PRESETS } from "./FastingStages";
import { Play, Square, X, Clock, Calendar, LogIn } from "lucide-react";

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
    const { data: session } = useSession();
    const isLoggedIn = !!session?.user;

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
                {/* Goal Duration Selector - Stepper Style */}
                <div className="bg-white dark:bg-gray-800/80 p-5 rounded-[2rem] shadow-lg border border-gray-100 dark:border-gray-700 flex flex-col items-center gap-3 backdrop-blur-md">
                    <span className="flex items-center gap-2 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        <Clock size={12} />
                        목표 시간
                    </span>

                    <div className="flex items-center justify-between w-full gap-4">
                        <button
                            onClick={() => {
                                const currentIndex = GOAL_PRESETS.findIndex(p => p.hours === goalHours);
                                if (currentIndex > 0) onSetGoal(GOAL_PRESETS[currentIndex - 1].hours);
                                else if (currentIndex === -1) {
                                    // If current goal is not in presets, find closest or default
                                    onSetGoal(16);
                                }
                            }}
                            className="w-12 h-12 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center text-gray-600 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-600 active:scale-90 transition-all text-2xl font-bold"
                        >
                            -
                        </button>

                        <div className="flex flex-col items-center">
                            <span className="text-5xl font-black text-gray-800 dark:text-white font-mono tracking-tighter">
                                {goalHours}
                            </span>
                            <span className="text-xs font-bold text-orange-500">
                                {GOAL_PRESETS.find(p => p.hours === goalHours)?.isRecommended ? "✨ 추천 (인기)" : "시간"}
                            </span>
                        </div>

                        <button
                            onClick={() => {
                                const currentIndex = GOAL_PRESETS.findIndex(p => p.hours === goalHours);
                                if (currentIndex < GOAL_PRESETS.length - 1 && currentIndex !== -1) {
                                    onSetGoal(GOAL_PRESETS[currentIndex + 1].hours);
                                } else if (currentIndex === -1) {
                                    onSetGoal(16);
                                }
                            }}
                            className="w-12 h-12 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center text-gray-600 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-600 active:scale-90 transition-all text-2xl font-bold"
                        >
                            +
                        </button>
                    </div>

                    <div className="h-1 w-full bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden mt-1">
                        <div
                            className="h-full bg-orange-400 rounded-full transition-all duration-300"
                            style={{ width: `${(GOAL_PRESETS.findIndex(p => p.hours === goalHours) / (GOAL_PRESETS.length - 1)) * 100}%` }}
                        />
                    </div>
                </div>

                {/* Start Button */}
                {!isLoggedIn ? (
                    <button
                        onClick={() => signIn("google")}
                        className="group relative w-full py-5 bg-gradient-to-br from-gray-400 to-gray-500 hover:from-blue-500 hover:to-purple-600 text-white rounded-[2rem] font-black text-xl shadow-[0_10px_30px_-5px_rgba(100,100,100,0.5)] hover:shadow-[0_10px_30px_-5px_rgba(59,130,246,0.5)] active:scale-95 transition-all flex flex-col items-center justify-center gap-2 py-6"
                    >
                        <span className="absolute inset-0 rounded-[2rem] bg-white/20 translate-y-2 blur opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                        <div className="flex items-center gap-2">
                            <LogIn size={24} />
                            <span>로그인 필요</span>
                        </div>
                        <span className="text-xs font-normal opacity-90">단식을 시작하려면 로그인해주세요</span>
                    </button>
                ) : (
                    <button
                        onClick={() => setShowStartModal(true)}
                        className="group relative w-full py-5 bg-gradient-to-br from-orange-400 to-pink-500 hover:from-orange-500 hover:to-pink-600 text-white rounded-[2rem] font-black text-2xl shadow-[0_10px_30px_-5px_rgba(251,146,60,0.5)] active:scale-95 transition-all flex items-center justify-center gap-3"
                    >
                        <span className="absolute inset-0 rounded-[2rem] bg-white/20 translate-y-2 blur opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                        <Play fill="currentColor" size={28} className="translate-x-1" />
                        <span>단식 시작!</span>
                    </button>
                )}
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
