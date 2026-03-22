# Device Mockup Generator Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a client-side web app that composites uploaded screenshots into pre-rendered 3D device frame mockups and exports them as PNG, JPEG, or SVG.

**Architecture:** Next.js App Router single-page app. Canvas API composites pre-rendered 3D device frame PNGs with uploaded screenshots using a subdivided-mesh perspective transform. Each device has multiple angle variants (front, tilt, isometric), each with its own frame PNG and quadrilateral screen region. All state lives in one parent component via prop drilling. No backend.

**Tech Stack:** Next.js 15 (App Router), TypeScript, Tailwind CSS, shadcn/ui, react-dropzone, Canvas API

**Spec:** `superpowers/specs/2026-03-22-device-mockup-generator-v2-design.md`

**Stitch designs:** Project ID `8902378150856072042` — desktop (simplified header) and mobile variant 1 are the reference designs.

---

## File Structure

```
src/
├── app/
│   ├── layout.tsx              # Root layout with fonts, metadata
│   ├── page.tsx                # Main page — state owner, two-column layout
│   └── globals.css             # Tailwind directives
├── components/
│   ├── upload-zone.tsx         # react-dropzone upload area
│   ├── device-picker.tsx       # Device selection cards
│   ├── angle-picker.tsx        # Angle variant thumbnails
│   ├── background-picker.tsx   # Color swatches + hex input + transparency toggle
│   ├── mockup-preview.tsx      # Canvas preview wrapper
│   ├── export-panel.tsx        # Format selector + download button
│   └── header.tsx              # App header with branding
├── lib/
│   ├── types.ts                # All shared types (DeviceConfig, AngleVariant, etc.)
│   ├── devices.ts              # Device + angle config data
│   ├── composite.ts             # Canvas compositing engine
│   ├── composite.test.ts        # Tests for compositing
│   ├── perspective.ts          # drawPerspective() subdivided mesh utility
│   ├── perspective.test.ts     # Tests for perspective transform
│   ├── export.ts               # Export to PNG/JPEG/SVG
│   ├── export.test.ts          # Tests for export
│   └── use-frame-loader.ts    # Hook for preloading/lazy-loading frame PNGs
├── components/ui/              # shadcn/ui components (auto-generated)
public/
├── frames/                     # Pre-rendered 3D device frame PNGs
│   ├── iphone-15-pro-front.png
│   ├── iphone-15-pro-tilt.png
│   ├── iphone-15-pro-isometric.png
│   ├── macbook-pro-14-front.png
│   ├── macbook-pro-14-tilt.png
│   ├── macbook-pro-14-isometric.png
│   ├── ipad-pro-front.png
│   ├── ipad-pro-tilt.png
│   └── ipad-pro-isometric.png
└── icons/                      # Device silhouette icons for picker
    ├── iphone.svg
    ├── macbook.svg
    └── ipad.svg
scripts/
└── generate-placeholder-frames.ts  # Generates placeholder frame PNGs for dev
```

---

## Chunk 1: Project Scaffold & Config

### Task 1: Scaffold Next.js project

**Files:**
- Create: entire project at `~/Projects/device-mockup-generator/`

- [ ] **Step 1: Scaffold Next.js app**

```bash
cd ~/Projects/device-mockup-generator
npx create-next-app@latest . \
  --typescript \
  --tailwind \
  --eslint \
  --app \
  --src-dir \
  --import-alias "@/*" \
  --no-turbopack
```

Accept defaults.

- [ ] **Step 2: Verify it runs**

```bash
npm run dev
```

Expected: dev server starts on http://localhost:3000.

- [ ] **Step 3: Install dependencies**

```bash
npm install react-dropzone
npx shadcn@latest init
```

For shadcn init: select defaults (New York style, Zinc base color, CSS variables: yes).

Then install the shadcn components we'll need:

```bash
npx shadcn@latest add button card input label radio-group toggle
```

Note: `lucide-react` is installed as a dependency of shadcn/ui. Verify with `npm ls lucide-react` — if missing, install explicitly: `npm install lucide-react`.

- [ ] **Step 4: Install test dependencies**

```bash
npm install -D vitest @testing-library/react @testing-library/jest-dom jsdom @vitejs/plugin-react
```

Create `vitest.config.ts`:

```ts
// vitest.config.ts
import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig({
  plugins: [react()],
  test: {
    environment: "jsdom",
    setupFiles: ["./src/test-setup.ts"],
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
});
```

Create `src/test-setup.ts`:

```ts
// src/test-setup.ts
import "@testing-library/jest-dom/vitest";
```

Add to `package.json` scripts:

```json
"test": "vitest",
"test:run": "vitest run"
```

- [ ] **Step 5: Clean up boilerplate**

Replace `src/app/page.tsx` with:

```tsx
// src/app/page.tsx
export default function Home() {
  return (
    <main className="min-h-screen flex items-center justify-center">
      <h1 className="text-2xl font-bold">Device Mockup Generator</h1>
    </main>
  );
}
```

Strip `src/app/globals.css` to just Tailwind directives (keep any shadcn-generated CSS variables):

```css
@tailwind base;
@tailwind components;
@tailwind utilities;
```

- [ ] **Step 6: Verify tests run**

```bash
npm run test:run
```

Expected: 0 tests, no errors.

- [ ] **Step 7: Commit**

```bash
git init
git add -A
git commit -m "chore: scaffold Next.js project with Tailwind, shadcn/ui, react-dropzone, and vitest"
```

---

### Task 2: Define types and device config

**Files:**
- Create: `src/lib/types.ts`
- Create: `src/lib/devices.ts`

- [ ] **Step 1: Create types file**

```ts
// src/lib/types.ts
export interface Point {
  x: number;
  y: number;
}

export interface ScreenRegion {
  topLeft: Point;
  topRight: Point;
  bottomLeft: Point;
  bottomRight: Point;
}

export interface AngleVariant {
  id: string;
  name: string;
  frameSrc: string;
  screenRegion: ScreenRegion;
  thumbnail: string;
}

export interface DeviceConfig {
  id: string;
  name: string;
  icon: string;
  angles: AngleVariant[];
}

export type ExportFormat = "png" | "jpeg" | "svg";

export interface ExportOptions {
  format: ExportFormat;
  transparent: boolean;
}
```

