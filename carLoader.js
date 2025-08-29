
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import * as THREE from 'three';

let current;

export async function loadCarModel(scene, modelName) {
  const loader = new GLTFLoader();
  const url = `/assets/models/${modelName}.glb`;

  return new Promise((resolve, reject) => {
    loader.load(url, (gltf) => {
      if (current) {
        scene.remove(current);
        current.traverse((c) => {
          if (c.isMesh) {
            c.geometry.dispose();
            if (Array.isArray(c.material)) c.material.forEach(m => m.dispose?.());
            else c.material?.dispose?.();
          }
        });
      }

      const root = gltf.scene;
      root.name = 'Car';
      root.scale.set(1.5,1.5,1.5);
      root.position.set(0,0,0);
      root.traverse((obj) => {
        if (obj.isMesh) {
          obj.castShadow = true;
          obj.receiveShadow = true;
          if (obj.material) {
            obj.material.envMapIntensity = 1.2;
            obj.material.needsUpdate = true;
          }
        }
      });

      const parts = {
        body: [], rims: [], tires: [], glass: [], lights: [],
        seats: [], dashboard: [], calipers: []
      };
      root.traverse((m) => {
        if (!m.isMesh) return;
        const nm = (m.name || '').toLowerCase();
        const matn = (m.material?.name || '').toLowerCase();

        const looksGlass   = nm.includes('glass') || nm.includes('window') || nm.includes('windscreen') || matn.includes('glass');
        const looksLight   = nm.includes('light') || nm.includes('headlight') || nm.includes('tail') || matn.includes('light') || matn.includes('emissive');
        const looksRim     = nm.includes('rim') || nm.includes('wheel') || matn.includes('rim') || matn.includes('wheel');
        const looksTire    = nm.includes('tire') || nm.includes('tyre') || matn.includes('tire') || matn.includes('rubber');
        const looksSeat    = nm.includes('seat') || nm.includes('leather') || matn.includes('leather') || nm.includes('chair');
        const looksDash    = nm.includes('dashboard') || nm.includes('dash') || nm.includes('interior') || matn.includes('interior');
        const looksCaliper = nm.includes('caliper') || nm.includes('brake') || matn.includes('caliper');

        if (looksGlass) parts.glass.push(m);
        else if (looksLight) parts.lights.push(m);
        else if (looksRim) parts.rims.push(m);
        else if (looksTire) parts.tires.push(m);
        else if (looksSeat) parts.seats.push(m);
        else if (looksDash) parts.dashboard.push(m);
        else if (looksCaliper) parts.calipers.push(m);
        else parts.body.push(m);
      });
      root.userData.parts = parts;

      scene.add(root);
      current = root;
      resolve(root);
    }, undefined, (err) => reject(err));
  });
}
