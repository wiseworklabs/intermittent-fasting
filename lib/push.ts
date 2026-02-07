// Helper to manage push notification subscriptions

export async function subscribeToPush(): Promise<PushSubscription | null> {
    console.log("[Push] Starting subscription process...");

    if (!("serviceWorker" in navigator) || !("PushManager" in window)) {
        console.warn("[Push] Push notifications are not supported");
        return null;
    }

    try {
        console.log("[Push] Waiting for service worker...");

        // Add timeout to prevent infinite waiting
        const timeoutPromise = new Promise<null>((_, reject) =>
            setTimeout(() => reject(new Error("Service worker timeout")), 10000)
        );

        const registration = await Promise.race([
            navigator.serviceWorker.ready,
            timeoutPromise
        ]) as ServiceWorkerRegistration;

        console.log("[Push] Service worker ready:", registration);

        // Get existing subscription or create new one
        let subscription = await registration.pushManager.getSubscription();
        console.log("[Push] Existing subscription:", subscription);

        if (!subscription) {
            const publicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
            console.log("[Push] VAPID public key available:", !!publicKey);

            if (!publicKey) {
                console.error("[Push] VAPID public key not found");
                return null;
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
            return null;
        }

        console.log("[Push] Subscription saved successfully!");
        return subscription;
    } catch (error) {
        console.error("[Push] Failed to subscribe:", error);
        return null;
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
        const response = await fetch("/api/push/send", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                title: "🔔 FastTrack 테스트 알림",
                body: "단식 목표를 달성했습니다! 축하합니다! 🎉",
            }),
        });

        const data = await response.json();

        if (!response.ok) {
            return { success: false, message: data.error || "Failed to send notification" };
        }

        return {
            success: true,
            message: `알림 전송 완료 (${data.sent}/${data.total})`
        };
    } catch (error) {
        console.error("Failed to send test push:", error);
        return { success: false, message: "네트워크 오류" };
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
