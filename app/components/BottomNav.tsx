
import { Home, BarChart2, User } from "lucide-react";

interface BottomNavProps {
    activeTab: string;
    setActiveTab: (tab: string) => void;
}

export default function BottomNav({ activeTab, setActiveTab }: BottomNavProps) {
    const tabs = [
        { id: "timer", label: "타이머", icon: <Home size={24} /> },
        { id: "history", label: "기록", icon: <BarChart2 size={24} /> },
        { id: "profile", label: "나의 정보", icon: <User size={24} /> },
    ];

    return (
        <nav className="fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-900 border-t border-gray-100 dark:border-gray-800 pb-safe pt-2 px-6 shadow-[0_-5px_20px_rgba(0,0,0,0.05)] z-50">
            <div className="flex justify-between items-center max-w-md mx-auto">
                {tabs.map((tab) => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`flex flex-col items-center gap-1 p-2 rounded-2xl transition-all duration-300 ${activeTab === tab.id
                                ? "text-orange-500 -translate-y-1"
                                : "text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                            }`}
                    >
                        <div className={`p-1.5 rounded-xl transition-all ${activeTab === tab.id ? "bg-orange-50 dark:bg-orange-900/20" : "bg-transparent"
                            }`}>
                            {tab.icon}
                        </div>
                        <span className={`text-[10px] font-bold ${activeTab === tab.id ? "opacity-100" : "opacity-0 h-0 overflow-hidden"}`}>
                            {tab.label}
                        </span>
                    </button>
                ))}
            </div>
        </nav>
    );
}
