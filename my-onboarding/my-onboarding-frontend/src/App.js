import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, NavLink } from 'react-router-dom';

import { OnboardingProvider } from './hooks/useOnboarding';
import { ThemeProvider } from './hooks/theme';
import ThemeToggleButton from './components/ThemeToggleButton';

import OnboardingSteps from './components/OnboardingSteps';
import AdminPanel from './components/AdminPanel';
import UserDataTable from './components/UserDataTable';

function App() {
  // Manages the current date and time displayed in the header.
  const [currentDateTime, setCurrentDateTime] = useState(new Date());

  // Sets up an interval to update the time every second.
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentDateTime(new Date());
    }, 1000);

    // Cleans up the interval when the component unmounts.
    return () => {
      clearInterval(timer);
    };
  }, []); // Empty dependency array ensures this runs once.

  // Formats the date and time for display in the navigation bar.
  const formattedDateTime = currentDateTime.toLocaleString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: true
  });

  return (
    <Router>
      {/* Provides theme context to all child components. */}
      <ThemeProvider>
        {/* Main application layout with theme-dependent styling. */}
        <div className="min-h-screen bg-primary-gray-50 dark:bg-primary-gray-900 text-primary-gray-900 dark:text-primary-gray-100 transition-colors duration-200">
          {/* Main navigation bar. */}
          <nav className="bg-gradient-to-r from-primary-gray-800 to-primary-gray-900 shadow-lg p-4 sticky top-0 z-50">
            {/* Responsive container for navigation elements. */}
            <div className="container mx-auto flex flex-col md:flex-row md:justify-between items-center max-w-7xl px-4 sm:px-6 lg:px-8">

              {/* Brand logo/name and live date/time display. */}
              <div className="flex flex-col md:flex-row items-center space-y-2 md:space-y-0 md:space-x-4 mb-4 md:mb-0">
                {/* Application brand link. */}
                <Link to="/" className="text-white text-xl font-extrabold tracking-tight hover:text-blue-300 transition duration-300 ease-in-out">
                  Zealthy
                </Link>
                {/* Displays the live date and time. */}
                <span className="text-primary-gray-400 text-xs sm:text-sm md:text-base font-mono">
                  {formattedDateTime}
                </span>
              </div>

              {/* Navigation links for different sections. */}
              <div className="flex flex-col w-full md:flex-row md:w-auto md:space-x-4 sm:space-x-6 items-center">
                {/* Link to the Client Onboarding page. */}
                <NavLink
                  to="/"
                  className={({ isActive }) =>
                    `px-3 py-2 rounded-md text-sm font-medium transition duration-200 ease-in-out
                    w-full text-center md:w-auto mt-2 md:mt-0 ${
                      isActive ? 'bg-primary-gray-700 text-white shadow-inner' : 'text-primary-gray-300 hover:text-white hover:bg-primary-gray-700'
                    }`
                  }
                >
                  Client Onboarding
                </NavLink>
                {/* Link to the Admin Panel page. */}
                <NavLink
                  to="/admin"
                  className={({ isActive }) =>
                    `px-3 py-2 rounded-md text-sm font-medium transition duration-200 ease-in-out
                    w-full text-center md:w-auto mt-2 md:mt-0 ${
                      isActive ? 'bg-primary-gray-700 text-white shadow-inner' : 'text-primary-gray-300 hover:text-white hover:bg-primary-gray-700'
                    }`
                  }
                >
                  Admin Panel
                </NavLink>
                {/* Link to the User Data page. */}
                <NavLink
                  to="/data"
                  className={({ isActive }) =>
                    `px-3 py-2 rounded-md text-sm font-medium transition duration-200 ease-in-out
                    w-full text-center md:w-auto mt-2 md:mt-0 ${
                      isActive ? 'bg-primary-gray-700 text-white shadow-inner' : 'text-primary-gray-300 hover:text-white hover:bg-primary-gray-700'
                    }`
                  }
                >
                  User Data
                </NavLink>
              </div>
            </div>
          </nav>

          {/* Main content area, renders components based on the current route. */}
          <main className="py-10 px-4 sm:px-6 lg:px-8 flex flex-col items-center">
            {/* Provides onboarding-related context to all routed components. */}
            <OnboardingProvider>
              <Routes>
                {/* Route for the default onboarding flow. */}
                <Route path="/" element={<OnboardingSteps />} />

                {/* Route for the administrative panel. */}
                <Route path="/admin" element={<AdminPanel />} />

                {/* Route for viewing user data. */}
                <Route path="/data" element={<UserDataTable />} />

                {/* Catch-all route for any undefined paths. */}
                <Route path="*" element={
                  <div className="text-center p-8 bg-white dark:bg-primary-gray-800 rounded-xl shadow-xl max-w-md mx-auto my-10 border border-primary-gray-100 dark:border-primary-gray-700">
                    <h2 className="text-3xl font-bold text-error-red-600 mb-4">404 - Page Not Found</h2>
                    <p className="text-primary-gray-700 dark:text-primary-gray-200 mb-6 text-lg">
                      Oops! The page you are looking for does not exist.
                    </p>
                    <Link to="/" className="text-blue-600 hover:text-blue-800 transition duration-200 ease-in-out font-medium text-base">
                      Go to Onboarding Flow
                    </Link>
                  </div>
                } />
              </Routes>
            </OnboardingProvider>
          </main>
          {/* Theme toggle button for switching between light/dark modes. */}
          <div className="fixed bottom-4 right-4 z-50">
            <ThemeToggleButton />
          </div>
        </div>
      </ThemeProvider>
    </Router>
  );
}

export default App;