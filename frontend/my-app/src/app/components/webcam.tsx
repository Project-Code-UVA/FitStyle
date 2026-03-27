"use client";
import Webcam from "react-webcam";

interface WebCamProps {
  webCamRef: React.RefObject<Webcam>;
  canvasRef: React.RefObject<HTMLCanvasElement>;
  isActive: boolean;
}

const WebCam = ({ webCamRef, canvasRef, isActive }: WebCamProps) => {
  return (
    <div className="relative w-full h-full">
      {isActive && (
        <Webcam
          ref={webCamRef}
          videoConstraints={{ facingMode: "user" }}
          className="w-full rounded-lg shadow-lg"
        />
      )}
      <canvas
        ref={canvasRef}
        className="absolute top-0 left-0 w-full h-full rounded-lg shadow-lg"
      ></canvas>
    </div>
  );
};

export default WebCam;
