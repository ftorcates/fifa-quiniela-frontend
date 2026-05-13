import type { Config } from 'tailwindcss';

export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Colores "Mundialistas"
        primary: '#8A1538', // Guinda tipo Qatar/Elegante
        secondary: '#EEAB45', // Dorado
      }
    },
  },
  plugins: [],
} satisfies Config;
