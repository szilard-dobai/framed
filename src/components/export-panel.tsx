"use client";

import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Download } from "lucide-react";
import { ExportFormat } from "@/lib/types";

interface ExportPanelProps {
  format: ExportFormat;
  onFormatChange: (format: ExportFormat) => void;
  onExport: () => void;
  canExport: boolean;
}

const FORMAT_OPTIONS: { value: ExportFormat; label: string }[] = [
  { value: "png", label: "PNG" },
  { value: "jpeg", label: "JPEG" },
];

export function ExportPanel({
  format,
  onFormatChange,
  onExport,
  canExport,
}: ExportPanelProps) {
  return (
    <div className="space-y-3">
      <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
        Export Format
      </label>
      <RadioGroup
        value={format}
        onValueChange={(v) => onFormatChange(v as ExportFormat)}
        className="flex gap-3"
      >
        {FORMAT_OPTIONS.map((opt) => (
          <div key={opt.value} className="flex items-center gap-1.5">
            <RadioGroupItem value={opt.value} id={`format-${opt.value}`} />
            <Label htmlFor={`format-${opt.value}`} className="text-xs cursor-pointer">
              {opt.label}
            </Label>
          </div>
        ))}
      </RadioGroup>
      <div className="hidden lg:block space-y-3">
        <Button onClick={onExport} disabled={!canExport} className="w-full" size="lg">
          <Download className="w-4 h-4 mr-2" />
          Download {format.toUpperCase()}
        </Button>
        {canExport && (
          <p className="text-xs text-muted-foreground text-center">
            High-resolution export available
          </p>
        )}
      </div>
    </div>
  );
}
