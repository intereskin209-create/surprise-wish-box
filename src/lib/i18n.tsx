import { createContext, useContext, useEffect, useState, type ReactNode } from "react";

export type Lang = "en" | "ru";

type Dict = Record<string, string | ((vars: Record<string, string | number>) => string)>;

const en: Dict = {
  "nav.signin": "Sign in",
  "nav.createYours": "Create yours",
  "lang.label": "Language",

  "home.badge": "Your most personal day, made unforgettable",
  "home.h1.a": "Collect birthday wishes all year.",
  "home.h1.b": "Open them on your birthday.",
  "home.sub": "Create your birthday page and receive surprise messages from friends. Every wish stays sealed until your big day — then opens all at once.",
  "home.cta.create": "Create birthday page",
  "home.cta.example": "View example",
  "home.f1.title": "Create your page",
  "home.f1.body": "Pick a username, your birthday, an avatar. Done in 30 seconds.",
  "home.f2.title": "Friends leave wishes",
  "home.f2.body": "Share a single link. Every wish stays sealed until your day.",
  "home.f3.title": "The reveal",
  "home.f3.body": "On your birthday, everything opens at once. All at the same time.",
  "home.hero.turns": ({ days }) => `Turns 28 in ${days} days`,
  "home.hero.sealed": "Sealed",
  "home.hero.waiting": ({ n }) => `${n} wishes waiting to be opened`,

  "meta.home.title": "Wishly — Collect birthday wishes. Open them on your birthday.",
  "meta.home.desc": "Create your birthday page and receive surprise messages from friends. All wishes stay locked until your big day.",

  "countdown.days": "days",
  "countdown.hours": "hours",
  "countdown.min": "min",
  "countdown.sec": "sec",

  "profile.birthdayOn": ({ date }) => `Birthday ${date}`,
  "profile.copied": "Link copied",
  "profile.waiting": ({ n, word }) => `${n} ${word} waiting to be opened`,
  "profile.wish.one": "wish",
  "profile.wish.many": "wishes",
  "profile.sealedUntil": ({ date }) => `Sealed until ${date}`,
  "profile.leaveWish": "Leave a wish",
  "profile.shareNote": ({ name }) => `Share the link above — every wish stays sealed until ${name}'s big day.`,
  "wall.title": "Sealed wishes",
  "wall.count": ({ n }) => `${n}`,
  "wall.empty": "Be the first to leave a wish.",
  "wall.more": ({ n }) => `+${n} more sealed`,
  "wall.cardAlt": "Sealed wish",
  "profile.notFound.title": "No one here yet",
  "profile.notFound.body": "This username hasn't claimed their birthday page.",
  "profile.notFound.claim": "Claim it",
  "profile.loadFail": "Could not load this page.",

  "reveal.title": "Happy Birthday",
  "reveal.sub": ({ n, word }) => `${n} ${word} from people who love you.`,
  "reveal.opening": "Opening wishes…",
  "reveal.empty": "No wishes yet — but the day is still young.",
  "reveal.btn.wished": "You wished them",
  "reveal.btn.wish": "Happy Birthday",
  "reveal.tapCount": ({ n, name, word }) => `${n} ${word} wished ${name} a happy birthday.`,
  "reveal.person.one": "person",
  "reveal.person.many": "people",
  "reveal.tapFail": "Could not save tap",

  "wish.title": ({ name }) => `Leave a wish for ${name}`,
  "wish.sub": ({ date }) => `It stays sealed until their birthday on ${date}.`,
  "wish.name": "Your name",
  "wish.message": "Message",
  "wish.messagePlaceholder": "Say something they'll want to read on the morning of their birthday…",
  "wish.photo": "Photo (optional)",
  "wish.attach": "Attach photos",
  "wish.photosHint": ({ n, max }) => `${n} of ${max} photos`,
  "wish.photosMax": ({ max }) => `You can attach up to ${max} photos`,
  "wish.remove": "Remove",
  "wish.submit": "Seal my wish",
  "wish.submitting": "Sealing your wish…",
  "wish.preview": "Preview",
  "wish.previewTitle": "Ready to seal?",
  "wish.previewSub": "Check it over — once sealed, you can't edit it.",
  "wish.edit": "Edit",
  "wish.confirmSeal": "Seal it",
  "wish.required": "Add your name and a message",
  "wish.fail": "Could not save wish",
  "wish.sealed.title": "Sealed",
  "wish.sealed.body": ({ name, date }) => `Your wish has been saved and will be revealed on ${name}'s birthday (${date}).`,
  "wish.sealed.another": "Leave another wish",
  "wish.sealed.back": ({ name }) => `Back to ${name}'s page`,
  "wish.notFound": "Profile not found.",
  "wish.meta.title": ({ name }) => `Leave a wish for ${name} — Wishly`,

  "auth.title": "Create your birthday page",
  "auth.sub": "Sign in with Google to claim your username.",
  "auth.google": "Continue with Google",
  "auth.signingIn": "Signing in…",
  "auth.disclaimer": "By continuing you agree to be wished a happy birthday.",
  "auth.fail": "Sign-in failed",
  "auth.meta.title": "Sign in — Wishly",
  "auth.meta.desc": "Sign in to create your Wishly birthday page.",

  "create.title": "Create your birthday page",
  "create.sub": "This is where your friends will leave wishes.",
  "create.avatar": "Avatar",
  "create.avatarHint": "Optional, but recommended.",
  "create.username": "Username",
  "create.birthday": "Birthday",
  "create.submit": "Create my birthday page",
  "create.submitting": "Creating…",
  "create.errShort": "Pick a longer username",
  "create.errBday": "Choose your birthday",
  "create.errTaken": "That username is taken",
  "create.errFail": "Could not create page",
  "create.meta.title": "Create your birthday page — Wishly",

  "example.badge": "This is a demo page",
  "example.locked": "Locked view",
  "example.revealed": "Birthday reveal",
  "example.sealedNote": "Wishes stay sealed until the big day — then open all at once.",
  "example.demoNote": "This is a preview. Create your own page to start collecting real wishes.",
};

