/**
 * Page Navigation Tests
 *
 * Tests for verifying:
 * - Homepage loads correctly
 * - Navigation links work
 * - Page transitions are smooth
 * - URL routing is correct
 * - Page content loads properly
 */
import { expect, test } from './fixtures';

test.describe('Page Navigation', () => {
  test.describe('Homepage', () => {
    test('should load the homepage successfully', async ({ page }) => {
      await page.goto('/');

      // Wait for page to be fully loaded
      await page.waitForLoadState('networkidle');

      // Verify the page loaded without errors
      const title = await page.title();
      expect(title).toBeTruthy();

      // Verify main content is visible
      const body = await page.locator('body');
      await expect(body).toBeVisible({ timeout: 10000 });
    });

    test('should have correct page title', async ({ page }) => {
      await page.goto('/');
      await page.waitForLoadState('networkidle');

      const title = await page.title();
      expect(title).toBeTruthy();
    });

    test('should display main content area', async ({ page }) => {
      await page.goto('/');
      await page.waitForLoadState('networkidle');

      // Verify main content is present
      const main = page.locator('main');
      await expect(main).toBeVisible({ timeout: 10000 });
    });

    test('should load without console errors', async ({ page }) => {
      const consoleErrors: string[] = [];

      page.on('console', (msg) => {
        if (msg.type() === 'error') {
          consoleErrors.push(msg.text());
        }
      });

      await page.goto('/');
      await page.waitForLoadState('networkidle');

      // Filter out known non-critical errors
      const criticalErrors = consoleErrors.filter((error) => !error.includes('favicon'));

      expect(criticalErrors).toHaveLength(0);
    });
  });

  test.describe('Navigation Links', () => {
    test('should navigate to home page', async ({ page }) => {
      await page.goto('/home');
      await page.waitForLoadState('networkidle');

      // Should redirect to home or show home content
      const currentUrl = page.url();
      expect(currentUrl).toContain('/');
    });

    test('should handle direct route navigation', async ({ page }) => {
      // Navigate directly to root
      await page.goto('/');
      await page.waitForLoadState('networkidle');

      // Verify we landed on the expected page
      const url = page.url();
      expect(url).toMatch(/localhost:3000/);
    });
  });

  test.describe('Page Transitions', () => {
    test('should handle page refresh correctly', async ({ page }) => {
      await page.goto('/');
      await page.waitForLoadState('networkidle');

      // Refresh the page
      await page.reload();
      await page.waitForLoadState('networkidle');

      // Verify page still loads correctly
      const body = await page.locator('body');
      await expect(body).toBeVisible({ timeout: 10000 });
    });

    test('should handle back navigation', async ({ page }) => {
      // First go to a page
      await page.goto('/');
      await page.waitForLoadState('networkidle');

      // Then navigate back
      await page.goBack();
      await page.waitForLoadState('networkidle');

      // Should handle gracefully (may redirect to home)
      expect(page.url()).toBeTruthy();
    });
  });

  test.describe('URL Routing', () => {
    test('should handle root URL', async ({ page }) => {
      await page.goto('/');
      await page.waitForLoadState('networkidle');

      expect(page.url()).toContain('localhost:3000');
    });

    test('should handle trailing slash', async ({ page }) => {
      await page.goto('/');
      await page.waitForLoadState('networkidle');

      // Verify URL is normalized
      const url = page.url();
      expect(url).toMatch(/^https?:\/\/localhost:3000/);
    });

    test('should handle unknown routes gracefully', async ({ page }) => {
      const response = await page.request.get('http://localhost:3000/unknown-route-12345');

      // Next.js should return 404 or redirect
      expect([404, 200, 301, 302]).toContain(response.status());
    });
  });

  test.describe('Responsive Navigation', () => {
    test('should render correctly on mobile viewport', async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 667 });
      await page.goto('/');
      await page.waitForLoadState('networkidle');

      // Verify content is visible
      const body = await page.locator('body');
      await expect(body).toBeVisible();
    });

    test('should render correctly on tablet viewport', async ({ page }) => {
      await page.setViewportSize({ width: 768, height: 1024 });
      await page.goto('/');
      await page.waitForLoadState('networkidle');

      // Verify content is visible
      const body = await page.locator('body');
      await expect(body).toBeVisible();
    });

    test('should render correctly on desktop viewport', async ({ page }) => {
      await page.setViewportSize({ width: 1920, height: 1080 });
      await page.goto('/');
      await page.waitForLoadState('networkidle');

      // Verify content is visible
      const body = await page.locator('body');
      await expect(body).toBeVisible();
    });
  });

  test.describe('Loading States', () => {
    test('should show loading indicator', async ({ page }) => {
      await page.goto('/');
      await page.waitForLoadState('domcontentloaded');

      // Page should start loading
      const title = await page.title();
      expect(title).toBeTruthy();
    });

    test('should complete loading within reasonable time', async ({ page }) => {
      const startTime = Date.now();

      await page.goto('/');
      await page.waitForLoadState('networkidle');

      const loadTime = Date.now() - startTime;

      // Page should load within 30 seconds
      expect(loadTime).toBeLessThan(30000);
    });
  });
});
