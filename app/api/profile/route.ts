import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
    const session = await auth();

    if (!session?.user?.id) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
        where: { id: session.user.id },
        select: { id: true, name: true, email: true, nickname: true, image: true },
    });

    return NextResponse.json(user);
}

export async function PATCH(request: NextRequest) {
    const session = await auth();

    if (!session?.user?.id) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const { nickname } = await request.json();

        if (typeof nickname !== "string" || nickname.length > 50) {
            return NextResponse.json(
                { error: "Invalid nickname" },
                { status: 400 }
            );
        }

        const user = await prisma.user.update({
            where: { id: session.user.id },
            data: { nickname: nickname.trim() || null },
            select: { id: true, name: true, email: true, nickname: true, image: true },
        });

        return NextResponse.json(user);
    } catch {
        return NextResponse.json(
            { error: "Failed to update profile" },
            { status: 500 }
        );
    }
}
