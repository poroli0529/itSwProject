/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",  // ✅ CRA에서 핵심
    "./public/index.html"          // ✅ 혹시 public에서도 클래스가 있다면
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}