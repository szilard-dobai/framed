import { createCanvas } from "canvas";
import { writeFileSync, mkdirSync } from "fs";
import { join } from "path";

interface FrameDef {
  filename: string;
  totalWidth: number;
  totalHeight: number;
  bezel: number;
  cornerRadius: number;
  skewX: number;
  skewY: number;
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

const outDir = join(process.cwd(), "public", "frames");
mkdirSync(outDir, { recursive: true });

for (const base of baseFrames) {
  for (const angle of angles) {
    const filename = `${base.name}-${angle.suffix}.png`;
    const canvas = createCanvas(base.w, base.h);
    const ctx = canvas.getContext("2d");

    ctx.fillStyle = "#1a1a1a";
    ctx.beginPath();
    ctx.roundRect(0, 0, base.w, base.h, base.cr);
    ctx.fill();

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
