import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { Gift, Lock, PartyPopper, Mail, Eye, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Countdown } from "@/components/Countdown";
import { Confetti } from "@/components/Confetti";
import { useT } from "@/lib/i18n";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { formatBirthday } from "@/lib/birthday";

export const Route = createFileRoute("/example")({
  head: () => ({
    meta: [
      { title: "Example — Wishly" },
      { name: "description", content: "See how a Wishly birthday page looks before creating your own." },
    ],
  }),
  component: ExamplePage,
});

const DEMO_PROFILE = {
  id: "demo",
  username: "alex",
  avatar_url: null,
  birthday_date: "1996-08-24",
};

const DEMO_WISHES = [
  { id: "w1", author_name: "Sarah", message: "Happy birthday Alex! Hope your day is as amazing as you are. Can't wait to celebrate together! 🎉", image_url: null, created_at: "2025-01-15T10:00:00Z" },
  { id: "w2", author_name: "Mom", message: "My wonderful child, I am so proud of the person you've become. Wishing you all the happiness in the world. Love you forever. ❤️", image_url: null, created_at: "2025-02-03T14:30:00Z" },
  { id: "w3", author_name: "Jake & Team", message: "The whole office chipped in — happy birthday from all of us! 🎂", image_url: null, created_at: "2025-03-20T09:15:00Z" },
  { id: "w4", author_name: "Emma", message: "To my favorite person — may this year bring you everything you've been dreaming of. You deserve it all! ✨", image_url: null, created_at: "2025-04-10T18:45:00Z" },
  { id: "w5", author_name: "Grandpa", message: "Another year older, another year wiser. Happy birthday, kiddo.", image_url: null, created_at: "2025-05-05T08:00:00Z" },
];

function ExamplePage() {
  const t = useT();
  const [revealed, setRevealed] = useState(false);
  const count = DEMO_WISHES.length;

  return (
    <div className="min-h-screen bg-hero">
      <Header />
      <main className="mx-auto max-w-2xl px-6 pb-24 pt-10">
        <DemoBadge />
        <ProfileHeader />

        <ViewToggle revealed={revealed} onToggle={setRevealed} />

        {revealed ? (
          <RevealedView />
        ) : (
          <LockedView count={count} />
        )}
      </main>
    </div>
  );
}

function Header() {
  const t = useT();
  return (
    <header className="mx-auto flex max-w-6xl items-center justify-between px-6 py-6">
      <Link to="/" className="flex items-center gap-2 text-lg font-semibold tracking-tight">
        <span className="grid h-8 w-8 place-items-center rounded-xl bg-glow text-primary-foreground shadow-glow">
          <Gift className="h-4 w-4" />
        </span>
        Wishly
      </Link>
      <div className="flex items-center gap-3">
        <LanguageSwitcher />
        <Link to="/auth" className="text-sm text-muted-foreground transition-colors hover:text-foreground">
          {t("nav.createYours")}
        </Link>
      </div>
    </header>
  );
}

function DemoBadge() {
  const t = useT();
  return (
    <div className="mb-6 flex justify-center animate-fade-up">
      <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-4 py-1.5 text-xs font-medium text-primary">
        <Eye className="h-3 w-3" />
        {t("example.badge")}
      </div>
    </div>
  );
}

function ProfileHeader() {
  const t = useT();
  const profile = DEMO_PROFILE;
  return (
    <div className="flex flex-col items-center text-center animate-fade-up">
      <div className="relative">
        <div className="h-24 w-24 overflow-hidden rounded-full border border-border bg-secondary shadow-soft">
          <div className="grid h-full w-full place-items-center text-2xl font-medium text-muted-foreground">
            {profile.username[0]?.toUpperCase()}
          </div>
        </div>
      </div>
      <h1 className="mt-5 text-3xl font-semibold tracking-tight">@{profile.username}</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        {t("profile.birthdayOn", { date: formatBirthday(profile.birthday_date) })}
      </p>
    </div>
  );
}

function ViewToggle({ revealed, onToggle }: { revealed: boolean; onToggle: (v: boolean) => void }) {
  const t = useT();
  return (
    <div className="mt-8 flex justify-center animate-fade-up">
      <div className="inline-flex rounded-full border border-border bg-card/60 p-1 backdrop-blur">
        <button
          onClick={() => onToggle(false)}
          className={`rounded-full px-4 py-1.5 text-xs font-medium transition-colors ${
            !revealed ? "bg-glow text-primary-foreground shadow-glow" : "text-muted-foreground hover:text-foreground"
          }`}
        >
          <Lock className="mr-1 inline h-3 w-3" />
          {t("example.locked")}
        </button>
        <button
          onClick={() => onToggle(true)}
          className={`rounded-full px-4 py-1.5 text-xs font-medium transition-colors ${
            revealed ? "bg-glow text-primary-foreground shadow-glow" : "text-muted-foreground hover:text-foreground"
          }`}
        >
          <PartyPopper className="mr-1 inline h-3 w-3" />
          {t("example.revealed")}
        </button>
      </div>
    </div>
  );
}

