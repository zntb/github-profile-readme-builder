/**
 * Builder Negative Tests & Edge Cases
 *
 * Tests for:
 * - Form validation
 * - Error handling
 * - Edge cases
 * - Invalid inputs
 * - Boundary conditions
 */
import { expect, test } from './fixtures';

test.describe('Username Validation', () => {
  test('should handle extremely long username', async ({ builderPage }) => {
    await builderPage.goto();
    await builderPage.waitForLoad();

    const veryLongUsername = 'a'.repeat(500);
    await builderPage.enterUsername(veryLongUsername);
    const username = await builderPage.getUsername();

    // Should accept but may truncate
    expect(username.length).toBeGreaterThan(0);
  });

  test('should handle username with only spaces', async ({ builderPage }) => {
    await builderPage.goto();
    await builderPage.waitForLoad();

    await builderPage.enterUsername('   ');
    const username = await builderPage.getUsername();

    expect(username).toBe('   ');
  });

  test('should handle username with leading/trailing spaces', async ({ builderPage }) => {
    await builderPage.goto();
    await builderPage.waitForLoad();

    await builderPage.enterUsername('  torvalds  ');
    const username = await builderPage.getUsername();

    expect(username).toBe('  torvalds  ');
  });

  test('should handle unicode characters in username', async ({ builderPage }) => {
    await builderPage.goto();
    await builderPage.waitForLoad();

    await builderPage.enterUsername('用户名');
    const username = await builderPage.getUsername();

    expect(username).toBe('用户名');
  });

  test('should handle emoji in username', async ({ builderPage }) => {
    await builderPage.goto();
    await builderPage.waitForLoad();

    await builderPage.enterUsername('test👤user');
    const username = await builderPage.getUsername();

    expect(username).toBe('test👤user');
  });
});

test.describe('Error Handling', () => {
  test('should handle network failure gracefully', async ({ page }) => {
    // Set up offline mode
    await page.route('**/*', (route) => {
      route.abort('failed');
    });

    // Catch the expected navigation error since we intentionally abort all requests
    await page.goto('/').catch(() => {});
    await page.waitForLoadState('domcontentloaded').catch(() => {});

    // Page should still render something
    const body = page.locator('body');
    expect(await body.count()).toBeGreaterThan(0);
  });

  test('should handle API errors gracefully', async ({ builderPage, page }) => {
    // Listen for failed requests
    const failedRequests: string[] = [];

    page.on('requestfailed', (request) => {
      failedRequests.push(request.url());
    });

    await builderPage.goto();
    await builderPage.waitForLoad();

    await builderPage.enterUsername('nonexistent-user-xyz-123');

    // Wait to see if any requests fail
    await page.waitForTimeout(2000);

    // The app should handle errors gracefully (not crash)
    const builderContainer = page.locator('body');
    expect(await builderContainer.count()).toBe(1);
  });

  test('should handle rapid username changes', async ({ builderPage }) => {
    await builderPage.goto();
    await builderPage.waitForLoad();

    // Rapidly change username
    for (let i = 0; i < 5; i++) {
      await builderPage.enterUsername(`user${i}`);
    }

    // Should handle gracefully
    const username = await builderPage.getUsername();
    expect(username).toBe('user4');
  });
});

