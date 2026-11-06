/* Daimler Motorkutsche: modello 3D molto semplificato, solo per le proporzioni (unità: mm, avanti = +X, suolo y = 0).
   Dati usati: passo 1.300 mm (Wikipedia). Diametri delle ruote, carrozzeria, posizione del motore: stima indicativa. */
export function build(T) {
  const RR = 520, RF = 420, WB = 1300, TK = 600;
  const rod = (a, b, r) => T.rod({ a: a, b: b, r: r, seg: 10 });
  const wR = T.wheel({ R: RR, w: 60, tyre: 24, spokes: 14, hub: 60, sp: 14, axis: 'z' });
  const wF = T.wheel({ R: RF, w: 56, tyre: 22, spokes: 12, hub: 52, sp: 13, axis: 'z' });
  const assi = T.merge([T.cylinder({ r: 22, l: 2 * TK, axis: 'z', at: [0, RR, 0], seg: 14 }), T.cylinder({ r: 20, l: 2 * TK, axis: 'z', at: [WB, RF, 0], seg: 14 })]);
  const FL = 790;                               /* quota del pianale */
  const cassa = T.merge([
    T.box({ w: 1800, h: 50, d: 1000, at: [150, FL, 0] }),
    T.box({ w: 1800, h: 300, d: 36, at: [150, FL + 175, 500] }), T.box({ w: 1800, h: 300, d: 36, at: [150, FL + 175, -500] }),
    T.box({ w: 36, h: 300, d: 1000, at: [-750, FL + 175, 0] }),
    rod([WB, RF, 0], [WB, FL - 25, 0], 14)
  ]);
  const sedili = T.merge([
    T.box({ w: 420, h: 80, d: 900, at: [-500, FL + 100, 0] }), T.box({ w: 40, h: 330, d: 900, at: [-690, FL + 260, 0] }),
    T.box({ w: 420, h: 80, d: 900, at: [520, FL + 100, 0] }), T.box({ w: 40, h: 330, d: 900, at: [710, FL + 260, 0] })
  ]);
  const motore = T.merge([
    T.box({ w: 280, h: 190, d: 260, at: [-80, FL + 120, 0] }),
    T.cylinder({ r: 50, l: 380, axis: 'y', at: [-80, FL + 405, 0], seg: 28 }),
    T.cylinder({ r: 58, l: 40, axis: 'y', at: [-80, FL + 615, 0], seg: 28 })
  ]);
  const leva = T.merge([rod([WB - 220, FL + 25, 0], [WB - 360, FL + 360, 0], 11), rod([WB - 360, FL + 360, 0], [WB - 560, FL + 360, 0], 10)]);
  const suolo = T.box({ w: 4000, h: 2, d: 2000, at: [450, -1, 0] });
  const uomo = T.person({ at: [2400, 0, 0] });
  return {
    label: 'Modello 3D molto semplificato della Daimler Motorkutsche con una figura umana di 1,75 m come scala',
    a0: 0, samples: [0], view: 'iso', buttons: ['iso', 'pianta', 'fianco', 'fronte'], pad: 1.12,
    views: { iso: { az: -42, el: 22 } },
    parts: [
      { id: 'suolo', g: suolo, ghost: true, nobox: true },
      { id: 'rd', g: wR }, { id: 'rs', g: wR }, { id: 'fd', g: wF }, { id: 'fs', g: wF },
      { id: 'assi', g: assi }, { id: 'cassa', g: cassa }, { id: 'sedili', g: sedili },
      { id: 'motore', g: motore, accent: true, tint: 0.1 }, { id: 'leva', g: leva },
      { id: 'uomo', g: uomo, ghost: true }
    ],
    pose(a, H) {
      H.rd.pos.set(0, RR, TK); H.rs.pos.set(0, RR, -TK); H.fd.pos.set(WB, RF, TK); H.fs.pos.set(WB, RF, -TK);
    }
  };
}
