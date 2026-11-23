/* Mercedes 35 PS 1901: motore a quattro cilindri in linea, modello 3D (unità: mm, albero motore lungo X, cilindri verticali). Posa: a = angolo di manovella, 0..720.
   Da fonte (Wikipedia, Mercedes 35 hp): quattro cilindri in ghisa fusi a coppie con testa fissa, alesaggio 116 mm, corsa 140 mm, 5.918 cm³, 35 PS a 950 giri/min,
   valvole di aspirazione e scarico aperte da due alberi a camme ai lati del motore, comandati da ingranaggi; accensione a magnete a bassa tensione con contatti a strappo.
   The Henry Ford (foglio dattiloscritto): cilindri a coppie, valvole sui due lati disposte verticalmente, basamento in alluminio.
   Stima: biella (300 mm), interasse dei cilindri, manovelle a 180° e ordine di accensione 1-3-4-2 (schema usuale per i quattro cilindri, non letto nelle fonti),
   forma delle camme, alzata delle valvole, aspirazione su un lato e scarico sull'altro, posizione dei contatti di accensione, volano. */
export function build(T) {
  const r = 70, L = 300, BORE = 116, PIN = 40, CH = 50, PL = 110;
  const XS = [0, 150, 370, 520], DEL = [0, Math.PI, Math.PI, 0], OFF = [0, 540, 180, 360];
  const rad = d => d * Math.PI / 180;
  const rod = (a, b, rr) => T.rod({ a: a, b: b, r: rr, seg: 10 });
  const yTDC = r + L + PIN, H0 = yTDC + PIN + CH;
  const blocco = k => T.box({ w: 280, h: 300, d: 270, at: [(XS[2 * k] + XS[2 * k + 1]) / 2, H0 - 150, 0] });
  const canne = T.merge(XS.map(x => T.tube({ ro: BORE / 2 + 4, ri: BORE / 2, l: 300, axis: 'y', at: [x, H0 - 150, 0], seg: 32 })));
  const testa = T.merge(XS.map(x => T.cylinder({ r: BORE / 2 + 4, l: 10, axis: 'y', at: [x, H0 + 5, 0], seg: 32 })));
  /* albero motore: perni a 0° per i cilindri 1 e 4, a 180° per 2 e 3 */
  const crank = [T.cylinder({ r: 26, l: 760, axis: 'x', at: [260, 0, 0], seg: 18 })];
  XS.forEach((x, i) => { const s = DEL[i] ? -1 : 1;
    crank.push(T.box({ w: 18, h: r + 60, d: 70, at: [x - 32, s * r / 2, 0] }), T.box({ w: 18, h: r + 60, d: 70, at: [x + 32, s * r / 2, 0] }),
      T.cylinder({ r: 22, l: 64, axis: 'x', at: [x, s * r, 0], seg: 16 })); });
  const volano = T.merge([T.tube({ ro: 260, ri: 236, l: 50, axis: 'x', at: [-120, 0, 0], seg: 56 }), T.cylinder({ r: 60, l: 40, axis: 'x', at: [-120, 0, 0], seg: 20 })]
    .concat([0, 1, 2, 3, 4, 5].map(k => { const g = T.box({ w: 20, h: 190, d: 16, at: [-120, 140, 0] }); g.rotateX(k * Math.PI / 3); return g; })));
  const albero = T.merge(crank.concat([volano, T.box({ w: 30, h: 40, d: 30, at: [-120, 250, 0] })]));
  const pist = () => T.merge([T.cylinder({ r: BORE / 2 - 1, l: PL, axis: 'y', at: [0, PIN + PL / 2 - 70, 0], seg: 32 }), T.cylinder({ r: 9, l: 80, axis: 'x', seg: 12 })]);
  const biel = () => T.merge([rod([0, 0, 0], [0, L, 0], 10), T.tube({ ro: 30, ri: 22, l: 36, axis: 'x', at: [0, 0, 0], seg: 18 }), T.tube({ ro: 16, ri: 9, l: 30, axis: 'x', at: [0, L, 0], seg: 14 })]);
  /* due alberi a camme laterali, mezzo giro per ogni giro dell'albero motore */
  const ZC = 105, YC = r + L - 40;
  const camme = (offs) => T.merge([T.cylinder({ r: 14, l: 640, axis: 'x', at: [260, 0, 0], seg: 12 })]
    .concat(XS.map((x, i) => { const g = T.box({ w: 26, h: 30, d: 30, at: [x, 22, 0] }); g.rotateX(-rad(offs[i]) / 2); return g; })));
  const valv = () => T.merge([T.cylinder({ r: 22, l: 5, axis: 'y', at: [0, 0, 0], seg: 18 }), rod([0, 0, 0], [0, -150, 0], 5)]);
  const gasG = () => T.cylinder({ r: BORE / 2 - 2, l: 1, axis: 'y', at: [0, 0.5, 0], seg: 32 });
  const parts = [
    { id: 'b0', g: blocco(0), ghost: true }, { id: 'b1', g: blocco(1), ghost: true },
    { id: 'canne', g: canne, ghost: true }, { id: 'testa', g: testa },
    { id: 'albero', g: albero }, { id: 'caA', g: camme(OFF.map(o => o + 450)), accent: true, tint: 0.12 }, { id: 'caS', g: camme(OFF.map(o => o + 270)) }
  ];
  XS.forEach((x, i) => {
    parts.push({ id: 'p' + i, g: pist() }, { id: 'c' + i, g: biel() },
      { id: 'va' + i, g: valv(), accent: true, tint: 0.2 }, { id: 'vs' + i, g: valv() },
      { id: 'g' + i, g: gasG(), vol: true, nobox: true }, { id: 'l' + i, g: T.star({ size: 26, at: [0, 0, 0] }), accent: true, nobox: true });
  });
  const cl = (x, lo, hi) => Math.min(hi, Math.max(lo, x));
  return {
    label: 'Modello 3D del motore a quattro cilindri della Mercedes 35 PS: albero motore, pistoni, bielle, due alberi a camme laterali e valvole',
    a0: 0, samples: [0, 90, 180], view: 'iso', buttons: ['iso', 'fianco', 'fronte', 'pianta'], pad: 1.08,
    views: { iso: { az: -36, el: 22 } },
    parts: parts,
    pose(a, H) {
      const tm = ((a % 720) + 720) % 720, th = rad(tm);
      H.albero.rot.x = th;
      H.caA.pos.set(0, YC, ZC); H.caA.rot.x = th / 2; H.caS.pos.set(0, YC, -ZC); H.caS.rot.x = th / 2;
      XS.forEach((x, i) => {
        const ph = th + DEL[i], py = r * Math.cos(ph), pz = r * Math.sin(ph);
        const yp = py + Math.sqrt(L * L - pz * pz);
        H['p' + i].pos.set(x, yp, 0);
        H['c' + i].pos.set(x, py, pz); H['c' + i].rot.x = Math.atan2(-pz, yp - py);
        const t = ((tm - OFF[i]) % 720 + 720) % 720, q = Math.floor(t / 180), u = (t % 180) / 180;
        /* t 0-180 espansione, 180-360 scarico, 360-540 aspirazione, 540-720 compressione */
        const la = q === 2 ? 14 * Math.sin(Math.PI * u) : 0, ls = q === 1 ? 14 * Math.sin(Math.PI * u) : 0;
        H['va' + i].pos.set(x, H0 - la, 100); H['vs' + i].pos.set(x, H0 - ls, -100);
        const crown = yp + PIN;
        H['g' + i].pos.set(x, crown, 0); H['g' + i].scl.y = Math.max(2, H0 - crown);
        const al = [0.55 * (1 - u * 0.8), 0.1 * (1 - u), 0.06 + 0.2 * u, 0.26 + 0.25 * u][q];
        H['g' + i].alpha(cl(al, 0.03, 0.6));
        H['l' + i].pos.set(x, H0 - 20, 0); H['l' + i].alpha(t < 25 || t > 712 ? 1 : 0);
      });
    }
  };
}
