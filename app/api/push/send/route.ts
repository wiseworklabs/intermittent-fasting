import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import webpush from "web-push";

// VAPID configuration (lazy initialization)
let vapidConfigured = false;
let vapidError: string | null = null;

function ensureVapidConfigured(): boolean {
    if (vapidConfigured) return true;

    if (!process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY) {
        vapidError = "VAPID_PUBLIC_KEY 환경변수가 설정되지 않았습니다";
        return false;
    }
    if (!process.env.VAPID_PRIVATE_KEY) {
        vapidError = "VAPID_PRIVATE_KEY 환경변수가 설정되지 않았습니다";
        return false;
    }

    try {
        webpush.setVapidDetails(
            "mailto:biz@wiseworklabs.com",
            process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY,
            process.env.VAPID_PRIVATE_KEY
        );
        vapidConfigured = true;
        return true;
    } catch (e) {
        vapidError = `VAPID 설정 실패: ${e instanceof Error ? e.message : "Unknown"}`;
        return false;
    }
}

export async function POST(request: NextRequest) {
    try {
        const session = await auth();

        if (!session?.user?.id) {
            return NextResponse.json({ error: "로그인이 필요합니다" }, { status: 401 });
        }

        // Only allow admin users to send test notifications - RESTRICTION REMOVED
        /*
        const isAdmin = session.user.email?.endsWith("@wiseworklabs.com");
        if (!isAdmin) {
            return NextResponse.json({ error: "관리자 권한이 필요합니다" }, { status: 403 });
        }
        */

        // Configure VAPID at runtime
        if (!ensureVapidConfigured()) {
            return NextResponse.json({ error: vapidError || "VAPID 설정 실패" }, { status: 500 });
        }

        const { title, body, userId } = await request.json();

        // Get user's push subscriptions
        const targetUserId = userId || session.user.id;
        const subscriptions = await prisma.pushSubscription.findMany({
            where: { userId: targetUserId },
        });

        if (subscriptions.length === 0) {
            return NextResponse.json({
                success: false,
                error: "등록된 푸시 구독이 없습니다. 푸시 알림을 먼저 활성화해주세요."
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
                    const err = error as { statusCode?: number; message?: string };
                    if (err.statusCode === 410 || err.statusCode === 404) {
                        await prisma.pushSubscription.delete({
                            where: { id: sub.id },
                        });
                    }
                    return { success: false, endpoint: sub.endpoint, error: err.message };
                }
            })
        );

        const successCount = results.filter(
            (r) => r.status === "fulfilled" && r.value.success
        ).length;

        const failures = results
            .filter((r) => r.status === "fulfilled" && !r.value.success)
            .map((r) => (r as PromiseFulfilledResult<{ error?: string }>).value.error);

        if (successCount === 0 && failures.length > 0) {
            return NextResponse.json({
                success: false,
                error: `푸시 전송 실패: ${failures[0]}`,
                sent: 0,
                total: subscriptions.length
            }, { status: 500 });
        }

        return NextResponse.json({
            success: true,
            sent: successCount,
            total: subscriptions.length
        });
    } catch (error) {
        console.error("Failed to send push notification:", error);
        const errorMessage = error instanceof Error ? error.message : "Unknown error";
        return NextResponse.json({
            error: `푸시 알림 전송 실패: ${errorMessage}`
        }, { status: 500 });
    }
}
