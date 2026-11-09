# PRD — Personal Website: "The Desk" (risograph print)

Nov 6, 2026 · @King · revised Nov 9, 2026: art direction changed from Hades II–style painting to risograph print with dithering

## Overview & goals

A single-page three.js portfolio where visitors explore a moonlit writing desk, rendered like a risograph-printed zine, and click objects on it to learn who I am. The desk is the navigation: every section of a normal portfolio is an object.

**Goals**

- Make a memorable first impression in under 10 seconds: the scene itself says "reader, coder, language learner."
- Let recruiters reach projects, resume and contact in 2 clicks or fewer.
- Keep content editable without touching 3D code.
- Run smoothly on a mid-range laptop and degrade gracefully on phones.

**Audiences**

- Recruiters and hiring managers: want projects, resume, contact fast.
- Peers and collaborators: want to poke around, find easter eggs, read writing.
- Me: want a place to keep my reading log and language progress.

**Non-goals (v1)**

- A full blog CMS, multiplayer, or a game loop. This is a diorama, not a game.

## Art direction: risograph print with dithering

The whole scene should look like a **risograph print**: a few flat spot inks laid down one layer at a time on uncoated paper, with every tone made from dots, slightly misaligned layers, and the grain of the paper showing through. Risograph is a stencil duplicator popular with zine makers and print studios. Each ink is its own drum and pass, so a print has 2–3 colors that overlap into new mixes (blue over pink reads as purple), and the layers never line up perfectly.

The signature twist: **the shading is made of text from classic books**. One ink layer is set entirely in passages from public-domain books. Where the scene is light, the type thins out and becomes readable; where it is dark, the type packs in and becomes texture. The rest of the tone is ordinary dot dithering. If book text doesn't read well at small sizes, the fallback is an ASCII ramp, where characters are picked only for how dark they print. Book text is the default because it says "reader" before anyone clicks anything.

Earlier phases were built in a Hades II–inspired painted style. The scene, camera and interactions carry over; only the look changes.

**Visual pillars for this site**

| Pillar | What it means on the desk |
| --- | --- |
| Spot inks | 2–3 risograph inks, overprinted on paper. No other colors: any mix comes from layers overlapping |
| Dithered tone | Every gradient is dots: ordered (Bayer) or blue-noise dithering, with a cell large enough to see (about 2–3 CSS px) |
| Type as texture | One ink layer is set in passages from classic books. Tone controls how densely the glyphs print; the lightest areas are readable |
| Misregistration | Each ink layer is offset by 1–3 px and slightly rotated, so edges and colors don't quite line up |
| Paper | Off-white uncoated stock with visible grain and fibres, uneven ink coverage, and faint ink specks |
| Light as bare paper | The moon, candle flame and laptop screen are unprinted paper. No bloom, and no candle light: the flame is decoration only |
| Key line | Crisp outlines from the existing ink hulls, printed in blue at full resolution, so objects stay defined under the type |
| Light backdrop | The wall and sky print in light ink and skip shading, so the wall reads as a page of thin type and the shaded, outlined objects in front stand out |
| Living atmosphere | Dust motes as ink specks drifting through the light |

**Prompt keywords** (for image generators or design tools)

> risograph print, two-color or three-color riso zine, spot inks overprinted, ordered dithering, halftone, misregistered layers, uncoated paper grain, text-as-texture made of book passages, moonlit scholar's desk, arched window with full moon, candlelight, viewer looking straight at the laptop/desk, flat graphic shapes, small-press print aesthetic

Make original assets. Book passages are printed in full as texture, so they must be in the public domain both in the US (published in 1930 or earlier, as of 2026) and in life-plus-70 countries (author died before 1956). Translations carry their own copyright, so use public-domain translations. Credit every book used.

## Scene concept & desk objects

The scene is a night-time scholar's study: a wooden desk under an arched window with a full moon outside. Camera sits directly in front of the desk at seated eye level, as if the visitor is sitting at it and looking across everything on it. Each object below is a clickable hotspot that opens one section.

