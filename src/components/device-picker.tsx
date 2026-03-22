"use client";

import { DeviceConfig } from "@/lib/types";
import Image from "next/image";

interface DevicePickerProps {
  devices: DeviceConfig[];
  selectedDevice: DeviceConfig;
  onDeviceSelect: (device: DeviceConfig) => void;
}

export function DevicePicker({
  devices,
  selectedDevice,
  onDeviceSelect,
}: DevicePickerProps) {
  return (
    <div className="space-y-2">
      <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
        Device
      </label>
      <div className="grid grid-cols-3 gap-2">
        {devices.map((device) => (
          <button
            key={device.id}
            onClick={() => onDeviceSelect(device)}
            className={`flex flex-col items-center gap-1.5 p-3 rounded-lg border-2 transition-colors ${
              selectedDevice.id === device.id
                ? "border-primary bg-primary/5"
                : "border-transparent bg-muted/50 hover:border-muted-foreground/25"
            }`}
          >
            <Image
              src={device.icon}
              alt={device.name}
              width={24}
              height={24}
              className="dark:invert"
            />
            <span className="text-xs font-medium text-center leading-tight">
              {device.name}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}
