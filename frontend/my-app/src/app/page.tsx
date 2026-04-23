"use client";

import { useEffect, useRef, useState } from "react";
import type { ChangeEvent } from "react";
import Webcam from "react-webcam";
import { LogoutButton } from "@/components/logout-button";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Model from "./components/load-model";
import WebCam from "./components/webcam";

type CaptureMode = "video" | "image";

export default function Home() {
  const webCamRef = useRef<Webcam>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);
  const [mode, setMode] = useState<CaptureMode>("video");
  const [heightCm, setHeightCm] = useState("170");
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [imageLoaded, setImageLoaded] = useState(false);

  useEffect(() => {
    return () => {
      if (imageUrl) {
        URL.revokeObjectURL(imageUrl);
      }
    };
  }, [imageUrl]);

  const handleImageChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    if (imageUrl) {
      URL.revokeObjectURL(imageUrl);
    }

    setImageLoaded(false);
    setImageUrl(URL.createObjectURL(file));
    setMode("image");
  };

  const isVideoMode = mode === "video";
  const numericHeight = Number(heightCm) || 0;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <LogoutButton />

      <section className="grid gap-4 rounded-3xl">
        <div className="grid gap-4 sm:grid-cols-[auto,1fr] sm:items-end">
          <div className="flex gap-2 rounded-2xl border border-white/10 bg-slate-900 p-1">
            <Button
              type="button"
              variant={isVideoMode ? "default" : "outline"}
              onClick={() => setMode("video")}
            >
              Video
            </Button>
            <Button
              type="button"
              variant={!isVideoMode ? "default" : "outline"}
              onClick={() => setMode("image")}
            >
              Image
            </Button>
          </div>
        </div>

        <div className="grid gap-2">
          <label htmlFor="image-upload" className="text-sm text-slate-300">
            Upload image for detection
          </label>
          <Input
            id="image-upload"
            type="file"
            accept="image/*"
            onChange={handleImageChange}
            className="max-w-sm bg-slate-950 text-white"
          />
        </div>
      </section>

      <section className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
        <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-slate-900 shadow-2xl shadow-black/30">
          {isVideoMode ? (
            <WebCam
              webCamRef={webCamRef}
              canvasRef={canvasRef}
              isActive={isVideoMode}
            />
          ) : (
            <div className="relative min-h-120 w-full bg-slate-950">
              {imageUrl ? (
                <img
                  ref={imageRef}
                  src={imageUrl}
                  alt="Uploaded pose reference"
                  onLoad={() => setImageLoaded(true)}
                  className="h-full w-full object-contain"
                />
              ) : (
                <div className="flex min-h-120 items-center justify-center px-8 text-center text-sm text-slate-400"></div>
              )}
              <canvas
                ref={canvasRef}
                className="absolute inset-0 h-full w-full"
              />
            </div>
          )}

          <Model
            webCamRef={webCamRef}
            canvasRef={canvasRef}
            webCamOn={isVideoMode}
            heightCm={numericHeight}
            image={imageRef}
          />

          {!isVideoMode && imageUrl && !imageLoaded ? (
            <div className="absolute inset-x-0 bottom-0 border-t border-white/10 bg-black/60 px-4 py-3 text-sm text-slate-200">
              Loading image detection...
            </div>
          ) : null}
        </div>
      </section>
    </div>
  );
}
