import { describe, it, expect } from 'vitest';
import { formatDate } from '../date';

describe('formatDate', () => {
  describe('Thai locale (Buddhist calendar)', () => {
    it('converts Gregorian year to Buddhist Era (year + 543)', () => {
      const date = new Date(2025, 0, 15); // Jan 15, 2025
      expect(formatDate(date, 'th')).toBe('15 ม.ค. 2568');
    });

    it('formats all Thai months correctly', () => {
      const months = [
        'ม.ค.', 'ก.พ.', 'มี.ค.', 'เม.ย.', 'พ.ค.', 'มิ.ย.',
        'ก.ค.', 'ส.ค.', 'ก.ย.', 'ต.ค.', 'พ.ย.', 'ธ.ค.',
      ];
      months.forEach((expected, i) => {
        const date = new Date(2024, i, 1);
        const result = formatDate(date, 'th');
        expect(result).toContain(expected);
      });
    });

    it('handles year 2000 correctly (2543 BE)', () => {
      const date = new Date(2000, 5, 10);
      expect(formatDate(date, 'th')).toBe('10 มิ.ย. 2543');
    });

    it('handles single-digit days', () => {
      const date = new Date(2025, 2, 5);
      expect(formatDate(date, 'th')).toBe('5 มี.ค. 2568');
    });
  });

  describe('English locale (Gregorian calendar)', () => {
    it('formats date in English with Gregorian year', () => {
      const date = new Date(2025, 0, 15);
      expect(formatDate(date, 'en')).toBe('Jan 15, 2025');
    });

    it('formats all English months correctly', () => {
      const months = [
        'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
        'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
      ];
      months.forEach((expected, i) => {
        const date = new Date(2024, i, 1);
        const result = formatDate(date, 'en');
        expect(result).toContain(expected);
      });
    });

    it('handles year 2000 correctly', () => {
      const date = new Date(2000, 11, 25);
      expect(formatDate(date, 'en')).toBe('Dec 25, 2000');
    });
  });
});