function LockedView({ count }: { count: number }) {
  const t = useT();
  const word = count === 1 ? t("profile.wish.one") : t("profile.wish.many");

  return (
    <div className="mt-8 animate-fade-up">
      <Countdown birthdayISO={DEMO_PROFILE.birthday_date} />

      <div className="mt-8 rounded-2xl border border-border bg-card/60 p-6 text-center backdrop-blur shadow-soft">
        <div className="mx-auto grid h-12 w-12 place-items-center rounded-full bg-secondary">
          <Lock className="h-5 w-5 text-muted-foreground" />
        </div>
        <div className="mt-4 text-2xl font-semibold">
          {t("profile.waiting", { n: count, word })}
        </div>
        <p className="mt-2 text-sm text-muted-foreground">
          {t("example.sealedNote")}
        </p>
      </div>

      <SealedWall count={count} />

      <Button disabled size="lg" className="mt-6 w-full opacity-60 cursor-not-allowed">
        {t("profile.leaveWish")}
      </Button>

      <p className="mt-8 text-center text-xs text-muted-foreground">
        {t("example.demoNote")}
      </p>
    </div>
  );
}

function SealedWall({ count }: { count: number }) {
  const t = useT();
  const CAP = 24;
  const shown = Math.min(count, CAP);

  return (
    <section className="mt-8">
      <div className="mb-3 flex items-center justify-between px-1">
        <span className="text-[11px] font-medium uppercase tracking-[0.18em] text-muted-foreground">
          {t("wall.title")}
        </span>
        <span className="text-[11px] tabular-nums text-muted-foreground">{count}</span>
      </div>
      <div className="grid grid-cols-3 gap-3 sm:grid-cols-4">
        {Array.from({ length: shown }).map((_, i) => (
          <div
            key={i}
            aria-label={t("wall.cardAlt")}
            className="group relative aspect-square overflow-hidden rounded-xl border border-border bg-card/60 shadow-soft transition-transform duration-200 hover:scale-[1.03] animate-fade-in"
            style={{ animationDelay: `${Math.min(i * 40, 800)}ms`, animationFillMode: "backwards" }}
          >
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_30%,color-mix(in_oklab,var(--primary)_18%,transparent),transparent_70%)]" />
            <div className="absolute inset-0 grid place-items-center">
              <Mail className="h-5 w-5 text-muted-foreground/70 transition-colors group-hover:text-foreground/80" />
            </div>
            <div className="pointer-events-none absolute bottom-1.5 right-1.5 h-2 w-2 rounded-full bg-glow opacity-70 shadow-glow" />
          </div>
        ))}
      </div>
    </section>
  );
}

function RevealedView() {
  const t = useT();
  const wishes = DEMO_WISHES;
  const word = wishes.length === 1 ? t("profile.wish.one") : t("profile.wish.many");

  return (
    <div className="mt-8 animate-fade-up">
      <Confetti count={60} />
      <div className="text-center animate-reveal">
        <div className="text-gradient text-5xl font-semibold tracking-tight sm:text-6xl">{t("reveal.title")}</div>
        <p className="mt-3 text-muted-foreground">
          {t("reveal.sub", { n: wishes.length, word })}
        </p>
      </div>

      <div className="mt-8 flex flex-col items-center">
        <Button disabled className="bg-glow text-primary-foreground shadow-glow opacity-100 cursor-default">
          <Sparkles className="mr-1.5 h-4 w-4" />
          {t("reveal.btn.wished")}
        </Button>
        <p className="mt-3 text-sm text-muted-foreground">
          {t("reveal.tapCount", { n: 12, name: DEMO_PROFILE.username, word: t("reveal.person.many") })}
        </p>
      </div>

      <div className="mt-10 space-y-4">
        {wishes.map((w, i) => (
          <article
            key={w.id}
            className="rounded-2xl border border-border bg-card/70 p-5 shadow-soft animate-reveal"
            style={{ animationDelay: `${Math.min(i * 80, 1200)}ms` }}
          >
            <div className="flex items-center justify-between">
              <div className="text-sm font-medium">{w.author_name}</div>
              <div className="text-[11px] text-muted-foreground">
                {new Date(w.created_at).toLocaleDateString()}
              </div>
            </div>
            <p className="mt-3 whitespace-pre-wrap text-[15px] leading-relaxed text-foreground/90">{w.message}</p>
          </article>
        ))}
      </div>
    </div>
  );
}