| Object | Section | What opens | Priority |
| --- | --- | --- | --- |
| Stack of books + one open book | English literature & reading | Bookshelf view: favorite books, current read, reading log, short reviews, essays/writing samples | MVP |
| Laptop | CS projects | Close-up opens a panel of project cards with stack, role, screenshots, GitHub and live links. The screen itself is flat ink with simple overlapping windows, no gradients | MVP |
| Globe or stack of flashcards + dictionary | Language learning | Languages I speak/learn, level per language, study streak, a "word of the day" card | MVP |
| Framed portrait or hand mirror | About me | Short bio, photo or illustrated avatar, values, fun facts | MVP |
| Rolled scroll / parchment | Resume | Unrolls into a one-page resume; PDF download button | MVP |
| Quill, inkwell + sealed letter | Contact | Wax-sealed envelope opens to email, LinkedIn, GitHub, contact form | MVP |
| Candle or oil lamp | Theme toggle | Blow out / relight: swaps the ink set (for example, a warmer pair of inks) | v1 |
| Gramophone or lyre | Ambient sound | Toggles ambient music and room tone (off by default) | v1 |
| Moon in the window | Easter egg | Click cycles moon phases; hidden note on the full moon | v2 |
| Small companion (cat, owl or familiar) | Easter egg / guide | Idle animation; optional tooltips that suggest what to click | v2 |
| Small potted plant (trailing leaves) | Decoration (love of plants) | Nothing. Not clickable; leaves sway gently on hover or with idle motion | v2 |

**Section styling idea:** panels look like printed paper: off-white stock, text in one riso ink, plain cards, no ornamental frames. Headings can be misregistered across two inks; body text is always crisp and never dithered, so it stays readable.

## Interaction & UX

The core loop is hover, click, zoom, read, return. Every step must also work with a keyboard and without 3D.

**Main flow**

1. **Load:** themed loading screen (the print laying down one ink at a time, like plates going through the press) with real progress; target under 3 s on broadband.
2. **Intro:** camera starts close to the moonlit window and eases back into the seated view; one line of text: name + "click anything on the desk."
3. **Hover:** object reprints in a highlight ink (or its dither inverts), lifts slightly, and shows a label tag.
4. **Click:** camera eases to a close-up of that object (about 0.8 s); the rest of the scene drops to a single, lighter ink.
5. **Read:** a plain HTML panel slides in beside the object; content is scrollable, selectable text.
6. **Return:** Back button, Esc, or clicking outside returns to the desk view.

**Always-visible UI**

- Small nav bar or ribbon: About · Projects · Reading · Languages · Resume · Contact. Clicking jumps straight to that object.
- Sound toggle (off by default) and a "Simple view" link.
- Deep links: each section has its own URL (`/#projects`, `/#reading`) so recruiters can share them.

**Accessibility & fallbacks**

- Keyboard: Tab cycles through the nav links in a fixed order, and each link marks its 3D object with a visible focus ring, printed in the highlight ink; Enter opens, Esc closes.
- `prefers-reduced-motion`: cut camera moves and particles, use fades, and keep the dither and registration still (no animated boil or wobble).
- "Simple view": a plain, styled HTML version of all content for screen readers, slow devices and SEO.
- No WebGL or low-end device detected: load the simple view automatically.
- Mobile: portrait-friendly camera framing, tap targets of at least 44 px, panels open as bottom sheets.

## Rendering approach in three.js

Keep the 3D scene, lighting and camera, and change how the result is printed. Scene colors are written as **ink recipes** (how much blue, pink and yellow overprint the paper), and one full-screen pass separates the rendered image back into those three inks and prints them. Because the look lives in that pass, every object gets it for free.

| Technique | Purpose | Notes |
| --- | --- | --- |
| Stepped tone shading (existing toon shader) | Gives the dither clean tone shapes to work with | Shade is added blue ink, not darkening, so shadows stay clean instead of muddy |
| Ink recipes and separation | Scene colors are defined as ink amounts; the print pass separates them back out | Separation treats inks as filters that multiply over the paper. Light sources render brighter than paper, so they print as bare paper |
| Ordered or blue-noise dithering | Turns coverage into dots | Screen-space, fixed to the page like a real print; cell size scales with device pixel ratio |
| Text halftone layer | Sets the blue ink in passages from classic books | Glyph atlas built on a canvas at load; each grid cell takes the next glyph in reading order; tone, read per pixel, decides how heavily it prints, so letters are cut cleanly at object edges. ASCII ramp as fallback |
| Misregistration and overprint | Riso layering | Per-ink offset and slight rotation; inks multiply over the paper |
| Paper texture | The stock | Static grain, fibres, uneven coverage and specks; never animated |
| Key line (existing inverted hull) | Object definition | Outlines render pure black, which no ink recipe produces; the pass prints them as crisp blue lines. Needs anti-aliasing off |
| Particles (instanced sprites) | Dust motes | Rendered as ink specks |
| Fixed first-person perspective camera (about 40° FOV) | Seated at the desk, facing it head-on, tilted slightly down with the near edge out of frame | Limit movement to a few degrees on mouse move (parallax), like a slight head turn |

