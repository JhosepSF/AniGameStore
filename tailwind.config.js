/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        background: "#080910",
        card: "#121422",
        primary: "#ff007f", // Neon Pink
        secondary: "#00f0ff", // Neon Cyan
        accent: "#39ff14", // Neon Green
        warning: "#fff000", // Neon Yellow
        panel: "#16192b",
        "geek-muted": "#868aa8",
        "geek-light": "#f1f3f9"
      },
      boxShadow: {
        'neon-pink': '0 0 10px rgba(255, 0, 127, 0.5), 0 0 20px rgba(255, 0, 127, 0.2)',
        'neon-cyan': '0 0 10px rgba(0, 240, 255, 0.5), 0 0 20px rgba(0, 240, 255, 0.2)',
        'neon-green': '0 0 10px rgba(57, 255, 20, 0.5), 0 0 20px rgba(57, 255, 20, 0.2)',
        'glass': '0 8px 32px 0 rgba(0, 0, 0, 0.37)'
      },
      animation: {
        'glow-pulse': 'glow-pulse 2s infinite alternate',
        'fade-in': 'fadeIn 0.5s ease-out forwards',
        'slide-up': 'slideUp 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards'
      },
      keyframes: {
        'glow-pulse': {
          '0%': { boxShadow: '0 0 5px rgba(255, 0, 127, 0.4), 0 0 10px rgba(255, 0, 127, 0.2)' },
          '100%': { boxShadow: '0 0 15px rgba(255, 0, 127, 0.8), 0 0 30px rgba(255, 0, 127, 0.4)' }
        },
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' }
        },
        slideUp: {
          '0%': { transform: 'translateY(15px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' }
        }
      }
    },
  },
  plugins: [],
}

