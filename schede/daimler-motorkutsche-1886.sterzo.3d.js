/* Daimler Motorkutsche: sterzo a ralla, modello 3D (unità: mm, avanti = +X). Posa: a = angolo di sterzata in gradi.
   Misure indicative; solo il passo (1.300 mm) viene da fonte. */
export function build(T) {
  const RR = 520, RF = 420, WB = 1300, TK = 600, rad = d => d * Math.PI / 180;
  const rod = (a, b, r) => T.rod({ a: a, b: b, r: r, seg: 10 });
  const wR = T.wheel({ R: RR, w: 60, tyre: 24, spokes: 14, hub: 60, sp: 14, axis: 'z' });
  const wF = T.wheel({ R: RF, w: 56, tyre: 22, spokes: 12, hub: 52, sp: 13, axis: 'z' });
  const asseP = T.cylinder({ r: 22, l: 2 * TK, axis: 'z', seg: 14 });
  const asseA = T.cylinder({ r: 20, l: 2 * TK, axis: 'z', seg: 14 });
  const telaio = T.merge([
    rod([-300, 640, -430], [WB, 640, -430], 14), rod([-300, 640, 430], [WB, 640, 430], 14),
    rod([-300, 640, -430], [-300, 640, 430], 14), rod([WB - 500, 640, -430], [WB - 500, 640, 430], 14)
  ]);
  const ralla = T.merge([T.tube({ ro: 230, ri: 205, l: 30, axis: 'y', seg: 48 }), T.cylinder({ r: 26, l: 160, axis: 'y', seg: 20 })]);
  const leva = T.merge([T.box({ w: 520, h: 26, d: 30, at: [260, 0, 0] }), T.cylinder({ r: 30, l: 60, axis: 'y', at: [520, 0, 0], seg: 14 })]);
  const suolo = T.box({ w: 3200, h: 2, d: 1900, at: [550, -1, 0] });
  return {
    label: 'Modello 3D dello sterzo a ralla: l\'intero avantreno ruota attorno a un perno centrale',
    a0: 0, samples: [-30, 0, 30], view: 'pianta', buttons: ['iso', 'pianta'], pad: 1.1,
    views: { iso: { az: -35, el: 30 } },
    parts: [
      { id: 'suolo', g: suolo, ghost: true, nobox: true },
      { id: 'rd', g: wR }, { id: 'rs', g: wR }, { id: 'asseP', g: asseP }, { id: 'telaio', g: telaio },
      { id: 'ralla', g: ralla, accent: true, tint: 0.12 },
      { id: 'asseA', g: asseA }, { id: 'fd', g: wF }, { id: 'fs', g: wF }, { id: 'leva', g: leva, accent: true, tint: 0.3 }
    ],
    pose(a, H) {
      const k = rad(-a);
      H.rd.pos.set(0, RR, TK); H.rs.pos.set(0, RR, -TK); H.asseP.pos.set(0, RR, 0);
      H.ralla.pos.set(WB, 640, 0);
      /* avantreno: ruota attorno al perno (asse Y per x = WB) */
      const c = Math.cos(k), s = Math.sin(k), put = (h, lx, ly, lz) => { h.pos.set(WB + lx * c + lz * s, ly, -lx * s + lz * c); h.rot.y = k; };
      put(H.asseA, 0, RF, 0); put(H.fd, 0, RF, TK); put(H.fs, 0, RF, -TK); put(H.leva, 0, 700 - 0, 0);
    }
  };
}
