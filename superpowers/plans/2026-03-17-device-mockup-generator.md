# Device Mockup Generator Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a web app that composites uploaded screenshots into device frame mockups and exports high-res PNGs, entirely client-side.

**Architecture:** Next.js App Router single-page app. Canvas API composites device frame PNGs with uploaded screenshots. All state lives in one parent component, passed down via props. No backend.

**Tech Stack:** Next.js 15 (App Router), TypeScript, Tailwind CSS, Canvas API

**Spec:** `docs/superpowers/specs/2026-03-17-device-mockup-generator-design.md`

**Note:** This is a standalone project at `~/Projects/device-mockup-generator/` — separate git repo, not part of the SME monorepo. The spec/plan docs live in the SME repo for convenience during brainstorming but the implementation is independent.

**Note on export resolution:** The spec mentions "2x/3x" export. The device frame PNGs are already high-resolution (e.g., MacBook ~3200px wide). Exporting at the frame's native resolution produces high-res output suitable for marketing materials. No resolution selector is needed in V1 — the native resolution IS the high-res output.

---

## Chunk 1: Project Scaffold & Device Config

### Task 1: Create the Next.js project

**Files:**
- Create: entire project at `~/Projects/device-mockup-generator/`

- [ ] **Step 1: Scaffold Next.js app**

```bash
cd ~/Projects
npx create-next-app@latest device-mockup-generator \
  --typescript \
  --tailwind \
  --eslint \
  --app \
  --src-dir \
  --import-alias "@/*" \
  --no-turbopack
```

Accept defaults. This creates the project with App Router, TypeScript, Tailwind, and ESLint.

- [ ] **Step 2: Verify it runs**

```bash
cd ~/Projects/device-mockup-generator
npm run dev
```

Expected: Next.js dev server starts on http://localhost:3000. Visit in browser — see default Next.js page.

- [ ] **Step 3: Clean up boilerplate**

Remove the default content from `src/app/page.tsx` and `src/app/globals.css`. Replace `page.tsx` with a minimal placeholder:

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

Strip `globals.css` down to just the Tailwind directives:

```css
/* src/app/globals.css */
@tailwind base;
@tailwind components;
@tailwind utilities;
```

- [ ] **Step 4: Commit**

```bash
git add -A
git commit -m "chore: scaffold Next.js project with Tailwind and TypeScript"
```

---

### Task 2: Define device configuration and types

**Files:**
- Create: `src/lib/devices.ts`
- Create: `src/lib/types.ts`

- [ ] **Step 1: Create types file**

```ts
// src/lib/types.ts
export interface ScreenRegion {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface DeviceConfig {
  id: string;
  name: string;
  frameSrc: string;
  screenRegion: ScreenRegion;
  aspectRatio: number;
}
```

- [ ] **Step 2: Create devices config**

```ts
// src/lib/devices.ts
import { DeviceConfig } from "./types";

// Screen regions are defined in pixels relative to the frame PNG.
// These values must be measured from the actual frame assets and updated
// if the frame PNGs are replaced with different resolution versions.
export const devices: DeviceConfig[] = [
  {
    id: "iphone-15-pro",
    name: "iPhone 15 Pro",
    frameSrc: "/frames/iphone-15-pro.png",
    screenRegion: { x: 60, y: 60, width: 393, height: 852 },
    aspectRatio: 393 / 852,
  },
  {
    id: "macbook-pro-14",
    name: 'MacBook Pro 14"',
    frameSrc: "/frames/macbook-pro-14.png",
    screenRegion: { x: 290, y: 44, width: 2560, height: 1664 },
    aspectRatio: 2560 / 1664,
  },
  {
    id: "ipad-pro",
    name: "iPad Pro",
    frameSrc: "/frames/ipad-pro.png",
    screenRegion: { x: 60, y: 60, width: 2048, height: 2732 },
    aspectRatio: 2048 / 2732,
  },
];

export const defaultDevice = devices[0];
```

**Note:** The `screenRegion` values above are placeholders. They MUST be updated after sourcing the actual frame PNG assets in Task 3. To measure the correct values: open each frame PNG in an image editor, identify the transparent screen area, and record the x, y, width, height in pixels.

- [ ] **Step 3: Commit**

```bash
git add src/lib/types.ts src/lib/devices.ts
git commit -m "feat: add device config types and definitions"
```

---

### Task 3: Generate placeholder device frame assets

**Files:**
- Create: `public/frames/iphone-15-pro.png`
- Create: `public/frames/macbook-pro-14.png`
- Create: `public/frames/ipad-pro.png`
- Create: `scripts/generate-placeholder-frames.ts`
- Modify: `src/lib/devices.ts` (update screenRegion values)

