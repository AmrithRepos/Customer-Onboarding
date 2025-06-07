// src/components/WizardProgress.js
import React from 'react';
import { useOnboarding } from '../hooks/useOnboarding';

/**
 * Component to display the user's progress through the onboarding wizard.
 * It visually represents the current step and the overall progress.
 *
 * @returns {JSX.Element} A progress indicator bar.
 */
const WizardProgress = () => {
  const { currentStep } = useOnboarding();

  // Define the total number of steps including the 'Complete' state.
  const totalSteps = 4;

  return (
    <div className="flex justify-between items-center mb-6 text-sm font-semibold text-gray-600">
      {/* Step 1 Indicator: Account Creation */}
      <span className={currentStep >= 1 ? "text-blue-600" : ""}>Step 1: Account</span>
      <span className={`h-1 w-1/3 mx-2 rounded-full ${currentStep > 1 ? 'bg-blue-400' : 'bg-gray-300'}`}></span>

      {/* Step 2 Indicator: About You (Dynamic Page 1) */}
      <span className={currentStep >= 2 ? "text-blue-600" : ""}>Step 2: About You</span>
      <span className={`h-1 w-1/3 mx-2 rounded-full ${currentStep > 2 ? 'bg-blue-400' : 'bg-gray-300'}`}></span>

      {/* Step 3 Indicator: Details (Dynamic Page 2) */}
      <span className={currentStep >= 3 ? "text-blue-600" : ""}>Step 3: Details</span>
      <span className={`h-1 w-1/3 mx-2 rounded-full ${currentStep > 3 ? 'bg-blue-400' : 'bg-gray-300'}`}></span>

      {/* Step 4 Indicator: Completion */}
      <span className={currentStep >= 4 ? "text-blue-600" : ""}>Complete!</span>
    </div>
  );
};

export default WizardProgress;