- [ ] **Step 2: Create devices config with placeholder values**

```ts
// src/lib/devices.ts
import { DeviceConfig } from "./types";

// Screen regions are placeholder values. They MUST be updated after
// sourcing actual frame PNGs. Measure the quadrilateral screen corners
// from each frame PNG in an image editor.

export const devices: DeviceConfig[] = [
  {
    id: "iphone-15-pro",
    name: "iPhone 15 Pro",
    icon: "/icons/iphone.svg",
    angles: [
      {
        id: "front",
        name: "Front",
        frameSrc: "/frames/iphone-15-pro-front.png",
        thumbnail: "/frames/iphone-15-pro-front.png",
        screenRegion: {
          topLeft: { x: 40, y: 40 },
          topRight: { x: 433, y: 40 },
          bottomLeft: { x: 40, y: 932 },
          bottomRight: { x: 433, y: 932 },
        },
      },
      {
        id: "tilt",
        name: "Slight Tilt",
        frameSrc: "/frames/iphone-15-pro-tilt.png",
        thumbnail: "/frames/iphone-15-pro-tilt.png",
        screenRegion: {
          topLeft: { x: 55, y: 30 },
          topRight: { x: 420, y: 50 },
          bottomLeft: { x: 55, y: 920 },
          bottomRight: { x: 420, y: 940 },
        },
      },
      {
        id: "isometric",
        name: "Isometric",
        frameSrc: "/frames/iphone-15-pro-isometric.png",
        thumbnail: "/frames/iphone-15-pro-isometric.png",
        screenRegion: {
          topLeft: { x: 80, y: 60 },
          topRight: { x: 400, y: 20 },
          bottomLeft: { x: 80, y: 900 },
          bottomRight: { x: 400, y: 860 },
        },
      },
    ],
  },
  {
    id: "macbook-pro-14",
    name: 'MacBook Pro 14"',
    icon: "/icons/macbook.svg",
    angles: [
      {
        id: "front",
        name: "Front",
        frameSrc: "/frames/macbook-pro-14-front.png",
        thumbnail: "/frames/macbook-pro-14-front.png",
        screenRegion: {
          topLeft: { x: 240, y: 44 },
          topRight: { x: 2800, y: 44 },
          bottomLeft: { x: 240, y: 1708 },
          bottomRight: { x: 2800, y: 1708 },
        },
      },
      {
        id: "tilt",
        name: "Slight Tilt",
        frameSrc: "/frames/macbook-pro-14-tilt.png",
        thumbnail: "/frames/macbook-pro-14-tilt.png",
        screenRegion: {
          topLeft: { x: 280, y: 30 },
          topRight: { x: 2760, y: 60 },
          bottomLeft: { x: 280, y: 1680 },
          bottomRight: { x: 2760, y: 1710 },
        },
      },
      {
        id: "isometric",
        name: "Isometric",
        frameSrc: "/frames/macbook-pro-14-isometric.png",
        thumbnail: "/frames/macbook-pro-14-isometric.png",
        screenRegion: {
          topLeft: { x: 300, y: 80 },
          topRight: { x: 2700, y: 20 },
          bottomLeft: { x: 300, y: 1650 },
          bottomRight: { x: 2700, y: 1590 },
        },
      },
    ],
  },
  {
    id: "ipad-pro",
    name: "iPad Pro",
    icon: "/icons/ipad.svg",
    angles: [
      {
        id: "front",
        name: "Front",
        frameSrc: "/frames/ipad-pro-front.png",
        thumbnail: "/frames/ipad-pro-front.png",
        screenRegion: {
          topLeft: { x: 50, y: 50 },
          topRight: { x: 2098, y: 50 },
          bottomLeft: { x: 50, y: 2782 },
          bottomRight: { x: 2098, y: 2782 },
        },
      },
      {
        id: "tilt",
        name: "Slight Tilt",
        frameSrc: "/frames/ipad-pro-tilt.png",
        thumbnail: "/frames/ipad-pro-tilt.png",
        screenRegion: {
          topLeft: { x: 70, y: 40 },
          topRight: { x: 2080, y: 60 },
          bottomLeft: { x: 70, y: 2770 },
          bottomRight: { x: 2080, y: 2790 },
        },
      },
      {
        id: "isometric",
        name: "Isometric",
        frameSrc: "/frames/ipad-pro-isometric.png",
        thumbnail: "/frames/ipad-pro-isometric.png",
        screenRegion: {
          topLeft: { x: 100, y: 80 },
          topRight: { x: 2050, y: 20 },
          bottomLeft: { x: 100, y: 2740 },
          bottomRight: { x: 2050, y: 2680 },
        },
      },
    ],
  },
];

export const defaultDevice = devices[0];
export const defaultAngle = devices[0].angles[0];
```

- [ ] **Step 3: Commit**

```bash
git add src/lib/types.ts src/lib/devices.ts
git commit -m "feat: add device config types and angle variant definitions"
```

---

### Task 3: Generate placeholder frame assets

**Files:**
- Create: `scripts/generate-placeholder-frames.ts`
- Create: `public/frames/*.png` (9 files)
- Create: `public/icons/*.svg` (3 files)

For development, generate simple placeholder frames so the app has something to render. These will be replaced with real 3D-rendered frames later.

- [ ] **Step 1: Install canvas package for Node.js frame generation**

```bash
brew install pkg-config cairo pango libpng jpeg giflib librsvg
npm install -D canvas
```

- [ ] **Step 2: Create the frame generator script**

