'use client';

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import { createTranslator, type Locale } from '@/lib/utils/i18n';
import { formatDate } from '@/lib/utils/date';
import thTranslations from '@/i18n/th.json';
import enTranslations from '@/i18n/en.json';

interface I18nContextValue {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  t: (key: string, params?: Record<string, string>) => string;
  formatDate: (date: Date) => string;
}

const I18nContext = createContext<I18nContextValue | null>(null);

const translations = { th: thTranslations, en: enTranslations } as Record<
  Locale,
  Record<string, string | Record<string, unknown>>
>;

export function I18nProvider({
  children,
  defaultLocale = 'en',
}: {
  children: ReactNode;
  defaultLocale?: Locale;
}) {
  const [locale, setLocale] = useState<Locale>(defaultLocale);

  const t = useMemo(() => createTranslator(locale, translations), [locale]);

  const formatDateLocalized = useCallback(
    (date: Date) => formatDate(date, locale),
    [locale],
  );

  const value = useMemo<I18nContextValue>(
    () => ({ locale, setLocale, t, formatDate: formatDateLocalized }),
    [locale, t, formatDateLocalized],
  );

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n(): I18nContextValue {
  const ctx = useContext(I18nContext);
  if (!ctx) {
    throw new Error('useI18n must be used within an I18nProvider');
  }
  return ctx;
}
