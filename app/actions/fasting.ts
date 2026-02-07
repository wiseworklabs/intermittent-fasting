"use server";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

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

export async function startFast(goalHours: number) {
    const session = await auth();
    if (!session?.user?.id) throw new Error("Unauthorized");

    // Check if already fasting
    const existing = await prisma.fastingLog.findFirst({
        where: { userId: session.user.id, endTime: null },
    });
    if (existing) return existing;

    return await prisma.fastingLog.create({
        data: {
            userId: session.user.id,
            startTime: new Date(),
            goalHours,
        },
    });
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

    return await prisma.fastingLog.update({
        where: { id: logId },
        data: {
            endTime: now,
            duration,
        },
    });
}

export async function cancelFast(logId: string) {
    const session = await auth();
    if (!session?.user?.id) throw new Error("Unauthorized");

    const log = await prisma.fastingLog.findUnique({
        where: { id: logId },
    });

    if (!log || log.userId !== session.user.id) throw new Error("Not found or unauthorized");

    return await prisma.fastingLog.delete({
        where: { id: logId }
    });
}