```ts
// scripts/generate-placeholder-frames.ts
import { createCanvas } from "canvas";
import { writeFileSync, mkdirSync } from "fs";
import { join } from "path";

interface FrameDef {
  filename: string;
  totalWidth: number;
  totalHeight: number;
  bezel: number;
  cornerRadius: number;
  // Perspective distortion: shift top-right corner to simulate tilt
  skewX: number; // px shift for right edge
  skewY: number; // px shift for top edge
}

const baseFrames = [
  { name: "iphone-15-pro", w: 473, h: 972, bezel: 40, cr: 60 },
  { name: "macbook-pro-14", w: 3040, h: 1940, bezel: 120, cr: 20 },
  { name: "ipad-pro", w: 2148, h: 2892, bezel: 50, cr: 40 },
];

const angles = [
  { suffix: "front", skewX: 0, skewY: 0 },
  { suffix: "tilt", skewX: 15, skewY: 10 },
  { suffix: "isometric", skewX: 40, skewY: 30 },
];

const outDir = join(__dirname, "..", "public", "frames");
mkdirSync(outDir, { recursive: true });

for (const base of baseFrames) {
  for (const angle of angles) {
    const filename = `${base.name}-${angle.suffix}.png`;
    const canvas = createCanvas(base.w, base.h);
    const ctx = canvas.getContext("2d");

    // Fill with device color (dark gray)
    ctx.fillStyle = "#1a1a1a";
    ctx.beginPath();
    ctx.roundRect(0, 0, base.w, base.h, base.cr);
    ctx.fill();

    // Cut out transparent screen area
    ctx.globalCompositeOperation = "destination-out";
    ctx.fillStyle = "black";
    ctx.beginPath();
    const scr = Math.max(base.cr - base.bezel, 0);
    ctx.roundRect(
      base.bezel,
      base.bezel,
      base.w - base.bezel * 2,
      base.h - base.bezel * 2,
      scr
    );
    ctx.fill();

    const buffer = canvas.toBuffer("image/png");
    writeFileSync(join(outDir, filename), buffer);
    console.log(`Generated ${filename} (${base.w}x${base.h})`);
  }
}
```

Note: The placeholder frames are identical for all angles (just flat rectangles). The real 3D-rendered frames will look different per angle. The placeholder lets us build and test the full pipeline.

- [ ] **Step 3: Create placeholder device icons**

Create simple SVG icons for the device picker:

```bash
mkdir -p public/icons
```

`public/icons/iphone.svg`:
```svg
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="5" y="1" width="14" height="22" rx="3"/><line x1="9" y1="20" x2="15" y2="20"/></svg>
```

`public/icons/macbook.svg`:
```svg
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="2" y="3" width="20" height="14" rx="2"/><line x1="1" y1="20" x2="23" y2="20"/></svg>
```

`public/icons/ipad.svg`:
```svg
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="3" y="1" width="18" height="22" rx="2"/><line x1="10" y1="20" x2="14" y2="20"/></svg>
```

- [ ] **Step 4: Run the generator**

```bash
npx tsx scripts/generate-placeholder-frames.ts
```

Expected: 9 PNG files in `public/frames/`.

- [ ] **Step 5: Update devices.ts screen regions to match generated frames**

The generated frames use the same bezel values as defined in the script. Update `src/lib/devices.ts` screen region values so the front angles have rectangular regions matching the bezel offsets:

For iPhone front: `{ topLeft: {x:40,y:40}, topRight: {x:433,y:40}, bottomLeft: {x:40,y:932}, bottomRight: {x:433,y:932} }`
For MacBook front: `{ topLeft: {x:120,y:120}, topRight: {x:2920,y:120}, bottomLeft: {x:120,y:1820}, bottomRight: {x:2920,y:1820} }`
For iPad front: `{ topLeft: {x:50,y:50}, topRight: {x:2098,y:50}, bottomLeft: {x:50,y:2842}, bottomRight: {x:2098,y:2842} }`

