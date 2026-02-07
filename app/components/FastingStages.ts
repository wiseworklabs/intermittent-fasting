// Fasting stage definitions with hour thresholds and motivational messages
export interface FastingStage {
    id: string;
    name: string;
    nameKo: string;
    minHours: number;
    maxHours: number;
    color: string;
    icon: string;
    message: string;
    messageKo: string;
    description: string;
    descriptionKo: string;
}

export const FASTING_STAGES: FastingStage[] = [
    {
        id: "fed",
        name: "Fed State",
        nameKo: "식후 상태",
        minHours: 0,
        maxHours: 4,
        color: "#94a3b8", // slate-400
        icon: "🍽️",
        message: "Digestion in progress",
        messageKo: "소화 중입니다",
        description: "Body is digesting and absorbing nutrients",
        descriptionKo: "몸이 영양분을 흡수하고 있어요 냠냠"
    },
    {
        id: "early",
        name: "Early Fasting",
        nameKo: "초기 단식",
        minHours: 4,
        maxHours: 8,
        color: "#60a5fa", // blue-400
        icon: "🌤️",
        message: "Blood sugar stabilizing",
        messageKo: "혈당이 안정되고 있어요",
        description: "Insulin levels dropping, body transitioning",
        descriptionKo: "인슐린이 내려가고 있어요!"
    },
    {
        id: "gluconeogenesis",
        name: "Gluconeogenesis",
        nameKo: "당신생",
        minHours: 8,
        maxHours: 12,
        color: "#c084fc", // purple-400
        icon: "🔄",
        message: "Liver producing glucose",
        messageKo: "에너지 전환 중",
        description: "Body creating glucose from non-carb sources",
        descriptionKo: "몸이 스스로 에너지를 만들고 있어요"
    },
    {
        id: "ketosis",
        name: "Fat Burning",
        nameKo: "지방 연소",
        minHours: 12,
        maxHours: 18,
        color: "#fb923c", // orange-400
        icon: "🔥",
        message: "Entering ketosis!",
        messageKo: "지방이 타고 있어요!",
        description: "Body burning fat for energy",
        descriptionKo: "본격적으로 지방을 태우기 시작했어요 화이팅!"
    },
    {
        id: "deepKetosis",
        name: "Deep Ketosis",
        nameKo: "심화 키토시스",
        minHours: 18,
        maxHours: 24,
        color: "#f472b6", // pink-400
        icon: "💪",
        message: "Maximum fat burning",
        messageKo: "체지방 연소 최고조!",
        description: "Peak fat oxidation and ketone production",
        descriptionKo: "놀라워요! 지방이 엄청나게 타고 있습니다"
    },
    {
        id: "autophagy",
        name: "Autophagy",
        nameKo: "오토파지",
        minHours: 24,
        maxHours: 72,
        color: "#4ade80", // green-400
        icon: "✨",
        message: "Cellular cleanup activated!",
        messageKo: "세포가 젊어지고 있어요",
        description: "Body recycling damaged cells",
        descriptionKo: "내 몸의 청소부가 활동 중입니다✨"
    }
];

export const GOAL_PRESETS = [
    { hours: 12, label: "12h", description: "Beginner", descriptionKo: "초보" },
    { hours: 14, label: "14h", description: "Easy", descriptionKo: "쉬움" },
    { hours: 16, label: "16h", description: "Popular", descriptionKo: "인기", isRecommended: true },
    { hours: 18, label: "18h", description: "Moderate", descriptionKo: "중급" },
    { hours: 20, label: "20h", description: "Advanced", descriptionKo: "상급" },
    { hours: 24, label: "24h", description: "Expert", descriptionKo: "전문가" },
];

export function getCurrentStage(elapsedHours: number): FastingStage {
    for (let i = FASTING_STAGES.length - 1; i >= 0; i--) {
        if (elapsedHours >= FASTING_STAGES[i].minHours) {
            return FASTING_STAGES[i];
        }
    }
    return FASTING_STAGES[0];
}

export function getNextStage(elapsedHours: number): FastingStage | null {
    const current = getCurrentStage(elapsedHours);
    const currentIndex = FASTING_STAGES.findIndex(s => s.id === current.id);
    if (currentIndex < FASTING_STAGES.length - 1) {
        return FASTING_STAGES[currentIndex + 1];
    }
    return null;
}
