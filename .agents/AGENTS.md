# Project Memory & Agent Guidelines: BMW X7 3D WebXR Configurator

This repository contains the interactive 3D Studio Configurator and WebXR Augmented Reality experience for the **BMW X7 M60i**.

---

## 🏗️ Architecture & Technical Stack

- **Frontend:** Standard HTML5, Vanilla CSS3 (Apple Liquid Glass Design Tokens & `color-mix()` Reflex Engine), JavaScript ES6 Modules.
- **3D Engine:** Google `<model-viewer>` v3.5.0 with custom PBR material controllers.
- **Development Server:** `server.py` (Python HTTP Server with CORS headers and GLB/USDZ/HDR MIME types on port 8080).
- **Environment Maps & Assets:** Polyhaven Studio HDRI (`./assets/studio.hdr`), Wheel option GLB files (`./assets/bmw_x7_wheel_1.glb`, `./assets/bmw_x7_wheel_2.glb`).

---

## 🎨 Strict Material Isolation & Design Rules

1. **Body Paint Material Isolation (`inmx7m60i_body`):**
   - Color swatches & paint controls MUST strictly target `inmx7m60i_body` (and variants starting with `inmx7m60i_body.`).
   - Never apply paint colors globally to all materials; black grilles, carbon trim, headlights, taillights, diffusers, and side skirts must remain untouched.

2. **Apple Liquid Glass UI & Reflex Optics System (`color-mix()` Engine):**
   - **Reflex Multipliers:** Uses `--glass-reflex-light` (1.0 light theme, 0.35 dark theme) and `--glass-reflex-dark` (1.0 light theme, 2.2 dark theme) to calculate optical reflections dynamically.
   - **10-Point Specular Shadow Stack:** Employs multi-tier `color-mix(in srgb, ...)` inset shadows to compute crisp top-left rim highlights, edge caustics, and ambient drop shadows.
   - **Right Dock Anatomy System:** Vertical glass pill container (`.studio-right-dock`). Each item features a 100% round circular liquid glass disk (`.dock-circle-disk`, 48px), icon, uppercase label text underneath (`.dock-label`), and active VisionOS illuminated sapphire glass lens optics. Excludes green status dots, FAB (8), and Menu icon (9).
   - **Dual-Layer Refraction Pseudo-Elements:** `::before` fixed lens sheen + `::after` cursor light spotlight (`mix-blend-mode: overlay` / `color-dodge`).
   - **Lerped Animation Damping:** `requestAnimationFrame` animation loop in `main.js` lerping `--mouse-x`, `--mouse-y`, and `--mouse-opacity` per glass panel.
   - Curvatures & Swatches: `border-radius: 40px` for panels/drawers, `50%` round circular glass disks for dock buttons, 100% circular swatches with scale toggle spring keyframe feedback.

3. **16 Official BMW Paint Finishes & Live MSRP:**
   - Base Price: **$108,700** starting MSRP.
   - Finishes: Non-metallic ($0), Metallic ($0), BMW Individual ($1,950–$5,000), Special Order ($5,500).
   - Baseline PBR setup: `Paint Roughness = 0.12`, `Paint Metallic = 0.08`.

4. **3D Studio Editor Panel (`⚙️ 3D Studio Editor`):**
   - Floating panel allowing live adjustments to:
     - Scene Light Exposure (0.5 - 3.0).
     - Shadow Intensity & Softness.
     - Paint & Seat Color pickers.
     - Paint Roughness & Metallic factors.
     - Configuration export to structured JSON.

5. **Camera Views & Animations:**
   - Radio Nav Presets: `overview`, `specifications`, `interior`, `wheels`, `lights`, `doors`.
   - Wheel Switcher: Seamless GLB swap preserving active paint state.
   - Non-looping Door Animation: Plays forward once (open) or reverses to frame 0 (closed).

---

## ⚙️ Operational Rules for AI Agents

- **Path Rules:** Always use relative paths (`./src/style.css`, `./src/main.js`, `./assets/...`) in `index.html` to guarantee compatibility across static hosting environments.
- **Testing:** Verify changes locally by running `python server.py` and testing in a modern browser.
- **Git Hygiene:** Ensure commit messages are descriptive and working directory status is clean before concluding tasks.
