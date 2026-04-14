/**
 * Builder Page Object Model
 *
 * Provides a structured interface for interacting with the GitHub Profile Maker builder.
 * This POM encapsulates all builder-related page elements and interactions.
 */
import { type Locator, type Page } from '@playwright/test';

export class BuilderPage {
  readonly page: Page;

  // Main container
  readonly builderContainer: Locator;

  // Header elements
  readonly header: Locator;
  readonly shareButton: Locator;
  readonly saveButton: Locator;
  readonly templatesButton: Locator;
  readonly themeToggle: Locator;

  // Block sidebar
  readonly blockSidebar: Locator;
  readonly blockList: Locator;
  readonly addBlockButtons: Locator;

  // Canvas area
  readonly canvas: Locator;
  readonly canvasBlocks: Locator;
  readonly emptyCanvasMessage: Locator;

  // Right panel (Config/Preview)
  readonly configPanel: Locator;
  readonly previewTab: Locator;
  readonly markdownTab: Locator;
  readonly previewContent: Locator;
  readonly markdownContent: Locator;

  // Username input
  readonly usernameInput: Locator;
  readonly usernameLabel: Locator;

  // Mobile navigation (bottom tab bar)
  readonly mobileNav: Locator;
  readonly mobileBlocksTab: Locator;
  readonly mobileCanvasTab: Locator;
  readonly mobilePreviewTab: Locator;
  readonly mobileConfigButton: Locator;

  // Dialogs
  readonly templatesDialog: Locator;
  readonly shareDialog: Locator;

  constructor(page: Page) {
    this.page = page;

    // Main container
    this.builderContainer = page.locator('.bg-background.gradient-bg, [data-testid="builder"]');

    // Header
    this.header = page.locator('header, [data-testid="builder-header"]');
    this.shareButton = page.locator('button:has-text("Share"), [aria-label*="Share"]').first();
    this.saveButton = page.locator('button:has-text("Save"), [aria-label*="Save"]').first();
    this.templatesButton = page
      .locator('button:has-text("Templates"), [aria-label*="Templates"]')
      .first();
    this.themeToggle = page.getByRole('button', { name: /toggle theme/i });

    // Block sidebar
    this.blockSidebar = page.locator('[class*="sidebar"], [data-testid="block-sidebar"]');
    this.blockList = page.locator('[class*="block-list"], [data-testid="block-list"]');
    this.addBlockButtons = page.locator('[class*="add-block"], button:has-text("Add")');

    // Canvas
    this.canvas = page.locator('[data-testid="canvas"], [class*="canvas"]').first();
    this.canvasBlocks = this.canvas.locator('[class*="block"], [data-block-id]');
    this.emptyCanvasMessage = this.canvas.locator('text=No blocks yet').first();

    // Right panel
    this.configPanel = page.locator('[class*="config-panel"], [data-testid="config-panel"]');
    this.previewTab = page.locator('button[role="tab"]:has-text("Preview")').first();
    this.markdownTab = page.locator('button[role="tab"]:has-text("Markdown")').first();
    this.previewContent = page.locator(
      '[role="tabpanel"]:has-text("Preview"), [data-testid="preview-panel"]',
    );
    this.markdownContent = page.locator(
      '[role="tabpanel"]:has-text("Markdown"), [data-testid="markdown-panel"]',
    );

    // Username
    this.usernameInput = page
      .locator('input[placeholder*="GitHub username"], input[aria-label*="username"]')
      .first();
    this.usernameLabel = page.locator('label:has-text("GitHub Username")').first();

    // Mobile navigation (bottom tab bar - more specific selectors)
    this.mobileNav = page.locator('[class*="mobile-nav"], [data-testid="mobile-navigation"]');
    // Target the bottom tab bar buttons using their container structure
    this.mobileBlocksTab = page.locator('.grid.grid-cols-4 button:has-text("Blocks")').first();
    this.mobileCanvasTab = page.locator('.grid.grid-cols-4 button:has-text("Canvas")').first();
    this.mobilePreviewTab = page.locator('.grid.grid-cols-4 button:has-text("Preview")').first();
    this.mobileConfigButton = page.locator('.grid.grid-cols-4 button:has-text("Config")').first();

    // Dialogs
    this.templatesDialog = page.locator('[role="dialog"]:has-text("Templates")');
    this.shareDialog = page.locator('[role="dialog"]:has-text("Share")');
  }

