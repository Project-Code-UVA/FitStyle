"use client";
import { useEffect } from "react";
import type { RefObject } from "react";

type PoseLandmarkerImageLike = {
  detect: (source: HTMLImageElement) => unknown;
  setOptions: (options: { runningMode: "IMAGE" }) => void;
};

interface ImageDetectionProps {
  poseLandmarker: PoseLandmarkerImageLike | null;
  canvasRef: RefObject<HTMLCanvasElement>;
  image: RefObject<HTMLImageElement>;
  isActive: boolean;
  onResults: (
    result: unknown,
    canvas: HTMLCanvasElement,
    source: HTMLImageElement,
  ) => void;
}

export function useImageDetection({
  poseLandmarker,
  canvasRef,
  image,
  isActive,
  onResults,
}: ImageDetectionProps) {
  useEffect(() => {
    const canvas = canvasRef.current;
    const imageElement = image.current;

    if (!isActive || !poseLandmarker || !imageElement || !canvas) {
      return;
    }

    try {
      poseLandmarker.setOptions({ runningMode: "IMAGE" });
      const result = poseLandmarker.detect(imageElement);
      onResults(result, canvas, imageElement);
    } catch (error) {
      console.error(error);
    }
  }, [poseLandmarker, canvasRef, image, isActive, onResults]);
}
