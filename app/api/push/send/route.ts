import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import webpush from "web-push";

// VAPID configuration (lazy initialization)
let vapidConfigured = false;

function ensureVapidConfigured() {
    if (!vapidConfigured && process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY && process.env.VAPID_PRIVATE_KEY) {
        webpush.setVapidDetails(
            "mailto:biz@wiseworklabs.com",
            process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY,
            process.env.VAPID_PRIVATE_KEY
        );
        vapidConfigured = true;
    }
}

export async function POST(request: NextRequest) {
    const session = await auth();

    if (!session?.user?.id) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Only allow admin users to send test notifications
    const isAdmin = session.user.email?.endsWith("@wiseworklabs.com");
    if (!isAdmin) {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Configure VAPID at runtime
    ensureVapidConfigured();

    try {
        const { title, body, userId } = await request.json();

        // Get user's push subscriptions
        const targetUserId = userId || session.user.id;
        const subscriptions = await prisma.pushSubscription.findMany({
            where: { userId: targetUserId },
        });

        if (subscriptions.length === 0) {
            return NextResponse.json({
                success: false,
                error: "No push subscriptions found for this user"
            }, { status: 404 });
        }

        const payload = JSON.stringify({
            title: title || "🎉 FastTrack",
            body: body || "단식 목표를 달성했습니다!",
            icon: "/icon-192x192.png",
            badge: "/icon-192x192.png",
            data: {
                url: "/",
            },
        });

        // Send to all user's subscriptions
        const results = await Promise.allSettled(
            subscriptions.map(async (sub) => {
                try {
                    await webpush.sendNotification(
                        {
                            endpoint: sub.endpoint,
                            keys: {
                                p256dh: sub.p256dh,
                                auth: sub.auth,
                            },
                        },
                        payload
                    );
                    return { success: true, endpoint: sub.endpoint };
                } catch (error: unknown) {
                    // If subscription is expired/invalid, delete it
                    const err = error as { statusCode?: number };
                    if (err.statusCode === 410 || err.statusCode === 404) {
                        await prisma.pushSubscription.delete({
                            where: { id: sub.id },
                        });
                    }
                    return { success: false, endpoint: sub.endpoint, error };
                }
            })
        );

        const successCount = results.filter(
            (r) => r.status === "fulfilled" && r.value.success
        ).length;

        return NextResponse.json({
            success: true,
            sent: successCount,
            total: subscriptions.length
        });
    } catch (error) {
        console.error("Failed to send push notification:", error);
        return NextResponse.json({ error: "Failed to send notification" }, { status: 500 });
    }
}
