import { defineConfig, devices } from "@playwright/test";

/**
 * Ende-zu-Ende-Tests gegen einen Produktions-Build (next start auf Port 3100) mit
 * eigenem eingebettetem Postgres (Port 5455) und synthetischem Seed. Start: `pnpm test:e2e`.
 * localhost statt 127.0.0.1, weil Chrome Secure-Cookies nur dort über http akzeptiert.
 */
export default defineConfig({
  testDir: "./tests/e2e",
  timeout: 60_000,
  fullyParallel: false,
  workers: 1,
  retries: 0,
  reporter: [["list"]],
  globalSetup: "./tests/e2e/global-setup.ts",
  globalTeardown: "./tests/e2e/global-teardown.ts",
  use: {
    baseURL: "http://localhost:3100",
    trace: "retain-on-failure",
    locale: "de-DE",
    ...devices["Desktop Chrome"],
  },
  webServer: {
    command: "pnpm next build && pnpm next start -p 3100",
    url: "http://localhost:3100/login",
    reuseExistingServer: false,
    timeout: 300_000,
    env: {
      DATABASE_URL: "postgres://reha_app:reha_app@127.0.0.1:5455/reha",
      DATABASE_URL_OWNER: "postgres://reha_owner:reha_owner@127.0.0.1:5455/reha",
      BETTER_AUTH_SECRET: "e2e-only-secret-not-for-production-000000",
      BETTER_AUTH_URL: "http://localhost:3100",
      PAIN_TRAFFIC_LIGHT: "on",
      UPLOAD_DIR: "./data/e2e-uploads",
      NEXT_TELEMETRY_DISABLED: "1",
    },
  },
});
