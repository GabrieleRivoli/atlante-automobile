/* Benz Patent-Motorwagen: schema 3D della trasmissione (unità: mm, avanti = +X). Geometria della cinghia e rapporti di rotazione illustrativi. */
export function build(T) {
  const RR = 630, Y = 630, TR = 595, rad = d => d * Math.PI / 180;
  const FX = 720, CX = 230, SP = 520;              /* volano, contralbero, sporgenza delle catene */
  const rod = (a, b, r) => T.rod({ a: a, b: b, r: r, seg: 8 });
  const wheel = T.wheel({ R: RR, w: 44, tyre: 22, spokes: 20, hub: 50, sp: 8, axis: 'z' });
  const spoke = k => { const g = T.box({ w: 194, h: 12, d: 22, at: [135, 0, 0] }); g.rotateY(k * Math.PI / 3); return g; };
  const volano = T.merge([T.tube({ ro: 250, ri: 232, l: 34, axis: 'y', seg: 64 }), T.cylinder({ r: 38, l: 44, axis: 'y', seg: 24 })].concat([0, 1, 2, 3, 4, 5].map(spoke)));
  const segno = T.box({ w: 30, h: 40, d: 16, at: [250, 0, 0] });
  const puleggia = T.merge([T.cylinder({ r: 80, l: 70, axis: 'z', seg: 36, at: [0, 0, 0] }), T.cylinder({ r: 16, l: 2 * SP + 80, axis: 'z', seg: 14 })]);
  const diff = T.box({ w: 130, h: 130, d: 120, at: [0, 0, 0] });
  const segnoP = T.box({ w: 20, h: 26, d: 74, at: [0, 80, 0] });
  const sprocket = (R, z) => {
    const parts = [T.cylinder({ r: R, l: 14, axis: 'z', seg: 32, at: [0, 0, z] })];
    for (let k = 0; k < 14; k++) { const g = T.box({ w: 12, h: 14, d: 14, at: [R + 5, 0, z] }); g.rotateZ(k * 2 * Math.PI / 14); parts.push(g); }
    return T.merge(parts);
  };
  const spC = T.merge([sprocket(60, SP), sprocket(60, -SP)]);
  const spR = T.merge([sprocket(90, SP), sprocket(90, -SP)]);
  const asse = T.cylinder({ r: 16, l: 2 * TR, axis: 'z', seg: 14 });
  const catene = T.merge([SP, -SP].reduce((l, z) => l.concat([rod([CX, 60, z], [0, 90, z], 5), rod([CX, -60, z], [0, -90, z], 5)]), []));
  const cing = T.box({ w: 160, h: 5, d: 46, at: [0, 0, 0] });
  const suolo = T.box({ w: 2800, h: 2, d: 1700, at: [380, -1, 0] });
  return {
    label: 'Schema 3D della trasmissione del Benz Patent-Motorwagen: volano, cinghia, contralbero con differenziale, catene e ruote posteriori',
    a0: 0, samples: [0], view: 'pianta', buttons: ['iso', 'pianta', 'fianco'], pad: 1.1,
    views: { iso: { az: -38, el: 28 } },
    parts: [
      { id: 'suolo', g: suolo, ghost: true, nobox: true },
      { id: 'rd', g: wheel }, { id: 'rs', g: wheel }, { id: 'asse', g: asse },
      { id: 'volano', g: volano }, { id: 'segno', g: segno, accent: true, tint: 0.3 },
      { id: 'cing', g: cing, accent: true, tint: 0.2 },
      { id: 'pul', g: puleggia }, { id: 'segnoP', g: segnoP, accent: true, tint: 0.3 },
      { id: 'diff', g: diff, accent: true, tint: 0.14 },
      { id: 'spC', g: spC }, { id: 'spR', g: spR }, { id: 'cat', g: catene, accent: true }
    ],
    pose(a, H) {
      const k1 = rad(a), k2 = k1 / 2.5, k3 = k2 / 2.2;
      H.volano.pos.set(FX, Y, 0); H.volano.rot.y = k1; H.segno.pos.set(FX, Y, 0); H.segno.rot.y = k1;
      H.cing.pos.set((FX - 250 + CX + 80) / 2, Y, 0);
      H.pul.pos.set(CX, Y, 0); H.pul.rot.z = k2; H.segnoP.pos.set(CX, Y, 0); H.segnoP.rot.z = k2;
      H.diff.pos.set(CX, Y, 0);
      H.spC.pos.set(CX, Y, 0); H.spC.rot.z = k2;
      H.spR.pos.set(0, Y, 0); H.spR.rot.z = k3;
      H.cat.pos.set(0, Y, 0);
      H.asse.pos.set(0, Y, 0);
      H.rd.pos.set(0, Y, TR); H.rs.pos.set(0, Y, -TR); H.rd.rot.z = k3; H.rs.rot.z = k3;
    }
  };
}
