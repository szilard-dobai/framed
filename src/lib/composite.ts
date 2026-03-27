import { drawPerspective } from "./perspective";
import { AngleVariant, ScreenRegion } from "./types";

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
  const xs = [
    region.topLeft.x,
    region.topRight.x,
    region.bottomLeft.x,
    region.bottomRight.x,
  ];
  const ys = [
    region.topLeft.y,
    region.topRight.y,
    region.bottomLeft.y,
    region.bottomRight.y,
  ];
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
  const { screenshot, frameImage, angle, backgroundColor, transparent } =
    options;

  const frameW = frameImage.naturalWidth;
  const frameH = frameImage.naturalHeight;
  const { canvasWidth, canvasHeight, offsetX, offsetY } =
    computeCanvasDimensions(frameW, frameH);

  const canvas = document.createElement("canvas");
  canvas.width = canvasWidth;
  canvas.height = canvasHeight;
  const ctx = canvas.getContext("2d")!;

  // 1. Screenshot (background is drawn later via destination-over after clipping) — scaled to contain (fit entirely, centered) into screen region
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
  fitCtx.drawImage(
    screenshot,
    0,
    0,
    screenshot.naturalWidth,
    screenshot.naturalHeight,
    fit.dx,
    fit.dy,
    fit.dw,
    fit.dh
  );

  const offsetRegion: ScreenRegion = {
    topLeft: {
      x: angle.screenRegion.topLeft.x + offsetX,
      y: angle.screenRegion.topLeft.y + offsetY,
    },
    topRight: {
      x: angle.screenRegion.topRight.x + offsetX,
      y: angle.screenRegion.topRight.y + offsetY,
    },
    bottomLeft: {
      x: angle.screenRegion.bottomLeft.x + offsetX,
      y: angle.screenRegion.bottomLeft.y + offsetY,
    },
    bottomRight: {
      x: angle.screenRegion.bottomRight.x + offsetX,
      y: angle.screenRegion.bottomRight.y + offsetY,
    },
  };

  // 3. Draw the screenshot via perspective transform
  drawPerspective(
    ctx,
    fitCanvas,
    bounds.width,
    bounds.height,
    offsetRegion,
    24
  );

  // 4. Clip the screenshot to the screen area with rounded corners
  if (angle.screenCornerRadius > 0) {
    const r = angle.screenCornerRadius;
    const tl = offsetRegion.topLeft;
    const tr = offsetRegion.topRight;
    const bl = offsetRegion.bottomLeft;
    const br = offsetRegion.bottomRight;

    const clipCanvas = document.createElement("canvas");
    clipCanvas.width = canvasWidth;
    clipCanvas.height = canvasHeight;
    const clipCtx = clipCanvas.getContext("2d")!;

    // Draw the quad as a path with rounded corners
    // For each corner, we step inward along both edges by `r` pixels and draw an arc
    clipCtx.beginPath();

    // Helper: point along edge from p1 to p2, at distance t (0-1)
    const lerp = (
      p1: { x: number; y: number },
      p2: { x: number; y: number },
      t: number
    ) => ({
      x: p1.x + (p2.x - p1.x) * t,
      y: p1.y + (p2.y - p1.y) * t,
    });

    // Edge lengths for normalizing the radius
    const edgeLen = (
      p1: { x: number; y: number },
      p2: { x: number; y: number }
    ) => Math.sqrt((p2.x - p1.x) ** 2 + (p2.y - p1.y) ** 2);

    const topLen = edgeLen(tl, tr);
    const rightLen = edgeLen(tr, br);
    const bottomLen = edgeLen(br, bl);
    const leftLen = edgeLen(bl, tl);

    // Normalized radius as fraction of each edge
    const tl_top = lerp(tl, tr, r / topLen);
    const tl_left = lerp(tl, bl, r / leftLen);

    const tr_top = lerp(tr, tl, r / topLen);
    const tr_right = lerp(tr, br, r / rightLen);

    const br_right = lerp(br, tr, r / rightLen);
    const br_bottom = lerp(br, bl, r / bottomLen);

    const bl_bottom = lerp(bl, br, r / bottomLen);
    const bl_left = lerp(bl, tl, r / leftLen);

    // Draw path: top-left corner → top edge → top-right corner → right edge → etc.
    clipCtx.moveTo(tl_top.x, tl_top.y);
    clipCtx.lineTo(tr_top.x, tr_top.y);
    clipCtx.quadraticCurveTo(tr.x, tr.y, tr_right.x, tr_right.y);
    clipCtx.lineTo(br_right.x, br_right.y);
    clipCtx.quadraticCurveTo(br.x, br.y, br_bottom.x, br_bottom.y);
    clipCtx.lineTo(bl_bottom.x, bl_bottom.y);
    clipCtx.quadraticCurveTo(bl.x, bl.y, bl_left.x, bl_left.y);
    clipCtx.lineTo(tl_left.x, tl_left.y);
    clipCtx.quadraticCurveTo(tl.x, tl.y, tl_top.x, tl_top.y);
    clipCtx.closePath();

    clipCtx.fillStyle = "#000";
    clipCtx.fill();

    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.globalCompositeOperation = "destination-in";
    ctx.drawImage(clipCanvas, 0, 0);
    ctx.globalCompositeOperation = "source-over";
  }

  // 5. Draw background behind the clipped screenshot
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.globalCompositeOperation = "destination-over";
  if (!transparent) {
    ctx.fillStyle = backgroundColor;
    ctx.fillRect(0, 0, canvasWidth, canvasHeight);
  }

  // 6. Draw device frame on top
  ctx.globalCompositeOperation = "source-over";
  ctx.drawImage(frameImage, offsetX, offsetY);

  return canvas;
}
