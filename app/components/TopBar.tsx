
import { Zap } from "lucide-react";

export default function TopBar() {
    return (
        <header className="fixed top-0 left-0 right-0 bg-white/80 dark:bg-gray-900/80 backdrop-blur-md z-50 border-b border-gray-100 dark:border-gray-800 h-14">
            <div className="max-w-md mx-auto h-full flex items-center justify-center px-4 relative">
                <div className="flex items-center gap-2 text-orange-500 animate-pulse-slow">
                    <div className="bg-orange-100 dark:bg-orange-900/30 p-2 rounded-full">
                        <Zap size={20} fill="currentColor" />
                    </div>
                    {/* <span className="font-bold text-lg tracking-tight">FastTrack</span>  User requested icon only replacement implies maybe just Logo in center? Or Icon + Name? User said "replace fasttrack text with icon". So I will put just the icon or Icon + a small label if needed. Let's put a nice Centered Icon Logo. */}
                </div>
            </div>
        </header>
    );
}