(Tilt and isometric angles keep the same values for now since placeholder frames are identical. They'll be updated when real 3D frames are sourced.)

- [ ] **Step 6: Commit**

```bash
git add scripts/ public/frames/ public/icons/ src/lib/devices.ts
git commit -m "feat: generate placeholder device frame assets and icons"
```

---

## Chunk 2: Canvas Compositing Engine

### Task 4: Build the perspective transform utility

**Files:**
- Create: `src/lib/perspective.ts`
- Create: `src/lib/perspective.test.ts`

This is the core utility that maps an image into an arbitrary quadrilateral using a subdivided mesh approach.

- [ ] **Step 1: Write tests for perspective transform helpers**

```ts
// src/lib/perspective.test.ts
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
    expect(grid.length).toBe(5); // rows
    expect(grid[0].length).toBe(5); // cols
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
```

- [ ] **Step 2: Run tests to verify they fail**

```bash
npm run test:run -- src/lib/perspective.test.ts
```

Expected: FAIL — module not found.

- [ ] **Step 3: Implement perspective utilities**

```ts
// src/lib/perspective.ts
import { Point, ScreenRegion } from "./types";

/**
 * Bilinear interpolation within a quadrilateral.
 * u, v are normalized coordinates [0, 1].
 * Returns the interpolated point in the quad.
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
 * This approximates a perspective warp by splitting into small cells.
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

      // Destination quad corners for this cell
      const tl = grid[row][col];
      const tr = grid[row][col + 1];
      const bl = grid[row + 1][col];

      // Use affine transform to map the source cell to the destination parallelogram
      // defined by tl, tr, bl (we ignore br — affine can only map to parallelograms,
      // but with enough subdivisions the error is negligible)
      ctx.save();

      // Set up the affine transform:
      // Source rectangle (srcX, srcY, cellW, cellH) → destination parallelogram (tl, tr, bl)
      const dxU = tr.x - tl.x; // x-change per unit in u direction
      const dyU = tr.y - tl.y; // y-change per unit in u direction
      const dxV = bl.x - tl.x; // x-change per unit in v direction
      const dyV = bl.y - tl.y; // y-change per unit in v direction

      ctx.setTransform(
        dxU / cellW,
        dyU / cellW,
        dxV / cellH,
        dyV / cellH,
        tl.x,
        tl.y
      );

      // Draw the source cell — add 0.5px overlap to avoid seams
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
```

- [ ] **Step 4: Run tests to verify they pass**

```bash
npm run test:run -- src/lib/perspective.test.ts
```

Expected: All tests PASS.

- [ ] **Step 5: Commit**

```bash
git add src/lib/perspective.ts src/lib/perspective.test.ts
git commit -m "feat: add perspective transform utility with subdivided mesh approach"
```

---

### Task 5: Build the compositing engine

**Files:**
- Create: `src/lib/composite.ts`
- Create: `src/lib/composite.test.ts`

- [ ] **Step 1: Write tests for renderMockup**

```ts
// src/lib/composite.test.ts
import { describe, it, expect, vi } from "vitest";
import { computeCanvasDimensions, computeCoverCrop } from "./composite";

describe("computeCanvasDimensions", () => {
  it("adds 10% padding on each side", () => {
    const dims = computeCanvasDimensions(1000, 2000);
    // padding = 10% of each dimension on each side
    // width: 1000 + 1000*0.1*2 = 1200
    // height: 2000 + 2000*0.1*2 = 2400
    expect(dims.canvasWidth).toBe(1200);
    expect(dims.canvasHeight).toBe(2400);
    expect(dims.offsetX).toBe(100);
    expect(dims.offsetY).toBe(200);
  });
});

describe("computeCoverCrop", () => {
  it("crops width when image is wider than target", () => {
    // Image: 1600x900 (16:9), Target: 900x900 (1:1)
    const crop = computeCoverCrop(1600, 900, 900, 900);
    // Scale to cover: scale by height → 900/900 = 1, but width 1600 > 900
    // Scale by target: max(900/1600, 900/900) = max(0.5625, 1) = 1
    // Scaled size: 1600*1, 900*1 → crop from 1600 to 900
    expect(crop.sx).toBeGreaterThan(0); // some left crop
    expect(crop.sy).toBe(0); // no top crop
    expect(crop.sw).toBe(900); // cropped to target width
    expect(crop.sh).toBe(900); // full height
  });

  it("crops height when image is taller than target", () => {
    // Image: 900x1600 (9:16), Target: 900x900 (1:1)
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
```

- [ ] **Step 2: Run tests to verify they fail**

```bash
npm run test:run -- src/lib/composite.test.ts
```

Expected: FAIL — module not found.

- [ ] **Step 3: Implement compositing engine**

```ts
// src/lib/composite.ts
import { DeviceConfig, AngleVariant, ScreenRegion } from "./types";
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

/**
 * Compute the source rectangle for a "cover" crop (scale to fill, center-crop).
 * imgW/imgH: source image dimensions
 * targetW/targetH: target area dimensions (the screen region bounding box)
 */
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
    // Image is wider — crop sides
    sh = imgH;
    sw = Math.round(imgH * targetAspect);
    sx = Math.round((imgW - sw) / 2);
    sy = 0;
  } else if (imgAspect < targetAspect) {
    // Image is taller — crop top/bottom
    sw = imgW;
    sh = Math.round(imgW / targetAspect);
    sx = 0;
    sy = Math.round((imgH - sh) / 2);
  } else {
    // Exact match
    sx = 0;
    sy = 0;
    sw = imgW;
    sh = imgH;
  }

  return { sx, sy, sw, sh };
}

/**
 * Compute the bounding-box width and height of a quadrilateral screen region.
 */
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

/**
 * Render the full mockup to an offscreen canvas.
 * Returns the canvas element.
 */
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

  // Create a cropped version of the screenshot on a temp canvas
  const cropCanvas = document.createElement("canvas");
  cropCanvas.width = bounds.width;
  cropCanvas.height = bounds.height;
  const cropCtx = cropCanvas.getContext("2d")!;
  cropCtx.drawImage(
    screenshot,
    crop.sx,
    crop.sy,
    crop.sw,
    crop.sh,
    0,
    0,
    bounds.width,
    bounds.height
  );

  // Offset the screen region by the padding
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

  drawPerspective(ctx, cropCanvas, bounds.width, bounds.height, offsetRegion);

  // 3. Device frame on top
  ctx.setTransform(1, 0, 0, 1, 0, 0); // reset transform
  ctx.drawImage(frameImage, offsetX, offsetY);

  return canvas;
}
```

- [ ] **Step 4: Run tests to verify they pass**

```bash
npm run test:run -- src/lib/composite.test.ts
```

Expected: All tests PASS.

- [ ] **Step 5: Commit**

```bash
git add src/lib/composite.ts src/lib/composite.test.ts
git commit -m "feat: add canvas compositing engine with cover-crop and perspective mapping"
```

---

### Task 6: Build the export utility

**Files:**
- Create: `src/lib/export.ts`
- Create: `src/lib/export.test.ts`

- [ ] **Step 1: Write tests for export functions**

```ts
// src/lib/export.test.ts
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
```

- [ ] **Step 2: Run test to verify it fails**

```bash
npm run test:run -- src/lib/export.test.ts
```

Expected: FAIL — module not found.

- [ ] **Step 3: Implement export utility**

```ts
// src/lib/export.ts
import { ExportFormat } from "./types";

/**
 * Build an SVG string wrapping a raster image as a base64 <image> element.
 */
export function buildSvgString(
  dataUrl: string,
  width: number,
  height: number
): string {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
  <image href="${dataUrl}" width="${width}" height="${height}"/>
</svg>`;
}

/**
 * Trigger a browser download of a Blob or string with the given filename.
 */
function downloadBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/**
 * Export a canvas to the specified format and trigger download.
 */
export async function exportCanvas(
  canvas: HTMLCanvasElement,
  format: ExportFormat,
  filename: string = "mockup"
): Promise<void> {
  switch (format) {
    case "png": {
      const blob = await new Promise<Blob>((resolve) =>
        canvas.toBlob((b) => resolve(b!), "image/png")
      );
      downloadBlob(blob, `${filename}.png`);
      break;
    }
    case "jpeg": {
      const blob = await new Promise<Blob>((resolve) =>
        canvas.toBlob((b) => resolve(b!), "image/jpeg", 0.92)
      );
      downloadBlob(blob, `${filename}.jpg`);
      break;
    }
    case "svg": {
      const dataUrl = canvas.toDataURL("image/png");
      const svgString = buildSvgString(dataUrl, canvas.width, canvas.height);
      const blob = new Blob([svgString], { type: "image/svg+xml" });
      downloadBlob(blob, `${filename}.svg`);
      break;
    }
  }
}
```

- [ ] **Step 4: Run tests to verify they pass**

```bash
npm run test:run -- src/lib/export.test.ts
```

Expected: All tests PASS.

- [ ] **Step 5: Commit**

```bash
git add src/lib/export.ts src/lib/export.test.ts
git commit -m "feat: add multi-format export utility (PNG, JPEG, SVG)"
```

---

## Chunk 3: Frame Loader Hook

### Task 7: Build the frame loader hook

**Files:**
- Create: `src/lib/use-frame-loader.ts`

- [ ] **Step 1: Implement frame loader hook**

```ts
// src/lib/use-frame-loader.ts
"use client";

