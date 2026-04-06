import { test as base, type Locator, type Page } from '@playwright/test';
import { type APIRequestContext } from 'playwright-core';

/**
 * Test Fixtures for Playwright E2E tests
 *
 * This file provides reusable fixtures for:
 * - Page navigation
 * - Form handling
 * - API testing
 * - Authentication
 * - Visual regression
 */

// Custom fixture types
interface PageFixtures {
  page: Page;
}

interface ApiFixtures {
  apiRequest: APIRequestContext;
}

// Extend base test with custom fixtures
export const test = base.extend<PageFixtures & ApiFixtures>({
  // API Request context fixture
  apiRequest: async ({ playwright }, use) => {
    const request = await playwright.request.newContext({
      baseURL: process.env.PLAYWRIGHT_BASE_URL || 'http://localhost:3000',
    });
    // eslint-disable-next-line react-hooks/rules-of-hooks
    await use(request);
    await request.dispose();
  },
});

/**
 * Common page locators and interactions
 */
export class PageInteractions {
  constructor(public page: Page) {}

  /**
   * Navigate to a specific path
   */
  async goto(path: string): Promise<void> {
    await this.page.goto(path, { waitUntil: 'networkidle' });
  }

  /**
   * Wait for page to be fully loaded
   */
  async waitForLoad(): Promise<void> {
    await this.page.waitForLoadState('networkidle');
  }

  /**
   * Get page title
   */
  async getTitle(): Promise<string> {
    return await this.page.title();
  }

  /**
   * Check if element is visible
   */
  async isVisible(selector: string): Promise<boolean> {
    const element = this.page.locator(selector);
    return await element.isVisible().catch(() => false);
  }

  /**
   * Wait for element to be visible
   */
  async waitForElement(selector: string): Promise<Locator> {
    return this.page.locator(selector).first();
  }

  /**
   * Take screenshot of page
   */
  async takeScreenshot(): Promise<Buffer> {
    return await this.page.screenshot();
  }

  /**
   * Get current URL
   */
  async getUrl(): Promise<string> {
    return this.page.url();
  }
}

/**
 * Form utilities for test interactions
 */
export class FormInteractions {
  constructor(public page: Page) {}

  /**
   * Fill input field
   */
  async fillInput(selector: string, value: string): Promise<void> {
    const input = this.page.locator(selector);
    await input.clear();
    await input.fill(value);
  }

  /**
   * Select option from dropdown
   */
  async selectOption(selector: string, value: string): Promise<void> {
    await this.page.locator(selector).selectOption(value);
  }

  /**
   * Click button
   */
  async clickButton(selector: string): Promise<void> {
    await this.page.locator(selector).click();
  }

  /**
   * Submit form
   */
  async submitForm(selector: string): Promise<void> {
    await this.page.locator(selector).click();
    await this.page.waitForLoadState('networkidle');
  }

  /**
   * Check checkbox
   */
  async checkCheckbox(selector: string): Promise<void> {
    await this.page.locator(selector).check();
  }

  /**
   * Get form field error message
   */
  async getFieldError(selector: string): Promise<string | null> {
    const errorElement = this.page.locator(`${selector}-error, [data-field-error="${selector}"]`);
    if (await errorElement.isVisible().catch(() => false)) {
      return await errorElement.textContent();
    }
    return null;
  }
}

/**
 * API utilities for testing backend endpoints
 */
export class ApiInteractions {
  constructor(public request: APIRequestContext) {}

  /**
   * Make GET request
   */
  async get(
    endpoint: string,
    params?: Record<string, string>,
  ): Promise<{
    status: number;
    body: unknown;
    headers: Record<string, string>;
  }> {
    const url = new URL(endpoint, 'http://localhost:3000');
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        url.searchParams.append(key, value);
      });
    }

    const response = await this.request.get(url.toString());
    const body = await response.json().catch(() => null);
    const headers: Record<string, string> = {};
    const rawHeaders = response.headers();
    Object.keys(rawHeaders).forEach((key) => {
      headers[key] = rawHeaders[key] as string;
    });

    return {
      status: response.status(),
      body,
      headers,
    };
  }

  /**
   * Make POST request
   */
  async post(
    endpoint: string,
    data?: unknown,
  ): Promise<{
    status: number;
    body: unknown;
    headers: Record<string, string>;
  }> {
    const response = await this.request.post(endpoint, {
      data,
    });
    const body = await response.json().catch(() => null);
    const headers: Record<string, string> = {};
    const rawHeaders = response.headers();
    Object.keys(rawHeaders).forEach((key) => {
      headers[key] = rawHeaders[key] as string;
    });

    return {
      status: response.status(),
      body,
      headers,
    };
  }

  /**
   * Make PUT request
   */
  async put(
    endpoint: string,
    data?: unknown,
  ): Promise<{
    status: number;
    body: unknown;
    headers: Record<string, string>;
  }> {
    const response = await this.request.put(endpoint, {
      data,
    });
    const body = await response.json().catch(() => null);
    const headers: Record<string, string> = {};
    const rawHeaders = response.headers();
    Object.keys(rawHeaders).forEach((key) => {
      headers[key] = rawHeaders[key] as string;
    });

    return {
      status: response.status(),
      body,
      headers,
    };
  }

  /**
   * Make DELETE request
   */
  async delete(endpoint: string): Promise<{
    status: number;
    body: unknown;
    headers: Record<string, string>;
  }> {
    const response = await this.request.delete(endpoint);
    const body = await response.json().catch(() => null);
    const headers: Record<string, string> = {};
    const rawHeaders = response.headers();
    Object.keys(rawHeaders).forEach((key) => {
      headers[key] = rawHeaders[key] as string;
    });

    return {
      status: response.status(),
      body,
      headers,
    };
  }
}

// Export expect for custom assertions
export { expect } from '@playwright/test';
