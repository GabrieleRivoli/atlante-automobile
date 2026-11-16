/* Duryea Motor Wagon 1893: motore monocilindrico a quattro tempi con cilindro orizzontale, modello 3D (unità: mm, avanti = +X, testa a sinistra). Posa: a = angolo di manovella, 0..720.
   Da fonte (Smithsonian Newsdesk): un cilindro, quattro tempi, quattro cavalli, raffreddato ad acqua, quasi orizzontale sotto il pianale, testa verso l'asse posteriore, accensione make-and-break, carburatore a spruzzo.
   Stima: alesaggio (90 mm), manovella (60 mm, corsa 120 mm), biella (300 mm), altezza della camera (60 mm), volano, posizione delle valvole, camma e contatto.
   L'azionamento delle valvole non è documentato nelle fonti rilette: nel modello aspirazione e scarico si aprono nelle rispettive fasi. */
export function build(T) {
  const r = 60, L = 300, BORE = 90, PIN = 50, CH = 60, rad = d => d * Math.PI / 180;
  const rod = (a, b, rr) => T.rod({ a: a, b: b, r: rr, seg: 10 });
  const xTDC = -(r + L) - PIN, hx = xTDC - CH;
  const cilindro = T.tube({ ro: 62, ri: BORE / 2, l: 330, axis: 'x', at: [hx + 165, 0, 0], seg: 36 });
  const testa = T.merge([T.cylinder({ r: 64, l: 16, axis: 'x', at: [hx - 8, 0, 0], seg: 36 }),
    rod([hx + 30, 40, 0], [hx + 30, 80, 0], 5), rod([hx + 70, 40, 0], [hx + 70, 80, 0], 5)]);
  const vIn = T.merge([T.cylinder({ r: 13, l: 4, axis: 'y', at: [0, -2, 0], seg: 18 }), rod([0, 0, 0], [0, 50, 0], 4)]);
  const vEx = T.merge([T.cylinder({ r: 13, l: 4, axis: 'y', at: [0, -2, 0], seg: 18 }), rod([0, 0, 0], [0, 50, 0], 4)]);
  const fisso = T.merge([rod([hx + 48, -44, 0], [hx + 48, -20, 0], 4), T.sphere({ r: 6, at: [hx + 48, -20, 0] })]);
  const mobile = T.merge([rod([0, 0, 0], [0, 60, 0], 4), T.sphere({ r: 6, at: [0, 0, 0] })]);
  const pistone = T.merge([T.cylinder({ r: BORE / 2 - 1, l: 90, axis: 'x', at: [-5, 0, 0], seg: 32 }), T.cylinder({ r: 8, l: 70, axis: 'z', seg: 12 })]);
  const biella = T.merge([rod([0, 0, 0], [L, 0, 0], 9), T.tube({ ro: 15, ri: 9, l: 22, axis: 'z', at: [0, 0, 0], seg: 16 }), T.tube({ ro: 18, ri: 9, l: 26, axis: 'z', at: [L, 0, 0], seg: 16 })]);
  const volano = T.merge([T.tube({ ro: 240, ri: 222, l: 24, axis: 'z', at: [0, 0, 70], seg: 56 }), T.cylinder({ r: 40, l: 28, axis: 'z', at: [0, 0, 70], seg: 20 })]
    .concat([0, 1, 2, 3, 4].map(k => { const g = T.box({ w: 190, h: 12, d: 12, at: [130, 0, 70] }); g.rotateZ(k * 2 * Math.PI / 5); return g; })));
  const manovella = T.merge([volano, rod([0, 0, 40], [r, 0, 40], 12), rod([0, 0, -40], [r, 0, -40], 12), T.cylinder({ r: 14, l: 80, axis: 'z', at: [r, 0, 0], seg: 16 }), T.cylinder({ r: 18, l: 190, axis: 'z', at: [0, 0, 20], seg: 16 })]);
  const segno = T.box({ w: 30, h: 30, d: 26, at: [230, 0, 70] });
  const gas = T.cylinder({ r: BORE / 2 - 1.5, l: 1, axis: 'x', at: [0.5, 0, 0], seg: 32 });
  const lampo = T.star({ size: 26, at: [hx + 48, -26, 0] });
  const clamp = (x, lo, hi) => Math.min(hi, Math.max(lo, x));
  const sm = x => x * x * (3 - 2 * x);
  return {
    label: 'Modello 3D del motore monocilindrico del Duryea: pistone, biella, manovella con volano, valvole e contatto make-and-break',
    a0: 0, samples: [0, 180, 90], view: 'fianco', buttons: ['iso', 'fianco', 'pianta'], pad: 1.08,
    views: { iso: { az: -32, el: 24 } },
    parts: [
      { id: 'cil', g: cilindro, ghost: true }, { id: 'testa', g: testa },
      { id: 'vin', g: vIn, accent: true, tint: 0.2 }, { id: 'vex', g: vEx },
      { id: 'fis', g: fisso, accent: true, tint: 0.1 }, { id: 'mob', g: mobile, accent: true, tint: 0.3 },
      { id: 'man', g: manovella }, { id: 'segno', g: segno, accent: true, tint: 0.4 },
      { id: 'bie', g: biella }, { id: 'pis', g: pistone },
      { id: 'gas', g: gas, vol: true, nobox: true }, { id: 'lampo', g: lampo, accent: true, nobox: true }
    ],
    pose(a, H) {
      const tm = ((a % 720) + 720) % 720, th = rad(tm), c = tm % 360, ph = Math.floor(tm / 180);
      const px = -r * Math.cos(th), py = -r * Math.sin(th);
      const xp = px - Math.sqrt(L * L - py * py);
      H.man.pos.set(0, 0, 0); H.man.rot.z = th; H.segno.pos.set(0, 0, 0); H.segno.rot.z = th;
      H.bie.pos.set(px, py, 0); H.bie.rot.z = Math.atan2(-py, xp - px);
      H.pis.pos.set(xp, 0, 0);
      H.testa.pos.set(0, 0, 0); H.fis.pos.set(0, 0, 0);
      const crown = xp - PIN;
      H.gas.pos.set(hx, 0, 0); H.gas.scl.x = Math.max(2, crown - hx);
      const al = [0.10, 0.12 + 0.30 * ((c - 180) / 180), 0.55 * (1 - c / 240), 0.12 * (1 - (c - 180) / 180)][ph];
      H.gas.alpha(clamp(al, 0.03, 0.6));
      const li = ph === 0 ? 12 * Math.sin(Math.PI * c / 180) : 0, le = ph === 3 ? 12 * Math.sin(Math.PI * c / 180) : 0;
      H.vin.pos.set(hx + 30, 40 + li, 0); H.vex.pos.set(hx + 70, 40 + le, 0);
      /* contatto make-and-break: si apre intorno al punto morto superiore di fine compressione (tm 360) */
      const gap = tm > 340 && tm < 420 ? 22 * sm(clamp((tm - 350) / 20, 0, 1)) * (1 - sm(clamp((tm - 385) / 30, 0, 1))) : 0;
      H.mob.pos.set(hx + 48, -8 + gap, 0);
      H.lampo.alpha(tm > 356 && tm < 388 ? 1 : 0);
    }
  };
}
