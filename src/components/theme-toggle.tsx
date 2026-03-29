"use client";

import { useTheme } from "next-themes";
import { Sun, Moon, Monitor } from "lucide-react";
import { Button } from "@/components/ui/button";

const THEME_CYCLE = ["light", "dark", "system"] as const;

const THEME_CONFIG: Record<string, { icon: typeof Sun; label: string }> = {
  light: { icon: Sun, label: "Light" },
  dark: { icon: Moon, label: "Dark" },
  system: { icon: Monitor, label: "System" },
};

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();

  const handleClick = () => {
    const currentIndex = THEME_CYCLE.indexOf(
      (theme as (typeof THEME_CYCLE)[number]) ?? "system"
    );
    const nextIndex = (currentIndex + 1) % THEME_CYCLE.length;
    setTheme(THEME_CYCLE[nextIndex]);
  };

  const config = THEME_CONFIG[theme ?? "system"];
  const Icon = config.icon;

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={handleClick}
      aria-label={`Current theme: ${config.label}. Click to change.`}
    >
      <Icon className="size-4" />
    </Button>
  );
}