import { useState, useEffect, useRef } from "react";

interface FrameLoaderState {
  frameImage: HTMLImageElement | null;
  loading: boolean;
  error: string | null;
}

/**
 * Hook to load and cache device frame PNGs.
 * Preloads the given frameSrc and returns the loaded HTMLImageElement.
 * Caches previously loaded frames to avoid re-fetching.
 */
export function useFrameLoader(frameSrc: string): FrameLoaderState {
  const [state, setState] = useState<FrameLoaderState>({
    frameImage: null,
    loading: true,
    error: null,
  });
  const cacheRef = useRef<Map<string, HTMLImageElement>>(new Map());

  useEffect(() => {
    const cached = cacheRef.current.get(frameSrc);
    if (cached) {
      setState({ frameImage: cached, loading: false, error: null });
      return;
    }

    setState({ frameImage: null, loading: true, error: null });

    const img = new Image();
    img.onload = () => {
      cacheRef.current.set(frameSrc, img);
      setState({ frameImage: img, loading: false, error: null });
    };
    img.onerror = () => {
      setState({
        frameImage: null,
        loading: false,
        error: `Failed to load frame: ${frameSrc}`,
      });
    };
    img.src = frameSrc;
  }, [frameSrc]);

  return state;
}
```

- [ ] **Step 2: Commit**

```bash
git add src/lib/use-frame-loader.ts
git commit -m "feat: add frame loader hook with caching"
```

---

## Chunk 4: UI Components

### Task 8: Build the Header component

**Files:**
- Create: `src/components/header.tsx`

- [ ] **Step 1: Implement Header**

```tsx
// src/components/header.tsx
"use client";

import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";

interface HeaderProps {
  onExport: () => void;
  canExport: boolean;
}

