import React, { useRef, useState, useEffect } from "react";
//import model from "../../models/pose_landmarker_lite.task";
import Webcam from "react-webcam";
import {
  PoseLandmarker,
  FilesetResolver,
  DrawingUtils,
} from "@mediapipe/tasks-vision";

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

  const handlewebCamOn = () => {
    setwebCamOn(true);
  };

  const handlewebCamOff = () => {
    setwebCamOn(false);
  };

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
        outputSegmentationMasks: true,
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
        const bodyMeasurements = calculateBodyMeasurements(
          poseLandmarkerResult,
          video.videoHeight,
          video.videoWidth
        );

        console.log("Body Measurements: ", bodyMeasurements);
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
    if (result.segmentationMasks && result.segmentationMasks.length > 0) {
      canvasCtx.save();

      //draw the segmentation masks now
      for (const mask of result.segmentationMasks) {
        const maskData = mask.getAsFloat32Array();
        const width = mask.width;
        const height = mask.height;
        const imgData = canvasCtx.createImageData(width, height);

        for (let i = 0; i <= maskData.length; i++) {
          const maskValue = maskData[i] * 255;
          //vals below indicate the RGB values where here we have a pink overlay lol
          imgData.data[i * 4] = 255;
          imgData.data[i * 4 + 1] = 192;
          imgData.data[i * 4 + 2] = 203;
          imgData.data[i * 4 + 3] = maskValue; //Transparency
        }

        const tmpCanvas = document.createElement("canvas");
        tmpCanvas.width = width;
        tmpCanvas.height = height;
        const tmpCtx = tmpCanvas.getContext("2d");
        tmpCtx.putImageData(imgData, 0, 0);
        canvasCtx.drawImage(tmpCanvas, 0, 0, canvas.width, canvas.height);
      }
      canvasCtx.restore();
    }

    for (const landmark of result.landmarks) {
      drawingUtils.drawLandmarks(landmark, {
        //control the radius based on depth (z)
        radius: (data) => DrawingUtils.lerp(data.from.z, -0.15, 0.1, 5, 1),
      });
      //connect the landmarks with lines
      drawingUtils.drawConnectors(landmark, PoseLandmarker.POSE_CONNECTIONS);
    }
  }
  function findEdge(right = true, mask, measX, measY) {
    // mask is a segmentation mask object; get its float array and dims
    const maskData = mask.getAsFloat32Array
      ? mask.getAsFloat32Array()
      : mask.data;
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

  function calcDistance(p1, p2) {
    return (
      Math.sqrt(Math.pow(p1.x - p2.x, 2)) +
      Math.pow(p1.y - p2.y, 2) +
      Math.pow((p1.z || 0) - (p2.z || 0), 2)
    );
  }
  function calculateBodyMeasurements(result, height, width) {
    /*
    currently I'll just take measurements for 
    1. shoulder width
    2. hip measurement
    3. leg length
    4. arm length
    */

    const visibilityThreshold = 0.5;

    const isValid = (landmark) => {
      return (
        landmark &&
        // === strict equality without type coercion
        landmark.visibility !== undefined &&
        landmark.visibility > visibilityThreshold
      );
    };
    if (
      result.landmarks &&
      result.landmarks.length > 0 &&
      result.segmentationMasks &&
      result.segmentationMasks.length > 0
    ) {
      const landmarks = result.landmarks[0];
      const mask = result.segmentationMasks[0];
      let shoulderWidth, hipWidth, legLength, armLength;

      if (isValid(landmarks[11]) && isValid(landmarks[12])) {
        const leftShoulderX = Math.floor(landmarks[11].x * width);
        const leftShoulderY = Math.floor(landmarks[11].y * height);
        const rightShoulderX = Math.floor(landmarks[12].x * width);
        const rightShoulderY = Math.floor(landmarks[12].y * height);

        shoulderWidth =
          Math.abs(
            findEdge(false, mask, leftShoulderX, leftShoulderY, width) -
              findEdge(true, mask, rightShoulderX, rightShoulderY, width)
          ) / width;
      }

      if (isValid(landmarks[23]) && isValid(landmarks[24])) {
        const leftHipX = Math.floor(landmarks[23].x * width);
        const leftHipY = Math.floor(landmarks[23].y * height);
        const rightHipX = Math.floor(landmarks[24].x * width);
        const rightHipY = Math.floor(landmarks[24].y * height);

        hipWidth =
          Math.abs(
            findEdge(false, mask, leftHipX, leftHipY, width) -
              findEdge(true, mask, rightHipX, rightHipY, width)
          ) / width;
      }

      if (isValid(landmarks[24]) && isValid(landmarks[28])) {
        legLength =
          landmarks[24] && landmarks[28]
            ? calcDistance(landmarks[24], landmarks[28])
            : null;
      } else if (isValid(landmarks[23]) && isValid(landmarks[27])) {
        legLength =
          landmarks[23] && landmarks[27]
            ? calcDistance(landmarks[23], landmarks[27])
            : null;
      }

      if (isValid(landmarks[12]) && isValid(landmarks[16])) {
        armLength =
          landmarks[12] && landmarks[16]
            ? calcDistance(landmarks[12], landmarks[16])
            : null;
      } else if (isValid(landmarks[11]) && isValid(landmarks[15])) {
        armLength =
          landmarks[11] && landmarks[15]
            ? calcDistance(landmarks[11], landmarks[15])
            : null;
      }

      return {
        shoulderWidth,
        hipWidth,
        legLength,
        armLength,
      };
    }

    return null;
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

        <button
          onClick={handlewebCamOff}
          className="text-center rounded-4xl bg-blue-200 w-[150px]"
        >
          Stop Webcam
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
