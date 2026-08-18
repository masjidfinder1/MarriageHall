"use client";

import { useEffect, useState } from "react";
import { useTheme } from "next-themes";
import { generateCSSVariables } from "@/lib/theme";
import type { SiteSettings } from "@/types";

interface ThemeProviderProps {
  settings: SiteSettings | null;
  children: React.ReactNode;
}

const cleanHex = (value: unknown, fallback: string) => {
  if (typeof value !== "string") return fallback;
  const trimmed = value.trim();
  return /^#[0-9a-fA-F]{3,6}$/.test(trimmed) ? trimmed : fallback;
};

const toBoolean = (value: unknown): boolean => {
  if (typeof value === "boolean") return value;
  if (typeof value === "string") {
    const normalized = value.trim().toLowerCase();
    if (["true", "1", "yes", "on"].includes(normalized)) return true;
    if (["false", "0", "no", "off", ""].includes(normalized)) return false;
  }
  return false;
};

export function ThemeProvider({ settings, children }: ThemeProviderProps) {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted || !settings) return;

    const root = document.documentElement;
    const darkFromDb = toBoolean(settings.dark_mode);
    const isDark = darkFromDb || settings.theme_preset === "dark_luxury";

    const vars = generateCSSVariables({
      primary_color: cleanHex(settings.primary_color, "#D4AF37"),
      accent_color: cleanHex(settings.accent_color, "#F8E7A1"),
      background_color: cleanHex(settings.background_color, "#F5F1EA"),
      text_color: cleanHex(settings.text_color, "#1A1A1A"),
      dark_mode: isDark,
      border_radius: typeof settings.border_radius === "string" && settings.border_radius ? settings.border_radius : "lg",
      font_heading: typeof settings.font_heading === "string" && settings.font_heading ? settings.font_heading : "Playfair Display",
      font_body: typeof settings.font_body === "string" && settings.font_body ? settings.font_body : "Inter",
    });

    Object.entries(vars).forEach(([key, value]) => {
      root.style.setProperty(key, value);
    });

    root.style.colorScheme = isDark ? "dark" : "light";
    root.classList.toggle("dark", isDark);

    const nextTheme = isDark ? "dark" : "light";
    if (theme !== nextTheme) {
      setTheme(nextTheme);
    }
  }, [mounted, settings, setTheme, theme]);

  useEffect(() => {
    if (!mounted) return;

    const handleStorage = (event: StorageEvent) => {
      if (event.key === "marriage-hall-theme" || event.key === "marriage-hall-theme-sync") {
        window.location.reload();
      }
    };

    const handleThemeSync = () => {
      window.location.reload();
    };

    window.addEventListener("storage", handleStorage);
    window.addEventListener("site-settings-theme-sync", handleThemeSync);

    return () => {
      window.removeEventListener("storage", handleStorage);
      window.removeEventListener("site-settings-theme-sync", handleThemeSync);
    };
  }, [mounted]);

  return <>{children}</>;
}