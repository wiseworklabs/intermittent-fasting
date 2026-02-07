import { NextRequest, NextResponse } from "next/server";
import logtail from "@/lib/logtail";

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { message, data } = body;

        if (process.env.LOGTAIL_SOURCE_TOKEN) {
            await logtail.info(message, data);
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Failed to send log:", error);
        return NextResponse.json({ success: false, error: "Failed to send log" }, { status: 500 });
    }
}
