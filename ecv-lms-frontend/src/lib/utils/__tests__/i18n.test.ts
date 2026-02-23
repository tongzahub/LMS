import { describe, it, expect } from 'vitest';
import { createTranslator, type Locale } from '../i18n';

const testTranslations: Record<Locale, Record<string, string | Record<string, unknown>>> = {
  en: {
    common: { save: 'Save', cancel: 'Cancel' },
    auth: { signIn: 'Sign In' },
    greeting: 'Hello, {{name}}',
    multi: '{{count}} items in {{category}}',
  } as Record<string, string | Record<string, unknown>>,
  th: {
    common: { save: 'บันทึก', cancel: 'ยกเลิก' },
    auth: { signIn: 'เข้าสู่ระบบ' },
    greeting: 'สวัสดี, {{name}}',
    multi: '{{count}} รายการใน {{category}}',
  } as Record<string, string | Record<string, unknown>>,
};

describe('createTranslator', () => {
  describe('basic key resolution', () => {
    it('resolves top-level keys', () => {
      const t = createTranslator('en', testTranslations);
      expect(t('greeting', { name: 'John' })).toBe('Hello, John');
    });

    it('resolves nested dot-separated keys', () => {
      const t = createTranslator('en', testTranslations);
      expect(t('common.save')).toBe('Save');
      expect(t('auth.signIn')).toBe('Sign In');
    });

    it('resolves Thai translations', () => {
      const t = createTranslator('th', testTranslations);
      expect(t('common.save')).toBe('บันทึก');
      expect(t('auth.signIn')).toBe('เข้าสู่ระบบ');
    });
  });

  describe('parameter interpolation', () => {
    it('replaces single parameter', () => {
      const t = createTranslator('en', testTranslations);
      expect(t('greeting', { name: 'Alice' })).toBe('Hello, Alice');
    });

    it('replaces multiple parameters', () => {
      const t = createTranslator('en', testTranslations);
      expect(t('multi', { count: '5', category: 'Books' })).toBe('5 items in Books');
    });

    it('interpolates Thai translations with params', () => {
      const t = createTranslator('th', testTranslations);
      expect(t('greeting', { name: 'สมชาย' })).toBe('สวัสดี, สมชาย');
    });

    it('preserves placeholder when param is missing', () => {
      const t = createTranslator('en', testTranslations);
      expect(t('greeting')).toBe('Hello, {{name}}');
    });
  });

  describe('missing keys', () => {
    it('returns the key itself when not found', () => {
      const t = createTranslator('en', testTranslations);
      expect(t('nonexistent.key')).toBe('nonexistent.key');
    });

    it('returns key for partially valid path', () => {
      const t = createTranslator('en', testTranslations);
      expect(t('common.nonexistent')).toBe('common.nonexistent');
    });
  });

  describe('locale switching', () => {
    it('returns different translations for different locales', () => {
      const tEn = createTranslator('en', testTranslations);
      const tTh = createTranslator('th', testTranslations);
      expect(tEn('common.cancel')).toBe('Cancel');
      expect(tTh('common.cancel')).toBe('ยกเลิก');
    });
  });
});
