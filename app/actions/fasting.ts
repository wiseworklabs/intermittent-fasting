"use server";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { logger } from "@/lib/logger";

export async function getFastingLogs() {
    const session = await auth();
    if (!session?.user?.id) return { active: null, history: [] };

    const activeFast = await prisma.fastingLog.findFirst({
        where: {
            userId: session.user.id,
            endTime: null,
        },
        orderBy: {
            startTime: "desc",
        },
    });

    const history = await prisma.fastingLog.findMany({
        where: {
            userId: session.user.id,
            endTime: { not: null },
        },
        orderBy: {
            endTime: "desc",
        },
        take: 20,
    });

    return { active: activeFast, history };
}

export async function startFast(goalHours: number, customStartTime?: Date) {
    const session = await auth();
    if (!session?.user?.id) throw new Error("Unauthorized");

    // Check if already fasting
    const existing = await prisma.fastingLog.findFirst({
        where: { userId: session.user.id, endTime: null },
    });
    if (existing) return existing;

    const log = await prisma.fastingLog.create({
        data: {
            userId: session.user.id,
            startTime: customStartTime || new Date(),
            goalHours,
        },
    });

    logger.info("단식 시작", {
        userId: session.user.id,
        goalHours,
        customStartTime: customStartTime?.toISOString()
    });

    return log;
}

export async function endFast(logId: string) {
    const session = await auth();
    if (!session?.user?.id) throw new Error("Unauthorized");

    const log = await prisma.fastingLog.findUnique({
        where: { id: logId },
    });

    if (!log || log.userId !== session.user.id) throw new Error("Not found or unauthorized");

    const now = new Date();
    const duration = Math.floor((now.getTime() - log.startTime.getTime()) / 1000);
    const hours = Math.round(duration / 3600 * 10) / 10;

    const result = await prisma.fastingLog.update({
        where: { id: logId },
        data: {
            endTime: now,
            duration,
        },
    });

    logger.info("단식 완료", {
        userId: session.user.id,
        duration: `${hours}시간`,
        goalHours: log.goalHours,
        success: duration >= log.goalHours * 3600
    });

    return result;
}

export async function cancelFast(logId: string) {
    const session = await auth();
    if (!session?.user?.id) throw new Error("Unauthorized");

    const log = await prisma.fastingLog.findUnique({
        where: { id: logId },
    });

    if (!log || log.userId !== session.user.id) throw new Error("Not found or unauthorized");

    logger.info("단식 취소", { userId: session.user.id, logId });

    return await prisma.fastingLog.delete({
        where: { id: logId }
    });
}
