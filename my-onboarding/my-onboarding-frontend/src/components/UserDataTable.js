// src/components/UserDataTable.js
import React, { useState, useEffect, useCallback } from 'react';
import { useOnboarding } from '../hooks/useOnboarding';

/**
 * Helper function to capitalize the first letter of a string
 * and convert camelCase to Title Case (e.g., 'aboutMe' -> 'About Me').
 * @param {string} string - The input string.
 * @returns {string} The formatted string.
 */
const capitalizeFirstLetter = (string) => {
  if (!string) return '';
  return string
    .replace(/([A-Z])/g, ' $1') // Add a space before capital letters.
    .replace(/^./, (str) => str.toUpperCase()) // Capitalize the first letter.
    .trim(); // Remove leading space if any.
};

/**
 * Displays a table of registered users with their details and provides options to view and delete them.
 */
const UserDataTable = () => {
  const {
    getAllUsersData,
    deleteUser,
    loading: hookLoading,
    error: hookError,
    userListRefreshCounter
  } = useOnboarding();

  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedUser, setSelectedUser] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);

  /**
   * Helper function to flatten nested user data for display.
   * @param {object} userData - The user data object from the API.
   * @returns {object} A flattened object with display-friendly keys and values.
   */
  const flattenUserData = (userData) => {
    const flattened = {
      'User ID': userData.id || 'N/A',
      'Username': userData.username || 'N/A',
      'Email': userData.email || 'N/A',
      'Age': userData.age || 'N/A',
      'Created At': userData.created_at ? new Date(userData.created_at).toLocaleString() : 'N/A',
      'Updated At': userData.updated_at ? new Date(userData.updated_at).toLocaleString() : 'N/A',
    };

    // Processes onboarding data, handling both object and stringified JSON formats.
    if (userData.onboardingData && typeof userData.onboardingData === 'object') {
      for (const key in userData.onboardingData) {
        const value = userData.onboardingData[key];
        if (typeof value === 'object' && value !== null) {
          for (const subKey in value) {
            const displaySubKey = capitalizeFirstLetter(subKey);
            flattened[`${capitalizeFirstLetter(key)} ${displaySubKey}`] = value[subKey] || 'N/A';
          }
        } else {
          const displayKey = capitalizeFirstLetter(key);
          flattened[displayKey] = value || 'N/A';
        }
      }
    } else if (typeof userData.onboardingData === 'string') {
      try {
        const parsedOnboardingData = JSON.parse(userData.onboardingData);
        if (typeof parsedOnboardingData === 'object' && parsedOnboardingData !== null) {
          for (const key in parsedOnboardingData) {
            const value = parsedOnboardingData[key];
            if (typeof value === 'object' && value !== null) {
              for (const subKey in value) {
                const displaySubKey = capitalizeFirstLetter(subKey);
                flattened[`${capitalizeFirstLetter(key)} ${displaySubKey}`] = value[subKey] || 'N/A';
              }
            } else {
              const displayKey = capitalizeFirstLetter(key);
              flattened[displayKey] = value || 'N/A';
            }
          }
        }
      } catch (e) {
        console.error("Failed to parse onboardingData string:", e);
      }
    }
    return flattened;
  };

  // Fetches user data from the backend.
  const fetchUsers = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getAllUsersData();
      if (Array.isArray(data)) {
        setUsers(data);
      } else {
        setUsers([]);
        setError("Fetched data is not an array.");
      }
    } catch (err) {
      console.error("Failed to fetch users:", err);
      setError(err.message);
      setUsers([]);
    } finally {
      setLoading(false);
    }
  }, [getAllUsersData]);

  // Effect hook to fetch users on component mount or when userListRefreshCounter changes.
  useEffect(() => {
    fetchUsers();
    // Clears success message after a delay.
    const timer = setTimeout(() => {
      setSuccessMessage(null);
    }, 5000);
    return () => clearTimeout(timer); // Cleans up the timer.
  }, [userListRefreshCounter, fetchUsers]);

  const overallLoading = loading || hookLoading;

  // Renders loading state.
  if (overallLoading) return <div className="text-center py-4">Loading users...</div>;
  // Renders error state.
  if (error || hookError) return <div className="text-center py-4 text-red-600">Error: {error || hookError}</div>;

  // Renders message when no users are registered.
  if (users.length === 0) {
    return (
      <div className="bg-white p-4 sm:p-8 rounded-xl shadow-lg border border-primary-gray-100 max-w-4xl mx-auto my-4 sm:my-8">
        <h2 className="text-2xl sm:text-3xl font-extrabold text-primary-gray-800 mb-4 sm:mb-6 text-center">Registered Users Data</h2>
        <p className="text-center text-primary-gray-600 text-base sm:text-lg">No users registered yet.</p>
        <p className="text-xs sm:text-sm text-primary-gray-500 mt-2 sm:mt-4 text-center">
          Click on a "User ID" to view full details. Data refreshes automatically when a new user is registered or a user is deleted.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white p-4 sm:p-8 rounded-xl shadow-lg border border-primary-gray-100 max-w-4xl mx-auto my-4 sm:my-8">
      <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-700 mb-4 sm:mb-6 text-center">Registered Users Data</h2>

      {/* Displays success messages */}
      {successMessage && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative mb-4" role="alert">
          <strong className="font-bold">Success!</strong>
          <span className="block sm:inline"> {successMessage}</span>
          <span className="absolute top-0 bottom-0 right-0 px-4 py-3" onClick={() => setSuccessMessage(null)}>
            <svg className="fill-current h-6 w-6 text-green-500" role="button" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><title>Close</title><path d="M14.348 14.849a1.2 1.2 0 0 1-1.697 0L10 11.697l-2.651 2.652a1.2 1.2 0 1 1-1.697-1.697L8.303 10 5.651 7.348a1.2 1.2 0 1 1 1.697-1.697L10 8.303l2.651-2.652a1.2 1.2 0 1 1 1.697 1.697L11.697 10l2.652 2.651a1.2 1.2 0 0 1 0 1.698z"/></svg>
          </span>
        </div>
      )}

      <div className="overflow-x-auto">
        <table className="min-w-full bg-white rounded-lg overflow-hidden">
          <thead className="bg-primary-blue-950 text-black-100 uppercase text-xs sm:text-sm leading-normal">
            <tr>
              <th className="py-2 px-3 sm:py-3 sm:px-6 text-left">User ID</th>
              <th className="py-2 px-3 sm:py-3 sm:px-6 text-left hidden sm:table-cell">Username</th>
              <th className="py-2 px-3 sm:py-3 sm:px-6 text-left hidden sm:table-cell">Email</th>
              <th className="py-2 px-3 sm:py-3 sm:px-6 text-left hidden sm:table-cell">Age</th>
              <th className="py-2 px-3 sm:py-3 sm:px-6 text-left hidden sm:table-cell">Created At</th>
              <th className="py-2 px-3 sm:py-3 sm:px-6 text-center">Actions</th>
            </tr>
          </thead>
          <tbody className="text-primary-gray-600 text-xs sm:text-sm font-light">
            {users.map((user) => {
              const flattened = flattenUserData(user);
              return (
                <tr key={user.id} className="border-b border-primary-gray-200 hover:bg-primary-gray-50">
                  <td
                    className="py-2 px-3 sm:py-3 sm:px-6 text-left cursor-pointer text-blue-600 hover:underline"
                    onClick={() => setSelectedUser(user)}
                    title="Click to view full details"
                  >
                    <div className="flex items-center">
                      <span className="font-medium">{flattened['User ID']}</span>
                    </div>
                  </td>
                  <td className="py-2 px-3 sm:py-3 sm:px-6 text-left hidden sm:table-cell">
                    <span>{flattened['Username']}</span>
                  </td>
                  <td className="py-2 px-3 sm:py-3 sm:px-6 text-left hidden sm:table-cell">
                    <span>{flattened['Email']}</span>
                  </td>
                  <td className="py-2 px-3 sm:py-3 sm:px-6 text-left hidden sm:table-cell">
                    <span>{flattened['Age']}</span>
                  </td>
                  <td className="py-2 px-3 sm:py-3 sm:px-6 text-left hidden sm:table-cell">
                    <span>{flattened['Created At']}</span>
                  </td>
                  <td className="py-2 px-3 sm:py-3 sm:px-6 text-center">
                    <button
                      onClick={async () => {
                        if (window.confirm(`Are you sure you want to delete user ${user.email} (${user.id})?`)) {
                          const success = await deleteUser(user.id);
                          if (success) {
                            setSuccessMessage("User data deleted.");
                            setSelectedUser(null);
                          }
                        }
                      }}
                      className="bg-red-500 hover:bg-red-700 text-white font-bold py-1 px-2 sm:px-3 rounded-md text-xs transition duration-150 ease-in-out"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      <p className="text-xs sm:text-sm text-primary-gray-500 mt-2 sm:mt-4 text-center">
        Click on a "User ID" to view full details. Data refreshes automatically when a new user is registered or a user is deleted.
      </p>

      {/* Renders detailed view of the selected user. */}
      {selectedUser && (
        <div className="mt-4 sm:mt-8 p-4 sm:p-8 bg-white rounded-xl shadow-lg border border-primary-gray-100 relative">
          <h3 className="text-xl sm:text-2xl font-bold text-primary-gray-800 mb-3 sm:mb-4 text-center">
            Details of {selectedUser.username}
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4 text-primary-gray-800 text-sm sm:text-base">
            {Object.entries(flattenUserData(selectedUser)).map(([key, value]) => (
              <div key={key}>
                <p className="font-semibold text-primary-gray-700 text-sm sm:text-base">{key}:</p>
                <p className="ml-2 text-primary-gray-900 text-sm sm:text-base">{value}</p>
              </div>
            ))}
          </div>
          <button
            onClick={() => setSelectedUser(null)}
            className="absolute top-2 right-2 sm:top-4 sm:right-4 text-primary-gray-500 hover:text-primary-gray-800 text-2xl sm:text-3xl font-bold"
            aria-label="Close details"
          >
            &times;
          </button>
        </div>
      )}
    </div>
  );
};

export default UserDataTable;