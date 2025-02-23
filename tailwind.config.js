/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        background: 'rgb(var(--color-background))',
        text: 'rgb(var(--color-text))',
        'text-secondary': 'rgb(var(--color-text-secondary))',
        surface: 'rgb(var(--color-surface))',
        border: 'rgb(var(--color-border))',
        accent: 'rgb(var(--color-accent))',
      },
      fontFamily: {
        sans: ['var(--font-sans)'],
        serif: ['var(--font-serif)'],
      },
    },
  },
  plugins: [],
} 