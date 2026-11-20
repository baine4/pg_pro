// SCORECARD: live scoring of the five concepts. Ratings live in js/data.js (PRODUCTS). Edit there for new defaults.
import * as kit from '../kit.js';
import { NEEDS, PRODUCTS, WEIGHT_FEAS } from '../data.js';
const { THREE, PAL, box, place, clamp } = kit;

const controls = [];
NEEDS.forEach(n => controls.push({ key: 'w_' + n.id, label: `Weight: ${n.id} ${n.name}`, min: 0, max: 40, step: 0.5, value: n.w, fmt: v => v + '%', note: n.id === 'A' ? 'From our pairwise comparison. Change to test.' : undefined }));
controls.push({ key: 'wf', label: 'Feasibility share of total score', min: 0, max: 50, step: 1, value: WEIGHT_FEAS, fmt: v => v + '%' });
controls.push({ key: 'combine', label: 'Show "all five together" column', type: 'toggle', value: true });
PRODUCTS.forEach(p => { NEEDS.forEach((n, i) => controls.push({ key: `r_${p.slug}_${i}`, hidden: true, value: p.r[i] })); controls.push({ key: `f_${p.slug}`, hidden: true, value: p.f }); });

const cols = [...PRODUCTS.map(p => ({ slug: p.slug, name: p.name })), { slug: 'all', name: 'All five together' }];
const rate = (s, slug, i) => slug === 'all' ? Math.max(...PRODUCTS.map(p => +s[`r_${p.slug}_${i}`])) : +s[`r_${slug}_${i}`];
const feas = (s, slug) => slug === 'all' ? Math.min(...PRODUCTS.map(p => +s['f_' + p.slug])) : +s['f_' + slug];
export const score = (s, slug) => {
  const ws = NEEDS.map(n => +s['w_' + n.id]); const sw = ws.reduce((a, b) => a + b, 0) || 1;
  const need = NEEDS.reduce((a, n, i) => a + ws[i] * rate(s, slug, i) / 5, 0) / sw;
  return need * (100 - s.wf) + (s.wf) * feas(s, slug) / 5;
};

const sel = k => `<select data-k="${k}">${[1, 2, 3, 4, 5].map(v => `<option value="${v}">${v}</option>`).join('')}</select>`;
const table = `<div class="tbl"><table>
  <tr><th></th>${cols.map(c => `<th class="${c.slug === 'all' ? 'allc' : ''}">${c.name}</th>`).join('')}</tr>
  ${NEEDS.map((n, i) => `<tr><td class="rl"><b>${n.id}</b> ${n.name} <span class="wv" data-val="w_${n.id}"></span></td>${PRODUCTS.map(p => `<td>${sel(`r_${p.slug}_${i}`)}</td>`).join('')}<td class="allc"><span data-bind="all_${i}"></span></td></tr>`).join('')}
  <tr><td class="rl"><b>Feasibility</b> <span class="wv" data-val="wf"></span></td>${PRODUCTS.map(p => `<td>${sel('f_' + p.slug)}</td>`).join('')}<td class="allc"><span data-bind="all_f"></span></td></tr>
  <tr class="tot"><td class="rl">Score (0-100)</td>${cols.map(c => `<td class="${c.slug === 'all' ? 'allc' : ''}"><span data-bind="s_${c.slug}"></span></td>`).join('')}</tr>
</table></div>`;

export default {
  id: 'scorecard', title: 'Scorecard', accent: '#5ce1ff', fog: [40, 160], controls,
  scenes: [
    { big: 1, pos: 'l', kicker: 'Compare', h: 'Which one<br>goes <em>first?</em>', needs: NEEDS.map(n => n.id),
      sub: 'Weights come from our pairwise ranking of the eight user needs. Ratings are one teammate\'s first draft. Change them as a team.',
      cam: { p: [-9, 12, 44], l: [-9, 3, 0] }, evidence: [['assume', 'Every rating is a draft judgment, not data.']] },
    { pos: 'c', align: 'c', kicker: 'Score them', h: 'Rate each idea 1 to 5.', needs: NEEDS.map(n => n.id), html: table,
      cam: { p: [0, 12, 34], l: [0, 2, 0] }, evidence: [['assume', 'Weights: Customize to change. 1 = weak, 5 = strong. Feasibility: 5 = easiest for a lean PRO.']] },
    { pos: 'l', kicker: 'The ranking', h: 'Leader:<br><strong data-bind="leader">-</strong>', needs: NEEDS.map(n => n.id),
      html: `<div class="read"><div><div class="n acc" data-bind="gap">-</div><div class="l">Lead over second place</div></div></div>`,
      sub: 'A small lead means the ratings, not the math, are doing the work. Test the weights: does the winner survive?',
      cam: { p: [-9, 12, 44], l: [-9, 3, 0] }, pins: PRODUCTS.map((p, i) => ({ at: [-12 + i * 5, 11, 0], t: p.name })).concat([{ at: [18, 11, 0], t: 'All five' }]),
      evidence: [['open', 'Next: get P&G to react, then re-rate.']] },
  ],
  compute(s) {
    const r = {}; const sc = cols.map(c => [c.slug, score(s, c.slug)]);
    sc.forEach(([k, v]) => r['s_' + k] = v.toFixed(0));
    NEEDS.forEach((n, i) => r['all_' + i] = rate(s, 'all', i)); r.all_f = feas(s, 'all');
    const five = sc.filter(x => x[0] !== 'all').sort((a, b) => b[1] - a[1]);
    r.leader = PRODUCTS.find(p => p.slug === five[0][0]).name; r.gap = '+' + (five[0][1] - five[1][1]).toFixed(1) + ' pts';
    return r;
  },
  build({ THREE, scene, state, kit }) {
    scene.add(kit.gridFloor(200, 60, -0.1));
    const g = new THREE.Group(); scene.add(g); g.add(place(box(40, 0.3, 8, PAL.panel), 3, -0.1, 0));
    const bars = cols.map((c, i) => { const b = box(3, 1, 3, c.slug === 'all' ? PAL.mint : PAL.cyan, { edge: PAL.white, edgeOpacity: .4 }); b.position.x = -12 + i * 5; g.add(b); return b; });
    return { update(u, t, s) {
      const sc = cols.map(c => score(s, c.slug));
      bars.forEach((b, i) => { const h = Math.max(.05, sc[i] / 100 * 11); b.scale.y += (h - b.scale.y) * .12; b.position.y = b.scale.y / 2; b.visible = i < 5 || !!s.combine; });
    } };
  },
};
