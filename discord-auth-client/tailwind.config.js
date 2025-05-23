/** @type {import('tailwindcss').Config} */
export default {
  mode: "jit",
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
    "./node_modules/**/*.js",
  ],
  theme: {
    extend: {
      colors: {
        customPurple: "#6C45E3",
        lightPurple: "#987DE8",
      },
    },
  },
};
