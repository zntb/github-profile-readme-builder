/**
 * Test Hooks for Playwright E2E tests
 *
 * Provides reusable before/after hooks for test suites.
 */
import type { Page } from '@playwright/test';

export interface TestContext {
  testUsername: string;
  screenshotDir: string;
  viewport: { width: number; height: number };
}

/**
 * Default test context
 */
export const defaultContext: TestContext = {
  testUsername: 'torvalds',
  screenshotDir: './playwright-report/screenshots',
  viewport: { width: 1920, height: 1080 },
};

/**
 * Hook to capture console errors during test
 */
export function createConsoleErrorCapture(page: Page) {
  const errors: string[] = [];

  const handler = (msg: { type: () => string; text: () => string }) => {
    if (msg.type() === 'error') {
      errors.push(msg.text());
    }
  };

  page.on('console', handler);

  return {
    getErrors: () => errors,
    clearErrors: () => {
      errors.length = 0;
    },
    filterErrors: (filterPatterns: RegExp[]) => {
      return errors.filter((error) => !filterPatterns.some((pattern) => pattern.test(error)));
    },
    removeHandler: () => {
      page.off('console', handler);
    },
  };
}

/**
 * Hook to capture page errors during test
 */
export function createPageErrorCapture(page: Page) {
  const errors: string[] = [];

  const handler = (err: { message: string }) => {
    errors.push(err.message);
  };

  page.on('pageerror', handler);

  return {
    getErrors: () => errors,
    clearErrors: () => {
      errors.length = 0;
    },
    removeHandler: () => {
      page.off('pageerror', handler);
    },
  };
}

/**
 * Hook for performance monitoring
 */
export function createPerformanceHook(page: Page) {
  return {
    async measureLoadTime(): Promise<number> {
      const startTime = Date.now();
      await page.goto('/', { waitUntil: 'domcontentloaded' });
      return Date.now() - startTime;
    },

    async measureAPIResponse(endpoint: string): Promise<number> {
      const startTime = Date.now();
      await page.request.get(endpoint);
      return Date.now() - startTime;
    },

    async getMetrics() {
      return await page.evaluate(() => {
        const timing = performance.timing;
        return {
          domContentLoaded: timing.domContentLoadedEventEnd - timing.navigationStart,
          loadComplete: timing.loadEventEnd - timing.navigationStart,
          firstPaint: (performance.getEntriesByType('paint') as PerformancePaintTiming[]).find(
            (p) => p.name === 'first-paint',
          )?.startTime,
          firstContentfulPaint: (
            performance.getEntriesByType('paint') as PerformancePaintTiming[]
          ).find((p) => p.name === 'first-contentful-paint')?.startTime,
        };
      });
    },
  };
}

/**
 * Hook for viewport testing
 */
export function createViewportHook(page: Page) {
  return {
    async setDesktop() {
      await page.setViewportSize({ width: 1920, height: 1080 });
    },

    async setTablet() {
      await page.setViewportSize({ width: 768, height: 1024 });
    },

    async setMobile() {
      await page.setViewportSize({ width: 375, height: 667 });
    },

    async setCustom(width: number, height: number) {
      await page.setViewportSize({ width, height });
    },

    getCurrentViewport() {
      return page.viewportSize();
    },
  };
}

/**
 * Hook for network interception
 */
export function createNetworkHook(page: Page) {
  const requests: { url: string; status: number; method: string }[] = [];

  page.on('response', (response) => {
    requests.push({
      url: response.url(),
      status: response.status(),
      method: response.request().method(),
    });
  });

  return {
    getRequests: () => requests,
    clearRequests: () => {
      requests.length = 0;
    },
    getFailedRequests: () => requests.filter((r) => r.status >= 400),
    getRequestByUrl: (url: string) => requests.filter((r) => r.url.includes(url)),
  };
}

/**
 * Common test data for reuse
 */
export const testData = {
  validUsernames: ['torvalds', 'google', 'microsoft', 'facebook'],
  invalidUsernames: ['invalid-user-123456789', 'nonexistent-user-xyz'],
  maxLengthUsername: 'a'.repeat(100),
  specialCharsUsername: 'test-user!@#$%',
};

const hooks = {
  defaultContext,
  createConsoleErrorCapture,
  createPageErrorCapture,
  createPerformanceHook,
  createViewportHook,
  createNetworkHook,
  testData,
};

export default hooks;
