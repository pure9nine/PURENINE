# PURENINE site (2k27) — project notes

Portfolio site for **Thomas Klinger / PURENINE** (freelance creative director, UX/UI and visual designer, New York). Static front end only: plain HTML, CSS and vanilla JS. No build step, no frameworks, no dependencies, no database.

---

## Files

| Path | What it is |
|---|---|
| `index.html` | Homepage (all sections below) |
| `activision.html` | Activision case study (was `inner.html`, the project template). See "Project pages" below |
| `mlb.html` | Major League Baseball case study, cloned from `activision.html`. See "Project pages" below |
| `contact.html` | Contact page. See "Contact page" below |
| `studio.html` | Studio page. See "Studio page" below |
| `css/style.css` | All styles. Breakpoints: desktop ≥ 1200px · tablet 810–1199px · phone ≤ 809px. Page sections are at the end: Project pages, Contact page, Studio page |
| `css/fonts.css` | `@font-face` rules pointing at `assets/fonts/*.woff2` (switched from base64 on Oct 21, 2026 for PageSpeed). Every page preloads Inter Display 500/400 + Chivo Mono in `<head>`. Safari on `file://` shows fallback fonts — preview through a local server |
| `js/main.js` | All interactions, one IIFE, ES5 style (`var`, `function`), no dependencies |
| `assets/fonts/*.woff2` | The web font files, loaded by `fonts.css`. Only 400/500/700 exist — there is **no 600** |
| `assets/icons/client-*.svg` | Ticker logos in use: `activision`, `disney`, `fortnite`, `hubspot`, `marvel`, `mlb`, `nba`, `toast` (all from Wikimedia Commons, public domain, recolored to `#666666`, white cut-outs kept). Unused: `client-01…08.svg` (old placeholders), `client-history.svg` |
| `assets/icons/` (other) | Project logos shown on card hover (`logo-*.svg`; `logo-activision.svg` and `logo-mlb.svg` are white copies of the ticker logos — MLB's batter and ball are cut out with a mask), service icons (`service-visual/product/motion/dev.svg`), Audiomack metric icons (`metric-uploads` music note, `metric-listeners` waveform, `metric-app` App Store, `metric-paid` microphone; black, recolored from the originals) |
| `assets/images/services/` | Services box gradients: `visual-bg.jpg` (green), `product-bg.jpg` (peach), `motion-bg.jpg` (blue), `development-bg.jpg` (lavender) |
| `assets/images/press/` | Press thumbs: `fastcompany.jpg`, `forbes.jpg`, `billboard.jpg` (960×640) |
| `assets/images/quotes-bg.jpg` | Dark work-collage (1920×1080, 284.4px tile grid) behind the studio intro (no longer used by the homepage quotes) |
| `assets/images/audiomack/` | Audiomack card-shuffle images: `1920x1280-audiomack-a…d.jpg` (masters, also the fallback) + `.avif` copies (quality 55, made with `sips -s format avif -s formatOptions 55 <file>.jpg --out <file>.avif`) |
| `assets/images/` (other) | `showreel.jpg` (old showreel poster, **unused** since Oct 22, 2026), `project-*.jpg` (six placeholder card/case images used by the remaining homepage grid placeholders), `og-image.jpg` (social share image used in the SEO tags) |
| `assets/favicon/` | `favicon.jpg` (tab icon), `apple-touch-icon.png` (also the JSON-LD logo) |
| `assets/video/` | `preloader-signature.mp4` (loader signature), `hero-loop-01.mp4` (old showreel lightbox video, **unused** since Oct 22, 2026) |
| `portfolio/wall/` | Ring image **masters**: 1200×1500 JPGs (`1200x1500_<name>.jpg`, ~12 MB). Not loaded by the homepage. Also the Activision JSON-LD image |
| `portfolio/ring/` | What the ring actually loads: each project as a 600×750 **AVIF** (quality 55, `600x750_<name>.avif`, ~1.1 MB total) plus a JPG fallback (quality 75, `600x750_<name>.jpg`, ~3.4 MB). `#work-data` lists the `.jpg`; the ring swaps in the `.avif` and falls back to the `.jpg` if the browser can't show it. To add a project: put the master in `portfolio/wall/`, then run both `sips -z 750 600 -s format avif -s formatOptions 55 portfolio/wall/1200x1500_<name>.jpg --out portfolio/ring/600x750_<name>.avif` and `sips -z 750 600 -s format jpeg -s formatOptions 75 portfolio/wall/1200x1500_<name>.jpg --out portfolio/ring/600x750_<name>.jpg`, and add the `.jpg` to `#work-data` |
| `portfolio/<project>/` | Per-project images: `<project>-1200x1500.jpg` = homepage grid card (4:5), `<project>-1920x1280.jpg` = lead image on the project page. Folders: `activision/`, `mlb/` |
| `robots.txt`, `sitemap.xml`, `llms.txt` | SEO / AI-crawler files for https://www.purenine.com. Sitemap lists `/`, `activision.html`, `mlb.html`, `studio.html`, `contact.html`, `llms.txt` |

**Cache busting:** every CSS/JS link in the HTML files has `?v=NNN` (currently `?v=374`). Bump it in **all five** (`index.html`, `activision.html`, `mlb.html`, `contact.html`, `studio.html`) whenever CSS or JS changes. HTML-only changes don't need a bump.

---

## Design system

**Fonts**
- `--f-display`: Inter Display (400/500/700) — almost everything
- `--f-inter`: Inter 500 — metric numbers
- `--f-mono`: Chivo Mono 400 — small uppercase labels, numbers like `( _01 )`

**Colors**
- Text `#1e1e1e` (`--c-text`), muted `#5a6271` (`--c-muted`)
- Subtext grey `#777777` (section subtexts, journal hover)
- Brand green **`#ceeb21`** — underlines, hovers, pills, buttons, quote icon (`.t-accent` makes text green)
- Surface grey `#eef0f6` (`--c-surface`) — placeholder boxes, image backgrounds
- Borders `#d0d8e4` (`--c-border`)
- Footer / dark areas `#131313`
- Page background white

**Type scale** (`.t-h1` 70px · `.t-h2` 60px · `.t-h3` 48px · `.t-h4` 32px · `.t-h5` 24px · `.t-h6` 20px · `.t-body` 17.6px muted), all Inter Display 500 except body (400). Phone shrinks h1/h2/h3.

**Big centered headline style** — "hero lead" look: 56px (52 tablet, 36 phone), line-height 1.05, letter-spacing -0.03em, weight 500. Used by the hero lead, the homepage About headline, and every `.studio__title.t-h3` (Audiomack + Services headings).

**Recurring patterns**
- Section number labels: mono `( _01 )`, 68px column
- Green label pill: `.pill` — Chivo Mono 14px uppercase, `#ceeb21` fully rounded, 4px × 10px padding, 24px above the heading it labels
- Links with green underline: `.name-link` (3px `#ceeb21` underline, text turns green on hover)
- Small links beside/under a heading: `.head-link name-link` inside `.head-links` (2px underline, 7px offset, 52px apart)
- Pill button: `.btn` (dark, 64px tall / 56 phone, fully rounded, 20px / 18 phone, Inter Display 500, turns green on hover); `.btn--green` = green, turns white on hover (used on dark backgrounds)
- Big text link: `.projects__more-btn` (33px / 24 phone, 3px green underline) — "View more projects +"
- Mono label + big value: `.contact-address` (`.contact-address__label` mono uppercase muted, value `.t-h4`)
- Rounded corners: project cards 32px, Audiomack image box + quote panel + studio intro panel 40/32px, small thumbs 12px
- **Box shadow:** `0 24px 60px -20px rgba(0,0,0,.12)` on the services box (the homepage quote panel has **no shadow** since Oct 22, 2026); the studio intro panel uses the same at **25%** (reads better under the dark box)
- Scroll reveal: add `data-reveal` (optional `style="--delay:.1s"`, `="fade"` for no slide); `data-split` for word-by-word headlines. An element with both `.btn` and `data-reveal` keeps its hover transition (`.js .btn[data-reveal]`)
- **Logo fade:** the nav logo fades (and the hamburger gets its green disc) when it reaches the element marked `data-logo-stop`, else the homepage `.clock`. `FADE_GAP` 24px. Used on: homepage (clock), contact ("Get in touch" pill), studio (intro panel), activision (title). Body class `page-inner` would force the logo to stay — no page uses it now (its CSS rule was deleted Oct 21, 2026).
- **Section spacing:** `--section-gap: 240px` (in `:root`) between View more → Audiomack → services, except services → client notes is **160px** (`.notes` padding-top) and client notes → journal is **160px** (`.notes` padding-bottom); journal → footer is **160px** (`.journal` padding-bottom)

---

## Navigation (same on every page)

Logo top-left (desktop: 32px from top, 40px tall, so it ends at 72px; tablet/phone: centered in an 80px bar, ends at 60px), hamburger top-right. Full-screen dark menu: **Home / Projects / Studio (`studio.html`) / Contact (`contact.html`)**, then hello@purenine.com and LinkedIn / Instagram / Twitter. "Projects" links to `#about` (the About section, not the grid); `.intro` has a `scroll-margin-top` so it lands with **24px** above the "PURENINE is the design collective…" headline (desktop -96px, tablet -72px, phone -8px, matched to each breakpoint's top padding). On non-home pages Home and Projects link to `index.html#top` / `index.html#about`. Hamburger bars turn `#666666` on hover while the menu is closed (0.2s). Any menu link closes the menu.

**Contact links:** menu "Contact", footer "Contact" and the footer green logo badge all go to `contact.html`. Email links (menu email) stay `mailto:`.

---

## Homepage sections (top to bottom)

1. **Preloader** — black panel, phrases rise letter by letter: "UX / UI." → "Visual Design." → "Claude Code.", then the signature video plays (1.5× speed), then the panel swipes up. Skipped when arriving from another page of the site, on back/forward, or with reduced motion.
2. **Navigation** — see above; logo fades when it reaches the clock.
3. **Hero** — green pill "Experience Creativity" (24px above), centered headline "I bring ideas to life…" (hero lead style, max 850px) + subtext (fades in at **0.7s**, about halfway through the headline's word-by-word build). Desktop: hero `padding-top: 124px` → 100px between logo and pill. `.hero__content` gap 96px desktop → **80px** from subtext to the clock row. Clock `( h:mm PM NY )` and `LI / IG / X` row (moved up 16px via `top: -16px`).
4. **3D project ring** (`.ring`) — cards on the inside of a cylinder, drifting right to left; sideways swipe/drag/arrow keys turn it, vertical scroll always scrolls the page. 28 projects from the `#work-data` JSON (newest: School of Rock, `sor`) (images in `portfolio/ring/`, 600×750 AVIF with JPG fallback) (`t` title, `s` thumb), shuffled per load. Until the page's `load` event only the cards actually on screen get images, all at `fetchpriority="high"` (`onScreen()` in `initRing` works it out from radius/perspective/width; on phones the side cards appear largest and are the LCP element); the rest, and a warm-up of all images, follow after `load`. Cards turned away from the viewer also get `visibility: hidden` (their backs are already hidden by CSS, but Chrome counted their huge close-up boxes as the LCP element, which pushed LCP back every time one got an image). Cards 300×375 (phone 200×250), 40px radius. Desktop `margin-top: -66px` → middle card top 96px below the clock row.
   - **Ruler** below ("Scroll recent projects") follows user turning only, and is itself draggable/swipeable exactly like the cards (12px invisible grab area above and below).
   - Ring is edge to edge up to **1920px**, then capped and centered.
   - White edge fades (`.ring::before/::after`) appear **only at ≥ 1920px**. They are gradient overlays, **not masks** (masks made Chrome stutter).
5. **Intro / About** — "PURENINE is the design collective of Thomas Klinger…" in hero lead style (up to 850px, may extend past the 720px column), green-underlined name link to LinkedIn, subtext, client logo ticker (left-to-right): Activision, Disney, Fortnite, HubSpot, Marvel, MLB, NBA, Toast — alphabetical, `#666666`. Heights: wordmarks 26px, Marvel 30, MLB 34, Disney 36, NBA 48.
6. **Projects grid** — 3 columns desktop, **2 on tablet**, 1 on phone. 6 cards visible; **"View more projects +"** reveals 9 more (15 total). Hidden cards carry `data-more`; the button removes itself after clicking. Card 1 = **Activision** (→ `activision.html`), card 3 = **MLB** (→ `mlb.html`); the rest are placeholders linking to `activision.html`. Real cards show services under the title in the date slot (`.project__date`), e.g. "UX/UI, Visual Design, Production" / "Art Direction, UX/UI". Hover: image blurs 4px, a **40% black** layer (`.project__media::after`) fades in, and the white logo fades in on top (0.5s).
7. **Audiomack** (`#studio`, reuses the `.studio` classes) — centered: green pill "Co-Founder / CCO", heading "In 2013, I helped co-found Audiomack…" (Audiomack is a `.name-link` to the App Store page), subtext, then two centered `.head-link`s: "Visit Audiomack" (→ `audiomack.html`, not built yet) and "Download the app" (→ App Store page, new tab). 60px + 40px gap to the image box (`.reel`, `data-reel`), then 4 metrics: each has a 64px `#C8E611` circle (`.metric__icon`, 32px black icon + 16px padding, 16px above the number), the number in black, and the subtext in `#777777` (`.metric .t-body`); the row has 80px side padding. The box is a **card shuffle** of the 4 images in `assets/images/audiomack/` (`<picture>` slides, AVIF + JPG): every **3 seconds** (`initReel`) the current card (`.is-out`) sinks back (scale .86, fades to 40%) while the next (`.is-in`) rises over it from below, **0.7s** (`shuffle-out` / `shuffle-in`, transform + opacity only); then the next becomes `.is-active`. Only cycles while on screen, pauses in background tabs; reduced motion shows the first image only. Hover zooms the stage 3%. Picked Oct 22, 2026 over crossfade, push, green wipe, 8-bit pixels and equalizer strips (all removed). The old showreel video, play button and lightbox were removed.
8. **Services** — centered heading "I execute the ideas that build your business — from MVP to enterprise scale." + subtext; list starts 100px below the subtext. Then a hover list:
   - Rows: Visual / Product / Motion / Development, each with `( _0N )` number, big name, right-hand tag pill, description (`.t-h5`), and a mono detail line. First row has no top line and no top padding, so its text starts level with the box.
   - Name 72px desktop (64 tablet, 44 phone), weight 500, line-height 1.02, -0.045em. Closed rows `#777777`, open row `#1e1e1e`.
   - Tag pill: transparent on closed rows, **green `#ceeb21` fully-rounded pill** on the open row, black text.
   - Each row: 32px top/bottom padding; 8px name → description; 24px description → detail line.
   - Right side: 4:5 box (32px radius, soft drop shadow). Background is a **gradient per service** (`assets/images/services/*-bg.jpg`, on `.services__fill::before`) that **fades in over 0.5s** as rows open; the **200px icon** swaps **instantly**. Icons are **inlined SVGs** (copied from `assets/icons/service-*.svg`) with their parts wrapped in `px-*` groups so they animate in stepped 8-bit style (`steps(1, end)`, 1.52-unit = one art pixel): whole icon bobs (`icon-bob`); Visual dots chase + shape walks a square; Product corners pop out + text tool blinks; Motion equalizer bars flicker + antennas alternate; Development face blinks + keys chase. Only the showing icon animates; reduced motion stops it. Phone: box moves above the list.
   - Hover, tap or keyboard focus opens a row.
9. **Client notes** — panel same width/radius as the Audiomack image box, 160px padding inside (96px on phone), 160px above (from services) and 160px below (to press), **no shadow**. Background: flat **`#f4f4f4`** (the pale green drifting gradient and its `notes-glow` animation were removed Oct 22, 2026). On top: a black **100px pixel heart** (Streamline Pixel "heart-favorite", inlined) animated in the services 8-bit style — bobs (`heart-bob`, 4.75px = one art pixel), beats twice (`heart-beat`), shine pixels blink (`px-shine`); then a green `.pill` "Testimonials" (32px under the heart, 24px above the quote). Three quotes in dark text, rotating every **4 seconds** (pauses in background tabs); company in `.t-h5` with the role underneath in mono, muted. Quotes are stacked in one grid cell so the page never jumps.
10. **Press** (`.journal`) — heading "In the News"; 3 rows (Fast Company, Forbes, Billboard): `( _0N )` number, 150×100 image thumb (96×96 phone, `object-fit: cover`), then `.article__text`: the source as a mono uppercase muted eyebrow **4px above** the headline (all breakpoints), and the headline (40px desktop, 32 tablet, 24 phone; no max-width, fills the row — up to 1182px on desktop). **Nothing is clickable**: rows are `<div class="article">`, no hover. Phone hides the number. Under the list, a centered `.journal__cta` link "Have a project? Let's chat" → `contact.html`, in the "View more projects +" style (`.projects__more-btn`), 44px below the last row (32 phone).
11. **Footer** (same on every page) — dark, big "LET'S WORK TOGETHER" with green logo badge (→ `contact.html`), Instagram / Twitter / LinkedIn / Contact, ©2026 PURENINE Studios Inc.

---

## Other pages

**Project pages (`activision.html`, `mlb.html`)** — same template; to add one, clone `activision.html` and swap the SEO head, text, info list and image. Activision: own SEO head (title "Activision Case Study: Art Direction & Visual Design - Thomas Klinger", description, keywords, OG/Twitter, CreativeWork + WebPage + Breadcrumb + Person + ProfessionalService JSON-LD; author/publisher tags from the homepage). Homepage nav. Sticky info column (desktop sticks at 120px): title "Activision" (`data-logo-stop` — on desktop the logo only meets it at the end of the page because the column is sticky), intro text, info list: **Client / Agency / Services / Live URL** — labels Chivo Mono 14px uppercase muted, values 16px right-aligned, `--c-border` dividers, 18px row padding. "View Activision Blog" → https://blog.activision.com/ (new tab), regular weight, 2px green underline (5px offset), green on hover, no arrow. Then the image stack: the `*-1920x1280.jpg` lead image (inline `aspect-ratio: 1920 / 1280` so it isn't cropped, `fetchpriority="high"`), then a comment marking where more images go (the placeholder "Global Brand Transformation" story block was removed Oct 21, 2026; `.case__story` CSS is now unused) and the footer ("More projects" and the "Have a project in mind?" CTA were removed; their `.more` / `.cta` CSS was deleted Oct 21, 2026). **MLB:** title "Major League Baseball", client Major League Baseball, services UX/UI, Visual Design, Production, Live URL "View MLB.com" → https://www.mlb.com/, two-part intro (league description + deliverables). Agency is a placeholder "—". Page transitions: native cross-document View Transitions where supported, otherwise a white 0.4s fade.

**Contact page (`contact.html`)** — body class `page-contact`. Green pill "Get in touch" (`data-logo-stop`), headline "Got a project in mind? Let's chat and bring it to life." (`.t-h1`, max 600px), `LI / IG / X` on the right, divider line inset to the page margins (`.contact-hero__rule`, fades in with the rest). Below: **EMAIL** label + hello@purenine.com (`.mail-link t-h4`), 40px, **ADDRESS** label + "30 Old Kings Hwy S, Darien, CT 06820" (`.t-h4`). The message form is still in the HTML but **hidden** (`hidden` attribute; `.contact-form[hidden]`); when shown it opens the visitor's mail app (`initContactForm`, no backend). FAQ was removed.

**Studio page (`studio.html`)** — body class `page-studio`. Sections:
- **Intro panel** (`.studio-hero`, `data-logo-stop`): starts 40px below the logo (padding-top 112px desktop / 100px below), full height minus 16px (phone 4:5), 32px radius. Background `.studio-hero__bg` = `quotes-bg.jpg` sized as an exact 16:9 "cover" box with container units (`--bw`/`--bh` on the panel, `container-type: size`), **drifting** (`studio-drift`, 14s alternate, transform only) under a 30% dim, with **28 tile spans** (one per thumbnail, `--x/--y` in image px on a 284.4px grid) that **pop** (`tile-pop`, 4.5–7s each, negative delays, ~10 lit at once, scale up to 1.25 with shadow). 20% black layer on top. Reduced motion: still image, no tiles. Drop shadow at 25% black. Text: "PURENINE is the design collective of Thomas Klinger - a creative director, visual designer & product lead." (all white, no green), 48px (40 tablet, 28 phone), max 800px, builds in word by word (`data-split`, like the homepage hero). Subtext "I bring a proven track record…" (`.studio-hero__sub`, 19px, 70% white, max 600px, 16px under the title, fades in at .35s). Then a green `.btn btn--green` "Let's chat" → `contact.html` (fades in at .5s).
- **Client logos** — same ticker as the homepage.
- **Awards** — green pill "Digital Storytelling", heading "Creative partnerships.<br>Meaningful impact." (a `<br>` always puts "Meaningful impact." on its own line), list rows (name `.t-h5` left; year/role right in weight 500, `--c-text` black; phone stacks, year left under the name). The middle "award title" column was removed Oct 21, 2026 (its CSS deleted too).

---

## Browser / performance decisions (don't undo)

- **Chrome gets no live blurs.** The head script adds `.is-blink` on Chromium (not iOS). CSS under `.is-blink` swaps backdrop blurs for solid colors and hides the bottom progressive blur. Chrome re-blurred on every scroll frame and stuttered.
- The bottom blur also hides while the ring is in view (`.ring-in-view`).
- Ring card corners are rounded on the `<img>`, not clipped on the card (clipping 3D layers is expensive in Chrome).
- Don't add `mask-image` to the ring or anything animating in 3D.
- Studio intro animation uses only transform + opacity (no filters/blur/masks) for the same reason.

---

## Working preferences (how Thomas likes to work)

- Small, precise visual tweaks, one at a time ("go to 24px", "make it #777"). Apply exactly the number given; change only what's asked.
- Ask when a request is genuinely ambiguous (e.g. which "grey", which "black area", "add 80px" vs "make it 80px"); otherwise make the obvious choice and say so.
- When asked "what's the spacing / size here", answer with the exact px and where it comes from, per breakpoint if they differ.
- Keep things looking like the rest of the site: same fonts, greens, mono labels, divider lines, corner radii.
- Placeholder content is fine; Thomas swaps in real copy and images himself. Leave clear HTML comments where placeholders are.
- After each CSS/JS change, bump the `?v=` cache version in all five HTML files.
- **Never `git push`.** Thomas always pushes to GitHub manually. Commit only when asked, then say the commit is ready to push.
- Report briefly what changed, in plain words, with any side effects (e.g. a shared class affecting two places).
- **Approved as final (Oct 16, 2026):** the services icon animation (8-bit bob + animated inner parts). Don't change it unless asked.
- **Kept (Oct 16, 2026):** the slow drift on the studio intro (tile pop added on top, then sped up on request).

---

## Local preview

There is currently **no `.claude/launch.json`** in the project (it was removed after the workaround below). A plain `site` config would be `python3 -m http.server 5173`, but in the Claude desktop app it **fails** with "Operation not permitted" because the project lives in the Dropbox CloudStorage folder (the browser pane also can't load the CSS from `file://` there). Workaround that works: copy the site (`*.html css js assets`) into the session scratchpad, add a temporary `site-copy` config that runs `/bin/sh -c "cd <scratch>/site && exec python3 -m http.server 5174"` (with `"autoPort": false`), preview `http://localhost:5174/…`, then stop it and restore `launch.json`. Opening `index.html` directly in a normal browser mostly works, but Safari shows fallback fonts from `file://` (fonts are no longer embedded).

## Hosting (GitHub Pages)

Repo `https://github.com/pure9nine/PURENINE` (public; Pages on private repos needs a paid plan). Pages deploys from branch `main`, folder `/ (root)`. Live at **https://pure9nine.github.io/PURENINE/** (pages: `…/studio.html`, `…/contact.html`, `…/activision.html`, `…/mlb.html`). Pushing to `main` redeploys in ~1 min. All asset links must stay **relative** (no leading `/`) because the site lives under the `/PURENINE/` subpath. A page at `folder/index.html` is served at `…/PURENINE/folder/` (its paths need `../`). Because the repo is public, everything in it is visible, including this file.

---

## Open items / placeholders before launch

- "Visit Audiomack" links to `audiomack.html`, a portfolio page that isn't built yet.
- `mlb.html`: Agency row is a placeholder; tab title / SEO still say "MLB" (heading says "Major League Baseball").
- Studio page: awards list and heading are placeholders.
- Contact form is hidden and has no backend (opens a mailto when shown).
- **Placeholder demo content is still live and set to be indexed**: THINGS®/LUNAR+/KROMA… project cards. Replace or `noindex` before publishing.
- Only cards 1 (Activision) and 3 (MLB) are real; the other grid cards are placeholders linking to `activision.html`, and cards 7–15 repeat the first 6 (so THINGS/KROMA copies still appear later).
- Services descriptions/detail lines were written as placeholders.
- `robots.txt` explicitly allows AI training crawlers (GPTBot, Google-Extended, etc.) — confirm that's intended.
- Unused assets still in the project: `client-01…08.svg` (old placeholder logos), `client-history.svg`, `showreel.jpg` and `assets/video/hero-loop-01.mp4`.
- Removed/unused assets from the earlier cleanup are in the macOS Trash folder `2k27-unused-assets-2026-10-16`.
