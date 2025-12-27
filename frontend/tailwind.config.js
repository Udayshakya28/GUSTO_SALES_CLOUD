/** @type {import('tailwindcss').Config} */
module.exports = {
    content: [
      './pages/**/*.{js,ts,jsx,tsx,mdx}',
      './components/**/*.{js,ts,jsx,tsx,mdx}',
      './app/**/*.{js,ts,jsx,tsx,mdx}',
    ],
    darkMode: 'class',
    theme: {
      extend: {
        colors: {
          // Override Tailwind's default orange with cyan
          orange: {
            50: '#e6fffe',
            100: '#ccfffe',
            200: '#99fffd',
            300: '#66fffc',
            400: '#33fffb',
            500: '#11DFFF',
            600: '#0ecbcc',
            700: '#0a9899',
            800: '#076566',
            900: '#033233',
          },
          // Reddit-inspired color palette
          reddit: {
            orange: '#11DFFF',
            'orange-light': '#11DFFF',
            'orange-dark': '#0dcddd',
            'red-light': '#11DFFF',
            background: {
              light: '#ffffff',
              dark: '#1a1a1b',
              card: '#ffffff',
              'card-dark': '#1a1a1b',
            },
            border: {
              light: '#e0e0e0',
              dark: '#343536',
            },
            text: {
              primary: '#222222',
              'primary-dark': '#d7dadc',
              secondary: '#878a8c',
              'secondary-dark': '#818384',
            }
          },
          // Override default colors for consistency
          primary: {
            DEFAULT: '#11DFFF',
            foreground: '#ffffff',
          },
          background: 'hsl(var(--background))',
          foreground: 'hsl(var(--foreground))',
          muted: {
            DEFAULT: 'hsl(var(--muted))',
            foreground: 'hsl(var(--muted-foreground))',
          },
          border: 'hsl(var(--border))',
        },
        backgroundImage: {
          'reddit-gradient': 'linear-gradient(135deg, #11DFFF 0%, #11DFFF 100%)',
          'reddit-gradient-reverse': 'linear-gradient(135deg, #11DFFF 0%, #11DFFF 100%)',
        },
        boxShadow: {
          'reddit': '0 2px 8px rgba(255, 69, 0, 0.06)',
          'reddit-hover': '0 8px 25px rgba(255, 69, 0, 0.15)',
        },
        animation: {
          'slide-up': 'slideUp 0.2s ease-out',
          'slide-down': 'slideDown 0.2s ease-out',
        },
        keyframes: {
          slideUp: {
            '0%': { transform: 'translateY(2px)', opacity: '0' },
            '100%': { transform: 'translateY(0)', opacity: '1' },
          },
          slideDown: {
            '0%': { transform: 'translateY(-2px)', opacity: '0' },
            '100%': { transform: 'translateY(0)', opacity: '1' },
          },
        }
      },
    },
    plugins: [
      require('@tailwindcss/typography'),
      function({ addUtilities }) {
        addUtilities({
          '.reddit-card': {
            backgroundColor: '#ffffff',
            border: '1px solid #e0e0e0',
            borderRadius: '12px',
            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.06)',
            transition: 'all 0.2s ease',
          },
          '.reddit-card:hover': {
            transform: 'translateY(-2px)',
            boxShadow: '0 8px 25px rgba(255, 69, 0, 0.15)',
          },
          '.dark .reddit-card': {
            backgroundColor: '#1a1a1b',
            borderColor: '#343536',
          },
          '.reddit-button': {
            background: 'linear-gradient(135deg, #11DFFF 0%, #11DFFF 100%)',
            color: '#ffffff',
            border: 'none',
            transition: 'all 0.2s ease',
          },
          '.reddit-button:hover': {
            background: 'linear-gradient(135deg, #0dcddd 0%, #0dcddd 100%)',
            transform: 'translateY(-1px)',
          }
        })
      }
    ],
  }
  