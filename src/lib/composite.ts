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

/**
 * Compute how to draw the screenshot inside the target area using "contain" fit.
 * The image is scaled to fit entirely within the target, maintaining aspect ratio.
 * Returns the destination rectangle (dx, dy, dw, dh) within the target.
 */
export interface ContainFit {
  dx: number;
  dy: number;
  dw: number;
  dh: number;
}

export function computeContainFit(
  imgW: number,
  imgH: number,
  targetW: number,
  targetH: number
): ContainFit {
  const scale = Math.min(targetW / imgW, targetH / imgH);
  const dw = Math.round(imgW * scale);
  const dh = Math.round(imgH * scale);
  const dx = Math.round((targetW - dw) / 2);
  const dy = Math.round((targetH - dh) / 2);
  return { dx, dy, dw, dh };
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

  // 2. Screenshot — scaled to contain (fit entirely, centered) into screen region
  const bounds = screenRegionBounds(angle.screenRegion);
  const fit = computeContainFit(
    screenshot.naturalWidth,
    screenshot.naturalHeight,
    bounds.width,
    bounds.height
  );

  // Draw screenshot onto a temp canvas at the screen region size, centered
  const fitCanvas = document.createElement("canvas");
  fitCanvas.width = bounds.width;
  fitCanvas.height = bounds.height;
  const fitCtx = fitCanvas.getContext("2d")!;
  // Fill with white so the letterbox area isn't transparent (would show background through frame)
  fitCtx.fillStyle = "#FFFFFF";
  fitCtx.fillRect(0, 0, bounds.width, bounds.height);
  fitCtx.drawImage(screenshot, 0, 0, screenshot.naturalWidth, screenshot.naturalHeight, fit.dx, fit.dy, fit.dw, fit.dh);

  const offsetRegion: ScreenRegion = {
    topLeft: { x: angle.screenRegion.topLeft.x + offsetX, y: angle.screenRegion.topLeft.y + offsetY },
    topRight: { x: angle.screenRegion.topRight.x + offsetX, y: angle.screenRegion.topRight.y + offsetY },
    bottomLeft: { x: angle.screenRegion.bottomLeft.x + offsetX, y: angle.screenRegion.bottomLeft.y + offsetY },
    bottomRight: { x: angle.screenRegion.bottomRight.x + offsetX, y: angle.screenRegion.bottomRight.y + offsetY },
  };

  drawPerspective(ctx, fitCanvas, bounds.width, bounds.height, offsetRegion);

  // 3. Device frame on top
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.drawImage(frameImage, offsetX, offsetY);

  return canvas;
}
