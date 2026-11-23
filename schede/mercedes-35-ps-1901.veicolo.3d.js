/* Mercedes 35 PS 1901: sagoma 3D molto semplificata, solo per le proporzioni (unità: mm, avanti = +X, suolo y = 0, asse posteriore a x = 0).
   Da fonte (Wikipedia, Mercedes 35 hp): passo 2.345 mm, carreggiata 1.400 mm, lunghezza 2.766 mm, larghezza 1.345 mm, altezza 1.300 mm,
   ruote anteriori 910 x 90 mm e posteriori 1.020 x 120 mm a 12 razze, motore anteriore sopra l'assale, telaio in acciaio stampato a sezione a U,
   piantone dello sterzo inclinato all'indietro, leva del cambio a destra del guidatore, trasmissione finale a catena.
   Stima: sbalzi, altezza e sezione del telaio, cofano, radiatore, sedili, posizione dell'albero intermedio e dei pignoni, inclinazione del piantone. */
export function build(T) {
  const WB = 2345, RF = 455, RR = 510, TK = 700, XR = -250, XF = 2516, FY = 620, FZ = 420;
  const rod = (a, b, r) => T.rod({ a: a, b: b, r: r, seg: 10 });
  const wF = T.wheel({ R: RF, w: 90, tyre: 60, spokes: 12, hub: 70, sp: 30, axis: 'z' });
  const wR = T.wheel({ R: RR, w: 120, tyre: 70, spokes: 12, hub: 80, sp: 34, axis: 'z' });
  const asseA = T.box({ w: 70, h: 60, d: 2 * TK - 80, at: [WB, RF, 0] });
  const asseP = T.cylinder({ r: 34, l: 2 * TK - 100, axis: 'z', at: [0, RR, 0], seg: 16 });
  /* longheroni a U in acciaio stampato */
  const lon = z => T.merge([T.box({ w: XF - 80 - XR, h: 120, d: 8, at: [(XF - 80 + XR) / 2, FY, z] }),
    T.box({ w: XF - 80 - XR, h: 8, d: 50, at: [(XF - 80 + XR) / 2, FY + 56, z + (z > 0 ? -21 : 21)] }),
    T.box({ w: XF - 80 - XR, h: 8, d: 50, at: [(XF - 80 + XR) / 2, FY - 56, z + (z > 0 ? -21 : 21)] })]);
  const telaio = T.merge([lon(FZ), lon(-FZ), T.box({ w: 60, h: 100, d: 2 * FZ, at: [XR + 30, FY, 0] }), T.box({ w: 60, h: 100, d: 2 * FZ, at: [1600, FY, 0] })]);
  const molle = T.merge([[WB, RF, FZ], [WB, RF, -FZ], [0, RR, FZ], [0, RR, -FZ]].map(p => T.box({ w: 900, h: 40, d: 60, at: [p[0], p[1] + 70, p[2]] })));
  const cofano = T.merge([T.box({ w: 760, h: 380, d: 760, at: [2060, FY + 250, 0] })]);
  const radiatore = T.box({ w: 80, h: 600, d: 820, at: [XF - 40, FY + 260, 0] });
  const parafiamma = T.box({ w: 30, h: 520, d: 1000, at: [1665, FY + 300, 0] });
  const cassa = T.box({ w: 1650, h: 260, d: 1100, at: [800, FY + 190, 0] });
  const sedili = T.merge([T.box({ w: 520, h: 120, d: 1000, at: [1050, FY + 380, 0] }), T.box({ w: 70, h: 360, d: 1000, at: [770, FY + 500, 0] }),
    T.box({ w: 560, h: 120, d: 1000, at: [220, FY + 380, 0] }), T.box({ w: 70, h: 360, d: 1000, at: [-90, FY + 500, 0] })]);
  const sterzo = T.merge([rod([1600, FY + 300, 230], [1260, 1180, 230], 16), T.tube({ ro: 210, ri: 192, l: 20, axis: 'y', at: [1260, 1180, 230], seg: 40 })]);
  const leva = T.merge([rod([1150, FY + 120, 620], [1250, 1150, 620], 10), T.sphere({ r: 24, at: [1250, 1150, 620] }), rod([1080, FY + 120, 620], [1080, 1050, 620], 10)]);
  /* trasmissione finale a catena, una per lato */
  const XC = 650, YC = 560, RC = 90, RS = 240, ZC = 640;
  const cat = z => T.merge([T.tube({ ro: RC, ri: RC - 16, l: 24, axis: 'z', at: [XC, YC, z], seg: 28 }), T.tube({ ro: RS, ri: RS - 18, l: 24, axis: 'z', at: [0, RR, z], seg: 40 }),
    rod([XC, YC + RC, z], [0, RR + RS, z], 6), rod([XC, YC - RC, z], [0, RR - RS, z], 6)]);
  const catene = T.merge([cat(ZC), cat(-ZC), T.cylinder({ r: 24, l: 2 * ZC, axis: 'z', at: [XC, YC, 0], seg: 12 })]);
  const suolo = T.box({ w: 5200, h: 2, d: 3600, at: [1100, -1, 0] });
  const uomo = T.person({ at: [1100, 0, -1350] });
  return {
    label: 'Modello 3D molto semplificato della Mercedes 35 PS del 1901 con una figura umana di 1,75 m come scala',
    a0: 0, samples: [0], view: 'iso', buttons: ['iso', 'pianta', 'fianco', 'fronte'], pad: 1.1,
    views: { iso: { az: -40, el: 20 } },
    parts: [
      { id: 'suolo', g: suolo, ghost: true, nobox: true },
      { id: 'fd', g: wF }, { id: 'fs', g: wF }, { id: 'rd', g: wR }, { id: 'rs', g: wR },
      { id: 'asseA', g: asseA }, { id: 'asseP', g: asseP }, { id: 'molle', g: molle },
      { id: 'telaio', g: telaio, accent: true, tint: 0.12 },
      { id: 'cassa', g: cassa }, { id: 'sedili', g: sedili }, { id: 'parafiamma', g: parafiamma },
      { id: 'cofano', g: cofano }, { id: 'rad', g: radiatore, accent: true, tint: 0.3 },
      { id: 'sterzo', g: sterzo }, { id: 'leva', g: leva }, { id: 'catene', g: catene, accent: true, tint: 0.05 },
      { id: 'uomo', g: uomo, ghost: true }
    ],
    pose(a, H) {
      H.fd.pos.set(WB, RF, TK); H.fs.pos.set(WB, RF, -TK); H.rd.pos.set(0, RR, TK); H.rs.pos.set(0, RR, -TK);
    }
  };
}
