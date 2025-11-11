import React, { useRef, useState } from "react";
//import model from "../../models/pose_landmarker_lite.task";
import Webcam from "react-webcam";
// import {
//   PoseLandmarker,
//   FilesetResolver,
//   DrawingUtils,
// } from "https://cdn.skypack.dev/@mediapipe/tasks-vision@0.10.0";

function Home() {
  const webCamRef = useRef(null);
  const [webCamOn, setwebCamOn] = useState(false);
  const handlewebCamOn = () => {
    setwebCamOn(true);
  };
  // async function createVisionModel() {
  //   try {
  //     const vision = await FilesetResolver.forVisionTasks(
  //       "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.0/wasm"
  //     );
  //     const poseLandmarker = await poseLandmarker.createFromOptions(vision, {
  //       baseOptions: {
  //         modelAssetPath: model,
  //         delegate: "GPU",
  //       },
  //       runningMode: runningMode,
  //     });
  //   } catch (error) {
  //     console.error(error);
  //   }
  // }
  // createVisionModel();

  // async function handleVideo() {
  //   await poseLandmarker.setOptions({ runningMode: "VIDEO" });
  //   let lastVideoTime = -1;
  //   function renderLoop() {
  //     const video = document.getElementById("video");

  //     if (video.currentTime !== lastVideoTime) {
  //       const poseLandmarkerResult = poseLandmarker.detectForVideo(video);
  //       prcessResults(detections);
  //       lastVideoTime = video.currentTime;
  //     }

  //     requestAnimationFrame(() => {
  //       renderLoop();
  //     });
  //   }
  // }

  // async function handleImage() {
  //   await poseLandmarker.setOptions({ runningMode: "IMAGE" });
  // }

  return (
    <>
      <div className="mt-[50px] justify-center flex">
        {webCamOn && (
          <Webcam ref={webCamRef} videoConstraints={{ facingMode: "user" }} />
        )}
      </div>

      <div className="flex mt-[50px] justify-self-center">
        <button
          onClick={handlewebCamOn}
          className="text-center rounded-4xl bg-blue-200 w-[150px]"
        >
          Start Webcam
        </button>

        <button className="text-center rounded-4xl bg-blue-200 w-[150px]">
          Upload an Image
        </button>
      </div>
    </>
  );
}

export default Home;
