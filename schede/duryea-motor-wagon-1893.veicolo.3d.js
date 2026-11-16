/* Duryea Motor Wagon 1893: sagoma 3D molto semplificata, solo per le proporzioni (unità: mm, avanti = +X, suolo y = 0, asse posteriore a x = 0).
   Da fonte: ingombri complessivi 81 x 64 x 97 pollici (205,7 x 162,6 x 246,4 cm; Smithsonian, scheda dell'oggetto), che qui si leggono come altezza, larghezza e lunghezza (assegnazione non indicata dalla fonte);
   ruote di 54 pollici (137 cm; tabella di Wikipedia, senza dire se diametro né quale asse); motore monocilindrico quasi orizzontale sotto il pianale, con la testa sopra l'asse posteriore (Smithsonian Newsdesk).
   Stima: passo (1.700 mm), carreggiata, ruote anteriori (1.000 mm), telaio, pianale, sedile, posizione e dimensioni del motore e del volano. Trasmissione e sterzo non sono modellati: le fonti rilette non li descrivono. */
export function build(T) {
  const WB = 1700, RR = 686, RF = 500, TK = 700;
  const rod = (a, b, r) => T.rod({ a: a, b: b, r: r, seg: 10 });
  const wR = T.wheel({ R: RR, w: 30, tyre: 18, spokes: 16, hub: 50, sp: 10, axis: 'z' });
  const wF = T.wheel({ R: RF, w: 30, tyre: 18, spokes: 14, hub: 46, sp: 10, axis: 'z' });
  const asseP = T.cylinder({ r: 22, l: 2 * TK, axis: 'z', seg: 14 });
  const asseA = T.cylinder({ r: 20, l: 2 * TK, axis: 'z', seg: 14 });
  const telaio = T.merge([
    rod([-450, 860, -480], [2014, 860, -480], 18), rod([-450, 860, 480], [2014, 860, 480], 18),
    rod([-450, 860, -480], [-450, 860, 480], 16), rod([WB, 860, -480], [WB, 860, 480], 16), rod([2014, 860, -480], [2014, 860, 480], 16)
  ]);
  const pianale = T.box({ w: 1500, h: 30, d: 900, at: [450, 890, 0] });
  const sedile = T.merge([T.box({ w: 700, h: 70, d: 800, at: [150, 1080, 0] }), T.box({ w: 40, h: 330, d: 800, at: [-190, 1240, 0] })]);
  const cilindro = T.tube({ ro: 62, ri: 48, l: 340, axis: 'x', at: [170, 770, 0], seg: 28 });
  const basamento = T.box({ w: 220, h: 260, d: 300, at: [480, 770, 0] });
  const volano = T.tube({ ro: 250, ri: 232, l: 28, axis: 'z', at: [480, 770, 190], seg: 48 });
  const leva = T.merge([rod([WB, 900, 0], [1300, 1250, 0], 12), rod([1300, 1250, -80], [1300, 1250, 80], 10)]);
  const suolo = T.box({ w: 4600, h: 2, d: 3000, at: [900, -1, 0] });
  const uomo = T.person({ at: [900, 0, 1350] });
  return {
    label: 'Modello 3D molto semplificato del Duryea Motor Wagon del 1893 con una figura umana di 1,75 m come scala',
    a0: 0, samples: [0], view: 'iso', buttons: ['iso', 'pianta', 'fianco', 'fronte'], pad: 1.1,
    views: { iso: { az: -42, el: 22 } },
    parts: [
      { id: 'suolo', g: suolo, ghost: true, nobox: true },
      { id: 'rd', g: wR }, { id: 'rs', g: wR }, { id: 'fd', g: wF }, { id: 'fs', g: wF },
      { id: 'asseP', g: asseP }, { id: 'asseA', g: asseA }, { id: 'telaio', g: telaio }, { id: 'pianale', g: pianale }, { id: 'sedile', g: sedile },
      { id: 'cil', g: cilindro, accent: true, tint: 0.1 }, { id: 'bas', g: basamento, accent: true, tint: 0.2 }, { id: 'vol', g: volano, accent: true, tint: 0.08 },
      { id: 'leva', g: leva }, { id: 'uomo', g: uomo, ghost: true }
    ],
    pose(a, H) {
      H.rd.pos.set(0, RR, TK); H.rs.pos.set(0, RR, -TK); H.asseP.pos.set(0, RR, 0);
      H.fd.pos.set(WB, RF, TK); H.fs.pos.set(WB, RF, -TK); H.asseA.pos.set(WB, RF, 0);
    }
  };
}
