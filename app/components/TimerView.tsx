
interface TimerViewProps {
    children: React.ReactNode;
}

export default function TimerView({ children }: TimerViewProps) {
    return (
        <div className="flex flex-col items-center justify-center min-h-full gap-8 py-8 animate-in fade-in zoom-in duration-300">
            {children}
        </div>
    );
}
