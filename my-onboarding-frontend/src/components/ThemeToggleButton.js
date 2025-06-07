// src/components/ThemeToggleButton.js
import React from 'react';
import { useTheme } from '../hooks/theme';
import Button from './Button';

/**
 * A floating action button that allows users to toggle between light and dark themes.
 * It displays an icon and text indicating the current theme and the theme to switch to.
 *
 * @returns {JSX.Element} A button to toggle the theme.
 */
const ThemeToggleButton = () => {
  const { theme, toggleTheme } = useTheme();

  return (
    <Button
      onClick={toggleTheme}
      className="fixed bottom-4 right-4 p-3 rounded-full shadow-lg z-50"
    >
      {theme === 'light' ? (
        <span role="img" aria-label="Dark mode">🌙</span> // Moon icon for dark mode
      ) : (
        <span role="img" aria-label="Light mode">☀️</span> // Sun icon for light mode
      )}
      <span className="ml-2 hidden sm:inline-block">
        {theme === 'light' ? 'Dark Mode' : 'Light Mode'}
      </span>
    </Button>
  );
};

export default ThemeToggleButton;