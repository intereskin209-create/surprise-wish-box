import { createFileRoute } from "@tanstack/react-router";
import { Link } from "@tanstack/react-router";
import { Lock, Sparkles, Gift, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useT } from "@/lib/i18n";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Wishly — Collect birthday wishes. Open them on your birthday." },
      { name: "description", content: "Create your birthday page and receive surprise messages from friends. All wishes stay locked until your big day." },
      { property: "og:title", content: "Wishly" },
      { property: "og:description", content: "Collect birthday wishes all year. Open them on your birthday." },
    ],
  }),
  component: Index,
});

function Index() {
  const t = useT();
  return (
    <div className="min-h-screen bg-hero">
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
            {t("nav.signin")}
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-6 pt-12 pb-24 sm:pt-20">
        <section className="grid items-center gap-16 lg:grid-cols-[1.1fr_1fr]">
          <div className="animate-fade-up">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-border bg-card/50 px-3 py-1 text-xs text-muted-foreground backdrop-blur">
              <Sparkles className="h-3 w-3 text-primary" />
              {t("home.badge")}
            </div>
            <h1 className="text-balance text-5xl font-semibold leading-[1.05] tracking-tight sm:text-6xl lg:text-7xl">
              {t("home.h1.a")}{" "}
              <span className="text-gradient">{t("home.h1.b")}</span>
            </h1>
            <p className="mt-6 max-w-xl text-lg leading-relaxed text-muted-foreground">
              {t("home.sub")}
            </p>
            <div className="mt-10 flex flex-col gap-3 sm:flex-row">
              <Button asChild size="lg" className="bg-glow text-primary-foreground shadow-glow hover:opacity-95">
                <Link to="/auth">
                  {t("home.cta.create")}
                  <ArrowRight className="ml-1 h-4 w-4" />
                </Link>
              </Button>
              <Button asChild size="lg" variant="ghost" className="border border-border">
                <Link to="/$username" params={{ username: "example" }}>{t("home.cta.example")}</Link>
              </Button>
            </div>
          </div>

          <div className="animate-float">
            <HeroVisual />
          </div>
        </section>

        <section className="mt-32 grid gap-6 sm:grid-cols-3">
          {[
            { icon: Gift, title: t("home.f1.title"), body: t("home.f1.body") },
            { icon: Lock, title: t("home.f2.title"), body: t("home.f2.body") },
            { icon: Sparkles, title: t("home.f3.title"), body: t("home.f3.body") },
          ].map(({ icon: Icon, title, body }) => (
            <div key={title} className="rounded-2xl border border-border bg-card/60 p-6 backdrop-blur">
              <div className="grid h-9 w-9 place-items-center rounded-lg bg-secondary text-primary">
                <Icon className="h-4 w-4" />
              </div>
              <h3 className="mt-4 text-base font-medium">{title}</h3>
              <p className="mt-1 text-sm text-muted-foreground">{body}</p>
            </div>
          ))}
        </section>
      </main>
    </div>
  );
}

function HeroVisual() {
  const t = useT();
  return (
    <div className="relative mx-auto aspect-square w-full max-w-md">
      <div className="absolute inset-0 rounded-[2rem] border border-border bg-card/70 p-6 shadow-soft backdrop-blur">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-glow shadow-glow" />
            <div>
              <div className="text-sm font-medium">alex</div>
              <div className="text-xs text-muted-foreground">{t("home.hero.turns", { days: 12 })}</div>
            </div>
          </div>
          <div className="rounded-full bg-secondary px-2.5 py-1 text-[10px] text-muted-foreground">12d : 04h : 22m</div>
        </div>
        <div className="mt-6 space-y-3">
          {[0, 1, 2, 3].map((i) => (
            <div key={i} className="flex items-center gap-3 rounded-xl border border-border bg-secondary/60 px-4 py-3">
              <Lock className="h-3.5 w-3.5 text-muted-foreground" />
              <div className="h-2 flex-1 rounded bg-muted" />
              <div className="text-[10px] text-muted-foreground">{t("home.hero.sealed")}</div>
            </div>
          ))}
        </div>
        <div className="mt-6 rounded-xl bg-glow p-4 text-center text-sm font-medium text-primary-foreground shadow-glow">
          {t("home.hero.waiting", { n: 24 })}
        </div>
      </div>
    </div>
  );
}
