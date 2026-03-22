"use client";

import { AngleVariant } from "@/lib/types";

interface AnglePickerProps {
  angles: AngleVariant[];
  selectedAngle: AngleVariant;
  onAngleSelect: (angle: AngleVariant) => void;
}

export function AnglePicker({
  angles,
  selectedAngle,
  onAngleSelect,
}: AnglePickerProps) {
  return (
    <div className="space-y-2">
      <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
        Angle
      </label>
      <div className="flex gap-2">
        {angles.map((angle) => (
          <button
            key={angle.id}
            onClick={() => onAngleSelect(angle)}
            className={`flex-1 flex flex-col items-center gap-1.5 p-2 rounded-lg border-2 transition-colors ${
              selectedAngle.id === angle.id
                ? "border-primary bg-primary/5"
                : "border-transparent bg-muted/50 hover:border-muted-foreground/25"
            }`}
          >
            <img
              src={angle.thumbnail}
              alt={angle.name}
              className="w-12 h-16 object-contain"
            />
            <span className="text-xs font-medium">{angle.name}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
