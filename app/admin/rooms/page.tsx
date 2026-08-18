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
  const [dragging, setDragging] = useState(false);
  const [form, setForm] = useState({
    name: "",
    room_type: "Deluxe",
    description: "",
    price_per_night: 0,
    capacity: 2,
    beds: "2 Queen Beds",
    amenities: "Air Conditioning, Wi-Fi, TV",
    images: [] as string[],
    featured: false,
    is_active: true,
  });

  const loadRooms = async () => {
    const supabase = createClient();
    const { data, error } = await supabase.from("rooms").select("*").order("created_at", { ascending: false });

    if (!error) setItems(data ?? []);
    setLoading(false);
  };

  useEffect(() => {
    loadRooms();
  }, []);

  const uploadImages = async (files: FileList | File[]) => {
    const fileArray = Array.from(files);

    if (!fileArray.length) return;

    const uploadedUrls: string[] = [];

    for (const file of fileArray) {
      try {
        const url = await uploadToSupabaseStorage(file, "images", "rooms");
        uploadedUrls.push(url);
      } catch (error) {
        toast.error(error instanceof Error ? error.message : "Image upload failed.");
      }
    }

    if (uploadedUrls.length) {
      setForm((prev) => ({
        ...prev,
        images: [...prev.images, ...uploadedUrls],
      }));
    }
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

    const { error } = await supabase.from("rooms").insert([payload]);

    if (error) {
      toast.error("Failed to save room");
    } else {
      toast.success("Room saved successfully");
      setForm({
        name: "",
        room_type: "Deluxe",
        description: "",
        price_per_night: 0,
        capacity: 2,
        beds: "2 Queen Beds",
        amenities: "Air Conditioning, Wi-Fi, TV",
        images: [],
        featured: false,
        is_active: true,
      });
      loadRooms();
    }

    setSaving(false);
  };

  const removeImage = (index: number) => {
    setForm((prev) => ({
      ...prev,
      images: prev.images.filter((_, idx) => idx !== index),
    }));
  };

  const removeItem = async (id: string) => {
    if (!confirm("Are you sure you want to delete this room?")) return;

    const supabase = createClient();
    const { error } = await supabase.from("rooms").delete().eq("id", id);

    if (error) {
      toast.error("Failed to delete room: " + error.message);
    } else {
      toast.success("Room deleted");
      setItems((prev) => prev.filter((item) => item.id !== id));
    }
  };

  const handleDrop = async (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setDragging(false);
    if (event.dataTransfer.files?.length) {
      await uploadImages(event.dataTransfer.files);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Rooms</h1>
        <p className="text-muted-foreground">Manage guest rooms and their image gallery.</p>
      </div>

      <div className="rounded-xl border border-border bg-card p-6 space-y-5">
        <div className="flex items-center gap-2 text-lg font-semibold">
          <ImagePlus className="w-5 h-5 text-primary" />
          Add Room
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">Room Name</label>
            <input
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="w-full px-4 py-2 rounded-lg bg-background border border-input focus:border-primary outline-none"
              placeholder="Royal Deluxe Suite"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-2">Room Type</label>
            <input
              value={form.room_type}
              onChange={(e) => setForm({ ...form, room_type: e.target.value })}
              className="w-full px-4 py-2 rounded-lg bg-background border border-input focus:border-primary outline-none"
              placeholder="Deluxe"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-2">Price Per Night</label>
            <input
              type="number"
              value={form.price_per_night}
              onChange={(e) => setForm({ ...form, price_per_night: Number(e.target.value) })}
              className="w-full px-4 py-2 rounded-lg bg-background border border-input focus:border-primary outline-none"
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

          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-foreground mb-2">Description</label>
            <textarea
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              rows={4}
              className="w-full px-4 py-2 rounded-lg bg-background border border-input focus:border-primary outline-none resize-none"
              placeholder="Elegant room for newlyweds and guests..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-2">Beds</label>
            <input
              value={form.beds}
              onChange={(e) => setForm({ ...form, beds: e.target.value })}
              className="w-full px-4 py-2 rounded-lg bg-background border border-input focus:border-primary outline-none"
              placeholder="2 Queen Beds"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-2">Amenities</label>
            <input
              value={form.amenities}
              onChange={(e) => setForm({ ...form, amenities: e.target.value })}
              className="w-full px-4 py-2 rounded-lg bg-background border border-input focus:border-primary outline-none"
              placeholder="Wi-Fi, TV, AC"
            />
          </div>
        </div>

        <div
          onDragOver={(e) => {
            e.preventDefault();
            setDragging(true);
          }}
          onDragLeave={() => setDragging(false)}
          onDrop={handleDrop}
          className={`mt-4 rounded-xl border-2 border-dashed p-5 text-center transition ${
            dragging ? "border-primary bg-primary/5" : "border-border"
          }`}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            multiple
            className="hidden"
            onChange={(e) => {
              if (e.target.files) uploadImages(e.target.files);
            }}
          />
          <div className="flex flex-col items-center justify-center gap-2 text-muted-foreground">
            <Upload className="w-6 h-6" />
            <p>Drag and drop room photos here or</p>
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="px-4 py-2 rounded-full bg-primary text-primary-foreground text-sm font-medium"
            >
              Choose Files
            </button>
          </div>
        </div>

        {form.images.length > 0 && (
          <div className="grid sm:grid-cols-3 gap-3">
            {form.images.map((image, index) => (
              <div key={`${image}-${index}`} className="relative rounded-xl overflow-hidden border border-border bg-background">
                <img src={image} alt={`Room preview ${index + 1}`} className="h-28 w-full object-cover" />
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
          <label className="text-sm text-foreground">Featured room</label>
        </div>

        <button
          type="button"
          onClick={handleSave}
          disabled={saving}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-primary text-primary-foreground font-medium disabled:opacity-50"
        >
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          {saving ? "Saving..." : "Save Room"}
        </button>
      </div>

      <div className="rounded-xl border border-border bg-card p-6">
        {loading ? (
          <div className="flex items-center justify-center py-6 text-muted-foreground">
            <Loader2 className="w-5 h-5 animate-spin mr-2" />
            Loading rooms...
          </div>
        ) : items.length === 0 ? (
          <p className="text-muted-foreground">No rooms yet.</p>
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
                    <h3 className="text-lg font-semibold text-foreground">{item.name}</h3>
                    <p className="text-sm text-muted-foreground">{item.room_type}</p>
                    <p className="mt-2 text-sm text-foreground">{item.description || "No description"}</p>
                    <div className="mt-3 flex flex-wrap gap-3 text-sm text-muted-foreground">
                      <span>Capacity: {item.capacity}</span>
                      <span>Beds: {item.beds || "-"}</span>
                      <span>₹{Number(item.price_per_night || 0).toLocaleString("en-IN")}/night</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-end">
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
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
