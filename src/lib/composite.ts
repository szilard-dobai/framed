import { AngleVariant, ScreenRegion } from "./types";
import { drawPerspective } from "./perspective";

const PADDING_RATIO = 0.1;

export interface CanvasDimensions {
  canvasWidth: number;
  canvasHeight: number;
  offsetX: number;
  offsetY: number;
}

export function computeCanvasDimensions(
  frameWidth: number,
  frameHeight: number
): CanvasDimensions {
  const offsetX = Math.round(frameWidth * PADDING_RATIO);
  const offsetY = Math.round(frameHeight * PADDING_RATIO);
  return {
    canvasWidth: frameWidth + offsetX * 2,
    canvasHeight: frameHeight + offsetY * 2,
    offsetX,
    offsetY,
  };
}

export interface CoverCrop {
  sx: number;
  sy: number;
  sw: number;
  sh: number;
}

export function computeCoverCrop(
  imgW: number,
  imgH: number,
  targetW: number,
  targetH: number
): CoverCrop {
  const imgAspect = imgW / imgH;
  const targetAspect = targetW / targetH;

  let sw: number, sh: number, sx: number, sy: number;

  if (imgAspect > targetAspect) {
    sh = imgH;
    sw = Math.round(imgH * targetAspect);
    sx = Math.round((imgW - sw) / 2);
    sy = 0;
  } else if (imgAspect < targetAspect) {
    sw = imgW;
    sh = Math.round(imgW / targetAspect);
    sx = 0;
    sy = Math.round((imgH - sh) / 2);
  } else {
    sx = 0;
    sy = 0;
    sw = imgW;
    sh = imgH;
  }

  return { sx, sy, sw, sh };
}

function screenRegionBounds(region: ScreenRegion): {
  width: number;
  height: number;
} {
  const xs = [region.topLeft.x, region.topRight.x, region.bottomLeft.x, region.bottomRight.x];
  const ys = [region.topLeft.y, region.topRight.y, region.bottomLeft.y, region.bottomRight.y];
  return {
    width: Math.max(...xs) - Math.min(...xs),
    height: Math.max(...ys) - Math.min(...ys),
  };
}

export interface RenderOptions {
  screenshot: HTMLImageElement;
  frameImage: HTMLImageElement;
  angle: AngleVariant;
  backgroundColor: string;
  transparent: boolean;
}

export function renderMockup(options: RenderOptions): HTMLCanvasElement {
  const { screenshot, frameImage, angle, backgroundColor, transparent } = options;

  const frameW = frameImage.naturalWidth;
  const frameH = frameImage.naturalHeight;
  const { canvasWidth, canvasHeight, offsetX, offsetY } = computeCanvasDimensions(frameW, frameH);

  const canvas = document.createElement("canvas");
  canvas.width = canvasWidth;
  canvas.height = canvasHeight;
  const ctx = canvas.getContext("2d")!;

  // 1. Background
  if (!transparent) {
    ctx.fillStyle = backgroundColor;
    ctx.fillRect(0, 0, canvasWidth, canvasHeight);
  }

  // 2. Screenshot — perspective-transformed into screen region
  const bounds = screenRegionBounds(angle.screenRegion);
  const crop = computeCoverCrop(
    screenshot.naturalWidth,
    screenshot.naturalHeight,
    bounds.width,
    bounds.height
  );

  const cropCanvas = document.createElement("canvas");
  cropCanvas.width = bounds.width;
  cropCanvas.height = bounds.height;
  const cropCtx = cropCanvas.getContext("2d")!;
  cropCtx.drawImage(screenshot, crop.sx, crop.sy, crop.sw, crop.sh, 0, 0, bounds.width, bounds.height);

  const offsetRegion: ScreenRegion = {
    topLeft: { x: angle.screenRegion.topLeft.x + offsetX, y: angle.screenRegion.topLeft.y + offsetY },
    topRight: { x: angle.screenRegion.topRight.x + offsetX, y: angle.screenRegion.topRight.y + offsetY },
    bottomLeft: { x: angle.screenRegion.bottomLeft.x + offsetX, y: angle.screenRegion.bottomLeft.y + offsetY },
    bottomRight: { x: angle.screenRegion.bottomRight.x + offsetX, y: angle.screenRegion.bottomRight.y + offsetY },
  };

  drawPerspective(ctx, cropCanvas, bounds.width, bounds.height, offsetRegion);

  // 3. Device frame on top
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.drawImage(frameImage, offsetX, offsetY);

  return canvas;
}
