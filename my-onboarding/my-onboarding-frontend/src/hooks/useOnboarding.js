// src/hooks/useOnboarding.js
import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';

// IMPORTANT: Ensure these components are created in src/components/.
// These imports are typically in OnboardingSteps.js, but are listed here
// because `getComponentsForPage` needs to reference them for dynamic rendering.
import AboutMeInput from '../components/AboutMeInput';
import AddressInput from '../components/AddressInput';
import BirthdateInput from '../components/BirthdateInput';

// Defines the Onboarding Context.
const OnboardingContext = createContext(null);

// Base URL for the Flask backend. Make sure this matches your Flask server address.
const API_BASE_URL = 'https://duysox1y84boc.cloudfront.net';

/**
 * Provides onboarding state and functions to its children components.
 * Manages user ID, onboarding data, current step, and admin configuration.
 * All data persistence is handled via the Flask backend.
 *
 * @param {object} props - Component props.
 * @param {React.ReactNode} props.children - Child components to be rendered within the provider's scope.
 * @returns {JSX.Element} The OnboardingProvider component.
 */
export const OnboardingProvider = ({ children }) => {
  // Initializes userId from localStorage. This ID is used to fetch data from the backend.
  const [userId, setUserId] = useState(() => localStorage.getItem('onboardingUserId') || null);
  const [onboardingData, setOnboardingData] = useState({});
  const [currentStep, setCurrentStep] = useState(1); // Frontend steps are 1-indexed.
  const [adminConfig, setAdminConfig] = useState(null); // Will load from backend.
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  // State to trigger user list refresh in UserDataTable.
  const [userListRefreshCounter, setUserListRefreshCounter] = useState(0);

  // A ref to track if this is the initial mount, preventing unnecessary re-runs.
  const isInitialMount = useRef(true);

  // Data structure for customizable components (used in AdminPanel for display purposes).
  const componentMap = {
    aboutMe: 'About Me',
    address: 'Address',
    birthdate: 'Birthdate',
    // Add more component mappings here as new customizable input components are created.
  };

  // --- Initial Load Effect (runs only once on mount) ---
  // Handles loading initial admin config and existing user session data from the backend.
  useEffect(() => {
    const loadInitialState = async () => {
      setLoading(true);
      setError(null);

      try {
        // 1. Load Admin Config from backend.
        console.log("Fetching admin config from backend...");
        const adminConfigResponse = await fetch(`${API_BASE_URL}/admin/config`);
        if (!adminConfigResponse.ok) {
          throw new Error(`HTTP error! status: ${adminConfigResponse.status}`);
        }
        const configData = await adminConfigResponse.json();
        setAdminConfig(configData);
        console.log("Backend Admin Config Loaded:", configData);

        // 2. Load User Progress if an existing userId is present in localStorage.
        const storedUserId = localStorage.getItem('onboardingUserId');
        if (storedUserId) {
          console.log(`Loading progress for user ${storedUserId} from backend...`);
          const userProgressResponse = await fetch(`${API_BASE_URL}/user/${storedUserId}/progress`);

          if (!userProgressResponse.ok) {
            // If user not found on backend (e.g., DB reset, or invalid ID), treat as new user.
            if (userProgressResponse.status === 404) {
              console.log(`User ${storedUserId} not found on backend. Starting new onboarding.`);
              localStorage.removeItem('onboardingUserId'); // Clear stale ID.
              setUserId(null); // Reset userId state.
              setOnboardingData({});
              setCurrentStep(1); // Set to initial registration step.
            } else {
              throw new Error(`HTTP error! status: ${userProgressResponse.status}`);
            }
          } else {
            const progressData = await userProgressResponse.json();
            setUserId(storedUserId); // Ensures userId state matches localStorage.
            setOnboardingData(progressData.onboardingData || {});
            setCurrentStep(progressData.currentStep); // Backend provides 1-indexed step.
            console.log(`Loaded progress for user ${storedUserId}. Current step: ${progressData.currentStep}`);
          }
        } else {
          console.log("No user ID found in localStorage. Starting new onboarding.");
          setCurrentStep(1); // Ensures new users start at step 1 (registration).
          setOnboardingData({}); // Clear any residual data.
        }

      } catch (e) {
        console.error("Initial Load Error:", e);
        setError(`Failed to load initial data: ${e.message}. Please ensure backend is running.`);
        // Fallback to default/reset if backend connection fails.
        localStorage.removeItem('onboardingUserId');
        setUserId(null);
        setOnboardingData({});
        setCurrentStep(1);
      } finally {
        setLoading(false);
      }
    };

    if (isInitialMount.current) { // Only run this effect on the very first mount.
      loadInitialState();
      isInitialMount.current = false; // Mark that initial mount logic has run.
    }
  }, []); // Empty dependency array ensures this runs only once on mount.

  // --- User Onboarding Actions (Backend Communication) ---

  /**
   * Handles user registration with the backend.
   * @param {string} username - The user's chosen username.
   * @param {string} email - The user's email address.
   * @param {string} password - The user's password.
   * @param {number} age - The user's age.
   * @returns {Promise<void>} A promise that resolves when registration is successful.
   * @throws {Error} If registration fails.
   */
  const handleRegisterUser = useCallback(async (username, email, password, age) => {
    try {
      setLoading(true);
      setError(null);
      console.log('Attempting to register user with backend...');

      const response = await fetch(`${API_BASE_URL}/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, email, password, age }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Registration failed.');
      }

      setUserId(data.userId);
      localStorage.setItem('onboardingUserId', data.userId);
      setOnboardingData(data.onboardingData);
      setCurrentStep(2); // Move to the next step after successful registration.
      setUserListRefreshCounter(prev => prev + 1); // Triggers refresh for UserDataTable.

      console.log('User registered successfully on backend. User ID:', data.userId);

    } catch (err) {
      console.error('Registration failed:', err);
      setError(err.message || 'Registration failed unexpectedly.');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Updates user onboarding data on the backend for a specific step.
   * @param {object} dataForStep - The data to be persisted for the current step.
   * @param {number} currentFrontendStep - The current step number on the frontend.
   * @returns {Promise<void>} A promise that resolves when data is updated.
   * @throws {Error} If user is not registered or update fails.
   */
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
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          onboardingData: dataForStep,
          currentStep: currentFrontendStep,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || `Failed to save data for step ${currentFrontendStep}.`);
      }

      setOnboardingData(data.onboardingData);
      setUserListRefreshCounter(prev => prev + 1); // Triggers refresh for UserDataTable after update.

      console.log(`Data updated for user ${userId}, step ${currentFrontendStep}. Response:`, data);

    } catch (err) {
      console.error('Data update failed:', err);
      setError(err.message || 'Data update failed unexpectedly.');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [userId]);

  /**
   * Advances the onboarding process to the next step.
   * Persists data for the current step if provided.
   * Marks onboarding as complete if it's the final step.
   * @param {object} [dataToPersist=null] - Optional data to save for the current step.
   * @returns {Promise<void>} A promise that resolves when the step is advanced.
   */
  const nextStep = useCallback(async (dataToPersist = null) => {
    const stepToSaveFor = currentStep;
    const nextFrontendStep = currentStep + 1;

    // Handles saving data and advancing for intermediate steps (1-3).
    if (stepToSaveFor >= 1 && stepToSaveFor <= 3) {
      if (dataToPersist) {
        try {
          await handleUpdateUserData(dataToPersist, stepToSaveFor);
          setCurrentStep(nextFrontendStep);
        } catch (err) {
          return; // Stop progression if data update fails.
        }
      } else {
        setCurrentStep(nextFrontendStep);
      }
    } else if (stepToSaveFor === 4) { // Handles the final completion step.
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
          setUserListRefreshCounter(prev => prev + 1); // Triggers refresh for UserDataTable after completion.
          // currentStep will remain 4 (completion screen).
        } catch (err) {
          console.error('Failed to mark onboarding complete:', err);
          setError(err.message || 'Failed to finalize onboarding.');
        } finally {
          setLoading(false);
        }
      }
    }
    setError(null); // Clears any previous errors on successful navigation.
  }, [currentStep, userId, handleUpdateUserData]);

  /**
   * Moves the onboarding process back to the previous step.
   */
  const prevStep = useCallback(() => {
    setCurrentStep(prev => Math.max(1, prev - 1)); // Ensures step does not go below 1.
    setError(null); // Clears any errors when moving back.
  }, []);

  // --- Admin Actions (Backend Communication) ---

  /**
   * Updates the global administrative configuration on the backend.
   * @param {object} newConfig - The new configuration object to save.
   * @returns {Promise<void>} A promise that resolves when the configuration is updated.
   * @throws {Error} If the update fails.
   */
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
      setAdminConfig(data.config); // Updates the local admin config state.
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
   * Returns the actual React components to render for a given customizable page,
   * based on the administrative configuration.
   * @param {number} pageNumber - 2 for custom page 1, 3 for custom page 2.
   * @returns {Array<{id: string, Component: React.ComponentType}>} Array of component objects.
   */
  const getComponentsForPage = useCallback((pageNumber) => {
    if (!adminConfig) return [];

    const pageComponents = adminConfig[`page${pageNumber}`] || [];
    const components = [];

    // Dynamically maps string IDs from admin config to actual React components.
    for (const compId of pageComponents) {
      if (compId === 'aboutMe') {
        components.push({ id: 'aboutMe', Component: AboutMeInput });
      } else if (compId === 'address') {
        components.push({ id: 'address', Component: AddressInput });
      } else if (compId === 'birthdate') {
        components.push({ id: 'birthdate', Component: BirthdateInput });
      }
      // Add more else if blocks here if you add more customizable components later.
    }
    return components;
  }, [adminConfig]);

  // --- Helper for UserDataTable (now fetches from backend) ---

  /**
   * Fetches all registered users' data from the backend.
   * @returns {Promise<Array<object>>} A promise that resolves to an array of user objects.
   * @throws {Error} If fetching users fails.
   */
  const getAllUsersData = useCallback(async () => {
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

  /**
   * Deletes a user from the backend.
   * If the deleted user is the currently active user, clears local session data.
   * @param {string} idToDelete - The ID of the user to delete.
   * @returns {Promise<boolean>} A promise that resolves to `true` if deletion was successful, `false` otherwise.
   */
  const deleteUser = useCallback(async (idToDelete) => {
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
      // If the currently active user is deleted, clear local state.
      if (userId === idToDelete) {
        localStorage.removeItem('onboardingUserId');
        setUserId(null);
        setOnboardingData({});
        setCurrentStep(1); // Reset to initial registration step.
      }
      setUserListRefreshCounter(prev => prev + 1); // Triggers refresh for UserDataTable.
      return true; // Indicates success.
    } catch (e) {
      console.error(`Error deleting user ${idToDelete} from backend:`, e);
      setError(`Failed to delete user ${idToDelete}: ${e.message}.`);
      return false; // Indicates failure.
    } finally {
      setLoading(false);
    }
  }, [userId]);

  // Resets all local onboarding state and clears user ID from localStorage.
  const resetOnboarding = useCallback(() => {
    localStorage.removeItem('onboardingUserId');
    setUserId(null);
    setOnboardingData({});
    setCurrentStep(1);
    setError(null);
    setLoading(false);
    console.log('Client-side onboarding state reset.');
  }, []);

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
    getAllUsersData,
    deleteUser,
    userListRefreshCounter, // Exposes the counter to trigger data refreshes.
    resetOnboarding,
  };

  return (
    <OnboardingContext.Provider value={contextValue}>
      {children}
    </OnboardingContext.Provider>
  );
};

/**
 * Custom hook to consume the onboarding context.
 *
 * @returns {object} The onboarding context value.
 * @throws {Error} If used outside of an OnboardingProvider.
 */
export const useOnboarding = () => {
  const context = useContext(OnboardingContext);
  if (!context) {
    throw new Error('useOnboarding must be used within an OnboardingProvider');
  }
  return context;
};