// src/hooks/useOnboarding.js
import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';

// IMPORTANT: Ensure you have these components created in src/components/.
// These imports are typically in OnboardingSteps.js, but are listed here
// because `getComponentsForPage` needs to reference them for dynamic rendering.
import AboutMeInput from '../components/AboutMeInput';
import AddressInput from '../components/AddressInput';
import BirthdateInput from '../components/BirthdateInput'; // Keep if used in admin config


// Define the Onboarding Context
const OnboardingContext = createContext(null);

// Base URL for your Flask backend. Make sure this matches your Flask server address.
const API_BASE_URL = 'http://127.0.0.1:5001';

/**
 * Provides onboarding state and functions to its children components.
 * Manages user ID, onboarding data, current step, and admin configuration.
 * All data persistence is now handled via the Flask backend.
 */
export const OnboardingProvider = ({ children }) => {
  // Read initial userId from localStorage. This ID will be used to fetch data from backend.
  const [userId, setUserId] = useState(() => localStorage.getItem('onboardingUserId') || null);
  const [onboardingData, setOnboardingData] = useState({});
  const [currentStep, setCurrentStep] = useState(1); // Frontend steps are 1-indexed
  const [adminConfig, setAdminConfig] = useState(null); // Will load from backend
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // A ref to track if this is the initial mount.
  // This helps prevent initial load logic from re-running unnecessarily due to StrictMode or other re-renders.
  const isInitialMount = useRef(true);

  // Data structure for customizable components (used in AdminPanel for display purposes)
  const componentMap = {
    aboutMe: 'About Me',
    address: 'Address',
    birthdate: 'Birthdate',
    // Add more component mappings here as you create new customizable input components
  };


  // --- Initial Load Effect (runs only once on mount) ---
  // This useEffect handles loading initial admin config and existing user session data from backend.
  useEffect(() => {
    const loadInitialState = async () => {
      setLoading(true);
      setError(null);

      try {
        // 1. Load Admin Config from backend
        console.log("Fetching admin config from backend...");
        const adminConfigResponse = await fetch(`${API_BASE_URL}/admin/config`);
        if (!adminConfigResponse.ok) {
          throw new Error(`HTTP error! status: ${adminConfigResponse.status}`);
        }
        const configData = await adminConfigResponse.json();
        setAdminConfig(configData);
        console.log("Backend Admin Config Loaded:", configData);

        // 2. Load User Progress if an existing userId is present in localStorage
        const storedUserId = localStorage.getItem('onboardingUserId');
        if (storedUserId) {
          console.log(`Loading progress for user ${storedUserId} from backend...`);
          const userProgressResponse = await fetch(`${API_BASE_URL}/user/${storedUserId}/progress`);

          if (!userProgressResponse.ok) {
            // If user not found on backend (e.g., DB reset, or invalid ID), treat as new user
            if (userProgressResponse.status === 404) {
              console.log(`User ${storedUserId} not found on backend. Starting new onboarding.`);
              localStorage.removeItem('onboardingUserId'); // Clear stale ID
              setUserId(null); // Reset userId state
              setOnboardingData({});
              setCurrentStep(1); // Set to initial registration step
            } else {
              throw new Error(`HTTP error! status: ${userProgressResponse.status}`);
            }
          } else {
            const progressData = await userProgressResponse.json();
            setUserId(storedUserId); // Ensure userId state matches localStorage
            setOnboardingData(progressData.onboardingData || {});
            setCurrentStep(progressData.currentStep); // Backend provides 1-indexed step
            console.log(`Loaded progress for user ${storedUserId}. Current step: ${progressData.currentStep}`);
          }
        } else {
          console.log("No user ID found in localStorage. Starting new onboarding.");
          setCurrentStep(1); // Ensure new users start at step 1 (registration)
          setOnboardingData({}); // Clear any residual data
        }

      } catch (e) {
        console.error("Initial Load Error:", e);
        setError(`Failed to load initial data: ${e.message}. Please ensure backend is running.`);
        // Fallback to default/reset if backend connection fails
        localStorage.removeItem('onboardingUserId');
        setUserId(null);
        setOnboardingData({});
        setCurrentStep(1);
      } finally {
        setLoading(false);
      }
    };

    if (isInitialMount.current) { // Only run this effect on the very first mount
      loadInitialState();
      isInitialMount.current = false; // Mark that initial mount logic has run
    }
  }, []); // Empty dependency array ensures this runs only once on mount


  // --- User Onboarding Actions (Backend Communication) ---

  const handleRegisterUser = useCallback(async (email, password, age) => {
    try {
      setLoading(true);
      setError(null);
      console.log('Attempting to register user with backend...');

      const response = await fetch(`${API_BASE_URL}/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, age }),
      });

      const data = await response.json();

      if (!response.ok) {
        // Backend returns error.message for specific errors (e.g., age, email exists)
        throw new Error(data.error || 'Registration failed.');
      }

      setUserId(data.userId);
      localStorage.setItem('onboardingUserId', data.userId); // Persist userId in localStorage for returning users
      setOnboardingData(data.onboardingData); // Set initial data (email, age)
      // After successful registration (which is conceptually step 1),
      // we want to immediately move the user to the next logical onboarding step, which is step 2.
      setCurrentStep(2);

      console.log('User registered successfully on backend. User ID:', data.userId);

    } catch (err) {
      console.error('Registration failed:', err);
      setError(err.message || 'Registration failed unexpectedly.');
      throw err; // Re-throw to allow component (e.g., OnboardingSteps) to handle form-specific errors
    } finally {
      setLoading(false);
    }
  }, []);

  const handleUpdateUserData = useCallback(async (dataForStep, currentFrontendStep) => {
    if (!userId) {
      setError("User not registered. Cannot update data.");
      throw new Error("User ID is missing for data update.");
    }
    try {
      setLoading(true);
      setError(null);
      console.log(`Updating user data for step ${currentFrontendStep} for user ${userId}...`);

      const response = await fetch(`${API_BASE_URL}/user/${userId}/update_data`, {
        method: 'PUT', // Using PUT for updating an existing resource
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          onboardingData: dataForStep, // Send partial data for this step
          currentStep: currentFrontendStep, // Send the step that was just completed/saved
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || `Failed to save data for step ${currentFrontendStep}.`);
      }

      setOnboardingData(data.onboardingData); // Update local state with merged data from backend
      console.log(`Data updated for user ${userId}, step ${currentFrontendStep}. Response:`, data);

    } catch (err) {
      console.error('Data update failed:', err);
      setError(err.message || 'Data update failed unexpectedly.');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [userId, onboardingData]);


  const nextStep = useCallback(async (dataToPersist = null) => {
    // `currentStep` here refers to the step the user is *currently on* before moving to the next one.
    // So, if they are on step 2, and dataToPersist is provided, it's data for step 2.
    const stepToSaveFor = currentStep;
    const nextFrontendStep = currentStep + 1;

    if (stepToSaveFor >= 1 && stepToSaveFor <= 3) { // Assuming steps 1, 2, 3 are data input steps
      if (dataToPersist) {
        try {
          // Persist data for the step they just completed/are on
          await handleUpdateUserData(dataToPersist, stepToSaveFor);
          // Only advance step if data was successfully saved
          setCurrentStep(nextFrontendStep);
        } catch (err) {
          // Error handling already in handleUpdateUserData, just prevent step advancement
          return;
        }
      } else {
        // If no data to persist for a step (e.g., if step 1 is just registration, handled by handleRegisterUser,
        // or a step has no user inputs but needs to progress)
        setCurrentStep(nextFrontendStep);
      }
    } else if (stepToSaveFor === 4) { // Final completion step (frontend step 4)
      if (userId) {
        try {
          setLoading(true);
          console.log(`Marking onboarding complete for user ${userId} on backend...`);
          const response = await fetch(`${API_BASE_URL}/user/${userId}/complete`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
          });
          if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
          }
          console.log('Onboarding marked as complete on backend.');
          // currentStep will remain 4 (completion screen)
        } catch (err) {
          console.error('Failed to mark onboarding complete:', err);
          setError(err.message || 'Failed to finalize onboarding.');
        } finally {
          setLoading(false);
        }
      }
    }
    setError(null); // Clear previous errors on successful navigation/operation
  }, [currentStep, userId, handleUpdateUserData]);


  const prevStep = useCallback(() => {
    setCurrentStep(prev => Math.max(1, prev - 1));
    setError(null); // Clear errors when navigating back
  }, []);

  // --- Admin Actions (Backend Communication) ---
  const updateAdminConfiguration = useCallback(async (newConfig) => {
    try {
      setLoading(true);
      setError(null);
      console.log('Updating admin config on backend...');

      const response = await fetch(`${API_BASE_URL}/admin/config`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newConfig),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || `HTTP error! status: ${response.status}`);
      }
      setAdminConfig(data.config); // Backend returns the updated config
      console.log('Admin configuration updated successfully on backend.');

    } catch (err) {
      console.error('Failed to update admin config:', err);
      setError(err.message || 'Failed to update admin configuration unexpectedly.');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Returns the actual React components to render for a given customizable page.
   * This is used by OnboardingSteps.js.
   * @param {number} pageNumber - 2 for custom page 1, 3 for custom page 2.
   * @returns {Array<{id: string, Component: React.ComponentType}>} Array of component objects.
   */
  const getComponentsForPage = useCallback((pageNumber) => {
    if (!adminConfig) return [];

    const pageComponents = adminConfig[`page${pageNumber}`] || [];
    const components = [];

    // Dynamically map string IDs from admin config to actual React components
    for (const compId of pageComponents) {
      if (compId === 'aboutMe') {
        components.push({ id: 'aboutMe', Component: AboutMeInput });
      } else if (compId === 'address') {
        components.push({ id: 'address', Component: AddressInput });
      } else if (compId === 'birthdate') {
        components.push({ id: 'birthdate', Component: BirthdateInput });
      }
      // Add more else if blocks here if you add more customizable components later
    }
    return components;
  }, [adminConfig]);


  // --- Helper for UserDataTable (now fetches from backend) ---
  const getAllUsersData = useCallback(async () => { // Renamed from getAllMockUsersData
    try {
      console.log('Fetching all users from backend...');
      const response = await fetch(`${API_BASE_URL}/admin/users`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const users = await response.json();
      console.log('All users fetched:', users);
      return users;
    } catch (e) {
      console.error("Error fetching all users from backend:", e);
      setError(`Failed to load user list from backend: ${e.message}.`);
      return [];
    }
  }, []);

  const deleteUser = useCallback(async (idToDelete) => { // Renamed from deleteMockUser
    try {
      setLoading(true);
      setError(null);
      console.log(`Deleting user ${idToDelete} from backend...`);
      const response = await fetch(`${API_BASE_URL}/admin/users/${idToDelete}`, {
        method: 'DELETE',
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || `HTTP error! status: ${response.status}`);
      }
      console.log(`User ${idToDelete} deleted successfully from backend.`);
      // If the currently active user is deleted, clear local state
      if (userId === idToDelete) {
        localStorage.removeItem('onboardingUserId');
        setUserId(null);
        setOnboardingData({});
        setCurrentStep(1); // Reset to initial registration step
      }
      return true; // Indicate success
    } catch (e) {
      console.error(`Error deleting user ${idToDelete} from backend:`, e);
      setError(`Failed to delete user ${idToDelete}: ${e.message}.`);
      return false; // Indicate failure
    } finally {
      setLoading(false);
    }
  }, [userId]);


  const contextValue = {
    userId,
    onboardingData,
    currentStep,
    adminConfig,
    loading,
    error,
    componentMap,
    handleRegisterUser,
    handleUpdateUserData,
    nextStep,
    prevStep,
    updateAdminConfiguration,
    getComponentsForPage,
    getAllUsersData, // Renamed
    deleteUser,     // Renamed
    resetOnboarding: useCallback(() => {
        // For a full reset (e.g., if a user explicitly logs out or wants to start fresh)
        // Clear client-side stored user ID and reset state.
        // Backend data persists unless explicitly deleted via admin panel.
        localStorage.removeItem('onboardingUserId');
        setUserId(null);
        setOnboardingData({});
        setCurrentStep(1); // Reset to the first step (registration)
        setError(null);    // Clear any previous errors
        setLoading(false); // Ensure loading is off
        console.log('Client-side onboarding state reset.');
    }, [])
  };

  return (
    <OnboardingContext.Provider value={contextValue}>
      {children}
    </OnboardingContext.Provider>
  );
};

export const useOnboarding = () => {
  const context = useContext(OnboardingContext);
  if (!context) {
    throw new Error('useOnboarding must be used within an OnboardingProvider');
  }
  return context;
};