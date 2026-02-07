
interface HistoryViewProps {
    children: React.ReactNode;
}

export default function HistoryView({ children }: HistoryViewProps) {
    return (
        <div className="w-full py-6 animate-in slide-in-from-right duration-300">
            <h2 className="text-2xl font-bold mb-6 px-4 text-gray-800 dark:text-gray-100 flex items-center gap-2">
                <span>📊</span> 나의 기록
            </h2>
            {children}
        </div>
    );
}
