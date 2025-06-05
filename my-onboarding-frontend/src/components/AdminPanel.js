// src/components/AdminPanel.js
import React, { useState, useEffect } from 'react';
import { useOnboarding } from '../hooks/useOnboarding'; // Import our custom onboarding hook
import Button from './Button'; // Reusable button

const AdminPanel = () => {
  const { adminConfig, loading, error, updateAdminConfiguration, componentMap } = useOnboarding();
  // Local state to manage configuration changes before saving
  const [localConfig, setLocalConfig] = useState(null);
  const [saveMessage, setSaveMessage] = useState(null); // To show success/error message after saving

  // Initialize local config when adminConfig from context loads or changes
  useEffect(() => {
    if (adminConfig) {
      // Deep copy to ensure local state doesn't mutate context state directly
      // Ensure all page keys (page1, page2, page3) are present, even if empty, for consistency
      const initialLocalConfig = {
        // We still initialize page1 here to handle any existing data
        // even though the UI for it is removed.
        page1: adminConfig.page1 || [],
        page2: adminConfig.page2 || [],
        page3: adminConfig.page3 || [],
      };
      setLocalConfig(initialLocalConfig);
    }
  }, [adminConfig]);

  // Handle checkbox changes for component assignments
  const handleCheckboxChange = (page, componentId) => {
    setSaveMessage(null); // Clear previous save message
    setLocalConfig(prevConfig => {
      // Ensure prevConfig[page] exists and is an array before processing
      const currentPageComponents = new Set(prevConfig[page] || []);
      if (currentPageComponents.has(componentId)) {
        currentPageComponents.delete(componentId);
      } else {
        currentPageComponents.add(componentId);
      }

      const newConfig = {
        ...prevConfig,
        [page]: Array.from(currentPageComponents),
      };

      // Client-side validation: Ensure pages 2 and 3 have at least one component
      if (page === 'page2' && newConfig.page2.length === 0) {
        setSaveMessage('Page 2 must have at least one component. Please select one.');
        return prevConfig; // Revert if invalid
      }
      if (newConfig.page3.length === 0) { // Assuming page3 is always required
        setSaveMessage('Page 3 must have at least one component. Please select one.');
        return prevConfig; // Revert if invalid
      }

      return newConfig;
    });
  };

  // Handle saving the configuration
  const handleSaveConfig = async () => {
    if (!localConfig) return;

    // Ensure all pages have at least an empty array to be sent, even if no components are selected
    // This prevents the backend from receiving 'undefined' for pages that were never touched
    const configToSend = {
      page1: localConfig.page1 || [], // Page 1 data will still be sent, but cannot be configured via UI
      page2: localConfig.page2 || [],
      page3: localConfig.page3 || [],
    };

    try {
      await updateAdminConfiguration(configToSend); // Send the prepared config
      setSaveMessage('Configuration saved successfully!');
    } catch (err) {
      setSaveMessage(`Failed to save configuration: ${error || err.message}`);
    }
  };

  if (loading && !localConfig) { // Show loading only if config hasn't been loaded yet
    return (
      <div className="flex items-center justify-center p-8 bg-white rounded-xl shadow-xl w-full max-w-2xl mx-auto border border-gray-100 min-h-[300px]">
        <p className="text-gray-600 text-lg animate-pulse">Loading admin panel configuration...</p>
      </div>
    );
  }

  // Display error from the context if it's related to admin config loading
  if (error && !localConfig) { // Only show error if no config could be loaded at all
    return (
      <div className="text-center p-8 text-red-600 bg-white rounded-xl shadow-xl w-full max-w-2xl mx-auto border border-gray-100">
        <h3 className="text-xl font-bold mb-3">Error Loading Configuration</h3>
        <p>Error loading admin configuration: {error}</p>
        <p className="mt-2">Please ensure your backend is running and accessible at `http://localhost:5000`.</p>
        <p className="mt-2 text-blue-600 text-sm">Default components are being used for pages 2 and 3.</p>
      </div>
    );
  }

  // If localConfig is still null (e.g., initial load error and no default), handle gracefully
  if (!localConfig) {
    return (
      <div className="text-center p-8 text-gray-600 bg-white rounded-xl shadow-xl w-full max-w-2xl mx-auto border border-gray-100">
        <p className="text-lg">Admin configuration not available. Please check system status.</p>
      </div>
    );
  }

  // Get a list of all available component IDs from our componentMap
  const allComponentIds = Object.keys(componentMap);

  return (
    <div className="p-8 bg-white shadow-xl rounded-xl w-full max-w-2xl mx-auto border border-gray-100">
      <h2 className="text-3xl font-bold text-gray-800 mb-6 text-center">
        Admin Panel
      </h2>
      <p className="text-gray-600 text-center mb-6">
        Configure which data collection components appear on the onboarding pages.
      </p>

      {saveMessage && (
        <p className={`text-center mb-6 p-3 rounded-lg font-medium text-sm
          ${saveMessage.includes('Failed') ? 'bg-red-100 text-red-700 border border-red-200' : 'bg-green-100 text-green-700 border border-green-200'}`
        }>
          {saveMessage}
        </p>
      )}

      {/* Adjusted grid layout to potentially make Page 2 and Page 3 display better side-by-side
          if the screen is wide enough, or stack on smaller screens.
          Changed to grid-cols-1 for small screens, md:grid-cols-2 for medium upwards.
      */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Removed "Configuration for Page 1" div entirely */}

        {/* Configuration for Page 2 */}
        <div className="border border-gray-200 p-6 rounded-lg bg-gray-50 shadow-inner">
          <h3 className="text-xl font-semibold text-gray-700 mb-4 pb-2 border-b border-gray-200">
            Page 2 Components
          </h3>
          <div className="space-y-3">
            {allComponentIds.map(id => (
              <div key={`page2-${id}`} className="flex items-center">
                <input
                  type="checkbox"
                  id={`page2-${id}`}
                  className="form-checkbox h-5 w-5 text-blue-600 rounded focus:ring-blue-500 transition duration-150 ease-in-out"
                  checked={localConfig.page2?.includes(id) || false}
                  onChange={() => handleCheckboxChange('page2', id)}
                />
                <label htmlFor={`page2-${id}`} className="ml-3 text-lg text-gray-700 capitalize cursor-pointer">
                  {componentMap[id]}
                </label>
              </div>
            ))}
          </div>
        </div>

        {/* Configuration for Page 3 */}
        <div className="border border-gray-200 p-6 rounded-lg bg-gray-50 shadow-inner">
          <h3 className="text-xl font-semibold text-gray-700 mb-4 pb-2 border-b border-gray-200">
            Page 3 Components
          </h3>
          <div className="space-y-3">
            {allComponentIds.map(id => (
              <div key={`page3-${id}`} className="flex items-center">
                <input
                  type="checkbox"
                  id={`page3-${id}`}
                  className="form-checkbox h-5 w-5 text-blue-600 rounded focus:ring-blue-500 transition duration-150 ease-in-out"
                  checked={localConfig.page3?.includes(id) || false}
                  onChange={() => handleCheckboxChange('page3', id)}
                />
                <label htmlFor={`page3-${id}`} className="ml-3 text-lg text-gray-700 capitalize cursor-pointer">
                  {componentMap[id]}
                </label>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-8 text-center">
        <Button
          onClick={handleSaveConfig}
          disabled={loading}
          className="px-10 py-3 text-lg"
        >
          {loading ? 'Saving...' : 'Save Configuration'}
        </Button>
      </div>
    </div>
  );
};

export default AdminPanel;