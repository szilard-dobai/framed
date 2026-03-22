export interface Point {
  x: number;
  y: number;
}

export interface ScreenRegion {
  topLeft: Point;
  topRight: Point;
  bottomLeft: Point;
  bottomRight: Point;
}

export interface AngleVariant {
  id: string;
  name: string;
  frameSrc: string;
  screenRegion: ScreenRegion;
  thumbnail: string;
}

export interface DeviceConfig {
  id: string;
  name: string;
  icon: string;
  angles: AngleVariant[];
}

export type ExportFormat = "png" | "jpeg" | "svg";

export interface ExportOptions {
  format: ExportFormat;
  transparent: boolean;
}
