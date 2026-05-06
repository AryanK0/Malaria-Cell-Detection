module.exports = {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      fontFamily: { hanken: ["'Hanken Grotesque'", "sans-serif"] },
      colors: {
        navy: { 950: '#050807', 900: '#0b1513', 800: '#13211f' },
        cyan: { 400: '#5eead4', 500: '#14b8a6', 900: '#134e4a' },
        blue: { 600: '#2563eb', 800: '#1e40af' },
        slate: { 100: '#f0f4ff', 400: '#7b91b0' },
        infected: '#ef4444',
        healthy: '#22c55e',
        teal: { 600: '#0d9488' },
      },
      animation: {
        float: 'float 6s ease-in-out infinite',
        'float-slow': 'float 9s ease-in-out infinite',
        'pulse-glow': 'pulseGlow 2s ease-in-out infinite',
        'count-up': 'countUp 600ms ease-out both',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-20px)' },
        },
        pulseGlow: {
          '0%, 100%': { boxShadow: '0 0 20px rgba(94,234,212,0.28)' },
          '50%': { boxShadow: '0 0 40px rgba(94,234,212,0.58)' },
        },
        countUp: {
          '0%': { opacity: '0', transform: 'translateY(8px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
    },
  },
}
