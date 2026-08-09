/**
 * BMW X7 M60i - Apple/VisionOS Liquid Glass 3D Configurator & WebXR Engine
 * Refraction Optics, Dynamic Cursor Raycasting & Adaptive High-Contrast Typography
 * Learned from: https://kube.io/blog/liquid-glass-css-svg/
 */

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
  const activeWheelPrice = document.getElementById('active-wheel-price');
  const activeInteriorTitle = document.getElementById('active-interior-title');
  const activeInteriorPrice = document.getElementById('active-interior-price');

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

  let currentWheelPrice = 0;
  let currentSeatPrice = 0;
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

  // Lighting & Post-FX State
  let currentExposure = 1.10;
  let currentShadowIntensity = 1.50;
  let currentShadowSoftness = 0.30;
  let currentHdri = './assets/studio.hdr';

  let bloomMode = 'headlight';
  let bloomIntensity = 1.20;
  let bloomRadius = 0.50;
  let bloomThreshold = 0.20;
  let ssaoIntensity = 0.00;
  let ssaoRadius = 0.05;
  let colorContrast = 0.00;
  let colorSaturation = 0.00;
  let colorBrightness = -0.03;
  let colorTonemapping = 'aces';

  // Camera Presets
  const CAMERA_PRESETS = {
    'front': { orbit: '45deg 75deg 6m', target: 'auto auto auto', watermark: 'EXTERIOR' },
    'side': { orbit: '90deg 85deg 5.5m', target: '0m 0.4m 0m', watermark: 'PROFILE' },
    'cabin': { orbit: '0deg 30deg 3.2m', target: '0m 0.5m 0m', watermark: 'INTERIOR' },
    'rear': { orbit: '135deg 80deg 6m', target: 'auto auto auto', watermark: 'REAR' },
    'wheels': { orbit: '65deg 88deg 2.4m', target: '0.75m 0.35m 1.35m', watermark: 'WHEELS' },
    'lights': { orbit: '15deg 82deg 4.2m', target: '0m 0.6m 1.8m', watermark: 'LIGHTS' },
    'mechanics': { orbit: '65deg 75deg 6.5m', target: 'auto auto auto', watermark: 'MECHANICS' }
  };

  const TAB_METADATA = {
    'exterior': { badge: 'EXTERIOR PAINTS', title: 'Paint & Finishes', cam: 'front' },
    'wheels': { badge: 'WHEELS & RIMS', title: 'Wheel Options', cam: 'wheels' },
    'interior': { badge: 'CABIN & UPHOLSTERY', title: 'Luxury Seats', cam: 'cabin' },
    'mechanics': { badge: 'FEATURES & PERFORMANCE', title: 'Interactive Mechanics', cam: 'mechanics' },
    'studio': { badge: '3D PRO STUDIO', title: 'Lighting & PBR Lab', cam: 'front' }
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

  // Update Live MSRP Counter & Breakdown
  function updatePriceDisplay() {
    const totalOptions = currentPaintPrice + currentWheelPrice + currentSeatPrice;
    const total = BASE_PRICE + totalOptions;
    const formatted = `$${total.toLocaleString()}`;
    if (topPriceDisplay) topPriceDisplay.textContent = formatted;
    if (totalPriceDisplay) totalPriceDisplay.textContent = formatted;

    const priceDelta = totalOptions > 0 ? `(+$${totalOptions.toLocaleString()})` : '($0)';
    if (activePaintLbl) activePaintLbl.textContent = `2026. ${currentPaintName.toUpperCase()} ${priceDelta}`;
    if (activeFinishTitle) activeFinishTitle.textContent = currentPaintName;
    if (activeFinishPrice) activeFinishPrice.textContent = currentPaintPrice > 0 ? `+$${currentPaintPrice.toLocaleString()}` : '$0';
    if (activeWheelPrice) activeWheelPrice.textContent = currentWheelPrice > 0 ? `+$${currentWheelPrice.toLocaleString()}` : '$0';
    if (activeInteriorPrice) activeInteriorPrice.textContent = currentSeatPrice > 0 ? `+$${currentSeatPrice.toLocaleString()}` : '$0';
    if (buildSummaryLbl) buildSummaryLbl.textContent = `${currentPaintName} • ${currentWheelName} • $${total.toLocaleString()}`;
  }

  // Locate Three.js Scene Root in Model-Viewer
  function getThreeScene() {
    if (!modelViewer) return null;
    const effectComposer = document.getElementById('effect-composer');
    const targets = [effectComposer, modelViewer];

    for (const target of targets) {
      if (!target) continue;
      if (target.scene && typeof target.scene.traverse === 'function') return target.scene;

      const keys = [...Object.getOwnPropertyNames(target), ...Object.getOwnPropertySymbols(target)];
      for (const k of keys) {
        try {
          const val = target[k];
          if (val && typeof val === 'object') {
            if (typeof val.traverse === 'function' && (val.isScene || val.isGroup || val.isObject3D)) {
              return val;
            }
            if (val.scene && typeof val.scene.traverse === 'function') {
              return val.scene;
            }
          }
        } catch (e) {}
      }
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

  // Update Emissive Factors exclusively on genuine light materials
  // Uses high values (8-20x) to ensure they exceed the bloom threshold
  function updateEmissiveMaterials() {
    if (!modelViewer || !modelViewer.model) return;
    const materials = modelViewer.model.materials;
    if (!materials || materials.length === 0) return;
    materials.forEach(mat => {
      const mName = mat.name ? mat.name.toLowerCase() : '';
      if (isActualLightMaterial(mName)) {
        if (lightsOn) {
          // Use very high emissive values so they always exceed threshold and bloom
          if (mName.includes('tail') || mName.includes('chmsl') || mName.includes('rearlight')) {
            // Red taillights
            mat.setEmissiveFactor([20.0, 0.4, 0.4]);
          } else if (mName.includes('signal')) {
            // Amber turn signals
            mat.setEmissiveFactor([18.0, 8.0, 0.2]);
          } else if (mName.includes('fog')) {
            // Fog lights – warm white
            mat.setEmissiveFactor([16.0, 14.0, 10.0]);
          } else if (mName.includes('running')) {
            // DRL running lights – blue-white LED
            mat.setEmissiveFactor([10.0, 14.0, 20.0]);
          } else {
            // Headlights / highbeam – bright cool white
            mat.setEmissiveFactor([16.0, 18.0, 22.0]);
          }
        } else {
          mat.setEmissiveFactor([0, 0, 0]);
        }
      } else {
        // Enforce zero emissive on all non-light materials
        if (typeof mat.setEmissiveFactor === 'function') {
          mat.setEmissiveFactor([0, 0, 0]);
        }
      }
    });
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
      if (lightMeshes && lightMeshes.length > 0) {
        bloomEffect.selection = [...lightMeshes];
        if (bloomEffect.effects && bloomEffect.effects[0] && bloomEffect.effects[0].selection) {
          bloomEffect.effects[0].selection.clear();
          lightMeshes.forEach(mesh => bloomEffect.effects[0].selection.add(mesh));
        }
      } else {
        // Crucial fallback: Do NOT set bloomEffect.selection = [] when lightMeshes is empty!
        // An empty array [] blocks ALL bloom. Leaving selection empty allows postprocessing
        // to bloom all emissive surfaces exceeding the luminance threshold.
        delete bloomEffect.selection;
        if (bloomEffect.effects && bloomEffect.effects[0] && bloomEffect.effects[0].selection) {
          bloomEffect.effects[0].selection.clear();
        }
      }
    }
  }

  // Apply Live Post-FX
  function applyPostFx() {
    if (!modelViewer) return;
    modelViewer.toneMapping = 'none';
    modelViewer.setAttribute('tone-mapping', 'none');

    const bloomEffect = document.getElementById('bloom-effect');
    const ssaoEffect = document.getElementById('ssao-effect');
    const colorGradeEffect = document.getElementById('color-grade-effect');
    const effectComposer = document.getElementById('effect-composer');

    if (bloomEffect) {
      if (bloomMode === 'off' || bloomIntensity <= 0 || (bloomMode === 'headlight' && !lightsOn)) {
        // Lights off or bloom disabled — zero out bloom
        updateSelectiveBloomSelection('off');
        bloomEffect.strength = 0;
        bloomEffect.setAttribute('strength', '0');
        bloomEffect.threshold = 1.0;
        bloomEffect.setAttribute('threshold', '1.00');
        if (bloomEffect.effects && bloomEffect.effects[0]) {
          bloomEffect.effects[0].intensity = 0;
          bloomEffect.effects[0].disabled = true;
        }
      } else {
        // Lights on — activate selective bloom on all light meshes
        updateSelectiveBloomSelection('headlight');
        bloomEffect.setAttribute('strength', bloomIntensity.toFixed(2));
        bloomEffect.setAttribute('radius', bloomRadius.toFixed(2));
        bloomEffect.setAttribute('threshold', bloomThreshold.toFixed(2));
        bloomEffect.strength = bloomIntensity;
        bloomEffect.radius = bloomRadius;
        bloomEffect.threshold = bloomThreshold;
        if (bloomEffect.effects && bloomEffect.effects[0]) {
          bloomEffect.effects[0].disabled = false;
          bloomEffect.effects[0].intensity = bloomIntensity;
          bloomEffect.effects[0].luminanceThreshold = bloomThreshold;
          bloomEffect.effects[0].mipmapBlur = true;
        }
      }
    }

    if (ssaoEffect) {
      if (ssaoIntensity <= 0) {
        ssaoEffect.blendMode = 'skip';
        ssaoEffect.setAttribute('blend-mode', 'skip');
      } else {
        ssaoEffect.blendMode = 'normal';
        ssaoEffect.removeAttribute('blend-mode');
        ssaoEffect.strength = ssaoIntensity;
        ssaoEffect.setAttribute('strength', ssaoIntensity.toFixed(2));
        ssaoEffect.radius = ssaoRadius;
        ssaoEffect.setAttribute('radius', ssaoRadius.toFixed(2));
      }
    }

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

    if (effectComposer) {
      if (typeof effectComposer.requestUpdate === 'function') effectComposer.requestUpdate();
      if (typeof effectComposer.updateEffects === 'function') effectComposer.updateEffects();
      if (typeof effectComposer.queueRender === 'function') effectComposer.queueRender();
    }

    updateEmissiveMaterials();

    if (volumetricFogContainer) {
      if (lightsOn && bloomMode !== 'off') {
        volumetricFogContainer.classList.add('active');
      } else {
        volumetricFogContainer.classList.remove('active');
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
    const parentContainer = tabSlider.parentElement || deckTabsContainer;
    const containerRect = parentContainer.getBoundingClientRect();
    const tabRect = activeTab.getBoundingClientRect();
    const offsetLeft = tabRect.left - containerRect.left;
    const width = tabRect.width;

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
    const barRect = segCameraBar.getBoundingClientRect();
    const segRect = activeSeg.getBoundingClientRect();
    const offsetLeft = segRect.left - barRect.left;
    const width = segRect.width;

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
  function glideCameraTo(presetKey) {
    const preset = CAMERA_PRESETS[presetKey];
    if (!preset || !modelViewer) return;

    modelViewer.cameraOrbit = preset.orbit;
    modelViewer.cameraTarget = preset.target;
    if (studioWatermark) studioWatermark.textContent = preset.watermark;

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

    // Smooth Camera Glide
    if (meta.cam) glideCameraTo(meta.cam);

    // Update Apple iOS Sliding Capsule
    updateTabSlider();
  }

  function closeCanvas() {
    if (spatialCanvas) spatialCanvas.classList.add('closed');
    activeTabKey = null;
    deckTabs.forEach(t => t.classList.remove('active'));
    tabPanels.forEach(p => p.classList.remove('active'));
    updateTabSlider();
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
      setTimeout(() => {
        updateTabSlider();
        updateSegSlider();
      }, 60);
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
      toggleDock();
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
      currentWheelPrice = parseInt(card.getAttribute('data-price') || '0', 10);
      switchWheelModel(option, name);
      updatePriceDisplay();
      updateConfigJson();
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
      currentSeatPrice = parseInt(card.getAttribute('data-price') || '0', 10);
      if (activeInteriorTitle) activeInteriorTitle.textContent = currentSeatName;

      applyActiveCustomizations();
      updatePriceDisplay();
      updateConfigJson();
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

  // 3. Matrix LED Lights & Selective Bloom
  function setLightsState(on) {
    lightsOn = on;
    if (toggleLightsBtn) {
      toggleLightsBtn.classList.toggle('active', lightsOn);
      toggleLightsBtn.setAttribute('aria-pressed', lightsOn ? 'true' : 'false');
    }
    // Step 1: Apply emissive material changes first
    updateEmissiveMaterials();
    // Step 2: Apply bloom effect (which checks lightsOn state)
    applyPostFx();
    // Step 3: Ensure bloom is re-applied after a frame to handle stale model state
    requestAnimationFrame(() => {
      updateEmissiveMaterials();
      applyPostFx();
    });
    // Step 4: Final delayed retry in case model-viewer takes time to commit material changes
    setTimeout(() => {
      updateEmissiveMaterials();
      applyPostFx();
    }, 250);
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

  // Marmoset-style 38+ Material Inspector logic
  let materialsRegistry = new Map();
  let activeMaterialName = 'inmx7m60i_body';
  const matSearchInput = document.getElementById('mat-search-input');
  const selectActiveMat = document.getElementById('select-active-material');
  const matSphereCarousel = document.getElementById('mat-sphere-carousel');
  const matFilterPills = document.querySelectorAll('#mat-filter-pills .m3-filter-chip');

  function scanAllSceneMaterials() {
    if (!modelViewer || !modelViewer.model) return;
    materialsRegistry.clear();
    modelViewer.model.materials.forEach(mat => {
      const name = mat.name;
      if (!name) return;
      materialsRegistry.set(name, {
        name: name,
        material: mat,
        category: name.includes('leather') ? 'interior' : (name.includes('headlight') || name.includes('taillight') ? 'lights' : 'body')
      });
    });
  }

  function populateMaterialDropdown() {
    if (!selectActiveMat) return;
    selectActiveMat.innerHTML = '';
    materialsRegistry.forEach((entry, name) => {
      const opt = document.createElement('option');
      opt.value = name;
      opt.textContent = `${entry.category === 'lights' ? '💡' : '🎨'} ${name}`;
      if (name === activeMaterialName) opt.selected = true;
      selectActiveMat.appendChild(opt);
    });
  }

  if (selectActiveMat) {
    selectActiveMat.addEventListener('change', (e) => {
      activeMaterialName = e.target.value;
    });
  }

  // Post-FX Sliders
  const inputBloomIntensity = document.getElementById('input-bloom-intensity');
  const valBloomIntensity = document.getElementById('val-bloom-intensity');
  const inputBloomRadius = document.getElementById('input-bloom-radius');
  const valBloomRadius = document.getElementById('val-bloom-radius');
  const inputBloomThreshold = document.getElementById('input-bloom-threshold');
  const valBloomThreshold = document.getElementById('val-bloom-threshold');
  const selectTonemapping = document.getElementById('select-tonemapping');

  if (inputBloomIntensity) {
    inputBloomIntensity.addEventListener('input', (e) => {
      bloomIntensity = parseFloat(e.target.value);
      if (valBloomIntensity) valBloomIntensity.textContent = bloomIntensity.toFixed(2);
      applyPostFx();
    });
  }

  if (inputBloomRadius) {
    inputBloomRadius.addEventListener('input', (e) => {
      bloomRadius = parseFloat(e.target.value);
      if (valBloomRadius) valBloomRadius.textContent = bloomRadius.toFixed(2);
      applyPostFx();
    });
  }

  if (inputBloomThreshold) {
    inputBloomThreshold.addEventListener('input', (e) => {
      bloomThreshold = parseFloat(e.target.value);
      if (valBloomThreshold) valBloomThreshold.textContent = bloomThreshold.toFixed(2);
      applyPostFx();
    });
  }

  if (selectTonemapping) {
    selectTonemapping.addEventListener('change', (e) => {
      colorTonemapping = e.target.value;
      applyPostFx();
    });
  }

  // Preset Export/Import
  const exportJsonText = document.getElementById('export-json-text');
  const copyJsonBtn = document.getElementById('copy-json-btn');
  const importJsonText = document.getElementById('import-json-text');
  const applyImportJsonBtn = document.getElementById('apply-import-json-btn');

  function updateConfigJson() {
    if (!exportJsonText) return;
    const totalOptions = currentPaintPrice + currentWheelPrice + currentSeatPrice;
    const config = {
      model: "BMW X7 M60i xDrive (2026)",
      basePrice: BASE_PRICE,
      totalEstimatedMsrp: BASE_PRICE + totalOptions,
      paint: { name: currentPaintName, hex: currentPaintHex, price: currentPaintPrice },
      wheel: { option: currentWheelOption, name: currentWheelName, price: currentWheelPrice },
      interior: { seatHex: currentSeatHex, name: currentSeatName, price: currentSeatPrice },
      lighting: { exposure: currentExposure, shadowIntensity: currentShadowIntensity, hdri: currentHdri },
      postfx: { bloomMode, bloomIntensity, bloomRadius, bloomThreshold, tonemapping: colorTonemapping }
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

  // Universal Cross-Browser Fullscreen Controller
  function isFullscreenActive() {
    return !!(
      document.fullscreenElement ||
      document.webkitFullscreenElement ||
      document.mozFullScreenElement ||
      document.msFullscreenElement ||
      (studioContainer && studioContainer.classList.contains('is-pseudo-fullscreen'))
    );
  }

  function enablePseudoFullscreen() {
    if (studioContainer) {
      studioContainer.classList.add('is-pseudo-fullscreen');
      document.body.style.overflow = 'hidden';
    }
    updateFullscreenBtnState(true);
  }

  function disablePseudoFullscreen() {
    if (studioContainer) {
      studioContainer.classList.remove('is-pseudo-fullscreen');
      document.body.style.overflow = '';
    }
    updateFullscreenBtnState(false);
  }

  function updateFullscreenBtnState(active) {
    if (toggleFullscreenBtn) {
      toggleFullscreenBtn.classList.toggle('active', active);
      toggleFullscreenBtn.style.color = active ? 'var(--text-accent)' : '';
      toggleFullscreenBtn.title = active ? 'Exit Fullscreen' : 'Toggle Fullscreen View';
    }
  }

  function toggleFullscreen() {
    const elem = studioContainer || document.documentElement;

    if (!isFullscreenActive()) {
      try {
        if (elem.requestFullscreen) {
          elem.requestFullscreen().catch(() => enablePseudoFullscreen());
        } else if (elem.webkitRequestFullscreen) {
          elem.webkitRequestFullscreen();
        } else if (elem.mozRequestFullScreen) {
          elem.mozRequestFullScreen();
        } else if (elem.msRequestFullscreen) {
          elem.msRequestFullscreen();
        } else {
          enablePseudoFullscreen();
        }
      } catch (err) {
        console.warn('Native fullscreen error, falling back to pseudo-fullscreen:', err);
        enablePseudoFullscreen();
      }
    } else {
      try {
        if (document.exitFullscreen && document.fullscreenElement) {
          document.exitFullscreen().catch(() => disablePseudoFullscreen());
        } else if (document.webkitExitFullscreen && document.webkitFullscreenElement) {
          document.webkitExitFullscreen();
        } else if (document.mozCancelFullScreen && document.mozFullScreenElement) {
          document.mozCancelFullScreen();
        } else if (document.msExitFullscreen && document.msFullscreenElement) {
          document.msExitFullscreen();
        }
      } catch (err) {
        console.warn('Exit fullscreen error:', err);
      }
      disablePseudoFullscreen();
    }
  }

  if (toggleFullscreenBtn) {
    toggleFullscreenBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      toggleFullscreen();
    });
  }

  document.addEventListener('fullscreenchange', () => {
    updateFullscreenBtnState(isFullscreenActive());
  });
  document.addEventListener('webkitfullscreenchange', () => {
    updateFullscreenBtnState(isFullscreenActive());
  });
  document.addEventListener('mozfullscreenchange', () => {
    updateFullscreenBtnState(isFullscreenActive());
  });
  document.addEventListener('MSFullscreenChange', () => {
    updateFullscreenBtnState(isFullscreenActive());
  });

  // ==========================================================================
  // Augmented Reality & WebXR Spatial Engine (Apple Quick Look & Google ARCore)
  // https://modelviewer.dev/examples/augmentedreality/
  // ==========================================================================
  const arModalBackdrop = document.getElementById('ar-modal-backdrop');
  const arModalCloseBtn = document.getElementById('ar-modal-close-btn');
  const arQrImage = document.getElementById('ar-qr-image');
  const directArLaunchBtn = document.getElementById('direct-ar-launch-btn');
  const isMobileOrTablet = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);

  function openArModal() {
    if (!arModalBackdrop) return;
    const currentUrl = window.location.href.split('#')[0];
    if (arQrImage) {
      arQrImage.src = `https://api.qrserver.com/v1/create-qr-code/?size=260x260&margin=10&data=${encodeURIComponent(currentUrl)}`;
    }
    if (directArLaunchBtn) {
      directArLaunchBtn.style.display = isMobileOrTablet ? 'block' : 'none';
    }
    arModalBackdrop.classList.add('active');
    arModalBackdrop.setAttribute('aria-hidden', 'false');
  }

  function closeArModal() {
    if (!arModalBackdrop) return;
    arModalBackdrop.classList.remove('active');
    arModalBackdrop.setAttribute('aria-hidden', 'true');
  }

  function launchAr() {
    if (!modelViewer) return;
    // On mobile devices with AR capabilities, activate native AR session directly
    if (isMobileOrTablet || (modelViewer.canActivateAR && modelViewer.canActivateAR === true)) {
      try {
        modelViewer.activateAR();
      } catch (err) {
        console.warn('Native AR direct activation fallback to modal:', err);
        openArModal();
      }
    } else {
      // On desktop / non-AR devices, present the high-res QR code modal
      openArModal();
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

  if (arModalCloseBtn) {
    arModalCloseBtn.addEventListener('click', closeArModal);
  }

  if (arModalBackdrop) {
    arModalBackdrop.addEventListener('click', (e) => {
      if (e.target === arModalBackdrop) closeArModal();
    });
  }

  if (directArLaunchBtn) {
    directArLaunchBtn.addEventListener('click', () => {
      if (modelViewer) {
        try {
          modelViewer.activateAR();
        } catch (err) {
          console.warn('AR trigger error:', err);
        }
      }
    });
  }

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && arModalBackdrop && arModalBackdrop.classList.contains('active')) {
      closeArModal();
    }
  });

  if (modelViewer) {
    modelViewer.addEventListener('ar-status', (event) => {
      console.log('BMW AR Status:', event.detail.status);
    });
  }

  // ==========================================================================
  // Model Viewer Load Event & Loader Management
  // ==========================================================================
  const hideLoader = () => {
    if (modelViewer) {
      modelViewer.classList.add('model-ready', 'loaded');
      modelViewer.setAttribute('model-ready', '');
    }
    const loaders = document.querySelectorAll('.viewer-loader');
    loaders.forEach(loader => {
      loader.classList.add('hidden', 'hide');
      loader.setAttribute('aria-hidden', 'true');
      loader.style.setProperty('opacity', '0', 'important');
      loader.style.setProperty('visibility', 'hidden', 'important');
      loader.style.setProperty('display', 'none', 'important');
      loader.style.setProperty('pointer-events', 'none', 'important');
    });
  };

  function onModelReady() {
    hideLoader();
    try { scanAllSceneMaterials(); } catch (e) { console.warn('scanMaterials warn:', e); }
    try { populateMaterialDropdown(); } catch (e) { console.warn('populateDropdown warn:', e); }
    try { applyActiveCustomizations(); } catch (e) { console.warn('applyCustomizations warn:', e); }
    try { applyPostFx(); } catch (e) { console.warn('applyPostFx warn:', e); }
    try { updateConfigJson(); } catch (e) { console.warn('updateConfigJson warn:', e); }
    setTimeout(() => {
      try { updateTabSlider(); } catch (e) {}
      try { updateSegSlider(); } catch (e) {}
    }, 60);
  }

  if (modelViewer) {
    modelViewer.addEventListener('load', onModelReady);

    modelViewer.addEventListener('progress', (e) => {
      if (e.detail.totalProgress >= 1.0) {
        hideLoader();
      }
    });

    modelViewer.addEventListener('model-visibility', (e) => {
      if (e.detail && e.detail.visible) {
        onModelReady();
      }
    });

    modelViewer.addEventListener('poster-dismissed', () => {
      hideLoader();
    });

    modelViewer.addEventListener('error', (err) => {
      console.warn('Model Viewer error:', err);
      hideLoader();
    });

    if (modelViewer.loaded || modelViewer.model) {
      onModelReady();
    }

    // Safety fallback: ensure loader is hidden once model object is attached
    const modelCheckInterval = setInterval(() => {
      if (modelViewer && (modelViewer.loaded || modelViewer.model)) {
        onModelReady();
        clearInterval(modelCheckInterval);
      }
    }, 300);
    setTimeout(() => clearInterval(modelCheckInterval), 10000);
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
