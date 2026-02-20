import { useState } from "react";

// --- DATA ---
// These are plain JS arrays/objects — no React magic here, just data we display.

const STEPS = ["Style Vibe", "Colors", "Fit", "Occasions"];

const STYLE_OPTIONS = [
  { id: "casual",    label: "Casual",    icon: "👕", desc: "Relaxed & comfortable" },
  { id: "formal",    label: "Formal",    icon: "👔", desc: "Professional & polished" },
  { id: "athletic",  label: "Athletic",  icon: "🏃", desc: "Active & sporty" },
  { id: "trendy",    label: "Trendy",    icon: "✨", desc: "Fashion-forward" },
  { id: "classic",   label: "Classic",   icon: "🎩", desc: "Timeless elegance" },
  { id: "bohemian",  label: "Bohemian",  icon: "🌿", desc: "Free-spirited & artsy" },
];

const COLOR_OPTIONS = [
  { id: "neutrals",   label: "Neutrals",      colors: ["#F5F5F0", "#D4C5B0", "#8B7355", "#4A3728"] },
  { id: "bold",       label: "Bold & Bright", colors: ["#FF3B30", "#FF9500", "#34C759", "#007AFF"] },
  { id: "pastels",    label: "Pastels",        colors: ["#FFB3C6", "#B5EAD7", "#C7CEEA", "#FFDAC1"] },
  { id: "dark",       label: "Dark & Moody",  colors: ["#1C1C1E", "#2C2C2E", "#3A3A3C", "#636366"] },
  { id: "earth",      label: "Earth Tones",   colors: ["#A0522D", "#8FBC8F", "#D2B48C", "#6B8E23"] },
  { id: "monochrome", label: "Monochrome",    colors: ["#000000", "#555555", "#AAAAAA", "#FFFFFF"] },
];

const FIT_OPTIONS = [
  { id: "slim",      label: "Slim Fit",     desc: "Close to the body, structured look" },
  { id: "regular",   label: "Regular Fit",  desc: "Classic, comfortable cut" },
  { id: "relaxed",   label: "Relaxed Fit",  desc: "Loose, easy-going silhouette" },
  { id: "oversized", label: "Oversized",    desc: "Extra roomy, streetwear-inspired" },
];

const OCCASION_OPTIONS = [
  { id: "work",     label: "Work / Office",       icon: "💼" },
  { id: "everyday", label: "Everyday Casual",      icon: "☀️" },
  { id: "date",     label: "Date Night",           icon: "🌙" },
  { id: "workout",  label: "Workout",              icon: "💪" },
  { id: "events",   label: "Special Events",       icon: "🎉" },
  { id: "outdoor",  label: "Outdoor / Travel",     icon: "🌍" },
];

