import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './lib/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        lowfi: {
          cream: '#FAFAF8',
          'slate-dark': '#1F2937',
          'slate-gray': '#6B7280',
        //   teal: '#14B8A6',
           teal: '#1F2937',
          'gray-light': '#E5E7EB',
          white: '#FFFFFF',
          'gray-50': '#F9FAFB',
        },
      },
      fontFamily: {
        urbanist: ['var(--font-urbanist)', 'sans-serif'],
        'dm-sans': ['var(--font-dm-sans)', 'sans-serif'],
      },
    },
  },
  plugins: [],
};

export default config;
