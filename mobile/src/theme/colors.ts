// Mirrors the Tailwind rose/emerald/amber/stone scales used in web/src/app/globals.css,
// so both apps render the exact same brand colors.
export const colors = {
  rose: {
    50: '#fff1f2',
    100: '#ffe4e6',
    400: '#fb7185',
    500: '#f43f5e',
    600: '#e11d48',
    700: '#be123c',
  },
  emerald: {
    50: '#ecfdf5',
    100: '#d1fae5',
    600: '#059669',
    700: '#047857',
  },
  amber: {
    100: '#fef3c7',
    700: '#b45309',
  },
  stone: {
    50: '#fafaf9',
    100: '#f5f5f4',
    200: '#e7e5e4',
    300: '#d6d3d1',
    400: '#a8a29e',
    500: '#78716c',
    600: '#57534e',
    700: '#44403c',
    800: '#292524',
    900: '#1c1917',
  },
  white: '#ffffff',
} as const;