// --- COMPONENT ---
// Props: onComplete — a function the parent (App.jsx) passes in.
//        When the user finishes, we call it with their preferences data.
function StylePreferencesForm({ onComplete }) {
  // useState gives us a variable + a setter function.
  // Changing state causes React to re-render the component with the new value.

  // `step` tracks which page of the form we're on (0–3).
  const [step, setStep] = useState(0);

  // `preferences` holds all the user's answers as one object.
  const [preferences, setPreferences] = useState({
    styles: [],    // array — can pick multiple
    colors: [],    // array — can pick multiple
    fit: "",       // string — only one choice
    occasions: [], // array — can pick multiple
  });

  // Toggles an item in one of the array fields.
  // If it's already selected → remove it. If not → add it.
  function toggleArrayItem(key, value) {
    setPreferences((prev) => {
      const arr = prev[key];
      const alreadySelected = arr.includes(value);
      return {
        ...prev, // spread keeps all other keys unchanged
        [key]: alreadySelected
          ? arr.filter((v) => v !== value)
          : [...arr, value],
      };
    });
  }

  // Move to the next step, or call onComplete when we're on the last step.
  function handleNext() {
    if (step < STEPS.length - 1) {
      setStep(step + 1);
    } else {
      onComplete(preferences); // send data up to the parent
    }
  }

  function handleBack() {
    if (step > 0) setStep(step - 1);
  }

  // Prevent advancing if the user hasn't made a selection on the current step.
  function canProceed() {
    if (step === 0) return preferences.styles.length > 0;
    if (step === 1) return preferences.colors.length > 0;
    if (step === 2) return preferences.fit !== "";
    if (step === 3) return preferences.occasions.length > 0;
    return true;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-stone-50 to-stone-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-xl w-full max-w-2xl overflow-hidden">

        {/* ── Header ── */}
        <div className="bg-gradient-to-r from-stone-900 to-stone-700 p-8 text-white">
          <h1 className="text-3xl font-bold tracking-tight">FitStyle</h1>
          <p className="text-stone-400 mt-1 text-sm">Let's build your style profile</p>

          {/* Progress bar — one segment per step */}
          <div className="mt-5 flex gap-2">
            {STEPS.map((_, i) => (
              <div
                key={i}
                className={`h-1.5 flex-1 rounded-full transition-all duration-500 ${
                  i <= step ? "bg-white" : "bg-stone-600"
                }`}
              />
            ))}
          </div>
          <p className="text-stone-400 text-xs mt-2">
            Step {step + 1} of {STEPS.length} — {STEPS[step]}
          </p>
        </div>

        {/* ── Form Body ── */}
        <div className="p-8">

          {/* STEP 0 — Style Vibe */}
          {step === 0 && (
            <div>
              <h2 className="text-xl font-semibold text-stone-800">What's your style vibe?</h2>
              <p className="text-stone-400 text-sm mt-1 mb-6">Pick all that apply</p>
              <div className="grid grid-cols-2 gap-3">
                {STYLE_OPTIONS.map((opt) => {
                  const selected = preferences.styles.includes(opt.id);
                  return (
                    <button
                      key={opt.id}
                      onClick={() => toggleArrayItem("styles", opt.id)}
                      className={`p-4 rounded-2xl border-2 text-left transition-all duration-200 ${
                        selected
                          ? "border-stone-800 bg-stone-800 text-white"
                          : "border-stone-200 hover:border-stone-400 text-stone-800"
                      }`}
                    >
                      <div className="text-2xl mb-1">{opt.icon}</div>
                      <div className="font-semibold text-sm">{opt.label}</div>
                      <div className={`text-xs mt-0.5 ${selected ? "text-stone-300" : "text-stone-400"}`}>
                        {opt.desc}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* STEP 1 — Colors */}
          {step === 1 && (
            <div>
              <h2 className="text-xl font-semibold text-stone-800">Color palette preference</h2>
              <p className="text-stone-400 text-sm mt-1 mb-6">What colors do you gravitate toward?</p>
              <div className="grid grid-cols-2 gap-3">
                {COLOR_OPTIONS.map((opt) => {
                  const selected = preferences.colors.includes(opt.id);
                  return (
                    <button
                      key={opt.id}
                      onClick={() => toggleArrayItem("colors", opt.id)}
                      className={`p-4 rounded-2xl border-2 text-left transition-all duration-200 ${
                        selected
                          ? "border-stone-800 ring-2 ring-stone-800"
                          : "border-stone-200 hover:border-stone-400"
                      }`}
                    >
                      {/* Color swatches */}
                      <div className="flex gap-1.5 mb-2">
                        {opt.colors.map((hex, i) => (
                          <div
                            key={i}
                            className="w-6 h-6 rounded-full border border-stone-200"
                            style={{ backgroundColor: hex }}
                          />
                        ))}
                      </div>
                      <div className="font-semibold text-sm text-stone-800">{opt.label}</div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* STEP 2 — Fit */}
          {step === 2 && (
            <div>
              <h2 className="text-xl font-semibold text-stone-800">Preferred fit</h2>
              <p className="text-stone-400 text-sm mt-1 mb-6">How do you like your clothes to fit?</p>
              <div className="flex flex-col gap-3">
                {FIT_OPTIONS.map((opt) => {
                  const selected = preferences.fit === opt.id;
                  return (
                    <button
                      key={opt.id}
                      onClick={() => setPreferences((prev) => ({ ...prev, fit: opt.id }))}
                      className={`p-4 rounded-2xl border-2 text-left transition-all duration-200 flex items-center gap-4 ${
                        selected
                          ? "border-stone-800 bg-stone-800 text-white"
                          : "border-stone-200 hover:border-stone-400 text-stone-800"
                      }`}
                    >
                      {/* Radio dot */}
                      <div
                        className={`w-4 h-4 rounded-full border-2 flex-shrink-0 transition-all ${
                          selected ? "border-white bg-white" : "border-stone-400"
                        }`}
                      />
                      <div>
                        <div className="font-semibold text-sm">{opt.label}</div>
                        <div className={`text-xs mt-0.5 ${selected ? "text-stone-300" : "text-stone-500"}`}>
                          {opt.desc}
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* STEP 3 — Occasions */}
          {step === 3 && (
            <div>
              <h2 className="text-xl font-semibold text-stone-800">When do you dress up?</h2>
              <p className="text-stone-400 text-sm mt-1 mb-6">Select the occasions you dress for most</p>
              <div className="grid grid-cols-2 gap-3">
                {OCCASION_OPTIONS.map((opt) => {
                  const selected = preferences.occasions.includes(opt.id);
                  return (
                    <button
                      key={opt.id}
                      onClick={() => toggleArrayItem("occasions", opt.id)}
                      className={`p-4 rounded-2xl border-2 text-left transition-all duration-200 ${
                        selected
                          ? "border-stone-800 bg-stone-800 text-white"
                          : "border-stone-200 hover:border-stone-400 text-stone-800"
                      }`}
                    >
                      <div className="text-2xl mb-1">{opt.icon}</div>
                      <div className="font-semibold text-sm">{opt.label}</div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* ── Navigation Buttons ── */}
        <div className="px-8 pb-8 flex justify-between items-center">
          <button
            onClick={handleBack}
            className={`px-6 py-3 rounded-2xl font-semibold text-sm transition-all ${
              step === 0
                ? "opacity-0 pointer-events-none"
                : "bg-stone-100 text-stone-700 hover:bg-stone-200"
            }`}
          >
            ← Back
          </button>

          <button
            onClick={handleNext}
            disabled={!canProceed()}
            className={`px-8 py-3 rounded-2xl font-semibold text-sm transition-all ${
              canProceed()
                ? "bg-stone-800 text-white hover:bg-stone-700 active:scale-95"
                : "bg-stone-200 text-stone-400 cursor-not-allowed"
            }`}
          >
            {step === STEPS.length - 1 ? "Get My Style →" : "Next →"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default StylePreferencesForm;
