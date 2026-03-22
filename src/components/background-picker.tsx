"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Check } from "lucide-react";

const PRESET_COLORS = [
  { name: "White", value: "#FFFFFF" },
  { name: "Black", value: "#000000" },
  { name: "Light Gray", value: "#F0F0F0" },
  { name: "Soft Blue", value: "#DBEAFE" },
  { name: "Soft Pink", value: "#FCE7F3" },
];

interface BackgroundPickerProps {
  backgroundColor: string;
  transparent: boolean;
  onColorChange: (color: string) => void;
  onTransparentChange: (transparent: boolean) => void;
}

export function BackgroundPicker({
  backgroundColor,
  transparent,
  onColorChange,
  onTransparentChange,
}: BackgroundPickerProps) {
  const [hexInput, setHexInput] = useState(backgroundColor);

  const handleHexChange = (value: string) => {
    setHexInput(value);
    const clean = value.replace("#", "");
    if (/^[0-9a-fA-F]{6}$/.test(clean)) {
      onColorChange(`#${clean}`);
    }
  };

  return (
    <div className="space-y-3">
      <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
        Background
      </label>
      <div className="flex items-center gap-2">
        {PRESET_COLORS.map((color) => (
          <button
            key={color.value}
            onClick={() => {
              onColorChange(color.value);
              setHexInput(color.value);
              onTransparentChange(false);
            }}
            title={color.name}
            className={`w-8 h-8 rounded-full border-2 flex items-center justify-center transition-all ${
              backgroundColor === color.value && !transparent
                ? "border-primary ring-2 ring-primary/20"
                : "border-muted-foreground/25 hover:border-muted-foreground/50"
            }`}
            style={{ backgroundColor: color.value }}
          >
            {backgroundColor === color.value && !transparent && (
              <Check
                className="w-3 h-3"
                style={{ color: color.value === "#000000" ? "#fff" : "#000" }}
              />
            )}
          </button>
        ))}
        <button
          onClick={() => onTransparentChange(!transparent)}
          title="Transparent"
          className={`w-8 h-8 rounded-full border-2 flex items-center justify-center transition-all overflow-hidden ${
            transparent
              ? "border-primary ring-2 ring-primary/20"
              : "border-muted-foreground/25 hover:border-muted-foreground/50"
          }`}
          style={{
            backgroundImage:
              "linear-gradient(45deg, #ccc 25%, transparent 25%), linear-gradient(-45deg, #ccc 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #ccc 75%), linear-gradient(-45deg, transparent 75%, #ccc 75%)",
            backgroundSize: "8px 8px",
            backgroundPosition: "0 0, 0 4px, 4px -4px, -4px 0px",
          }}
        >
          {transparent && <Check className="w-3 h-3" />}
        </button>
      </div>
      <div className="flex items-center gap-2">
        <Label htmlFor="hex-input" className="text-xs shrink-0">
          #
        </Label>
        <Input
          id="hex-input"
          value={hexInput.replace("#", "")}
          onChange={(e) => handleHexChange(e.target.value)}
          className="h-8 text-xs font-mono"
          maxLength={6}
          placeholder="FFFFFF"
        />
      </div>
    </div>
  );
}
