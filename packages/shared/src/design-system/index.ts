/**
 * QodeIA Design System
 * Sistema de diseño unificado para el ecosistema QodeIA
 */

import * as React from 'react';

// ============================================================================
// THEME & TOKENS
// ============================================================================

export const qodeiaTheme = {
  colors: {
    // Brand colors - QodeIA Identity
    primary: {
      DEFAULT: '#0087b1',
      50: '#e6f6fb',
      100: '#ccecf7',
      200: '#99d9ef',
      300: '#66c6e7',
      400: '#33b3df',
      500: '#0087b1',
      600: '#006c8e',
      700: '#00516b',
      800: '#003648',
      900: '#001b25',
    },
    secondary: {
      DEFAULT: '#00cd91',
      50: '#e6faf4',
      100: '#ccf5e9',
      200: '#99ebd3',
      300: '#66e1bd',
      400: '#33d7a7',
      500: '#00cd91',
      600: '#00a474',
      700: '#007b56',
      800: '#005239',
      900: '#00291c',
    },
    dark: {
      DEFAULT: '#192b37',
      50: '#e8eaeb',
      100: '#c5c9cd',
      200: '#8b949b',
      300: '#515f69',
      400: '#2f404d',
      500: '#192b37',
      600: '#15232e',
      700: '#111c25',
      800: '#0d141c',
      900: '#080d13',
    },

    // Semantic colors
    success: {
      DEFAULT: '#10b981',
      light: '#d1fae5',
      dark: '#065f46',
    },
    warning: {
      DEFAULT: '#f59e0b',
      light: '#fef3c7',
      dark: '#92400e',
    },
    error: {
      DEFAULT: '#ef4444',
      light: '#fee2e2',
      dark: '#991b1b',
    },
    info: {
      DEFAULT: '#3b82f6',
      light: '#dbeafe',
      dark: '#1e40af',
    },

    // Neutral colors
    white: '#ffffff',
    black: '#000000',
    gray: {
      50: '#f9fafb',
      100: '#f3f4f6',
      200: '#e5e7eb',
      300: '#d1d5db',
      400: '#9ca3af',
      500: '#6b7280',
      600: '#4b5563',
      700: '#374151',
      800: '#1f2937',
      900: '#111827',
    },
  },

  fonts: {
    heading: 'Inter, system-ui, -apple-system, sans-serif',
    body: 'Inter, system-ui, -apple-system, sans-serif',
    mono: 'JetBrains Mono, Fira Code, Consolas, monospace',
  },

  fontSizes: {
    xs: '0.75rem',    // 12px
    sm: '0.875rem',   // 14px
    base: '1rem',     // 16px
    lg: '1.125rem',   // 18px
    xl: '1.25rem',    // 20px
    '2xl': '1.5rem',  // 24px
    '3xl': '1.875rem', // 30px
    '4xl': '2.25rem',  // 36px
    '5xl': '3rem',     // 48px
  },

  fontWeights: {
    normal: 400,
    medium: 500,
    semibold: 600,
    bold: 700,
  },

  lineHeights: {
    tight: 1.25,
    normal: 1.5,
    relaxed: 1.75,
  },

  spacing: {
    0: '0',
    1: '0.25rem',   // 4px
    2: '0.5rem',    // 8px
    3: '0.75rem',   // 12px
    4: '1rem',      // 16px
    5: '1.25rem',   // 20px
    6: '1.5rem',    // 24px
    8: '2rem',      // 32px
    10: '2.5rem',   // 40px
    12: '3rem',     // 48px
    16: '4rem',     // 64px
    20: '5rem',     // 80px
    24: '6rem',     // 96px
  },

  borderRadius: {
    none: '0',
    sm: '0.25rem',   // 4px
    DEFAULT: '0.5rem', // 8px
    md: '0.5rem',
    lg: '0.75rem',   // 12px
    xl: '1rem',      // 16px
    '2xl': '1.5rem', // 24px
    full: '9999px',
  },

  shadows: {
    none: 'none',
    sm: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
    DEFAULT: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
    md: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
    lg: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
    xl: '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)',
    '2xl': '0 25px 50px -12px rgb(0 0 0 / 0.25)',
    inner: 'inset 0 2px 4px 0 rgb(0 0 0 / 0.05)',
  },

  transitions: {
    fast: '150ms ease-in-out',
    DEFAULT: '200ms ease-in-out',
    slow: '300ms ease-in-out',
    'slower': '500ms ease-in-out',
  },

  breakpoints: {
    sm: '640px',
    md: '768px',
    lg: '1024px',
    xl: '1280px',
    '2xl': '1536px',
  },

  zIndex: {
    0: 0,
    10: 10,
    20: 20,
    30: 30,
    40: 40,
    50: 50,
    dropdown: 1000,
    sticky: 1100,
    fixed: 1200,
    modal: 1300,
    popover: 1400,
    tooltip: 1500,
  },
} as const;

export type Theme = typeof qodeiaTheme;

// ============================================================================
// BASE COMPONENT PROPS
// ============================================================================

