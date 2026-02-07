
interface ProfileViewProps {
    children: React.ReactNode;
}

export default function ProfileView({ children }: ProfileViewProps) {
    return (
        <div className="w-full py-6 animate-in slide-in-from-right duration-300 px-4 space-y-6">
            <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100 flex items-center gap-2">
                <span>👤</span> 내 정보
            </h2>
            {children}
        </div>
    );
}
