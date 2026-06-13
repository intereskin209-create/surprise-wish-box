## Wall of Congratulations — Plan

Add a visible wall on the profile page (`/$username`) before the birthday that proves wishes are stacking up, without breaking the reveal moment. Each submitted wish appears as a sealed card — no names, no content. On the birthday, the existing reveal view opens the cards.

### Behavior

- Shown on the profile page, inside the existing `LockedView` (below the countdown, above the "Leave a wish" CTA).
- Visible to everyone, including the owner. Owner cannot peek — the reveal stays sacred.
- One sealed card per submitted wish. We already fetch the wish count; we render N cards from it.
- Empty state: a single subtle placeholder card with copy like "Be the first to leave a wish."
- Cap visible cards (e.g. 24) and show "+N more sealed wishes" when count exceeds the cap, to keep layout calm.
- Subtle stagger fade-in as cards mount. Light shimmer on hover. No content leakage on hover/click.

### Visual direction

- Stays inside the existing premium dark aesthetic (Apple/Linear/Notion).
- Each card: small rounded square in a responsive grid (e.g. 4 cols desktop, 3 tablet, 2 mobile), `bg-card/60`, `border-border`, soft inner glow, lock or sealed-envelope icon centered, faint wax-seal accent in the brand glow color. No rainbow, no cartoon.
- Section header above the grid: small uppercase eyebrow ("Sealed wishes") + count.

### Files to change

- `src/routes/$username.tsx` — add a new `SealedWall` component, render it inside `LockedView` between the countdown card and the "Leave a wish" button. No change to `RevealView` (it already opens the real wishes).
- `src/lib/i18n.tsx` — add translation keys for the wall: `wall.title`, `wall.count`, `wall.empty`, `wall.more`, `wall.cardAlt` (EN + RU).

### What is NOT changing

- No DB schema, RLS, or policy changes. The existing wish count query in `LockedView` already provides what we need; owner still cannot read message content before the birthday.
- No new routes, no new RPC.
- Reveal flow on birthday day is untouched.

### Open detail (will pick a sensible default unless you push back)

- Visible cap: 24 cards, then "+N more". If you want all of them shown, say so.
