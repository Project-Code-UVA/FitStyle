"use client";

import { LogoutButton } from "@/components/logout-button";
import React from "react";
import { useSearchParams } from "next/navigation";
import { josefin, dawn } from "./styles/font";

const page = () => {
  const searchParams = useSearchParams();

  const measurements = {
    body_shape: searchParams.get("body_shape") ?? "Unknown",
    shoulder_width: Number(searchParams.get("shoulder_width") ?? "0"),
    hip_width: Number(searchParams.get("hip_width") ?? "0"),
    leg_length: Number(searchParams.get("leg_length") ?? "0"),
    arm_length: Number(searchParams.get("arm_length") ?? "0"),
  };

  return (
    <div className="h-screen flex flex-col items-center justify-center gap-4">
      <div
        className={`bg-white p-6 rounded-lg shadow-md w-200 h-100 ${josefin.className}`}
      >
        <LogoutButton />

        <p className={`text-2xl font-bold text-center ${dawn.className}`}>
          Your Body Measurements
        </p>
        <p className="text-lg">
          <span className="font-semibold">Body Shape:</span>{" "}
          {measurements.body_shape}
        </p>
        <p className="text-lg">
          <span className="font-semibold">Shoulder Width:</span>{" "}
          {measurements.shoulder_width.toFixed(2)} cm
        </p>
        <p className="text-lg">
          <span className="font-semibold">Hip Width:</span>{" "}
          {measurements.hip_width.toFixed(2)} cm
        </p>
        <p className="text-lg">
          <span className="font-semibold">Leg Length:</span>{" "}
          {measurements.leg_length.toFixed(2)} cm
        </p>
        <p className="text-lg">
          <span className="font-semibold">Arm Length:</span>{" "}
          {measurements.arm_length.toFixed(2)} cm
        </p>
        <h2>Clothing Recommendations Coming Soon! Stay Tuned!</h2>
      </div>
    </div>
  );
};

export default page;
