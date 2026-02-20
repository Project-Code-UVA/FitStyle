import { useState } from "react";
import "./App.css";
import Home from "./pages/Home.jsx";
import StylePreferencesForm from "./components/StylePreferencesForm.jsx";

function App() {
  // null means the form hasn't been completed yet.
  // Once completed, this holds the user's preference data.
  const [userPreferences, setUserPreferences] = useState(null);

  // This function is passed as a prop to StylePreferencesForm.
  // When the user hits "Get My Style", the form calls this with their answers.
  function handleFormComplete(preferences) {
    console.log("User preferences saved:", preferences);
    setUserPreferences(preferences);
  }

  // Conditional rendering: show the form until preferences are saved,
  // then show the main app (Home).
  if (userPreferences === null) {
    return <StylePreferencesForm onComplete={handleFormComplete} />;
  }

  return <Home userPreferences={userPreferences} />;
}

export default App;
