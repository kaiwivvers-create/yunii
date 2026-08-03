import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // Light theme colors (existing)
        'slate-900': '#0f172a',
        'slate-800': '#1e293b',
        'slate-600': '#475569',
        'slate-500': '#64748b',
        'slate-400': '#94a3b8',
        'slate-300': '#cbd5e1',
        'slate-200': '#e2e8f0',
        'slate-100': '#f1f5f9',
        'slate-50': '#f8fafc',
        
        // Custom purple colors
        'purple-dark': '#7B68EE',
        'purple-light': '#9370DB',
        
        // Dark theme colors (black and violet)
        'dark-bg': '#0a0a0a',
        'dark-bg-secondary': '#1a1a1a',
        'dark-bg-tertiary': '#2a2a2a',
        'dark-text': '#e0e0e0',
        'dark-text-secondary': '#b0b0b0',
        'dark-border': '#3a3a3a',
        'dark-violet': '#8B5CF6',
        'dark-violet-hover': '#7C3AED',
        'dark-violet-light': '#A78BFA',
      },
      animation: {
        'fade-in': 'fadeIn 0.3s ease-in',
        'fade-in-down': 'fadeInDown 0.3s ease-out',
        'fade-in-right': 'fadeInRight 0.3s ease-out',
        'float-1': 'float1 6s ease-in-out infinite',
        'float-2': 'float2 8s ease-in-out infinite',
        'float-3': 'float3 7s ease-in-out infinite',
        'float-4': 'float4 9s ease-in-out infinite',
        'float-5': 'float5 5s ease-in-out infinite',
        'float-6': 'float6 6s ease-in-out infinite',
        'float-7': 'float7 8s ease-in-out infinite',
        'float-8': 'float8 7s ease-in-out infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        fadeInDown: {
          '0%': { opacity: '0', transform: 'translateY(-10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        fadeInRight: {
          '0%': { opacity: '0', transform: 'translateX(10px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
        float1: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-20px)' },
        },
        float2: {
          '0%, 100%': { transform: 'translateY(0px) rotate(0deg)' },
          '50%': { transform: 'translateY(-15px) rotate(5deg)' },
        },
        float3: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-25px)' },
        },
        float4: {
          '0%, 100%': { transform: 'translateY(0px) rotate(0deg)' },
          '50%': { transform: 'translateY(-18px) rotate(-5deg)' },
        },
        float5: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-22px)' },
        },
        float6: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-16px)' },
        },
        float7: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-20px)' },
        },
        float8: {
          '0%, 100%': { transform: 'translateY(0px) rotate(0deg)' },
          '50%': { transform: 'translateY(-14px) rotate(3deg)' },
        },
      },
    },
  },
  plugins: [],
};

export default config;
