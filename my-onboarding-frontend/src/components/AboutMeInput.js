// src/components/AboutMeInput.js
import React from 'react';
import InputField from './InputField'; // Import our reusable InputField

/**
 * Component for collecting "About Me" text from the user.
 * It uses a textarea, but we can reuse InputField's styling principles.
 *
 * @param {Object} props - Component props.
 * @param {string} props.value - The current value of the "About Me" text.
 * @param {function} props.onChange - Callback function triggered when the text changes.
 * @returns {JSX.Element} A text area for "About Me".
 */
const AboutMeInput = ({ value, onChange }) => {
  return (
    <div className="mb-4">
      <label htmlFor="aboutMe" className="block text-gray-700 text-sm font-bold mb-2">
        About Me
      </label>
      <textarea
        id="aboutMe"
        name="aboutMe"
        value={value}
        onChange={onChange}
        placeholder="Tell us a little about yourself..."
        rows="4" // Sets the visible height of the text area
        // Tailwind CSS classes for styling, similar to InputField
        className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline resize-y"
      ></textarea>
    </div>
  );
};

export default AboutMeInput;