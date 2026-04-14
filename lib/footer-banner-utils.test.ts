import { describe, expect, it } from '@jest/globals';

import { parseLegacyWaveColor, resolveFooterBannerColors } from './footer-banner-utils';

describe('footer-banner-utils', () => {
  describe('parseLegacyWaveColor', () => {
    // FB-ITEM-1: Valid Legacy Format - Parses Correctly
    it('should parse valid legacy wave color format "0:EEFF00,100:A82DAA"', () => {
      const result = parseLegacyWaveColor('0:EEFF00,100:A82DAA');

      expect(result.bgStartColor).toBe('EEFF00');
      expect(result.bgEndColor).toBe('A82DAA');
    });

    // FB-ITEM-2: Single Stop - Uses Same Color for Both
    it('should use same color for both when only one stop provided', () => {
      const result = parseLegacyWaveColor('0:EEFF00');

      expect(result.bgStartColor).toBe('EEFF00');
      expect(result.bgEndColor).toBe('EEFF00');
    });

    // FB-ITEM-3: Three Stops - Uses First and Last
    it('should use first and last stop when multiple stops provided', () => {
      const result = parseLegacyWaveColor('0:FF0000,50:00FF00,100:0000FF');

      expect(result.bgStartColor).toBe('FF0000');
      expect(result.bgEndColor).toBe('0000FF');
    });

    // FB-ITEM-4: Short Hex Format (3 chars) - Converts to Uppercase
    it('should handle 3-character hex format', () => {
      const result = parseLegacyWaveColor('0:ABC,100:DEF');

      expect(result.bgStartColor).toBe('ABC');
      expect(result.bgEndColor).toBe('DEF');
    });

    // FB-ITEM-5: Lowercase Hex - Converts to Uppercase
    it('should convert lowercase hex to uppercase', () => {
      const result = parseLegacyWaveColor('0:aabbcc,100:ddeeff');

      expect(result.bgStartColor).toBe('AABBCC');
      expect(result.bgEndColor).toBe('DDEEFF');
    });

    // FB-ITEM-6: Mixed Case Hex - Converts to Uppercase
    it('should handle mixed case hex values', () => {
      const result = parseLegacyWaveColor('0:AaBbCc,100:DdEeFf');

      expect(result.bgStartColor).toBe('AABBCC');
      expect(result.bgEndColor).toBe('DDEEFF');
    });

    // FB-ITEM-7: Invalid Hex (Too Short) - Falls Back to Default
    it('should fall back to default for invalid hex values', () => {
      const result = parseLegacyWaveColor('0:AB,100:CD');

      // Invalid hex falls back to defaults
      expect(result.bgStartColor).toBe('EEFF00'); // default
      expect(result.bgEndColor).toBe('A82DAA'); // second default when parsing fails
    });

    // FB-ITEM-8: Invalid Hex (Too Long) - Falls Back to Default
    it('should fall back to default for hex values that are too long', () => {
      const result = parseLegacyWaveColor('0:ABABABAB,100:CDCDCDCD');

      // Invalid hex falls back to defaults
      expect(result.bgStartColor).toBe('EEFF00'); // default
      expect(result.bgEndColor).toBe('A82DAA'); // second default when parsing fails
    });

    // FB-ITEM-9: Empty String - Returns Defaults
    it('should return defaults for empty string', () => {
      const result = parseLegacyWaveColor('');

      expect(result.bgStartColor).toBe('EEFF00');
      expect(result.bgEndColor).toBe('A82DAA');
    });

    // FB-ITEM-10: No Colon in Stop - Uses Value Directly
    it('should use value directly when no colon in stop', () => {
      const result = parseLegacyWaveColor('FF0000,0000FF');

      expect(result.bgStartColor).toBe('FF0000');
      expect(result.bgEndColor).toBe('0000FF');
    });

    // FB-ITEM-11: Trailing Whitespace - Trims Properly
    it('should trim whitespace from hex values', () => {
      const result = parseLegacyWaveColor(' 0:EEFF00 , 100:A82DAA ');

      expect(result.bgStartColor).toBe('EEFF00');
      expect(result.bgEndColor).toBe('A82DAA');
    });

    // FB-ITEM-12: Zero Position Value - Parses Correctly
    it('should handle position value of 0', () => {
      const result = parseLegacyWaveColor('0:FF0000,100:0000FF');

      expect(result.bgStartColor).toBe('FF0000');
    });

    // FB-ITEM-13: Various Position Values - Uses Correct Stops
    it('should correctly identify first and last stops regardless of position', () => {
      // Even if positions are not 0 and 100
      const result = parseLegacyWaveColor('25:FF0000,50:00FF00,75:0000FF');

      expect(result.bgStartColor).toBe('FF0000');
      expect(result.bgEndColor).toBe('0000FF');
    });

    // FB-ITEM-14: Reversed Order Stops - Still Uses First and Last
    it('should use first and last in array order, not position value', () => {
      // Array order is preserved even if positions seem reversed
      const result = parseLegacyWaveColor('100:0000FF,0:FF0000');

      expect(result.bgStartColor).toBe('0000FF'); // First in array
      expect(result.bgEndColor).toBe('FF0000'); // Last in array
    });

    // FB-ITEM-15: Standard Format Without Position - Uses Values Directly
    it('should parse standard comma-separated format correctly', () => {
      const result = parseLegacyWaveColor('0:EEFF00,100:A82DAA');
      expect(result.bgStartColor).toBe('EEFF00');
      expect(result.bgEndColor).toBe('A82DAA');
    });
  });

  describe('resolveFooterBannerColors', () => {
    // FB-ITEM-16: Modern Props Only - Uses Modern Props
    it('should prefer modern bgStartColor/bgEndColor props', () => {
      const props = {
        bgStartColor: 'FF5733',
        bgEndColor: '33FF57',
      };

      const result = resolveFooterBannerColors(props);

      expect(result.bgStartColor).toBe('FF5733');
      expect(result.bgEndColor).toBe('33FF57');
    });

    // FB-ITEM-17: Only Start Modern - Uses Start + Legacy End
    it('should use modern start with legacy end when only start is modern', () => {
      const props = {
        bgStartColor: 'FF5733',
        waveColor: '0:EEFF00,100:A82DAA',
      };

      const result = resolveFooterBannerColors(props);

      expect(result.bgStartColor).toBe('FF5733');
      expect(result.bgEndColor).toBe('A82DAA');
    });

    // FB-ITEM-18: Only End Modern - Uses Legacy Start + Modern End
    it('should use legacy start with modern end when only end is modern', () => {
      const props = {
        bgEndColor: '33FF57',
        waveColor: '0:EEFF00,100:A82DAA',
      };

      const result = resolveFooterBannerColors(props);

      expect(result.bgStartColor).toBe('EEFF00');
      expect(result.bgEndColor).toBe('33FF57');
    });

    // FB-ITEM-19: Legacy WaveColor Only - Parses and Returns
    it('should use legacy waveColor when no modern props provided', () => {
      const props = {
        waveColor: '0:FF0000,100:0000FF',
      };

      const result = resolveFooterBannerColors(props);

      expect(result.bgStartColor).toBe('FF0000');
      expect(result.bgEndColor).toBe('0000FF');
    });

    // FB-ITEM-20: No Props - Returns Defaults
    it('should return default colors when no props provided', () => {
      const result = resolveFooterBannerColors({});

      expect(result.bgStartColor).toBe('EEFF00');
      expect(result.bgEndColor).toBe('A82DAA');
    });

    // FB-ITEM-21: Empty Props - Returns Defaults
    it('should return defaults for empty props object', () => {
      const result = resolveFooterBannerColors({});

      expect(result.bgStartColor).toBe('EEFF00');
      expect(result.bgEndColor).toBe('A82DAA');
    });

    // FB-ITEM-22: Whitespace in Modern Props - Trims Correctly
    it('should trim whitespace from modern props', () => {
      const props = {
        bgStartColor: '  FF5733  ',
        bgEndColor: '  33FF57  ',
      };

      const result = resolveFooterBannerColors(props);

      expect(result.bgStartColor).toBe('FF5733');
      expect(result.bgEndColor).toBe('33FF57');
    });

    // FB-ITEM-23: Mixed Modern and Legacy - Modern Takes Precedence
    it('should have modern props override legacy props', () => {
      const props = {
        bgStartColor: 'MODERN_START',
        bgEndColor: 'MODERN_END',
        waveColor: '0:LEGACY_START,100:LEGACY_END',
      };

      const result = resolveFooterBannerColors(props);

      expect(result.bgStartColor).toBe('MODERN_START');
      expect(result.bgEndColor).toBe('MODERN_END');
    });

    // FB-ITEM-24: Undefined Props - Ignores Undefined Values
    it('should ignore undefined props and fall through', () => {
      const props: Record<string, unknown> = {
        bgStartColor: undefined,
        bgEndColor: undefined,
        waveColor: '0:FF0000,100:0000FF',
      };

      const result = resolveFooterBannerColors(props);

      // undefined should be treated as falsy, falling through to legacy
      expect(result.bgStartColor).toBe('FF0000');
      expect(result.bgEndColor).toBe('0000FF');
    });

    // FB-ITEM-25: Non-String Modern Props - Converts to String
    it('should convert non-string modern props to string', () => {
      const props = {
        bgStartColor: 12345,
        bgEndColor: 67890,
      };

      const result = resolveFooterBannerColors(props);

      expect(result.bgStartColor).toBe('12345');
      expect(result.bgEndColor).toBe('67890');
    });

    // FB-ITEM-26: Invalid Legacy WaveColor - Falls Back to Modern or Defaults
    it('should fall back to defaults for invalid legacy waveColor', () => {
      const props = {
        waveColor: 'invalid',
      };

      const result = resolveFooterBannerColors(props);

      // Should use defaults when legacy parsing fails
      expect(result.bgStartColor).toBe('EEFF00');
      expect(result.bgEndColor).toBe('A82DAA');
    });

    // FB-ITEM-27: Partial Modern - One Value Provided
    it('should handle partial modern props (only one value)', () => {
      const props = {
        bgStartColor: 'FF5733',
        // bgEndColor not provided
      };

      const result = resolveFooterBannerColors(props);

      expect(result.bgStartColor).toBe('FF5733');
      // bgEndColor should fall through to default
      expect(result.bgEndColor).toBe('A82DAA');
    });

    // FB-ITEM-28: Numeric Props - Converts to String
    it('should convert numeric props to strings', () => {
      const props = {
        bgStartColor: 0xff0000, // red
        bgEndColor: 0x0000ff, // blue
      };

      const result = resolveFooterBannerColors(props);

      expect(result.bgStartColor).toBe('16711680'); // decimal representation
      expect(result.bgEndColor).toBe('255'); // decimal representation
    });

    // FB-ITEM-29: Priority Order - Modern > Legacy > Defaults
    it('should follow correct priority order for colors', () => {
      // This is the key integration test for the priority system
      const modernProps = {
        bgStartColor: 'FF5733',
        bgEndColor: '33FF57',
      };

      const legacyProps = {
        waveColor: '0:AABBCC,100:DDEEFF',
      };

      // Modern takes priority
      const resultModern = resolveFooterBannerColors(modernProps);
      expect(resultModern.bgStartColor).toBe('FF5733');
      expect(resultModern.bgEndColor).toBe('33FF57');

      // Legacy is fallback when no modern
      const resultLegacy = resolveFooterBannerColors(legacyProps);
      expect(resultLegacy.bgStartColor).toBe('AABBCC');
      expect(resultLegacy.bgEndColor).toBe('DDEEFF');

      // Defaults when neither present
      const resultDefault = resolveFooterBannerColors({});
      expect(resultDefault.bgStartColor).toBe('EEFF00');
      expect(resultDefault.bgEndColor).toBe('A82DAA');
    });

    // FB-ITEM-30: Null Props - Treated as Undefined
    it('should handle null props as undefined', () => {
      const props = {
        bgStartColor: null,
        waveColor: '0:FF0000,100:0000FF',
      };

      const result = resolveFooterBannerColors(props);

      // null should be treated as undefined, falling through to legacy
      expect(result.bgStartColor).toBe('FF0000');
      expect(result.bgEndColor).toBe('0000FF');
    });
  });
});
