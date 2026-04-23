"use client";
import { useRef, useEffect } from "react";
import type { RefObject } from "react";
import Webcam from "react-webcam";

type PoseLandmarkerVideoLike = {
  detectForVideo: (source: HTMLVideoElement, timestampMs: number) => unknown;
  setOptions: (options: { runningMode: "VIDEO" }) => void;
};

interface VideoDetectionProps {
  poseLandmarker: PoseLandmarkerVideoLike | null;
  webCamRef: RefObject<Webcam | null>;
  canvasRef: RefObject<HTMLCanvasElement | null>;
  isActive: boolean;
  onResults: (
    result: unknown,
    canvas: HTMLCanvasElement,
    source: HTMLVideoElement,
  ) => void;
}

export function useVideoDetection({
  poseLandmarker,
  webCamRef,
  canvasRef,
  isActive,
  onResults,
}: VideoDetectionProps) {
  const animationFrameId = useRef<number | null>(null);
  const lastVideoTime = useRef<number>(-1);

  useEffect(() => {
    if (!isActive || !poseLandmarker) {
      return;
    }

    poseLandmarker.setOptions({ runningMode: "VIDEO" });

    const detectPose = () => {
      const video = webCamRef.current?.video;
      const canvas = canvasRef.current;

      if (!video || !canvas) {
        animationFrameId.current = requestAnimationFrame(detectPose);
        return;
      }

      if (video.currentTime !== lastVideoTime.current && video.readyState >= 2) {
        try {
          const result = poseLandmarker.detectForVideo(video, performance.now());
          onResults(result, canvas, video);
          lastVideoTime.current = video.currentTime;
        } catch (error) {
          console.error(error);
        }
      }

      animationFrameId.current = requestAnimationFrame(detectPose);
    };

    detectPose();

    return () => {
      if (animationFrameId.current) {
        cancelAnimationFrame(animationFrameId.current);
        animationFrameId.current = null;
      }
    };
  }, [poseLandmarker, webCamRef, canvasRef, isActive, onResults]);
}