export interface BaseProps {
  className?: string;
  children?: React.ReactNode;
  disabled?: boolean;
  onClick?: () => void;
}

export interface VariantProps {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
}

// ============================================================================
// BUTTON COMPONENT
// ============================================================================

export interface ButtonProps extends BaseProps, VariantProps {
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  fullWidth?: boolean;
}

export function createButtonStyles(variant: string = 'primary', size: string = 'md') {
  const baseStyles = `
    inline-flex items-center justify-center font-medium rounded-lg
    transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2
    disabled:opacity-50 disabled:cursor-not-allowed
  `;

  const variantStyles: Record<string, string> = {
    primary: `
      bg-primary text-white hover:bg-primary-600 focus:ring-primary-500
      active:bg-primary-700
    `,
    secondary: `
      bg-secondary text-white hover:bg-secondary-600 focus:ring-secondary-500
      active:bg-secondary-700
    `,
    outline: `
      border-2 border-primary text-primary hover:bg-primary hover:text-white
      focus:ring-primary-500
    `,
    ghost: `
      text-gray-600 hover:bg-gray-100 focus:ring-gray-500
    `,
    danger: `
      bg-error text-white hover:bg-error-dark focus:ring-error
      active:bg-error-dark
    `,
  };

  const sizeStyles: Record<string, string> = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-base',
    lg: 'px-6 py-3 text-lg',
  };

  return `${baseStyles} ${variantStyles[variant] || variantStyles.primary} ${sizeStyles[size] || sizeStyles.md}`;
}

// ============================================================================
// CARD COMPONENT
// ============================================================================

export interface CardProps extends BaseProps {
  variant?: 'default' | 'outlined' | 'elevated';
  padding?: 'none' | 'sm' | 'md' | 'lg';
}

export function createCardStyles(variant: string = 'default', padding: string = 'md') {
  const baseStyles = 'rounded-xl';

  const variantStyles: Record<string, string> = {
    default: 'bg-white shadow-sm border border-gray-100',
    outlined: 'bg-white border-2 border-gray-200',
    elevated: 'bg-white shadow-lg',
  };

  const paddingStyles: Record<string, string> = {
    none: '',
    sm: 'p-3',
    md: 'p-4',
    lg: 'p-6',
  };

  return `${baseStyles} ${variantStyles[variant] || variantStyles.default} ${paddingStyles[padding] || paddingStyles.md}`;
}

// ============================================================================
// INPUT COMPONENT
// ============================================================================

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export function createInputStyles(hasError: boolean = false, isDisabled: boolean = false) {
  const baseStyles = `
    w-full px-4 py-2 rounded-lg border transition-colors duration-200
    focus:outline-none focus:ring-2 focus:ring-offset-0
    disabled:opacity-50 disabled:cursor-not-allowed
  `;

  const stateStyles = hasError
    ? 'border-error focus:border-error focus:ring-error/20'
    : 'border-gray-300 focus:border-primary focus:ring-primary/20';

  return `${baseStyles} ${stateStyles}`;
}

// ============================================================================
// LAYOUT UTILITIES
// ============================================================================

export const layout = {
  container: 'container mx-auto px-4 sm:px-6 lg:px-8',
  flex: 'flex',
  grid: 'grid',
  stack: 'flex flex-col',
  center: 'flex items-center justify-center',
} as const;

// ============================================================================
// TYPOGRAPHY UTILITIES
// ============================================================================

export const typography = {
  heading: {
    h1: 'text-4xl font-bold text-dark',
    h2: 'text-3xl font-bold text-dark',
    h3: 'text-2xl font-semibold text-dark',
    h4: 'text-xl font-semibold text-dark',
    h5: 'text-lg font-medium text-dark',
    h6: 'text-base font-medium text-dark',
  },
  body: {
    large: 'text-lg text-gray-700',
    base: 'text-base text-gray-700',
    small: 'text-sm text-gray-600',
    xs: 'text-xs text-gray-500',
  },
  code: 'font-mono text-sm bg-gray-100 px-2 py-1 rounded',
} as const;

// ============================================================================
// ANIMATION UTILITIES
// ============================================================================

export const animations = {
  fadeIn: 'animate-fade-in',
  slideUp: 'animate-slide-up',
  slideDown: 'animate-slide-down',
  pulse: 'animate-pulse',
  spin: 'animate-spin',
  bounce: 'animate-bounce',
} as const;

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

export function cn(...classes: (string | undefined | null | false)[]): string {
  return classes.filter(Boolean).join(' ');
}

export function getColorClass(color: keyof typeof qodeiaTheme.colors, shade: number = 500): string {
  const colorValue = qodeiaTheme.colors[color];
  if (typeof colorValue === 'object' && colorValue !== null) {
    return colorValue[shade as keyof typeof colorValue] as string;
  }
  return colorValue as string;
}

// ============================================================================
// DEFAULT EXPORT
// ============================================================================

export const designSystem = {
  theme: qodeiaTheme,
  layout,
  typography,
  animations,
  utils: {
    cn,
    getColorClass,
    createButtonStyles,
    createCardStyles,
    createInputStyles,
  },
};

export default designSystem;
