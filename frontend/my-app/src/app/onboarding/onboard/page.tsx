import React from "react";
import OnboardForm from "../../../components/onboard-form";

const OnboardPage = () => {
  return (
    <div className="bg-[url('/images/pixel_art_large.png')] bg-cover flex flex-col items-center justify-center min-h-screen bg-gray-100">
      <OnboardForm />
    </div>
  );
};

export default OnboardPage;
