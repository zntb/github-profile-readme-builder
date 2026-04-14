/**
 * Home Page Object Model
 *
 * Provides a structured interface for interacting with the GitHub Profile Maker homepage.
 */
import { type Locator, type Page } from '@playwright/test';

export class HomePage {
  readonly page: Page;

  // Main content
  readonly mainContent: Locator;
  readonly heading: Locator;
  readonly description: Locator;

  // Navigation
  readonly nav: Locator;
  readonly navLinks: Locator;

  // Call to action
  readonly getStartedButton: Locator;
  readonly learnMoreButton: Locator;

  // Footer
  readonly footer: Locator;
  readonly footerLinks: Locator;

  // Theme toggle
  readonly themeToggle: Locator;

  // Feature sections
  readonly features: Locator;

  constructor(page: Page) {
    this.page = page;

    // Main content - uses the skip link target from layout.tsx
    this.mainContent = page.locator('#main-content');
    this.heading = page.locator('h1').first();
    this.description = page.locator('p').first();

    // Navigation
    this.nav = page.locator('nav').first();
    this.navLinks = this.nav.locator('a, button');

    // CTAs
    this.getStartedButton = page
      .locator(
        'a:has-text("Get Started"), a:has-text("Create"), button:has-text("Get Started"), button:has-text("Create")',
      )
      .first();
    this.learnMoreButton = page
      .locator('a:has-text("Learn more"), a:has-text("Learn More")')
      .first();

    // Footer
    this.footer = page.locator('footer').first();
    this.footerLinks = this.footer.locator('a');

    // Theme toggle - look for mode-toggle component
    this.themeToggle = page
      .locator(
        '[data-testid="mode-toggle"], [class*="mode-toggle"], button[aria-label*="theme"], button[aria-label*="mode"]',
      )
      .first();

    // Features
    this.features = page.locator('[class*="feature"], section[class*="feature"]');
  }

  /**
   * Navigate to the home page
   */
  async goto(): Promise<void> {
    await this.page.goto('/', { waitUntil: 'networkidle' });
  }

  /**
   * Wait for the home page to fully load
   */
  async waitForLoad(): Promise<void> {
    await this.page.waitForLoadState('networkidle');
    await this.mainContent.waitFor({ state: 'visible', timeout: 10000 });
  }

  /**
   * Get page title
   */
  async getTitle(): Promise<string> {
    return await this.page.title();
  }

  /**
   * Get main heading text
   */
  async getHeading(): Promise<string> {
    return (await this.heading.textContent()) || '';
  }

  /**
   * Get description text
   */
  async getDescription(): Promise<string> {
    return (await this.description.textContent()) || '';
  }

  /**
   * Click get started button and wait for navigation
   */
  async clickGetStarted(): Promise<void> {
    await this.getStartedButton.click();
    // Wait for builder to load
    await this.page.waitForLoadState('networkidle');
  }

  /**
   * Toggle theme
   */
  async toggleTheme(): Promise<void> {
    await this.themeToggle.click();
  }

  /**
   * Get all feature sections count
   */
  async getFeatureCount(): Promise<number> {
    return await this.features.count();
  }

  /**
   * Get footer links count
   */
  async getFooterLinkCount(): Promise<number> {
    return await this.footerLinks.count();
  }

  /**
   * Check if page has any critical console errors
   */
  async hasConsoleErrors(): Promise<boolean> {
    const errors: string[] = [];
    this.page.on('console', (msg) => {
      if (msg.type() === 'error') {
        errors.push(msg.text());
      }
    });
    await this.page.goto('/', { waitUntil: 'networkidle' });
    // Filter out known non-critical errors
    const criticalErrors = errors.filter((e) => !e.includes('favicon') && !e.includes('404'));
    return criticalErrors.length > 0;
  }
}

export default HomePage;
