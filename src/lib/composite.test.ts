import { describe, it, expect } from "vitest";
import { computeCanvasDimensions, computeCoverCrop } from "./composite";

describe("computeCanvasDimensions", () => {
  it("adds 10% padding on each side", () => {
    const dims = computeCanvasDimensions(1000, 2000);
    expect(dims.canvasWidth).toBe(1200);
    expect(dims.canvasHeight).toBe(2400);
    expect(dims.offsetX).toBe(100);
    expect(dims.offsetY).toBe(200);
  });
});

describe("computeCoverCrop", () => {
  it("crops width when image is wider than target", () => {
    const crop = computeCoverCrop(1600, 900, 900, 900);
    expect(crop.sx).toBeGreaterThan(0);
    expect(crop.sy).toBe(0);
    expect(crop.sw).toBe(900);
    expect(crop.sh).toBe(900);
  });

  it("crops height when image is taller than target", () => {
    const crop = computeCoverCrop(900, 1600, 900, 900);
    expect(crop.sx).toBe(0);
    expect(crop.sy).toBeGreaterThan(0);
    expect(crop.sw).toBe(900);
    expect(crop.sh).toBe(900);
  });

  it("no crop when aspect ratios match", () => {
    const crop = computeCoverCrop(1920, 1080, 960, 540);
    expect(crop.sx).toBe(0);
    expect(crop.sy).toBe(0);
    expect(crop.sw).toBe(1920);
    expect(crop.sh).toBe(1080);
  });
});
