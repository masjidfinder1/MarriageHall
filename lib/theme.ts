// ============================================================
// THEME SYSTEM - 5 Luxury Presets + Custom
// ============================================================

export interface ThemePreset {
  name: string;
  label: string;
  primaryColor: string;
  accentColor: string;
  backgroundColor: string;
  textColor: string;
  darkMode: boolean;
  description: string;
}

export const themePresets: Record<string, ThemePreset> = {
  royal_gold: {
    name: "royal_gold",
    label: "Royal Gold",
    primaryColor: "#D4AF37",
    accentColor: "#1A1A1A",
    backgroundColor: "#FFFFFF",
    textColor: "#1A1A1A",
    darkMode: false,
    description: "Classic royal gold with dark accents",
  },
  champagne: {
    name: "champagne",
    label: "Champagne",
    primaryColor: "#D4B896",
    accentColor: "#8B7355",
    backgroundColor: "#FDFCF7",
    textColor: "#4A4A4A",
    darkMode: false,
    description: "Soft champagne elegance",
  },
  dark_luxury: {
    name: "dark_luxury",
    label: "Dark Luxury",
    primaryColor: "#C9A96E",
    accentColor: "#0A0A0A",
    backgroundColor: "#0F0F0F",
    textColor: "#E5E5E5",
    darkMode: true,
    description: "Premium dark mode with gold highlights",
  },
  ivory_wedding: {
    name: "ivory_wedding",
    label: "Ivory Wedding",
    primaryColor: "#B8A99A",
    accentColor: "#F5F0EB",
    backgroundColor: "#FFFCF8",
    textColor: "#5C5C5C",
    darkMode: false,
    description: "Soft ivory and warm neutrals",
  },
  emerald_luxury: {
    name: "emerald_luxury",
    label: "Emerald Luxury",
    primaryColor: "#05965E",
    accentColor: "#064E34",
    backgroundColor: "#FFFFFF",
    textColor: "#1A1A1A",
    darkMode: false,
    description: "Rich emerald green sophistication",
  },
  custom: {
    name: "custom",
    label: "Custom",
    primaryColor: "#D4AF37",
    accentColor: "#1A1A1A",
    backgroundColor: "#FFFFFF",
    textColor: "#1A1A1A",
    darkMode: false,
    description: "Fully customizable theme",
  },
};

export function hexToHSL(hex: string): { h: number; s: number; l: number } {
  let r = parseInt(hex.slice(1, 3), 16) / 255;
  let g = parseInt(hex.slice(3, 5), 16) / 255;
  let b = parseInt(hex.slice(5, 7), 16) / 255;

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h = 0, s = 0, l = (max + min) / 2;

  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r: h = ((g - b) / d + (g < b ? 6 : 0)) / 6; break;
      case g: h = ((b - r) / d + 2) / 6; break;
      case b: h = ((r - g) / d + 4) / 6; break;
    }
  }

  return { h: h * 360, s: s * 100, l: l * 100 };
}

export function generateCSSVariables(settings: {
  primary_color: string;
  accent_color: string;
  background_color: string;
  text_color: string;
  dark_mode: boolean;
  border_radius: string;
  font_heading: string;
  font_body: string;
}): Record<string, string> {
  const primary = hexToHSL(settings.primary_color);
  const accent = hexToHSL(settings.accent_color);
  const bg = hexToHSL(settings.background_color);
  const text = hexToHSL(settings.text_color);

  return {
    "--background": `${bg.h} ${bg.s}% ${bg.l}%`,
    "--foreground": `${text.h} ${text.s}% ${text.l}%`,
    "--primary": `${primary.h} ${primary.s}% ${primary.l}%`,
    "--primary-foreground": `${primary.h} ${primary.s}% ${primary.l > 50 ? 10 : 95}%`,
    "--accent": `${accent.h} ${accent.s}% ${accent.l}%`,
    "--accent-foreground": `${accent.h} ${accent.s}% ${accent.l > 50 ? 10 : 95}%`,
    "--card": `${bg.h} ${bg.s}% ${Math.min(bg.l + 5, 100)}%`,
    "--card-foreground": `${text.h} ${text.s}% ${text.l}%`,
    "--popover": `${bg.h} ${bg.s}% ${Math.min(bg.l + 5, 100)}%`,
    "--popover-foreground": `${text.h} ${text.s}% ${text.l}%`,
    "--secondary": `${accent.h} ${accent.s * 0.3}% ${Math.min(accent.l + 40, 95)}%`,
    "--secondary-foreground": `${text.h} ${text.s}% ${text.l}%`,
    "--muted": `${bg.h} ${bg.s * 0.5}% ${Math.min(bg.l + 10, 95)}%`,
    "--muted-foreground": `${text.h} ${text.s * 0.6}% ${Math.min(text.l + 20, 70)}%`,
    "--destructive": "0 84.2% 60.2%",
    "--destructive-foreground": "0 0% 98%",
    "--border": `${text.h} ${text.s * 0.2}% ${Math.min(text.l + 60, 90)}%`,
    "--input": `${text.h} ${text.s * 0.2}% ${Math.min(text.l + 60, 90)}%`,
    "--ring": `${primary.h} ${primary.s}% ${primary.l}%`,
    "--radius": settings.border_radius,
    "--font-serif": settings.font_heading.includes("serif") 
      ? "Georgia, Cambria, 'Times New Roman', Times, serif" 
      : "system-ui, sans-serif",
    "--font-sans": settings.font_body.includes("sans") 
      ? "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" 
      : "Georgia, serif",
  };
}
