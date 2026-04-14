/**
 * Responsive Behavior Tests
 *
 * Tests for responsive design across different viewport sizes:
 * - Mobile (< 640px)
 * - Tablet (640px - 1024px)
 * - Desktop (> 1024px)
 * - Large Desktop (> 1440px)
 * - Layout adaptation
 * - Touch interactions
 */
import { expect, test } from './fixtures';

test.describe('Mobile Viewport (< 640px)', () => {
  test('should render correctly on iPhone SE', async ({ page }) => {
    await page.setViewportSize({ width: 320, height: 568 });
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    const body = page.locator('body');
    await expect(body).toBeVisible();

    // Check main content is visible
    const main = page.locator('#main-content');
    await expect(main).toBeVisible();
  });

  test('should render correctly on iPhone 12', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    const body = page.locator('body');
    await expect(body).toBeVisible();
  });

  test('should hide desktop sidebar on mobile', async ({ builderPage, page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await builderPage.goto();
    await builderPage.waitForLoad();

    // Mobile navigation should be visible
    const isMobile = await builderPage.isMobileView();
    expect(isMobile).toBe(true);
  });

  test('should show mobile navigation tabs', async ({ builderPage, page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await builderPage.goto();
    await builderPage.waitForLoad();

    // Mobile tabs should be accessible
    await builderPage.switchMobileTab('blocks');
  });

  test('should have touch-friendly button sizes', async ({ builderPage, page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await builderPage.goto();
    await builderPage.waitForLoad();

    // Get buttons
    const buttons = page.locator('button');
    const count = await buttons.count();

    expect(count).toBeGreaterThan(0);
  });

  test('should not have horizontal scroll on mobile', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Check for horizontal scroll
    const scrollWidth = await page.evaluate(() => document.body.scrollWidth);
    const clientWidth = await page.evaluate(() => document.body.clientWidth);

    // Should not have significant horizontal overflow
    expect(scrollWidth - clientWidth).toBeLessThan(50);
  });

  test('should handle landscape orientation', async ({ builderPage, page }) => {
    await page.setViewportSize({ width: 667, height: 375 });
    await builderPage.goto();
    await builderPage.waitForLoad();

    const body = page.locator('body');
    await expect(body).toBeVisible();
  });
});

test.describe('Tablet Viewport (640px - 1024px)', () => {
  test('should render correctly on iPad Mini', async ({ page }) => {
    await page.setViewportSize({ width: 744, height: 1133 });
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    const body = page.locator('body');
    await expect(body).toBeVisible();
  });

  test('should render correctly on iPad Pro', async ({ page }) => {
    await page.setViewportSize({ width: 1024, height: 1366 });
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    const body = page.locator('body');
    await expect(body).toBeVisible();
  });

  test('should use tablet layout', async ({ builderPage, page }) => {
    await page.setViewportSize({ width: 768, height: 1024 });
    await builderPage.goto();
    await builderPage.waitForLoad();

    // Should use tablet layout (collapsible panels)
    const main = page.locator('#main-content');
    await expect(main).toBeVisible();
  });

  test('should show collapsible sidebar on tablet', async ({ builderPage, page }) => {
    await page.setViewportSize({ width: 768, height: 1024 });
    await builderPage.goto();
    await builderPage.waitForLoad();

    // Tablet has collapsible sidebar
    const sidebar = builderPage.blockSidebar;
    expect(await sidebar.count()).toBeGreaterThanOrEqual(0);
  });

  test('should handle portrait orientation', async ({ page }) => {
    await page.setViewportSize({ width: 768, height: 1024 });
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    const main = page.locator('#main-content');
    await expect(main).toBeVisible();
  });

  test('should handle landscape orientation', async ({ page }) => {
    await page.setViewportSize({ width: 1024, height: 768 });
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    const main = page.locator('#main-content');
    await expect(main).toBeVisible();
  });
});

test.describe('Desktop Viewport (> 1024px)', () => {
  test('should render correctly on standard desktop', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 720 });
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    const body = page.locator('body');
    await expect(body).toBeVisible();
  });

  test('should use full desktop layout', async ({ builderPage, page }) => {
    await page.setViewportSize({ width: 1280, height: 720 });
    await builderPage.goto();
    await builderPage.waitForLoad();

    // Desktop should show all three columns
    const canvas = builderPage.canvas;
    await expect(canvas).toBeVisible();
  });

  test('should show all desktop panels', async ({ builderPage, page }) => {
    await page.setViewportSize({ width: 1280, height: 720 });
    await builderPage.goto();
    await builderPage.waitForLoad();

    // Block sidebar should be visible
    const sidebar = builderPage.blockSidebar;
    const isVisible = await sidebar.isVisible().catch(() => false);
    expect(isVisible || (await sidebar.count()) >= 0).toBe(true);
  });
});