Dropped from the painted version: bloom, candle light, painted brush-stroke tinting, vignette, anti-aliasing and depth-of-field.

## Tech stack, content & requirements

**Suggested stack** (verify current versions when you start)

| Layer | Choice | Why |
| --- | --- | --- |
| Framework | Vite + React (or Next.js if you want SSR for the simple view) | Fast dev, easy deploy |
| 3D | three.js via React Three Fiber + drei | Declarative scene, `Html`, `useGLTF`, hover helpers |
| Post-processing | pmndrs `postprocessing` / `@react-three/postprocessing` | One custom riso effect: dithering, text layer, misregistration, paper |
| Type | A book serif or monospace web font, self-hosted | Feeds the glyph atlas for the text layer, and the UI |
| Animation | GSAP or `maath` easing | Camera moves, panel transitions |
| State | Zustand | Which object is focused, theme, sound |
| Assets | Blender → glTF, Draco/Meshopt geometry, KTX2 textures | Small downloads |
| Content | MDX or JSON files per section | Edit text without touching 3D |
| Hosting | Vercel, Netlify or Cloudflare Pages | Free tier, CI deploys |

**Content model** (one file per collection)

- `projects`: title, summary, role, stack\[\], links{github, live}, images\[\], featured
- `books`: title, author, status (reading / read / want), rating, short note, favorite quote (short)
- `languages`: name, level (e.g. CEFR A1–C2), started, current focus, word of the day\[\]
- `about`, `resume.pdf`, `contact`: single entries
- `passages`: title, author, year, source link, text. Public domain only; feeds the text layer and a credits line

**Non-functional requirements**

- Performance: 60 fps on a mid-range laptop, 30 fps on recent phones; initial download under 5 MB; scene interactive within 3 s on broadband.
- Quality tiers: on weak GPUs, swap the text layer for plain dots, then drop particles and pixel ratio.
- Legibility: UI text is never dithered or misregistered; the text layer is decorative and hidden from screen readers.
- SEO: all text also in crawlable HTML (simple view) with meta and Open Graph tags.
- Analytics: privacy-friendly (e.g. Plausible); track which objects get clicked.
- Browser support: latest two versions of Chrome, Safari, Firefox, Edge.

## Phasing, success metrics & open questions

| Phase | Scope | Done when |
| --- | --- | --- |
| 0. Style test | One object (the laptop) fully styled: toon shading, outlines, rim light, bloom, painted backdrop | A screenshot reads as "painted," not "3D render" (built Nov 6, 2026, in the old painted style) |
| 1. MVP | 6 MVP objects, hover/click/zoom, panels, simple view, deep links, mobile layout | All content reachable by mouse, keyboard and simple view (built Nov 6, 2026) |
| 1.5 Riso restyle | Re-skin the built scene and UI: ink separation, dithering, text layer from book passages, misregistration, paper; printed-paper panels and simple view | A screenshot reads as a risograph print, not a 3D render, and passages are readable in the lightest areas (built Nov 9, 2026) |
| 2. v1 polish | Candle theme toggle, ambient sound, particles, loading screen, quality tiers | 60 fps on target laptop; Lighthouse accessibility 90+ on simple view |
| 3. v2 delight | Moon phases, companion creature, more easter eggs, reading-log updates | Optional; ship when fun |

**Success metrics**

- 70%+ of visitors click at least one object.
- Median time to reach Projects or Resume under 15 s.
- Bounce rate on the 3D view no worse than on the simple view.

**Open questions**

