import * as Sentry from "@sentry/nextjs";

Sentry.init({
    dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,

    // Set tracesSampleRate to 1.0 to capture 100% of transactions for performance monitoring
    // Reduce in production for higher traffic sites
    tracesSampleRate: 1.0,

    // Setting this option to true will print useful information to the console while you're setting up Sentry
    debug: false,

    replaysOnErrorSampleRate: 1.0,
    replaysSessionSampleRate: 0.1,

    integrations: [
        Sentry.replayIntegration({
            maskAllText: true,
            blockAllMedia: true,
        }),
    ],
});
