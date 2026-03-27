import { describe, it, expect } from "vitest";
import { computeCanvasDimensions, computeContainFit } from "./composite";

describe("computeCanvasDimensions", () => {
  it("adds 10% padding on each side", () => {
    const dims = computeCanvasDimensions(1000, 2000);
    expect(dims.canvasWidth).toBe(1200);
    expect(dims.canvasHeight).toBe(2400);
    expect(dims.offsetX).toBe(100);
    expect(dims.offsetY).toBe(200);
  });
});

describe("computeContainFit", () => {
  it("scales down wide image to fit width, centers vertically", () => {
    // Image: 1600x900 (16:9), Target: 900x900 (1:1)
    // scale = min(900/1600, 900/900) = min(0.5625, 1) = 0.5625
    // dw = 900, dh = 506, dx = 0, dy = 197
    const fit = computeContainFit(1600, 900, 900, 900);
    expect(fit.dw).toBe(900);
    expect(fit.dh).toBe(506);
    expect(fit.dx).toBe(0);
    expect(fit.dy).toBe(197);
  });

  it("scales down tall image to fit height, centers horizontally", () => {
    // Image: 900x1600 (9:16), Target: 900x900 (1:1)
    // scale = min(900/900, 900/1600) = min(1, 0.5625) = 0.5625
    // dw = 506, dh = 900, dx = 197, dy = 0
    const fit = computeContainFit(900, 1600, 900, 900);
    expect(fit.dw).toBe(506);
    expect(fit.dh).toBe(900);
    expect(fit.dx).toBe(197);
    expect(fit.dy).toBe(0);
  });

  it("fills exactly when aspect ratios match", () => {
    const fit = computeContainFit(1920, 1080, 960, 540);
    expect(fit.dx).toBe(0);
    expect(fit.dy).toBe(0);
    expect(fit.dw).toBe(960);
    expect(fit.dh).toBe(540);
  });
});
