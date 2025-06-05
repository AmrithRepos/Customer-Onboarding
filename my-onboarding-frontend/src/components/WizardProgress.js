// src/components/WizardProgress.js
import React from 'react';
import { useOnboarding } from '../hooks/useOnboarding'; // Import our custom onboarding hook

/**
 * Component to display the user's progress in the onboarding wizard.
 *
 * @returns {JSX.Element} A progress indicator.
 */
const WizardProgress = () => {
  const { currentStep } = useOnboarding();

  // Define the steps. Step 1 is account, Step 2 is Custom Page 1, Step 3 is Custom Page 2, Step 4 is Complete
  const totalSteps = 4; // Including the 'Complete' state

  return (
    <div className="flex justify-between items-center mb-6 text-sm font-semibold text-gray-600">
      <span className={currentStep >= 1 ? "text-blue-600" : ""}>Step 1: Account</span>
      <span className={`h-1 w-1/3 mx-2 rounded-full ${currentStep > 1 ? 'bg-blue-400' : 'bg-gray-300'}`}></span>
      <span className={currentStep >= 2 ? "text-blue-600" : ""}>Step 2: About You</span>
      <span className={`h-1 w-1/3 mx-2 rounded-full ${currentStep > 2 ? 'bg-blue-400' : 'bg-gray-300'}`}></span>
      <span className={currentStep >= 3 ? "text-blue-600" : ""}>Step 3: Details</span>
      <span className={`h-1 w-1/3 mx-2 rounded-full ${currentStep > 3 ? 'bg-blue-400' : 'bg-gray-300'}`}></span>
      <span className={currentStep >= 4 ? "text-blue-600" : ""}>Complete!</span>
    </div>
  );
};

export default WizardProgress;