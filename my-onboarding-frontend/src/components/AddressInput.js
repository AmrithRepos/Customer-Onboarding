// src/components/AddressInput.js
import React from 'react';
import InputField from './InputField'; // Import our reusable InputField

/**
 * Component for collecting address information (street, city, state, zip).
 *
 * @param {Object} props - Component props.
 * @param {Object} props.address - An object containing the current address values (street, city, state, zip).
 * @param {function} props.onAddressChange - Callback function triggered when any address field changes.
 * @returns {JSX.Element} A set of input fields for address collection.
 */
const AddressInput = ({ address, onAddressChange }) => {
  // Handle changes for individual address fields
  const handleChange = (e) => {
    const { id, value } = e.target;
    onAddressChange({
      ...address,
      [id]: value, // Update the specific address field
    });
  };

  return (
    <div>
      <h3 className="text-lg font-semibold text-gray-800 mb-3">Address Information</h3>
      <InputField
        label="Street Address"
        id="street"
        type="text"
        value={address.street || ''} // Provide a default empty string for controlled components
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