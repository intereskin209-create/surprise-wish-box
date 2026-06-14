import { createFileRoute, Link, notFound, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Gift, ImagePlus, Lock, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { uploadWishPhotos, MAX_WISH_PHOTOS } from "@/lib/storage";
import { formatBirthday } from "@/lib/birthday";
import { useT } from "@/lib/i18n";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";

export const Route = createFileRoute("/$username/wish")({
  loader: async ({ params }) => {
    const { data, error } = await supabase
      .rpc("get_public_profile", { _username: params.username })
      .maybeSingle();
    if (error) throw error;
    if (!data) throw notFound();
    return { profile: data };
  },
  component: WishPage,
  errorComponent: ({ error }) => {
    console.error("[wish] load failed", error);
    return (
      <div className="grid min-h-screen place-items-center text-muted-foreground">
        Could not load this page.
      </div>
    );
  },
  notFoundComponent: () => <NotFoundView />,
  head: ({ params }) => ({
    meta: [{ title: `Leave a wish for ${params.username} — Wishly` }],
  }),
});

function WishPage() {
  const { profile } = Route.useLoaderData();
  const t = useT();
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [message, setMessage] = useState("");
  const [files, setFiles] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const [step, setStep] = useState<"edit" | "preview">("edit");
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);

  useEffect(() => {
    const urls = files.map((f) => URL.createObjectURL(f));
    setPreviews(urls);
    return () => {
      urls.forEach((u) => URL.revokeObjectURL(u));
    };
  }, [files]);

  function addFiles(list: FileList | null) {
    if (!list || list.length === 0) return;
    const incoming = Array.from(list);
    const room = MAX_WISH_PHOTOS - files.length;
    if (room <= 0) {
      toast.error(t("wish.photosMax", { max: MAX_WISH_PHOTOS }));
      return;
    }
    const next = incoming.slice(0, room);
    if (incoming.length > room) toast.error(t("wish.photosMax", { max: MAX_WISH_PHOTOS }));
    setFiles((prev) => [...prev, ...next]);
  }

  function removeFile(i: number) {
    setFiles((prev) => prev.filter((_, idx) => idx !== i));
  }

  function goPreview(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim() || !message.trim()) return toast.error(t("wish.required"));
    setStep("preview");
    if (typeof window !== "undefined") window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function submit() {
    if (!name.trim() || !message.trim()) return toast.error(t("wish.required"));
    setBusy(true);
    try {
      const image_urls = files.length ? await uploadWishPhotos(profile.id, files) : [];
      const { error } = await supabase.from("wishes").insert({
        profile_id: profile.id,
        author_name: name.trim(),
        message: message.trim(),
        image_url: image_urls[0] ?? null,
        image_urls,
      });
      if (error) throw error;
      setDone(true);
    } catch (err) {
      console.error("[wish] submit failed", err);
      const msg =
        err instanceof Error && /max 5 MB|are allowed|up to/i.test(err.message)
          ? err.message
          : t("wish.fail");
      toast.error(msg);
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
          <h1 className="mt-6 text-3xl font-semibold tracking-tight">{t("wish.sealed.title")}</h1>
          <p className="mt-3 text-muted-foreground">
            {t("wish.sealed.body", { name: profile.username, date: formatBirthday(profile.birthday_date) })}
          </p>
          <div className="mt-8 flex flex-col gap-3">
            <Button
              onClick={() => {
                setDone(false);
                setName("");
                setMessage("");
                setFiles([]);
                setStep("edit");
                setBusy(false);
              }}
              variant="ghost"
              className="border border-border"
            >
              {t("wish.sealed.another")}
            </Button>
            <Button onClick={() => navigate({ to: "/$username", params: { username: profile.username } })}>
              {t("wish.sealed.back", { name: profile.username })}
            </Button>
          </div>
        </main>
      </div>
    );
  }

  if (step === "preview") {
    return (
      <div className="min-h-screen bg-hero">
        <header className="mx-auto flex max-w-6xl items-center justify-between px-6 py-6">
          <Link to="/" className="flex items-center gap-2 text-lg font-semibold tracking-tight">
            <span className="grid h-8 w-8 place-items-center rounded-xl bg-glow text-primary-foreground shadow-glow">
              <Gift className="h-4 w-4" />
            </span>
            Wishly
          </Link>
          <LanguageSwitcher />
        </header>
        <main className="mx-auto max-w-md px-6 pb-24 pt-6">
          <div className="text-xs uppercase tracking-widest text-muted-foreground">{t("wish.preview")}</div>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight">{t("wish.previewTitle")}</h1>
          <p className="mt-2 text-sm text-muted-foreground">{t("wish.previewSub")}</p>

          <article className="mt-6 rounded-2xl border border-border bg-card/70 p-5 shadow-soft">
            <div className="text-sm font-medium">{name}</div>
            <p className="mt-3 whitespace-pre-wrap text-[15px] leading-relaxed text-foreground/90">{message}</p>
            {previews.length > 0 && (
              <div className={`mt-4 grid gap-2 ${previews.length === 1 ? "grid-cols-1" : "grid-cols-2"}`}>
                {previews.map((src, i) => (
                  <img
                    key={i}
                    src={src}
                    alt=""
                    className="aspect-square w-full rounded-xl border border-border object-cover"
                  />
                ))}
              </div>
            )}
          </article>

          <div className="mt-6 flex flex-col gap-3">
            <Button
              onClick={submit}
              disabled={busy}
              size="lg"
              className="w-full bg-glow text-primary-foreground shadow-glow hover:opacity-95"
            >
              {busy ? t("wish.submitting") : t("wish.confirmSeal")}
            </Button>
            <Button
              onClick={() => setStep("edit")}
              disabled={busy}
              variant="ghost"
              className="border border-border"
            >
              {t("wish.edit")}
            </Button>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-hero">
      <header className="mx-auto flex max-w-6xl items-center justify-between px-6 py-6">
        <Link to="/" className="flex items-center gap-2 text-lg font-semibold tracking-tight">
          <span className="grid h-8 w-8 place-items-center rounded-xl bg-glow text-primary-foreground shadow-glow">
            <Gift className="h-4 w-4" />
          </span>
          Wishly
        </Link>
        <LanguageSwitcher />
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
          {t("wish.title", { name: profile.username })}
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          {t("wish.sub", { date: formatBirthday(profile.birthday_date) })}
        </p>

        <form onSubmit={goPreview} className="mt-8 space-y-5">
          <div className="space-y-2">
            <Label htmlFor="name">{t("wish.name")}</Label>
            <Input id="name" value={name} onChange={(e) => setName(e.target.value)} placeholder="Alex" maxLength={60} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="message">{t("wish.message")}</Label>
            <Textarea
              id="message"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={6}
              maxLength={2000}
              placeholder={t("wish.messagePlaceholder")}
            />
          </div>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label>{t("wish.photo")}</Label>
              <span className="text-xs text-muted-foreground">
                {t("wish.photosHint", { n: files.length, max: MAX_WISH_PHOTOS })}
              </span>
            </div>
            {files.length < MAX_WISH_PHOTOS && (
              <label className="flex cursor-pointer items-center justify-center gap-2 rounded-md border border-dashed border-border bg-card/40 px-4 py-6 text-sm text-muted-foreground transition-colors hover:bg-card/70">
                <ImagePlus className="h-4 w-4" />
                {t("wish.attach")}
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  hidden
                  onChange={(e) => {
                    addFiles(e.target.files);
                    e.target.value = "";
                  }}
                />
              </label>
            )}
            {previews.length > 0 && (
              <div className="grid grid-cols-3 gap-2">
                {previews.map((src, i) => (
                  <div key={i} className="relative">
                    <img
                      src={src}
                      alt=""
                      className="aspect-square w-full rounded-lg border border-border object-cover"
                    />
                    <button
                      type="button"
                      onClick={() => removeFile(i)}
                      aria-label={t("wish.remove")}
                      className="absolute -right-1.5 -top-1.5 grid h-6 w-6 place-items-center rounded-full bg-background/90 text-foreground shadow-soft ring-1 ring-border transition hover:bg-background"
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <Button type="submit" size="lg" disabled={busy} className="w-full bg-glow text-primary-foreground shadow-glow hover:opacity-95">
            {t("wish.preview")}
          </Button>
        </form>
      </main>
    </div>
  );
}

function NotFoundView() {
  const t = useT();
  return <div className="grid min-h-screen place-items-center text-muted-foreground">{t("wish.notFound")}</div>;
}