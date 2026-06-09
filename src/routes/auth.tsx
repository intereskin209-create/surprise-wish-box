import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Gift } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { lovable } from "@/integrations/lovable";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/auth")({
  ssr: false,
  component: AuthPage,
  head: () => ({
    meta: [
      { title: "Sign in — Wishly" },
      { name: "description", content: "Sign in to create your Wishly birthday page." },
    ],
  }),
});

function AuthPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    supabase.auth.getUser().then(async ({ data }) => {
      if (!data.user) return;
      const { data: profile } = await supabase
        .from("profiles")
        .select("username")
        .eq("id", data.user.id)
        .maybeSingle();
      if (profile?.username) {
        navigate({ to: "/$username", params: { username: profile.username } });
      } else {
        navigate({ to: "/create" });
      }
    });
  }, [navigate]);

  async function signInGoogle() {
    setLoading(true);
    const result = await lovable.auth.signInWithOAuth("google", {
      redirect_uri: window.location.origin + "/auth",
    });
    if (result.error) {
      toast.error("Sign-in failed", { description: String(result.error.message ?? result.error) });
      setLoading(false);
      return;
    }
    if ((result as { redirected?: boolean }).redirected) return;
    // Session set — re-check
    const { data } = await supabase.auth.getUser();
    if (!data.user) {
      setLoading(false);
      return;
    }
    const { data: profile } = await supabase
      .from("profiles")
      .select("username")
      .eq("id", data.user.id)
      .maybeSingle();
    if (profile?.username) navigate({ to: "/$username", params: { username: profile.username } });
    else navigate({ to: "/create" });
  }

  return (
    <div className="min-h-screen bg-hero">
      <div className="mx-auto flex max-w-6xl items-center px-6 py-6">
        <Link to="/" className="flex items-center gap-2 text-lg font-semibold tracking-tight">
          <span className="grid h-8 w-8 place-items-center rounded-xl bg-glow text-primary-foreground shadow-glow">
            <Gift className="h-4 w-4" />
          </span>
          Wishly
        </Link>
      </div>
      <main className="mx-auto flex max-w-md flex-col items-center px-6 pt-24 text-center">
        <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">Create your birthday page</h1>
        <p className="mt-3 text-muted-foreground">Sign in with Google to claim your username.</p>
        <Button
          size="lg"
          onClick={signInGoogle}
          disabled={loading}
          className="mt-10 w-full bg-glow text-primary-foreground shadow-glow hover:opacity-95"
        >
          {loading ? "Signing in…" : "Continue with Google"}
        </Button>
        <p className="mt-6 text-xs text-muted-foreground">By continuing you agree to be wished a happy birthday.</p>
      </main>
    </div>
  );
}