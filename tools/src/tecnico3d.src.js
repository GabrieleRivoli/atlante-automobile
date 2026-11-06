/* Atlante dell'Automobile: disegno tecnico 3D.
   Sorgente del modulo. Il file servito è assets/tecnico3d.js (bundle con Three.js, `npm run build` in tools/).
   Resa: camera ortografica, solo spigoli e contorni, linee nascoste tratteggiate, sezione, esploso.
   Le schede descrivono solo i propri pezzi (schede/<slug>.3d.js) con gli helper esportati qui. */
import {
  WebGLRenderer, Scene, OrthographicCamera, Group, Mesh, LineSegments, BufferGeometry, Float32BufferAttribute,
  MeshBasicMaterial, LineBasicMaterial, LineDashedMaterial, Plane, Vector2, Vector3, Matrix4, DoubleSide,
  GreaterDepth, CylinderGeometry, BoxGeometry, LatheGeometry, PlaneGeometry, Shape, Path, ExtrudeGeometry
} from 'three';

const PI = Math.PI;

/* ---------- helper geometrici (unità: millimetri, Y verso l'alto) ---------- */
function clean(g) {
  const n = g.index ? g.toNonIndexed() : g;
  const o = new BufferGeometry();
  o.setAttribute('position', new Float32BufferAttribute(Float32Array.from(n.getAttribute('position').array), 3));
  return o;
}
function orient(g, axis, at) {
  if (axis === 'x') g.rotateZ(-PI / 2); else if (axis === 'z') g.rotateX(PI / 2);
  if (at) g.translate(at[0], at[1], at[2]);
  return clean(g);
}
/* cilindro pieno: {r, l, axis:'x'|'y'|'z', at:[x,y,z], seg} */
export function cylinder(o) { return orient(new CylinderGeometry(o.r, o.r, o.l, o.seg || 36, 1, false), o.axis || 'y', o.at); }
/* cono tronco: r1 a -l/2, r2 a +l/2 */
export function cone(o) { return orient(new CylinderGeometry(o.r2, o.r1, o.l, o.seg || 36, 1, false), o.axis || 'y', o.at); }
/* tubo con pareti e testate anulari: {ro, ri, l, axis, at, seg} */
export function tube(o) {
  const h = o.l / 2;
  const pts = [[o.ri, -h], [o.ro, -h], [o.ro, h], [o.ri, h], [o.ri, -h]].map(p => new Vector2(p[0], p[1]));
  return orient(new LatheGeometry(pts, o.seg || 36), o.axis || 'y', o.at);
}
/* solido di rivoluzione: pts [[raggio, quota],...] attorno all'asse; {axis, at, seg} */
export function lathe(o) { return orient(new LatheGeometry(o.pts.map(p => new Vector2(p[0], p[1])), o.seg || 36), o.axis || 'y', o.at); }
export function box(o) { return orient(new BoxGeometry(o.w, o.h, o.d), 'y', o.at); }
/* estrusione di un profilo piano: pts [[u,v],...], depth, axis 'z' (profilo in XY) o 'y' (profilo in XZ: u=x, v=z), holes */
export function extrude(o) {
  const sh = new Shape(o.pts.map(p => new Vector2(p[0], p[1])));
  (o.holes || []).forEach(h => sh.holes.push(new Path(h.map(p => new Vector2(p[0], p[1])))));
  const g = new ExtrudeGeometry(sh, { depth: o.depth, bevelEnabled: false, curveSegments: o.seg || 16 });
  g.translate(0, 0, -o.depth / 2);
  if ((o.axis || 'z') === 'y') g.rotateX(PI / 2);
  if (o.at) g.translate(o.at[0], o.at[1], o.at[2]);
  return clean(g);
}
export function merge(list) {
  const arr = list.map(g => clean(g).getAttribute('position').array);
  let n = 0; arr.forEach(a => { n += a.length; });
  const out = new Float32Array(n); let k = 0;
  arr.forEach(a => { out.set(a, k); k += a.length; });
  const g = new BufferGeometry(); g.setAttribute('position', new Float32BufferAttribute(out, 3)); return g;
}
/* solo linee (nessuna superficie): molla elicoidale e stella della scintilla */
export function helix(o) {
  const seg = o.seg || 20, n = Math.round(o.turns * seg), s = [], ax = o.axis || 'y', at = o.at || [0, 0, 0];
  let prev = null;
  for (let i = 0; i <= n; i++) {
    const t = i / n, ang = t * o.turns * 2 * PI, u = o.r * Math.cos(ang), v = o.r * Math.sin(ang), w = -o.l / 2 + o.l * t;
    const p = ax === 'y' ? [u, w, v] : ax === 'x' ? [w, u, v] : [u, v, w];
    p[0] += at[0]; p[1] += at[1]; p[2] += at[2];
    if (prev) s.push(prev[0], prev[1], prev[2], p[0], p[1], p[2]);
    prev = p;
  }
  return { segs: Float32Array.from(s) };
}
export function star(o) {
  const r = o.size, at = o.at || [0, 0, 0], d = r * 0.6, s = [];
  [[r, 0, 0], [0, r, 0], [0, 0, r], [d, d, 0], [d, -d, 0], [0, d, d], [0, d, -d]].forEach(v => {
    s.push(at[0] - v[0], at[1] - v[1], at[2] - v[2], at[0] + v[0], at[1] + v[1], at[2] + v[2]);
  });
  return { segs: Float32Array.from(s) };
}

