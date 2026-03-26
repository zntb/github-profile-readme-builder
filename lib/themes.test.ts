import { describe, expect, it } from '@jest/globals';

import { getActivityTheme, getStreakTheme } from '@/lib/themes';
import { STATS_THEMES } from '@/lib/types';

describe('theme support across GitHub stats card types', () => {
  it('resolves every selectable theme for streak stats', () => {
    for (const theme of STATS_THEMES) {
      const resolvedTheme = getStreakTheme(theme);
      expect(resolvedTheme).toBeDefined();
      expect(resolvedTheme.bg).toBeTruthy();
      expect(resolvedTheme.ring).toBeTruthy();
    }
  });

  it('resolves every selectable theme for activity graph', () => {
    for (const theme of STATS_THEMES) {
      const resolvedTheme = getActivityTheme(theme);
      expect(resolvedTheme).toBeDefined();
      expect(resolvedTheme.bg).toBeTruthy();
      expect(resolvedTheme.color4).toBeTruthy();
    }
  });

  it('supports dashed/underscored theme aliases consistently', () => {
    expect(getStreakTheme('tokyo-night')).toEqual(getStreakTheme('tokyonight'));
    expect(getActivityTheme('github-dark')).toEqual(getActivityTheme('github_dark'));
    expect(getActivityTheme('high-contrast').bg).toBeTruthy();
    expect(getActivityTheme('highcontrast').bg).toBeTruthy();
  });
});
