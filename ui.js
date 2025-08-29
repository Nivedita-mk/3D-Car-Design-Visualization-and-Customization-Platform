
import { ARButton } from 'three/examples/jsm/webxr/ARButton.js';
import { VRButton } from 'three/examples/jsm/webxr/VRButton.js';

export function setupUI(api) {
  // Models
  document.querySelectorAll('.model-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.model-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      api.onModelChange(btn.dataset.model);
      api.onStateChange();
    });
  });

  // Body presets
  document.querySelectorAll('.color-swatch').forEach(s => {
    s.addEventListener('click', () => {
      api.onBodyPreset(s.dataset.preset);
      api.onStateChange();
    });
  });

  // Body PBR sliders
  const bodyColorPicker = document.getElementById('bodyColorPicker');
  const bodyMetal = document.getElementById('bodyMetal');
  const bodyRough = document.getElementById('bodyRough');
  const bodyCC = document.getElementById('bodyCC');
  [bodyColorPicker, bodyMetal, bodyRough, bodyCC].forEach(el => {
    el.addEventListener('input', () => {
      api.onBodyCustom({
        color: bodyColorPicker.value,
        metalness: parseFloat(bodyMetal.value),
        roughness: parseFloat(bodyRough.value),
        clearcoat: parseFloat(bodyCC.value)
      });
      api.onStateChange();
    });
  });

  // Rims
  document.querySelectorAll('.rims-style').forEach(b => {
    b.addEventListener('click', () => {
      document.querySelectorAll('.rims-style').forEach(x => x.classList.remove('active'));
      b.classList.add('active');
      api.onRimsStyle(b.dataset.rims);
      api.onStateChange();
    });
  });
  const rimColorPicker = document.getElementById('rimColorPicker');
  const rimMetal = document.getElementById('rimMetal');
  const rimRough = document.getElementById('rimRough');
  [rimColorPicker, rimMetal, rimRough].forEach(el => {
    el.addEventListener('input', () => {
      api.onRimsCustom({
        color: rimColorPicker.value,
        metalness: parseFloat(rimMetal.value),
        roughness: parseFloat(rimRough.value)
      });
      api.onStateChange();
    });
  });
  const caliperColorPicker = document.getElementById('caliperColorPicker');
  caliperColorPicker.addEventListener('input', () => {
    api.onCalipers(caliperColorPicker.value);
    api.onStateChange();
  });

  // Glass
  const glassColorPicker = document.getElementById('glassColorPicker');
  const glassOpacity = document.getElementById('glassOpacity');
  const glassRough = document.getElementById('glassRough');
  [glassColorPicker, glassOpacity, glassRough].forEach(el => {
    el.addEventListener('input', () => {
      api.onGlass({
        color: glassColorPicker.value,
        opacity: parseFloat(glassOpacity.value),
        roughness: parseFloat(glassRough.value)
      });
      api.onStateChange();
    });
  });

  // Interior
  const seatColorPicker = document.getElementById('seatColorPicker');
  const dashColorPicker = document.getElementById('dashColorPicker');
  const ambientLevel = document.getElementById('ambientLevel');
  const headlightLevel = document.getElementById('headlightLevel');
  [seatColorPicker, dashColorPicker].forEach(el => {
    el.addEventListener('input', () => {
      api.onInterior({
        seats: seatColorPicker.value,
        dash: dashColorPicker.value
      });
      api.onStateChange();
    });
  });
  ambientLevel.addEventListener('input', () => {
    api.onAmbient(parseFloat(ambientLevel.value));
    api.onStateChange();
  });
  headlightLevel.addEventListener('input', () => {
    api.onHeadlights(parseFloat(headlightLevel.value));
    api.onStateChange();
  });

  // Backgrounds
  document.querySelectorAll('.bg-btn').forEach(b => {
    b.addEventListener('click', () => {
      document.querySelectorAll('.bg-btn').forEach(x => x.classList.remove('active'));
      b.classList.add('active');
      api.onBackground(b.dataset.bg);
      api.onStateChange();
    });
  });

  // Actions
  document.getElementById('btn-reset').addEventListener('click', () => { api.onReset(); api.onStateChange(); });
  document.getElementById('btn-home').addEventListener('click', api.onHome);
}

export function bindSnapshot(renderer, canvas) {
  document.getElementById('btn-snapshot').addEventListener('click', () => {
    const url = canvas.toDataURL('image/png');
    const a = document.createElement('a');
    a.href = url;
    a.download = 'car-snapshot.png';
    a.click();
  });
}

export function bindRotateToggle(toggle) {
  document.getElementById('btn-rotate').addEventListener('click', toggle);
}

export function bindXR(renderer) {
  const arBtn = document.getElementById('btn-ar');
  const vrBtn = document.getElementById('btn-vr');

  arBtn.addEventListener('click', () => {
    try {
      const btn = ARButton.createButton(renderer, { requiredFeatures: [] });
      document.body.appendChild(btn);
      renderer.xr.enabled = true;
      btn.click();
    } catch (e) {
      alert('WebXR AR not supported on this device/browser.');
    }
  });

  vrBtn.addEventListener('click', () => {
    try {
      const btn = VRButton.createButton(renderer);
      document.body.appendChild(btn);
      renderer.xr.enabled = true;
      btn.click();
    } catch (e) {
      alert('WebXR VR not supported on this device/browser.');
    }
  });
}

// Share current design via the Web Share API (fallback: copy URL)
export function bindShare(getState) {
  const shareBtn = document.getElementById('btn-share');
  const buildURL = () => {
    const params = new URLSearchParams(getState());
    const url = new URL(window.location.href);
    url.search = params.toString();
    return url.toString();
  };
  const copyToClipboard = (text) => {
    const ta = document.createElement('textarea');
    ta.value = text;
    document.body.appendChild(ta);
    ta.select();
    document.execCommand('copy');
    document.body.removeChild(ta);
  };

  shareBtn.addEventListener('click', async () => {
    const shareUrl = buildURL();
    const data = {
      title: 'My 3D Car Design',
      text: 'Check out my custom configuration!',
      url: shareUrl,
    };
    if (navigator.share) {
      try { await navigator.share(data); }
      catch (e) { /* user canceled */ }
    } else {
      copyToClipboard(shareUrl);
      alert('Link copied to clipboard!');
    }
  });
}
