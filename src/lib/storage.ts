import { supabase } from "@/integrations/supabase/client";

// Buckets are private; produce a long-lived signed URL stored in DB.
const TEN_YEARS = 60 * 60 * 24 * 365 * 10;
const ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/gif", "image/webp"];
const MAX_IMAGE_BYTES = 5 * 1024 * 1024; // 5 MB

function assertImage(file: File) {
  if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
    throw new Error("Only JPEG, PNG, GIF, or WebP images are allowed");
  }
  if (file.size > MAX_IMAGE_BYTES) {
    throw new Error("Image is too large (max 5 MB)");
  }
}

export async function uploadAvatar(userId: string, file: File): Promise<string> {
  assertImage(file);
  const ext = (file.name.split(".").pop() || "jpg").toLowerCase().replace(/[^a-z0-9]/g, "");
  const path = `${userId}/avatar-${Date.now()}.${ext}`;
  const { error } = await supabase.storage.from("avatars").upload(path, file, {
    cacheControl: "3600",
    upsert: true,
    contentType: file.type,
  });
  if (error) throw error;
  const { data, error: sErr } = await supabase.storage
    .from("avatars")
    .createSignedUrl(path, TEN_YEARS);
  if (sErr || !data) throw sErr ?? new Error("Failed to sign URL");
  return data.signedUrl;
}

export async function uploadWishPhoto(profileId: string, file: File): Promise<string> {
  assertImage(file);
  const ext = (file.name.split(".").pop() || "jpg").toLowerCase().replace(/[^a-z0-9]/g, "");
  const path = `${profileId}/${crypto.randomUUID()}.${ext}`;
  const { error } = await supabase.storage.from("wish-photos").upload(path, file, {
    cacheControl: "3600",
    upsert: false,
    contentType: file.type,
  });
  if (error) throw error;
  const { data, error: sErr } = await supabase.storage
    .from("wish-photos")
    .createSignedUrl(path, TEN_YEARS);
  if (sErr || !data) throw sErr ?? new Error("Failed to sign URL");
  return data.signedUrl;
}

export const MAX_WISH_PHOTOS = 6;

export async function uploadWishPhotos(profileId: string, files: File[]): Promise<string[]> {
  if (files.length > MAX_WISH_PHOTOS) {
    throw new Error(`You can attach up to ${MAX_WISH_PHOTOS} photos`);
  }
  const urls: string[] = [];
  for (const file of files) {
    urls.push(await uploadWishPhoto(profileId, file));
  }
  return urls;
}