The app needs device frame PNGs to function. For development and initial deployment, generate simple placeholder frames programmatically. These can be replaced with high-quality sourced frames later.

- [ ] **Step 1: Install canvas package for Node.js frame generation**

The `canvas` npm package requires native dependencies. On macOS:
```bash
brew install pkg-config cairo pango libpng jpeg giflib librsvg
```

Then install:
```bash
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
  bezel: number; // bezel thickness in px
  cornerRadius: number;
}

const frames: FrameDef[] = [
  // iPhone 15 Pro — tall portrait, thin bezels
  { filename: "iphone-15-pro.png", totalWidth: 473, totalHeight: 972, bezel: 40, cornerRadius: 60 },
  // MacBook Pro 14" — wide landscape, uniform bezel (simplified placeholder)
  { filename: "macbook-pro-14.png", totalWidth: 3040, totalHeight: 1940, bezel: 120, cornerRadius: 20 },
  // iPad Pro — portrait tablet
  { filename: "ipad-pro.png", totalWidth: 2148, totalHeight: 2892, bezel: 50, cornerRadius: 40 },
];

const outDir = join(__dirname, "..", "public", "frames");
mkdirSync(outDir, { recursive: true });

for (const frame of frames) {
  const canvas = createCanvas(frame.totalWidth, frame.totalHeight);
  const ctx = canvas.getContext("2d");

  // Fill with device color (dark gray)
  ctx.fillStyle = "#1a1a1a";
  // Rounded rect for outer frame
  ctx.beginPath();
  ctx.roundRect(0, 0, frame.totalWidth, frame.totalHeight, frame.cornerRadius);
  ctx.fill();

  // Cut out the transparent screen area
  ctx.globalCompositeOperation = "destination-out";
  ctx.fillStyle = "black";
  ctx.beginPath();
  const screenCornerRadius = Math.max(frame.cornerRadius - frame.bezel, 0);
  ctx.roundRect(
    frame.bezel,
    frame.bezel,
    frame.totalWidth - frame.bezel * 2,
    frame.totalHeight - frame.bezel * 2,
    screenCornerRadius
  );
  ctx.fill();

  const buffer = canvas.toBuffer("image/png");
  writeFileSync(join(outDir, frame.filename), buffer);
  console.log(`Generated ${frame.filename} (${frame.totalWidth}x${frame.totalHeight})`);
}
```

- [ ] **Step 3: Run the generator**

```bash
npx tsx scripts/generate-placeholder-frames.ts
```

Expected: Three PNG files created in `public/frames/`. Each has a dark gray bezel with a transparent screen area.

- [ ] **Step 4: Update devices.ts screenRegion values to match generated frames**

Update `src/lib/devices.ts` with the exact screen regions matching the generated frames:

```ts
export const devices: DeviceConfig[] = [
  {
    id: "iphone-15-pro",
    name: "iPhone 15 Pro",
    frameSrc: "/frames/iphone-15-pro.png",
    screenRegion: { x: 40, y: 40, width: 393, height: 892 },
    aspectRatio: 393 / 892,
  },
  {
    id: "macbook-pro-14",
    name: 'MacBook Pro 14"',
    frameSrc: "/frames/macbook-pro-14.png",
    screenRegion: { x: 120, y: 120, width: 2800, height: 1700 },
    aspectRatio: 2800 / 1700,
  },
  {
    id: "ipad-pro",
    name: "iPad Pro",
    frameSrc: "/frames/ipad-pro.png",
    screenRegion: { x: 50, y: 50, width: 2048, height: 2792 },
    aspectRatio: 2048 / 2792,
  },
];
```

**Note:** These values are derived from `totalSize - 2*bezel` for each frame. When replacing with real sourced frames later, re-measure the screen regions in an image editor and update these values.

- [ ] **Step 5: Verify frames visually**

Open each PNG in Preview/image viewer. Confirm:
- Dark gray border visible
- Center area is transparent (shows checkerboard in editors)
- Dimensions match the config

- [ ] **Step 6: Commit**

```bash
git add public/frames/ scripts/generate-placeholder-frames.ts src/lib/devices.ts package.json package-lock.json
git commit -m "feat: generate placeholder device frame assets with screen regions"
```

**Future improvement:** Replace placeholder frames with high-quality sourced PNGs from Figma Community, MockuPhone, or custom designs. Update `screenRegion` values to match.

---

## Chunk 2: Canvas Rendering Engine

