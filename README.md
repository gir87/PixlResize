# PixlResize

A fast, privacy-first browser-based image tool. Compress, resize, crop, and convert images to **WebP**, **JPEG**, or **PNG** — all processed locally on your device, with nothing ever sent to a server.

## Features

- **Format conversion** — Output to WebP, JPEG, or PNG
- **Quality control** — Fine-tune compression (1–100%) for lossy formats
- **Resize by longest side** — Automatically scales images while preserving aspect ratio
- **Smart cropping** — Centre-crop to a fixed ratio (1:1, 2:3, 4:5, 5:7, 6:19, and more); portrait/landscape orientation is auto-detected
- **Batch processing** — Drop multiple images at once; each is processed in parallel
- **Built-in presets** — One-click settings for common use cases:
  | Preset | Format | Quality | Max size | Ratio |
  |---|---|---|---|---|
  | Web Optimized | WebP | 90 | 1920 px | Original |
  | Instagram Square | JPEG | 90 | 1350 px | 1:1 |
  | Social Portrait (4:5) | JPEG | 90 | 1920 px | 4:5 |
  | Cinematic (19:6) | WebP | 90 | 2560 px | 19:6 |
- **Size savings badge** — Each processed image card shows the percentage reduction
- **Download individually or all at once**
- **100% client-side** — No uploads, no data leaves your browser

## Tech Stack

| Layer            | Technology             |
| ---------------- | ---------------------- |
| UI framework     | React 19               |
| Language         | TypeScript             |
| Build tool       | Vite 6                 |
| Styling          | Tailwind CSS v4        |
| Animations       | Motion (Framer Motion) |
| Icons            | Lucide React           |
| Image processing | HTML Canvas API        |

## Getting Started

### Prerequisites

- Node.js ≥ 18

### Install dependencies

```bash
npm install
```

### Environment variables

Copy `.env.example` to `.env` and fill in your values:

```bash
cp .env.example .env
```

| Variable                   | Description                                             |
| -------------------------- | ------------------------------------------------------- |
| `VITE_BUY_ME_A_COFFEE_URL` | URL for the "Buy me a coffee" link shown in the sidebar |

### Run the dev server

```bash
npm run dev
```

The app will be available at `http://localhost:3000`.

### Build for production

```bash
npm run build
```

Output is written to `dist/`.

### Other scripts

| Script            | Description                                |
| ----------------- | ------------------------------------------ |
| `npm run preview` | Preview the production build locally       |
| `npm run clean`   | Delete the `dist/` directory               |
| `npm run lint`    | Type-check the project with `tsc --noEmit` |

## Privacy

All image processing is performed in your browser using the [Canvas API](https://developer.mozilla.org/en-US/docs/Web/API/Canvas_API). No image data is ever transmitted to any server.

## License

MIT
