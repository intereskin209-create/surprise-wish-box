import { createFileRoute, Link, notFound, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Gift, ImagePlus, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { uploadWishPhoto } from "@/lib/storage";
import { formatBirthday } from "@/lib/birthday";

export const Route = createFileRoute("/$username/wish")({
  loader: async ({ params }) => {
    const { data, error } = await supabase
      .from("profiles")
      .select("id, username, avatar_url, birthday_date")
      .ilike("username", params.username)
      .maybeSingle();
    if (error) throw error;
    if (!data) throw notFound();
    return { profile: data };
  },
  component: WishPage,
  errorComponent: ({ error }) => (
    <div className="grid min-h-screen place-items-center text-muted-foreground">{error.message}</div>
  ),
  notFoundComponent: () => (
    <div className="grid min-h-screen place-items-center text-muted-foreground">Profile not found.</div>
  ),
  head: ({ params }) => ({
    meta: [{ title: `Leave a wish for ${params.username} — Wishly` }],
  }),
});

function WishPage() {
  const { profile } = Route.useLoaderData();
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [message, setMessage] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);

  function onFile(f: File | null) {
    setFile(f);
    setPreview(f ? URL.createObjectURL(f) : null);
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim() || !message.trim()) return toast.error("Add your name and a message");
    setBusy(true);
    try {
      let image_url: string | null = null;
      if (file) image_url = await uploadWishPhoto(profile.id, file);
      const { error } = await supabase.from("wishes").insert({
        profile_id: profile.id,
        author_name: name.trim(),
        message: message.trim(),
        image_url,
      });
      if (error) throw error;
      setDone(true);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not save wish");
      setBusy(false);
    }
  }

  if (done) {
    return (
      <div className="min-h-screen bg-hero">
        <main className="mx-auto max-w-md px-6 pt-32 text-center">
          <div className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-glow text-primary-foreground shadow-glow">
            <Lock className="h-6 w-6" />
          </div>
          <h1 className="mt-6 text-3xl font-semibold tracking-tight">Sealed</h1>
          <p className="mt-3 text-muted-foreground">
            Your wish has been saved and will be revealed on {profile.username}'s birthday
            ({formatBirthday(profile.birthday_date)}).
          </p>
          <div className="mt-8 flex flex-col gap-3">
            <Button
              onClick={() => {
                setDone(false);
                setName("");
                setMessage("");
                onFile(null);
                setBusy(false);
              }}
              variant="ghost"
              className="border border-border"
            >
              Leave another wish
            </Button>
            <Button onClick={() => navigate({ to: "/$username", params: { username: profile.username } })}>
              Back to {profile.username}'s page
            </Button>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-hero">
      <header className="mx-auto flex max-w-6xl items-center px-6 py-6">
        <Link to="/" className="flex items-center gap-2 text-lg font-semibold tracking-tight">
          <span className="grid h-8 w-8 place-items-center rounded-xl bg-glow text-primary-foreground shadow-glow">
            <Gift className="h-4 w-4" />
          </span>
          Wishly
        </Link>
      </header>
      <main className="mx-auto max-w-md px-6 pb-24 pt-6">
        <Link
          to="/$username"
          params={{ username: profile.username }}
          className="text-xs text-muted-foreground hover:text-foreground"
        >
          ← @{profile.username}
        </Link>
        <h1 className="mt-4 text-3xl font-semibold tracking-tight">
          Leave a wish for {profile.username}
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          It stays sealed until their birthday on {formatBirthday(profile.birthday_date)}.
        </p>

        <form onSubmit={submit} className="mt-8 space-y-5">
          <div className="space-y-2">
            <Label htmlFor="name">Your name</Label>
            <Input id="name" value={name} onChange={(e) => setName(e.target.value)} placeholder="Alex" maxLength={60} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="message">Message</Label>
            <Textarea
              id="message"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={6}
              maxLength={2000}
              placeholder="Say something they'll want to read on the morning of their birthday…"
            />
          </div>
          <div className="space-y-2">
            <Label>Photo (optional)</Label>
            <label className="flex cursor-pointer items-center justify-center gap-2 rounded-md border border-dashed border-border bg-card/40 px-4 py-6 text-sm text-muted-foreground transition-colors hover:bg-card/70">
              <ImagePlus className="h-4 w-4" />
              {file ? file.name : "Attach a photo"}
              <input
                type="file"
                accept="image/*"
                hidden
                onChange={(e) => onFile(e.target.files?.[0] ?? null)}
              />
            </label>
            {preview && (
              <img src={preview} alt="" className="max-h-60 w-full rounded-lg border border-border object-cover" />
            )}
          </div>

          <Button type="submit" size="lg" disabled={busy} className="w-full bg-glow text-primary-foreground shadow-glow hover:opacity-95">
            {busy ? "Sealing your wish…" : "Seal my wish"}
          </Button>
        </form>
      </main>
    </div>
  );
}