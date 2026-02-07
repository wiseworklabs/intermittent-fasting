"use client";

import { useFasting } from "./hooks/useFasting";
import Timer from "./components/Timer";
import Controls from "./components/Controls";
import History from "./components/History";
import Settings from "./components/Settings";
import AuthButton from "./components/AuthButton";

export default function Home() {
  const { isFasting, startTime, history, goalHours, startFast, endFast, cancelFast, setGoal, isLoaded, user } = useFasting();

  if (!isLoaded) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen p-4 pb-20 sm:p-8 font-[family-name:var(--font-geist-sans)] max-w-md mx-auto">
      <header className="flex justify-between items-center py-4">
        <h1 className="text-2xl font-bold">FastTrack</h1>
        <div className="flex items-center gap-2">
          <AuthButton />
          <Settings currentGoal={goalHours} onUpdateGoal={setGoal} />
        </div>
      </header>

      <main className="flex-1 flex flex-col items-center justify-center gap-10 py-8">
        <Timer isFasting={isFasting} startTime={startTime} goalHours={goalHours} />

        <div className="w-full flex justify-center">
          <Controls
            isFasting={isFasting}
            goalHours={goalHours}
            onStart={startFast}
            onEnd={endFast}
            onCancel={cancelFast}
            onSetGoal={setGoal}
          />
        </div>

        <History history={history} />
      </main>
    </div>
  );
}
