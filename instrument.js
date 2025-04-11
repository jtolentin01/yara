const Sentry = require("@sentry/node");
const sentryDsn = process.env.SENTRY_DSN;
if (sentryDsn) {
  Sentry.init({
    dsn: sentryDsn
  });
  console.log("Sentry initialized successfully");
} else {
  console.log("No SENTRY_DSN provided, skipping Sentry initialization");
}

