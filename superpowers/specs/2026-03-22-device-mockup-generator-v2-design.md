# Device Mockup Generator — V2 Design Spec

Supersedes the original spec (`2026-03-17-device-mockup-generator-design.md`). Key changes: pre-rendered 3D angle variants, shadcn/ui components, react-dropzone, multi-format export with transparency control.

## Problem

Creating marketing visuals (device mockups with app screenshots) is a recurring pain point. Existing tools are expensive, overly complex, or require manual work in Figma/Photoshop.

## Solution

A web app where you upload a screenshot, pick a device and angle, choose a background, and download a high-res mockup — instantly, in the browser. All processing is client-side.

## Scope

- Upload a single screenshot (PNG/JPG)
- Pick a device: iPhone 15 Pro, MacBook Pro 14", iPad Pro
- Pick an angle: Front, Slight Tilt, Isometric (pre-rendered 3D frames per angle)
- Preview the mockup live
- Choose a background color (presets + custom hex) with optional transparency
- Export as PNG (with/without transparency), JPEG, or SVG (with/without transparency)
- No backend required

### Out of Scope

- Batch upload / multi-device scenes
- Free-rotation 3D controls (custom angle sliders)
- Clay style, custom shadows, environment lighting
- User accounts, auth, billing
- API / programmatic access

## Tech Stack

- **Next.js 15** (App Router, TypeScript)
- **Tailwind CSS** + **shadcn/ui** — component library
- **react-dropzone** — file upload
- **Canvas API** — client-side image compositing with perspective transforms
- **Static deployment** — Vercel (no server needed)

## Architecture

### How It Works

1. User uploads a screenshot via react-dropzone (drag-and-drop or click)
2. User selects a device and angle from the picker
3. The app renders a live preview using Canvas API:
   - Fill background color (or leave transparent)
   - Draw the pre-rendered 3D device frame PNG (specific to the selected angle)
   - Perspective-transform the screenshot into the quadrilateral screen region
4. User picks export format and transparency, clicks Download → canvas exports the file

All processing is client-side. No data leaves the browser.

### Pre-Rendered 3D Frame Assets

Device frames are **pre-rendered PNGs from 3D models**, one per device per angle. This means the 3D appearance is baked into the asset — no runtime 3D rendering, CSS transforms, or WebGL.

Total assets: 3 devices × 3 angles = 9 PNGs.

Source frames from Figma Community mockup kits or render from free 3D device models (Blender). Each frame PNG has a transparent screen area where the screenshot gets composited.

### Screen Region as Quadrilateral

Because a perspective-rendered screen is a trapezoid (not a rectangle), each angle variant defines its screen region as 4 corner points:

```ts
interface Point {
  x: number;
  y: number;
}

interface ScreenRegion {
  topLeft: Point;
  topRight: Point;
  bottomLeft: Point;
  bottomRight: Point;
}
```

The Canvas compositing engine maps the screenshot into these 4 points using a perspective transform (subdivided mesh approach — split the quad into small triangles and use `drawImage` with clipping for each, which avoids needing WebGL for perspective correction).

### Types

```ts
interface DeviceConfig {
  id: string;
  name: string;
  icon: string;         // path to device silhouette icon for the picker
  angles: AngleVariant[];
}

interface AngleVariant {
  id: string;           // "front", "tilt", "isometric"
  name: string;         // "Front", "Slight Tilt", "Isometric"
  frameSrc: string;     // path to pre-rendered 3D frame PNG
  screenRegion: ScreenRegion;
  thumbnail: string;    // small preview for angle picker
}

type ExportFormat = "png" | "jpeg" | "svg";

interface ExportOptions {
  format: ExportFormat;
  transparent: boolean; // for PNG/SVG only; ignored for JPEG
}
```

### Adding a New Device

1. Render or source the frame PNGs for each angle
2. Measure the screen region quadrilateral corners from each frame PNG
3. Add a `DeviceConfig` entry in `src/lib/devices.ts`

### Adding a New Angle

1. Render the frame PNG at the new angle for each device
2. Measure screen region corners
3. Add an `AngleVariant` to each device's `angles` array

## Components

### UploadZone

- Built with react-dropzone
- Drag-and-drop area + click-to-upload fallback
- Accepts PNG and JPG, max 10MB / 8000×8000px (rejected with error message if exceeded)
- Shows thumbnail preview after upload with remove/replace action
- Reads image dimensions and auto-selects the closest-matching device by aspect ratio, compared against each device's **front** angle screen region (portrait → iPhone, landscape wide → MacBook, landscape ~4:3 → iPad). If no close match, defaults to iPhone.
- If the screenshot aspect ratio doesn't match the screen region, the image is **scaled to cover** (fill) the screen area and **center-cropped** — no letterboxing or stretching.

### DevicePicker

- shadcn card group showing device silhouette icons + names
- Three options: iPhone 15 Pro, MacBook Pro 14", iPad Pro
- Selected device has a highlighted border
- Selecting a device triggers re-render with the first angle of that device

