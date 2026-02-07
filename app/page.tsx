"use client";

import { useState, useEffect } from "react";
import { useFasting } from "./hooks/useFasting";
import Timer from "./components/Timer";
import Controls from "./components/Controls";
import History from "./components/History";
import Settings from "./components/Settings";
import AuthButton from "./components/AuthButton";
import TopBar from "./components/TopBar";
import BottomNav from "./components/BottomNav";
import TimerView from "./components/TimerView";
import HistoryView from "./components/HistoryView";
import ProfileView from "./components/ProfileView";

export default function Home() {
  const { isFasting, startTime, history, goalHours, startFast, endFast, cancelFast, setGoal, isLoaded, user } = useFasting();
  const [activeTab, setActiveTab] = useState("timer");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted || !isLoaded) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white dark:bg-gray-900">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-400"></div>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-gray-50 dark:bg-black font-[family-name:var(--font-geist-sans)] pb-24 pt-[calc(3.5rem+env(safe-area-inset-top))]">
      <TopBar />

      <main className="flex-1 w-full max-w-md mx-auto px-6 overflow-hidden">
        {activeTab === "timer" && (
          <TimerView>
            <Timer isFasting={isFasting} startTime={startTime} goalHours={goalHours} />
            <Controls
              isFasting={isFasting}
              goalHours={goalHours}
              onStart={startFast}
              onEnd={endFast}
              onCancel={cancelFast}
              onSetGoal={setGoal}
            />
          </TimerView>
        )}

        {activeTab === "history" && (
          <HistoryView>
            <History history={history} />
          </HistoryView>
        )}

        {activeTab === "profile" && (
          <ProfileView>
            <div className="bg-white dark:bg-gray-800 rounded-3xl p-6 shadow-sm border border-gray-100 dark:border-gray-700 space-y-6">
              <div className="flex flex-col items-center">
                <div className="w-20 h-20 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center text-4xl mb-3 overflow-hidden">
                  {user?.image ? (
                    <img src={user.image} alt="Profile" className="w-full h-full object-cover" />
                  ) : (
                    <span>👤</span>
                  )}
                </div>
                <h3 className="font-bold text-lg">{user?.name || "게스트"}</h3>
                <p className="text-sm text-gray-500">{user?.email || "로그인되지 않음"}</p>
              </div>

              <div className="border-t border-gray-100 dark:border-gray-700 pt-6">
                <Settings currentGoal={goalHours} onUpdateGoal={setGoal} />
              </div>

              <AuthButton />
            </div>
          </ProfileView>
        )}
      </main>

      <BottomNav activeTab={activeTab} setActiveTab={setActiveTab} />
    </div>
  );
}
