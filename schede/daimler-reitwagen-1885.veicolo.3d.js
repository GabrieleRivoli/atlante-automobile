/* Daimler Reitwagen: modello 3D molto semplificato, solo per le proporzioni (unità: mm, avanti = +X, suolo y = 0, asse posteriore a x = 0).
   Dati da fonte (scheda tecnica di motorradundreisen.de): passo 1.030 mm, ruote in legno "600 mm" (letto come diametro), cerchioni di ferro larghi 35 mm, larghezza 400 mm, altezza 1.260 mm.
   Stima: telaio, sella, sterzo, posizione e dimensioni degli stabilizzatori, motore, cinghia. La lunghezza di 2.500 mm della stessa scheda non è riproducibile: il modello è più corto. */
export function build(T) {
  const R = 300, WB = 1030, rad = d => d * Math.PI / 180;
  const rod = (a, b, r) => T.rod({ a: a, b: b, r: r, seg: 10 });
  const ruota = T.wheel({ R: R, w: 35, tyre: 16, spokes: 12, hub: 46, sp: 12, axis: 'z' });
  const stab = T.wheel({ R: 95, w: 26, tyre: 9, spokes: 8, hub: 16, sp: 7, axis: 'z' });
  const CX = 330, CY = 440;                                    /* albero motore (stima) */
  const telaio = T.merge([
    T.box({ w: 1500, h: 70, d: 110, at: [500, 400, 0] }),
    rod([WB, R, 0], [WB, 1240, 0], 18),
    rod([WB, R, 60], [WB, 760, 60], 12), rod([WB, R, -60], [WB, 760, -60], 12),
    rod([WB, 1240, -310], [WB, 1240, 310], 13),
    rod([180, 435, 0], [230, 840, 0], 14)
  ]);
  const sella = T.box({ w: 280, h: 55, d: 230, at: [300, 880, 0] });
  const motore = T.merge([
    T.tube({ ro: 34, ri: 29, l: 260, axis: 'y', at: [CX, CY + 245, 0], seg: 28 }),
    T.cylinder({ r: 38, l: 16, axis: 'y', at: [CX, CY + 383, 0], seg: 28 }),
    T.cylinder({ r: 48, l: 90, axis: 'y', at: [CX, CY + 85, 0], seg: 28 })
  ]);
  const volani = T.merge([T.tube({ ro: 150, ri: 138, l: 16, axis: 'z', at: [CX, CY, 70], seg: 40 }), T.tube({ ro: 150, ri: 138, l: 16, axis: 'z', at: [CX, CY, -70], seg: 40 })]);
  const tubo = T.merge([T.tube({ ro: 10, ri: 6, l: 80, axis: 'x', at: [CX + 76, CY + 340, 0], seg: 16 }), rod([CX + 110, CY + 300, 0], [CX + 110, CY + 130, 0], 5)]);
  const cinghia = T.merge([rod([CX, CY + 60, -120], [150, 505, -120], 4), rod([CX, CY - 60, -120], [150, 435, -120], 4), T.cylinder({ r: 60, l: 36, axis: 'z', at: [CX, CY, -120], seg: 28 }), T.cylinder({ r: 110, l: 36, axis: 'z', at: [150, 470, -120], seg: 28 })]);
  const stabs = T.merge([rod([0, 200, 0], [0, 150, 330], 7), rod([0, 200, 0], [0, 150, -330], 7)]);
  const suolo = T.box({ w: 3400, h: 2, d: 1600, at: [700, -1, 0] });
  const uomo = T.person({ at: [1900, 0, 0] });
  return {
    label: 'Modello 3D molto semplificato del Daimler Reitwagen con una figura umana di 1,75 m come scala',
    a0: 0, samples: [0], view: 'iso', buttons: ['iso', 'pianta', 'fianco', 'fronte'], pad: 1.12,
    views: { iso: { az: -42, el: 22 } },
    parts: [
      { id: 'suolo', g: suolo, ghost: true, nobox: true },
      { id: 'rp', g: ruota }, { id: 'ra', g: ruota },
      { id: 'sd', g: stab }, { id: 'ss', g: stab }, { id: 'stabs', g: stabs },
      { id: 'telaio', g: telaio }, { id: 'sella', g: sella },
      { id: 'motore', g: motore, accent: true, tint: 0.1 }, { id: 'volani', g: volani }, { id: 'tubo', g: tubo, accent: true, tint: 0.2 },
      { id: 'cinghia', g: cinghia }, { id: 'uomo', g: uomo, ghost: true }
    ],
    pose(a, H) {
      H.rp.pos.set(0, R, 0); H.ra.pos.set(WB, R, 0);
      H.sd.pos.set(0, 95, 330); H.ss.pos.set(0, 95, -330);
    }
  };
}
