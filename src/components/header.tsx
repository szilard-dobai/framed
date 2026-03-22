"use client";

import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";

interface HeaderProps {
  onExport: () => void;
  canExport: boolean;
}

export function Header({ onExport, canExport }: HeaderProps) {
  return (
    <header className="flex items-center justify-between px-6 py-4 border-b">
      <div className="flex items-center gap-3">
        <h1 className="text-xl font-bold">Mockup</h1>
        <span className="text-sm text-muted-foreground hidden sm:inline">
          Create beautiful device mockups in seconds
        </span>
      </div>
      <Button onClick={onExport} disabled={!canExport} size="sm">
        <Download className="w-4 h-4 mr-2" />
        Export
      </Button>
    </header>
  );
}
