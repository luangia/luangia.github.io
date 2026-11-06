# PRD — Personal Website: "The Desk" (Hades II–inspired)

Nov 6, 2026 · @King

## Overview & goals

A single-page three.js portfolio where visitors explore a moonlit, hand-painted writing desk and click objects on it to learn who I am. The desk is the navigation: every section of a normal portfolio is an object.

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

## Art direction: what the Hades II style is called

There is no single official name. The most accurate description is **hand-painted, painterly illustration with bold ink linework and dramatic chiaroscuro, with strong Art Nouveau influence**. Art director Jen Zee's work is known for lush palettes and a blend of Art Nouveau and classical influences ([source](https://shapes.inc/fandom/hades-ii/author)). The first Hades shifted from painterly to a pen-and-ink look during preproduction ([MCV/Develop interview](https://mcvuk.com/business-news/behind-the-art-of-hades-we-value-artistic-integrity-and-excellence-in-artistic-craft-at-supergiant-however-were-first-and-foremost-a-game-design-lead-team/)), and Hades II evolves it toward lunar, nocturnal themes.

People also call it "Supergiant style" or "graphic-novel / comic-book style." Backgrounds specifically are painted 2.5D isometric environments: hand-painted textures, deep shadows, glowing light sources, drifting mist. This site borrows that painted treatment but not the isometric angle: the desk is seen head-on from a seated viewpoint.

**Visual pillars for this site**

| Pillar | What it means on the desk |
| --- | --- |
| Ink linework | Thick, tapered dark outlines on every object; thinner interior lines on folds and edges |
| Chiaroscuro | Most of the scene in shadow; pools of light from a candle, the laptop screen and a moon window |
| Rim light | Cool moonlight edge on silhouettes; warm candle glow on the front faces |
| Painted texture | Visible brush strokes and paper grain, no photoreal materials |
| Art Nouveau ornament | Whiplash curves and arched frames in the scene itself, such as the window. UI panels stay plain, with no ornamental frames |
| Lunar palette | Deep indigo and violet shadows, moss/sea green mids, silver and pale gold highlights, ember orange accents |
| Living atmosphere | Floating dust motes, candle embers, slow mist near the floor |

**Prompt keywords** (for image generators or design tools)

> hand-painted digital illustration, Supergiant Games-inspired, bold ink outlines, painterly brushwork, dramatic chiaroscuro, rim lighting, Art Nouveau ornamental frames, Alphonse Mucha influence, moonlit nocturnal palette of indigo, violet, moss green and silver, warm candlelight accents, viewer looking straight at the laptop/desk, witchy scholar's desk, floating embers and mist, graphic-novel style

Use "inspired by" framing and make original assets. Do not reuse Supergiant's art, characters, logos or UI frames.

## Scene concept & desk objects

The scene is a night-time scholar's study: a wooden desk under an arched Art Nouveau window with a full moon outside. Camera sits directly in front of the desk at seated eye level, as if the visitor is sitting at it and looking across everything on it. Each object below is a clickable hotspot that opens one section.

| Object | Section | What opens | Priority |
| --- | --- | --- | --- |
| Stack of books + one open book | English literature & reading | Bookshelf view: favorite books, current read, reading log, short reviews, essays/writing samples | MVP |
| Laptop | CS projects | Close-up opens a panel of project cards with stack, role, screenshots, GitHub and live links. The screen itself is flat color with simple overlapping windows, no gradients | MVP |
| Globe or stack of flashcards + dictionary | Language learning | Languages I speak/learn, level per language, study streak, a "word of the day" card | MVP |
| Framed portrait or hand mirror | About me | Short bio, photo or illustrated avatar, values, fun facts | MVP |
| Rolled scroll / parchment | Resume | Unrolls into a one-page resume; PDF download button | MVP |
| Quill, inkwell + sealed letter | Contact | Wax-sealed envelope opens to email, LinkedIn, GitHub, contact form | MVP |
| Candle or oil lamp | Theme toggle | Blow out / relight: switches "moonlit" and "candlelit" lighting moods | v1 |
| Gramophone or lyre | Ambient sound | Toggles ambient music and room tone (off by default) | v1 |
| Moon in the window | Easter egg | Click cycles moon phases; hidden note on the full moon | v2 |
| Small companion (cat, owl or familiar) | Easter egg / guide | Idle animation; optional tooltips that suggest what to click | v2 |
| Small potted plant (trailing leaves) | Decoration (love of plants) | Nothing. Not clickable; leaves sway gently on hover or with idle motion | v2 |

