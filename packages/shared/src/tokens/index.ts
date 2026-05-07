// HSL Design Tokens para QodeIA

export const colors = {
  primary: {
    50: 'hsl(220 90% 95%)',
    100: 'hsl(220 85% 90%)',
    200: 'hsl(220 80% 85%)',
    300: 'hsl(220 75% 75%)',
    400: 'hsl(220 70% 65%)',
    500: 'hsl(220 65% 55%)',
    600: 'hsl(220 60% 45%)',
    700: 'hsl(220 55% 35%)',
    800: 'hsl(220 50% 25%)',
    900: 'hsl(220 45% 15%)',
  },
  secondary: {
    50: 'hsl(160 60% 95%)',
    100: 'hsl(160 55% 90%)',
    200: 'hsl(160 50% 85%)',
    300: 'hsl(160 45% 75%)',
    400: 'hsl(160 40% 65%)',
    500: 'hsl(160 35% 55%)',
    600: 'hsl(160 30% 45%)',
    700: 'hsl(160 25% 35%)',
    800: 'hsl(160 20% 25%)',
    900: 'hsl(160 15% 15%)',
  },
  neutral: {
    50: 'hsl(0 0% 98%)',
    100: 'hsl(0 0% 96%)',
    200: 'hsl(0 0% 90%)',
    300: 'hsl(0 0% 80%)',
    400: 'hsl(0 0% 65%)',
    500: 'hsl(0 0% 50%)',
    600: 'hsl(0 0% 40%)',
    700: 'hsl(0 0% 30%)',
    800: 'hsl(0 0% 20%)',
    900: 'hsl(0 0% 10%)',
  },
  success: {
    light: 'hsl(145 60% 90%)',
    main: 'hsl(145 50% 40%)',
    dark: 'hsl(145 50% 30%)',
  },
  warning: {
    light: 'hsl(38 90% 90%)',
    main: 'hsl(38 80% 50%)',
    dark: 'hsl(38 80% 35%)',
  },
  error: {
    light: 'hsl(0 70% 90%)',
    main: 'hsl(0 60% 50%)',
    dark: 'hsl(0 60% 35%)',
  },
  info: {
    light: 'hsl(210 80% 90%)',
    main: 'hsl(210 60% 50%)',
    dark: 'hsl(210 60% 35%)',
  },
} as const;

export const spacing = {
  0: '0',
  0.5: '0.125rem',
  1: '0.25rem',
  1.5: '0.375rem',
  2: '0.5rem',
  2.5: '0.625rem',
  3: '0.75rem',
  3.5: '0.875rem',
  4: '1rem',
  5: '1.25rem',
  6: '1.5rem',
  7: '1.75rem',
  8: '2rem',
  9: '2.25rem',
  10: '2.5rem',
  12: '3rem',
  14: '3.5rem',
  16: '4rem',
  20: '5rem',
  24: '6rem',
  28: '7rem',
  32: '8rem',
  36: '9rem',
  40: '10rem',
  48: '12rem',
  56: '14rem',
  64: '16rem',
  80: '20rem',
  96: '24rem',
} as const;

export const typography = {
  fontFamily: {
    sans: 'ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    mono: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace',
    serif: 'ui-serif, Georgia, Cambria, "Times New Roman", Times, serif',
  },
  fontSize: {
    xs: ['0.75rem', { lineHeight: '1rem' }],
    sm: ['0.875rem', { lineHeight: '1.25rem' }],
    base: ['1rem', { lineHeight: '1.5rem' }],
    lg: ['1.125rem', { lineHeight: '1.75rem' }],
    xl: ['1.25rem', { lineHeight: '1.75rem' }],
    '2xl': ['1.5rem', { lineHeight: '2rem' }],
    '3xl': ['1.875rem', { lineHeight: '2.25rem' }],
    '4xl': ['2.25rem', { lineHeight: '2.5rem' }],
    '5xl': ['3rem', { lineHeight: '1' }],
    '6xl': ['3.75rem', { lineHeight: '1' }],
  },
  fontWeight: {
    light: '300',
    normal: '400',
    medium: '500',
    semibold: '600',
    bold: '700',
    extrabold: '800',
    black: '900',
  },
} as const;

export const radii = {
  none: '0',
  sm: '0.125rem',
  DEFAULT: '0.25rem',
  md: '0.375rem',
  lg: '0.5rem',
  xl: '0.75rem',
  '2xl': '1rem',
  full: '9999px',
} as const;

export const shadows = {
  xs: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
  sm: '0 1px 3px 0 rgb(0 0 0 / 0.1)',
  DEFAULT: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
  md: '0 10px 15px -3px rgb(0 0 0 / 0.1)',
  lg: '0 20px 25px -5px rgb(0 0 0 / 0.1)',
  xl: '0 25px 50px -12px rgb(0 0 0 / 0.25)',
  '2xl': '0 25px 50px -12px rgb(0 0 0 / 0.5)',
  inner: 'inset 0 2px 4px 0 rgb(0 0 0 / 0.05)',
  none: 'none',
} as const;

export const tokens = {
  colors,
  spacing,
  typography,
  radii,
  shadows,
} as const;

export type Tokens = typeof tokens;
export default tokens;