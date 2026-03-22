# Device Mockup Generator — Design Spec

## Problem

Creating marketing visuals (device mockups with app screenshots) is a recurring pain point after finishing an app. Existing tools are either expensive, overly complex, or require manual work in design tools like Figma/Photoshop.

## Solution

A web app where you upload a screenshot, pick a device frame, and download a high-res PNG mockup — instantly, in the browser.

## Scope (V1)

- Upload a single screenshot (PNG/JPG)
- Pick a device: iPhone 15 Pro, MacBook Pro 14", iPad Pro
- Preview the mockup live
- Choose a background color (presets + custom hex)
- Export as high-res PNG (2x/3x)
- No backend required for V1

### Explicitly Out of Scope (V1)

- Batch upload / multi-device scenes
- 3D tilt, clay style, shadows, custom angles
- User accounts, auth, billing
- API / programmatic access

These are future additions. The architecture supports them, but V1 ships without them.

## Architecture

### Tech Stack

- **Next.js** (App Router, TypeScript) — chosen for future extensibility (API routes, auth, billing)
- **Tailwind CSS** — rapid styling
- **Canvas API** — client-side image compositing
- **Static deployment** — Vercel (no server needed for V1)

### How It Works

1. User uploads a screenshot via drag-and-drop or file picker
2. User selects a device from the device picker
3. The app renders a live preview using an HTML Canvas:
   - Fill background color
   - Draw the device frame (PNG asset)
   - Scale and clip the screenshot into the device's screen region
4. User clicks "Download" → canvas exports a high-res PNG

All processing happens client-side. No data leaves the browser.

## Components

### UploadZone

- Drag-and-drop area + file input fallback
- Accepts PNG and JPG, max 10MB / 8000x8000px (rejected with error message if exceeded)
- Shows thumbnail preview after upload
- Reads image dimensions and auto-selects the closest-matching device by aspect ratio (portrait → iPhone, landscape wide → MacBook, landscape ~4:3 → iPad). If no close match, defaults to iPhone.
- If the screenshot aspect ratio doesn't match the device screen region, the image is scaled to cover (fill) the screen area and center-cropped — no letterboxing or stretching

### DevicePicker

- Three device options: iPhone 15 Pro, MacBook Pro 14", iPad Pro
- Visual thumbnails for each device
- Selecting a device triggers the canvas to re-render

### MockupCanvas

The core rendering component:

- Uses an offscreen `<canvas>` for compositing
- Preview canvas is sized to fit the viewport (CSS-scaled)
- Export renders at the device frame's native resolution (the full-size PNG asset), producing a crisp output. For reference: an iPhone frame might be ~1400px wide, a MacBook frame ~3200px wide
- Compositing order:
  1. Background fill (solid color) — canvas is sized to the frame PNG dimensions plus padding (10% on each side)
  2. Device frame PNG (centered on canvas)
  3. Screenshot, scaled to cover and center-cropped into the screen region
- Error handling: if the uploaded image fails to decode or a frame asset fails to load, show a clear error message in the preview area. No silent failures.

### BackgroundPicker

- Row of preset solid color swatches (white, black, light gray, soft blue, soft pink)
- Custom hex input
- Changing the color triggers a canvas re-render

### ExportButton

- Exports the canvas content as PNG
- Renders at the device frame's native resolution (not the preview size)
- Triggers browser download dialog

## Device Frame Assets

Device frames are PNG images (pre-rasterized from SVGs at high resolution) to avoid Canvas SVG rendering quirks and CORS issues. Source frames from open-source mockup libraries or create minimal custom frames. Each device is defined by a config object:

```ts
interface DeviceConfig {
  id: string;
  name: string;
  frameSrc: string; // path to PNG frame asset
  screenRegion: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
  aspectRatio: number;
}
```

The `screenRegion` defines the exact pixel coordinates within the frame PNG where the screenshot should be painted. Adding new devices is just a new PNG frame + config entry.

## Page Layout

Single page, two-column layout:

- **Left panel**: Upload zone, device picker, background picker, export button
- **Right panel**: Live canvas preview (scales to fit available space)

On mobile: stacked vertically (controls on top, preview below).

## Future Extensibility

The architecture is designed to grow into:

- **More devices** — just add SVG + config
- **Customization** — tilt angle, shadow, device color → additional canvas transforms
- **Batch mode** — multiple UploadZone instances, zip download
- **Scenes** — compose multiple devices on one canvas
- **Backend** — Next.js API routes for auth (e.g., NextAuth), Stripe for billing
- **3D/Clay styles** — swap SVG frames for different aesthetic variants

Most of these are additive changes to the existing structure. Adding a backend with auth/billing would be a meaningful expansion but is well-supported by Next.js's built-in capabilities.

## State Management

Simple prop drilling from a single parent page component. State consists of:

- `uploadedImage: HTMLImageElement | null`
- `selectedDevice: DeviceConfig`
- `backgroundColor: string`

This is a small surface area — no need for context or state libraries.

## Accessibility & Mobile

- Keyboard navigation for upload zone (Enter/Space to trigger file picker), device picker, and color picker
- Screen reader labels for all interactive controls
- Mobile: the app is responsive and usable for selecting/previewing, but exporting large frames (e.g., 3200px MacBook) may be slow on low-end mobile devices. No special degradation — if the browser can handle the canvas, it works.

## Success Criteria

- Upload → preview in under 1 second (for a typical ~1MB screenshot on a modern laptop)
- Exported PNG is crisp at native device frame resolution
- Works in latest Chrome, Firefox, and Safari
- The app is a single static deployment (no backend, no database)
- Adding a new device takes < 5 minutes (PNG frame + config entry)
