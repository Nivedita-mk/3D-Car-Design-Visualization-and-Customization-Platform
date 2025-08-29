
import * as THREE from 'three';

export const PRESETS = {
  red_matte: { color: 0xb40000, metalness: 0.2, roughness: 0.8, clearcoat: 0.05 },
  blue_metallic: { color: 0x1e62ff, metalness: 0.9, roughness: 0.25, clearcoat: 0.8, clearcoatRoughness: 0.1 },
  black_glossy: { color: 0x111111, metalness: 0.6, roughness: 0.15, clearcoat: 1.0, clearcoatRoughness: 0.03 },
};

export function applyPaintPreset(car, presetKey) {
  const cfg = PRESETS[presetKey] ?? PRESETS.red_matte;
  applyBodyPBR(car, new THREE.Color(cfg.color), cfg.metalness, cfg.roughness, cfg.clearcoat ?? 0.0, cfg.clearcoatRoughness ?? 0.1);
}

export function applyBodyPBR(car, color, metalness, roughness, clearcoat, ccRough) {
  if (!car) return;
  const body = car.userData?.parts?.body ?? [];
  body.forEach(m => {
    const mat = toPhysical(m.material);
    mat.color = color instanceof THREE.Color ? color : new THREE.Color(color);
    mat.metalness = clamp01(metalness);
    mat.roughness = clamp01(roughness);
    mat.clearcoat = clamp01(clearcoat ?? 0);
    mat.clearcoatRoughness = clamp01(ccRough ?? 0.1);
    mat.envMapIntensity = 1.2;
    mat.needsUpdate = true;
    m.material = mat;
  });
}

export function applyRimsStyle(car, style) {
  if (!car) return;
  const rims = car.userData?.parts?.rims ?? [];
  rims.forEach(m => {
    const mat = toPhysical(m.material);
    if (style === 'carbon') {
      mat.color = new THREE.Color(0x222222);
      mat.metalness = 0.3;
      mat.roughness = 0.35;
    } else {
      mat.color = new THREE.Color(0xc9ccd1);
      mat.metalness = 1.0;
      mat.roughness = 0.25;
    }
    mat.needsUpdate = true;
    m.material = mat;
  });
}

export function applyRimsCustom(car, color, metalness, roughness) {
  if (!car) return;
  (car.userData?.parts?.rims ?? []).forEach(m => {
    const mat = toPhysical(m.material);
    mat.color = new THREE.Color(color);
    mat.metalness = clamp01(metalness);
    mat.roughness = clamp01(roughness);
    mat.needsUpdate = true;
    m.material = mat;
  });
}

export function applyCalipers(car, color) {
  if (!car) return;
  (car.userData?.parts?.calipers ?? []).forEach(m => {
    const mat = toPhysical(m.material);
    mat.color = new THREE.Color(color);
    mat.emissive = new THREE.Color(color);
    mat.emissiveIntensity = 0.15;
    mat.metalness = 0.5;
    mat.roughness = 0.4;
    mat.needsUpdate = true;
    m.material = mat;
  });
}

export function applyGlass(car, color, opacity, roughness) {
  if (!car) return;
  (car.userData?.parts?.glass ?? []).forEach(m => {
    // Using Physical material with transparency for wide support
    const mat = toPhysical(m.material);
    mat.color = new THREE.Color(color);
    mat.metalness = 0.0;
    mat.roughness = clamp01(roughness);
    mat.transparent = true;
    mat.opacity = clamp01(1.0 - opacity); // higher opacity slider = darker tint
    mat.envMapIntensity = 1.2;
    mat.reflectivity = 0.4;
    mat.needsUpdate = true;
    m.material = mat;
  });
}

export function applyInterior(car, seatColor, dashColor) {
  if (!car) return;
  (car.userData?.parts?.seats ?? []).forEach(m => {
    const mat = toPhysical(m.material);
    mat.color = new THREE.Color(seatColor);
    mat.metalness = 0.1;
    mat.roughness = 0.7;
    mat.needsUpdate = true;
    m.material = mat;
  });
  (car.userData?.parts?.dashboard ?? []).forEach(m => {
    const mat = toPhysical(m.material);
    mat.color = new THREE.Color(dashColor);
    mat.metalness = 0.2;
    mat.roughness = 0.6;
    mat.needsUpdate = true;
    m.material = mat;
  });
}

export function setHeadlightIntensity(car, level) {
  if (!car) return;
  (car.userData?.parts?.lights ?? []).forEach(m => {
    const mat = toPhysical(m.material);
    mat.emissive = new THREE.Color(0xffffff);
    mat.emissiveIntensity = Math.max(0, level);
    mat.needsUpdate = true;
    m.material = mat;
  });
}

function toPhysical(material) {
  let mat = material;
  if (Array.isArray(mat)) mat = mat[0];
  if (!mat || (!mat.isMeshStandardMaterial && !mat.isMeshPhysicalMaterial)) {
    mat = new THREE.MeshPhysicalMaterial({ color: 0xffffff, metalness: 0.6, roughness: 0.4 });
  }
  return mat;
}

function clamp01(v){ return Math.max(0, Math.min(1, Number(v))); }
