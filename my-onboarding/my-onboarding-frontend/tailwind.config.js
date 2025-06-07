/** @type {import('tailwindcss').Config} */
module.exports = {
  // Enable dark mode based on the presence of the 'dark' class on the HTML element
  darkMode: 'class',
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Define a custom palette for a more cohesive look

        // Primary Blue (from your input)
        'primary-blue': {
          DEFAULT: '#007AFF', // A standard iOS blue
          '50': '#E6F0FF',
          '100': '#BFDAFF',
          '200': '#99C4FF',
          '300': '#73AFFF',
          '400': '#4D9AFF',
          '500': '#2685FF',
          '600': '#007AFF', // Default
          '700': '#006BD6',
          '800': '#005CA3',
          '900': '#004C7A',
          '950': '#347aeb',
        },
        // Primary Purple (used by your Button.js, re-added for completeness)
        'primary-purple': {
          50: '#F5F3FF',
          100: '#EDE9FE',
          200: '#DDD6FE',
          300: '#C4B5FD',
          400: '#A78BFA',
          500: '#8B5CF6', // Default for buttons
          600: '#7C3AED',
          700: '#6D28D9',
          800: '#5B21B6',
          900: '#4C1D95',
        },
        // Primary Gray (from your input)
        'primary-gray': { // For text, backgrounds, borders
          DEFAULT: '#333333',
          '50': '#F9FAFB',
          '100': '#F3F4F6',
          '200': '#E5E7EB',
          '300': '#D1D5DB',
          '400': '#9CA3AF',
          '500': '#6B7280',
          '600': '#4B5563',
          '700': '#374151',
          '800': '#1F2937',
          '900': '#111827',
        },
        // Success Green (from your input)
        'success-green': {
          DEFAULT: '#34C759', // iOS green
          '50': '#EAFEEF',
          '100': '#D4F7DD',
          '200': '#BFF0C6',
          '300': '#A9E9B0',
          '400': '#94E299',
          '500': '#7FDBC1',
          '600': '#34C759',
          '700': '#2EA34A',
          '800': '#288A3F',
          '900': '#217034',
        },

        'black':{
          '100': '#000000',

        },
        // Error Red (from your input)
        'error-red': {
          DEFAULT: '#FF3B30', // iOS red
          '50': '#FFEAE8',
          '100': '#FFD1CD',
          '200': '#FFB7B1',
          '300': '#FF9E95',
          '400': '#FF857A',
          '500': '#FF6C60',
          '600': '#FF3B30',
          '700': '#D6312C',
          '800': '#A32623',
          '900': '#7A1C1B',
        },
      },
      // Custom shadows for more depth, inspired by iOS (from your input)
      boxShadow: {
        'soft-sm': '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
        'soft-md': '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
        'soft-lg': '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
        'soft-xl': '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
      },
      
    },
  },
  plugins: [],
}