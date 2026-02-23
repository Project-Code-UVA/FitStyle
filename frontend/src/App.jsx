import { useState } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import "./App.css";

import LandingPage from "./pages/LandingPage.jsx";
import LoginPage from "./pages/LoginPage.jsx";
import StylePreferencesForm from "./components/StylePreferencesForm.jsx";
import Home from "./pages/Home.jsx";

// App.jsx is the "brain" of navigation.
// It owns two pieces of state that control which page the user sees:
//   - isLoggedIn: did the user "log in"?
//   - userPreferences: did the user complete the style form?

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userPreferences, setUserPreferences] = useState(null);

  return (
    // BrowserRouter enables URL-based navigation (e.g. /login, /app).
    <BrowserRouter>
      <Routes>

        {/* / → Landing page (public) */}
        <Route path="/" element={<LandingPage />} />

        {/* /login → Login page.
            If already logged in, skip straight to /app. */}
        <Route
          path="/login"
          element={
            isLoggedIn
              ? <Navigate to="/app" replace />
              : <LoginPage onLogin={() => setIsLoggedIn(true)} />
          }
        />

        {/* /app → The main app.
            Not logged in → go to login.
            Logged in but no preferences yet → show the style form.
            Both done → show the camera/Home page. */}
        <Route
          path="/app"
          element={
            !isLoggedIn
              ? <Navigate to="/login" replace />
              : userPreferences === null
                ? <StylePreferencesForm onComplete={setUserPreferences} />
                : <Home userPreferences={userPreferences} />
          }
        />

        {/* Catch-all: any unknown URL redirects to home */}
        <Route path="*" element={<Navigate to="/" replace />} />

      </Routes>
    </BrowserRouter>
  );
}

export default App;