const ru: Dict = {
  "nav.signin": "Войти",
  "nav.createYours": "Создать свою",
  "lang.label": "Язык",

  "home.badge": "Самый личный день, ставший незабываемым",
  "home.h1.a": "Собирайте поздравления весь год.",
  "home.h1.b": "Откройте их в свой день рождения.",
  "home.sub": "Создайте страницу дня рождения и получайте сюрприз-послания от друзей. Каждое поздравление остаётся запечатанным до вашего дня — и открывается всё сразу.",
  "home.cta.create": "Создать страницу",
  "home.cta.example": "Посмотреть пример",
  "home.f1.title": "Создайте страницу",
  "home.f1.body": "Выберите имя, дату рождения и аватар. Готово за 30 секунд.",
  "home.f2.title": "Друзья оставляют поздравления",
  "home.f2.body": "Поделитесь одной ссылкой. Каждое поздравление запечатано до вашего дня.",
  "home.f3.title": "Открытие",
  "home.f3.body": "В день рождения всё открывается одновременно.",
  "home.hero.turns": ({ days }) => `28 лет через ${days} дн.`,
  "home.hero.sealed": "Запечатано",
  "home.hero.waiting": ({ n }) => `${n} поздравлений ждут открытия`,

  "meta.home.title": "Wishly — Собирайте поздравления. Открывайте в день рождения.",
  "meta.home.desc": "Создайте свою страницу дня рождения и получайте сюрприз-послания от друзей. Все поздравления заперты до вашего дня.",

  "countdown.days": "дн.",
  "countdown.hours": "ч.",
  "countdown.min": "мин.",
  "countdown.sec": "сек.",

  "profile.birthdayOn": ({ date }) => `День рождения — ${date}`,
  "profile.copied": "Ссылка скопирована",
  "profile.waiting": ({ n, word }) => `${n} ${word} ждут открытия`,
  "profile.wish.one": "поздравление",
  "profile.wish.many": "поздравлений",
  "profile.sealedUntil": ({ date }) => `Запечатано до ${date}`,
  "profile.leaveWish": "Оставить поздравление",
  "profile.shareNote": ({ name }) => `Поделитесь ссылкой выше — каждое поздравление запечатано до большого дня @${name}.`,
  "wall.title": "Запечатанные поздравления",
  "wall.count": ({ n }) => `${n}`,
  "wall.empty": "Будьте первым, кто оставит поздравление.",
  "wall.more": ({ n }) => `+${n} ещё запечатано`,
  "wall.cardAlt": "Запечатанное поздравление",
  "profile.notFound.title": "Здесь пока никого",
  "profile.notFound.body": "Это имя пользователя ещё не занято.",
  "profile.notFound.claim": "Занять",
  "profile.loadFail": "Не удалось загрузить страницу.",

  "reveal.title": "С днём рождения",
  "reveal.sub": ({ n, word }) => `${n} ${word} от тех, кто тебя любит.`,
  "reveal.opening": "Открываем поздравления…",
  "reveal.empty": "Поздравлений пока нет — но день только начинается.",
  "reveal.btn.wished": "Вы поздравили",
  "reveal.btn.wish": "Поздравить",
  "reveal.tapCount": ({ n, name, word }) => `${n} ${word} поздравили @${name} с днём рождения.`,
  "reveal.person.one": "человек",
  "reveal.person.many": "людей",
  "reveal.tapFail": "Не удалось сохранить",

  "wish.title": ({ name }) => `Поздравление для ${name}`,
  "wish.sub": ({ date }) => `Оно останется запечатанным до дня рождения ${date}.`,
  "wish.name": "Ваше имя",
  "wish.message": "Сообщение",
  "wish.messagePlaceholder": "Напишите то, что захочется прочитать утром дня рождения…",
  "wish.photo": "Фото (по желанию)",
  "wish.attach": "Добавить фото",
  "wish.photosHint": ({ n, max }) => `${n} из ${max} фото`,
  "wish.photosMax": ({ max }) => `Можно добавить до ${max} фото`,
  "wish.remove": "Убрать",
  "wish.submit": "Запечатать поздравление",
  "wish.submitting": "Запечатываем…",
  "wish.preview": "Предпросмотр",
  "wish.previewTitle": "Готовы запечатать?",
  "wish.previewSub": "Проверьте — после запечатывания изменить нельзя.",
  "wish.edit": "Изменить",
  "wish.confirmSeal": "Запечатать",
  "wish.required": "Укажите имя и сообщение",
  "wish.fail": "Не удалось сохранить поздравление",
  "wish.sealed.title": "Запечатано",
  "wish.sealed.body": ({ name, date }) => `Ваше поздравление сохранено и откроется в день рождения ${name} (${date}).`,
  "wish.sealed.another": "Оставить ещё одно",
  "wish.sealed.back": ({ name }) => `Вернуться на страницу ${name}`,
  "wish.notFound": "Профиль не найден.",
  "wish.meta.title": ({ name }) => `Поздравление для ${name} — Wishly`,

  "auth.title": "Создайте свою страницу дня рождения",
  "auth.sub": "Войдите через Google, чтобы занять имя пользователя.",
  "auth.google": "Продолжить с Google",
  "auth.signingIn": "Входим…",
  "auth.disclaimer": "Продолжая, вы соглашаетесь принимать поздравления.",
  "auth.fail": "Не удалось войти",
  "auth.meta.title": "Вход — Wishly",
  "auth.meta.desc": "Войдите, чтобы создать страницу дня рождения Wishly.",

  "create.title": "Создайте свою страницу",
  "create.sub": "Здесь друзья будут оставлять поздравления.",
  "create.avatar": "Аватар",
  "create.avatarHint": "По желанию, но мы рекомендуем.",
  "create.username": "Имя пользователя",
  "create.birthday": "Дата рождения",
  "create.submit": "Создать страницу",
  "create.submitting": "Создаём…",
  "create.errShort": "Выберите имя подлиннее",
  "create.errBday": "Укажите дату рождения",
  "create.errTaken": "Это имя уже занято",
  "create.errFail": "Не удалось создать страницу",
  "create.meta.title": "Создание страницы — Wishly",

  "example.badge": "Это демо-страница",
  "example.locked": "Запечатано",
  "example.revealed": "День рождения",
  "example.sealedNote": "Поздравления остаются запечатанными до большого дня — и открываются все сразу.",
  "example.demoNote": "Это предпросмотр. Создайте свою страницу, чтобы получать настоящие поздравления.",
};

