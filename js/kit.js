// Shared 3D helpers. Flat-shaded low-poly solids with blueprint edge lines.
import * as THREE from 'three';
export { THREE };

export const clamp = (x, a = 0, b = 1) => Math.min(b, Math.max(a, x));
export const lerp = (a, b, t) => a + (b - a) * t;
export const smooth = t => { t = clamp(t); return t * t * t * (t * (t * 6 - 15) + 10); };
export const seg = (u, a, b) => clamp((u - a) / (b - a));           // 0..1 progress of u between a and b
export const ease = t => 1 - Math.pow(1 - clamp(t), 3);
export const mix = (a, b, t) => new THREE.Color(a).lerp(new THREE.Color(b), clamp(t));

export const PAL = {
  ink: 0x0a0d12, panel: 0x131923, steel: 0x2a3441, line: 0x5b6b80, white: 0xf3f5f7,
  blue: 0x3b82ff, cyan: 0x5ce1ff, amber: 0xffb020, red: 0xff5a4f, mint: 0x3ddc97, grey: 0x8b95a3,
};

export function solid(geo, color = PAL.panel, opts = {}) {
  const g = new THREE.Group();
  const m = new THREE.Mesh(geo, new THREE.MeshStandardMaterial({
    color, flatShading: true, roughness: opts.rough ?? 0.7, metalness: opts.metal ?? 0.1,
    transparent: opts.opacity !== undefined, opacity: opts.opacity ?? 1,
    emissive: opts.emissive ?? 0x000000, emissiveIntensity: opts.ei ?? 1,
  }));
  g.add(m); g.mesh = m;
  if (opts.edge !== false) {
    const l = new THREE.LineSegments(new THREE.EdgesGeometry(geo, 25),
      new THREE.LineBasicMaterial({ color: opts.edge ?? PAL.line, transparent: true, opacity: opts.edgeOpacity ?? 0.55 }));
    g.add(l); g.line = l;
  }
  return g;
}
export const box = (w, h, d, c, o) => solid(new THREE.BoxGeometry(w, h, d), c, o);
export const cyl = (rt, rb, h, c, o, seg = 24) => solid(new THREE.CylinderGeometry(rt, rb, h, seg), c, o);
export const place = (o, x = 0, y = 0, z = 0) => { o.position.set(x, y, z); return o; };

export function lights(scene) {
  scene.add(new THREE.HemisphereLight(0xbcd2ff, 0x10141c, 1.1));
  const d = new THREE.DirectionalLight(0xffffff, 2.2); d.position.set(8, 14, 10); scene.add(d);
  const r = new THREE.DirectionalLight(0x3b82ff, 1.2); r.position.set(-10, 4, -8); scene.add(r);
}

export function gridFloor(w = 60, d = 60, y = 0, color = 0x1c2430) {
  const g = new THREE.GridHelper(Math.max(w, d), Math.max(w, d) / 2, color, color);
  g.position.y = y; g.material.transparent = true; g.material.opacity = 0.9; return g;
}

export function weaveTexture(base = '#4a586b', dark = '#1a212c', n = 28) {
  const c = document.createElement('canvas'); c.width = c.height = 512;
  const x = c.getContext('2d'); x.fillStyle = dark; x.fillRect(0, 0, 512, 512);
  const s = 512 / n;
  for (let i = 0; i < n; i++) for (let j = 0; j < n; j++) {
    const over = (i + j) % 2 === 0;
    x.fillStyle = over ? base : dark;
    if (over) x.fillRect(i * s + 1, j * s + 1, s - 2, s - 2);
    else { x.fillStyle = '#2b3544'; x.fillRect(i * s + 1, j * s + 3, s - 2, s - 6); }
  }
  const t = new THREE.CanvasTexture(c); t.wrapS = t.wrapT = THREE.RepeatWrapping; t.anisotropy = 4; return t;
}

