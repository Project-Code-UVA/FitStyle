"use client";
import { useState, useEffect } from "react";
import { PoseLandmarker, FilesetResolver } from "@mediapipe/tasks-vision";

export function usePoseDetection() {
  const [poseLandmarker, setPoseLandmarker] = useState<PoseLandmarker | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const MODEL_ASSET_PATH =
    "https://storage.googleapis.com/mediapipe-models/pose_landmarker/pose_landmarker_lite/float16/1/pose_landmarker_lite.task";

  useEffect(() => {
    let isMounted = true;

    async function loadModel() {
      try {
        //load the model!!!
        const vision = await FilesetResolver.forVisionTasks(
          "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.0/wasm",
        );
        const model = await PoseLandmarker.createFromOptions(vision, {
          baseOptions: {
            modelAssetPath: MODEL_ASSET_PATH,
            delegate: "GPU",
          },
          runningMode: "VIDEO",
          numPoses: 1,
          outputSegmentationMasks: true,
        });

        if (isMounted) {
          setPoseLandmarker(model);
          setIsLoading(false);
        }
      } catch (error: unknown) {
        if (isMounted) {
          setError(error instanceof Error ? error.message : "Failed to load pose model");
          setIsLoading(false);
        }
      }
    }

    loadModel();

    return () => {
      isMounted = false;
    };
  }, []);

  return { poseLandmarker, isLoading, error };
}
