/* Panhard & Levassor 1891: schema 3D di principio della trasmissione (unità: mm, avanti = +X, vista di fianco). Posa: a = sequenza 0..1080 (tre rapporti, due cambi di marcia).
   Da fonte: frizione a pedale, cambio a ingranaggi scorrevoli, trasmissione a catena (Wikipedia, Science Museum Group); tre rapporti (Doyennes, non datato).
   Stima: tutte le misure, il modulo e il numero di denti (primario 10/16/20, secondario 30/24/20, interasse 200 mm), la posizione e il diametro delle pulegge a catena, la forma della frizione.
   Per leggibilità gli alberi sono disegnati paralleli all'asse posteriore: la disposizione reale non è descritta dalle fonti rilette. Differenziale non modellato. */
export function build(T) {
  const M = 10, CD = 200, W = 40, DC = 70, DQ = 122, DEL = 52, ZC0 = -90;
  const ZP = [10, 16, 20], ZS = [30, 24, 20];
  const AX = 800, AY = 500, BX = AX - CD, RR = 450, ZCH = 230, RS = 85, RA = 175;
  const rad = d => d * Math.PI / 180, PI = Math.PI;
  const rod = (a, b, r) => T.rod({ a: a, b: b, r: r, seg: 8 });
  const gear = (z, w) => { const Rp = M * z / 2, l = [T.cylinder({ r: Rp - 7, l: w, axis: 'z', seg: Math.max(24, z * 2) })];
    for (let k = 0; k < z; k++) { const g = T.box({ w: 15, h: 14, d: w, at: [Rp, 0, 0] }); g.rotateZ(k * 2 * PI / z); l.push(g); } return T.merge(l); };
  const gP = ZP.map(z => gear(z, W)), gS = ZS.map(z => gear(z, W));
  const alb = (l, z0, r) => T.cylinder({ r: r, l: l, axis: 'z', at: [0, 0, z0], seg: 14 });
  const albP = alb(520, -20, 20), albS = alb(440, 70, 20);
  const volano = T.merge([T.tube({ ro: 195, ri: 178, l: 24, axis: 'z', at: [0, 0, 0], seg: 48 }), T.cylinder({ r: 36, l: 28, axis: 'z', seg: 20 })].concat([0, 1, 2].map(k => { const g = T.box({ w: 170, h: 12, d: 14, at: [95, 0, 0] }); g.rotateZ(k * 2 * PI / 3); return g; })));
  const disco = T.merge([T.tube({ ro: 165, ri: 130, l: 16, axis: 'z', seg: 48 }), T.cylinder({ r: 30, l: 22, axis: 'z', seg: 18 })]);
  const albM = T.cylinder({ r: 24, l: 200, axis: 'z', at: [0, 0, -330], seg: 16 });
  const segno = (r, z) => T.box({ w: 20, h: 22, d: 14, at: [r - 12, 0, z] });
  const mv = segno(195, 0), md = segno(165, 0), ms = segno(RA + 2, 0);
  const catSpr = r => T.merge([T.cylinder({ r: r, l: 24, axis: 'z', seg: 40 }), T.box({ w: 22, h: 22, d: 32, at: [r - 11, 0, 0] })]);
  const dx = BX - 0, dy = AY - RR, d = Math.hypot(dx, dy), ux = dx / d, uy = dy / d, nx = -uy, ny = ux;
  const catena = T.merge([1, -1].map(s => rod([BX + s * nx * RS, AY + s * ny * RS, ZCH], [0 + s * nx * RA, RR + s * ny * RA, ZCH], 4)));
  const asse = T.cylinder({ r: 28, l: 1300, axis: 'z', seg: 14 });
  const ruota = T.wheel({ R: RR, w: 40, tyre: 22, spokes: 14, hub: 56, sp: 12, axis: 'z' });
  const suolo = T.box({ w: 2800, h: 2, d: 1700, at: [500, -1, 0] });
  const sm = x => x * x * (3 - 2 * x), cl = (x, a, b) => Math.min(b, Math.max(a, x));
  const wrap = (x, p) => x - Math.round(x / p) * p;
  const parts = [
    { id: 'suolo', g: suolo, ghost: true, nobox: true },
    { id: 'vol', g: volano }, { id: 'mv', g: mv, accent: true, tint: 0.4 }, { id: 'albM', g: albM },
    { id: 'dis', g: disco, accent: true, tint: 0.12 }, { id: 'md', g: md, accent: true, tint: 0.4 },
    { id: 'albP', g: albP }, { id: 'albS', g: albS },
    { id: 'sp', g: catSpr(RS), accent: true, tint: 0.2 }, { id: 'ms', g: ms, accent: true, tint: 0.4 },
    { id: 'sa', g: catSpr(RA), accent: true, tint: 0.2 }, { id: 'cat', g: catena, accent: true },
    { id: 'asse', g: asse }, { id: 'rd', g: ruota }, { id: 'rs', g: ruota }
  ];
  [0, 1, 2].forEach(i => { parts.push({ id: 'p' + i, g: gP[i], accent: true, tint: 0.1 }); parts.push({ id: 's' + i, g: gS[i] }); });
  return {
    label: 'Schema 3D della trasmissione: frizione, cambio a ingranaggi scorrevoli a tre rapporti, catena, asse posteriore',
    a0: 0, samples: [0, 360, 720], view: 'fianco', buttons: ['iso', 'fianco', 'pianta'], pad: 1.08,
    views: { iso: { az: -35, el: 24 } },
    parts: parts,
    pose(a, H) {
      a = cl(a, 0, 1080);
      const w1 = sm(cl((a - 330) / 60, 0, 1)), w2 = sm(cl((a - 690) / 60, 0, 1));
      const s = DEL * (w1 + w2), gi = w2 > 0.5 ? 2 : w1 > 0.5 ? 1 : 0;
      const frozen = (a > 330 && a < 390) || (a > 690 && a < 750);
      const thE = rad(a), thP = rad(a - cl(a - 330, 0, 60) - cl(a - 690, 0, 60));
      /* angolo del secondario per ciascuna coppia, in fase con i denti; tra due coppie si raccorda sul passo di dente */
      const f = k => PI / ZS[k] - (thP - PI) * ZP[k] / ZS[k];
      let th2;
      if (a < 330) { th2 = f(0); } else if (a < 390) { const b = f(0), c = f(1); th2 = b + wrap(c - b, 2 * PI / ZS[1]) * w1; }
      else if (a < 690) { th2 = f(1); } else if (a < 750) { const b = f(1), c = f(2); th2 = b + wrap(c - b, 2 * PI / ZS[2]) * w2; } else { th2 = f(2); }
      const gap = frozen ? 34 : 0, thAx = th2 * RS / RA;
      H.vol.pos.set(AX, AY, -260); H.vol.rot.z = thE; H.mv.pos.set(AX, AY, -260); H.mv.rot.z = thE; H.albM.pos.set(AX, AY, 0); H.albM.rot.z = thE;
      H.dis.pos.set(AX, AY, -225 + gap); H.dis.rot.z = thP; H.md.pos.set(AX, AY, -225 + gap); H.md.rot.z = thP;
      H.albP.pos.set(AX, AY, 0); H.albP.rot.z = thP;
      H.albS.pos.set(BX, AY, 0); H.albS.rot.z = th2;
      [0, 1, 2].forEach(i => {
        H['p' + i].pos.set(AX, AY, ZC0 + s + i * DC); H['p' + i].rot.z = thP;
        H['s' + i].pos.set(BX, AY, ZC0 + i * DQ); H['s' + i].rot.z = th2;
      });
      H.sp.pos.set(BX, AY, ZCH); H.sp.rot.z = th2;
      H.sa.pos.set(0, RR, ZCH); H.sa.rot.z = thAx; H.ms.pos.set(0, RR, ZCH); H.ms.rot.z = thAx;
      H.cat.pos.set(0, 0, 0);
      H.asse.pos.set(0, RR, 0); H.asse.rot.z = thAx;
      H.rd.pos.set(0, RR, 600); H.rd.rot.z = thAx; H.rs.pos.set(0, RR, -600); H.rs.rot.z = thAx;
    }
  };
}
