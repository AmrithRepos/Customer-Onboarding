// src/components/BirthdateInput.js
import React from 'react';
import InputField from './InputField'; // Import our reusable InputField

/**
 * Component for collecting the user's birthdate.
 *
 * @param {Object} props - Component props.
 * @param {string} props.value - The current value of the birthdate (e.g., "YYYY-MM-DD").
 * @param {function} props.onChange - Callback function triggered when the date changes.
 * @returns {JSX.Element} A date input field for birthdate.
 */
const BirthdateInput = ({ value, onChange }) => {
  return (
    <InputField
      label="Birthdate"
      id="birthdate"
      type="date" // This enables the native date picker
      value={value}
      onChange={onChange}
      required={true}
      // Specific styling if needed, otherwise InputField's default applies
    />
  );
};

export default BirthdateInput;