import { Point, ScreenRegion } from "./types";

/**
 * Bilinear interpolation within a quadrilateral.
 * u, v are normalized coordinates [0, 1].
 */
export function bilinearInterpolate(
  quad: ScreenRegion,
  u: number,
  v: number
): Point {
  const top = {
    x: quad.topLeft.x + (quad.topRight.x - quad.topLeft.x) * u,
    y: quad.topLeft.y + (quad.topRight.y - quad.topLeft.y) * u,
  };
  const bottom = {
    x: quad.bottomLeft.x + (quad.bottomRight.x - quad.bottomLeft.x) * u,
    y: quad.bottomLeft.y + (quad.bottomRight.y - quad.bottomLeft.y) * u,
  };
  return {
    x: top.x + (bottom.x - top.x) * v,
    y: top.y + (bottom.y - top.y) * v,
  };
}

/**
 * Compute an (N+1) x (N+1) grid of points by interpolating within the quad.
 */
export function computeSubdivisionGrid(
  quad: ScreenRegion,
  subdivisions: number
): Point[][] {
  const grid: Point[][] = [];
  for (let row = 0; row <= subdivisions; row++) {
    const rowPoints: Point[] = [];
    const v = row / subdivisions;
    for (let col = 0; col <= subdivisions; col++) {
      const u = col / subdivisions;
      rowPoints.push(bilinearInterpolate(quad, u, v));
    }
    grid.push(rowPoints);
  }
  return grid;
}

/**
 * Draw an image into an arbitrary quadrilateral using subdivided affine transforms.
 */
export function drawPerspective(
  ctx: CanvasRenderingContext2D,
  image: CanvasImageSource,
  srcWidth: number,
  srcHeight: number,
  dstQuad: ScreenRegion,
  subdivisions: number = 12
): void {
  const grid = computeSubdivisionGrid(dstQuad, subdivisions);
  const cellW = srcWidth / subdivisions;
  const cellH = srcHeight / subdivisions;

  for (let row = 0; row < subdivisions; row++) {
    for (let col = 0; col < subdivisions; col++) {
      const srcX = col * cellW;
      const srcY = row * cellH;

      const tl = grid[row][col];
      const tr = grid[row][col + 1];
      const bl = grid[row + 1][col];

      ctx.save();

      const dxU = tr.x - tl.x;
      const dyU = tr.y - tl.y;
      const dxV = bl.x - tl.x;
      const dyV = bl.y - tl.y;

      ctx.setTransform(
        dxU / cellW,
        dyU / cellW,
        dxV / cellH,
        dyV / cellH,
        tl.x,
        tl.y
      );

      ctx.drawImage(
        image,
        srcX,
        srcY,
        cellW + 0.5,
        cellH + 0.5,
        0,
        0,
        cellW + 0.5,
        cellH + 0.5
      );

      ctx.restore();
    }
  }
}
