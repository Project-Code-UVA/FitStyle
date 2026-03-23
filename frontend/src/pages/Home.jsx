import React, { useRef, useState, useEffect } from "react";
import Webcam from "react-webcam";
import {
  PoseLandmarker,
  FilesetResolver,
  DrawingUtils,
} from "https://cdn.skypack.dev/@mediapipe/tasks-vision@0.10.0";

// ─── Constants ───────────────────────────────────────────────────────────────
const POSE_LANDMARKS = {
  NOSE: 0,
  LEFT_SHOULDER: 11,
  RIGHT_SHOULDER: 12,
  LEFT_ELBOW: 13,
  RIGHT_ELBOW: 14,
  LEFT_WRIST: 15,
  RIGHT_WRIST: 16,
  LEFT_HIP: 23,
  RIGHT_HIP: 24,
  LEFT_ANKLE: 27,
  RIGHT_ANKLE: 28,
};

const MODEL_URL =
  "https://storage.googleapis.com/mediapipe-models/pose_landmarker/pose_landmarker_lite/float16/1/pose_landmarker_lite.task";

// ─── Component ───────────────────────────────────────────────────────────────
function Home({ userPreferences }) {
  // -- Pose detection (existing logic, untouched) --
  const webCamRef       = useRef(null);
  const canvasRef       = useRef(null);  // overlay canvas for live webcam
  const imageCanvasRef  = useRef(null);  // overlay canvas for static photo
  const animationFrameId = useRef(null);

  const [poseLandmarker, setPoseLandmarker] = useState(null);
  const [runningMode]  = useState("VIDEO");
  const [webCamOn, setWebCamOn] = useState(false);

  // -- New UI state --
  const [personPhotoUrl, setPersonPhotoUrl] = useState(null); // preview URL
  const [clothingItems, setClothingItems]   = useState([]);   // [{id, url, name}]
  const [isGenerating, setIsGenerating]     = useState(false);

  const personInputRef  = useRef(null);
  const clothingInputRef = useRef(null);

  // ── Load ML model on mount ──────────────────────────────────────────────
  useEffect(() => {
    createVisionModel();
    return () => {
      if (animationFrameId.current) cancelAnimationFrame(animationFrameId.current);
    };
  }, []);

  // ── Start video loop when webcam turns on and model is ready ───────────
  useEffect(() => {
    if (webCamOn && poseLandmarker) handleVideo();
  }, [webCamOn, poseLandmarker]);

  // ── ML functions (unchanged) ────────────────────────────────────────────
  async function createVisionModel() {
    try {
      const vision = await FilesetResolver.forVisionTasks(
        "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.0/wasm"
      );
      const lm = await PoseLandmarker.createFromOptions(vision, {
        baseOptions: { modelAssetPath: MODEL_URL, delegate: "GPU" },
        runningMode,
        numPoses: 1,
        output_segmentation_masks: true,
      });
      setPoseLandmarker(lm);
    } catch (err) {
      console.error(err);
    }
  }

  async function handleVideo() {
    if (!poseLandmarker || !webCamRef.current) return;
    await poseLandmarker.setOptions({ runningMode: "VIDEO" });
    let lastVideoTime = -1;

    function renderLoop() {
      const video  = webCamRef.current?.video;
      const canvas = canvasRef.current;
      if (!video || !canvas) return;

      if (video.currentTime !== lastVideoTime && video.readyState >= 2) {
        const result = poseLandmarker.detectForVideo(video, performance.now());
        processResults(result, result.segmentation_mask, canvas, video);
        lastVideoTime = video.currentTime;
      }
      animationFrameId.current = requestAnimationFrame(renderLoop);
    }
    renderLoop();
  }

  function processResults(result, segmentationMask, canvas, video) {
    if (!canvas || !video) return;
    const ctx = canvas.getContext("2d");
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.canvas.width  = video.videoWidth;
    ctx.canvas.height = video.videoHeight;

    const drawing = new DrawingUtils(ctx);
    for (const landmark of result.landmarks) {
      drawing.drawLandmarks(landmark, {
        radius: (data) => DrawingUtils.lerp(data.from.z, -0.15, 0.1, 5, 1),
      });
      drawing.drawConnectors(landmark, PoseLandmarker.POSE_CONNECTIONS);
      if (segmentationMask) drawing.drawSegmentationMask(segmentationMask, 0.5);
    }
  }

  function distance(p1, p2) {
    return Math.sqrt((p1.x - p2.x) ** 2 + (p1.y - p2.y) ** 2);
  }

  async function calculateMeasurements(landmarks) {
    const ls = landmarks[POSE_LANDMARKS.LEFT_SHOULDER];
    const rs = landmarks[POSE_LANDMARKS.RIGHT_SHOULDER];
    const lh = landmarks[POSE_LANDMARKS.LEFT_HIP];
    const rh = landmarks[POSE_LANDMARKS.RIGHT_HIP];
    return {
      shoulderWidth: distance(ls, rs),
      hipWidth:      distance(lh, rh),
    };
  }

  // ── UI handlers ─────────────────────────────────────────────────────────

  // Upload a person photo → show preview + run pose detection on it
  async function handlePersonUpload(e) {
    const file = e.target.files?.[0];
    if (!file) return;

    // Clear webcam first
    if (webCamOn) {
      if (animationFrameId.current) cancelAnimationFrame(animationFrameId.current);
      setWebCamOn(false);
    }

    // Revoke previous URL to avoid memory leaks
    if (personPhotoUrl) URL.revokeObjectURL(personPhotoUrl);
    const url = URL.createObjectURL(file);
    setPersonPhotoUrl(url);

    // Run pose detection on the static image and draw to imageCanvasRef
    if (!poseLandmarker) return;
    const img = new Image();
    img.src = url;
    img.onload = async () => {
      await poseLandmarker.setOptions({ runningMode: "IMAGE" });
      const result = poseLandmarker.detect(img);

      const canvas = imageCanvasRef.current;
      if (!canvas) return;
      canvas.width  = img.naturalWidth;
      canvas.height = img.naturalHeight;

      const ctx     = canvas.getContext("2d");
      const drawing = new DrawingUtils(ctx);
      for (const landmark of result.landmarks) {
        drawing.drawLandmarks(landmark, {
          radius: (data) => DrawingUtils.lerp(data.from.z, -0.15, 0.1, 5, 1),
        });
        drawing.drawConnectors(landmark, PoseLandmarker.POSE_CONNECTIONS);
      }
      await poseLandmarker.setOptions({ runningMode: "VIDEO" });
    };

    // Reset file input so the same file can be re-selected
    e.target.value = "";
  }

  function clearPersonPhoto() {
    if (personPhotoUrl) URL.revokeObjectURL(personPhotoUrl);
    setPersonPhotoUrl(null);
  }

  function toggleWebcam() {
    if (webCamOn) {
      if (animationFrameId.current) cancelAnimationFrame(animationFrameId.current);
      setWebCamOn(false);
    } else {
      clearPersonPhoto();
      setWebCamOn(true);
    }
  }

  function addClothingItems(e) {
    const files = Array.from(e.target.files || []);
    const newItems = files.map((f) => ({
      id:   crypto.randomUUID(),
      url:  URL.createObjectURL(f),
      name: f.name,
    }));
    setClothingItems((prev) => [...prev, ...newItems]);
    e.target.value = "";
  }

  function removeClothingItem(id) {
    setClothingItems((prev) => {
      const item = prev.find((i) => i.id === id);
      if (item) URL.revokeObjectURL(item.url);
      return prev.filter((i) => i.id !== id);
    });
  }

  // Placeholder generate — wire up real AI call later
  function handleGenerate() {
    setIsGenerating(true);
    setTimeout(() => setIsGenerating(false), 2000); // fake 2-second "loading"
  }

  const canGenerate = webCamOn || personPhotoUrl !== null;

  // ── Render ───────────────────────────────────────────────────────────────
  return (
    <div className="flex h-screen bg-zinc-950 text-white overflow-hidden">

      {/* ══════════════════════════════════════════════
          LEFT PANEL — controls
      ══════════════════════════════════════════════ */}
      <aside className="w-72 flex-shrink-0 bg-zinc-900 border-r border-zinc-800 flex flex-col">

        {/* Header */}
        <div className="px-5 py-4 border-b border-zinc-800 flex items-center justify-between">
          <span className="font-bold text-base tracking-tight">FitStyle</span>
          {userPreferences?.styles?.length > 0 && (
            <span className="text-xs text-zinc-500 capitalize">
              {userPreferences.styles[0]}
            </span>
          )}
        </div>

        {/* ── Section 1: Your Photo ── */}
        <div className="p-4 border-b border-zinc-800">
          <p className="text-xs font-semibold text-zinc-400 uppercase tracking-widest mb-3">
            Your Photo
          </p>

          {/* Dashed upload zone — only shown when no photo and no webcam */}
          {!personPhotoUrl && !webCamOn && (
            <button
              onClick={() => personInputRef.current?.click()}
              className="w-full border-2 border-dashed border-zinc-700 rounded-xl py-6 flex flex-col items-center gap-2 text-zinc-500 hover:border-sky-500 hover:text-sky-400 transition-all mb-3"
            >
              <svg className="w-7 h-7" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              <span className="text-xs font-medium">Upload a photo</span>
            </button>
          )}

          {/* Thumbnail when photo is uploaded */}
          {personPhotoUrl && !webCamOn && (
            <div className="relative mb-3 rounded-xl overflow-hidden">
              <img
                src={personPhotoUrl}
                alt="Uploaded person"
                className="w-full h-36 object-cover"
              />
              <button
                onClick={clearPersonPhoto}
                className="absolute top-2 right-2 w-6 h-6 bg-zinc-900/80 hover:bg-zinc-900 rounded-full flex items-center justify-center text-zinc-400 hover:text-white text-xs transition-colors"
              >
                ✕
              </button>
            </div>
          )}

          {/* Webcam active indicator */}
          {webCamOn && (
            <div className="flex items-center gap-2 mb-3 px-3 py-2 rounded-lg bg-sky-500/10 border border-sky-500/20">
              <span className="w-2 h-2 rounded-full bg-sky-400 animate-pulse" />
              <span className="text-sky-400 text-xs font-medium">Webcam live</span>
            </div>
          )}

          {/* Webcam toggle button */}
          <button
            onClick={toggleWebcam}
            className={`w-full py-2.5 rounded-lg text-xs font-semibold transition-all flex items-center justify-center gap-2 ${
              webCamOn
                ? "bg-zinc-800 text-zinc-300 hover:bg-zinc-700"
                : "bg-zinc-800 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-700"
            }`}
          >
            <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M15.75 10.5l4.72-4.72a.75.75 0 011.28.53v11.38a.75.75 0 01-1.28.53l-4.72-4.72M4.5 18.75h9a2.25 2.25 0 002.25-2.25v-9a2.25 2.25 0 00-2.25-2.25h-9A2.25 2.25 0 002.25 7.5v9a2.25 2.25 0 002.25 2.25z" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            {webCamOn ? "Stop Webcam" : "Use Webcam Instead"}
          </button>
        </div>

        {/* ── Section 2: Clothing Items ── */}
        <div className="p-4 flex-1 overflow-y-auto border-b border-zinc-800">
          <div className="flex items-center justify-between mb-3">
            <p className="text-xs font-semibold text-zinc-400 uppercase tracking-widest">
              Clothing Items
            </p>
            <span className="text-xs text-zinc-600 bg-zinc-800 px-2 py-0.5 rounded-full">
              optional
            </span>
          </div>

          {/* Thumbnails grid */}
          {clothingItems.length > 0 && (
            <div className="grid grid-cols-2 gap-2 mb-3">
              {clothingItems.map((item) => (
                <div key={item.id} className="relative group rounded-lg overflow-hidden bg-zinc-800">
                  <img
                    src={item.url}
                    alt={item.name}
                    className="w-full h-20 object-cover"
                  />
                  <button
                    onClick={() => removeClothingItem(item.id)}
                    className="absolute top-1 right-1 w-5 h-5 bg-zinc-900/80 rounded-full flex items-center justify-center text-zinc-400 hover:text-white text-xs opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Add item button */}
          <button
            onClick={() => clothingInputRef.current?.click()}
            className="w-full py-2.5 rounded-lg border border-dashed border-zinc-700 text-zinc-500 text-xs font-medium hover:border-sky-500 hover:text-sky-400 transition-all flex items-center justify-center gap-1.5"
          >
            <span className="text-base leading-none">+</span>
            Add clothing item
          </button>
        </div>

        {/* ── Generate button ── */}
        <div className="p-4">
          <button
            onClick={handleGenerate}
            disabled={!canGenerate || isGenerating}
            className={`w-full py-3 rounded-xl font-semibold text-sm transition-all flex items-center justify-center gap-2 ${
              canGenerate && !isGenerating
                ? "bg-sky-500 text-white hover:bg-sky-400 active:scale-95 shadow-lg shadow-sky-500/20"
                : "bg-zinc-800 text-zinc-600 cursor-not-allowed"
            }`}
          >
            {isGenerating ? (
              <>
                <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Analyzing...
              </>
            ) : (
              <>
                <span>✦</span>
                Generate Analysis
              </>
            )}
          </button>
          {!canGenerate && (
            <p className="text-zinc-700 text-xs text-center mt-2">
              Add a photo or start your webcam first
            </p>
          )}
        </div>

        {/* Hidden file inputs */}
        <input
          ref={personInputRef}
          type="file"
          accept="image/*"
          onChange={handlePersonUpload}
          className="hidden"
        />
        <input
          ref={clothingInputRef}
          type="file"
          accept="image/*"
          multiple
          onChange={addClothingItems}
          className="hidden"
        />
      </aside>

      {/* ══════════════════════════════════════════════
          RIGHT PANEL — preview / results
      ══════════════════════════════════════════════ */}
      <main className="flex-1 relative overflow-hidden flex items-center justify-center bg-zinc-950">

        {/* Live webcam feed + pose overlay */}
        {webCamOn && (
          <div className="relative flex items-center justify-center w-full h-full">
            <Webcam
              ref={webCamRef}
              videoConstraints={{ facingMode: "user" }}
              className="max-w-full max-h-full"
            />
            <canvas
              ref={canvasRef}
              className="absolute pointer-events-none"
            />
          </div>
        )}

        {/* Uploaded photo + pose overlay */}
        {!webCamOn && personPhotoUrl && (
          <div className="relative flex items-center justify-center w-full h-full p-8">
            <img
              src={personPhotoUrl}
              alt="Your photo"
              className="max-w-full max-h-full object-contain rounded-xl"
            />
            <canvas
              ref={imageCanvasRef}
              className="absolute pointer-events-none"
              style={{ maxWidth: "100%", maxHeight: "100%" }}
            />
          </div>
        )}

        {/* Empty state */}
        {!webCamOn && !personPhotoUrl && (
          <div className="text-center select-none">
            <div className="text-8xl text-zinc-800 mb-6">◎</div>
            <p className="text-zinc-600 text-lg font-medium">
              Your preview will appear here
            </p>
            <p className="text-zinc-700 text-sm mt-2">
              Upload a photo or start your webcam on the left
            </p>
          </div>
        )}

      </main>
    </div>
  );
}

export default Home;
