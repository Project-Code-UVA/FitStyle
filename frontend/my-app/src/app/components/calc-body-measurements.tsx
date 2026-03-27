"use client";
import { useMemo } from "react";

type Landmark = {
  x: number;
  y: number;
  z?: number;
  visibility?: number;
};

type SegmentationMask = {
  width: number;
  height: number;
  data?: Float32Array;
  getAsFloat32Array?: () => Float32Array;
};

type PoseResult = {
  landmarks: Landmark[][];
  segmentationMasks?: SegmentationMask[];
};

type Measurements = {
  shoulderWidth: number;
  hipWidth: number;
  legLength: number;
  armLength: number;
};

function isPoseResult(value: unknown): value is PoseResult {
  if (!value || typeof value !== "object") {
    return false;
  }

  const maybeResult = value as { landmarks?: unknown };
  return Array.isArray(maybeResult.landmarks);
}

export function useBodyMeasurements({
  result,
  heightCm,
  videoWidth,
  videoHeight,
}: {
  result: unknown;
  heightCm: number;
  videoWidth: number;
  videoHeight: number;
}) {
  //useMemo is used as a performance optimization tool to cache (memoizes) the result
  //of a function call between re-renders
  //prevents recalculating every time a component re-renders
  const measurements = useMemo(() => {
    if (!isPoseResult(result) || !heightCm || !result.landmarks?.length) {
      return null;
    }

    return calculateBodyMeasurements(result, heightCm, videoWidth, videoHeight);
  }, [result, heightCm, videoWidth, videoHeight]);

  return measurements;
}

function calculateBodyMeasurements(
  result: PoseResult,
  heightCm: number,
  width: number,
  height: number,
) {
  /*
    currently I'll just take measurements for 
    1. shoulder width
    2. hip measurement
    3. leg length
    4. arm length
    */
  if (!result.landmarks.length || !result.segmentationMasks?.length) {
    return null;
  }
  const visibilityThreshold = 0.5;

  const isValid = (landmark?: Landmark) => {
    return (
      landmark &&
      // === strict equality without type coercion
      landmark.visibility !== undefined &&
      landmark.visibility > visibilityThreshold
    );
  };

  if (!result.landmarks?.length && !result.segmentationMasks?.length) {
    return null;
  }

  const landmarks = result.landmarks[0];
  const mask = result.segmentationMasks[0];
  const measurements: Measurements = {
    shoulderWidth: 0,
    hipWidth: 0,
    legLength: 0,
    armLength: 0,
  };

  if (isValid(landmarks[11]) && isValid(landmarks[12])) {
    const leftShoulderX = Math.floor(landmarks[11].x * width);
    const leftShoulderY = Math.floor(landmarks[11].y * height);
    const rightShoulderX = Math.floor(landmarks[12].x * width);
    const rightShoulderY = Math.floor(landmarks[12].y * height);

    measurements.shoulderWidth =
      Math.abs(
        findSegmentationMaskEdge(
          false,
          mask,
          leftShoulderX,
          leftShoulderY,
        ) -
          findSegmentationMaskEdge(
            true,
            mask,
            rightShoulderX,
            rightShoulderY,
          ),
      ) / width;
  }

  if (isValid(landmarks[23]) && isValid(landmarks[24])) {
    const leftHipX = Math.floor(landmarks[23].x * width);
    const leftHipY = Math.floor(landmarks[23].y * height);
    const rightHipX = Math.floor(landmarks[24].x * width);
    const rightHipY = Math.floor(landmarks[24].y * height);

    measurements.hipWidth =
      Math.abs(
        findSegmentationMaskEdge(false, mask, leftHipX, leftHipY) -
          findSegmentationMaskEdge(true, mask, rightHipX, rightHipY),
      ) / width;
  }

  if (isValid(landmarks[24]) && isValid(landmarks[28])) {
    measurements.legLength = calcDistance(landmarks[24], landmarks[28]);
  } else if (isValid(landmarks[23]) && isValid(landmarks[27])) {
    measurements.legLength = calcDistance(landmarks[23], landmarks[27]);
  }

  if (isValid(landmarks[12]) && isValid(landmarks[16])) {
    measurements.armLength = calcDistance(landmarks[12], landmarks[16]);
  } else if (isValid(landmarks[11]) && isValid(landmarks[15])) {
    measurements.armLength = calcDistance(landmarks[11], landmarks[15]);
  }

  if (isValid(landmarks[0]) && isValid(landmarks[27])) {
    const detectedHeight = calcDistance(landmarks[0], landmarks[27]);
    const scaleFactor = heightCm / detectedHeight;

    (Object.keys(measurements) as Array<keyof typeof measurements>).forEach((key) => {
      measurements[key] = measurements[key] * scaleFactor;
    });

    return measurements;
  }

  return null;
}

function calcDistance(p1: Landmark, p2: Landmark) {
  return Math.sqrt(
    Math.pow(p1.x - p2.x, 2) +
      Math.pow(p1.y - p2.y, 2) +
      Math.pow((p1.z || 0) - (p2.z || 0), 2),
  );
}

function findSegmentationMaskEdge(
  right = true,
  mask: SegmentationMask,
  measX: number,
  measY: number,
) {
  // mask is a segmentation mask object; get its float array and dims
  const maskData =
    typeof mask.getAsFloat32Array === "function"
      ? mask.getAsFloat32Array()
      : mask.data;

  if (!maskData) {
    return right ? mask.width - 1 : 0;
  }

  const maskWidth = mask.width;
  const maskHeight = mask.height;
  // clamp coordinates to mask bounds
  const startX = Math.min(Math.max(Math.floor(measX), 0), maskWidth - 1);
  const y = Math.min(Math.max(Math.floor(measY), 0), maskHeight - 1);

  if (right) {
    for (let w = startX; w < maskWidth; w++) {
      const index = y * maskWidth + w;
      if (!maskData[index] || maskData[index] === 0) {
        return w - 1;
      }
    }
  } else {
    for (let w = startX; w >= 0; w--) {
      const index = y * maskWidth + w;
      if (!maskData[index] || maskData[index] === 0) {
        return w + 1;
      }
    }
  }
  return right ? maskWidth - 1 : 0;
}