### Task 4: Build the compositing utility

**Files:**
- Create: `src/lib/composit.ts`
- Create: `src/lib/composit.test.ts`

- [ ] **Step 1: Write the test for renderMockup**

```ts
// src/lib/composit.test.ts
import { renderMockup } from "./composit";
import { DeviceConfig } from "./types";

// Helper to create a minimal image-like object for testing
function createTestImage(width: number, height: number): HTMLImageElement {
  const img = new Image();
  Object.defineProperty(img, "naturalWidth", { value: width });
  Object.defineProperty(img, "naturalHeight", { value: height });
  return img;
}

// Helper to create a minimal device config
const testDevice: DeviceConfig = {
  id: "test-device",
  name: "Test Device",
  frameSrc: "/frames/test.png",
  screenRegion: { x: 10, y: 10, width: 100, height: 200 },
  aspectRatio: 100 / 200,
};

describe("renderMockup", () => {
  it("returns a canvas with correct dimensions (frame size + 10% padding each side)", () => {
    const frameImg = createTestImage(120, 220);
    const screenshot = createTestImage(100, 200);

    const canvas = renderMockup({
      screenshot,
      frameImage: frameImg,
      device: testDevice,
      backgroundColor: "#ffffff",
    });

    // Canvas = frame dimensions + 10% padding on each side
    // Width: 120 + 120*0.1*2 = 120 + 24 = 144
    // Height: 220 + 220*0.1*2 = 220 + 44 = 264
    expect(canvas.width).toBe(144);
    expect(canvas.height).toBe(264);
  });

  it("calls canvas context methods in correct order", () => {
    const frameImg = createTestImage(120, 220);
    const screenshot = createTestImage(100, 200);

    const calls: string[] = [];
    const mockCtx = {
      fillStyle: "",
      fillRect: (..._args: number[]) => calls.push("fillRect"),
      drawImage: (..._args: unknown[]) => calls.push("drawImage"),
      save: () => calls.push("save"),
      restore: () => calls.push("restore"),
      beginPath: () => calls.push("beginPath"),
      rect: () => calls.push("rect"),
      clip: () => calls.push("clip"),
    };

    // Mock createElement to return a canvas with our mock context
    const origCreate = document.createElement.bind(document);
    jest.spyOn(document, "createElement").mockImplementation((tag: string) => {
      if (tag === "canvas") {
        const canvas = origCreate("canvas") as HTMLCanvasElement;
        jest.spyOn(canvas, "getContext").mockReturnValue(mockCtx as unknown as CanvasRenderingContext2D);
        return canvas;
      }
      return origCreate(tag);
    });

    renderMockup({
      screenshot,
      frameImage: frameImg,
      device: testDevice,
      backgroundColor: "#ff0000",
    });

    // Order: fillRect (background), save+beginPath+rect+clip (clip to screen), drawImage (screenshot), restore, drawImage (frame)
    expect(calls).toEqual([
      "fillRect",
      "save",
      "beginPath",
      "rect",
      "clip",
      "drawImage",
      "restore",
      "drawImage",
    ]);

    jest.restoreAllMocks();
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

```bash
npm test -- --testPathPattern="composit.test" --watchAll=false
```

Expected: FAIL — `composit` module not found.

**Note:** If Jest is not configured, install it first:
```bash
npm install -D jest @types/jest ts-jest jest-environment-jsdom
```

Create `jest.config.ts`:
```ts
import type { Config } from "jest";

const config: Config = {
  testEnvironment: "jsdom",
  transform: {
    "^.+\\.tsx?$": "ts-jest",
  },
  moduleNameMapper: {
    "^@/(.*)$": "<rootDir>/src/$1",
  },
};

export default config;
```

Add to `package.json` scripts: `"test": "jest"`

- [ ] **Step 3: Implement renderMockup**

```ts
// src/lib/composit.ts
import { DeviceConfig } from "./types";

interface RenderOptions {
  screenshot: HTMLImageElement;
  frameImage: HTMLImageElement;
  device: DeviceConfig;
  backgroundColor: string;
}

