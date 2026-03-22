# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Device Mockup Generator — a client-side web app that composites uploaded screenshots into device frame mockups and exports high-res PNGs. All processing happens in the browser; no backend.

## Tech Stack

- Next.js 15 (App Router) with TypeScript
- Tailwind CSS
- Canvas API for image compositing
- Static deployment (Vercel)

## Commands

```bash
npm run dev       # Start dev server (http://localhost:3000)
npm run build     # Production build
npm run lint      # ESLint
```

## Architecture

**Single-page app** with two-column layout (controls left, canvas preview right; stacked on mobile).

### Key Data Flow

1. User uploads screenshot → stored as `HTMLImageElement` in parent page state
2. User picks device → selects a `DeviceConfig` (frame PNG path + screen region coordinates)
3. `MockupCanvas` composites on an offscreen `<canvas>`: background fill → device frame PNG → screenshot scaled-to-cover into screen region
4. Export renders at the frame's native resolution (not preview size)

### State Management

Simple prop drilling from the root page component. Three pieces of state:
- `uploadedImage: HTMLImageElement | null`
- `selectedDevice: DeviceConfig`
- `backgroundColor: string`

No context providers or state libraries needed.

### Core Types

`DeviceConfig` defines each device: `id`, `name`, `frameSrc` (path to PNG frame), `screenRegion` (`{x, y, width, height}` in frame-pixel coordinates), and `aspectRatio`.

### Adding a New Device

1. Add the frame PNG to `public/frames/`
2. Measure the screen region coordinates from the frame PNG
3. Add a `DeviceConfig` entry in `src/lib/devices.ts`

### Components

- **UploadZone** — drag-and-drop + file picker; auto-selects closest device by aspect ratio
- **DevicePicker** — visual thumbnails for iPhone 15 Pro, MacBook Pro 14", iPad Pro
- **MockupCanvas** — offscreen canvas compositing; CSS-scaled preview, native-resolution export
- **BackgroundPicker** — preset swatches + custom hex input
- **ExportButton** — exports canvas as PNG at native frame resolution

### Image Handling

- Accepted: PNG/JPG, max 10MB / 8000x8000px
- Screenshot is scaled to cover (fill) the device screen region and center-cropped — no letterboxing or stretching
- Device frames are pre-rasterized PNGs (not SVGs) to avoid Canvas SVG/CORS issues

## Design Spec & Plan

- Spec: `superpowers/specs/2026-03-17-device-mockup-generator-design.md`
- Implementation plan: `superpowers/plans/2026-03-17-device-mockup-generator.md`
