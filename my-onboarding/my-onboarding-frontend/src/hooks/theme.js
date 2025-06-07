// src/components/theme.js
import React, { createContext, useContext, useState, useEffect } from 'react';

// Creates a Context for managing the theme.
const ThemeContext = createContext(null);

/**
 * Provides theme state (dark/light) and toggle functionality to its children.
 * Persists theme preference in localStorage.
 *
 * @param {object} props - Component props.
 * @param {React.ReactNode} props.children - Child components to be rendered within the theme context.
 * @returns {JSX.Element} ThemeProvider component.
 */
export const ThemeProvider = ({ children }) => {
  // Initializes theme state from localStorage or defaults to 'light'.
  const [theme, setTheme] = useState(() => localStorage.getItem('theme') || 'light');

  // Applies the theme class to the document element and updates localStorage.
  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      root.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [theme]); // Reruns when the theme changes.

  // Toggles between 'light' and 'dark' themes.
  const toggleTheme = () => {
    setTheme(prevTheme => (prevTheme === 'light' ? 'dark' : 'light'));
  };

  // Provides theme state and toggle function to children via context.
  const contextValue = {
    theme,
    toggleTheme,
  };

  return (
    <ThemeContext.Provider value={contextValue}>
      {children}
    </ThemeContext.Provider>
  );
};

/**
 * Custom hook to consume the theme context.
 *
 * @returns {object} An object containing the current `theme` and the `toggleTheme` function.
 * @throws {Error} If used outside of a ThemeProvider.
 */
export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};