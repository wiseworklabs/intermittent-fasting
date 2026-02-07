"use client";

interface ControlsProps {
    isFasting: boolean;
    onStart: () => void;
    onEnd: () => void;
    onCancel: () => void;
}

export default function Controls({ isFasting, onStart, onEnd, onCancel }: ControlsProps) {
    if (isFasting) {
        return (
            <div className="flex flex-col gap-3 w-full max-w-xs">
                <button
                    onClick={onEnd}
                    className="w-full py-4 bg-red-500 hover:bg-red-600 text-white rounded-2xl font-bold text-lg shadow-lg active:scale-95 transition-all"
                >
                    End Fast
                </button>
                <button
                    onClick={onCancel}
                    className="text-gray-400 text-sm py-2 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
                >
                    Cancel (No Save)
                </button>
            </div>
        );
    }

    return (
        <button
            onClick={onStart}
            className="w-full max-w-xs py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-bold text-lg shadow-lg shadow-blue-600/30 active:scale-95 transition-all animate-pulse-slow"
        >
            Start Fasting
        </button>
    );
}