export function Header({ onExport, canExport }: HeaderProps) {
  return (
    <header className="flex items-center justify-between px-6 py-4 border-b">
      <div className="flex items-center gap-3">
        <h1 className="text-xl font-bold">Mockup</h1>
        <span className="text-sm text-muted-foreground hidden sm:inline">
          Create beautiful device mockups in seconds
        </span>
      </div>
      <Button onClick={onExport} disabled={!canExport} size="sm">
        <Download className="w-4 h-4 mr-2" />
        Export
      </Button>
    </header>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add src/components/header.tsx
git commit -m "feat: add Header component"
```

---

### Task 9: Build the UploadZone component

**Files:**
- Create: `src/components/upload-zone.tsx`

- [ ] **Step 1: Implement UploadZone**

```tsx
// src/components/upload-zone.tsx
"use client";

import { useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { Upload, X } from "lucide-react";
import { Button } from "@/components/ui/button";

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const MAX_DIMENSION = 8000;
const ACCEPTED_TYPES = { "image/png": [".png"], "image/jpeg": [".jpg", ".jpeg"] };

interface UploadZoneProps {
  uploadedImage: HTMLImageElement | null;
  uploadedFileName: string | null;
  onImageUpload: (image: HTMLImageElement, fileName: string) => void;
  onImageRemove: () => void;
}

export function UploadZone({
  uploadedImage,
  uploadedFileName,
  onImageUpload,
  onImageRemove,
}: UploadZoneProps) {
  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      const file = acceptedFiles[0];
      if (!file) return;

      if (file.size > MAX_FILE_SIZE) {
        alert("File too large. Maximum size is 10MB.");
        return;
      }

      const url = URL.createObjectURL(file);
      const img = new Image();
      img.onload = () => {
        if (img.naturalWidth > MAX_DIMENSION || img.naturalHeight > MAX_DIMENSION) {
          alert(`Image too large. Maximum dimensions are ${MAX_DIMENSION}×${MAX_DIMENSION}px.`);
          URL.revokeObjectURL(url);
          return;
        }
        onImageUpload(img, file.name);
      };
      img.onerror = () => {
        alert("Failed to load image. Please try a different file.");
        URL.revokeObjectURL(url);
      };
      img.src = url;
    },
    [onImageUpload]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: ACCEPTED_TYPES,
    maxFiles: 1,
    multiple: false,
  });

  if (uploadedImage && uploadedFileName) {
    return (
      <div className="space-y-2">
        <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
          Upload Content
        </label>
        <div className="flex items-center gap-3 p-3 border rounded-lg">
          <img
            src={uploadedImage.src}
            alt="Uploaded screenshot"
            className="w-10 h-10 object-cover rounded"
          />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate">{uploadedFileName}</p>
          </div>
          <Button variant="ghost" size="icon" onClick={onImageRemove}>
            <X className="w-4 h-4" />
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
        Upload Content
      </label>
      <div
        {...getRootProps()}
        className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
          isDragActive
            ? "border-primary bg-primary/5"
            : "border-muted-foreground/25 hover:border-primary/50"
        }`}
      >
        <input {...getInputProps()} />
        <Upload className="w-8 h-8 mx-auto mb-3 text-muted-foreground" />
        <p className="text-sm font-medium">
          {isDragActive ? "Drop your screenshot here" : "Drop your screenshot here"}
        </p>
        <p className="text-xs text-muted-foreground mt-1">or click to upload</p>
        <p className="text-xs text-muted-foreground mt-2">PNG or JPG, max 10MB</p>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add src/components/upload-zone.tsx
git commit -m "feat: add UploadZone component with react-dropzone"
```

---

### Task 10: Build the DevicePicker component

**Files:**
- Create: `src/components/device-picker.tsx`

- [ ] **Step 1: Implement DevicePicker**

```tsx
// src/components/device-picker.tsx
"use client";

import { DeviceConfig } from "@/lib/types";
import Image from "next/image";

interface DevicePickerProps {
  devices: DeviceConfig[];
  selectedDevice: DeviceConfig;
  onDeviceSelect: (device: DeviceConfig) => void;
}

export function DevicePicker({
  devices,
  selectedDevice,
  onDeviceSelect,
}: DevicePickerProps) {
  return (
    <div className="space-y-2">
      <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
        Device
      </label>
      <div className="grid grid-cols-3 gap-2">
        {devices.map((device) => (
          <button
            key={device.id}
            onClick={() => onDeviceSelect(device)}
            className={`flex flex-col items-center gap-1.5 p-3 rounded-lg border-2 transition-colors ${
              selectedDevice.id === device.id
                ? "border-primary bg-primary/5"
                : "border-transparent bg-muted/50 hover:border-muted-foreground/25"
            }`}
          >
            <Image
              src={device.icon}
              alt={device.name}
              width={24}
              height={24}
              className="dark:invert"
            />
            <span className="text-xs font-medium text-center leading-tight">
              {device.name}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add src/components/device-picker.tsx
git commit -m "feat: add DevicePicker component"
```

---

### Task 11: Build the AnglePicker component

**Files:**
- Create: `src/components/angle-picker.tsx`

- [ ] **Step 1: Implement AnglePicker**

```tsx
// src/components/angle-picker.tsx
"use client";

import { AngleVariant } from "@/lib/types";

interface AnglePickerProps {
  angles: AngleVariant[];
  selectedAngle: AngleVariant;
  onAngleSelect: (angle: AngleVariant) => void;
}

export function AnglePicker({
  angles,
  selectedAngle,
  onAngleSelect,
}: AnglePickerProps) {
  return (
    <div className="space-y-2">
      <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
        Angle
      </label>
      <div className="flex gap-2">
        {angles.map((angle) => (
          <button
            key={angle.id}
            onClick={() => onAngleSelect(angle)}
            className={`flex-1 flex flex-col items-center gap-1.5 p-2 rounded-lg border-2 transition-colors ${
              selectedAngle.id === angle.id
                ? "border-primary bg-primary/5"
                : "border-transparent bg-muted/50 hover:border-muted-foreground/25"
            }`}
          >
            <img
              src={angle.thumbnail}
              alt={angle.name}
              className="w-12 h-16 object-contain"
            />
            <span className="text-xs font-medium">{angle.name}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add src/components/angle-picker.tsx
git commit -m "feat: add AnglePicker component"
```

---

### Task 12: Build the BackgroundPicker component

**Files:**
- Create: `src/components/background-picker.tsx`

- [ ] **Step 1: Implement BackgroundPicker**

```tsx
// src/components/background-picker.tsx
"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Check } from "lucide-react";

const PRESET_COLORS = [
  { name: "White", value: "#FFFFFF" },
  { name: "Black", value: "#000000" },
  { name: "Light Gray", value: "#F0F0F0" },
  { name: "Soft Blue", value: "#DBEAFE" },
  { name: "Soft Pink", value: "#FCE7F3" },
];

interface BackgroundPickerProps {
  backgroundColor: string;
  transparent: boolean;
  onColorChange: (color: string) => void;
  onTransparentChange: (transparent: boolean) => void;
}

export function BackgroundPicker({
  backgroundColor,
  transparent,
  onColorChange,
  onTransparentChange,
}: BackgroundPickerProps) {
  const [hexInput, setHexInput] = useState(backgroundColor);

  const handleHexChange = (value: string) => {
    setHexInput(value);
    // Only apply if it's a valid 6-char hex
    const clean = value.replace("#", "");
    if (/^[0-9a-fA-F]{6}$/.test(clean)) {
      onColorChange(`#${clean}`);
    }
  };

  return (
    <div className="space-y-3">
      <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
        Background
      </label>
      <div className="flex items-center gap-2">
        {PRESET_COLORS.map((color) => (
          <button
            key={color.value}
            onClick={() => {
              onColorChange(color.value);
              setHexInput(color.value);
              onTransparentChange(false);
            }}
            title={color.name}
            className={`w-8 h-8 rounded-full border-2 flex items-center justify-center transition-all ${
              backgroundColor === color.value && !transparent
                ? "border-primary ring-2 ring-primary/20"
                : "border-muted-foreground/25 hover:border-muted-foreground/50"
            }`}
            style={{ backgroundColor: color.value }}
          >
            {backgroundColor === color.value && !transparent && (
              <Check
                className="w-3 h-3"
                style={{
                  color: color.value === "#000000" ? "#fff" : "#000",
                }}
              />
            )}
          </button>
        ))}
        {/* Transparency swatch — checkerboard */}
        <button
          onClick={() => onTransparentChange(!transparent)}
          title="Transparent"
          className={`w-8 h-8 rounded-full border-2 flex items-center justify-center transition-all overflow-hidden ${
            transparent
              ? "border-primary ring-2 ring-primary/20"
              : "border-muted-foreground/25 hover:border-muted-foreground/50"
          }`}
          style={{
            backgroundImage:
              "linear-gradient(45deg, #ccc 25%, transparent 25%), linear-gradient(-45deg, #ccc 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #ccc 75%), linear-gradient(-45deg, transparent 75%, #ccc 75%)",
            backgroundSize: "8px 8px",
            backgroundPosition: "0 0, 0 4px, 4px -4px, -4px 0px",
          }}
        >
          {transparent && <Check className="w-3 h-3" />}
        </button>
      </div>
      <div className="flex items-center gap-2">
        <Label htmlFor="hex-input" className="text-xs shrink-0">
          #
        </Label>
        <Input
          id="hex-input"
          value={hexInput.replace("#", "")}
          onChange={(e) => handleHexChange(e.target.value)}
          className="h-8 text-xs font-mono"
          maxLength={6}
          placeholder="FFFFFF"
        />
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add src/components/background-picker.tsx
git commit -m "feat: add BackgroundPicker with color swatches, hex input, and transparency toggle"
```

---

### Task 13: Build the ExportPanel component

**Files:**
- Create: `src/components/export-panel.tsx`

- [ ] **Step 1: Implement ExportPanel**

```tsx
// src/components/export-panel.tsx
"use client";

import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Download } from "lucide-react";
import { ExportFormat } from "@/lib/types";

