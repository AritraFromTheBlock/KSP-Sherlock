# KSP Sherlock — Secure Login

AI command-center style login screen for the Karnataka State Police crime
analytics platform. Dark instrument-panel aesthetic, glassmorphism card,
blue neon accents, Framer Motion animations.

## Run it

```bash
npm install
npm run dev
```

## Notes

- **Logo**: `src/assets/ksp-logo.png` is left empty on purpose. The badge
  currently rendered in `LoginPage.tsx` (`SherlockBadge`) is an original
  shield-and-scan glyph, not the official KSP emblem — swap in the real
  logo file and an `<img>` tag once you have an authorized asset.
- **Auth**: `handleSubmit` in `LoginPage.tsx` currently simulates a network
  call with `setTimeout`. Wire it to your real auth endpoint there.
- Verified with `tsc -b` and `vite build` — no type or build errors.

## Structure

```
src/
├── App.tsx
├── main.tsx
├── index.css
├── assets/
│   └── ksp-logo.png        (placeholder — add real emblem here)
└── components/
    ├── LoginPage.tsx        (form, validation, glass card)
    ├── AnimatedBackground.tsx (gradient, radar sweep, scanline)
    └── FloatingGrid.tsx      (HUD grid + drifting network nodes)
```
