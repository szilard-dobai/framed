import { DeviceConfig } from "./types";

// Screen region coordinates measured from actual frame PNGs (transparent area scan)
// with a small inset (~4px) to avoid clipping at rounded corners.

const INSET = 4;

function rect(l: number, t: number, r: number, b: number) {
  return {
    topLeft: { x: l + INSET, y: t + INSET },
    topRight: { x: r - INSET, y: t + INSET },
    bottomLeft: { x: l + INSET, y: b - INSET },
    bottomRight: { x: r - INSET, y: b - INSET },
  };
}

export const devices: DeviceConfig[] = [
  {
    id: "iphone-15-pro",
    name: "iPhone 15 Pro",
    icon: "/icons/iphone.svg",
    angles: [
      {
        id: "portrait",
        name: "Portrait",
        frameSrc: "/frames/iphone-15-pro-portrait.png",
        thumbnail: "/frames/iphone-15-pro-portrait.png",
        // Measured: 120,120 → 1298,2675
        screenRegion: rect(120, 120, 1298, 2675),
        screenCornerRadius: 30,
      },
      {
        id: "landscape",
        name: "Landscape",
        frameSrc: "/frames/iphone-15-pro-landscape.png",
        thumbnail: "/frames/iphone-15-pro-landscape.png",
        // Measured: 120,120 → 2675,1298 (extends behind Dynamic Island)
        screenRegion: rect(120, 120, 2675, 1298),
        screenCornerRadius: 33,
      },
      {
        id: "left",
        name: "Perspective",
        frameSrc: "/frames/iphone-15-pro-left.png",
        thumbnail: "/frames/iphone-15-pro-left.png",
        screenRegion: {
          // MockUPhone coords with inset to avoid corner bleed
          topLeft: { x: 590, y: 200 },
          topRight: { x: 1665, y: 260 },
          bottomLeft: { x: 165, y: 2580 },
          bottomRight: { x: 1195, y: 2900 },
        },
        screenCornerRadius: 0,
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
        // Measured: 461,301 → 3482,2262
        screenRegion: rect(461, 301, 3482, 2262),
        screenCornerRadius: 8,
      },
    ],
  },
  {
    id: "ipad-pro",
    name: "iPad Pro",
    icon: "/icons/ipad.svg",
    angles: [
      {
        id: "portrait",
        name: "Portrait",
        frameSrc: "/frames/ipad-pro-portrait.png",
        thumbnail: "/frames/ipad-pro-portrait.png",
        // Measured: 111,111 → 1778,2498
        screenRegion: rect(111, 111, 1778, 2498),
        screenCornerRadius: 20,
      },
      {
        id: "landscape",
        name: "Landscape",
        frameSrc: "/frames/ipad-pro-landscape.png",
        thumbnail: "/frames/ipad-pro-landscape.png",
        // Measured: 111,111 → 2498,1778
        screenRegion: rect(111, 111, 2498, 1778),
        screenCornerRadius: 20,
      },
      {
        id: "right",
        name: "Perspective",
        frameSrc: "/frames/ipad-pro-right.png",
        thumbnail: "/frames/ipad-pro-right.png",
        screenRegion: {
          // MockUPhone coords with inset to avoid corner bleed
          topLeft: { x: 190, y: 235 },
          topRight: { x: 1445, y: 275 },
          bottomLeft: { x: 683, y: 2025 },
          bottomRight: { x: 1995, y: 1965 },
        },
        screenCornerRadius: 0,
      },
    ],
  },
];

export const defaultDevice = devices[0];
export const defaultAngle = devices[0].angles[0];
