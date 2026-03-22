"use client";

import { useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { Upload, X } from "lucide-react";
import { Button } from "@/components/ui/button";

const MAX_FILE_SIZE = 10 * 1024 * 1024;
const MAX_DIMENSION = 8000;
const ACCEPTED_TYPES = { "image/png": [".png"], "image/jpeg": [".jpg", ".jpeg"] };

interface UploadZoneProps {
  uploadedImage: HTMLImageElement | null;
  uploadedFileName: string | null;
  onImageUpload: (image: HTMLImageElement, fileName: string) => void;
  onImageRemove: () => void;
}

export function UploadZone({
  uploadedImage,
  uploadedFileName,
  onImageUpload,
  onImageRemove,
}: UploadZoneProps) {
  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      const file = acceptedFiles[0];
      if (!file) return;

      if (file.size > MAX_FILE_SIZE) {
        alert("File too large. Maximum size is 10MB.");
        return;
      }

      const url = URL.createObjectURL(file);
      const img = new Image();
      img.onload = () => {
        if (img.naturalWidth > MAX_DIMENSION || img.naturalHeight > MAX_DIMENSION) {
          alert(`Image too large. Maximum dimensions are ${MAX_DIMENSION}×${MAX_DIMENSION}px.`);
          URL.revokeObjectURL(url);
          return;
        }
        onImageUpload(img, file.name);
      };
      img.onerror = () => {
        alert("Failed to load image. Please try a different file.");
        URL.revokeObjectURL(url);
      };
      img.src = url;
    },
    [onImageUpload]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: ACCEPTED_TYPES,
    maxFiles: 1,
    multiple: false,
  });

  if (uploadedImage && uploadedFileName) {
    return (
      <div className="space-y-2">
        <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
          Upload Content
        </label>
        <div className="flex items-center gap-3 p-3 border rounded-lg">
          <img
            src={uploadedImage.src}
            alt="Uploaded screenshot"
            className="w-10 h-10 object-cover rounded"
          />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate">{uploadedFileName}</p>
          </div>
          <Button variant="ghost" size="icon" onClick={onImageRemove}>
            <X className="w-4 h-4" />
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
        Upload Content
      </label>
      <div
        {...getRootProps()}
        className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
          isDragActive
            ? "border-primary bg-primary/5"
            : "border-muted-foreground/25 hover:border-primary/50"
        }`}
      >
        <input {...getInputProps()} />
        <Upload className="w-8 h-8 mx-auto mb-3 text-muted-foreground" />
        <p className="text-sm font-medium">Drop your screenshot here</p>
        <p className="text-xs text-muted-foreground mt-1">or click to upload</p>
        <p className="text-xs text-muted-foreground mt-2">PNG or JPG, max 10MB</p>
      </div>
    </div>
  );
}
