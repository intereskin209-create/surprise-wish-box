import { useI18n, type Lang } from "@/lib/i18n";

export function LanguageSwitcher() {
  const { lang, setLang } = useI18n();
  const opts: { v: Lang; label: string }[] = [
    { v: "en", label: "EN" },
    { v: "ru", label: "RU" },
  ];
  return (
    <div className="inline-flex items-center rounded-full border border-border bg-card/60 p-0.5 text-xs backdrop-blur">
      {opts.map((o) => (
        <button
          key={o.v}
          onClick={() => setLang(o.v)}
          className={`rounded-full px-2.5 py-1 transition-colors ${
            lang === o.v ? "bg-secondary text-foreground" : "text-muted-foreground hover:text-foreground"
          }`}
          aria-pressed={lang === o.v}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}