import * as Sentry from "@sentry/nextjs";

/**
 * Logger utility for structured logging with Sentry integration
 * Use this instead of console.log/error for better error tracking
 */
export const logger = {
    info: (message: string, data?: Record<string, unknown>) => {
        console.log(`[INFO] ${message}`, data || "");
        Sentry.addBreadcrumb({
            category: "log",
            message,
            level: "info",
            data,
        });
    },

    warn: (message: string, data?: Record<string, unknown>) => {
        console.warn(`[WARN] ${message}`, data || "");
        Sentry.addBreadcrumb({
            category: "log",
            message,
            level: "warning",
            data,
        });
    },

    error: (message: string, error?: Error, data?: Record<string, unknown>) => {
        console.error(`[ERROR] ${message}`, error, data || "");

        if (error) {
            Sentry.captureException(error, {
                extra: { message, ...data },
            });
        } else {
            Sentry.captureMessage(message, {
                level: "error",
                extra: data,
            });
        }
    },

    // Track user actions for debugging
    track: (action: string, data?: Record<string, unknown>) => {
        Sentry.addBreadcrumb({
            category: "user-action",
            message: action,
            level: "info",
            data,
        });
    },
};

/**
 * Set user context for Sentry (call after login)
 */
export const setUserContext = (user: { id: string; email?: string; name?: string }) => {
    Sentry.setUser({
        id: user.id,
        email: user.email,
        username: user.name,
    });
};

/**
 * Clear user context (call after logout)
 */
export const clearUserContext = () => {
    Sentry.setUser(null);
};
