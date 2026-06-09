import { createFileRoute } from "@tanstack/react-router";
import { Link } from "@tanstack/react-router";
import { Lock, Sparkles, Gift, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

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
  return (
    <div className="min-h-screen bg-hero">
      <header className="mx-auto flex max-w-6xl items-center justify-between px-6 py-6">
        <Link to="/" className="flex items-center gap-2 text-lg font-semibold tracking-tight">
          <span className="grid h-8 w-8 place-items-center rounded-xl bg-glow text-primary-foreground shadow-glow">
            <Gift className="h-4 w-4" />
          </span>
          Wishly
        </Link>
        <Link to="/auth" className="text-sm text-muted-foreground transition-colors hover:text-foreground">
          Sign in
        </Link>
      </header>

      <main className="mx-auto max-w-6xl px-6 pt-12 pb-24 sm:pt-20">
        <section className="grid items-center gap-16 lg:grid-cols-[1.1fr_1fr]">
          <div className="animate-fade-up">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-border bg-card/50 px-3 py-1 text-xs text-muted-foreground backdrop-blur">
              <Sparkles className="h-3 w-3 text-primary" />
              Your most personal day, made unforgettable
            </div>
            <h1 className="text-balance text-5xl font-semibold leading-[1.05] tracking-tight sm:text-6xl lg:text-7xl">
              Collect birthday wishes all year.{" "}
              <span className="text-gradient">Open them on your birthday.</span>
            </h1>
            <p className="mt-6 max-w-xl text-lg leading-relaxed text-muted-foreground">
              Create your birthday page and receive surprise messages from friends.
              Every wish stays sealed until your big day — then opens all at once.
            </p>
            <div className="mt-10 flex flex-col gap-3 sm:flex-row">
              <Button asChild size="lg" className="bg-glow text-primary-foreground shadow-glow hover:opacity-95">
                <Link to="/auth">
                  Create birthday page
                  <ArrowRight className="ml-1 h-4 w-4" />
                </Link>
              </Button>
              <Button asChild size="lg" variant="ghost" className="border border-border">
                <Link to="/$username" params={{ username: "example" }}>View example</Link>
              </Button>
            </div>
          </div>

          <div className="animate-float">
            <HeroVisual />
          </div>
        </section>

        <section className="mt-32 grid gap-6 sm:grid-cols-3">
          {[
            { icon: Gift, title: "Create your page", body: "Pick a username, your birthday, an avatar. Done in 30 seconds." },
            { icon: Lock, title: "Friends leave wishes", body: "Share a single link. Every wish stays sealed until your day." },
            { icon: Sparkles, title: "The reveal", body: "On your birthday, everything opens at once. All at the same time." },
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
  return (
    <div className="relative mx-auto aspect-square w-full max-w-md">
      <div className="absolute inset-0 rounded-[2rem] border border-border bg-card/70 p-6 shadow-soft backdrop-blur">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-glow shadow-glow" />
            <div>
              <div className="text-sm font-medium">alex</div>
              <div className="text-xs text-muted-foreground">Turns 28 in 12 days</div>
            </div>
          </div>
          <div className="rounded-full bg-secondary px-2.5 py-1 text-[10px] text-muted-foreground">12d : 04h : 22m</div>
        </div>
        <div className="mt-6 space-y-3">
          {[0, 1, 2, 3].map((i) => (
            <div key={i} className="flex items-center gap-3 rounded-xl border border-border bg-secondary/60 px-4 py-3">
              <Lock className="h-3.5 w-3.5 text-muted-foreground" />
              <div className="h-2 flex-1 rounded bg-muted" />
              <div className="text-[10px] text-muted-foreground">Sealed</div>
            </div>
          ))}
        </div>
        <div className="mt-6 rounded-xl bg-glow p-4 text-center text-sm font-medium text-primary-foreground shadow-glow">
          24 wishes waiting to be opened
        </div>
      </div>
    </div>
  );
}
