# Your personal site

A single-page personal site with a rotating point-cloud "planet" behind the hero,
built with plain HTML/CSS/JS — no build step, so it's ready for GitHub Pages as-is.

## File structure
```
personal-site/
├── index.html      ← all content lives here
├── css/style.css   ← colors, layout, type
└── js/script.js    ← the point-sphere background + small interactions
```

## Deploy to GitHub Pages (5 minutes)

1. Create a new repository on GitHub (e.g. `your-username.github.io` if you want
   it at the root of your GitHub domain, or any name like `personal-site` if you
   don't mind a `/personal-site/` path in the URL).
2. From this folder, run:
   ```bash
   git init
   git add .
   git commit -m "Initial site"
   git branch -M main
   git remote add origin https://github.com/YOUR-USERNAME/YOUR-REPO.git
   git push -u origin main
   ```
3. On GitHub: go to the repo → **Settings → Pages**.
4. Under "Build and deployment", set **Source** to `Deploy from a branch`,
   branch `main`, folder `/ (root)`. Save.
5. GitHub gives you a URL a minute or two later — usually
   `https://YOUR-USERNAME.github.io/YOUR-REPO/` (or just
   `https://YOUR-USERNAME.github.io/` if you named the repo that way).

Any time you push new commits to `main`, the live site updates automatically.

## What to personalize

Everything editable lives in `index.html` as plain text — no build tools needed,
just find-and-replace:

- **Name** — appears in the nav (`Your Name`) and hero (`Hi, I'm ...`).
- **Hero tagline** — the one-line sentence under your name.
- **About** — bio paragraphs, the "quick facts" list, and your initials in the
  avatar circle (swap the `<span class="avatar-initials">` for an `<img>` tag
  if you'd rather use a real photo).
- **Projects** — three `<article class="card">` blocks. Copy/paste the block
  to add more, delete to remove. Each has a title, description, tag chips,
  and two links (point the `href`s at your actual repos/write-ups).
- **Skills** — tag chips grouped by category; add or remove `<span class="chip">`.
- **Experience** — the timeline list; each `<li class="timeline-item">` is one entry.
- **Contact** — your real email and social links (GitHub/LinkedIn/etc. — just
  replace the `#` hrefs).

A couple of things worth knowing:

- There's no working contact **form** — GitHub Pages can't run server code, so
  a form would need a third-party service like Formspree to actually send
  anywhere. I kept it simple with a direct `mailto:` link and social links
  instead. Happy to wire up Formspree if you want a form later.
- The background is a canvas animation (no images/libraries), so it stays fast
  and has no external dependencies beyond the Google Fonts link in `<head>`.
- It respects `prefers-reduced-motion` — if that's set, the background
  renders as a static frame instead of animating.

## Tech notes

- Fonts: Bricolage Grotesque (headings), IBM Plex Sans (body), IBM Plex Mono
  (labels/UI) — loaded from Google Fonts via a `<link>` tag in `index.html`.
- The point-sphere is a from-scratch canvas 2D animation (Fibonacci sphere
  point distribution + manual 3D rotation/projection) — no Three.js or other
  library, so there's nothing to install and nothing that can break on update.
- Fully responsive down to mobile, with a hamburger menu below 760px.
