"use client";

import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
import Image from "next/image";

interface HeaderProps {
  canExport: boolean;
  onExport: () => void;
}

export function Header({ canExport, onExport }: HeaderProps) {
  return (
    <header className="flex items-center justify-between px-6 py-4 border-b">
      <div className="flex items-center gap-3">
        <Image src="/favicon.svg" alt="" width={28} height={28} />
        <h1 className="text-xl font-bold">Framed</h1>
      </div>
      <Button onClick={onExport} disabled={!canExport} size="sm">
        <Download className="w-4 h-4 mr-2" />
        Export
      </Button>
    </header>
  );
}
