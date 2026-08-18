"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  Save,
  Palette,
  Type,
  Phone,
  Upload,
  Image as ImageIcon,
} from "lucide-react";
import toast from "react-hot-toast";
import { createClient } from "@/lib/supabase";
import { uploadToSupabaseStorage } from "@/lib/storage";
import { themePresets } from "@/lib/theme";

const defaultSettings = {
  site_name: "Royal Palace Wedding Hall",
  tagline: "Luxury Weddings, Perfect Moments",
  description: "A premium venue for elegant celebrations and unforgettable memories.",
  logo_url: "",
  favicon_url: "",
  cover_image_url: "",
  hero_image_url: "",
  hero_video_url: "",
  phone: "+92 300 1234567",
  whatsapp_number: "+92 300 1234567",
  email: "hello@royalpalace.com",
  address: "Main Gulshan Avenue, Lahore",
  city: "Lahore",
  state: "",
  pincode: "",
  google_maps_embed: "",
  google_maps_link: "",
  instagram_url: "",
  facebook_url: "",
  youtube_url: "",
  business_hours: {
    monday: "9:00 AM - 10:00 PM",
    tuesday: "9:00 AM - 10:00 PM",
    wednesday: "9:00 AM - 10:00 PM",
    thursday: "9:00 AM - 10:00 PM",
    friday: "9:00 AM - 10:00 PM",
    saturday: "9:00 AM - 10:00 PM",
    sunday: "9:00 AM - 10:00 PM",
  },
  meta_title: "",
  meta_description: "",
  og_image_url: "",
  og_title: "",
  og_description: "",
  canonical_url: "",
  theme_preset: "royal_gold",
  primary_color: "#D4AF37",
  accent_color: "#F8E7A1",
  background_color: "#F5F1EA",
  text_color: "#1A1A1A",
  dark_mode: false,
  button_style: "rounded",
  border_radius: "lg",
  font_heading: "Playfair Display",
  font_body: "Inter",
  animation_intensity: "medium",
  features_enabled: {
    statistics: true,
    venues: true,
    rooms: true,
    packages: true,
    services: true,
    gallery: true,
    testimonials: true,
    faq: true,
    hero: true,
    about: true,
    contact: true,
    booking: true,
  },
  min_guests: 50,
  max_guests: 500,
  advance_booking_days: 30,
  cancellation_policy: "",
  about_title: "Creating Unforgettable Moments",
  about_subtitle: "A premium venue for elegant celebrations and unforgettable memories.",
  about_description: "",
  about_image_url: "",
  years_experience: "10+",
  events_hosted: "500+",
  team_members: "50+",
  satisfaction_percentage: "100%",
};

const normalizeString = (value: unknown) => {
  if (value === null || value === undefined) return null;
  const str = String(value).trim();
  return str === "" ? null : str;
};

const normalizeBusinessHours = (value: unknown) => {
  const base: Record<string, string> = { ...defaultSettings.business_hours };
  const hours = (value && typeof value === "object" ? value : {}) as Record<string, unknown>;

  Object.keys(base).forEach((day) => {
    const fallback = defaultSettings.business_hours[day as keyof typeof defaultSettings.business_hours];
    const nextValue = hours[day];
    if (typeof nextValue === "string") {
      base[day] = nextValue.trim() || fallback;
    }
  });

  return base;
};

const makeDirtyPayload = (
  current: Record<string, any>,
  original: Record<string, any> = {}
) => {
  const payload: Record<string, any> = {};

  Object.keys(current).forEach((key) => {
    const prev = original?.[key];
    const next = current[key];

    if (key === "id" || key === "created_at" || key === "updated_at") return;

    if (typeof next === "boolean") {
      if (prev !== next) payload[key] = next;
      return;
    }

    if (typeof next === "number" || typeof next === "string") {
      const nextValue = typeof next === "string" ? normalizeString(next) : next;

      if (prev !== nextValue) {
        payload[key] = nextValue;
      }
      return;
    }

    if (Array.isArray(next)) {
      const a = JSON.stringify(next);
      const b = JSON.stringify(prev ?? []);
      if (a !== b) payload[key] = next;
      return;
    }

    if (next && typeof next === "object") {
      const a = JSON.stringify(next);
      const b = JSON.stringify(prev ?? {});
      if (a !== b) payload[key] = next;
    }
  });

  return payload;
};

