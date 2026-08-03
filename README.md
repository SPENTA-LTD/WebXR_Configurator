# BMW X7 M60i - Interactive 3D Studio Configurator & WebXR AR Experience

An interactive, high-performance 3D car configurator built with HTML5, CSS3, JavaScript ES6, and `<model-viewer>`. Features Apple Liquid Glass UI, 16 official BMW paint colors, a live 3D Studio Lighting & Material Editor, wheel switcher, non-looping door animations, and mobile WebXR Augmented Reality.

---

## 🌟 Key Features

- **Apple Liquid Glass Design System:**
  - Frosted glass blur (`backdrop-filter: blur(14px) saturate(190%)`).
  - Specular edge bevel highlights (`inset 0 1px 1.5px 0 rgba(255, 255, 255, 0.9)`).
  - 100% circular swatches and pill-shaped continuous panel geometry (`border-radius: 40px` and `9999px`).
  - Interactive mouse cursor light refraction halos.

- **Strict Body Paint Material Isolation (`inmx7m60i_body`):**
  - Changing car body colors strictly modifies `inmx7m60i_body`. Black grilles, carbon trim, diffusers, headlights, and side skirts stay 100% untouched.

- **16 Official BMW Paint Colors & Live MSRP:**
  - Non-metallic ($0), Metallic ($0), BMW Individual ($1,950–$5,000), and Special Order ($5,500) finishes.
  - Universal baseline PBR parameters: `Paint Roughness = 0.12`, `Paint Metallic = 0.08`.
  - Dynamic total MSRP calculation updating vehicle price live.

- **Sketchfab Level Quality & Tone Mapping:**
  - `tone-mapping="neutral"` matching Sketchfab PBR shader engine.
  - Polyhaven Automotive Studio HDRI map (`./assets/studio.hdr`).

- **3D Studio Lighting & Material Editor Panel (`⚙️ 3D Studio Editor`):**
  - Live Light Exposure, Shadow Intensity, Shadow Softness sliders, HDRI environment map selector.
  - Real-time paint & seat color pickers (`<input type="color">`), roughness/metallic sliders.
  - 1-Click Copy Config JSON export button.

- **Dedicated Wheel Option Switcher:**
  - Dynamically swaps between `bmw_x7_wheel_1.glb` (Option 1) and `bmw_x7_wheel_2.glb` (Option 2) while preserving active color customizations.

- **Interactive Vehicle Controls:**
  - **Non-looping Door Animation (`🚪`):** Plays forward once to last frame (open) and reverses to first frame (closed).
  - **Window Roll Tinting (`🪟`).**
  - **Headlight Illumination (`💡`).**
  - **HTML5 Fullscreen View (`⛶`).**
  - **Spatial Studio Theme (`🌓`) & 360° Auto-Rotate (`🔄`).**
  - **WebXR / AR Mobile Placement.**

---

## 🚀 Quick Start (Local Setup)

1. **Clone the repository:**
   ```bash
   git clone https://github.com/<your-username>/BMW-X7-3D-Studio.git
   cd BMW-X7-3D-Studio
   ```

2. **Launch a local server:**
   ```bash
   python -m http.server 8000
   ```

3. **Open in Browser:**
   Navigate to `http://localhost:8000`.

---

## 📁 Repository Structure

```
.
├── index.html                  # Main application markup & studio layout
├── src/
│   ├── main.js                 # 3D configurator logic, GLB switcher & editor
│   └── style.css               # Apple Liquid Glass CSS design tokens & layout
├── assets/
│   ├── bmw_x7_wheel_1.glb      # Option 1 Wheel & Tire GLB 3D model
│   ├── bmw_x7_wheel_2.glb      # Option 2 Wheel & Tire GLB 3D model
│   └── studio.hdr              # Polyhaven Automotive Studio HDRI map
├── README.md                   # Documentation
└── .gitignore                  # Git ignore definitions
```

---

## 📄 License

MIT License. Designed for WebXR 3D e-commerce showcase.
