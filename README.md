# PRISM — Visual Synthesizer

A mobile-friendly WebGL visual synthesizer with 40+ shader effects, layer blending, and high-resolution export.

## Features

- **40+ Base Visuals** across categories: Organic, Geometric, Retro, Space, Nature, Psychedelic, Cyber, Audio, Fractal, Energy
- **Layer System** — Stack multiple visuals with blend modes (add, multiply, screen, normal)
- **Per-Layer Controls** — Opacity, speed, scale, intensity
- **Resolution Export** — Save images at 720p, 1080p, 1440p, 4K, Square (1080×1080), or Portrait (1080×1920)
- **Mobile-First UI** — Collapsible controls keep visuals unobstructed
- **Real-time Performance** — Optimized WebGL rendering

## Quick Start

```bash
npm install
npm run dev
```

## Usage

- **📷 Button** — Quick save current frame
- **Resolution Button** — Open export settings, choose resolution, save hi-res image
- **⏸/▶ Button** — Pause/play animation
- **▲/▼ Button** — Toggle controls visibility
- **+ ADD** — Add a new layer
- **Shader Dropdown** — Pick from 40+ visuals with category filter
- **Sliders** — Adjust opacity, speed, scale, intensity per layer
- **Blend Mode Buttons** — Change how layers combine

## Tech Stack

- React 18
- WebGL (raw, no Three.js)
- Vite

## License

MIT
