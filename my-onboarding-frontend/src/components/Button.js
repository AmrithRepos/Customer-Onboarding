// src/components/Button.js
import React from 'react';

/**
 * Reusable button component.
 *
 * @param {Object} props - Component props.
 * @param {function} props.onClick - Callback function triggered when the button is clicked.
 * @param {React.ReactNode} props.children - The content to be rendered inside the button (e.g., text, icon).
 * @param {string} [props.type='button'] - The HTML 'type' attribute for the button (e.g., 'submit', 'button', 'reset').
 * @param {string} [props.className] - Optional additional Tailwind CSS classes for custom styling.
 * @param {boolean} [props.disabled=false] - Optional boolean to disable the button.
 * @returns {JSX.Element} A styled button.
 */
const Button = ({ onClick, children, type = 'button', className = '', disabled = false }) => {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      // Tailwind CSS classes for consistent styling
      className={`bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline ${className} ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
    >
      {children}
    </button>
  );
};

export default Button;