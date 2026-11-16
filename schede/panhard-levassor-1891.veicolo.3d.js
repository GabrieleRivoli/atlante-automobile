/* Panhard & Levassor 1891: sagoma 3D molto semplificata, solo per le proporzioni (unità: mm, avanti = +X, suolo y = 0, asse posteriore a x = 0).
   Da fonte: soltanto la disposizione (motore anteriore, cambio, trasmissione a catena all'asse posteriore, radiatore anteriore, sterzo a timone, ruote con pneumatici pieni).
   Stima, perché le fonti rilette non riportano misure: passo (1.500 mm), diametri delle ruote (1.000 e 900 mm), carreggiata, telaio, posizione di sedile, motore, cambio, radiatore e catena. */
export function build(T) {
  const WB = 1500, RR = 500, RF = 450, TK = 600;
  const rod = (a, b, r) => T.rod({ a: a, b: b, r: r, seg: 10 });
  const wR = T.wheel({ R: RR, w: 40, tyre: 22, spokes: 14, hub: 56, sp: 12, axis: 'z' });
  const wF = T.wheel({ R: RF, w: 40, tyre: 22, spokes: 12, hub: 52, sp: 12, axis: 'z' });
  const asseP = T.cylinder({ r: 24, l: 2 * TK, axis: 'z', seg: 14 });
  const asseA = T.cylinder({ r: 22, l: 2 * TK, axis: 'z', seg: 14 });
  const telaio = T.merge([
    rod([-250, 600, -400], [1800, 600, -400], 22), rod([-250, 600, 400], [1800, 600, 400], 22),
    rod([-250, 600, -400], [-250, 600, 400], 20), rod([WB, 600, -400], [WB, 600, 400], 20), rod([1800, 600, -400], [1800, 600, 400], 20)
  ]);
  const sedile = T.merge([T.box({ w: 700, h: 60, d: 760, at: [220, 880, 0] }), T.box({ w: 40, h: 300, d: 760, at: [-130, 1040, 0] })]);
  const cil = s => { const g = T.cylinder({ r: 62, l: 240, axis: 'y', at: [0, 120, 0], seg: 24 }); g.rotateX(s * 0.44); g.translate(1330, 800, s * 70); return g; };
  const motore = T.merge([T.box({ w: 460, h: 200, d: 380, at: [1330, 700, 0] }), cil(1), cil(-1)]);
  const radiatore = T.box({ w: 60, h: 420, d: 520, at: [1700, 840, 0] });
  const cambio = T.box({ w: 360, h: 240, d: 320, at: [800, 720, 0] });
  const catena = T.merge([
    rod([620, 640, 140], [0, 650, 140], 7), rod([620, 540, 140], [0, 350, 140], 7),
    T.cylinder({ r: 55, l: 24, axis: 'z', at: [620, 590, 140], seg: 24 }), T.cylinder({ r: 150, l: 24, axis: 'z', at: [0, RR, 140], seg: 36 })
  ]);
  const timone = T.merge([rod([WB, 560, 0], [450, 1100, 0], 14), rod([450, 1100, -90], [450, 1100, 90], 12)]);
  const suolo = T.box({ w: 4600, h: 2, d: 2800, at: [800, -1, 0] });
  const uomo = T.person({ at: [900, 0, 1250] });
  return {
    label: 'Modello 3D molto semplificato della Panhard & Levassor del 1891 con una figura umana di 1,75 m come scala',
    a0: 0, samples: [0], view: 'iso', buttons: ['iso', 'pianta', 'fianco', 'fronte'], pad: 1.1,
    views: { iso: { az: -42, el: 22 } },
    parts: [
      { id: 'suolo', g: suolo, ghost: true, nobox: true },
      { id: 'rd', g: wR }, { id: 'rs', g: wR }, { id: 'fd', g: wF }, { id: 'fs', g: wF },
      { id: 'asseP', g: asseP }, { id: 'asseA', g: asseA }, { id: 'telaio', g: telaio }, { id: 'sedile', g: sedile },
      { id: 'motore', g: motore, accent: true, tint: 0.1 }, { id: 'radiatore', g: radiatore },
      { id: 'cambio', g: cambio, accent: true, tint: 0.2 }, { id: 'catena', g: catena, accent: true },
      { id: 'timone', g: timone }, { id: 'uomo', g: uomo, ghost: true }
    ],
    pose(a, H) {
      H.rd.pos.set(0, RR, TK); H.rs.pos.set(0, RR, -TK); H.asseP.pos.set(0, RR, 0);
      H.fd.pos.set(WB, RF, TK); H.fs.pos.set(WB, RF, -TK); H.asseA.pos.set(WB, RF, 0);
    }
  };
}
