# The Desk

Luan Pham's personal portfolio: a moonlit scholar's desk in 3D, printed like a risograph zine. Every object on the desk opens a section of the site, and the blue ink is typeset in passages from public-domain classics.

| Object | Section |
| --- | --- |
| Framed portrait | About |
| Laptop | Projects |
| Books | Reading |
| Globe | Languages |
| Scroll | Resume |
| Letter, quill and inkwell | Contact |

Built with Vite, React, TypeScript, three.js, React Three Fiber, drei and `@react-three/postprocessing`.

## Getting started

You need Node.js 20.19+ or 22.12+, as Vite 8 requires (the site was developed on Node 25).

```bash
npm install
```

```bash
npm run dev
```

The dev server runs at http://localhost:5173 and reloads as you edit.

| Command | What it does |
| --- | --- |
| `npm run dev` | Start the dev server |
| `npm run build` | Typecheck, then build the static site into `dist/` |
| `npm run preview` | Serve the production build locally |
| `npm run typecheck` | Typecheck without building |

The build is a plain static site, so `dist/` can be hosted anywhere that serves files.

## Deploying to GitHub Pages

`.github/workflows/deploy.yml` builds the site and publishes it on every push to `master`. You can also run it by hand from the **Actions** tab.

One-time setup:

1. The repository must be public, unless the account has GitHub Pro.
2. In **Settings → Pages → Build and deployment**, set **Source** to **GitHub Actions**.

The workflow asks GitHub where the site will live and builds for that path, so it works either way:

- Keep this repository's name, and the site is at `https://luangia.github.io/LuanWebsite/`.
- Rename the repository to `luangia.github.io`, and it is at `https://luangia.github.io/`.

To check a sub-path build locally before pushing:

```bash
npm run build -- --base /LuanWebsite/
```

```bash
npx vite preview --base /LuanWebsite/
```

## Using the site

- **Mouse:** hover an object to lift it and show its label; click it to zoom in and open its panel. Click anywhere outside the panel, press Esc or use **Back to desk** to return.
- **Keyboard:** Tab through the nav links. Each link marks its object with a pink focus ring; Enter opens it and Esc closes it.
- **Deep links:** every section has its own URL, such as `/#projects` or `/#reading`, and the browser's Back button closes a panel.
- **Simple view:** `/#simple`, or the **Simple view** link, shows all content as plain HTML with no 3D. Devices without WebGL2, or with very little power, get it automatically.
- **Phones:** the camera pulls back to fit the desk, and panels open as bottom sheets.
- **Reduced motion:** with `prefers-reduced-motion`, the camera cuts instead of easing, and dust and parallax are turned off.

## Editing content

All text lives in `content/`, never in components, so you can update the site without touching the 3D code.

| File | What it holds |
| --- | --- |
| `content/about.json` | Name, bio, values, fun facts and an optional avatar |
| `content/projects.json` | Project cards: summary, role, stack and live and GitHub links |
| `content/books.json` | Reading list: status (`reading`, `read` or `want`), rating, note and quote |
| `content/writing.json` | Essays and writing samples |
| `content/languages.json` | Languages, levels, current focus, study streak and words of the day |
| `content/resume.json` | Summary, experience and education, plus an optional PDF path |
| `content/contact.json` | Message, email, LinkedIn and GitHub |
| `content/site.json` | Interface text: section labels and titles, button text and the scene description |
| `content/passages.json` | The book passages printed in the scene (see below) |

To offer a resume download, put the PDF in `public/` and set `pdf` in `content/resume.json` to its file name, such as `"resume.pdf"`. Leave off the leading `/`, so it still works when the site is served from a sub-path like `/LuanWebsite/`. Empty links (`null`) are simply hidden.

### Passages

Each desk object is printed in its own book, set by the `object` field in `content/passages.json`. The value is a section name (`about`, `projects`, `reading`, `languages`, `resume`, `contact`) or `room` for the desk, window and sky. An object with no passage of its own borrows the room's.

Passages are printed in full, so they must be in the public domain both in the US (published in 1930 or earlier, as of 2026) and in countries that use life plus 70 years (author died before 1956). Copy them exactly from [Project Gutenberg](https://www.gutenberg.org), and keep the `source` link: the colophon credits every passage automatically.

## How the print works

The scene is ordinary 3D geometry with stepped toon shading. One full-screen pass at the end turns the render into a three-ink risograph print:

1. **Separation:** each pixel's color is split into blue, fluorescent pink and yellow ink, treating inks as filters that multiply over the paper.
2. **Type:** the blue ink is set in Courier Prime from the passages. A region pass records which object owns each pixel, and each object's passage is laid out from the top left of its on-screen box, so it reads on from line to line.
3. **Dots:** pink and yellow are ordered-dither dots, each on its own screen angle.
4. **Key lines:** outlines render pure black, which no ink mix produces, so they print as crisp blue lines.
5. **Press:** each ink is slightly misregistered, and the paper gets grain, uneven ink and the odd speck.

Light sources such as the moon and the laptop screen print as bare paper. There is no bloom.

## Tuning the look

Most visual settings are in `src/scene/config.ts`:

- `RISO`: the paper and ink colors. If you change `paper`, also change `--paper` in `src/index.css` so the panels, nav and simple view match.
- `PALETTE`: scene colors, written as ink recipes with `inkMix(blue, pink, yellow)`, each from 0 to 1. Colors made this way print back out as clean ink. For example, `wall: inkMix(0, 0.03, 0.12)` would tint the wall with a fine cream dither.
- `CAMERA`, `OBJECTS` and `getFocusPose`: the seated view, where each object sits, and how close-ups are framed.
- `DUST`: how many dust specks there are, how big, and how fast they drift.

In `src/scene/print/RisoEffect.ts`, the text cell size (`CELL_HEIGHT`) and dot size (`DOT_SIZE`) are constants at the top of the file, and the per-ink misregistration offsets are set in `setPixelRatio`.

## Project structure

```
content/            Site text and book passages (JSON)
docs/PRD.md         Product requirements and design decisions
public/             Static files served as-is, such as a resume PDF
src/
  App.tsx           Chooses the 3D desk or the simple view
  DeskView.tsx      The 3D desk, loaded only when it is shown
  content.ts        Typed access to content/
  fonts.ts          Self-hosted Courier Prime
  state/store.ts    Sections, and routing from the URL hash
  scene/            The 3D scene
    objects/        The six desk objects and their shared hover and click wrapper
    materials/      Toon, outline, sky, screen and dust shaders
    print/          The risograph pass, glyph atlas and per-object text regions
  ui/               Nav, panel, simple view, colophon and section panels
```

## Credits

- **Passages**, all public domain, via Project Gutenberg: Oscar Wilde, *The Picture of Dorian Gray*; Charles Babbage, *Passages from the Life of a Philosopher*; Jane Austen, *Pride and Prejudice*; Jules Verne, *Around the World in Eighty Days* (translated by George M. Towle); Benjamin Franklin, *Autobiography*; Lord Chesterfield, *Letters to His Son*; F. Scott Fitzgerald, *The Great Gatsby*; Virginia Woolf, "Modern Fiction" in *The Common Reader*; Mark Twain, "Fenimore Cooper's Literary Offences".
- **Font:** [Courier Prime](https://quoteunquoteapps.com/courierprime/), under the SIL Open Font License, self-hosted through Fontsource.
- **Art:** all scene assets are original and built in code.

The site's own code has no license yet.
