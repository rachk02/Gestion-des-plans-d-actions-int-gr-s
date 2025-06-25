/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'nextcloud-blue': '#0082C9',
        'nextcloud-dark': '#1B1F23',
        'sidebar-bg': '#F8F9FA',
        'content-bg': '#FFFFFF',
      },
    },
  },
  plugins: [],
}