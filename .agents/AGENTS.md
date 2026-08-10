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
   - **Zero Viewport Clutter:** Consolidates all controls into an ergonomic **Floating Spatial Deck** at bottom-center and an **Expandable Spatial Canvas** (anchored side-sheet on desktop/XR at `width: 530px`, bottom-sheet on mobile).
   - **5 Core Tabs:** (1) 🎨 Body Paint & Live MSRP, (2) 🛞 Wheels & Rims, (3) 💺 Cabin & Upholstery, (4) ⚡ Interactive Mechanics & Specs HUD, (5) ⚙️ 3D Studio Lab & Marmoset PBR Inspector.
   - **Camera Jump & Blender FOV Match:** Clicking "Cabin" POV jumps to Blender interior coordinates (`orbit: 177.6deg 77.2deg 1m`, `target: 0.182m 0.913m 1.038m`, `fov: 120deg`).

6. **Dock Pill Buttons Uniform Sizing & Centering:**
   - `.m3-deck-tab` buttons are strictly locked to `width: 86px; min-width: 86px; max-width: 86px; box-sizing: border-box;` with centered SVG icons (`20x20px`) and centered text labels.
   - Camera segment buttons (`.m3-seg-btn`) locked to `width: 54px; min-width: 54px; max-width: 54px; box-sizing: border-box;`.
   - `updateTabSlider()` & `updateSegSlider()` compute unscaled local layout offsets (`activeTab.offsetLeft` and `offsetWidth`) to avoid distortion during morph/scale transitions.

7. **Strict Body Paint & Light Material Isolation:**
   - **Body Paint Material Isolation (`inmx7m60i_body`):** Swatches and paint controls MUST strictly target `inmx7m60i_body` (and variants starting with `inmx7m60i_body.`). Carbon trim, black grilles, and diffusers remain untouched.
   - **Strict Light Material Isolation:** Emissive factors apply **EXCLUSIVELY to the 14 genuine light materials** (`inmx7m60i_headlight`, `inmx7m60i_headlight2`, `inmx7m60i_highbeam`, `inmx7m60i_running_r`, `inmx7m60i_running_l`, `inmx7m60i_fog`, `inmx7m60i_signall`, `inmx7m60i_signalr`, `inmx7m60i_taillight`, `inmx7m60i_taillight2`, `inmx7m60i_taillight3`, `inmx7m60i_rearlights`, `inmx7m60i_chmsl`, `inmx7m60i_licenselight`). All 24 non-light materials enforced to `setEmissiveFactor([0, 0, 0])`.

8. **Cinematic Volumetrics & Atmospheric Lighting:**
   - Volumetric headlight fog beams (`.volumetric-fog-wrapper`) are active by default (`opacity: 0.38` base, `0.55` active) with soft Gaussian radial gradients and 28px blur.
   - Strictly layered in background (`z-index: 0`, car canvas at `z-index: 1`) so beams NEVER overlap the car body.
   - Isolated with `isolation: isolate; transform: translate3d(0,0,0); backface-visibility: hidden;` to eliminate glass compositor jittering.

9. **SSAO Studio Pro Engine:**
   - Comprehensive Screen Space Ambient Occlusion suite in Studio ➔ Post-FX:
     - **Intensity:** `0.00` to `5.00` (step `0.05`).
     - **Radius (Occlusion Spread):** `0.01m` to `0.50m` (default `0.08m`).
     - **Distance Threshold & Falloff:** `0.95` threshold, `0.05` falloff to prevent flat background darkening.
     - **Anti-Acne Bias:** `0.015` (prevents self-shadowing acne).
     - **Sampling Quality:** Ultra Studio (32 Samples/8 Rings), High Fidelity (24 Samples/6 Rings), Balanced (16 Samples), Performance (11 Samples).
     - **Luminance Influence:** `0.40` (preserves bright specular highlights).
     - Live synchronization with `eff.ssaoMaterial.uniforms` and preset JSON export/import.

10. **Anti-Aliasing & High-Fidelity Rendering:**
    - Active and ON by default using **Studio Hybrid Anti-Aliasing** (`msaa="4"` on `<effect-composer>` + `<smaa-effect quality="high" preset="ultra">`).
    - Dynamic DPR calibration (`renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2.0))`) guarantees crystal-clear subpixel rasterization without downsampling blur.
    - Live AA Mode Selector: `Studio Hybrid`, `MSAA 4x`, `MSAA 8x`, `SMAA Ultra`, `SMAA High`, `Disabled`.

11. **Expanded Spatial Canvas & High-Contrast Typography:**
    - Spatial Canvas expanded to `width: 530px` (`max-width: min(560px, calc(100vw - 36px))`).
    - Material search, category filters (`.m3-filter-chip`), and 1-Click presets render with spacious horizontal scrolling and zero text clipping.
    - High-contrast typography: pure white labels (`rgba(255, 255, 255, 0.95)`) and illuminated sapphire value indicators (`#80D8FF`).

12. **Full-Spectrum Three.js Post-Processing & Cinema FX Suite:**
    - Supports 11 concurrent cinema-grade optical passes:
      - **Vignette:** Darkness (`0.00 - 1.50`), Offset (`0.00 - 1.00`), Technique (`Default` / `Eskil`).
      - **Film Grain:** Noise intensity (`0.00 - 1.00`), blend modes (`Overlay`, `Screen`, `SoftLight`, `Multiply`), dynamic 60fps film shutter PRNG jitter.
      - **Dynamic Motion Blur:** Directional camera velocity streaks reacting smoothly to orbital angular velocity ($\Delta \theta, \Delta \phi$) and POV jumps, coupled with studio speed streak and radial speed warp sliders.
      - **Chromatic Aberration:** Anamorphic prime lens dispersion offset (`0.000 - 0.020`) with radial falloff modulation.
      - **Depth of Field (Bokeh):** Focus distance (`0.1 - 15.0m`), aperture focal blur, bokeh scale, and 1-tap auto-focus targeting vehicle center.
      - **Digital Glitch:** Sporadic, Constant Wild, and Constant Mild modes with perturbation ratios.
      - **Scanlines:** Density, opacity, and scroll animation.
      - **Sepia Tone:** Classic analog monochromatic warm wash.
      - **Selective Bloom:** Headlight-isolated or global optical halo.
      - **SSAO Pro:** Crevice ambient occlusion with sample scaling (11 - 32 samples).
      - **Color Grading:** ACES Filmic, Reinhard, AgX, Neutral tone-mapping with contrast/saturation/brightness.
    - **Zero-Lag Reactive Controls:** All slider inputs bind to effect uniforms with zero latency and live illuminated sapphire value badges (`#80D8FF`).
    - **1-Click Cinematic Presets:** Instantaneous styling transitions for *Cinematic 35mm*, *Cyberpunk HUD*, *Speed Turntable*, *Portrait Studio Bokeh*, *Vintage Classic*, and *Pure PBR Studio*.

---

## ⚙️ Operational Rules for AI Agents

- **Path Rules:** Always use relative paths (`./src/style.css`, `./src/main.js`, `./assets/...`) in `index.html` to guarantee compatibility across static hosting environments.
- **Testing:** Verify changes locally by running `python server.py` and testing in a modern browser at `http://localhost:8080`.
- **Git Hygiene:** Ensure commit messages are descriptive and working directory status is clean before concluding tasks.