const dicts: Record<Lang, Dict> = { en, ru };

const I18nCtx = createContext<{ lang: Lang; setLang: (l: Lang) => void; t: (k: string, vars?: Record<string, string | number>) => string }>({
  lang: "en",
  setLang: () => {},
  t: (k) => k,
});

const STORAGE_KEY = "wishly_lang";

function detectInitial(): Lang {
  if (typeof window === "undefined") return "en";
  const saved = localStorage.getItem(STORAGE_KEY);
  if (saved === "en" || saved === "ru") return saved;
  const nav = navigator.language?.toLowerCase() ?? "";
  return nav.startsWith("ru") ? "ru" : "en";
}

export function I18nProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>("en");

  useEffect(() => {
    const initial = detectInitial();
    setLangState(initial);
    if (typeof document !== "undefined") document.documentElement.lang = initial;
  }, []);

  function setLang(l: Lang) {
    setLangState(l);
    if (typeof window !== "undefined") {
      localStorage.setItem(STORAGE_KEY, l);
      document.documentElement.lang = l;
    }
  }

  function t(key: string, vars?: Record<string, string | number>): string {
    const dict = dicts[lang] ?? en;
    const val = dict[key] ?? en[key] ?? key;
    if (typeof val === "function") return val(vars ?? {});
    return val;
  }

  return <I18nCtx.Provider value={{ lang, setLang, t }}>{children}</I18nCtx.Provider>;
}

export function useI18n() {
  return useContext(I18nCtx);
}

export function useT() {
  return useContext(I18nCtx).t;
}