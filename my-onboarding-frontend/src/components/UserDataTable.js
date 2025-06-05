// src/components/UserDataTable.js
import React, { useState, useEffect } from 'react';
import { useOnboarding } from '../hooks/useOnboarding'; // Import our custom onboarding hook

const UserDataTable = () => {
  // Get functions and states from the hook
  const { getAllUsersData, deleteUser, loading: hookLoading, error: hookError } = useOnboarding();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedUser, setSelectedUser] = useState(null); // New state for selected user details

  // Helper function to flatten the nested data for display in the table and detail view
  const flattenUserData = (userData) => {
    // userData here is a direct user object from the backend (Flask's User model)
    const flattened = {
      'User ID': userData.id || 'N/A',
      'Email': userData.email || 'N/A',
      'Age': userData.age || 'N/A',
      'Current Step': userData.current_step || 'N/A',
      // Format dates for better readability
      'Created At': userData.created_at ? new Date(userData.created_at).toLocaleDateString() : 'N/A',
      'Updated At': userData.updated_at ? new Date(userData.updated_at).toLocaleDateString() : 'N/A',
    };

    // Flatten data from the 'onboarding_data' JSONB field
    const onboardingData = userData.onboarding_data || {};

    // Add fields that might be inside onboarding_data
    if (onboardingData.aboutMe) {
        flattened['About Me'] = onboardingData.aboutMe;
    }
    if (onboardingData.birthdate) {
        flattened['Birthdate'] = onboardingData.birthdate;
    }
    // Note: 'password' or 'password_hash' should NEVER be displayed in plain text or obscured here.
    // The backend's /admin/users endpoint should not return password hashes, making this safe.

    // Flatten address fields if they exist within onboardingData
    if (onboardingData.address) {
      flattened['Street'] = onboardingData.address.street || 'N/A';
      flattened['City'] = onboardingData.address.city || 'N/A';
      flattened['State'] = onboardingData.address.state || 'N/A';
      flattened['Zip'] = onboardingData.address.zip || 'N/A';
    }

    return flattened;
  };

  // Function to fetch all users from the backend
  const fetchUsers = async () => {
    try {
      setLoading(true);
      setError(null); // Clear errors at the start of fetch
      const data = await getAllUsersData(); // This now fetches from your backend
      setUsers(data);
    } catch (err) {
      console.error('Error fetching user data from backend:', err);
      setError(err.message || 'Failed to fetch user data from backend.');
    } finally {
      setLoading(false);
    }
  };

  // Effect to load users initially and set up refreshing
  useEffect(() => {
    fetchUsers();
    // Set up an interval to refresh data every few seconds
    const intervalId = setInterval(fetchUsers, 5000); // Refresh every 5 seconds

    // Cleanup interval on component unmount
    return () => clearInterval(intervalId);
  }, [getAllUsersData]); // Add getAllUsersData to dependencies as it's a useCallback

  // Handle viewing details of a specific user
  const handleViewDetails = (user) => {
    setSelectedUser(user);
  };

  // Handle deleting a user
  const handleDelete = async (userId) => {
    if (window.confirm(`Are you sure you want to delete user ${userId}? This action cannot be undone.`)) {
      try {
        setLoading(true); // Indicate loading while deleting
        const success = await deleteUser(userId); // Call the delete function from the hook
        if (success) {
          // Re-fetch the user list to show the updated state
          await fetchUsers();
          setSelectedUser(null); // Clear selected user if they were deleted
          alert(`User ${userId} deleted successfully!`);
        } else {
            alert(`Failed to delete user ${userId}.`);
        }
      } catch (err) {
        console.error('Error deleting user:', err);
        setError(err.message || 'Failed to delete user.');
      } finally {
        setLoading(false);
      }
    }
  };


  // Handle potential errors or loading states from the component or hook
  if (loading || hookLoading) {
    return (
      <div className="flex items-center justify-center p-8 bg-white rounded-xl shadow-soft-xl w-full max-w-4xl mx-auto border border-primary-gray-100 min-h-[300px]">
        <p className="text-primary-gray-600 text-lg animate-pulse">Loading user data from backend...</p>
      </div>
    );
  }

  if (error || hookError) {
    return (
      <div className="text-center p-8 text-error-red bg-white rounded-xl shadow-soft-xl w-full max-w-4xl mx-auto border border-primary-gray-100">
        <h3 className="text-xl font-bold mb-3">Error Loading Data</h3>
        <p>Error: {error || hookError}</p>
        <p className="mt-2">Please ensure your Flask backend server is running and accessible.</p>
      </div>
    );
  }

  if (users.length === 0) {
    return (
      <div className="text-center p-8 text-primary-gray-600 bg-white rounded-xl shadow-soft-xl w-full max-w-4xl mx-auto border border-primary-gray-100">
        <p className="text-lg">No user data available yet.</p>
        <p className="mt-2">Start the onboarding flow to add users!</p>
      </div>
    );
  }

  // Extract all possible headers from all users' flattened data
  const allFlattenedUsers = users.map(user => flattenUserData(user));
  const headers = Array.from(new Set(allFlattenedUsers.flatMap(Object.keys)));

  return (
    <div className="p-8 bg-white shadow-soft-xl rounded-xl w-full max-w-4xl mx-auto border border-primary-gray-100 overflow-hidden">
      <h2 className="text-3xl font-bold text-primary-gray-800 mb-6 text-center">
        All Registered User Data
      </h2>

      <div className="overflow-x-auto rounded-lg border border-primary-gray-200 shadow-soft-sm">
        <table className="min-w-full divide-y divide-primary-gray-200">
          <thead className="bg-primary-gray-50">
            <tr>
              {headers.map((header) => (
                <th
                  key={header}
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-primary-gray-600 uppercase tracking-wider whitespace-nowrap"
                >
                  {header}
                </th>
              ))}
              {/* Add a header for actions */}
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-primary-gray-600 uppercase tracking-wider whitespace-nowrap">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-primary-gray-100">
            {users.map((user, index) => {
              const flattened = flattenUserData(user); // Pass the full user object
              return (
                <tr key={user.id} className={index % 2 === 0 ? 'bg-white' : 'bg-primary-gray-50'}>
                  {headers.map((header) => (
                    <td key={`${user.id}-${header}`} className="px-6 py-4 whitespace-nowrap text-sm text-primary-gray-900">
                      {flattened[header] || '-'} {/* Display '-' if data is missing for a header */}
                    </td>
                  ))}
                  {/* Action buttons column */}
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <button
                      onClick={() => handleViewDetails(user)}
                      className="text-indigo-600 hover:text-indigo-900 mr-4"
                    >
                      View Details
                    </button>
                    <button
                      onClick={() => handleDelete(user.id)}
                      className="text-red-600 hover:text-red-900"
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
      <p className="text-sm text-primary-gray-500 mt-4 text-center">
        Data refreshes automatically every 5 seconds from the backend.
      </p>

      {/* --- Selected User Details Display --- */}
      {selectedUser && (
        <div className="mt-8 p-8 bg-white rounded-xl shadow-lg border border-primary-gray-100 relative">
          <h3 className="text-2xl font-bold text-primary-gray-800 mb-4 text-center">
            Details for {selectedUser.email}
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-primary-gray-800">
            {/* Display flattened data in a neat form */}
            {Object.entries(flattenUserData(selectedUser)).map(([key, value]) => (
              <div key={key}>
                <p className="font-semibold text-primary-gray-700">{key}:</p>
                <p className="ml-2 text-primary-gray-900">{value}</p>
              </div>
            ))}
          </div>
          <button
            onClick={() => setSelectedUser(null)}
            className="absolute top-4 right-4 text-primary-gray-500 hover:text-primary-gray-800 text-3xl font-bold"
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