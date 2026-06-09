import { supabase } from "@/integrations/supabase/client";

// Buckets are private; produce a long-lived signed URL stored in DB.
const TEN_YEARS = 60 * 60 * 24 * 365 * 10;

export async function uploadAvatar(userId: string, file: File): Promise<string> {
  const ext = file.name.split(".").pop() || "jpg";
  const path = `${userId}/avatar-${Date.now()}.${ext}`;
  const { error } = await supabase.storage.from("avatars").upload(path, file, {
    cacheControl: "3600",
    upsert: true,
  });
  if (error) throw error;
  const { data, error: sErr } = await supabase.storage
    .from("avatars")
    .createSignedUrl(path, TEN_YEARS);
  if (sErr || !data) throw sErr ?? new Error("Failed to sign URL");
  return data.signedUrl;
}

export async function uploadWishPhoto(profileId: string, file: File): Promise<string> {
  const ext = file.name.split(".").pop() || "jpg";
  const path = `${profileId}/${crypto.randomUUID()}.${ext}`;
  const { error } = await supabase.storage.from("wish-photos").upload(path, file, {
    cacheControl: "3600",
    upsert: false,
  });
  if (error) throw error;
  const { data, error: sErr } = await supabase.storage
    .from("wish-photos")
    .createSignedUrl(path, TEN_YEARS);
  if (sErr || !data) throw sErr ?? new Error("Failed to sign URL");
  return data.signedUrl;
}