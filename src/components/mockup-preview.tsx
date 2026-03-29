"use client";

import { useEffect, useRef } from "react";
import { AngleVariant } from "@/lib/types";
import { renderMockup } from "@/lib/composite";
import { Loader2 } from "lucide-react";

interface MockupPreviewProps {
  screenshot: HTMLImageElement | null;
  frameImage: HTMLImageElement | null;
  frameLoading: boolean;
  frameError: string | null;
  angle: AngleVariant;
  backgroundColor: string;
  transparent: boolean;
  onCanvasReady: (canvas: HTMLCanvasElement | null) => void;
}

export function MockupPreview({
  screenshot,
  frameImage,
  frameLoading,
  frameError,
  angle,
  backgroundColor,
  transparent,
  onCanvasReady,
}: MockupPreviewProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!screenshot || !frameImage) {
      onCanvasReady(null);
      return;
    }

    const result = renderMockup({
      screenshot,
      frameImage,
      angle,
      backgroundColor,
      transparent,
    });

    onCanvasReady(result);

    const displayCanvas = canvasRef.current;
    if (!displayCanvas || !containerRef.current) return;

    const container = containerRef.current;
    const maxW = container.clientWidth;
    const maxH = container.clientHeight;
    const dpr = window.devicePixelRatio || 1;

    const cssScale = Math.min(maxW / result.width, maxH / result.height, 1);
    const cssW = Math.round(result.width * cssScale);
    const cssH = Math.round(result.height * cssScale);

    // Size the backing store for the device pixel ratio
    displayCanvas.width = Math.round(cssW * dpr);
    displayCanvas.height = Math.round(cssH * dpr);
    displayCanvas.style.width = `${cssW}px`;
    displayCanvas.style.height = `${cssH}px`;

    const ctx = displayCanvas.getContext("2d")!;
    ctx.scale(dpr, dpr);
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = "high";
    ctx.clearRect(0, 0, cssW, cssH);

    if (transparent) {
      const size = 10;
      for (let y = 0; y < cssH; y += size) {
        for (let x = 0; x < cssW; x += size) {
          ctx.fillStyle =
            (Math.floor(x / size) + Math.floor(y / size)) % 2 === 0
              ? "#e5e5e5"
              : "#ffffff";
          ctx.fillRect(x, y, size, size);
        }
      }
    }

    ctx.drawImage(result, 0, 0, cssW, cssH);
  }, [
    screenshot,
    frameImage,
    angle,
    backgroundColor,
    transparent,
    onCanvasReady,
  ]);

  if (frameError) {
    return (
      <div className="flex-1 flex items-center justify-center bg-muted/30 rounded-lg">
        <p className="text-sm text-destructive">{frameError}</p>
      </div>
    );
  }

  if (frameLoading) {
    return (
      <div className="flex-1 flex items-center justify-center bg-muted/30 rounded-lg">
        <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!screenshot) {
    return (
      <div className="flex-1 flex items-center justify-center bg-muted/30 rounded-lg">
        <p className="text-sm text-muted-foreground">
          Upload a screenshot to see the preview
        </p>
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className="flex-1 flex flex-col items-center justify-center gap-3 p-4"
    >
      <canvas ref={canvasRef} className="max-w-full max-h-full" />
      <p className="text-xs text-muted-foreground mb-4">
        Preview - export will be at full resolution
      </p>
    </div>
  );
}
