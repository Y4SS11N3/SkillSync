module.exports = {
    content: [
      "./src/**/*.{js,jsx,ts,tsx}",
      "./public/index.html",
    ],
    darkMode: 'class',
    theme: {
      extend: {
        colors: {
          primary: {
            light: '#6366f1',
            DEFAULT: '#4f46e5',
            dark: '#4338ca',
          },
          secondary: {
            light: '#f59e0b',
            DEFAULT: '#d97706',
            dark: '#b45309',
          },
          background: {
            light: '#ffffff',
            dark: '#1f2937',
          },
          text: {
            light: '#1f2937',
            dark: '#f3f4f6',
          }
        },
        fontFamily: {
          sans: ['Inter var', 'sans-serif'],
        },
        animation: {
          'pulse-slow': 'pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        }
      },
    },
    plugins: [
      require('@tailwindcss/forms'),
    ],
  }
