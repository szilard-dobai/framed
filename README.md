# Framed

<p align="center">
  <img src="public/icon.svg" alt="Framed Logo" width="80" height="80" />
</p>

<p align="center">
  <strong>Device mockups, instantly.</strong><br />
  Upload a screenshot, pick a device frame, and download a high-res mockup - no signup required.
</p>

<p align="center">
  <a href="https://framed-gray.vercel.app">
    <img src="https://img.shields.io/website?url=https%3A%2F%2Fframed-gray.vercel.app&label=framed" alt="Website Status" />
  </a>
</p>

<p align="center">
  <img src="public/og-image.png" alt="Framed Preview" width="600" />
</p>

## Features

- 3 devices (iPhone 15 Pro, iPad Pro 11", MacBook Pro 14") with 7 angle variants including perspective views
- PNG and JPEG export at full device-frame resolution
- Transparent background support
- Custom background colors via color picker or preset swatches
- Perspective transforms for angled device views
- Fully client-side - no uploads to any server

## Tech Stack

- **Framework:** [Next.js 16](https://nextjs.org/) with App Router
- **React:** 19.2
- **Styling:** [Tailwind CSS v4](https://tailwindcss.com/)
- **Image compositing:** Canvas API
- **Testing:** [Vitest](https://vitest.dev/) + Testing Library
- **Deployment:** [Vercel](https://vercel.com/) with Analytics

## Getting Started

```bash
npm install
npm run dev       # Start dev server (http://localhost:3000)
```

## Commands

| Command            | Description             |
| ------------------ | ----------------------- |
| `npm run dev`      | Start dev server        |
| `npm run build`    | Create production build |
| `npm run lint`     | Run ESLint              |
| `npm test`         | Run tests (watch mode)  |
| `npm run test:run` | Run tests (single run)  |

## Attribution

Device frames are based on resources from [Apple Design Resources](https://developer.apple.com/design/resources/) and [Meta Design Resources](https://design.facebook.com/toolsandresources/devices/), sourced via [MockUPhone](https://mockuphone.com). All trademarks and device names belong to their respective owners.