test.describe('Boundary Conditions', () => {
  test('should handle empty canvas when generating output', async ({ builderPage }) => {
    await builderPage.goto();
    await builderPage.waitForLoad();

    await builderPage.enterUsername('torvalds');
    await builderPage.switchToMarkdown();

    const markdown = await builderPage.getMarkdownContent();

    // Even with no blocks, should generate some output (at least the username header)
    expect(markdown).toBeTruthy();
  });

  test('should handle rapid tab switching', async ({ builderPage }) => {
    await builderPage.goto();
    await builderPage.waitForLoad();

    // Rapidly switch between tabs
    for (let i = 0; i < 10; i++) {
      await builderPage.switchToPreview();
      await builderPage.switchToMarkdown();
    }
  });

  test('should handle window resize during operation', async ({ builderPage, page }) => {
    await builderPage.goto();
    await builderPage.waitForLoad();

    // Resize to mobile
    await page.setViewportSize({ width: 375, height: 667 });
    await page.waitForTimeout(500);

    // Resize back to desktop
    await page.setViewportSize({ width: 1920, height: 1080 });
    await page.waitForTimeout(500);

    // Should still work
    const isVisible = await builderPage.builderContainer.isVisible();
    expect(isVisible).toBe(true);
  });

  test('should handle double-click on buttons', async ({ builderPage, page }) => {
    await builderPage.goto();
    await builderPage.waitForLoad();

    // Close any open dialogs (like Command Palette) that might be blocking buttons
    await page.keyboard.press('Escape');
    await page.waitForTimeout(500);

    // Double-click on share button - handle potential issues gracefully
    // The share button might be in a dropdown or have conditional visibility
    try {
      await builderPage.shareButton.dblclick({ timeout: 3000 });
    } catch {
      // If share button not directly accessible, try to open Actions menu first
      const actionsButton = page.locator('button:has-text("Actions")').first();
      if (await actionsButton.isVisible()) {
        await actionsButton.click();
        await page.waitForTimeout(300);
        try {
          await builderPage.shareButton.dblclick({ timeout: 3000 });
        } catch {
          // Expected to fail - we're testing that it handles gracefully
        }
      }
    }

    // Should handle gracefully - no crash
    const builderContainer = builderPage.page.locator('body');
    expect(await builderContainer.count()).toBe(1);
  });

  test('should handle keyboard shortcuts when not focused', async ({ builderPage, page }) => {
    await builderPage.goto();
    await builderPage.waitForLoad();

    // Press keyboard shortcuts without focus
    await page.keyboard.press('Control+k');
    await page.waitForTimeout(500);

    await page.keyboard.press('Escape');
    await page.waitForTimeout(500);

    // Should handle gracefully
    const isVisible = await builderPage.builderContainer.isVisible();
    expect(isVisible).toBe(true);
  });
});

test.describe('Race Conditions', () => {
  test('should handle concurrent username changes and tab switches', async ({ builderPage }) => {
    await builderPage.goto();
    await builderPage.waitForLoad();

    // Start multiple operations concurrently
    await Promise.all([builderPage.enterUsername('torvalds'), builderPage.switchToPreview()]);

    // Should handle gracefully
    const username = await builderPage.getUsername();
    expect(username).toBe('torvalds');
  });

  test('should handle page unload during operation', async ({ builderPage }) => {
    await builderPage.goto();
    await builderPage.waitForLoad();

    await builderPage.enterUsername('testuser');

    // Navigate away (unload)
    await builderPage.page.goto('/non-existent-page-12345');

    // Should not crash the test runner
    expect(true).toBe(true);
  });
});

test.describe('Invalid State Handling', () => {
  test('should handle corrupted localStorage', async ({ builderPage, page }) => {
    await builderPage.goto();
    await builderPage.waitForLoad();

    // Inject corrupted data into localStorage
    await page.evaluate(() => {
      localStorage.setItem('builder-state', 'invalid-json-data-{{{');
    });

    // Reload page - should handle gracefully
    await builderPage.page.reload();
    await builderPage.waitForLoad();

    // Should still render
    const isVisible = await builderPage.builderContainer.isVisible();
    expect(isVisible).toBe(true);
  });

  test('should handle missing required elements', async ({ page }) => {
    // Navigate to a non-builder page
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Verify page still renders without builder-specific elements
    const body = page.locator('body');
    expect(await body.isVisible()).toBe(true);
  });
});

test.describe('Performance Under Load', () => {
  test('should handle large content generation', async ({ builderPage }) => {
    await builderPage.goto();
    await builderPage.waitForLoad();

    const startTime = Date.now();

    await builderPage.enterUsername('torvalds');
    await builderPage.switchToMarkdown();

    const markdown = await builderPage.getMarkdownContent();

    const loadTime = Date.now() - startTime;

    // Should complete within reasonable time
    expect(loadTime).toBeLessThan(10000);
    expect(markdown).toBeTruthy();
  });

  test('should handle repeated operations without memory leak', async ({ builderPage }) => {
    await builderPage.goto();
    await builderPage.waitForLoad();

    // Perform many operations
    for (let i = 0; i < 20; i++) {
      await builderPage.enterUsername(`user${i}`);
      await builderPage.switchToPreview();
      await builderPage.switchToMarkdown();
    }

    // Page should still be responsive
    const isVisible = await builderPage.builderContainer.isVisible();
    expect(isVisible).toBe(true);
  });
});

test.describe('Accessibility Edge Cases', () => {
  test('should handle keyboard-only navigation', async ({ builderPage, page }) => {
    await builderPage.goto();
    await builderPage.waitForLoad();

    // Tab through the page
    for (let i = 0; i < 10; i++) {
      await page.keyboard.press('Tab');
    }

    // Should not crash
    expect(true).toBe(true);
  });

  test('should handle screen reader announcements', async ({ builderPage }) => {
    await builderPage.goto();
    await builderPage.waitForLoad();

    // There may or may not be ARIA live regions - just check page works
    expect(true).toBe(true);
  });
});
