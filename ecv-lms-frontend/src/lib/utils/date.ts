import type { Locale } from './i18n';

/**
 * Format a Date for display. When locale is 'th', uses Thai Buddhist calendar
 * (Gregorian year + 543). When locale is 'en', uses Gregorian calendar.
 */
export function formatDate(date: Date, locale: Locale): string {
  const day = date.getDate();
  const month = date.getMonth(); // 0-indexed
  const gregorianYear = date.getFullYear();

  if (locale === 'th') {
    const buddhistYear = gregorianYear + 543;
    const thaiMonths = [
      'ม.ค.', 'ก.พ.', 'มี.ค.', 'เม.ย.', 'พ.ค.', 'มิ.ย.',
      'ก.ค.', 'ส.ค.', 'ก.ย.', 'ต.ค.', 'พ.ย.', 'ธ.ค.',
    ];
    return `${day} ${thaiMonths[month]} ${buddhistYear}`;
  }

  const enMonths = [
    'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
    'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
  ];
  return `${enMonths[month]} ${day}, ${gregorianYear}`;
}
