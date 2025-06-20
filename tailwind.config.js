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
        mono: ["JetBrains Mono", "ui-monospace", "monospace"],
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
        "pipboy-scan": "pipboyScan 3s linear infinite",
        "pipboy-glow": "pipboyGlow 4s ease-in-out infinite alternate",
        "pipboy-scanline": "scanline 8s linear infinite",
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
      },
      backgroundImage: {
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
        "gradient-conic":
          "conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))",
        "modern-gradient": "linear-gradient(135deg, var(--tw-gradient-stops))",
        "mesh-gradient": "radial-gradient(circle at 25% 25%, var(--tw-gradient-stops))",
        "pipboy-gradient": "linear-gradient(135deg, #000000 0%, #001a00 25%, #003300 50%, #004d00 75%, #006600 100%)",
        "pipboy-gradient-radial": "radial-gradient(circle at center, #003300 0%, #001a00 50%, #000000 100%)",
        "pipboy-gradient-diagonal": "linear-gradient(45deg, #000000 0%, #001a00 20%, #003300 40%, #004d00 60%, #006600 80%, #008000 100%)",
        "pipboy-scan": "linear-gradient(90deg, transparent 0%, rgba(0, 255, 0, 0.1) 50%, transparent 100%)",
        "scanline-pattern": "repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0, 255, 0, 0.1) 2px, rgba(0, 255, 0, 0.1) 4px)",
      },
      backdropBlur: {
        xs: "2px",
      },
    },
  },
  plugins: [
    require("@tailwindcss/forms"),
    require("@tailwindcss/typography"),
    require("@tailwindcss/aspect-ratio"),
    require("daisyui"),
  ],
  daisyui: {
    themes: [
      {
        pipboy: {
          // Classic Pip-Boy Theme - Back to Basics
          primary: "#00ff00",          // Bright Pip-Boy green
          "primary-focus": "#33ff33",   // Lighter green for focus
          "primary-content": "#000000",   // Black text on green

          secondary: "#00dd00",       // Slightly darker green
          "secondary-focus": "#00bb00",
          "secondary-content": "#000000",

          accent: "#00ff00",
          "accent-focus": "#33ff33",
          "accent-content": "#000000",

          // Neutral colors - pure black for high contrast
          neutral: "#000000",
          "neutral-focus": "#1c1c1c", // very dark grey
          "neutral-content": "#00ff00", // Green text

          // Background layers - solid black for true Pip-Boy feel
          "base-100": "#000000",
          "base-200": "#080808",
          "base-300": "#101010",
          "base-content": "#00ff00",

          // Status colors
          info: "#00ff00",
          "info-content": "#000000",
          success: "#00ff00",
          "success-content": "#000000",
          warning: "#00dd00",
          "warning-content": "#000000",
          error: "#ff0000",
          "error-content": "#000000",

          // Component styling - Sharp and functional
          "--rounded-box": "0rem",
          "--rounded-btn": "0rem",
          "--rounded-badge": "0rem",
          "--animation-btn": "0.1s",
          "--animation-input": "0.1s",
          "--btn-text-case": "uppercase",
          "--navbar-padding": "0.5rem",
          "--tab-radius": "0rem",
        },
      },
    ],
    darkTheme: "pipboy",
    base: true,
    styled: true,
    utils: true,
    rtl: false,
    prefix: "",
    logs: false,
  },
};