export function renderMockup({
  screenshot,
  frameImage,
  device,
  backgroundColor,
}: RenderOptions): HTMLCanvasElement {
  const frameW = frameImage.naturalWidth;
  const frameH = frameImage.naturalHeight;

  // Canvas = frame + 10% padding on each side
  const padX = Math.round(frameW * 0.1);
  const padY = Math.round(frameH * 0.1);
  const canvasW = frameW + padX * 2;
  const canvasH = frameH + padY * 2;

  const canvas = document.createElement("canvas");
  canvas.width = canvasW;
  canvas.height = canvasH;

  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Failed to get canvas 2d context");

  // 1. Background
  ctx.fillStyle = backgroundColor;
  ctx.fillRect(0, 0, canvasW, canvasH);

  // 2. Screenshot — scale to cover screen region, center-crop
  const screen = device.screenRegion;
  const screenX = padX + screen.x;
  const screenY = padY + screen.y;

  const imgW = screenshot.naturalWidth;
  const imgH = screenshot.naturalHeight;
  const screenAR = screen.width / screen.height;
  const imgAR = imgW / imgH;

  let srcX = 0;
  let srcY = 0;
  let srcW = imgW;
  let srcH = imgH;

  if (imgAR > screenAR) {
    // Image is wider — crop sides
    srcW = Math.round(imgH * screenAR);
    srcX = Math.round((imgW - srcW) / 2);
  } else {
    // Image is taller — crop top/bottom
    srcH = Math.round(imgW / screenAR);
    srcY = Math.round((imgH - srcH) / 2);
  }

  ctx.save();
  ctx.beginPath();
  ctx.rect(screenX, screenY, screen.width, screen.height);
  ctx.clip();
  ctx.drawImage(
    screenshot,
    srcX,
    srcY,
    srcW,
    srcH,
    screenX,
    screenY,
    screen.width,
    screen.height
  );
  ctx.restore();

  // 3. Device frame on top
  ctx.drawImage(frameImage, padX, padY);

  return canvas;
}
```

- [ ] **Step 4: Run tests to verify they pass**

```bash
npm test -- --testPathPattern="composit.test" --watchAll=false
```

Expected: 2 tests PASS.

- [ ] **Step 5: Commit**

```bash
git add src/lib/composit.ts src/lib/composit.test.ts jest.config.ts package.json package-lock.json
git commit -m "feat: implement canvas compositing engine with tests"
```

---

### Task 5: Build the image loading utility

**Files:**
- Create: `src/lib/image-loader.ts`
- Create: `src/lib/image-loader.test.ts`

- [ ] **Step 1: Write tests for loadImage and validateImage**

```ts
// src/lib/image-loader.test.ts
import { validateImage } from "./image-loader";

