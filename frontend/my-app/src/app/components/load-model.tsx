"use client";
import React, { useState, useCallback, useEffect } from "react";
import { usePoseDetection } from "./render-pose-image";
import { useVideoDetection } from "./use-video-detection";
import { useImageDetection } from "./use-image-detection";
import { useBodyMeasurements } from "./calc-body-measurements";
import { usePoseRenderer } from "./render-pose-video";
import Webcam from "react-webcam";

interface ModelProps {
  webCamRef: React.RefObject<Webcam | null>;
  canvasRef: React.RefObject<HTMLCanvasElement | null>;
  webCamOn: boolean;
  heightCm: number;
  image: React.RefObject<HTMLImageElement | null>;
}

const Model = ({
  webCamRef,
  canvasRef,
  webCamOn,
  heightCm,
  image,
}: ModelProps) => {
  const { poseLandmarker, isLoading, error } = usePoseDetection();
  const { renderPose } = usePoseRenderer();
  const [currentResult, setCurrentResult] = useState<unknown | null>(null);
  const [videoSize, setVideoSize] = useState({ width: 0, height: 0 });

  const handleResults = useCallback(
    (
      result: unknown,
      canvas: HTMLCanvasElement,
      source: HTMLVideoElement | HTMLImageElement,
    ) => {
      renderPose(result, canvas, source);
      setCurrentResult(result);
      console.log("Current result:", result);
      if (source instanceof HTMLVideoElement) {
        setVideoSize({ width: source.videoWidth, height: source.videoHeight });
      } else if (source instanceof HTMLImageElement) {
        setVideoSize({ width: source.width, height: source.height });
      }
    },
    [renderPose],
  );

  useVideoDetection({
    poseLandmarker,
    webCamRef,
    canvasRef,
    isActive: webCamOn,
    onResults: handleResults,
  });

  useImageDetection({
    poseLandmarker,
    canvasRef,
    image,
    isActive: !webCamOn,
    onResults: handleResults,
  });

  const measurements = useBodyMeasurements({
    result: currentResult,
    heightCm,
    videoWidth: webCamOn ? videoSize.width : image?.current?.width || 0,
    videoHeight: webCamOn ? videoSize.height : image?.current?.height || 0,
  });

  useEffect(() => {
    if (measurements) {
      console.log("Body measurements:", measurements);
    }
  }, [measurements]);

  if (error) {
    console.log(error);
  }

  if (isLoading) {
    console.log("loading");
  }

  return null;
};

export default Model;
