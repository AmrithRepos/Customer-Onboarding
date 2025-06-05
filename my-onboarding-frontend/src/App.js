import React, { useState, useEffect } from 'react'; // Import useState and useEffect
import { BrowserRouter as Router, Routes, Route, Link, NavLink } from 'react-router-dom';

// Import our custom hook and provider
import { OnboardingProvider } from './hooks/useOnboarding';

// Import all the components we've created
import OnboardingSteps from './components/OnboardingSteps';
import AdminPanel from './components/AdminPanel';
import UserDataTable from './components/UserDataTable';

function App() {
  const [currentDateTime, setCurrentDateTime] = useState(new Date());

  useEffect(() => {
    // Update the time every second
    const timer = setInterval(() => {
      setCurrentDateTime(new Date());
    }, 1000);

    // Cleanup the interval when the component unmounts
    return () => {
      clearInterval(timer);
    };
  }, []); // Empty dependency array ensures this runs once on mount and cleans up on unmount

  // Format the date and time for display
  // Options for formatting based on your preference
  const formattedDateTime = currentDateTime.toLocaleString('en-US', {
    weekday: 'short', // e.g., Thu
    month: 'short',   // e.g., Jun
    day: 'numeric',   // e.g., 5
    year: 'numeric',  // e.g., 2025
    hour: '2-digit',  // e.g., 02 PM
    minute: '2-digit',// e.g., 38
    second: '2-digit',// e.g., 56
    hour12: true      // Use 12-hour clock with AM/PM
  });

  return (
    <Router>
      {/* Navigation Bar - Refined for a cleaner, darker look with subtle shadows and transitions */}
      <nav className="bg-gradient-to-r from-gray-800 to-gray-900 shadow-lg p-4 sticky top-0 z-50">
        <div className="container mx-auto flex justify-between items-center max-w-7xl px-4 sm:px-6 lg:px-8">
          {/* Brand Logo/Name and Live Date/Time */}
          <div className="flex items-center space-x-4"> {/* Added a div to group these */}
            <Link to="/" className="text-white text-xl font-extrabold tracking-tight hover:text-blue-300 transition duration-300 ease-in-out">
              Zealthy
            </Link>
            {/* Live Date and Time Display */}
            <span className="text-gray-400 text-sm md:text-base font-mono">
              {formattedDateTime}
            </span>
          </div>


          {/* Navigation Links */}
          <div className="space-x-4 sm:space-x-6 flex items-center">
            <NavLink
              to="/"
              className={({ isActive }) =>
                `px-3 py-2 rounded-md text-sm font-medium transition duration-200 ease-in-out ${
                  isActive ? 'bg-gray-700 text-white shadow-inner' : 'text-gray-300 hover:text-white hover:bg-gray-700'
                }`
              }
            >
              Onboarding Flow
            </NavLink>
            <NavLink
              to="/admin"
              className={({ isActive }) =>
                `px-3 py-2 rounded-md text-sm font-medium transition duration-200 ease-in-out ${
                  isActive ? 'bg-gray-700 text-white shadow-inner' : 'text-gray-300 hover:text-white hover:bg-gray-700'
                }`
              }
            >
              Admin Panel
            </NavLink>
            <NavLink
              to="/data"
              className={({ isActive }) =>
                `px-3 py-2 rounded-md text-sm font-medium transition duration-200 ease-in-out ${
                  isActive ? 'bg-gray-700 text-white shadow-inner' : 'text-gray-300 hover:text-white hover:bg-gray-700'
                }`
              }
            >
              User Data
            </NavLink>
          </div>
        </div>
      </nav>

      {/* Main Content Area - Clean, subtle background, centered content */}
      <main className="min-h-screen bg-gray-50 py-10 px-4 sm:px-6 lg:px-8 flex flex-col items-center">
        {/*
          IMPORTANT: Wrap the entire Routes component with OnboardingProvider.
          This ensures all components rendered by any route have access to the context.
        */}
        <OnboardingProvider>
          <Routes>
            {/* Main User Onboarding Section */}
            <Route path="/" element={<OnboardingSteps />} />

            {/* Admin Section */}
            <Route path="/admin" element={<AdminPanel />} />

            {/* Data Table Section */}
            <Route path="/data" element={<UserDataTable />} />

            {/* Optional: Add a 404/NotFound route */}
            <Route path="*" element={
              <div className="text-center p-8 bg-white rounded-xl shadow-xl max-w-md mx-auto my-10 border border-gray-100">
                <h2 className="text-3xl font-bold text-red-600 mb-4">404 - Page Not Found</h2>
                <p className="text-gray-700 mb-6 text-lg">
                  Oops! The page you are looking for does not exist.
                </p>
                <Link to="/" className="text-blue-600 hover:text-blue-800 transition duration-200 ease-in-out font-medium text-base">
                  Go to Onboarding Flow
                </Link>
              </div>
            } />
          </Routes>
        </OnboardingProvider> {/* <--- OnboardingProvider ends here */}
      </main>
    </Router>
  );
}

export default App;