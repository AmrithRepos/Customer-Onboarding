// src/components/OnboardingSteps.js
import React, { useState, useEffect, useCallback } from 'react';
import { useOnboarding } from '../hooks/useOnboarding';
import InputField from './InputField';
import Button from './Button';
import AboutMeInput from './AboutMeInput';
import AddressInput from './AddressInput';
import BirthdateInput from './BirthdateInput';
import WizardProgress from './WizardProgress';

/**
 * Renders dynamic content for each onboarding page based on admin configuration.
 *
 * @param {object} props - Component props.
 * @param {number} props.pageNumber - The current onboarding page number.
 * @param {object} props.data - The current form data for the onboarding steps.
 * @param {function} props.onDataChange - Callback to update form data.
 * @param {object} props.validationErrors - Object containing validation error messages.
 * @param {object} props.adminConfig - The administrator's configuration for components and required fields.
 * @returns {JSX.Element} Dynamic form content for a page.
 */
const DynamicPageContent = ({ pageNumber, data, onDataChange, validationErrors, adminConfig }) => {
  const { getComponentsForPage } = useOnboarding();
  const componentsToRender = getComponentsForPage(pageNumber);

  // Displays a message if no components are configured for the current page.
  if (!componentsToRender.length) {
    return (
      <p className="text-primary-gray-600 text-center py-4 bg-primary-gray-50 rounded-lg border border-primary-gray-200">
        No components configured for this page. Please check admin settings.
      </p>
    );
  }

  return (
    <div className="space-y-6">
      {componentsToRender.map(({ id, Component }) => {
        // Determines if a field is required based on the admin configuration.
        const isRequired = adminConfig?.requiredFields?.[id] || false;

        // Renders specific components based on their ID.
        if (id === 'address') {
          return (
            <AddressInput
              key={id}
              address={data[id] || {}}
              onAddressChange={(newAddress) => onDataChange(id, newAddress)}
              validationErrors={validationErrors}
              required={isRequired}
            />
          );
        } else if (id === 'aboutMe') {
          return (
            <AboutMeInput
              key={id}
              value={data[id] || ''}
              onChange={(e) => onDataChange(id, e.target.value)}
              validationError={validationErrors[id]}
              required={isRequired}
            />
          );
        } else if (id === 'birthdate') {
          return (
            <BirthdateInput
              key={id}
              value={data[id] || ''}
              onChange={(dateString) => onDataChange(id, dateString)}
              validationError={validationErrors[id]}
              required={isRequired}
            />
          );
        } else if (id === 'name') {
          return (
            <InputField
              key={id}
              label="Name"
              id="name"
              type="text"
              value={data[id] || ''}
              onChange={(e) => onDataChange(id, e.target.value)}
              validationError={validationErrors[id]}
              placeholder="Your name"
              required={isRequired}
            />
          );
        }
        return null; // Fallback for unhandled component IDs.
      })}
    </div>
  );
};

/**
 * OnboardingSteps component guides users through a multi-step registration and data collection process.
 */
