import { describe, it, expect } from "vitest";
import { buildSvgString } from "./export";

describe("buildSvgString", () => {
  it("wraps a data URL in an SVG image element", () => {
    const dataUrl = "data:image/png;base64,abc123";
    const svg = buildSvgString(dataUrl, 800, 600);
    expect(svg).toContain("<svg");
    expect(svg).toContain('width="800"');
    expect(svg).toContain('height="600"');
    expect(svg).toContain(dataUrl);
    expect(svg).toContain("</svg>");
  });
});
