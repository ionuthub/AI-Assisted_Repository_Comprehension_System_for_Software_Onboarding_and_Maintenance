import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import * as Sentry from "@sentry/react";

// Initialize Sentry for error monitoring
// Only enable in production or if VITE_SENTRY_DSN is set
if (import.meta.env.PROD || import.meta.env.VITE_SENTRY_DSN) {
    Sentry.init({
        dsn: import.meta.env.VITE_SENTRY_DSN || "",
        integrations: [
            Sentry.browserTracingIntegration(),
            Sentry.replayIntegration({
                maskAllText: true,
                blockAllMedia: true,
            }),
        ],
        // Performance Monitoring
        tracesSampleRate: 0.1, // Capture 10% of transactions
        // Session Replay
        replaysSessionSampleRate: 0.1, // Sample 10% of sessions
        replaysOnErrorSampleRate: 1.0, // Sample 100% of sessions with errors
        // Environment
        environment: import.meta.env.MODE,
        // Release tracking
        release: import.meta.env.VITE_APP_VERSION || "development",
        // Don't send errors in development unless explicitly enabled
        enabled: import.meta.env.PROD || !!import.meta.env.VITE_SENTRY_DSN,
    });
}

createRoot(document.getElementById("root")!).render(<App />);
