// src/components/OnboardingSteps.js
import React, { useState, useEffect, useCallback } from 'react';
import { useOnboarding } from '../hooks/useOnboarding';
import InputField from './InputField';
import Button from './Button';
import AboutMeInput from './AboutMeInput';
import AddressInput from './AddressInput';
import BirthdateInput from './BirthdateInput'; // Keep if you still might use this dynamically
import WizardProgress from './WizardProgress';

// Helper component to render dynamic content based on admin config
const DynamicPageContent = ({ pageNumber, data, onDataChange }) => {
  const { getComponentsForPage } = useOnboarding();
  const componentsToRender = getComponentsForPage(pageNumber);

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
        const propName = id;

        if (id === 'address') {
          return (
            <Component
              key={id}
              address={data[propName] || {}}
              onAddressChange={(newAddress) => onDataChange(propName, newAddress)}
            />
          );
        } else {
          return (
            <Component
              key={id}
              value={data[propName] || ''}
              onChange={(e) => onDataChange(propName, e.target.value)}
            />
          );
        }
      })}
    </div>
  );
};


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
  // No more onboardingCancelled state for age check, it's a localError on step 1

  useEffect(() => {
    setStepFormData(onboardingData);
  }, [onboardingData]);

  const handleFormChange = (id, value) => {
    setStepFormData(prevData => ({
      ...prevData,
      [id]: value
    }));

    if (id === 'email') {
      if (emailInputError) setEmailInputError(null);
    }
    // Clear local error when user changes age input
    if (id === 'age' && localError === "Cannot Onboard You, Please have an adult to register your details.") {
      setLocalError(null);
    }
  };

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


  const handleInitialSubmit = async (e) => {
    e.preventDefault();
    console.log('1. handleInitialSubmit called.');
    setLocalError(null); // Clear previous local errors
    setEmailInputError(null); // Clear previous real-time email error

    const { email, password, age } = stepFormData; // Destructure 'age'

    // --- Validation for Registration Page ---
    if (!email || !password || !age) {
      setLocalError("Email, password, and age are required.");
      if (!email) setEmailInputError("Email is required.");
      console.log('2. Validation failed: Email, password, or age missing.');
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        setLocalError("Please enter a valid email address.");
        setEmailInputError("Please enter a valid email address.");
        console.log('2. Validation failed: Invalid email format.');
        return;
    }
    if (password.length < 6) {
        setLocalError("Password must be at least 6 characters long.");
        console.log('2. Validation failed: Password too short.');
        return;
    }

    const parsedAge = parseInt(age, 10);
    if (isNaN(parsedAge) || parsedAge < 1) {
        setLocalError("Please enter a valid age.");
        console.log('2. Validation failed: Invalid age number.');
        return;
    }
    if (parsedAge < 18) {
        setLocalError("Cannot Onboard You, Please have an adult to register your details.");
        console.log('2. Validation failed: User is under 18.');
        return; // STOP onboarding process immediately
    }
    // --- End Validation for Registration Page ---

    if (emailInputError) { // Check if there are any real-time email validation errors still present
      setLocalError("Please fix the email validation error.");
      console.log('2. Validation failed: Real-time email error still present.');
      return;
    }

    console.log('3. Client-side validation passed. Attempting to register user...');
    try {
      await handleRegisterUser(email, password, age); // Pass age to handleRegisterUser if needed for mock data
      console.log('4. handleRegisterUser completed. Current step is now handled by the hook.');
    } catch (err) {
      setLocalError(err.message || "Registration failed. Please try again.");
      console.error('5. Error during handleRegisterUser:', err);
    }
  };


  const handleNextStep = async (e) => {
    e.preventDefault();
    setLocalError(null);

    let dataToPersist = {};
    const pageComponents = adminConfig ? (adminConfig[`page${currentStep}`] || []) : [];

    let isValid = true;
    for (const compId of pageComponents) {
      const id = compId;

      if (id === 'address') {
        const addressFields = ['street', 'city', 'state', 'zip'];
        const currentAddress = stepFormData.address || {};
        const missingAddressFields = addressFields.filter(field => !currentAddress[field]);

        if (missingAddressFields.length > 0) {
          setLocalError(`Please fill in all address fields: ${missingAddressFields.map(f => f.charAt(0).toUpperCase() + f.slice(1)).join(', ')}.`);
          isValid = false;
          break;
        }
        dataToPersist.address = currentAddress;
      } else if (id === 'aboutMe') {
        if (!stepFormData[id] || stepFormData[id].trim().length < 20) {
          setLocalError(`Please tell us a bit more about yourself (min 20 characters).`);
          isValid = false;
          break;
        }
        dataToPersist[id] = stepFormData[id];
      }
      // Removed birthdate validation here, as age is now handled at registration
      else if (id === 'birthdate') { // Still allow birthdate input if configured, but no age validation
        if (!stepFormData[id]) {
          setLocalError(`Please provide your birthdate.`);
          isValid = false;
          break;
        }
        dataToPersist[id] = stepFormData[id];
      }
    }

    if (!isValid) {
      return;
    }

    try {
      await nextStep(dataToPersist);
    } catch (err) {
      setLocalError(err.message || "Failed to save data and proceed. Please try again.");
    }
  };

  const handlePrevStep = useCallback(() => {
    setLocalError(null);
    prevStep();
  }, [prevStep]);


  if (loading || adminConfig === null) {
    return (
      <div className="flex items-center justify-center p-8 bg-white rounded-xl shadow-soft-xl w-full max-w-lg mx-auto border border-primary-gray-100 min-h-[300px]">
        <p className="text-primary-gray-600 text-lg animate-pulse">Loading onboarding flow configuration...</p>
      </div>
    );
  }

  // No special cancellation screen here for age, it's a local error on step 1

  return (
    <div className="p-8 bg-white rounded-xl shadow-soft-xl w-full max-w-lg mx-auto border border-primary-gray-100">
      <h2 className="text-3xl font-bold text-primary-gray-800 mb-6 text-center">
        Onboarding Wizard
      </h2>

      <WizardProgress />

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
        {currentStep === 1 && (
          <div>
            <h3 className="text-xl font-semibold text-primary-gray-800 mb-5 text-center">Create Your Account</h3>
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
              placeholder="e.g., 25"
              required={true}
            />
            <Button onClick={handleInitialSubmit} type="submit" className="w-full mt-6">
              Register & Start Onboarding
            </Button>
          </div>
        )}

        {currentStep === 2 && (
          <div>
            <h3 className="text-xl font-semibold text-primary-gray-800 mb-5 text-center">Tell Us More</h3>
            <DynamicPageContent
              pageNumber={2}
              data={stepFormData}
              onDataChange={handleFormChange}
            />
            <div className="flex justify-between mt-8">
              <Button onClick={handlePrevStep} className="bg-primary-gray-500 hover:bg-primary-gray-600 px-6 py-2.5 rounded-xl text-base shadow-soft-sm">Previous</Button>
              <Button onClick={handleNextStep} className="px-6 py-2.5 rounded-xl text-base shadow-soft-sm">Next</Button>
            </div>
          </div>
        )}

        {currentStep === 3 && (
          <div>
            <h3 className="text-xl font-semibold text-primary-gray-800 mb-5 text-center">Final Details</h3>
            <DynamicPageContent
              pageNumber={3}
              data={stepFormData}
              onDataChange={handleFormChange}
            />
            <div className="flex justify-between mt-8">
              <Button onClick={handlePrevStep} className="bg-primary-gray-500 hover:bg-primary-gray-600 px-6 py-2.5 rounded-xl text-base shadow-soft-sm">Previous</Button>
              <Button onClick={handleNextStep} className="px-6 py-2.5 rounded-xl text-base shadow-soft-sm">Complete Onboarding</Button>
            </div>
          </div>
        )}

        {currentStep === 4 && (
          <div className="text-center py-10">
            <svg className="w-24 h-24 text-success-green mx-auto mb-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
            </svg>
            <h3 className="text-3xl font-bold text-success-green mb-4">Onboarding Complete!</h3>
            <p className="text-primary-gray-700 text-lg mb-6">
              Thank you for completing your onboarding. Your data has been saved (mocked).
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