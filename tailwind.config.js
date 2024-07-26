module.exports = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',

    './node_modules/flowbite/**/*.js',

    // Or if using `src` directory:
    './src/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    container: {
      padding: {
        DEFAULT: '0px',
      },
    },
    screens: {
      sm: '280px',
      sm2: '350px',
      md: '768px',
      lg: '960px',
      xl: '1350px',
    },
    extend: {
      colors: {
        primary: '#131424',
        secondary: '#393A47',
        accent: '#d23c41',
        teal: '#008080',
        yellowpr: '#fba417',
        whitett: '#FFFFFF',
        oceantt: '#92b2a3',
        orangett: '#fe5809',
        roadtt: '#372929',
        browntt: '#393535',
        browntt2: '#1a140b',
        test_c: '#191f22',
        test_c2: '#3e3b45',
      },
      backgroundImage: {
        bg_login: 'url("/")',
      },
      animation: {
        'spin-slow': 'spin 8s linear infinite',
        'shadow-pulse': 'shadowPulse 2.5s infinite',
        'sm-shadow-pulse': 'smshadowPulse 2.5s infinite',
        'new-wiggle': 'wiggle 1s ease-in-out infinite',
      },
      fontFamily: {
        poppins: [`var(--font-poppins)`, 'sans-serif'],
        sora: [`var(--font-sora)`, 'sans-serif'],
        roboto: [`var(--font-roboto)`, 'sans-serif'],
      },
      keyframes: {
        shadowPulse: {
          '50%': {
            boxShadow: '0px 0px 20px rgba(0, 30, 30, 0.3)',
          },
        },
      },
    },
  },
  container: {
    padding: {
      DEFAULT: '15px',
    },
  },
  plugins: [require('tailwind-scrollbar'),
            require('flowbite/plugin'),
  ],
};
