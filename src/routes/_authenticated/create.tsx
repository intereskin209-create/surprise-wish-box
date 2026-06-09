import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { Gift, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { uploadAvatar } from "@/lib/storage";

export const Route = createFileRoute("/_authenticated/create")({
  component: CreateProfile,
  head: () => ({ meta: [{ title: "Create your birthday page — Wishly" }] }),
});

function CreateProfile() {
  const navigate = useNavigate();
  const ctx = Route.useRouteContext() as { user: { id: string; email?: string } };
  const userId = ctx.user.id;
  const [username, setUsername] = useState("");
  const [birthday, setBirthday] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    // Redirect if profile already exists
    supabase.from("profiles").select("username").eq("id", userId).maybeSingle().then(({ data }) => {
      if (data?.username) navigate({ to: "/$username", params: { username: data.username } });
    });
  }, [userId, navigate]);

  function onFile(f: File | null) {
    setFile(f);
    setPreview(f ? URL.createObjectURL(f) : null);
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    const cleanUsername = username.trim().toLowerCase().replace(/[^a-z0-9_-]/g, "");
    if (cleanUsername.length < 2) return toast.error("Pick a longer username");
    if (!birthday) return toast.error("Choose your birthday");
    setBusy(true);
    try {
      let avatar_url: string | null = null;
      if (file) avatar_url = await uploadAvatar(userId, file);
      const { error } = await supabase.from("profiles").insert({
        id: userId,
        username: cleanUsername,
        birthday_date: birthday,
        avatar_url,
      });
      if (error) {
        if (error.code === "23505") throw new Error("That username is taken");
        throw error;
      }
      navigate({ to: "/$username", params: { username: cleanUsername } });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not create page");
      setBusy(false);
    }
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
      <main className="mx-auto max-w-md px-6 pb-24 pt-12">
        <h1 className="text-3xl font-semibold tracking-tight">Create your birthday page</h1>
        <p className="mt-2 text-muted-foreground">This is where your friends will leave wishes.</p>

        <form onSubmit={submit} className="mt-10 space-y-6">
          <div className="flex items-center gap-4">
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              className="group relative grid h-20 w-20 place-items-center overflow-hidden rounded-full border border-border bg-secondary"
            >
              {preview ? (
                <img src={preview} alt="avatar" className="h-full w-full object-cover" />
              ) : (
                <Upload className="h-5 w-5 text-muted-foreground" />
              )}
            </button>
            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              hidden
              onChange={(e) => onFile(e.target.files?.[0] ?? null)}
            />
            <div className="text-sm text-muted-foreground">
              <div className="font-medium text-foreground">Avatar</div>
              <div>Optional, but recommended.</div>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="username">Username</Label>
            <div className="flex items-center rounded-md border border-input bg-input/30 px-3 focus-within:ring-2 focus-within:ring-ring">
              <span className="text-sm text-muted-foreground">wishly.app/</span>
              <Input
                id="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="alex"
                className="border-0 bg-transparent px-1 focus-visible:ring-0"
                autoComplete="off"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="birthday">Birthday</Label>
            <Input id="birthday" type="date" value={birthday} onChange={(e) => setBirthday(e.target.value)} />
          </div>

          <Button type="submit" size="lg" disabled={busy} className="w-full bg-glow text-primary-foreground shadow-glow hover:opacity-95">
            {busy ? "Creating…" : "Create my birthday page"}
          </Button>
        </form>
      </main>
    </div>
  );
}