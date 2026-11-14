/**
 * SmartBhumi Unified Design Tokens
 *
 * System Design Principles:
 * - Light theme, mobile-first, government-grade calmness and high trust
 * - Primary: Deep Bangladesh Forest Green (#065F46)
 * - Warning: Warm Amber (#D97706)
 * - Tamper / Critical: Red (#DC2626) — strictly reserved for tamper detection
 * - Backgrounds: Clean off-white surfaces (#F8FAF8, #F1F5F1, #FFFFFF)
 * - Spacing: 4px grid scale (4, 8, 12, 16, 20, 24, 32, 40, 48, 64px)
 * - Minimum touch target: 44px x 44px (WCAG 2.1 AA)
 */

export const TOKENS = {
  colors: {
    bg: {
      page: '#f8faf8',
      card: '#ffffff',
      subtle: '#f1f5f1',
      muted: '#e5eae5',
      dark: '#0d2818',
    },
    primary: {
      50: '#ecfdf5',
      100: '#d1fae5',
      200: '#a7f3d0',
      500: '#10b981',
      600: '#059669',
      700: '#047857',
      800: '#065f46', // Primary Brand Color
      900: '#064e3b',
    },
    accent: {
      gold: '#d97706',
      goldLight: '#fef3c7',
      goldDark: '#b45309',
    },
    danger: {
      50: '#fef2f2',
      100: '#fee2e2',
      500: '#ef4444',
      600: '#dc2626', // Tamper Highlight Red
      700: '#b91c1c',
    },
    text: {
      primary: '#0f172a',
      secondary: '#475569',
      muted: '#64748b',
      inverse: '#ffffff',
    },
    border: {
      subtle: '#e2e8f0',
      strong: '#cbd5e1',
      focus: '#047857',
    },
  },
  spacing: {
    1: '4px',
    2: '8px',
    3: '12px',
    4: '16px',
    5: '20px',
    6: '24px',
    8: '32px',
    10: '40px',
    12: '48px',
    16: '64px',
  },
  typography: {
    fonts: {
      sans: "'Noto Sans Bengali', 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
      heading: "'Anek Bangla', 'Noto Sans Bengali', sans-serif",
      mono: "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace",
    },
    sizes: {
      xs: '0.75rem',    // 12px
      sm: '0.875rem',   // 14px
      base: '1rem',     // 16px
      lg: '1.125rem',   // 18px
      xl: '1.25rem',    // 20px
      '2xl': '1.5rem',  // 24px
      '3xl': '1.875rem',// 30px
      '4xl': '2.25rem', // 36px
    },
  },
  radii: {
    sm: '6px',
    md: '10px',
    lg: '16px',
    xl: '24px',
    full: '9999px',
  },
  touch: {
    minSize: '44px',
  },
} as const;

/**
 * Convert numbers/digits to Bengali script when locale is 'bn'.
 */
export function toBanglaDigits(val: string | number, locale: string = 'bn'): string {
  if (locale !== 'bn') return String(val);
  const bnDigits = ['০', '১', '২', '৩', '৪', '৫', '৬', '৭', '৮', '৯'];
  return String(val).replace(/\d/g, (d) => bnDigits[parseInt(d, 10)]);
}

