
import * as THREE from 'three';
import { initializeControls, setHomeView } from './controls.js';
import { setupEnvironment, switchEnvironment } from './lighting.js';
import { loadCarModel } from './carLoader.js';
import { setupUI, bindSnapshot, bindXR, bindRotateToggle, bindShare } from './ui.js';
import { applyPaintPreset, applyBodyPBR, applyRimsStyle, applyRimsCustom, applyCalipers, applyGlass, applyInterior, setHeadlightIntensity } from './customization.js';

let scene, camera, renderer, controls, currentCar, clock;
let autoRotate = false;
let ambientLight;

const canvas = document.getElementById('car-canvas');

const state = {
  model: 'mercedes_slr',
  bg: 'showroom',
  bodyColor: '#b40000',
  bodyMetal: 0.6,
  bodyRough: 0.2,
  bodyCC: 0.8,
  rimsStyle: 'silver',
  rimColor: '#c9ccd1',
  rimMetal: 1.0,
  rimRough: 0.25,
  caliperColor: '#ff0000',
  glassColor: '#3fa7ef',
  glassOpacity: 0.25,
  glassRough: 0.05,
  seatColor: '#c28f5c',
  dashColor: '#222222',
  ambientLevel: 0.7,
  headlightLevel: 1.8,
};

function hydrateFromURL() {
  const params = new URLSearchParams(window.location.search);
  for (const [k,v] of params.entries()) {
    if (k in state) {
      const num = Number(v);
      state[k] = Number.isFinite(num) && v.trim() !== '' && /^(body|rim|glass|ambient|headlight)/.test(k) ? num : v;
    }
  }
}

function init() {
  hydrateFromURL();
  scene = new THREE.Scene();
  clock = new THREE.Clock();

  camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 200);
  camera.position.set(4.5, 1.8, 6.5);

  renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true, preserveDrawingBuffer: true });
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.1;
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  resize();
  window.addEventListener('resize', resize);

  controls = initializeControls(camera, renderer.domElement);
  setHomeView(controls, new THREE.Vector3(0, 0.75, 0), new THREE.Vector3(4.5, 1.8, 6.5));

  ambientLight = new THREE.AmbientLight(0xffffff, state.ambientLevel);
  scene.add(ambientLight);

  setupEnvironment(scene, renderer, state.bg);

  loadCarModel(scene, state.model).then(car => {
    currentCar = car;
    applyAll();
    highlightActiveButtons();
  });

  setupUI({
    onModelChange: (model) => { state.model = model; loadCarModel(scene, state.model).then(car => { currentCar = car; applyAll(); }); },
    onBodyPreset: (preset) => { applyPaintPreset(currentCar, preset); },
    onBodyCustom: ({color, metalness, roughness, clearcoat}) => {
      state.bodyColor = color; state.bodyMetal = metalness; state.bodyRough = roughness; state.bodyCC = clearcoat;
      applyBodyPBR(currentCar, color, metalness, roughness, clearcoat, 0.1);
    },
    onRimsStyle: (style) => { state.rimsStyle = style; applyRimsStyle(currentCar, style); },
    onRimsCustom: ({color, metalness, roughness}) => {
      state.rimColor = color; state.rimMetal = metalness; state.rimRough = roughness;
      applyRimsCustom(currentCar, color, metalness, roughness);
    },
    onCalipers: (color) => { state.caliperColor = color; applyCalipers(currentCar, color); },
    onGlass: ({color, opacity, roughness}) => {
      state.glassColor = color; state.glassOpacity = opacity; state.glassRough = roughness;
      applyGlass(currentCar, color, opacity, roughness);
    },
    onInterior: ({seats, dash}) => {
      state.seatColor = seats; state.dashColor = dash;
      applyInterior(currentCar, seats, dash);
    },
    onAmbient: (level) => { state.ambientLevel = level; ambientLight.intensity = level; },
    onHeadlights: (level) => { state.headlightLevel = level; setHeadlightIntensity(currentCar, level); },
    onBackground: (bg) => { state.bg = bg; switchEnvironment(scene, renderer, bg); },
    onReset: () => resetAll(),
    onHome: () => { setHomeView(controls); },
    onStateChange: () => pushStateToURL(),
  });

  bindSnapshot(renderer, canvas);
  bindXR(renderer);
  bindRotateToggle(() => { autoRotate = !autoRotate; });
  bindShare(() => serializeState());

  animate();
}

function serializeState() {
  const out = {};
  for (const k in state) out[k] = state[k];
  out.model = state.model;
  out.bg = state.bg;
  return out;
}

function pushStateToURL() {
  const params = new URLSearchParams(serializeState());
  const url = new URL(window.location.href);
  url.search = params.toString();
  history.replaceState(null, '', url.toString());
}

function highlightActiveButtons() {
  const setActive = (selector, attr, value) => {
    document.querySelectorAll(selector).forEach(b => {
      b.classList.toggle('active', b.getAttribute(attr) === value);
    });
  };
  setActive('.model-btn', 'data-model', state.model);
  setActive('.bg-btn', 'data-bg', state.bg);
  setActive('.rims-style', 'data-rims', state.rimsStyle);
}

function resetAll() {
  Object.assign(state, {
    model: 'mercedes_slr',
    bg: 'showroom',
    bodyColor: '#b40000',
    bodyMetal: 0.6,
    bodyRough: 0.2,
    bodyCC: 0.8,
    rimsStyle: 'silver',
    rimColor: '#c9ccd1',
    rimMetal: 1.0,
    rimRough: 0.25,
    caliperColor: '#ff0000',
    glassColor: '#3fa7ef',
    glassOpacity: 0.25,
    glassRough: 0.05,
    seatColor: '#c28f5c',
    dashColor: '#222222',
    ambientLevel: 0.7,
    headlightLevel: 1.8,
  });
  switchEnvironment(scene, renderer, state.bg);
  setHomeView(controls);
  loadCarModel(scene, state.model).then(car => { currentCar = car; applyAll(); highlightActiveButtons(); pushStateToURL(); });
}

function applyAll() {
  applyBodyPBR(currentCar, state.bodyColor, state.bodyMetal, state.bodyRough, state.bodyCC, 0.1);
  if (state.rimsStyle) applyRimsStyle(currentCar, state.rimsStyle);
  applyRimsCustom(currentCar, state.rimColor, state.rimMetal, state.rimRough);
  applyCalipers(currentCar, state.caliperColor);
  applyGlass(currentCar, state.glassColor, state.glassOpacity, state.glassRough);
  applyInterior(currentCar, state.seatColor, state.dashColor);
  setHeadlightIntensity(currentCar, state.headlightLevel);
  highlightActiveButtons();
}

function animate() {
  const dt = (clock?.getDelta?.() ?? 0.016);
  if (autoRotate && currentCar) currentCar.rotation.y += dt * 0.3;
  controls.update();
  renderer.render(scene, camera);
  requestAnimationFrame(animate);
}

function resize() {
  const w = window.innerWidth, h = window.innerHeight;
  renderer.setSize(w, h, false);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  camera.aspect = w / h;
  camera.updateProjectionMatrix();
}

init();
