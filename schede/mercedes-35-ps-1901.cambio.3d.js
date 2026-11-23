/* Mercedes 35 PS 1901: cambio a settore guidato ("gate change"), schema 3D di principio (unità: mm, avanti = +X). Posa: a = sequenza 0..1500 (quindici tratti di leva).
   Da fonte: cambio a settore guidato con quattro marce avanti e retromarcia, leva a destra del guidatore (Wikipedia, Mercedes 35 hp); "gate type gear shifting" (The Henry Ford, foglio dattiloscritto).
   Stima: disegno della griglia (due corsie per le quattro marce e una per la retromarcia, collegate da un corridoio di folle), misure, fulcro della leva, aste di selezione e forcelle.
   Gli ingranaggi non sono modellati: la figura mostra soltanto come la leva sceglie un'asta alla volta e la sposta. */
export function build(T) {
  const PY = 300, LB = 260, ZR = -80, Z12 = -30, Z34 = 30, XG = 60;
  const rod = (a, b, r) => T.rod({ a: a, b: b, r: r, seg: 10 });
  /* piastra con il contorno delle feritoie */
  const piastra = T.box({ w: 260, h: 10, d: 260, at: [0, PY - 6, -20] });
  const slot = (z, x0, x1) => T.merge([rod([x0, PY, z - 9], [x1, PY, z - 9], 2.5), rod([x0, PY, z + 9], [x1, PY, z + 9], 2.5),
    rod([x0, PY, z - 9], [x0, PY, z + 9], 2.5), rod([x1, PY, z - 9], [x1, PY, z + 9], 2.5)]);
  const feritoie = T.merge([slot(Z12, -XG - 10, XG + 10), slot(Z34, -XG - 10, XG + 10), slot(ZR, -10, XG + 10),
    rod([-7, PY, ZR - 9], [-7, PY, Z34 + 9], 2.5), rod([7, PY, ZR - 9], [7, PY, Z34 + 9], 2.5)]);
  const leva = T.merge([rod([0, -LB, 0], [0, 430, 0], 9), T.sphere({ r: 26, at: [0, 430, 0] }), T.sphere({ r: 20, at: [0, 0, 0] }), T.sphere({ r: 14, at: [0, -LB, 0] })]);
  const fulcro = T.merge([T.box({ w: 80, h: 30, d: 80, at: [0, -30, 0] }), rod([0, -30, -60], [0, -30, 60], 6)]);
  /* tre aste di selezione sotto il fulcro: la leva, incernierata, muove l'estremità inferiore in senso opposto */
  const zr = z => -z * LB / PY;
  const asta = () => T.merge([rod([-260, 0, 0], [260, 0, 0], 9), T.box({ w: 26, h: 80, d: 14, at: [180, -50, 0] }), T.box({ w: 30, h: 30, d: 30, at: [0, 0, 0] })]);
  const guide = T.merge([ZR, Z12, Z34].map(z => T.merge([T.box({ w: 20, h: 40, d: 30, at: [-230, -LB - 12, zr(z)] }), T.box({ w: 20, h: 40, d: 30, at: [230, -LB - 12, zr(z)] })])));
  const PATH = [[0, 0], [0, Z12], [-XG, Z12], [0, Z12], [XG, Z12], [0, Z12], [0, Z34], [-XG, Z34], [0, Z34], [XG, Z34], [0, Z34], [0, 0], [0, ZR], [XG, ZR], [0, ZR], [0, 0]];
  const sm = x => x * x * (3 - 2 * x);
  const at = a => { const s = Math.min(PATH.length - 1.0001, Math.max(0, a / 100)), i = Math.floor(s), f = sm(s - i), p = PATH[i], q = PATH[i + 1];
    return [p[0] + (q[0] - p[0]) * f, p[1] + (q[1] - p[1]) * f]; };
  return {
    label: 'Schema 3D di principio del cambio a settore guidato della Mercedes 35 PS: leva, piastra con feritoie e tre aste di selezione',
    a0: 0, samples: [0, 200, 900, 1300], view: 'iso', buttons: ['iso', 'pianta', 'fianco', 'fronte'], pad: 1.12,
    views: { iso: { az: -50, el: 28 } },
    parts: [
      { id: 'piastra', g: piastra, ghost: true }, { id: 'fer', g: feritoie, accent: true, tint: 0.05 },
      { id: 'fulcro', g: fulcro }, { id: 'guide', g: guide, ghost: true },
      { id: 'aR', g: asta() }, { id: 'a12', g: asta() }, { id: 'a34', g: asta() },
      { id: 'leva', g: leva, accent: true, tint: 0.25 }
    ],
    pose(a, H) {
      const p = at(a), x = p[0], z = p[1];
      H.leva.rot.set(Math.atan(z / PY), 0, -Math.atan(x / PY));
      const xb = -x * LB / PY;
      const near = (zz) => Math.abs(z - zz) < 6;
      H.aR.pos.set(near(ZR) ? xb : 0, -LB, zr(ZR)); H.a12.pos.set(near(Z12) ? xb : 0, -LB, zr(Z12)); H.a34.pos.set(near(Z34) ? xb : 0, -LB, zr(Z34));
    }
  };
}
