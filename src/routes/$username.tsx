import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { Gift, Lock, Link2, Check, PartyPopper, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { formatBirthday, getVisitorId, isBirthdayToday, nextBirthdayDate } from "@/lib/birthday";
import { Countdown } from "@/components/Countdown";
import { Confetti } from "@/components/Confetti";
import { useT } from "@/lib/i18n";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";

type Profile = {
  id: string;
  username: string;
  avatar_url: string | null;
  birthday_date: string;
};
type Wish = {
  id: string;
  author_name: string;
  message: string;
  image_url: string | null;
  created_at: string;
};

export const Route = createFileRoute("/$username")({
  loader: async ({ params }) => {
    const { data, error } = await supabase
      .rpc("get_public_profile", { _username: params.username })
      .maybeSingle();
    if (error) throw error;
    if (!data) throw notFound();
    return { profile: data as Profile };
  },
  component: ProfilePage,
  errorComponent: ({ error }) => {
    console.error("[profile] load failed", error);
    return (
      <div className="grid min-h-screen place-items-center text-muted-foreground">
        Could not load this page.
      </div>
    );
  },
  notFoundComponent: () => (
    <NotFoundView />
  ),
  head: ({ params }) => ({
    meta: [
      { title: `${params.username} on Wishly` },
      { name: "description", content: `Leave ${params.username} a birthday wish on Wishly.` },
      { property: "og:title", content: `${params.username} on Wishly` },
      { property: "og:description", content: `Leave ${params.username} a birthday wish.` },
    ],
  }),
});

function ProfilePage() {
  const { profile } = Route.useLoaderData();
  const isBday = isBirthdayToday(profile.birthday_date);

  const wishesQ = useQuery({
    queryKey: ["wishes", profile.id, isBday],
    queryFn: async () => {
      if (isBday) {
        const { data, error } = await supabase
          .from("wishes")
          .select("id, author_name, message, image_url, created_at")
          .eq("profile_id", profile.id)
          .order("created_at", { ascending: true });
        if (error) throw error;
        return data as Wish[];
      }
      const { count, error } = await supabase
        .from("wishes")
        .select("id", { count: "exact", head: true })
        .eq("profile_id", profile.id);
      if (error) throw error;
      return count ?? 0;
    },
  });

  return (
    <div className="min-h-screen bg-hero">
      <Header />
      <main className="mx-auto max-w-2xl px-6 pb-24 pt-10">
        <ProfileHeader profile={profile} isBday={isBday} />

        {isBday ? (
          <RevealView profile={profile} wishes={(wishesQ.data as Wish[]) ?? []} loading={wishesQ.isLoading} />
        ) : (
          <LockedView profile={profile} count={(wishesQ.data as number) ?? 0} />
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

function NotFoundView() {
  const t = useT();
  return (
    <div className="grid min-h-screen place-items-center bg-hero px-6 text-center">
      <div>
        <h1 className="text-4xl font-semibold">{t("profile.notFound.title")}</h1>
        <p className="mt-2 text-muted-foreground">{t("profile.notFound.body")}</p>
        <Button asChild className="mt-6 bg-glow text-primary-foreground shadow-glow">
          <Link to="/auth">{t("profile.notFound.claim")}</Link>
        </Button>
      </div>
    </div>
  );
}

function ProfileHeader({ profile, isBday }: { profile: Profile; isBday: boolean }) {
  const t = useT();
  const [copied, setCopied] = useState(false);
  function copy() {
    const url = `${window.location.origin}/${profile.username}`;
    navigator.clipboard.writeText(url);
    setCopied(true);
    toast.success(t("profile.copied"));
    setTimeout(() => setCopied(false), 1500);
  }
  return (
    <div className="flex flex-col items-center text-center animate-fade-up">
      <div className="relative">
        <div className="h-24 w-24 overflow-hidden rounded-full border border-border bg-secondary shadow-soft">
          {profile.avatar_url ? (
            <img src={profile.avatar_url} alt={profile.username} className="h-full w-full object-cover" />
          ) : (
            <div className="grid h-full w-full place-items-center text-2xl font-medium text-muted-foreground">
              {profile.username[0]?.toUpperCase()}
            </div>
          )}
        </div>
        {isBday && (
          <span className="absolute -bottom-1 -right-1 grid h-8 w-8 place-items-center rounded-full bg-glow text-primary-foreground shadow-glow animate-pulse-glow">
            <PartyPopper className="h-4 w-4" />
          </span>
        )}
      </div>
      <h1 className="mt-5 text-3xl font-semibold tracking-tight">@{profile.username}</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        {t("profile.birthdayOn", { date: formatBirthday(profile.birthday_date) })}
      </p>
      <button
        onClick={copy}
        className="mt-5 inline-flex items-center gap-2 rounded-full border border-border bg-card/60 px-4 py-2 text-xs text-muted-foreground transition-colors hover:text-foreground"
      >
        {copied ? <Check className="h-3.5 w-3.5" /> : <Link2 className="h-3.5 w-3.5" />}
        wishly.app/{profile.username}
      </button>
    </div>
  );
}

function LockedView({ profile, count }: { profile: Profile; count: number }) {
  const t = useT();
  const next = nextBirthdayDate(profile.birthday_date);
  const word = count === 1 ? t("profile.wish.one") : t("profile.wish.many");
  return (
    <div className="mt-10 animate-fade-up">
      <Countdown birthdayISO={profile.birthday_date} />

      <div className="mt-8 rounded-2xl border border-border bg-card/60 p-6 text-center backdrop-blur shadow-soft">
        <div className="mx-auto grid h-12 w-12 place-items-center rounded-full bg-secondary">
          <Lock className="h-5 w-5 text-muted-foreground" />
        </div>
        <div className="mt-4 text-2xl font-semibold">
          {t("profile.waiting", { n: count, word })}
        </div>
        <p className="mt-2 text-sm text-muted-foreground">
          {t("profile.sealedUntil", { date: next.toLocaleDateString(undefined, { month: "long", day: "numeric" }) })}
        </p>
      </div>

      <SealedWall count={count} />

      <Button asChild size="lg" className="mt-6 w-full bg-glow text-primary-foreground shadow-glow hover:opacity-95">
        <Link to="/$username/wish" params={{ username: profile.username }}>
          {t("profile.leaveWish")}
        </Link>
      </Button>

      <p className="mt-8 text-center text-xs text-muted-foreground">
        {t("profile.shareNote", { name: profile.username })}
      </p>
    </div>
  );
}

function SealedWall({ count }: { count: number }) {
  const t = useT();
  const CAP = 24;
  const shown = Math.min(count, CAP);
  const remaining = Math.max(0, count - CAP);

  return (
    <section className="mt-8">
      <div className="mb-3 flex items-center justify-between px-1">
        <span className="text-[11px] font-medium uppercase tracking-[0.18em] text-muted-foreground">
          {t("wall.title")}
        </span>
        {count > 0 && (
          <span className="text-[11px] tabular-nums text-muted-foreground">{count}</span>
        )}
      </div>

      {count === 0 ? (
        <div className="rounded-2xl border border-dashed border-border bg-card/40 p-8 text-center text-sm text-muted-foreground">
          {t("wall.empty")}
        </div>
      ) : (
        <>
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
          {remaining > 0 && (
            <p className="mt-3 text-center text-xs text-muted-foreground">
              {t("wall.more", { n: remaining })}
            </p>
          )}
        </>
      )}
    </section>
  );
}

function RevealView({ profile, wishes, loading }: { profile: Profile; wishes: Wish[]; loading: boolean }) {
  const t = useT();
  const [showConfetti, setShowConfetti] = useState(true);
  useEffect(() => {
    const timer = setTimeout(() => setShowConfetti(false), 6000);
    return () => clearTimeout(timer);
  }, []);
  const word = wishes.length === 1 ? t("profile.wish.one") : t("profile.wish.many");
  return (
    <div className="mt-10">
      {showConfetti && <Confetti />}
      <div className="text-center animate-reveal">
        <div className="text-gradient text-5xl font-semibold tracking-tight sm:text-6xl">{t("reveal.title")}</div>
        <p className="mt-3 text-muted-foreground">
          {t("reveal.sub", { n: wishes.length, word })}
        </p>
      </div>

      <HappyBirthdayButton profile={profile} />

      <div className="mt-10 space-y-4">
        {loading && <div className="text-center text-sm text-muted-foreground">{t("reveal.opening")}</div>}
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
            {w.image_url && (
              <img
                src={w.image_url}
                alt=""
                className="mt-4 max-h-96 w-full rounded-xl border border-border object-cover"
              />
            )}
          </article>
        ))}
        {!loading && wishes.length === 0 && (
          <div className="rounded-2xl border border-border bg-card/60 p-10 text-center text-muted-foreground">
            {t("reveal.empty")}
          </div>
        )}
      </div>
    </div>
  );
}

function HappyBirthdayButton({ profile }: { profile: Profile }) {
  const t = useT();
  const [tapped, setTapped] = useState(false);
  const [count, setCount] = useState<number | null>(null);
  useEffect(() => {
    supabase
      .rpc("get_birthday_tap_count", { _profile_id: profile.id })
      .then(({ data }) => setCount(typeof data === "number" ? data : 0));
    const vid = getVisitorId();
    supabase
      .rpc("has_visitor_tapped", { _profile_id: profile.id, _visitor: vid })
      .then(({ data }) => setTapped(!!data));
  }, [profile.id]);

  async function tap() {
    if (tapped) return;
    const vid = getVisitorId();
    const { error } = await supabase
      .from("birthday_taps")
      .insert({ profile_id: profile.id, visitor_identifier: vid });
    if (error && error.code !== "23505") {
      toast.error(t("reveal.tapFail"));
      return;
    }
    setTapped(true);
    setCount((c) => (c ?? 0) + 1);
  }

  return (
    <div className="mt-8 flex flex-col items-center">
      <Button
        onClick={tap}
        disabled={tapped}
        size="lg"
        className="bg-glow text-primary-foreground shadow-glow hover:opacity-95 disabled:opacity-100"
      >
        🎉 {tapped ? t("reveal.btn.wished") : t("reveal.btn.wish")}
      </Button>
      {count !== null && count > 0 && (
        <p className="mt-3 text-sm text-muted-foreground">
          {t("reveal.tapCount", { n: count, name: profile.username, word: count === 1 ? t("reveal.person.one") : t("reveal.person.many") })}
        </p>
      )}
    </div>
  );
}