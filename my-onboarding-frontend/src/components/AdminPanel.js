// src/components/AdminPanel.js
import React, { useState, useEffect } from 'react';
import { useOnboarding } from '../hooks/useOnboarding';
import Button from './Button';

/**
 * AdminPanel component allows configuration of onboarding flow components.
 * Users can select which data input components appear on Page 2 and Page 3.
 */
const AdminPanel = () => {
  const { adminConfig, loading, error, updateAdminConfiguration, componentMap } = useOnboarding();
  // Local state for managing configuration changes before saving.
  const [localConfig, setLocalConfig] = useState(null);
  // State to display success or error messages after saving.
  const [saveMessage, setSaveMessage] = useState(null);

  // Initializes localConfig when adminConfig from context is loaded or updated.
  useEffect(() => {
    if (adminConfig) {
      // Creates a deep copy to prevent direct mutation of context state.
      const initialLocalConfig = {
        page1: adminConfig.page1 || [],
        page2: adminConfig.page2 || [],
        page3: adminConfig.page3 || [],
      };
      setLocalConfig(initialLocalConfig);
    }
  }, [adminConfig]);

  // Handles changes to component checkboxes for each page.
  const handleCheckboxChange = (page, componentId) => {
    setSaveMessage(null); // Clears previous save messages.
    setLocalConfig(prevConfig => {
      const currentPageComponents = new Set(prevConfig[page] || []);
      // Adds or removes the component ID based on current selection.
      if (currentPageComponents.has(componentId)) {
        currentPageComponents.delete(componentId);
      } else {
        currentPageComponents.add(componentId);
      }

      let newComponentsArray = Array.from(currentPageComponents);

      // Custom sorting for Page 2 components (e.g., 'name' before 'aboutMe').
      if (page === 'page2') {
        const order = ['name', 'aboutMe', 'address', 'birthdate'];
        newComponentsArray.sort((a, b) => {
          const indexA = order.indexOf(a);
          const indexB = order.indexOf(b);

          if (indexA === -1 && indexB === -1) return 0;
          if (indexA === -1) return 1;
          if (indexB === -1) return -1;

          return indexA - indexB;
        });
      }

      const newConfig = {
        ...prevConfig,
        [page]: newComponentsArray,
      };

      // Client-side validation: ensures Page 2 and Page 3 have at least one component.
      if (page === 'page2' && newConfig.page2.length === 0) {
        setSaveMessage('Page 2 must have at least one component. Please select one.');
        return prevConfig; // Reverts state if validation fails.
      }
      if (newConfig.page3.length === 0) {
        setSaveMessage('Page 3 must have at least one component. Please select one.');
        return prevConfig; // Reverts state if validation fails.
      }

      return newConfig;
    });
  };

  // Handles saving the updated configuration to the backend.
  const handleSaveConfig = async () => {
    if (!localConfig) return;

    // Prepares the configuration to be sent, ensuring all pages are included.
    const configToSend = {
      page1: localConfig.page1 || [],
      page2: localConfig.page2 || [],
      page3: localConfig.page3 || [],
    };

    try {
      await updateAdminConfiguration(configToSend);
      setSaveMessage('Configuration saved successfully!');
    } catch (err) {
      setSaveMessage(`Failed to save configuration: ${error || err.message}`);
    }
  };

  // Displays loading message while fetching config.
  if (loading && !localConfig) {
    return (
      <div className="flex items-center justify-center p-8 bg-white rounded-xl shadow-xl w-full max-w-2xl mx-auto border border-gray-100 min-h-[300px]">
        <p className="text-gray-600 text-lg animate-pulse">Loading admin panel configuration...</p>
      </div>
    );
  }

  // Displays error if configuration fails to load.
  if (error && !localConfig) {
    return (
      <div className="text-center p-8 text-red-600 bg-white rounded-xl shadow-xl w-full max-w-2xl mx-auto border border-gray-100">
        <h3 className="text-xl font-bold mb-3">Error Loading Configuration</h3>
        <p>Error loading admin configuration: {error}</p>
        <p className="mt-2">Please ensure your backend is running and accessible.</p>
        <p className="mt-2 text-blue-600 text-sm">Default components are being used for pages 2 and 3.</p>
      </div>
    );
  }

  // Displays a generic message if configuration is not available.
  if (!localConfig) {
    return (
      <div className="text-center p-8 text-gray-600 bg-white rounded-xl shadow-xl w-full max-w-2xl mx-auto border border-gray-100">
        <p className="text-lg">Admin configuration not available. Please check system status.</p>
      </div>
    );
  }

  // Extracts all available component IDs from the component map.
  const allComponentIds = Object.keys(componentMap);

  return (
    <div className="p-8 bg-white shadow-xl rounded-xl w-full max-w-2xl mx-auto border border-gray-100">
      <h2 className="text-3xl font-bold text-gray-800 mb-6 text-center">
        Admin Panel
      </h2>
      <p className="text-gray-600 text-center mb-6">
        Configure which data collection components appear on the onboarding pages.
      </p>

      {/* Displays save success or error messages. */}
      {saveMessage && (
        <p className={`text-center mb-6 p-3 rounded-lg font-medium text-sm
          ${saveMessage.includes('Failed') ? 'bg-red-100 text-red-700 border border-red-200' : 'bg-green-100 text-green-700 border border-green-200'}`
        }>
          {saveMessage}
        </p>
      )}

      {/* Grid layout for page configurations, stacks on small screens. */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Configuration section for Page 2 components. */}
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

        {/* Configuration section for Page 3 components. */}
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

      {/* Save configuration button. */}
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