import { useEffect, useState } from "react";
import { nextBirthdayDate } from "@/lib/birthday";

export function Countdown({ birthdayISO }: { birthdayISO: string }) {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(t);
  }, []);
  const target = nextBirthdayDate(birthdayISO).getTime();
  const diff = Math.max(0, target - now);
  const days = Math.floor(diff / 86400000);
  const hours = Math.floor((diff / 3600000) % 24);
  const mins = Math.floor((diff / 60000) % 60);
  const secs = Math.floor((diff / 1000) % 60);
  const cells = [
    { label: "days", v: days },
    { label: "hours", v: hours },
    { label: "min", v: mins },
    { label: "sec", v: secs },
  ];
  return (
    <div className="grid grid-cols-4 gap-2 sm:gap-3">
      {cells.map((c) => (
        <div key={c.label} className="rounded-xl border border-border bg-card/60 px-2 py-3 text-center backdrop-blur">
          <div className="text-2xl font-semibold tabular-nums sm:text-3xl">{String(c.v).padStart(2, "0")}</div>
          <div className="mt-1 text-[10px] uppercase tracking-wider text-muted-foreground">{c.label}</div>
        </div>
      ))}
    </div>
  );
}