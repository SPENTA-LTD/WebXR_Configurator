/**
 * BMW X7 3D Studio Configurator Logic
 * Includes 3D Studio Lighting & Material Editor Panel (User Requested Backend Editor)
 */

document.addEventListener('DOMContentLoaded', () => {
  // Apple Liquid Glass Refraction Physics (VisionOS Smooth Lerp Engine)
  const glassElements = document.querySelectorAll(
    '.studio-top-left-header, .studio-radio-menu, .drawer-content-box, .studio-right-dock, .editor-panel, .spec-overlay-card, .bottom-tools-left, .vr-pill-btn, .navbar'
  );

  const glassData = new Map();
  glassElements.forEach(el => {
    glassData.set(el, {
      currentX: 0,
      currentY: 0,
      targetX: 0,
      targetY: 0,
      targetOpacity: 0.4,
      currentOpacity: 0.4
    });

    el.addEventListener('mouseenter', () => {
      const data = glassData.get(el);
      if (data) data.targetOpacity = 1.0;
    });

    el.addEventListener('mouseleave', () => {
      const data = glassData.get(el);
      if (data) data.targetOpacity = 0.4;
    });
  });

  document.addEventListener('mousemove', (e) => {
    glassElements.forEach(el => {
      const rect = el.getBoundingClientRect();
      const isHovering = (
        e.clientX >= rect.left &&
        e.clientX <= rect.right &&
        e.clientY >= rect.top &&
        e.clientY <= rect.bottom
      );

      const data = glassData.get(el);
      if (data) {
        data.targetX = e.clientX - rect.left;
        data.targetY = e.clientY - rect.top;
        if (isHovering) {
          data.targetOpacity = 1.0;
        }
      }
    });
  });

  // Smooth animation frame loop for liquid glass refraction physics
  function animateGlassRefraction() {
    glassElements.forEach(el => {
      const data = glassData.get(el);
      if (!data) return;

      // Lerp positions (0.14 factor for smooth fluid motion)
      data.currentX += (data.targetX - data.currentX) * 0.14;
      data.currentY += (data.targetY - data.currentY) * 0.14;
      data.currentOpacity += (data.targetOpacity - data.currentOpacity) * 0.1;

      el.style.setProperty('--mouse-x', `${data.currentX.toFixed(1)}px`);
      el.style.setProperty('--mouse-y', `${data.currentY.toFixed(1)}px`);
      el.style.setProperty('--mouse-opacity', data.currentOpacity.toFixed(2));
    });

    requestAnimationFrame(animateGlassRefraction);
  }
  requestAnimationFrame(animateGlassRefraction);
  const modelViewer = document.getElementById('bmw-viewer');
  const viewerLoader = document.querySelector('.viewer-loader');
  const watermarkEl = document.getElementById('studio-watermark');
  const activePaintLbl = document.getElementById('active-paint-lbl');
  const specOverlayCard = document.getElementById('spec-overlay-card');
  const studioContainer = document.querySelector('.studio-viewport-container');

  // Radio Nav Buttons
  const radioNavItems = document.querySelectorAll('.radio-nav-item');

  const CAMERA_VIEWS = {
    'overview': { watermark: 'OVERVIEW', orbit: '45deg 75deg 6m', target: 'auto auto auto', showSpecs: false },
    'specifications': { watermark: 'SPECIFICATIONS', orbit: '10deg 85deg 4.8m', target: '0m 0.4m 0m', showSpecs: true },
    'interior': { watermark: 'INTERIOR', orbit: '0deg 30deg 3.2m', target: '0m 0.5m 0m', showSpecs: false },
    'wheels': { watermark: 'WHEELS', orbit: '65deg 88deg 2.4m', target: '0.75m 0.35m 1.35m', showSpecs: false },
    'lights': { watermark: 'LIGHTS', orbit: '0deg 85deg 3.8m', target: '0m 0.6m 1.8m', showSpecs: false, autoLights: true },
    'doors': { watermark: 'DOORS', orbit: '110deg 75deg 5.5m', target: '0m 0.5m 0m', showSpecs: false, autoDoors: true }
  };

  const BASE_PRICE = 108700;
  let currentPaintPrice = 0;
  let currentPaintHex = '#7E858C';
  let currentPaintName = 'Brooklyn Grey Metallic';
  let currentPaintRoughness = 0.12;
  let currentPaintMetallic = 0.08;
  let currentSeatHex = '#8B4513';
  let currentWheelOption = 'set1';

  // Live Lighting State (Sketchfab Level Studio Setup)
  let currentExposure = 1.1;
  let currentShadowIntensity = 1.5;
  let currentShadowSoftness = 0.3;
  let currentHdri = './assets/studio.hdr';

  // Live Post-FX State (Bloom, SSAO, Color Adjustments & Tonemapping)
  let bloomMode = 'headlight'; // 'full' | 'headlight' | 'off'
  let bloomIntensity = 1.50;
  let bloomRadius = 0.40;
  let bloomThreshold = 0.85;
  let ssaoIntensity = 1.40;
  let ssaoRadius = 0.30;
  let colorContrast = 0.00;
  let colorSaturation = 0.00;
  let colorBrightness = 0.00;
  let colorTonemapping = 'aces';

  const totalPriceDisplay = document.getElementById('total-price-display');
  const buildSummaryLbl = document.getElementById('build-summary-lbl');

  // 6 Dock Buttons
  const dockPaintBtn = document.getElementById('dock-paint-btn');
  const dockSeatBtn = document.getElementById('dock-seat-btn');
  const dockWheelBtn = document.getElementById('dock-wheel-btn');
  const dockDoorBtn = document.getElementById('dock-door-btn');
  const dockWindowBtn = document.getElementById('dock-window-btn');
  const dockLightsBtn = document.getElementById('dock-lights-btn');

  const dockButtons = [dockPaintBtn, dockSeatBtn, dockWheelBtn, dockDoorBtn, dockWindowBtn, dockLightsBtn];

  // Bottom Color Drawer Elements
  const bottomColorDrawer = document.getElementById('bottom-color-drawer');
  const closeDrawerBtn = document.getElementById('close-drawer-btn');
  const paintSwatchesGroup = document.getElementById('paint-swatches-group');
  const seatSwatchesGroup = document.getElementById('seat-swatches-group');
  const wheelSwatchesGroup = document.getElementById('wheel-swatches-group');
  const drawerHeaderTitle = document.getElementById('drawer-header-title');
  const drawerHeaderSubtitle = document.getElementById('drawer-header-subtitle');

  // Editor Panel Elements
  const editorPanel = document.getElementById('editor-panel');
  const toggleEditorBtn = document.getElementById('toggle-editor-btn');
  const closeEditorBtn = document.getElementById('close-editor-btn');
  const editorTabBtns = document.querySelectorAll('.editor-tab-btn');
  const editorTabContents = document.querySelectorAll('.editor-tab-content');

  // Editor Inputs
  const inputExposure = document.getElementById('input-exposure');
  const valExposure = document.getElementById('val-exposure');
  const inputShadowIntensity = document.getElementById('input-shadow-intensity');
  const valShadowIntensity = document.getElementById('val-shadow-intensity');
  const inputShadowSoftness = document.getElementById('input-shadow-softness');
  const valShadowSoftness = document.getElementById('val-shadow-softness');
  const selectHdri = document.getElementById('select-hdri');

  const inputPaintColor = document.getElementById('input-paint-color');
  const valPaintHex = document.getElementById('val-paint-hex');
  const inputRoughness = document.getElementById('input-roughness');
  const valRoughness = document.getElementById('val-roughness');
  const inputMetallic = document.getElementById('input-metallic');
  const valMetallic = document.getElementById('val-metallic');
  const inputSeatColor = document.getElementById('input-seat-color');
  const valSeatHex = document.getElementById('val-seat-hex');

  // Post-FX Inputs
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
  const inputContrast = document.getElementById('input-contrast');
  const valContrast = document.getElementById('val-contrast');
  const inputSaturation = document.getElementById('input-saturation');
  const valSaturation = document.getElementById('val-saturation');
  const inputBrightness = document.getElementById('input-brightness');
  const valBrightness = document.getElementById('val-brightness');
  const selectTonemapping = document.getElementById('select-tonemapping');

  // Post-FX Web Component Elements (@google/model-viewer-effects)
  const effectComposer = document.getElementById('effect-composer');
  const ssaoEffect = document.getElementById('ssao-effect');
  const bloomEffect = document.getElementById('bloom-effect');
  const colorGradeEffect = document.getElementById('color-grade-effect');

  const exportJsonText = document.getElementById('export-json-text');
  const copyJsonBtn = document.getElementById('copy-json-btn');

  // Bottom Toolbar Buttons
  const themeToggleBtn = document.getElementById('theme-toggle-btn');
  const toggleAutoRotateBtn = document.getElementById('toggle-autorotate-btn');
  const vrArPillBtn = document.getElementById('vr-ar-pill-btn');
  const arTrigger = document.getElementById('ar-trigger');

  // AR Modal Elements
  const arModal = document.getElementById('ar-modal');
  const closeArModal = document.getElementById('close-ar-modal');
  const qrCodeImg = document.getElementById('qr-code-img');

  // Apply Live Post-FX (Bloom, SSAO, Color Adjustments & Tonemapping)
  function applyPostFx() {
    if (!modelViewer) return;

    // Layer 1: Native Model Viewer Attributes
    modelViewer.shadowIntensity = ssaoIntensity;
    modelViewer.setAttribute('shadow-intensity', ssaoIntensity.toFixed(2));
    modelViewer.shadowSoftness = ssaoRadius;
    modelViewer.setAttribute('shadow-softness', ssaoRadius.toFixed(2));

    const mvTone = colorTonemapping || 'aces';
    modelViewer.toneMapping = mvTone;
    modelViewer.setAttribute('tone-mapping', mvTone);

    // Layer 2: Official @google/model-viewer-effects Web Components
    if (bloomEffect) {
      if (bloomMode === 'off' || bloomIntensity <= 0) {
        bloomEffect.blendMode = 'skip';
        bloomEffect.setAttribute('blend-mode', 'skip');
        bloomEffect.strength = 0;
        bloomEffect.setAttribute('strength', '0');
      } else {
        bloomEffect.blendMode = 'normal';
        bloomEffect.removeAttribute('blend-mode');
        const scaledStrength = Math.min(2.0, bloomIntensity * 0.4);
        bloomEffect.strength = scaledStrength;
        bloomEffect.setAttribute('strength', scaledStrength.toFixed(2));
        bloomEffect.radius = bloomRadius;
        bloomEffect.setAttribute('radius', bloomRadius.toFixed(2));
        const safeThreshold = Math.max(0.50, bloomThreshold);
        bloomEffect.threshold = safeThreshold;
        bloomEffect.setAttribute('threshold', safeThreshold.toFixed(2));
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
      colorGradeEffect.tonemapping = colorTonemapping;
      colorGradeEffect.setAttribute('tonemapping', colorTonemapping);
    }

    if (effectComposer) {
      if (typeof effectComposer.requestUpdate === 'function') {
        effectComposer.requestUpdate();
      }
      if (typeof effectComposer.updateEffects === 'function') {
        effectComposer.updateEffects();
      }
      if (typeof effectComposer.queueRender === 'function') {
        effectComposer.queueRender();
      }
    }

    // Layer 3: PBR Material Emissive Factor Modulation for Headlight Glow
    if (modelViewer.model) {
      modelViewer.model.materials.forEach(mat => {
        const mName = mat.name.toLowerCase();
        const isActualLightBulb = (mName.includes('headlight') || mName.includes('taillight')) &&
                                  !mName.includes('glass') && !mName.includes('body') && !mName.includes('chrome');
        if (isActualLightBulb) {
          if (lightsOn || (bloomMode !== 'off' && bloomIntensity > 0)) {
            const emissiveScale = Math.min(3.5, Math.max(0.5, bloomIntensity * 0.4));
            mat.setEmissiveFactor([1.5 * emissiveScale, 1.5 * emissiveScale, 2.0 * emissiveScale]);
          } else {
            mat.setEmissiveFactor([0, 0, 0]);
          }
        }
      });
    }

    // Layer 4: Real-time WebGL Canvas Filter Hardware Overlay & SVG Bloom
    const contrastPercent = (1.0 + colorContrast) * 100;
    const saturationPercent = (1.0 + colorSaturation) * 100;
    const brightnessPercent = (1.0 + colorBrightness) * 100;

    // Crisp hardware filter string (without container blur)
    let filterStr = `contrast(${contrastPercent.toFixed(1)}%) saturate(${saturationPercent.toFixed(1)}%) brightness(${brightnessPercent.toFixed(1)}%)`;

    const svgBloomBlur = document.getElementById('svg-bloom-blur');
    if (svgBloomBlur) {
      svgBloomBlur.setAttribute('stdDeviation', (bloomRadius * 8).toFixed(1));
    }

    const wrapper = document.getElementById('model-viewer-wrapper');
    if (wrapper) {
      wrapper.style.willChange = 'filter';
      wrapper.style.transform = 'translateZ(0)';
      wrapper.style.filter = filterStr;
    }

    modelViewer.style.willChange = 'filter';
    modelViewer.style.transform = 'translateZ(0)';
    modelViewer.style.filter = filterStr;

    if (modelViewer.shadowRoot) {
      const shadowCanvas = modelViewer.shadowRoot.querySelector('canvas');
      if (shadowCanvas) {
        shadowCanvas.style.willChange = 'filter';
        shadowCanvas.style.transform = 'translateZ(0)';
        shadowCanvas.style.filter = filterStr;
      }
    }

    const fogWrapper = document.getElementById('volumetric-fog-container');
    if (fogWrapper) {
      if (bloomMode !== 'off' && (lightsOn || bloomMode === 'headlight' || bloomMode === 'full')) {
        fogWrapper.classList.add('active');
        fogWrapper.style.opacity = Math.min(1.0, bloomIntensity * 0.3).toFixed(2);
      } else {
        fogWrapper.classList.remove('active');
        fogWrapper.style.opacity = '0';
      }
    }

    updateExportJson();
  }

  // Apply Active Customizations to Current Loaded Model
  function applyActiveCustomizations() {
    if (!modelViewer || !modelViewer.model) return;
    const materials = modelViewer.model.materials;
    const paintRgb = hexToRgbNormalized(currentPaintHex);
    const seatRgb = hexToRgbNormalized(currentSeatHex);

    materials.forEach(mat => {
      const mName = mat.name.toLowerCase();
      
      // 1. Body Paint Color - STRICTLY body paint materials (inmx7m60i_body, bodyshell, f_bump)
      if (mName === 'inmx7m60i_body' || mName.startsWith('inmx7m60i_body.') || mName.startsWith('bodyshell') || mName.startsWith('f_bump')) {
        mat.pbrMetallicRoughness.setBaseColorFactor(paintRgb);
        mat.pbrMetallicRoughness.setRoughnessFactor(currentPaintRoughness);
        mat.pbrMetallicRoughness.setMetallicFactor(currentPaintMetallic);
      }

      // 2. Seat Interior Color
      if (mName.includes('chassis') || mName.includes('dash') || mName.includes('seat') || mName.includes('interior') || mName.includes('11.003')) {
        mat.pbrMetallicRoughness.setBaseColorFactor(seatRgb);
      }

      // 3. Headlights & Taillights Emissive State
      const isActualLightBulb = (mName.includes('headlight') || mName.includes('taillight')) &&
                                !mName.includes('glass') && !mName.includes('body') && !mName.includes('chrome');
      if (isActualLightBulb) {
        if (lightsOn || (bloomMode !== 'off' && bloomIntensity > 0)) {
          const emissiveScale = Math.min(3.5, Math.max(0.5, bloomIntensity * 0.4));
          mat.setEmissiveFactor([1.5 * emissiveScale, 1.5 * emissiveScale, 2.0 * emissiveScale]);
        } else {
          mat.setEmissiveFactor([0, 0, 0]);
        }
      }

      // 4. Windows State (Exclude body clearcoat & headlight glass)
      const isWindowGlass = (mName.includes('windscreen') || mName.includes('window') || mName === 'inmx7m60i_glass') &&
                            !mName.includes('body') && !mName.includes('headlight') && !mName.includes('taillight');
      if (isWindowGlass) {
        if (windowRolledUp) {
          mat.pbrMetallicRoughness.setBaseColorFactor([0.05, 0.08, 0.12, 0.75]);
          mat.pbrMetallicRoughness.setRoughnessFactor(0.1);
        } else {
          mat.pbrMetallicRoughness.setBaseColorFactor([0.05, 0.08, 0.12, 0.15]);
          mat.pbrMetallicRoughness.setRoughnessFactor(0.05);
        }
      }
    });

    applyPostFx();
  }

  // Update Export Configuration JSON Text
  function updateExportJson() {
    const config = {
      lighting: {
        exposure: currentExposure,
        shadowIntensity: currentShadowIntensity,
        shadowSoftness: currentShadowSoftness,
        environmentHdri: currentHdri
      },
      paint: {
        colorHex: currentPaintHex,
        roughness: currentPaintRoughness,
        metallic: currentPaintMetallic,
        name: currentPaintName
      },
      interior: {
        seatColorHex: currentSeatHex
      },
      postFx: {
        bloomMode: bloomMode,
        bloomIntensity: bloomIntensity,
        bloomRadius: bloomRadius,
        bloomThreshold: bloomThreshold,
        ssaoIntensity: ssaoIntensity,
        ssaoRadius: ssaoRadius,
        colorContrast: colorContrast,
        colorSaturation: colorSaturation,
        colorBrightnessOffset: colorBrightness,
        tonemapping: colorTonemapping
      },
      wheelOption: currentWheelOption
    };
    if (exportJsonText) {
      exportJsonText.value = JSON.stringify(config, null, 2);
    }
  }

  // Apply Motion Blur during Camera Orbiting & Transitions
  let orbitTimer = null;
  if (modelViewer) {
    modelViewer.addEventListener('camera-change', (e) => {
      if (e.detail.source === 'user-interaction' || e.detail.source === 'none') {
        modelViewer.classList.add('camera-orbiting');
        clearTimeout(orbitTimer);
        orbitTimer = setTimeout(() => {
          modelViewer.classList.remove('camera-orbiting');
        }, 150);
      }
    });

    modelViewer.addEventListener('load', () => {
      if (viewerLoader) {
        viewerLoader.classList.add('hide');
        viewerLoader.style.display = 'none';
      }
      applyActiveCustomizations();
      applyPostFx();
    });

    modelViewer.addEventListener('progress', (e) => {
      if (e.detail.totalProgress >= 1.0 && viewerLoader) {
        viewerLoader.classList.add('hide');
        viewerLoader.style.display = 'none';
      }
    });

    setTimeout(() => {
      if (modelViewer.loaded && viewerLoader) {
        viewerLoader.classList.add('hide');
        viewerLoader.style.display = 'none';
      }
    }, 1500);
  }

  // Hex to RGB Normalized Helper
  function hexToRgbNormalized(hex) {
    hex = hex.replace('#', '');
    if (hex.length === 3) hex = hex.split('').map(c => c + c).join('');
    const num = parseInt(hex, 16);
    return [((num >> 16) & 255) / 255, ((num >> 8) & 255) / 255, (num & 255) / 255, 1.0];
  }

  function deactivateAllDockBtns() {
    dockButtons.forEach(btn => {
      if (btn) btn.classList.remove('active');
    });
  }

  function setActiveDockBtn(activeBtn) {
    deactivateAllDockBtns();
    if (activeBtn) activeBtn.classList.add('active');
  }

  /* ==========================================================================
     1. Left Radio Menu Handlers
     ========================================================================== */
  radioNavItems.forEach(item => {
    item.addEventListener('click', () => {
      const viewKey = item.getAttribute('data-view');
      const radioInput = item.querySelector('input[type="radio"]');
      if (radioInput) radioInput.checked = true;

      radioNavItems.forEach(r => r.classList.remove('active'));
      item.classList.add('active');

      const config = CAMERA_VIEWS[viewKey];
      if (config) {
        watermarkEl.textContent = config.watermark;

        if (modelViewer) {
          modelViewer.cameraOrbit = config.orbit;
          modelViewer.cameraTarget = config.target;
        }

        if (config.showSpecs) specOverlayCard.classList.add('active');
        else specOverlayCard.classList.remove('active');

        if (viewKey === 'wheels') {
          if (dockWheelBtn && !dockWheelBtn.classList.contains('active')) dockWheelBtn.click();
        }

        if (config.autoLights) setLightsState(true);
        if (config.autoDoors) setDoorsState(true);
      }
    });
  });

  /* ==========================================================================
     2. 3D Studio Editor Floating Panel Handlers (USER REQUESTED Backend Editor)
     ========================================================================== */
  if (toggleEditorBtn) {
    toggleEditorBtn.addEventListener('click', () => {
      editorPanel.classList.toggle('active');
      specOverlayCard.classList.remove('active');
    });
  }

  if (closeEditorBtn) {
    closeEditorBtn.addEventListener('click', () => {
      editorPanel.classList.remove('active');
    });
  }

  editorTabBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const tabId = btn.getAttribute('data-tab');
      editorTabBtns.forEach(b => b.classList.remove('active'));
      editorTabContents.forEach(c => c.classList.remove('active'));
      btn.classList.add('active');
      document.getElementById(`tab-${tabId}`).classList.add('active');
      if (tabId === 'postfx') {
        applyPostFx();
      }
    });
  });

  // Lighting Input Handlers
  if (inputExposure) {
    inputExposure.addEventListener('input', (e) => {
      currentExposure = parseFloat(e.target.value);
      valExposure.textContent = currentExposure.toFixed(2);
      if (modelViewer) modelViewer.exposure = currentExposure;
      updateExportJson();
    });
  }

  if (inputShadowIntensity) {
    inputShadowIntensity.addEventListener('input', (e) => {
      currentShadowIntensity = parseFloat(e.target.value);
      valShadowIntensity.textContent = currentShadowIntensity.toFixed(2);
      if (modelViewer) modelViewer.shadowIntensity = currentShadowIntensity;
      updateExportJson();
    });
  }

  if (inputShadowSoftness) {
    inputShadowSoftness.addEventListener('input', (e) => {
      currentShadowSoftness = parseFloat(e.target.value);
      valShadowSoftness.textContent = currentShadowSoftness.toFixed(2);
      if (modelViewer) modelViewer.shadowSoftness = currentShadowSoftness;
      updateExportJson();
    });
  }

  if (selectHdri) {
    selectHdri.addEventListener('change', (e) => {
      currentHdri = e.target.value;
      if (modelViewer) modelViewer.environmentImage = currentHdri;
      updateExportJson();
    });
  }

  // Material Input Handlers
  if (inputPaintColor) {
    inputPaintColor.addEventListener('input', (e) => {
      currentPaintHex = e.target.value;
      valPaintHex.textContent = currentPaintHex.toUpperCase();
      applyActiveCustomizations();
    });
  }

  if (inputRoughness) {
    inputRoughness.addEventListener('input', (e) => {
      currentPaintRoughness = parseFloat(e.target.value);
      valRoughness.textContent = currentPaintRoughness.toFixed(2);
      applyActiveCustomizations();
    });
  }

  if (inputMetallic) {
    inputMetallic.addEventListener('input', (e) => {
      currentPaintMetallic = parseFloat(e.target.value);
      valMetallic.textContent = currentPaintMetallic.toFixed(2);
      applyActiveCustomizations();
    });
  }

  if (inputSeatColor) {
    inputSeatColor.addEventListener('input', (e) => {
      currentSeatHex = e.target.value;
      valSeatHex.textContent = currentSeatHex.toUpperCase();
      applyActiveCustomizations();
    });
  }

  // Post-FX Input Handlers
  if (btnBloomMode) {
    btnBloomMode.addEventListener('click', () => {
      if (bloomMode === 'full') {
        bloomMode = 'headlight';
        btnBloomMode.textContent = 'Headlight Only Bloom Active';
      } else if (bloomMode === 'headlight') {
        bloomMode = 'off';
        btnBloomMode.textContent = 'Bloom Disabled';
      } else {
        bloomMode = 'full';
        btnBloomMode.textContent = 'Full Scene Bloom Active';
      }
      applyPostFx();
    });
  }

  const bindFxRange = (elem, valElem, callback) => {
    if (!elem) return;
    const handler = (e) => {
      const val = parseFloat(e.target.value);
      if (valElem) valElem.textContent = val.toFixed(2);
      callback(val);
      applyPostFx();
    };
    elem.addEventListener('input', handler);
    elem.addEventListener('change', handler);
  };

  bindFxRange(inputBloomIntensity, valBloomIntensity, (v) => { bloomIntensity = v; });
  bindFxRange(inputBloomRadius, valBloomRadius, (v) => { bloomRadius = v; });
  bindFxRange(inputBloomThreshold, valBloomThreshold, (v) => { bloomThreshold = v; });
  bindFxRange(inputSsaoIntensity, valSsaoIntensity, (v) => { ssaoIntensity = v; });
  bindFxRange(inputSsaoRadius, valSsaoRadius, (v) => { ssaoRadius = v; });
  bindFxRange(inputContrast, valContrast, (v) => { colorContrast = v; });
  bindFxRange(inputSaturation, valSaturation, (v) => { colorSaturation = v; });
  bindFxRange(inputBrightness, valBrightness, (v) => { colorBrightness = v; });

  if (selectTonemapping) {
    selectTonemapping.addEventListener('change', (e) => {
      colorTonemapping = e.target.value;
      applyPostFx();
    });
  }

  if (copyJsonBtn) {
    copyJsonBtn.addEventListener('click', () => {
      exportJsonText.select();
      navigator.clipboard.writeText(exportJsonText.value);
      copyJsonBtn.textContent = '✅ Copied Config JSON!';
      setTimeout(() => {
        copyJsonBtn.textContent = '📋 Copy Config JSON';
      }, 2000);
    });
  }

  /* ==========================================================================
     3. Right Dock Toggle Actions
     ========================================================================== */
  if (dockPaintBtn) {
    dockPaintBtn.addEventListener('click', () => {
      const isAlreadyActive = dockPaintBtn.classList.contains('active');
      deactivateAllDockBtns();

      if (isAlreadyActive) {
        bottomColorDrawer.classList.remove('active');
        watermarkEl.textContent = 'OVERVIEW';
      } else {
        dockPaintBtn.classList.add('active');
        drawerHeaderTitle.textContent = 'PAINT';
        drawerHeaderSubtitle.textContent = 'COLOR';
        paintSwatchesGroup.classList.remove('hide');
        seatSwatchesGroup.classList.add('hide');
        wheelSwatchesGroup.classList.add('hide');
        bottomColorDrawer.classList.add('active');

        watermarkEl.textContent = 'PAINT COLOR';
        if (modelViewer) {
          modelViewer.cameraOrbit = '45deg 75deg 6m';
          modelViewer.cameraTarget = 'auto auto auto';
        }
      }
    });
  }

  if (dockSeatBtn) {
    dockSeatBtn.addEventListener('click', () => {
      const isAlreadyActive = dockSeatBtn.classList.contains('active');
      deactivateAllDockBtns();

      if (isAlreadyActive) {
        bottomColorDrawer.classList.remove('active');
        watermarkEl.textContent = 'OVERVIEW';
      } else {
        dockSeatBtn.classList.add('active');
        drawerHeaderTitle.textContent = 'INTERIOR';
        drawerHeaderSubtitle.textContent = 'COLOR';
        seatSwatchesGroup.classList.remove('hide');
        paintSwatchesGroup.classList.add('hide');
        wheelSwatchesGroup.classList.add('hide');
        bottomColorDrawer.classList.add('active');

        watermarkEl.textContent = 'INTERIOR COLOR';
        if (modelViewer) {
          modelViewer.cameraOrbit = '0deg 30deg 3.2m';
          modelViewer.cameraTarget = '0m 0.5m 0m';
        }
      }
    });
  }

  if (dockWheelBtn) {
    dockWheelBtn.addEventListener('click', () => {
      const isAlreadyActive = dockWheelBtn.classList.contains('active');
      deactivateAllDockBtns();

      if (isAlreadyActive) {
        bottomColorDrawer.classList.remove('active');
        watermarkEl.textContent = 'OVERVIEW';
      } else {
        dockWheelBtn.classList.add('active');
        drawerHeaderTitle.textContent = 'WHEEL';
        drawerHeaderSubtitle.textContent = 'OPTION';
        wheelSwatchesGroup.classList.remove('hide');
        paintSwatchesGroup.classList.add('hide');
        seatSwatchesGroup.classList.add('hide');
        bottomColorDrawer.classList.add('active');

        watermarkEl.textContent = 'WHEELS';
        if (modelViewer) {
          modelViewer.cameraOrbit = '65deg 88deg 2.4m';
          modelViewer.cameraTarget = '0.75m 0.35m 1.35m';
        }
      }
    });
  }

  let doorsOpen = false;
  let doorAnimInterval = null;

  function setDoorsState(state) {
    doorsOpen = state;
    if (!modelViewer) return;

    clearInterval(doorAnimInterval);

    if (doorsOpen) {
      if (dockDoorBtn) dockDoorBtn.classList.add('active');
      modelViewer.timeScale = 1.0;
      modelViewer.play({ repetitions: 1 });

      doorAnimInterval = setInterval(() => {
        if (modelViewer.duration && modelViewer.currentTime >= modelViewer.duration - 0.08) {
          modelViewer.pause();
          modelViewer.currentTime = modelViewer.duration;
          clearInterval(doorAnimInterval);
        }
      }, 40);
    } else {
      if (dockDoorBtn) dockDoorBtn.classList.remove('active');
      modelViewer.timeScale = -1.0;
      modelViewer.play({ repetitions: 1 });

      doorAnimInterval = setInterval(() => {
        if (modelViewer.currentTime <= 0.08) {
          modelViewer.pause();
          modelViewer.currentTime = 0;
          clearInterval(doorAnimInterval);
        }
      }, 40);
    }
  }

  if (dockDoorBtn) {
    dockDoorBtn.addEventListener('click', () => {
      const isAlreadyActive = dockDoorBtn.classList.contains('active');
      deactivateAllDockBtns();
      bottomColorDrawer.classList.remove('active');

      if (isAlreadyActive) {
        setDoorsState(false);
        watermarkEl.textContent = 'OVERVIEW';
      } else {
        watermarkEl.textContent = 'DOORS';
        if (modelViewer) {
          modelViewer.cameraOrbit = '110deg 75deg 5.5m';
          modelViewer.cameraTarget = '0m 0.5m 0m';
        }
        setDoorsState(true);
      }
    });
  }

  let windowRolledUp = true;
  let windowAnimId = null;
  let currentWindowOffset = 0; // 0 = fully closed (up), -0.45 = fully opened (slid down into door panels)
  const windowInitialPositions = new Map();

  // Find physical 4-door window 3D mesh nodes in Three.js scene graph
  function get4DoorWindowMeshes() {
    const doorWindows = [];

    function traverse(obj) {
      if (!obj) return;
      const name = (obj.name || '').toLowerCase();
      // Target ONLY 4-door side windows (window_lm and window_rm) - EXCLUDE windscreen, hatch glass, headlights!
      if (name.includes('window_lm') || name.includes('window_rm')) {
        doorWindows.push(obj);
      }
      if (obj.children && Array.isArray(obj.children)) {
        obj.children.forEach(traverse);
      }
    }

    if (modelViewer) {
      const symbols = Object.getOwnPropertySymbols(modelViewer);
      symbols.forEach(sym => {
        try {
          const val = modelViewer[sym];
          if (val && typeof val === 'object') {
            if (val.isScene || val.isGroup || val.children) {
              traverse(val);
            }
          }
        } catch (e) {}
      });
    }

    return doorWindows;
  }

  // Real Physical 3D Mesh Y-Translation Sliding Animation
  function animateWindowGlassPhysical(targetOffset) {
    cancelAnimationFrame(windowAnimId);
    const windowMeshes = get4DoorWindowMeshes();
    
    // Fallback: If Three.js scene graph mesh nodes are encapsulated, animate material factor cleanly
    if (!windowMeshes || windowMeshes.length === 0) {
      if (modelViewer && modelViewer.model) {
        modelViewer.model.materials.forEach(mat => {
          const mName = mat.name.toLowerCase();
          // Target ONLY side window materials - NO windscreen!
          if (mName.includes('window_lm') || mName.includes('window_rm') || (mName.includes('window') && !mName.includes('windscreen') && !mName.includes('gate') && !mName.includes('headlight'))) {
            const targetAlpha = targetOffset === 0 ? 0.7 : 0.05;
            mat.pbrMetallicRoughness.setBaseColorFactor([0.05, 0.08, 0.12, targetAlpha]);
          }
        });
      }
      return;
    }

    // Save initial Y positions if not saved yet
    windowMeshes.forEach(mesh => {
      if (!windowInitialPositions.has(mesh.uuid)) {
        windowInitialPositions.set(mesh.uuid, mesh.position.y);
      }
    });

    const startOffset = currentWindowOffset;
    const startTime = performance.now();
    const duration = 850; // 850ms physical sliding window movement

    function step(now) {
      const elapsed = now - startTime;
      const t = Math.min(elapsed / duration, 1.0);
      // Smooth easeInOutCubic curve
      const easeT = t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;

      currentWindowOffset = startOffset + (targetOffset - startOffset) * easeT;

      // Physically translate 4-door window meshes down/up on Y axis
      windowMeshes.forEach(mesh => {
        const initialY = windowInitialPositions.get(mesh.uuid) || 0;
        mesh.position.y = initialY + currentWindowOffset;
      });

      if (t < 1.0) {
        windowAnimId = requestAnimationFrame(step);
      }
    }

    windowAnimId = requestAnimationFrame(step);
  }

  if (dockWindowBtn) {
    dockWindowBtn.addEventListener('click', () => {
      const isAlreadyActive = dockWindowBtn.classList.contains('active');
      deactivateAllDockBtns();
      bottomColorDrawer.classList.remove('active');

      if (isAlreadyActive) {
        windowRolledUp = true;
        if (dockWindowBtn) dockWindowBtn.classList.remove('active');
        watermarkEl.textContent = 'OVERVIEW';
        if (modelViewer) {
          animateWindowGlassPhysical(0);
        }
      } else {
        windowRolledUp = false;
        if (dockWindowBtn) dockWindowBtn.classList.add('active');
        watermarkEl.textContent = 'WINDOWS';
        if (modelViewer) {
          modelViewer.cameraOrbit = '95deg 82deg 3m';
          modelViewer.cameraTarget = '0m 0.8m 0m';
          animateWindowGlassPhysical(-0.45);
        }
      }
    });
  }

  let lightsOn = false;
  const volumetricFogContainer = document.getElementById('volumetric-fog-container');

  function setLightsState(state) {
    lightsOn = state;
    if (lightsOn) {
      if (dockLightsBtn) dockLightsBtn.classList.add('active');
      if (volumetricFogContainer) volumetricFogContainer.classList.add('active');
    } else {
      if (dockLightsBtn) dockLightsBtn.classList.remove('active');
      if (volumetricFogContainer) volumetricFogContainer.classList.remove('active');
    }
    applyActiveCustomizations();
  }

  if (dockLightsBtn) {
    dockLightsBtn.addEventListener('click', () => {
      const isAlreadyActive = dockLightsBtn.classList.contains('active');
      deactivateAllDockBtns();
      bottomColorDrawer.classList.remove('active');

      if (isAlreadyActive) {
        setLightsState(false);
        watermarkEl.textContent = 'OVERVIEW';
      } else {
        watermarkEl.textContent = 'LIGHTS';
        if (modelViewer) {
          modelViewer.cameraOrbit = '0deg 85deg 3.8m';
          modelViewer.cameraTarget = '0m 0.6m 1.8m';
        }
        setLightsState(true);
      }
    });
  }

  if (closeDrawerBtn) {
    closeDrawerBtn.addEventListener('click', () => {
      bottomColorDrawer.classList.remove('active');
      deactivateAllDockBtns();
    });
  }

  /* ==========================================================================
     4. Wheel Option Switcher
     ========================================================================== */
  function switchWheelModel(option) {
    currentWheelOption = option;
    if (!modelViewer) return;

    if (option === 'set1') {
      modelViewer.src = './assets/bmw_x7_wheel_1.glb';
    } else if (option === 'set2') {
      modelViewer.src = './assets/bmw_x7_wheel_2.glb';
    }

    modelViewer.cameraOrbit = '65deg 88deg 2.4m';
    modelViewer.cameraTarget = '0.75m 0.35m 1.35m';
  }

  /* ==========================================================================
     5. Swatch Drawer Click Handlers
     ========================================================================== */
  const colorCards = document.querySelectorAll('.color-card');

  colorCards.forEach(card => {
    card.addEventListener('click', () => {
      const type = card.getAttribute('data-type');
      const parentGroup = card.parentElement;
      parentGroup.querySelectorAll('.color-card').forEach(c => c.classList.remove('active'));
      card.classList.add('active');

      if (type === 'paint') {
        currentPaintHex = card.getAttribute('data-color');
        currentPaintName = card.getAttribute('data-name');
        currentPaintPrice = parseInt(card.getAttribute('data-price') || '0', 10);
        
        if (inputPaintColor) inputPaintColor.value = currentPaintHex;
        if (valPaintHex) valPaintHex.textContent = currentPaintHex.toUpperCase();

        currentPaintRoughness = 0.12;
        currentPaintMetallic = 0.08;
        
        if (inputRoughness) inputRoughness.value = currentPaintRoughness;
        if (valRoughness) valRoughness.textContent = currentPaintRoughness.toFixed(2);
        if (inputMetallic) inputMetallic.value = currentPaintMetallic;
        if (valMetallic) valMetallic.textContent = currentPaintMetallic.toFixed(2);

        const priceBadge = currentPaintPrice > 0 ? `(+$${currentPaintPrice.toLocaleString()})` : '($0)';
        activePaintLbl.textContent = `2026. ${currentPaintName.toUpperCase()} ${priceBadge}`;
        applyActiveCustomizations();
        updateTotalPrice();
      } else if (type === 'seat') {
        currentSeatHex = card.getAttribute('data-color');
        if (inputSeatColor) inputSeatColor.value = currentSeatHex;
        if (valSeatHex) valSeatHex.textContent = currentSeatHex.toUpperCase();
        applyActiveCustomizations();
      } else if (type === 'wheel') {
        const wheelOption = card.getAttribute('data-wheel');
        switchWheelModel(wheelOption);
      }
    });
  });

  function updateTotalPrice() {
    const total = BASE_PRICE + currentPaintPrice;
    totalPriceDisplay.textContent = `$${total.toLocaleString()}`;
    buildSummaryLbl.textContent = `${activePaintLbl.textContent} • 523 HP V8`;
  }

  /* ==========================================================================
     6. Bottom Toolbar Handlers (Theme, Auto-Rotate, AR/VR)
     ========================================================================== */
  let darkTheme = false;
  themeToggleBtn.addEventListener('click', () => {
    darkTheme = !darkTheme;
    if (darkTheme) {
      studioContainer.classList.add('dark-theme');
      themeToggleBtn.style.backgroundColor = 'var(--bmw-blue)';
      themeToggleBtn.style.color = '#ffffff';
    } else {
      studioContainer.classList.remove('dark-theme');
      themeToggleBtn.style.backgroundColor = '';
      themeToggleBtn.style.color = '';
    }
  });

  let autoRotate = false;
  toggleAutoRotateBtn.addEventListener('click', () => {
    autoRotate = !autoRotate;
    if (autoRotate) {
      modelViewer.setAttribute('auto-rotate', '');
      toggleAutoRotateBtn.style.backgroundColor = 'var(--bmw-black)';
      toggleAutoRotateBtn.style.color = '#ffffff';
    } else {
      modelViewer.removeAttribute('auto-rotate');
      toggleAutoRotateBtn.style.backgroundColor = '';
      toggleAutoRotateBtn.style.color = '';
    }
  });

  // HTML5 Fullscreen API Handler
  const toggleFullscreenBtn = document.getElementById('toggle-fullscreen-btn');
  if (toggleFullscreenBtn) {
    toggleFullscreenBtn.addEventListener('click', () => {
      if (!document.fullscreenElement) {
        if (studioContainer.requestFullscreen) {
          studioContainer.requestFullscreen();
        } else if (studioContainer.webkitRequestFullscreen) {
          studioContainer.webkitRequestFullscreen();
        }
        toggleFullscreenBtn.textContent = '🗗';
        toggleFullscreenBtn.title = 'Exit Fullscreen View';
      } else {
        if (document.exitFullscreen) {
          document.exitFullscreen();
        } else if (document.webkitExitFullscreen) {
          document.webkitExitFullscreen();
        }
        toggleFullscreenBtn.textContent = '⛶';
        toggleFullscreenBtn.title = 'Toggle Fullscreen View';
      }
    });

    document.addEventListener('fullscreenchange', () => {
      if (!document.fullscreenElement) {
        toggleFullscreenBtn.textContent = '⛶';
        toggleFullscreenBtn.title = 'Toggle Fullscreen View';
      }
    });
  }

  function openAR() {
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);

    if (isMobile && modelViewer && modelViewer.canActivateAR) {
      modelViewer.activateAR();
    } else {
      const pageUrl = window.location.href;
      qrCodeImg.src = `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(pageUrl)}`;
      arModal.classList.add('active');
    }
  }

  if (vrArPillBtn) vrArPillBtn.addEventListener('click', openAR);
  if (arTrigger) arTrigger.addEventListener('click', openAR);
  if (closeArModal) closeArModal.addEventListener('click', () => arModal.classList.remove('active'));
  if (arModal) {
    arModal.addEventListener('click', (e) => {
      if (e.target === arModal) arModal.classList.remove('active');
    });
  }
});