- [ ] Which languages am I featuring, and how do I show level (CEFR, years, self-rating)?
  - [ ] Vietnamese (Native), English (i got a B.A degree in English), French (moderate), Spanish (learning, beginner, can understand native content if they don't speak too fast)
- [ ] Illustrated avatar or real photo on the portrait?
  - [ ] Illustrated avatar
- [ ] Model and paint assets myself in Blender, commission an artist, or buy stylized packs and repaint?
  - The print pass now supplies the texture, so painted textures are no longer needed; simple models are enough
- [ ] Which 3–5 projects are featured on the laptop?
  - [ ] etymodendron at <https://etymodendron.pages.dev/>
  - [ ] tone-to-emoji parse at <https://luangia.github.io/emoji-parser/>
- [ ] Do I want a writing/essay section beyond book notes?
  - [ ] Yes
- [ ] Custom domain name?
  - [ ] Not yet
- [x] Is the text layer what I meant by "classic books quotes/paragraphs in it": the shading itself made of book passages?
  - [x] Yes
- [x] Book text or ASCII ramp for the text layer?
  - [x] Book text. ASCII ramp only as a fallback if shapes don't read at small sizes
- [ ] Which ink set? Using for now: Blue, Fluorescent Pink and Yellow on natural (cream) paper. Alternatives: Federal Blue + Fluorescent Orange; Teal + Fluorescent Pink
- [ ] Which passages? Preference: classic literature and essays, in the spirit of Jane Austen, *The Great Gatsby*, David Foster Wallace and George Orwell
  - In use now (content/passages.json): the opening of *Pride and Prejudice*, the close of *The Great Gatsby*, the "luminous halo" passage from Woolf's "Modern Fiction", and Twain's first four rules from "Fenimore Cooper's Literary Offences"
  - Usable everywhere: Jane Austen; *The Great Gatsby* (1925)
  - Not usable: David Foster Wallace (copyrighted everywhere); George Orwell's essays (public domain in the UK and EU, but published 1931 or later, so still under US copyright until 2032–2042)
  - Public-domain essayists in a similar spirit: Virginia Woolf (*A Room of One's Own*, *The Common Reader*), Mark Twain's critical essays, G. K. Chesterton (pre-1931), Oscar Wilde, William Hazlitt, Montaigne (Cotton or Florio translation)
  - Idea: match passages to objects, such as Ada Lovelace's 1843 notes on the Analytical Engine near the laptop, Austen near the books, travel writing near the globe
  - Source texts from Project Gutenberg, copied exactly, not from memory
- [x] Cream paper with heavy night ink, or a darker paper stock?
  - [x] Cream paper with a light backdrop, so the foreground reads clearly

## Agent instructions (CLAUDE.md)

Save this PRD as `docs/PRD.md` in the repo and put this file at the root as `CLAUDE.md` (or `AGENTS.md`). The coding agent reads it at the start of every session.

```markdown
Read docs/PRD.md before any task. Stack: Vite + React + TypeScript + React Three Fiber + drei + @react-three/postprocessing.
Work one phase at a time; never start the next phase unless asked.
Content lives in /content (JSON/MDX), never hard-coded in components.
All art assets are original; book passages in the text layer must be public domain.
After each change: run the dev server, check the console for errors, and summarize what changed.
```

## Starter prompt for building

Paste this into a coding assistant after the PRD and CLAUDE.md are in the repo. Start with Phase 0 only.

```markdown
Build Phase 0 of my personal portfolio: a three.js scene (React Three Fiber + drei + @react-three/postprocessing, Vite, TypeScript). Follow docs/PRD.md.

Art direction: risograph print. 2–3 spot inks overprinted on cream paper, all tone made from ordered or blue-noise dithering, one ink layer set in passages from public-domain classic books (ASCII ramp as fallback), misregistered layers, paper grain, light sources left as bare paper, UI panels as plain printed paper. All assets original.

Scene: a night-time scholar's desk under an arched window with a full moon, fixed first-person camera seated at the desk and facing it head-on, with slight mouse parallax. For Phase 0, build only the laptop as a clickable object: hover = reprint in a highlight ink + lift + label; click = camera eases to close-up and an HTML panel opens listing projects from content/projects.json; Esc returns.

Seed content/projects.json with my two featured projects:
- Etymodendron: https://etymodendron.pages.dev/
- Tone-to-emoji parser: https://luangia.github.io/emoji-parser/
Leave summary, role and stack fields as TODO for me to fill in.

Rendering: materials output ink coverage per layer; one full-screen riso pass does dithering, the text layer, misregistration and paper; optional inverted-hull key lines; instanced dust as ink specks. Respect prefers-reduced-motion and provide keyboard focus (Tab/Enter/Esc).

Do this in order and stop after each step for me to check: (1) scaffold + empty scene + camera, (2) placeholder laptop + hover/click/zoom/panel flow, (3) shaders and outlines, (4) overlays, particles and accessibility.
```
