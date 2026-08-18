"use client";

import { useEffect, useRef, useState } from "react";
import { createClient } from "@/lib/supabase";
import { uploadToSupabaseStorage } from "@/lib/storage";
import { ImagePlus, Loader2, Save, Trash2, Upload } from "lucide-react";
import toast from "react-hot-toast";

export default function Page() {
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [form, setForm] = useState({
    title: "",
    category: "hall",
    image_url: "",
    featured: false,
    is_active: true,
  });

  const loadGallery = async () => {
    const supabase = createClient();
    const { data, error } = await supabase.from("gallery").select("*").order("sort_order", { ascending: true });
    if (!error) setItems(data ?? []);
    setLoading(false);
  };

  useEffect(() => {
    loadGallery();
  }, []);

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const url = await uploadToSupabaseStorage(file, "images", "gallery");
      setForm((prev) => ({ ...prev, image_url: url }));
      toast.success("Gallery image uploaded");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Image upload failed");
    } finally {
      setUploading(false);
      if (event.target) event.target.value = "";
    }
  };

  const handleSave = async () => {
    const supabase = createClient();
    setSaving(true);

    const payload = {
      ...form,
      sort_order: items.length,
      created_at: new Date().toISOString(),
      thumbnail_url: form.image_url,
      focal_point: { x: 0.5, y: 0.5 },
    };

    const { error } = await supabase.from("gallery").insert([payload]);
    if (error) {
      toast.error("Failed to save gallery image: " + error.message);
    } else {
      toast.success("Gallery image saved successfully");
      setForm({
        title: "",
        category: "hall",
        image_url: "",
        featured: false,
        is_active: true,
      });
      loadGallery();
    }

    setSaving(false);
  };

  const removeItem = async (id: string) => {
    const supabase = createClient();
    const { error } = await supabase.from("gallery").delete().eq("id", id);
    if (error) {
      toast.error("Failed to delete gallery image");
    } else {
      toast.success("Gallery image deleted");
      setItems((prev) => prev.filter((item) => item.id !== id));
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Gallery</h1>
        <p className="text-muted-foreground">Upload gallery images for the public home page.</p>
      </div>

      <div className="rounded-xl border border-border bg-card p-6 space-y-5">
        <div className="flex items-center gap-2 text-lg font-semibold text-foreground">
          <ImagePlus className="w-5 h-5 text-primary" />
          Add Gallery Image
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">Title</label>
            <input
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              className="w-full px-4 py-2 rounded-lg bg-background border border-input focus:border-primary outline-none"
              placeholder="Wedding Stage"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-2">Category</label>
            <select
              value={form.category}
              onChange={(e) => setForm({ ...form, category: e.target.value })}
              className="w-full px-4 py-2 rounded-lg bg-background border border-input focus:border-primary outline-none"
            >
              <option value="hall">Hall</option>
              <option value="stage">Stage</option>
              <option value="decoration">Decoration</option>
              <option value="rooms">Rooms</option>
              <option value="dining">Dining</option>
              <option value="lawn">Lawn</option>
              <option value="exterior">Exterior</option>
              <option value="events">Events</option>
            </select>
          </div>
        </div>

        <div className="rounded-xl border-2 border-dashed border-border p-5">
          <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
          <div className="flex flex-col items-center justify-center gap-2 text-muted-foreground">
            <Upload className="w-6 h-6" />
            <p>Upload image for the gallery</p>
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
              className="px-4 py-2 rounded-full bg-primary text-primary-foreground text-sm font-medium disabled:opacity-60"
            >
              {uploading ? "Uploading..." : "Choose Image"}
            </button>
          </div>
        </div>

        {form.image_url && (
          <div className="rounded-xl overflow-hidden border border-border">
            <img src={form.image_url} alt="Gallery preview" className="h-56 w-full object-cover" />
          </div>
        )}

        <div className="flex items-center gap-3">
          <input
            type="checkbox"
            checked={form.featured}
            onChange={(e) => setForm({ ...form, featured: e.target.checked })}
          />
          <label className="text-sm text-foreground">Featured image</label>
        </div>

        <button
          type="button"
          onClick={handleSave}
          disabled={saving || !form.image_url}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-primary text-primary-foreground font-medium disabled:opacity-50"
        >
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          {saving ? "Saving..." : "Save Image"}
        </button>
      </div>

      <div className="rounded-xl border border-border bg-card p-6">
        {loading ? (
          <div className="flex items-center justify-center py-6 text-muted-foreground">
            <Loader2 className="w-5 h-5 animate-spin mr-2" />
            Loading gallery...
          </div>
        ) : items.length === 0 ? (
          <p className="text-muted-foreground">No gallery images yet.</p>
        ) : (
          <div className="grid md:grid-cols-2 gap-4">
            {items.map((item) => (
              <div key={item.id} className="rounded-xl border border-border p-3 bg-background">
                <img src={item.image_url} alt={item.title || "Gallery image"} className="h-40 w-full object-cover rounded-lg" />
                <div className="mt-3 flex items-center justify-between gap-3">
                  <div>
                    <p className="font-medium text-foreground">{item.title || "Untitled"}</p>
                    <p className="text-sm text-muted-foreground capitalize">{item.category}</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => removeItem(item.id)}
                    className="inline-flex items-center gap-2 px-3 py-2 rounded-lg border border-destructive/40 text-destructive hover:bg-destructive/5"
                  >
                    <Trash2 className="w-4 h-4" />
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
