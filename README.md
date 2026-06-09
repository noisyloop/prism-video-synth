# PRISM — Visual Synthesizer

A mobile-friendly WebGL visual synthesizer with 150 shader effects, layer blending, video recording, and instant randomization for creative exploration.

## Features

- **150 Unique Shaders** across 17 categories: Organic, Geometric, Retro, Space, Nature, Psychedelic, Cyber, Light, Audio, Fractal, Energy, Glitch, Sacred, 3D, Tiling, Flow, Volumetric
- **Layer System** — Stack multiple visuals with blend modes (add, multiply, screen, normal)
- **Per-Layer Controls** — Opacity, speed, scale, intensity
- **🎲 Randomizer** — Instant visualization with randomized shaders and parameters for creative exploration
- **🎥 Video Recording** — Camera-style toggle recording at 30 FPS in WebM format with a live elapsed timer
- **📷 Image Export** — Save high-resolution images at 720p, 1080p, 1440p, 4K, Square (1080×1080), or Portrait (1080×1920)
- **Mobile-First UI** — Collapsible controls keep visuals unobstructed
- **Real-time Performance** — Optimized WebGL rendering at 60 FPS

## Quick Start

```bash
npm install
npm run dev
```

## Usage

### Top Bar Controls
- **⏸/▶ Button** — Pause/play animation
- **🎲 Button** — Randomize all layers instantly (shader, parameters, blend modes)
- **📷 Button** — Quick save current frame at display resolution
- **🎥 Button** — Tap to start recording immediately; while recording the button turns red and shows a live elapsed timer (⏺ 0:07). Tap again to stop and download the WebM file. Recordings auto-stop at the 5-minute safety cap.
- **Resolution Button** — Open export settings, choose resolution (720p-4K), save hi-res image

### Layer Controls
- **Layer Tabs** — Switch between layers (shows shader name)
- **+ ADD** — Add a new randomized layer
- **Shader Dropdown** — Pick from 150 visuals with a text search and category filter
- **🎲 Button** — Randomize current layer only
- **👁 Button** — Toggle layer visibility
- **✕ Button** — Delete current layer (only if multiple layers exist)
- **Sliders** — Adjust opacity, speed, scale, intensity per layer
- **Blend Mode Buttons** — Choose from add, multiply, screen, or normal

### Other Controls
- **▲/▼ Button** — Toggle controls visibility for clean viewing

## Tech Stack

- React 18
- WebGL (raw, no Three.js)
- Vite

## License

MIT
