import { describe, it, expect } from "vitest";
import { bilinearInterpolate, computeSubdivisionGrid } from "./perspective";

describe("bilinearInterpolate", () => {
  it("returns topLeft at (0,0)", () => {
    const quad = {
      topLeft: { x: 0, y: 0 },
      topRight: { x: 100, y: 0 },
      bottomLeft: { x: 0, y: 100 },
      bottomRight: { x: 100, y: 100 },
    };
    const result = bilinearInterpolate(quad, 0, 0);
    expect(result).toEqual({ x: 0, y: 0 });
  });

  it("returns bottomRight at (1,1)", () => {
    const quad = {
      topLeft: { x: 0, y: 0 },
      topRight: { x: 100, y: 0 },
      bottomLeft: { x: 0, y: 100 },
      bottomRight: { x: 100, y: 100 },
    };
    const result = bilinearInterpolate(quad, 1, 1);
    expect(result).toEqual({ x: 100, y: 100 });
  });

  it("returns center at (0.5, 0.5) for a symmetric quad", () => {
    const quad = {
      topLeft: { x: 0, y: 0 },
      topRight: { x: 100, y: 0 },
      bottomLeft: { x: 0, y: 100 },
      bottomRight: { x: 100, y: 100 },
    };
    const result = bilinearInterpolate(quad, 0.5, 0.5);
    expect(result).toEqual({ x: 50, y: 50 });
  });

  it("handles a trapezoid (perspective distortion)", () => {
    const quad = {
      topLeft: { x: 20, y: 0 },
      topRight: { x: 80, y: 0 },
      bottomLeft: { x: 0, y: 100 },
      bottomRight: { x: 100, y: 100 },
    };
    const center = bilinearInterpolate(quad, 0.5, 0.5);
    expect(center.x).toBe(50);
    expect(center.y).toBe(50);
  });
});

describe("computeSubdivisionGrid", () => {
  it("produces (N+1)x(N+1) grid points", () => {
    const quad = {
      topLeft: { x: 0, y: 0 },
      topRight: { x: 100, y: 0 },
      bottomLeft: { x: 0, y: 100 },
      bottomRight: { x: 100, y: 100 },
    };
    const grid = computeSubdivisionGrid(quad, 4);
    expect(grid.length).toBe(5);
    expect(grid[0].length).toBe(5);
  });

  it("corner points match quad corners", () => {
    const quad = {
      topLeft: { x: 10, y: 20 },
      topRight: { x: 200, y: 30 },
      bottomLeft: { x: 5, y: 300 },
      bottomRight: { x: 210, y: 310 },
    };
    const grid = computeSubdivisionGrid(quad, 8);
    expect(grid[0][0]).toEqual({ x: 10, y: 20 });
    expect(grid[0][8]).toEqual({ x: 200, y: 30 });
    expect(grid[8][0]).toEqual({ x: 5, y: 300 });
    expect(grid[8][8]).toEqual({ x: 210, y: 310 });
  });
});