export function particles(n, spread, size = 0.12, color = 0xffffff, opacity = 0.8) {
  const geo = new THREE.BufferGeometry();
  const a = new Float32Array(n * 3);
  for (let i = 0; i < n; i++) { a[i*3] = (Math.random()-.5)*spread[0]; a[i*3+1] = (Math.random()-.5)*spread[1]; a[i*3+2] = (Math.random()-.5)*spread[2]; }
  geo.setAttribute('position', new THREE.BufferAttribute(a, 3));
  const p = new THREE.Points(geo, new THREE.PointsMaterial({ color, size, transparent: true, opacity, depthWrite: false, sizeAttenuation: true }));
  return p;
}

// Fabric close-up used by several chapters: weave plane, lodged stain, water flow, cleaner flow.
export function fabric({ w = 14, h = 9, stainColor = PAL.amber } = {}) {
  const g = new THREE.Group();
  const tex = weaveTexture(); tex.repeat.set(w / 3, h / 3);
  const plane = new THREE.Mesh(new THREE.PlaneGeometry(w, h, 1, 1),
    new THREE.MeshStandardMaterial({ map: tex, bumpMap: tex, bumpScale: 2.2, roughness: 0.95, color: 0x8a8a8a }));
  g.add(plane);
  // stain = cluster of tiny spheres half buried in the weave
  const N = 320, ig = new THREE.IcosahedronGeometry(0.16, 0);
  const im = new THREE.InstancedMesh(ig, new THREE.MeshStandardMaterial({ color: stainColor, flatShading: true, roughness: .6 }), N);
  const seed = [];
  for (let i = 0; i < N; i++) {
    const r = Math.pow(Math.random(), 0.7) * 1.7, a = Math.random() * 6.283;
    seed.push({ x: Math.cos(a) * r * 1.15, y: Math.sin(a) * r * 0.85, z: 0.02 + Math.random() * 0.12, s: 0.6 + Math.random() * 0.9, ph: Math.random() * 6 });
  }
  g.add(im);
  const dummy = new THREE.Object3D();
  const water = particles(700, [w, h, 0.01], 0.09, 0x6aa8ff, 0.75);
  const chem = particles(420, [w, h, 0.01], 0.14, 0xe9fbff, 0.95);
  water.position.z = 0.7; chem.position.z = 0.9; chem.visible = false;
  g.add(water, chem);
  const api = {
    group: g, plane, stainMesh: im, water, chem,
    amount: 1, age: 0, flow: 0, chemOn: 0, sunk: 1,
    update(t, dt) {
      im.material.color.set(mix(stainColor, 0x5a4a38, this.age));
      for (let i = 0; i < N; i++) {
        const s = seed[i], k = this.amount * s.s;
        dummy.position.set(s.x, s.y, s.z - 0.1 * this.sunk + 0.18 * Math.sin(t + s.ph) * 0.15);
        dummy.scale.setScalar(Math.max(0.0001, k)); dummy.updateMatrix(); im.setMatrixAt(i, dummy.matrix);
      }
      im.instanceMatrix.needsUpdate = true;
      const adv = (arr, v, bounce) => {
        const p = arr.geometry.attributes.position.array;
        for (let i = 0; i < p.length; i += 3) {
          p[i] += v * dt * (0.6 + (i % 7) * 0.1);
          if (p[i] > w / 2) { p[i] = -w / 2; p[i+1] = (Math.random() - .5) * h; }
          if (bounce) { // water slides around the lodged stain: it can't get in
            const dx = p[i], dy = p[i+1], d = Math.hypot(dx / 1.15, dy / .85);
            if (d < 1.9 * this.amount + .2) { const push = (1.9 * this.amount + .2 - d) * .35; p[i+1] += (dy >= 0 ? 1 : -1) * push; p[i] -= 0.04; }
          }
        }
        arr.geometry.attributes.position.needsUpdate = true;
      };
      water.visible = this.flow > 0.01; water.material.opacity = 0.75 * clamp(this.flow);
      if (water.visible) adv(water, 7 * this.flow, true);
      chem.visible = this.chemOn > 0.01; chem.material.opacity = 0.95 * clamp(this.chemOn);
      if (chem.visible) adv(chem, 4 * this.chemOn, false);
    },
  };
  return api;
}
