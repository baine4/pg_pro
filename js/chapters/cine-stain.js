// LIVE 3D HERO prototype: "The 11 a.m. checkout". One headline + one line per screen.
// To use real models later: load a .glb with GLTFLoader and add it where each stage group is built.
import * as kit from '../kit.js';
const { THREE, PAL, box, cyl, place, seg, ease, clamp, lerp } = kit;

const canvasTex = (w, h, draw, rep) => { const c = document.createElement('canvas'); c.width = w; c.height = h; draw(c.getContext('2d'), w, h); const t = new THREE.CanvasTexture(c); t.wrapS = t.wrapT = THREE.RepeatWrapping; t.anisotropy = 8; t.colorSpace = THREE.SRGBColorSpace; if (rep) t.repeat.set(...rep); return t; };
const rnd = (() => { let s = 7; return () => (s = (s * 16807) % 2147483647) / 2147483647; })();
const M = (o) => new THREE.MeshStandardMaterial(o);

export default {
  id: 'cine-stain', title: 'The 11 a.m. checkout (live 3D)', cine: true, accent: '#f1c27d', bg: 0x07090c, fov: 34, env: 0.6, fog: [30, 120], controls: [],
  scenes: [
    { big: 1, kicker: '', h: 'The laundry room.', sub: 'Where every stain from every room finally gets its one chance.', needs: [], cam: { p: [3, 3.6, 25], l: [0, 2.8, -2] } },
    { kicker: '', h: 'It started upstairs.', sub: 'A hotel room. 11:52 p.m.', needs: [], cam: { p: [34, 3.6, 15], l: [40, 2.4, 0] } },
    { kicker: '', h: 'One small spill.', sub: 'Grease on the duvet. Nobody treats it tonight.', needs: [], cam: { p: [44.5, 3.5, 6.5], l: [40.6, 1.5, 0.3] } },
    { kicker: '', h: 'By morning, it has <em>set.</em>', sub: 'Every hour in the bag, the stain works deeper into the fibers.', needs: [], cam: { p: [41.2, 2.3, 2.0], l: [40.9, 1.56, 0.6] } },
    { kicker: '', h: 'Then the wash.', sub: 'Water flows around what it cannot reach.', needs: [], cam: { p: [80, 0.2, 7.5], l: [80, -0.8, -3] } },
    { kicker: '', h: 'Treat it at the <em>bed.</em>', sub: 'Catch the stain while it is fresh, before the cart ever leaves the room.', html: '<a class="btn on" href="../">See the full concept &rarr;</a>', needs: [], cam: { p: [44.5, 3.5, 6.5], l: [40.6, 1.5, 0.3] } },
  ],

  build({ THREE, scene, renderer, kit }) {
    document.body.insertAdjacentHTML('beforeend', '<div id="vig"></div>');
    const floor = new THREE.Mesh(new THREE.PlaneGeometry(900, 150), M({ color: 0x0b0d10, roughness: .6 })); floor.rotation.x = -Math.PI / 2; floor.position.y = -0.2; floor.receiveShadow = true; scene.add(floor);

    // ---------- LAUNDRY ROOM ----------
    const L = new THREE.Group(); scene.add(L);
    const tile = canvasTex(512, 512, (x, w, h) => { x.fillStyle = '#9aa0a6'; x.fillRect(0, 0, w, h); for (let i = 0; i < 4; i++) for (let j = 0; j < 4; j++) { x.fillStyle = `hsl(210,4%,${60 + rnd() * 8}%)`; x.fillRect(i * 128 + 3, j * 128 + 3, 122, 122); } }, [8, 6]);
    const lf = new THREE.Mesh(new THREE.PlaneGeometry(36, 26), M({ map: tile, roughness: .25, metalness: .1 })); lf.rotation.x = -Math.PI / 2; lf.receiveShadow = true; L.add(lf);
    L.add(place(box(36, 10, .4, 0xc9ccd0, { rough: .9, metal: 0 }), 0, 5, -9));
    L.add(place(box(.4, 10, 26, 0xc2c5ca, { rough: .9, metal: 0 }), -18, 5, 2)); L.add(place(box(.4, 10, 26, 0xc2c5ca, { rough: .9, metal: 0 }), 18, 5, 2));
    L.add(place(box(36, .4, 26, 0x8d9197, { rough: .95, metal: 0 }), 0, 10, 2));
    for (let i = 0; i < 4; i++) { const s = box(7, .15, .5, 0xffffff, { emissive: 0xfff4e0, ei: 1.4, rough: 1 }); s.position.set(-10.5 + i * 7, 9.75, -2); L.add(s); const pl = new THREE.PointLight(0xfff0d8, 22, 26, 1.8); pl.position.set(-10.5 + i * 7, 9, -2); L.add(pl); }
    const steel = { color: 0xc4cad1, metalness: .85, roughness: .32 };
    for (let i = 0; i < 5; i++) {
      const x = -12 + i * 6, g = new THREE.Group(); g.position.set(x, 0, -6.6);
      const b = new THREE.Mesh(new THREE.BoxGeometry(4.2, 5.2, 3.6), M(steel)); b.position.y = 2.6; b.castShadow = b.receiveShadow = true; g.add(b);
      const panel = box(4.2, .9, .3, 0x15181c, { rough: .4 }); panel.position.set(0, 4.7, 1.85); g.add(panel);
      const ring = new THREE.Mesh(new THREE.TorusGeometry(1.2, .2, 18, 48), M({ color: 0xdfe4ea, metalness: 1, roughness: .2 })); ring.position.set(0, 2.5, 1.85); ring.castShadow = true; g.add(ring);
      const glass = new THREE.Mesh(new THREE.CircleGeometry(1.15, 40), new THREE.MeshPhysicalMaterial({ color: 0x1b2430, roughness: .05, metalness: 0, transmission: 0, clearcoat: 1, reflectivity: .8 })); glass.position.set(0, 2.5, 1.86); g.add(glass);
      L.add(g);
    }
    const mound = (x, z, c) => { const g = new THREE.Group(); g.position.set(x, 0, z); const bin = new THREE.Mesh(new THREE.BoxGeometry(3, 2.2, 2.2), M({ color: 0x8c949c, metalness: .6, roughness: .5 })); bin.position.y = 1.5; bin.castShadow = true; g.add(bin);
      for (let k = 0; k < 7; k++) { const s = new THREE.Mesh(new THREE.SphereGeometry(.9, 20, 14), M({ color: c, roughness: .95 })); s.scale.set(1.3, .7, 1); s.position.set((k % 3 - 1) * .8, 2.7 + (k > 3 ? .3 : 0), ((k * 7) % 3 - 1) * .4); s.castShadow = true; g.add(s); }
      [-1.2, 1.2].forEach(dx => [-.8, .8].forEach(dz => { const w = new THREE.Mesh(new THREE.CylinderGeometry(.18, .18, .2, 14), M({ color: 0x111111 })); w.rotation.z = Math.PI / 2; w.position.set(dx, .2, dz); g.add(w); })); L.add(g); };
    mound(-9, 3, 0xe9e5dc); mound(-4, 6, 0xf1eee8); mound(8, 4, 0xe4dfd4);
    for (let i = 0; i < 3; i++) L.add(place(box(.4, 8, 3, 0x7d838b, { metal: .6, rough: .5 }), -17.5, 4, -3 + i * 5));

    // ---------- HOTEL ROOM ----------
    const H = new THREE.Group(); H.position.x = 40; scene.add(H);
    const carpet = canvasTex(256, 256, (x, w, h) => { x.fillStyle = '#3d3a3c'; x.fillRect(0, 0, w, h); for (let i = 0; i < 4000; i++) { x.fillStyle = `rgba(${rnd() > .5 ? 255 : 0},${rnd() > .5 ? 255 : 0},${rnd() > .5 ? 255 : 0},.035)`; x.fillRect(rnd() * w, rnd() * h, 2, 2); } }, [7, 5]);
    const hf = new THREE.Mesh(new THREE.PlaneGeometry(20, 15), M({ map: carpet, roughness: 1 })); hf.rotation.x = -Math.PI / 2; hf.receiveShadow = true; H.add(hf);
    H.add(place(box(20, 9, .4, 0xb9a88f, { rough: .95, metal: 0 }), 0, 4.5, -4.2)); H.add(place(box(.4, 9, 15, 0xb4a38a, { rough: .95, metal: 0 }), -10, 4.5, 3));
    H.add(place(box(20, .4, 15, 0xcfc6b6, { rough: 1, metal: 0 }), 0, 9, 3));
    const win = new THREE.Mesh(new THREE.PlaneGeometry(6, 6.5), M({ color: 0x0a0f18, emissive: 0x6d93c9, emissiveIntensity: .9 })); win.position.set(-9.75, 4.6, 3.5); win.rotation.y = Math.PI / 2; H.add(win);
    const moon = new THREE.PointLight(0x7fa3e0, 60, 20, 1.5); moon.position.set(-8, 5, 3.5); H.add(moon);
    const wood = canvasTex(256, 256, (x, w, h) => { x.fillStyle = '#4a3220'; x.fillRect(0, 0, w, h); for (let i = 0; i < 90; i++) { x.strokeStyle = `rgba(20,10,0,${.12 + rnd() * .2})`; x.beginPath(); x.moveTo(0, rnd() * h); x.bezierCurveTo(w * .3, rnd() * h, w * .6, rnd() * h, w, rnd() * h); x.stroke(); } });
    const wm = M({ map: wood, roughness: .55 });
    const head = new THREE.Mesh(new THREE.BoxGeometry(7.4, 4, .5), wm); head.position.set(0, 2.6, -3.7); head.castShadow = true; H.add(head);
    const base = new THREE.Mesh(new THREE.BoxGeometry(6.6, .6, 7.2), wm); base.position.set(0, .3, -.1); base.castShadow = true; H.add(base);
    H.add(place(box(6.4, .5, 7, 0xf2f0ec, { rough: .9, metal: 0 }), 0, .85, -.1));
    const fabricTex = (() => { const t = kit.weaveTexture('#ebe7de', '#d3cdc0', 28); t.colorSpace = THREE.SRGBColorSpace; t.repeat.set(26, 22); return t; })();
    const duvet = new THREE.Mesh(new RoundedBox(6.5, .45, 5.4, 6, .18), M({ map: fabricTex, bumpMap: fabricTex, bumpScale: .25, roughness: 1 })); duvet.position.set(0, 1.325, 1.0); duvet.castShadow = duvet.receiveShadow = true; H.add(duvet);
    const runner = new THREE.Mesh(new THREE.BoxGeometry(6.6, .47, 1.3), M({ color: 0x2c4a50, roughness: 1 })); runner.position.set(0, 1.33, 2.9); H.add(runner);
    [-1.6, 1.6].forEach(x => { const p = new THREE.Mesh(new RoundedBox(2.6, .6, 1.5, 6, .25), M({ color: 0xfbfaf7, roughness: .95 })); p.position.set(x, 1.8, -2.5); p.rotation.x = -.18; p.castShadow = true; H.add(p); });
    [-5, 5].forEach((x, i) => { const n = new THREE.Mesh(new THREE.BoxGeometry(1.8, 1.8, 1.8), wm); n.position.set(x, .9, -3.2); n.castShadow = true; H.add(n); const sh = cyl(.55, .8, 1, 0xf2e6cf, { emissive: 0xffc98a, ei: 1.4, rough: 1, metal: 0 }); sh.position.set(x, 2.5, -3.2); H.add(sh); const pl = new THREE.PointLight(0xffc88a, 26, 14, 1.6); pl.position.set(x, 2.6, -3); pl.castShadow = i === 0; H.add(pl); });
    const stainTex = canvasTex(512, 512, (x, w, h) => { const g = x.createRadialGradient(256, 256, 10, 256, 256, 230); g.addColorStop(0, 'rgba(120,70,20,.95)'); g.addColorStop(.55, 'rgba(150,95,35,.75)'); g.addColorStop(.85, 'rgba(170,120,60,.3)'); g.addColorStop(1, 'rgba(170,120,60,0)'); x.fillStyle = g; x.beginPath(); for (let a = 0; a < 6.283; a += .15) { const r = 205 + Math.sin(a * 3) * 28 + rnd() * 30; x.lineTo(256 + Math.cos(a) * r, 256 + Math.sin(a) * r * .85); } x.closePath(); x.fill(); x.globalCompositeOperation = 'source-atop'; for (let i = 0; i < 600; i++) { x.fillStyle = `rgba(80,40,0,${rnd() * .25})`; x.fillRect(rnd() * w, rnd() * h, 3, 3); } });
    const stain = new THREE.Mesh(new THREE.PlaneGeometry(1.5, 1.5), new THREE.MeshStandardMaterial({ map: stainTex, transparent: true, roughness: .5, polygonOffset: true, polygonOffsetFactor: -2 })); stain.rotation.x = -Math.PI / 2; stain.position.set(.9, 1.56, .6); H.add(stain);

    // ---------- INSIDE THE WASHER ----------
    const W = new THREE.Group(); W.position.x = 80; scene.add(W);
    const hole = canvasTex(256, 256, (x, w, h) => { x.fillStyle = '#9aa2aa'; x.fillRect(0, 0, w, h); x.fillStyle = '#2a2f35'; for (let i = 0; i < 16; i++) for (let j = 0; j < 16; j++) { x.beginPath(); x.arc(i * 16 + 8, j * 16 + 8, 3.2, 0, 6.3); x.fill(); } }, [10, 4]);
    const drum = new THREE.Group(); W.add(drum);
    const shell = new THREE.Mesh(new THREE.CylinderGeometry(3.6, 3.6, 8, 64, 1, true), M({ map: hole, metalness: .9, roughness: .35, side: THREE.BackSide })); shell.rotation.x = Math.PI / 2; drum.add(shell);
    for (let k = 0; k < 3; k++) { const rib = new THREE.Mesh(new THREE.BoxGeometry(.3, 1, 7.6), M({ color: 0xb9c0c8, metalness: .9, roughness: .3 })); const a = k * 2.094; rib.position.set(Math.cos(a) * 3.3, Math.sin(a) * 3.3, 0); rib.rotation.z = a; drum.add(rib); }
    const cloth = []; for (let k = 0; k < 8; k++) { const s = new THREE.Mesh(new THREE.SphereGeometry(1, 24, 16), M({ color: k === 0 ? 0xe9e1d2 : 0xf3f1ec, roughness: 1 })); s.scale.set(1.4 + rnd() * .5, .6, 1.1); s.position.set((rnd() - .5) * 3.2, -2.4 + rnd() * .6, -1 - rnd() * 2.8); s.userData.r = rnd() * 6; drum.add(s); cloth.push(s); }
    const stainInDrum = new THREE.Mesh(new THREE.CircleGeometry(.55, 24), new THREE.MeshStandardMaterial({ color: 0x7a4a18, roughness: .8 })); stainInDrum.position.set(.3, -1.38, 0); stainInDrum.rotation.x = -Math.PI / 2; drum.add(stainInDrum);
    const water = kit.particles(500, [6, 6, 7], .08, 0xbfd8ff, .55); W.add(water);
    const wl = new THREE.PointLight(0xdfeeff, 90, 18, 1.4); wl.position.set(0, 1.5, 3); W.add(wl);
    const wb = new THREE.PointLight(0xffe2b0, 40, 14, 1.4); wb.position.set(0, -1, -2); W.add(wb);

    return {
      update(u, t, s, dt) {
        const set = clamp(seg(u, 2.6, 3.4)); stain.material.color.setRGB(1 - set * .25, 1 - set * .3, 1 - set * .3);
        stain.scale.setScalar(.15 + .85 * ease(seg(u, 1.7, 2.5)));
        stain.material.opacity = 1 - ease(seg(u, 4.6, 5.0));
        drum.rotation.z = t * .5; stainInDrum.visible = u > 3.5; cloth.forEach(c => { c.rotation.y = t * .3 + c.userData.r; });
        const wp = water.geometry.attributes.position.array; for (let i = 0; i < wp.length; i += 3) { wp[i + 1] -= dt * 2.2; if (wp[i + 1] < -3) wp[i + 1] = 3; } water.geometry.attributes.position.needsUpdate = true;
      },
    };
  },
};
import { RoundedBoxGeometry as RoundedBox } from '../../vendor/addons/RoundedBoxGeometry.js';
