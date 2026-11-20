// CHAPTER: Towel autopsy.  Edit copy, soil mixes, defaults here. THE SOIL MIXES ARE PLACEHOLDERS.
import * as kit from '../kit.js';
const { THREE, PAL, box, place, seg, ease, clamp, lerp, mix } = kit;

const SOILS = [['oils', 'Oils & lotion', 0xffd166], ['sweat', 'Sweat & salts', 0x7ad7f0], ['skin', 'Skin cells', 0xe8c9b0], ['cos', 'Cosmetics & pigment', 0xff7ab6], ['bio', 'Biological', 0xff5a4f]];
// ILLUSTRATIVE share of soil by segment. Replace with real data. Rows sum to 1.
const SHARES = { spa: [.40, .10, .20, .25, .05], gym: [.15, .45, .25, .05, .10], health: [.10, .10, .25, .05, .50] };
const SEGS = [['spa', 'Spa'], ['gym', 'Gym'], ['health', 'Healthcare']];

export default {
  id: 'towel', title: 'Towel autopsy', accent: '#c58cff', fog: [30, 120],

  controls: [
    { key: 'seg', label: 'Segment', type: 'select', value: 'spa', options: SEGS, note: 'Changes the soil mix on the towel.' },
    ...SOILS.map(s => ({ key: 'h_' + s[0], label: 'How well detergents handle: ' + s[1], min: 1, max: 5, step: 1, value: 3, fmt: v => v + ' / 5', tag: 'open', tagTxt: 'Set from P&G data. 3 = we do not know.' })),
  ],

  scenes: [
    { big: 1, pos: 'l', kicker: 'The towel', h: 'A towel is<br>a sponge for<br><em>everything.</em>', needs: ['G', 'B'],
      sub: 'Hotels, spas, gyms, clinics. The same terry cloth, very different dirt.',
      cam: { p: [-15, 0.5, 24], l: [-15, 0, 0] }, evidence: [['illus', 'A picture of the idea, not a lab image.']] },
    { pos: 'l', kicker: 'The layers', h: 'What is<br>in the <em>loops?</em>', needs: ['G'],
      html: `<div class="chips">${SEGS.map(s => `<button class="chip" data-seg="${s[0]}">${s[1]}</button>`).join('')}</div><div class="row" style="gap:14px">${SOILS.map(s => `<span class="pill" style="border-color:#${s[2].toString(16).padStart(6, '0')}"><b style="color:#${s[2].toString(16).padStart(6, '0')}">${s[1]}</b></span>`).join('')}</div>`,
      sub: 'Pick a segment. The soil mix changes: oils at a spa, salts at a gym, biological soils in a clinic.',
      cam: { p: [-15, 2, 20], l: [-15, 0, 0] }, evidence: [['open', 'Soil mixes are placeholders. Needs P&G R&D or a real towel analysis.']] },
    { pos: 'l', kicker: 'The scoreboard', h: 'How well do<br>we <em>clean</em> each?', needs: ['B', 'G'],
      sub: 'Score each soil from 1 to 5 in Customize. We do not know yet. The weakest one will light up.',
      html: `<div class="read"><div><div class="n bad" data-bind="weak">-</div><div class="l">Weakest soil (your scores)</div></div></div>`,
      cam: { p: [31, 8, 26], l: [31, 3, 0] }, evidence: [['stated', 'P&G staff said body soils may be a gap against a competitor. Unverified, no numbers used here.'], ['open', 'We need the real scores.']] },
    { pos: 'l', kicker: 'The gap', h: 'Find the<br>one nobody<br><em>built for.</em>', needs: ['B', 'G'],
      sub: 'The opportunity is where a soil is common in a segment and weakly handled. That is the product brief.',
      html: `<div class="read"><div><div class="n acc" data-bind="opp">-</div><div class="l">Biggest opportunity here</div></div></div>`,
      cam: { p: [30, 6, 22], l: [30, 3, 0] }, evidence: [['illus', 'The math is real. The inputs are placeholders.']] },
    { pos: 'l', kicker: 'The brief', h: 'A booster for<br>the <strong>soil,</strong> not<br>the brand.', needs: ['G', 'E'],
      sub: 'A segment-matched booster: one add-in that targets the soil that segment struggles with. Same wash, different problem solved.',
      cam: { p: [-15, 1, 22], l: [-15, 0, 0] }, evidence: [['open', 'Least evidenced of the five. Treat as a research question first.']] },
  ],

  logic: {
    title: 'Towel autopsy: the logic',
    who: 'Operators who wash towels in-house: spas, gyms, clinics, hotels.',
    gap: 'Towel soils differ by segment, but detergents are positioned for linens in general.',
    idea: 'Analyze the soils on real towels by segment, find the weakest spot in P&G performance, and design a matched booster.',
    trueIf: ['Soil mix differs enough by segment to matter.', 'There is a real performance gap on some soil.', 'A booster can fix it without changing the base product.', 'Segments are big enough to serve separately.'],
    needsWhy: ['G: segment-specific offer.', 'B: reliable performance on the soil that matters.', 'E: simple add-in.'],
    evidence: [['stated', 'P&G staff pointed to a body-soils gap versus a competitor. Unverified.'], ['illus', 'All soil mixes here are placeholders.']],
    unknown: ['Real soil mixes by segment.', 'Real P&G scores by soil.', 'Whether a booster beats a better base formula.'],
    why: 'Uses PRO speed to answer a research question retail never had to ask.',
    next: ['Ask P&G R&D for soil-by-soil performance.', 'Collect used towels from three segments.', 'Decide if this is a product or a study.'],
    needs: ['G', 'B'], cam: { p: [-12, 5, 28], l: [-12, 0, 0] },
  },

  compute(s) {
    const sh = SHARES[s.seg];
    const h = SOILS.map(x => s['h_' + x[0]]);
    const min = Math.min(...h); const weakIdx = h.indexOf(min);
    const allSame = h.every(v => v === h[0]);
    const opp = sh.map((v, i) => v * (6 - h[i])); const best = opp.indexOf(Math.max(...opp));
    return { weak: allSame ? 'Not scored yet' : SOILS[weakIdx][1], opp: allSame ? SOILS[sh.indexOf(Math.max(...sh))][1] + ' (most common)' : SOILS[best][1] };
  },

  build({ THREE, scene, state, kit }) {
    scene.add(kit.gridFloor(200, 60, -6));
    // TERRY LOOPS
    const COLS = 24, ROWS = 14, N = COLS * ROWS;
    const loops = new THREE.InstancedMesh(new THREE.TorusGeometry(0.3, 0.11, 6, 10), new THREE.MeshStandardMaterial({ color: 0x4b566b, flatShading: true, roughness: .95 }), N);
    const dm = new THREE.Object3D();
    for (let i = 0; i < N; i++) { const x = (i % COLS - COLS / 2) * 0.72 + (Math.floor(i / COLS) % 2) * .2, y = (Math.floor(i / COLS) - ROWS / 2) * 0.72; dm.position.set(x - 8, y, Math.sin(i * 1.7) * .1); dm.rotation.set(Math.sin(i) * .5, Math.cos(i * 2) * .5, i); dm.updateMatrix(); loops.setMatrixAt(i, dm.matrix); }
    scene.add(loops);
    // SOIL PARTICLES, one layer per soil
    const layers = SOILS.map((s, k) => { const p = kit.particles(600, [17, 10, 0.01], 0.3, s[2], 1); p.position.set(-8, 0, 0.5 + k * 0.12); p.geometry.setDrawRange(0, 0); scene.add(p); return p; });
    const seeds = layers.map(p => Array.from({ length: 600 }, () => (Math.random() - .5)));
    // BARS
    const bars = new THREE.Group(); bars.position.set(38, 0, 0); scene.add(bars);
    bars.add(place(box(20, 0.3, 6, PAL.panel), 0, -0.1, 0));
    const bs = SOILS.map((s, i) => { const b = box(2.4, 1, 2.4, s[2], { edge: PAL.white, edgeOpacity: .4 }); b.position.x = -8 + i * 4; bars.add(b); return b; });
    const pinsHolder = null;

    document.addEventListener('click', e => { const b = e.target.closest && e.target.closest('[data-seg]'); if (!b) return; state.seg = b.dataset.seg; try { const k = 'pgpro:towel:state'; localStorage.setItem(k, JSON.stringify(state)); } catch {} document.querySelectorAll('select[data-k="seg"]').forEach(s => s.value = state.seg); });

    return {
      update(u, t, s, dt) {
        const sh = SHARES[s.seg]; const show = seg(u, 0.6, 1.2) * (1 - seg(u, 2.0, 2.6)) + seg(u, 3.6, 4.0) * (1 - seg(u, 4.6, 5));
        layers.forEach((p, k) => {
          const target = Math.round(sh[k] * 900); const cur = p.geometry.drawRange.count; const goal = Math.round(target * clamp(show));
          p.geometry.setDrawRange(0, cur + Math.sign(goal - cur) * Math.min(Math.abs(goal - cur), 40));
          if (!p.userData.init) { const a = p.geometry.attributes.position.array; for (let i = 0; i < 600; i++) { a[i * 3] = seeds[k][i] * 17; a[i * 3 + 1] = (Math.random() - .5) * 10; a[i * 3 + 2] = 0; } p.geometry.attributes.position.needsUpdate = true; p.userData.init = 1; }
          p.position.z = 0.5 + k * 0.12 + Math.sin(t * .7 + k) * .05;
        });
        document.querySelectorAll('[data-seg]').forEach(c => c.classList.toggle('on', c.dataset.seg === s.seg));
        loops.rotation.y = Math.sin(t * .2) * .03;
        const h = SOILS.map(x => s['h_' + x[0]]); const mn = Math.min(...h); const all = h.every(v => v === h[0]);
        const oppV = sh.map((v, i) => v * (6 - h[i])); const best = oppV.indexOf(Math.max(...oppV));
        bs.forEach((b, i) => { const hh = h[i] * 1.7; b.scale.y += (hh - b.scale.y) * .12; b.position.y = b.scale.y / 2;
          const hot = !all && (u < 3.5 ? h[i] === mn : i === best); b.mesh.material.emissive.set(hot ? PAL.red : 0); b.mesh.material.emissiveIntensity = hot ? .8 : 0; });
      },
    };
  },
};
