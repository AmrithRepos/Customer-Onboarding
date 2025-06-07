// src/components/InputField.js
import React from 'react';

/**
 * Reusable input field component with consistent styling and validation display.
 *
 * @param {object} props - Component props.
 * @param {string} props.label - Text label for the input.
 * @param {string} props.id - Unique ID for the input and its label.
 * @param {string} props.type - HTML input type (e.g., 'text', 'email', 'password').
 * @param {string} props.value - Current value of the input.
 * @param {function} props.onChange - Callback for input value changes.
 * @param {string} [props.placeholder] - Placeholder text for the input.
 * @param {boolean} [props.required] - Indicates if the field is required.
 * @param {string} [props.validationError] - Error message to display.
 * @param {function} [props.onBlur] - Callback for when the input loses focus.
 * @returns {JSX.Element} A styled input field.
 */
const InputField = ({ label, id, type, value, onChange, placeholder, required, validationError, onBlur }) => {
  return (
    <div className="mb-4">
      <label htmlFor={id} className="block text-sm font-medium text-primary-gray-700 mb-1 dark:text-primary-gray-900">
        {label} {required && <span className="text-error-red-600">*</span>}
      </label>
      <input
        type={type}
        id={id}
        name={id}
        value={value}
        onChange={onChange}
        onBlur={onBlur}
        placeholder={placeholder}
        required={required}
        className={`mt-1 block w-full px-4 py-2 border ${
          validationError ? 'border-error-red-400 focus:ring-error-red-500 focus:border-error-red-500' : 'border-primary-gray-300 focus:ring-primary-purple-500 focus:border-primary-purple-500'
        } rounded-xl shadow-sm placeholder-primary-gray-400 focus:outline-none sm:text-sm transition duration-150 ease-in-out dark:bg-white dark:text-primary-gray-900 dark:border-primary-gray-300 dark:placeholder-primary-gray-500`}
      />
      {validationError && (
        <p className="mt-1 text-sm text-error-red-600">{validationError}</p>
      )}
    </div>
  );
};

export default InputField;