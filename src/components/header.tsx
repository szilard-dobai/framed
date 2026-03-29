"use client";

import { Button } from "@/components/ui/button";
import { Download, Loader2 } from "lucide-react";
import Image from "next/image";
import { ThemeToggle } from "./theme-toggle";

interface HeaderProps {
  canExport: boolean;
  exporting: boolean;
  onExport: () => void;
}

export function Header({ canExport, exporting, onExport }: HeaderProps) {
  return (
    <header className="flex items-center justify-between px-6 py-4 border-b">
      <div className="flex items-center gap-3">
        <Image src="/favicon.svg" alt="" width={28} height={28} />
        <h1 className="text-xl font-bold">Framed</h1>
      </div>
      <div className="flex items-center gap-1">
        <ThemeToggle />
        <Button onClick={onExport} disabled={!canExport || exporting} size="sm">
          {exporting ? (
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
          ) : (
            <Download className="w-4 h-4 mr-2" />
          )}
          {exporting ? "Exporting..." : "Export"}
        </Button>
      </div>
    </header>
  );
}