**Section styling idea:** present projects and books as simple cards inside a plain panel. Skip ornamental frames: they read as cheap in HTML, so the art stays in the 3D scene and the UI stays quiet.

## Interaction & UX

The core loop is hover, click, zoom, read, return. Every step must also work with a keyboard and without 3D.

**Main flow**

1. **Load:** themed loading screen (ink drawing itself, moon filling up) with real progress; target under 3 s on broadband.
2. **Intro:** camera starts close to the moonlit window and eases back into the seated view; one line of text: name + "click anything on the desk."
3. **Hover:** object gets a brighter rim light, slight lift, and a hand-lettered label tag.
4. **Click:** camera eases to a close-up of that object (about 0.8 s), rest of the scene dims and blurs.
5. **Read:** a plain HTML panel slides in beside the object; content is scrollable, selectable text.
6. **Return:** Back button, Esc, or clicking outside returns to the desk view.

**Always-visible UI**

- Small nav bar or ribbon: About · Projects · Reading · Languages · Resume · Contact. Clicking jumps straight to that object.
- Sound toggle (off by default) and a "Simple view" link.
- Deep links: each section has its own URL (`/#projects`, `/#reading`) so recruiters can share them.

**Accessibility & fallbacks**

- Keyboard: Tab cycles through objects in a fixed order, Enter opens, Esc closes; visible focus ring on the 3D object.
- `prefers-reduced-motion`: cut camera moves and particles, use fades.
- "Simple view": a plain, styled HTML version of all content for screen readers, slow devices and SEO.
- No WebGL or low-end device detected: load the simple view automatically.
- Mobile: portrait-friendly camera framing, tap targets of at least 44 px, panels open as bottom sheets.

## Rendering approach in three.js

The Hades look is mostly 2D painting, so a fully 3D scene will not match it by default. Recommended: a **hybrid**: a painted 2D backdrop (wall, window, moon, shelves) behind stylized 3D desk objects, with post-processing to tie them together.

| Technique | Purpose | Notes |
| --- | --- | --- |
| Hand-painted textures (baked in Blender) | Painterly surfaces | Paint light and shadow into the albedo; keep real-time lighting light |
| Toon / stepped shading (custom `ShaderMaterial` or `MeshToonMaterial` + gradient map) | Flat, graphic shadow shapes | 2–3 tone bands, tinted indigo in shadow |
| Ink outlines: inverted-hull mesh or post-process edge detection (depth + normals) | The bold linework | Inverted hull is cheaper and gives tapered lines; edge pass catches interior lines |
| Fresnel rim light in shader | Moonlit silhouette edges | Doubles as the hover highlight |
| Bloom (selective) | Glow on candle, screen, moon, embers | Only emissive objects, to keep shadows deep |
| Particles (instanced sprites) | Dust motes, embers, mist | Painted sprite textures, slow drift |
| Fixed first-person perspective camera (about 40° FOV) | Seated at the desk, facing it head-on, tilted slightly down with the near edge out of frame | Limit movement to a few degrees on mouse move (parallax), like a slight head turn |
| Paper-grain overlay + vignette | Unify 2D and 3D layers | A full-screen shader pass, low opacity |
| Depth-of-field on focus | Close-up shots when an object opens | Disable on low-end devices |

## Tech stack, content & requirements

**Suggested stack** (verify current versions when you start)

