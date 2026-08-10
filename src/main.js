/**
 * BMW X7 M60i - Apple/VisionOS Liquid Glass 3D Configurator & WebXR Engine
 * Refraction Optics, Dynamic Cursor Raycasting & Adaptive High-Contrast Typography
 * Learned from: https://kube.io/blog/liquid-glass-css-svg/
 */

import * as THREE from 'three';
import {
  VignetteEffect,
  NoiseEffect,
  ChromaticAberrationEffect,
  DepthOfFieldEffect,
  ScanlineEffect,
  SepiaEffect,
  GlitchEffect,
  EffectPass,
  ShaderPass,
  BlendFunction,
  VignetteTechnique
} from 'postprocessing';

document.addEventListener('DOMContentLoaded', () => {
  // Core DOM Elements
  const modelViewer = document.getElementById('bmw-viewer');
  const viewerLoader = document.querySelector('.viewer-loader');
  const studioContainer = document.getElementById('studio-container');
  const studioWatermark = document.getElementById('studio-watermark');
  
  // Top App Bar Elements
  const activePaintLbl = document.getElementById('active-paint-lbl');
  const topPriceDisplay = document.getElementById('top-price-display');
  const totalPriceDisplay = document.getElementById('total-price-display');
  const buildSummaryLbl = document.getElementById('build-summary-lbl');
  const navArTrigger = document.getElementById('nav-ar-trigger');

  // Liquid Glass Spatial Canvas & Navigation Tabs
  const spatialCanvas = document.getElementById('m3-spatial-canvas');
  const closeCanvasBtn = document.getElementById('close-spatial-canvas-btn');
  const canvasBadgeText = document.getElementById('canvas-badge-text');
  const canvasTitleText = document.getElementById('canvas-title-text');
  const deckTabs = document.querySelectorAll('.m3-deck-tab');
  const tabPanels = document.querySelectorAll('.m3-tab-panel');

  // Apple iOS Dynamic Sliding Capsules
  const tabSlider = document.getElementById('liquid-tab-slider');
  const deckTabsContainer = document.getElementById('m3-deck-tabs');
  const segSlider = document.getElementById('liquid-seg-slider');
  const segCameraBar = document.getElementById('m3-segmented-camera');

  // Active Selection Displays
  const activeFinishTitle = document.getElementById('active-finish-title');
  const activeFinishPrice = document.getElementById('active-finish-price');
  const activeWheelTitle = document.getElementById('active-wheel-title');
  const activeInteriorTitle = document.getElementById('active-interior-title');

  // Interactive Mechanics Switches
  const toggleDoorsBtn = document.getElementById('toggle-doors-btn');
  const toggleWindowsBtn = document.getElementById('toggle-windows-btn');
  const toggleLightsBtn = document.getElementById('toggle-lights-btn');
  const volumetricFogContainer = document.getElementById('volumetric-fog-container');

  // Segmented Camera Buttons
  const segCamBtns = document.querySelectorAll('.m3-seg-btn');

  // Deck Utility Buttons
  const themeToggleBtn = document.getElementById('theme-toggle-btn');
  const toggleAutoRotateBtn = document.getElementById('toggle-autorotate-btn');
  const toggleFullscreenBtn = document.getElementById('toggle-fullscreen-btn');
  const dockArTriggerBtn = document.getElementById('dock-ar-trigger-btn');

  // ==========================================================================
  // State Management
  // ==========================================================================
  const BASE_PRICE = 108700;
  let currentPaintPrice = 0;
  let currentPaintHex = '#FDFDFD';
  let currentPaintName = 'Alpine White';
  let currentPaintRoughness = 0.12;
  let currentPaintMetallic = 0.08;

  let currentSeatHex = '#8B4513';
  let currentSeatName = 'Cognac Brown Leather';
  let currentWheelOption = 'set1';
  let currentWheelName = '19" Tempest Wheels - Silver';

  let isDoorsOpen = false;
  let isWindowsDown = false;
  let lightsOn = false;
  let isAutoRotating = false;
  let isDarkStudioTheme = true;
  let activeTabKey = null;

  // Lighting & Base Post-FX State
  let currentExposure = 1.10;
  let currentShadowIntensity = 1.50;
  let currentShadowSoftness = 0.30;
  let currentHdri = './assets/studio.hdr';

  let bloomMode = 'headlight';
  let bloomIntensity = 1.00;
  let bloomRadius = 0.40;
  let bloomThreshold = 0.74;

  // SSAO Pro Parameters (Contact Shadows & Depth Crevices)
  let ssaoIntensity = 0.00;
  let ssaoRadius = 0.08;
  let ssaoThreshold = 0.95;
  let ssaoFalloff = 0.05;
  let ssaoBias = 0.015;
  let ssaoQuality = 'high';
  let ssaoSamples = 24;
  let ssaoRings = 6;
  let ssaoLuminance = 0.40;

  // Cinematic Vignette State
  let vignetteDarkness = 0.00;
  let vignetteOffset = 0.30;
  let vignetteTechnique = 'default';

  // Film Grain & Analog Shutter Noise State
  let grainIntensity = 0.00;
  let grainBlendMode = 'overlay';
  let isGrainAnimated = true;

  // Camera Motion Blur & Dynamic Velocity State
  let motionBlurStrength = 0.00;
  let isDynamicMotionBlur = true;
  let turntableStreak = 0.00;
  let motionRadialWarp = 0.00;
  let motionSamples = 16;

  // Chromatic Aberration & Lens Fringing State
  let chromaticOffset = 0.000;
  let chromaticFalloff = 1.0;

  // Photographic Depth of Field (Bokeh) State
  let dofFocusDistance = 4.2;
  let dofAperture = 0.00;
  let dofBokehScale = 2.0;

  // Digital Glitch & CRT Telemetry State
  let glitchMode = 'off';
  let glitchStrength = 0.50;
  let glitchRatio = 0.50;
  let scanlineDensity = 0.0;
  let scanlineOpacity = 0.00;

  // Vintage Sepia Tone Wash State
  let sepiaIntensity = 0.00;

  // Color Grading & Tonemapping
  let colorContrast = 0.00;
  let colorSaturation = 0.00;
  let colorBrightness = -0.03;
  let colorTonemapping = 'aces';

  // Anti-Aliasing (Edge Smoothing Engine)
  let aaMode = 'hybrid';
  let renderScale = 'auto';

  // Camera Presets (Matched with Blender Interioir_Camera)
  const CAMERA_PRESETS = {
    'front': { orbit: '45deg 75deg 6m', target: 'auto auto auto', fov: '35deg', watermark: 'BODY PAINT' },
    'side': { orbit: '90deg 85deg 5.5m', target: '0m 0.4m 0m', fov: '35deg', watermark: 'PROFILE' },
    'cabin': { orbit: '177.6deg 77.2deg 1m', target: '0.182m 0.913m 1.038m', fov: '120deg', watermark: 'INTERIOR' },
    'rear': { orbit: '135deg 80deg 6m', target: 'auto auto auto', fov: '35deg', watermark: 'REAR' },
    'wheels': { orbit: '65deg 88deg 2.4m', target: '0.75m 0.35m 1.35m', fov: '35deg', watermark: 'WHEELS' },
    'lights': { orbit: '15deg 82deg 4.2m', target: '0m 0.6m 1.8m', fov: '35deg', watermark: 'LIGHTS' },
    'mechanics': { orbit: '65deg 75deg 6.5m', target: 'auto auto auto', fov: '35deg', watermark: 'MECHANICS' }
  };

  const TAB_METADATA = {
    'exterior': { badge: 'BODY PAINT', title: 'Body Paint & Finishes', cam: 'front', watermark: 'BODY PAINT' },
    'wheels': { badge: 'WHEELS & RIMS', title: 'Wheel Options', cam: 'wheels', watermark: 'WHEELS & RIMS' },
    'interior': { badge: 'CABIN & UPHOLSTERY', title: 'Luxury Seats', cam: 'cabin', watermark: 'CABIN & UPHOLSTERY' },
    'mechanics': { badge: 'FEATURES & PERFORMANCE', title: 'Interactive Mechanics', cam: 'mechanics', watermark: 'MECHANICS & SPECS' },
    'studio': { badge: '3D PRO STUDIO', title: 'Lighting & PBR Lab', cam: 'front', watermark: '3D STUDIO LAB' }
  };

  // ==========================================================================
  // Liquid Glass Optics Engine: 60fps Dynamic Cursor Spotlight Raycasting
  // (kube.io Physics-based Refraction & Dynamic Specular Sheen)
  // ==========================================================================
  const glassElements = document.querySelectorAll('.liquid-glass-sheen');
  const trackedGlassState = new Map();

  glassElements.forEach(el => {
    trackedGlassState.set(el, {
      currentX: 50,
      currentY: 50,
      targetX: 50,
      targetY: 50,
      currentOpacity: 0.2,
      targetOpacity: 0.2,
      isHovered: false
    });

    el.addEventListener('mousemove', (e) => {
      const rect = el.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width) * 100;
      const y = ((e.clientY - rect.top) / rect.height) * 100;
      const state = trackedGlassState.get(el);
      if (state) {
        state.targetX = x;
        state.targetY = y;
        state.targetOpacity = 0.65;
        state.isHovered = true;
      }
    });

    el.addEventListener('mouseleave', () => {
      const state = trackedGlassState.get(el);
      if (state) {
        state.targetOpacity = 0.2;
        state.isHovered = false;
      }
    });
  });

  function animateLiquidGlassSheen() {
    trackedGlassState.forEach((state, el) => {
      // 0.14 Lerp damping for smooth physical liquid glint
      state.currentX += (state.targetX - state.currentX) * 0.14;
      state.currentY += (state.targetY - state.currentY) * 0.14;
      state.currentOpacity += (state.targetOpacity - state.currentOpacity) * 0.14;

      el.style.setProperty('--mouse-x', `${state.currentX.toFixed(1)}%`);
      el.style.setProperty('--mouse-y', `${state.currentY.toFixed(1)}%`);
      el.style.setProperty('--mouse-opacity', state.currentOpacity.toFixed(3));
    });
    requestAnimationFrame(animateLiquidGlassSheen);
  }
  requestAnimationFrame(animateLiquidGlassSheen);

  // ==========================================================================
  // Strict Light Material Isolation (14 Authentic Light Materials)
  // ==========================================================================
  const LIGHT_MATERIAL_NAMES = new Set([
    'inmx7m60i_headlight',
    'inmx7m60i_headlight2',
    'inmx7m60i_highbeam',
    'inmx7m60i_running_r',
    'inmx7m60i_running_l',
    'inmx7m60i_fog',
    'inmx7m60i_signall',
    'inmx7m60i_signalr',
    'inmx7m60i_taillight',
    'inmx7m60i_taillight2',
    'inmx7m60i_taillight3',
    'inmx7m60i_rearlights',
    'inmx7m60i_chmsl',
    'inmx7m60i_licenselight'
  ]);

  function isActualLightMaterial(matName) {
    if (!matName) return false;
    const name = matName.toLowerCase().trim();
    if (LIGHT_MATERIAL_NAMES.has(name)) return true;
    return (name.includes('headlight') || name.includes('taillight') || name.includes('highbeam') || name.includes('running_') || name.includes('rearlight')) &&
           !name.includes('glass') && !name.includes('body') && !name.includes('black') && !name.includes('chrome') && !name.includes('int') && !name.includes('leather');
  }

  function hexToRgbNormalized(hex) {
    hex = hex.replace('#', '');
    if (hex.length === 3) hex = hex.split('').map(c => c + c).join('');
    const num = parseInt(hex, 16);
    return [((num >> 16) & 255) / 255, ((num >> 8) & 255) / 255, (num & 255) / 255, 1.0];
  }

  function getHexLuminance(hex) {
    const rgb = hexToRgbNormalized(hex);
    return 0.2126 * rgb[0] + 0.7152 * rgb[1] + 0.0722 * rgb[2];
  }

  // Update Dynamic Theme Accent color matching active vehicle paint & theme mode
  function updateDynamicThemeAccent(hex) {
    const isLight = !isDarkStudioTheme || document.body.classList.contains('light-theme');

    if (!hex || hex === '#FDFDFD' || hex === '#FFFFFF' || hex === '#ECEEEF') {
      const defaultAccent = isLight ? '#0066B1' : '#80D8FF';
      document.documentElement.style.setProperty('--md-sys-color-primary', defaultAccent);
      return;
    }

    const lum = getHexLuminance(hex);
    if (isLight && lum > 0.65) {
      document.documentElement.style.setProperty('--md-sys-color-primary', '#0066B1');
    } else {
      document.documentElement.style.setProperty('--md-sys-color-primary', hex);
    }
  }

  // Update Live MSRP Counter
  function updatePriceDisplay() {
    const total = BASE_PRICE + currentPaintPrice;
    const formatted = `$${total.toLocaleString()}`;
    if (topPriceDisplay) topPriceDisplay.textContent = formatted;
    if (totalPriceDisplay) totalPriceDisplay.textContent = formatted;

    const priceDelta = currentPaintPrice > 0 ? `(+$${currentPaintPrice.toLocaleString()})` : '($0)';
    if (activePaintLbl) activePaintLbl.textContent = `2026. ${currentPaintName.toUpperCase()} ${priceDelta}`;
    if (activeFinishTitle) activeFinishTitle.textContent = currentPaintName;
    if (activeFinishPrice) activeFinishPrice.textContent = currentPaintPrice > 0 ? `+$${currentPaintPrice.toLocaleString()}` : '$0';
    if (buildSummaryLbl) buildSummaryLbl.textContent = `${currentPaintName} • 523 HP V8`;
  }

  // Locate Three.js Scene Root in Model-Viewer
  function getThreeScene() {
    if (!modelViewer) return null;
    const effectComposer = document.getElementById('effect-composer');
    if (effectComposer) {
      const ecSymbols = Object.getOwnPropertySymbols(effectComposer);
      for (const sym of ecSymbols) {
        try {
          const val = effectComposer[sym];
          if (val && typeof val === 'object' && (val.isScene || typeof val.traverse === 'function')) return val;
        } catch (e) {}
      }
    }
    if (modelViewer.scene && typeof modelViewer.scene.traverse === 'function') return modelViewer.scene;
    const mvSymbols = Object.getOwnPropertySymbols(modelViewer);
    for (const sym of mvSymbols) {
      try {
        const val = modelViewer[sym];
        if (val && typeof val === 'object' && (val.isScene || val.isGroup || val.isObject3D) && typeof val.traverse === 'function') {
          return val;
        }
      } catch (e) {}
    }
    return null;
  }

  // Locate WebGL Renderer in Model-Viewer or Effect-Composer
  function getThreeRenderer() {
    if (!modelViewer) return null;
    const effectComposer = document.getElementById('effect-composer');
    if (effectComposer) {
      const ecSymbols = Object.getOwnPropertySymbols(effectComposer);
      for (const sym of ecSymbols) {
        try {
          const val = effectComposer[sym];
          if (val && typeof val === 'object' && (val.isWebGLRenderer || val.capabilities)) return val;
        } catch (e) {}
      }
    }
    const mvSymbols = Object.getOwnPropertySymbols(modelViewer);
    for (const sym of mvSymbols) {
      try {
        const val = modelViewer[sym];
        if (val && typeof val === 'object') {
          if (val.isWebGLRenderer || val.capabilities) return val;
          if (val.renderer && (val.renderer.isWebGLRenderer || val.renderer.capabilities)) return val.renderer;
        }
      } catch (e) {}
    }
    return null;
  }

  // Find all meshes that use genuine light materials
  function getLightMeshes() {
    const scene = getThreeScene();
    const lightMeshes = [];
    if (!scene) return lightMeshes;
    scene.traverse((child) => {
      if (child && child.isMesh && child.material) {
        let isLight = false;
        if (Array.isArray(child.material)) {
          isLight = child.material.some(m => m && isActualLightMaterial(m.name));
        } else if (child.material.name) {
          isLight = isActualLightMaterial(child.material.name);
        }
        if (isLight) lightMeshes.push(child);
      }
    });
    return lightMeshes;
  }

  // Smooth Emissive Animation Engine (0.0 to 1.0)
  let currentEmissiveProgress = 0.0;
  let targetEmissiveProgress = 0.0;
  let emissiveAnimFrame = null;

  function animateEmissiveTransition() {
    const diff = targetEmissiveProgress - currentEmissiveProgress;
    if (Math.abs(diff) < 0.005) {
      currentEmissiveProgress = targetEmissiveProgress;
      applyEmissiveToScene(currentEmissiveProgress);
      emissiveAnimFrame = null;
      return;
    }

    currentEmissiveProgress += diff * 0.16; // smooth exponential damping
    applyEmissiveToScene(currentEmissiveProgress);
    emissiveAnimFrame = requestAnimationFrame(animateEmissiveTransition);
  }

  // Update Emissive Factors exclusively on genuine light materials
  function applyEmissiveToScene(progress = currentEmissiveProgress) {
    const scale = Math.min(2.5, Math.max(0.8, bloomIntensity * 0.5)) * progress;

    if (modelViewer && modelViewer.model) {
      modelViewer.model.materials.forEach(mat => {
        const mName = mat.name ? mat.name.toLowerCase() : '';
        if (isActualLightMaterial(mName)) {
          if (progress > 0.001) {
            if (mName.includes('tail') || mName.includes('chmsl') || mName.includes('rearlight')) {
              mat.setEmissiveFactor([2.5 * scale, 0.08 * scale, 0.08 * scale]);
            } else if (mName.includes('signal')) {
              mat.setEmissiveFactor([2.0 * scale, 1.0 * scale, 0.05 * scale]);
            } else {
              mat.setEmissiveFactor([2.5 * scale, 2.5 * scale, 2.8 * scale]);
            }
          } else {
            mat.setEmissiveFactor([0, 0, 0]);
          }
        } else {
          if (typeof mat.setEmissiveFactor === 'function') {
            mat.setEmissiveFactor([0, 0, 0]);
          }
        }
      });
    }

    const scene = getThreeScene();
    if (scene) {
      scene.traverse((child) => {
        if (child && child.isMesh && child.material) {
          const mList = Array.isArray(child.material) ? child.material : [child.material];
          mList.forEach(m => {
            if (m && isActualLightMaterial(m.name)) {
              if (progress > 0.001) {
                if (m.name.includes('tail') || m.name.includes('chmsl') || m.name.includes('rearlight')) {
                  if (m.emissive) m.emissive.setRGB(1.0 * progress, 0.05 * progress, 0.05 * progress);
                } else if (m.name.includes('signal')) {
                  if (m.emissive) m.emissive.setRGB(0.9 * progress, 0.45 * progress, 0.02 * progress);
                } else {
                  if (m.emissive) m.emissive.setRGB(1.0 * progress, 1.0 * progress, 1.0 * progress);
                }
                if (m.emissiveIntensity !== undefined) m.emissiveIntensity = scale;
              } else {
                if (m.emissive) m.emissive.setRGB(0, 0, 0);
                if (m.emissiveIntensity !== undefined) m.emissiveIntensity = 0;
              }
              m.needsUpdate = true;
            }
          });
        }
      });
    }

    if (volumetricFogContainer) {
      if (bloomMode === 'off') {
        volumetricFogContainer.style.opacity = '0';
      } else {
        const fogOpacity = 0.38 + (0.17 * progress);
        volumetricFogContainer.classList.toggle('active', progress > 0.05);
        volumetricFogContainer.style.opacity = fogOpacity.toFixed(2);
      }
    }
  }

  function updateEmissiveMaterials() {
    applyEmissiveToScene(currentEmissiveProgress);
  }

  // Target headlight meshes for selective-bloom-effect
  function updateSelectiveBloomSelection(mode = 'headlight') {
    const bloomEffect = document.getElementById('bloom-effect');
    if (!bloomEffect) return;

    if (mode === 'off') {
      bloomEffect.selection = [];
      if (bloomEffect.effects && bloomEffect.effects[0] && bloomEffect.effects[0].selection) {
        bloomEffect.effects[0].selection.clear();
      }
      return;
    }

    if (mode === 'headlight') {
      const lightMeshes = getLightMeshes();
      bloomEffect.selection = [...lightMeshes];
      if (bloomEffect.effects && bloomEffect.effects[0] && bloomEffect.effects[0].selection) {
        bloomEffect.effects[0].selection.clear();
        lightMeshes.forEach(mesh => bloomEffect.effects[0].selection.add(mesh));
      }
    } else if (mode === 'all') {
      bloomEffect.selection = [];
      if (bloomEffect.effects && bloomEffect.effects[0] && bloomEffect.effects[0].selection) {
        bloomEffect.effects[0].selection.clear();
      }
    }
  }

  // ==========================================================================
  // Three.js Post-Processing Passes & Dynamic Motion Blur Engine
  // ==========================================================================
  let vignetteEffect = null;
  let noiseEffect = null;
  let chromaticAberrationEffect = null;
  let scanlineEffect = null;
  let sepiaEffect = null;
  let glitchEffect = null;
  let dofEffect = null;
  let motionBlurPass = null;
  let cinemaOpticsPass = null;
  let isCustomPassesAttached = false;

  // Directional & Radial Motion Blur Shader
  const MotionBlurShader = {
    uniforms: {
      inputBuffer: { value: null },
      uVelocity: { value: new THREE.Vector2(0.0, 0.0) },
      uStrength: { value: 0.0 },
      uRadial: { value: 0.0 },
      uSamples: { value: 16 }
    },
    vertexShader: `
      varying vec2 vUv;
      void main() {
        vUv = uv;
        gl_Position = vec4(position, 1.0);
      }
    `,
    fragmentShader: `
      uniform sampler2D inputBuffer;
      uniform vec2 uVelocity;
      uniform float uStrength;
      uniform float uRadial;
      uniform int uSamples;
      varying vec2 vUv;

      void main() {
        float s = uStrength;
        vec2 vel = uVelocity;
        float r = uRadial;
        if (s <= 0.001 && length(vel) <= 0.0001 && r <= 0.001) {
          gl_FragColor = texture2D(inputBuffer, vUv);
          return;
        }
        vec2 baseDir = vel * s;
        vec2 radialDir = (vUv - vec2(0.5, 0.5)) * r * s;
        vec2 dir = baseDir + radialDir;
        
        if (length(dir) <= 0.0001) {
          gl_FragColor = texture2D(inputBuffer, vUv);
          return;
        }

        vec4 color = vec4(0.0);
        float total = 0.0;
        int n = clamp(uSamples, 4, 32);
        float fn = float(n);
        
        for (int i = 0; i < 32; i++) {
          if (i >= n) break;
          float t = (float(i) / (fn - 1.0)) - 0.5;
          vec2 offset = dir * t;
          color += texture2D(inputBuffer, clamp(vUv + offset, 0.0, 1.0));
          total += 1.0;
        }
        gl_FragColor = color / total;
      }
    `
  };

  function initPostProcessingPasses() {
    if (isCustomPassesAttached) return;
    const effectComposer = document.getElementById('effect-composer');
    if (!effectComposer) return;

    try {
      // 1. Create Cinema Effects
      vignetteEffect = new VignetteEffect({
        offset: vignetteOffset,
        darkness: vignetteDarkness,
        technique: VignetteTechnique.DEFAULT
      });
      vignetteEffect.disabled = (vignetteDarkness <= 0.001);

      noiseEffect = new NoiseEffect({
        blendFunction: BlendFunction.OVERLAY,
        premultiply: false
      });
      noiseEffect.blendMode.opacity.value = grainIntensity;
      noiseEffect.disabled = (grainIntensity <= 0.001);

      chromaticAberrationEffect = new ChromaticAberrationEffect({
        offset: new THREE.Vector2(chromaticOffset, chromaticOffset),
        radialModulation: true,
        modulationOffset: chromaticFalloff
      });
      chromaticAberrationEffect.disabled = (chromaticOffset <= 0.0001);

      scanlineEffect = new ScanlineEffect({
        density: scanlineDensity,
        scrollSpeed: 0.02,
        blendFunction: BlendFunction.OVERLAY
      });
      scanlineEffect.blendMode.opacity.value = scanlineOpacity;
      scanlineEffect.disabled = (scanlineOpacity <= 0.001 || scanlineDensity <= 0.001);

      sepiaEffect = new SepiaEffect({
        intensity: sepiaIntensity,
        blendFunction: BlendFunction.NORMAL
      });
      sepiaEffect.blendMode.opacity.value = sepiaIntensity;
      sepiaEffect.disabled = (sepiaIntensity <= 0.001);

      glitchEffect = new GlitchEffect({
        delay: new THREE.Vector2(1.5, 3.5),
        duration: new THREE.Vector2(0.3, 0.6),
        strength: new THREE.Vector2(0.2, 0.5)
      });
      glitchEffect.disabled = (glitchMode === 'off');

      // 2. Camera DoF Effect
      try {
        dofEffect = new DepthOfFieldEffect(undefined, {
          focusDistance: dofFocusDistance / 100.0,
          focalLength: dofAperture,
          bokehScale: dofBokehScale
        });
        dofEffect.disabled = (dofAperture <= 0.001);
      } catch (err) {
        console.warn('DoF init fallback:', err);
      }

      // 3. Motion Blur Pass
      const mbMat = new THREE.ShaderMaterial({
        uniforms: MotionBlurShader.uniforms,
        vertexShader: MotionBlurShader.vertexShader,
        fragmentShader: MotionBlurShader.fragmentShader,
        depthTest: false,
        depthWrite: false
      });
      motionBlurPass = new ShaderPass(mbMat, 'inputBuffer');

      // 4. Cinema Optics Combined Pass
      const effectList = [
        dofEffect,
        chromaticAberrationEffect,
        vignetteEffect,
        noiseEffect,
        scanlineEffect,
        sepiaEffect,
        glitchEffect
      ].filter(Boolean);

      cinemaOpticsPass = new EffectPass(undefined, ...effectList);

      // Add passes to Effect Composer
      if (typeof effectComposer.addPass === 'function') {
        effectComposer.addPass(motionBlurPass);
        effectComposer.addPass(cinemaOpticsPass);
        isCustomPassesAttached = true;
      }
    } catch (err) {
      console.warn('Post-Processing Passes init notice:', err);
    }
  }

  // 60fps Dynamic Camera Velocity Tracker for Orbit & Jump Motion Blur
  let lastTheta = null;
  let lastPhi = null;
  let lastRadius = null;
  let orbitVelocity = new THREE.Vector2(0, 0);
  let smoothedVelocity = new THREE.Vector2(0, 0);

  function trackCameraMotion() {
    if (modelViewer) {
      try {
        const orbit = modelViewer.getCameraOrbit();
        if (orbit) {
          if (lastTheta !== null && lastPhi !== null) {
            let dTheta = orbit.theta - lastTheta;
            const dPhi = orbit.phi - lastPhi;
            const dRadius = (orbit.radius - (lastRadius || orbit.radius)) * 0.4;

            while (dTheta > Math.PI) dTheta -= Math.PI * 2;
            while (dTheta < -Math.PI) dTheta += Math.PI * 2;

            orbitVelocity.x = dTheta * 1.2;
            orbitVelocity.y = dPhi * 1.2 + dRadius * 0.5;
          }
          lastTheta = orbit.theta;
          lastPhi = orbit.phi;
          lastRadius = orbit.radius;
        }
      } catch (e) {}

      // Exponential damping
      smoothedVelocity.x += (orbitVelocity.x - smoothedVelocity.x) * 0.22;
      smoothedVelocity.y += (orbitVelocity.y - smoothedVelocity.y) * 0.22;
      orbitVelocity.multiplyScalar(0.72);

      // Update Motion Blur Pass Uniforms
      if (motionBlurPass && motionBlurPass.material && motionBlurPass.material.uniforms) {
        const u = motionBlurPass.material.uniforms;
        const dyn = isDynamicMotionBlur ? 1.0 : 0.0;
        const totalVx = (smoothedVelocity.x * dyn) + (turntableStreak * 0.035);
        const totalVy = (smoothedVelocity.y * dyn);
        u.uVelocity.value.set(totalVx, totalVy);
        u.uStrength.value = Math.max(motionBlurStrength, (turntableStreak > 0 ? turntableStreak : 0));
        u.uRadial.value = motionRadialWarp;
        u.uSamples.value = motionSamples;
      }

      // Film Grain Shutter Animation
      if (isGrainAnimated && noiseEffect && noiseEffect.texture && noiseEffect.texture.offset) {
        noiseEffect.texture.offset.set(Math.random(), Math.random());
      }
    }

    requestAnimationFrame(trackCameraMotion);
  }
  trackCameraMotion();

  // Apply Live Post-FX
  function applyPostFx() {
    if (!modelViewer) return;
    modelViewer.toneMapping = 'none';
    modelViewer.setAttribute('tone-mapping', 'none');

    const bloomEffect = document.getElementById('bloom-effect');
    const ssaoEffect = document.getElementById('ssao-effect');
    const colorGradeEffect = document.getElementById('color-grade-effect');
    const effectComposer = document.getElementById('effect-composer');

    initPostProcessingPasses();

    // 1. Bloom
    if (bloomEffect) {
      if (bloomMode === 'off' || bloomIntensity <= 0 || (bloomMode === 'headlight' && !lightsOn)) {
        updateSelectiveBloomSelection('off');
        bloomEffect.strength = 0;
        bloomEffect.setAttribute('strength', '0');
        if (bloomEffect.effects && bloomEffect.effects[0]) {
          bloomEffect.effects[0].intensity = 0;
          bloomEffect.effects[0].disabled = true;
        }
      } else {
        updateSelectiveBloomSelection(bloomMode);
        bloomEffect.strength = bloomIntensity;
        bloomEffect.setAttribute('strength', bloomIntensity.toFixed(2));
        bloomEffect.radius = bloomRadius;
        bloomEffect.setAttribute('radius', bloomRadius.toFixed(2));
        bloomEffect.threshold = bloomThreshold;
        bloomEffect.setAttribute('threshold', bloomThreshold.toFixed(2));
        bloomEffect.setAttribute('luminance-threshold', bloomThreshold.toFixed(2));
        bloomEffect.luminanceThreshold = bloomThreshold;
        if (bloomEffect.effects && bloomEffect.effects[0]) {
          const eff = bloomEffect.effects[0];
          eff.disabled = false;
          eff.intensity = bloomIntensity;
          if (eff.luminanceMaterial) eff.luminanceMaterial.threshold = bloomThreshold;
          if (eff.threshold !== undefined) eff.threshold = bloomThreshold;
          if (eff.luminanceThreshold !== undefined) eff.luminanceThreshold = bloomThreshold;
        }
      }
    }

    // 2. SSAO Pro
    if (ssaoEffect) {
      if (ssaoIntensity <= 0) {
        ssaoEffect.blendMode = 'skip';
        ssaoEffect.setAttribute('blend-mode', 'skip');
        ssaoEffect.strength = 0;
        ssaoEffect.setAttribute('strength', '0');
        if (ssaoEffect.effects && ssaoEffect.effects[0]) {
          ssaoEffect.effects[0].disabled = true;
          ssaoEffect.effects[0].intensity = 0;
        }
      } else {
        ssaoEffect.blendMode = 'multiply';
        ssaoEffect.setAttribute('blend-mode', 'multiply');
        ssaoEffect.strength = ssaoIntensity;
        ssaoEffect.setAttribute('strength', ssaoIntensity.toFixed(2));
        ssaoEffect.radius = ssaoRadius;
        ssaoEffect.setAttribute('radius', ssaoRadius.toFixed(2));
        ssaoEffect.bias = ssaoBias;
        ssaoEffect.setAttribute('bias', ssaoBias.toFixed(3));
        ssaoEffect.setAttribute('distance-threshold', ssaoThreshold.toFixed(2));
        ssaoEffect.setAttribute('distance-falloff', ssaoFalloff.toFixed(2));

        if (ssaoEffect.effects && ssaoEffect.effects[0]) {
          const eff = ssaoEffect.effects[0];
          eff.disabled = false;
          eff.intensity = ssaoIntensity;
          if (eff.blendMode) eff.blendMode.blendFunction = 2; // BlendFunction.MULTIPLY in postprocessing

          if (eff.radius !== undefined) eff.radius = ssaoRadius;
          if (eff.bias !== undefined) eff.bias = ssaoBias;
          if (eff.distanceThreshold !== undefined) eff.distanceThreshold = ssaoThreshold;
          if (eff.distanceFalloff !== undefined) eff.distanceFalloff = ssaoFalloff;
          if (eff.luminanceInfluence !== undefined) eff.luminanceInfluence = ssaoLuminance;
          if (eff.samples !== undefined) eff.samples = ssaoSamples;
          if (eff.rings !== undefined) eff.rings = ssaoRings;

          // Direct uniform updates on the underlying shader material
          if (eff.ssaoMaterial && eff.ssaoMaterial.uniforms) {
            const u = eff.ssaoMaterial.uniforms;
            if (u.radius) u.radius.value = ssaoRadius;
            if (u.bias) u.bias.value = ssaoBias;
            if (u.distanceThreshold) u.distanceThreshold.value = ssaoThreshold;
            if (u.distanceFalloff) u.distanceFalloff.value = ssaoFalloff;
            if (u.luminanceInfluence) u.luminanceInfluence.value = ssaoLuminance;
            if (u.intensity) u.intensity.value = ssaoIntensity;
            if (u.scale) u.scale.value = ssaoRadius;
          }
        }
      }
    }

    // 3. Vignette
    if (vignetteEffect) {
      vignetteEffect.offset = vignetteOffset;
      vignetteEffect.darkness = vignetteDarkness;
      vignetteEffect.technique = (vignetteTechnique === 'eskil') ? VignetteTechnique.ESKIL : VignetteTechnique.DEFAULT;
      vignetteEffect.disabled = (vignetteDarkness <= 0.001);
    }

    // 4. Film Grain
    if (noiseEffect) {
      noiseEffect.blendMode.opacity.value = grainIntensity;
      noiseEffect.disabled = (grainIntensity <= 0.001);
      let bf = BlendFunction.OVERLAY;
      if (grainBlendMode === 'screen') bf = BlendFunction.SCREEN;
      else if (grainBlendMode === 'soft-light') bf = BlendFunction.SOFT_LIGHT;
      else if (grainBlendMode === 'multiply') bf = BlendFunction.MULTIPLY;
      noiseEffect.blendMode.blendFunction = bf;
    }

    // 5. Chromatic Aberration
    if (chromaticAberrationEffect) {
      chromaticAberrationEffect.offset.set(chromaticOffset, chromaticOffset);
      chromaticAberrationEffect.modulationOffset = chromaticFalloff;
      chromaticAberrationEffect.disabled = (chromaticOffset <= 0.0001);
    }

    // 6. Depth of Field
    if (dofEffect && dofEffect.circleOfConfusionMaterial) {
      dofEffect.circleOfConfusionMaterial.focusDistance = dofFocusDistance / 100.0;
      dofEffect.circleOfConfusionMaterial.focalLength = dofAperture;
      dofEffect.bokehScale = dofBokehScale;
      dofEffect.disabled = (dofAperture <= 0.001);
    }

    // 7. Glitch & Telemetry
    if (glitchEffect) {
      glitchEffect.disabled = (glitchMode === 'off');
      if (glitchMode === 'constant_mild') glitchEffect.mode = 2;
      else if (glitchMode === 'constant_wild') glitchEffect.mode = 3;
      else if (glitchMode === 'sporadic') glitchEffect.mode = 1;
      glitchEffect.maxStrength = glitchStrength;
      glitchEffect.ratio = 1.0 - glitchRatio;
    }

    // 8. CRT Scanlines
    if (scanlineEffect) {
      scanlineEffect.density = scanlineDensity;
      scanlineEffect.blendMode.opacity.value = scanlineOpacity;
      scanlineEffect.disabled = (scanlineOpacity <= 0.001 || scanlineDensity <= 0.001);
    }

    // 9. Sepia Tone
    if (sepiaEffect) {
      sepiaEffect.blendMode.opacity.value = sepiaIntensity;
      sepiaEffect.disabled = (sepiaIntensity <= 0.001);
    }

    // 10. Color Grade
    if (colorGradeEffect) {
      colorGradeEffect.contrast = colorContrast;
      colorGradeEffect.setAttribute('contrast', colorContrast.toFixed(2));
      colorGradeEffect.saturation = colorSaturation;
      colorGradeEffect.setAttribute('saturation', colorSaturation.toFixed(2));
      colorGradeEffect.brightness = colorBrightness;
      colorGradeEffect.setAttribute('brightness', colorBrightness.toFixed(2));
      colorGradeEffect.tonemapping = colorTonemapping || 'aces';
      colorGradeEffect.setAttribute('tonemapping', colorTonemapping || 'aces');
    }

    // 11. Anti-Aliasing
    const smaaEffect = document.getElementById('smaa-effect');
    if (effectComposer) {
      if (aaMode === 'msaa-4x') {
        effectComposer.setAttribute('msaa', '4');
        if (smaaEffect) {
          smaaEffect.disabled = true;
          smaaEffect.setAttribute('disabled', 'true');
        }
      } else if (aaMode === 'msaa-8x') {
        effectComposer.setAttribute('msaa', '8');
        if (smaaEffect) {
          smaaEffect.disabled = true;
          smaaEffect.setAttribute('disabled', 'true');
        }
      } else if (aaMode === 'hybrid') {
        effectComposer.setAttribute('msaa', '4');
        if (smaaEffect) {
          smaaEffect.disabled = false;
          smaaEffect.removeAttribute('disabled');
          smaaEffect.setAttribute('quality', 'high');
          smaaEffect.setAttribute('preset', 'ultra');
          if (smaaEffect.effects && smaaEffect.effects[0]) smaaEffect.effects[0].disabled = false;
        }
      } else if (aaMode === 'smaa-high') {
        effectComposer.setAttribute('msaa', '0');
        if (smaaEffect) {
          smaaEffect.disabled = false;
          smaaEffect.removeAttribute('disabled');
          smaaEffect.setAttribute('quality', 'high');
          smaaEffect.setAttribute('preset', 'high');
          if (smaaEffect.effects && smaaEffect.effects[0]) smaaEffect.effects[0].disabled = false;
        }
      } else if (aaMode === 'smaa-ultra') {
        effectComposer.setAttribute('msaa', '0');
        if (smaaEffect) {
          smaaEffect.disabled = false;
          smaaEffect.removeAttribute('disabled');
          smaaEffect.setAttribute('quality', 'high');
          smaaEffect.setAttribute('preset', 'ultra');
          if (smaaEffect.effects && smaaEffect.effects[0]) smaaEffect.effects[0].disabled = false;
        }
      } else if (aaMode === 'off') {
        effectComposer.setAttribute('msaa', '0');
        if (smaaEffect) {
          smaaEffect.disabled = true;
          smaaEffect.setAttribute('disabled', 'true');
          if (smaaEffect.effects && smaaEffect.effects[0]) smaaEffect.effects[0].disabled = true;
        }
      }

      // Configure WebGL Renderer Pixel Ratio
      const renderer = getThreeRenderer();
      if (renderer && typeof renderer.setPixelRatio === 'function') {
        const dpr = renderScale === '1.0' ? 1.0 : (renderScale === '1.5' ? 1.5 : Math.min(window.devicePixelRatio || 2, 2.0));
        renderer.setPixelRatio(dpr);
      }

      if (typeof effectComposer.requestUpdate === 'function') effectComposer.requestUpdate();
      if (typeof effectComposer.updateEffects === 'function') effectComposer.updateEffects();
      if (typeof effectComposer.queueRender === 'function') effectComposer.queueRender();
    }

    updateEmissiveMaterials();

    if (volumetricFogContainer) {
      if (bloomMode === 'off') {
        volumetricFogContainer.style.opacity = '0';
      } else {
        const fogOpacity = lightsOn ? '0.55' : '0.38';
        volumetricFogContainer.classList.toggle('active', lightsOn);
        volumetricFogContainer.style.opacity = fogOpacity;
      }
    }
  }

  // Apply Active Customizations to Current 3D Model
  function applyActiveCustomizations() {
    if (!modelViewer || !modelViewer.model) return;
    const materials = modelViewer.model.materials;
    const paintRgb = hexToRgbNormalized(currentPaintHex);
    const seatRgb = hexToRgbNormalized(currentSeatHex);

    materials.forEach(mat => {
      const mName = mat.name ? mat.name.toLowerCase() : '';
      
      // 1. Body Paint - Strictly target inmx7m60i_body
      if (mName === 'inmx7m60i_body' || mName.startsWith('inmx7m60i_body.')) {
        mat.pbrMetallicRoughness.setBaseColorFactor(paintRgb);
        mat.pbrMetallicRoughness.setRoughnessFactor(currentPaintRoughness);
        mat.pbrMetallicRoughness.setMetallicFactor(currentPaintMetallic);
      }

      // 2. Leather Seat Material
      if (mName === 'inmx7m60i_leather1' || mName.includes('seat')) {
        mat.pbrMetallicRoughness.setBaseColorFactor(seatRgb);
      }

      // 3. Power Windows Glass State
      const isWindowGlass = (mName.includes('windscreen') || mName.includes('window') || mName === 'inmx7m60i_glass') &&
                            !mName.includes('body') && !mName.includes('headlight') && !mName.includes('taillight');
      if (isWindowGlass) {
        if (!isWindowsDown) {
          mat.pbrMetallicRoughness.setBaseColorFactor([0.05, 0.08, 0.12, 0.75]);
          mat.pbrMetallicRoughness.setRoughnessFactor(0.1);
        } else {
          mat.pbrMetallicRoughness.setBaseColorFactor([0.05, 0.08, 0.12, 0.15]);
          mat.pbrMetallicRoughness.setRoughnessFactor(0.05);
        }
      }
    });

    updateEmissiveMaterials();
    applyPostFx();
  }

  // ==========================================================================
  // Apple iOS Dynamic Sliding Capsules (Physics & Position Sync)
  // ==========================================================================
  function updateTabSlider() {
    if (!tabSlider || !deckTabsContainer) return;
    const activeTab = deckTabsContainer.querySelector('.m3-deck-tab.active');
    if (!activeTab) {
      tabSlider.style.opacity = '0';
      return;
    }
    
    // Use layout unscaled DOM offsets so CSS transform scaling does not distort the pill size
    let offsetLeft = activeTab.offsetLeft;
    let width = activeTab.offsetWidth;

    if (!width || width <= 10) {
      const parentContainer = tabSlider.parentElement || deckTabsContainer;
      const containerRect = parentContainer.getBoundingClientRect();
      const tabRect = activeTab.getBoundingClientRect();
      offsetLeft = tabRect.left - containerRect.left;
      width = tabRect.width || 86;
    }

    tabSlider.style.opacity = '1';
    tabSlider.style.transform = `translateX(${offsetLeft}px)`;
    tabSlider.style.width = `${width}px`;
  }

  function updateSegSlider() {
    if (!segSlider || !segCameraBar) return;
    const activeSeg = segCameraBar.querySelector('.m3-seg-btn.active');
    if (!activeSeg) {
      segSlider.style.opacity = '0';
      return;
    }

    let offsetLeft = activeSeg.offsetLeft;
    let width = activeSeg.offsetWidth;

    if (!width || width <= 10) {
      const barRect = segCameraBar.getBoundingClientRect();
      const segRect = activeSeg.getBoundingClientRect();
      offsetLeft = segRect.left - barRect.left;
      width = segRect.width || 54;
    }

    segSlider.style.opacity = '1';
    segSlider.style.transform = `translateX(${offsetLeft}px)`;
    segSlider.style.width = `${width}px`;
  }

  window.addEventListener('resize', () => {
    updateTabSlider();
    updateSegSlider();
  });

  // ==========================================================================
  // Camera Navigation & Tab Switching
  // ==========================================================================
  function glideCameraTo(presetKey, updateWatermark = true) {
    const preset = CAMERA_PRESETS[presetKey];
    if (!preset || !modelViewer) return;

    modelViewer.cameraOrbit = preset.orbit;
    modelViewer.cameraTarget = preset.target;
    if (preset.fov) {
      modelViewer.fieldOfView = preset.fov;
    } else {
      modelViewer.fieldOfView = '35deg';
    }
    if (updateWatermark && studioWatermark) {
      studioWatermark.textContent = preset.watermark || 'BMW X7 M60i';
    }

    // Sync segmented camera bar active state
    segCamBtns.forEach(btn => {
      if (btn.getAttribute('data-cam') === presetKey) {
        btn.classList.add('active');
      } else {
        btn.classList.remove('active');
      }
    });

    updateSegSlider();
  }

  function switchTab(tabKey, autoOpen = true) {
    activeTabKey = tabKey;
    const meta = TAB_METADATA[tabKey] || {};

    // Update Deck Tabs UI
    deckTabs.forEach(tab => {
      if (tab.getAttribute('data-tab') === tabKey) tab.classList.add('active');
      else tab.classList.remove('active');
    });

    // Update Canvas Panels
    tabPanels.forEach(panel => {
      if (panel.id === `panel-${tabKey}`) panel.classList.add('active');
      else panel.classList.remove('active');
    });

    // Update Canvas Header Titles
    if (canvasBadgeText) canvasBadgeText.textContent = meta.badge || 'CONFIGURATOR';
    if (canvasTitleText) canvasTitleText.textContent = meta.title || '3D Studio';

    if (autoOpen && spatialCanvas) {
      spatialCanvas.classList.remove('closed');
    }

    // Update Background Cinematic Watermark View Tag
    if (studioWatermark) {
      studioWatermark.textContent = meta.watermark || 'BMW X7 M60i';
    }

    // Smooth Camera Glide
    if (meta.cam) glideCameraTo(meta.cam, false);

    // Update Apple iOS Sliding Capsule
    updateTabSlider();
  }

  function closeCanvas() {
    if (spatialCanvas) spatialCanvas.classList.add('closed');
    activeTabKey = null;
    deckTabs.forEach(t => t.classList.remove('active'));
    tabPanels.forEach(p => p.classList.remove('active'));
    updateTabSlider();
    if (studioWatermark) studioWatermark.textContent = 'BMW X7 M60i';
  }

  // ==========================================================================
  // Collapsible Liquid Glass Dock Engine (Central Launcher Morphing)
  // ==========================================================================
  const dockWrapper = document.getElementById('m3-dock-wrapper');
  const dockCollapseTrigger = document.getElementById('dock-collapse-trigger');
  const dockCollapseCloseBtn = document.getElementById('dock-collapse-close-btn');

  function openDock() {
    if (dockWrapper) {
      dockWrapper.classList.remove('is-collapsed');
      updateTabSlider();
      updateSegSlider();
      setTimeout(() => {
        updateTabSlider();
        updateSegSlider();
      }, 80);
      setTimeout(() => {
        updateTabSlider();
        updateSegSlider();
      }, 250);
      setTimeout(() => {
        updateTabSlider();
        updateSegSlider();
      }, 500);
    }
  }

  function closeDock() {
    if (dockWrapper) {
      dockWrapper.classList.add('is-collapsed');
      closeCanvas();
    }
  }

  function toggleDock() {
    if (dockWrapper && dockWrapper.classList.contains('is-collapsed')) {
      openDock();
    } else {
      closeDock();
    }
  }



  if (dockCollapseTrigger) {
    dockCollapseTrigger.addEventListener('click', () => {
      openDock();
      switchTab('exterior', true);
    });
  }

  if (dockCollapseCloseBtn) {
    dockCollapseCloseBtn.addEventListener('click', () => {
      closeDock();
    });
  }

  // Deck Tab Click Listeners
  deckTabs.forEach(tab => {
    tab.addEventListener('click', () => {
      const tabKey = tab.getAttribute('data-tab');
      if (activeTabKey === tabKey && spatialCanvas && !spatialCanvas.classList.contains('closed')) {
        closeCanvas();
      } else {
        switchTab(tabKey, true);
      }
    });
  });

  // Close Canvas Button
  if (closeCanvasBtn) {
    closeCanvasBtn.addEventListener('click', () => {
      closeCanvas();
    });
  }

  // Segmented Camera Bar Snaps
  segCamBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const camKey = btn.getAttribute('data-cam');
      glideCameraTo(camKey);
    });
  });

  // ==========================================================================
  // Tab 1: Paint Swatches & Filter Chips
  // ==========================================================================
  const paintCards = document.querySelectorAll('.m3-swatch-card');
  const paintFilterChips = document.querySelectorAll('.m3-filter-chip[data-filter]');

  paintCards.forEach(card => {
    card.addEventListener('click', () => {
      paintCards.forEach(c => c.classList.remove('active'));
      card.classList.add('active');

      currentPaintHex = card.getAttribute('data-color');
      currentPaintName = card.getAttribute('data-name');
      currentPaintPrice = parseInt(card.getAttribute('data-price') || '0', 10);

      updateDynamicThemeAccent(currentPaintHex);
      applyActiveCustomizations();
      updatePriceDisplay();
    });
  });

  paintFilterChips.forEach(chip => {
    chip.addEventListener('click', () => {
      paintFilterChips.forEach(c => c.classList.remove('active'));
      chip.classList.add('active');

      const filter = chip.getAttribute('data-filter');
      paintCards.forEach(card => {
        const cat = card.getAttribute('data-category');
        if (filter === 'all' || cat === filter) {
          card.style.display = 'flex';
        } else {
          card.style.display = 'none';
        }
      });
    });
  });

  // ==========================================================================
  // Tab 2: Wheels Selection & Model Swapping
  // ==========================================================================
  const wheelCards = document.querySelectorAll('.m3-visual-card[data-type="wheel"]');

  function switchWheelModel(option, name) {
    currentWheelOption = option;
    currentWheelName = name;
    if (activeWheelTitle) activeWheelTitle.textContent = name;

    if (!modelViewer) return;
    if (option === 'set1') {
      modelViewer.src = './assets/bmw_x7_wheel_1.glb';
    } else if (option === 'set2') {
      modelViewer.src = './assets/bmw_x7_wheel_2.glb';
    }
  }

  wheelCards.forEach(card => {
    card.addEventListener('click', () => {
      wheelCards.forEach(c => c.classList.remove('active'));
      card.classList.add('active');

      const option = card.getAttribute('data-wheel');
      const name = card.getAttribute('data-name');
      switchWheelModel(option, name);
      glideCameraTo('wheels');
    });
  });

  // ==========================================================================
  // Tab 3: Interior Leather Upholstery
  // ==========================================================================
  const seatCards = document.querySelectorAll('.m3-visual-card[data-type="seat"]');

  seatCards.forEach(card => {
    card.addEventListener('click', () => {
      seatCards.forEach(c => c.classList.remove('active'));
      card.classList.add('active');

      currentSeatHex = card.getAttribute('data-color');
      currentSeatName = card.getAttribute('data-name');
      if (activeInteriorTitle) activeInteriorTitle.textContent = currentSeatName;

      applyActiveCustomizations();
      glideCameraTo('cabin');
    });
  });

  // ==========================================================================
  // Tab 4: Interactive Mechanics (Doors, Windows, Lights)
  // ==========================================================================
  
  // 1. Vehicle Doors
  function setDoorsState(open) {
    isDoorsOpen = open;
    if (toggleDoorsBtn) {
      toggleDoorsBtn.classList.toggle('active', isDoorsOpen);
      toggleDoorsBtn.setAttribute('aria-pressed', isDoorsOpen ? 'true' : 'false');
    }

    if (modelViewer && modelViewer.availableAnimations && modelViewer.availableAnimations.length > 0) {
      if (isDoorsOpen) {
        modelViewer.animationName = modelViewer.availableAnimations[0];
        modelViewer.play({ repetitions: 1 });
      } else {
        modelViewer.pause();
        modelViewer.currentTime = 0;
      }
    }
  }

  if (toggleDoorsBtn) {
    toggleDoorsBtn.addEventListener('click', () => {
      setDoorsState(!isDoorsOpen);
    });
  }

  // 2. Power Windows
  if (toggleWindowsBtn) {
    toggleWindowsBtn.addEventListener('click', () => {
      isWindowsDown = !isWindowsDown;
      toggleWindowsBtn.classList.toggle('active', isWindowsDown);
      toggleWindowsBtn.setAttribute('aria-pressed', isWindowsDown ? 'true' : 'false');
      applyActiveCustomizations();
    });
  }

  // 3. Matrix LED Lights & Volumetric Glow
  function setLightsState(on) {
    lightsOn = on;
    targetEmissiveProgress = lightsOn ? 1.0 : 0.0;
    if (toggleLightsBtn) {
      toggleLightsBtn.classList.toggle('active', lightsOn);
      toggleLightsBtn.setAttribute('aria-pressed', lightsOn ? 'true' : 'false');
    }
    if (emissiveAnimFrame) cancelAnimationFrame(emissiveAnimFrame);
    animateEmissiveTransition();
    applyPostFx();
  }

  if (toggleLightsBtn) {
    toggleLightsBtn.addEventListener('click', () => {
      setLightsState(!lightsOn);
    });
  }

  // ==========================================================================
  // Tab 5: 3D Studio Lab (Lighting, Marmoset Material Inspector & Post-FX)
  // ==========================================================================
  const studioSubtabBtns = document.querySelectorAll('.m3-subtab-btn');
  const studioSubtabContents = document.querySelectorAll('.m3-subtab-content');

  studioSubtabBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const subtab = btn.getAttribute('data-subtab');
      studioSubtabBtns.forEach(b => b.classList.remove('active'));
      studioSubtabContents.forEach(c => c.classList.remove('active'));
      btn.classList.add('active');
      const targetContent = document.getElementById(`subtab-${subtab}`);
      if (targetContent) targetContent.classList.add('active');
      if (subtab === 'postfx') applyPostFx();
    });
  });

  // Lighting Controls
  const inputExposure = document.getElementById('input-exposure');
  const valExposure = document.getElementById('val-exposure');
  const inputShadowIntensity = document.getElementById('input-shadow-intensity');
  const valShadowIntensity = document.getElementById('val-shadow-intensity');
  const inputShadowSoftness = document.getElementById('input-shadow-softness');
  const valShadowSoftness = document.getElementById('val-shadow-softness');
  const selectHdri = document.getElementById('select-hdri');

  if (inputExposure) {
    inputExposure.addEventListener('input', (e) => {
      currentExposure = parseFloat(e.target.value);
      if (valExposure) valExposure.textContent = currentExposure.toFixed(2);
      if (modelViewer) modelViewer.exposure = currentExposure;
    });
  }

  if (inputShadowIntensity) {
    inputShadowIntensity.addEventListener('input', (e) => {
      currentShadowIntensity = parseFloat(e.target.value);
      if (valShadowIntensity) valShadowIntensity.textContent = currentShadowIntensity.toFixed(2);
      if (modelViewer) modelViewer.shadowIntensity = currentShadowIntensity;
    });
  }

  if (inputShadowSoftness) {
    inputShadowSoftness.addEventListener('input', (e) => {
      currentShadowSoftness = parseFloat(e.target.value);
      if (valShadowSoftness) valShadowSoftness.textContent = currentShadowSoftness.toFixed(2);
      if (modelViewer) modelViewer.shadowSoftness = currentShadowSoftness;
    });
  }

  if (selectHdri) {
    selectHdri.addEventListener('change', (e) => {
      currentHdri = e.target.value;
      if (modelViewer) modelViewer.environmentImage = currentHdri;
    });
  }

  // ==========================================================================
  // 3D Studio Pro Lab: Subtab Navigation & Material Inspector Engine
  // ==========================================================================
  const subtabBtns = document.querySelectorAll('.m3-subtab-btn');
  const subtabContents = document.querySelectorAll('.m3-subtab-content');

  subtabBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      subtabBtns.forEach(b => b.classList.remove('active'));
      subtabContents.forEach(c => c.classList.remove('active'));
      btn.classList.add('active');
      const targetSubtab = btn.getAttribute('data-subtab');
      const targetId = `subtab-${targetSubtab}`;
      const targetContent = document.getElementById(targetId);
      if (targetContent) targetContent.classList.add('active');

      if (targetSubtab === 'materials') {
        scanAllSceneMaterials();
        populateMaterialDropdown();
        syncInspectorUIWithMaterial();
      }
    });
  });

  // Marmoset-style 38+ Material Inspector logic
  let materialsRegistry = new Map();
  let activeMaterialName = 'inmx7m60i_body';
  let isViewportPickingActive = false;

  const matSearchInput = document.getElementById('mat-search-input');
  const selectActiveMat = document.getElementById('select-active-material');
  const matSphereCarousel = document.getElementById('mat-sphere-carousel');
  const matFilterPills = document.querySelectorAll('#mat-filter-pills .m3-filter-chip');
  const btnViewportPicker = document.getElementById('btn-viewport-picker');

  // PBR Inspector UI Controls
  const matColorPicker = document.getElementById('mat-color-picker');
  const matColorHex = document.getElementById('mat-color-hex');
  const inputMatOpacity = document.getElementById('input-mat-opacity');
  const valMatOpacity = document.getElementById('val-mat-opacity');

  const inputMatRoughness = document.getElementById('input-mat-roughness');
  const valMatRoughness = document.getElementById('val-mat-roughness');
  const inputMatMetalness = document.getElementById('input-mat-metalness');
  const valMatMetalness = document.getElementById('val-mat-metalness');

  const inputMatClearcoat = document.getElementById('input-mat-clearcoat');
  const valMatClearcoat = document.getElementById('val-mat-clearcoat');
  const inputClearcoatRoughness = document.getElementById('input-clearcoat-roughness');
  const valClearcoatRoughness = document.getElementById('val-clearcoat-roughness');

  const matEmissivePicker = document.getElementById('mat-emissive-picker');
  const matEmissiveHex = document.getElementById('mat-emissive-hex');
  const inputMatEmissiveIntensity = document.getElementById('input-mat-emissive-intensity');
  const valMatEmissiveIntensity = document.getElementById('val-mat-emissive-intensity');

  const selectMaterialType = document.getElementById('select-material-type');
  const matTransferProps = document.getElementById('mat-transfer-props');

  const matActiveTitle = document.getElementById('mat-active-title');
  const matActiveDesc = document.getElementById('mat-active-desc');
  const matActiveCatTag = document.getElementById('mat-active-cat-tag');
  const matMeshCountTag = document.getElementById('mat-mesh-count-tag');

  const btnResetSingleMat = document.getElementById('btn-reset-single-mat');
  const btnResetAllMats = document.getElementById('btn-reset-all-mats');
  const btnCopyMatJson = document.getElementById('btn-copy-mat-json');

  function categorizeMaterial(name) {
    const n = name.toLowerCase();
    if (n.includes('headlight') || n.includes('taillight') || n.includes('running_') || n.includes('fog') || n.includes('signal') || n.includes('chmsl') || n.includes('rearlight')) return 'lights';
    if (n.includes('body')) return 'body';
    if (n.includes('leather') || n.includes('seat') || n.includes('int') || n.includes('carpet') || n.includes('dash')) return 'interior';
    if (n.includes('glass') || n.includes('windscreen') || n.includes('window')) return 'glass';
    if (n.includes('wheel') || n.includes('tire') || n.includes('rim') || n.includes('caliper')) return 'wheels';
    return 'trim';
  }

  function scanAllSceneMaterials() {
    materialsRegistry.clear();

    // 1. Scan ModelViewer API wrapper materials
    if (modelViewer && modelViewer.model && modelViewer.model.materials) {
      modelViewer.model.materials.forEach(mat => {
        if (!mat || !mat.name) return;
        materialsRegistry.set(mat.name, {
          name: mat.name,
          material: mat,
          category: categorizeMaterial(mat.name)
        });
      });
    }

    // 2. Scan Three.js scene graph mesh materials (guarantees 100% scene coverage)
    const scene = getThreeScene();
    if (scene) {
      scene.traverse((child) => {
        if (child && child.isMesh && child.material) {
          const mList = Array.isArray(child.material) ? child.material : [child.material];
          mList.forEach(m => {
            if (m && m.name && !materialsRegistry.has(m.name)) {
              materialsRegistry.set(m.name, {
                name: m.name,
                material: m,
                category: categorizeMaterial(m.name)
              });
            }
          });
        }
      });
    }
  }

  function populateMaterialDropdown(filterCat = 'all', searchQuery = '') {
    if (!selectActiveMat) return;
    if (materialsRegistry.size === 0) scanAllSceneMaterials();

    selectActiveMat.innerHTML = '';
    let count = 0;
    materialsRegistry.forEach((entry, name) => {
      const matchesCat = filterCat === 'all' || entry.category === filterCat;
      const matchesSearch = !searchQuery || name.toLowerCase().includes(searchQuery.toLowerCase());
      if (matchesCat && matchesSearch) {
        const opt = document.createElement('option');
        opt.value = name;
        opt.textContent = `${entry.category === 'lights' ? '💡' : (entry.category === 'body' ? '🚗' : '🎨')} ${name}`;
        if (name === activeMaterialName) opt.selected = true;
        selectActiveMat.appendChild(opt);
        count++;
      }
    });

    if (selectActiveMat.options.length > 0 && (!selectActiveMat.value || !materialsRegistry.has(activeMaterialName))) {
      selectActiveMat.selectedIndex = 0;
      activeMaterialName = selectActiveMat.value;
    }

    if (matSphereCarousel) {
      matSphereCarousel.innerHTML = '';
      let added = 0;
      materialsRegistry.forEach((entry, name) => {
        if (added >= 14 && filterCat === 'all') return;
        const matchesCat = filterCat === 'all' || entry.category === filterCat;
        if (!matchesCat) return;
        const chip = document.createElement('button');
        chip.className = `mat-sphere-item ${name === activeMaterialName ? 'active' : ''}`;
        chip.title = name;
        chip.innerHTML = `<span class="sphere-dot" style="background: var(--md-sys-color-primary, #0066B1);"></span><span class="sphere-name">${name}</span>`;
        chip.addEventListener('click', (e) => {
          e.preventDefault();
          activeMaterialName = name;
          if (selectActiveMat) selectActiveMat.value = name;
          syncInspectorUIWithMaterial();
          populateMaterialDropdown(filterCat, searchQuery);
        });
        matSphereCarousel.appendChild(chip);
        added++;
      });
    }

    syncInspectorUIWithMaterial();
  }

  function getActiveTargetMaterial() {
    if (modelViewer && modelViewer.model && modelViewer.model.materials) {
      const mvMat = modelViewer.model.materials.find(m => m.name === activeMaterialName);
      if (mvMat) return mvMat;
    }
    const entry = materialsRegistry.get(activeMaterialName);
    if (entry) return entry.material;
    return null;
  }

  function syncInspectorUIWithMaterial() {
    const mat = getActiveTargetMaterial();
    if (!mat) return;

    if (matActiveTitle) matActiveTitle.textContent = `🚘 ${mat.name}`;
    if (matActiveDesc) matActiveDesc.textContent = `Material component: ${mat.name}`;
    if (matActiveCatTag) matActiveCatTag.textContent = categorizeMaterial(mat.name).toUpperCase();
    if (matMeshCountTag) matMeshCountTag.textContent = `PBR Active`;

    // 1. Base Color & Opacity
    if (mat.pbrMetallicRoughness && mat.pbrMetallicRoughness.baseColorFactor) {
      const [r, g, b, a] = mat.pbrMetallicRoughness.baseColorFactor;
      const hex = '#' + [r, g, b].map(x => Math.round(x * 255).toString(16).padStart(2, '0')).join('');
      if (matColorPicker) matColorPicker.value = hex;
      if (matColorHex) matColorHex.value = hex.toUpperCase();
      if (inputMatOpacity) inputMatOpacity.value = a !== undefined ? a : 1.0;
      if (valMatOpacity) valMatOpacity.textContent = (a !== undefined ? a : 1.0).toFixed(2);
    } else if (mat.color) {
      const hex = '#' + mat.color.getHexString();
      if (matColorPicker) matColorPicker.value = hex;
      if (matColorHex) matColorHex.value = hex.toUpperCase();
      const op = mat.opacity !== undefined ? mat.opacity : 1.0;
      if (inputMatOpacity) inputMatOpacity.value = op;
      if (valMatOpacity) valMatOpacity.textContent = Number(op).toFixed(2);
    }

    // 2. Roughness & Metalness
    if (mat.pbrMetallicRoughness) {
      const r = mat.pbrMetallicRoughness.roughnessFactor !== undefined ? mat.pbrMetallicRoughness.roughnessFactor : 0.5;
      const m = mat.pbrMetallicRoughness.metallicFactor !== undefined ? mat.pbrMetallicRoughness.metallicFactor : 0.0;
      if (inputMatRoughness) inputMatRoughness.value = r;
      if (valMatRoughness) valMatRoughness.textContent = Number(r).toFixed(2);
      if (inputMatMetalness) inputMatMetalness.value = m;
      if (valMatMetalness) valMatMetalness.textContent = Number(m).toFixed(2);
    } else {
      const r = mat.roughness !== undefined ? mat.roughness : 0.5;
      const m = mat.metalness !== undefined ? mat.metalness : 0.0;
      if (inputMatRoughness) inputMatRoughness.value = r;
      if (valMatRoughness) valMatRoughness.textContent = Number(r).toFixed(2);
      if (inputMatMetalness) inputMatMetalness.value = m;
      if (valMatMetalness) valMatMetalness.textContent = Number(m).toFixed(2);
    }

    // 3. Emissive
    if (mat.emissiveFactor) {
      const [er, eg, eb] = mat.emissiveFactor;
      const eHex = '#' + [er, eg, eb].map(x => Math.min(255, Math.round(x * 255)).toString(16).padStart(2, '0')).join('');
      if (matEmissivePicker) matEmissivePicker.value = eHex;
      if (matEmissiveHex) matEmissiveHex.value = eHex.toUpperCase();
      const maxEmissive = Math.max(er, eg, eb);
      if (inputMatEmissiveIntensity) inputMatEmissiveIntensity.value = maxEmissive;
      if (valMatEmissiveIntensity) valMatEmissiveIntensity.textContent = maxEmissive.toFixed(1);
    } else if (mat.emissive) {
      const eHex = '#' + mat.emissive.getHexString();
      if (matEmissivePicker) matEmissivePicker.value = eHex;
      if (matEmissiveHex) matEmissiveHex.value = eHex.toUpperCase();
      const intensity = mat.emissiveIntensity !== undefined ? mat.emissiveIntensity : 1.0;
      if (inputMatEmissiveIntensity) inputMatEmissiveIntensity.value = intensity;
      if (valMatEmissiveIntensity) valMatEmissiveIntensity.textContent = Number(intensity).toFixed(1);
    }
  }

  // Active Material Dropdown Selection
  if (selectActiveMat) {
    const refreshDropdown = () => {
      if (materialsRegistry.size === 0 || selectActiveMat.options.length <= 1) {
        scanAllSceneMaterials();
        populateMaterialDropdown();
      }
    };
    selectActiveMat.addEventListener('focus', refreshDropdown);
    selectActiveMat.addEventListener('mousedown', refreshDropdown);
    selectActiveMat.addEventListener('change', (e) => {
      activeMaterialName = e.target.value;
      syncInspectorUIWithMaterial();
    });
  }

  // Material Search Input
  if (matSearchInput) {
    matSearchInput.addEventListener('input', (e) => {
      populateMaterialDropdown('all', e.target.value);
    });
  }

  // Category Filter Pills
  matFilterPills.forEach(pill => {
    pill.addEventListener('click', () => {
      matFilterPills.forEach(p => p.classList.remove('active'));
      pill.classList.add('active');
      const cat = pill.getAttribute('data-category');
      populateMaterialDropdown(cat, matSearchInput ? matSearchInput.value : '');
    });
  });

  // Color Picker & Hex Input
  if (matColorPicker) {
    matColorPicker.addEventListener('input', (e) => {
      const hex = e.target.value;
      if (matColorHex) matColorHex.value = hex.toUpperCase();
      const mat = getActiveTargetMaterial();
      const rgb = hexToRgbNormalized(hex);
      const op = inputMatOpacity ? parseFloat(inputMatOpacity.value) : 1.0;
      if (mat && mat.pbrMetallicRoughness) {
        mat.pbrMetallicRoughness.setBaseColorFactor([rgb[0], rgb[1], rgb[2], op]);
      }
      const scene = getThreeScene();
      if (scene && typeof THREE !== 'undefined') {
        scene.traverse((child) => {
          if (child && child.isMesh && child.material) {
            const mList = Array.isArray(child.material) ? child.material : [child.material];
            mList.forEach(m => {
              if (m && m.name === activeMaterialName) {
                m.color = new THREE.Color(hex);
                m.needsUpdate = true;
              }
            });
          }
        });
      }
    });
  }

  if (matColorHex) {
    matColorHex.addEventListener('change', (e) => {
      let hex = e.target.value.trim();
      if (!hex.startsWith('#')) hex = '#' + hex;
      if (/^#[0-9A-F]{6}$/i.test(hex)) {
        if (matColorPicker) matColorPicker.value = hex;
        const mat = getActiveTargetMaterial();
        const rgb = hexToRgbNormalized(hex);
        const op = inputMatOpacity ? parseFloat(inputMatOpacity.value) : 1.0;
        if (mat && mat.pbrMetallicRoughness) {
          mat.pbrMetallicRoughness.setBaseColorFactor([rgb[0], rgb[1], rgb[2], op]);
        }
        const scene = getThreeScene();
        if (scene && typeof THREE !== 'undefined') {
          scene.traverse((child) => {
            if (child && child.isMesh && child.material) {
              const mList = Array.isArray(child.material) ? child.material : [child.material];
              mList.forEach(m => {
                if (m && m.name === activeMaterialName) {
                  m.color = new THREE.Color(hex);
                  m.needsUpdate = true;
                }
              });
            }
          });
        }
      }
    });
  }

  if (inputMatOpacity) {
    inputMatOpacity.addEventListener('input', (e) => {
      const val = parseFloat(e.target.value);
      if (valMatOpacity) valMatOpacity.textContent = val.toFixed(2);
      const mat = getActiveTargetMaterial();
      if (mat && mat.pbrMetallicRoughness) {
        const cur = mat.pbrMetallicRoughness.baseColorFactor || [1, 1, 1, 1];
        mat.pbrMetallicRoughness.setBaseColorFactor([cur[0], cur[1], cur[2], val]);
      }
      const scene = getThreeScene();
      if (scene) {
        scene.traverse((child) => {
          if (child && child.isMesh && child.material) {
            const mList = Array.isArray(child.material) ? child.material : [child.material];
            mList.forEach(m => {
              if (m && m.name === activeMaterialName) {
                m.opacity = val;
                m.transparent = val < 1.0;
                m.needsUpdate = true;
              }
            });
          }
        });
      }
    });
  }

  // Roughness & Metalness Sliders
  if (inputMatRoughness) {
    inputMatRoughness.addEventListener('input', (e) => {
      const val = parseFloat(e.target.value);
      if (valMatRoughness) valMatRoughness.textContent = val.toFixed(2);
      const mat = getActiveTargetMaterial();
      if (mat && mat.pbrMetallicRoughness) {
        mat.pbrMetallicRoughness.setRoughnessFactor(val);
      }
      const scene = getThreeScene();
      if (scene) {
        scene.traverse((child) => {
          if (child && child.isMesh && child.material) {
            const mList = Array.isArray(child.material) ? child.material : [child.material];
            mList.forEach(m => {
              if (m && m.name === activeMaterialName) {
                m.roughness = val;
                m.needsUpdate = true;
              }
            });
          }
        });
      }
    });
  }

  if (inputMatMetalness) {
    inputMatMetalness.addEventListener('input', (e) => {
      const val = parseFloat(e.target.value);
      if (valMatMetalness) valMatMetalness.textContent = val.toFixed(2);
      const mat = getActiveTargetMaterial();
      if (mat && mat.pbrMetallicRoughness) {
        mat.pbrMetallicRoughness.setMetallicFactor(val);
      }
      const scene = getThreeScene();
      if (scene) {
        scene.traverse((child) => {
          if (child && child.isMesh && child.material) {
            const mList = Array.isArray(child.material) ? child.material : [child.material];
            mList.forEach(m => {
              if (m && m.name === activeMaterialName) {
                m.metalness = val;
                m.needsUpdate = true;
              }
            });
          }
        });
      }
    });
  }

  // Clearcoat Sliders
  if (inputMatClearcoat) {
    inputMatClearcoat.addEventListener('input', (e) => {
      const val = parseFloat(e.target.value);
      if (valMatClearcoat) valMatClearcoat.textContent = val.toFixed(2);
      const scene = getThreeScene();
      if (scene) {
        scene.traverse((child) => {
          if (child && child.isMesh && child.material) {
            const mList = Array.isArray(child.material) ? child.material : [child.material];
            mList.forEach(m => {
              if (m && m.name === activeMaterialName) {
                m.clearcoat = val;
                m.needsUpdate = true;
              }
            });
          }
        });
      }
    });
  }

  if (inputClearcoatRoughness) {
    inputClearcoatRoughness.addEventListener('input', (e) => {
      const val = parseFloat(e.target.value);
      if (valClearcoatRoughness) valClearcoatRoughness.textContent = val.toFixed(2);
      const scene = getThreeScene();
      if (scene) {
        scene.traverse((child) => {
          if (child && child.isMesh && child.material) {
            const mList = Array.isArray(child.material) ? child.material : [child.material];
            mList.forEach(m => {
              if (m && m.name === activeMaterialName) {
                m.clearcoatRoughness = val;
                m.needsUpdate = true;
              }
            });
          }
        });
      }
    });
  }

  // Emissive Controls
  if (matEmissivePicker) {
    matEmissivePicker.addEventListener('input', (e) => {
      const hex = e.target.value;
      if (matEmissiveHex) matEmissiveHex.value = hex.toUpperCase();
      const intensity = inputMatEmissiveIntensity ? parseFloat(inputMatEmissiveIntensity.value) : 1.0;
      const mat = getActiveTargetMaterial();
      if (mat && typeof mat.setEmissiveFactor === 'function') {
        const rgb = hexToRgbNormalized(hex);
        mat.setEmissiveFactor([rgb[0] * intensity, rgb[1] * intensity, rgb[2] * intensity]);
      }
    });
  }

  if (inputMatEmissiveIntensity) {
    inputMatEmissiveIntensity.addEventListener('input', (e) => {
      const intensity = parseFloat(e.target.value);
      if (valMatEmissiveIntensity) valMatEmissiveIntensity.textContent = intensity.toFixed(1);
      const hex = matEmissivePicker ? matEmissivePicker.value : '#FFFFFF';
      const mat = getActiveTargetMaterial();
      if (mat && typeof mat.setEmissiveFactor === 'function') {
        const rgb = hexToRgbNormalized(hex);
        mat.setEmissiveFactor([rgb[0] * intensity, rgb[1] * intensity, rgb[2] * intensity]);
      }
    });
  }

  // Shader Type Converter Dropdown
  if (selectMaterialType) {
    selectMaterialType.addEventListener('change', (e) => {
      const newType = e.target.value;
      const scene = getThreeScene();
      if (!scene || typeof THREE === 'undefined') return;

      scene.traverse((child) => {
        if (child && child.isMesh && child.material) {
          const mList = Array.isArray(child.material) ? child.material : [child.material];
          const updated = mList.map(oldMat => {
            if (oldMat && oldMat.name === activeMaterialName && THREE[newType]) {
              const newMat = new THREE[newType]();
              newMat.name = oldMat.name;
              if (matTransferProps && matTransferProps.checked) {
                if (oldMat.color) newMat.color = oldMat.color.clone();
                if (oldMat.map) newMat.map = oldMat.map;
                if (oldMat.normalMap) newMat.normalMap = oldMat.normalMap;
                if (oldMat.roughnessMap) newMat.roughnessMap = oldMat.roughnessMap;
                if (oldMat.roughness !== undefined && newMat.roughness !== undefined) newMat.roughness = oldMat.roughness;
                if (oldMat.metalness !== undefined && newMat.metalness !== undefined) newMat.metalness = oldMat.metalness;
              }
              newMat.needsUpdate = true;
              return newMat;
            }
            return oldMat;
          });
          child.material = Array.isArray(child.material) ? updated : updated[0];
        }
      });
    });
  }

  // 1-Click Material Presets
  const presetButtons = document.querySelectorAll('.mat-presets-bar button[data-preset]');
  presetButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      const presetKey = btn.getAttribute('data-preset');
      const mat = getActiveTargetMaterial();
      if (!mat || !mat.pbrMetallicRoughness) return;

      if (presetKey === 'gloss_paint') {
        mat.pbrMetallicRoughness.setRoughnessFactor(0.05);
        mat.pbrMetallicRoughness.setMetallicFactor(0.10);
      } else if (presetKey === 'matte_paint') {
        mat.pbrMetallicRoughness.setRoughnessFactor(0.65);
        mat.pbrMetallicRoughness.setMetallicFactor(0.05);
      } else if (presetKey === 'carbon_fiber') {
        mat.pbrMetallicRoughness.setRoughnessFactor(0.30);
        mat.pbrMetallicRoughness.setMetallicFactor(0.80);
      } else if (presetKey === 'chrome') {
        mat.pbrMetallicRoughness.setRoughnessFactor(0.02);
        mat.pbrMetallicRoughness.setMetallicFactor(0.98);
      } else if (presetKey === 'leather') {
        mat.pbrMetallicRoughness.setRoughnessFactor(0.75);
        mat.pbrMetallicRoughness.setMetallicFactor(0.00);
      } else if (presetKey === 'glass') {
        mat.pbrMetallicRoughness.setRoughnessFactor(0.05);
        mat.pbrMetallicRoughness.setMetallicFactor(0.00);
      }
      syncInspectorUIWithMaterial();
    });
  });

  // Viewport Part Picker Button
  if (btnViewportPicker) {
    btnViewportPicker.addEventListener('click', () => {
      isViewportPickingActive = !isViewportPickingActive;
      btnViewportPicker.classList.toggle('active', isViewportPickingActive);
      btnViewportPicker.style.background = isViewportPickingActive ? 'var(--md-sys-color-primary)' : '';
      btnViewportPicker.style.color = isViewportPickingActive ? '#FFFFFF' : '';
    });
  }

  if (modelViewer) {
    modelViewer.addEventListener('click', (e) => {
      if (!isViewportPickingActive) return;
      const picked = modelViewer.materialFromPoint(e.clientX, e.clientY);
      if (picked && picked.name) {
        activeMaterialName = picked.name;
        if (selectActiveMat) selectActiveMat.value = picked.name;
        syncInspectorUIWithMaterial();
        populateMaterialDropdown();
        isViewportPickingActive = false;
        if (btnViewportPicker) {
          btnViewportPicker.classList.remove('active');
          btnViewportPicker.style.background = '';
          btnViewportPicker.style.color = '';
        }
      }
    });
  }

  // Material Reset Actions
  if (btnResetSingleMat) {
    btnResetSingleMat.addEventListener('click', () => {
      applyActiveCustomizations();
      syncInspectorUIWithMaterial();
    });
  }

  if (btnResetAllMats) {
    btnResetAllMats.addEventListener('click', () => {
      applyActiveCustomizations();
      scanAllSceneMaterials();
      populateMaterialDropdown();
      syncInspectorUIWithMaterial();
    });
  }

  if (btnCopyMatJson) {
    btnCopyMatJson.addEventListener('click', () => {
      const mat = getActiveTargetMaterial();
      if (!mat) return;
      const data = {
        name: mat.name,
        baseColorFactor: mat.pbrMetallicRoughness ? mat.pbrMetallicRoughness.baseColorFactor : null,
        roughnessFactor: mat.pbrMetallicRoughness ? mat.pbrMetallicRoughness.roughnessFactor : null,
        metallicFactor: mat.pbrMetallicRoughness ? mat.pbrMetallicRoughness.metallicFactor : null,
        emissiveFactor: mat.emissiveFactor || null
      };
      navigator.clipboard.writeText(JSON.stringify(data, null, 2));
      btnCopyMatJson.textContent = '✅ Copied!';
      setTimeout(() => btnCopyMatJson.textContent = '📋 Copy JSON', 2000);
    });
  }

  // ==========================================================================
  // Post-FX Controls Engine (11 Cinema Passes, 1-Click Presets & Sliders)
  // ==========================================================================
  const btnBloomMode = document.getElementById('btn-bloom-mode');
  const inputBloomIntensity = document.getElementById('input-bloom-intensity');
  const valBloomIntensity = document.getElementById('val-bloom-intensity');
  const inputBloomRadius = document.getElementById('input-bloom-radius');
  const valBloomRadius = document.getElementById('val-bloom-radius');
  const inputBloomThreshold = document.getElementById('input-bloom-threshold');
  const valBloomThreshold = document.getElementById('val-bloom-threshold');

  const inputSsaoIntensity = document.getElementById('input-ssao-intensity');
  const valSsaoIntensity = document.getElementById('val-ssao-intensity');
  const inputSsaoRadius = document.getElementById('input-ssao-radius');
  const valSsaoRadius = document.getElementById('val-ssao-radius');
  const inputSsaoThreshold = document.getElementById('input-ssao-threshold');
  const valSsaoThreshold = document.getElementById('val-ssao-threshold');
  const inputSsaoFalloff = document.getElementById('input-ssao-falloff');
  const valSsaoFalloff = document.getElementById('val-ssao-falloff');
  const inputSsaoBias = document.getElementById('input-ssao-bias');
  const valSsaoBias = document.getElementById('val-ssao-bias');
  const selectSsaoQuality = document.getElementById('select-ssao-quality');
  const inputSsaoLuminance = document.getElementById('input-ssao-luminance');
  const valSsaoLuminance = document.getElementById('val-ssao-luminance');

  const inputVignetteDarkness = document.getElementById('input-vignette-darkness');
  const valVignetteDarkness = document.getElementById('val-vignette-darkness');
  const inputVignetteOffset = document.getElementById('input-vignette-offset');
  const valVignetteOffset = document.getElementById('val-vignette-offset');
  const selectVignetteTechnique = document.getElementById('select-vignette-technique');

  const inputGrainIntensity = document.getElementById('input-grain-intensity');
  const valGrainIntensity = document.getElementById('val-grain-intensity');
  const selectGrainBlend = document.getElementById('select-grain-blend');
  const checkboxGrainAnimated = document.getElementById('checkbox-grain-animated');

  const btnMotionDynamic = document.getElementById('btn-motion-dynamic');
  const inputMotionBlur = document.getElementById('input-motion-blur');
  const valMotionBlur = document.getElementById('val-motion-blur');
  const inputMotionStreak = document.getElementById('input-motion-streak');
  const valMotionStreak = document.getElementById('val-motion-streak');
  const inputMotionRadial = document.getElementById('input-motion-radial');
  const valMotionRadial = document.getElementById('val-motion-radial');
  const selectMotionSamples = document.getElementById('select-motion-samples');

  const inputChromaticOffset = document.getElementById('input-chromatic-offset');
  const valChromaticOffset = document.getElementById('val-chromatic-offset');
  const inputChromaticFalloff = document.getElementById('input-chromatic-falloff');
  const valChromaticFalloff = document.getElementById('val-chromatic-falloff');

  const btnDofAutofocus = document.getElementById('btn-dof-autofocus');
  const inputDofFocus = document.getElementById('input-dof-focus');
  const valDofFocus = document.getElementById('val-dof-focus');
  const inputDofAperture = document.getElementById('input-dof-aperture');
  const valDofAperture = document.getElementById('val-dof-aperture');
  const inputDofBokeh = document.getElementById('input-dof-bokeh');
  const valDofBokeh = document.getElementById('val-dof-bokeh');

  const selectGlitchMode = document.getElementById('select-glitch-mode');
  const inputGlitchStrength = document.getElementById('input-glitch-strength');
  const valGlitchStrength = document.getElementById('val-glitch-strength');
  const inputGlitchRatio = document.getElementById('input-glitch-ratio');
  const valGlitchRatio = document.getElementById('val-glitch-ratio');
  const inputScanlineDensity = document.getElementById('input-scanline-density');
  const valScanlineDensity = document.getElementById('val-scanline-density');
  const inputScanlineOpacity = document.getElementById('input-scanline-opacity');
  const valScanlineOpacity = document.getElementById('val-scanline-opacity');

  const inputSepiaIntensity = document.getElementById('input-sepia-intensity');
  const valSepiaIntensity = document.getElementById('val-sepia-intensity');

  const selectTonemapping = document.getElementById('select-tonemapping');
  const inputColorContrast = document.getElementById('input-color-contrast');
  const valColorContrast = document.getElementById('val-color-contrast');
  const inputColorSaturation = document.getElementById('input-color-saturation');
  const valColorSaturation = document.getElementById('val-color-saturation');
  const inputColorBrightness = document.getElementById('input-color-brightness');
  const valColorBrightness = document.getElementById('val-color-brightness');

  const selectAaMode = document.getElementById('select-aa-mode');
  const selectRenderScale = document.getElementById('select-render-scale');

  // 1-Click Cinematic Presets Definitions
  const FX_PRESETS = {
    'cinema_35mm': {
      vignetteDarkness: 0.65,
      vignetteOffset: 0.35,
      vignetteTechnique: 'default',
      grainIntensity: 0.18,
      grainBlendMode: 'overlay',
      isGrainAnimated: true,
      motionBlurStrength: 0.40,
      isDynamicMotionBlur: true,
      turntableStreak: 0.00,
      motionRadialWarp: 0.00,
      chromaticOffset: 0.002,
      chromaticFalloff: 1.2,
      dofFocusDistance: 4.2,
      dofAperture: 0.08,
      dofBokehScale: 2.5,
      glitchMode: 'off',
      glitchStrength: 0.50,
      glitchRatio: 0.50,
      scanlineDensity: 0.0,
      scanlineOpacity: 0.0,
      sepiaIntensity: 0.0,
      bloomMode: 'headlight',
      bloomIntensity: 1.20,
      bloomRadius: 0.45,
      bloomThreshold: 0.70,
      ssaoIntensity: 1.20,
      colorTonemapping: 'aces',
      colorContrast: 0.08,
      colorSaturation: 0.05,
      colorBrightness: -0.02
    },
    'cyberpunk': {
      vignetteDarkness: 0.80,
      vignetteOffset: 0.25,
      vignetteTechnique: 'eskil',
      grainIntensity: 0.12,
      grainBlendMode: 'overlay',
      isGrainAnimated: true,
      motionBlurStrength: 0.30,
      isDynamicMotionBlur: true,
      turntableStreak: 0.00,
      motionRadialWarp: 0.05,
      chromaticOffset: 0.006,
      chromaticFalloff: 0.8,
      dofFocusDistance: 4.2,
      dofAperture: 0.00,
      dofBokehScale: 2.0,
      glitchMode: 'sporadic',
      glitchStrength: 0.60,
      glitchRatio: 0.65,
      scanlineDensity: 4.5,
      scanlineOpacity: 0.35,
      sepiaIntensity: 0.0,
      bloomMode: 'all',
      bloomIntensity: 2.50,
      bloomRadius: 0.60,
      bloomThreshold: 0.60,
      ssaoIntensity: 1.50,
      colorTonemapping: 'aces',
      colorContrast: 0.25,
      colorSaturation: 0.30,
      colorBrightness: 0.02
    },
    'speed_turntable': {
      vignetteDarkness: 0.50,
      vignetteOffset: 0.40,
      vignetteTechnique: 'default',
      grainIntensity: 0.05,
      grainBlendMode: 'overlay',
      isGrainAnimated: true,
      motionBlurStrength: 1.20,
      isDynamicMotionBlur: true,
      turntableStreak: 0.80,
      motionRadialWarp: 0.20,
      chromaticOffset: 0.004,
      chromaticFalloff: 1.0,
      dofFocusDistance: 4.2,
      dofAperture: 0.05,
      dofBokehScale: 3.0,
      glitchMode: 'off',
      glitchStrength: 0.50,
      glitchRatio: 0.50,
      scanlineDensity: 0.0,
      scanlineOpacity: 0.0,
      sepiaIntensity: 0.0,
      bloomMode: 'headlight',
      bloomIntensity: 1.50,
      bloomRadius: 0.50,
      bloomThreshold: 0.70,
      ssaoIntensity: 0.80,
      colorTonemapping: 'aces',
      colorContrast: 0.12,
      colorSaturation: 0.10,
      colorBrightness: -0.01
    },
    'portrait_bokeh': {
      vignetteDarkness: 0.40,
      vignetteOffset: 0.45,
      vignetteTechnique: 'default',
      grainIntensity: 0.04,
      grainBlendMode: 'soft-light',
      isGrainAnimated: true,
      motionBlurStrength: 0.00,
      isDynamicMotionBlur: false,
      turntableStreak: 0.00,
      motionRadialWarp: 0.00,
      chromaticOffset: 0.001,
      chromaticFalloff: 2.0,
      dofFocusDistance: 4.2,
      dofAperture: 0.25,
      dofBokehScale: 5.0,
      glitchMode: 'off',
      glitchStrength: 0.50,
      glitchRatio: 0.50,
      scanlineDensity: 0.0,
      scanlineOpacity: 0.0,
      sepiaIntensity: 0.0,
      bloomMode: 'headlight',
      bloomIntensity: 0.80,
      bloomRadius: 0.35,
      bloomThreshold: 0.75,
      ssaoIntensity: 1.60,
      colorTonemapping: 'aces',
      colorContrast: 0.04,
      colorSaturation: 0.08,
      colorBrightness: 0.00
    },
    'vintage_sepia': {
      vignetteDarkness: 0.90,
      vignetteOffset: 0.20,
      vignetteTechnique: 'eskil',
      grainIntensity: 0.35,
      grainBlendMode: 'multiply',
      isGrainAnimated: true,
      motionBlurStrength: 0.20,
      isDynamicMotionBlur: true,
      turntableStreak: 0.00,
      motionRadialWarp: 0.00,
      chromaticOffset: 0.003,
      chromaticFalloff: 1.5,
      dofFocusDistance: 4.2,
      dofAperture: 0.12,
      dofBokehScale: 3.0,
      glitchMode: 'off',
      glitchStrength: 0.50,
      glitchRatio: 0.50,
      scanlineDensity: 1.5,
      scanlineOpacity: 0.15,
      sepiaIntensity: 0.85,
      bloomMode: 'headlight',
      bloomIntensity: 0.60,
      bloomRadius: 0.30,
      bloomThreshold: 0.80,
      ssaoIntensity: 1.20,
      colorTonemapping: 'reinhard',
      colorContrast: 0.15,
      colorSaturation: -0.20,
      colorBrightness: -0.05
    },
    'pbr_pure': {
      vignetteDarkness: 0.00,
      vignetteOffset: 0.30,
      vignetteTechnique: 'default',
      grainIntensity: 0.00,
      grainBlendMode: 'overlay',
      isGrainAnimated: false,
      motionBlurStrength: 0.00,
      isDynamicMotionBlur: false,
      turntableStreak: 0.00,
      motionRadialWarp: 0.00,
      chromaticOffset: 0.000,
      chromaticFalloff: 1.0,
      dofFocusDistance: 4.2,
      dofAperture: 0.00,
      dofBokehScale: 2.0,
      glitchMode: 'off',
      glitchStrength: 0.50,
      glitchRatio: 0.50,
      scanlineDensity: 0.0,
      scanlineOpacity: 0.0,
      sepiaIntensity: 0.0,
      bloomMode: 'headlight',
      bloomIntensity: 1.00,
      bloomRadius: 0.40,
      bloomThreshold: 0.74,
      ssaoIntensity: 0.00,
      colorTonemapping: 'aces',
      colorContrast: 0.00,
      colorSaturation: 0.00,
      colorBrightness: -0.03
    }
  };

  // Synchronize UI Inputs and Badges from State
  function syncFxUiFromState() {
    if (valBloomIntensity) valBloomIntensity.textContent = bloomIntensity.toFixed(2);
    if (inputBloomIntensity) inputBloomIntensity.value = bloomIntensity;
    if (valBloomRadius) valBloomRadius.textContent = bloomRadius.toFixed(2);
    if (inputBloomRadius) inputBloomRadius.value = bloomRadius;
    if (valBloomThreshold) valBloomThreshold.textContent = bloomThreshold.toFixed(2);
    if (inputBloomThreshold) inputBloomThreshold.value = bloomThreshold;

    if (btnBloomMode) {
      if (bloomMode === 'all') btnBloomMode.textContent = 'All Objects Bloom Active';
      else if (bloomMode === 'off') btnBloomMode.textContent = 'Bloom Disabled';
      else btnBloomMode.textContent = 'Headlight Only Bloom Active';
    }

    if (valSsaoIntensity) valSsaoIntensity.textContent = ssaoIntensity.toFixed(2);
    if (inputSsaoIntensity) inputSsaoIntensity.value = ssaoIntensity;
    if (valSsaoRadius) valSsaoRadius.textContent = `${ssaoRadius.toFixed(2)}m`;
    if (inputSsaoRadius) inputSsaoRadius.value = ssaoRadius;
    if (valSsaoThreshold) valSsaoThreshold.textContent = ssaoThreshold.toFixed(2);
    if (inputSsaoThreshold) inputSsaoThreshold.value = ssaoThreshold;
    if (valSsaoFalloff) valSsaoFalloff.textContent = ssaoFalloff.toFixed(2);
    if (inputSsaoFalloff) inputSsaoFalloff.value = ssaoFalloff;
    if (valSsaoBias) valSsaoBias.textContent = ssaoBias.toFixed(3);
    if (inputSsaoBias) inputSsaoBias.value = ssaoBias;
    if (selectSsaoQuality) selectSsaoQuality.value = ssaoQuality;
    if (valSsaoLuminance) valSsaoLuminance.textContent = ssaoLuminance.toFixed(2);
    if (inputSsaoLuminance) inputSsaoLuminance.value = ssaoLuminance;

    if (valVignetteDarkness) valVignetteDarkness.textContent = vignetteDarkness.toFixed(2);
    if (inputVignetteDarkness) inputVignetteDarkness.value = vignetteDarkness;
    if (valVignetteOffset) valVignetteOffset.textContent = vignetteOffset.toFixed(2);
    if (inputVignetteOffset) inputVignetteOffset.value = vignetteOffset;
    if (selectVignetteTechnique) selectVignetteTechnique.value = vignetteTechnique;

    if (valGrainIntensity) valGrainIntensity.textContent = grainIntensity.toFixed(2);
    if (inputGrainIntensity) inputGrainIntensity.value = grainIntensity;
    if (selectGrainBlend) selectGrainBlend.value = grainBlendMode;
    if (checkboxGrainAnimated) checkboxGrainAnimated.checked = isGrainAnimated;

    if (btnMotionDynamic) {
      btnMotionDynamic.textContent = isDynamicMotionBlur ? '⚡ Dynamic Orbit Blur Active' : '⏸️ Dynamic Orbit Blur Off';
      btnMotionDynamic.classList.toggle('m3-btn-primary', isDynamicMotionBlur);
      btnMotionDynamic.classList.toggle('m3-btn-tonal', !isDynamicMotionBlur);
    }
    if (valMotionBlur) valMotionBlur.textContent = motionBlurStrength.toFixed(2);
    if (inputMotionBlur) inputMotionBlur.value = motionBlurStrength;
    if (valMotionStreak) valMotionStreak.textContent = turntableStreak.toFixed(2);
    if (inputMotionStreak) inputMotionStreak.value = turntableStreak;
    if (valMotionRadial) valMotionRadial.textContent = motionRadialWarp.toFixed(2);
    if (inputMotionRadial) inputMotionRadial.value = motionRadialWarp;
    if (selectMotionSamples) selectMotionSamples.value = motionSamples.toString();

    if (valChromaticOffset) valChromaticOffset.textContent = chromaticOffset.toFixed(3);
    if (inputChromaticOffset) inputChromaticOffset.value = chromaticOffset;
    if (valChromaticFalloff) valChromaticFalloff.textContent = chromaticFalloff.toFixed(1);
    if (inputChromaticFalloff) inputChromaticFalloff.value = chromaticFalloff;

    if (valDofFocus) valDofFocus.textContent = `${dofFocusDistance.toFixed(1)}m`;
    if (inputDofFocus) inputDofFocus.value = dofFocusDistance;
    if (valDofAperture) valDofAperture.textContent = dofAperture.toFixed(2);
    if (inputDofAperture) inputDofAperture.value = dofAperture;
    if (valDofBokeh) valDofBokeh.textContent = dofBokehScale.toFixed(1);
    if (inputDofBokeh) inputDofBokeh.value = dofBokehScale;

    if (selectGlitchMode) selectGlitchMode.value = glitchMode;
    if (valGlitchStrength) valGlitchStrength.textContent = glitchStrength.toFixed(2);
    if (inputGlitchStrength) inputGlitchStrength.value = glitchStrength;
    if (valGlitchRatio) valGlitchRatio.textContent = glitchRatio.toFixed(2);
    if (inputGlitchRatio) inputGlitchRatio.value = glitchRatio;
    if (valScanlineDensity) valScanlineDensity.textContent = scanlineDensity.toFixed(1);
    if (inputScanlineDensity) inputScanlineDensity.value = scanlineDensity;
    if (valScanlineOpacity) valScanlineOpacity.textContent = scanlineOpacity.toFixed(2);
    if (inputScanlineOpacity) inputScanlineOpacity.value = scanlineOpacity;

    if (valSepiaIntensity) valSepiaIntensity.textContent = sepiaIntensity.toFixed(2);
    if (inputSepiaIntensity) inputSepiaIntensity.value = sepiaIntensity;

    if (selectTonemapping) selectTonemapping.value = colorTonemapping;
    if (valColorContrast) valColorContrast.textContent = colorContrast.toFixed(2);
    if (inputColorContrast) inputColorContrast.value = colorContrast;
    if (valColorSaturation) valColorSaturation.textContent = colorSaturation.toFixed(2);
    if (inputColorSaturation) inputColorSaturation.value = colorSaturation;
    if (valColorBrightness) valColorBrightness.textContent = colorBrightness.toFixed(2);
    if (inputColorBrightness) inputColorBrightness.value = colorBrightness;

    if (selectAaMode) selectAaMode.value = aaMode;
    if (selectRenderScale) selectRenderScale.value = renderScale;
  }

  // 1-Click FX Preset Chips Listener
  const fxPresetButtons = document.querySelectorAll('#fx-presets-row [data-fx-preset]');
  fxPresetButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      const presetKey = btn.getAttribute('data-fx-preset');
      const preset = FX_PRESETS[presetKey];
      if (!preset) return;

      fxPresetButtons.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      Object.assign(window, {
        vignetteDarkness: preset.vignetteDarkness,
        vignetteOffset: preset.vignetteOffset,
        vignetteTechnique: preset.vignetteTechnique,
        grainIntensity: preset.grainIntensity,
        grainBlendMode: preset.grainBlendMode,
        isGrainAnimated: preset.isGrainAnimated,
        motionBlurStrength: preset.motionBlurStrength,
        isDynamicMotionBlur: preset.isDynamicMotionBlur,
        turntableStreak: preset.turntableStreak,
        motionRadialWarp: preset.motionRadialWarp,
        chromaticOffset: preset.chromaticOffset,
        chromaticFalloff: preset.chromaticFalloff,
        dofFocusDistance: preset.dofFocusDistance,
        dofAperture: preset.dofAperture,
        dofBokehScale: preset.dofBokehScale,
        glitchMode: preset.glitchMode,
        glitchStrength: preset.glitchStrength,
        glitchRatio: preset.glitchRatio,
        scanlineDensity: preset.scanlineDensity,
        scanlineOpacity: preset.scanlineOpacity,
        sepiaIntensity: preset.sepiaIntensity,
        bloomMode: preset.bloomMode,
        bloomIntensity: preset.bloomIntensity,
        bloomRadius: preset.bloomRadius,
        bloomThreshold: preset.bloomThreshold,
        ssaoIntensity: preset.ssaoIntensity,
        colorTonemapping: preset.colorTonemapping,
        colorContrast: preset.colorContrast,
        colorSaturation: preset.colorSaturation,
        colorBrightness: preset.colorBrightness
      });

      vignetteDarkness = preset.vignetteDarkness;
      vignetteOffset = preset.vignetteOffset;
      vignetteTechnique = preset.vignetteTechnique;
      grainIntensity = preset.grainIntensity;
      grainBlendMode = preset.grainBlendMode;
      isGrainAnimated = preset.isGrainAnimated;
      motionBlurStrength = preset.motionBlurStrength;
      isDynamicMotionBlur = preset.isDynamicMotionBlur;
      turntableStreak = preset.turntableStreak;
      motionRadialWarp = preset.motionRadialWarp;
      chromaticOffset = preset.chromaticOffset;
      chromaticFalloff = preset.chromaticFalloff;
      dofFocusDistance = preset.dofFocusDistance;
      dofAperture = preset.dofAperture;
      dofBokehScale = preset.dofBokehScale;
      glitchMode = preset.glitchMode;
      glitchStrength = preset.glitchStrength;
      glitchRatio = preset.glitchRatio;
      scanlineDensity = preset.scanlineDensity;
      scanlineOpacity = preset.scanlineOpacity;
      sepiaIntensity = preset.sepiaIntensity;
      bloomMode = preset.bloomMode;
      bloomIntensity = preset.bloomIntensity;
      bloomRadius = preset.bloomRadius;
      bloomThreshold = preset.bloomThreshold;
      ssaoIntensity = preset.ssaoIntensity;
      colorTonemapping = preset.colorTonemapping;
      colorContrast = preset.colorContrast;
      colorSaturation = preset.colorSaturation;
      colorBrightness = preset.colorBrightness;

      syncFxUiFromState();
      applyPostFx();
      updateConfigJson();
    });
  });

  // --- Bloom Listeners ---
  if (btnBloomMode) {
    btnBloomMode.addEventListener('click', () => {
      if (bloomMode === 'headlight') {
        bloomMode = 'all';
        btnBloomMode.textContent = 'All Objects Bloom Active';
      } else if (bloomMode === 'all') {
        bloomMode = 'off';
        btnBloomMode.textContent = 'Bloom Disabled';
      } else {
        bloomMode = 'headlight';
        btnBloomMode.textContent = 'Headlight Only Bloom Active';
      }
      applyPostFx();
      updateConfigJson();
    });
  }

  if (inputBloomIntensity) {
    inputBloomIntensity.addEventListener('input', (e) => {
      bloomIntensity = parseFloat(e.target.value);
      if (valBloomIntensity) valBloomIntensity.textContent = bloomIntensity.toFixed(2);
      applyPostFx();
      updateConfigJson();
    });
  }

  if (inputBloomRadius) {
    inputBloomRadius.addEventListener('input', (e) => {
      bloomRadius = parseFloat(e.target.value);
      if (valBloomRadius) valBloomRadius.textContent = bloomRadius.toFixed(2);
      applyPostFx();
      updateConfigJson();
    });
  }

  if (inputBloomThreshold) {
    inputBloomThreshold.addEventListener('input', (e) => {
      bloomThreshold = parseFloat(e.target.value);
      if (valBloomThreshold) valBloomThreshold.textContent = bloomThreshold.toFixed(2);
      applyPostFx();
      updateConfigJson();
    });
  }

  // --- SSAO Pro Listeners ---
  if (inputSsaoIntensity) {
    inputSsaoIntensity.addEventListener('input', (e) => {
      ssaoIntensity = parseFloat(e.target.value);
      if (valSsaoIntensity) valSsaoIntensity.textContent = ssaoIntensity.toFixed(2);
      applyPostFx();
      updateConfigJson();
    });
  }

  if (inputSsaoRadius) {
    inputSsaoRadius.addEventListener('input', (e) => {
      ssaoRadius = parseFloat(e.target.value);
      if (valSsaoRadius) valSsaoRadius.textContent = `${ssaoRadius.toFixed(2)}m`;
      applyPostFx();
      updateConfigJson();
    });
  }

  if (inputSsaoThreshold) {
    inputSsaoThreshold.addEventListener('input', (e) => {
      ssaoThreshold = parseFloat(e.target.value);
      if (valSsaoThreshold) valSsaoThreshold.textContent = ssaoThreshold.toFixed(2);
      applyPostFx();
      updateConfigJson();
    });
  }

  if (inputSsaoFalloff) {
    inputSsaoFalloff.addEventListener('input', (e) => {
      ssaoFalloff = parseFloat(e.target.value);
      if (valSsaoFalloff) valSsaoFalloff.textContent = ssaoFalloff.toFixed(2);
      applyPostFx();
      updateConfigJson();
    });
  }

  if (inputSsaoBias) {
    inputSsaoBias.addEventListener('input', (e) => {
      ssaoBias = parseFloat(e.target.value);
      if (valSsaoBias) valSsaoBias.textContent = ssaoBias.toFixed(3);
      applyPostFx();
      updateConfigJson();
    });
  }

  if (selectSsaoQuality) {
    selectSsaoQuality.addEventListener('change', (e) => {
      ssaoQuality = e.target.value;
      if (ssaoQuality === 'ultra') {
        ssaoSamples = 32;
        ssaoRings = 8;
      } else if (ssaoQuality === 'high') {
        ssaoSamples = 24;
        ssaoRings = 6;
      } else if (ssaoQuality === 'balanced') {
        ssaoSamples = 16;
        ssaoRings = 4;
      } else if (ssaoQuality === 'performance') {
        ssaoSamples = 11;
        ssaoRings = 3;
      }
      applyPostFx();
      updateConfigJson();
    });
  }

  if (inputSsaoLuminance) {
    inputSsaoLuminance.addEventListener('input', (e) => {
      ssaoLuminance = parseFloat(e.target.value);
      if (valSsaoLuminance) valSsaoLuminance.textContent = ssaoLuminance.toFixed(2);
      applyPostFx();
      updateConfigJson();
    });
  }

  // --- Vignette Listeners ---
  if (inputVignetteDarkness) {
    inputVignetteDarkness.addEventListener('input', (e) => {
      vignetteDarkness = parseFloat(e.target.value);
      if (valVignetteDarkness) valVignetteDarkness.textContent = vignetteDarkness.toFixed(2);
      applyPostFx();
      updateConfigJson();
    });
  }

  if (inputVignetteOffset) {
    inputVignetteOffset.addEventListener('input', (e) => {
      vignetteOffset = parseFloat(e.target.value);
      if (valVignetteOffset) valVignetteOffset.textContent = vignetteOffset.toFixed(2);
      applyPostFx();
      updateConfigJson();
    });
  }

  if (selectVignetteTechnique) {
    selectVignetteTechnique.addEventListener('change', (e) => {
      vignetteTechnique = e.target.value;
      applyPostFx();
      updateConfigJson();
    });
  }

  // --- Film Grain Listeners ---
  if (inputGrainIntensity) {
    inputGrainIntensity.addEventListener('input', (e) => {
      grainIntensity = parseFloat(e.target.value);
      if (valGrainIntensity) valGrainIntensity.textContent = grainIntensity.toFixed(2);
      applyPostFx();
      updateConfigJson();
    });
  }

  if (selectGrainBlend) {
    selectGrainBlend.addEventListener('change', (e) => {
      grainBlendMode = e.target.value;
      applyPostFx();
      updateConfigJson();
    });
  }

  if (checkboxGrainAnimated) {
    checkboxGrainAnimated.addEventListener('change', (e) => {
      isGrainAnimated = e.target.checked;
      updateConfigJson();
    });
  }

  // --- Motion Blur Listeners ---
  if (btnMotionDynamic) {
    btnMotionDynamic.addEventListener('click', () => {
      isDynamicMotionBlur = !isDynamicMotionBlur;
      btnMotionDynamic.textContent = isDynamicMotionBlur ? '⚡ Dynamic Orbit Blur Active' : '⏸️ Dynamic Orbit Blur Off';
      btnMotionDynamic.classList.toggle('m3-btn-primary', isDynamicMotionBlur);
      btnMotionDynamic.classList.toggle('m3-btn-tonal', !isDynamicMotionBlur);
      applyPostFx();
      updateConfigJson();
    });
  }

  if (inputMotionBlur) {
    inputMotionBlur.addEventListener('input', (e) => {
      motionBlurStrength = parseFloat(e.target.value);
      if (valMotionBlur) valMotionBlur.textContent = motionBlurStrength.toFixed(2);
      applyPostFx();
      updateConfigJson();
    });
  }

  if (inputMotionStreak) {
    inputMotionStreak.addEventListener('input', (e) => {
      turntableStreak = parseFloat(e.target.value);
      if (valMotionStreak) valMotionStreak.textContent = turntableStreak.toFixed(2);
      applyPostFx();
      updateConfigJson();
    });
  }

  if (inputMotionRadial) {
    inputMotionRadial.addEventListener('input', (e) => {
      motionRadialWarp = parseFloat(e.target.value);
      if (valMotionRadial) valMotionRadial.textContent = motionRadialWarp.toFixed(2);
      applyPostFx();
      updateConfigJson();
    });
  }

  if (selectMotionSamples) {
    selectMotionSamples.addEventListener('change', (e) => {
      motionSamples = parseInt(e.target.value, 10) || 16;
      applyPostFx();
      updateConfigJson();
    });
  }

  // --- Chromatic Aberration Listeners ---
  if (inputChromaticOffset) {
    inputChromaticOffset.addEventListener('input', (e) => {
      chromaticOffset = parseFloat(e.target.value);
      if (valChromaticOffset) valChromaticOffset.textContent = chromaticOffset.toFixed(3);
      applyPostFx();
      updateConfigJson();
    });
  }

  if (inputChromaticFalloff) {
    inputChromaticFalloff.addEventListener('input', (e) => {
      chromaticFalloff = parseFloat(e.target.value);
      if (valChromaticFalloff) valChromaticFalloff.textContent = chromaticFalloff.toFixed(1);
      applyPostFx();
      updateConfigJson();
    });
  }

  // --- Depth of Field Listeners ---
  if (btnDofAutofocus) {
    btnDofAutofocus.addEventListener('click', () => {
      dofFocusDistance = 4.2;
      dofAperture = 0.15;
      dofBokehScale = 3.5;
      syncFxUiFromState();
      applyPostFx();
      updateConfigJson();
      btnDofAutofocus.textContent = '🎯 Focus Locked (4.2m)';
      setTimeout(() => btnDofAutofocus.textContent = '🎯 Auto-Focus on BMW X7', 1500);
    });
  }

  if (inputDofFocus) {
    inputDofFocus.addEventListener('input', (e) => {
      dofFocusDistance = parseFloat(e.target.value);
      if (valDofFocus) valDofFocus.textContent = `${dofFocusDistance.toFixed(1)}m`;
      applyPostFx();
      updateConfigJson();
    });
  }

  if (inputDofAperture) {
    inputDofAperture.addEventListener('input', (e) => {
      dofAperture = parseFloat(e.target.value);
      if (valDofAperture) valDofAperture.textContent = dofAperture.toFixed(2);
      applyPostFx();
      updateConfigJson();
    });
  }

  if (inputDofBokeh) {
    inputDofBokeh.addEventListener('input', (e) => {
      dofBokehScale = parseFloat(e.target.value);
      if (valDofBokeh) valDofBokeh.textContent = dofBokehScale.toFixed(1);
      applyPostFx();
      updateConfigJson();
    });
  }

  // --- Glitch & Telemetry Listeners ---
  if (selectGlitchMode) {
    selectGlitchMode.addEventListener('change', (e) => {
      glitchMode = e.target.value;
      applyPostFx();
      updateConfigJson();
    });
  }

  if (inputGlitchStrength) {
    inputGlitchStrength.addEventListener('input', (e) => {
      glitchStrength = parseFloat(e.target.value);
      if (valGlitchStrength) valGlitchStrength.textContent = glitchStrength.toFixed(2);
      applyPostFx();
      updateConfigJson();
    });
  }

  if (inputGlitchRatio) {
    inputGlitchRatio.addEventListener('input', (e) => {
      glitchRatio = parseFloat(e.target.value);
      if (valGlitchRatio) valGlitchRatio.textContent = glitchRatio.toFixed(2);
      applyPostFx();
      updateConfigJson();
    });
  }

  if (inputScanlineDensity) {
    inputScanlineDensity.addEventListener('input', (e) => {
      scanlineDensity = parseFloat(e.target.value);
      if (valScanlineDensity) valScanlineDensity.textContent = scanlineDensity.toFixed(1);
      applyPostFx();
      updateConfigJson();
    });
  }

  if (inputScanlineOpacity) {
    inputScanlineOpacity.addEventListener('input', (e) => {
      scanlineOpacity = parseFloat(e.target.value);
      if (valScanlineOpacity) valScanlineOpacity.textContent = scanlineOpacity.toFixed(2);
      applyPostFx();
      updateConfigJson();
    });
  }

  // --- Sepia Listeners ---
  if (inputSepiaIntensity) {
    inputSepiaIntensity.addEventListener('input', (e) => {
      sepiaIntensity = parseFloat(e.target.value);
      if (valSepiaIntensity) valSepiaIntensity.textContent = sepiaIntensity.toFixed(2);
      applyPostFx();
      updateConfigJson();
    });
  }

  // --- Color Grade Listeners ---
  if (selectTonemapping) {
    selectTonemapping.addEventListener('change', (e) => {
      colorTonemapping = e.target.value;
      applyPostFx();
      updateConfigJson();
    });
  }

  if (inputColorContrast) {
    inputColorContrast.addEventListener('input', (e) => {
      colorContrast = parseFloat(e.target.value);
      if (valColorContrast) valColorContrast.textContent = colorContrast.toFixed(2);
      applyPostFx();
      updateConfigJson();
    });
  }

  if (inputColorSaturation) {
    inputColorSaturation.addEventListener('input', (e) => {
      colorSaturation = parseFloat(e.target.value);
      if (valColorSaturation) valColorSaturation.textContent = colorSaturation.toFixed(2);
      applyPostFx();
      updateConfigJson();
    });
  }

  if (inputColorBrightness) {
    inputColorBrightness.addEventListener('input', (e) => {
      colorBrightness = parseFloat(e.target.value);
      if (valColorBrightness) valColorBrightness.textContent = colorBrightness.toFixed(2);
      applyPostFx();
      updateConfigJson();
    });
  }

  if (selectAaMode) {
    selectAaMode.addEventListener('change', (e) => {
      aaMode = e.target.value;
      applyPostFx();
      updateConfigJson();
    });
  }

  if (selectRenderScale) {
    selectRenderScale.addEventListener('change', (e) => {
      renderScale = e.target.value;
      applyPostFx();
      updateConfigJson();
    });
  }

  // Preset Export/Import
  const exportJsonText = document.getElementById('export-json-text');
  const copyJsonBtn = document.getElementById('copy-json-btn');
  const importJsonText = document.getElementById('import-json-text');
  const applyImportJsonBtn = document.getElementById('apply-import-json-btn');

  function updateConfigJson() {
    if (!exportJsonText) return;
    const config = {
      paint: { name: currentPaintName, hex: currentPaintHex, price: currentPaintPrice },
      wheel: { option: currentWheelOption, name: currentWheelName },
      interior: { seatHex: currentSeatHex, name: currentSeatName },
      lighting: { exposure: currentExposure, shadowIntensity: currentShadowIntensity, hdri: currentHdri },
      postfx: { 
        bloomMode, 
        bloomIntensity, 
        bloomRadius, 
        bloomThreshold, 
        ssaoIntensity, 
        ssaoRadius,
        ssaoThreshold,
        ssaoFalloff,
        ssaoBias,
        ssaoQuality,
        ssaoLuminance,
        vignetteDarkness,
        vignetteOffset,
        vignetteTechnique,
        grainIntensity,
        grainBlendMode,
        isGrainAnimated,
        motionBlurStrength,
        isDynamicMotionBlur,
        turntableStreak,
        motionRadialWarp,
        motionSamples,
        chromaticOffset,
        chromaticFalloff,
        dofFocusDistance,
        dofAperture,
        dofBokehScale,
        glitchMode,
        glitchStrength,
        glitchRatio,
        scanlineDensity,
        scanlineOpacity,
        sepiaIntensity,
        tonemapping: colorTonemapping, 
        contrast: colorContrast, 
        saturation: colorSaturation, 
        brightness: colorBrightness,
        aaMode,
        renderScale
      }
    };
    exportJsonText.value = JSON.stringify(config, null, 2);
  }

  if (copyJsonBtn) {
    copyJsonBtn.addEventListener('click', () => {
      updateConfigJson();
      if (exportJsonText) {
        navigator.clipboard.writeText(exportJsonText.value);
        copyJsonBtn.textContent = '✅ Copied to Clipboard!';
        setTimeout(() => copyJsonBtn.textContent = '📋 Copy Config JSON', 2000);
      }
    });
  }

  if (applyImportJsonBtn) {
    applyImportJsonBtn.addEventListener('click', () => {
      if (!importJsonText || !importJsonText.value) return;
      try {
        const config = JSON.parse(importJsonText.value);
        if (config.lighting) {
          if (config.lighting.exposure !== undefined) {
            currentExposure = config.lighting.exposure;
            const inputExp = document.getElementById('input-exposure');
            if (inputExp) inputExp.value = currentExposure;
          }
          if (config.lighting.shadowIntensity !== undefined) {
            currentShadowIntensity = config.lighting.shadowIntensity;
            const inputShad = document.getElementById('input-shadow-intensity');
            if (inputShad) inputShad.value = currentShadowIntensity;
          }
        }
        if (config.postfx) {
          if (config.postfx.bloomMode !== undefined) bloomMode = config.postfx.bloomMode;
          if (config.postfx.bloomIntensity !== undefined) bloomIntensity = config.postfx.bloomIntensity;
          if (config.postfx.bloomRadius !== undefined) bloomRadius = config.postfx.bloomRadius;
          if (config.postfx.bloomThreshold !== undefined) bloomThreshold = config.postfx.bloomThreshold;
          if (config.postfx.ssaoIntensity !== undefined) ssaoIntensity = config.postfx.ssaoIntensity;
          if (config.postfx.ssaoRadius !== undefined) ssaoRadius = config.postfx.ssaoRadius;
          if (config.postfx.ssaoThreshold !== undefined) ssaoThreshold = config.postfx.ssaoThreshold;
          if (config.postfx.ssaoFalloff !== undefined) ssaoFalloff = config.postfx.ssaoFalloff;
          if (config.postfx.ssaoBias !== undefined) ssaoBias = config.postfx.ssaoBias;
          if (config.postfx.ssaoQuality !== undefined) ssaoQuality = config.postfx.ssaoQuality;
          if (config.postfx.ssaoLuminance !== undefined) ssaoLuminance = config.postfx.ssaoLuminance;
          if (config.postfx.vignetteDarkness !== undefined) vignetteDarkness = config.postfx.vignetteDarkness;
          if (config.postfx.vignetteOffset !== undefined) vignetteOffset = config.postfx.vignetteOffset;
          if (config.postfx.vignetteTechnique !== undefined) vignetteTechnique = config.postfx.vignetteTechnique;
          if (config.postfx.grainIntensity !== undefined) grainIntensity = config.postfx.grainIntensity;
          if (config.postfx.grainBlendMode !== undefined) grainBlendMode = config.postfx.grainBlendMode;
          if (config.postfx.isGrainAnimated !== undefined) isGrainAnimated = config.postfx.isGrainAnimated;
          if (config.postfx.motionBlurStrength !== undefined) motionBlurStrength = config.postfx.motionBlurStrength;
          if (config.postfx.isDynamicMotionBlur !== undefined) isDynamicMotionBlur = config.postfx.isDynamicMotionBlur;
          if (config.postfx.turntableStreak !== undefined) turntableStreak = config.postfx.turntableStreak;
          if (config.postfx.motionRadialWarp !== undefined) motionRadialWarp = config.postfx.motionRadialWarp;
          if (config.postfx.motionSamples !== undefined) motionSamples = config.postfx.motionSamples;
          if (config.postfx.chromaticOffset !== undefined) chromaticOffset = config.postfx.chromaticOffset;
          if (config.postfx.chromaticFalloff !== undefined) chromaticFalloff = config.postfx.chromaticFalloff;
          if (config.postfx.dofFocusDistance !== undefined) dofFocusDistance = config.postfx.dofFocusDistance;
          if (config.postfx.dofAperture !== undefined) dofAperture = config.postfx.dofAperture;
          if (config.postfx.dofBokehScale !== undefined) dofBokehScale = config.postfx.dofBokehScale;
          if (config.postfx.glitchMode !== undefined) glitchMode = config.postfx.glitchMode;
          if (config.postfx.glitchStrength !== undefined) glitchStrength = config.postfx.glitchStrength;
          if (config.postfx.glitchRatio !== undefined) glitchRatio = config.postfx.glitchRatio;
          if (config.postfx.scanlineDensity !== undefined) scanlineDensity = config.postfx.scanlineDensity;
          if (config.postfx.scanlineOpacity !== undefined) scanlineOpacity = config.postfx.scanlineOpacity;
          if (config.postfx.sepiaIntensity !== undefined) sepiaIntensity = config.postfx.sepiaIntensity;
          if (config.postfx.tonemapping !== undefined) colorTonemapping = config.postfx.tonemapping;
          if (config.postfx.contrast !== undefined) colorContrast = config.postfx.contrast;
          if (config.postfx.saturation !== undefined) colorSaturation = config.postfx.saturation;
          if (config.postfx.brightness !== undefined) colorBrightness = config.postfx.brightness;
          if (config.postfx.aaMode !== undefined) aaMode = config.postfx.aaMode;
          if (config.postfx.renderScale !== undefined) renderScale = config.postfx.renderScale;
        }
        syncFxUiFromState();
        applyPostFx();
        applyImportJsonBtn.textContent = '✅ Preset Applied!';
        setTimeout(() => applyImportJsonBtn.textContent = '📥 Apply Preset', 2000);
      } catch (err) {
        alert('Invalid Configuration JSON.');
      }
    });
  }

  // ==========================================================================
  // Utility Controls (Theme, Auto-Rotate, Reset Camera, Fullscreen, AR)
  // ==========================================================================
  
  // Theme Toggle (Dynamic Light / Dark Adaptation)
  if (themeToggleBtn) {
    themeToggleBtn.addEventListener('click', () => {
      isDarkStudioTheme = !isDarkStudioTheme;
      if (studioContainer) studioContainer.classList.toggle('light-theme', !isDarkStudioTheme);
      document.body.classList.toggle('light-theme', !isDarkStudioTheme);
      document.documentElement.classList.toggle('light-theme', !isDarkStudioTheme);
      themeToggleBtn.style.color = isDarkStudioTheme ? '' : 'var(--text-accent)';
      updateDynamicThemeAccent(currentPaintHex);
      updateTabSlider();
      updateSegSlider();
    });
  }

  // Auto-Rotate
  if (toggleAutoRotateBtn) {
    toggleAutoRotateBtn.addEventListener('click', () => {
      isAutoRotating = !isAutoRotating;
      if (modelViewer) {
        if (isAutoRotating) modelViewer.setAttribute('auto-rotate', '');
        else modelViewer.removeAttribute('auto-rotate');
      }
      toggleAutoRotateBtn.style.color = isAutoRotating ? 'var(--text-accent)' : '';
    });
  }

  // Reset Camera
  if (resetCamBtn) {
    resetCamBtn.addEventListener('click', () => {
      glideCameraTo('front');
    });
  }

  // Fullscreen
  if (toggleFullscreenBtn) {
    toggleFullscreenBtn.addEventListener('click', () => {
      if (!document.fullscreenElement) {
        if (studioContainer && studioContainer.requestFullscreen) {
          studioContainer.requestFullscreen();
        }
      } else {
        if (document.exitFullscreen) document.exitFullscreen();
      }
    });
  }

  // ==========================================================================
  // Direct Native Augmented Reality Launcher (Google ARCore & WebXR Floor Tracking)
  // https://modelviewer.dev/examples/augmentedreality/
  // ==========================================================================
  function launchAr() {
    if (!modelViewer) return;
    try {
      // Directly activate native Google ARCore / WebXR camera session
      modelViewer.activateAR();
    } catch (err) {
      console.warn('Native AR activation error:', err);
    }
  }

  if (dockArTriggerBtn) {
    dockArTriggerBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      launchAr();
    });
  }

  if (navArTrigger) {
    navArTrigger.addEventListener('click', (e) => {
      e.stopPropagation();
      launchAr();
    });
  }

  if (modelViewer) {
    modelViewer.addEventListener('ar-status', (event) => {
      console.log('BMW AR Status:', event.detail.status);
    });
  }

  // ==========================================================================
  // Model Viewer Load Event & Loader Management
  // ==========================================================================
  const hideLoader = () => {
    if (viewerLoader) {
      viewerLoader.style.opacity = '0';
      viewerLoader.style.pointerEvents = 'none';
      setTimeout(() => {
        viewerLoader.style.display = 'none';
      }, 300);
    }
  };

  function onModelReady() {
    hideLoader();
    scanAllSceneMaterials();
    populateMaterialDropdown();
    applyActiveCustomizations();
    applyPostFx();
    updateConfigJson();
    setTimeout(() => {
      updateTabSlider();
      updateSegSlider();
    }, 60);
  }

  if (modelViewer) {
    modelViewer.addEventListener('load', onModelReady);

    modelViewer.addEventListener('progress', (e) => {
      if (e.detail.totalProgress >= 1.0) {
        hideLoader();
      }
    });

    modelViewer.addEventListener('error', (err) => {
      console.warn('Model Viewer error:', err);
      hideLoader();
    });

    if (modelViewer.loaded) {
      onModelReady();
    }
  }

  // Initial State Setup
  updatePriceDisplay();
  updateDynamicThemeAccent(currentPaintHex);
  updateConfigJson();
  setTimeout(() => {
    updateTabSlider();
    updateSegSlider();
  }, 100);
});