/* ---------- spigoli e contorni ---------- */
const CREASE = Math.cos(35 * PI / 180);
function buildEdges(g) {
  const p = g.getAttribute('position').array, nt = p.length / 9;
  const ids = new Map(), V = [];
  const vid = (x, y, z) => {
    const k = Math.round(x * 50) + ',' + Math.round(y * 50) + ',' + Math.round(z * 50);
    let i = ids.get(k);
    if (i === undefined) { i = V.length / 3; ids.set(k, i); V.push(x, y, z); }
    return i;
  };
  const tri = [], N = [], em = new Map();
  for (let t = 0; t < nt; t++) {
    const o = t * 9, ax = p[o], ay = p[o + 1], az = p[o + 2], bx = p[o + 3], by = p[o + 4], bz = p[o + 5], cx = p[o + 6], cy = p[o + 7], cz = p[o + 8];
    const ux = bx - ax, uy = by - ay, uz = bz - az, vx = cx - ax, vy = cy - ay, vz = cz - az;
    let nx = uy * vz - uz * vy, ny = uz * vx - ux * vz, nz = ux * vy - uy * vx;
    const l = Math.hypot(nx, ny, nz); if (l < 1e-9) continue;
    nx /= l; ny /= l; nz /= l;
    const a = vid(ax, ay, az), b = vid(bx, by, bz), c = vid(cx, cy, cz);
    if (a === b || b === c || a === c) continue;
    const ti = N.length / 3; N.push(nx, ny, nz); tri.push([a, b, c]);
    [[a, b], [b, c], [c, a]].forEach(e => {
      const k = e[0] < e[1] ? e[0] + '_' + e[1] : e[1] + '_' + e[0];
      let r = em.get(k); if (!r) { r = { a: Math.min(e[0], e[1]), b: Math.max(e[0], e[1]), f: [] }; em.set(k, r); }
      r.f.push(ti);
    });
  }
  const A = [], B = [], N1 = [], N2 = [], F = [];
  em.forEach(r => {
    let flag = 0, n1 = [0, 0, 0], n2 = [0, 0, 0];
    if (r.f.length !== 2) flag = 1;
    else {
      n1 = [N[r.f[0] * 3], N[r.f[0] * 3 + 1], N[r.f[0] * 3 + 2]]; n2 = [N[r.f[1] * 3], N[r.f[1] * 3 + 1], N[r.f[1] * 3 + 2]];
      const d = n1[0] * n2[0] + n1[1] * n2[1] + n1[2] * n2[2];
      if (d > 0.99995) return;           /* coplanari: nessuna linea */
      if (d < CREASE) flag = 1;          /* spigolo vivo: sempre */
    }
    A.push(V[r.a * 3], V[r.a * 3 + 1], V[r.a * 3 + 2]); B.push(V[r.b * 3], V[r.b * 3 + 1], V[r.b * 3 + 2]);
    N1.push(n1[0], n1[1], n1[2]); N2.push(n2[0], n2[1], n2[2]); F.push(flag);
  });
  return { n: F.length, a: Float32Array.from(A), b: Float32Array.from(B), n1: Float32Array.from(N1), n2: Float32Array.from(N2), f: Uint8Array.from(F) };
}
/* punti estremi di un pezzo (48+6 direzioni): bastano per inquadrare senza gonfiare i dischi piatti */
const DIRS = (() => {
  const d = [[1, 0, 0], [-1, 0, 0], [0, 1, 0], [0, -1, 0], [0, 0, 1], [0, 0, -1]], n = 48, ga = PI * (3 - Math.sqrt(5));
  for (let i = 0; i < n; i++) { const y = 1 - 2 * (i + 0.5) / n, r = Math.sqrt(1 - y * y), t = ga * i; d.push([Math.cos(t) * r, y, Math.sin(t) * r]); }
  return d;
})();
function hull(g) {
  const a = g.getAttribute('position').array, best = DIRS.map(() => -1e18), idx = DIRS.map(() => 0);
  for (let i = 0; i < a.length; i += 3) {
    for (let j = 0; j < DIRS.length; j++) {
      const d = DIRS[j], v = a[i] * d[0] + a[i + 1] * d[1] + a[i + 2] * d[2];
      if (v > best[j]) { best[j] = v; idx[j] = i; }
    }
  }
  const seen = {}, out = [];
  idx.forEach(i => { if (!seen[i]) { seen[i] = 1; out.push(a[i], a[i + 1], a[i + 2]); } });
  return Float32Array.from(out);
}
const clamp = (x, a, b) => Math.min(b, Math.max(a, x));
const smooth = x => { x = clamp(x, 0, 1); return x * x * (3 - 2 * x); };