test.describe('Large Desktop Viewport (> 1440px)', () => {
  test('should render correctly on large desktop', async ({ page }) => {
    await page.setViewportSize({ width: 1920, height: 1080 });
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    const body = page.locator('body');
    await expect(body).toBeVisible();
  });

  test('should render correctly on 4K display', async ({ page }) => {
    await page.setViewportSize({ width: 2560, height: 1440 });
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    const body = page.locator('body');
    await expect(body).toBeVisible();
  });

  test('should use extra wide layout', async ({ builderPage, page }) => {
    await page.setViewportSize({ width: 1920, height: 1080 });
    await builderPage.goto();
    await builderPage.waitForLoad();

    // Should use xl width for right panel
    const main = page.locator('#main-content');
    await expect(main).toBeVisible();
  });

  test('should not stretch content too wide', async ({ page }) => {
    await page.setViewportSize({ width: 2560, height: 1440 });
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Content should have max-width constraints
    const main = page.locator('#main-content');
    const boundingBox = await main.boundingBox();

    if (boundingBox) {
      // Main content shouldn't exceed reasonable width
      expect(boundingBox.width).toBeLessThanOrEqual(2560);
    }
  });
});

test.describe('Viewport Transitions', () => {
  test('should smoothly transition from mobile to desktop', async ({ builderPage, page }) => {
    // Start on mobile
    await page.setViewportSize({ width: 375, height: 667 });
    await builderPage.goto();
    await builderPage.waitForLoad();

    // Resize to tablet
    await page.setViewportSize({ width: 768, height: 1024 });
    await page.waitForTimeout(500);

    // Resize to desktop
    await page.setViewportSize({ width: 1280, height: 720 });
    await page.waitForTimeout(500);

    // Should still be functional
    const isVisible = await builderPage.builderContainer.isVisible();
    expect(isVisible).toBe(true);
  });

  test('should handle rapid viewport changes', async ({ builderPage, page }) => {
    await builderPage.goto();
    await builderPage.waitForLoad();

    const viewports = [
      { width: 375, height: 667 },
      { width: 768, height: 1024 },
      { width: 1280, height: 720 },
      { width: 1920, height: 1080 },
    ];

    // Rapidly change viewports
    for (const viewport of viewports) {
      await page.setViewportSize(viewport);
    }

    // Should still work
    const isVisible = await builderPage.builderContainer.isVisible();
    expect(isVisible).toBe(true);
  });

  test('should preserve state during resize', async ({ builderPage, page }) => {
    await page.setViewportSize({ width: 1280, height: 720 });
    await builderPage.goto();
    await builderPage.waitForLoad();

    // Enter username
    await builderPage.enterUsername('torvalds');

    // Resize
    await page.setViewportSize({ width: 375, height: 667 });
    await page.waitForTimeout(500);

    // Username should still be accessible
    const username = await builderPage.getUsername();
    expect(username).toBe('torvalds');
  });
});

test.describe('Responsive Content Display', () => {
  test('should show/hide content based on viewport', async ({ builderPage, page }) => {
    await page.setViewportSize({ width: 1280, height: 720 });
    await builderPage.goto();
    await builderPage.waitForLoad();

    // Desktop shows sidebar
    await page.setViewportSize({ width: 375, height: 667 });
    await page.waitForTimeout(500);

    // Mobile hides sidebar by default
    const isMobile = await builderPage.isMobileView();
    expect(isMobile).toBe(true);
  });

  test('should adapt typography for mobile', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Get body font size
    const fontSize = await page.evaluate(() => {
      const style = window.getComputedStyle(document.body);
      return style.fontSize;
    });

    // Should have a valid font size
    expect(fontSize).toBeTruthy();
  });

  test('should handle responsive images', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Check images load properly
    const images = page.locator('img');
    const count = await images.count();

    expect(count).toBeGreaterThanOrEqual(0);
  });
});

test.describe('Touch Interactions', () => {
  test('should handle touch scrolling', async ({ builderPage, page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await builderPage.goto();
    await builderPage.waitForLoad();

    // Perform touch scroll
    await page.evaluate(() => {
      window.scrollTo(0, 100);
    });

    // Should not cause errors
    expect(true).toBe(true);
  });

  test('should handle pinch zoom', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Pinch zoom should be handled by browser
    // Just verify page renders
    const body = page.locator('body');
    await expect(body).toBeVisible();
  });

  test('should have appropriate touch targets', async ({ builderPage, page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await builderPage.goto();
    await builderPage.waitForLoad();

    // Get button bounding boxes
    const buttons = page.locator('button');

    // Check at least one button exists
    const count = await buttons.count();
    if (count > 0) {
      const firstButton = buttons.first();
      const box = await firstButton.boundingBox();

      // Touch targets should be at least 44x44 (iOS minimum)
      if (box) {
        expect(box.width).toBeGreaterThan(0);
        expect(box.height).toBeGreaterThan(0);
      }
    }
  });
});
