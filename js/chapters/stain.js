// CHAPTER: Stain at the source ("The 11 a.m. checkout").  Edit copy, defaults and cameras here.
import * as kit from '../kit.js';
const { THREE, PAL, box, cyl, place, seg, ease, clamp, lerp, mix } = kit;

export default {
  id: 'stain', title: 'The 11 a.m. checkout', accent: '#ffb020', fog: [50, 190],

  controls: [
    { key: 'hours', label: 'Hours between stain and wash', min: 1, max: 48, step: 1, value: 14, fmt: v => v + ' h', tag: 'assume', tagTxt: 'Ask a housekeeping lead how long.' },
    { key: 'rooms', label: 'Rooms in the hotel', min: 20, max: 600, step: 10, value: 120, fmt: v => v },
    { key: 'occ', label: 'Occupancy', min: 30, max: 95, step: 1, value: 70, fmt: v => v + '%' },
    { key: 'rate', label: 'Stain events per occupied night', min: 0.5, max: 10, step: 0.5, value: 3, fmt: v => v + '%', tag: 'assume', tagTxt: 'Unknown. Ask hotels.' },
    { key: 'discard', label: 'Stained linens discarded if untreated', min: 5, max: 70, step: 1, value: 30, fmt: v => v + '%', tag: 'assume', tagTxt: 'Hosts said more than half of linens are discarded for stains; confirm.' },
    { key: 'linen', label: 'Cost of one linen item', min: 8, max: 120, step: 1, value: 35, fmt: v => '$' + v, tag: 'assume' },
    { key: 'recover', label: 'Discards avoided by treating at the bed', min: 0, max: 100, step: 5, value: 50, fmt: v => v + '%', tag: 'open', tagTxt: 'This is the whole bet. Test it.' },
    { key: 'treat', label: 'Cost per treatment (spray)', min: 0.02, max: 1, step: 0.01, value: 0.15, fmt: v => '$' + v.toFixed(2), tag: 'assume' },
  ],

  scenes: [
    { big: 1, pos: 'l', kicker: 'Midnight', h: 'A stain<br>lands at<br><em>11:52 p.m.</em>', needs: ['B', 'H'],
      sub: 'Room service. A late snack. Grease on the duvet. The guest sleeps. Nobody is going to treat it tonight.',
      cam: { p: [6, 9, 18], l: [2, 2.2, 0] }, evidence: [['illus', 'A scene, not a case study.']] },
    { pos: 'l', kicker: 'Morning', h: 'The cart<br>bags it.', needs: ['D', 'E'],
      sub: 'The housekeeper strips the bed fast, bags the linen and moves to the next room. The stain goes in the bag with everything else.',
      cam: { p: [12, 6, 14], l: [13, 2, 0] }, evidence: [['open', 'Do housekeepers already pre-treat? Ask three hotels.']] },
    { pos: 'l', kicker: 'The clock', h: 'Every hour,<br>it <em>sets.</em>', needs: ['B'],
      html: `<div class="read"><div><div class="n bad" data-bind="age">-</div><div class="l">Time stain waits</div></div></div>`,
      inline: [{ key: 'hours', label: 'Hours until the wash', min: 1, max: 48, step: 1, fmt: v => v + ' h' }],
      sub: 'Down the chute, into the cart, onto a pallet, into the queue. The longer it waits, the deeper it sets.',
      cam: { p: [24, 6, 16], l: [27, 5, 0] }, evidence: [['assume', 'The idea that waiting makes stains harder is common knowledge. Our hours are placeholders.']] },
    { pos: 'l', kicker: 'The wash', h: 'Too late<br>for the <em>wash.</em>', needs: ['B'],
      sub: 'By the time it reaches the washer, the stain is lodged in the fibers. Standard wash chemistry has to guess. Many of these linens never come back.',
      cam: { p: [-1, 0.5, -78], l: [-3, 0, -90] }, evidence: [['stated', 'P&G PRO staff: more than half of linens are discarded for stains. Unverified.']] },
    { pos: 'l', kicker: 'The pile', h: 'The real<br>cost is <em>linen.</em>', needs: ['C', 'H'],
      html: `<div class="read"><div><div class="n bad" data-bind="disc">-</div><div class="l">Items thrown out per year</div></div><div><div class="n bad" data-bind="discCost">-</div><div class="l">Linen replaced per year</div></div></div>`,
      inline: [{ key: 'rooms', label: 'Rooms', min: 20, max: 600, step: 10, fmt: v => v }, { key: 'rate', label: 'Stain events per night', min: 0.5, max: 10, step: 0.5, fmt: v => v + '%' }],
      sub: 'Detergent is a small line. Replacing sheets is a big one. Nobody connects the two.',
      cam: { p: [30, 8, -72], l: [33, 2, -90] }, evidence: [['assume', 'All inputs are placeholders. Plug in a real hotel.']] },
    { pos: 'l', kicker: 'Rewind', h: 'Spray it<br>at the <strong>bed.</strong>', needs: ['E', 'D'],
      sub: 'Same housekeeper, same cart, one extra step: a quick spray of a pre-treat before the linen is bagged. Treat it while it is fresh.',
      cam: { p: [-4, 7, 14], l: [1, 2.2, 0] }, evidence: [['public', 'Power Wash is already sold as a laundry pre-treat; the new idea is the cart workflow and the linen-life story.'], ['open', 'Would housekeepers actually do it? Test with a real team.']] },
    { pos: 'l', kicker: 'The GM view', h: 'Chemistry is the<br><strong>small</strong> bar.', needs: ['C', 'H'],
      html: `<div class="read"><div><div class="n good" data-bind="saved">-</div><div class="l">Linen saved per year</div></div><div><div class="n" data-bind="chem">-</div><div class="l">Pre-treat spend</div></div><div><div class="n acc" data-bind="net">-</div><div class="l">Net per year</div></div></div>`,
      inline: [{ key: 'recover', label: 'Discards avoided', min: 0, max: 100, step: 5, fmt: v => v + '%' }, { key: 'linen', label: 'Cost per linen item', min: 8, max: 120, step: 1, fmt: v => '$' + v }],
      sub: 'The cost goes in one column. The value comes out of another. Show the GM both.',
      cam: { p: [66, 8, 26], l: [66, 3, 0] }, pins: [{ at: [67, 9.5, 0], t: 'Linen lost' }, { at: [72, 9.5, 0], t: 'Linen saved' }, { at: [77, 2, 0], t: 'Pre-treat spend' }],
      evidence: [['assume', 'Whole panel runs on our placeholders.']] },
  ],

  logic: {
    title: 'Stain at the source: the logic',
    who: 'Hotel housekeeping leads and GMs, who pay for linen replacement but buy chemistry separately.',
    gap: 'Stains set while linens wait for the wash. The wash chemistry is judged on a problem it can no longer fix.',
    idea: 'A treat-at-the-bed workflow: a spray on the housekeeping cart, a simple step, and a linen-life dashboard for the GM.',
    trueIf: ['Housekeepers will add a 10-second step.', 'Treating fresh stains avoids a meaningful share of discards.', 'The spray costs far less than the linen it saves.', 'A GM sees the linen number next to the chemistry number.'],
    needsWhy: ['B: better results because it acts earlier.', 'H: makes the value visible to the buyer.', 'C: cost-in-use includes linen, not just detergent.'],
    evidence: [['stated', 'P&G PRO staff: over half of discarded linens are tossed for stains. Unverified.'], ['public', 'Power Wash is already marketed as a laundry pre-treat.']],
    unknown: ['Discard rate and stain rate in real hotels.', 'Housekeeper time per room and willingness.', 'Whether this is a product, a program or both.'],
    why: 'It reuses an existing retail product and aims PRO at the value it creates, not the price per gallon.',
    next: ['Shadow a housekeeping team for a day.', 'Ask a laundry manager for monthly discard counts.', 'Mock up the GM dashboard.'],
    needs: ['B', 'C', 'H'], cam: { p: [68, 12, 28], l: [68, 3, 0] },
  },

  compute(s) {
    const events = s.rooms * (s.occ / 100) * 365 * (s.rate / 100);
    const disc = events * (s.discard / 100), discCost = disc * s.linen;
    const saved = discCost * (s.recover / 100), chem = events * s.treat, net = saved - chem;
    const $ = v => (v < 0 ? '-$' : '$') + Math.abs(Math.round(v)).toLocaleString();
    return { age: s.hours + ' h', disc: Math.round(disc).toLocaleString(), discCost: $(discCost), saved: $(saved), chem: $(chem), net: (net < 0 ? '-$' : '+$') + Math.abs(Math.round(net)).toLocaleString() };
  },

  build({ THREE, scene, state, kit }) {
    scene.add(kit.gridFloor(260, 60, -0.16));
    // HOTEL ROOM
    const room = new THREE.Group(); scene.add(room);
    room.add(place(box(16, 0.3, 11, PAL.panel), 0, -0.1, 0));
    room.add(place(box(16, 7.5, 0.3, PAL.panel, { opacity: .55 }), 0, 3.7, -5.5));
    room.add(place(box(0.3, 7.5, 11, PAL.panel, { opacity: .45 }), -8, 3.7, 0));
    room.add(place(box(5.4, 1.1, 6.4, PAL.steel), 0, 0.6, -1.5));
    room.add(place(box(5.6, 0.7, 4.6, PAL.white), 0, 1.5, 0));
    room.add(place(box(2, 0.5, 1.2, PAL.white), -1.3, 1.6, -3.7), place(box(2, 0.5, 1.2, PAL.white), 1.3, 1.6, -3.7));
    room.add(place(box(1.6, 1.8, 1.6, PAL.steel), -5, 0.9, -3.8)); room.add(place(box(1.6, 1.8, 1.6, PAL.steel), 5, 0.9, -3.8));
    const stain = new THREE.Mesh(new THREE.CylinderGeometry(1, 1, 0.06, 28), new THREE.MeshStandardMaterial({ color: PAL.amber, flatShading: true }));
    stain.position.set(0.7, 1.88, 0.6); stain.scale.set(1.3, 1, 0.9); room.add(stain);
    const cart = new THREE.Group(); cart.position.set(13, 0, 0); scene.add(cart);
    cart.add(place(box(3.4, 0.2, 1.8, PAL.steel), 0, 1.2, 0)); [-1.5, 1.5].forEach(x => [-0.7, 0.7].forEach(z => cart.add(place(cyl(0.15, 0.15, 1.2, PAL.line, { edge: false }, 8), x, 0.6, z))));
    const bag = place(box(2.6, 2, 1.4, PAL.white, { edge: PAL.amber, edgeOpacity: .9 }), 0, 2.3, 0); cart.add(bag);
    // CHUTE + CLOCK
    const chute = cyl(1.1, 1.1, 12, PAL.steel, { opacity: .35, edge: PAL.line }); chute.position.set(24, 6, 0); scene.add(chute);
    const wsh = box(3.4, 3.4, 3.4, PAL.steel); wsh.position.set(24, 1.7, 0); scene.add(wsh);
    const ball = new THREE.Mesh(new THREE.SphereGeometry(0.5, 14, 10), new THREE.MeshStandardMaterial({ color: PAL.amber, flatShading: true })); scene.add(ball);
    const clock = new THREE.Group(); clock.position.set(30, 6, 0); scene.add(clock);
    const face = cyl(3, 3, 0.4, PAL.panel, { edge: PAL.amber }, 40); face.rotation.x = Math.PI / 2; clock.add(face);
    const hand = box(0.22, 2.5, 0.2, PAL.amber, { edge: false }); hand.position.z = 0.35; const hp = new THREE.Group(); hp.add(hand); hand.position.y = 1.25; hp.position.z = 0.3; clock.add(hp);
    // FABRIC + PILE
    const fab = kit.fabric({ w: 24, h: 14 }); fab.group.position.set(0, 0, -90); scene.add(fab.group);
    const pile = new THREE.Group(); pile.position.set(33, 0, -90); scene.add(pile);
    pile.add(place(box(16, 0.3, 10, PAL.panel), 0, -0.1, 0));
    const items = []; for (let i = 0; i < 90; i++) { const b = box(1.6, 0.35, 1.2, PAL.white, { edge: PAL.red, edgeOpacity: .9 }); const k = i % 15, l = Math.floor(i / 15); b.position.set((k % 5 - 2) * 1.9 + Math.sin(i) * .3, 0.2 + l * .42, (Math.floor(k / 5) - 1) * 1.6); b.rotation.y = Math.sin(i * 3) * .5; pile.add(b); items.push(b); }
    // SPRAY
    const bottle = new THREE.Group(); room.add(bottle);
    bottle.add(place(cyl(0.55, 0.55, 2, PAL.mint, { edge: PAL.white }, 14), 0, 0, 0)); bottle.add(place(box(0.9, 0.6, 0.5, PAL.white), 0.25, 1.2, 0)); bottle.add(place(box(1.1, 0.25, 0.3, PAL.white), 0.7, 1.35, 0));
    const mist = kit.particles(140, [0.01, 0.01, 0.01], 0.12, 0xbffff0, 0.9); room.add(mist);
    const mseed = Array.from({ length: 140 }, () => [Math.random(), (Math.random() - .5), (Math.random() - .5)]);
    // BARS
    const bars = new THREE.Group(); bars.position.set(72, 0, 0); scene.add(bars);
    bars.add(place(box(16, 0.3, 6, PAL.panel), 0, -0.1, 0));
    const mk = (x, c) => { const b = box(3, 1, 3, c, { edge: PAL.white, edgeOpacity: .5 }); b.position.x = x; bars.add(b); return b; };
    const bLost = mk(-5, PAL.amber), bSaved = mk(0, PAL.mint), bChem = mk(5, PAL.blue);

    return {
      update(u, t, s, dt) {
        const age = clamp(s.hours / 48);
        // room stain: lands, then rewinds to treat
        stain.scale.setScalar(0.001 + 1 * clamp(seg(u, -0.1, 0.5)) * (1 - ease(seg(u, 4.6, 5.3))));
        stain.scale.y = 1; stain.material.color.copy(mix(PAL.amber, 0x6b4a22, u > 1.5 && u < 4 ? age : 0));
        stain.visible = u < 5.4 || true;
        bag.material && null;
        // chute ball falls with u in [1.4, 2.4]
        const fall = ease(seg(u, 1.3, 2.3)); ball.position.set(24, lerp(11.5, 2.2, fall), 0); ball.visible = u > 1.2 && u < 3.1; ball.material.color.copy(mix(PAL.amber, 0x4a3a28, age * clamp(seg(u, 1.8, 2.8))));
        hp.rotation.z = -(s.hours / 24) * Math.PI * 2 * clamp(seg(u, 1.6, 2.6)) - t * 0.05;
        // fabric: stain aged
        fab.age = age; fab.flow = seg(u, 2.6, 3.1) * (1 - seg(u, 3.7, 4.1)); fab.amount = 1; fab.chemOn = 0; fab.sunk = 1; fab.update(t, dt);
        // pile
        const c = ch0(s).disc; const vis = Math.round(clamp(c / 6, 0, 90) * seg(u, 3.4, 4.0)); items.forEach((b, i) => { b.visible = i < vis; });
        // spray
        const show = seg(u, 4.2, 4.7) * (1 - seg(u, 5.4, 5.7)); bottle.visible = show > .01; bottle.position.set(1.6, lerp(7, 3.6, ease(seg(u, 4.2, 4.8))), 2.4); bottle.rotation.z = 0.6;
        const mp = mist.geometry.attributes.position.array; const on = seg(u, 4.7, 5.0) * (1 - seg(u, 5.2, 5.5)); mist.visible = on > .01; mist.material.opacity = .9 * on;
        for (let i = 0; i < 140; i++) { const ph = (t * 1.1 + i / 140) % 1, sd = mseed[i]; mp[i*3] = 2.4 - ph * 1.8 + sd[1] * ph; mp[i*3+1] = 4.0 - ph * 2.0 + sd[2] * ph * .8; mp[i*3+2] = 2.5 - ph * 1.7 + sd[2] * ph; }
        mist.geometry.attributes.position.needsUpdate = true;
        // bars
        const cc = ch0(s); const mx = Math.max(cc.discCostN, 1);
        const H = v => Math.max(0.05, v / mx * 9);
        const set = (b, h) => { b.scale.y += (h - b.scale.y) * 0.12; b.position.y = b.scale.y / 2; };
        set(bLost, H(cc.discCostN)); set(bSaved, H(cc.savedN)); set(bChem, H(cc.chemN));
      },
    };
  },
};

function ch0(s) {
  const events = s.rooms * (s.occ / 100) * 365 * (s.rate / 100), disc = events * (s.discard / 100), discCostN = disc * s.linen;
  return { disc, discCostN, savedN: discCostN * (s.recover / 100), chemN: events * s.treat };
}