| Layer | Choice | Why |
| --- | --- | --- |
| Framework | Vite + React (or Next.js if you want SSR for the simple view) | Fast dev, easy deploy |
| 3D | three.js via React Three Fiber + drei | Declarative scene, `Html`, `useGLTF`, hover helpers |
| Post-processing | pmndrs `postprocessing` / `@react-three/postprocessing` | Bloom, outlines, vignette, DoF |
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

**Non-functional requirements**

- Performance: 60 fps on a mid-range laptop, 30 fps on recent phones; initial download under 5 MB; scene interactive within 3 s on broadband.
- Quality tiers: auto-drop bloom, DoF, particles and pixel ratio on weak GPUs.
- SEO: all text also in crawlable HTML (simple view) with meta and Open Graph tags.
- Analytics: privacy-friendly (e.g. Plausible); track which objects get clicked.
- Browser support: latest two versions of Chrome, Safari, Firefox, Edge.

## Phasing, success metrics & open questions

| Phase | Scope | Done when |
| --- | --- | --- |
| 0. Style test | One object (the laptop) fully styled: toon shading, outlines, rim light, bloom, painted backdrop | A screenshot reads as "painted," not "3D render" |
| 1. MVP | 6 MVP objects, hover/click/zoom, panels, simple view, deep links, mobile layout | All content reachable by mouse, keyboard and simple view |
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
- [ ] Which 3–5 projects are featured on the laptop?
  - [ ] etymodendron at <https://etymodendron.pages.dev/>
  - [ ] tone-to-emoji parse at <https://luangia.github.io/emoji-parser/>
- [ ] Do I want a writing/essay section beyond book notes?
  - [ ] Yes
- [ ] Custom domain name?
  - [ ] Not yet

## Agent instructions (CLAUDE.md)

Save this PRD as `docs/PRD.md` in the repo and put this file at the root as `CLAUDE.md` (or `AGENTS.md`). The coding agent reads it at the start of every session.

```markdown
Read docs/PRD.md before any task. Stack: Vite + React + TypeScript + React Three Fiber + drei + @react-three/postprocessing.
Work one phase at a time; never start the next phase unless asked.
Content lives in /content (JSON/MDX), never hard-coded in components.
All art assets are original; never use Supergiant/Hades assets, logos or UI frames.
After each change: run the dev server, check the console for errors, and summarize what changed.
```

## Starter prompt for building

Paste this into a coding assistant after the PRD and CLAUDE.md are in the repo. Start with Phase 0 only.

```markdown
Build Phase 0 of my personal portfolio: a three.js scene (React Three Fiber + drei + @react-three/postprocessing, Vite, TypeScript). Follow docs/PRD.md.

Art direction: hand-painted, painterly illustration inspired by Supergiant Games (Hades II): bold dark ink outlines, stepped toon shading with indigo-tinted shadows, dramatic chiaroscuro, cool moonlight rim light, warm candle glow, Art Nouveau ornament on the window, plain UI panels, palette of indigo, violet, moss green, silver and pale gold with ember-orange accents. All assets original.

Scene: a night-time scholar's desk under an arched window with a full moon, fixed first-person camera seated at the desk and facing it head-on, with slight mouse parallax. For Phase 0, build only the laptop as a clickable object: hover = brighter rim light + lift + label; click = camera eases to close-up and an HTML panel opens listing projects from content/projects.json; Esc returns.

Seed content/projects.json with my two featured projects:
- Etymodendron: https://etymodendron.pages.dev/
- Tone-to-emoji parser: https://luangia.github.io/emoji-parser/
Leave summary, role and stack fields as TODO for me to fill in.

Rendering: inverted-hull outlines, custom toon ShaderMaterial with fresnel rim, selective bloom on emissive parts, paper-grain + vignette overlay, instanced dust particles. Respect prefers-reduced-motion and provide keyboard focus (Tab/Enter/Esc).

Do this in order and stop after each step for me to check: (1) scaffold + empty scene + camera, (2) placeholder laptop + hover/click/zoom/panel flow, (3) shaders and outlines, (4) overlays, particles and accessibility.
```
