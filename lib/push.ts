// Helper to manage push notification subscriptions

export interface PushResult {
    success: boolean;
    subscription?: PushSubscription;
    error?: string;
}

export async function subscribeToPush(): Promise<PushResult> {
    console.log("[Push] Starting subscription process...");

    if (!("serviceWorker" in navigator) || !("PushManager" in window)) {
        return { success: false, error: "이 브라우저는 푸시 알림을 지원하지 않습니다" };
    }

    try {
        // First, make sure SW is registered
        const registrations = await navigator.serviceWorker.getRegistrations();
        console.log("[Push] Current registrations:", registrations.length);

        if (registrations.length === 0) {
            // Try to register SW manually
            console.log("[Push] No SW found, registering...");
            try {
                await navigator.serviceWorker.register("/sw.js", { scope: "/" });
                console.log("[Push] SW registered successfully");
            } catch (regError) {
                return { success: false, error: `Service Worker 등록 실패: ${regError instanceof Error ? regError.message : "Unknown"}` };
            }
        }

        console.log("[Push] Waiting for service worker to be ready...");

        // Wait for SW with longer timeout for iOS
        const timeoutPromise = new Promise<null>((_, reject) =>
            setTimeout(() => reject(new Error("Service Worker가 준비되지 않았습니다. 앱을 다시 설치해주세요.")), 15000)
        );

        const registration = await Promise.race([
            navigator.serviceWorker.ready,
            timeoutPromise
        ]) as ServiceWorkerRegistration;

        console.log("[Push] Service worker ready:", registration.scope);

        // Get existing subscription or create new one
        let subscription = await registration.pushManager.getSubscription();
        console.log("[Push] Existing subscription:", subscription);

        if (!subscription) {
            const publicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
            console.log("[Push] VAPID public key available:", !!publicKey);

            if (!publicKey) {
                return { success: false, error: "VAPID 키가 설정되지 않았습니다" };
            }

            console.log("[Push] Creating new subscription...");
            subscription = await registration.pushManager.subscribe({
                userVisibleOnly: true,
                applicationServerKey: urlBase64ToUint8Array(publicKey) as BufferSource,
            });
            console.log("[Push] New subscription created:", subscription.endpoint);
        }

        // Save subscription to server
        console.log("[Push] Saving to server...");
        const response = await fetch("/api/push/subscribe", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ subscription }),
        });

        console.log("[Push] Server response status:", response.status);

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            console.error("[Push] Failed to save subscription:", errorData);
            return { success: false, error: `서버 저장 실패: ${response.status} - ${errorData.error || "Unknown error"}` };
        }

        console.log("[Push] Subscription saved successfully!");
        return { success: true, subscription };
    } catch (error) {
        console.error("[Push] Failed to subscribe:", error);
        const errorMessage = error instanceof Error ? error.message : "알 수 없는 에러";
        return { success: false, error: `푸시 등록 실패: ${errorMessage}` };
    }
}

export async function unsubscribeFromPush(): Promise<boolean> {
    if (!("serviceWorker" in navigator)) {
        return false;
    }

    try {
        const registration = await navigator.serviceWorker.ready;
        const subscription = await registration.pushManager.getSubscription();

        if (subscription) {
            // Unsubscribe from push manager
            await subscription.unsubscribe();

            // Remove from server
            await fetch("/api/push/subscribe", {
                method: "DELETE",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ endpoint: subscription.endpoint }),
            });
        }

        return true;
    } catch (error) {
        console.error("Failed to unsubscribe from push:", error);
        return false;
    }
}

export async function sendTestPush(): Promise<{ success: boolean; message: string }> {
    try {
        console.log("[Push] Sending test push...");
        const response = await fetch("/api/push/send", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                title: "🔔 FastTrack 테스트 알림",
                body: "단식 목표를 달성했습니다! 축하합니다! 🎉",
            }),
        });

        console.log("[Push] Send response status:", response.status);

        if (!response.ok) {
            let errorMessage = `서버 에러 (${response.status})`;
            try {
                const data = await response.json();
                errorMessage = data.error || errorMessage;
            } catch {
                // Response wasn't JSON
            }
            return { success: false, message: errorMessage };
        }

        const data = await response.json();
        return {
            success: true,
            message: `알림 전송 완료 (${data.sent}/${data.total})`
        };
    } catch (error) {
        console.error("[Push] Failed to send test push:", error);
        const errorMessage = error instanceof Error ? error.message : "Unknown error";
        return { success: false, message: `네트워크 오류: ${errorMessage}` };
    }
}

// Helper function to convert VAPID key
function urlBase64ToUint8Array(base64String: string): Uint8Array {
    const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
    const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);
    for (let i = 0; i < rawData.length; ++i) {
        outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
}