export default function SettingsPage() {
  const router = useRouter();
  const [settings, setSettings] = useState<Record<string, any> | null>(null);
  const [originalSettings, setOriginalSettings] = useState<Record<string, any> | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [uploadingFavicon, setUploadingFavicon] = useState(false);
  const logoInputRef = useRef<HTMLInputElement | null>(null);
  const faviconInputRef = useRef<HTMLInputElement | null>(null);

  const fetchSettings = useCallback(async () => {
    const supabase = createClient();

    const { data, error } = await supabase
      .from("site_settings")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (data) {
      const normalized = {
        ...defaultSettings,
        ...data,
        business_hours: normalizeBusinessHours(data.business_hours),
        features_enabled: data.features_enabled ?? defaultSettings.features_enabled,
      };

      setSettings(normalized);
      setOriginalSettings(normalized);
      setLoading(false);
      return;
    }

    if (!error) {
      const { data: created, error: createError } = await supabase
        .from("site_settings")
        .insert([defaultSettings])
        .select()
        .single();

      if (createError) {
        console.error("Settings creation failed:", createError);
        setSettings(defaultSettings);
        setOriginalSettings(defaultSettings);
      } else {
        setSettings(created ?? defaultSettings);
        setOriginalSettings(created ?? defaultSettings);
      }
    } else {
      console.error("Settings fetch error:", error);
      setSettings(defaultSettings);
      setOriginalSettings(defaultSettings);
    }

    setLoading(false);
  }, []);

  useEffect(() => {
    fetchSettings();
  }, [fetchSettings]);

  const syncThemeAcrossTabs = () => {
    const syncValue = Date.now().toString();
    localStorage.setItem("marriage-hall-theme-sync", syncValue);
    window.dispatchEvent(new Event("site-settings-theme-sync"));
  };

  const updateSetting = useCallback((key: string, value: any) => {
    setSettings((prev) => (prev ? { ...prev, [key]: value } : prev));
  }, []);

  const applyPreset = useCallback((presetKey: string) => {
    const preset = themePresets[presetKey];
    if (!preset) return;

    setSettings((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        theme_preset: presetKey,
        primary_color: preset.primaryColor,
        accent_color: preset.accentColor,
        background_color: preset.backgroundColor,
        text_color: preset.textColor,
        dark_mode: preset.darkMode,
      };
    });

    const nextTheme = preset.darkMode ? "dark" : "light";
    localStorage.setItem("marriage-hall-theme", nextTheme);
    window.dispatchEvent(new Event("site-settings-theme-sync"));
  }, []);

  const handleLogoUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setUploadingLogo(true);
    try {
      const url = await uploadToSupabaseStorage(file, "images", "branding");
      setSettings((prev) => (prev ? { ...prev, logo_url: url } : prev));
      toast.success("Logo uploaded successfully");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Logo upload failed");
    } finally {
      setUploadingLogo(false);
      event.target.value = "";
    }
  };

  const handleFaviconUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setUploadingFavicon(true);
    try {
      const url = await uploadToSupabaseStorage(file, "images", "branding");
      setSettings((prev) => (prev ? { ...prev, favicon_url: url } : prev));
      toast.success("Favicon uploaded successfully");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Favicon upload failed");
    } finally {
      setUploadingFavicon(false);
      event.target.value = "";
    }
  };

  const handleSave = useCallback(async () => {
    if (!settings || !settings.id) {
      toast.error("Settings row not loaded yet.");
      return;
    }

    setSaving(true);

    try {
      const supabase = createClient();

      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) {
        toast.error("You must be logged in to save settings.");
        return;
      }

      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", userData.user.id)
        .maybeSingle();

      if (profileError || !profile) {
        toast.error("Admin profile missing. Please log out and log back in.");
        return;
      }

      if (!["admin", "manager", "staff"].includes(profile.role)) {
        toast.error("You do not have permission to update settings.");
        return;
      }

      const payload = makeDirtyPayload(settings, originalSettings ?? {});
      if (Object.keys(payload).length === 0) {
        toast.success("No changes to save.");
        return;
      }

      const cleanPayload: Record<string, any> = {};

      Object.entries(payload).forEach(([key, value]) => {
        if (value === undefined) return;

        if (typeof value === "string") {
          const cleaned = normalizeString(value);
          cleanPayload[key] = cleaned ?? null;
          return;
        }

        cleanPayload[key] = value;
      });

      const { data: updated, error } = await supabase
        .from("site_settings")
        .update({
          ...cleanPayload,
          updated_at: new Date().toISOString(),
        })
        .eq("id", settings.id)
        .select()
        .single();

      if (error) throw error;

      setSettings({
        ...settings,
        ...updated,
      });
      setOriginalSettings({
        ...settings,
        ...updated,
      });

      router.refresh();
      syncThemeAcrossTabs();
      window.location.reload();

      toast.success("Settings saved successfully.");
    } catch (error) {
      console.error("Save error:", error);
      toast.error("Failed to save settings.");
    } finally {
      setSaving(false);
    }
  }, [settings, originalSettings, router]);

  if (loading) return <div className="p-8">Loading...</div>;
  if (!settings) return <div className="p-8">No settings found</div>;

  return (
    <div className="space-y-6 max-w-5xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Website Settings</h1>
          <p className="text-muted-foreground">Customize your marriage hall site</p>
        </div>

        <motion.button
          whileTap={{ scale: 0.95 }}
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-2 rounded-full bg-primary px-6 py-2.5 text-primary-foreground font-medium hover:opacity-90 disabled:opacity-50"
        >
          <Save className="h-4 w-4" />
          {saving ? "Saving..." : "Save Changes"}
        </motion.button>
      </div>

      {/* Theme presets */}
      <div className="rounded-xl border border-border bg-card p-6 space-y-4">
        <div className="flex items-center gap-2">
          <Palette className="h-5 w-5 text-primary" />
          <h2 className="font-semibold text-foreground">Theme Presets</h2>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {Object.entries(themePresets).map(([key, preset]) => (
            <button
              key={key}
              type="button"
              onClick={() => applyPreset(key)}
              className={`rounded-xl border-2 p-4 text-left transition ${settings.theme_preset === key ? "border-primary bg-primary/5" : "border-border hover:border-primary/30"}`}
            >
              <div className="mb-2 flex gap-2">
                <span className="h-6 w-6 rounded-full border border-border" style={{ backgroundColor: preset.primaryColor }} />
                <span className="h-6 w-6 rounded-full border border-border" style={{ backgroundColor: preset.accentColor }} />
              </div>
              <p className="text-sm font-medium text-foreground">{preset.label}</p>
              <p className="text-xs text-muted-foreground">{preset.description}</p>
            </button>
          ))}
        </div>
      </div>

      {/* Branding */}
      <div className="rounded-xl border border-border bg-card p-6 space-y-4">
        <div className="flex items-center gap-2">
          <Type className="h-5 w-5 text-primary" />
          <h2 className="font-semibold text-foreground">Branding</h2>
        </div>

        <div className="flex flex-col gap-4 md:flex-row md:items-center">
          <div className="flex h-24 w-24 items-center justify-center overflow-hidden rounded-2xl border border-dashed border-border bg-background">
            {settings.logo_url ? (
              <img src={settings.logo_url} alt="Logo" className="h-full w-full object-cover" />
            ) : (
              <ImageIcon className="h-8 w-8 text-muted-foreground" />
            )}
          </div>

          <div className="flex-1 space-y-2">
            <label className="block text-sm font-medium text-foreground">Site Logo</label>
            <input ref={logoInputRef} type="file" accept="image/*" className="hidden" onChange={handleLogoUpload} />
            <button
              type="button"
              onClick={() => logoInputRef.current?.click()}
              className="inline-flex items-center gap-2 rounded-full bg-primary px-4 py-2 text-primary-foreground"
              disabled={uploadingLogo}
            >
              <Upload className="h-4 w-4" />
              {uploadingLogo ? "Uploading..." : "Upload Logo"}
            </button>
          </div>

          <div className="flex-1 space-y-2">
            <label className="block text-sm font-medium text-foreground">Favicon</label>
            <input ref={faviconInputRef} type="file" accept="image/*" className="hidden" onChange={handleFaviconUpload} />
            <button
              type="button"
              onClick={() => faviconInputRef.current?.click()}
              className="inline-flex items-center gap-2 rounded-full bg-primary px-4 py-2 text-primary-foreground"
              disabled={uploadingFavicon}
            >
              <Upload className="h-4 w-4" />
              {uploadingFavicon ? "Uploading..." : "Upload Favicon"}
            </button>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <label className="mb-2 block text-sm font-medium text-foreground">Site Name</label>
            <input
              type="text"
              value={settings.site_name || ""}
              onChange={(e) => updateSetting("site_name", e.target.value)}
              className="w-full rounded-lg border border-input bg-background px-4 py-2 outline-none focus:border-primary"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-foreground">Tagline</label>
            <input
              type="text"
              value={settings.tagline || ""}
              onChange={(e) => updateSetting("tagline", e.target.value)}
              className="w-full rounded-lg border border-input bg-background px-4 py-2 outline-none focus:border-primary"
            />
          </div>

          <div className="md:col-span-2">
            <label className="mb-2 block text-sm font-medium text-foreground">Description</label>
            <textarea
              rows={3}
              value={settings.description || ""}
              onChange={(e) => updateSetting("description", e.target.value)}
              className="w-full resize-none rounded-lg border border-input bg-background px-4 py-2 outline-none focus:border-primary"
            />
          </div>
        </div>
      </div>

      {/* General info */}
      <div className="rounded-xl border border-border bg-card p-6 space-y-4">
        <h2 className="font-semibold text-foreground">General Info</h2>

        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <label className="mb-2 block text-sm font-medium text-foreground">Phone</label>
            <input
              type="text"
              value={settings.phone || ""}
              onChange={(e) => updateSetting("phone", e.target.value)}
              className="w-full rounded-lg border border-input bg-background px-4 py-2 outline-none focus:border-primary"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-foreground">WhatsApp Number</label>
            <input
              type="text"
              value={settings.whatsapp_number || ""}
              onChange={(e) => updateSetting("whatsapp_number", e.target.value)}
              className="w-full rounded-lg border border-input bg-background px-4 py-2 outline-none focus:border-primary"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-foreground">Email</label>
            <input
              type="email"
              value={settings.email || ""}
              onChange={(e) => updateSetting("email", e.target.value)}
              className="w-full rounded-lg border border-input bg-background px-4 py-2 outline-none focus:border-primary"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-foreground">Address</label>
            <input
              type="text"
              value={settings.address || ""}
              onChange={(e) => updateSetting("address", e.target.value)}
              className="w-full rounded-lg border border-input bg-background px-4 py-2 outline-none focus:border-primary"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-foreground">City</label>
            <input
              type="text"
              value={settings.city || ""}
              onChange={(e) => updateSetting("city", e.target.value)}
              className="w-full rounded-lg border border-input bg-background px-4 py-2 outline-none focus:border-primary"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-foreground">Meta Title</label>
            <input
              type="text"
              value={settings.meta_title || ""}
              onChange={(e) => updateSetting("meta_title", e.target.value)}
              className="w-full rounded-lg border border-input bg-background px-4 py-2 outline-none focus:border-primary"
            />
          </div>

          <div className="md:col-span-2">
            <label className="mb-2 block text-sm font-medium text-foreground">Meta Description</label>
            <textarea
              rows={2}
              value={settings.meta_description || ""}
              onChange={(e) => updateSetting("meta_description", e.target.value)}
              className="w-full resize-none rounded-lg border border-input bg-background px-4 py-2 outline-none focus:border-primary"
            />
          </div>
        </div>
      </div>

      {/* Social links */}
      <div className="rounded-xl border border-border bg-card p-6 space-y-4">
        <h2 className="font-semibold text-foreground">Social Links</h2>

        <div className="grid md:grid-cols-3 gap-4">
          <div>
            <label className="mb-2 block text-sm font-medium text-foreground">Instagram</label>
            <input
              type="url"
              value={settings.instagram_url || ""}
              onChange={(e) => updateSetting("instagram_url", e.target.value)}
              className="w-full rounded-lg border border-input bg-background px-4 py-2 outline-none focus:border-primary"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-foreground">Facebook</label>
            <input
              type="url"
              value={settings.facebook_url || ""}
              onChange={(e) => updateSetting("facebook_url", e.target.value)}
              className="w-full rounded-lg border border-input bg-background px-4 py-2 outline-none focus:border-primary"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-foreground">YouTube</label>
            <input
              type="url"
              value={settings.youtube_url || ""}
              onChange={(e) => updateSetting("youtube_url", e.target.value)}
              className="w-full rounded-lg border border-input bg-background px-4 py-2 outline-none focus:border-primary"
            />
          </div>
        </div>
      </div>

      {/* Service Time / Business Hours */}
      <div className="rounded-xl border border-border bg-card p-6 space-y-4">
        <div className="flex items-center gap-2">
          <Phone className="h-5 w-5 text-primary" />
          <h2 className="font-semibold text-foreground">Service Time / Business Hours</h2>
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          {Object.keys(defaultSettings.business_hours).map((day) => (
            <div key={day}>
              <label className="mb-2 block text-sm font-medium capitalize text-foreground">{day}</label>
              <input
                type="text"
                value={settings.business_hours?.[day] ?? ""}
                onChange={(e) =>
                  updateSetting("business_hours", {
                    ...(settings.business_hours ?? defaultSettings.business_hours),
                    [day]: e.target.value,
                  })
                }
                className="w-full rounded-lg border border-input bg-background px-4 py-2 outline-none focus:border-primary"
                placeholder="9:00 AM - 10:00 PM"
              />
            </div>
          ))}
        </div>
      </div>

      {/* Colors */}
      <div className="rounded-xl border border-border bg-card p-6 space-y-4">
        <div className="flex items-center gap-2">
          <Palette className="h-5 w-5 text-primary" />
          <h2 className="font-semibold text-foreground">Custom Colors</h2>
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <label className="mb-2 block text-sm font-medium text-foreground">Primary Color</label>
            <div className="flex gap-2">
              <input
                type="color"
                value={settings.primary_color || "#D4AF37"}
                onChange={(e) => updateSetting("primary_color", e.target.value)}
                className="h-10 w-12 rounded-lg border border-input bg-background"
              />
              <input
                type="text"
                value={settings.primary_color || ""}
                onChange={(e) => updateSetting("primary_color", e.target.value)}
                className="flex-1 rounded-lg border border-input bg-background px-4 py-2 outline-none focus:border-primary"
              />
            </div>
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-foreground">Accent Color</label>
            <div className="flex gap-2">
              <input
                type="color"
                value={settings.accent_color || "#F8E7A1"}
                onChange={(e) => updateSetting("accent_color", e.target.value)}
                className="h-10 w-12 rounded-lg border border-input bg-background"
              />
              <input
                type="text"
                value={settings.accent_color || ""}
                onChange={(e) => updateSetting("accent_color", e.target.value)}
                className="flex-1 rounded-lg border border-input bg-background px-4 py-2 outline-none focus:border-primary"
              />
            </div>
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-foreground">Background Color</label>
            <div className="flex gap-2">
              <input
                type="color"
                value={settings.background_color || "#F5F1EA"}
                onChange={(e) => updateSetting("background_color", e.target.value)}
                className="h-10 w-12 rounded-lg border border-input bg-background"
              />
              <input
                type="text"
                value={settings.background_color || ""}
                onChange={(e) => updateSetting("background_color", e.target.value)}
                className="flex-1 rounded-lg border border-input bg-background px-4 py-2 outline-none focus:border-primary"
              />
            </div>
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-foreground">Text Color</label>
            <div className="flex gap-2">
              <input
                type="color"
                value={settings.text_color || "#1A1A1A"}
                onChange={(e) => updateSetting("text_color", e.target.value)}
                className="h-10 w-12 rounded-lg border border-input bg-background"
              />
              <input
                type="text"
                value={settings.text_color || ""}
                onChange={(e) => updateSetting("text_color", e.target.value)}
                className="flex-1 rounded-lg border border-input bg-background px-4 py-2 outline-none focus:border-primary"
              />
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3 pt-2">
          <input
            type="checkbox"
            checked={Boolean(settings.dark_mode)}
            onChange={(e) => updateSetting("dark_mode", e.target.checked)}
            className="h-5 w-5 rounded border-input"
          />
          <label className="text-sm font-medium text-foreground">Dark mode</label>
        </div>
      </div>
    </div>
  );
}