import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
    const session = await auth();

    if (!session?.user?.id) {
        return NextResponse.json([], { status: 200 });
    }

    const logs = await prisma.fastingLog.findMany({
        where: {
            userId: session.user.id,
            endTime: { not: null },
        },
        orderBy: {
            endTime: "desc",
        },
        take: 50,
    });

    return NextResponse.json(logs);
}
