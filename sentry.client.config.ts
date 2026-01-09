import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,

  // Set tracesSampleRate to 1.0 to capture 100% of transactions for performance monitoring.
  // We recommend adjusting this value in production
  tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,

  // Set `tracePropagationTargets` to control distributed tracing
  tracePropagationTargets: ["localhost", /^https:\/\/tcggossip\.com/],

  // Capture Replay for 10% of all sessions,
  // plus for 100% of sessions with an error
  replaysSessionSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 0,
  replaysOnErrorSampleRate: 1.0,

  // Ignore common errors that don't need tracking
  ignoreErrors: [
    // Browser extensions
    'top.GLOBALS',
    'Non-Error promise rejection captured',
    // Random network errors
    'NetworkError',
    'Failed to fetch',
    'Load failed',
    // Ignore React hydration errors in development
    'Hydration failed',
    'There was an error while hydrating',
  ],

  // Filter out sensitive data
  beforeSend(event, hint) {
    // Don't send events in development unless explicitly testing
    if (process.env.NODE_ENV === 'development' && !process.env.SENTRY_TEST_MODE) {
      return null;
    }

    // Remove sensitive data from breadcrumbs
    if (event.breadcrumbs) {
      event.breadcrumbs = event.breadcrumbs.map(breadcrumb => {
        if (breadcrumb.data) {
          delete breadcrumb.data.password;
          delete breadcrumb.data.token;
          delete breadcrumb.data.apiKey;
        }
        return breadcrumb;
      });
    }

    return event;
  },

  // Set environment
  environment: process.env.NODE_ENV || 'development',

  // Enable debug mode in development
  debug: process.env.NODE_ENV === 'development',

  // Configure integrations
  integrations: [
    Sentry.browserTracingIntegration(),
    Sentry.replayIntegration({
      maskAllText: true,
      blockAllMedia: true,
    }),
  ],
});
