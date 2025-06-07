// src/components/BirthdateInput.js
import React from 'react';
import InputField from './InputField';

/**
 * Renders a date input field for collecting a user's birthdate.
 *
 * @param {object} props - Component props.
 * @param {string} props.value - The current birthdate value (YYYY-MM-DD).
 * @param {function} props.onChange - Callback for date changes.
 * @param {string} [props.validationError] - Optional validation error message.
 * @param {boolean} [props.required=false] - Indicates if the field is required.
 * @returns {JSX.Element} A birthdate input.
 */
const BirthdateInput = ({ value, onChange, validationError, required }) => {

  // Handles the change event from the input, passing the date string to the parent.
  const handleChange = (e) => {
    onChange(e.target.value);
  };

  return (
    <InputField
      label="Birthdate"
      id="birthdate"
      type="date" // Uses native date picker.
      value={value}
      onChange={handleChange}
      required={required}
      validationError={validationError}
      // Sets the maximum selectable date to today.
      max={new Date().toISOString().split('T')[0]}
    />
  );
};

export default BirthdateInput;