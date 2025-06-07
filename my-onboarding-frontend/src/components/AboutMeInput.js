// src/components/AboutMeInput.js
import React from 'react';

/**
 * Renders a textarea for collecting 'About Me' information.
 *
 * @param {object} props - Component props.
 * @param {string} props.value - The current text value.
 * @param {function} props.onChange - Callback for text input changes.
 * @returns {JSX.Element} A textarea input field.
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
        className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline resize-y"
      ></textarea>
    </div>
  );
};

export default AboutMeInput;