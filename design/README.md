# design/ — portfolio reference

Static, dependency-free reference build of the portfolio site in the shared
AI / Digital / Scientific direction (same tokens as the three project designs).
Open `index.html` directly in a browser; GSAP 3.12 loads from jsDelivr.

- `index.html` — the page: hero with a live point-cloud specimen, project
  accordion, capability bento, a scrubbed statement, screen plates, an
  invariants carousel, contact
- `tokens.css` — shared colour/type/space/motion tokens; `--sig-*` are the
  per-project signature hues (identity visuals only, never state)
- `app.css` — layout and components, then a motion layer and the
  reduced-motion rules
- `app.js` — canvas flow field and specimen, scroll-spy nav, accordion,
  carousel, GSAP scroll work
- `assets/` — generative art per project (`art-*.webp`) and real renders of
  the project designs (`eval-run`, `gw-audit`, `nav-run`)

Before publishing, replace `hello@example.com` and the `#` social links.