describe("validateImage", () => {
  it("rejects files over 10MB", () => {
    const result = validateImage({ size: 11 * 1024 * 1024, type: "image/png" });
    expect(result).toEqual({
      valid: false,
      error: "File must be under 10MB",
    });
  });

  it("rejects non-image files", () => {
    const result = validateImage({ size: 1024, type: "application/pdf" });
    expect(result).toEqual({
      valid: false,
      error: "File must be a PNG or JPG image",
    });
  });

  it("accepts valid PNG", () => {
    const result = validateImage({ size: 1024, type: "image/png" });
    expect(result).toEqual({ valid: true, error: null });
  });

  it("accepts valid JPEG", () => {
    const result = validateImage({ size: 1024, type: "image/jpeg" });
    expect(result).toEqual({ valid: true, error: null });
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

```bash
npm test -- --testPathPattern="image-loader.test" --watchAll=false
```

Expected: FAIL — module not found.

- [ ] **Step 3: Implement image-loader**

```ts
// src/lib/image-loader.ts

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const MAX_DIMENSION = 8000;
const ALLOWED_TYPES = ["image/png", "image/jpeg"];

interface ValidationResult {
  valid: boolean;
  error: string | null;
}

export function validateImage(file: { size: number; type: string }): ValidationResult {
  if (!ALLOWED_TYPES.includes(file.type)) {
    return { valid: false, error: "File must be a PNG or JPG image" };
  }
  if (file.size > MAX_FILE_SIZE) {
    return { valid: false, error: "File must be under 10MB" };
  }
  return { valid: true, error: null };
}

export function loadImage(file: File): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      URL.revokeObjectURL(url);
      if (img.naturalWidth > MAX_DIMENSION || img.naturalHeight > MAX_DIMENSION) {
        reject(new Error(`Image dimensions must be under ${MAX_DIMENSION}x${MAX_DIMENSION}px`));
        return;
      }
      resolve(img);
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("Failed to load image. The file may be corrupted."));
    };
    img.src = url;
  });
}
```

- [ ] **Step 4: Run tests to verify they pass**

```bash
npm test -- --testPathPattern="image-loader.test" --watchAll=false
```

Expected: 4 tests PASS.

- [ ] **Step 5: Commit**

```bash
git add src/lib/image-loader.ts src/lib/image-loader.test.ts
git commit -m "feat: add image validation and loading utility"
```

---

### Task 6: Build the device suggestion utility

**Files:**
- Create: `src/lib/suggest-device.ts`
- Create: `src/lib/suggest-device.test.ts`

- [ ] **Step 1: Write tests**

```ts
// src/lib/suggest-device.test.ts
import { suggestDevice } from "./suggest-device";
import { devices } from "./devices";

describe("suggestDevice", () => {
  it("suggests iPhone for portrait screenshots", () => {
    const result = suggestDevice(390, 844);
    expect(result.id).toBe("iphone-15-pro");
  });

  it("suggests MacBook for wide landscape screenshots", () => {
    const result = suggestDevice(2560, 1664);
    expect(result.id).toBe("macbook-pro-14");
  });

  it("suggests iPad for ~4:3 portrait screenshots", () => {
    const result = suggestDevice(1024, 1366);
    expect(result.id).toBe("ipad-pro");
  });

  it("picks closest match for square images (iPad is closest to 1:1)", () => {
    const result = suggestDevice(500, 500);
    expect(result.id).toBe("ipad-pro");
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

```bash
npm test -- --testPathPattern="suggest-device.test" --watchAll=false
```

Expected: FAIL — module not found.

- [ ] **Step 3: Implement suggestDevice**

```ts
// src/lib/suggest-device.ts
import { DeviceConfig } from "./types";
import { devices, defaultDevice } from "./devices";

export function suggestDevice(imageWidth: number, imageHeight: number): DeviceConfig {
  const imageAR = imageWidth / imageHeight;

  let bestMatch = defaultDevice;
  let bestDiff = Infinity;

  for (const device of devices) {
    const diff = Math.abs(device.aspectRatio - imageAR);
    if (diff < bestDiff) {
      bestDiff = diff;
      bestMatch = device;
    }
  }

  return bestMatch;
}
```

- [ ] **Step 4: Run tests to verify they pass**

```bash
npm test -- --testPathPattern="suggest-device.test" --watchAll=false
```

Expected: 4 tests PASS.

- [ ] **Step 5: Commit**

```bash
git add src/lib/suggest-device.ts src/lib/suggest-device.test.ts
git commit -m "feat: add device suggestion based on screenshot aspect ratio"
```

---

## Chunk 3: UI Components

### Task 7: Build the UploadZone component

**Files:**
- Create: `src/components/UploadZone.tsx`

- [ ] **Step 1: Implement UploadZone**

```tsx
// src/components/UploadZone.tsx
"use client";

import { useCallback, useRef, useState } from "react";

interface UploadZoneProps {
  onImageLoaded: (image: HTMLImageElement) => void;
  onError: (message: string) => void;
}

export function UploadZone({ onImageLoaded, onError }: UploadZoneProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const previewUrlRef = useRef<string | null>(null);

  const handleFile = useCallback(
    async (file: File) => {
      const { validateImage, loadImage } = await import("@/lib/image-loader");

      const validation = validateImage(file);
      if (!validation.valid) {
        onError(validation.error!);
        return;
      }

      try {
        const img = await loadImage(file);
        // Revoke previous preview URL to prevent memory leak
        if (previewUrlRef.current) {
          URL.revokeObjectURL(previewUrlRef.current);
        }
        const newUrl = URL.createObjectURL(file);
        previewUrlRef.current = newUrl;
        setPreview(newUrl);
        onImageLoaded(img);
      } catch (err) {
        onError(err instanceof Error ? err.message : "Failed to load image");
      }
    },
    [onImageLoaded, onError]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
      const file = e.dataTransfer.files[0];
      if (file) handleFile(file);
    },
    [handleFile]
  );

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) handleFile(file);
    },
    [handleFile]
  );

  return (
    <div
      role="button"
      tabIndex={0}
      aria-label="Upload screenshot"
      className={`
        border-2 border-dashed rounded-xl p-8 text-center cursor-pointer
        transition-colors duration-200
        ${isDragging ? "border-blue-500 bg-blue-50" : "border-gray-300 hover:border-gray-400"}
      `}
      onDragOver={(e) => {
        e.preventDefault();
        setIsDragging(true);
      }}
      onDragLeave={() => setIsDragging(false)}
      onDrop={handleDrop}
      onClick={() => inputRef.current?.click()}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          inputRef.current?.click();
        }
      }}
    >
      <input
        ref={inputRef}
        type="file"
        accept="image/png,image/jpeg"
        className="hidden"
        onChange={handleChange}
      />
      {preview ? (
        <img
          src={preview}
          alt="Uploaded screenshot preview"
          className="max-h-32 mx-auto rounded"
        />
      ) : (
        <div>
          <p className="text-gray-600 font-medium">
            Drop a screenshot here or click to upload
          </p>
          <p className="text-gray-400 text-sm mt-1">PNG or JPG, max 10MB</p>
        </div>
      )}
    </div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add src/components/UploadZone.tsx