### AnglePicker

- Row of small thumbnails showing the device at each angle
- Thumbnails are cropped-down versions of the frame PNGs
- Selecting an angle triggers canvas re-render

### BackgroundPicker

- Row of 5 preset color swatches: white, black, light gray (#F0F0F0), soft blue (#DBEAFE), soft pink (#FCE7F3)
- Selected swatch has a ring indicator
- Custom hex input field
- Transparency toggle (when transparent, background color is ignored in export but still shown as a checkerboard pattern in preview)

### MockupPreview

The core rendering component:

- Uses an offscreen `<canvas>` for compositing
- Preview canvas is CSS-scaled to fit the viewport
- Compositing order:
  1. Background fill (solid color or transparent)
  2. Screenshot, perspective-transformed into the screen region quadrilateral
  3. Device frame PNG drawn on top (frame overlays the screenshot edges for clean masking)
- Canvas is sized to the frame PNG dimensions plus padding (10% on each side)
- Error handling: if the uploaded image fails to decode or a frame asset fails to load, show an error message in the preview area

### ExportPanel

- Format selector: PNG / JPEG / SVG (shadcn radio group or segmented control)
- Transparency toggle (enabled for PNG/SVG, disabled/hidden for JPEG)
- "Download" button triggers export
- Export renders at native frame resolution (not preview size)
- PNG: `canvas.toBlob('image/png')`
- JPEG: `canvas.toBlob('image/jpeg', 0.92)` — always with solid background, quality 0.92
- SVG: embeds the canvas raster output as a base64 `<image>` inside an SVG wrapper. This is **not** true vector SVG — it's a raster-in-SVG container, useful for workflows that prefer SVG files (e.g., Figma import, design tool compatibility). Label as "SVG (raster)" in the UI if ambiguity is a concern.

### Screenshot Compositing: Perspective Transform

The screenshot must be mapped into an arbitrary quadrilateral (the screen region). Since Canvas 2D doesn't support perspective transforms natively, use a **subdivided mesh approach**:

1. Divide the screenshot into an N×N grid of small rectangles
2. For each grid cell, compute the corresponding quadrilateral in the target screen region using bilinear interpolation of the 4 corner points
3. Draw each cell using `drawImage` with affine transforms (each small quad is close enough to a parallelogram that affine approximation works)

N=8 or N=16 gives visually smooth results. This is a well-known technique for 2D canvas perspective simulation.

Encapsulate this in a `drawPerspective(ctx, image, srcRect, dstQuad, subdivisions)` utility.

## Page Layout

Single page, two-column layout (matching the Stitch design):

- **Left panel** (~320px): UploadZone, DevicePicker, AnglePicker, BackgroundPicker, ExportPanel
- **Right panel**: Live MockupPreview (scales to fit available space)
- **Header**: "Mockup" branding + tagline, Export button on far right. No nav tabs.

On mobile: stacked vertically (preview on top, controls below, sticky download bar at bottom).

## State Management

Simple prop drilling from the root page component:

- `uploadedImage: HTMLImageElement | null`
- `selectedDevice: DeviceConfig`
- `selectedAngle: AngleVariant`
- `backgroundColor: string`
- `backgroundTransparent: boolean`
- `exportOptions: ExportOptions`

Small surface area — no context or state libraries needed. `exportOptions` lives at the page level because `backgroundTransparent` affects the preview rendering (checkerboard pattern).

## Asset Loading

- **Default device** (iPhone, front angle): frame PNG is preloaded on page load for instant preview.
- **Other frames**: lazy-loaded when the user selects a different device or angle. Show a brief loading spinner in the preview while loading.
- Frame PNGs should be optimized (compressed, reasonable resolution). Typical sizes: ~200-500KB per frame.

## Accessibility

- shadcn/ui components provide baseline keyboard navigation and ARIA attributes.
- Upload zone responds to Enter/Space to trigger file picker.
- Device picker, angle picker, and color swatches are keyboard-navigable.
- Screen reader labels on all interactive controls.
- Mobile: responsive and usable; exporting large frames may be slow on low-end devices but no special degradation is needed.

## Future Extensibility

The architecture supports:

- **More devices** — add frame PNGs + config
- **More angles** — add per-device frame PNGs + config
- **Free rotation** — replace the preset angle system with a React Three Fiber viewport using actual 3D device models. The `DeviceConfig` and compositing interfaces would extend, not break.
- **Batch mode** — multiple UploadZone instances, zip download
- **Scenes** — compose multiple devices on one canvas
- **Backend** — Next.js API routes for auth, Stripe for billing

## Success Criteria

- Upload → preview in under 1 second (typical ~1MB screenshot, modern laptop)
- Exported files are crisp at native frame resolution
- Works in latest Chrome, Firefox, Safari
- Single static deployment (no backend, no database)
- Adding a new device or angle takes < 10 minutes (frame PNGs + config entry)
