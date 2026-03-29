# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**Framed** — a free, client-side web app that composites uploaded screenshots into device frame mockups and exports high-res PNGs/JPEGs. All processing happens in the browser; no backend.

**Live:** https://framed-gray.vercel.app

## Tech Stack

- Next.js 16 (App Router) with React 19 and TypeScript
- Tailwind CSS v4
- Canvas API for image compositing
- Vitest + Testing Library for tests
- shadcn/ui components (base-nova style)
- Vercel Analytics
- Static deployment (Vercel)

## Commands

```bash
npm run dev       # Start dev server (http://localhost:3000)
npm run build     # Production build
npm run lint      # ESLint
npm test          # Run tests (watch mode)
npm run test:run  # Run tests (single run)
```

## Architecture

**Single-page app** with sidebar layout (320px sidebar on desktop; stacked on mobile with sticky bottom export bar). Max page width 1920px.

### Key Data Flow

1. User uploads screenshot → stored as `HTMLImageElement` in parent page state
2. User picks device + angle → selects a `DeviceConfig` and `AngleVariant` (frame PNG path + screen region coordinates)
3. `MockupPreview` composites on an offscreen `<canvas>`: background fill → perspective-transformed screenshot → rounded-corner clipping → device frame PNG overlay
4. Export renders at the frame's native resolution with 10% padding (not preview size)

### State Management

Simple prop drilling from the root page component (`src/app/page.tsx`). Key state:
- `uploadedImage: HTMLImageElement | null` + `uploadedFileName`
- `selectedDevice: DeviceConfig` + `selectedAngle: AngleVariant`
- `backgroundColor: string` + `backgroundTransparent: boolean`
- `exportFormat: ExportFormat` ("png" | "jpeg")
- `exporting: boolean` (loading state)

No context providers or state libraries needed.

### Core Types (`src/lib/types.ts`)

- `DeviceConfig` — device with `id`, `name`, `icon`, and `angles: AngleVariant[]`
- `AngleVariant` — each angle: `id`, `name`, `frameSrc`, `screenRegion` (quadrilateral), `screenCornerRadius`, `thumbnail`
- `ScreenRegion` — four `Point`s (`topLeft`, `topRight`, `bottomLeft`, `bottomRight`) defining where the screenshot maps onto the frame
- `ExportFormat` — "png" | "jpeg"

### Adding a New Device

1. Add the frame PNG(s) to `public/frames/`
2. Add a device icon SVG to `public/icons/`
3. Measure screen region coordinates (quadrilateral corners) from each frame PNG
4. Add a `DeviceConfig` entry with angle variants in `src/lib/devices.ts`

### Components

- **Header** (`header.tsx`) — branding ("Framed") + desktop export button
- **UploadZone** (`upload-zone.tsx`) — drag-and-drop + file picker via react-dropzone; shows thumbnail preview
- **DevicePicker** (`device-picker.tsx`) — icon grid for device selection (iPhone 15 Pro, iPad Pro 11", MacBook Pro 14")
- **AnglePicker** (`angle-picker.tsx`) — horizontal tabs with thumbnail previews for each angle variant
- **BackgroundPicker** (`background-picker.tsx`) — preset color swatches + custom hex input via react-colorful + transparent toggle
- **MockupPreview** (`mockup-preview.tsx`) — canvas compositing with CSS-scaled preview; checkerboard for transparency; loading/error states
- **ExportPanel** (`export-panel.tsx`) — PNG/JPEG format selector + export button

### Key Libraries

- **Composite engine** (`src/lib/composite.ts`) — renders screenshot onto device frame with padding, contain-fit scaling, and layer compositing
- **Perspective transform** (`src/lib/perspective.ts`) — bilinear interpolation with 12x12 subdivided affine transforms for angled device views
- **Export** (`src/lib/export.ts`) — PNG/JPEG blob export with auto-download; JPEG at 0.92 quality; handles transparent→solid background fallback for JPEG
- **Frame loader** (`src/lib/use-frame-loader.ts`) — React hook that caches loaded frame `HTMLImageElement`s by URL

### Image Handling

- Accepted: PNG/JPG, max 10MB / 8000x8000px
- Screenshot is scaled to contain (fit) the device screen region and centered — letterboxed if aspect ratios don't match
- Screen regions are quadrilaterals (4 corner points), enabling perspective-correct mapping for angled views
- Rounded corners applied via quadratic curve clipping paths
- Device frames are pre-rasterized PNGs (not SVGs) to avoid Canvas SVG/CORS issues

### Available Devices

| Device | Angles |
|--------|--------|
| iPhone 15 Pro | Portrait, Landscape, Perspective (left) |
| iPad Pro 11" | Portrait, Landscape, Perspective (right) |
| MacBook Pro 14" | Front |

## Design Spec & Plan

- Spec: `superpowers/specs/2026-03-17-device-mockup-generator-design.md`
- Implementation plan: `superpowers/plans/2026-03-17-device-mockup-generator.md`
