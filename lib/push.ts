// Helper to manage push notification subscriptions

export async function subscribeToPush(): Promise<PushSubscription | null> {
    if (!("serviceWorker" in navigator) || !("PushManager" in window)) {
        console.warn("Push notifications are not supported");
        return null;
    }

    try {
        const registration = await navigator.serviceWorker.ready;

        // Get existing subscription or create new one
        let subscription = await registration.pushManager.getSubscription();

        if (!subscription) {
            const publicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
            if (!publicKey) {
                console.error("VAPID public key not found");
                return null;
            }

            subscription = await registration.pushManager.subscribe({
                userVisibleOnly: true,
                applicationServerKey: urlBase64ToUint8Array(publicKey) as BufferSource,
            });
        }

        // Save subscription to server
        const response = await fetch("/api/push/subscribe", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ subscription }),
        });

        if (!response.ok) {
            console.error("Failed to save subscription to server");
            return null;
        }

        console.log("Push subscription saved successfully");
        return subscription;
    } catch (error) {
        console.error("Failed to subscribe to push:", error);
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
