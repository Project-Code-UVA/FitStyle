import React, { useRef, useState, useEffect } from "react";
//import model from "../../models/pose_landmarker_lite.task";
import Webcam from "react-webcam";
import {
  PoseLandmarker,
  FilesetResolver,
  DrawingUtils,
} from "https://cdn.skypack.dev/@mediapipe/tasks-vision@0.10.0";

function Home() {
  //useRefs don't cause re-renders
  const webCamRef = useRef(null);
  const canvasRef = useRef(null);
  //useStates cause re-renders and for updating the components
  const [poseLandmarker, setPoseLandmarker] = useState(null);
  const [runningMode, setRunningMode] = useState("VIDEO");
  const animationFrameId = useRef(null);
  const [webCamOn, setwebCamOn] = useState(false);
  const model = `https://storage.googleapis.com/mediapipe-models/pose_landmarker/pose_landmarker_lite/float16/1/pose_landmarker_lite.task`;
  const handlewebCamOn = () => {
    setwebCamOn(true);
  };

  //Load the model once when the component mounts
  useEffect(() => {
    createVisionModel();
    return () => {
      if (animationFrameId.current) {
        cancelAnimationFrame(animationFrameId.current);
      }
    };
  }, []); //empty dependency array to run only once on mount

  useEffect(() => {
    if (webCamOn && poseLandmarker) {
      handleVideo();
    }
  }, [webCamOn, poseLandmarker]); //rerun when webCamOn or poseLandmarker changes

  async function createVisionModel() {
    try {
      //load the model!!!
      const vision = await FilesetResolver.forVisionTasks(
        "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.0/wasm"
      );
      const poseLandmarker = await PoseLandmarker.createFromOptions(vision, {
        baseOptions: {
          modelAssetPath: model,
          delegate: "GPU",
        },
        runningMode: runningMode,
        numPoses: 1, //detect one person at a time
      });

      //save the model to state
      setPoseLandmarker(poseLandmarker);
    } catch (error) {
      console.error(error);
    }
  }

  async function handleVideo() {
    if (!poseLandmarker || !webCamRef.current) {
      return;
    }
    await poseLandmarker.setOptions({ runningMode: "VIDEO" });
    let lastVideoTime = -1; //last processed video timestamp

    function renderLoop() {
      const video = webCamRef.current?.video;
      const canvas = canvasRef.current;
      if (!video || !canvas) {
        return;
      }

      //if new frame then run pose detection
      if (video.currentTime !== lastVideoTime && video.readyState >= 2) {
        const poseLandmarkerResult = poseLandmarker.detectForVideo(
          video,
          performance.now() //current timestamp
        );
        processResults(poseLandmarkerResult, canvas, video);
        lastVideoTime = video.currentTime;
      }

      //schedule the next frame
      animationFrameId.current = requestAnimationFrame(renderLoop);
    }
    renderLoop(); //start the loop
  }

  function processResults(result, canvas, video) {
    if (!canvas || !video) {
      return;
    }
    //get drawing context
    const canvasCtx = canvas.getContext("2d");

    //clear prev drawings
    canvasCtx.clearRect(0, 0, canvas.width, canvas.height);
    //ensure size matches video size
    canvasCtx.canvas.width = video.videoWidth;
    canvasCtx.canvas.height = video.videoHeight;

    //drawing utils
    const drawingUtils = new DrawingUtils(canvasCtx);
    //draw the nose, eyes, etc landmarks
    for (const landmark of result.landmarks) {
      drawingUtils.drawLandmarks(landmark, {
        //control the radius based on depth (z)
        radius: (data) => DrawingUtils.lerp(data.from.z, -0.15, 0.1, 5, 1),
      });
      //connect the landmarks with lines
      drawingUtils.drawConnectors(landmark, PoseLandmarker.POSE_CONNECTIONS);
    }
  }

  async function handleImage(event) {
    const file = event.target.files?.[0];
    if (!file || !poseLandmarker) {
      return;
    }

    const image = new Image();
    image.src = URL.createObjectURL(file);
    image.onload = async () => {
      await poseLandmarker.setOptions({ runningMode: "IMAGE" });
      const result = poseLandmarker.detect(image);

      //create a canvas to draw the results
      const canvas = document.createElement("canvas");
      canvas.setAttribute("class", "canvas");
      canvas.setAttribute("width", image.naturalWidth + "px");
      canvas.setAttribute("height", image.naturalHeight + "px");
      canvas.style.width = "100%";
      canvas.style.maxWidth = "600px";
      document.body.appendChild(canvas);

      const canvasCtx = canvas.getContext("2d");
      canvasCtx.drawImage(image, 0, 0, canvas.width, canvas.height);

      const drawingUtils = new DrawingUtils(canvasCtx);
      for (const landmark of result.landmarks) {
        drawingUtils.drawLandmarks(landmark, {
          radius: (data) => DrawingUtils.lerp(data.from.z, -0.15, 0.1, 5, 1),
        });
        drawingUtils.drawConnectors(landmark, PoseLandmarker.POSE_CONNECTIONS);
      }
      await poseLandmarker.setOptions({ runningMode: "VIDEO" });
      //clean temp url
      URL.revokeObjectURL(image.src);
    };
  }

  return (
    <>
      {/* Webcam and Canvas for video input and drawing */}
      <div className="relative mt-[50px] justify-center flex">
        {webCamOn && ( //only show when webcam is on
          <>
            <Webcam ref={webCamRef} videoConstraints={{ facingMode: "user" }} />

            <canvas ref={canvasRef} className="absolute" />
            {/* Canvas for drawing pose landmarks */}
          </>
        )}
      </div>

      <div className="flex mt-[50px] justify-self-center">
        <button
          onClick={handlewebCamOn}
          className="text-center rounded-4xl bg-blue-200 w-[150px]"
        >
          Start Webcam
        </button>

        <label className="text-center rounded-4xl bg-blue-200 w-[150px] p-2 cursor-pointer">
          Upload an Image
          <input
            type="file"
            accept="image/*"
            onChange={handleImage}
            className="hidden"
          />
        </label>
      </div>
    </>
  );
}

export default Home;
