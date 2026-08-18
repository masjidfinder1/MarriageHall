import { createClient } from "@/lib/supabase";

export async function uploadToSupabaseStorage(
  file: File,
  bucket = "images",
  folder = "uploads"
): Promise<string> {
  const supabase = createClient();

  const safeFileName = file.name
    .trim()
    .replace(/\s+/g, "-")
    .replace(/[^a-zA-Z0-9._-]/g, "_");

  const filePath = `${folder}/${Date.now()}-${Math.random().toString(36).slice(2, 8)}-${safeFileName}`;

  const { data, error } = await supabase.storage.from(bucket).upload(filePath, file, {
    cacheControl: "3600",
    upsert: false,
  });

  if (error) {
    const message = error.message.toLowerCase();
    const isStorageIssue =
      message.includes("bucket") ||
      message.includes("permission") ||
      message.includes("denied") ||
      message.includes("not found") ||
      message.includes("policy");

    throw new Error(
      isStorageIssue
        ? "Supabase storage is not available or the bucket permissions are blocking uploads. Please check the storage bucket and its policies."
        : `Upload failed: ${error.message}`
    );
  }

  const { data: publicData } = supabase.storage.from(bucket).getPublicUrl(data?.path || filePath);

  if (!publicData?.publicUrl) {
    throw new Error("The uploaded image is missing a public URL.");
  }

  const cacheBustedUrl = `${publicData.publicUrl}${publicData.publicUrl.includes("?") ? "&" : "?"}v=${Date.now()}`;
  return cacheBustedUrl;
}
