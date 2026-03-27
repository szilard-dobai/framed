import { ExportFormat } from "./types";

function downloadBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export async function exportCanvas(
  canvas: HTMLCanvasElement,
  format: ExportFormat,
  filename: string = "mockup"
): Promise<void> {
  switch (format) {
    case "png": {
      const blob = await new Promise<Blob>((resolve) =>
        canvas.toBlob((b) => resolve(b!), "image/png")
      );
      downloadBlob(blob, `${filename}.png`);
      break;
    }
    case "jpeg": {
      const blob = await new Promise<Blob>((resolve) =>
        canvas.toBlob((b) => resolve(b!), "image/jpeg", 0.92)
      );
      downloadBlob(blob, `${filename}.jpg`);
      break;
    }
  }
}
