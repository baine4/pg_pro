// Scroll-driven 3D story engine. No build step. Fixed WebGL canvas + fixed HUD text layers.
import * as kit from './kit.js';
import { NEEDS, TAGS } from './data.js';
import { RoomEnvironment } from '../vendor/addons/RoomEnvironment.js';
const { THREE, clamp, lerp, smooth } = kit;

const $ = (s, r = document) => r.querySelector(s);
const el = (h) => { const t = document.createElement('template'); t.innerHTML = h.trim(); return t.content.firstChild; };
const store = {
  get(k) { try { return JSON.parse(localStorage.getItem(k)); } catch { return null; } },
  set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch {} },
};
export const pill = (tag, txt) => `<span class="pill ${tag}" title="${TAGS[tag].hint}"><b>${TAGS[tag].label}</b>${txt}</span>`;

export function boot(ch, opts = {}) {
  const root = opts.root || '../';
  const key = 'pgpro:' + ch.id;
  document.title = ch.title + ' · P&G PRO capstone concept';
  document.documentElement.style.setProperty('--acc', ch.accent || '#3b82ff');
  document.body.innerHTML = `<div class="mob">Desktop only for now.<br>Open this on a laptop or projector.</div><canvas id="gl"></canvas><div id="hud"></div><div id="spacer"></div>`;
  const hud = $('#hud');

  // ---- state from controls (+ saved) ----
  const state = {};
  (ch.controls || []).forEach(c => state[c.key] = c.value);
  const saved = store.get(key + ':state'); if (saved) Object.assign(state, saved);

  // ---- scenes: authored scenes + logic scene ----
  const scenes = ch.scenes.slice();
  if (ch.logic) scenes.push({ id: 'logic', logic: true, needs: ch.logic.needs || [], cam: ch.logic.cam || scenes[scenes.length - 1].cam });
  const N = scenes.length;
  $('#spacer').style.height = (N * 380) + 'vh';

  // ---- top bar ----
  hud.append(el(`<div class="top"><a href="${root}">${ch.home ? 'P&amp;G PRO capstone concepts' : '&larr; All five concepts'}</a><span class="badge">Capstone concept &middot; not a P&amp;G product</span><div class="right"><span id="cnt">01 / ${String(N).padStart(2,'0')}</span><button class="btn" id="bcust">Customize</button></div></div>`));

  // ---- scene layers ----
  const layers = scenes.map((s, i) => {
    let node;
    if (s.logic) {
      const L = ch.logic;
      node = el(`<section class="logic"><div class="kick">The logic &middot; one page</div><h2>${L.title}</h2><div class="lgrid">
        <div class="lc"><h4>Who &amp; what job</h4><p>${L.who}</p><p style="margin-top:8px"><strong style="color:#fff">The gap:</strong> ${L.gap}</p></div>
        <div class="lc"><h4>The idea</h4><p>${L.idea}</p></div>
        <div class="lc"><h4>What would have to be true</h4><ul>${L.trueIf.map(x => `<li>${x}</li>`).join('')}</ul></div>
        <div class="lc"><h4>Needs it serves</h4><ul>${(L.needsWhy || []).map(x => `<li>${x}</li>`).join('')}</ul></div>
        <div class="lc"><h4>Evidence we have</h4>${L.evidence.map(e => pill(e[0], e[1])).join('')}</div>
        <div class="lc warn"><h4>What we do not know</h4><ul>${L.unknown.map(x => `<li>${x}</li>`).join('')}</ul></div>
        <div class="lc"><h4>Why P&amp;G PRO, why now</h4><p>${L.why}</p></div>
        <div class="lc"><h4>Next steps to test it</h4><ul>${L.next.map(x => `<li>${x}</li>`).join('')}</ul></div>
      </div></section>`);
    } else {
      const H = s.big ? 'h1' : 'h2';
      node = el(`<section class="scene ${s.pos || 'l'} ${s.align || ''}"><div class="kick">${String(i + 1).padStart(2,'0')} &middot; ${s.kicker}</div>
        <${H} data-edit="${i}:h">${s.h}</${H}>${s.sub ? `<p class="sub" data-edit="${i}:s">${s.sub}</p>` : ''}
        ${s.html ? `<div class="x">${s.html}</div>` : ''}
        ${(s.inline || []).length ? `<div class="inl">${s.inline.map(c => `<div><label>${c.label}<b data-val="${c.key}"></b></label><input type="range" data-k="${c.key}" min="${c.min}" max="${c.max}" step="${c.step || 1}"></div>`).join('')}</div>` : ''}
        ${(s.evidence || []).length ? `<div class="row">${s.evidence.map(e => pill(e[0], e[1])).join('')}</div>` : ''}
      </section>`);
    }
    hud.append(node); return node;
  });

  // restore edited copy
  const edits = store.get(key + ':copy') || {};
  document.querySelectorAll('[data-edit]').forEach(n => { if (edits[n.dataset.edit]) n.innerHTML = edits[n.dataset.edit]; });

  // ---- pins ----
  const pinEls = [];
  scenes.forEach((s, i) => (s.pins || []).forEach(p => { const n = el(`<div class="pin">${p.t}</div>`); hud.append(n); pinEls.push({ n, i, p }); }));

  // ---- need meter ----
  hud.append(el(`<div class="needs-title">User needs this scene serves &middot; bar = weight from our pairwise ranking</div>`));
  const nm = el(`<div class="needs">${NEEDS.map(n => `<div class="need" data-n="${n.id}" title="${n.name} (${n.w}%)"><b>${n.id}</b><span>${n.name}</span><i style="width:${n.w * 4}%"></i></div>`).join('')}</div>`);
  hud.append(nm);
  // rail
  const rail = el(`<div class="rail">${scenes.map((_, i) => `<i data-i="${i}"></i>`).join('')}</div>`); hud.append(rail);

  // ---- drawer ----
  const drawer = el(`<div class="drawer"><h3>Customize &middot; ${ch.title}</h3><div id="ctls"></div>
    <div class="ctl"><div class="t"><span>Edit headlines</span><b id="editState">off</b></div><div class="acts"><button class="btn" id="bedit">Toggle text edit</button><button class="btn" id="bresetcopy">Reset text</button></div><div class="note">Click any headline or sub-line on a scene to rewrite it. Saved in this browser.</div></div>
    <div class="acts"><button class="btn" id="breset">Reset numbers</button><button class="btn" id="bcopy">Copy settings</button></div>
    <div class="note" style="margin-top:14px;font-size:12px;color:var(--dim)">Keys: Space / arrows = next scene · C = customize · Home = restart. Settings save in this browser only. To change defaults for everyone, edit the <span class="mono">controls</span> list at the top of this page's chapter file.</div></div>`);
  hud.append(drawer);
  const ctls = $('#ctls', drawer); const ctlEls = {};
  (ch.controls || []).filter(c => !c.hidden).forEach(c => {
    let inner;
    if (c.type === 'select') inner = `<select data-k="${c.key}">${c.options.map(o => `<option value="${o[0]}">${o[1]}</option>`).join('')}</select>`;
    else if (c.type === 'toggle') inner = `<input type="checkbox" data-k="${c.key}">`;
    else inner = `<input type="range" data-k="${c.key}" min="${c.min}" max="${c.max}" step="${c.step || 1}">`;
    const n = el(`<div class="ctl"><div class="t"><span>${c.label}</span><b data-val="${c.key}"></b></div>${inner}${c.note ? `<div class="note">${c.note}</div>` : ''}${c.tag ? `<div style="margin-top:6px">${pill(c.tag, c.tagTxt || '')}</div>` : ''}</div>`);
    ctls.append(n);
  });
  const fmt = (k) => { const c = (ch.controls || []).find(x => x.key === k) || (scenes.flatMap(s => s.inline || []).find(x => x.key === k)) || {}; const v = state[k]; return c.fmt ? c.fmt(v) : String(v); };
  const syncInputs = () => document.querySelectorAll('[data-k]').forEach(i => {
    const k = i.dataset.k; if (i.type === 'checkbox') i.checked = !!state[k]; else if (document.activeElement !== i) i.value = state[k];
    document.querySelectorAll(`[data-val="${k}"]`).forEach(b => b.textContent = fmt(k));
  });
  hud.addEventListener('input', e => {
    const k = e.target.dataset && e.target.dataset.k; if (!k) return;
    state[k] = e.target.type === 'checkbox' ? e.target.checked : (e.target.tagName === 'SELECT' ? e.target.value : parseFloat(e.target.value));
    store.set(key + ':state', state); syncInputs();
  });
  syncInputs();
  const toggleDrawer = () => { drawer.classList.toggle('open'); $('#bcust').classList.toggle('on'); };
  $('#bcust').onclick = toggleDrawer;
  $('#breset').onclick = () => { (ch.controls || []).forEach(c => state[c.key] = c.value); store.set(key + ':state', state); syncInputs(); };
  $('#bcopy').onclick = () => { const t = JSON.stringify(state, null, 1); try { navigator.clipboard.writeText(t); $('#bcopy').textContent = 'Copied'; setTimeout(() => $('#bcopy').textContent = 'Copy settings', 1200); } catch { prompt('Copy:', t); } };
  let editing = false;
  $('#bedit').onclick = () => { editing = !editing; document.querySelectorAll('[data-edit]').forEach(n => n.contentEditable = editing); $('#editState').textContent = editing ? 'on' : 'off'; };
  hud.addEventListener('input', e => { const d = e.target.dataset && e.target.dataset.edit; if (d) { edits[d] = e.target.innerHTML; store.set(key + ':copy', edits); } });
  $('#bresetcopy').onclick = () => { store.set(key + ':copy', {}); location.reload(); };

  // ---- renderer ----
  const canvas = $('#gl');
  let renderer;
  try { renderer = new THREE.WebGLRenderer({ canvas, antialias: true, powerPreference: 'high-performance' }); }
  catch (e) { document.body.insertAdjacentHTML('beforeend', '<div style="position:fixed;inset:0;z-index:5;display:flex;align-items:center;justify-content:center;padding:40px;font:700 22px Inter Tight,sans-serif;text-align:center">This page needs WebGL. Open it in Chrome or Edge on a laptop.</div>'); throw e; }
  renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
  renderer.shadowMap.enabled = true; renderer.shadowMap.type = THREE.PCFShadowMap;
  renderer.toneMapping = THREE.ACESFilmicToneMapping; renderer.toneMappingExposure = 1.05;
  const scene = new THREE.Scene(); scene.background = new THREE.Color(0x0a0d12); scene.fog = new THREE.Fog(0x0a0d12, ch.fog?.[0] ?? 30, ch.fog?.[1] ?? 140);
  const camera = new THREE.PerspectiveCamera(42, 1, 0.1, 600);
  kit.lights(scene);
  { const pm = new THREE.PMREMGenerator(renderer); scene.environment = pm.fromScene(new RoomEnvironment(), 0.04).texture; scene.environmentIntensity = 0.35; }
  const resize = () => { renderer.setSize(innerWidth, innerHeight, false); camera.aspect = innerWidth / innerHeight; camera.updateProjectionMatrix(); };
  addEventListener('resize', resize); resize();

  const world = ch.build({ THREE, scene, camera, renderer, state, kit });

  // ---- scroll + loop ----
  let u = 0, target = 0; const mouse = { x: 0, y: 0, sx: 0, sy: 0 };
  addEventListener('mousemove', e => { mouse.x = e.clientX / innerWidth - .5; mouse.y = e.clientY / innerHeight - .5; });
  const maxScroll = () => Math.max(1, document.documentElement.scrollHeight - innerHeight);
  const readTarget = () => { target = clamp(scrollY / maxScroll()) * (N - 1); };
  let snapT; addEventListener('scroll', () => { readTarget(); clearTimeout(snapT); snapT = setTimeout(() => { const i = Math.round(target); if (Math.abs(target - i) > 0.02) goto(i); }, 180); }); readTarget(); u = target;
  const goto = (i) => scrollTo({ top: clamp(i, 0, N - 1) / (N - 1) * maxScroll(), behavior: 'smooth' });
  rail.onclick = e => { if (e.target.dataset.i !== undefined) goto(+e.target.dataset.i); };
  addEventListener('keydown', e => {
    if (e.target.isContentEditable || /INPUT|SELECT|TEXTAREA/.test(e.target.tagName)) return;
    const cur = Math.round(target);
    if (['ArrowDown', 'PageDown', ' ', 'ArrowRight'].includes(e.key)) { e.preventDefault(); goto(cur + 1); }
    else if (['ArrowUp', 'PageUp', 'ArrowLeft'].includes(e.key)) { e.preventDefault(); goto(cur - 1); }
    else if (e.key === 'Home') goto(0); else if (e.key === 'End') goto(N - 1);
    else if (e.key.toLowerCase() === 'c') toggleDrawer();
  });

  const camP = new THREE.Vector3(), camL = new THREE.Vector3(), a = new THREE.Vector3(), b = new THREE.Vector3();
  const tmp = new THREE.Vector3();
  let last = performance.now(), lastBind = {}, lastIdx = -1;
  const cnt = $('#cnt');
  function frame(now) {
    const dt = Math.min(0.05, (now - last) / 1000); last = now; const t = now / 1000;
    u += (target - u) * (1 - Math.exp(-dt * 2.6));
    const i0 = Math.min(N - 2, Math.floor(u)), f = u - i0;
    const k = smooth(clamp((f - 0.3) / 0.4));                       // dwell near each scene, travel in the middle
    const A = scenes[i0].cam, B = scenes[i0 + 1].cam;
    camP.set(...A.p).lerp(a.set(...B.p), k); camL.set(...A.l).lerp(b.set(...B.l), k);
    mouse.sx += (mouse.x - mouse.sx) * 0.05; mouse.sy += (mouse.y - mouse.sy) * 0.05;
    camera.position.copy(camP); camera.lookAt(camL);
    camera.translateX(mouse.sx * 1.4); camera.translateY(-mouse.sy * 0.9); camera.lookAt(camL);
    kit.key.target.position.copy(camL); kit.key.position.copy(camL).add(a.set(9, 18, 12));
    world.update && world.update(u, t, state, dt);
    renderer.render(scene, camera);
    // text layers
    const idx = Math.round(u);
    layers.forEach((n, i) => {
      const o = clamp(1 - Math.abs(u - i) * 1.7);
      n.style.opacity = o; n.style.visibility = o > 0.01 ? 'visible' : 'hidden';
      n.style.transform = `translateY(${(i - u) * 26}px)`; n.style.pointerEvents = o > 0.6 ? 'auto' : 'none';
    });
    pinEls.forEach(({ n, i, p }) => {
      const o = clamp(1 - Math.abs(u - i) * 2.4); tmp.set(...(typeof p.at === 'function' ? p.at(u) : p.at)).project(camera);
      n.style.opacity = tmp.z < 1 ? o : 0; n.style.transform = `translate(${(tmp.x * .5 + .5) * innerWidth}px,${(-tmp.y * .5 + .5) * innerHeight}px) translate(-50%,-130%)`;
    });
    if (idx !== lastIdx) {
      lastIdx = idx; cnt.textContent = `${String(idx + 1).padStart(2, '0')} / ${String(N).padStart(2, '0')}`;
      const on = scenes[idx].needs || [];
      nm.querySelectorAll('.need').forEach(n => n.classList.toggle('on', on.includes(n.dataset.n)));
      rail.querySelectorAll('i').forEach((d, i) => d.classList.toggle('on', i === idx));
    }
    if (ch.compute) { const r = ch.compute(state, u); for (const kk in r) if (lastBind[kk] !== r[kk]) { lastBind[kk] = r[kk]; document.querySelectorAll(`[data-bind="${kk}"]`).forEach(n => n.textContent = r[kk]); } }
    requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);
  window.__story = { goto, state, N, get u() { return u; } };
}
