import { describe, it, expect } from "vitest";
import { devices, defaultDevice, defaultAngle } from "./devices";

describe("devices", () => {
  it("has at least one device", () => {
    expect(devices.length).toBeGreaterThan(0);
  });

  it("every device has a unique id", () => {
    const ids = devices.map((d) => d.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("every device has at least one angle", () => {
    for (const device of devices) {
      expect(device.angles.length).toBeGreaterThan(0);
    }
  });

  it("every angle has valid screen region points", () => {
    for (const device of devices) {
      for (const angle of device.angles) {
        const { topLeft, topRight, bottomLeft, bottomRight } =
          angle.screenRegion;
        // All points must have non-negative coordinates
        for (const point of [topLeft, topRight, bottomLeft, bottomRight]) {
          expect(point.x).toBeGreaterThanOrEqual(0);
          expect(point.y).toBeGreaterThanOrEqual(0);
        }
        // Top should be above bottom (smaller y)
        expect(topLeft.y).toBeLessThan(bottomLeft.y);
        expect(topRight.y).toBeLessThan(bottomRight.y);
      }
    }
  });

  it("every angle has a non-negative corner radius", () => {
    for (const device of devices) {
      for (const angle of device.angles) {
        expect(angle.screenCornerRadius).toBeGreaterThanOrEqual(0);
      }
    }
  });

  it("every angle has unique id within its device", () => {
    for (const device of devices) {
      const ids = device.angles.map((a) => a.id);
      expect(new Set(ids).size).toBe(ids.length);
    }
  });
});

describe("defaults", () => {
  it("defaultDevice is the first device", () => {
    expect(defaultDevice).toBe(devices[0]);
  });

  it("defaultAngle is the first angle of the first device", () => {
    expect(defaultAngle).toBe(devices[0].angles[0]);
  });
});
