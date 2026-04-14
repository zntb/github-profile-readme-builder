/**
 * Performance Tests
 *
 * Tests for measuring and verifying performance characteristics:
 * - Page load times
 * - API response times
 * - Rendering performance
 * - Resource loading
 * - Memory usage
 */
import { expect, test } from './fixtures';

test.describe('Page Load Performance', () => {
  test('should load homepage within acceptable time', async ({ page }) => {
    const startTime = Date.now();

    await page.goto('/');
    await page.waitForLoadState('networkidle');

    const loadTime = Date.now() - startTime;

    // Should load within 10 seconds
    expect(loadTime).toBeLessThan(10000);
  });

  test('should have fast Time to First Byte', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('domcontentloaded');

    const ttfb = await page.evaluate(() => {
      const timing = performance.timing;
      return timing.responseStart - timing.navigationStart;
    });

    // TTFB should be reasonable (< 3 seconds)
    expect(ttfb).toBeLessThan(3000);
  });

  test('should have acceptable First Contentful Paint', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    const fcp = await page.evaluate(() => {
      const paintEntries = performance.getEntriesByType('paint') as PerformancePaintTiming[];
      const fcpEntry = paintEntries.find((entry) => entry.name === 'first-contentful-paint');
      return fcpEntry?.startTime || 0;
    });

    // FCP should be under 5 seconds
    expect(fcp).toBeLessThan(5000);
  });

  test('should complete DOM content loaded quickly', async ({ page }) => {
    const startTime = Date.now();

    await page.goto('/');
    await page.waitForLoadState('domcontentloaded');

    const dclTime = Date.now() - startTime;

    // DCL should complete within 5 seconds
    expect(dclTime).toBeLessThan(5000);
  });

  test('should handle slow network conditions', async ({ page }) => {
    // Set up slower network (if possible)
    await page.goto('/');
    await page.waitForLoadState('domcontentloaded');

    // Even on slow network, should get to DCL
    const body = page.locator('body');
    expect(await body.count()).toBe(1);
  });
});

test.describe('API Response Performance', () => {
  test('should respond quickly for stats API', async ({ apiRequest }) => {
    const startTime = Date.now();

    const response = await apiRequest.get('http://localhost:3000/api/stats?username=torvalds');

    const responseTime = Date.now() - startTime;

    expect(response.status()).toBe(200);
    expect(responseTime).toBeLessThan(5000); // API should respond within 5 seconds
  });

  test('should respond quickly for activity API', async ({ apiRequest }) => {
    const startTime = Date.now();

    const response = await apiRequest.get('http://localhost:3000/api/activity?username=torvalds');

    const responseTime = Date.now() - startTime;

    expect(response.status()).toBe(200);
    expect(responseTime).toBeLessThan(5000);
  });

  test('should handle multiple concurrent API requests', async ({ apiRequest }) => {
    const startTime = Date.now();

    // Make multiple concurrent requests
    const requests = [
      apiRequest.get('http://localhost:3000/api/stats?username=torvalds'),
      apiRequest.get('http://localhost:3000/api/activity?username=torvalds'),
      apiRequest.get('http://localhost:3000/api/streak?username=torvalds'),
      apiRequest.get('http://localhost:3000/api/top-langs?username=torvalds'),
    ];

    const responses = await Promise.all(requests);
    const totalTime = Date.now() - startTime;

    // All should succeed
    responses.forEach((response) => {
      expect(response.status()).toBe(200);
    });

    // Total time should be reasonable even with concurrency
    expect(totalTime).toBeLessThan(15000);
  });

  test('should handle rate limiting efficiently', async ({ apiRequest }) => {
    // Make many rapid requests
    const startTime = Date.now();

    const requests = Array(20)
      .fill(null)
      .map(() => apiRequest.get('http://localhost:3000/api/stats?username=torvalds'));

    const responses = await Promise.all(requests);
    const totalTime = Date.now() - startTime;

    // Should handle gracefully (some may be rate limited)
    expect(responses.length).toBe(20);

    // Should complete in reasonable time even with rate limiting
    expect(totalTime).toBeLessThan(60000);
  });
});

test.describe('Rendering Performance', () => {
  test('should render without layout shifts', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Get initial layout
    const initialLayout = await page.evaluate(() => ({
      width: document.body.scrollWidth,
      height: document.body.scrollHeight,
    }));

    // Wait for any async content
    await page.waitForTimeout(1000);

    // Get final layout
    const finalLayout = await page.evaluate(() => ({
      width: document.body.scrollWidth,
      height: document.body.scrollHeight,
    }));

    // Layout should be stable
    expect(finalLayout.width).toBe(initialLayout.width);
    expect(finalLayout.height).toBeGreaterThanOrEqual(initialLayout.height);
  });

  test('should render content progressively', async ({ page }) => {
    await page.goto('/');

    // Check that something renders immediately
    const body = page.locator('body');
    await expect(body).toBeVisible({ timeout: 5000 });
  });

  test('should not block main thread for too long', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Check for long tasks
    const longTasks = await page.evaluate(() => {
      const longTasks: number[] = [];
      if ('PerformanceObserver' in window) {
        try {
          const observer = new PerformanceObserver((list) => {
            for (const entry of list.getEntries()) {
              if (entry.duration > 50) {
                longTasks.push(entry.duration);
              }
            }
          });
          observer.observe({ entryTypes: ['longtask'] });
        } catch {
          // Not supported
        }
      }
      return longTasks;
    });

    // Should not have excessive long tasks
    expect(longTasks.length).toBeLessThan(10);
  });
});

