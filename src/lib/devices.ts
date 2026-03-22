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
          topLeft: { x: 120, y: 120 },
          topRight: { x: 2920, y: 120 },
          bottomLeft: { x: 120, y: 1820 },
          bottomRight: { x: 2920, y: 1820 },
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
          bottomLeft: { x: 50, y: 2842 },
          bottomRight: { x: 2098, y: 2842 },
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
