"use client";

import { useEffect, useRef, useState } from "react";
import { createClient } from "@/lib/supabase";
import { uploadToSupabaseStorage } from "@/lib/storage";
import { Building2, ImagePlus, Loader2, Save, Trash2, Upload } from "lucide-react";
import toast from "react-hot-toast";

export default function Page() {
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [form, setForm] = useState({
    name: "",
    short_description: "",
    description: "",
    capacity: 200,
    area_sqft: 0,
    price_per_event: 0,
    amenities: "",
    images: [] as string[],
    featured: false,
    is_active: true,
  });

  const loadVenues = async () => {
    const supabase = createClient();
    const { data, error } = await supabase.from("venues").select("*").order("sort_order", { ascending: true });
    if (!error) setItems(data ?? []);
    setLoading(false);
  };

  useEffect(() => {
    loadVenues();
  }, []);

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    setUploading(true);
    const uploaded: string[] = [];

    try {
      for (const file of Array.from(files)) {
        const url = await uploadToSupabaseStorage(file, "images", "venues");
        uploaded.push(url);
      }

      setForm((prev) => ({ ...prev, images: [...prev.images, ...uploaded] }));
      toast.success("Venue images uploaded");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Image upload failed");
    } finally {
      setUploading(false);
      if (event.target) event.target.value = "";
    }
  };

  const removeImage = (index: number) => {
    setForm((prev) => ({
      ...prev,
      images: prev.images.filter((_, idx) => idx !== index),
    }));
  };

  const handleSave = async () => {
    const supabase = createClient();
    setSaving(true);

    const payload = {
      ...form,
      amenities: form.amenities
        .split(",")
        .map((item) => item.trim())
        .filter(Boolean),
      images: form.images,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    const { error } = await supabase.from("venues").insert([payload]);
    if (error) {
      toast.error("Failed to save venue: " + error.message);
    } else {
      toast.success("Venue saved successfully");
      setForm({
        name: "",
        short_description: "",
        description: "",
        capacity: 200,
        area_sqft: 0,
        price_per_event: 0,
        amenities: "",
        images: [],
        featured: false,
        is_active: true,
      });
      loadVenues();
    }

    setSaving(false);
  };

  const removeItem = async (id: string) => {
    if (!confirm("Are you sure you want to delete this venue?")) return;

    const supabase = createClient();

    try {
      const { error: bookingError } = await supabase
        .from("bookings")
        .update({ venue_id: null, updated_at: new Date().toISOString() })
        .eq("venue_id", id);

      if (bookingError) {
        console.error("Failed to clear venue from bookings:", bookingError);
      }

      const { error } = await supabase.from("venues").delete().eq("id", id);
      if (error) {
        toast.error("Failed to delete venue: " + error.message);
      } else {
        toast.success("Venue deleted");
        setItems((prev) => prev.filter((item) => item.id !== id));
      }
    } catch (error) {
      toast.error("Failed to delete venue");
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Venues</h1>
        <p className="text-muted-foreground">Create hall listings with photos, capacity and pricing.</p>
      </div>

      <div className="rounded-xl border border-border bg-card p-6 space-y-5">
        <div className="flex items-center gap-2 text-lg font-semibold text-foreground">
          <Building2 className="w-5 h-5 text-primary" />
          Add Venue
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">Venue Name</label>
            <input
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="w-full px-4 py-2 rounded-lg bg-background border border-input focus:border-primary outline-none"
              placeholder="Royal Palace Hall"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-2">Capacity</label>
            <input
              type="number"
              value={form.capacity}
              onChange={(e) => setForm({ ...form, capacity: Number(e.target.value) })}
              className="w-full px-4 py-2 rounded-lg bg-background border border-input focus:border-primary outline-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-2">Price per Event</label>
            <input
              type="number"
              value={form.price_per_event}
              onChange={(e) => setForm({ ...form, price_per_event: Number(e.target.value) })}
              className="w-full px-4 py-2 rounded-lg bg-background border border-input focus:border-primary outline-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-2">Area (sqft)</label>
            <input
              type="number"
              value={form.area_sqft}
              onChange={(e) => setForm({ ...form, area_sqft: Number(e.target.value) })}
              className="w-full px-4 py-2 rounded-lg bg-background border border-input focus:border-primary outline-none"
            />
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-foreground mb-2">Short Description</label>
            <input
              value={form.short_description}
              onChange={(e) => setForm({ ...form, short_description: e.target.value })}
              className="w-full px-4 py-2 rounded-lg bg-background border border-input focus:border-primary outline-none"
              placeholder="Luxury hall for weddings and receptions"
            />
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-foreground mb-2">Description</label>
            <textarea
              rows={4}
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              className="w-full px-4 py-2 rounded-lg bg-background border border-input focus:border-primary outline-none resize-none"
              placeholder="Describe the venue and features"
            />
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-foreground mb-2">Amenities</label>
            <input
              value={form.amenities}
              onChange={(e) => setForm({ ...form, amenities: e.target.value })}
              className="w-full px-4 py-2 rounded-lg bg-background border border-input focus:border-primary outline-none"
              placeholder="Parking, Catering, Decor, Stage Lighting"
            />
          </div>
        </div>

        <div className="rounded-xl border-2 border-dashed border-border p-5">
          <input ref={fileInputRef} type="file" accept="image/*" multiple className="hidden" onChange={handleImageUpload} />
          <div className="flex flex-col items-center justify-center gap-2 text-muted-foreground">
            <Upload className="w-6 h-6" />
            <p>Upload hall photos to appear on the home page and booking flow</p>
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
              className="px-4 py-2 rounded-full bg-primary text-primary-foreground text-sm font-medium disabled:opacity-60"
            >
              {uploading ? "Uploading..." : "Choose Photos"}
            </button>
          </div>
        </div>

        {form.images.length > 0 && (
          <div className="grid sm:grid-cols-3 gap-3">
            {form.images.map((image, index) => (
              <div key={`${image}-${index}`} className="relative rounded-xl overflow-hidden border border-border bg-background">
                <img src={image} alt={`Venue ${index + 1}`} className="h-28 w-full object-cover" />
                <button
                  type="button"
                  onClick={() => removeImage(index)}
                  className="absolute top-2 right-2 bg-background/80 p-1.5 rounded-full"
                >
                  <Trash2 className="w-4 h-4 text-destructive" />
                </button>
              </div>
            ))}
          </div>
        )}

        <div className="flex items-center gap-3">
          <input
            type="checkbox"
            checked={form.featured}
            onChange={(e) => setForm({ ...form, featured: e.target.checked })}
          />
          <label className="text-sm text-foreground">Featured venue</label>
        </div>

        <button
          type="button"
          onClick={handleSave}
          disabled={saving || !form.name || form.images.length === 0}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-primary text-primary-foreground font-medium disabled:opacity-50"
        >
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          {saving ? "Saving..." : "Save Venue"}
        </button>
      </div>

      <div className="rounded-xl border border-border bg-card p-6">
        {loading ? (
          <div className="flex items-center justify-center py-6 text-muted-foreground">
            <Loader2 className="w-5 h-5 animate-spin mr-2" />
            Loading venues...
          </div>
        ) : items.length === 0 ? (
          <p className="text-muted-foreground">No venues yet.</p>
        ) : (
          <div className="space-y-4">
            {items.map((item) => (
              <div key={item.id} className="rounded-xl border border-border p-4 bg-background">
                <div className="flex flex-col md:flex-row gap-4">
                  <div className="w-full md:w-40">
                    {item.images?.[0] ? (
                      <img src={item.images[0]} alt={item.name} className="h-28 w-full object-cover rounded-lg" />
                    ) : (
                      <div className="h-28 w-full rounded-lg bg-muted flex items-center justify-center text-xs text-muted-foreground">
                        No image
                      </div>
                    )}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <h3 className="text-lg font-semibold text-foreground">{item.name}</h3>
                        <p className="text-sm text-muted-foreground">{item.short_description || item.description || "No summary"}</p>
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
                    <div className="mt-3 flex flex-wrap gap-3 text-sm text-muted-foreground">
                      <span>Capacity: {item.capacity}</span>
                      <span>Area: {item.area_sqft || 0} sqft</span>
                      <span>₹{Number(item.price_per_event || 0).toLocaleString("en-IN")}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