interface ExportPanelProps {
  format: ExportFormat;
  onFormatChange: (format: ExportFormat) => void;
  onExport: () => void;
  canExport: boolean;
}

const FORMAT_OPTIONS: { value: ExportFormat; label: string }[] = [
  { value: "png", label: "PNG" },
  { value: "jpeg", label: "JPEG" },
  { value: "svg", label: "SVG (raster)" },
];

export function ExportPanel({
  format,
  onFormatChange,
  onExport,
  canExport,
}: ExportPanelProps) {
  return (
    <div className="space-y-3">
      <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
        Export Format
      </label>
      <RadioGroup
        value={format}
        onValueChange={(v) => onFormatChange(v as ExportFormat)}
        className="flex gap-3"
      >
        {FORMAT_OPTIONS.map((opt) => (
          <div key={opt.value} className="flex items-center gap-1.5">
            <RadioGroupItem value={opt.value} id={`format-${opt.value}`} />
            <Label htmlFor={`format-${opt.value}`} className="text-xs cursor-pointer">
              {opt.label}
            </Label>
          </div>
        ))}
      </RadioGroup>
      <Button
        onClick={onExport}
        disabled={!canExport}
        className="w-full"
        size="lg"
      >
        <Download className="w-4 h-4 mr-2" />
        Download {format.toUpperCase()}
      </Button>
      {canExport && (
        <p className="text-xs text-muted-foreground text-center">
          High-resolution export available
        </p>
      )}
    </div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add src/components/export-panel.tsx
git commit -m "feat: add ExportPanel with format selector and download button"
```

---

### Task 14: Build the MockupPreview component

**Files:**
- Create: `src/components/mockup-preview.tsx`

- [ ] **Step 1: Implement MockupPreview**

```tsx
// src/components/mockup-preview.tsx
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

    // Draw the result onto the visible canvas, scaled to fit
    const displayCanvas = canvasRef.current;
    if (!displayCanvas || !containerRef.current) return;

    const container = containerRef.current;
    const maxW = container.clientWidth;
    const maxH = container.clientHeight;

    const scale = Math.min(maxW / result.width, maxH / result.height, 1);
    displayCanvas.width = Math.round(result.width * scale);
    displayCanvas.height = Math.round(result.height * scale);

    const ctx = displayCanvas.getContext("2d")!;
    ctx.clearRect(0, 0, displayCanvas.width, displayCanvas.height);

    // Draw checkerboard if transparent
    if (transparent) {
      const size = 10;
      for (let y = 0; y < displayCanvas.height; y += size) {
        for (let x = 0; x < displayCanvas.width; x += size) {
          ctx.fillStyle =
            (Math.floor(x / size) + Math.floor(y / size)) % 2 === 0
              ? "#e5e5e5"
              : "#ffffff";
          ctx.fillRect(x, y, size, size);
        }
      }
    }

    ctx.drawImage(result, 0, 0, displayCanvas.width, displayCanvas.height);
  }, [screenshot, frameImage, angle, backgroundColor, transparent, onCanvasReady]);

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
      <p className="text-xs text-muted-foreground">
        Preview — export will be at full resolution
      </p>
    </div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add src/components/mockup-preview.tsx
git commit -m "feat: add MockupPreview component with live canvas rendering"
```

---

## Chunk 5: Page Assembly

### Task 15: Wire up the main page

**Files:**
- Modify: `src/app/page.tsx`
- Modify: `src/app/globals.css`

- [ ] **Step 1: Implement the main page with all state and components**

```tsx
// src/app/page.tsx
"use client";

import { useState, useCallback, useRef } from "react";
import { devices, defaultDevice, defaultAngle } from "@/lib/devices";
import { DeviceConfig, AngleVariant, ExportFormat } from "@/lib/types";
import { exportCanvas } from "@/lib/export";
import { renderMockup } from "@/lib/composite";
import { useFrameLoader } from "@/lib/use-frame-loader";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
import { Header } from "@/components/header";
import { UploadZone } from "@/components/upload-zone";
import { DevicePicker } from "@/components/device-picker";
import { AnglePicker } from "@/components/angle-picker";
import { BackgroundPicker } from "@/components/background-picker";
import { ExportPanel } from "@/components/export-panel";
import { MockupPreview } from "@/components/mockup-preview";