const OnboardingSteps = () => {
  const {
    userId,
    onboardingData,
    currentStep,
    loading,
    error,
    adminConfig,
    handleRegisterUser,
    nextStep,
    prevStep,
    resetOnboarding
  } = useOnboarding();

  const [stepFormData, setStepFormData] = useState({});
  const [localError, setLocalError] = useState(null);
  const [emailInputError, setEmailInputError] = useState(null);
  const [validationErrors, setValidationErrors] = useState({});

  // Updates form data when onboardingData from context changes.
  useEffect(() => {
    setStepFormData(onboardingData);
  }, [onboardingData]);

  // Handles general form field changes, clearing related validation errors.
  const handleFormChange = (id, value) => {
    setStepFormData(prevData => ({
      ...prevData,
      [id]: value
    }));

    if (validationErrors[id]) {
      setValidationErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[id];
        return newErrors;
      });
    }

    if (id === 'email') {
      if (emailInputError) setEmailInputError(null);
    }
    if (id === 'age' && localError === "Cannot Onboard You, Please have an adult to register your details.") {
      setLocalError(null);
    }
  };

  // Handles changes specifically for the address input, merging new address data.
  const handleAddressChange = useCallback((newAddress) => {
    setStepFormData(prev => ({
      ...prev,
      address: {
        ...prev.address,
        ...newAddress
      }
    }));
    setValidationErrors(prev => {
      const newErrors = { ...prev };
      for (const key in newAddress) {
        if (newErrors[`address.${key}`]) {
          delete newErrors[`address.${key}`];
          return { ...newErrors, [`address.${key}`]: undefined };
        }
      }
      return newErrors;
    });
  }, []);

  // Handles changes for the birthdate input, storing the date string.
  const handleDateChange = useCallback((dateString) => {
    setStepFormData(prev => ({
      ...prev,
      birthdate: dateString || ''
    }));
    if (validationErrors.birthdate) {
      setValidationErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors.birthdate;
        return newErrors;
      });
    }
  }, [validationErrors]);

  // Validates email format on input blur.
  const validateEmailOnBlur = () => {
    const email = stepFormData.email || '';
    if (!email) {
      setEmailInputError("Email is required.");
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setEmailInputError("Please enter a valid email address.");
    } else {
      setEmailInputError(null);
    }
  };

  // Handles submission of the initial registration form (Step 1).
  const handleInitialSubmit = async (e) => {
    e.preventDefault();
    setLocalError(null);
    setEmailInputError(null);

    const { username, email, password, age } = stepFormData;

    // Client-side validation for registration fields.
    if (!username || !email || !password || !age) {
      setLocalError("Username, email, password, and age are required.");
      if (!username) setValidationErrors(prev => ({ ...prev, username: "Username is required." }));
      if (!email) setEmailInputError("Email is required.");
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setLocalError("Please enter a valid email address.");
      setEmailInputError("Please enter a valid email address.");
      return;
    }
    if (password.length < 6) {
      setLocalError("Password must be at least 6 characters long.");
      return;
    }

    const parsedAge = parseInt(age, 10);
    if (isNaN(parsedAge) || parsedAge < 1) {
      setLocalError("Please enter a valid age.");
      return;
    }
    if (parsedAge < 18) {
      setLocalError("Cannot Onboard You, Please have an adult to register your details.");
      return; // Stops onboarding for underage users.
    }

    if (emailInputError || validationErrors.username) {
      setLocalError("Please fix the validation errors.");
      return;
    }

    try {
      await handleRegisterUser(username, email, password, age);
    } catch (err) {
      setLocalError(err.message || "Registration failed. Please try again.");
    }
  };

  // Handles navigation to the next step, including validation for the current page.
  const handleNextStep = async (e) => {
    e.preventDefault();
    setLocalError(null);
    setValidationErrors({}); // Clears previous validation errors.

    if (!adminConfig) {
      setLocalError("Admin configuration not loaded.");
      return;
    }

    let currentValidationErrors = {};
    const pageComponents = adminConfig[`page${currentStep}`] || [];
    const requiredFields = adminConfig.requiredFields || {};

    // Validates each required component on the current page.
    for (const { id } of pageComponents) {
      if (requiredFields[id]) {
        if (id === 'name') {
          if (!stepFormData.name || stepFormData.name.trim() === '') {
            currentValidationErrors.name = 'Name is required.';
          }
        } else if (id === 'aboutMe') {
          if (!stepFormData.aboutMe || stepFormData.aboutMe.trim().length < 20) {
            currentValidationErrors.aboutMe = 'About Me is required (min 20 characters).';
          }
        } else if (id === 'address') {
          const addressFields = ['street', 'city', 'state', 'zip'];
          const currentAddress = stepFormData.address || {};
          addressFields.forEach(field => {
            if (!currentAddress[field] || currentAddress[field].trim() === '') {
              currentValidationErrors[`address.${field}`] = `${field.charAt(0).toUpperCase() + field.slice(1)} is required.`;
            }
          });
        } else if (id === 'birthdate') {
          if (!stepFormData.birthdate || stepFormData.birthdate.trim() === '') {
            currentValidationErrors.birthdate = 'Birthdate is required.';
          }
        }
      }
    }

    // If validation errors exist, update state and stop progression.
    if (Object.keys(currentValidationErrors).length > 0) {
      setValidationErrors(currentValidationErrors);
      setLocalError("Please fix the validation errors on this page.");
      return;
    }

    try {
      await nextStep(stepFormData);
    } catch (err) {
      setLocalError(err.message || "Failed to save data and proceed. Please try again.");
    }
  };

  // Handles navigation to the previous step.
  const handlePrevStep = useCallback(() => {
    setLocalError(null);
    setValidationErrors({});
    prevStep();
  }, [prevStep]);

  // Displays a loading indicator while configuration is fetched.
  if (loading && adminConfig === null) {
    return (
      <div className="flex items-center justify-center p-8 bg-white rounded-xl shadow-soft-xl w-full max-w-lg mx-auto border border-primary-gray-100 min-h-[300px]">
        <p className="text-primary-gray-600 text-lg animate-pulse">Loading onboarding flow configuration...</p>
      </div>
    );
  }

  return (
    <div className="p-8 bg-white rounded-xl shadow-soft-xl w-full max-w-lg mx-auto border border-primary-gray-100">
      <h2 className="text-3xl font-bold text-primary-gray-800 mb-6 text-center">
        Onboarding Wizard
      </h2>

      {/* Progress indicator for the onboarding steps. */}
      <WizardProgress currentStep={currentStep} totalSteps={adminConfig ? Object.keys(adminConfig).length + 1 : 4} />

      {/* Displays global error messages from context or local state. */}
      {error && (
        <p className="text-error-red text-center mb-4 p-3 bg-error-red-50 border border-error-red-200 rounded-lg text-sm">
          <span className="font-semibold">Error:</span> {error}
        </p>
      )}
      {localError && (
        <p className="text-error-red text-center mb-4 p-3 bg-error-red-50 border border-error-red-200 rounded-lg text-sm">
          <span className="font-semibold">Validation:</span> {localError}
        </p>
      )}

      <form onSubmit={e => e.preventDefault()} className="space-y-6">
        {/* Renders content for Step 1 (Registration). */}
        {currentStep === 1 && (
          <div>
            <h3 className="text-xl font-semibold text-primary-gray-800 mb-5 text-center">Create Your Account</h3>
            <InputField
              label="Username"
              id="username"
              type="text"
              value={stepFormData.username || ''}
              onChange={(e) => handleFormChange('username', e.target.value)}
              validationError={validationErrors.username}
              placeholder="Your username"
              required={true}
            />
            <InputField
              label="Email"
              id="email"
              type="email"
              value={stepFormData.email || ''}
              onChange={(e) => handleFormChange('email', e.target.value)}
              onBlur={validateEmailOnBlur}
              validationError={emailInputError}
              placeholder="user@example.com"
              required={true}
            />
            <InputField
              label="Password"
              id="password"
              type="password"
              value={stepFormData.password || ''}
              onChange={(e) => handleFormChange('password', e.target.value)}
              placeholder="********"
              required={true}
            />
            <InputField
              label="Age"
              id="age"
              type="number"
              value={stepFormData.age || ''}
              onChange={(e) => handleFormChange('age', e.target.value)}
              placeholder=">18e.g., 25"
              required={true}
            />
            <Button onClick={handleInitialSubmit} type="submit" className="w-full mt-6">
              Register & Start Onboarding
            </Button>
          </div>
        )}

        {/* Renders content for Step 2 (Dynamic form fields). */}
        {currentStep === 2 && (
          <div>
            <h3 className="text-xl font-semibold text-primary-gray-800 mb-5 text-center">Tell Us More</h3>
            <DynamicPageContent
              pageNumber={2}
              data={stepFormData}
              onDataChange={(id, value) => {
                if (id === 'address') handleAddressChange(value);
                else if (id === 'birthdate') handleDateChange(value);
                else handleFormChange(id, value);
              }}
              validationErrors={validationErrors}
              adminConfig={adminConfig}
            />
            <div className="flex justify-between mt-8">
              <Button onClick={handlePrevStep} className="bg-primary-gray-500 hover:bg-primary-gray-600 px-6 py-2.5 rounded-xl text-base shadow-soft-sm">Previous</Button>
              <Button onClick={handleNextStep} className="px-6 py-2.5 rounded-xl text-base shadow-soft-sm">Next</Button>
            </div>
          </div>
        )}

        {/* Renders content for Step 3 (Dynamic form fields). */}
        {currentStep === 3 && (
          <div>
            <h3 className="text-xl font-semibold text-primary-gray-800 mb-5 text-center">Final Details</h3>
            <DynamicPageContent
              pageNumber={3}
              data={stepFormData}
              onDataChange={(id, value) => {
                if (id === 'address') handleAddressChange(value);
                else if (id === 'birthdate') handleDateChange(value);
                else handleFormChange(id, value);
              }}
              validationErrors={validationErrors}
              adminConfig={adminConfig}
            />
            <div className="flex justify-between mt-8">
              <Button onClick={handlePrevStep} className="bg-primary-gray-500 hover:bg-primary-gray-600 px-6 py-2.5 rounded-xl text-base shadow-soft-sm">Previous</Button>
              <Button onClick={handleNextStep} className="px-6 py-2.5 rounded-xl text-base shadow-soft-sm">Complete Onboarding</Button>
            </div>
          </div>
        )}

        {/* Renders completion screen for Step 4. */}
        {currentStep === 4 && (
          <div className="text-center py-10">
            <svg className="w-24 h-24 text-success-green mx-auto mb-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
            </svg>
            <h3 className="text-3xl font-bold text-success-green mb-4">Onboarding Complete!</h3>
            <p className="text-primary-gray-700 text-lg mb-6">
              Thank you for completing your onboarding. An agent will be in touch with you shortly.
            </p>
            <Button onClick={resetOnboarding} className="bg-success-green hover:bg-success-green-600 px-8 py-3 rounded-xl text-base shadow-soft-sm">
              Start New Onboarding
            </Button>
          </div>
        )}
      </form>
    </div>
  );
};

export default OnboardingSteps;