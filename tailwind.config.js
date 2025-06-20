/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./layouts/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  darkMode: 'class',
  theme: {
    container: {
      center: true,
      padding: {
        DEFAULT: "1rem",
        sm: "2rem",
        lg: "4rem",
        xl: "5rem",
        "2xl": "6rem",
      },
      screens: {
        sm: "640px",
        md: "768px",
        lg: "1024px",
        xl: "1280px",
        "2xl": "1536px",
      },
    },
    extend: {
      // Matrix Color Palette - Exact specification from prompt.md
      colors: {
        'matrix': {
          50: '#f0fff4',
          100: '#dcfce7',
          200: '#bbf7d0',
          300: '#86efac',
          400: '#4ade80',
          500: '#00ff41',  // Primary matrix green
          600: '#00cc33',  // Secondary matrix green
          700: '#15803d',
          800: '#166534',
          900: '#14532d',
          950: '#052e16',
        },
        'cyber': {
          bg: '#0a0a0a',
          panel: '#111111',
          border: '#1a4a1a',
          text: '#00ff41',
          muted: '#448844',
        },
        'pipboy': {
          green: '#00ff41',
          black: '#0a0a0a',
          amber: '#ffb000',
        },
        'status': {
          online: '#00ff41',
          offline: '#ff3333',
          warning: '#ff8800',
          info: '#0099ff',
        }
      },
      spacing: {
        18: "4.5rem",
        88: "22rem",
        128: "32rem",
        144: "36rem",
      },
      fontFamily: {
        sans: [
          "Inter",
          "ui-sans-serif",
          "system-ui",
          "-apple-system",
          "sans-serif",
        ],
        mono: ['JetBrains Mono', 'monospace'],
        display: ["Inter", "sans-serif"],
      },
      fontSize: {
        xxs: ["0.625rem", { lineHeight: "0.875rem" }],
        xs: ["0.75rem", { lineHeight: "1rem" }],
        sm: ["0.875rem", { lineHeight: "1.25rem" }],
        base: ["1rem", { lineHeight: "1.5rem" }],
        lg: ["1.125rem", { lineHeight: "1.75rem" }],
        xl: ["1.25rem", { lineHeight: "1.75rem" }],
        "2xl": ["1.5rem", { lineHeight: "2rem" }],
        "3xl": ["1.875rem", { lineHeight: "2.25rem" }],
        "4xl": ["2.25rem", { lineHeight: "2.5rem" }],
        "5xl": ["3rem", { lineHeight: "1" }],
        "6xl": ["3.75rem", { lineHeight: "1" }],
        "7xl": ["4.5rem", { lineHeight: "1" }],
        "8xl": ["6rem", { lineHeight: "1" }],
        "9xl": ["8rem", { lineHeight: "1" }],
      },
      letterSpacing: {
        tighter: "-0.05em",
        tight: "-0.025em",
        normal: "0",
        wide: "0.025em",
        wider: "0.05em",
        widest: "0.1em",
        tech: "0.15em",
      },
      lineHeight: {
        "extra-tight": "0.75",
        tight: "1",
        snug: "1.25",
        normal: "1.5",
        relaxed: "1.75",
        loose: "2",
      },
      borderRadius: {
        none: "0",
        sm: "0.125rem",
        base: "0.25rem",
        md: "0.375rem",
        lg: "0.5rem",
        xl: "0.75rem",
        "2xl": "1rem",
        "3xl": "1.5rem",
        tech: "0.75rem",
      },
      // Exact animations from prompt.md specifications
      animation: {
        "fade-in": "fadeIn 0.5s ease-in-out",
        "slide-up": "slideUp 0.3s ease-out",
        "pulse-slow": "pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        "bounce-light": "bounce 2s infinite",
        glow: "glow 2s ease-in-out infinite alternate",
        scan: "scan 4s linear infinite",
        float: "float 3s ease-in-out infinite",
        shimmer: "shimmer 2s linear infinite",
        "pulse-border": "pulseBorder 1.5s ease-in-out infinite",
        // Prompt.md specified animations
        'glitch': 'glitch 0.3s ease-in-out',
        'scan-line': 'scanLine 2s linear infinite',
        'pulse-matrix': 'pulseMatrix 2s ease-in-out infinite',
        'grid-pulse': 'gridPulse 4s ease-in-out infinite alternate',
        // Legacy animations for compatibility
        "pipboy-scan": "pipboyScan 3s linear infinite",
        "pipboy-glow": "pipboyGlow 4s ease-in-out infinite alternate",
        "pipboy-scanline": "scanline 8s linear infinite",
        'jitter': 'jitter 0.3s ease-in-out',
        'text-flicker': 'textFlicker 1.5s ease-in-out infinite',
        'glitch-hover': 'glitchHover 0.3s ease-in-out',
        'card-glitch': 'cardGlitch 0.3s ease-in-out',
        'button-glitch': 'buttonGlitch 0.3s ease-in-out',
        'random-glitch': 'randomGlitch 15s infinite',
        'typewriter': 'typewriter 2s steps(40) infinite',
      },
      keyframes: {
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        slideUp: {
          "0%": { transform: "translateY(20px)", opacity: "0" },
          "100%": { transform: "translateY(0)", opacity: "1" },
        },
        glow: {
          "0%": { filter: "brightness(1) drop-shadow(0 0 5px currentColor)" },
          "100%": { filter: "brightness(1.2) drop-shadow(0 0 10px currentColor)" },
        },
        scan: {
          "0%": { transform: "translateY(-100%)" },
          "100%": { transform: "translateY(100%)" },
        },
        scanline: {
          "0%": { backgroundPosition: "0% 0%" },
          "100%": { backgroundPosition: "0% 100%" },
        },
        float: {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-10px)" },
        },
        shimmer: {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
        pulseBorder: {
          "0%, 100%": { borderColor: "oklch(var(--p) / 0.3)" },
          "50%": { borderColor: "oklch(var(--p))" },
        },
        // Prompt.md specified keyframes
        glitch: {
          "0%": { transform: "translate(0)" },
          "20%": { transform: "translate(-2px, 2px)" },
          "40%": { transform: "translate(-2px, -2px)" },
          "60%": { transform: "translate(2px, 2px)" },
          "80%": { transform: "translate(2px, -2px)" },
          "100%": { transform: "translate(0)" },
        },
        scanLine: {
          "0%": { transform: "translateX(-100%)" },
          "100%": { transform: "translateX(100%)" },
        },
        pulseMatrix: {
          "0%, 100%": { 
            opacity: "1",
            boxShadow: "0 0 0 0 rgba(0, 255, 65, 0.4)"
          },
          "50%": { 
            opacity: "0.7",
            boxShadow: "0 0 0 8px rgba(0, 255, 65, 0)"
          },
        },
        gridPulse: {
          "0%": { 
            backgroundSize: "40px 40px",
            opacity: "0.5"
          },
          "100%": { 
            backgroundSize: "42px 42px",
            opacity: "0.8"
          },
        },
        // Legacy keyframes for compatibility
        pipboyScan: {
          "0%": { 
            transform: "translateY(-100%)",
            opacity: "0.8"
          },
          "50%": {
            opacity: "1"
          },
          "100%": { 
            transform: "translateY(100%)",
            opacity: "0.8"
          },
        },
        pipboyGlow: {
          "0%": { 
            boxShadow: "0 0 20px rgba(0, 255, 0, 0.3), inset 0 0 20px rgba(0, 255, 0, 0.1)"
          },
          "100%": { 
            boxShadow: "0 0 40px rgba(0, 255, 0, 0.6), inset 0 0 40px rgba(0, 255, 0, 0.2)"
          },
        },
        jitter: {
          '0%, 100%': { transform: 'translateX(0) translateY(0)' },
          '10%': { transform: 'translateX(-1px) translateY(-1px)' },
          '20%': { transform: 'translateX(1px) translateY(1px)' },
          '30%': { transform: 'translateX(-1px) translateY(1px)' },
          '40%': { transform: 'translateX(1px) translateY(-1px)' },
          '50%': { transform: 'translateX(-1px) translateY(-1px)' },
          '60%': { transform: 'translateX(1px) translateY(1px)' },
          '70%': { transform: 'translateX(-1px) translateY(1px)' },
          '80%': { transform: 'translateX(1px) translateY(-1px)' },
          '90%': { transform: 'translateX(-1px) translateY(-1px)' },
        },
        textFlicker: {
          '0%, 100%': { opacity: '1', textShadow: '0 0 10px rgb(0 255 65)' },
          '5%': { opacity: '0.9', textShadow: '0 0 15px rgb(0 255 65)' },
          '10%': { opacity: '1', textShadow: '0 0 5px rgb(0 255 65)' },
          '15%': { opacity: '0.95', textShadow: '0 0 20px rgb(0 255 65)' },
          '20%': { opacity: '1', textShadow: '0 0 10px rgb(0 255 65)' },
        },
        glitchHover: {
          '0%, 100%': { transform: 'translateX(0)' },
          '20%': { transform: 'translateX(-2px) translateY(1px)' },
          '40%': { transform: 'translateX(2px) translateY(-1px)' },
          '60%': { transform: 'translateX(-1px) translateY(1px)' },
          '80%': { transform: 'translateX(1px) translateY(-1px)' },
        },
        cardGlitch: {
          '0%, 100%': { transform: 'translateY(-2px)' },
          '25%': { transform: 'translateY(-3px) translateX(1px)' },
          '50%': { transform: 'translateY(-1px) translateX(-1px)' },
          '75%': { transform: 'translateY(-2px) translateX(1px)' },
        },
        buttonGlitch: {
          '0%, 100%': { transform: 'translateX(0)' },
          '20%': { transform: 'translateX(-2px)' },
          '40%': { transform: 'translateX(2px)' },
          '60%': { transform: 'translateX(-1px)' },
          '80%': { transform: 'translateX(1px)' },
        },
        randomGlitch: {
          '0%, 95%': { opacity: '0', transform: 'translateX(0)' },
          '96%': { opacity: '1', transform: 'translateX(-2px)' },
          '97%': { opacity: '0', transform: 'translateX(2px)' },
          '98%': { opacity: '1', transform: 'translateX(-1px)' },
          '99%': { opacity: '0', transform: 'translateX(1px)' },
          '100%': { opacity: '0', transform: 'translateX(0)' },
        },
        typewriter: {
          '0%': { width: '0' },
          '50%': { width: '100%' },
          '100%': { width: '0' },
        },
      },
      boxShadow: {
        "glow-sm": "0 0 4px currentColor",
        glow: "0 0 8px currentColor",
        "glow-lg": "0 0 16px currentColor",
        "glow-xl": "0 0 32px currentColor",
        "inner-glow": "inset 0 0 8px currentColor",
        tech: "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
        "tech-lg":
          "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)",
        modern: "0 4px 12px -4px rgba(0, 0, 0, 0.4), 0 2px 8px -2px rgba(0, 0, 0, 0.3)",
        "modern-lg": "0 8px 24px -8px rgba(0, 0, 0, 0.5), 0 4px 16px -4px rgba(0, 0, 0, 0.4)",
        "pipboy-glow": "0 0 20px rgba(0, 255, 0, 0.4), inset 0 0 20px rgba(0, 255, 0, 0.1)",
        "pipboy-glow-lg": "0 0 40px rgba(0, 255, 0, 0.6), inset 0 0 40px rgba(0, 255, 0, 0.2)",
        "pipboy-glow-xl": "0 0 60px rgba(0, 255, 0, 0.8), inset 0 0 60px rgba(0, 255, 0, 0.3)",
        // Matrix-specific shadows
        "matrix-glow": "0 0 20px rgba(0, 255, 65, 0.4), inset 0 0 20px rgba(0, 255, 65, 0.1)",
        "matrix-glow-lg": "0 0 40px rgba(0, 255, 65, 0.6), inset 0 0 40px rgba(0, 255, 65, 0.2)",
        "matrix": '0 0 20px rgba(0, 255, 65, 0.3)',
        "matrix-lg": '0 0 30px rgba(0, 255, 65, 0.4)',
        "cyber": '0 4px 20px rgba(0, 255, 65, 0.1)',
      },
      backgroundImage: {
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
        "gradient-conic":
          "conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))",
        "modern-gradient": "linear-gradient(135deg, var(--tw-gradient-stops))",
        "mesh-gradient": "radial-gradient(circle at 25% 25%, var(--tw-gradient-stops))",
        // Matrix-specific gradients
        "matrix-gradient": "linear-gradient(135deg, #0a0a0a 0%, #001a0a 25%, #003311 50%, #00cc33 75%, #00ff41 100%)",
        "matrix-gradient-radial": "radial-gradient(circle at center, #003311 0%, #001a0a 50%, #0a0a0a 100%)",
        "matrix-scan": "linear-gradient(90deg, transparent 0%, rgba(0, 255, 65, 0.1) 50%, transparent 100%)",
        "matrix-grid": "linear-gradient(90deg, transparent 49%, rgba(26, 74, 26, 0.3) 50%, transparent 51%), linear-gradient(0deg, transparent 49%, rgba(26, 74, 26, 0.3) 50%, transparent 51%)",
        // Legacy gradients for compatibility
        "pipboy-gradient": "linear-gradient(135deg, #000000 0%, #001a00 25%, #003300 50%, #004d00 75%, #006600 100%)",
        "pipboy-gradient-radial": "radial-gradient(circle at center, #003300 0%, #001a00 50%, #000000 100%)",
        "pipboy-gradient-diagonal": "linear-gradient(45deg, #000000 0%, #001a00 20%, #003300 40%, #004d00 60%, #006600 80%, #008000 100%)",
        "pipboy-scan": "linear-gradient(90deg, transparent 0%, rgba(0, 255, 0, 0.1) 50%, transparent 100%)",
        "scanline-pattern": "repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0, 255, 0, 0.1) 2px, rgba(0, 255, 0, 0.1) 4px)",
      },
      backdropBlur: {
        xs: "2px",
        cyber: '10px',
      },
      textShadow: {
        'matrix': '0 0 10px rgba(0, 255, 65, 0.5)',
        'matrix-lg': '0 0 20px rgba(0, 255, 65, 0.7)',
      },
    },
  },
  plugins: [
    require("@tailwindcss/forms"),
    require("@tailwindcss/typography"),
    require("@tailwindcss/aspect-ratio"),
    require("daisyui"),
    function({ addUtilities }) {
      const newUtilities = {
        '.text-shadow-matrix': {
          textShadow: '0 0 10px rgba(0, 255, 65, 0.5)',
        },
        '.text-shadow-matrix-lg': {
          textShadow: '0 0 20px rgba(0, 255, 65, 0.7)',
        },
        '.border-glow-matrix': {
          boxShadow: '0 0 10px rgba(0, 255, 65, 0.3)',
        },
        '.bg-scan-lines': {
          backgroundImage: 'linear-gradient(0deg, transparent 98%, rgba(0, 255, 65, 0.1) 100%)',
          backgroundSize: '100% 4px',
        },
      }
      addUtilities(newUtilities)
    }
  ],
  daisyui: {
    themes: [
      {
        pipboy: {
          "primary": "#00ff41",
          "primary-focus": "#00cc33",
          "primary-content": "#0a0a0a",
          "secondary": "#00cc33",
          "secondary-focus": "#003311",
          "secondary-content": "#0a0a0a",
          "accent": "#00ff41",
          "accent-focus": "#00cc33",
          "accent-content": "#0a0a0a",
          "neutral": "#111111",
          "neutral-focus": "#0a0a0a",
          "neutral-content": "#00ff41",
          "base-100": "#0a0a0a",
          "base-200": "#111111",
          "base-300": "#1a4a1a",
          "base-content": "#00ff41",
          "info": "#0099ff",
          "info-content": "#0a0a0a",
          "success": "#00ff41",
          "success-content": "#0a0a0a",
          "warning": "#ff8800",
          "warning-content": "#0a0a0a",
          "error": "#ff3333",
          "error-content": "#0a0a0a",
          "--rounded-box": "0",
          "--rounded-btn": "0",
          "--rounded-badge": "0",
          "--animation-btn": "0.3s",
          "--animation-input": "0.3s",
          "--btn-text-case": "uppercase",
          "--btn-focus-scale": "0.98",
          "--border-btn": "1px",
          "--tab-border": "1px",
          "--tab-radius": "0",
        },
        // Matrix theme - exact specification from prompt.md
        matrix: {
          "primary": "#00ff41",
          "primary-focus": "#00cc33",
          "primary-content": "#0a0a0a",
          "secondary": "#00cc33",
          "secondary-focus": "#003311",
          "secondary-content": "#0a0a0a",
          "accent": "#00ff41",
          "accent-focus": "#00cc33",
          "accent-content": "#0a0a0a",
          "neutral": "#111111",
          "neutral-focus": "#0a0a0a",
          "neutral-content": "#00ff41",
          "base-100": "#0a0a0a",
          "base-200": "#111111",
          "base-300": "#1a4a1a",
          "base-content": "#00ff41",
          "info": "#0099ff",
          "info-content": "#0a0a0a",
          "success": "#00ff41",
          "success-content": "#0a0a0a",
          "warning": "#ff8800",
          "warning-content": "#0a0a0a",
          "error": "#ff3333",
          "error-content": "#0a0a0a",
          "--rounded-box": "0",
          "--rounded-btn": "0",
          "--rounded-badge": "0",
          "--animation-btn": "0.3s",
          "--animation-input": "0.3s",
          "--btn-text-case": "uppercase",
          "--btn-focus-scale": "0.98",
          "--border-btn": "1px",
          "--tab-border": "1px",
          "--tab-radius": "0",
        },
      },
    ],
    darkTheme: "matrix",
    base: true,
    styled: true,
    utils: true,
    prefix: "",
    logs: true,
    themeRoot: ":root",
  },
};
