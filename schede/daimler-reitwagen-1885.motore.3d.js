/* Daimler Reitwagen: manovellismo e ciclo a quattro tempi, modello 3D (unità: mm). Posa: a = angolo di manovella in gradi, 0..720 (due giri).
   Da fonte: alesaggio 58 mm, corsa 100 mm, rapporto di compressione 2,3:1 (scheda tecnica di motorradundreisen.de), due volani (Wikipedia).
   Stima: lunghezza di biella (200 mm), altezza del pistone, diametro dei volani, forma della testa e posizione delle valvole.
   Altezza della camera al punto morto superiore: corsa / (rapporto - 1) = 100 / 1,3 = circa 77 mm, calcolata. L'azionamento della valvola di scarico non è documentato nelle fonti rilette: nel modello si apre durante lo scarico. */
export function build(T) {
  const r = 50, L = 200, BORE = 58, CH = 77, PIN = 40, rad = d => d * Math.PI / 180;
  const rod = (a, b, rr) => T.rod({ a: a, b: b, r: rr, seg: 10 });
  const yTDC = r + L, headY = yTDC + PIN + CH;
  const cilindro = T.tube({ ro: 33, ri: BORE / 2, l: headY - 110, axis: 'y', at: [0, (headY + 110) / 2, 0], seg: 36 });
  const testa = T.merge([
    T.cylinder({ r: 36, l: 14, axis: 'y', at: [0, headY + 7, 0], seg: 36 }),
    rod([-15, headY, 0], [-15, headY + 40, 0], 4), rod([15, headY, 0], [15, headY + 40, 0], 4)
  ]);
  const vIn = T.merge([T.cylinder({ r: 11, l: 4, axis: 'y', at: [0, -2, 0], seg: 18 }), rod([0, 0, 0], [0, 40, 0], 4)]);
  const vEx = T.merge([T.cylinder({ r: 11, l: 4, axis: 'y', at: [0, -2, 0], seg: 18 }), rod([0, 0, 0], [0, 40, 0], 4)]);
  const tubo = T.merge([T.tube({ ro: 9, ri: 5, l: 60, axis: 'x', at: [66, headY - 40, 0], seg: 14 }), rod([66, headY - 40, 0], [66, headY - 170, 0], 4)]);
  const fiamma = T.star({ size: 10, at: [66, headY - 58, 0] });
  const pistone = T.merge([T.cylinder({ r: BORE / 2 - 1, l: 70, axis: 'y', at: [0, 5, 0], seg: 32 }), T.cylinder({ r: 7, l: 60, axis: 'z', seg: 12 })]);
  const biella = T.merge([rod([0, 0, 0], [L, 0, 0], 8), T.tube({ ro: 14, ri: 8, l: 20, axis: 'z', at: [0, 0, 0], seg: 16 }), T.tube({ ro: 16, ri: 8, l: 24, axis: 'z', at: [L, 0, 0], seg: 16 })]);
  const ruotaV = z => T.merge([T.tube({ ro: 190, ri: 174, l: 18, axis: 'z', at: [0, 0, z], seg: 56 }), T.cylinder({ r: 34, l: 22, axis: 'z', at: [0, 0, z], seg: 20 })].concat([0, 1, 2, 3, 4].map(k => { const g = T.box({ w: 150, h: 12, d: 12, at: [100, 0, z] }); g.rotateZ(k * 2 * Math.PI / 5); return g; })));
  const manovella = T.merge([ruotaV(60), ruotaV(-60), rod([0, 0, 40], [0, r, 40], 11), rod([0, 0, -40], [0, r, -40], 11), T.cylinder({ r: 13, l: 80, axis: 'z', at: [0, r, 0], seg: 16 }), T.cylinder({ r: 16, l: 160, axis: 'z', seg: 16 })]);
  const segno = T.box({ w: 26, h: 30, d: 26, at: [188, 0, 60] });
  const gas = T.cylinder({ r: BORE / 2 - 1.5, l: 1, axis: 'y', at: [0, -0.5, 0], seg: 32 });
  const lampo = T.star({ size: 26, at: [0, headY - 40, 0] });
  const clamp = (x, lo, hi) => Math.min(hi, Math.max(lo, x));
  return {
    label: 'Modello 3D del motore del Reitwagen: pistone, biella, manovella con due volani, valvole e tubo incandescente',
    a0: 0, samples: [0, 180, 90], view: 'fianco', buttons: ['iso', 'fianco', 'fronte'], pad: 1.08,
    views: { iso: { az: -32, el: 24 } },
    parts: [
      { id: 'cil', g: cilindro, ghost: true }, { id: 'testa', g: testa },
      { id: 'vin', g: vIn, accent: true, tint: 0.2 }, { id: 'vex', g: vEx },
      { id: 'tubo', g: tubo, accent: true, tint: 0.08 }, { id: 'fia', g: fiamma, accent: true },
      { id: 'man', g: manovella }, { id: 'segno', g: segno, accent: true, tint: 0.4 },
      { id: 'bie', g: biella }, { id: 'pis', g: pistone },
      { id: 'gas', g: gas, vol: true, nobox: true }, { id: 'lampo', g: lampo, accent: true, nobox: true }
    ],
    pose(a, H) {
      const tm = ((a % 720) + 720) % 720, th = rad(tm), c = tm % 360, ph = Math.floor(tm / 180);
      const px = -r * Math.sin(th), py = r * Math.cos(th);
      const yp = py + Math.sqrt(L * L - px * px);
      H.man.pos.set(0, 0, 0); H.man.rot.z = th; H.segno.pos.set(0, 0, 0); H.segno.rot.z = th;
      H.bie.pos.set(px, py, 0); H.bie.rot.z = Math.atan2(yp - py, -px);
      H.pis.pos.set(0, yp, 0);
      H.testa.pos.set(0, 0, 0); H.tubo.pos.set(0, 0, 0); H.fia.pos.set(0, 0, 0);
      const crown = yp + PIN;
      H.gas.pos.set(0, headY, 0); H.gas.scl.y = Math.max(2, headY - crown);
      const al = [0.10, 0.12 + 0.30 * ((c - 180) / 180), 0.55 * (1 - c / 240), 0.12 * (1 - (c - 180) / 180)][ph];
      H.gas.alpha(clamp(al, 0.03, 0.6));
      const lift = ph === 0 ? 12 * Math.sin(th) : 0, liftE = ph === 3 ? 12 * Math.sin(th - Math.PI) * -1 : 0;
      H.vin.pos.set(-15, headY - lift, 0); H.vex.pos.set(15, headY - Math.abs(liftE), 0);
      H.tubo.alpha(ph === 1 && c > 320 ? 0.3 : ph === 2 ? 0.3 : 0.08);
      H.lampo.alpha(ph === 2 && c < 40 ? 1 : 0);
    }
  };
}
