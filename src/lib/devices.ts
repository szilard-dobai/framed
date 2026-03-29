import { DeviceConfig } from "./types";

function rect(l: number, t: number, r: number, b: number) {
  return {
    topLeft: { x: l, y: t },
    topRight: { x: r, y: t },
    bottomLeft: { x: l, y: b },
    bottomRight: { x: r, y: b },
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
        screenRegion: rect(120, 120, 1299, 2676),
        screenCornerRadius: 55,
      },
      {
        id: "landscape",
        name: "Landscape",
        frameSrc: "/frames/iphone-15-pro-landscape.png",
        thumbnail: "/frames/iphone-15-pro-landscape.png",
        screenRegion: rect(120, 120, 2676, 1299),
        screenCornerRadius: 55,
      },
      {
        id: "left",
        name: "Perspective",
        frameSrc: "/frames/iphone-15-pro-left.png",
        thumbnail: "/frames/iphone-15-pro-left.png",
        screenRegion: {
          topLeft: { x: 571, y: 177 },
          topRight: { x: 1684, y: 239 },
          bottomLeft: { x: 144, y: 2607 },
          bottomRight: { x: 1210, y: 2927 },
        },
        screenCornerRadius: 50,
      },
    ],
  },
  {
    id: "ipad-pro",
    name: 'iPad Pro 11"',
    icon: "/icons/ipad.svg",
    angles: [
      {
        id: "portrait",
        name: "Portrait",
        frameSrc: "/frames/ipad-pro-portrait.png",
        thumbnail: "/frames/ipad-pro-portrait.png",
        screenRegion: rect(110, 110, 1778, 2498),
        screenCornerRadius: 20,
      },
      {
        id: "landscape",
        name: "Landscape",
        frameSrc: "/frames/ipad-pro-landscape.png",
        thumbnail: "/frames/ipad-pro-landscape.png",
        screenRegion: rect(110, 110, 2498, 1778),
        screenCornerRadius: 20,
      },
      {
        id: "right",
        name: "Perspective",
        frameSrc: "/frames/ipad-pro-right.png",
        thumbnail: "/frames/ipad-pro-right.png",
        screenRegion: {
          topLeft: { x: 172, y: 216 },
          topRight: { x: 1461.5, y: 258.5 },
          bottomLeft: { x: 666, y: 2046 },
          bottomRight: { x: 2012, y: 1981 },
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
        screenRegion: rect(459, 299, 3483, 2263),
        screenCornerRadius: 8,
      },
    ],
  },
];

export const defaultDevice = devices[0];
export const defaultAngle = devices[0].angles[0];