git commit -m "feat: add UploadZone component with drag-and-drop"
```

---

### Task 8: Build the DevicePicker component

**Files:**
- Create: `src/components/DevicePicker.tsx`

- [ ] **Step 1: Implement DevicePicker**

```tsx
// src/components/DevicePicker.tsx
"use client";

import { devices } from "@/lib/devices";
import { DeviceConfig } from "@/lib/types";

// Simple inline SVG silhouettes for each device type.
// The spec calls for "visual thumbnails" — these silhouettes serve that purpose
// for V1. Can be replaced with rendered previews of the actual frames later.
const deviceIcons: Record<string, React.ReactNode> = {
  "iphone-15-pro": (
    <svg viewBox="0 0 24 40" className="w-4 h-7" fill="currentColor">
      <rect x="2" y="1" width="20" height="38" rx="4" stroke="currentColor" strokeWidth="1.5" fill="none" />
      <circle cx="12" cy="36" r="1.5" fill="currentColor" />
    </svg>
  ),
  "macbook-pro-14": (
    <svg viewBox="0 0 40 28" className="w-7 h-5" fill="currentColor">
      <rect x="4" y="1" width="32" height="22" rx="2" stroke="currentColor" strokeWidth="1.5" fill="none" />
      <rect x="0" y="23" width="40" height="3" rx="1" fill="currentColor" />
    </svg>
  ),
  "ipad-pro": (
    <svg viewBox="0 0 28 36" className="w-5 h-6" fill="currentColor">
      <rect x="2" y="1" width="24" height="34" rx="3" stroke="currentColor" strokeWidth="1.5" fill="none" />
    </svg>
  ),
};

interface DevicePickerProps {
  selected: DeviceConfig;
  onSelect: (device: DeviceConfig) => void;
}

