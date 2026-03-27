"use client";
import React from "react";
import { FormEvent } from "react";
import { useState } from "react";
const OnboardForm = () => {
  const [isLoading, setIsLoading] = useState(false);

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
  };

  return (
    <div>
      Hi! Welcome to FitStyle! This is the onboarding form where you can set up
      your profile and preferences.
      <form onSubmit={onSubmit}>
        <select>
          <option value="male">Male</option>
          <option value="female">Female</option>
          <option value="prefer_not_to_say">Prefer Not To Say</option>
        </select>
        <input type="number" placeholder="Height (cm)" />
        <input type="number" placeholder="Weight (kg)" />
        <button type="submit">Submit</button>
        {isLoading ? "Loading..." : null}
      </form>
    </div>
  );
};

export default OnboardForm;