/* ---------- montaggio ---------- */
export function mount(host, def) {
  const reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const canvas = document.createElement('canvas');
  host.appendChild(canvas);
  let renderer;
  try {
    renderer = new WebGLRenderer({ canvas, antialias: true, alpha: true, powerPreference: 'low-power' });
  } catch (err) { host.removeChild(canvas); throw err; }
  renderer.setClearColor(0x000000, 0);
  renderer.localClippingEnabled = true;
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));

  const scene = new Scene();
  const cam = new OrthographicCamera(-1, 1, 1, -1, 1, 12000);
  const plane = new Plane(new Vector3(0, 0, -1), 1000);   /* tiene z <= costante */
  const clip = [plane];

  /* materiali condivisi; i colori vengono dalle variabili CSS del sito */
  const reg = [];
  const mk = (M, role, props) => { const m = new M(props); reg.push({ m, role }); return m; };
  const offs = { polygonOffset: true, polygonOffsetFactor: 1, polygonOffsetUnits: 1 };
  const mOcc = new MeshBasicMaterial(Object.assign({ colorWrite: false, side: DoubleSide, clippingPlanes: clip }, offs));
  const mInk = mk(LineBasicMaterial, 'ink', { clippingPlanes: clip });
  const mAcc = mk(LineBasicMaterial, 'accent', { clippingPlanes: clip });
  const dash = { dashSize: 7, gapSize: 6, depthFunc: GreaterDepth, depthWrite: false, transparent: true, clippingPlanes: clip };
  const mHidInk = mk(LineDashedMaterial, 'muted', Object.assign({ opacity: 0.8 }, dash));
  const mHidAcc = mk(LineDashedMaterial, 'accent', Object.assign({ opacity: 0.6 }, dash));
  const mCutFill = mk(MeshBasicMaterial, 'accent', Object.assign({ transparent: true, opacity: 0.22, depthWrite: false, side: DoubleSide }, offs));
  const mCutLine = mk(LineBasicMaterial, 'ink', { transparent: true });
  let C = {};
  function theme() {
    const cs = getComputedStyle(document.documentElement), g = (n, d) => (cs.getPropertyValue(n) || '').trim() || d;
    C = { ink: g('--ink', '#1b1b1a'), accent: g('--accent', '#3333cc'), muted: g('--muted', '#6b6a67') };
    reg.forEach(o => o.m.color.set(C[o.role]));
    dirty = true; request();
  }

  /* pezzi */
  const list = [], H = {};
  const vl = new Vector3(), vw = new Vector3(), inv = new Matrix4();
  def.parts.forEach(pd => {
    const root = new Group(), body = new Group(); root.add(body); scene.add(root);
    const P = { pd, root, body, ex: pd.explode || [0, 0, 0], own: null, kind: 'mesh' };
    const g = pd.g;
    if (g.segs) {
      P.kind = 'segs';
      const lg = new BufferGeometry(); lg.setAttribute('position', new Float32BufferAttribute(g.segs, 3));
      P.own = mk(LineBasicMaterial, pd.accent ? 'accent' : 'ink', { clippingPlanes: clip, transparent: true });
      const ls = new LineSegments(lg, P.own); ls.renderOrder = 1; ls.frustumCulled = false; body.add(ls);
      P.hp = hull(lg);
    } else if (pd.vol) {
      P.kind = 'vol';
      P.own = mk(MeshBasicMaterial, pd.accent === false ? 'muted' : 'accent', { transparent: true, opacity: 0.2, depthWrite: false, side: DoubleSide, clippingPlanes: clip });
      const m = new Mesh(g, P.own); m.renderOrder = 3; m.frustumCulled = false; body.add(m);
    } else {
      P.E = buildEdges(g); P.hp = hull(g);
      const occ = new Mesh(g, mOcc); occ.renderOrder = 0; occ.frustumCulled = false; body.add(occ);
      const lg = new BufferGeometry();
      P.lpos = new Float32Array(P.E.n * 6); P.lld = new Float32Array(P.E.n * 2);
      lg.setAttribute('position', new Float32BufferAttribute(P.lpos, 3).setUsage(35048));
      lg.setAttribute('lineDistance', new Float32BufferAttribute(P.lld, 1).setUsage(35048));
      P.lpos = lg.attributes.position.array; P.lld = lg.attributes.lineDistance.array;   /* il costruttore copia: si scrive sull'array dell'attributo */
      P.lg = lg;
      P.solid = new LineSegments(lg, pd.accent ? mAcc : mInk); P.solid.renderOrder = 1; P.solid.frustumCulled = false;
      P.dash = new LineSegments(lg, pd.accent ? mHidAcc : mHidInk); P.dash.renderOrder = 2; P.dash.frustumCulled = false;
      body.add(P.solid, P.dash);
      if (pd.tint) {
        P.own = mk(MeshBasicMaterial, 'accent', Object.assign({ transparent: true, opacity: pd.tint, depthWrite: false, side: DoubleSide, clippingPlanes: clip }, offs));
        const t = new Mesh(g, P.own); t.renderOrder = 3; t.frustumCulled = false; body.add(t);
      }
    }
    /* superfici di taglio (piano z = 0, coordinate locali del pezzo) */
    P.cuts = [];
    (pd.cuts || []).forEach(c => {
      const r = c.r, w = r[2] - r[0], h = r[3] - r[1];
      const pg = new PlaneGeometry(w, h); pg.translate((r[0] + r[2]) / 2, (r[1] + r[3]) / 2, 0);
      const fm = mk(MeshBasicMaterial, 'accent', Object.assign({ transparent: true, opacity: 0.22 * (c.k == null ? 1 : c.k), depthWrite: false, side: DoubleSide }, offs));
      const f = new Mesh(pg, fm); f.renderOrder = 4; f.frustumCulled = false;
      const lg = new BufferGeometry();
      lg.setAttribute('position', new Float32BufferAttribute([r[0], r[1], 0, r[2], r[1], 0, r[2], r[1], 0, r[2], r[3], 0, r[2], r[3], 0, r[0], r[3], 0, r[0], r[3], 0, r[0], r[1], 0], 3));
      const l = new LineSegments(lg, mCutLine); l.renderOrder = 4; l.frustumCulled = false;
      f.visible = l.visible = false; (pd.cutFixed ? root : body).add(f, l); P.cuts.push(f, l); (P.cutMats = P.cutMats || []).push([fm, 0.22 * (c.k == null ? 1 : c.k)]);
    });
    list.push(P);
    H[pd.id] = {
      pos: body.position, rot: body.rotation, scl: body.scale,
      show(v) { body.visible = !!v; },
      alpha(v) { if (P.own) { P.own.opacity = v; } if (P.kind !== 'mesh') body.visible = v > 0.004; },
      role(r) { reg.forEach(o => { if (o.m === P.own) { o.role = r; o.m.color.set(C[r]); } }); }
    };
  });

  /* stato e telecamera */
  const V = Object.assign({ iso: { az: -32, el: 26 }, pianta: { az: 0, el: 89.5 }, fianco: { az: 0, el: 0 } }, def.views || {});
  const S = { az: V.iso.az, el: V.iso.el, e: 0, cut: 1, hid: 0, a: def.a0 || 0 };
  const tw = {};
  let dirty = true, raf = 0, visible = true, W = 1, Ht = 1, target = new Vector3(), dragging = null;
  const dir = new Vector3();

  const SAMPLES = def.samples || [0, 60, 120, 180, 240, 300, 360, 420, 480, 540, 600, 660];
  /* ingombro: punti estremi di ogni pezzo in ogni posa campionata, con e senza esploso (le pose identiche si contano una volta) */
  function boxes() {
    [0, 1].forEach(e => {
      list.forEach(P => { P.root.position.set(P.ex[0] * e, P.ex[1] * e, P.ex[2] * e); P['q' + e] = []; P['m' + e] = null; });
      SAMPLES.forEach(a => {
        def.pose(a, H, { e, cut: 1, a });
        scene.updateMatrixWorld(true);
        list.forEach(P => {
          if (!P.hp || P.pd.nobox) return;
          const m = P.body.matrixWorld.elements;
          if (P['m' + e] && P['m' + e].every((v, k) => Math.abs(v - m[k]) < 1e-6)) return;
          P['m' + e] = m.slice();
          for (let i = 0; i < P.hp.length; i += 3) {
            vl.set(P.hp[i], P.hp[i + 1], P.hp[i + 2]).applyMatrix4(P.body.matrixWorld);
            P['q' + e].push(vl.x, vl.y, vl.z);
          }
        });
      });
    });
    const t = [1e9, 1e9, 1e9, -1e9, -1e9, -1e9];
    list.forEach(P => { const q = P.q0; if (q) for (let i = 0; i < q.length; i += 3) for (let k = 0; k < 3; k++) { t[k] = Math.min(t[k], q[i + k]); t[k + 3] = Math.max(t[k + 3], q[i + k]); } });
    target.set((t[0] + t[3]) / 2, (t[1] + t[4]) / 2, (t[2] + t[5]) / 2);
  }

  function fit() {
    let x0 = 1e9, x1 = -1e9, y0 = 1e9, y1 = -1e9;
    const m = cam.matrixWorldInverse.elements, e = S.e;
    list.forEach(P => {
      const q0 = P.q0, q1 = P.q1;
      if (!q0 || !q0.length || !P.body.visible) return;
      for (let i = 0; i < q0.length; i += 3) {
        const x = q0[i] + (q1[i] - q0[i]) * e, y = q0[i + 1] + (q1[i + 1] - q0[i + 1]) * e, z = q0[i + 2] + (q1[i + 2] - q0[i + 2]) * e;
        const u = m[0] * x + m[4] * y + m[8] * z + m[12], v = m[1] * x + m[5] * y + m[9] * z + m[13];
        if (u < x0) x0 = u; if (u > x1) x1 = u; if (v < y0) y0 = v; if (v > y1) y1 = v;
      }
    });
    const ar = W / Ht, pad = def.pad || 1.08;
    const hh = Math.max((y1 - y0) / 2, (x1 - x0) / 2 / ar) * pad, cx = (x0 + x1) / 2, cy = (y0 + y1) / 2;
    cam.left = cx - hh * ar; cam.right = cx + hh * ar; cam.top = cy + hh; cam.bottom = cy - hh;
    cam.updateProjectionMatrix();
  }

  function updateLines(P) {
    const E = P.E; if (!E || !P.body.visible) return;
    inv.copy(P.body.matrixWorld).invert(); vl.copy(vw).transformDirection(inv);
    const pos = P.lpos, ld = P.lld; let n = 0;
    for (let i = 0; i < E.n; i++) {
      let on = E.f[i] === 1;
      if (!on) {
        const j = i * 3;
        const d1 = E.n1[j] * vl.x + E.n1[j + 1] * vl.y + E.n1[j + 2] * vl.z, d2 = E.n2[j] * vl.x + E.n2[j + 1] * vl.y + E.n2[j + 2] * vl.z;
        on = (d1 > 0) !== (d2 > 0);
      }
      if (!on) continue;
      const j = i * 3, k = n * 6;
      pos[k] = E.a[j]; pos[k + 1] = E.a[j + 1]; pos[k + 2] = E.a[j + 2]; pos[k + 3] = E.b[j]; pos[k + 4] = E.b[j + 1]; pos[k + 5] = E.b[j + 2];
      ld[n * 2] = 0; ld[n * 2 + 1] = Math.hypot(E.b[j] - E.a[j], E.b[j + 1] - E.a[j + 1], E.b[j + 2] - E.a[j + 2]);
      n++;
    }
    P.lg.setDrawRange(0, n * 2);
    P.lg.attributes.position.needsUpdate = true; P.lg.attributes.lineDistance.needsUpdate = true;
  }

  function render() {
    const ar = S.az * PI / 180, er = S.el * PI / 180;
    dir.set(Math.sin(ar) * Math.cos(er), Math.sin(er), Math.cos(ar) * Math.cos(er));
    cam.position.copy(target).addScaledVector(dir, 4000); cam.up.set(0, 1, 0); cam.lookAt(target); cam.updateMatrixWorld();
    vw.copy(dir).negate();
    list.forEach(P => P.root.position.set(P.ex[0] * S.e, P.ex[1] * S.e, P.ex[2] * S.e));
    def.pose(S.a, H, S);
    plane.constant = S.cut >= 1 ? 1000 : S.cut * 320;
    const ca = clamp(1 - plane.constant / 30, 0, 1);
    list.forEach(P => { P.cuts.forEach(o => { o.visible = ca > 0.01 && P.body.visible; }); (P.cutMats || []).forEach(m => { m[0].opacity = m[1] * ca; }); });
    mCutLine.opacity = ca;
    scene.updateMatrixWorld(true);
    list.forEach(P => { if (P.dash) P.dash.visible = S.hid > 0.5 && P.pd.hidden !== false; updateLines(P); });
    fit();
    renderer.render(scene, cam);
  }

  function tick(t) {
    raf = 0; let active = false;
    for (const k in tw) {
      const o = tw[k]; let f = clamp((t - o.t0) / o.d, 0, 1); f = f * f * (3 - 2 * f);
      S[k] = o.a + (o.b - o.a) * f; dirty = true;
      if (f < 1) active = true; else delete tw[k];
    }
    if (dirty && visible) { dirty = false; render(); }
    if (active) request();
  }
  function request() { if (!raf && visible) raf = requestAnimationFrame(tick); }
  function go(k, b, d) {
    if (reduce || d === 0) { delete tw[k]; S[k] = b; dirty = true; request(); return; }
    tw[k] = { a: S[k], b, d: d || 600, t0: performance.now() }; request();
  }

  /* interazione */
  host.setAttribute('tabindex', '0');
  host.setAttribute('role', 'img');
  if (def.label) host.setAttribute('aria-label', def.label);
  host.addEventListener('pointerdown', ev => {
    if (ev.pointerType === 'mouse' && ev.button !== 0) return;
    delete tw.az; delete tw.el;
    dragging = { x: ev.clientX, y: ev.clientY, az: S.az, el: S.el, touch: ev.pointerType === 'touch' };
    try { host.setPointerCapture(ev.pointerId); } catch (x) { /* ok */ }
    host.classList.add('drag'); setView(null);
  });
  host.addEventListener('pointermove', ev => {
    if (!dragging) return;
    S.az = dragging.az - (ev.clientX - dragging.x) * 0.4;
    if (!dragging.touch) S.el = clamp(dragging.el + (ev.clientY - dragging.y) * 0.4, -5, 89.5);
    dirty = true; request();
  });
  const endDrag = () => { dragging = null; host.classList.remove('drag'); };
  host.addEventListener('pointerup', endDrag); host.addEventListener('pointercancel', endDrag);
  host.addEventListener('keydown', ev => {
    const k = ev.key, st = 6;
    if (k === 'ArrowLeft') S.az += st; else if (k === 'ArrowRight') S.az -= st;
    else if (k === 'ArrowUp') S.el = clamp(S.el - st, -5, 89.5); else if (k === 'ArrowDown') S.el = clamp(S.el + st, -5, 89.5); else return;
    ev.preventDefault(); setView(null); dirty = true; request();
  });
  host.addEventListener('dblclick', () => setView('iso'));

  /* barra comandi */
  const bar = document.createElement('div'); bar.className = 'tb';
  const mkBtn = (label, fn, toggle) => {
    const b = document.createElement('button'); b.type = 'button'; b.textContent = label;
    if (toggle) b.setAttribute('aria-pressed', 'false');
    b.addEventListener('click', fn); return b;
  };
  const vb = {}, grp = document.createElement('div'); grp.className = 'tg3';
  [['iso', 'Isometrica'], ['pianta', 'Pianta'], ['fianco', 'Fianco']].forEach(v => { vb[v[0]] = mkBtn(v[1], () => setView(v[0], true)); grp.appendChild(vb[v[0]]); });
  vb.iso.classList.add('on');
  const bSec = mkBtn('Sezione', () => { const on = bSec.getAttribute('aria-pressed') !== 'true'; bSec.setAttribute('aria-pressed', on); bSec.classList.toggle('on', on); go('cut', on ? 0 : 1, 900); }, true);
  const bHid = mkBtn('Linee nascoste', () => { const on = bHid.getAttribute('aria-pressed') !== 'true'; bHid.setAttribute('aria-pressed', on); bHid.classList.toggle('on', on); S.hid = on ? 1 : 0; dirty = true; request(); }, true);
  const lab = document.createElement('label'); lab.textContent = 'Esploso';
  const rng = document.createElement('input'); rng.type = 'range'; rng.min = 0; rng.max = 100; rng.value = 0; rng.setAttribute('aria-label', 'Esploso: separazione dei componenti');
  rng.addEventListener('input', () => { delete tw.e; S.e = rng.value / 100; dirty = true; request(); });
  lab.appendChild(rng);
  bar.append(grp, bSec, bHid, lab);
  host.parentNode.insertBefore(bar, host.nextSibling);

  function setView(name, animate) {
    Object.keys(vb).forEach(k => vb[k].classList.toggle('on', k === name));
    if (!name) return;
    const v = V[name]; let az = v.az;
    az = S.az + ((((az - S.az) % 360) + 540) % 360 - 180);   /* via più breve */
    go('az', az, 650); go('el', v.el, 650);
  }

  /* dimensioni, visibilità, tema */
  const resize = () => {
    W = Math.max(1, host.clientWidth); Ht = Math.max(1, host.clientHeight);
    renderer.setSize(W, Ht, false); dirty = true; request();
  };
  if ('ResizeObserver' in window) new ResizeObserver(resize).observe(host); else window.addEventListener('resize', resize);
  if ('IntersectionObserver' in window) new IntersectionObserver(en => { visible = en[0].isIntersecting; if (visible) { dirty = true; request(); } }).observe(host);
  new MutationObserver(theme).observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });
  if (window.matchMedia) { const mq = window.matchMedia('(prefers-color-scheme: dark)'); if (mq.addEventListener) mq.addEventListener('change', theme); }

  boxes(); theme(); resize();
  if (def.start && def.start.section) bSec.click();

  return {
    set(a) { S.a = a; dirty = true; request(); },
    setView, state: S,
    setExplode(v) { go('e', v, 700); rng.value = v * 100; },
    setSection(on) { go('cut', on ? 0 : 1, 900); },
    invalidate() { dirty = true; request(); }
  };
}