export default function Home() {
  // State
  const [uploadedImage, setUploadedImage] = useState<HTMLImageElement | null>(null);
  const [uploadedFileName, setUploadedFileName] = useState<string | null>(null);
  const [selectedDevice, setSelectedDevice] = useState<DeviceConfig>(defaultDevice);
  const [selectedAngle, setSelectedAngle] = useState<AngleVariant>(defaultAngle);
  const [backgroundColor, setBackgroundColor] = useState("#FFFFFF");
  const [backgroundTransparent, setBackgroundTransparent] = useState(false);
  const [exportFormat, setExportFormat] = useState<ExportFormat>("png");

  // Frame loader
  const { frameImage, loading: frameLoading, error: frameError } = useFrameLoader(
    selectedAngle.frameSrc
  );

  // Canvas ref for export
  const exportCanvasRef = useRef<HTMLCanvasElement | null>(null);

  const handleCanvasReady = useCallback((canvas: HTMLCanvasElement | null) => {
    exportCanvasRef.current = canvas;
  }, []);

  // Auto-select device by aspect ratio
  const handleImageUpload = useCallback(
    (image: HTMLImageElement, fileName: string) => {
      setUploadedImage(image);
      setUploadedFileName(fileName);

      const imgAspect = image.naturalWidth / image.naturalHeight;

      // Match against front angle screen regions
      let bestDevice = devices[0];
      let bestDiff = Infinity;
      for (const device of devices) {
        const front = device.angles.find((a) => a.id === "front") ?? device.angles[0];
        const region = front.screenRegion;
        const regionW = Math.abs(region.topRight.x - region.topLeft.x);
        const regionH = Math.abs(region.bottomLeft.y - region.topLeft.y);
        const deviceAspect = regionW / regionH;
        const diff = Math.abs(imgAspect - deviceAspect);
        if (diff < bestDiff) {
          bestDiff = diff;
          bestDevice = device;
        }
      }

      setSelectedDevice(bestDevice);
      setSelectedAngle(bestDevice.angles[0]);
    },
    []
  );

  const handleImageRemove = useCallback(() => {
    setUploadedImage(null);
    setUploadedFileName(null);
  }, []);

  const handleDeviceSelect = useCallback((device: DeviceConfig) => {
    setSelectedDevice(device);
    setSelectedAngle(device.angles[0]);
  }, []);

  const handleExport = useCallback(async () => {
    if (!uploadedImage || !frameImage) return;

    let canvas = exportCanvasRef.current;
    if (!canvas) return;

    // JPEG doesn't support transparency — re-render with solid background
    if (exportFormat === "jpeg" && backgroundTransparent) {
      canvas = renderMockup({
        screenshot: uploadedImage,
        frameImage,
        angle: selectedAngle,
        backgroundColor,
        transparent: false,
      });
    }

    await exportCanvas(canvas, exportFormat, "mockup");
  }, [exportFormat, backgroundTransparent, uploadedImage, frameImage, selectedAngle, backgroundColor]);

  const canExport = !!uploadedImage && !!frameImage;

  return (
    <div className="h-screen flex flex-col">
      <Header onExport={handleExport} canExport={canExport} />

      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
        {/* Left panel — controls */}
        <aside className="w-full lg:w-80 border-r p-4 space-y-6 overflow-y-auto shrink-0 order-2 lg:order-1">
          <UploadZone
            uploadedImage={uploadedImage}
            uploadedFileName={uploadedFileName}
            onImageUpload={handleImageUpload}
            onImageRemove={handleImageRemove}
          />
          <DevicePicker
            devices={devices}
            selectedDevice={selectedDevice}
            onDeviceSelect={handleDeviceSelect}
          />
          <AnglePicker
            angles={selectedDevice.angles}
            selectedAngle={selectedAngle}
            onAngleSelect={setSelectedAngle}
          />
          <BackgroundPicker
            backgroundColor={backgroundColor}
            transparent={backgroundTransparent}
            onColorChange={setBackgroundColor}
            onTransparentChange={setBackgroundTransparent}
          />
          <ExportPanel
            format={exportFormat}
            onFormatChange={setExportFormat}
            onExport={handleExport}
            canExport={canExport}
          />
        </aside>

        {/* Right panel — preview */}
        <main className="flex-1 flex order-1 lg:order-2 min-h-[300px] lg:min-h-0">
          <MockupPreview
            screenshot={uploadedImage}
            frameImage={frameImage}
            frameLoading={frameLoading}
            frameError={frameError}
            angle={selectedAngle}
            backgroundColor={backgroundColor}
            transparent={backgroundTransparent}
            onCanvasReady={handleCanvasReady}
          />
        </main>
      </div>

      {/* Mobile sticky download bar */}
      <div className="lg:hidden border-t p-3">
        <Button
          onClick={handleExport}
          disabled={!canExport}
          className="w-full"
          size="lg"
        >
          <Download className="w-4 h-4 mr-2" />
          Download {exportFormat.toUpperCase()}
        </Button>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Verify the app runs**

```bash
npm run dev
```

Expected: App loads at http://localhost:3000. Two-column layout visible. Upload zone, device picker, angle picker, background picker, and export panel in the left column. Preview area on the right.

- [ ] **Step 3: Commit**

```bash
git add src/app/page.tsx
git commit -m "feat: wire up main page with all components and state management"
```

---

### Task 16: Run all tests and verify build

**Files:** none (verification only)

- [ ] **Step 1: Run all tests**

```bash
npm run test:run
```

Expected: All tests pass.

- [ ] **Step 2: Run production build**

```bash
npm run build
```

Expected: Build completes without errors.

- [ ] **Step 3: Run lint**

```bash
npm run lint
```

Expected: No lint errors. If there are any, fix them.

- [ ] **Step 4: Commit any fixes**

```bash
git add -A
git commit -m "fix: resolve lint and build issues"
```

(Skip this step if there are no issues.)

---

## Chunk 6: Source Real Device Frames (Manual Step)

### Task 17: Replace placeholder frames with real 3D-rendered PNGs

This is a **manual/design task** that cannot be fully automated. The implementer needs to:

- [ ] **Step 1: Source or render 3D device frame PNGs**

Options:
- Figma Community: search for "device mockup" — many free kits include perspective renders
- Blender: download free 3D device models and render at the 3 angles
- MockuPhone or similar services

Need 9 PNGs total: 3 devices × 3 angles. Each PNG should have:
- Transparent background
- Transparent screen area (where the screenshot goes)
- High resolution (iPhone ~1400px wide, MacBook ~3200px wide, iPad ~2100px wide)

- [ ] **Step 2: Place frames in `public/frames/`**

Replace the placeholder PNGs with the real ones, keeping the same filenames.

- [ ] **Step 3: Measure screen region coordinates**

For each frame PNG, open in an image editor (Figma, Photoshop, GIMP) and measure the 4 corner points of the screen area in pixels.

- [ ] **Step 4: Update `src/lib/devices.ts` with measured screen regions**

Update each `AngleVariant.screenRegion` with the actual measured quadrilateral coordinates.

- [ ] **Step 5: Test visually in the app**

Run `npm run dev`, upload a test screenshot, verify that the screenshot maps correctly into each device at each angle.

- [ ] **Step 6: Commit**

```bash
git add public/frames/ src/lib/devices.ts
git commit -m "feat: add real 3D-rendered device frame assets with measured screen regions"
```
