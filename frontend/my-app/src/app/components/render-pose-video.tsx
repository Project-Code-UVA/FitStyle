"use client";
import { useCallback } from "react";
import { DrawingUtils, PoseLandmarker } from "@mediapipe/tasks-vision";

type SegmentationMaskLike = {
  width: number;
  height: number;
  getAsFloat32Array?: () => Float32Array;
  getAsUint8Array?: () => Uint8Array;
  close?: () => void;
};

type PoseRenderResult = {
  landmarks?: unknown[];
  segmentationMasks?: unknown[];
};

function isSegmentationMask(mask: unknown): mask is SegmentationMaskLike {
  if (!mask || typeof mask !== "object") {
    return false;
  }

  const candidate = mask as { width?: unknown; height?: unknown };
  return typeof candidate.width === "number" && typeof candidate.height === "number";
}

export function usePoseRenderer() {
  const renderPose = useCallback(
    (
      result: unknown,
      canvas: HTMLCanvasElement,
      source: HTMLVideoElement | HTMLImageElement,
    ) => {
      if (!canvas || !source || !result) return;
      const poseResult = result as PoseRenderResult;
      //get drawing context
      const canvasCtx = canvas.getContext("2d");

      //clear prev drawings
      canvasCtx?.clearRect(0, 0, canvas.width, canvas.height);
      const isVideo = source instanceof HTMLVideoElement;
      const isImage =
        source instanceof HTMLImageElement || source instanceof ImageBitmap;

      if (isVideo) {
        canvas.width = source.videoWidth;
        canvas.height = source.videoHeight;
      } else if (isImage) {
        canvas.width = source.width;
        canvas.height = source.height;
      }
      //drawing utils
      const drawingUtils = new DrawingUtils(canvasCtx);
      //draw the nose, eyes, etc landmarks
      if (
        Array.isArray(poseResult.segmentationMasks) &&
        poseResult.segmentationMasks.length > 0
      ) {
        canvasCtx?.save();

        //draw the segmentation masks now
        for (const mask of poseResult.segmentationMasks) {
          if (isSegmentationMask(mask)) {
            drawSegmentationMask(mask, canvasCtx, canvas);
          }
        }
        canvasCtx?.restore();
      }

      if (!Array.isArray(poseResult.landmarks)) {
        return;
      }

      for (const landmark of poseResult.landmarks) {
        drawingUtils.drawLandmarks(landmark as never, {
          //control the radius based on depth (z)
          radius: (data: unknown) => {
            const z =
              data &&
              typeof data === "object" &&
              "from" in data &&
              (data as { from?: { z?: number } }).from &&
              typeof (data as { from?: { z?: number } }).from?.z === "number"
                ? (data as { from: { z: number } }).from.z
                : 0;

            return DrawingUtils.lerp(z, -0.15, 0.1, 5, 1);
          },
        });
        //connect the landmarks with lines
        drawingUtils.drawConnectors(landmark as never, PoseLandmarker.POSE_CONNECTIONS);
      }
    },
    [],
  );

  return { renderPose };
}

function drawSegmentationMask(
  mask: SegmentationMaskLike,
  canvasCtx: CanvasRenderingContext2D | null,
  canvas: HTMLCanvasElement,
) {
  if (!mask || !canvasCtx || !canvas) return;

  const maskData =
    typeof mask.getAsFloat32Array === "function"
      ? mask.getAsFloat32Array()
      : mask.getAsUint8Array
        ? mask.getAsUint8Array()
        : null;

  if (!maskData) return;

  const width = mask.width;
  const height = mask.height;
  const imgData = canvasCtx.createImageData(width, height);

  for (let i = 0; i < maskData.length; i++) {
    const maskValue = Math.max(0, Math.min(1, maskData[i])) * 255;
    imgData.data[i * 4] = 255; // R
    imgData.data[i * 4 + 1] = 192; // G
    imgData.data[i * 4 + 2] = 203; // B
    imgData.data[i * 4 + 3] = maskValue; // A
  }

  const tmpCanvas = document.createElement("canvas");
  tmpCanvas.width = width;
  tmpCanvas.height = height;
  const tmpCtx = tmpCanvas.getContext("2d");
  tmpCtx?.putImageData(imgData, 0, 0);
  canvasCtx.drawImage(tmpCanvas, 0, 0, canvas.width, canvas.height);

  mask.close?.();
}
