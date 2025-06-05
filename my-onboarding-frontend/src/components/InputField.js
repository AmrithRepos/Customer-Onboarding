// src/components/InputField.js
import React from 'react';

const InputField = ({ label, id, type, value, onChange, placeholder, required, validationError, onBlur }) => {
  return (
    <div className="mb-4">
      <label htmlFor={id} className="block text-sm font-medium text-primary-gray-700 mb-1">
        {label} {required && <span className="text-error-red-600">*</span>}
      </label>
      <input
        type={type}
        id={id}
        name={id}
        value={value}
        onChange={onChange}
        onBlur={onBlur} // Add onBlur prop
        placeholder={placeholder}
        required={required}
        className={`mt-1 block w-full px-4 py-2 border ${
          validationError ? 'border-error-red-400 focus:ring-error-red-500 focus:border-error-red-500' : 'border-primary-gray-300 focus:ring-primary-purple-500 focus:border-primary-purple-500'
        } rounded-xl shadow-sm placeholder-primary-gray-400 focus:outline-none sm:text-sm transition duration-150 ease-in-out`}
      />
      {validationError && (
        <p className="mt-1 text-sm text-error-red-600">{validationError}</p>
      )}
    </div>
  );
};

export default InputField;