export function DevicePicker({ selected, onSelect }: DevicePickerProps) {
  return (
    <div className="flex flex-col gap-2">
      <label className="text-sm font-medium text-gray-700">Device</label>
      <div className="flex gap-2">
        {devices.map((device) => (
          <button
            key={device.id}
            onClick={() => onSelect(device)}
            aria-pressed={selected.id === device.id}
            className={`
              flex-1 flex flex-col items-center gap-1.5 px-3 py-3 rounded-lg text-xs font-medium transition-colors
              ${
                selected.id === device.id
                  ? "bg-gray-900 text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }
            `}
          >
            {deviceIcons[device.id]}
            {device.name}
          </button>
        ))}
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add src/components/DevicePicker.tsx
git commit -m "feat: add DevicePicker component"
```

---

### Task 9: Build the BackgroundPicker component

**Files:**
- Create: `src/components/BackgroundPicker.tsx`

- [ ] **Step 1: Implement BackgroundPicker**

```tsx
// src/components/BackgroundPicker.tsx
"use client";

import { useState } from "react";

const PRESETS = [
  { name: "White", value: "#ffffff" },
  { name: "Black", value: "#000000" },
  { name: "Light Gray", value: "#f3f4f6" },
  { name: "Soft Blue", value: "#dbeafe" },
  { name: "Soft Pink", value: "#fce7f3" },
];

interface BackgroundPickerProps {
  value: string;
  onChange: (color: string) => void;
}

export function BackgroundPicker({ value, onChange }: BackgroundPickerProps) {
  const [customHex, setCustomHex] = useState("");

  return (
    <div className="flex flex-col gap-2">
      <label className="text-sm font-medium text-gray-700">Background</label>
      <div className="flex gap-2 items-center">
        {PRESETS.map((preset) => (
          <button
            key={preset.value}
            onClick={() => onChange(preset.value)}
            aria-label={preset.name}
            aria-pressed={value === preset.value}
            className={`
              w-8 h-8 rounded-full border-2 transition-transform
              ${value === preset.value ? "border-gray-900 scale-110" : "border-gray-300"}
            `}
            style={{ backgroundColor: preset.value }}
          />
        ))}
        <input
          type="text"
          placeholder="#hex"
          aria-label="Custom background color hex code"
          value={customHex}
          onChange={(e) => {
            setCustomHex(e.target.value);
            if (/^#[0-9a-fA-F]{6}$/.test(e.target.value)) {
              onChange(e.target.value);
            }
          }}
          className="w-20 px-2 py-1 text-sm border rounded"
        />
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add src/components/BackgroundPicker.tsx
git commit -m "feat: add BackgroundPicker component with presets and custom hex"
```

---

### Task 10: Build the useMockupRenderer hook

**Files:**
- Create: `src/hooks/useMockupRenderer.ts`

This is a custom hook (not a component) that manages frame loading and canvas compositing. It returns the rendered canvas and any error state. This avoids the problems of a hybrid "headless component" pattern and prevents render loops.

- [ ] **Step 1: Implement useMockupRenderer**

```ts
// src/hooks/useMockupRenderer.ts
"use client";

import { useEffect, useRef, useState } from "react";
import { DeviceConfig } from "@/lib/types";
import { renderMockup } from "@/lib/composit";

interface UseMockupRendererOptions {
  screenshot: HTMLImageElement | null;
  device: DeviceConfig;
  backgroundColor: string;
}

interface UseMockupRendererResult {
  canvas: HTMLCanvasElement | null;
  error: string | null;
}

export function useMockupRenderer({
  screenshot,
  device,
  backgroundColor,
}: UseMockupRendererOptions): UseMockupRendererResult {
  const [error, setError] = useState<string | null>(null);
  const [frameImage, setFrameImage] = useState<HTMLImageElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [, forceRender] = useState(0);

  // Load the device frame image
  useEffect(() => {
    const img = new Image();
    img.onload = () => {
      setFrameImage(img);
      setError(null);
    };
    img.onerror = () => {
      setError(`Failed to load device frame: ${device.name}`);
      setFrameImage(null);
    };
    img.src = device.frameSrc;
  }, [device]);

  // Render mockup when inputs change
  useEffect(() => {
    if (!screenshot || !frameImage) {
      canvasRef.current = null;
      forceRender((n) => n + 1);
      return;
    }

    try {
      const canvas = renderMockup({
        screenshot,
        frameImage,
        device,
        backgroundColor,
      });
      canvasRef.current = canvas;
      setError(null);
      forceRender((n) => n + 1);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Rendering failed");
      canvasRef.current = null;
      forceRender((n) => n + 1);
    }
  }, [screenshot, frameImage, device, backgroundColor]);

  return { canvas: canvasRef.current, error };
}
```

**Key design decisions:**
- The canvas is stored in a ref, not state, to avoid re-render loops (setting state in an effect that depends on that state).
- A separate `forceRender` counter triggers re-renders when the canvas ref changes.
- The hook's dependencies are only the actual inputs (screenshot, frameImage, device, backgroundColor) — no callback props.

- [ ] **Step 2: Commit**

```bash
git add src/hooks/useMockupRenderer.ts
git commit -m "feat: add useMockupRenderer hook for canvas compositing"
```

---

### Task 11: Build the ExportButton component

**Files:**
- Create: `src/components/ExportButton.tsx`

- [ ] **Step 1: Implement ExportButton**

```tsx
// src/components/ExportButton.tsx
"use client";

interface ExportButtonProps {
  canvas: HTMLCanvasElement | null;
  deviceName: string;
}

export function ExportButton({ canvas, deviceName }: ExportButtonProps) {
  const handleExport = () => {
    if (!canvas) return;

    // Use toBlob instead of toDataURL — handles large canvases better
    canvas.toBlob((blob) => {
      if (!blob) return;
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.download = `mockup-${deviceName.toLowerCase().replace(/[^a-z0-9]+/g, "-")}.png`;
      link.href = url;
      link.click();
      URL.revokeObjectURL(url);
    }, "image/png");
  };

  return (
    <button
      onClick={handleExport}
      disabled={!canvas}
      className={`
        w-full py-3 rounded-lg font-medium transition-colors
        ${
          canvas
            ? "bg-gray-900 text-white hover:bg-gray-800"
            : "bg-gray-200 text-gray-400 cursor-not-allowed"
        }
      `}
    >
      Download PNG
    </button>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add src/components/ExportButton.tsx
git commit -m "feat: add ExportButton component"
```

---

## Chunk 4: Page Assembly & Polish

### Task 12: Assemble the main page

**Files:**
- Modify: `src/app/page.tsx`

- [ ] **Step 1: Wire up all components on the main page**

```tsx
// src/app/page.tsx
"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { DeviceConfig } from "@/lib/types";
import { defaultDevice } from "@/lib/devices";
import { suggestDevice } from "@/lib/suggest-device";
import { useMockupRenderer } from "@/hooks/useMockupRenderer";
import { UploadZone } from "@/components/UploadZone";
import { DevicePicker } from "@/components/DevicePicker";
import { BackgroundPicker } from "@/components/BackgroundPicker";
import { ExportButton } from "@/components/ExportButton";

export default function Home() {
  const [screenshot, setScreenshot] = useState<HTMLImageElement | null>(null);
  const [device, setDevice] = useState<DeviceConfig>(defaultDevice);
  const [bgColor, setBgColor] = useState("#ffffff");
  const [uploadError, setUploadError] = useState<string | null>(null);
  const previewRef = useRef<HTMLDivElement>(null);

  const { canvas, error: renderError } = useMockupRenderer({
    screenshot,
    device,
    backgroundColor: bgColor,
  });

  const handleImageLoaded = useCallback(
    (img: HTMLImageElement) => {
      setScreenshot(img);
      setUploadError(null);
      const suggested = suggestDevice(img.naturalWidth, img.naturalHeight);
      setDevice(suggested);
    },
    []
  );

  // Display the canvas in the preview area
  useEffect(() => {
    const container = previewRef.current;
    if (!container) return;

    // Remove previous canvas
    const existing = container.querySelector("canvas");
    if (existing) existing.remove();

    if (canvas) {
      const displayCanvas = document.createElement("canvas");
      const ctx = displayCanvas.getContext("2d");
      if (!ctx) return;

      // Scale canvas to fit container while maintaining aspect ratio
      const maxW = container.clientWidth - 32; // account for padding
      const maxH = container.clientHeight - 32;
      const scale = Math.min(maxW / canvas.width, maxH / canvas.height, 1);

      displayCanvas.width = Math.round(canvas.width * scale);
      displayCanvas.height = Math.round(canvas.height * scale);
      displayCanvas.style.borderRadius = "8px";

      ctx.drawImage(canvas, 0, 0, displayCanvas.width, displayCanvas.height);
      container.appendChild(displayCanvas);
    }
  }, [canvas]);

  return (
    <main className="min-h-screen bg-white">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold mb-8">Device Mockup Generator</h1>

        <div className="grid grid-cols-1 lg:grid-cols-[360px_1fr] gap-8">
          {/* Controls */}
          <div className="flex flex-col gap-6">
            <UploadZone onImageLoaded={handleImageLoaded} onError={setUploadError} />

            {uploadError && (
              <p className="text-red-500 text-sm">{uploadError}</p>
            )}

            <DevicePicker selected={device} onSelect={setDevice} />
            <BackgroundPicker value={bgColor} onChange={setBgColor} />
            <ExportButton canvas={canvas} deviceName={device.name} />
          </div>

          {/* Preview */}
          <div
            ref={previewRef}
            className="flex items-center justify-center bg-gray-50 rounded-xl min-h-[500px] p-4"
          >
            {renderError ? (
              <p className="text-red-500 text-sm">{renderError}</p>
            ) : !screenshot ? (
              <p className="text-gray-400">Upload a screenshot to see the preview</p>
            ) : null}
          </div>
        </div>
      </div>
    </main>
  );
}
```

- [ ] **Step 2: Run the dev server and test manually**

```bash
npm run dev
```

Test the following flow:
1. Visit http://localhost:3000
2. Upload a screenshot — should see preview appear
3. Switch devices — preview re-renders
4. Change background color — preview updates
5. Click "Download PNG" — file downloads
6. Try uploading a file > 10MB — should see error message
7. Try uploading a non-image file — should see error message
8. Resize browser to mobile width (~375px) — layout should stack vertically (controls on top, preview below)
9. Test keyboard navigation: Tab through controls, Enter/Space to trigger upload

- [ ] **Step 3: Commit**

```bash
git add src/app/page.tsx
git commit -m "feat: assemble main page with all components wired together"
```

---

### Task 13: Final polish and build verification

**Files:**
- Modify: `src/app/layout.tsx` (update metadata)

- [ ] **Step 1: Update layout metadata**

Update `src/app/layout.tsx` to set the page title and description:

```tsx
export const metadata: Metadata = {
  title: "Device Mockup Generator",
  description: "Generate device mockups from screenshots — instantly, in your browser.",
};
```

- [ ] **Step 2: Run all tests**

```bash
npm test -- --watchAll=false
```

Expected: All tests PASS.

- [ ] **Step 3: Run production build**

```bash
npm run build
```

Expected: Build succeeds with no errors.

- [ ] **Step 4: Commit**

```bash
git add src/app/layout.tsx
git commit -m "chore: update page metadata and verify build"
```
