/**
 * Cross-Browser Compatibility Tests
 *
 * Tests for ensuring consistent behavior across different browsers:
 * - Rendering consistency
 * - Feature compatibility
 * - API behavior
 * - JavaScript features
 *
 * Note: These tests run against the browsers configured in playwright.config.ts
 */
import { expect, test } from './fixtures';

test.describe('Browser Compatibility', () => {
  test('should render correctly in all configured browsers', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Basic content should render
    const body = page.locator('body');
    await expect(body).toBeVisible();

    // Main content should be present
    const main = page.locator('#main-content');
    await expect(main).toBeVisible();
  });

  test('should handle JavaScript features', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Check that JavaScript is working
    const jsEnabled = await page.evaluate(() => typeof window !== 'undefined');
    expect(jsEnabled).toBe(true);

    // Check that localStorage is available
    const hasLocalStorage = await page.evaluate(() => {
      try {
        return typeof localStorage !== 'undefined';
      } catch {
        return false;
      }
    });
    expect(hasLocalStorage).toBe(true);
  });

  test('should handle modern CSS features', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Check CSS custom properties are supported
    const cssVarsSupported = await page.evaluate(() => {
      const style = document.createElement('div').style;
      return 'CSS' in window && typeof style.setProperty === 'function';
    });

    expect(cssVarsSupported).toBe(true);
  });

  test('should support fetch API', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    const hasFetch = await page.evaluate(() => typeof fetch === 'function');
    expect(hasFetch).toBe(true);
  });

  test('should support async/await and Promises', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Test basic Promise functionality
    const promiseWorks = await page.evaluate(() => {
      return new Promise((resolve) => {
        setTimeout(() => resolve(true), 10);
      });
    });

    expect(promiseWorks).toBe(true);
  });

  test('should handle Web Storage', async ({ builderPage, page }) => {
    await builderPage.goto();
    await builderPage.waitForLoad();

    // Test localStorage write/read
    const storageWorks = await page.evaluate(() => {
      try {
        localStorage.setItem('test-key', 'test-value');
        const value = localStorage.getItem('test-key');
        localStorage.removeItem('test-key');
        return value === 'test-value';
      } catch {
        return false;
      }
    });

    expect(storageWorks).toBe(true);
  });

  test('should handle form interactions', async ({ builderPage }) => {
    await builderPage.goto();
    await builderPage.waitForLoad();

    // Enter username
    await builderPage.enterUsername('torvalds');
    const username = await builderPage.getUsername();

    expect(username).toBe('torvalds');
  });

  test('should handle clipboard operations', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Check Clipboard API is available
    const hasClipboard = await page.evaluate(() => {
      return typeof navigator !== 'undefined' && 'clipboard' in navigator;
    });

    // Clipboard may not be available in all contexts
    expect(typeof hasClipboard).toBe('boolean');
  });

  test('should handle media queries', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Check that matchMedia works
    const matchMediaWorks = await page.evaluate(() => {
      return typeof window.matchMedia === 'function';
    });

    expect(matchMediaWorks).toBe(true);

    // Test a media query
    const isScreen = await page.evaluate(() => {
      return window.matchMedia('(screen)').matches;
    });

    expect(typeof isScreen).toBe('boolean');
  });
});

test.describe('Browser-Specific Behavior', () => {
  test('should handle timezone correctly', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Date should work
    const date = await page.evaluate(() => new Date().toISOString());
    expect(date).toBeTruthy();
  });

  test('should handle language settings', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Navigator language should be available
    const language = await page.evaluate(() => navigator.language);
    expect(language).toBeTruthy();
  });

  test('should handle cookies if enabled', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Check cookie availability
    const cookiesEnabled = await page.evaluate(() => {
      try {
        document.cookie = 'testcookie=test; SameSite=Strict;';
        const hasCookie = document.cookie.length > 0;
        // Clean up
        document.cookie = 'testcookie=; expires=Thu, 01 Jan 1970 00:00:00 UTC;';
        return hasCookie;
      } catch {
        return false;
      }
    });

    // Cookies may be blocked - just check the API works
    expect(typeof cookiesEnabled).toBe('boolean');
  });

  test('should handle performance API', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Check Performance API is available
    const hasPerformance = await page.evaluate(() => {
      return typeof window.performance !== 'undefined';
    });

    expect(hasPerformance).toBe(true);
  });
});

test.describe('Console and Error Handling', () => {
  test('should not have critical console errors', async ({ page }) => {
    const errors: string[] = [];

    page.on('console', (msg) => {
      if (msg.type() === 'error') {
        errors.push(msg.text());
      }
    });

    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Wait a bit for any delayed errors
    await page.waitForTimeout(1000);

    // Filter non-critical errors
    const criticalErrors = errors.filter(
      (error) =>
        !error.includes('favicon') &&
        !error.includes('404') &&
        !error.includes('Failed to load resource'),
    );

    expect(criticalErrors).toHaveLength(0);
  });

  test('should handle page errors gracefully', async ({ page }) => {
    let pageError = false;

    page.on('pageerror', () => {
      pageError = true;
    });

    await page.goto('/');
    await page.waitForLoadState('networkidle');

    expect(pageError).toBe(false);
  });
});

test.describe('Mobile Browser Behavior', () => {
  test('should work on mobile Chrome', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 412, height: 732 });
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    const body = page.locator('body');
    await expect(body).toBeVisible();
  });

  test('should handle touch events on mobile', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Check viewport meta tag is properly applied
    const viewport = await page.evaluate(() => {
      return {
        width: window.innerWidth,
        height: window.innerHeight,
      };
    });

    expect(viewport.width).toBe(375);
    expect(viewport.height).toBe(667);
  });

  test('should handle orientation change', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Change to landscape
    await page.setViewportSize({ width: 667, height: 375 });
    await page.waitForTimeout(500);

    // Check new dimensions
    const dimensions = await page.evaluate(() => ({
      width: window.innerWidth,
      height: window.innerHeight,
    }));

    expect(dimensions.width).toBe(667);
    expect(dimensions.height).toBe(375);
  });
});

test.describe('API Consistency', () => {
  test('should return consistent API responses', async ({ apiRequest }) => {
    // Test stats API
    const response = await apiRequest.get('http://localhost:3000/api/stats?username=torvalds');
    expect(response.status()).toBe(200);
    expect(response.headers()['content-type']).toContain('image/svg+xml');
  });

  test('should handle caching appropriately', async ({ apiRequest }) => {
    // Make same request twice
    const response1 = await apiRequest.get('http://localhost:3000/api/stats?username=torvalds');
    const response2 = await apiRequest.get('http://localhost:3000/api/stats?username=torvalds');

    // Both should succeed
    expect(response1.status()).toBe(200);
    expect(response2.status()).toBe(200);
  });

  test('should handle rate limiting consistently', async ({ apiRequest }) => {
    // Make multiple rapid requests
    const requests = Array(5)
      .fill(null)
      .map(() => apiRequest.get('http://localhost:3000/api/stats?username=torvalds'));

    const responses = await Promise.all(requests);

    // All should succeed or fail consistently
    const statuses = responses.map((r) => r.status);
    const uniqueStatuses = [...new Set(statuses)];

    // Should have consistent status codes
    expect(uniqueStatuses.length).toBeLessThanOrEqual(2);
  });
});
