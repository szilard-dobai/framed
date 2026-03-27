// src/app/page.tsx
"use client";

import { useState, useCallback, useRef } from "react";
import { devices, defaultDevice, defaultAngle } from "@/lib/devices";
import { DeviceConfig, AngleVariant, ExportFormat } from "@/lib/types";
import { exportCanvas } from "@/lib/export";
import { renderMockup } from "@/lib/composite";
import { useFrameLoader } from "@/lib/use-frame-loader";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
import { Header } from "@/components/header";
import { UploadZone } from "@/components/upload-zone";
import { DevicePicker } from "@/components/device-picker";
import { AnglePicker } from "@/components/angle-picker";
import { BackgroundPicker } from "@/components/background-picker";
import { ExportPanel } from "@/components/export-panel";
import { MockupPreview } from "@/components/mockup-preview";

export default function Home() {
  // State
  const [uploadedImage, setUploadedImage] = useState<HTMLImageElement | null>(
    null
  );
  const [uploadedFileName, setUploadedFileName] = useState<string | null>(null);
  const [selectedDevice, setSelectedDevice] =
    useState<DeviceConfig>(defaultDevice);
  const [selectedAngle, setSelectedAngle] =
    useState<AngleVariant>(defaultAngle);
  const [backgroundColor, setBackgroundColor] = useState("#FFFFFF");
  const [backgroundTransparent, setBackgroundTransparent] = useState(false);
  const [exportFormat, setExportFormat] = useState<ExportFormat>("png");

  // Frame loader
  const {
    frameImage,
    loading: frameLoading,
    error: frameError,
  } = useFrameLoader(selectedAngle.frameSrc);

  // Canvas ref for export
  const exportCanvasRef = useRef<HTMLCanvasElement | null>(null);

  const handleCanvasReady = useCallback((canvas: HTMLCanvasElement | null) => {
    exportCanvasRef.current = canvas;
  }, []);

  const handleImageUpload = useCallback(
    (image: HTMLImageElement, fileName: string) => {
      setUploadedImage(image);
      setUploadedFileName(fileName);
    },
    []
  );

  const handleImageRemove = useCallback(() => {
    setUploadedImage(null);
    setUploadedFileName(null);
  }, []);

  const handleDeviceSelect = useCallback((device: DeviceConfig) => {
    setSelectedDevice(device);
    setSelectedAngle(device.angles[0]);
  }, []);

  const handleExport = useCallback(async () => {
    if (!uploadedImage || !frameImage) return;

    let canvas = exportCanvasRef.current;
    if (!canvas) return;

    // JPEG doesn't support transparency - re-render with solid background
    if (exportFormat === "jpeg" && backgroundTransparent) {
      canvas = renderMockup({
        screenshot: uploadedImage,
        frameImage,
        angle: selectedAngle,
        backgroundColor,
        transparent: false,
      });
    }

    await exportCanvas(canvas, exportFormat, "mockup");
  }, [
    exportFormat,
    backgroundTransparent,
    uploadedImage,
    frameImage,
    selectedAngle,
    backgroundColor,
  ]);

  const canExport = !!uploadedImage && !!frameImage;

  return (
    <div className="lg:h-screen flex flex-col max-w-[1920px] mx-auto w-full">
      <Header onExport={handleExport} canExport={canExport} />

      <div className="flex-1 flex flex-col lg:flex-row lg:overflow-hidden">
        <aside className="w-full lg:w-80 border-r p-4 space-y-6 lg:overflow-y-auto shrink-0 order-2 lg:order-1">
          <UploadZone
            uploadedImage={uploadedImage}
            uploadedFileName={uploadedFileName}
            onImageUpload={handleImageUpload}
            onImageRemove={handleImageRemove}
          />
          <DevicePicker
            devices={devices}
            selectedDevice={selectedDevice}
            onDeviceSelect={handleDeviceSelect}
          />
          <AnglePicker
            angles={selectedDevice.angles}
            selectedAngle={selectedAngle}
            onAngleSelect={setSelectedAngle}
          />
          <BackgroundPicker
            backgroundColor={backgroundColor}
            transparent={backgroundTransparent}
            onColorChange={setBackgroundColor}
            onTransparentChange={setBackgroundTransparent}
          />
          <ExportPanel
            format={exportFormat}
            onFormatChange={setExportFormat}
            onExport={handleExport}
            canExport={canExport}
          />
        </aside>

        <main className="flex-1 flex order-1 lg:order-2 min-h-[300px] lg:min-h-0">
          <MockupPreview
            screenshot={uploadedImage}
            frameImage={frameImage}
            frameLoading={frameLoading}
            frameError={frameError}
            angle={selectedAngle}
            backgroundColor={backgroundColor}
            transparent={backgroundTransparent}
            onCanvasReady={handleCanvasReady}
          />
        </main>
      </div>

      <div className="lg:hidden sticky bottom-0 border-t p-3 bg-background">
        <Button
          onClick={handleExport}
          disabled={!canExport}
          className="w-full"
          size="lg"
        >
          <Download className="w-4 h-4 mr-2" />
          Download {exportFormat.toUpperCase()}
        </Button>
      </div>
    </div>
  );
}
