# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev       # Start dev server on port 3000
npm run build     # Production build
npm run preview   # Preview production build
npm run lint      # Type-check with tsc --noEmit
npm run clean     # Delete dist/
```

There is no test suite.

## Architecture

**PixlResize** is a single-page, fully client-side image optimization tool. All image processing happens in the browser via the Canvas API — no data is sent to any server.

### Data flow

1. User drops/selects images → `DropZone.tsx` emits `File[]`
2. `App.tsx` holds global state: `CompressionSettings` + `ProcessedImage[]`
3. On file add or settings change, `imageProcessor.ts` is called and writes back a `ProcessedImage` with a blob URL
4. `ImagePreview.tsx` renders each `ProcessedImage` card; sidebar controls update shared settings

### Key files

| File | Role |
|------|------|
| `src/App.tsx` | State owner; orchestrates processing, download-all, and preset application |
| `src/utils/imageProcessor.ts` | Canvas API pipeline: crop → resize → quality encode → border |
| `src/components/Sidebar.tsx` | All compression settings + preset buttons |
| `src/components/ImagePreview.tsx` | Per-image card with size stats and download |
| `src/types.ts` | `OutputFormat`, `CropRatio`, `CompressionSettings`, `ProcessedImage`, `Preset` |

### Image processing pipeline (`imageProcessor.ts`)

Order of operations applied on the canvas:
1. **Crop** — center-crop to target aspect ratio (if not "free")
2. **Resize** — scale so longest side ≤ `longestSide` (preserves aspect ratio)
3. **Border** — add white border (~2% of image size, if enabled)
4. **Encode** — `canvas.toBlob()` with selected format and quality

### Environment variables

Copy `.env.example` to `.env`. The only variable is:

```
VITE_BUY_ME_A_COFFEE_URL=   # optional URL shown in the UI
```

### Tooling

- **Vite 6** with `@vitejs/plugin-react` and `@tailwindcss/vite`
- **Tailwind CSS v4** (configured via the Vite plugin, not `tailwind.config.js`)
- Path alias `@/` → `src/`