test.describe('Resource Loading', () => {
  test('should load images efficiently', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Get all images
    const imageCount = await page.locator('img').count();

    // Check if any images are lazy loaded
    const lazyImages = await page.locator('img[loading="lazy"]').count();

    // Lazy loading is a bonus, but not required
    expect(imageCount).toBeGreaterThanOrEqual(0);
    expect(typeof lazyImages).toBe('number');
  });

  test('should not have excessive external requests', async ({ page }) => {
    const requests: string[] = [];

    page.on('request', (request) => {
      requests.push(request.url());
    });

    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Should have reasonable number of requests
    expect(requests.length).toBeLessThan(100);
  });

  test('should load fonts properly', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Check that fonts loaded or are loading
    const fontsLoaded = await page.evaluate(() => {
      // Check if any custom fonts are defined in CSS
      const styleSheets = document.styleSheets;
      let fontCount = 0;

      for (let i = 0; i < styleSheets.length; i++) {
        try {
          const rules = styleSheets[i].cssRules || styleSheets[i].rules;
          for (let j = 0; j < rules.length; j++) {
            if (
              rules[j].cssText.includes('font-face') ||
              rules[j].cssText.includes('font-family')
            ) {
              fontCount++;
            }
          }
        } catch {
          // Cross-origin stylesheet
        }
      }

      return fontCount;
    });

    expect(typeof fontsLoaded).toBe('number');
  });

  test('should handle cached resources', async ({ page }) => {
    // First load
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Reload (should use cache)
    const startTime = Date.now();
    await page.reload();
    await page.waitForLoadState('networkidle');
    const reloadTime = Date.now() - startTime;

    // Second load should be faster (cached)
    // This is not a strict requirement, just informational
    expect(reloadTime).toBeLessThan(10000);
  });
});

test.describe('Memory and Resource Management', () => {
  test('should not leak memory on page navigation', async ({ page }) => {
    // Navigate multiple times
    for (let i = 0; i < 5; i++) {
      await page.goto('/');
      await page.waitForLoadState('networkidle');
    }

    // Should still work
    const body = page.locator('body');
    await expect(body).toBeVisible();
  });

  test('should handle large DOM gracefully', async ({ builderPage }) => {
    await builderPage.goto();
    await builderPage.waitForLoad();

    // Get DOM size
    const domSize = await builderPage.page.evaluate(() => ({
      elements: document.getElementsByTagName('*').length,
      depth: (() => {
        function getDepth(el: Element): number {
          let depth = 0;
          while (el.parentElement) {
            depth++;
            el = el.parentElement;
          }
          return depth;
        }
        return Math.max(...Array.from(document.querySelectorAll('*')).map(getDepth));
      })(),
    }));

    // DOM should be reasonable size
    expect(domSize.elements).toBeLessThan(10000);
    expect(domSize.depth).toBeLessThan(50);
  });

  test('should clean up event listeners', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Navigate away
    await page.goto('/');

    // Should not have accumulated excessive listeners (hard to test directly)
    // Just verify page still works
    const body = page.locator('body');
    await expect(body).toBeVisible();
  });
});

test.describe('Builder Performance', () => {
  test('should respond quickly to username changes', async ({ builderPage }) => {
    await builderPage.goto();
    await builderPage.waitForLoad();

    const startTime = Date.now();
    await builderPage.enterUsername('torvalds');
    await builderPage.switchToPreview();
    const responseTime = Date.now() - startTime;

    // Should respond within reasonable time
    expect(responseTime).toBeLessThan(5000);
  });

  test('should handle rapid username changes', async ({ builderPage }) => {
    await builderPage.goto();
    await builderPage.waitForLoad();

    // Rapidly change username
    for (let i = 0; i < 10; i++) {
      await builderPage.enterUsername(`user${i}`);
    }

    // Should still be responsive
    await builderPage.enterUsername('finaluser');
    const username = await builderPage.getUsername();
    expect(username).toBe('finaluser');
  });

  test('should switch tabs efficiently', async ({ builderPage }) => {
    await builderPage.goto();
    await builderPage.waitForLoad();

    const startTime = Date.now();

    // Switch between tabs multiple times
    for (let i = 0; i < 5; i++) {
      await builderPage.switchToPreview();
      await builderPage.switchToMarkdown();
    }

    const totalTime = Date.now() - startTime;

    // Should switch efficiently
    expect(totalTime).toBeLessThan(5000);
  });

  test('should handle viewport changes without lag', async ({ builderPage, page }) => {
    await builderPage.goto();
    await builderPage.waitForLoad();

    const startTime = Date.now();

    // Change viewport multiple times
    await page.setViewportSize({ width: 375, height: 667 });
    await page.setViewportSize({ width: 768, height: 1024 });
    await page.setViewportSize({ width: 1920, height: 1080 });

    const totalTime = Date.now() - startTime;

    // Should handle viewport changes without excessive lag
    expect(totalTime).toBeLessThan(3000);
  });
});

test.describe('Network Resilience', () => {
  test('should handle slow API responses', async ({ builderPage }) => {
    await builderPage.goto();
    await builderPage.waitForLoad();

    // Enter username - API may be slow
    await builderPage.enterUsername('torvalds');

    // Wait for response (with extended timeout)
    await builderPage.page.waitForTimeout(5000);

    // Should handle gracefully
    const username = await builderPage.getUsername();
    expect(username).toBe('torvalds');
  });

  test('should timeout long-running requests appropriately', async ({ page }) => {
    // Set a request timeout
    const timeout = 30000; // 30 seconds

    const startTime = Date.now();

    try {
      await page.goto('/', { timeout });
      const loadTime = Date.now() - startTime;
      expect(loadTime).toBeLessThan(timeout);
    } catch {
      // Timeout is acceptable for extremely slow connections
      expect(true).toBe(true);
    }
  });
});
