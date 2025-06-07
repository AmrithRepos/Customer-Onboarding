# Frontend Application: Dynamic Onboarding(React)

## 1. Overview

The frontend serves as the interactive client for the Dynamic Onboarding Wizard. It dynamically renders onboarding steps based on configurations fetched from the backend, allows users to input their information, and provides an administrative view for content customization and user data oversight.

---

## 2. Key Features

* **Responsive Multi-Step Form**: Guides users through onboarding with clear navigation.
* **Dynamic Content Loading**: Onboarding pages (Steps 2 and 3) dynamically load input components based on backend configurations.
* **Centralized State Management**: Uses React Context API for managing global onboarding state (current step, user data, admin settings).
* **User Session Persistence**: Remembers the user's `userId` in `localStorage` to resume onboarding across sessions.
* **Administrator Interface**: A dedicated page for admins to:
    * Adjust the sequence and presence of input fields on dynamic onboarding pages.
    * View a table of all registered users.
    * Delete user records.
* **Clean UI**: Styled with Tailwind CSS for a modern and maintainable design.

---

## 3. Technologies Used

* **React 18+**: For building the user interface.
* **Create React App (CRA)**: The underlying setup for rapid React development.
* **Tailwind CSS 3+**: For utility-first CSS styling.
* **JavaScript (ES6+)**: The primary language for application logic.
* **Fetch API / Async/Await**: For making asynchronous HTTP requests to the Flask backend.

---

##4. Components and Hooks

##Components

* **AboutMeInput.js**: A reusable UI component designed to collect "about me" information.
* **AdminPanel.js**: Provides the administrative interface.
* **AddressInput.js**:  A specific UI component for collecting address details.
* **BirthdateInput.js**: A reusable UI component for capturing a user's birthdate.
* **WizardProgress.js**: This component provides a visual representation of the user's progress.
* **Button.js**:  A highly reusable UI component for creating interactive buttons across the application.
* **ThemeToggler.js**: A UI component that allows users to switch between different visual themes of the application.
* **UserDataTable.js**: This component is responsible for displaying a tabular view of all registered user data.
* **OnboardigSteps**:  This is a pivotal component that dynamically orchestrates and renders the multi-step user onboarding wizard.
* **InputField**:  This is a generic, reusable UI component for a standard text input field.

  ##Hooks

  * **useOnboarding.js**: This is the primary custom hook that centralizes the logic and state management for the entire user onboarding process.
  * **Theme.js**: This custom hook is responsible for managing the application's visual theme


## 5. Setup and Installation

### Prerequisites

* **Node.js**: Version 14 or higher (LTS recommended). You can download it from [nodejs.org](https://nodejs.org/).
* **npm** or **Yarn**: Node.js package manager (npm comes with Node.js; Yarn can be installed separately).
* **Running Backend**: En
