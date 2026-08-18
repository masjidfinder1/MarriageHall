"use client";

import { useEffect, useRef, useState } from "react";
import { Save, Upload, Loader2 } from "lucide-react";
import { createClient } from "@/lib/supabase";
import { uploadToSupabaseStorage } from "@/lib/storage";
import toast from "react-hot-toast";

const formatSupabaseError = (error: any) => {
  if (!error) return "Unknown error";

  const parts = [
    error.message,
    error.details,
    error.hint,
    error.code ? `Code: ${error.code}` : "",
  ].filter(Boolean);

  return parts.join(" | ");
};

export default function ContentPage() {
  const [settings, setSettings] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const imageInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    const supabase = createClient();
    const { data, error } = await supabase
      .from("site_settings")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (data) {
      setSettings(data);
      setLoading(false);
      return;
    }

    if (!error) {
      const defaultSettings = {
        site_name: "Royal Palace Wedding Hall",
        tagline: "Luxury Weddings, Perfect Moments",
        description: "A premium venue for elegant celebrations and unforgettable memories.",
        phone: "+92 300 1234567",
        whatsapp_number: "+92 300 1234567",
        email: "hello@royalpalace.com",
        address: "Main Gulshan Avenue, Lahore",
        city: "Lahore",
        state: null,
        theme_preset: "royal_gold",
        primary_color: "#D4AF37",
        accent_color: "#F8E7A1",
        background_color: "#F5F1EA",
        text_color: "#1A1A1A",
        dark_mode: false,
        features_enabled: {
          statistics: true,
          venues: true,
          rooms: true,
          packages: true,
          services: true,
          gallery: true,
          testimonials: true,
          faq: true,
        },
        about_title: "Creating Unforgettable Moments",
        about_subtitle: "A premium venue for elegant celebrations and unforgettable memories.",
        about_description: "",
        about_image_url: null,
        years_experience: "10+",
        events_hosted: "500+",
        team_members: "50+",
        satisfaction_percentage: "100%",
      };

      const { data: created, error: createError } = await supabase
        .from("site_settings")
        .insert([defaultSettings])
        .select()
        .single();

      if (createError) {
        console.error("Failed to initialize settings:", createError);
        setSettings(defaultSettings);
      } else {
        setSettings(created);
      }
    }

    setLoading(false);
  };

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setUploadingImage(true);

    try {
      const url = await uploadToSupabaseStorage(file, "images", "content");
      setSettings({ ...settings, about_image_url: url });
      toast.success("Image uploaded successfully");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Image upload failed");
    } finally {
      setUploadingImage(false);
      if (event.target) event.target.value = "";
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setSettings((prev: any) => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    if (!settings) {
      toast.error("Content settings are not loaded yet.");
      return;
    }

    setSaving(true);

    const supabase = createClient();

    const updateData = {
      id: settings.id,
      about_title: settings.about_title,
      about_subtitle: settings.about_subtitle,
      about_description: settings.about_description,
      about_image_url: settings.about_image_url,
      years_experience: settings.years_experience,
      events_hosted: settings.events_hosted,
      team_members: settings.team_members,
      satisfaction_percentage: settings.satisfaction_percentage,
      updated_at: new Date().toISOString(),
    };

    try {
      const { data, error } = await supabase
        .from("site_settings")
        .upsert(updateData, { onConflict: "id" })
        .select()
        .single();

      if (error) {
        throw error;
      }

      setSettings(data || updateData);
      toast.success("Content saved successfully!");
      await fetchSettings();
    } catch (error) {
      console.error("Content save error:", error);
      toast.error("Failed to save content: " + formatSupabaseError(error));
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-6 h-6 animate-spin text-primary" />
      </div>
    );
  }

  if (!settings) return null;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Content Management</h1>
        <p className="text-muted-foreground">Edit website content and settings</p>
      </div>

      <div className="space-y-6">
        {/* About Section */}
        <div className="rounded-xl border border-border bg-card p-6 space-y-4">
          <h2 className="text-xl font-semibold text-foreground flex items-center gap-2">
            📋 About Section
          </h2>

          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              About Title
            </label>
            <input
              type="text"
              value={settings.about_title || ""}
              onChange={(e) => handleInputChange("about_title", e.target.value)}
              placeholder="e.g., Creating Unforgettable Moments"
              className="w-full px-4 py-2 rounded-lg bg-background border border-input focus:border-primary outline-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              About Subtitle
            </label>
            <input
              type="text"
              value={settings.about_subtitle || ""}
              onChange={(e) => handleInputChange("about_subtitle", e.target.value)}
              placeholder="e.g., A premium venue for elegant celebrations"
              className="w-full px-4 py-2 rounded-lg bg-background border border-input focus:border-primary outline-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              About Description
            </label>
            <textarea
              value={settings.about_description || ""}
              onChange={(e) => handleInputChange("about_description", e.target.value)}
              placeholder="Write detailed description about your venue..."
              rows={5}
              className="w-full px-4 py-2 rounded-lg bg-background border border-input focus:border-primary outline-none resize-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              About Section Image
            </label>
            <div className="flex gap-4">
              <button
                type="button"
                onClick={() => imageInputRef.current?.click()}
                disabled={uploadingImage}
                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground font-medium hover:opacity-90 disabled:opacity-50"
              >
                {uploadingImage ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Uploading...
                  </>
                ) : (
                  <>
                    <Upload className="w-4 h-4" />
                    Upload Image
                  </>
                )}
              </button>
              <input
                ref={imageInputRef}
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
              />
              {settings.about_image_url && (
                <div className="flex-1 relative h-12 rounded-lg overflow-hidden border border-border">
                  <img
                    src={settings.about_image_url}
                    alt="About preview"
                    className="w-full h-full object-cover"
                  />
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Statistics Section */}
        <div className="rounded-xl border border-border bg-card p-6 space-y-4">
          <h2 className="text-xl font-semibold text-foreground flex items-center gap-2">
            📊 Statistics
          </h2>

          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Years of Experience
              </label>
              <input
                type="text"
                value={settings.years_experience || ""}
                onChange={(e) => handleInputChange("years_experience", e.target.value)}
                placeholder="e.g., 10+"
                className="w-full px-4 py-2 rounded-lg bg-background border border-input focus:border-primary outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Events Hosted
              </label>
              <input
                type="text"
                value={settings.events_hosted || ""}
                onChange={(e) => handleInputChange("events_hosted", e.target.value)}
                placeholder="e.g., 500+"
                className="w-full px-4 py-2 rounded-lg bg-background border border-input focus:border-primary outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Team Members
              </label>
              <input
                type="text"
                value={settings.team_members || ""}
                onChange={(e) => handleInputChange("team_members", e.target.value)}
                placeholder="e.g., 50+"
                className="w-full px-4 py-2 rounded-lg bg-background border border-input focus:border-primary outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Satisfaction Rate
              </label>
              <input
                type="text"
                value={settings.satisfaction_percentage || ""}
                onChange={(e) => handleInputChange("satisfaction_percentage", e.target.value)}
                placeholder="e.g., 100%"
                className="w-full px-4 py-2 rounded-lg bg-background border border-input focus:border-primary outline-none"
              />
            </div>
          </div>
        </div>

        {/* Save Button */}
        <div className="flex gap-3">
          <button
            onClick={handleSave}
            disabled={saving}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-primary text-primary-foreground font-medium hover:opacity-90 disabled:opacity-50"
          >
            {saving ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                Save Changes
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
