# Fonts — Creato Display (CI display font)

The B-Healthy CI specifies **Creato Display** for headlines / large text.
It is a **commercial font** (not available on any free CDN), so it is not
bundled here. Headings currently fall back to **Outfit → Albert Sans**.

## To activate Creato Display

1. Obtain the licensed Creato Display web fonts (`.woff2`).
2. Drop these exact filenames into this `/fonts` folder:

   - `CreatoDisplay-Regular.woff2`  (weight 400)
   - `CreatoDisplay-Medium.woff2`   (weight 500)
   - `CreatoDisplay-Bold.woff2`     (weight 700)
   - `CreatoDisplay-Black.woff2`    (weight 800)

That's it — the `@font-face` rules in `css/styles.css` already point here,
and every headline upgrades to Creato Display automatically. No code changes.

If your filenames differ, either rename them to the above, or update the
`src: url(...)` lines in the `@font-face` block at the top of `css/styles.css`.

## Font roles (per CI 2026)

| Role              | Font           | Where it's used                        |
|-------------------|----------------|----------------------------------------|
| Display / headline| Creato Display | H1/H2, hero titles, package names, logo wordmark |
| English body / UI | Albert Sans    | paragraphs, buttons, labels, nav       |
| Thai              | Kanit          | all Thai text                          |
