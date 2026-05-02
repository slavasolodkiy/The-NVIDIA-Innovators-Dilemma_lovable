## The NVIDIA Innovator's Dilemma — Mobile Glitch App

A mobile-first, installable PWA reimagining of dram.gold. Heavy cyberpunk-glitch aesthetic, end-to-end multilingual, with a chapter-based quiz layered on top of the book's full Q&A content.

---

### 1. Visual direction (heavy glitch, mobile-first)

Keeps the source palette — cream `#F0E8D5`, ink `#181818`, orange `#FF5500`, lime `#9FE600` — and amplifies it:

- RGB-split hover/tap on headings, scanline overlay on the cover, CRT flicker on accents
- Text-scramble decode animation on every section title (settles into the final word)
- Glitch-bar marquee ticker between sections (`$5T // 75% MARGIN // CRACK_03 // …`)
- Animated noise canvas behind the hero, masked to keep readability
- Tap-pulse + chromatic aberration on every button
- Reduced-motion query honored — drops to subtle fade for accessibility

Typography mirrors the source: Inter (body/display), JetBrains Mono (UI), DotGothic16 (DILEMMA logotype glow).

---

### 2. Screen-by-screen structure

Single scrolling app with a sticky bottom tab bar (`BOOK · Q&A · QUIZ · LISTEN · BUY`) and a top status strip (`TE_MANUAL.1.5 // STRATEGIC // [LANG: EN]`).

```text
┌────────────────────────────┐
│ TE_MANUAL.1.5  [LANG ▾]   │  ← sticky top, language switcher
├────────────────────────────┤
│  [book.png cover, glitch]  │
│  THE NVIDIA                │
│  INNOVATOR'S               │
│  DILEMMA  (animated)       │
│  Slava Solodkiy            │
│  [BUY] [LISTEN] [READ Q&A] │
├────────────────────────────┤
│  THESIS — twin voice cards │
│  swipeable: OFFICIAL ⇄     │
│  SELF-IRONIC               │
├────────────────────────────┤
│  5 CRACKS  (horizontal     │
│  snap-scroll cards)        │
├────────────────────────────┤
│  5 PILLARS (dark cards)    │
├────────────────────────────┤
│  PROJECT LOGO badge        │
│  (NVIDIA-Innovators-       │
│  Dilemma_logo.png)         │
├────────────────────────────┤
│  WATCH · LISTEN            │
│  embeds: SlideShare,       │
│  Figshare, Spotify, Apple, │
│  YouTube                   │
├────────────────────────────┤
│  Q&A — searchable accordion│
│  (full .docx parsed)       │
├────────────────────────────┤
│  QUIZ — chapter levels     │
├────────────────────────────┤
│  BUY — 11 stores grid      │
├────────────────────────────┤
│  FOOTER + colophon         │
└────────────────────────────┘
```

Project logo (`NVIDIA-Innovators-Dilemma_logo.png`) appears as: (a) a glitching badge anchoring the hero corner, and (b) the splash screen / PWA install icon.

---

### 3. Buy section — all 11 stores

Grid of tappable store tiles, each with glitch-on-tap:
Amazon US · Amazon UK · eBay UK · Apple Books · Barnes & Noble · Kobo · Everand · Bookshop.org · Thalia · Smashwords · books2read (universal).

---

### 4. Watch · Listen — embedded

Lazy-loaded iframes for SlideShare deck and Figshare PDF. Native cards (open externally) for Spotify episode, Apple Podcasts episode, and the YouTube short — with inline YouTube embed for the video.

---

### 5. Q&A section (parsed from the .docx)

The uploaded `The_NVIDIA_Innovator_s_Dilemma_Q_A.docx` is parsed at build time into structured JSON (question / answer / chapter tag). Rendered as a searchable, filterable accordion with:

- Search box (matches question + answer text)
- Chapter chips to filter
- Each open answer has a "Test me on this →" button that jumps into the quiz filtered to that chapter

---

### 6. Multi-level chapter-based quiz

- One level per chapter / theme of the book (~10–15 levels)
- 5 multiple-choice questions per level, generated from the book + Q&A content
- XP, streak counter, badge unlocks (`CRACK_01 SOLVED`, `PILLAR_III MASTERED`, `CUDA_LEAK DECODED`)
- Glitch-reveal on correct answer, RGB-split shake on wrong
- Progress saved to `localStorage` (per language)
- End-of-level share card ("I scored 5/5 on CRACK_03 →") with deep link

---

### 7. End-to-end localization (11 languages)

Languages: English (default), German, French, Italian, Spanish, Portuguese, Chinese (Simplified), Japanese, Korean, Russian, Ukrainian.

- Top-bar language switcher (flag-free, ISO codes: `EN DE FR IT ES PT ZH JA KO RU UK`)
- All UI strings, thesis copy, cracks, pillars, FAQ, Q&A, quiz questions, store labels — translated
- Translation pipeline: AI Gateway batch-translates one canonical English JSON → 10 locale JSONs, committed to repo (no runtime API calls)
- Selection persists in `localStorage`; auto-detects browser language on first visit
- `<html lang>` updates per selection; meta tags localized

---

### 8. PWA / installable

- `manifest.json` with name, short_name, theme color (`#181818`), background (`#F0E8D5`), icons derived from the project logo
- Splash screen reuses the glitch logo
- Offline cache for shell + book cover + translations + Q&A JSON (network-first for embeds)
- Installable on iOS/Android home screens
- Note: PWA features only fully active in the published deployment, not the editor preview

---

### 9. Technical notes

- TanStack Start single page (`/`) with internal section routing — content is one long mobile scroll, no hash-only nav for SEO since this is an app shell
- Animations via CSS + small custom hooks; framer-motion for swipe cards
- Glitch effects: pure CSS keyframes + a lightweight noise canvas; throttled on `prefers-reduced-motion`
- Q&A parsed once via a build script (`scripts/parse-qa.ts`) → `src/content/qa.en.json` → batch translated
- All assets copied into `src/assets/` (book cover, project logo)
- `vite-plugin-pwa` configured with iframe-safe registration guard

---

### Out of scope (call out before building)

- No native iOS/Android binaries (PWA install only)
- No user accounts / cloud sync — quiz progress is per-device
- Embedded SlideShare/Figshare iframes require network; they won't work offline (handled gracefully with a "tap to load" fallback)