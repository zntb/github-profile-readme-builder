import { defineConfig, devices } from '@playwright/test';

/**
 * Playwright Configuration for GitHub Profile Maker
 *
 * Features:
 * - HTML test reports with screenshots on failure
 * - Parallel test execution
 * - Retry logic for flaky tests
 * - Custom reporters
 * - CI/CD pipeline integration
 */
export default defineConfig({
  // Test directory and pattern
  testDir: './e2e',
  testMatch: '**/*.e2e.ts',

  // Maximum number of parallel workers
  workers: 2,

  // Retry configuration for flaky tests
  retries: process.env.CI ? 2 : 1,

  // Maximum time for a single test
  timeout: 30000,

  // Expect timeout for assertions
  expect: {
    timeout: 5000,
  },

  // Global teardown
  globalTeardown: './e2e/global-teardown.ts',

  // Global setup
  globalSetup: './e2e/global-setup.ts',

  // Use reporter configuration
  reporter: [
    [
      'html',
      {
        outputFolder: './playwright-report',
        open: 'never',
        metadata: {
          project: 'GitHub Profile Maker',
          environment: process.env.NODE_ENV || 'development',
        },
      },
    ],
    ['json', { outputFile: './playwright-report/results.json' }],
    ['list'],
  ],

  // Shared settings for all projects
  use: {
    // Base URL for all tests
    baseURL: process.env.PLAYWRIGHT_BASE_URL || 'http://localhost:3000',

    // Collect traces for all tests (can be changed to 'on-first-retry' for CI)
    trace: process.env.CI ? 'on-first-retry' : 'on',

    // Collect screenshots on failure
    screenshot: 'only-on-failure',

    // Collect videos on failure
    video: 'retain-on-failure',

    // Context options
    contextOptions: {
      ignoreHTTPSErrors: true,
    },

    // Action timeout
    actionTimeout: 10000,

    // Navigation timeout
    navigationTimeout: 30000,

    // Browser channel
    channel: 'chromium',

    // Locale
    locale: 'en-US',

    // Timezone
    timezoneId: 'America/New_York',

    // Permissions
    permissions: ['geolocation'],

    // Extra HTTP headers
    extraHTTPHeaders: {
      'X-Playwright-Test': 'true',
    },
  },

  // Projects for different browsers
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },

    // Uncomment for additional browser testing
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
    },
    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] },
    },

    // Mobile viewport project
    {
      name: 'Mobile Chrome',
      use: {
        ...devices['Pixel 5'],
        viewport: {
          width: 412,
          height: 732,
        },
      },
    },
  ],

  // Output directory for test artifacts
  outputDir: './playwright-report/artifacts',

  // Web server configuration
  webServer: {
    command: 'npm run dev',
    port: 3000,
    timeout: 120 * 1000,
    reuseExistingServer: !process.env.CI,
    stdout: 'pipe',
    stderr: 'pipe',
  },
});
