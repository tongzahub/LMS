export type Locale = 'th' | 'en';

type TranslationMap = Record<string, string | Record<string, unknown>>;

/**
 * Resolve a dot-separated key from a nested translation object.
 * e.g. 'auth.signIn' → translations.auth.signIn
 */
function resolveKey(translations: TranslationMap, key: string): string | undefined {
  const parts = key.split('.');
  let current: unknown = translations;

  for (const part of parts) {
    if (current === null || current === undefined || typeof current !== 'object') {
      return undefined;
    }
    current = (current as Record<string, unknown>)[part];
  }

  return typeof current === 'string' ? current : undefined;
}

/**
 * Interpolate `{{param}}` placeholders in a string with provided values.
 */
function interpolate(template: string, params?: Record<string, string>): string {
  if (!params) return template;
  return template.replace(/\{\{(\w+)\}\}/g, (_, paramKey: string) => {
    return params[paramKey] ?? `{{${paramKey}}}`;
  });
}

/**
 * Create a translation function for the given locale and translation maps.
 * Falls back to the key itself if no translation is found.
 */
export function createTranslator(
  locale: Locale,
  translations: Record<Locale, TranslationMap>,
) {
  return function t(key: string, params?: Record<string, string>): string {
    const value = resolveKey(translations[locale], key);
    if (value === undefined) return key;
    return interpolate(value, params);
  };
}
