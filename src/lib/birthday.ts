export function isBirthdayToday(birthdayISO: string): boolean {
  const b = new Date(birthdayISO + "T00:00:00Z");
  const now = new Date();
  return (
    b.getUTCMonth() === now.getUTCMonth() && b.getUTCDate() === now.getUTCDate()
  );
}

export function nextBirthdayDate(birthdayISO: string): Date {
  const b = new Date(birthdayISO + "T00:00:00Z");
  const now = new Date();
  const year = now.getUTCFullYear();
  let next = new Date(Date.UTC(year, b.getUTCMonth(), b.getUTCDate()));
  if (next.getTime() < Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate())) {
    next = new Date(Date.UTC(year + 1, b.getUTCMonth(), b.getUTCDate()));
  }
  return next;
}

export function formatBirthday(birthdayISO: string): string {
  const b = new Date(birthdayISO + "T00:00:00Z");
  return b.toLocaleDateString(undefined, {
    month: "long",
    day: "numeric",
    timeZone: "UTC",
  });
}

export function getVisitorId(): string {
  if (typeof window === "undefined") return "ssr";
  const KEY = "wishly_visitor_id";
  let id = localStorage.getItem(KEY);
  if (!id) {
    id = crypto.randomUUID();
    localStorage.setItem(KEY, id);
  }
  return id;
}