  /**
   * Navigate to the builder page
   */
  async goto(): Promise<void> {
    await this.page.goto('/', { waitUntil: 'networkidle' });
  }

  /**
   * Wait for the builder to fully load
   */
  async waitForLoad(): Promise<void> {
    await this.page.waitForLoadState('networkidle');
    await this.builderContainer.waitFor({ state: 'visible', timeout: 10000 });
  }

  /**
   * Enter GitHub username
   */
  async enterUsername(username: string): Promise<void> {
    await this.usernameInput.fill(username);
  }

  /**
   * Get current username value
   */
  async getUsername(): Promise<string> {
    return await this.usernameInput.inputValue();
  }

  /**
   * Switch to preview tab
   */
  async switchToPreview(): Promise<void> {
    await this.previewTab.click();
    await this.previewContent.waitFor({ state: 'visible' });
  }

  /**
   * Switch to markdown tab
   */
  async switchToMarkdown(): Promise<void> {
    await this.markdownTab.click();
    await this.markdownContent.waitFor({ state: 'visible' });
  }

  /**
   * Get preview content
   */
  async getPreviewContent(): Promise<string> {
    await this.switchToPreview();
    return (await this.previewContent.textContent()) || '';
  }

  /**
   * Get markdown content
   */
  async getMarkdownContent(): Promise<string> {
    await this.switchToMarkdown();
    return (await this.markdownContent.textContent()) || '';
  }

  /**
   * Click share button
   */
  async clickShare(): Promise<void> {
    // Close any open dialogs (like Command Palette) before clicking Share
    await this.page.keyboard.press('Escape');
    await this.page.waitForTimeout(300);

    // Open the Actions dropdown menu first
    const actionsButton = this.page.locator('button:has-text("Actions")').first();
    await actionsButton.click();
    await this.page.waitForTimeout(300);

    // Click the Share submenu item
    const shareSubmenu = this.page.locator('[role="menu"] >> text=Share').first();
    await shareSubmenu.click();
  }

  /**
   * Click save button
   */
  async clickSave(): Promise<void> {
    await this.saveButton.click();
  }

  /**
   * Click templates button
   */
  async clickTemplates(): Promise<void> {
    await this.templatesButton.click();
  }

  /**
   * Get block count in canvas
   */
  async getBlockCount(): Promise<number> {
    return await this.canvasBlocks.count();
  }

  /**
   * Check if canvas is empty
   */
  async isCanvasEmpty(): Promise<boolean> {
    const message = this.emptyCanvasMessage;
    return await message.isVisible().catch(() => false);
  }

  /**
   * Add a block from the sidebar (by index)
   */
  async addBlock(index: number = 0): Promise<void> {
    const blocks = this.page.locator('[class*="block-item"], [data-testid*="block-"]');
    await blocks.nth(index).click();
  }

  /**
   * Delete a block from canvas (by index)
   */
  async deleteBlock(index: number): Promise<void> {
    const block = this.canvasBlocks.nth(index);
    await block.hover();
    const deleteButton = block.locator('[data-testid="delete-block"], button:has-text("Delete")');
    await deleteButton.click();
  }

  /**
   * Toggle theme (light/dark)
   */
  async toggleTheme(): Promise<void> {
    // Click theme toggle button to open the dropdown menu
    await this.themeToggle.click();
    // Wait for the dropdown menu to appear
    await this.page.waitForTimeout(300);
    // Select the Dark theme option
    const darkOption = this.page.locator('[role="menuitem"] >> text=Dark').first();
    await darkOption.click();
    await this.page.waitForTimeout(300);
  }

  /**
   * Check if page is in mobile view
   */
  async isMobileView(): Promise<boolean> {
    const viewport = this.page.viewportSize();
    return viewport ? viewport.width < 768 : false;
  }

  /**
   * Switch mobile tab
   */
  async switchMobileTab(tab: 'blocks' | 'canvas' | 'preview'): Promise<void> {
    // Ensure we're in mobile view
    if (!(await this.isMobileView())) {
      throw new Error('Mobile tab switching is only available on mobile viewports');
    }

    switch (tab) {
      case 'blocks':
        await this.mobileBlocksTab.click({ force: true });
        break;
      case 'canvas':
        await this.mobileCanvasTab.click({ force: true });
        break;
      case 'preview':
        await this.mobilePreviewTab.click({ force: true });
        break;
    }
  }
}

export default BuilderPage;
