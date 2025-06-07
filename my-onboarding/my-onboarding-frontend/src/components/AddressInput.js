// src/components/AddressInput.js
import React from 'react';
import InputField from './InputField';

/**
 * Renders a set of input fields for address details (street, city, state, zip).
 *
 * @param {object} props - Component props.
 * @param {object} props.address - Current address values.
 * @param {function} props.onAddressChange - Callback for address field changes.
 * @returns {JSX.Element} Address input form.
 */
const AddressInput = ({ address, onAddressChange }) => {
  // Handles changes to individual address fields, updating the parent state.
  const handleChange = (e) => {
    const { id, value } = e.target;
    onAddressChange({
      ...address,
      [id]: value,
    });
  };

  return (
    <div>
      <h3 className="text-lg font-semibold text-gray-800 mb-3">Address Information</h3>
      <InputField
        label="Street Address"
        id="street"
        type="text"
        value={address.street || ''}
        onChange={handleChange}
        placeholder="123 Main St"
        required={true}
      />
      <InputField
        label="City"
        id="city"
        type="text"
        value={address.city || ''}
        onChange={handleChange}
        placeholder="Anytown"
        required={true}
      />
      <InputField
        label="State"
        id="state"
        type="text"
        value={address.state || ''}
        onChange={handleChange}
        placeholder="CA"
        required={true}
      />
      <InputField
        label="Zip Code"
        id="zip"
        type="text"
        value={address.zip || ''}
        onChange={handleChange}
        placeholder="90210"
        required={true}
      />
    </div>
  );
};

export default AddressInput;