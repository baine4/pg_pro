// HUB: the front door. Edit the one-line logic for each idea here.
import * as kit from '../kit.js';
import { NEEDS, PRODUCTS } from '../data.js';
const { THREE, PAL, box, cyl, place, seg, clamp } = kit;

const COPY = {
  evo: ['Evo for the small laundry', 'Operators without a dosing pump pour by eye. A dry tile gives them a consistent dose with no equipment.', 'Retail form factor, new PRO customer.'],
  'stain-at-source': ['Stain at the source', 'Stains set while linens wait. Treat them at the bed, and show the GM the linen they saved.', 'Existing retail pre-treat, new workflow.'],
  'power-wash-station': ['The Power Wash station', 'A wall station, one bottle and a four-step card, plus a cost-per-rack scorecard in the six-week visit.', 'Smallest lift of the five.'],
  'towel-autopsy': ['Towel autopsy', 'Towels carry different soils by segment. Find the one nobody built for, then build a matched booster.', 'A research question first. Least evidence.'],
  'chemistry-at-install': ['Chemistry at the install', 'The first fill decides the supplier. Be in the room with a kit, a no-lock-in contract and a service cadence.', 'Copies what worked at one customer.'],
};
const needsFor = p => NEEDS.filter((n, i) => p.r[i] >= 4).map(n => n.id);

export default {
  id: 'hub', title: 'Five concepts for P&G PRO', accent: '#3b82ff', home: true, fog: [40, 200],
  controls: [],
  scenes: [
    { big: 1, pos: 'l', kicker: 'Capstone concepts', h: 'Five ideas<br>PRO hasn\'t<br><em>tried.</em>', needs: [],
      sub: 'Each one is a scroll through the customer\'s day: where it breaks, what we would change, and the numbers that would have to be true. Scroll to meet them.',
      cam: { p: [48, 10, 62], l: [48, 1, 0] }, evidence: [['illus', 'Concepts from an OSU capstone. Not P&G products or plans.']] },
    ...PRODUCTS.map((p, i) => ({
      pos: 'l', big: 0, kicker: `Idea ${i + 1} · ${p.filter.join(' · ')}`, h: COPY[p.slug][0].replace(' ', '<br>'), needs: needsFor(p),
      sub: COPY[p.slug][1],
      html: `<div class="row"><a class="btn on" href="${p.slug}/">Enter the experience &rarr;</a></div><div class="sub" style="font-size:14px;color:var(--dim)">${COPY[p.slug][2]}</div>`,
      cam: { p: [i * 24 - 7, 4, 17], l: [i * 24 - 7, 1.5, 0] },
    })),
    { pos: 'l', kicker: 'Compare', h: 'Which one<br>goes <strong>first?</strong>', needs: ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'],
      sub: 'Score all five against our eight user needs. Change the weights. See how the ranking moves.',
      html: `<div class="row"><a class="btn on" href="scorecard/">Open the scorecard &rarr;</a></div>`,
      cam: { p: [48, 14, 56], l: [48, 1, 0] }, evidence: [['assume', 'Ratings are one teammate\'s first draft. The team sets the real ones.']] },
  ],
  build({ THREE, scene, kit }) {
    scene.add(kit.gridFloor(400, 100, -0.2));
    const objs = [];
    const mk = (i, g) => { g.position.x = i * 24; scene.add(g); objs.push(g); return g; };
    // evo tile stack
    { const g = new THREE.Group(); g.add(place(box(4, 0.7, 4, PAL.white, { edge: PAL.blue, edgeOpacity: 1 }), 0, 1.2, 0), place(box(4, 0.7, 4, PAL.white, { edge: PAL.blue, edgeOpacity: 1 }), 0.3, 2.0, 0.2)); mk(0, g); }
    // stain: bed + amber blob
    { const g = new THREE.Group(); g.add(place(box(6, 1, 7, PAL.steel), 0, 0.5, 0), place(box(6.2, 0.6, 5, PAL.white), 0, 1.3, 0.5)); const s = new THREE.Mesh(new THREE.CylinderGeometry(1, 1, .06, 24), new THREE.MeshStandardMaterial({ color: PAL.amber })); s.position.set(0.8, 1.65, 0.8); s.scale.set(1.2, 1, .9); g.add(s); mk(1, g); }
    // spray bottle
    { const g = new THREE.Group(); g.add(place(cyl(1.1, 1.1, 3.6, PAL.mint, { edge: PAL.white }, 16), 0, 1.8, 0), place(cyl(0.5, 0.5, 0.8, PAL.white, { edge: PAL.white }, 12), 0, 4, 0), place(box(1.8, 0.7, 0.6, PAL.white), 0.7, 4.7, 0)); mk(2, g); }
    // towel (loops)
    { const g = new THREE.Group(); const im = new THREE.InstancedMesh(new THREE.TorusGeometry(0.22, 0.09, 6, 10), new THREE.MeshStandardMaterial({ color: 0x7e8aa3, flatShading: false }), 96); const d = new THREE.Object3D(); for (let i = 0; i < 96; i++) { d.position.set((i % 12 - 5.5) * .55, 1.5 + (Math.floor(i / 12) - 3.5) * .55, 0); d.rotation.set(Math.sin(i) * .6, Math.cos(i) * .6, i); d.updateMatrix(); im.setMatrixAt(i, d.matrix); } g.add(im); mk(3, g); }
    // machine crate
    { const g = new THREE.Group(); g.add(place(box(5, 4.4, 4, PAL.white, { edge: PAL.cyan, edgeOpacity: 1 }), 0, 2.4, 0), place(box(6, 0.4, 5, PAL.steel), 0, 0.2, 0)); mk(4, g); }
    return { update(u, t) { objs.forEach((g, i) => { g.rotation.y = t * 0.4 + i; g.position.y = Math.sin(t + i) * 0.25; }); } };
  },
};
