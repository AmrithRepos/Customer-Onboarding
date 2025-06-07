// src/components/Button.js
import React from 'react';

/**
 * Reusable button component with customizable properties.
 *
 * @param {object} props - Component props.
 * @param {function} props.onClick - Handler for button click events.
 * @param {React.ReactNode} props.children - Content displayed inside the button.
 * @param {string} [props.type='button'] - HTML button type.
 * @param {string} [props.className] - Additional Tailwind CSS classes.
 * @param {boolean} [props.disabled=false] - If true, the button is disabled.
 * @returns {JSX.Element} A styled button element.
 */
const Button = ({ onClick, children, type = 'button', className = '', disabled = false }) => {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`
        bg-primary-blue-600 hover:bg-primary-blue-700 
        dark:bg-primary-blue-700 dark:hover:bg-primary-blue-800
        text-white font-bold py-2 px-4 rounded 
        focus:outline-none focus:shadow-outline 
        transition-colors duration-200 ease-in-out
        ${className} 
        ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
      `}
    >
      {children}
    </button>
  );
};

export default Button;