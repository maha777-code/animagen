/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{js,ts,jsx,tsx,mdx}'],
  theme: {
    extend: {
      colors: {
        animagen: {
          50: '#f0f4ff',
          100: '#dbe4ff',
          500: '#4f46e5',
          600: '#4338ca',
          900: '#1e1b4b',
        },
      },
    },
  },
  plugins: [],
};
