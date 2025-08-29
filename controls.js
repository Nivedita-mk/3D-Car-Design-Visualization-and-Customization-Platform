
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import * as THREE from 'three';

export function initializeControls(camera, dom) {
  const controls = new OrbitControls(camera, dom);
  controls.enableDamping = true;
  controls.dampingFactor = 0.05;
  controls.target.set(0, 0.75, 0);
  controls.minDistance = 2.5;
  controls.maxDistance = 12;
  controls.maxPolarAngle = Math.PI * 0.52;
  return controls;
}

export function setHomeView(controls, target = new THREE.Vector3(0,0.75,0), position = new THREE.Vector3(4.5,1.8,6.5)) {
  controls.target.copy(target);
  controls.object.position.copy(position);
  controls.object.lookAt(target);
  controls.update();
}
