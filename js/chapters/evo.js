// CHAPTER: Evo for the small laundry.  Edit copy, defaults and cameras here.
import { pill } from '../engine.js';
import * as kit from '../kit.js';
const { THREE, PAL, box, cyl, place, seg, ease, clamp, lerp } = kit;

export default {
  id: 'evo', title: 'Laundry without the pump', accent: '#3b82ff', fog: [40, 170],

  // ---- numbers you can play with (Customize drawer). ASSUMPTIONS are ours, not data. ----
  controls: [
    { key: 'dose', label: 'Dose the shift lead pours (% of label)', min: 20, max: 200, step: 5, value: 60, fmt: v => v + '%', note: 'No pump = someone eyeballs it.' },
    { key: 'loads', label: 'Loads per week', min: 20, max: 1500, step: 10, value: 300, fmt: v => v, tag: 'assume', tagTxt: 'Pick a real operator.' },
    { key: 'liq', label: 'Liquid detergent cost per load', min: 0.05, max: 0.60, step: 0.01, value: 0.18, fmt: v => '$' + v.toFixed(2), tag: 'assume', tagTxt: 'Get a real P&G Professional price.' },
    { key: 'evo', label: 'Evo cost per load', min: 0.20, max: 0.90, step: 0.01, value: 0.48, fmt: v => '$' + v.toFixed(2), tag: 'public', tagTxt: 'About 48 cents a load at retail (Axios).' },
    { key: 'waste', label: 'Liquid wasted when poured by eye', min: 0, max: 60, step: 1, value: 20, fmt: v => v + '%', tag: 'assume', tagTxt: 'Measure it in a real laundry.' },
    { key: 'equip', label: 'Dosing system you no longer need', min: 0, max: 10000, step: 100, value: 2500, fmt: v => '$' + v.toLocaleString(), tag: 'assume', tagTxt: 'Get an install quote.' },
    { key: 'boxes', label: 'Evo boxes in the space of one jug', min: 1, max: 8, step: 1, value: 3, fmt: v => v, tag: 'assume', tagTxt: 'Measure a box vs a jug.' },
    { key: 'jugLoads', label: 'Loads per liquid jug', min: 20, max: 150, step: 5, value: 60, fmt: v => v, tag: 'assume' },
    { key: 'boxLoads', label: 'Loads per evo box', min: 10, max: 42, step: 1, value: 42, fmt: v => v, tag: 'public', tagTxt: '$5-$20 boxes, about 10-42 loads (Axios).' },
  ],

  scenes: [
    { big: 1, pos: 'c', align: 'b', kicker: 'The rooms', h: 'Two laundries.<br>One has a <em>pump.</em>', needs: ['D', 'E', 'G'],
      sub: 'A big hotel laundry has dosing pumps plumbed to the wall. A small one has a closet, a washer and a jug.',
      cam: { p: [0, 11, 34], l: [0, 2, 0] },
      pins: [{ at: [-14, 5, -4], t: 'Pumps + manifold: dose is automatic' }, { at: [16, 5.5, -3], t: 'Closet: someone eyeballs it' }],
      evidence: [['stated', 'P&G PRO host: closed-loop pumps mean staff never need to know the dilution.'], ['open', 'How many small operators have no pump? Ask P&G.']] },
    { pos: 'l', kicker: 'Zoom in', h: 'Grease<br>lodged in<br>the weave.', needs: ['B'],
      sub: 'Fly past the washers and into a single linen fiber. The stain is not sitting on top. It is wedged between the threads.',
      cam: { p: [-3, 1, -75], l: [-3, 0, -90] }, evidence: [['illus', 'A picture of the problem, not a microscope image.']] },
    { pos: 'l', kicker: 'The wash', h: 'The water<br>goes <em>around.</em>', needs: ['B', 'E'],
      sub: 'Water slides past the stain. Detergent has to reach it, in the right amount. With no pump, the dose is a guess.',
      cam: { p: [-1, 0.5, -79], l: [-3, 0, -90] },
      inline: [{ key: 'dose', label: 'Pour by eye', min: 20, max: 200, step: 5, fmt: v => v + '% of label' }],
      html: `<div class="read"><div><div class="n bad" data-bind="left">-</div><div class="l">Stain left</div></div><div><div class="n" data-bind="doseTag">-</div><div class="l">Dose verdict</div></div></div>`,
      evidence: [['illus', 'ILLUSTRATION. NOT TEST RESULTS. The curve is a cartoon of under- and over-dosing.']] },
    { pos: 'l', kicker: 'The idea', h: 'Drop a<br><strong>tile.</strong>', needs: ['D', 'E'],
      sub: 'Evo is a dry detergent tile. One tile per load. No pump, no pour, no guess. It dissolves in the drum and releases its fibers into the water.',
      cam: { p: [-3, 4, -79], l: [-3, 1.5, -90] }, evidence: [['public', 'Tide evo launched nationally in 2026 for consumers. There is no pro version that we found.']] },
    { pos: 'l', kicker: 'The result', h: 'Same stain.<br><strong>Gone.</strong>', needs: ['B'],
      sub: 'The goal: the operator gets a consistent dose without owning a dosing system.',
      cam: { p: [-3, 0, -80], l: [-3, 0, -90] }, evidence: [['illus', 'ILLUSTRATION. We have not seen PRO test data on evo for commercial linens.'], ['open', 'Does it beat liquid on hotel grease at commercial wash temps?']] },
    { pos: 'l', kicker: 'The closet', h: 'Where does<br>the jug <em>live?</em>', needs: ['D', 'G'],
      sub: 'Small operators fight for shelf space. A dry tile box may store differently than a heavy jug. We have not measured it.',
      html: `<div class="read"><div><div class="n" data-bind="slotLiq">-</div><div class="l">Loads per slot, liquid</div></div><div><div class="n acc" data-bind="slotEvo">-</div><div class="l">Loads per slot, evo</div></div></div>`,
      cam: { p: [44, 5, -75], l: [44, 3, -90] }, evidence: [['assume', 'Box and jug sizes are placeholders. Measure real ones.'], ['stated', 'Skyline owner: space is tight, so "stock more" fails.']] },
    { pos: 'l', kicker: 'The math', h: 'What would<br>have to be <strong>true.</strong>', needs: ['C', 'H'],
      sub: 'Evo may cost more per load than liquid. The case is no pump to buy, no mis-dosing, and a simpler closet. Move the numbers.',
      inline: [{ key: 'loads', label: 'Loads per week', min: 20, max: 1500, step: 10, fmt: v => v }, { key: 'equip', label: 'Dosing system avoided', min: 0, max: 10000, step: 100, fmt: v => '$' + v.toLocaleString() }, { key: 'waste', label: 'Liquid wasted by eye', min: 0, max: 60, step: 1, fmt: v => v + '%' }],
      html: `<div class="read"><div><div class="n" data-bind="extra">-</div><div class="l">Extra chemistry per year</div></div><div><div class="n good" data-bind="avoid">-</div><div class="l">Pump you skip, once</div></div><div><div class="n acc" data-bind="net5">-</div><div class="l">5-year net</div></div></div>`,
      cam: { p: [88, 6, -70], l: [88, 3, -90] }, evidence: [['assume', 'Every input except evo price is ours. Break-even is the point, not the answer.']] },
  ],

  logic: {
    title: 'Evo for the small laundry: the logic',
    who: 'Small hotels, gyms, spas and clinics that wash in-house with no dosing equipment.',
    gap: 'Pro detergents assume a pump. Without one, dosing is by eye, so results and cost vary.',
    idea: 'A pro version of a dry detergent tile: one tile per load, cold or warm water, no equipment, simple storage.',
    trueIf: ['Enough operators have no dosing system to be a market.', 'A tile cleans commercial linens (grease, body soils) at least as well as liquid.', 'Their cost per load, with less waste, is within reach of liquid.', 'Retail evo manufacturing can be adapted for PRO volumes.'],
    needsWhy: ['D, E: nothing to pump, nothing to train.', 'G: an offer for the segment the pump-based line skips.', 'B: only if dose consistency beats eyeballing.'],
    evidence: [['stated', 'Hosts: closed-loop pumps remove the need to know dilution.'], ['public', 'Retail evo about 48 cents a load; boxes $5-$20 (Axios).']],
    unknown: ['How many operators have no pump?', 'Commercial wash performance and temperature range.', 'Real cost per load vs liquid.', 'Whether PRO has the capacity to make a new form.'],
    why: 'PRO can borrow a retail form factor instead of inventing one, and aims at a group the pump lineup does not serve.',
    next: ['Call 3 small laundries: how do you dose today?', 'Ask P&G if evo has commercial test data.', 'Replace placeholders with real quotes.'],
    needs: ['D', 'E', 'G'], cam: { p: [88, 10, -58], l: [88, 3, -90] },
  },

  compute(s) {
    const left = 100 * (s.dose < 100 ? 0.95 - 0.5 * ((s.dose - 20) / 80) : 0.45);
    const waste = Math.max(0, (s.dose - 100) / 100);
    const liqYr = s.loads * 52 * s.liq * (1 + s.waste / 100), evoYr = s.loads * 52 * s.evo, extra = evoYr - liqYr;
    const $ = v => (v < 0 ? '-$' : '+$') + Math.abs(Math.round(v)).toLocaleString();
    return {
      left: Math.round(left) + '%', doseTag: s.dose < 80 ? 'Under' : s.dose > 130 ? 'Waste' : 'Near label',
      slotLiq: Math.round(s.jugLoads), slotEvo: Math.round(s.boxLoads * s.boxes),
      extra: $(extra), avoid: '$' + Math.round(s.equip).toLocaleString(), net5: $(s.equip - 5 * extra),
    };
  },

  build({ THREE, scene, state, kit }) {
    scene.add(kit.gridFloor(260, 60, -0.16));
    const mat = (c) => PAL[c] ?? c;
    const washer = (g, x, z) => {
      g.add(place(box(3, 3.4, 3, PAL.steel), x, 1.7, z));
      const ring = new THREE.Mesh(new THREE.TorusGeometry(0.95, 0.12, 8, 24), new THREE.MeshStandardMaterial({ color: PAL.line, flatShading: true }));
      ring.position.set(x, 1.8, z + 1.52); g.add(ring);
      g.add(place(cyl(0.9, 0.9, 0.1, PAL.ink, { edge: PAL.blue }, 20), x, 1.8, z + 1.5)).children.at(-1).rotation.x = Math.PI / 2;
    };
    // BIG ROOM
    const big = new THREE.Group(); big.position.x = -14; scene.add(big);
    big.add(place(box(20, 0.3, 13, PAL.panel), 0, -0.1, 0));
    big.add(place(box(20, 7, 0.3, PAL.panel, { opacity: 0.5 }), 0, 3.5, -6.5));
    for (let i = 0; i < 4; i++) { washer(big, -6.6 + i * 4.4, -3.4); big.add(place(cyl(0.12, 0.12, 3, PAL.blue, { edge: false }, 8), -6.6 + i * 4.4, 5, -5.4)); }
    const pipe = cyl(0.28, 0.28, 18, PAL.blue, { edge: false }, 10); pipe.rotation.z = Math.PI / 2; big.add(place(pipe, 0, 6.5, -5.4));
    for (let i = 0; i < 3; i++) big.add(place(cyl(0.9, 0.9, 1.9, PAL.white, { edge: PAL.blue }), -7 + i * 2.2, 1, 3.5));
    // CLOSET
    const cl = new THREE.Group(); cl.position.x = 16; scene.add(cl);
    cl.add(place(box(8, 0.3, 8, PAL.panel), 0, -0.1, 0));
    cl.add(place(box(8, 6.5, 0.3, PAL.panel, { opacity: .55 }), 0, 3.25, -4));
    cl.add(place(box(0.3, 6.5, 8, PAL.panel, { opacity: .55 }), -4, 3.25, 0));
    cl.add(place(box(0.3, 6.5, 8, PAL.panel, { opacity: .55 }), 4, 3.25, 0));
    washer(cl, -1.4, -2); cl.add(place(box(2.4, 0.2, 1.4, PAL.steel), 2, 3.4, -3.2)); cl.add(place(cyl(0.7, 0.7, 1.5, PAL.white, { edge: PAL.amber }), 2, 4.2, -3.2));

    // MACRO STAGE (fabric)
    const fab = kit.fabric({ w: 24, h: 14 }); fab.group.position.set(0, 0, -90); scene.add(fab.group);
    const tile = box(3.2, 0.5, 3.2, PAL.white, { edge: PAL.blue, edgeOpacity: 1 }); tile.position.set(0, 12, -88); scene.add(tile);
    const fib = kit.particles(260, [5, 5, 5], 0.1, 0xbfe4ff, 0.9); fib.position.set(0, 0.5, -88); fib.visible = false; scene.add(fib);

    // STORAGE STAGE
    const st = new THREE.Group(); st.position.set(44, 0, -90); scene.add(st);
    for (let i = 0; i < 3; i++) st.add(place(box(14, 0.3, 4, PAL.steel), 0, i * 3.5, 0));
    st.add(place(box(0.3, 7.6, 4, PAL.steel), -7, 3.5, 0)); st.add(place(box(0.3, 7.6, 4, PAL.steel), 7, 3.5, 0));
    st.add(place(cyl(1.5, 1.5, 3, PAL.white, { edge: PAL.amber }), -3.2, 1.8, 0)); st.add(place(cyl(0.5, 0.5, 0.5, PAL.amber, { edge: false }, 12), -3.2, 3.55, 0));
    const boxes = new THREE.Group(); boxes.position.set(3, 0.35, 0); st.add(boxes);
    const boxList = []; for (let i = 0; i < 8; i++) { const b = box(1.5, 0.9, 2.4, PAL.white, { edge: PAL.blue, edgeOpacity: 1 }); b.position.set((i % 4 - 1.5) * 1.7, 0.45 + Math.floor(i / 4) * 0.95, 0); boxes.add(b); boxList.push(b); }

    // BARS STAGE
    const bars = new THREE.Group(); bars.position.set(88, 0, -90); scene.add(bars);
    bars.add(place(box(18, 0.3, 6, PAL.panel), 0, -0.1, 0));
    const bar = (x, c) => { const b = box(3, 1, 3, c, { edge: PAL.white, edgeOpacity: .5 }); b.position.x = x; bars.add(b); return b; };
    const bLiq = bar(-5, PAL.grey), bEvo = bar(0, PAL.blue), bEq = bar(5, PAL.mint);

    return {
      update(u, t, s, dt) {
        const base = 0.95 - 0.5 * clamp(((s.dose < 100 ? s.dose : 100) - 20) / 80);
        const flow = clamp(seg(u, 1.4, 2.0)) * (1 - seg(u, 2.9, 3.3)); fab.flow = flow;
        fab.chemOn = seg(u, 2.9, 3.3) * (1 - seg(u, 4.4, 4.9));
        fab.amount = lerp(1, base, seg(u, 1.9, 2.5)) * (1 - ease(seg(u, 3.3, 3.95)));
        fab.group.rotation.y = Math.sin(t * .3) * 0.04;
        fab.update(t, dt);
        const drop = seg(u, 2.4, 3.0), dis = seg(u, 3.1, 3.7);
        tile.position.y = lerp(12, 1.0, ease(drop)); tile.scale.set(1 - dis * .9, 1 - dis * .7, 1 - dis * .9); tile.rotation.y = t * 0.6;
        tile.visible = u > 2.3 && dis < 0.98;
        fib.visible = dis > 0.02 && u < 4.9; if (fib.visible) { const p = fib.geometry.attributes.position.array; for (let i = 0; i < p.length; i += 3) { p[i] += Math.sin(t + i) * .004 + 0.01 * dis; p[i+1] += Math.cos(t * 1.3 + i) * .004; } fib.geometry.attributes.position.needsUpdate = true; fib.material.opacity = .9 * (1 - seg(u, 4.4, 5)); }
        boxList.forEach((b, i) => { b.visible = i < s.boxes; });
        const mx = Math.max(1, (s.loads * 52 * s.evo), (s.loads * 52 * s.liq * (1 + s.waste / 100)), s.equip);
        const H = v => Math.max(0.05, v / mx * 9);
        const set = (b, h) => { b.scale.y += (h - b.scale.y) * 0.12; b.position.y = b.scale.y / 2; };
        set(bLiq, H(s.loads * 52 * s.liq * (1 + s.waste / 100))); set(bEvo, H(s.loads * 52 * s.evo)); set(bEq, H(s.equip));
      },
    };
  },
};
