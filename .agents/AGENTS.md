# Project Memory & Agent Guidelines: BMW X7 3D WebXR Configurator

This repository contains the interactive 3D Studio Configurator and WebXR Augmented Reality experience for the **BMW X7 M60i**.

---

## 🏗️ Architecture & Technical Stack

- **Frontend:** Standard HTML5, Vanilla CSS3 (Apple/VisionOS Liquid Glass Design Tokens, `color-mix()` Physics Engine, Frosted Spatial Elevation Blur), JavaScript ES6 Modules.
- **3D Engine:** Google `<model-viewer>` v3.5.0 with `@google/model-viewer-effects` Post-Processing Composer and custom PBR material controllers.
- **Development Server:** `server.py` (Python HTTP Server with CORS headers and GLB/USDZ/HDR MIME types on port 8080).
- **Environment Maps & Assets:** Polyhaven Studio HDRI (`./assets/studio.hdr`), Wheel option GLB files (`./assets/bmw_x7_wheel_1.glb`, `./assets/bmw_x7_wheel_2.glb`).

---

## 💎 Apple/VisionOS Liquid Glass UI & Reflex Optics System (`color-mix()` Engine)

Learned from [kube.io/blog/liquid-glass-css-svg](https://kube.io/blog/liquid-glass-css-svg/):

1. **`color-mix()` Physical Translucency & High-Saturation Optics:**
   - Base glass surfaces: `background: color-mix(in srgb, var(--c-glass) 12%, transparent);`.
   - Optical backdrop blur: `backdrop-filter: blur(22px) saturate(210%) contrast(104%);`.
   - Glass border: `border: 1px solid color-mix(in srgb, var(--c-light) 35%, transparent);`.

2. **8-Point Specular Inset Shadow Stack:**
   - Employs multi-tier physical inset shadows for crisp edge caustics and rim illumination:
     - Top-Left Rim: `inset 1.8px 3px 0px -2px color-mix(in srgb, var(--c-light) 95%, transparent)`.
     - Bottom-Right Caustic: `inset -2px -2px 0px -2px color-mix(in srgb, var(--c-light) 80%, transparent)`.
     - Deep Bevel Rim: `inset -3px -8px 1px -6px color-mix(in srgb, var(--c-light) 60%, transparent)`.
     - Internal Refraction: `inset -0.3px -1px 4px 0px color-mix(in srgb, var(--c-dark) 12%, transparent)`.
     - Contact Shadow: `0px 14px 36px 0px color-mix(in srgb, var(--c-dark) 28%, transparent)`.

3. **60fps Dynamic Cursor Spotlight Raycasting:**
   - Tracks cursor position relative to each `.liquid-glass-sheen` surface.
   - Smoothly lerps `--mouse-x`, `--mouse-y`, and `--mouse-opacity` at 60fps with a `0.14` damping factor to produce real-time dynamic light caustics across glass panels and cards.

4. **Illuminated Sapphire Liquid Lenses:**
   - Active/selected elements glow with dynamic illuminated sapphire liquid lens optics (`box-shadow: 0 0 24px color-mix(in srgb, var(--md-sys-color-primary) 40%, transparent), inset 0 0 16px color-mix(in srgb, var(--md-sys-color-primary) 45%, transparent)`), automatically adapting to the active vehicle paint color.

5. **Unified Spatial Information Architecture:**
   - **Zero Viewport Clutter:** Consolidates all controls into an ergonomic **Floating Spatial Deck** at bottom-center and an **Expandable Spatial Canvas** (anchored side-sheet on desktop/XR, bottom-sheet on mobile).
   - **5 Core Tabs:** (1) 🎨 Exterior Paints & Live MSRP, (2) 🛞 Wheels & Rims, (3) 💺 Cabin & Upholstery, (4) ⚡ Interactive Mechanics & Specs HUD, (5) ⚙️ 3D Studio Lab & Marmoset PBR Inspector.

6. **Strict Body Paint & Light Material Isolation:**
   - **Body Paint Material Isolation (`inmx7m60i_body`):** Swatches and paint controls MUST strictly target `inmx7m60i_body` (and variants starting with `inmx7m60i_body.`). Carbon trim, black grilles, and diffusers remain untouched.
   - **Strict Light Material Isolation:** Emissive factors apply **EXCLUSIVELY to the 14 genuine light materials** (`inmx7m60i_headlight`, `inmx7m60i_headlight2`, `inmx7m60i_highbeam`, `inmx7m60i_running_r`, `inmx7m60i_running_l`, `inmx7m60i_fog`, `inmx7m60i_signall`, `inmx7m60i_signalr`, `inmx7m60i_taillight`, `inmx7m60i_taillight2`, `inmx7m60i_taillight3`, `inmx7m60i_rearlights`, `inmx7m60i_chmsl`, `inmx7m60i_licenselight`). All 24 non-light materials enforced to `setEmissiveFactor([0, 0, 0])`.

---

## ⚙️ Operational Rules for AI Agents

- **Path Rules:** Always use relative paths (`./src/style.css`, `./src/main.js`, `./assets/...`) in `index.html` to guarantee compatibility across static hosting environments.
- **Testing:** Verify changes locally by running `python server.py` and testing in a modern browser.
- **Git Hygiene:** Ensure commit messages are descriptive and working directory status is clean before concluding tasks.
