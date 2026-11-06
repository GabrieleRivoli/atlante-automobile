/* Benz Patent-Motorwagen: modello 3D molto semplificato del veicolo, solo per le proporzioni (unità: mm, avanti = +X, suolo y = 0).
   Dati usati: passo 1.450 mm, carreggiata posteriore 1.190 mm, ruote posteriori 1.260 mm (Wikipedia). Ruota anteriore, telaio, sedile e motore: stima indicativa. */
export function build(T) {
  const RR = 630, RF = 360, WB = 1450, TR = 595;
  const rod = (a, b, r) => T.rod({ a: a, b: b, r: r, seg: 10 });
  const wheelR = T.wheel({ R: RR, w: 44, tyre: 22, spokes: 20, hub: 50, sp: 8, axis: 'z' });
  const wheelF = T.wheel({ R: RF, w: 36, tyre: 18, spokes: 16, hub: 36, sp: 6, axis: 'z' });
  const asse = T.cylinder({ r: 16, l: 2 * TR, axis: 'z', at: [0, RR, 0], seg: 14 });
  const telaio = T.merge([
    rod([-380, 720, -250], [1300, 720, -250], 14), rod([-380, 720, 250], [1300, 720, 250], 14),
    rod([-380, 720, -250], [-380, 720, 250], 12), rod([300, 720, -250], [300, 720, 250], 12),
    rod([1300, 720, -250], [1420, 860, 0], 14), rod([1300, 720, 250], [1420, 860, 0], 14)
  ]);
  const sedile = T.merge([
    T.box({ w: 640, h: 90, d: 900, at: [60, 820, 0] }),
    T.box({ w: 50, h: 380, d: 900, at: [-250, 1040, 0] })
  ]);
  const motore = T.merge([
    T.tube({ ro: 240, ri: 215, l: 34, axis: 'y', at: [-60, 560, 0], seg: 48 }),
    T.cylinder({ r: 38, l: 60, axis: 'y', at: [-60, 560, 0], seg: 20 }),
    T.cylinder({ r: 56, l: 330, axis: 'x', at: [-285, 560, 0], seg: 24 }),
    T.box({ w: 190, h: 150, d: 200, at: [-110, 700, 0] })
  ]);
  const serbatoio = T.box({ w: 220, h: 140, d: 260, at: [-520, 700, 0] });
  const forcella = T.merge([
    rod([WB, RF, 0], [WB + 20, 900, 0], 13),
    rod([WB + 20, 900, 0], [1420, 1130, 0], 11),
    rod([1420, 1130, 0], [980, 1130, 0], 10),
    T.cylinder({ r: 24, l: 70, axis: 'x', at: [960, 1130, 0], seg: 12 })
  ]);
  const suolo = T.box({ w: 4000, h: 2, d: 2000, at: [450, -1, 0] });
  const uomo = T.person({ at: [2250, 0, 0] });
  return {
    label: 'Modello 3D molto semplificato del Benz Patent-Motorwagen con una figura umana di 1,75 m come scala',
    a0: 0, samples: [0], view: 'iso', buttons: ['iso', 'pianta', 'fianco', 'fronte'], pad: 1.12,
    views: { iso: { az: -42, el: 22 } },
    parts: [
      { id: 'suolo', g: suolo, ghost: true, nobox: true },
      { id: 'rd', g: wheelR }, { id: 'rs', g: wheelR }, { id: 'f', g: wheelF },
      { id: 'asse', g: asse }, { id: 'telaio', g: telaio }, { id: 'sedile', g: sedile },
      { id: 'motore', g: motore, accent: true, tint: 0.1 }, { id: 'serb', g: serbatoio }, { id: 'forcella', g: forcella },
      { id: 'uomo', g: uomo, ghost: true }
    ],
    pose(a, H) {
      H.rd.pos.set(0, RR, TR); H.rs.pos.set(0, RR, -TR); H.f.pos.set(WB, RF, 0);
    }
  };
}
