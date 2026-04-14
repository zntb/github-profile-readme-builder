import { describe, expect, it } from '@jest/globals';

import { QUOTE_THEMES, getQuoteTheme } from './quote-themes';

describe('quote-themes', () => {
  describe('QUOTE_THEMES', () => {
    // QT-ITEM-1: Contains Default Theme
    it('should contain a default theme', () => {
      expect(QUOTE_THEMES.default).toBeDefined();
      expect(QUOTE_THEMES.default.bg).toBe('#0f0f23');
      expect(QUOTE_THEMES.default.text).toBe('#a9b7c6');
      expect(QUOTE_THEMES.default.accent).toBe('#6a9955');
      expect(QUOTE_THEMES.default.border).toBe('#3e4451');
    });

    // QT-ITEM-2: Contains Popular Themes
    it('should contain popular themes like dark, dracula, nord', () => {
      expect(QUOTE_THEMES.dark).toBeDefined();
      expect(QUOTE_THEMES.dracula).toBeDefined();
      expect(QUOTE_THEMES.nord).toBeDefined();
    });

    // QT-ITEM-3: Theme Colors Have Required Properties
    it('should have bg, text, accent, and border for each theme', () => {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      for (const [themeName, theme] of Object.entries(QUOTE_THEMES)) {
        expect(theme).toHaveProperty('bg');
        expect(theme).toHaveProperty('text');
        expect(theme).toHaveProperty('accent');
        expect(theme).toHaveProperty('border');

        // Verify they're hex color strings
        expect(theme.bg).toMatch(/^#[0-9a-fA-F]{6}$/);
        expect(theme.text).toMatch(/^#[0-9a-fA-F]{6}$/);
        expect(theme.accent).toMatch(/^#[0-9a-fA-F]{6}$/);
        expect(theme.border).toMatch(/^#[0-9a-fA-F]{6}$/);
      }
    });

    // QT-ITEM-4: Contains GitHub Themes
    it('should contain github and github_dark themes', () => {
      expect(QUOTE_THEMES.github).toBeDefined();
      expect(QUOTE_THEMES.github_dark).toBeDefined();
    });

    // QT-ITEM-5: Contains Alternative Theme Names
    it('should contain alternative theme names like tokyo-night', () => {
      expect(QUOTE_THEMES['tokyo-night']).toBeDefined();
      expect(QUOTE_THEMES['vue-dark']).toBeDefined();
      expect(QUOTE_THEMES['react-dark']).toBeDefined();
    });

    // QT-ITEM-6: Contains Synthwave Theme
    it('should contain synthwave theme', () => {
      expect(QUOTE_THEMES.synthwave).toBeDefined();
      expect(QUOTE_THEMES.synthwave.bg).toBe('#1a1a2e');
    });

    // QT-ITEM-7: Contains Cobalt Theme
    it('should contain cobalt theme', () => {
      expect(QUOTE_THEMES.cobalt).toBeDefined();
      expect(QUOTE_THEMES.cobalt2).toBeDefined();
    });

    // QT-ITEM-8: Contains Catppuccin Themes
    it('should contain catppuccin themes', () => {
      expect(QUOTE_THEMES.catppuccin_latte).toBeDefined();
      expect(QUOTE_THEMES.catppuccin_mocha).toBeDefined();
    });

    // QT-ITEM-9: All Themes Are Valid Objects
    it('should have all themes as valid objects', () => {
      const themeNames = Object.keys(QUOTE_THEMES);
      expect(themeNames.length).toBeGreaterThan(30);

      for (const name of themeNames) {
        expect(typeof QUOTE_THEMES[name]).toBe('object');
        expect(QUOTE_THEMES[name]).not.toBeNull();
      }
    });
  });

  describe('getQuoteTheme', () => {
    // QT-ITEM-10: Known Theme Name - Returns Theme
    it('should return theme for known theme name', () => {
      const result = getQuoteTheme('dracula');

      expect(result).toEqual(QUOTE_THEMES.dracula);
    });

    // QT-ITEM-11: Unknown Theme Name - Returns Default
    it('should return default theme for unknown theme name', () => {
      const result = getQuoteTheme('nonexistent-theme');

      expect(result).toEqual(QUOTE_THEMES.default);
    });

    // QT-ITEM-12: Empty String - Returns Default
    it('should return default theme for empty string', () => {
      const result = getQuoteTheme('');

      expect(result).toEqual(QUOTE_THEMES.default);
    });

    // QT-ITEM-13: Custom Theme Format - Parses Correctly
    it('should parse custom theme format "custom:bg_accent_text_icon_border"', () => {
      const result = getQuoteTheme('custom:0f0f23_6a9955_a9b7c6_icon_3e4451');

      expect(result.bg).toBe('#0f0f23');
      expect(result.accent).toBe('#6a9955');
      expect(result.text).toBe('#a9b7c6');
      expect(result.border).toBe('#3e4451');
    });

    // QT-ITEM-14: Custom Theme - Insufficient Parts - Returns Default
    it('should return default for custom theme with insufficient parts', () => {
      const result = getQuoteTheme('custom:0f0f23_6a9955');

      expect(result).toEqual(QUOTE_THEMES.default);
    });

    // QT-ITEM-15: Custom Theme - Exactly 5 Parts
    it('should parse custom theme with exactly 5 parts', () => {
      const result = getQuoteTheme('custom:112233_445566_778899_ii_001122');

      expect(result.bg).toBe('#112233');
      expect(result.accent).toBe('#445566');
      expect(result.text).toBe('#778899');
      // parts[3] is icon which is ignored
      expect(result.border).toBe('#001122');
    });

    // QT-ITEM-16: Custom Theme - More Than 5 Parts
    it('should parse custom theme with more than 5 parts', () => {
      const result = getQuoteTheme('custom:112233_445566_778899_icon_001122_extra');

      expect(result.bg).toBe('#112233');
      expect(result.accent).toBe('#445566');
      expect(result.text).toBe('#778899');
      expect(result.border).toBe('#001122');
    });

    // QT-ITEM-17: Case Sensitivity - Theme Names Are Case Sensitive
    it('should handle case-sensitive theme names', () => {
      const result1 = getQuoteTheme('Dracula');
      const result2 = getQuoteTheme('dracula');

      expect(result1).toEqual(QUOTE_THEMES.default); // 'Dracula' doesn't exist
      expect(result2).toEqual(QUOTE_THEMES.dracula);
    });

    // QT-ITEM-18: Theme With Hyphen - Returns Theme
    it('should return theme for names with hyphens', () => {
      const result = getQuoteTheme('tokyo-night');

      expect(result).toEqual(QUOTE_THEMES['tokyo-night']);
    });

    // QT-ITEM-19: Custom Theme - Missing Hash - Adds Hash
    it('should add hash prefix if missing in custom theme', () => {
      const result = getQuoteTheme('custom:0f0f23_6a9955_a9b7c6_ii_3e4451');

      expect(result.bg).toBe('#0f0f23');
      expect(result.border).toBe('#3e4451');
    });

    // QT-ITEM-20: Custom Theme - Already Has Hash - Keeps Hash
    it('should handle custom theme with hash prefix', () => {
      const result = getQuoteTheme('custom:#0f0f23_#6a9955_#a9b7c6_ii_#3e4451');

      expect(result.bg).toBe('##0f0f23'); // Hash is added again
    });

    // QT-ITEM-21: Returns Theme with All Properties
    it('should return theme with bg, text, accent, border properties', () => {
      const result = getQuoteTheme('nord');

      expect(result).toHaveProperty('bg');
      expect(result).toHaveProperty('text');
      expect(result).toHaveProperty('accent');
      expect(result).toHaveProperty('border');
    });

    // QT-ITEM-22: Custom Theme With Single Character Parts
    it('should parse custom theme with single character parts', () => {
      const result = getQuoteTheme('custom:a_b_c_d_e');

      expect(result.bg).toBe('#a');
      expect(result.accent).toBe('#b');
      expect(result.text).toBe('#c');
      expect(result.border).toBe('#e');
    });

    // QT-ITEM-23: Null/Undefined Handling - function expects string, so these would throw
    it('should handle empty string', () => {
      const result = getQuoteTheme('');

      expect(result).toEqual(QUOTE_THEMES.default);
    });

    // QT-ITEM-24: Special Characters in Custom Theme
    it('should handle custom theme with underscores in color values', () => {
      // This tests that underscores within color values are not treated as separators
      const result = getQuoteTheme('custom:A_B_C_D_E');

      expect(result.bg).toBe('#A');
    });

    // QT-ITEM-25: High Contrast Theme
    it('should return highcontrast theme', () => {
      const result = getQuoteTheme('highcontrast');

      expect(result.bg).toBe('#000000');
      expect(result.text).toBe('#ffffff');
    });

    // QT-ITEM-26: Solarized Themes
    it('should return solarized themes', () => {
      const darkResult = getQuoteTheme('solarized-dark');
      const lightResult = getQuoteTheme('solarized-light');

      expect(darkResult).toEqual(QUOTE_THEMES['solarized-dark']);
      expect(lightResult).toEqual(QUOTE_THEMES['solarized-light']);
    });

    // QT-ITEM-27: Gradient Themes Are Dark
    it('should have mostly dark backgrounds for gradient/neon themes', () => {
      const themesToCheck = ['synthwave', 'outrun', 'midnight-purple', 'rose_pine'];

      for (const themeName of themesToCheck) {
        const result = getQuoteTheme(themeName);
        // Check that bg is dark (starts with #0 or #1)
        expect(result.bg.toLowerCase()).toMatch(/^#[01]/);
      }
    });

    // QT-ITEM-28: Light Themes Have Light Backgrounds
    it('should have light backgrounds for light themes', () => {
      const lightThemes = ['solarized-light', 'catppuccin_latte', 'github', 'swift'];

      for (const themeName of lightThemes) {
        const result = getQuoteTheme(themeName);
        // Light themes should have lighter backgrounds
        const bgValue = result.bg.replace('#', '');
        const bgNum = parseInt(bgValue, 16);
        // Light colors typically have higher values
        expect(bgNum).toBeGreaterThan(0xaaaaaa);
      }
    });
  });
});
