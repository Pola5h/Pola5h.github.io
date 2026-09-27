/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./404.html",
    "./blog/**/*.{html,js}",
    "./services/**/*.{html,js}",
    "./assets/js/**/*.js"
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#eef2ff',
          100: '#e0e7ff',
          200: '#c7d2fe',
          300: '#a5b4fc',
          400: '#818cf8',
          500: '#6366f1',
          600: '#4f46e5',
          700: '#4338ca',
          800: '#3730a3',
          900: '#312e81',
          950: '#1e1b4b',
        },
        surface: {
          50: '#f8fafc',
          100: '#f1f5f9',
          200: '#e2e8f0',
          300: '#cbd5e1',
          800: '#161f30',
          850: '#111827',
          900: '#0b0f19',
          950: '#060913',
        }
      },
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', 'Inter', 'system-ui', '-apple-system', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'Fira Code', 'monospace'],
      },
      backgroundImage: {
        'radial-glow-dark': 'radial-gradient(circle at 50% 0%, rgba(99, 102, 241, 0.15), transparent 70%)',
        'radial-glow-light': 'radial-gradient(circle at 50% 0%, rgba(99, 102, 241, 0.10), transparent 70%)',
      },
      typography: (theme) => ({
        DEFAULT: {
          css: {
            color: theme('colors.slate[700]'),
            '--tw-prose-body': theme('colors.slate[700]'),
            '--tw-prose-headings': theme('colors.slate[900]'),
            '--tw-prose-lead': theme('colors.slate[600]'),
            '--tw-prose-links': theme('colors.brand[600]'),
            '--tw-prose-bold': theme('colors.slate[900]'),
            '--tw-prose-counters': theme('colors.slate[500]'),
            '--tw-prose-bullets': theme('colors.slate[400]'),
            '--tw-prose-hr': theme('colors.slate[200]'),
            '--tw-prose-quotes': theme('colors.slate[900]'),
            '--tw-prose-quote-borders': theme('colors.brand[500]'),
            '--tw-prose-captions': theme('colors.slate[500]'),
            '--tw-prose-code': theme('colors.brand[700]'),
            '--tw-prose-pre-code': theme('colors.slate[200]'),
            '--tw-prose-pre-bg': '#0b0f1d',
            '--tw-prose-th-borders': theme('colors.slate[200]'),
            '--tw-prose-td-borders': theme('colors.slate[100]'),
          }
        },
        invert: {
          css: {
            color: theme('colors.slate[300]'),
            '--tw-prose-body': theme('colors.slate[300]'),
            '--tw-prose-headings': '#ffffff',
            '--tw-prose-lead': theme('colors.slate[300]'),
            '--tw-prose-links': theme('colors.brand[400]'),
            '--tw-prose-bold': '#ffffff',
            '--tw-prose-counters': theme('colors.slate[400]'),
            '--tw-prose-bullets': theme('colors.slate[600]'),
            '--tw-prose-hr': 'rgba(255, 255, 255, 0.08)',
            '--tw-prose-quotes': theme('colors.slate[200]'),
            '--tw-prose-quote-borders': theme('colors.brand[500]'),
            '--tw-prose-captions': theme('colors.slate[400]'),
            '--tw-prose-code': theme('colors.brand[300]'),
            '--tw-prose-pre-code': theme('colors.slate[200]'),
            '--tw-prose-pre-bg': '#0b0f1d',
            '--tw-prose-th-borders': 'rgba(255, 255, 255, 0.1)',
            '--tw-prose-td-borders': 'rgba(255, 255, 255, 0.06)',
          }
        }
      })
    },
  },
  plugins: [
    require('@tailwindcss/typography'),
  ],
};
