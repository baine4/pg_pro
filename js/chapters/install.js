// CHAPTER: Chemistry at the install.  Edit copy, defaults and cameras here.
import * as kit from '../kit.js';
const { THREE, PAL, box, cyl, place, seg, ease, clamp, lerp, mix } = kit;

export default {
  id: 'install', title: 'Be in the room when the machine arrives', accent: '#5ce1ff', fog: [60, 260],

  controls: [
    { key: 'notice', label: 'Contract notice to leave', type: 'select', value: '6', options: [['6', 'Competitor: 6 months (evergreen)'], ['2', 'No lock-in: 60 days']], note: 'Competitor evergreen clauses and 60-day outs were described on our visit.' },
    { key: 'cadence', label: 'Weeks between service visits', min: 2, max: 12, step: 1, value: 6, fmt: v => v + ' wk', tag: 'stated', tagTxt: 'Skyline: about every six weeks.' },
    { key: 'locs', label: 'Locations in the buying group', min: 1, max: 350, step: 1, value: 40, fmt: v => v, tag: 'assume', tagTxt: 'Co-op size to confirm. 350 is our upper bound.' },
    { key: 'cases', label: 'Cases per location per week', min: 0.01, max: 0.4, step: 0.01, value: 0.05, fmt: v => v.toFixed(2), tag: 'assume', tagTxt: 'Placeholder. Measure real use.' },
    { key: 'gate', label: 'Cases per week a distributor needs to stock', min: 1, max: 12, step: 1, value: 5, fmt: v => v, tag: 'stated', tagTxt: 'Skyline co-op lead: about 5 cases a week.' },
    { key: 'price', label: 'Machine type', type: 'select', value: '4000', options: [['4000', 'Low-temp: about $4,000'], ['6500', 'High-temp: about $6,000-$7,000']], tag: 'stated', tagTxt: 'Rough prices said aloud by the co-op lead. Confirm.' },
    { key: 'fee', label: 'Lease fee per month', min: 20, max: 300, step: 5, value: 85, fmt: v => '$' + v, tag: 'assume', tagTxt: 'Our placeholder.' },
  ],

  scenes: [
    { big: 1, pos: 'l', kicker: 'Delivery day', h: 'The machine<br>arrives <em>today.</em>', needs: ['A', 'G'],
      sub: 'A new dish machine lands on the dock. Somebody decides what chemistry goes in it before the truck leaves.',
      cam: { p: [0, 8, 30], l: [-5, 2, 0] }, evidence: [['stated', 'Skyline owner found P&G through a person, not media.'], ['open', 'Who actually decides: owner, distributor, installer?']] },
    { pos: 'l', kicker: 'The window', h: 'A short<br>window to be<br><em>chosen.</em>', needs: ['A', 'F'],
      sub: 'The decision gets made fast, and the incumbent is already on the dock. Distributors carry house programs and do not push PRO.',
      html: `<div class="read"><div><div class="n bad" data-bind="win">-</div><div class="l">Decision window (placeholder)</div></div></div>`,
      cam: { p: [-4, 7, 22], l: [-8, 2, 0] }, evidence: [['assume', 'The window length is a placeholder.'], ['stated', 'Skyline: distributors carry house programs and do not push PRO.']] },
    { pos: 'l', kicker: 'The chain', h: 'Try to <em>leave.</em>', needs: ['A', 'B'],
      sub: 'Competitor contracts can run evergreen, with six months to get out. P&G did not hold Skyline to one. Pick a contract and count the links.',
      html: `<div class="read"><div><div class="n bad" data-bind="exit">-</div><div class="l">Time to exit</div></div></div>`,
      cam: { p: [36, 5, 18], l: [40, 3, 0] }, evidence: [['stated', 'Skyline owner: competitor contracts carry evergreen clauses needing six months notice; P&G did not.']] },
    { pos: 'l', kicker: 'First fill', h: 'The box that<br>fits the <strong>machine.</strong>', needs: ['G', 'E', 'H'],
      sub: 'Low-temp and high-temp machines need different chemistry. Ship a first-fill kit by machine type, with color-coded bottles and the SDS binder already handled.',
      cam: { p: [78, 7, 18], l: [82, 3, 0] }, pins: [{ at: [80, 5, 0], t: 'Detergent' }, { at: [83, 5.5, 0], t: 'Rinse aid' }, { at: [86, 5, 0], t: 'Sanitizer + test strips' }],
      evidence: [['stated', 'Hosts: the right bundle depends on machine type; SDS handled for them is valued.']] },
    { pos: 'l', kicker: 'Then, every few weeks', h: 'A visit<br>that <strong>keeps it.</strong>', needs: ['B', 'H'],
      html: `<div class="read"><div><div class="n good" data-bind="visits">-</div><div class="l">Visits per year</div></div></div>`,
      inline: [{ key: 'cadence', label: 'Weeks between visits', min: 2, max: 12, step: 1, fmt: v => v + ' wk' }],
      sub: 'The service visit is the retention engine. Skyline said support was the make-or-break question before switching.',
      cam: { p: [116, 6, 24], l: [120, 3, 0] }, evidence: [['stated', 'Skyline: a technician visits about every six weeks; lost service would make them leave.']] },
    { pos: 'l', kicker: 'The co-op', h: 'One<br>becomes <strong>350.</strong>', needs: ['A', 'D', 'F'],
      html: `<div class="read"><div><div class="n acc" data-bind="cpw">-</div><div class="l">Cases per week, whole group</div></div><div><div class="n" data-bind="gate">-</div><div class="l">Distributor stocking gate</div></div></div>`,
      inline: [{ key: 'locs', label: 'Locations', min: 1, max: 350, step: 1, fmt: v => v }, { key: 'cases', label: 'Cases / location / week', min: 0.01, max: 0.4, step: 0.01, fmt: v => v.toFixed(2) }],
      sub: 'One independent cannot clear a distributor stocking minimum. A group can. Slide the locations and watch the gate.',
      cam: { p: [152, 14, 30], l: [156, 0, 0] }, evidence: [['stated', 'Distributors stock items that turn about 5 cases a week; the co-op lead plans to recruit more groups.'], ['assume', 'Cases per location is a placeholder.']] },
    { pos: 'l', kicker: 'The offer', h: 'Buy it, or<br><strong>lease</strong> it.', needs: ['C', 'A'],
      html: `<div class="read"><div><div class="n" data-bind="buy">-</div><div class="l">Buy, one time</div></div><div><div class="n acc" data-bind="lease5">-</div><div class="l">Lease, 5 years</div></div><div><div class="n good" data-bind="be">-</div><div class="l">Break-even</div></div></div>`,
      inline: [{ key: 'fee', label: 'Lease fee per month', min: 20, max: 300, step: 5, fmt: v => '$' + v }],
      sub: 'A lease with a chemistry commitment lowers the entry price. What the fee should be is what P&G would have to know.',
      cam: { p: [192, 8, 26], l: [196, 3, 0] }, evidence: [['stated', 'Co-op lead: rough machine prices.'], ['assume', 'Lease fee is ours. P&G does not lease machines that we know of.']] },
  ],

  logic: {
    title: 'Chemistry at the install: the logic',
    who: 'Independent restaurants and franchisees buying or replacing a dish machine, and the co-ops that serve them.',
    gap: 'The first fill decides the supplier for years, and the incumbent is already on the dock.',
    idea: 'A first-fill kit by machine type, a no-lock-in contract, a six-week service cadence and, for groups, a bundle that clears the stocking gate.',
    trueIf: ['PRO can get into the install decision.', 'A no-lock-in offer is a selling point, not a risk.', 'Groups can reach the distributor gate.', 'A lease or bundle does not break unit economics.'],
    needsWhy: ['A: a path into the buyer at the moment of choice.', 'G: right kit per machine.', 'H: SDS and visits make value visible.'],
    evidence: [['stated', 'Skyline: found P&G through a person; no lock-in; service visits every six weeks.'], ['stated', 'Co-op lead: stocking gate about 5 cases a week; machine prices.']],
    unknown: ['Who decides at install.', 'Real case volume per location.', 'Whether PRO can lease or finance machines.'],
    why: 'It copies what already worked at Skyline, but at the point where the supplier is chosen.',
    next: ['Ask the co-op who is in the room on install day.', 'Draft a first-fill kit by machine type.', 'Model a lease with P&G finance.'],
    needs: ['A', 'G', 'H'], cam: { p: [192, 12, 30], l: [196, 3, 0] },
  },

  compute(s) {
    const cpw = s.locs * s.cases, price = +s.price, lease5 = s.fee * 60;
    return { win: '5 min', exit: s.notice === '6' ? '6 months' : '60 days', visits: (52 / s.cadence).toFixed(1), cpw: cpw.toFixed(1), gate: cpw >= s.gate ? 'Cleared' : 'Not yet (' + s.gate + ')', buy: '$' + price.toLocaleString(), lease5: '$' + lease5.toLocaleString(), be: Math.round(price / s.fee) + ' mo' };
  },

  build({ THREE, scene, state, kit }) {
    scene.add(kit.gridFloor(500, 60, -0.16));
    // DOCK
    const dock = new THREE.Group(); scene.add(dock);
    dock.add(place(box(26, 0.3, 14, PAL.panel), 0, -0.1, 0));
    dock.add(place(box(12, 7, 5, PAL.steel, { opacity: .7 }), 8, 3.5, -5));
    const machine = place(box(4, 4.5, 3.5, PAL.white, { edge: PAL.blue, edgeOpacity: 1 }), -4, 2.4, 1); dock.add(machine);
    dock.add(place(box(5, 0.4, 4, PAL.steel), -4, 0.2, 1));
    const jug = place(cyl(0.9, 0.9, 2.2, PAL.red, { edge: PAL.white }), 2.5, 1.2, 3); dock.add(jug); dock.add(place(cyl(0.9, 0.9, 2.2, PAL.red, { edge: PAL.white }), 4, 1.2, 3.2));
    const clock = new THREE.Group(); clock.position.set(7, 8.5, -2); dock.add(clock);
    const ringBg = new THREE.Mesh(new THREE.TorusGeometry(1.6, 0.12, 8, 48), new THREE.MeshStandardMaterial({ color: PAL.line })); clock.add(ringBg);
    const ring = new THREE.Mesh(new THREE.TorusGeometry(1.6, 0.18, 8, 48, Math.PI * 2), new THREE.MeshStandardMaterial({ color: PAL.cyan, emissive: PAL.cyan, emissiveIntensity: .5 })); clock.add(ring);
    // CHAIN
    const ch = new THREE.Group(); ch.position.set(40, 0, 0); scene.add(ch);
    ch.add(place(box(24, 0.3, 8, PAL.panel), 0, -0.1, 0));
    const links = Array.from({ length: 6 }, (_, i) => { const l = new THREE.Mesh(new THREE.TorusGeometry(1.1, 0.28, 8, 20), new THREE.MeshStandardMaterial({ color: PAL.line, flatShading: true, metalness: .4 })); l.position.set(-9 + i * 3.2, 3, 0); l.rotation.y = i % 2 ? Math.PI / 2 : 0; ch.add(l); return l; });
    ch.add(place(box(1, 5, 1, PAL.steel), -12, 2.5, 0)); ch.add(place(box(1, 5, 1, PAL.steel), 12, 2.5, 0));
    // KIT
    const kitG = new THREE.Group(); kitG.position.set(80, 0, 0); scene.add(kitG);
    kitG.add(place(box(14, 0.3, 8, PAL.panel), 0, -0.1, 0));
    kitG.add(place(box(10, 2.4, 5, PAL.steel, { opacity: .8 }), 2.5, 1.2, 0));
    const items = [[PAL.blue, 0, 'det'], [PAL.mint, 3, 'rinse'], [PAL.amber, 6, 'san']].map(([c, dx]) => { const b = cyl(0.8, 0.8, 2.4, c, { edge: PAL.white }, 14); b.position.set(dx - 0.5, 2.5, 0); kitG.add(b); return b; });
    const binder = place(box(1.6, 2.2, 0.6, PAL.white, { edge: PAL.cyan }), 9, 3.2, 0); kitG.add(binder);
    // VISITS
    const vis = new THREE.Group(); vis.position.set(120, 0, 0); scene.add(vis);
    vis.add(place(box(26, 0.3, 5, PAL.panel), 0, -0.1, 0));
    const marks = Array.from({ length: 26 }, (_, i) => { const m = cyl(0.35, 0.35, 1, PAL.cyan, { edge: false }, 10); m.position.x = -12 + i * 1; m.position.y = .5; vis.add(m); return m; });
    // MAP
    const map = new THREE.Group(); map.position.set(156, 0, 0); scene.add(map);
    const dots = new THREE.InstancedMesh(new THREE.CylinderGeometry(0.35, 0.35, 0.5, 8), new THREE.MeshStandardMaterial({ flatShading: true }), 350);
    const pos = Array.from({ length: 350 }, (_, i) => { const a = i * 2.399963, r = Math.sqrt(i + 1) * 1.15; return [Math.cos(a) * r * 1.35, Math.sin(a) * r * .8]; });
    const d = new THREE.Object3D();
    // BUY VS LEASE
    const bl = new THREE.Group(); bl.position.set(196, 0, 0); scene.add(bl);
    bl.add(place(box(16, 0.3, 6, PAL.panel), 0, -0.1, 0));
    const bBuy = box(3, 1, 3, PAL.grey, { edge: PAL.white, edgeOpacity: .4 }); bBuy.position.x = -3; bl.add(bBuy);
    const bLease = box(3, 1, 3, PAL.cyan, { edge: PAL.white, edgeOpacity: .4 }); bLease.position.x = 3; bl.add(bLease);
    map.add(dots);

    return {
      update(u, t, s, dt) {
        machine.position.y = 2.4 + Math.sin(t) * .05;
        const w = clamp(seg(u, 1, 2)); ring.geometry.dispose(); ring.geometry = new THREE.TorusGeometry(1.6, 0.18, 8, 48, Math.PI * 2 * (1 - w * .9)); ring.rotation.z = Math.PI / 2;
        ring.material.color.copy(mix(PAL.cyan, PAL.red, w)); ring.material.emissive.copy(ring.material.color);
        jug.position.y = 1.2 + 0.1 * Math.sin(t * 2) * seg(u, 1, 1.6);
        const n = +s.notice, lit = clamp(seg(u, 2, 2.6)) * 6;
        links.forEach((l, i) => { l.visible = n === 6 || i < 2; l.material.color.set(i < lit ? PAL.red : PAL.line); });
        items.forEach((b, i) => { b.position.y = 2.5 + ease(seg(u, 2.9 + i * .08, 3.4 + i * .08)) * 3 + Math.sin(t + i) * .1; });
        binder.position.y = 3.2 + ease(seg(u, 3.1, 3.6)) * 3;
        const per = s.cadence; marks.forEach((m, i) => { const hit = (i * 2) % per < 2; m.scale.y = hit ? 4 : 0.5; m.position.y = m.scale.y / 2; m.mesh.material.color.set(hit ? PAL.cyan : PAL.line); });
        const lit2 = Math.round(s.locs); const clear = s.locs * s.cases >= s.gate;
        for (let i = 0; i < 350; i++) { const p = pos[i]; d.position.set(p[0], p[1] + 8, 0); d.rotation.x = Math.PI / 2; const on = i < lit2; d.scale.setScalar(on ? 1 : .5); d.updateMatrix(); dots.setMatrixAt(i, d.matrix); dots.setColorAt(i, on ? new THREE.Color(clear ? PAL.mint : PAL.cyan) : new THREE.Color(PAL.steel)); }
        dots.instanceMatrix.needsUpdate = true; dots.instanceColor.needsUpdate = true;
        const mx = Math.max(+s.price, s.fee * 60), set = (b, h) => { b.scale.y += (h - b.scale.y) * .12; b.position.y = b.scale.y / 2; };
        set(bBuy, +s.price / mx * 9); set(bLease, s.fee * 60 / mx * 9);
      },
    };
  },
};
