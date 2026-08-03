# Project Memory & Agent Guidelines: BMW X7 3D WebXR Configurator

This repository contains the interactive 3D Studio Configurator and WebXR Augmented Reality experience for the **BMW X7 M60i**.

---

## 🏗️ Architecture & Technical Stack

- **Frontend:** Standard HTML5, Vanilla CSS3 (Apple Liquid Glass Design Tokens), JavaScript ES6 Modules.
- **3D Engine:** Google `<model-viewer>` v3.5.0 with custom PBR material controllers.
- **Development Server:** `server.py` (Python HTTP Server with CORS headers and GLB/USDZ/HDR MIME types on port 8080).
- **Environment Maps & Assets:** Polyhaven Studio HDRI (`./assets/studio.hdr`), Wheel option GLB files (`./assets/bmw_x7_wheel_1.glb`, `./assets/bmw_x7_wheel_2.glb`).

---

## 🎨 Strict Material Isolation & Design Rules

1. **Body Paint Material Isolation (`inmx7m60i_body`):**
   - Color swatches & paint controls MUST strictly target `inmx7m60i_body` (and variants starting with `inmx7m60i_body.`).
   - Never apply paint colors globally to all materials; black grilles, carbon trim, headlights, taillights, diffusers, and side skirts must remain untouched.

2. **Apple Liquid Glass UI System:**
   - Visual tokens: `backdrop-filter: blur(14px) saturate(190%)`.
   - Specular bevels: `inset 0 1px 1.5px 0 rgba(255, 255, 255, 0.9)`.
   - Curvatures: `border-radius: 40px` for cards/drawers and `9999px` for pill buttons.
   - Swatches: 100% circular swatches with interactive hover scale and active ring borders.

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
