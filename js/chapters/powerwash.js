// CHAPTER: Power Wash station (the kitchen).  Edit copy, defaults and cameras here.
import * as kit from '../kit.js';
const { THREE, PAL, box, cyl, place, seg, ease, clamp, lerp, mix } = kit;

const ORDER = ['Spray', 'Wipe', 'Rinse', 'Sanitize'];
let done = []; let msg = 'Tap the steps in order.';
const noise = Array.from({ length: 72 }, (_, i) => 0.55 + 0.9 * Math.abs(Math.sin(i * 12.9898) * 43758.5453 % 1));

export default {
  id: 'powerwash', title: 'The Power Wash station', accent: '#3ddc97', fog: [60, 230],

  controls: [
    { key: 'soak', label: 'Hours a pan soaks in the sink', min: 0, max: 12, step: 1, value: 8, fmt: v => v + ' h', tag: 'stated', tagTxt: 'Overnight soaks described on our visits. Confirm the hours.' },
    { key: 'weeks', label: 'Weeks since the hood was deep cleaned', min: 0, max: 26, step: 1, value: 10, fmt: v => v + ' wk', tag: 'assume' },
    { key: 'base', label: 'Cost per rack today', min: 0.1, max: 1.5, step: 0.01, value: 0.45, fmt: v => '$' + v.toFixed(2), tag: 'assume', tagTxt: 'Placeholder. Get a real figure.' },
    { key: 'impr', label: 'Target improvement after six weeks', min: 0, max: 40, step: 1, value: 15, fmt: v => v + '%', tag: 'open', tagTxt: 'A goal to test, not a result.' },
  ],

  scenes: [
    { big: 1, pos: 'l', kicker: 'The rush', h: 'Lunch rush.<br>Sinks <em>full.</em>', needs: ['E', 'D'],
      sub: 'Every pan, tray and tool piles up in the sink. The line keeps moving. Cleaning waits.',
      cam: { p: [3, 11, 34], l: [1, 2.5, -2] }, evidence: [['illus', 'A scene from our visits, not a measurement.']] },
    { pos: 'l', kicker: 'The soak', h: 'Overnight,<br>the water <em>wins.</em>', needs: ['C', 'E'],
      html: `<div class="read"><div><div class="n bad" data-bind="soakH">-</div><div class="l">Sink tied up</div></div><div><div class="n bad" data-bind="shifts">-</div><div class="l">Shifts of sink time</div></div></div>`,
      inline: [{ key: 'soak', label: 'Soak time', min: 0, max: 12, step: 1, fmt: v => v + ' h' }],
      sub: 'Soaking is the default fix. It ties up the sink and the water turns to grease soup.',
      cam: { p: [3, 5, 12], l: [1, 2.5, -1] }, evidence: [['stated', 'Kitchen hosts described soaking pans overnight. Hours are ours to confirm.']] },
    { pos: 'l', kicker: 'Clean in place', h: 'Where grease<br><em>hides.</em>', needs: ['B', 'E'],
      sub: 'A slicer, a mixer, a fryer: parts that should not be soaked. Pull it apart and the dirt is in the seams.',
      cam: { p: [38, 6, 16], l: [41, 3, 0] }, pins: [{ at: [41, 4.9, 0], t: 'Blade edge' }, { at: [37, 2.5, 0], t: 'Carriage track' }, { at: [45, 5, 3], t: 'Guard seam' }],
      evidence: [['illus', 'Generic equipment. Not a specific machine.']] },
    { pos: 'l', kicker: 'The hood', h: 'The slow<br>fire <em>risk.</em>', needs: ['B', 'H'],
      html: `<div class="read"><div><div class="n bad" data-bind="red">-</div><div class="l">Filter cells in the red</div></div><div><div class="n" data-bind="wk">-</div><div class="l">Since deep clean</div></div></div>`,
      inline: [{ key: 'weeks', label: 'Weeks since clean', min: 0, max: 26, step: 1, fmt: v => v + ' wk' }],
      sub: 'Grease builds quietly in the vent filters. Drag the weeks and watch it heat up. It is a hidden cost until it is not.',
      cam: { p: [72, 5, 22], l: [74, 5, 0] }, evidence: [['illus', 'ILLUSTRATION. The heat pattern is a cartoon, not a measurement.'], ['open', 'What do inspectors actually flag? Ask Cincy Cooks hosts.']] },
    { pos: 'l', kicker: 'The station', h: 'Four steps.<br>One <strong>order.</strong>', needs: ['E', 'G'],
      html: `<div class="chips" id="steps">${ORDER.map(s => `<button class="chip" data-step="${s}">${s}</button>`).join('')}</div><div class="read"><div><div class="n acc" data-bind="stepMsg" style="font-size:26px;line-height:1.1">-</div></div></div>`,
      sub: 'A wall station with one bottle, one cloth, one card. Staff do not read labels; the order is on the card. Try it.',
      cam: { p: [116, 6, 16], l: [118, 2.5, 0] }, evidence: [['stated', 'Hosts: color-coded bottles and closed-loop dispensing so staff do not read labels.'], ['open', 'Does the sanitize step need its own product?']] },
    { pos: 'l', kicker: 'Every six weeks', h: 'The visit that<br>shows <strong>cost per rack.</strong>', needs: ['A', 'H', 'C'],
      html: `<div class="read"><div><div class="n" data-bind="now">-</div><div class="l">Cost per rack, week 1</div></div><div><div class="n good" data-bind="goal">-</div><div class="l">Goal, week 6</div></div></div>`,
      inline: [{ key: 'base', label: 'Cost per rack today', min: 0.1, max: 1.5, step: 0.01, fmt: v => '$' + v.toFixed(2) }, { key: 'impr', label: 'Target improvement', min: 0, max: 40, step: 1, fmt: v => v + '%' }],
      sub: 'The technician visit already happens. Put a scorecard in it: the number the buyer cares about, in one chart.',
      cam: { p: [152, 8, 28], l: [152, 3, 0] }, pins: [{ at: [150.5, 8, 0], t: 'Week 1' }, { at: [165.5, 3.5, 0], t: 'Week 6' }],
      evidence: [['stated', 'Skyline: a technician visits about every six weeks. Buyer metric is cost per rack.'], ['illus', 'ILLUSTRATION. Placeholder bars, not results.']] },
  ],

  logic: {
    title: 'The Power Wash station: the logic',
    who: 'Independent kitchens and franchisees with small crews and tight sinks.',
    gap: 'Soaking and ad-hoc cleaning tie up labor and miss grease buildup that hides in equipment and vents.',
    idea: 'A wall station built around a retail cleaner: one bottle, one card, one order, plus a six-week scorecard in the service visit.',
    trueIf: ['The retail formula works on commercial grease at pro frequency.', 'Staff follow a four-step card.', 'The scorecard shows a cost-per-rack buyers trust.', 'A pro pack can be filled from existing retail production.'],
    needsWhy: ['E: nothing to read, one order to follow.', 'B: fewer missed spots.', 'H: the scorecard makes value visible.'],
    evidence: [['stated', 'Hosts: staff do not read labels; the order should be obvious.'], ['public', 'Power Wash exists as a retail product.']],
    unknown: ['Is the formula strong enough for commercial grease?', 'Regulatory fit for food contact surfaces.', 'Whether PRO already sells a kitchen version.'],
    why: 'Smallest lift of the five: reuses a retail product and an existing service visit.',
    next: ['Confirm with PRO what already sells to kitchens.', 'Shadow a closing cleaning shift.', 'Draw the card and test it with real staff.'],
    needs: ['E', 'B', 'H'], cam: { p: [154, 12, 30], l: [154, 3, 0] },
  },

  compute(s) {
    const red = noise.filter(n => clamp(s.weeks / 14 * n) > 0.66).length;
    const d = (s.base).toFixed(2), g = (s.base * (1 - s.impr / 100)).toFixed(2);
    return { soakH: s.soak + ' h', shifts: (s.soak / 8).toFixed(1), red: red + ' / 72', wk: s.weeks + ' wk', stepMsg: msg, now: '$' + d, goal: '$' + g };
  },

  build({ THREE, scene, state, kit }) {
    scene.add(kit.gridFloor(400, 60, -0.16));
    // KITCHEN
    const k = new THREE.Group(); scene.add(k);
    k.add(place(box(24, 0.3, 12, PAL.panel), 0, -0.1, 0));
    k.add(place(box(24, 8, 0.3, PAL.panel, { opacity: .5 }), 0, 4, -6));
    k.add(place(box(10, 3.2, 3, PAL.steel), 6, 1.6, -3.5)); k.add(place(box(6, 3.2, 3, PAL.steel), -7, 1.6, -3.5));
    const sinks = []; for (let i = 0; i < 3; i++) { const w = box(2.8, 0.2, 2.2, PAL.blue, { edge: false, opacity: .85 }); w.position.set(-1.2 + i * 3.2 + 1, 3.25, -3.5); k.add(w); sinks.push(w); }
    for (let i = 0; i < 9; i++) k.add(place(cyl(0.9, 0.9, 0.35 + (i % 3) * 0.1, PAL.grey, { edge: PAL.white }), -7 + (i % 3) * 1.3, 3.55 + Math.floor(i / 3) * 0.4, -3.6));
    k.add(place(box(3, 3.4, 2.4, PAL.steel), -10, 1.7, 2)); k.add(place(box(6, 0.4, 2.4, PAL.line, { edge: false }), 6, 3.6, 2));
    // SLICER (exploded view)
    const sl = new THREE.Group(); sl.position.set(41, 0, 0); scene.add(sl);
    sl.add(place(box(14, 0.3, 8, PAL.panel), 0, -0.1, 0));
    const parts = [
      { m: box(7, 1.4, 4, PAL.steel), b: [0, 1.2, 0], d: [0, -1.4, 0] },
      { m: box(2, 1.6, 6, PAL.line), b: [-2.6, 2.7, 0], d: [-3.2, 0, 0] },
      { m: cyl(2, 2, 0.2, PAL.white, { edge: PAL.mint }, 32), b: [0.5, 3.4, 0], d: [0, 2.4, 0], rx: Math.PI / 2 },
      { m: box(0.4, 3.2, 3.2, PAL.amber, { edge: false }), b: [3.6, 3.0, 0], d: [3.6, 0, 3] },
      { m: cyl(0.5, 0.5, 1, PAL.mint, { edge: false }, 10), b: [-3.2, 1.2, 2.5], d: [0, 0, 3.4] },
    ];
    parts.forEach(p => { if (p.rx) p.m.rotation.x = p.rx; sl.add(p.m); });
    // HOOD HEATMAP
    const hood = new THREE.Group(); hood.position.set(80, 0, 0); scene.add(hood);
    hood.add(place(box(16, 0.3, 6, PAL.panel), 0, -0.1, 0)); hood.add(place(box(14, 0.8, 3, PAL.steel), 0, 9.8, 0));
    const cells = new THREE.InstancedMesh(new THREE.BoxGeometry(1.05, 1.05, 0.3), new THREE.MeshStandardMaterial({ flatShading: false, roughness: .6 }), 72);
    const dm = new THREE.Object3D();
    for (let i = 0; i < 72; i++) { dm.position.set((i % 12 - 5.5) * 1.2, 2.5 + Math.floor(i / 12) * 1.2, 0); dm.updateMatrix(); cells.setMatrixAt(i, dm.matrix); cells.setColorAt(i, new THREE.Color(0x3ddc97)); }
    hood.add(cells);
    // STATION
    const st = new THREE.Group(); st.position.set(120, 0, 0); scene.add(st);
    st.add(place(box(14, 0.3, 8, PAL.panel), 0, -0.1, 0)); st.add(place(box(10, 6, 0.4, PAL.steel), 0, 3.5, -2));
    const cubes = ORDER.map((_, i) => { const c = box(1.8, 1.8, 0.6, PAL.line, { edge: PAL.white }); c.position.set(-3.6 + i * 2.4, 3.6, -1.6); st.add(c); return c; });
    st.add(place(cyl(0.45, 0.45, 1.6, PAL.mint, { edge: PAL.white }, 12), 4.2, 1.2, -1.5));
    // SCORECARD BARS
    const sc = new THREE.Group(); sc.position.set(158, 0, 0); scene.add(sc);
    sc.add(place(box(18, 0.3, 6, PAL.panel), 0, -0.1, 0));
    const wb = Array.from({ length: 6 }, (_, i) => { const b = box(2, 1, 2.4, PAL.mint, { edge: PAL.white, edgeOpacity: .4 }); b.position.x = -7.5 + i * 3; sc.add(b); return b; });

    // step puzzle interaction
    document.addEventListener('click', e => {
      const b = e.target.closest && e.target.closest('[data-step]'); if (!b) return;
      const s = b.dataset.step, next = ORDER[done.length];
      if (s === next) { done.push(s); msg = done.length === 4 ? 'Done. Spray, wipe, rinse, sanitize.' : 'Good. Next: ' + ORDER[done.length]; }
      else { done = []; msg = 'Out of order. The card says ' + ORDER[0] + ' first.'; }
      document.querySelectorAll('[data-step]').forEach(c => c.classList.toggle('on', done.includes(c.dataset.step)));
    });

    return {
      update(u, t, s, dt) {
        const bad = clamp(s.soak / 8), soup = mix(0x3b82ff, 0x6b4a22, bad);
        sinks.forEach(w => { w.mesh.material.color.copy(soup); w.position.y = 3.25 + Math.sin(t + w.position.x) * 0.02; });
        const e = ease(seg(u, 1.7, 2.4)) * (1 - ease(seg(u, 2.8, 3.2)));
        parts.forEach(p => p.m.position.set(p.b[0] + p.d[0] * e, p.b[1] + p.d[1] * e, p.b[2] + p.d[2] * e));
        sl.rotation.y = Math.sin(t * .4) * .25 * e;
        const heat = clamp(s.weeks / 14);
        for (let i = 0; i < 72; i++) { const v = clamp(heat * noise[i]); const c = v < .5 ? mix(0x3ddc97, 0xffb020, v / .5) : mix(0xffb020, 0xff3b30, (v - .5) / .5); cells.setColorAt(i, c); }
        cells.instanceColor.needsUpdate = true;
        cubes.forEach((c, i) => { const on = done.includes(ORDER[i]); c.mesh.material.color.set(on ? PAL.mint : PAL.line); c.mesh.material.emissive.set(on ? PAL.mint : 0); c.mesh.material.emissiveIntensity = on ? .6 : 0; });
        const mx = s.base, set = (b, h) => { b.scale.y += (h - b.scale.y) * .12; b.position.y = b.scale.y / 2; };
        wb.forEach((b, i) => { const v = s.base * (1 - (s.impr / 100) * (i / 5)); set(b, Math.max(.05, v / Math.max(0.01, s.base) * 7)); b.mesh.material.color.copy(mix(PAL.amber, PAL.mint, i / 5)); });
      },
    };
  },
};
