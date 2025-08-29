import * as THREE from 'three';
import { RGBELoader } from 'three/examples/jsm/loaders/RGBELoader.js';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';

let hemi, dir;

// Resolve HDR path
function resolveEnvURL(input) {
  if (!input || input === true) input = 'showroom.hdr';

  const key = String(input).toLowerCase();
  let file = 'showroom.hdr';

  if (key.endsWith('.hdr')) {
    file = key;
  } else if (key.includes('outdoor')) {
    file = 'outdoor.hdr';
  } else if (key.includes('showroom')) {
    file = 'showroom.hdr';
  }

  // ✅ Use relative path (works when opening index.html or hosting)
  return './assets/textures/environment/' + file;
}

function applyHDR(scene, renderer, url) {
  const loader = new RGBELoader();

  loader.load(
    url,
    (hdrEquirect) => {
      hdrEquirect.mapping = THREE.EquirectangularReflectionMapping;

      const pmrem = new THREE.PMREMGenerator(renderer);
      const envRT = pmrem.fromEquirectangular(hdrEquirect);

      hdrEquirect.dispose();
      pmrem.dispose();

      scene.environment = envRT.texture;
      scene.background = envRT.texture;
    },
    undefined,
    (err) => {
      console.error('⚠️ Failed to load HDR:', url, err);

      // fallback to procedural RoomEnvironment
      const pmrem = new THREE.PMREMGenerator(renderer);
      const env = new RoomEnvironment(renderer);
      const rt = pmrem.fromScene(env, 0.04).texture;
      scene.environment = rt;
      scene.background = rt;
    }
  );
}

export function setupEnvironment(scene, renderer, kind = 'showroom') {
  hemi = new THREE.HemisphereLight(0xffffff, 0x222233, 0.7);
  scene.add(hemi);

  dir = new THREE.DirectionalLight(0xffffff, 3.0);
  dir.position.set(6, 10, 6);
  dir.castShadow = true;
  dir.shadow.mapSize.set(2048, 2048);
  dir.shadow.camera.near = 0.5;
  dir.shadow.camera.far = 100;
  dir.shadow.radius = 2;
  scene.add(dir);

  const url = resolveEnvURL(kind);
  applyHDR(scene, renderer, url);
}

export function switchEnvironment(scene, renderer, selection) {
  const url = resolveEnvURL(selection);
  applyHDR(scene, renderer, url);
}
