declare module "@mediapipe/tasks-vision" {
  export class FilesetResolver {
    static forVisionTasks(basePath: string): Promise<unknown>;
  }

  export class PoseLandmarker {
    static readonly POSE_CONNECTIONS: unknown;

    static createFromOptions(
      vision: unknown,
      options: {
        baseOptions: {
          modelAssetPath: string;
          delegate?: "GPU" | "CPU";
        };
        runningMode: "VIDEO" | "IMAGE";
        numPoses?: number;
        outputSegmentationMasks?: boolean;
      },
    ): Promise<PoseLandmarker>;

    setOptions(options: { runningMode: "VIDEO" | "IMAGE" }): void;
    detect(source: HTMLImageElement): unknown;
    detectForVideo(source: HTMLVideoElement, timestampMs: number): unknown;
  }

  export class DrawingUtils {
    constructor(ctx: CanvasRenderingContext2D | null);

    static lerp(x: number, x0: number, x1: number, y0: number, y1: number): number;

    drawLandmarks(landmarks: unknown, options?: { radius?: (data: unknown) => number }): void;
    drawConnectors(landmarks: unknown, connections: unknown): void;
  }
}
